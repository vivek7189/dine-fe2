'use client';
/**
 * Stable, unique per-device terminal id — used to designate a "Main terminal"
 * for multi-terminal KOT printing (prevents duplicate prints across terminals).
 *
 * Resolution order (all persistent, so the id is stable across restarts):
 *   1. Electron's own terminal id (electronAPI.getTerminalId → dineopen-settings.json).
 *      Preferred: it's the same id the desktop app uses everywhere else.
 *   2. localStorage fallback (a random UUID). This makes the feature work even on
 *      builds whose preload didn't expose getTerminalId (the v1.14.146 bug), and on
 *      web/other native shells — so the "Main terminal" designation never silently
 *      breaks again.
 *
 * The id is cached in-module after first resolve so every caller agrees.
 */

const LS_KEY = 'dineopen_terminal_id';
let cached = null;

function uuid() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch { /* noop */ }
  // Fallback UUID v4-ish (only if crypto.randomUUID is unavailable).
  return 'tid-xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.floor((Date.now() + performance.now()) * 16) + Math.floor(Math.random() * 16)) % 16;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function localFallbackId() {
  if (typeof window === 'undefined') return null;
  try {
    let id = window.localStorage.getItem(LS_KEY);
    if (!id) { id = uuid(); window.localStorage.setItem(LS_KEY, id); }
    return id;
  } catch { return null; }
}

/**
 * @returns {Promise<string|null>} the stable terminal id (null only in SSR).
 */
export async function getStableTerminalId() {
  if (cached) return cached;
  // Prefer the Electron-native persistent id. Try both bridges: the top-level
  // getTerminalId AND the LAN-hub one (the latter is exposed even on builds whose
  // top-level preload missed getTerminalId — the v1.14.146 bug — so we still get
  // the REAL device id, matching what the Terminals & LAN tab shows).
  const sources = [];
  if (typeof window !== 'undefined' && window.electronAPI) {
    if (typeof window.electronAPI.getTerminalId === 'function') sources.push(() => window.electronAPI.getTerminalId());
    if (window.electronAPI.lanHub && typeof window.electronAPI.lanHub.getTerminalId === 'function') sources.push(() => window.electronAPI.lanHub.getTerminalId());
  }
  for (const get of sources) {
    try {
      const id = await get();
      if (id) {
        cached = String(id);
        try { window.localStorage.setItem(LS_KEY, cached); } catch { /* noop */ }
        return cached;
      }
    } catch { /* try next source */ }
  }
  cached = localFallbackId();
  return cached;
}

/** Synchronous best-effort (returns the cached/local id, may be null before first async resolve). */
export function getStableTerminalIdSync() {
  if (cached) return cached;
  const id = localFallbackId();
  if (id) cached = id;
  return cached;
}

// ── Per-terminal print roles (multi-terminal duplicate prevention) ──────────────
// Two LOCAL, per-device switches deciding what THIS terminal auto-prints:
//   printKot  — kitchen tickets (orders, incl. QR/online/waiter)
//   printBill — bills / receipts (and cash drawer)
// Default BOTH true → the terminal prints everything, exactly like today. So a
// single terminal, and any terminal nobody has reconfigured, is 100% unchanged.
// With several terminals, the owner turns a type OFF on the terminals that
// shouldn't print it (e.g. KOT off on the cashier) → no duplicate. Stored in
// localStorage (per device, survives restarts, works offline, no server needed).
const ROLE_KOT = 'dineopen_terminal_print_kot';
const ROLE_BILL = 'dineopen_terminal_print_bill';

/** @returns {{printKot:boolean, printBill:boolean}} — default both true; fail-open on any error. */
export function getTerminalPrintRoles() {
  if (typeof window === 'undefined') return { printKot: true, printBill: true };
  try {
    return {
      printKot: window.localStorage.getItem(ROLE_KOT) !== '0',   // only an explicit '0' turns it off
      printBill: window.localStorage.getItem(ROLE_BILL) !== '0',
    };
  } catch { return { printKot: true, printBill: true }; }
}

export function setTerminalPrintRole(type, on) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(type === 'bill' ? ROLE_BILL : ROLE_KOT, on ? '1' : '0'); } catch { /* noop */ }
}
