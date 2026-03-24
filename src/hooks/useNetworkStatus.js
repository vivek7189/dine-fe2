'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

/**
 * Enhanced network status hook.
 * Uses navigator.onLine as fast signal + active ping to backend every 8s.
 * navigator.onLine is unreliable on Mac (reports true even with WiFi off
 * if other interfaces like Bluetooth exist), so we verify with a real fetch.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [lastOnlineAt, setLastOnlineAt] = useState(Date.now());
  const [networkTransition, setNetworkTransition] = useState(null);
  const prevOnlineRef = useRef(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const pollTimerRef = useRef(null);

  const updateOnlineStatus = useCallback((online) => {
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

  // Active ping — fetch backend health endpoint
  const pingServer = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const resp = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'HEAD',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return resp.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Fast signal from browser events
    const handleOnline = () => {
      // Browser says online — verify with ping before trusting
      pingServer().then(reachable => {
        updateOnlineStatus(reachable);
      });
    };

    const handleOffline = () => {
      updateOnlineStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Active polling every 8s — the real source of truth
    const poll = async () => {
      if (!navigator.onLine) {
        updateOnlineStatus(false);
        return;
      }
      const reachable = await pingServer();
      updateOnlineStatus(reachable);
    };

    // Initial check
    poll();

    pollTimerRef.current = setInterval(poll, 8000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [updateOnlineStatus, pingServer]);

  const clearTransition = useCallback(() => {
    setNetworkTransition(null);
  }, []);

  return { isOnline, lastOnlineAt, networkTransition, clearTransition };
}
