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
 * Best-effort: report an eTIMS failure to the backend diagnostics log (queryable
 * by restaurantId in the `etimsDiagnostics` collection). Used for VSCU-unreachable
 * / relay errors that fail on the renderer BEFORE ever reaching the sale routes, so
 * they'd otherwise leave no server-side trace. Never throws — telemetry must never
 * break the POS or fiscalisation.
 */
// Client context (app version + OS), gathered once and cached. Best-effort — attached to
// every diagnostic so a server-side reader knows which build/OS a store is on without asking.
let _clientCtx = null;
async function clientCtx() {
  if (_clientCtx) return _clientCtx;
  let appVersion = null, os = null;
  try { os = (typeof navigator !== 'undefined' && navigator.userAgent) ? String(navigator.userAgent).slice(0, 160) : null; } catch { /* ignore */ }
  try {
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.getVersion === 'function') {
      appVersion = await window.electronAPI.getVersion();
    }
  } catch { /* ignore */ }
  _clientCtx = { appVersion: appVersion || null, os };
  return _clientCtx;
}

export async function logEtimsDiagnostic(restaurantId, rec) {
  try {
    if (!restaurantId) return;
    const ctx = await clientCtx();
    // Merge ctx UNDER rec so an explicit field on rec always wins; purely additive.
    await apiClient.request(`/api/etims/${restaurantId}/diagnostic`, {
      method: 'POST',
      body: { appVersion: ctx.appVersion, os: ctx.os, ...(rec || {}) },
    });
  } catch { /* ignore */ }
}

/**
 * Initialise the KRA device via the local VSCU (one-off, from admin settings).
 * @returns {Promise<{sdcId, mrcNo, lastInvcNo}>}
 */
export async function initEtimsDevice(restaurantId) {
  if (!isEtimsCapable()) throw new Error('eTIMS device setup must be done from the DineOpen desktop app.');
  const prep = await apiClient.request(`/api/etims/${restaurantId}/init-payload`);
  const relayRes = await window.electronAPI.etimsRelay({ url: prep.vscuUrl, path: prep.path, body: prep.body, timeoutMs: prep.timeoutMs });
  if (!relayRes || !relayRes.ok) {
    const msg = (relayRes && relayRes.error) || 'Could not reach the VSCU.';
    logEtimsDiagnostic(restaurantId, { phase: 'init', ok: false, errorMessage: msg, raw: relayRes, errorClass: (relayRes && relayRes.errorClass) || 'RELAY_ERROR', latencyMs: relayRes && relayRes.latencyMs, vscuUrl: prep.vscuUrl, timeoutMs: prep.timeoutMs });
    throw new Error(msg);
  }
  const conf = await apiClient.request(`/api/etims/${restaurantId}/init-result`, { method: 'POST', body: relayRes.data || relayRes });
  return conf.device;
}

/**
 * Test connectivity to the local VSCU with a PURE-READ probe (selectCodeList) —
 * it never initialises the device or touches a sale, so it's safe to run anytime.
 * Desktop only. ALWAYS records the outcome (reachable / VSCU error / unreachable)
 * to the diagnostics collection so a connection problem is captured server-side
 * too. Never throws.
 * @returns {Promise<{reachable:boolean, ok:boolean, resultCd?:string|null, resultMsg?:string|null, error?:string|null}>}
 */
export async function testEtimsConnection(restaurantId) {
  if (!isEtimsCapable()) {
    return { reachable: false, ok: false, error: 'Connection test must be run from the DineOpen desktop app (the VSCU runs on this machine).' };
  }
  let prep;
  try {
    prep = await apiClient.request(`/api/etims/${restaurantId}/test-payload`);
  } catch (e) {
    return { reachable: false, ok: false, error: (e && e.message) || 'Could not prepare the connection test.' };
  }
  let relayRes;
  try {
    relayRes = await window.electronAPI.etimsRelay({ url: prep.vscuUrl, path: prep.path, body: prep.body, timeoutMs: prep.timeoutMs });
  } catch (e) {
    relayRes = { ok: false, error: (e && e.message) || 'Relay error' };
  }
  const reachable = !!(relayRes && relayRes.ok);
  const data = (relayRes && relayRes.data) || {};
  const resultCd = data.resultCd || (data.data && data.data.resultCd) || null;
  const resultMsg = data.resultMsg || (data.data && data.data.resultMsg) || null;
  const ok = reachable && (resultCd == null || String(resultCd) === '000');
  const error = reachable ? null : ((relayRes && relayRes.error) || `Could not reach the VSCU at ${prep.vscuUrl || 'the configured URL'}.`);
  // Record the test result (success or failure) so it's diagnosable remotely too.
  logEtimsDiagnostic(restaurantId, {
    phase: 'test',
    ok,
    resultCd,
    resultMsg,
    errorMessage: ok ? null : (error || (resultMsg ? `${resultMsg} (code ${resultCd})` : `VSCU returned code ${resultCd}`)),
    raw: relayRes,
    // Classify: reachable-but-KRA-rejected vs transport failure (from the relay).
    errorClass: ok ? 'OK' : (reachable ? 'KRA_REJECT' : ((relayRes && relayRes.errorClass) || 'RELAY_ERROR')),
    latencyMs: relayRes && relayRes.latencyMs,
    vscuUrl: prep.vscuUrl,
    timeoutMs: prep.timeoutMs,
  });
  return { reachable, ok, resultCd, resultMsg, error };
}

/**
 * Manually store an ALREADY-initialised device's SDC ID / MRC No. Use this when
 * the VSCU was initialised before (KRA won't re-issue the sdcId on a second init).
 * Works from web too — it just saves the identifiers; the VSCU still signs sales
 * locally with its own keys. @returns {Promise<{sdcId, mrcNo, lastInvcNo}>}
 */
export async function setEtimsDeviceManual(restaurantId, { sdcId, mrcNo, lastInvcNo }) {
  const res = await apiClient.request(`/api/etims/${restaurantId}/set-device-manual`, {
    method: 'POST',
    body: { sdcId, mrcNo, lastInvcNo },
  });
  return res.device;
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
      const relayRes = await window.electronAPI.etimsRelay({ url: prep.vscuUrl, path: prep.path, body: items[i], timeoutMs: prep.timeoutMs });
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
// A KRA "invoice number already exists" rejection — our local counter fell behind KRA's.
function isDuplicateInvoiceResult(vscu) {
  const rc = String((vscu && (vscu.resultCd || (vscu.data && vscu.data.resultCd))) || '');
  const rm = String((vscu && (vscu.resultMsg || (vscu.data && vscu.data.resultMsg))) || '');
  return rc === '924' || /invoice.*already exist|already exist.*invoice/i.test(rm);
}

export async function fiscaliseOrder(restaurantId, orderId) {
  if (!isEtimsCapable()) return { skipped: 'not-desktop' };

  // Self-healing loop: if KRA rejects the reserved invoice number as a duplicate (code 924),
  // the counter is behind KRA. We ask the backend to skip the counter forward + free this order's
  // reserved number, then re-prepare and re-sign — up to a few times — so the sale goes through
  // WITHOUT the cashier seeing an error. Bounded so a persistent problem still surfaces normally.
  const MAX_DUP_RETRIES = 4;
  let prep, invcNo, relayRes;
  for (let attempt = 0; ; attempt++) {
    prep = await apiClient.request(`/api/etims/${restaurantId}/prepare-sale`, { method: 'POST', body: { orderId } });
    if (prep.alreadyFiscalised) return { etims: prep.etims };
    invcNo = prep.body && prep.body.invcNo;
    try {
      relayRes = await window.electronAPI.etimsRelay({ url: prep.vscuUrl, path: prep.path, body: prep.body, timeoutMs: prep.timeoutMs });
    } catch (e) {
      // The relay bridge itself threw (should resolve, not reject — but be safe). Log it so a
      // "prepared but never signed" order (order.etims has pendingInvcNo only) is never invisible.
      const msg = (e && e.message) || 'Relay bridge error';
      await logEtimsDiagnostic(restaurantId, { phase: 'relay', ok: false, orderId, invcNo, errorMessage: msg, errorClass: 'BRIDGE_ERROR', vscuUrl: prep.vscuUrl, timeoutMs: prep.timeoutMs });
      throw new Error(msg);
    }
    if (!relayRes || !relayRes.ok) {
      const msg = (relayRes && relayRes.error) || 'Could not reach the VSCU.';
      // AWAIT (was fire-and-forget) so the trace survives even if the POS moves on right after.
      await logEtimsDiagnostic(restaurantId, {
        phase: 'relay', ok: false, orderId, invcNo, errorMessage: msg, raw: relayRes,
        errorClass: (relayRes && relayRes.errorClass) || 'RELAY_ERROR',
        latencyMs: relayRes && relayRes.latencyMs, vscuUrl: prep.vscuUrl, timeoutMs: prep.timeoutMs,
      });
      throw new Error(msg);
    }
    // The VSCU answered. If it rejected the number as a duplicate AND we have retries left, auto-heal:
    // skip the counter past this number, clear the order's reserved number, then loop to re-prepare.
    if (isDuplicateInvoiceResult(relayRes.data) && attempt < MAX_DUP_RETRIES) {
      const vscu = relayRes.data || {};
      await logEtimsDiagnostic(restaurantId, {
        phase: 'auto-resync', ok: false, orderId, invcNo,
        resultCd: vscu.resultCd || (vscu.data && vscu.data.resultCd) || '924',
        resultMsg: vscu.resultMsg || (vscu.data && vscu.data.resultMsg) || null,
        errorMessage: `KRA: invoice #${invcNo} already exists (924) — auto-skipping counter and retrying (attempt ${attempt + 1}/${MAX_DUP_RETRIES}).`,
        errorClass: 'AUTO_RESYNC', vscuUrl: prep.vscuUrl,
      });
      try {
        // margin grows each attempt (1,2,3,4) so a bigger gap still converges within the retry budget.
        await apiClient.request(`/api/etims/${restaurantId}/resync-counter`, { method: 'POST', body: { orderId, rejectedInvcNo: invcNo, margin: attempt + 1 } });
      } catch (re) {
        // Couldn't bump the counter — stop retrying and let confirm-sale surface the real 924 below.
        break;
      }
      continue; // re-prepare with the skipped counter → fresh invoice number
    }
    break; // signed OK, or a non-duplicate result, or out of retries → hand to confirm-sale
  }
  // Relay reached the VSCU. confirm-sale (backend) stores the signature + logs the KRA resultCd. If
  // that HTTP call itself fails (network / backend error), the order is left "prepared but unsigned"
  // (order.etims = {pendingInvcNo}) with NO signature to print — the exact state seen in the field.
  // Log it here too so the failure is captured server-side instead of vanishing silently.
  let conf;
  try {
    conf = await apiClient.request(`/api/etims/${restaurantId}/confirm-sale`, {
      method: 'POST',
      body: { orderId, invcNo, vscuResponse: relayRes.data || relayRes },
    });
  } catch (e) {
    const vscu = (relayRes && relayRes.data) || {};
    const rc = vscu.resultCd || (vscu.data && vscu.data.resultCd) || null;
    await logEtimsDiagnostic(restaurantId, {
      phase: 'confirm', ok: false, orderId, invcNo, resultCd: rc,
      resultMsg: vscu.resultMsg || (vscu.data && vscu.data.resultMsg) || null,
      errorMessage: `confirm-sale failed: ${(e && e.message) || 'unknown'}`, raw: relayRes.data || relayRes,
      errorClass: 'CONFIRM_FAILED', latencyMs: relayRes && relayRes.latencyMs, vscuUrl: prep.vscuUrl, timeoutMs: prep.timeoutMs,
    });
    throw e;
  }
  return { etims: conf.etims };
}

/**
 * Fiscalise a REFUND as a KRA Credit Note: prepare-credit-note → relay to VSCU → confirm-credit-note.
 * Returns { creditNote } (rcptSign, invcNo, orgInvcNo, qrDataUrl…) to print. Idempotent per order
 * (backend allows one credit note per order). Returns { skipped } off-desktop; throws on a real
 * VSCU/relay error so the caller can surface it. opts.rfdRsnCd = KRA §4.16 reason code (default '06').
 */
export async function fiscaliseCreditNote(restaurantId, orderId, opts = {}) {
  if (!isEtimsCapable()) return { skipped: 'not-desktop' };
  const rfdRsnCd = opts.rfdRsnCd || '06';
  const prep = await apiClient.request(`/api/etims/${restaurantId}/prepare-credit-note`, { method: 'POST', body: { orderId, rfdRsnCd } });
  if (prep.alreadyDone) return { creditNote: prep.creditNote };
  const invcNo = prep.body && prep.body.invcNo;
  let relayRes;
  try {
    relayRes = await window.electronAPI.etimsRelay({ url: prep.vscuUrl, path: prep.path, body: prep.body, timeoutMs: prep.timeoutMs });
  } catch (e) {
    const msg = (e && e.message) || 'Relay bridge error';
    await logEtimsDiagnostic(restaurantId, { phase: 'relay-credit-note', ok: false, orderId, invcNo, errorMessage: msg, errorClass: 'BRIDGE_ERROR', vscuUrl: prep.vscuUrl, timeoutMs: prep.timeoutMs });
    throw new Error(msg);
  }
  if (!relayRes || !relayRes.ok) {
    const msg = (relayRes && relayRes.error) || 'Could not reach the VSCU.';
    await logEtimsDiagnostic(restaurantId, { phase: 'relay-credit-note', ok: false, orderId, invcNo, errorMessage: msg, raw: relayRes, errorClass: (relayRes && relayRes.errorClass) || 'RELAY_ERROR', latencyMs: relayRes && relayRes.latencyMs, vscuUrl: prep.vscuUrl, timeoutMs: prep.timeoutMs });
    throw new Error(msg);
  }
  const conf = await apiClient.request(`/api/etims/${restaurantId}/confirm-credit-note`, {
    method: 'POST',
    body: { orderId, vscuResponse: relayRes.data || relayRes },
  });
  return { creditNote: conf.creditNote };
}
