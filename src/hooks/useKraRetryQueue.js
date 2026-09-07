'use client';

/**
 * useKraRetryQueue — drives the KRA eTIMS background retry worker while the POS is open.
 *
 * Event-driven + adaptive backoff (the industry-standard fiscal-outbox pattern), NOT a fixed poll:
 *   • runs a cycle on a bill-time fiscalisation FAILURE (`kra:retry` window event) and on
 *     connectivity restored (`online`) — so recovery is immediate when something actually fails;
 *   • between events, the next delay ADAPTS to the outcome (nextDelayMs): ~20 min when all-clear,
 *     ~30 s while draining a backlog, exponential backoff (1→2→5→10 min) when stuck/VSCU-down —
 *     so a healthy store barely touches the server.
 *
 * OFFLINE / LOCAL-SERVER: this worker deliberately does NOT gate on navigator.onLine. The VSCU is
 * LOCAL and signs offline, and in the local-server (unified) app `/pending` + confirm hit the
 * bundled local backend — so fiscalisation must keep retrying even with no internet. The `online`
 * event is only an EXTRA trigger, never a requirement.
 *
 * No-op unless the store is Kenya + eTIMS enabled + on the desktop app (etimsActiveFor). One
 * singleton scheduler regardless of how many times the hook mounts. Mounted once in the dashboard
 * layout. Never blocks anything.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { etimsActiveFor } from '../lib/etimsDecision';
import { subscribeKraStatus, runKraRetryOnce, getKraStatus, nextDelayMs } from '../lib/kraRetryEngine';

// ── Module singletons: one scheduler + backoff counter shared across all mounts. ──
let _timer = null;
let _backoffIdx = 0;
let _mounts = 0;
let _runRef = null;        // latest runCycle(force) → Promise<outcome>

function clearTimer() { if (_timer) { clearTimeout(_timer); _timer = null; } }

// Run one cycle, then reschedule the NEXT one based on its outcome (adaptive backoff).
async function runAndReschedule(force = false) {
  clearTimer();
  if (!_runRef) return;
  const outcome = await _runRef(force);
  // Back off when the VSCU is down or the backlog is stuck (no progress); reset otherwise.
  const stuck = !!(outcome && (outcome.circuitOpen || (outcome.pending > 0 && !outcome.progressed)));
  _backoffIdx = stuck ? Math.min(_backoffIdx + 1, 4) : 0;
  const delay = nextDelayMs(outcome, _backoffIdx);
  clearTimer();
  if (_mounts > 0) _timer = setTimeout(() => runAndReschedule(false), delay);
}

// Immediate run (bill-time failure / online / manual). The engine's single-flight guard coalesces
// overlapping pokes; this just resets the cadence to "act now".
function poke(force = false) { runAndReschedule(force); }

export function useKraRetryQueue(restaurant, restaurantId, apiClient) {
  const active = !!(etimsActiveFor(restaurant) && restaurantId);
  const [status, setStatus] = useState(getKraStatus());
  const depsRef = useRef({ restaurantId, apiClient });
  depsRef.current = { restaurantId, apiClient };

  const runCycle = useCallback(async (force = false) => {
    const { restaurantId: rid, apiClient: ac } = depsRef.current;
    if (!rid || !ac) return null;
    try {
      // Lazy import so non-Kenya bundles never pull the eTIMS/electron code.
      const { fiscaliseOrder, fiscaliseCreditNote } = await import('../lib/etims');
      return await runKraRetryOnce({ restaurantId: rid, apiClient: ac, fiscaliseOrder, fiscaliseCreditNote, force });
    } catch { return null; }
  }, []);

  const testConnection = useCallback(async () => {
    const { restaurantId: rid } = depsRef.current;
    if (!rid) return null;
    const { testEtimsConnection } = await import('../lib/etims');
    return testEtimsConnection(rid);
  }, []);

  // Subscribe to engine snapshots for the health banner.
  useEffect(() => {
    if (!active) return undefined;
    return subscribeKraStatus(setStatus);
  }, [active]);

  // Event-driven triggers + the adaptive self-rescheduling loop.
  useEffect(() => {
    if (!active) return undefined;
    _runRef = runCycle;
    _mounts++;
    const onPoke = () => poke(false);
    window.addEventListener('kra:retry', onPoke); // dispatched by a bill-time fiscalisation failure
    window.addEventListener('online', onPoke);    // extra trigger only — never a requirement (offline works)
    // First sweep shortly after load (drains any backlog left by a prior session / app restart),
    // then the loop reschedules itself adaptively.
    if (!_timer) _timer = setTimeout(() => runAndReschedule(false), 4000);
    return () => {
      window.removeEventListener('kra:retry', onPoke);
      window.removeEventListener('online', onPoke);
      _mounts = Math.max(0, _mounts - 1);
      if (_mounts === 0) { clearTimer(); _runRef = null; }
    };
  }, [active, runCycle]);

  return { active, status, retryNow: () => poke(true), testConnection };
}
