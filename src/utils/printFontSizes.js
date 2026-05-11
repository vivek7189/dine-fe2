// Print font size & font family system for thermal receipt printing (80mm paper)
// Supports dynamic scaling via billFontScale (50–150, default 100)
// Supports custom font family via billFontFamily (safe system fonts)
// Used by all print templates (OrderSummary, DashboardTablesPanel, orderhistory, bar)

// Safe system fonts that work on all OS without installation
export const PRINT_FONTS = [
  { id: 'default', label: 'Default (Courier)', family: "'Courier New', Courier, monospace" },
  { id: 'arial', label: 'Arial', family: "Arial, Helvetica, sans-serif" },
  { id: 'verdana', label: 'Verdana', family: "Verdana, Geneva, sans-serif" },
  { id: 'tahoma', label: 'Tahoma', family: "Tahoma, Geneva, sans-serif" },
  { id: 'georgia', label: 'Georgia', family: "Georgia, 'Times New Roman', serif" },
  { id: 'times', label: 'Times New Roman', family: "'Times New Roman', Times, serif" },
];

// Base sizes at scale 100 (= "medium", the default)
const BASE = {
  body: 15,
  restaurantName: 20,
  billTitle: 16,
  info: 14,
  th: 14,
  td: 14,
  tdPaddingV: 3, tdPaddingH: 4,
  totalSection: 14,
  totalRow: 20,
  footer: 13,
  itemDetail: 13,
  poweredBy: 10,
};

// Scale a base px value. Clamps to minimum 8px for readability.
const s = (base, scale) => Math.max(8, Math.round(base * scale / 100));
// Scale padding values
const sp = (base, scale) => Math.max(1, Math.round(base * scale / 100));

// Get font sizes for a given scale (50–150). Accepts number or legacy preset string.
// Falls back to scale 100 (medium) if invalid.
export const getPrintFontSizes = (scaleOrPreset) => {
  let scale = 100;
  if (typeof scaleOrPreset === 'number' && scaleOrPreset >= 50 && scaleOrPreset <= 150) {
    scale = scaleOrPreset;
  } else if (typeof scaleOrPreset === 'string') {
    // Legacy preset support
    const presetMap = { small: 80, medium: 100, large: 120, xlarge: 140 };
    scale = presetMap[scaleOrPreset] || 100;
  }

  const lineHeight = scale <= 80 ? '1.4' : scale >= 130 ? '1.6' : '1.5';

  return {
    scale,
    body: `${s(BASE.body, scale)}px`,
    lineHeight,
    restaurantName: `${s(BASE.restaurantName, scale)}px`,
    billTitle: `${s(BASE.billTitle, scale)}px`,
    info: `${s(BASE.info, scale)}px`,
    th: `${s(BASE.th, scale)}px`,
    td: `${s(BASE.td, scale)}px`,
    tdPadding: `${sp(BASE.tdPaddingV, scale)}px ${sp(BASE.tdPaddingH, scale)}px`,
    totalSection: `${s(BASE.totalSection, scale)}px`,
    totalRow: `${s(BASE.totalRow, scale)}px`,
    footer: `${s(BASE.footer, scale)}px`,
    itemDetail: `${s(BASE.itemDetail, scale)}px`,
    poweredBy: `${s(BASE.poweredBy, scale)}px`,
  };
};

// Resolve font family string from font id. Falls back to default (Courier).
export const getPrintFontFamily = (fontId) => {
  if (!fontId || fontId === 'default') return "'Courier New', Courier, monospace";
  const found = PRINT_FONTS.find(f => f.id === fontId);
  return found ? found.family : "'Courier New', Courier, monospace";
};

// Generate the common CSS <style> block for bill/invoice print templates
export const getBillPrintCSS = (scaleOrPreset, fontId) => {
  const f = getPrintFontSizes(scaleOrPreset);
  const ff = getPrintFontFamily(fontId);
  return `@page{size:80mm auto;margin:0;}*{box-sizing:border-box;}body{font-family:${ff};margin:0;padding:2mm 3mm;font-size:${f.body};line-height:${f.lineHeight};width:80mm;max-width:80mm;overflow:hidden;} .bill-header{text-align:center;margin-bottom:8px;} .restaurant-name{font-size:${f.restaurantName};font-weight:bold;text-transform:uppercase;word-wrap:break-word;overflow-wrap:break-word;} .bill-title{font-size:${f.billTitle};font-weight:bold;margin-top:4px;} .bill-logo{max-width:100%;height:auto;display:block;} .divider{text-align:center;margin:6px 0;overflow:hidden;} .bill-info{margin:8px 0;font-size:${f.info};} .bill-info div{display:flex;justify-content:space-between;margin:3px 0;gap:4px;} .bill-info div span:first-child{flex-shrink:0;} .bill-info div span:last-child{text-align:right;flex-shrink:1;min-width:0;word-wrap:break-word;overflow-wrap:break-word;} .info-row{display:flex;justify-content:space-between;margin:2px 0;} table{width:100%;border-collapse:collapse;margin:8px 0;table-layout:fixed;} th{text-align:left;border-bottom:1px dashed #000;padding:2px;font-size:${f.th};} td{font-size:${f.td};padding:${f.tdPadding};word-wrap:break-word;overflow-wrap:break-word;} td:last-child{overflow:visible;white-space:nowrap;} .total-section{border-top:1px dashed #000;margin-top:8px;padding-top:4px;font-size:${f.totalSection};} .total-section div[style*="flex"]{flex-wrap:nowrap;} .total-section div[style*="flex"] span:last-child{flex-shrink:0;white-space:nowrap;} .total-row{display:flex;justify-content:space-between;font-weight:bold;font-size:${f.totalRow};margin-top:4px;} .total-row span:last-child{flex-shrink:0;white-space:nowrap;} .bill-footer{margin-top:12px;text-align:center;font-size:${f.footer};}`;
};

// Generate bill header HTML with optional logo and configurable alignment.
// Used by all bill print locations (OrderSummary, bar, order history).
// restaurantName: escaped HTML string, identityHtml: pre-built identity lines,
// receiptLogo: { url, position, size, nameAlignment, enabled }, billTitle: e.g. "--- BILL ---"
export const getBillHeaderHTML = (restaurantName, identityHtml, receiptLogo, billTitle = '--- BILL ---') => {
  const logo = receiptLogo?.enabled ? receiptLogo : null;
  const nameAlign = logo?.nameAlignment || receiptLogo?.nameAlignment || 'center';
  const logoSize = logo?.size || 60;
  const logoPos = logo?.position || 'center';

  const logoImg = logo?.url
    ? `<img src="${logo.url}" class="bill-logo" style="width:${logoSize}px;height:auto;object-fit:contain;${logoPos === 'center' ? 'margin:0 auto 4px;' : ''}" />`
    : '';

  const nameBlock = `<div class="restaurant-name" style="text-align:${nameAlign};">${restaurantName}</div>${identityHtml ? `<div style="text-align:${nameAlign};">${identityHtml}</div>` : ''}<div class="bill-title" style="text-align:${nameAlign};">${billTitle}</div>`;

  if (!logoImg) {
    return `<div class="bill-header" style="text-align:${nameAlign};margin-bottom:8px;">${nameBlock}</div>`;
  }

  if (logoPos === 'center') {
    return `<div class="bill-header" style="text-align:center;margin-bottom:8px;">${logoImg}${nameBlock}</div>`;
  }

  const dir = logoPos === 'right' ? 'row-reverse' : 'row';
  return `<div class="bill-header" style="display:flex;align-items:center;gap:8px;flex-direction:${dir};margin-bottom:8px;">${logoImg}<div style="flex:1;text-align:${nameAlign};">${nameBlock}</div></div>`;
};

// Generate the common CSS <style> block for KOT print templates
export const getKOTPrintCSS = (scaleOrPreset, fontId) => {
  const f = getPrintFontSizes(scaleOrPreset);
  const ff = getPrintFontFamily(fontId);
  return `@page{size:80mm auto;margin:0;}*{box-sizing:border-box;}body{font-family:${ff};margin:0;padding:2mm 3mm;font-size:${f.body};line-height:${f.lineHeight};width:80mm;max-width:80mm;overflow:hidden;} .kot-header{text-align:center;margin-bottom:8px;} .restaurant-name{font-size:${f.restaurantName};font-weight:bold;text-transform:uppercase;word-wrap:break-word;overflow-wrap:break-word;} .kot-title{font-size:${f.billTitle};font-weight:bold;margin-top:4px;} .divider{text-align:center;margin:6px 0;overflow:hidden;} .kot-info{margin:8px 0;font-size:${f.info};} .kot-info div{margin:2px 0;} .item{margin:6px 0;} .item-main{display:flex;font-size:${f.body};} .item-qty{width:30px;flex-shrink:0;font-weight:bold;} .item-name{font-weight:bold;word-wrap:break-word;overflow-wrap:break-word;overflow:hidden;} .item-detail{margin-left:30px;font-size:${f.itemDetail};word-wrap:break-word;overflow-wrap:break-word;} .item-note{margin-left:30px;font-size:${f.itemDetail};font-style:italic;word-wrap:break-word;overflow-wrap:break-word;} .kot-footer{text-align:center;margin-top:8px;font-weight:bold;font-size:${f.body};} .special-instructions{margin:8px 0;padding:6px;border:1px dashed #000;text-align:center;font-size:${f.info};} .special-instructions strong{display:block;margin-bottom:4px;} .special-instructions div{text-align:left;}`;
};

// Generate full HTML for a category-wise token slip (food court mode).
// token: { tokenLabel, categoryName, items, itemCount, orderNumber, time, printStationName, restaurantName }
const escapePrintHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getTokenSlipScale = (printSettings = {}) => {
  const raw = printSettings.billFontScale || 100;
  return typeof raw === 'number' ? raw : 100;
};

const getTokenSlipCSS = (printSettings = {}, { combined = false } = {}) => {
  const f = getPrintFontSizes(printSettings.billFontScale || 100);
  const ff = getPrintFontFamily(printSettings.billFontFamily);
  const scale = getTokenSlipScale(printSettings);

  return `
@page{size:80mm auto;margin:0;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:${ff};font-size:${f.body};line-height:${f.lineHeight};${combined ? 'background:#f3f4f6;padding:16px;' : 'width:80mm;padding:6px 10px;'}}
.token-slip{width:${combined ? '80mm' : '100%'};background:white;color:black;${combined ? 'padding:8px 12px;margin:0 auto 16px;box-shadow:0 8px 24px rgba(15,23,42,0.12);page-break-after:always;break-after:page;' : ''}}
.token-slip:last-child{page-break-after:auto;break-after:auto;}
.token-label{text-align:center;font-size:${s(48, scale)}px;font-weight:900;padding:${s(12, scale)}px 4px;border:3px dashed #000;margin:4px 0;letter-spacing:3px;line-height:1.1;}
.order-num{text-align:center;font-size:${s(16, scale)}px;font-weight:bold;margin:6px 0 2px;}
.divider{text-align:center;letter-spacing:2px;margin:3px 0;font-size:${f.info};}
.divider-thick{text-align:center;letter-spacing:1px;margin:2px 0;font-size:${s(15, scale)}px;font-weight:bold;}
.items{margin:6px 0;font-size:${s(16, scale)}px;}
.item-line{display:flex;justify-content:space-between;padding:3px 0;font-weight:600;}
.item-price{text-align:right;font-size:${s(14, scale)}px;white-space:nowrap;}
.item-detail{margin-left:20px;font-size:${f.itemDetail};color:#333;font-weight:normal;}
.token-total{display:flex;justify-content:space-between;padding:6px 0;font-weight:900;font-size:${s(18, scale)}px;border-top:2px solid #000;margin-top:4px;}
.meta{text-align:center;font-size:${f.info};margin:2px 0;}
.meta b{font-weight:bold;}
.counter{text-align:center;font-weight:900;font-size:${s(22, scale)}px;margin:8px 0 4px;text-transform:uppercase;letter-spacing:1px;border-top:1px solid #000;border-bottom:1px solid #000;padding:4px 0;}
.time{text-align:center;font-size:${s(14, scale)}px;margin:4px 0;}
.footer{text-align:center;font-size:${f.footer};margin-top:6px;font-style:italic;}
.restaurant{text-align:center;font-size:${s(14, scale)}px;font-weight:bold;margin-top:2px;}
@media print{body{background:white;padding:0;}.token-slip{margin:0;box-shadow:none;}}
`;
};

const buildTokenSlipBody = (token) => {
  const thickDiv = '================================';
  const thinDiv = '--------------------------------';

  const itemLines = (token.items || []).map(i => {
    const qty = i.quantity || 1;
    const price = i.price || 0;
    const itemTotal = i.total || (qty * price);
    let line = `<div class="item-line"><span>${escapePrintHtml(qty)} x ${escapePrintHtml(i.name || 'Item')}${price ? ` @ ₹${price}` : ''}</span>${itemTotal ? `<span class="item-price">₹${itemTotal.toFixed(2)}</span>` : ''}</div>`;
    if (i.variant) line += `<div class="item-detail">${escapePrintHtml(i.variant)}</div>`;
    if (i.customizations && i.customizations.length > 0) {
      const custs = Array.isArray(i.customizations) ? i.customizations.map(c => c.name || c).join(', ') : '';
      if (custs) line += `<div class="item-detail">${escapePrintHtml(custs)}</div>`;
    }
    return line;
  }).join('');

  const counterName = token.printStationName || token.categoryName || '';

  return `<section class="token-slip">
<div class="divider-thick">${thickDiv}</div>
<div class="token-label">${escapePrintHtml(token.tokenLabel)}</div>
<div class="divider-thick">${thickDiv}</div>
<div class="order-num">Order #${escapePrintHtml(token.orderNumber)}</div>
<div class="divider">${thinDiv}</div>
<div class="items">${itemLines}${token.tokenTotal ? `<div class="token-total"><span>Total</span><span>₹${token.tokenTotal.toFixed(2)}</span></div>` : ''}</div>
<div class="divider">${thinDiv}</div>
<div class="meta">Items: <b>${escapePrintHtml(token.itemCount || 0)}</b></div>
${counterName ? `<div class="counter">${escapePrintHtml(counterName)}</div>` : ''}
<div class="time">${escapePrintHtml(token.time)}</div>
<div class="divider">${thinDiv}</div>
<div class="footer">Present this token at counter</div>
<div class="restaurant">${escapePrintHtml(token.restaurantName)}</div>
<div class="divider-thick">${thickDiv}</div>
</section>`;
};

export const buildTokenSlipHTML = (token, printSettings = {}) => {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Token ${escapePrintHtml(token.tokenLabel)}</title>
<style>${getTokenSlipCSS(printSettings)}</style></head><body>${buildTokenSlipBody(token)}</body></html>`;
};

// Generate a single browser-preview document containing every token slip.
// Each token still prints as its own 80mm page via page breaks.
export const buildTokenSlipsDocumentHTML = (tokens = [], printSettings = {}) => {
  const firstToken = tokens[0] || {};
  const orderNumber = firstToken.orderNumber || '';
  const title = `Food Court Tokens${orderNumber ? ` - Order #${orderNumber}` : ''}`;

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapePrintHtml(title)}</title>
<style>${getTokenSlipCSS(printSettings, { combined: true })}</style></head><body>${tokens.map(buildTokenSlipBody).join('')}</body></html>`;
};
