'use client';

/**
 * Kenya KRA eTIMS — renderer-side orchestration (Electron desktop only).
 *
 * The backend builds the exact KRA payloads; the Electron main process relays
 * them to the local VSCU; the backend stores the signed result. This module is
 * the glue for the two flows: device initialisation and per-sale fiscalisation.
 *
 * Everything here is a no-op unless running inside the Electron desktop app with
 * the eTIMS relay available. Non-Kenya stores never call it (callers gate on the
 * store's country), and the backend also enforces isKenya on every route.
 */

import apiClient from './api';

/** True only inside the Electron desktop app with the VSCU relay bridge. */
export function isEtimsCapable() {
  return typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.etimsRelay === 'function';
}

/**
 * Initialise the KRA device via the local VSCU (one-off, from admin settings).
 * @returns {Promise<{sdcId, mrcNo, lastInvcNo}>}
 */
export async function initEtimsDevice(restaurantId) {
  if (!isEtimsCapable()) throw new Error('eTIMS device setup must be done from the DineOpen desktop app.');
  const prep = await apiClient.request(`/api/etims/${restaurantId}/init-payload`);
  const relayRes = await window.electronAPI.etimsRelay({ url: prep.vscuUrl, path: prep.path, body: prep.body });
  if (!relayRes || !relayRes.ok) throw new Error((relayRes && relayRes.error) || 'Could not reach the VSCU.');
  const conf = await apiClient.request(`/api/etims/${restaurantId}/init-result`, { method: 'POST', body: relayRes.data || relayRes });
  return conf.device;
}

/**
 * Register all active menu items with KRA (saveItems). Relays each item to the
 * local VSCU one by one and reports how many succeeded/failed. Desktop only.
 * @returns {Promise<{ok:number, failed:number, total:number}>}
 */
export async function syncEtimsItems(restaurantId, onProgress) {
  if (!isEtimsCapable()) throw new Error('Item sync must be done from the DineOpen desktop app.');
  const prep = await apiClient.request(`/api/etims/${restaurantId}/prepare-items`, { method: 'POST', body: {} });
  const items = prep.items || [];
  let ok = 0, failed = 0;
  for (let i = 0; i < items.length; i++) {
    try {
      const relayRes = await window.electronAPI.etimsRelay({ url: prep.vscuUrl, path: prep.path, body: items[i] });
      const rc = relayRes && relayRes.data && (relayRes.data.resultCd || (relayRes.data.data && relayRes.data.data.resultCd));
      if (relayRes && relayRes.ok && (rc === '000' || rc === undefined)) ok++; else failed++;
    } catch { failed++; }
    if (onProgress) onProgress({ done: i + 1, total: items.length, ok, failed });
  }
  try { await apiClient.request(`/api/etims/${restaurantId}/items-result`, { method: 'POST', body: { ok, failed } }); } catch { /* advisory */ }
  return { ok, failed, total: items.length };
}

/**
 * Fiscalise a completed order: prepare → relay to VSCU → confirm/store. Returns
 * the eTIMS record (rcptSign, intrlData, sdcId, mrcNo…) to print on the receipt.
 * Safe to call more than once — the backend is idempotent per order.
 *
 * Never throws for a non-capable environment — returns { skipped } so the normal
 * bill/print flow is never blocked. A real fiscalisation error IS thrown so the
 * caller can surface it (a Kenya sale legally must be fiscalised).
 */
export async function fiscaliseOrder(restaurantId, orderId) {
  if (!isEtimsCapable()) return { skipped: 'not-desktop' };
  const prep = await apiClient.request(`/api/etims/${restaurantId}/prepare-sale`, { method: 'POST', body: { orderId } });
  if (prep.alreadyFiscalised) return { etims: prep.etims };
  const relayRes = await window.electronAPI.etimsRelay({ url: prep.vscuUrl, path: prep.path, body: prep.body });
  if (!relayRes || !relayRes.ok) throw new Error((relayRes && relayRes.error) || 'Could not reach the VSCU.');
  const conf = await apiClient.request(`/api/etims/${restaurantId}/confirm-sale`, {
    method: 'POST',
    body: { orderId, invcNo: prep.body && prep.body.invcNo, vscuResponse: relayRes.data || relayRes },
  });
  return { etims: conf.etims };
}
