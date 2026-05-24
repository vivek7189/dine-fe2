// Shared helpers for all print templates.
// Extracted from printHtmlGenerator.js to avoid duplication across templates.

export { getBillPrintCSS, getKOTPrintCSS, getBillHeaderHTML, getPrintFontSizes, getPrintFontFamily, getContentWidth } from '../printFontSizes';

// HTML-escape a string
export const esc = (str) => String(str ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Build identity lines (GSTIN, FSSAI, VAT, address, phone) for bill header.
export function buildIdentityHtml(info) {
  const lines = [];
  if (info.restaurantLegalName && info.restaurantLegalName !== info.restaurantName)
    lines.push(esc(info.restaurantLegalName));
  if (info.restaurantAddress) lines.push(esc(info.restaurantAddress));
  if (info.restaurantPhone) lines.push('Tel: ' + info.restaurantPhone);
  if (info.showGstOnInvoice && info.gstin) lines.push('GSTIN: ' + info.gstin);
  if (info.showFssaiOnInvoice && info.fssai) lines.push('FSSAI: ' + info.fssai);
  if (info.showTaxIdOnInvoice && info.vatNumber) {
    const prefix = info.countryCode === 'GB' ? 'VAT: '
      : info.countryCode === 'CA' ? 'GST/HST: '
      : info.countryCode === 'AE' ? 'TRN: '
      : 'Tax ID: ';
    lines.push(prefix + info.vatNumber);
  }
  if (info.showTaxIdOnInvoice && info.taxId) {
    lines.push((info.countryCode === 'AU' ? 'ABN: ' : 'Tax ID: ') + info.taxId);
  }
  if (info.showTaxIdOnInvoice && info.businessRegistrationNumber)
    lines.push('Reg#: ' + info.businessRegistrationNumber);
  return lines.map(l => `<div style="font-size:11px;">${l}</div>`).join('');
}

// Get item subline HTML (variant + customizations + notes) for bill item rows.
export function getSublineHtml(item) {
  let sub = '';
  const variant = item.selectedVariant?.name || item.variant;
  if (variant) sub += `<br/><small style="color:#666;">[${esc(variant)}]</small>`;
  const custs = item.selectedCustomizations || item.customizations || [];
  if (custs.length > 0) {
    sub += '<br/><small style="color:#666;">+ ' + custs.map(c => esc(c.name || c)).join(', ') + '</small>';
  }
  if (item.notes) sub += `<br/><small style="font-style:italic;color:#888;">Note: ${esc(item.notes)}</small>`;
  return sub;
}

// Render a single KOT item row with qty, name, variant, customizations, notes.
// opts: { isRemoved, showDelta }
export function renderKOTItemRow(item, opts = {}, labels = {}) {
  const qty = item.quantity || 1;
  const noteLabel = labels.note || 'Note';
  const label = opts.isRemoved ? ' <span style="color:#666;">[CANCEL]</span>' : (opts.showDelta && item.quantityDelta > 0 ? ' <span>[+NEW]</span>' : '');
  const strikeStyle = opts.isRemoved ? 'text-decoration:line-through;color:#999;' : '';
  return `<div class="item" style="${strikeStyle}"><div class="item-main"><span class="item-qty">${qty}x</span><span class="item-name">${esc(item.name)}${label}</span></div>` +
    (item.selectedVariant?.name ? `<div class="item-detail">[${esc(item.selectedVariant.name)}]</div>` : '') +
    ((item.selectedCustomizations || []).map(c => `<div class="item-detail">+ ${esc(c.name || c)}</div>`).join('')) +
    (item.notes ? `<div class="item-note">${noteLabel}: ${esc(item.notes)}</div>` : '') +
    `</div>`;
}

// Build KOT items sections handling incremental/delta logic.
// Returns { html, footerText, hasChanges }
export function buildKOTItemsSections(kotData, renderRowFn, labels = {}) {
  const k = kotData;
  const removedItems = k.removedItems || [];
  const hasChanges = k.isIncremental && ((k.items || []).length > 0 || removedItems.length > 0);
  const totalItemsLabel = labels.totalItems || 'Total Items';

  let itemsHtml;
  let footerText;

  if (hasChanges) {
    const sections = [];
    if (removedItems.length > 0) {
      sections.push('<div style="text-align:center;font-weight:bold;margin:3px 0 1px;">*** CANCELLED ***</div>');
      removedItems.forEach(i => sections.push(renderRowFn(i, { isRemoved: true })));
    }
    const reducedItems = (k.items || []).filter(i => i.isUpdated && i.quantityDelta < 0);
    if (reducedItems.length > 0) {
      sections.push('<div style="text-align:center;font-weight:bold;margin:3px 0 1px;">*** REDUCED ***</div>');
      reducedItems.forEach(i => {
        // Show reduced quantity and the remaining quantity for kitchen clarity
        const reducedQty = Math.abs(i.quantityDelta);
        const remainingQty = i.quantity || 0;
        const nameWithQty = remainingQty > 0
          ? `${i.name} (now ${remainingQty})`
          : i.name;
        sections.push(renderRowFn({ ...i, name: nameWithQty, quantity: reducedQty }, { isRemoved: true }));
      });
    }
    const newAndInc = (k.items || []).filter(i => i.isNew || (i.isUpdated && i.quantityDelta > 0));
    if (newAndInc.length > 0) {
      sections.push('<div style="text-align:center;font-weight:bold;margin:3px 0 1px;">*** NEW ITEMS ***</div>');
      newAndInc.forEach(i => sections.push(renderRowFn(i, { showDelta: i.isUpdated })));
    }
    const unmarked = (k.items || []).filter(i => !i.isNew && !i.isUpdated);
    if (unmarked.length > 0) {
      unmarked.forEach(i => sections.push(renderRowFn(i)));
    }
    itemsHtml = sections.join('');
    const newCount = newAndInc.length;
    const removedCount = removedItems.length + reducedItems.length;
    footerText = `Changes: +${newCount} new, ${removedCount} removed`;
  } else {
    itemsHtml = (k.items || []).map(i => renderRowFn(i)).join('');
    const totalItems = (k.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);
    footerText = `${totalItemsLabel}: ${totalItems}`;
  }

  return { html: itemsHtml, footerText, hasChanges };
}

// Build bill items table rows HTML
export function buildBillItemRows(items, cs) {
  return items.map(item =>
    `<tr><td style="text-align:left;">${esc(item.name)}${getSublineHtml(item)}</td>` +
    `<td style="text-align:center;">${item.quantity || 1}</td>` +
    `<td style="text-align:right;">${cs}${(Math.round(((item.price || Math.round((item.total || 0) / (item.quantity || 1) * 100) / 100 || 0) * (item.quantity || 1)) * 100) / 100).toFixed(2)}</td></tr>`
  ).join('');
}

// Build tax breakdown rows HTML
// options.showInclusiveTax: when false, hides inclusive tax lines from the bill
export function buildTaxHtml(taxBreakdown, cs, options) {
  const showIncl = !options || options.showInclusiveTax !== false;
  return (taxBreakdown || [])
    .filter(tax => !tax.inclusive || showIncl)
    .map(tax => {
      const inclLabel = tax.inclusive ? ' (incl.)' : '';
      return `<tr><td colspan="2" style="text-align:left;">${tax.name} (${tax.rate}%)${inclLabel}</td>` +
        `<td style="text-align:right;">${cs}${(tax.amount || 0).toFixed(2)}</td></tr>`;
    }).join('');
}

// Build "prices inclusive of GST" footer note
export function buildFeedbackSection(printSettings = {}) {
  if (!printSettings.feedbackQREnabled || !printSettings.feedbackFormUrl) return '';
  const url = printSettings.feedbackFormUrl;
  const qrDataUrl = printSettings.feedbackQRDataUrl;
  return `<div style="text-align:center;margin-top:8px;padding-top:8px;border-top:1px dashed #ccc;">` +
    `<div style="font-size:11px;font-weight:bold;margin-bottom:4px;">📝 Rate your experience</div>` +
    (qrDataUrl ? `<img src="${qrDataUrl}" style="width:80px;height:80px;margin:4px auto;display:block;" />` : '') +
    `<div style="font-size:9px;color:#666;word-break:break-all;">${url}</div>` +
    `</div>`;
}

export function buildInclusiveTaxNote(invoice) {
  if (invoice.taxInclusiveMode === 'inclusive' || invoice.taxInclusiveMode === 'mixed') {
    return '<div style="text-align:center;font-size:9px;margin-top:4px;color:#6b7280;">* Prices are inclusive of applicable taxes</div>';
  }
  return '';
}

// Build discount HTML (offer, manual, loyalty)
export function buildDiscountHtml(invoice, L, cs) {
  const offerName = typeof invoice.appliedOffer === 'string' ? invoice.appliedOffer : (invoice.appliedOffer?.name || '');
  const offerDiscHtml = (invoice.discountAmount || 0) > 0
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#16a34a;"><span>${L.offer}${offerName ? ` (${offerName})` : ''}:</span><span>-${cs}${invoice.discountAmount.toFixed(2)}</span></div>` : '';
  const manualDiscHtml = (invoice.manualDiscount || 0) > 0
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#16a34a;"><span>${L.manualDiscount}:</span><span>-${cs}${invoice.manualDiscount.toFixed(2)}</span></div>` : '';
  const loyaltyDiscHtml = (invoice.loyaltyDiscount || 0) > 0
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#b45309;"><span>${L.loyaltyRedeem}:</span><span>-${cs}${invoice.loyaltyDiscount.toFixed(2)}</span></div>` : '';
  return offerDiscHtml + manualDiscHtml + loyaltyDiscHtml;
}

// Build service charge, tip, round-off HTML
export function buildChargesHtml(invoice, L, cs) {
  const serviceChargeHtml = (invoice.serviceChargeAmount > 0)
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.serviceCharge}${invoice.serviceChargeRate ? ` (${invoice.serviceChargeRate}%)` : ''}:</span><span>${cs}${invoice.serviceChargeAmount.toFixed(2)}</span></div>` : '';
  const tipHtml = (invoice.tipAmount > 0)
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.tip}${invoice.tipPercentage ? ` (${invoice.tipPercentage}%)` : ''}:</span><span>${cs}${invoice.tipAmount.toFixed(2)}</span></div>` : '';
  const roundOffHtml = (invoice.roundOffAmount != null && invoice.roundOffAmount !== 0)
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.roundOff}:</span><span>${invoice.roundOffAmount > 0 ? '+' : ''}${cs}${invoice.roundOffAmount.toFixed(2)}</span></div>` : '';
  return serviceChargeHtml + tipHtml + roundOffHtml;
}

// Build payment details HTML (split, cash, partial, wallet)
export function buildPaymentHtml(invoice, L, cs) {
  const splitPaymentHtml = (invoice.splitPayments?.length >= 2)
    ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="font-weight:bold;margin-bottom:2px;">${L.splitPayment}:</div>${invoice.splitPayments.map(sp => `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${(sp.method || 'Cash').toUpperCase()}:</span><span>${cs}${(sp.amount || 0).toFixed(2)}</span></div>`).join('')}</div>` : '';
  const cashReceivedHtml = (invoice.cashReceived > 0)
    ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.cashReceived}:</span><span>${cs}${invoice.cashReceived.toFixed(2)}</span></div>${(invoice.changeReturned > 0) ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.change}:</span><span>${cs}${invoice.changeReturned.toFixed(2)}</span></div>` : ''}</div>` : '';
  const partialPayHtml = (invoice.outstandingAmount > 0)
    ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="font-weight:bold;margin-bottom:2px;">${invoice.paidAmount === 0 ? (L.duePayment || 'Due (Udhar)') : L.partialPayment}:</div>${invoice.paidAmount > 0 ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.paid}:</span><span>${cs}${invoice.paidAmount.toFixed(2)}</span></div>` : ''}<div style="display:flex;justify-content:space-between;margin:2px 0;color:#dc2626;font-weight:bold;"><span>${L.outstanding || 'Outstanding'}:</span><span>${cs}${invoice.outstandingAmount.toFixed(2)}</span></div></div>` : '';
  const walletPayHtml = (invoice.walletRedeemAmount || 0) > 0
    ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.walletApplied}:</span><span>-${cs}${invoice.walletRedeemAmount.toFixed(2)}</span></div><div style="display:flex;justify-content:space-between;margin:2px 0;font-weight:bold;"><span>${L.amountToPay}:</span><span>${cs}${(Math.round(Math.max(0, (invoice.grandTotal || 0) - invoice.walletRedeemAmount) * 100) / 100).toFixed(2)}</span></div></div>` : '';
  return splitPaymentHtml + cashReceivedHtml + partialPayHtml + walletPayHtml;
}

// Build ECR card terminal payment details HTML for receipt (NAPS Qatar)
export function buildEcrPaymentHtml(invoice) {
  if (!invoice.ecrResponse) return '';
  const ecr = invoice.ecrResponse;
  return `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;">` +
    `<div style="font-weight:bold;margin-bottom:2px;text-align:center;">Card Payment Details</div>` +
    (ecr.CardType || ecr.CardNumber ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Card:</span><span>${ecr.CardType || ''} ${ecr.CardNumber || ''}</span></div>` : '') +
    (ecr.ApprovalCode ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>Approval:</span><span>${ecr.ApprovalCode}</span></div>` : '') +
    (ecr.RRN ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>RRN:</span><span>${ecr.RRN}</span></div>` : '') +
    `</div>`;
}

// Build delivery address + driver info HTML for receipt (flag-based: only shows for delivery orders)
export function buildDeliveryAddressHtml(invoice) {
  if (invoice.orderType !== 'delivery') return '';
  const parts = [];
  if (invoice.deliveryAddress) parts.push(esc(invoice.deliveryAddress));
  if (invoice.deliveryInfo?.personName) parts.push(`Driver: ${esc(invoice.deliveryInfo.personName)}${invoice.deliveryInfo.personPhone ? ` (${esc(invoice.deliveryInfo.personPhone)})` : ''}`);
  if (parts.length === 0) return '';
  return `<div class="bill-info" style="margin:4px 0;"><div style="text-align:center;font-weight:bold;font-size:11px;text-transform:uppercase;">Delivery</div>${parts.map(p => `<div style="text-align:center;font-size:10px;">${p}</div>`).join('')}</div>`;
}

// Calculate grand total from invoice data
export function calcGrandTotal(invoice) {
  const totalDiscount = (invoice.discountAmount || 0) + (invoice.manualDiscount || 0) + (invoice.loyaltyDiscount || 0);
  return invoice.grandTotal || (
    (invoice.subtotal || 0) - totalDiscount +
    (invoice.taxBreakdown?.reduce((sum, tax) => sum + (tax.amount || 0), 0) || 0) +
    (invoice.serviceChargeAmount || 0) + (invoice.tipAmount || 0) + (invoice.roundOffAmount || 0)
  );
}

// Standard HTML document wrapper
export function wrapInDocument(title, cssString, bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${cssString}</style></head><body>${bodyHtml}</body></html>`;
}

// Default bill labels with English fallbacks
export function getBillLabels(labels = {}) {
  return {
    billTitle: labels.billTitle || 'BILL',
    billLabel: labels.billLabel || 'Bill',
    itemCol: labels.itemCol || 'Item',
    qtyCol: labels.qtyCol || 'Qty',
    amt: labels.amt || 'Amt',
    date: labels.date || 'Date',
    table: labels.table || 'Table',
    room: labels.room || 'Room',
    customer: labels.customer || 'Customer',
    payment: labels.payment || 'Payment',
    subtotal: labels.subtotal || 'Subtotal',
    offer: labels.offer || 'Offer',
    manualDiscount: labels.manualDiscount || 'Discount',
    loyaltyRedeem: labels.loyaltyRedeem || 'Loyalty',
    serviceCharge: labels.serviceCharge || 'Service Charge',
    tip: labels.tip || 'Tip',
    roundOff: labels.roundOff || 'Round Off',
    total: labels.total || 'TOTAL',
    splitPayment: labels.splitPayment || 'Split Payment',
    cashReceived: labels.cashReceived || 'Cash Received',
    change: labels.change || 'Change',
    partialPayment: labels.partialPayment || 'Partial Payment',
    paid: labels.paid || 'Paid',
    outstanding: labels.outstanding || 'Outstanding',
    walletApplied: labels.walletApplied || 'Wallet Applied',
    amountToPay: labels.amountToPay || 'Amount to Pay',
    footer: labels.footer || 'Thank you for dining with us!',
    poweredBy: labels.poweredBy || 'Powered by DineOpen',
    ...labels,
  };
}

// Default KOT labels with English fallbacks
export function getKOTLabels(labels = {}) {
  return {
    kitchenOrder: labels.kitchenOrder || 'KITCHEN ORDER',
    kotUpdate: labels.kotUpdate || 'KOT UPDATE',
    orderHash: labels.orderHash || 'Order#',
    table: labels.table || 'Table',
    room: labels.room || 'Room',
    time: labels.time || 'Time',
    date: labels.date || 'Date',
    customer: labels.customer || 'Customer',
    type: labels.type || 'Type',
    waiter: labels.waiter || 'Waiter',
    qty: labels.qty || 'QTY',
    item: labels.item || 'ITEM',
    totalItems: labels.totalItems || 'Total Items',
    specialInstructions: labels.specialInstructions || 'SPECIAL INSTRUCTIONS',
    note: labels.note || 'Note',
    newItemsOnly: labels.newItemsOnly || '*** NEW ITEMS ONLY ***',
    ...labels,
  };
}

// Build table-or-room HTML for KOT info section
export function buildTableOrRoomHtml(kotData, L) {
  return kotData.roomNumber
    ? `<div><strong>${L.room}:</strong> ${kotData.roomNumber}</div>`
    : (kotData.tableNumber ? `<div><strong>${L.table}:</strong> ${kotData.tableNumber}${kotData.floorName ? ` · ${kotData.floorName}` : ''}</div>` : '');
}

// Build special instructions HTML for KOT
export function buildSpecialInstructionsHtml(kotData, L) {
  return kotData.specialInstructions
    ? `<div class="special-instructions"><strong>*** ${L.specialInstructions} ***</strong><div>${esc(kotData.specialInstructions)}</div></div>`
    : '';
}

// Format current date/time for receipts
export function formatDateTime() {
  const now = new Date();
  return {
    dateStr: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    timeStr: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    combined: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
}
