// Local HTML generators for bill and KOT printing.
// Used by Tauri app to print directly without API calls (works offline).
// Delegates to the template system for KOT and Bill rendering.

import { renderKOT, renderBill } from './printTemplates/index';
import { getContentWidth } from './printFontSizes';

/**
 * Generate complete bill/invoice HTML for thermal printing.
 * Delegates to the selected bill template via printSettings.billTemplate.
 */
export function generateBillHTML(invoice, printSettings = {}, labels = {}) {
  return renderBill(invoice, printSettings, labels);
}

/**
 * Generate complete KOT (Kitchen Order Ticket) HTML for thermal printing.
 * Delegates to the selected KOT template via printSettings.kotTemplate.
 */
export function generateKOTHTML(kotData, printSettings = {}, labels = {}) {
  return renderKOT(kotData, printSettings, labels);
}

// esc helper used by parking slip generators below
const esc = (str) => String(str ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Safely extract a display string from values that might be {en, ar} objects or plain strings
function safeStr(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) return val.en || val.ar || val.url || Object.values(val).find(v => typeof v === 'string') || '';
  return String(val);
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

function parkingSlipCSS(printerWidth) {
  const cw = getContentWidth(printerWidth);
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 12px; width: ${cw}; max-width: ${cw}; padding: 2mm; }
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
    @media print { body { width: ${cw}; } }
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
  const lang = safeStr(config.printLanguage) || 'dual';
  const showAr = lang === 'dual' || lang === 'ar';
  const showEn = lang === 'dual' || lang === 'en';

  const entryDate = ticket.entryTime ? new Date(ticket.entryTime) : new Date();
  const dateStr = entryDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = entryDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });

  const vtAr = VEHICLE_TYPE_AR[ticket.vehicleType] || ticket.vehicleType;

  const logoUrl = safeStr(config.logo);
  const lotName = safeStr(config.lotName) || 'Parking';
  const lotNameAr = safeStr(config.lotNameAr);
  const address = safeStr(config.address);
  const addressAr = safeStr(config.addressAr);
  const receiptHeader = safeStr(config.receiptHeader);
  const receiptHeaderAr = safeStr(config.receiptHeaderAr);
  const receiptFooter = safeStr(config.receiptFooter);
  const receiptFooterAr = safeStr(config.receiptFooterAr);

  let logoHtml = '';
  if (logoUrl) {
    logoHtml = `<div class="center"><img src="${logoUrl}" style="max-height:40px;max-width:60mm;margin-bottom:4px;" /></div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Parking - ${ticket.ticketNumber}</title>
<style>${parkingSlipCSS()}</style></head><body>
<div class="divider">================================</div>
${logoHtml}
<div class="header-name">${showEn ? esc(lotName) : ''}${showAr && showEn ? ' | ' : ''}${showAr ? esc(lotNameAr) : ''}</div>
${address ? `<div class="center" style="font-size:10px;">${showEn ? esc(address) : ''}${showAr ? '<br/>' + esc(addressAr) : ''}</div>` : ''}
${receiptHeader ? `<div class="center" style="font-size:10px;">${esc(receiptHeader)}${showAr && receiptHeaderAr ? '<br/>' + esc(receiptHeaderAr) : ''}</div>` : ''}
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
${receiptFooter ? `<div class="center" style="font-size:10px;margin-top:4px;">${esc(receiptFooter)}${showAr && receiptFooterAr ? '<br/>' + esc(receiptFooterAr) : ''}</div>` : ''}
<div class="divider">================================</div>
</body></html>`;
}

/**
 * Generate parking exit receipt HTML for thermal printing.
 * @param {object} ticket - Ticket data with exit info
 * @param {object} config - Parking config
 */
export function generateParkingExitSlipHTML(ticket, config = {}) {
  const lang = safeStr(config.printLanguage) || 'dual';
  const showAr = lang === 'dual' || lang === 'ar';
  const showEn = lang === 'dual' || lang === 'en';

  const entryDate = ticket.entryTime ? new Date(ticket.entryTime) : new Date();
  const exitDate = ticket.exitTime ? new Date(ticket.exitTime) : new Date();
  const entryTimeStr = entryDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  const exitTimeStr = exitDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateStr = exitDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const vtAr = VEHICLE_TYPE_AR[ticket.vehicleType] || ticket.vehicleType;
  const payAr = PAYMENT_AR[ticket.paymentMethod] || ticket.paymentMethod || '';
  const currency = safeStr(ticket.currency) || safeStr(config.currency) || 'AED';

  const durationMin = ticket.duration || ticket.durationMinutes || 0;
  const durationStr = ticket.durationFormatted || `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`;

  const logoUrl = safeStr(config.logo);
  const lotName = safeStr(config.lotName) || 'Parking';
  const lotNameAr = safeStr(config.lotNameAr);
  const address = safeStr(config.address);
  const addressAr = safeStr(config.addressAr);
  const receiptFooter = safeStr(config.receiptFooter);
  const receiptFooterAr = safeStr(config.receiptFooterAr);

  let logoHtml = '';
  if (logoUrl) {
    logoHtml = `<div class="center"><img src="${logoUrl}" style="max-height:40px;max-width:60mm;margin-bottom:4px;" /></div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Exit - ${ticket.ticketNumber}</title>
<style>${parkingSlipCSS()}</style></head><body>
<div class="divider">================================</div>
${logoHtml}
<div class="header-name">${showEn ? esc(lotName) : ''}${showAr && showEn ? ' | ' : ''}${showAr ? esc(lotNameAr) : ''}</div>
${address ? `<div class="center" style="font-size:10px;">${showEn ? esc(address) : ''}${showAr ? '<br/>' + esc(addressAr) : ''}</div>` : ''}
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
${receiptFooter ? `<div class="center" style="font-size:10px;margin-top:4px;">${esc(receiptFooter)}${showAr && receiptFooterAr ? '<br/>' + esc(receiptFooterAr) : ''}</div>` : ''}
<div class="divider">================================</div>
</body></html>`;
}
