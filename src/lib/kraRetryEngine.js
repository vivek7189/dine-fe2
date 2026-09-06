'use client';

/**
 * Kenya KRA eTIMS — background retry engine (renderer singleton).
 *
 * Store-and-forward safety net. A sale the local VSCU couldn't sign at bill time is left
 * "prepared but unsigned" on the server (order.etims.pendingInvcNo set, no rcptSign). This engine
 * periodically pulls that work-list (GET /api/etims/:id/pending) and re-drives fiscaliseOrder()
 * — which is idempotent (the backend no-ops if already signed, so no duplicate KRA invoice) — so
 * unreported sales self-heal when the VSCU recovers, WITHOUT ever blocking the cashier.
 *
 * A circuit breaker stops hammering a down VSCU and drives the health banner. Only VSCU-DOWN
 * failures (timeout/refused/relay) trip it; a single order's data/KRA reject just skips that order.
 * Cashier-skipped bills have no order.etims, so they are never in the work-list (choice honored).
 *
 * Pure module singleton (no React import). The hook (useKraRetryQueue) drives runKraRetryOnce() on
 * triggers; the health banner subscribes to snapshots via subscribeKraStatus().
 */

const COOLDOWNS = [2 * 60 * 1000, 5 * 60 * 1000, 10 * 60 * 1000]; // escalating open-circuit cooldowns
const OPEN_AFTER_FAILS = 2;   // consecutive VSCU-down failures before opening the circuit
const PER_RUN_MAX = 25;       // cap orders processed per cycle (keeps a cycle bounded)

let state = {
  circuit: 'closed',          // 'closed' | 'open' | 'half_open'
  consecutiveFails: 0,
  cooldownIdx: 0,
  openedAt: 0,
  running: false,
  pending: 0,
  oldestPendingAt: null,      // ms epoch of oldest pending order (for the 24h-cutoff escalation)
  lastSuccessAt: null,        // ms epoch of last successful fiscalisation
  lastRunAt: null,
  lastError: null,
};

const listeners = new Set();
const snapshot = () => ({ ...state });
function notify() { const s = snapshot(); listeners.forEach(fn => { try { fn(s); } catch (_) {} }); }

export function subscribeKraStatus(fn) {
  listeners.add(fn);
  try { fn(snapshot()); } catch (_) {}
  return () => listeners.delete(fn);
}
export function getKraStatus() { return snapshot(); }

function toMs(v) {
  try {
    if (!v) return 0;
    if (typeof v === 'number') return v;
    if (v._seconds) return v._seconds * 1000;
    if (v.toDate) return v.toDate().getTime();
    return new Date(v).getTime() || 0;
  } catch { return 0; }
}

// A "VSCU is down / unreachable" failure (vs a one-off data/KRA reject). Only these trip the
// circuit — a single order's data reject must not stop the whole queue.
function isVscuDownError(msg) {
  const m = String(msg || '').toLowerCase();
  return /timed out|timeout|could not reach|refused|econnrefused|vscu|relay|network|bridge|unreachable/.test(m);
}

function circuitAllowsRun(now) {
  if (state.circuit !== 'open') return true;
  const cd = COOLDOWNS[Math.min(state.cooldownIdx, COOLDOWNS.length - 1)];
  if (now - state.openedAt >= cd) { state.circuit = 'half_open'; return true; } // allow one probe
  return false;
}

/**
 * Run one retry cycle. Deps injected so the module stays free of import cycles:
 *   { restaurantId, apiClient, fiscaliseOrder, force }
 * force=true (manual "Retry now") bypasses the cooldown.
 */
export async function runKraRetryOnce({ restaurantId, apiClient, fiscaliseOrder, force = false }) {
  if (!restaurantId || !apiClient || typeof fiscaliseOrder !== 'function') return;
  if (state.running) return;
  const now = Date.now();
  if (!force && !circuitAllowsRun(now)) return;
  if (force) state.circuit = 'half_open';

  state.running = true; state.lastRunAt = now; notify();
  try {
    let res;
    try {
      res = await apiClient.request(`/api/etims/${restaurantId}/pending`, { method: 'GET' });
    } catch (e) {
      // Couldn't even fetch the work-list (cloud/network) — leave the circuit alone (it's for VSCU).
      state.lastError = e?.message || 'pending fetch failed';
      state.running = false; notify(); return;
    }
    const items = (res && res.items) || [];
    state.pending = items.length;
    state.oldestPendingAt = items.length ? (toMs(items[0].preparedAt) || null) : null;
    if (!items.length) {
      // Nothing pending → healthy. Close the circuit.
      state.circuit = 'closed'; state.consecutiveFails = 0; state.cooldownIdx = 0; state.lastError = null;
      state.running = false; notify(); return;
    }
    let processed = 0;
    for (const it of items) {
      if (processed >= PER_RUN_MAX) break;
      processed++;
      try {
        const r = await fiscaliseOrder(restaurantId, it.orderId);
        if (r && r.skipped) break; // not the desktop / not capable — nothing we can do here
        // success (signed now, or already signed)
        state.consecutiveFails = 0; state.cooldownIdx = 0; state.circuit = 'closed';
        state.lastSuccessAt = Date.now(); state.lastError = null;
        state.pending = Math.max(0, state.pending - 1);
        notify();
      } catch (e) {
        const msg = e?.message || 'fiscalise failed';
        state.lastError = msg;
        if (isVscuDownError(msg)) {
          state.consecutiveFails++;
          if (state.consecutiveFails >= OPEN_AFTER_FAILS) {
            // VSCU is down — open the circuit, back off, stop this cycle (don't hammer a dead unit).
            state.circuit = 'open';
            state.openedAt = Date.now();
            state.cooldownIdx = Math.min(state.cooldownIdx + 1, COOLDOWNS.length - 1);
            notify();
            break;
          }
        }
        // data/KRA reject for this one order → skip it, keep processing the rest.
        notify();
      }
    }
  } finally {
    state.running = false; notify();
  }
}
