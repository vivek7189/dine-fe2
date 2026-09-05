// Local HTML generators for bill and KOT printing.
// Used by Tauri app to print directly without API calls (works offline).
// Delegates to the template system for KOT and Bill rendering.

import { renderKOT, renderBill } from './printTemplates/index';
import { attachInclusiveSplits, splitIndiaGst } from './printTemplates/helpers';
import { getContentWidth } from './printFontSizes';

// Display-only: when an order came from a per-seat/chair QR (chairNumber/seat set), show the seat
// next to the table on the printed KOT/bill. Returns a SHALLOW CLONE with the seat appended to
// tableNumber — the original object is never mutated, so reprints stay idempotent (no "Seat 1 · Seat 1")
// and table-matching logic elsewhere keeps the raw tableNumber. No seat → the object is returned as-is
// (zero change for every existing order).
function withSeatLabel(obj) {
  if (!obj) return obj;
  // Seat/chair may sit at the top level (KOT data / raw order) or under customerInfo (invoice
  // records). Read either — absence of any is the normal case and returns the object untouched.
  const seat = obj.chairNumber ?? obj.seat ?? obj.customerInfo?.chairNumber ?? obj.customerInfo?.seat;
  if (seat == null || String(seat).trim() === '' || !obj.tableNumber) return obj;
  if (String(obj.tableNumber).includes('· Seat')) return obj; // already labelled — never double up
  return { ...obj, tableNumber: `${obj.tableNumber} · Seat ${String(seat).trim()}` };
}

/**
 * Generate complete bill/invoice HTML for thermal printing.
 * Delegates to the selected bill template via printSettings.billTemplate.
 * Single choke point for ALL bill prints (live, order-history reprint, auto-print),
 * so we attach the per-item tax-inclusive split here — every bill shows MRP + tax.
 */
export function generateBillHTML(invoice, printSettings = {}, labels = {}) {
  try {
    if (invoice && !invoice.currencySymbol) invoice.currencySymbol = printSettings?.currencySymbol || labels?.currencySymbol || '';
    attachInclusiveSplits(invoice);
    splitIndiaGst(invoice); // India: render GST as CGST + SGST (display only)
  } catch (_) { /* never block printing */ }
  let html = renderBill(withSeatLabel(invoice), printSettings, labels);
  // Credit-note refund: mark the printout clearly at the top (the KRA block below carries the
  // signed CREDIT NOTE + original-invoice reference + QR). Body amounts show the original order.
  try {
    if (invoice && invoice.isCreditNote) {
      const q = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
      const info = [];
      if (invoice.creditNoteOrgInvcNo != null) info.push(`Against Invoice #${q(invoice.creditNoteOrgInvcNo)}`);
      if (invoice.creditNoteReason) info.push(`Reason: ${q(invoice.creditNoteReason)}`);
      if (invoice.creditNoteAmount != null) info.push(`Refund: ${q(invoice.currencySymbol || '')}${q(invoice.creditNoteAmount)}`);
      const banner = `<div style="text-align:center;font-weight:bold;border:2px solid #000;padding:5px;margin:4px 0;">*** CREDIT NOTE ***${info.length ? `<br/><span style="font-size:11px;font-weight:normal;">${info.join(' · ')}</span>` : ''}</div>`;
      html = /<body[^>]*>/.test(html) ? html.replace(/(<body[^>]*>)/, `$1${banner}`) : (banner + html);
    }
  } catch (_) { /* never block printing */ }
  // Kenya KRA eTIMS: once an order is fiscalised (order.etims.rcptSign present) the KRA fiscal block
  // must appear on EVERY receipt — first print, reprint, preview. Because THIS is the single choke
  // point for all bill prints, appending here covers them all (the QR is included when a data-URI was
  // pre-rendered onto invoice.etims.qrDataUrl; otherwise the compliant text block still prints).
  try {
    if (invoice && invoice.etims && invoice.etims.rcptSign) {
      const block = kraFiscalBlockHtml(invoice);
      html = html.includes('</body>') ? html.replace('</body>', `${block}</body>`) : (html + block);
    }
  } catch (_) { /* never block printing */ }
  return html;
}

// Sync KRA eTIMS fiscal block (all fields live on order.etims after confirm-sale). The QR is optional
// here (rendered from a pre-computed data-URI) so this stays synchronous and safe for every print path.
function kraFiscalBlockHtml(inv) {
  const e = inv.etims || {};
  const q = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const row = (label, val) => (val == null || val === '') ? '' : `<div style="display:flex;justify-content:space-between;gap:8px;"><span>${label}</span><span style="text-align:right;word-break:break-all;">${q(val)}</span></div>`;
  const rcpt = e.rcptNo != null ? (e.totRcptNo != null ? `${e.rcptNo} / ${e.totRcptNo}` : String(e.rcptNo)) : null;
  const qr = e.qrDataUrl ? `<div style="text-align:center;margin-top:6px;"><img src="${e.qrDataUrl}" style="width:120px;height:120px;" alt="KRA QR"/></div>` : '';
  return `
    <div style="border-top:1px dashed #000;margin-top:6px;padding-top:6px;font-family:'Courier New',monospace;font-size:11px;line-height:1.5;">
      <div style="text-align:center;font-weight:bold;letter-spacing:1px;margin-bottom:3px;">KRA eTIMS · ${e.isCreditNote ? 'CREDIT NOTE' : 'FISCAL RECEIPT'}</div>
      ${row('Invoice No', e.invcNo)}
      ${e.isCreditNote ? row('Original Invoice No', e.orgInvcNo) : ''}
      ${row('SDC ID', e.sdcId)}
      ${row('MRC No', e.mrcNo)}
      ${row('Receipt No', rcpt)}
      ${row('Internal Data', e.intrlData)}
      ${row('Receipt Sign', e.rcptSign)}
      ${row('VSCU Date', e.vsdcRcptPbctDate)}
      ${qr}
      <div style="text-align:center;font-size:9px;margin-top:3px;">Scan to verify on the KRA eTIMS portal</div>
    </div>`;
}

/**
 * Generate complete KOT (Kitchen Order Ticket) HTML for thermal printing.
 * Delegates to the selected KOT template via printSettings.kotTemplate.
 */
export function generateKOTHTML(kotData, printSettings = {}, labels = {}) {
  return renderKOT(withSeatLabel(kotData), printSettings, labels);
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
