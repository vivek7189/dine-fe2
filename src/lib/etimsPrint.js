'use client';

/**
 * Kenya eTIMS — one-call helper for the billing flow: fiscalise a completed
 * order against the local VSCU, then silently print ONE receipt = the normal
 * bill + the KRA fiscal block/QR.
 *
 * IMPORTANT (compliance + UX): because the normal bill auto-print is suppressed
 * when eTIMS is live, this MUST guarantee the customer still gets a receipt. If
 * fiscalisation fails (VSCU down/error), we fall back to printing the NORMAL
 * bill and return { error, fallbackPrinted:true } so the cashier is warned and
 * the sale can be re-fiscalised later. It never throws.
 */

import { fiscaliseOrder, isEtimsCapable } from './etims';
import { buildKenyaFiscalReceipt } from '../utils/printTemplates/kenyaFiscalReceipt';
import { printDocument } from '../utils/printBridge';

async function loadFullOrder(order, restaurant) {
  let full = order;
  if (!Array.isArray(order.items) || order.items.length === 0) {
    try {
      const apiClient = (await import('./api')).default;
      const res = await apiClient.getOrderById(order.id);
      // getOrderById returns { orders: [order], pagination } — take the first.
      full = (res && res.orders && res.orders[0]) || (res && res.order) || order;
    } catch { full = order; }
  }
  // Ensure the receipt has a currency symbol (the fetched order may not carry one).
  const cs = restaurant && restaurant.currencySettings;
  if (cs && !full.currencySymbol) full = { ...full, currencySymbol: cs.currencySymbol || 'KSh' };
  return full;
}

// Fallback: print the plain bill (no KRA block) so a receipt always comes out.
async function printPlainBill(fullOrder, restaurantId, printSettings, labels) {
  try {
    const { generateBillHTML } = await import('../utils/printHtmlGenerator');
    const html = generateBillHTML(fullOrder, printSettings || {}, labels || {});
    await printDocument({ html, type: 'bill', orderId: fullOrder.id, restaurantId, printSettings: printSettings || {}, orderData: fullOrder });
    return true;
  } catch { return false; }
}

export async function fiscaliseAndPrint({ restaurantId, order, restaurant, printSettings = {}, labels = {} }) {
  if (!isEtimsCapable()) return { skipped: 'not-desktop' };
  const cc = restaurant && restaurant.currencySettings && restaurant.currencySettings.countryCode;
  const ccode = restaurant && restaurant.currencySettings && restaurant.currencySettings.currencyCode;
  if (cc !== 'KE' && ccode !== 'KES') return { skipped: 'not-kenya' };

  // Load the full order once — needed for the fiscal receipt AND the fallback.
  const fullOrder = await loadFullOrder(order, restaurant);

  let result;
  try {
    result = await fiscaliseOrder(restaurantId, order.id);
  } catch (e) {
    // Fiscalisation failed → still give the customer a (non-fiscal) receipt.
    const fallbackPrinted = await printPlainBill(fullOrder, restaurantId, printSettings, labels);
    return { error: e && e.message, fallbackPrinted };
  }
  if (result.skipped) return result;

  // Fiscalised OK → print the combined receipt (bill + KRA block/QR).
  try {
    const orderWithEtims = { ...fullOrder, etims: result.etims };
    const html = await buildKenyaFiscalReceipt({
      order: orderWithEtims,
      restaurant,
      etimsConfig: restaurant && restaurant.etimsConfig,
      printSettings,
      labels,
    });
    await printDocument({ html, type: 'bill', orderId: order.id, restaurantId, printSettings: printSettings || {}, orderData: orderWithEtims });
    return { etims: result.etims };
  } catch (printErr) {
    // Fiscalised but the combined print failed — try a plain bill so something prints.
    const fallbackPrinted = await printPlainBill(fullOrder, restaurantId, printSettings, labels);
    return { etims: result.etims, printError: printErr && printErr.message, fallbackPrinted };
  }
}
