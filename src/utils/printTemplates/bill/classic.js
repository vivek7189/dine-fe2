// Bill Template: Classic
// The default bill/invoice layout - standard receipt format.
// Produces identical output to the original generateBillHTML.

import {
  esc, getBillLabels, buildIdentityHtml, getSublineHtml,
  buildBillItemRows, buildTaxHtml, buildDiscountHtml, buildChargesHtml,
  buildPaymentHtml, buildEcrPaymentHtml, buildDeliveryAddressHtml, calcGrandTotal, formatDateTime,
  getBillPrintCSS, getBillHeaderHTML, wrapInDocument, buildInclusiveTaxNote,
  buildFeedbackSection,
} from '../helpers';

export const id = 'classic';
export const name = 'Classic';
export const description = 'Standard receipt format. The default bill layout.';

export function render(invoice, printSettings = {}, labels = {}) {
  const L = getBillLabels(labels);
  const bl = printSettings?.billLayout || {};
  const cs = invoice.currencySymbol || '₹';
  const items = invoice.items || [];

  const itemsHtml = buildBillItemRows(items, cs);
  const taxHtml = buildTaxHtml(invoice.taxBreakdown, cs, { showInclusiveTax: invoice.showInclusiveTaxOnBill !== false }, printSettings);
  const inclusiveNote = buildInclusiveTaxNote(invoice);
  const discountHtml = buildDiscountHtml(invoice, L, cs);
  const chargesHtml = buildChargesHtml(invoice, L, cs);
  const paymentHtml = buildPaymentHtml(invoice, L, cs);
  const ecrHtml = buildEcrPaymentHtml(invoice);
  const deliveryHtml = buildDeliveryAddressHtml(invoice, printSettings);
  const grandTotal = calcGrandTotal(invoice);

  const identityHtml = buildIdentityHtml(invoice, printSettings);
  const receiptLogo = printSettings.receiptLogo || null;
  const headerHtml = getBillHeaderHTML(esc(invoice.restaurantName || 'Restaurant'), identityHtml, receiptLogo, `--- ${L.billTitle} ---`);

  const { combined: dateStr } = formatDateTime();
  const css = getBillPrintCSS(printSettings.billFontScale || printSettings.billFontSize, printSettings.billFontFamily, printSettings.printerWidth, printSettings);

  const revisedBanner = invoice.editCount > 0 ? `<div style="text-align:center;font-weight:bold;font-size:14px;padding:4px 0;border:2px solid #333;margin:4px 0;">${L.revisedBill} (Edit #${invoice.editCount})</div>` : '';

  const bodyHtml =
    headerHtml +
    revisedBanner +
    `<div class="divider">--------------------------------</div>` +
    `<div class="bill-info">` +
      `<div><span>${L.billLabel}#:</span><span><strong>${invoice.dailyOrderId || invoice.id || 'N/A'}</strong></span></div>` +
      `<div><span>${L.date}:</span><span>${dateStr}</span></div>` +
      (bl.showTable !== false && invoice.tableNumber ? `<div><span>${L.table}:</span><span>${invoice.tableNumber}${invoice.floorName ? ` · ${invoice.floorName}` : ''}</span></div>` : '') +
      (bl.showWaiter !== false && (invoice.waiterName || invoice.cashierName) ? `<div><span>Staff:</span><span>${esc(invoice.waiterName || invoice.cashierName)}</span></div>` : '') +
      (bl.showCustomer !== false && invoice.customerName ? `<div><span>${L.customer}:</span><span>${esc(invoice.customerName)}</span></div>` : '') +
      (bl.showOrderType !== false && invoice.orderType ? `<div><span>Type:</span><span>${invoice.orderType}</span></div>` : '') +
      (bl.showPayment !== false ? `<div><span>${L.payment}:</span><span>${(invoice.paymentMethod || 'CASH').toUpperCase()}</span></div>` : '') +
    `</div>` +
    deliveryHtml +
    `<div class="divider">--------------------------------</div>` +
    `<table><thead><tr><th style="text-align:left;width:52%;">${L.itemCol}</th><th style="text-align:center;width:10%;">${L.qtyCol}</th><th style="text-align:right;width:38%;">${L.amt}</th></tr></thead><tbody>${itemsHtml}</tbody></table>` +
    `<div class="total-section">` +
      `<div class="bill-info">${bl.showSubtotal !== false ? `<div><span>${L.subtotal}:</span><span>${cs}${(invoice.subtotal || 0).toFixed(2)}</span></div>` : ''}${discountHtml}</div>` +
      (taxHtml ? `<table style="margin:4px 0;"><tbody>${taxHtml}</tbody></table>` : '') +
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
