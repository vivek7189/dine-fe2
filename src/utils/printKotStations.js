// Multi-station KOT routing for "Print KOT" actions OUTSIDE the dashboard billing panel
// (Tables page, Dashboard tables view, Order History cards).
//
// This mirrors the gold-standard split inlined in OrderSummary.js (the auto-print-on-place
// effect) WITHOUT touching it: for a given orderId it fetches each enabled print station,
// asks the backend to render only that station's items (getKOTRender with stationId), and
// prints each split to its own local printer via printDocument({ stationId }). stationId is
// only honoured on Electron (see printBridge.printViaElectron), so we route only there.
//
// Returns { handled: true } when it performed station routing (caller must NOT also print),
// or { handled: false } when routing is not applicable (not Electron, no stations configured,
// or nothing to print) — in which case the caller should fall back to its existing
// single-printer whole-order KOT print. This keeps single-printer setups 100% unchanged.

import apiClient from '../lib/api';
import { isElectron } from './platform';
import { printDocument } from './printBridge';
import { generateKOTHTML } from './printHtmlGenerator';

// Build the same i18n label bag OrderSummary uses, from a `t` translator (falls back to English).
function buildKotLabels(t) {
  const tr = typeof t === 'function' ? t : (_k) => null;
  const g = (key, fallback) => tr(key) || fallback;
  return {
    kitchenOrder: g('invoice.kitchenOrder', 'KITCHEN ORDER'),
    orderHash: g('invoice.orderHash', 'Order #'),
    table: g('invoice.table', 'Table'),
    room: g('invoice.room', 'Room'),
    time: g('invoice.time', 'Time'),
    date: g('invoice.date', 'Date'),
    customer: g('invoice.customer', 'Customer'),
    type: g('invoice.type', 'Type'),
    waiter: g('invoice.waiter', 'Waiter'),
    qty: g('invoice.qty', 'Qty'),
    item: g('invoice.item', 'Item'),
    totalItems: g('invoice.totalItems', 'Total Items'),
    specialInstructions: g('invoice.specialInstructions', 'Special Instructions'),
    note: g('invoice.note', 'Note'),
  };
}

/**
 * Route a KOT for `orderId` across configured print stations (Electron multi-station only).
 * @returns {Promise<{handled: boolean}>}
 */
export async function printKOTByStations({
  restaurantId,
  orderId,
  printSettings = {},
  posSettings = {},
  t,
  currencySymbol = '',
  isIncremental = false,
}) {
  // Only Electron can route a job to a specific station printer. Everywhere else → caller's
  // existing single-printer path (unchanged behaviour).
  if (!restaurantId || !orderId || !isElectron()) return { handled: false };

  let stations;
  try {
    const res = await apiClient.getPrintStations(restaurantId);
    stations = (res?.printStations || []).filter((s) => s.enabled);
  } catch (e) {
    return { handled: false }; // couldn't load stations → let caller print combined
  }
  if (!stations || stations.length === 0) return { handled: false }; // single-printer setup

  const kotLabels = buildKotLabels(t);
  const kotPS = { ...(printSettings || {}), showPriceOnKot: !!posSettings?.showPriceOnKot, currencySymbol };
  const hasDefaultStation = stations.some((s) => s.isDefault);
  let printedAny = false;

  try {
    for (const station of stations) {
      const rd = await apiClient.getKOTRender(restaurantId, orderId, { stationId: station.id, newOnly: isIncremental });
      const items = rd?.kot?.items || [];
      const removedItems = rd?.kot?.removedItems || [];
      if (rd?.empty || (items.length === 0 && removedItems.length === 0)) continue;
      const kotData = { ...rd.kot, restaurantName: rd?.restaurant?.name || rd.kot.restaurantName || '' };
      const html = generateKOTHTML(kotData, kotPS, kotLabels);
      if (html) {
        await printDocument({ html, type: 'kot', orderId: `${orderId}-${station.id}`, stationId: station.id, restaurantId, printSettings: printSettings || {} });
        printedAny = true;
      }
    }
    // No default station → send a combined KOT to the default printer so unassigned items aren't lost.
    if (!hasDefaultStation) {
      const rd = await apiClient.getKOTRender(restaurantId, orderId, { newOnly: isIncremental });
      const items = rd?.kot?.items || [];
      const removedItems = rd?.kot?.removedItems || [];
      if (!rd?.empty && (items.length > 0 || removedItems.length > 0)) {
        const html = rd?.kot && generateKOTHTML({ ...rd.kot, restaurantName: rd?.restaurant?.name || '' }, kotPS, kotLabels);
        if (html) {
          await printDocument({ html, type: 'kot', orderId: `${orderId}-default`, restaurantId, printSettings: printSettings || {} });
          printedAny = true;
        }
      }
    }
  } catch (e) {
    console.warn('[printKOTByStations] station split failed:', e?.message);
    // If we already printed some stations, consider it handled; else let the caller fall back.
    return { handled: printedAny };
  }

  // Nothing routed (e.g. all stations empty) → let the caller print the whole KOT as a safety net.
  return { handled: printedAny };
}
