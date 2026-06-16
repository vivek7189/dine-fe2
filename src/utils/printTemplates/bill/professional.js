// Bill Template: Professional
// Tax invoice style with serial numbers, structured layout, clear sections.
// Matches the formal Indian restaurant receipt format.

import {
  esc, getBillLabels, buildIdentityHtml,
  buildChargesHtml, buildPaymentHtml, buildEcrPaymentHtml, buildDeliveryAddressHtml, calcGrandTotal, formatDateTime,
  getPrintFontSizes, getContentWidth, getBillHeaderHTML, wrapInDocument, buildInclusiveTaxNote,
  buildFeedbackSection, buildSplitBillHtml, getSublineHtml,
  BILL_LABELS_AR, getBillDualCSS, dualLabel, dualTitle, dualItemName,
} from '../helpers';

export const id = 'professional';
export const name = 'Professional';
export const description = 'Tax invoice style with serial numbers. Structured & formal.';

function getProfessionalBillCSS(scaleOrPreset, printerWidth, printContentWidth) {
  let scale = 100;
  if (typeof scaleOrPreset === 'number' && scaleOrPreset >= 50 && scaleOrPreset <= 150) scale = scaleOrPreset;
  else if (typeof scaleOrPreset === 'string') {
    const presetMap = { small: 80, medium: 100, large: 120, xlarge: 140 };
    scale = presetMap[scaleOrPreset] || 100;
  }
  const f = getPrintFontSizes(scale);
  const ff = "'Courier New', Courier, monospace";
  const cw = getContentWidth(printerWidth, printContentWidth);
  return `@page{size:${cw} auto;margin:0;}` +
    `*{box-sizing:border-box;}` +
    `body{font-family:${ff};margin:0;padding:2mm 2mm;font-size:${f.body};line-height:${f.lineHeight};width:${cw};max-width:${cw};overflow:hidden;}` +
    ` .bill-header{text-align:center;margin-bottom:4px;}` +
    ` .restaurant-name{font-size:${f.restaurantName};font-weight:bold;text-transform:uppercase;}` +
    ` .bill-title{font-size:${f.billTitle};font-weight:bold;margin-top:2px;}` +
    ` .bill-logo{height:auto;display:block;}` +
    ` .divider{text-align:center;margin:4px 0;overflow:hidden;letter-spacing:0;}` +
    ` .divider-double{text-align:center;margin:4px 0;font-weight:bold;overflow:hidden;}` +
    ` .invoice-title{font-size:${f.totalRow};font-weight:bold;text-align:center;margin:6px 0;text-transform:uppercase;letter-spacing:1px;}` +
    ` .info-row{display:flex;justify-content:space-between;margin:2px 0;font-size:${f.info};}` +
    ` .info-row span:first-child{font-weight:bold;flex-shrink:0;}` +
    ` table{width:100%;border-collapse:collapse;margin:0;}` +
    ` th{font-size:${f.th};font-weight:bold;text-align:left;padding:2px 1px;border-bottom:1px dashed #333;}` +
    ` td{font-size:${f.td};padding:2px 1px;vertical-align:top;}` +
    ` .sno{width:10%;text-align:center;}` +
    ` .item-name-col{width:48%;text-align:left;}` +
    ` .qty-col{width:12%;text-align:center;}` +
    ` .amt-col{width:30%;text-align:right;}` +
    ` .item-sub{font-size:${f.itemDetail};color:#555;margin:1px 0 1px 0;padding:0;}` +
    ` .total-section{margin-top:4px;font-size:${f.totalSection};}` +
    ` .total-section .row{display:flex;justify-content:space-between;margin:2px 0;}` +
    ` .grand-total{display:flex;justify-content:space-between;font-weight:bold;font-size:${f.totalRow};margin:4px 0;padding:4px 0;border-top:1px dashed #333;border-bottom:1px dashed #333;}` +
    ` .bill-footer{margin-top:8px;text-align:center;font-size:${f.footer};}` +
    ` .bill-info{margin:4px 0;font-size:${f.info};}` +
    ` .bill-info div{display:flex;justify-content:space-between;margin:2px 0;gap:4px;}` +
    ` .bill-info div span:first-child{flex-shrink:0;font-weight:bold;}` +
    ` .bill-info div span:last-child{text-align:right;}`;
}

export function render(invoice, printSettings = {}, labels = {}) {
  const L = getBillLabels(labels);
  const AR = BILL_LABELS_AR;
  const lang = printSettings.printLanguage || 'en';
  const showAr = lang === 'dual' || lang === 'ar';
  const bl = printSettings?.billLayout || {};
  const cs = invoice.currencySymbol || '';
  const items = invoice.items || [];
  const { combined: dateStr } = formatDateTime();

  // Items with serial number column
  const itemsHtml = items.map((item, idx) => {
    const qty = item.quantity || 1;
    const unitPrice = item.price || (item.total ? Math.round((item.total / qty) * 100) / 100 : 0);
    const lineTotal = item.soldByWeight && item.itemWeight
      ? (item.priceUnit === 'per_100g'
        ? (item.price || 0) * (item.itemWeight / 100)
        : (item.price || 0) * item.itemWeight)
      : Math.round(unitPrice * qty * 100) / 100;
    const qtyDisplay = item.soldByWeight && item.itemWeight
      ? `${item.itemWeight} ${item.weightUnit || 'kg'}`
      : qty;

    let html = `<tr>` +
      `<td class="sno">${idx + 1}</td>` +
      `<td class="item-name-col">${showAr ? dualItemName(item, showAr) : esc(item.name)}${getSublineHtml(item)}</td>` +
      `<td class="qty-col">${qtyDisplay}</td>` +
      `<td class="amt-col">${cs}${lineTotal.toFixed(2)}</td>` +
      `</tr>`;
    return html;
  }).join('');

  // Tax rows
  const showIncl = invoice.showInclusiveTaxOnBill !== false;
  const taxRows = bl.showTaxBreakdown === false ? '' : (invoice.taxBreakdown || []).filter(tax => !tax.inclusive || showIncl).map(tax =>
    `<div class="row"><span>${tax.name} (${tax.rate}%)${tax.inclusive ? ' (incl.)' : ''}:</span><span>${cs}${(tax.amount || 0).toFixed(2)}</span></div>`
  ).join('');
  const inclusiveNote = buildInclusiveTaxNote(invoice);

  // Discounts
  const offerName = typeof invoice.appliedOffer === 'string' ? invoice.appliedOffer : (invoice.appliedOffer?.name || '');
  let discountRows = '';
  if ((invoice.discountAmount || 0) > 0)
    discountRows += `<div class="row"><span>${L.offer}${offerName ? ` (${offerName})` : ''}:</span><span>-${cs}${invoice.discountAmount.toFixed(2)}</span></div>`;
  if ((invoice.manualDiscount || 0) > 0)
    discountRows += `<div class="row"><span>${L.manualDiscount}:</span><span>-${cs}${invoice.manualDiscount.toFixed(2)}</span></div>`;
  if ((invoice.loyaltyDiscount || 0) > 0)
    discountRows += `<div class="row"><span>${L.loyaltyRedeem}:</span><span>-${cs}${invoice.loyaltyDiscount.toFixed(2)}</span></div>`;

  const chargesHtml = buildChargesHtml(invoice, L, cs);
  const paymentHtml = buildPaymentHtml(invoice, L, cs);
  const ecrHtml = buildEcrPaymentHtml(invoice);
  const deliveryHtml = buildDeliveryAddressHtml(invoice, printSettings);
  const grandTotal = calcGrandTotal(invoice);

  // Build identity block — buildIdentityHtml handles address, phone, GSTIN, FSSAI, VAT, Tax ID
  // We add email on top of it (only if the restaurant has one)
  let identityHtml = buildIdentityHtml(invoice, printSettings);
  if (invoice.restaurantEmail) {
    identityHtml += `<div style="font-size:11px;">${esc(invoice.restaurantEmail)}</div>`;
  }

  const receiptLogo = printSettings.receiptLogo || null;
  const titleText = showAr
    ? dualTitle(L.billTitle, AR.billTitle, showAr)
    : L.billTitle;
  const headerHtml = getBillHeaderHTML(esc(invoice.restaurantName || 'Restaurant'), identityHtml, receiptLogo, titleText);

  const css = getProfessionalBillCSS(printSettings.billFontScale || printSettings.billFontSize, printSettings.printerWidth, printSettings.printContentWidth);
  const finalCss = showAr ? css + getBillDualCSS() : css;

  const totalModifications = (invoice.editCount || 0) + (invoice.updateCount || 0);
  const revisedBanner = totalModifications > 0
    ? `<div style="text-align:center;font-weight:bold;font-size:14px;padding:4px 0;border:2px solid #333;margin:4px 0;">${showAr ? dualLabel(L.revisedBill, AR.revisedBill, showAr) : L.revisedBill}${invoice.editCount > 0 ? ` (Edit #${invoice.editCount})` : ''}${invoice.updateCount > 0 ? ` (Modified ${invoice.updateCount}x)` : ''}</div>`
    : '';

  const bodyHtml =
    headerHtml +
    revisedBanner +
    buildSplitBillHtml(invoice, L, cs) +
    `<div class="divider">--------------------------------</div>` +
    // Bill info — each field on its own line
    `<div class="bill-info">` +
      `<div><span>${dualLabel(L.billLabel, AR.billLabel, showAr)}#:</span><span>${invoice.dailyOrderId || invoice.id || 'N/A'}</span></div>` +
      `<div><span>${dualLabel(L.date, AR.date, showAr)}:</span><span>${dateStr}</span></div>` +
      (bl.showTable !== false && invoice.tableNumber ? `<div><span>${dualLabel(L.table, AR.table, showAr)}:</span><span>${invoice.tableNumber}${invoice.floorName ? ` · ${invoice.floorName}` : ''}</span></div>` : '') +
      (bl.showWaiter !== false && (invoice.waiterName || invoice.cashierName) ? `<div><span>${showAr ? dualLabel('Staff', 'الموظف', showAr) : 'Staff'}:</span><span>${esc(invoice.waiterName || invoice.cashierName)}</span></div>` : '') +
      (bl.showCustomer !== false && invoice.customerName ? `<div><span>${dualLabel(L.customer, AR.customer, showAr)}:</span><span>${esc(invoice.customerName)}</span></div>` : '') +
      (bl.showOrderType !== false && invoice.orderType ? `<div><span>${showAr ? dualLabel('Type', 'النوع', showAr) : 'Type'}:</span><span>${invoice.orderType}</span></div>` : '') +
      (bl.showPayment !== false ? `<div><span>${dualLabel(L.payment, AR.payment, showAr)}:</span><span>${(invoice.paymentMethod || 'CASH').toUpperCase()}</span></div>` : '') +
    `</div>` +
    deliveryHtml +
    `<div class="divider">--------------------------------</div>` +
    // Items table with S.No column
    `<table>` +
      `<thead><tr>` +
        `<th class="sno">#</th>` +
        `<th class="item-name-col">${dualLabel(L.itemCol, AR.itemCol, showAr)}</th>` +
        `<th class="qty-col">${dualLabel(L.qtyCol, AR.qtyCol, showAr)}</th>` +
        `<th class="amt-col">${dualLabel(L.amt, AR.amt, showAr)}</th>` +
      `</tr></thead>` +
      `<tbody>${itemsHtml}</tbody>` +
    `</table>` +
    `<div class="divider">--------------------------------</div>` +
    // Totals
    `<div class="total-section">` +
      (bl.showSubtotal !== false ? `<div class="row"><span>${dualLabel(L.subtotal, AR.subtotal, showAr)}:</span><span>${cs}${(invoice.subtotal || 0).toFixed(2)}</span></div>` : '') +
      discountRows +
      taxRows +
      chargesHtml +
    `</div>` +
    // Grand total with double borders
    `<div class="grand-total"><span>${dualLabel(L.total, AR.total, showAr)}:</span><span>${cs}${grandTotal.toFixed(2)}</span></div>` +
    paymentHtml +
    ecrHtml +
    inclusiveNote +
    `<div class="divider">================================</div>` +
    buildFeedbackSection(printSettings) +
    `<div class="bill-footer">${bl.showFooter !== false ? `<p style="font-weight:bold;text-transform:uppercase;">${showAr ? dualLabel(L.footer, AR.footer, showAr) : L.footer}</p>` : ''}${bl.showPoweredBy !== false ? `<p style="font-size:10px;margin-top:4px;">${showAr ? dualLabel(L.poweredBy, AR.poweredBy, showAr) : L.poweredBy}</p>` : ''}</div>`;

  return wrapInDocument(`${L.billLabel} #${invoice.dailyOrderId || invoice.id || 'N/A'}`, finalCss, bodyHtml);
}
