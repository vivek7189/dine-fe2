'use client';

/**
 * OfflineFallback — LAN-first resilience for the installed POS app.
 *
 * This app is Local-server / LAN by default. If the user explicitly switched to Internet
 * (Cloud/GCP) and the connection then drops, we must NOT leave the POS stranded: this watcher
 * detects the loss and automatically re-points the terminal at the local server (loopback, or
 * a previously-used LAN server) so ordering keeps working. It stays on LAN until the user picks
 * Internet again. Never runs on plain web (no local server).
 *
 * Switching the backend requires a reload so every hook/socket re-inits against the local
 * server cleanly — the same thing the manual Local/Cloud switch does.
 */
import { useEffect, useRef } from 'react';
import apiClient from '../lib/api';
import { getLocalServerUrl, isServerApp } from '../lib/localServer';

const LOOPBACK = 'http://127.0.0.1:3003';

async function probe(url, ms = 2000) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    const r = await fetch(`${url}/api/health`, { signal: ctrl.signal });
    clearTimeout(t);
    return r.ok;
  } catch { return false; }
}

export default function OfflineFallback() {
  const switching = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isInstalledApp = !!window.electronAPI || !!window.Capacitor;
    if (!isInstalledApp || !isServerApp()) return;

    const onOffline = async () => {
      if (switching.current) return;
      // Already on the local server? Nothing to do — LAN keeps working.
      if (getLocalServerUrl()) return;
      switching.current = true;
      try {
        // Prefer the co-located server (loopback works with the network interface down).
        let target = (await probe(LOOPBACK)) ? LOOPBACK : null;
        // Otherwise a LAN server we discovered/used before.
        if (!target && window.electronAPI?.discoverLocalServer) {
          try {
            const found = await window.electronAPI.discoverLocalServer();
            if (found?.url && await probe(found.url)) target = found.url;
          } catch (_) {}
        }
        if (target) {
          console.log('[OfflineFallback] Internet lost — switching to local server:', target);
          apiClient.setLocalServer(target);
          if (typeof window !== 'undefined') window.location.reload();
        }
      } finally {
        switching.current = false;
      }
    };

    window.addEventListener('offline', onOffline);
    // Also handle the case where we mount while already offline.
    if (typeof navigator !== 'undefined' && navigator.onLine === false) onOffline();
    return () => window.removeEventListener('offline', onOffline);
  }, []);

  return null;
}
