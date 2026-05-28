// Bill Template: Compact
// Condensed layout, minimal spacing, saves paper.

import {
  esc, getBillLabels, buildIdentityHtml, getSublineHtml,
  buildBillItemRows, buildTaxHtml, buildDiscountHtml, buildChargesHtml,
  buildPaymentHtml, buildEcrPaymentHtml, buildDeliveryAddressHtml, calcGrandTotal, formatDateTime,
  getPrintFontSizes, getPrintFontFamily, getContentWidth, wrapInDocument, buildInclusiveTaxNote,
  buildFeedbackSection,
} from '../helpers';

export const id = 'compact';
export const name = 'Compact';
export const description = 'Condensed layout, minimal spacing. Saves paper.';

function getCompactBillCSS(scaleOrPreset, fontId, printerWidth) {
  let scale = 100;
  if (typeof scaleOrPreset === 'number' && scaleOrPreset >= 50 && scaleOrPreset <= 150) scale = scaleOrPreset;
  else if (typeof scaleOrPreset === 'string') {
    const presetMap = { small: 80, medium: 100, large: 120, xlarge: 140 };
    scale = presetMap[scaleOrPreset] || 100;
  }
  const compactScale = Math.round(scale * 0.85);
  const f = getPrintFontSizes(compactScale);
  const ff = getPrintFontFamily(fontId);
  const cw = getContentWidth(printerWidth);
  return `@page{size:${cw} auto;margin:0;}*{box-sizing:border-box;}body{font-family:${ff};margin:0;padding:1mm 2mm;font-size:${f.body};line-height:1.3;width:${cw};max-width:${cw};overflow:hidden;} .bill-header{text-align:center;margin-bottom:4px;} .restaurant-name{font-size:${f.restaurantName};font-weight:bold;text-transform:uppercase;} .bill-title{font-size:${f.billTitle};font-weight:bold;margin-top:2px;} .divider{text-align:center;margin:2px 0;overflow:hidden;font-size:10px;} .bill-info{margin:2px 0;font-size:${f.info};} .bill-info div{display:flex;justify-content:space-between;margin:1px 0;gap:4px;} .bill-info div span:first-child{flex-shrink:0;} .bill-info div span:last-child{text-align:right;} table{width:100%;border-collapse:collapse;margin:2px 0;table-layout:fixed;} th{text-align:left;border-bottom:1px dashed #000;padding:1px;font-size:${f.th};} td{font-size:${f.td};padding:1px 2px;word-wrap:break-word;} td:last-child{text-align:right;} .total-section{border-top:1px dashed #000;margin-top:2px;padding-top:2px;font-size:${f.totalSection};} .total-row{display:flex;justify-content:space-between;font-weight:bold;font-size:${f.totalRow};margin-top:2px;} .bill-footer{margin-top:4px;text-align:center;font-size:${f.footer};}`;
}

export function render(invoice, printSettings = {}, labels = {}) {
  const L = getBillLabels(labels);
  const bl = printSettings?.billLayout || {};
  const cs = invoice.currencySymbol || '₹';
  const items = invoice.items || [];

  const itemsHtml = buildBillItemRows(items, cs);
  const taxBreakdown = invoice.taxBreakdown || [];
  const showIncl = invoice.showInclusiveTaxOnBill !== false;
  const inclusiveNote = buildInclusiveTaxNote(invoice);
  // Compact: single-line tax summary if only one tax type
  let taxHtml;
  if (bl.showTaxBreakdown === false) {
    taxHtml = '';
  } else {
    const visibleTaxes = taxBreakdown.filter(t => !t.inclusive || showIncl);
    if (visibleTaxes.length === 1) {
      const tax = visibleTaxes[0];
      const inclLabel = tax.inclusive ? ' (incl.)' : '';
      taxHtml = `<div style="display:flex;justify-content:space-between;margin:1px 0;"><span>${tax.name} (${tax.rate}%)${inclLabel}:</span><span>${cs}${(tax.amount || 0).toFixed(2)}</span></div>`;
    } else {
      taxHtml = visibleTaxes.length > 0 ? `<table style="margin:2px 0;"><tbody>${buildTaxHtml(taxBreakdown, cs, { showInclusiveTax: showIncl }, printSettings)}</tbody></table>` : '';
    }
  }
  const discountHtml = buildDiscountHtml(invoice, L, cs);
  const chargesHtml = buildChargesHtml(invoice, L, cs);
  const paymentHtml = buildPaymentHtml(invoice, L, cs);
  const ecrHtml = buildEcrPaymentHtml(invoice);
  const deliveryHtml = buildDeliveryAddressHtml(invoice);
  const grandTotal = calcGrandTotal(invoice);
  const { combined: dateStr } = formatDateTime();

  const css = getCompactBillCSS(printSettings.billFontScale || printSettings.billFontSize, printSettings.billFontFamily, printSettings.printerWidth);

  // Compact: skip logo, minimal header
  const bodyHtml =
    `<div class="bill-header"><div class="restaurant-name">${esc(invoice.restaurantName || 'Restaurant')}</div><div class="bill-title">--- ${L.billTitle} ---</div></div>` +
    `<div class="divider">- - - - - - - - - - - - - - - -</div>` +
    `<div class="bill-info">` +
      `<div><span>#${invoice.dailyOrderId || invoice.id || 'N/A'}</span><span>${dateStr}</span></div>` +
      (bl.showTable !== false && invoice.tableNumber ? `<div><span>${L.table}: ${invoice.tableNumber}</span>${bl.showPayment !== false ? `<span>${(invoice.paymentMethod || 'CASH').toUpperCase()}</span>` : ''}</div>` : (bl.showPayment !== false ? `<div><span>${L.payment}:</span><span>${(invoice.paymentMethod || 'CASH').toUpperCase()}</span></div>` : '')) +
      (bl.showWaiter !== false && (invoice.waiterName || invoice.cashierName) ? `<div><span>Staff:</span><span>${esc(invoice.waiterName || invoice.cashierName)}</span></div>` : '') +
      (bl.showCustomer !== false && invoice.customerName ? `<div><span>${L.customer}:</span><span>${esc(invoice.customerName)}</span></div>` : '') +
      (bl.showOrderType !== false && invoice.orderType ? `<div><span>Type:</span><span>${invoice.orderType}</span></div>` : '') +
    `</div>` +
    deliveryHtml +
    `<div class="divider">- - - - - - - - - - - - - - - -</div>` +
    `<table><thead><tr><th style="text-align:left;width:52%;">${L.itemCol}</th><th style="text-align:center;width:10%;">${L.qtyCol}</th><th style="text-align:right;width:38%;">${L.amt}</th></tr></thead><tbody>${itemsHtml}</tbody></table>` +
    `<div class="total-section">` +
      `<div class="bill-info">${bl.showSubtotal !== false ? `<div><span>${L.subtotal}:</span><span>${cs}${(invoice.subtotal || 0).toFixed(2)}</span></div>` : ''}${discountHtml}</div>` +
      (typeof taxHtml === 'string' && taxHtml.startsWith('<div') ? taxHtml : (taxHtml || '')) +
      chargesHtml +
      `<div class="total-row"><span>${L.total}:</span><span>${cs}${grandTotal.toFixed(2)}</span></div>` +
      paymentHtml +
      ecrHtml +
      inclusiveNote +
    `</div>` +
    `<div class="divider">================================</div>` +
    buildFeedbackSection(printSettings) +
    `<div class="bill-footer">${bl.showFooter !== false ? `<p>${L.footer}</p>` : ''}${bl.showPoweredBy !== false ? `<p style="font-size:10px;margin-top:4px;">${L.poweredBy}</p>` : ''}</div>`;

  return wrapInDocument(`${L.billLabel} #${invoice.dailyOrderId || invoice.id || 'N/A'}`, css, bodyHtml);
}
