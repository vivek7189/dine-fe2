// Local HTML generators for bill and KOT printing.
// Used by Tauri app to print directly without API calls (works offline).
// Produces the same HTML as the backend render endpoints.

import { getBillPrintCSS, getKOTPrintCSS, getBillHeaderHTML } from './printFontSizes';

const esc = (str) => String(str ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Build identity lines (GSTIN, FSSAI, VAT, etc.) for the bill header.
 */
function buildIdentityHtml(info) {
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

/**
 * Get item subline HTML (variant + customizations).
 */
function getSublineHtml(item) {
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

/**
 * Generate complete bill/invoice HTML for thermal printing.
 *
 * @param {object} invoice - Invoice/order data with items, totals, tax, etc.
 * @param {object} printSettings - Print settings (billFontScale, billFontFamily, receiptLogo, etc.)
 * @param {object} [labels] - Localized labels (optional, falls back to English defaults)
 * @returns {string} Full HTML document string ready for printing
 */
export function generateBillHTML(invoice, printSettings = {}, labels = {}) {
  const L = {
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

  const cs = invoice.currencySymbol || '₹';
  const items = invoice.items || [];

  // Items table
  const itemsHtml = items.map(item =>
    `<tr><td style="text-align:left;">${esc(item.name)}${getSublineHtml(item)}</td>` +
    `<td style="text-align:center;">${item.quantity || 1}</td>` +
    `<td style="text-align:right;">${cs}${((item.price || item.total / (item.quantity || 1) || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`
  ).join('');

  // Tax rows
  const taxHtml = (invoice.taxBreakdown || []).map(tax =>
    `<tr><td colspan="2" style="text-align:left;">${tax.name} (${tax.rate}%)</td>` +
    `<td style="text-align:right;">${cs}${(tax.amount || 0).toFixed(2)}</td></tr>`
  ).join('');

  // Discounts
  const offerName = typeof invoice.appliedOffer === 'string' ? invoice.appliedOffer : (invoice.appliedOffer?.name || '');
  const offerDiscHtml = (invoice.discountAmount || 0) > 0
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#16a34a;"><span>${L.offer}${offerName ? ` (${offerName})` : ''}:</span><span>-${cs}${invoice.discountAmount.toFixed(2)}</span></div>` : '';
  const manualDiscHtml = (invoice.manualDiscount || 0) > 0
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#16a34a;"><span>${L.manualDiscount}:</span><span>-${cs}${invoice.manualDiscount.toFixed(2)}</span></div>` : '';
  const loyaltyDiscHtml = (invoice.loyaltyDiscount || 0) > 0
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;color:#b45309;"><span>${L.loyaltyRedeem}:</span><span>-${cs}${invoice.loyaltyDiscount.toFixed(2)}</span></div>` : '';
  const discountHtml = offerDiscHtml + manualDiscHtml + loyaltyDiscHtml;

  // Service charge, tip, round-off
  const serviceChargeHtml = (invoice.serviceChargeAmount > 0)
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.serviceCharge}${invoice.serviceChargeRate ? ` (${invoice.serviceChargeRate}%)` : ''}:</span><span>${cs}${invoice.serviceChargeAmount.toFixed(2)}</span></div>` : '';
  const tipHtml = (invoice.tipAmount > 0)
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.tip}${invoice.tipPercentage ? ` (${invoice.tipPercentage}%)` : ''}:</span><span>${cs}${invoice.tipAmount.toFixed(2)}</span></div>` : '';
  const roundOffHtml = (invoice.roundOffAmount != null && invoice.roundOffAmount !== 0)
    ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.roundOff}:</span><span>${invoice.roundOffAmount > 0 ? '+' : ''}${cs}${invoice.roundOffAmount.toFixed(2)}</span></div>` : '';

  // Payment details
  const splitPaymentHtml = (invoice.splitPayments?.length >= 2)
    ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="font-weight:bold;margin-bottom:2px;">${L.splitPayment}:</div>${invoice.splitPayments.map(sp => `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${(sp.method || 'Cash').toUpperCase()}:</span><span>${cs}${(sp.amount || 0).toFixed(2)}</span></div>`).join('')}</div>` : '';
  const cashReceivedHtml = (invoice.cashReceived > 0)
    ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.cashReceived}:</span><span>${cs}${invoice.cashReceived.toFixed(2)}</span></div>${(invoice.changeReturned > 0) ? `<div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.change}:</span><span>${cs}${invoice.changeReturned.toFixed(2)}</span></div>` : ''}</div>` : '';
  const partialPayHtml = (invoice.paidAmount > 0 && invoice.outstandingAmount > 0)
    ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="font-weight:bold;margin-bottom:2px;">${L.partialPayment}:</div><div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.paid}:</span><span>${cs}${invoice.paidAmount.toFixed(2)}</span></div><div style="display:flex;justify-content:space-between;margin:2px 0;color:#dc2626;"><span>${L.outstanding}:</span><span>${cs}${invoice.outstandingAmount.toFixed(2)}</span></div></div>` : '';
  const walletPayHtml = (invoice.walletRedeemAmount || 0) > 0
    ? `<div style="border-top:1px dashed #000;padding-top:4px;margin-top:4px;"><div style="display:flex;justify-content:space-between;margin:2px 0;"><span>${L.walletApplied}:</span><span>-${cs}${invoice.walletRedeemAmount.toFixed(2)}</span></div><div style="display:flex;justify-content:space-between;margin:2px 0;font-weight:bold;"><span>${L.amountToPay}:</span><span>${cs}${Math.max(0, (invoice.grandTotal || 0) - invoice.walletRedeemAmount).toFixed(2)}</span></div></div>` : '';

  // Grand total
  const totalDiscount = (invoice.discountAmount || 0) + (invoice.manualDiscount || 0) + (invoice.loyaltyDiscount || 0);
  const grandTotal = invoice.grandTotal || (
    (invoice.subtotal || 0) - totalDiscount +
    (invoice.taxBreakdown?.reduce((sum, tax) => sum + (tax.amount || 0), 0) || 0) +
    (invoice.serviceChargeAmount || 0) + (invoice.tipAmount || 0) + (invoice.roundOffAmount || 0)
  );

  // Header
  const identityHtml = buildIdentityHtml(invoice);
  const receiptLogo = printSettings.receiptLogo || null;
  const headerHtml = getBillHeaderHTML(esc(invoice.restaurantName || 'Restaurant'), identityHtml, receiptLogo, `--- ${L.billTitle} ---`);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${L.billLabel} #${invoice.dailyOrderId || invoice.id || 'N/A'}</title><style>${getBillPrintCSS(printSettings.billFontScale || printSettings.billFontSize, printSettings.billFontFamily)}</style></head><body>${headerHtml}<div class="divider">--------------------------------</div><div class="bill-info"><div><span>${L.billLabel}#:</span><span><strong>${invoice.dailyOrderId || invoice.id || 'N/A'}</strong></span></div><div><span>${L.date}:</span><span>${dateStr}</span></div>${invoice.tableNumber ? `<div><span>${L.table}:</span><span>${invoice.tableNumber}${invoice.floorName ? ` · ${invoice.floorName}` : ''}</span></div>` : ''}${invoice.customerName ? `<div><span>${L.customer}:</span><span>${esc(invoice.customerName)}</span></div>` : ''}<div><span>${L.payment}:</span><span>${(invoice.paymentMethod || 'CASH').toUpperCase()}</span></div></div><div class="divider">--------------------------------</div><table><thead><tr><th style="text-align:left;width:52%;">${L.itemCol}</th><th style="text-align:center;width:10%;">${L.qtyCol}</th><th style="text-align:right;width:38%;">${L.amt}</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="total-section"><div class="bill-info"><div><span>${L.subtotal}:</span><span>${cs}${(invoice.subtotal || 0).toFixed(2)}</span></div>${discountHtml}</div>${taxHtml ? `<table style="margin:4px 0;"><tbody>${taxHtml}</tbody></table>` : ''}${serviceChargeHtml}${tipHtml}${roundOffHtml}<div class="total-row"><span>${L.total}:</span><span>${cs}${grandTotal.toFixed(2)}</span></div>${splitPaymentHtml}${cashReceivedHtml}${partialPayHtml}${walletPayHtml}</div><div class="divider">================================</div><div class="bill-footer"><p>${L.footer}</p><p style="font-size:10px;margin-top:4px;">${L.poweredBy}</p></div></body></html>`;
}

/**
 * Generate complete KOT (Kitchen Order Ticket) HTML for thermal printing.
 *
 * @param {object} kotData - KOT data with items, table/room info, etc.
 * @param {object} printSettings - Print settings (billFontScale, billFontFamily)
 * @param {object} [labels] - Localized labels (optional)
 * @returns {string} Full HTML document string ready for printing
 */
export function generateKOTHTML(kotData, printSettings = {}, labels = {}) {
  const L = {
    kitchenOrder: labels.kitchenOrder || 'KITCHEN ORDER',
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

  const k = kotData;
  const tableOrRoom = k.roomNumber
    ? `<div><strong>${L.room}:</strong> ${k.roomNumber}</div>`
    : (k.tableNumber ? `<div><strong>${L.table}:</strong> ${k.tableNumber}${k.floorName ? ` · ${k.floorName}` : ''}</div>` : '');
  const totalItems = (k.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0);

  const specialInstructionsHtml = k.specialInstructions
    ? `<div class="divider">--------------------------------</div><div class="special-instructions"><strong>*** ${L.specialInstructions} ***</strong><div>${esc(k.specialInstructions)}</div></div>`
    : '';

  const incrementalHeader = k.isIncremental
    ? `<div style="text-align:center;font-weight:bold;margin:4px 0;border:1px dashed #000;padding:4px;">${L.newItemsOnly}</div>`
    : '';

  const itemsHtml = (k.items || []).map(i =>
    `<div class="item"><div class="item-main"><span class="item-qty">${i.quantity || 1}x</span><span class="item-name">${esc(i.name)}</span></div>` +
    (i.selectedVariant?.name ? `<div class="item-detail">[${esc(i.selectedVariant.name)}]</div>` : '') +
    ((i.selectedCustomizations || []).map(c => `<div class="item-detail">+ ${esc(c.name || c)}</div>`).join('')) +
    (i.notes ? `<div class="item-note">${L.note}: ${esc(i.notes)}</div>` : '') +
    `</div>`
  ).join('');

  const now = new Date();

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>KOT - ${k.dailyOrderId || k.orderId}</title><style>${getKOTPrintCSS(printSettings.billFontScale || printSettings.billFontSize, printSettings.billFontFamily)}</style></head><body><div class="kot-header"><div class="restaurant-name">${esc(k.restaurantName || 'Restaurant')}</div><div class="kot-title">--- ${L.kitchenOrder} ---</div></div><div class="divider">--------------------------------</div>${incrementalHeader}<div class="kot-info"><div><strong>${L.orderHash}:</strong> ${k.dailyOrderId || k.orderId}</div>${tableOrRoom}<div><strong>${L.time}:</strong> ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div><div><strong>${L.date}:</strong> ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>${k.customerName ? `<div><strong>${L.customer}:</strong> ${esc(k.customerName)}</div>` : ''}${k.orderType ? `<div><strong>${L.type}:</strong> ${k.orderType}</div>` : ''}${k.waiterName ? `<div><strong>${L.waiter}:</strong> ${esc(k.waiterName)}</div>` : ''}</div><div class="divider">--------------------------------</div><div style="font-weight:bold;margin-bottom:4px;">${L.qty} &nbsp; ${L.item}</div><div class="divider">--------------------------------</div>${itemsHtml}<div class="divider">--------------------------------</div><div class="kot-footer">${L.totalItems}: ${totalItems}</div>${specialInstructionsHtml}<div class="divider">================================</div></body></html>`;
}

// ═════════════════════════════════════════════════════════
// PARKING SLIP GENERATORS
// 80mm thermal receipt, dual language (English / Arabic)
// ═════════════════════════════════════════════════════════

const VEHICLE_TYPE_AR = {
  car: 'سيارة', suv: 'دفع رباعي', bike: 'دراجة نارية',
  motorcycle: 'دراجة نارية', truck: 'شاحنة', bus: 'حافلة'
};

const PAYMENT_AR = { cash: 'نقداً', card: 'بطاقة', digital: 'رقمي' };

function parkingSlipCSS() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 12px; width: 72mm; max-width: 72mm; padding: 2mm; }
    .center { text-align: center; }
    .rtl { direction: rtl; text-align: right; }
    .bold { font-weight: bold; }
    .divider { text-align: center; color: #333; margin: 4px 0; font-size: 11px; letter-spacing: 1px; }
    .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 12px; }
    .row .label { color: #555; }
    .row .value { font-weight: bold; text-align: right; }
    .dual { display: flex; justify-content: space-between; margin: 2px 0; font-size: 12px; }
    .dual .en { text-align: left; }
    .dual .ar { text-align: right; direction: rtl; font-family: 'Arial', sans-serif; }
    .big { font-size: 18px; font-weight: bold; text-align: center; margin: 6px 0; }
    .qr { text-align: center; margin: 8px 0; }
    .qr img { width: 140px; height: 140px; }
    .header-name { font-size: 16px; font-weight: bold; text-align: center; margin: 2px 0; }
    .amount { font-size: 22px; font-weight: bold; text-align: center; margin: 8px 0; }
    @media print { body { width: 72mm; } }
  `;
}

function dualLine(en, ar, showAr = true) {
  if (!showAr) return `<div class="row"><span>${esc(en)}</span></div>`;
  return `<div class="dual"><span class="en">${esc(en)}</span><span class="ar">${esc(ar || '')}</span></div>`;
}

function dualRow(labelEn, labelAr, value, showAr = true) {
  if (!showAr) return `<div class="row"><span class="label">${esc(labelEn)}:</span><span class="value">${esc(value)}</span></div>`;
  return `<div class="row"><span class="label">${esc(labelEn)} | ${esc(labelAr || '')}:</span><span class="value">${esc(value)}</span></div>`;
}

/**
 * Generate parking entry slip HTML for thermal printing.
 * @param {object} ticket - Ticket data (merged with printData)
 * @param {object} config - Parking config
 */
export function generateParkingSlipHTML(ticket, config = {}) {
  const lang = config.printLanguage || 'dual';
  const showAr = lang === 'dual' || lang === 'ar';
  const showEn = lang === 'dual' || lang === 'en';

  const entryDate = ticket.entryTime ? new Date(ticket.entryTime) : new Date();
  const dateStr = entryDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = entryDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });

  const vtAr = VEHICLE_TYPE_AR[ticket.vehicleType] || ticket.vehicleType;

  let logoHtml = '';
  if (config.logo) {
    logoHtml = `<div class="center"><img src="${config.logo}" style="max-height:40px;max-width:60mm;margin-bottom:4px;" /></div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Parking - ${ticket.ticketNumber}</title>
<style>${parkingSlipCSS()}</style></head><body>
<div class="divider">================================</div>
${logoHtml}
<div class="header-name">${showEn ? esc(config.lotName || 'Parking') : ''}${showAr && showEn ? ' | ' : ''}${showAr ? esc(config.lotNameAr || '') : ''}</div>
${config.address ? `<div class="center" style="font-size:10px;">${showEn ? esc(config.address) : ''}${showAr ? '<br/>' + esc(config.addressAr || '') : ''}</div>` : ''}
${config.receiptHeader ? `<div class="center" style="font-size:10px;">${esc(config.receiptHeader)}${showAr && config.receiptHeaderAr ? '<br/>' + esc(config.receiptHeaderAr) : ''}</div>` : ''}
<div class="divider">================================</div>
<div class="big">${showEn ? 'PARKING TICKET' : ''}${showAr ? (showEn ? ' | ' : '') + 'تذكرة موقف' : ''}</div>
<div class="divider">--------------------------------</div>
${dualRow('Ticket', 'رقم التذكرة', ticket.ticketNumber || '', showAr)}
${dualRow('Date', 'التاريخ', dateStr, showAr)}
${dualRow('Entry', 'الدخول', timeStr, showAr)}
${dualRow('Zone', 'المنطقة', `${ticket.zoneName || ''} (${ticket.zoneCode || ''})`, showAr)}
${ticket.slotNumber ? dualRow('Slot', 'الموقع', ticket.slotNumber, showAr) : ''}
<div class="divider">--------------------------------</div>
${dualRow('Vehicle', 'المركبة', `${showEn ? (ticket.vehicleType || 'Car') : ''}${showAr ? (showEn ? ' | ' : '') + vtAr : ''}`, false)}
${dualRow('Plate', 'اللوحة', ticket.vehicleNumber || '', showAr)}
${ticket.vehicleColor ? dualRow('Color', 'اللون', ticket.vehicleColor, showAr) : ''}
<div class="divider">--------------------------------</div>
${ticket.rateName ? dualRow('Rate', 'التعرفة', ticket.rateName, showAr) : ''}
<div class="divider">================================</div>
${ticket.qrCodeDataUrl ? `<div class="qr"><img src="${ticket.qrCodeDataUrl}" /><div style="font-size:10px;">${showEn ? 'Scan to verify' : ''}${showAr ? (showEn ? ' | ' : '') + 'امسح للتحقق' : ''}</div></div>` : ''}
<div class="divider">================================</div>
<div class="center" style="font-size:10px;">${showEn ? 'Keep this ticket safe' : ''}${showAr ? '<br/>يرجى الاحتفاظ بالتذكرة' : ''}</div>
${config.receiptFooter ? `<div class="center" style="font-size:10px;margin-top:4px;">${esc(config.receiptFooter)}${showAr && config.receiptFooterAr ? '<br/>' + esc(config.receiptFooterAr) : ''}</div>` : ''}
<div class="divider">================================</div>
</body></html>`;
}

/**
 * Generate parking exit receipt HTML for thermal printing.
 * @param {object} ticket - Ticket data with exit info
 * @param {object} config - Parking config
 */
export function generateParkingExitSlipHTML(ticket, config = {}) {
  const lang = config.printLanguage || 'dual';
  const showAr = lang === 'dual' || lang === 'ar';
  const showEn = lang === 'dual' || lang === 'en';

  const entryDate = ticket.entryTime ? new Date(ticket.entryTime) : new Date();
  const exitDate = ticket.exitTime ? new Date(ticket.exitTime) : new Date();
  const entryTimeStr = entryDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  const exitTimeStr = exitDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = exitDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const vtAr = VEHICLE_TYPE_AR[ticket.vehicleType] || ticket.vehicleType;
  const payAr = PAYMENT_AR[ticket.paymentMethod] || ticket.paymentMethod || '';
  const currency = ticket.currency || config.currency || 'AED';

  const durationMin = ticket.duration || ticket.durationMinutes || 0;
  const durationStr = ticket.durationFormatted || `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`;

  let logoHtml = '';
  if (config.logo) {
    logoHtml = `<div class="center"><img src="${config.logo}" style="max-height:40px;max-width:60mm;margin-bottom:4px;" /></div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Exit - ${ticket.ticketNumber}</title>
<style>${parkingSlipCSS()}</style></head><body>
<div class="divider">================================</div>
${logoHtml}
<div class="header-name">${showEn ? esc(config.lotName || 'Parking') : ''}${showAr && showEn ? ' | ' : ''}${showAr ? esc(config.lotNameAr || '') : ''}</div>
${config.address ? `<div class="center" style="font-size:10px;">${showEn ? esc(config.address) : ''}${showAr ? '<br/>' + esc(config.addressAr || '') : ''}</div>` : ''}
<div class="divider">================================</div>
<div class="big">${showEn ? 'EXIT RECEIPT' : ''}${showAr ? (showEn ? ' | ' : '') + 'إيصال خروج' : ''}</div>
<div class="divider">--------------------------------</div>
${dualRow('Ticket', 'رقم التذكرة', ticket.ticketNumber || '', showAr)}
${dualRow('Date', 'التاريخ', dateStr, showAr)}
<div class="divider">--------------------------------</div>
${dualRow('Vehicle', 'المركبة', `${showEn ? (ticket.vehicleType || 'Car') : ''}${showAr ? (showEn ? ' | ' : '') + vtAr : ''}`, false)}
${dualRow('Plate', 'اللوحة', ticket.vehicleNumber || '', showAr)}
${ticket.zoneName ? dualRow('Zone', 'المنطقة', ticket.zoneName, showAr) : ''}
${ticket.slotNumber ? dualRow('Slot', 'الموقع', ticket.slotNumber, showAr) : ''}
<div class="divider">--------------------------------</div>
${dualRow('Entry', 'الدخول', entryTimeStr, showAr)}
${dualRow('Exit', 'الخروج', exitTimeStr, showAr)}
${dualRow('Duration', 'المدة', durationStr, showAr)}
<div class="divider">================================</div>
<div class="amount">${currency} ${ticket.finalAmount ?? ticket.calculatedAmount ?? 0}</div>
${ticket.discountAmount ? `<div class="center" style="font-size:11px;">Discount: ${currency} ${ticket.discountAmount}</div>` : ''}
${dualRow('Payment', 'الدفع', `${showEn ? (ticket.paymentMethod || 'Cash') : ''}${showAr ? (showEn ? ' | ' : '') + payAr : ''}`, false)}
<div class="divider">================================</div>
<div class="center" style="font-size:12px;font-weight:bold;">${showEn ? 'Thank you' : ''}${showAr ? (showEn ? ' | ' : '') + 'شكراً لكم' : ''}</div>
${config.receiptFooter ? `<div class="center" style="font-size:10px;margin-top:4px;">${esc(config.receiptFooter)}${showAr && config.receiptFooterAr ? '<br/>' + esc(config.receiptFooterAr) : ''}</div>` : ''}
<div class="divider">================================</div>
</body></html>`;
}
