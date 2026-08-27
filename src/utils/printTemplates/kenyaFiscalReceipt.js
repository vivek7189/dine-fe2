'use client';

/**
 * Kenya KRA fiscal receipt (eTIMS).
 *
 * The KRA fiscal block itself is now rendered by generateBillHTML (the single choke point for ALL
 * bill prints), gated on order.etims.rcptSign — so a fiscalised order shows the block on the first
 * print, reprints and previews alike. This helper's only extra job for the live auto-print is to
 * PRE-RENDER the QR (async) onto order.etims.qrDataUrl so the block includes it, then hand off to
 * generateBillHTML. Non-fiscalised / non-Kenya orders are unaffected.
 *
 * The QR encodes a KRA verification URL — confirm the exact format against current KRA docs
 * (centralised in buildQrContent()).
 */

import QRCode from 'qrcode';
import { generateBillHTML } from '../printHtmlGenerator';

// KRA verification QR content. CONFIRM exact format with KRA eTIMS docs.
function buildQrContent({ tin, bhfId, etims }) {
  const base = 'https://etims.kra.go.ke/common/link/etims/receipt/indexEtimsReceiptData';
  return `${base}?Data=${encodeURIComponent(`${tin || ''}${bhfId || '00'}${etims.rcptSign || ''}`)}`;
}

/**
 * @returns {Promise<string>} the full printable receipt = normal bill + KRA fiscal block (with QR).
 */
export async function buildKenyaFiscalReceipt({ order, restaurant, etimsConfig, printSettings = {}, labels = {} }) {
  const cfg = etimsConfig || (restaurant && restaurant.etimsConfig) || {};
  const etims = (order && order.etims) || {};
  // Pre-render the QR (async) so the sync bill generator can include it in the fiscal block.
  if (etims.rcptSign && !etims.qrDataUrl) {
    try {
      etims.qrDataUrl = await QRCode.toDataURL(buildQrContent({ tin: cfg.tin, bhfId: cfg.bhfId, etims }), { width: 150, margin: 1 });
      order.etims = etims;
    } catch { /* QR optional — the text block still prints */ }
  }
  // generateBillHTML appends the KRA block itself (gated on order.etims.rcptSign).
  return generateBillHTML(order, printSettings, labels);
}

export default buildKenyaFiscalReceipt;
