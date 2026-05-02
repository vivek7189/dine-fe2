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
  return `@page{size:80mm auto;margin:0;}body{font-family:${ff};margin:16px;font-size:${f.body};line-height:${f.lineHeight};max-width:80mm;} .bill-header{text-align:center;margin-bottom:8px;} .restaurant-name{font-size:${f.restaurantName};font-weight:bold;text-transform:uppercase;} .bill-title{font-size:${f.billTitle};font-weight:bold;margin-top:4px;} .bill-logo{max-width:100%;height:auto;display:block;} .divider{text-align:center;margin:6px 0;} .bill-info{margin:8px 0;font-size:${f.info};} .bill-info div{display:flex;justify-content:space-between;margin:3px 0;} .info-row{display:flex;justify-content:space-between;margin:2px 0;} table{width:100%;border-collapse:collapse;margin:8px 0;} th{text-align:left;border-bottom:1px dashed #000;padding:4px;font-size:${f.th};} td{font-size:${f.td};padding:${f.tdPadding};} .total-section{border-top:1px dashed #000;margin-top:8px;padding-top:4px;font-size:${f.totalSection};} .total-row{display:flex;justify-content:space-between;font-weight:bold;font-size:${f.totalRow};margin-top:4px;} .bill-footer{margin-top:12px;text-align:center;font-size:${f.footer};}`;
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
  return `@page{size:80mm auto;margin:0;}body{font-family:${ff};margin:16px;font-size:${f.body};line-height:${f.lineHeight};max-width:80mm;} .kot-header{text-align:center;margin-bottom:8px;} .restaurant-name{font-size:${f.restaurantName};font-weight:bold;text-transform:uppercase;} .kot-title{font-size:${f.billTitle};font-weight:bold;margin-top:4px;} .divider{text-align:center;margin:6px 0;} .kot-info{margin:8px 0;font-size:${f.info};} .kot-info div{margin:2px 0;} .item{margin:6px 0;} .item-main{display:flex;font-size:${f.body};} .item-qty{width:30px;font-weight:bold;} .item-name{font-weight:bold;} .item-detail{margin-left:30px;font-size:${f.itemDetail};} .item-note{margin-left:30px;font-size:${f.itemDetail};font-style:italic;} .kot-footer{text-align:center;margin-top:8px;font-weight:bold;font-size:${f.body};} .special-instructions{margin:8px 0;padding:6px;border:1px dashed #000;text-align:center;font-size:${f.info};} .special-instructions strong{display:block;margin-bottom:4px;} .special-instructions div{text-align:left;}`;
};
