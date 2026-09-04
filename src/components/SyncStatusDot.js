'use client';

/**
 * SyncStatusDot — a small, always-visible connectivity indicator for the local-server POS app,
 * floating top-right on every dashboard page. It also doubles as a manual override:
 *   • 🟢 Online   — connected to the cloud (the whole account, like the web)
 *   • 🟡 Offline  — cloud unreachable → running on the local server (bound restaurant)
 *   • 🔵 Checking — re-probing the connection
 * Tap it to force a re-check / re-connect (re-probes the cloud and switches routing if needed).
 * Self-hides on plain web / the cloud app.
 */
import { useEffect, useState, useCallback } from 'react';
import apiClient from '../lib/api';
import { isServerModeActive, getLocalServerUrl, setLocalServerUrl } from '../lib/localServer';

export default function SyncStatusDot() {
  const [mounted, setMounted] = useState(false);
  // Connectivity state published by OfflineFallback: { mode:'online'|'offline', cloudUp, pending }.
  const [conn, setConn] = useState({ mode: 'online', cloudUp: true, pending: null });
  // API-sync worker status (Phase 1.4/1.5/6): { pendingUp, running, enabled, deadLetter, authExpired, diskCritical } from local.
  const [sync, setSync] = useState({ pendingUp: 0, running: false, enabled: false, deadLetter: 0, authExpired: false, diskCritical: false, diskFreeMb: null });
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Local-server app ONLY: on plain web / the cloud app there is no co-located local server, so we
    // must NOT poll 127.0.0.1:3003 (it just produces failed requests). Gate the effect, not only render.
    const installedApp = typeof window !== 'undefined' && (!!window.electronAPI || !!window.Capacitor);
    if (!installedApp || !isServerModeActive()) return;
    const read = () => {
      const s = (typeof window !== 'undefined' && window.__dineConnState) || null;
      if (s) setConn(s);
      else setConn({ mode: getLocalServerUrl() ? 'offline' : 'online', cloudUp: !getLocalServerUrl(), pending: null });
    };
    read();
    window.addEventListener('dine-conn', read);
    const id = setInterval(read, 3000);

    // Poll the co-located local server's API-sync worker (always at loopback, even when routing to
    // the cloud) so we can show "Syncing N…" as offline orders drain up, and "N queued" while offline.
    let alive = true;
    const pollSync = async () => {
      try {
        const r = await fetch('http://127.0.0.1:3003/api/local-server/api-sync-status', { cache: 'no-store' });
        if (r.ok && alive) { const j = await r.json(); setSync({ pendingUp: j.pendingUp || 0, running: !!j.running, enabled: !!j.enabled, deadLetter: j.deadLetter || 0, authExpired: !!j.authExpired, diskCritical: !!j.diskCritical, diskFreeMb: (j.diskFreeMb == null ? null : j.diskFreeMb) }); }
      } catch (_) { /* local server momentarily busy — keep last */ }
    };
    pollSync();
    const sid = setInterval(pollSync, 4000);
    return () => { alive = false; window.removeEventListener('dine-conn', read); clearInterval(id); clearInterval(sid); };
  }, []);

  // Manual override: force a clean reconnect to the cloud (drop any local pin) and reload, so the
  // whole app fetches fresh from the cloud (all restaurants). This is the user's "resync" button.
  const recheck = useCallback(async () => {
    if (checking) return;
    setChecking(true);
    try {
      setLocalServerUrl(null);
      apiClient.setLocalServer(null);
      apiClient.clearAllCache?.();
      window.location.reload();
    } finally { setChecking(false); }
  }, [checking]);

  const isInstalledApp = typeof window !== 'undefined' && (!!window.electronAPI || !!window.Capacitor);
  if (!mounted || !isInstalledApp || !isServerModeActive()) return null;

  // Priority (Phase 6): storage-full → manual check → sign-in needed → connection changing → draining →
  // dead-letter warning → offline → online. Disk-critical outranks all — it blocks new orders locally.
  const state = sync.diskCritical ? 'diskfull'
    : checking ? 'checking'
    : (conn.mode === 'online' && sync.authExpired) ? 'authexpired'
    : (conn.pending && conn.pending !== conn.mode) ? 'reconnecting'
    : (conn.mode === 'online' && sync.pendingUp > 0) ? 'syncing'
    : (conn.mode === 'online' && sync.deadLetter > 0) ? 'warn'
    : conn.mode === 'offline' ? 'offline' : 'online';
  const conf = {
    diskfull:     { dot: '#DC2626', label: '⚠ Storage full' },
    checking:     { dot: '#2563EB', label: 'Checking…' },
    authexpired:  { dot: '#DC2626', label: '⚠ Sign-in needed' },
    reconnecting: { dot: '#2563EB', label: 'Reconnecting…' },
    syncing:      { dot: '#2563EB', label: `Syncing ${sync.pendingUp}…` },
    warn:         { dot: '#DC2626', label: `⚠ ${sync.deadLetter} unsynced` },
    offline:      { dot: '#C98A2B', label: sync.pendingUp > 0 ? `Offline · ${sync.pendingUp} queued` : 'Offline' },
    online:       { dot: '#16A34A', label: 'Online' },
  }[state];

  return (
    <button
      type="button"
      onClick={recheck}
      title={state === 'diskfull' ? `Storage almost full${sync.diskFreeMb != null ? ` (${sync.diskFreeMb} MB left)` : ''} — free up disk space soon or new orders may fail to save.`
        : state === 'authexpired' ? 'This terminal needs to reconnect to your account to keep syncing. Tap to re-connect / sign in again.'
        : state === 'offline' ? 'Working on the local server — your orders are saved and will sync when the internet is back. Tap to re-check.'
        : state === 'syncing' ? `Syncing ${sync.pendingUp} order(s) to the cloud…`
        : state === 'warn' ? `${sync.deadLetter} record(s) couldn’t sync to the cloud yet — retrying automatically. Tap to re-check.`
        : state === 'reconnecting' ? 'Connection is changing — will switch once it stays stable. Tap to force now.'
        : 'Online — connected to the cloud (your whole account). Tap to re-check / re-sync.'}
      style={S.wrap}
    >
      <span style={{ ...S.dot, background: conf.dot }} />
      <span style={S.label}>{conf.label}</span>
    </button>
  );
}

const S = {
  wrap: { position: 'fixed', top: 10, right: 14, zIndex: 9998, display: 'inline-flex', alignItems: 'center', gap: 7,
    background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', border: '1px solid #E5E7EB', borderRadius: 999,
    padding: '5px 11px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', fontFamily: 'ui-sans-serif,-apple-system,sans-serif',
    cursor: 'pointer', WebkitAppRegion: 'no-drag' },
  dot: { width: 9, height: 9, borderRadius: '50%', flexShrink: 0 },
  label: { fontSize: 12, fontWeight: 700, color: '#3A312B', whiteSpace: 'nowrap' },
};
