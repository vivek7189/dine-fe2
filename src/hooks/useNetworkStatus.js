'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getApiBase } from '@/lib/apiBase';
import { isLocalServerMode, getLocalServerUrl } from '../lib/localServer';

/**
 * Network status hook — no polling, no constant pinging.
 *
 * Strategy:
 * 1. Listen to browser online/offline events (fast for most cases)
 * 2. Expose reportOffline()/reportOnline() for the API client to call
 *    when requests fail/succeed — this is the real source of truth
 * 3. When browser says "back online", verify with one ping before trusting
 *
 * This avoids constant /health polling while still detecting offline correctly.
 */

const API_BASE_URL = getApiBase();

// Global state so multiple hook instances share the same status.
// In local-server (offline LAN) mode "online" means "the LAN backend is reachable", which is
// unrelated to the OS internet flag — so we start optimistic (true) and let the first LAN
// request result (reportNetworkFailure/Success) be the real source of truth.
let globalIsOnline = isLocalServerMode()
  ? true
  : (typeof navigator !== 'undefined' ? navigator.onLine : true);
let globalListeners = [];

function notifyGlobalListeners() {
  globalListeners.forEach(fn => fn(globalIsOnline));
}

// Called by API client when a request fails with network error
export function reportNetworkFailure() {
  if (globalIsOnline) {
    globalIsOnline = false;
    notifyGlobalListeners();
  }
}

// Called by API client when a request succeeds
export function reportNetworkSuccess() {
  if (!globalIsOnline) {
    globalIsOnline = true;
    notifyGlobalListeners();
  }
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(globalIsOnline);
  const [lastOnlineAt, setLastOnlineAt] = useState(Date.now());
  const [networkTransition, setNetworkTransition] = useState(null);
  const prevOnlineRef = useRef(globalIsOnline);

  const updateStatus = useCallback((online) => {
    const wasOnline = prevOnlineRef.current;
    if (online !== wasOnline) {
      prevOnlineRef.current = online;
      setIsOnline(online);
      if (online) {
        setLastOnlineAt(Date.now());
        setNetworkTransition('went_online');
      } else {
        setNetworkTransition('went_offline');
      }
    }
  }, []);

  useEffect(() => {
    // Subscribe to global status changes (from API client reports)
    const handleGlobalChange = (online) => {
      updateStatus(online);
    };
    globalListeners.push(handleGlobalChange);

    // Browser events
    const handleOffline = () => {
      // In local-server mode the OS "offline" event (no internet) does NOT mean the LAN backend
      // is unreachable — ignore it and let a real failed LAN request flip the flag instead.
      if (isLocalServerMode()) return;
      globalIsOnline = false;
      updateStatus(false);
    };

    const handleOnline = async () => {
      // Browser says online — verify with one ping before trusting. In local-server mode ping the
      // LAN backend (the cloud host is unreachable offline and would falsely fail the check).
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const pingBase = (isLocalServerMode() && getLocalServerUrl()) || API_BASE_URL;
        const resp = await fetch(`${pingBase}/api/health`, {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (resp.ok) {
          globalIsOnline = true;
          updateStatus(true);
        }
      } catch {
        // Ping failed — don't trust the browser event
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync with current global state on mount
    updateStatus(globalIsOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      globalListeners = globalListeners.filter(fn => fn !== handleGlobalChange);
    };
  }, [updateStatus]);

  const clearTransition = useCallback(() => {
    setNetworkTransition(null);
  }, []);

  return { isOnline, lastOnlineAt, networkTransition, clearTransition };
}
