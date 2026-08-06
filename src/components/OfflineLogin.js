'use client';

/**
 * OfflineLogin — the fast, offline-first login shown ONLY inside the local-server POS app
 * (gated by isLocalServerMode() in the login page). Everyone — owner and staff — taps their
 * tile and punches a numeric PIN, validated by the co-located backend against the local DB,
 * so it works with Wi-Fi off. OTP/Google are not on this screen; "Owner login / Set up"
 * falls back to the full login UI for the one-time online setup + admin.
 *
 * Web and the main Electron app never render this (no local server) — their login is untouched.
 */
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/api';
import { getLocalServerUrl } from '../lib/localServer';

const AV_COLORS = ['#DC4A3D', '#2B7A78', '#C98A2B', '#4F46E5', '#0891B2', '#9333EA', '#059669', '#DB2777'];
const initials = (name) => (name || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default function OfflineLogin({ onOwnerLogin }) {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [selected, setSelected] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const base = getLocalServerUrl();
        const r = await fetch(`${base}/api/local-server/roster`);
        const j = await r.json();
        if (!alive) return;
        setRestaurant(j.restaurant || null);
        setMembers(Array.isArray(j.members) ? j.members : []);
      } catch (_) {
        if (alive) setMembers([]);
      } finally {
        if (alive) setLoadingRoster(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const submit = useCallback(async (member, code) => {
    if (!member?.identifier) { setError('This member has no phone/email on file — use Owner login.'); return; }
    setBusy(true); setError('');
    try {
      const data = await apiClient.pinLogin(member.identifier, code);
      if (data?.success && data?.token) {
        if (data.user) apiClient.setUser(data.user);
        router.replace(data.redirectTo || '/dashboard');
      } else {
        setError(data?.error || 'Login failed');
        setPin('');
      }
    } catch (e) {
      setError(e?.message || e?.error || 'Invalid PIN');
      setPin('');
    } finally {
      setBusy(false);
    }
  }, [router]);

  const press = (d) => {
    if (busy) return;
    setError('');
    const next = (pin + d).slice(0, 8);
    setPin(next);
  };
  const back = () => { if (!busy) { setError(''); setPin((p) => p.slice(0, -1)); } };

  const pinView = !!selected;

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.header}>
          <div style={S.logo}>🍽️</div>
          <div>
            <div style={S.brand}>DineOpen</div>
            <div style={S.restName}>{restaurant?.name || 'Restaurant'}</div>
          </div>
          <div style={S.offlinePill}>● Offline ready</div>
        </div>

        {!pinView && (
          <div style={S.body}>
            <div style={S.who}>Who’s working?</div>
            {loadingRoster ? (
              <div style={S.muted}>Loading team…</div>
            ) : members.length === 0 ? (
              <div style={S.emptyBox}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>This device isn’t set up yet</div>
                <div style={S.muted}>Sign in as the owner to set it up.</div>
              </div>
            ) : (
              <div style={S.tiles}>
                {members.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelected(m); setPin(''); setError(''); }}
                    style={{ ...S.tile, opacity: m.hasPin ? 1 : 0.55 }}
                    title={m.hasPin ? `Log in as ${m.name}` : `${m.name} has no PIN yet`}
                  >
                    <span style={{ ...S.av, background: AV_COLORS[i % AV_COLORS.length] }}>{initials(m.name)}</span>
                    <span style={S.tileName}>{m.name}</span>
                    <span style={S.tileRole}>{m.hasPin ? m.role : 'No PIN'}</span>
                  </button>
                ))}
              </div>
            )}
            <button style={S.linkBtn} onClick={onOwnerLogin}>Owner login / Set up →</button>
          </div>
        )}

        {pinView && (
          <div style={S.body}>
            <button style={S.backLink} onClick={() => { setSelected(null); setPin(''); setError(''); }}>← Change person</button>
            <div style={S.pinWho}>
              <span style={{ ...S.avSm, background: AV_COLORS[Math.max(0, members.findIndex((x) => x.id === selected.id)) % AV_COLORS.length] }}>{initials(selected.name)}</span>
              <div>
                <div style={{ fontWeight: 800 }}>{selected.name}</div>
                <div style={S.tileRole}>{selected.role}</div>
              </div>
            </div>

            {!selected.hasPin ? (
              <div style={S.emptyBox}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>No PIN set for {selected.name}</div>
                <div style={S.muted}>The owner can set a PIN from Admin → Staff (online), then this tile works offline.</div>
                <button style={{ ...S.linkBtn, marginTop: 10 }} onClick={onOwnerLogin}>Owner login →</button>
              </div>
            ) : (
              <>
                <div style={S.dots}>
                  {[0, 1, 2, 3].map((i) => (
                    <span key={i} style={{ ...S.dot, ...(i < pin.length ? S.dotFilled : {}) }} />
                  ))}
                  {pin.length > 4 && <span style={S.extra}>+{pin.length - 4}</span>}
                </div>
                {error && <div style={S.error}>{error}</div>}
                <div style={S.pad}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                    <button key={n} style={S.key} onClick={() => press(n)}>{n}</button>
                  ))}
                  <button style={S.keyMut} onClick={() => { setPin(''); setError(''); }}>Clear</button>
                  <button style={S.key} onClick={() => press('0')}>0</button>
                  <button style={S.keyMut} onClick={back}>⌫</button>
                </div>
                <button
                  style={{ ...S.loginBtn, opacity: pin.length >= 4 && !busy ? 1 : 0.5 }}
                  disabled={pin.length < 4 || busy}
                  onClick={() => submit(selected, pin)}
                >
                  {busy ? 'Logging in…' : 'Login →'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div style={S.footNote}>Fast offline login · powered by your local server</div>
    </div>
  );
}

const S = {
  wrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF6EF', padding: 20, fontFamily: 'ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif' },
  card: { width: '100%', maxWidth: 380, background: '#fff', borderRadius: 22, boxShadow: '0 10px 40px rgba(42,33,28,.12)', overflow: 'hidden', border: '1px solid #EFE6D8' },
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: '1px solid #F1E9DC' },
  logo: { width: 36, height: 36, borderRadius: 10, background: '#DC4A3D', display: 'grid', placeItems: 'center', fontSize: 18 },
  brand: { fontWeight: 800, fontSize: 15, color: '#2A211C', letterSpacing: '-.01em' },
  restName: { fontSize: 12, color: '#8A7D74' },
  offlinePill: { marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#E7F3EC', padding: '5px 9px', borderRadius: 999 },
  body: { padding: '18px 18px 22px' },
  who: { fontSize: 13, fontWeight: 700, color: '#8A7D74', marginBottom: 12 },
  muted: { fontSize: 13, color: '#8A7D74' },
  emptyBox: { background: '#F7F1E7', border: '1px solid #EEE3D2', borderRadius: 12, padding: '14px 16px', textAlign: 'center', color: '#2A211C' },
  tiles: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  tile: { background: '#F7F1E7', border: '1px solid #EEE3D2', borderRadius: 14, padding: '14px 6px 11px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 },
  av: { width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 16, marginBottom: 8 },
  avSm: { width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 15 },
  tileName: { fontSize: 12, fontWeight: 700, color: '#2A211C', lineHeight: 1.2 },
  tileRole: { fontSize: 10, color: '#8A7D74', textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 2 },
  linkBtn: { display: 'block', width: '100%', marginTop: 16, background: 'transparent', border: 'none', color: '#DC4A3D', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 8 },
  backLink: { background: 'transparent', border: 'none', color: '#DC4A3D', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 12 },
  pinWho: { display: 'flex', alignItems: 'center', gap: 11, marginBottom: 16 },
  dots: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, margin: '6px 0 14px' },
  dot: { width: 14, height: 14, borderRadius: '50%', border: '2px solid #E7DDCE' },
  dotFilled: { background: '#DC4A3D', borderColor: '#DC4A3D' },
  extra: { fontSize: 12, color: '#8A7D74', fontWeight: 700 },
  error: { color: '#DC2626', fontSize: 13, textAlign: 'center', marginBottom: 10, fontWeight: 600 },
  pad: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  key: { background: '#F7F1E7', border: '1px solid #EEE3D2', borderRadius: 13, padding: '15px 0', fontSize: 22, fontWeight: 700, color: '#2A211C', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' },
  keyMut: { background: 'transparent', border: 'none', color: '#8A7D74', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  loginBtn: { width: '100%', marginTop: 16, background: '#DC4A3D', color: '#fff', border: 'none', borderRadius: 13, padding: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer' },
  footNote: { marginTop: 18, fontSize: 12, color: '#8A7D74' },
};
