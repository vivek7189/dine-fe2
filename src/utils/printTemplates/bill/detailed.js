// Bill Template: Detailed
// Based on reference photo 2: *** RECEIPT *** header, item-level discounts,
// quantity breakdowns (x2 @ $15.00), dashed dividers, monospace feel.

import {
  esc, getBillLabels, buildIdentityHtml,
  buildChargesHtml, buildPaymentHtml, buildEcrPaymentHtml, buildDeliveryAddressHtml, calcGrandTotal, formatDateTime,
  getPrintFontSizes, getPrintFontFamily, getContentWidth, getBillHeaderHTML, wrapInDocument, buildInclusiveTaxNote,
  buildFeedbackSection, buildSplitBillHtml,
  BILL_LABELS_AR, getBillDualCSS, dualLabel, dualTitle, dualItemName,
} from '../helpers';

export const id = 'detailed';
export const name = 'Detailed';
export const description = 'Item-level discounts and qty breakdown. Monospace receipt style.';

function getDetailedBillCSS(scaleOrPreset, fontId, printerWidth) {
  let scale = 100;
  if (typeof scaleOrPreset === 'number' && scaleOrPreset >= 50 && scaleOrPreset <= 150) scale = scaleOrPreset;
  else if (typeof scaleOrPreset === 'string') {
    const presetMap = { small: 80, medium: 100, large: 120, xlarge: 140 };
    scale = presetMap[scaleOrPreset] || 100;
  }
  const f = getPrintFontSizes(scale);
  // Force monospace for receipt feel
  const ff = "'Courier New', Courier, monospace";
  const cw = getContentWidth(printerWidth);
  return `@page{size:${cw} auto;margin:0;}*{box-sizing:border-box;}body{font-family:${ff};margin:0;padding:2mm 2mm;font-size:${f.body};line-height:${f.lineHeight};width:${cw};max-width:${cw};overflow:hidden;} .bill-header{text-align:center;margin-bottom:6px;} .restaurant-name{font-size:${f.restaurantName};font-weight:bold;text-transform:uppercase;letter-spacing:1px;} .receipt-title{font-size:${f.totalRow};font-weight:bold;text-align:center;margin:6px 0;} .bill-title{font-size:${f.billTitle};font-weight:bold;margin-top:4px;} .bill-logo{height:auto;display:block;} .divider{text-align:center;margin:4px 0;overflow:hidden;letter-spacing:1px;} .info-line{display:flex;justify-content:space-between;margin:2px 0;font-size:${f.info};} .item-row{display:flex;justify-content:space-between;margin:3px 0;font-size:${f.td};} .item-row span:last-child{text-align:right;flex-shrink:0;white-space:nowrap;} .item-sub{margin-left:16px;font-size:${f.itemDetail};color:#333;margin:1px 0;} .total-section{margin-top:4px;font-size:${f.totalSection};} .total-section .row{display:flex;justify-content:space-between;margin:2px 0;} .grand-total{display:flex;justify-content:space-between;font-weight:bold;font-size:${f.totalRow};margin:6px 0;} .bill-footer{margin-top:8px;text-align:center;font-size:${f.footer};} .bill-info{margin:4px 0;font-size:${f.info};} .bill-info div{display:flex;justify-content:space-between;margin:2px 0;gap:4px;} .bill-info div span:first-child{flex-shrink:0;} .bill-info div span:last-child{text-align:right;}`;
}

export function render(invoice, printSettings = {}, labels = {}) {
  const L = getBillLabels(labels);
  const AR = BILL_LABELS_AR;
  const lang = printSettings.printLanguage || 'en';
  const showAr = lang === 'dual' || lang === 'ar';
  const bl = printSettings?.billLayout || {};
  const cs = invoice.currencySymbol || '';
  const items = invoice.items || [];
  const { combined: dateStr, timeStr, dateStr: justDate } = formatDateTime();

  // Detailed items: show price breakdown per item
  const itemsHtml = items.map(item => {
    const qty = item.quantity || 1;
    const unitPrice = item.price || (item.total ? Math.round((item.total / qty) * 100) / 100 : 0);
    const isWeightItem = item.soldByWeight && item.itemWeight;
    const lineTotal = isWeightItem
      ? (item.priceUnit === 'per_100g'
        ? (item.price || 0) * (item.itemWeight / 100)
        : (item.price || 0) * item.itemWeight)
      : Math.round(unitPrice * qty * 100) / 100;
    const variant = item.selectedVariant?.name || item.variant || '';
    const custs = item.selectedCustomizations || item.customizations || [];

    let html = `<div class="item-row"><span>${showAr ? dualItemName(item, showAr) : esc(item.name)}</span><span>${cs}${lineTotal.toFixed(2)}</span></div>`;
    // Show weight breakdown for weight items, or quantity breakdown if qty > 1
    if (isWeightItem) {
      const unitLabel = item.priceUnit === 'per_100g' ? '/100g' : '/kg';
      html += `<div class="item-sub">${item.itemWeight}${item.weightUnit || 'kg'} @ ${cs}${unitPrice.toFixed(2)}${unitLabel}</div>`;
    } else if (qty > 1) {
      html += `<div class="item-sub">x${qty} @ ${cs}${unitPrice.toFixed(2)}</div>`;
    }
    // Show variant
    if (variant) {
      html += `<div class="item-sub">[${esc(variant)}]</div>`;
    }
    // Show customizations
    if (custs.length > 0) {
      html += `<div class="item-sub">+ ${custs.map(c => esc(c.name || c)).join(', ')}</div>`;
    }
    // Show item-level discount if available
    if (item.discountAmount && item.discountAmount > 0) {
      const discLabel = item.discountLabel || item.discountName || 'Discount';
      const discPct = item.discountPercent || item.discountRate || '';
      html += `<div class="item-sub" style="color:#16a34a;">DISC. ${discPct ? discPct + '% ' : ''}(${esc(discLabel)}) @ ${cs}${(unitPrice * qty).toFixed(2)}</div>`;
    }
    // Show notes
    if (item.notes) {
      html += `<div class="item-sub" style="font-style:italic;">Note: ${esc(item.notes)}</div>`;
    }
    return html;
  }).join('');

  // Discounts (order-level)
  const offerName = typeof invoice.appliedOffer === 'string' ? invoice.appliedOffer : (invoice.appliedOffer?.name || '');
  let discountRows = '';
  if ((invoice.discountAmount || 0) > 0) {
    discountRows += `<div class="row"><span>${L.offer}${offerName ? ` (${offerName})` : ''}:</span><span>-${cs}${invoice.discountAmount.toFixed(2)}</span></div>`;
  }
  if ((invoice.manualDiscount || 0) > 0) {
    discountRows += `<div class="row"><span>${L.manualDiscount}:</span><span>-${cs}${invoice.manualDiscount.toFixed(2)}</span></div>`;
  }
  if ((invoice.loyaltyDiscount || 0) > 0) {
    discountRows += `<div class="row"><span>${L.loyaltyRedeem}:</span><span>-${cs}${invoice.loyaltyDiscount.toFixed(2)}</span></div>`;
  }

  // Tax
  const showIncl = invoice.showInclusiveTaxOnBill !== false;
  const taxRows = bl.showTaxBreakdown === false ? '' : (invoice.taxBreakdown || []).filter(tax => !tax.inclusive || showIncl).map(tax =>
    `<div class="row"><span>${tax.name} (${tax.rate}%)${tax.inclusive ? ' (incl.)' : ''}:</span><span>${cs}${(tax.amount || 0).toFixed(2)}</span></div>`
  ).join('');
  const inclusiveNote = buildInclusiveTaxNote(invoice);

  const chargesHtml = buildChargesHtml(invoice, L, cs);
  const paymentHtml = buildPaymentHtml(invoice, L, cs);
  const ecrHtml = buildEcrPaymentHtml(invoice);
  const deliveryHtml = buildDeliveryAddressHtml(invoice, printSettings);
  const grandTotal = calcGrandTotal(invoice);

  const identityHtml = buildIdentityHtml(invoice, printSettings);
  const receiptLogo = printSettings.receiptLogo || null;
  const css = getDetailedBillCSS(printSettings.billFontScale || printSettings.billFontSize, printSettings.billFontFamily, printSettings.printerWidth);
  const finalCss = showAr ? css + getBillDualCSS() : css;

  // Waiter/cashier info
  const waiterInfo = invoice.waiterName || invoice.cashierName || '';

  const preBillBanner = invoice.isPreBill ? '<div style="text-align:center;font-weight:bold;font-size:16px;padding:6px 0;border:2px dashed #333;margin:6px 0;letter-spacing:2px;">*** PRE-BILL ***</div>' : '';

  const bodyHtml =
    // Header with logo
    getBillHeaderHTML(esc(invoice.restaurantName || 'Restaurant'), identityHtml, receiptLogo, '') +
    `<div class="divider">- - - - - - - - - - - - - - - - -</div>` +
    `<div class="receipt-title">${showAr ? dualTitle('*** ' + L.billTitle + ' ***', '*** ' + AR.billTitle + ' ***', showAr) : '*** ' + L.billTitle + ' ***'}</div>` +
    preBillBanner +
    (((invoice.editCount || 0) + (invoice.updateCount || 0)) > 0 ? `<div style="text-align:center;font-weight:bold;font-size:14px;padding:4px 0;border:2px solid #333;margin:4px 0;">${showAr ? dualLabel(L.revisedBill, AR.revisedBill, showAr) : L.revisedBill}${invoice.editCount > 0 ? ` (Edit #${invoice.editCount})` : ''}${invoice.updateCount > 0 ? ` (Modified ${invoice.updateCount}x)` : ''}</div>` : '') +
    buildSplitBillHtml(invoice, L, cs) +
    // Cashier + date on one line
    `<div class="info-line">` +
      (bl.showWaiter !== false && waiterInfo ? `<span>${esc(waiterInfo)}</span>` : `<span>#${invoice.dailyOrderId || invoice.id || 'N/A'}</span>`) +
      `<span>${justDate} - ${timeStr}</span>` +
    `</div>` +
    (bl.showTable !== false && invoice.tableNumber ? `<div class="info-line"><span>${dualLabel(L.table, AR.table, showAr)}: ${invoice.tableNumber}${invoice.floorName ? ` · ${invoice.floorName}` : ''}</span>${bl.showPayment !== false ? `<span>${(invoice.paymentMethod || 'CASH').toUpperCase()}</span>` : ''}</div>` : '') +
    (bl.showCustomer !== false && invoice.customerName ? `<div class="info-line"><span>${dualLabel(L.customer, AR.customer, showAr)}: ${esc(invoice.customerName)}</span></div>` : '') +
    (bl.showOrderType !== false && invoice.orderType ? `<div class="info-line"><span>Type: ${invoice.orderType}</span></div>` : '') +
    (bl.showWaiter !== false && waiterInfo ? `<div class="info-line"><span>#${invoice.dailyOrderId || invoice.id || 'N/A'}</span></div>` : '') +
    deliveryHtml +
    `<div class="divider">- - - - - - - - - - - - - - - - -</div>` +
    // Items
    itemsHtml +
    `<div class="divider">- - - - - - - - - - - - - - - - -</div>` +
    // Totals section
    `<div class="total-section">` +
      (bl.showSubtotal !== false ? `<div class="row" style="display:flex;justify-content:space-between;margin:2px 0;"><span>${dualLabel(L.subtotal, AR.subtotal, showAr)}:</span><span>${cs}${(invoice.subtotal || 0).toFixed(2)}</span></div>` : '') +
      discountRows +
      taxRows +
      chargesHtml +
    `</div>` +
    `<div class="divider">- - - - - - - - - - - - - - - - -</div>` +
    // Grand total
    `<div class="grand-total"><span>${dualLabel(L.total, AR.total, showAr)}:</span><span>${cs}${grandTotal.toFixed(2)}</span></div>` +
    // Payment details
    paymentHtml +
    ecrHtml +
    inclusiveNote +
    `<div class="divider">- - - - - - - - - - - - - - - - -</div>` +
    buildFeedbackSection(printSettings) +
    // Footer
    `<div class="bill-footer">${bl.showFooter !== false ? `<p style="font-weight:bold;text-transform:uppercase;">${showAr ? dualLabel(L.footer, AR.footer, showAr) : L.footer}</p>` : ''}${bl.showPoweredBy !== false ? `<p style="font-size:10px;margin-top:4px;">${showAr ? dualLabel(L.poweredBy, AR.poweredBy, showAr) : L.poweredBy}</p>` : ''}</div>` +
    `<div class="divider">- - - - - - - - - - - - - - - - -</div>`;

  return wrapInDocument(`${L.billLabel} #${invoice.dailyOrderId || invoice.id || 'N/A'}`, finalCss, bodyHtml);
}
