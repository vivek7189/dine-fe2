'use client';

/**
 * useKraRetryQueue — drives the KRA eTIMS background retry engine while the POS is open.
 *
 * No-op unless the store is Kenya + eTIMS enabled + on the desktop app (etimsActiveFor). Triggers a
 * retry cycle on mount, on network 'online', and every few minutes (one singleton timer regardless
 * of how many times the hook mounts). Returns the live status + manual actions for the health banner.
 *
 * Mounted once in (dashboard)/layout.js so it runs on every POS page. Never blocks anything.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { etimsActiveFor } from '../lib/etimsDecision';
import { subscribeKraStatus, runKraRetryOnce, getKraStatus } from '../lib/kraRetryEngine';

const INTERVAL_MS = 3 * 60 * 1000; // sweep cadence
let _timer = null;                 // module singleton timer
let _mounts = 0;

export function useKraRetryQueue(restaurant, restaurantId, apiClient) {
  const active = !!(etimsActiveFor(restaurant) && restaurantId);
  const [status, setStatus] = useState(getKraStatus());
  const depsRef = useRef({ restaurantId, apiClient });
  depsRef.current = { restaurantId, apiClient };

  const trigger = useCallback((force = false) => {
    const { restaurantId: rid, apiClient: ac } = depsRef.current;
    if (!rid || !ac) return;
    // Lazy import so this hook never pulls the eTIMS/electron code on non-Kenya bundles.
    import('../lib/etims')
      .then(({ fiscaliseOrder, fiscaliseCreditNote }) => runKraRetryOnce({ restaurantId: rid, apiClient: ac, fiscaliseOrder, fiscaliseCreditNote, force }))
      .catch(() => {});
  }, []);

  const testConnection = useCallback(async () => {
    const { restaurantId: rid } = depsRef.current;
    if (!rid) return null;
    const { testEtimsConnection } = await import('../lib/etims');
    return testEtimsConnection(rid);
  }, []);

  // Subscribe to engine snapshots for the banner.
  useEffect(() => {
    if (!active) return undefined;
    return subscribeKraStatus(setStatus);
  }, [active]);

  // Triggers: delayed initial sweep, network 'online', singleton interval.
  useEffect(() => {
    if (!active) return undefined;
    _mounts++;
    const onOnline = () => trigger(false);
    window.addEventListener('online', onOnline);
    const t0 = setTimeout(() => trigger(false), 4000);
    if (!_timer) _timer = setInterval(() => trigger(false), INTERVAL_MS);
    return () => {
      window.removeEventListener('online', onOnline);
      clearTimeout(t0);
      _mounts = Math.max(0, _mounts - 1);
      if (_mounts === 0 && _timer) { clearInterval(_timer); _timer = null; }
    };
  }, [active, trigger]);

  return { active, status, retryNow: () => trigger(true), testConnection };
}
