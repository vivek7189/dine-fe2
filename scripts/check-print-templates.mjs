/**
 * Print-template rendering guard.
 *
 * Renders EVERY KOT + Bill template against a rich fixture (inclusive tax, discount,
 * loyalty, outstanding balance, split bill, edited/modified order, cancelled + reduced
 * KOT items, variant/modifier/note sublines, per-item tax split, feedback QR) and asserts
 * the printed HTML is THERMAL-SAFE:
 *   - No non-black TEXT color (thermal heads are 1-bit; grey/colour is dithered into a
 *     faint garbled dot pattern — this is the bug this guard exists to prevent).
 *   - No non-black BORDER (a light/coloured rule prints faint) and no coloured BACKGROUND
 *     (a fill dithers into grey behind the text).
 *   - No HTML em/en-dash entities in output (use ASCII "-" on receipts).
 *
 * Run:  npm run test:print
 * (bundled with esbuild first because the templates use extensionless ESM imports).
 */
import { renderKOT, renderBill } from '../src/utils/printTemplates/index.js';
import { attachInclusiveSplits } from '../src/utils/printTemplates/helpers.js';

const BILL_TEMPLATES = ['classic', 'compact', 'detailed', 'elegant', 'minimal', 'professional'];
const KOT_TEMPLATES = ['classic', 'compact', 'bold', 'grouped', 'numbered'];

const clone = (o) => JSON.parse(JSON.stringify(o));

const RICH_INVOICE = {
  restaurantName: 'GUARD TEST DINER',
  restaurantAddress: 'Eldama Ravine Road\nP.O Box 1047',
  restaurantPhone: '+254700000000',
  currencySymbol: '₹', // non-ASCII currency: must survive (HTML print rasterises the glyph)
  taxInclusiveMode: 'inclusive',
  items: [
    { name: 'Paneer Tikka', quantity: 2, price: 500, selectedVariant: { name: 'Large' }, selectedCustomizations: [{ name: 'Extra Cheese' }], notes: 'no onion' },
    { name: 'Papad', quantity: 1, price: 300, hsnCode: '2106' },
  ],
  subtotal: 1300,
  discountAmount: 50, appliedOffer: { name: 'HAPPY' },
  manualDiscount: 20,
  loyaltyDiscount: 10,
  taxBreakdown: [
    { name: 'VAT', rate: 16, amount: 179.31, inclusive: true },
    { name: 'Catering Levy', rate: 2, amount: 22.41, inclusive: true },
  ],
  paidAmount: 500, outstandingAmount: 720, partialPayment: true, // -> outstanding line
  paymentMethod: 'cash',
  splitInfo: { method: 'by-item', guestLabel: 'Guest 1', guestName: 'Ann', guestCount: 3 },
  editCount: 1, updateCount: 2, // -> revised / modified banner
  showInclusiveTaxOnBill: true,
};

const billPrintSettings = (billTemplate) => ({
  billTemplate,
  feedbackQREnabled: true, feedbackFormUrl: 'https://x.co/f', feedbackQRDataUrl: 'data:image/png;base64,AAAA',
  billLayout: { showItemTaxBreakup: true }, // opt the per-item split ON so it is colour-checked too
});

const KOT_DATA = {
  orderNumber: '26', tableNumber: 'Banda 4', floorName: 'Banda', orderType: 'dine-in', currencySymbol: '₹',
  isIncremental: true,
  items: [
    { name: 'New Item', quantity: 1, isNew: true, selectedVariant: { name: 'Spicy' }, selectedCustomizations: [{ name: 'Extra' }], notes: 'rush' },
    { name: 'Reduced Item', quantity: 1, isUpdated: true, quantityDelta: -1 },
  ],
  removedItems: [{ name: 'Cancelled Item', quantity: 1 }],
  specialInstructions: 'Handle with care',
};
const kotPrintSettings = (kotTemplate) => ({ kotTemplate });

// Any `color:#hex` that is not black/white. Negative lookbehind skips `background-color`.
const ALLOWED = new Set(['000', '000000', 'fff', 'ffffff']);
function badColors(html) {
  const out = [];
  const re = /(?<![-\w])color\s*:\s*#([0-9a-fA-F]{3,8})/g;
  let m;
  while ((m = re.exec(html))) {
    const hex = m[1].toLowerCase();
    if (!ALLOWED.has(hex)) out.push('#' + m[1]);
  }
  return [...new Set(out)];
}
function badGlyphs(html) {
  const out = [];
  if (html.includes('&mdash;')) out.push('&mdash;');
  if (html.includes('&ndash;')) out.push('&ndash;');
  return out;
}
// Borders must be black (a light/coloured line prints faint on thermal).
function badBorders(html) {
  const out = [];
  const re = /border[a-z-]*\s*:[^;"'`]*?#([0-9a-fA-F]{3,8})/g;
  let m;
  while ((m = re.exec(html))) {
    const hex = m[1].toLowerCase();
    if (!ALLOWED.has(hex)) out.push('#' + m[1]);
  }
  return [...new Set(out)];
}
// Backgrounds must be white/absent (a coloured fill dithers behind text on thermal).
function badBackgrounds(html) {
  const out = [];
  const re = /background(?:-color)?\s*:\s*#([0-9a-fA-F]{3,8})/g;
  let m;
  while ((m = re.exec(html))) {
    const hex = m[1].toLowerCase();
    if (hex !== 'fff' && hex !== 'ffffff') out.push('#' + m[1]);
  }
  return [...new Set(out)];
}

let failures = 0;
const check = (label, html) => {
  const colors = badColors(html);
  const borders = badBorders(html);
  const backgrounds = badBackgrounds(html);
  const glyphs = badGlyphs(html);
  if (colors.length || borders.length || backgrounds.length || glyphs.length) {
    failures++;
    console.log(`  ✗ ${label}`);
    if (colors.length) console.log(`      non-black text colours: ${colors.join(', ')}`);
    if (borders.length) console.log(`      non-black borders: ${borders.join(', ')}`);
    if (backgrounds.length) console.log(`      coloured backgrounds: ${backgrounds.join(', ')}`);
    if (glyphs.length) console.log(`      risky glyphs: ${glyphs.join(', ')}`);
  } else {
    console.log(`  ✓ ${label}`);
  }
};

console.log('\nBill templates:');
for (const t of BILL_TEMPLATES) {
  const inv = clone(RICH_INVOICE);
  attachInclusiveSplits(inv);
  check(`bill/${t}`, renderBill(inv, billPrintSettings(t), {}));
}
console.log('\nKOT templates:');
for (const t of KOT_TEMPLATES) {
  check(`kot/${t}`, renderKOT(clone(KOT_DATA), kotPrintSettings(t), {}));
}

if (failures) {
  console.log(`\n❌ ${failures} template(s) print non-black text or unsafe glyphs — thermal will garble these. Use #000 and ASCII separators.\n`);
  process.exit(1);
}
console.log('\n✅ All 11 templates are thermal-safe (monochrome text, ASCII separators).\n');
