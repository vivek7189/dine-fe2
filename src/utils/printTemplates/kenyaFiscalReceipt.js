'use client';

/**
 * Kenya KRA fiscal receipt (eTIMS).
 *
 * IMPORTANT: this does NOT reinvent the bill. It renders your NORMAL bill exactly
 * as usual (via generateBillHTML) and simply appends the KRA fiscal block +
 * QR code to the bottom. So the customer gets ONE receipt: the familiar bill
 * plus the legally-required KRA signature/QR. Used only for Kenya (KES) stores
 * once an order has been fiscalised (order.etims present).
 *
 * The QR encodes a KRA verification URL — confirm the exact format against
 * current KRA docs (centralised in buildQrContent()).
 */

import QRCode from 'qrcode';
import { generateBillHTML } from '../printHtmlGenerator';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// KRA verification QR content. CONFIRM exact format with KRA eTIMS docs.
function buildQrContent({ tin, bhfId, etims }) {
  const base = 'https://etims.kra.go.ke/common/link/etims/receipt/indexEtimsReceiptData';
  return `${base}?Data=${encodeURIComponent(`${tin || ''}${bhfId || '00'}${etims.rcptSign || ''}`)}`;
}

async function buildKraBlockHtml({ order, restaurant, etimsConfig }) {
  const etims = order.etims || {};
  const cfg = etimsConfig || (restaurant && restaurant.etimsConfig) || {};
  let qr = '';
  try {
    qr = await QRCode.toDataURL(buildQrContent({ tin: cfg.tin, bhfId: cfg.bhfId, etims }), { width: 150, margin: 1 });
  } catch { /* QR optional */ }

  return `
    <div style="border-top:1px dashed #000;margin-top:6px;padding-top:6px;font-family:'Courier New',monospace;font-size:10px;text-align:left;">
      <div style="text-align:center;font-weight:bold;letter-spacing:1px;">KRA eTIMS · TAX INVOICE</div>
      <div style="border:1px solid #000;padding:5px;margin-top:4px;word-break:break-all;line-height:1.5;">
        <div>PIN: ${esc(cfg.tin)}</div>
        <div>SDC ID: ${esc(etims.sdcId)}</div>
        <div>MRC No: ${esc(etims.mrcNo)}</div>
        <div>Receipt No: ${esc(etims.rcptNo)}${etims.totRcptNo != null ? ` / ${esc(etims.totRcptNo)}` : ''}</div>
        <div>Internal Data: ${esc(etims.intrlData)}</div>
        <div>Signature: ${esc(etims.rcptSign)}</div>
        ${etims.vsdcRcptPbctDate ? `<div>Date: ${esc(etims.vsdcRcptPbctDate)}</div>` : ''}
      </div>
      ${qr ? `<div style="text-align:center;margin-top:6px;"><img src="${qr}" width="120" height="120" alt="KRA QR"/></div>` : ''}
      <div style="text-align:center;font-size:9px;margin-top:4px;">Scan to verify on the KRA eTIMS portal</div>
    </div>`;
}

/**
 * @returns {Promise<string>} the full printable receipt = normal bill + KRA block.
 */
export async function buildKenyaFiscalReceipt({ order, restaurant, etimsConfig, printSettings = {}, labels = {} }) {
  // Render the normal bill exactly as usual…
  let billHtml = '';
  try {
    billHtml = generateBillHTML(order, printSettings, labels) || '';
  } catch { billHtml = ''; }

  const kraBlock = await buildKraBlockHtml({ order, restaurant, etimsConfig });

  // …and append the KRA block just before the end of the bill.
  if (billHtml.includes('</body>')) return billHtml.replace('</body>', `${kraBlock}</body>`);
  if (billHtml) return billHtml + kraBlock;

  // Fallback: minimal standalone receipt if the bill generator returned nothing.
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="width:280px;margin:0 auto;font-family:'Courier New',monospace;">
    <div style="text-align:center;font-weight:bold;font-size:14px;">${esc(restaurant && restaurant.name)}</div>
    ${kraBlock}</body></html>`;
}
