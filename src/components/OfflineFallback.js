'use client';

/**
 * OfflineFallback — DEBOUNCED connectivity reconciler for the local-server POS app (Phase 0).
 *
 * Routing follows REAL cloud reachability (probed), with HYSTERESIS so a flaky connection can't
 * thrash the app:
 *   • cloud reachable, stable   → ONLINE  → cloud (whole account, like the web)
 *   • cloud unreachable, stable  → OFFLINE → the co-located local server (bound restaurant keeps working)
 *
 * A brief 2–3s flap is IGNORED — we switch only after the new state has held for STABLE_MS (a
 * dead-band). navigator online/offline events just nudge us to probe sooner; the probe
 * (GET <cloud>/api/health) is the source of truth, because navigator.onLine lies inside Electron.
 * A switch still reloads once (clean socket/hook re-init), but only on a SUSTAINED change — never
 * per flap. So dropping Wi-Fi repeatedly no longer reloads the app over and over.
 *
 * GATING: self-hides on plain web / the cloud Electron app (isServerApp gate) → ZERO effect there.
 * Routing math (getApiBase / api.js) is untouched; this only changes the *timing* of the pin switch.
 * Publishes window.__dineConnState { mode, cloudUp, pending } (+ a 'dine-conn' event) for SyncStatusDot.
 */
import { useEffect, useRef } from 'react';
import apiClient from '../lib/api';
import { isServerApp, getLocalServerUrl, setLocalServerUrl } from '../lib/localServer';
import { reconnectLan } from '../lib/lanRealtime';

const LOOPBACK = 'http://127.0.0.1:3003';
const PROBE_INTERVAL_MS = 5000;   // how often we check reachability
const STABLE_MS = 10000;          // the new state must hold this long before we switch (dead-band)
const PROBE_TIMEOUT_MS = 3000;

// The cloud to probe = the SAME backend getApiBase() uses online: the per-user pin (this account's
// real backend, e.g. GCP) when it's a real cloud URL, else the Postgres/GCP default. Never loopback.
function cloudTarget() {
  try {
    const pin = window.localStorage.getItem('dineopen_backend_url');
    if (pin && !/127\.0\.0\.1|localhost|\.local|:3003/.test(pin)) return pin.replace(/\/+$/, '');
  } catch (_) {}
  return (process.env.NEXT_PUBLIC_PG_API_URL || 'https://34-93-129-104.sslip.io').replace(/\/+$/, '');
}

async function reachable(url, ms) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    const r = await fetch(`${url}/api/health`, { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(t);
    return r.ok;
  } catch { return false; }
}

function publish(state) {
  try { window.__dineConnState = state; window.dispatchEvent(new Event('dine-conn')); } catch (_) {}
}

export default function OfflineFallback() {
  const switching = useRef(false);
  const candidate = useRef({ state: null, since: 0 }); // the raw state we're debouncing toward

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isInstalledApp = !!window.electronAPI || !!window.Capacitor;
    if (!isInstalledApp || !isServerApp()) return; // cloud app / web: no-op

    let stopped = false;

    const commit = async (toOffline) => {
      if (switching.current) return;
      switching.current = true;
      try {
        if (toOffline) {
          // Only adopt local if the co-located server is actually up (don't strand on a dead pin).
          if ((await reachable(LOOPBACK, 1500)) && getLocalServerUrl() !== LOOPBACK) {
            console.log('[OfflineFallback] sustained offline → local server');
            setLocalServerUrl(LOOPBACK);
            apiClient.setLocalServer(LOOPBACK);
            try { reconnectLan(); } catch (_) {}
            window.location.reload();
          }
        } else if (getLocalServerUrl()) {
          console.log('[OfflineFallback] sustained online → cloud');
          setLocalServerUrl(null);
          apiClient.setLocalServer(null);
          try { reconnectLan(); } catch (_) {}
          window.location.reload();
        }
      } finally { switching.current = false; }
    };

    const tick = async () => {
      if (stopped || switching.current) return;
      const committedState = getLocalServerUrl() ? 'offline' : 'online';
      const cloudUp = await reachable(cloudTarget(), PROBE_TIMEOUT_MS);
      const rawState = cloudUp ? 'online' : 'offline';

      if (rawState === committedState) {
        candidate.current = { state: null, since: 0 };
        publish({ mode: committedState, cloudUp, pending: null });
        return;
      }
      // Reality differs from our current mode → run the hysteresis timer before switching.
      const now = Date.now();
      if (candidate.current.state !== rawState) candidate.current = { state: rawState, since: now };
      publish({ mode: committedState, cloudUp, pending: rawState });
      if (now - candidate.current.since >= STABLE_MS) {
        candidate.current = { state: null, since: 0 };
        await commit(rawState === 'offline');
      }
    };

    tick(); // initial read
    const id = setInterval(tick, PROBE_INTERVAL_MS);
    const nudge = () => { tick(); }; // OS event → probe sooner (still debounced by the same logic)
    window.addEventListener('online', nudge);
    window.addEventListener('offline', nudge);
    return () => {
      stopped = true;
      clearInterval(id);
      window.removeEventListener('online', nudge);
      window.removeEventListener('offline', nudge);
    };
  }, []);

  return null;
}
