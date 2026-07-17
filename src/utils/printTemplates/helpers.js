// Shared helpers for all print templates.
// Extracted from printHtmlGenerator.js to avoid duplication across templates.

export { getBillPrintCSS, getKOTPrintCSS, getBillHeaderHTML, getPrintFontSizes, getPrintFontFamily, getContentWidth } from '../printFontSizes';

import { seatLabel, sanitizeSeat } from '../orderItemKey';

// HTML-escape a string
export const esc = (str) => String(str ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Seat tag for print rows — letter-only label ("A", "B"), '' when the item has
// no seat. Items only carry a seat when seat-level ordering was on at order
// time, so gating on the item field alone keeps legacy orders unchanged.
const seatTag = (item) => (sanitizeSeat(item?.seat) === null ? '' : seatLabel(item.seat));

// Build identity lines (GSTIN, FSSAI, VAT, address, phone) for bill header.
export function buildIdentityHtml(info, printSettings) {
  const bl = printSettings?.billLayout || {};
  const lines = [];
  if (info.restaurantLegalName && info.restaurantLegalName !== info.restaurantName)
    lines.push(esc(info.restaurantLegalName));
  if (bl.showAddress !== false && info.restaurantAddress) {
    // Address may be multi-line (e.g. native-language tagline + English area
    // entered in Print Settings → Receipt Address) — print each line separately
    String(info.restaurantAddress).split(/\r?\n+/).forEach((l) => {
      const line = l.trim();
      if (line) lines.push(esc(line));
    });
  }
  if (bl.showPhone !== false && info.restaurantPhone) lines.push('Tel: ' + info.restaurantPhone);
  if (info.showGstOnInvoice && info.gstin) lines.push('GSTIN: ' + info.gstin);
  if (info.showFssaiOnInvoice && info.fssai) lines.push('FSSAI: ' + info.fssai);
  if (info.showTaxIdOnInvoice && info.vatNumber) {
    const tl = info.identityTaxLabel || info.taxLabel;
    const prefix = info.countryCode === 'AE' || info.countryCode === 'SA' ? 'TRN: '
      : tl ? tl + ': '
      : 'Tax ID: ';
    lines.push(prefix + info.vatNumber);
  }
  if (info.showTaxIdOnInvoice && info.taxId) {
    const tl = info.identityTaxLabel || info.taxLabel;
    lines.push((info.countryCode === 'AU' ? 'ABN: ' : tl ? tl + ': ' : 'Tax ID: ') + info.taxId);
  }
  if (info.showTaxIdOnInvoice && info.businessRegistrationNumber)
    lines.push('Reg#: ' + info.businessRegistrationNumber);
  return lines.map(l => `<div style="font-size:11px;">${l}</div>`).join('');
}

// Get item subline HTML (variant + customizations + notes) for bill item rows.
export function getSublineHtml(item) {
  let sub = '';
  const seat = seatTag(item);
  if (seat) sub += ` <small style="font-weight:bold;">[${seat}]</small>`;
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
// opts: { isRemoved, showDelta, showPrice, currencySymbol }
export function renderKOTItemRow(item, opts = {}, labels = {}) {
  const qty = item.quantity || 1;
  const qtyDisplay = item.soldByWeight && item.itemWeight
    ? `${item.itemWeight}${item.weightUnit || 'kg'}`
    : `${qty}x`;
  const noteLabel = labels.note || 'Note';
  const label = opts.isRemoved ? ' <span style="color:#666;">[CANCEL]</span>' : (opts.showDelta && item.quantityDelta > 0 ? ' <span>[+NEW]</span>' : '');
  const strikeStyle = opts.isRemoved ? 'text-decoration:line-through;color:#999;' : '';
  const price = item.price || (item.total ? item.total / (item.quantity || 1) : 0);
  const itemTotal = price * qty;
  const priceHtml = opts.showPrice && itemTotal > 0 && !opts.isRemoved
    ? `<span style="float:right;font-weight:bold;">${opts.currencySymbol || ''}${itemTotal.toFixed(2)}</span>`
    : '';
  const seat = seatTag(item);
  const seatHtml = seat ? ` <strong>[${seat}]</strong>` : '';
  return `<div class="item" style="${strikeStyle}"><div class="item-main"><span class="item-qty">${qtyDisplay}</span><span class="item-name">${esc(item.name)}${seatHtml}${label}</span>${priceHtml}</div>` +
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

// Cashback earned line for bills — renders only when the order carries a
// cashback credit (invoice.cashbackEarned set by the FE at billing time or by
// the invoice endpoint on reprints)
export function buildCashbackHtml(invoice, cs) {
  const cb = Number(invoice?.cashbackEarned) || 0;
  if (cb <= 0) return '';
  return `<div style="text-align:center;margin:4px 0;padding:4px;border:1px dashed #000;font-size:11px;">` +
    `\u{1F381} Cashback ${cs}${cb.toFixed(2)} credited to your wallet \u2014 use on your next visit!` +
    `</div>`;
}

// Build bill items table rows HTML
export function buildBillItemRows(items, cs, showAr) {
  return items.map(item => {
    // Weight-based items: show weight instead of quantity
    const qtyDisplay = item.soldByWeight && item.itemWeight
      ? `${item.itemWeight} ${item.weightUnit || 'kg'}`
      : (item.quantity || 1);
    const lineTotal = item.soldByWeight && item.itemWeight
      ? (item.priceUnit === 'per_100g'
        ? (item.price || 0) * (item.itemWeight / 100)
        : (item.price || 0) * item.itemWeight)
      : (Math.round(((item.price || Math.round((item.total || 0) / (item.quantity || 1) * 100) / 100 || 0) * (item.quantity || 1)) * 100) / 100);
    return `<tr><td style="text-align:left;">${showAr ? dualItemName(item, showAr) : esc(item.name)}${getSublineHtml(item)}</td>` +
      `<td style="text-align:center;">${qtyDisplay}</td>` +
      `<td style="text-align:right;">${cs}${lineTotal.toFixed(2)}</td></tr>`;
  }).join('');
}

// Build tax breakdown rows HTML
// options.showInclusiveTax: when false, hides inclusive tax lines from the bill
export function buildTaxHtml(taxBreakdown, cs, options, printSettings) {
  const bl = printSettings?.billLayout || {};
  if (bl.showTaxBreakdown === false) return '';
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

// "Track your order" QR on the bill. Because the QR image is generated
// asynchronously (qrcode lib) but templates are synchronous, the template only
// emits a marker here; printBridge replaces it with the real QR + link right
// before printing (native path). If it's never replaced (e.g. web window.print),
// the marker is an invisible HTML comment — so it can never corrupt a bill.
export const ORDER_STATUS_QR_MARKER = '<!--DINE_ORDER_STATUS_QR-->';
export function buildOrderStatusSection(printSettings = {}) {
  return printSettings.showOrderStatusQR ? ORDER_STATUS_QR_MARKER : '';
}
// The actual printed block, built once the QR data URL is ready.
export function renderOrderStatusQRHtml(url, qrDataUrl) {
  if (!url || !qrDataUrl) return '';
  return `<div style="text-align:center;margin-top:8px;padding-top:8px;border-top:1px dashed #ccc;">` +
    `<div style="font-size:11px;font-weight:bold;margin-bottom:4px;">📱 Track your order</div>` +
    `<img src="${qrDataUrl}" style="width:80px;height:80px;margin:4px auto;display:block;" />` +
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
export function buildDeliveryAddressHtml(invoice, printSettings) {
  const bl = printSettings?.billLayout || {};
  if (bl.showDelivery === false) return '';
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
    (invoice.taxBreakdown?.filter(tax => !tax.inclusive).reduce((sum, tax) => sum + (tax.amount || 0), 0) || 0) +
    (invoice.serviceChargeAmount || 0) + (invoice.tipAmount || 0) + (invoice.roundOffAmount || 0)
  );
}

// Standard HTML document wrapper
export function wrapInDocument(title, cssString, bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${cssString}</style></head><body>${bodyHtml}</body></html>`;
}

// ── Dual-language (Arabic) support ──────────────────────────────────────
// Arabic translations for bill labels
export const BILL_LABELS_AR = {
  billTitle: 'فاتورة',
  revisedBill: 'فاتورة معدلة',
  billLabel: 'فاتورة',
  itemCol: 'الصنف',
  qtyCol: 'الكمية',
  amt: 'المبلغ',
  date: 'التاريخ',
  table: 'طاولة',
  room: 'غرفة',
  customer: 'العميل',
  payment: 'الدفع',
  subtotal: 'المجموع الفرعي',
  offer: 'عرض',
  manualDiscount: 'خصم',
  loyaltyRedeem: 'ولاء',
  serviceCharge: 'رسوم الخدمة',
  tip: 'بقشيش',
  roundOff: 'تقريب',
  total: 'الإجمالي',
  splitPayment: 'دفع مقسم',
  cashReceived: 'المبلغ المستلم',
  change: 'الباقي',
  partialPayment: 'دفع جزئي',
  paid: 'مدفوع',
  outstanding: 'المتبقي',
  walletApplied: 'المحفظة',
  amountToPay: 'المبلغ المستحق',
  footer: 'شكرا لزيارتكم!',
  poweredBy: 'مدعوم من DineOpen',
};

// Arabic translations for KOT labels
export const KOT_LABELS_AR = {
  kitchenOrder: 'طلب مطبخ',
  kotUpdate: 'تحديث الطلب',
  orderHash: 'طلب#',
  table: 'طاولة',
  room: 'غرفة',
  time: 'الوقت',
  date: 'التاريخ',
  customer: 'العميل',
  type: 'النوع',
  waiter: 'النادل',
  qty: 'الكمية',
  item: 'الصنف',
  totalItems: 'إجمالي الأصناف',
  specialInstructions: 'تعليمات خاصة',
  note: 'ملاحظة',
  newItemsOnly: '*** أصناف جديدة فقط ***',
};

// CSS for dual-language bill/KOT rendering
export function getBillDualCSS() {
  return `
    .dual-label { display: flex; justify-content: space-between; }
    .dual-label .lbl-en { text-align: left; }
    .dual-label .lbl-ar { text-align: right; direction: rtl; font-family: 'Arial', sans-serif; }
    .ar-name { direction: rtl; text-align: right; font-family: 'Arial', sans-serif; font-size: 10px; color: #444; }
    .dual-title { text-align: center; }
    .dual-title .title-ar { direction: rtl; font-family: 'Arial', sans-serif; }
  `;
}

// Render a dual-language label: "English | العربية"
export function dualLabel(en, ar, showAr) {
  if (!showAr) return esc(en);
  return `<span class="lbl-en">${esc(en)}</span> | <span class="lbl-ar">${esc(ar || '')}</span>`;
}

// Render a dual-language row with label and value
export function dualRow(labelEn, labelAr, value, showAr) {
  if (!showAr) return `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${esc(labelEn)}:</span><span>${esc(value)}</span></div>`;
  return `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${esc(labelEn)} | ${esc(labelAr || '')}:</span><span>${esc(value)}</span></div>`;
}

// Render dual-language title (centered, two lines)
export function dualTitle(en, ar, showAr) {
  if (!showAr) return en;
  return `<div class="dual-title">${en}<br/><span class="title-ar">${esc(ar || '')}</span></div>`;
}

// Render item name with optional Arabic name below
export function dualItemName(item, showAr) {
  const name = esc(item.name);
  if (!showAr || !item.nameAr) return name;
  return `${name}<div class="ar-name">${esc(item.nameAr)}</div>`;
}

// Default bill labels with English fallbacks
export function getBillLabels(labels = {}) {
  return {
    billTitle: labels.billTitle || 'BILL',
    revisedBill: labels.revisedBill || 'REVISED BILL',
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
    : (kotData.tableNumber ? `<div><strong>${L.table}:</strong> ${kotData.tableNumber}${kotData.floorName ? ` - ${kotData.floorName}` : ''}</div>` : '');
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

// Build split bill banner HTML for per-guest receipts
export function buildSplitBillHtml(invoice, L, cs) {
  if (!invoice.splitInfo) return '';
  const si = invoice.splitInfo;
  const methodLabel = si.method === 'equal' ? 'Equal Split' : si.method === 'by-item' ? 'Split by Item' : 'Split by Amount';
  const nameDisplay = si.guestName ? `${esc(si.guestName)} (${esc(si.guestLabel)})` : esc(si.guestLabel);
  return `<div style="border:2px solid #0ea5e9;border-radius:6px;padding:6px 8px;margin:6px 0;text-align:center;background:#f0f9ff;">
    <div style="font-weight:bold;font-size:13px;color:#0369a1;">SPLIT BILL &mdash; ${nameDisplay} of ${si.guestCount}</div>
    <div style="font-size:10px;color:#64748b;">(${methodLabel})</div>
  </div>`;
}

// Build per-guest invoice object from full order invoice + split data
export function buildSplitInvoice(fullInvoice, splitIndex) {
  const sb = fullInvoice.splitBill;
  if (!sb || !sb.splits || !sb.splits[splitIndex]) return null;
  const split = sb.splits[splitIndex];
  const guestInvoice = { ...fullInvoice };
  // Replace financial values with guest's portion
  guestInvoice.subtotal = split.subtotal;
  guestInvoice.taxAmount = split.taxAmount;
  guestInvoice.totalTax = split.taxAmount;
  guestInvoice.taxBreakdown = split.taxBreakdown || [];
  guestInvoice.serviceChargeAmount = split.serviceChargeAmount || 0;
  guestInvoice.tipAmount = split.tipAmount || 0;
  guestInvoice.grandTotal = split.totalAmount;
  guestInvoice.finalAmount = split.totalAmount;
  guestInvoice.paymentMethod = split.paymentMethod || 'cash';
  guestInvoice.cashReceived = split.cashReceived || null;
  guestInvoice.changeReturned = split.changeReturned || null;
  guestInvoice.discountAmount = split.discountAmount || 0;
  guestInvoice.totalDiscountAmount = split.discountAmount || 0;
  // For by-item, replace items with guest's items
  if (sb.method === 'by-item' && split.items) {
    guestInvoice.items = split.items;
  }
  // Clear split payments — each guest split is a single payment
  guestInvoice.splitPayments = null;
  guestInvoice.splitBill = null;
  // Inject split info for banner rendering
  guestInvoice.splitInfo = {
    index: splitIndex,
    guestLabel: split.guestLabel || `Guest ${splitIndex + 1}`,
    guestName: split.guestName || null,
    guestCount: sb.guestCount || sb.splits.length,
    method: sb.method,
    total: split.totalAmount,
  };
  return guestInvoice;
}
