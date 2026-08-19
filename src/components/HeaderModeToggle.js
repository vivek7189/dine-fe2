'use client';

/**
 * HeaderModeToggle — a GLOBAL Online ⇄ LAN switch for the installed POS app, shown in the top
 * header for OWNER/ADMIN only (plus any roles an admin has explicitly allowed via
 * restaurant settings `modeToggleRoles`). Everyone else stays on whatever backend their login
 * put them on (staff PIN → LAN) with no switch.
 *
 * Switching re-points the ENTIRE app at one backend and reloads, so the whole app runs on the
 * local server (LAN) OR the cloud (GCP) — never a mix of both. A confirm/warning is shown first.
 *
 * Default for owner/admin is Online. Switching to LAN requires a reachable local server.
 */
import { useEffect, useState, useCallback } from 'react';
import apiClient from '../lib/api';
import { getLocalServerUrl } from '../lib/localServer';

const LOOPBACK = 'http://127.0.0.1:3003';
// Cloud target — matches the baked default; falls back to whatever cloud the app already uses.
const CLOUD = process.env.NEXT_PUBLIC_API_URL || 'https://34-93-129-104.sslip.io';

export default function HeaderModeToggle() {
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState('');
  const [allowed, setAllowed] = useState([]);
  const [onLocal, setOnLocal] = useState(false);
  const [online, setOnline] = useState(true);
  const [confirmTo, setConfirmTo] = useState(null); // 'local' | 'online'
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMounted(true);
    try { const u = JSON.parse(localStorage.getItem('userData') || 'null'); setRole(u?.role || ''); } catch (_) {}
    try {
      const rest = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
      const roles = rest?.posSettings?.modeToggleRoles || rest?.settings?.modeToggleRoles || [];
      setAllowed(Array.isArray(roles) ? roles : []);
    } catch (_) {}
    const readLocal = () => { try { setOnLocal(!!getLocalServerUrl()); } catch (_) {} };
    const readNet = () => setOnline(typeof navigator === 'undefined' ? true : navigator.onLine !== false);
    readLocal(); readNet();
    window.addEventListener('online', readNet);
    window.addEventListener('offline', readNet);
    const id = setInterval(readLocal, 4000);
    return () => { window.removeEventListener('online', readNet); window.removeEventListener('offline', readNet); clearInterval(id); };
  }, []);

  const applySwitch = useCallback(async (to) => {
    setBusy(true);
    try {
      if (to === 'local') {
        let ok = false;
        try {
          const ac = new AbortController();
          const t = setTimeout(() => ac.abort(), 2500);
          const r = await fetch(`${LOOPBACK}/api/health`, { signal: ac.signal });
          clearTimeout(t); ok = r.ok;
        } catch (_) {}
        if (!ok) { window.alert('No local server found on this machine or network. Start the DineOpen server first, or stay Online.'); setBusy(false); setConfirmTo(null); return; }
        apiClient.setLocalServer(LOOPBACK);
      } else {
        apiClient.setLocalServer(null);
        apiClient.setCloudBackend(CLOUD);
      }
      // GLOBAL: reload so every hook, socket and request re-inits against the one backend.
      window.location.reload();
    } catch (_) { setBusy(false); setConfirmTo(null); }
  }, []);

  const isInstalledApp = typeof window !== 'undefined' && (!!window.electronAPI || !!window.Capacitor);
  const canSwitch = ['owner', 'admin'].includes(role) || allowed.includes(role);
  if (!mounted || !isInstalledApp || !canSwitch) return null;

  const mode = onLocal ? 'local' : 'online';

  return (
    <>
      <div style={S.wrap}>
        <span style={S.label}>Mode</span>
        <div style={S.seg}>
          <button
            type="button"
            onClick={() => { if (mode !== 'online') setConfirmTo('online'); }}
            style={{ ...S.segBtn, ...(mode === 'online' ? S.segOn : {}) }}
          >🌐 Online</button>
          <button
            type="button"
            onClick={() => { if (mode !== 'local') setConfirmTo('local'); }}
            style={{ ...S.segBtn, ...(mode === 'local' ? S.segOn : {}) }}
          >🖥️ LAN</button>
        </div>
        <span style={{ ...S.dot, background: online ? '#16A34A' : '#C98A2B' }} title={`Internet: ${online ? 'online' : 'offline'}`} />
      </div>

      {confirmTo && (
        <div style={S.overlay} onClick={() => !busy && setConfirmTo(null)}>
          <div style={S.card} onClick={(e) => e.stopPropagation()}>
            <div style={S.title}>{confirmTo === 'local' ? 'Switch the whole app to LAN?' : 'Switch the whole app to Online?'}</div>
            <div style={S.body}>
              {confirmTo === 'local'
                ? 'Every screen and every terminal action will run on the on-prem local server over your network — works without internet. The app will reload to switch cleanly.'
                : 'Every screen will run on the cloud (GCP) — needs internet. The app will reload to switch cleanly.'}
            </div>
            <div style={S.warn}>⚠️ This reloads the app. Finish any open bill first.</div>
            <div style={S.actions}>
              <button style={S.cancel} disabled={busy} onClick={() => setConfirmTo(null)}>Cancel</button>
              <button style={S.confirm} disabled={busy} onClick={() => applySwitch(confirmTo)}>
                {busy ? 'Switching…' : (confirmTo === 'local' ? 'Switch to LAN' : 'Switch to Online')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const S = {
  wrap: { position: 'fixed', top: 10, right: 14, zIndex: 9998, display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', border: '1px solid #E5E7EB', borderRadius: 999,
    padding: '4px 8px 4px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', fontFamily: 'ui-sans-serif,-apple-system,sans-serif' },
  label: { fontSize: 11, fontWeight: 700, color: '#8A7D74', textTransform: 'uppercase', letterSpacing: '.04em' },
  seg: { display: 'inline-flex', gap: 2, background: '#F1E9DC', borderRadius: 999, padding: 2 },
  segBtn: { padding: '4px 11px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#8A7D74', background: 'transparent', whiteSpace: 'nowrap' },
  segOn: { background: '#DC4A3D', color: '#fff' },
  dot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(28,22,18,.5)', backdropFilter: 'blur(3px)', display: 'grid', placeItems: 'center', zIndex: 10000, fontFamily: 'ui-sans-serif,-apple-system,sans-serif' },
  card: { width: 'min(92vw,380px)', background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.3)' },
  title: { fontWeight: 800, fontSize: 17, color: '#2A211C', marginBottom: 8 },
  body: { fontSize: 13.5, color: '#5A4F47', lineHeight: 1.5 },
  warn: { fontSize: 12.5, color: '#B45309', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 9, padding: '8px 11px', margin: '12px 0 16px', fontWeight: 600 },
  actions: { display: 'flex', gap: 10 },
  cancel: { flex: 1, padding: '11px', borderRadius: 11, border: '1px solid #E5E7EB', background: '#fff', color: '#6B7280', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  confirm: { flex: 1, padding: '11px', borderRadius: 11, border: 'none', background: '#DC4A3D', color: '#fff', fontWeight: 800, fontSize: 14, cursor: 'pointer' },
};
