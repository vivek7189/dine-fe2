// Multi-station KOT routing for "Print KOT" actions OUTSIDE the dashboard billing panel
// (Tables page, Dashboard tables view, Order History cards).
//
// ONLINE (default): mirrors the gold-standard split in OrderSummary.js WITHOUT touching it —
// for a given orderId it fetches each enabled print station and asks the backend to render only
// that station's items (getKOTRender with stationId), then prints each split to its own local
// printer via printDocument({ stationId }). This is the exact same server-rendered flow the
// dashboard billing page uses, so behaviour matches everywhere.
//
// OFFLINE (navigator.onLine === false): the render API is unreachable, so we do the SAME
// category→station split entirely client-side, using the station config cached locally (written
// on every successful online fetch) + the order's own items (passed in) + generateKOTHTML. This
// keeps multi-station routing working with no internet. It only runs when actually offline — when
// online the code above is untouched.
//
// stationId is only honoured on Electron (printBridge.printViaElectron), so we route only there.
// Returns { handled: true } when it printed station splits (caller must NOT also print), or
// { handled: false } when routing is not applicable (not Electron, no stations, nothing to print)
// → the caller falls back to its existing single-printer whole-order print. Single-printer setups
// are therefore 100% unchanged.

import apiClient from '../lib/api';
import { isElectron } from './platform';
import { printDocument } from './printBridge';
import { generateKOTHTML } from './printHtmlGenerator';

const STATIONS_CACHE_PREFIX = 'dineopen_print_stations_';

function cacheStations(restaurantId, stations) {
  try {
    if (typeof localStorage !== 'undefined' && Array.isArray(stations)) {
      localStorage.setItem(STATIONS_CACHE_PREFIX + restaurantId, JSON.stringify(stations));
    }
  } catch (_) { /* storage full / disabled — ignore, online path is unaffected */ }
}

function readCachedStations(restaurantId) {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STATIONS_CACHE_PREFIX + restaurantId);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

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

const isOffline = () => (typeof navigator !== 'undefined' && navigator.onLine === false);

/**
 * Route a KOT for `orderId` across configured print stations (Electron multi-station only).
 * @returns {Promise<{handled: boolean}>}
 */
export async function printKOTByStations({
  restaurantId,
  orderId,
  order = null,          // the local order object (needed only for the offline client-side split)
  categories = [],       // menu categories [{id,name}] — offline fallback for name→id (optional)
  restaurantName = '',   // for the offline KOT header (optional)
  printSettings = {},
  posSettings = {},
  t,
  currencySymbol = '',
  isIncremental = false,
}) {
  // Only Electron can route a job to a specific station printer. Everywhere else → caller's
  // existing single-printer path (unchanged behaviour).
  if (!restaurantId || !orderId || !isElectron()) return { handled: false };

  const kotLabels = buildKotLabels(t);
  const kotPS = { ...(printSettings || {}), showPriceOnKot: !!posSettings?.showPriceOnKot, currencySymbol };

  // ─────────────────────────────────────────────────────────────────────────────
  // OFFLINE PATH — only when the browser reports no network. Does NOT run when online.
  // ─────────────────────────────────────────────────────────────────────────────
  if (isOffline()) {
    return printOfflineStationSplit({ restaurantId, order, categories, restaurantName, kotPS, kotLabels });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ONLINE PATH — server-rendered, identical to the dashboard billing KOT split.
  // (Unchanged except for a fire-and-forget cache write so the offline path has config.)
  // ─────────────────────────────────────────────────────────────────────────────
  let stations;
  try {
    const res = await apiClient.getPrintStations(restaurantId);
    stations = (res?.printStations || []).filter((s) => s.enabled);
    cacheStations(restaurantId, res?.printStations || []); // harmless; enables the offline path later
  } catch (e) {
    // Exactly the original behaviour: on failure, let the caller print the combined KOT.
    // (The client-side split runs ONLY when navigator reports offline — see the guard above.)
    return { handled: false };
  }
  if (!stations || stations.length === 0) return { handled: false }; // single-printer setup

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
    console.warn('[printKOTByStations] online station split failed:', e?.message);
    return { handled: printedAny };
  }
  return { handled: printedAny };
}

// ─────────────────────────────────────────────────────────────────────────────
// Offline client-side split. Replicates the backend's belongsToStation logic
// (index.js /api/kot/render) using cached station config + the local order items.
// ─────────────────────────────────────────────────────────────────────────────
async function printOfflineStationSplit({ restaurantId, order, categories, restaurantName, kotPS, kotLabels }) {
  const cached = readCachedStations(restaurantId);
  const stations = (cached || []).filter((s) => s.enabled);
  // No cached station config or no order items → let the caller print the combined KOT (works offline).
  if (!order || !Array.isArray(order.items) || order.items.length === 0 || stations.length === 0) {
    return { handled: false };
  }

  // KOT exclusion (same fields the dashboard tables view applies), best-effort offline.
  let baseItems = order.items;
  if (kotPS.kotExclusionEnabled) {
    const exCats = new Set(kotPS.kotExcludedCategories || []);
    const exIds = new Set(kotPS.kotExcludedItemIds || []);
    if (exCats.size || exIds.size) {
      baseItems = baseItems.filter((it) => !exIds.has(it.id || it.menuItemId) && !exCats.has(it.categoryId));
    }
  }
  if (baseItems.length === 0) return { handled: false };

  // name→id fallback for items that only carry a category name (mirrors backend nameToId).
  const nameToId = {};
  for (const cat of (categories || [])) {
    if (cat?.name) nameToId[cat.name.toLowerCase().trim()] = cat.id;
  }
  const allAssignedCatIds = new Set();
  for (const s of stations) for (const cId of (s.categoryIds || [])) allAssignedCatIds.add(cId);
  const catOf = (item) => item.categoryId || nameToId[item.category?.toLowerCase?.().trim?.()] || item.category;
  const belongsTo = (item, station) => {
    const catId = catOf(item);
    if ((station.categoryIds || []).includes(catId)) return true;
    if (station.isDefault && !allAssignedCatIds.has(catId)) return true;
    return false;
  };

  const now = new Date();
  const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formattedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const buildKotData = (items, station) => ({
    id: order.id,
    orderId: order.id,
    kotId: `KOT-${String(order.id || '').slice(-6).toUpperCase()}`,
    dailyOrderId: order.dailyOrderId || null,
    orderNumberDisplay: order.orderNumberDisplay || null,
    orderNumber: order.orderNumber || null,
    tableNumber: order.tableNumber || '',
    floorName: order.floorName || '',
    roomNumber: order.roomNumber || '',
    orderType: order.orderType || 'dine-in',
    items,
    removedItems: [],
    notes: order.notes || '',
    specialInstructions: order.specialInstructions || '',
    staffInfo: order.staffInfo || null,
    customerName: order.customerDisplay?.name || order.customerInfo?.name || order.customerName || '',
    createdAt: order.createdAt || null,
    formattedDate,
    formattedTime,
    isReprint: true,
    isIncremental: false,
    printStationId: station ? station.id : null,
    printStationName: station ? station.name : null,
    currencySymbol: kotPS.currencySymbol || '',
    restaurantName: restaurantName || order.restaurantName || '',
    covers: order.covers || 1,
  });

  let printedAny = false;
  const hasDefaultStation = stations.some((s) => s.isDefault);
  try {
    for (const station of stations) {
      const items = baseItems.filter((it) => belongsTo(it, station));
      if (items.length === 0) continue;
      const html = generateKOTHTML(buildKotData(items, station), kotPS, kotLabels);
      if (html) {
        await printDocument({ html, type: 'kot', orderId: `${order.id}-${station.id}`, stationId: station.id, restaurantId, printSettings: kotPS });
        printedAny = true;
      }
    }
    // No default station → print unassigned-category items to the default printer (no stationId).
    if (!hasDefaultStation) {
      const leftovers = baseItems.filter((it) => !allAssignedCatIds.has(catOf(it)));
      if (leftovers.length > 0) {
        const html = generateKOTHTML(buildKotData(leftovers, null), kotPS, kotLabels);
        if (html) {
          await printDocument({ html, type: 'kot', orderId: `${order.id}-default`, restaurantId, printSettings: kotPS });
          printedAny = true;
        }
      }
    }
  } catch (e) {
    console.warn('[printKOTByStations] offline station split failed:', e?.message);
    return { handled: printedAny };
  }
  return { handled: printedAny };
}
