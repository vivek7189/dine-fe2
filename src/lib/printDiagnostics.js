// Print diagnostics telemetry (Electron desktop only).
//
// The Electron main process emits a `print-diag` record for every print attempt
// (see electron/main.js `logPrintEvent`). This module listens for those records
// and POSTs FAILURES to the backend `/api/print-diagnostics` endpoint so print
// issues can be diagnosed remotely by restaurantId — no site visit, no asking a
// non-technical customer to send a log file.
//
// Safety: this is a passive side-channel. It never runs in the print path, only
// sends on failure, and every step is wrapped so a telemetry error can never
// affect the POS or printing. The handler in main.js still returns success:true
// to the app regardless, so this introduces no new user-facing "failed" toasts.

import apiClient from './api';

const TERMINAL_ID_KEY = 'dinePrintTerminalId';
let _initialized = false;
let _unsubscribe = null;

function getTerminalId() {
  try {
    // Reuse the FCM web device id if present so a terminal has one stable id.
    let id = localStorage.getItem('fcmWebDeviceId') || localStorage.getItem(TERMINAL_ID_KEY);
    if (!id) {
      id = `pos-${(crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
      localStorage.setItem(TERMINAL_ID_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

function getRestaurantId() {
  try {
    const raw = localStorage.getItem('selectedRestaurant');
    if (raw) {
      const r = JSON.parse(raw);
      if (r && r.id) return r.id;
    }
  } catch { /* ignore */ }
  return null;
}

async function sendDiag(rec) {
  try {
    // Failures only — a working restaurant sends ~nothing (keeps volume tiny).
    if (!rec || rec.success !== false) return;
    const restaurantId = getRestaurantId();
    if (!restaurantId) return; // nothing to key on
    const base = apiClient?.baseURL || process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;

    // Fire-and-forget; short timeout so a slow/offline network can't pile up.
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 6000) : null;
    await fetch(`${base}/api/print-diagnostics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId, terminalId: getTerminalId(), event: rec }),
      signal: controller ? controller.signal : undefined,
      keepalive: true,
    }).catch(() => {});
    if (timer) clearTimeout(timer);
  } catch {
    // Telemetry must never throw into the caller.
  }
}

/**
 * Register the print-diag listener once. Safe to call repeatedly (idempotent)
 * and on non-Electron platforms (it no-ops).
 */
export function initPrintDiagnostics() {
  if (_initialized) return;
  if (typeof window === 'undefined') return;
  const api = window.electronAPI;
  if (!api || typeof api.onPrintDiag !== 'function') return; // not Electron
  try {
    _unsubscribe = api.onPrintDiag((rec) => { sendDiag(rec); });
    _initialized = true;
  } catch { /* ignore */ }
}

export function stopPrintDiagnostics() {
  try { if (_unsubscribe) _unsubscribe(); } catch { /* ignore */ }
  _unsubscribe = null;
  _initialized = false;
}
