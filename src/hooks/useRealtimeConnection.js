'use client';
// Realtime connection watchdog for the POS (esp. the Electron desktop terminal).
//
// The whole auto-print + live-order pipeline rides one Firebase RTDB socket. On long-running
// Electron sessions / flaky restaurant Wi-Fi that socket can silently drop and NOT come back until
// someone refreshes the page — which is exactly how KOT auto-print "stops working" on Windows.
//
// This hook watches Firebase `.info/connected` and, if the connection drops and doesn't recover on
// its own, forces a reconnect cycle (goOffline → goOnline re-opens the socket). It also sends a
// lightweight heartbeat to the server so the connection state (connected/disconnected) is visible
// remotely — you can see from the DB whether a given terminal's realtime link is alive.
import { useEffect, useRef } from 'react';
import { ref, onValue, goOffline, goOnline } from 'firebase/database';
import { database } from '../../firebase';
import apiClient from '../lib/api';

const RECONNECT_GRACE_MS = 8000;   // wait this long after a drop before forcing a reconnect
const HEARTBEAT_MIN_MS = 25000;    // throttle "connected" heartbeats to at most one per 25s

export default function useRealtimeConnection(restaurantId) {
  const reconnectTimer = useRef(null);
  const lastBeat = useRef(0);

  useEffect(() => {
    if (!database || !restaurantId) return;

    const platform = (typeof navigator !== 'undefined' && navigator.platform) || '';
    const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

    const heartbeat = (state) => {
      const now = Date.now();
      // Always log disconnects; throttle the steady "connected" pings.
      if (state === 'connected' && now - lastBeat.current < HEARTBEAT_MIN_MS) return;
      lastBeat.current = now;
      try {
        apiClient.logPrintDiagnostic?.(restaurantId, {
          phase: 'rt-connection', state, ts: now, platform, electron: isElectron,
          appVersion: (typeof window !== 'undefined' && window.electronAPI?.appVersion) || undefined,
        });
      } catch { /* diagnostics are best-effort */ }
    };

    const forceReconnect = () => {
      try { goOffline(database); } catch { /* noop */ }
      setTimeout(() => { try { goOnline(database); } catch { /* noop */ } }, 500);
    };

    const infoRef = ref(database, '.info/connected');
    const unsub = onValue(infoRef, (snap) => {
      const connected = snap.val() === true;
      heartbeat(connected ? 'connected' : 'disconnected');
      if (connected) {
        if (reconnectTimer.current) { clearTimeout(reconnectTimer.current); reconnectTimer.current = null; }
      } else if (!reconnectTimer.current) {
        // Give Firebase a chance to self-heal; if it hasn't after the grace window, force it.
        reconnectTimer.current = setTimeout(() => { reconnectTimer.current = null; forceReconnect(); }, RECONNECT_GRACE_MS);
      }
    });

    // Electron wake-from-sleep (main process sends this) → reconnect immediately.
    let offResume = () => {};
    if (isElectron && typeof window.electronAPI?.onResume === 'function') {
      try {
        const unsubResume = window.electronAPI.onResume(forceReconnect);
        offResume = () => { try { unsubResume?.(); } catch { /* noop */ } };
      } catch { /* noop */ }
    }

    return () => {
      try { unsub(); } catch { /* noop */ }
      if (reconnectTimer.current) { clearTimeout(reconnectTimer.current); reconnectTimer.current = null; }
      offResume();
    };
  }, [restaurantId]);
}
