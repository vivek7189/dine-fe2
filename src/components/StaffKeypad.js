'use client';

/**
 * StaffKeypad — the ONE staff sign-in for the DineOpen POS, online AND offline. Modelled on
 * Toast/Square: a big numeric keypad, punch-and-go. Two entry modes, chosen automatically:
 *
 *   • ROSTER  (trusted / local network): "Who's working?" → tap your tile → punch your PIN.
 *             Pass `rosterUrl`; used by the local-server app (LAN roster).
 *   • TYPED   (internet-facing): type your Staff ID → punch your PIN. No roster is shown, so
 *             staff can't be enumerated over the internet. Used by the cloud/web terminal.
 *
 * Password is a quiet "Use password instead" fallback. "Owner login →" always escapes to the full
 * account login. Replaces both StaffTerminalLogin (cloud) and OfflineLogin (local) with one screen.
 */
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/api';
import { getLocalServerUrl } from '../lib/localServer';

const AV = ['#DC4A3D', '#2B7A78', '#C98A2B', '#4F46E5', '#0891B2', '#9333EA', '#059669', '#DB2777'];
const initials = (n) => (n || '?').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export default function StaffKeypad({ rosterUrl, onOwnerLogin, onSuccess, restaurantName }) {
  const router = useRouter();
  const roster = !!rosterUrl;

  const [restaurant, setRestaurant] = useState(restaurantName ? { name: restaurantName } : null);
  const [members, setMembers] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(roster);
  const [selected, setSelected] = useState(null);       // roster mode: chosen member
  const [identifier, setIdentifier] = useState('');      // typed mode: Staff ID / username
  const [method, setMethod] = useState('pin');           // 'pin' | 'password'
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(typeof navigator === 'undefined' ? true : navigator.onLine !== false);
    sync();
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync); };
  }, []);

  // Roster fetch (ROSTER mode only). Normalizes both shapes:
  //   local-server: { restaurant:{name}, members:[{id,name,role,identifier,hasPin}] }
  //   (any other):  { restaurantName, staff:[{id,name,role,pinEnabled}] }  → identifier = doc id
  useEffect(() => {
    if (!roster) { setLoadingRoster(false); return; }
    let alive = true;
    (async () => {
      try {
        const r = await fetch(rosterUrl || `${getLocalServerUrl()}/api/local-server/roster`);
        const j = await r.json();
        if (!alive) return;
        if (Array.isArray(j.members)) { setRestaurant(j.restaurant || null); setMembers(j.members); }
        else if (Array.isArray(j.staff)) {
          setRestaurant({ name: j.restaurantName || '' });
          setMembers(j.staff.map((s) => ({ id: s.id, name: s.name, role: s.role, identifier: s.id, hasPin: !!s.pinEnabled })));
        } else setMembers([]);
      } catch (_) { if (alive) setMembers([]); }
      finally { if (alive) setLoadingRoster(false); }
    })();
    return () => { alive = false; };
  }, [roster, rosterUrl]);

  const finish = useCallback((data) => {
    if (data?.user) apiClient.setUser(data.user);
    if (onSuccess) { onSuccess(data); return; }
    router.replace(data?.redirectTo || '/home');
  }, [onSuccess, router]);

  const submit = useCallback(async () => {
    const id = roster ? (selected?.identifier || '') : identifier.trim();
    if (!id) { setError(roster ? 'Pick who you are' : 'Enter your Staff ID'); return; }
    if (method === 'pin' && pin.length < 4) { setError('Enter your PIN'); return; }
    if (method === 'password' && !password) { setError('Enter your password'); return; }
    setBusy(true); setError('');
    try {
      const data = method === 'pin' ? await apiClient.pinLogin(id, pin) : await apiClient.staffLogin(id, password);
      if (data?.token && (data.success || data.message)) finish(data);
      else { setError(data?.error || 'Login failed'); setPin(''); setPassword(''); }
    } catch (e) {
      setError(e?.message || e?.error || 'Invalid credentials'); setPin(''); setPassword('');
    } finally { setBusy(false); }
  }, [roster, selected, identifier, method, pin, password, finish]);

  const press = (d) => { if (!busy) { setError(''); setPin((p) => (p + d).slice(0, 10)); } };
  const back = () => { if (!busy) { setError(''); setPin((p) => p.slice(0, -1)); } };
  const resetPerson = () => { setSelected(null); setPin(''); setPassword(''); setError(''); setMethod('pin'); };

  // In roster mode we only show the keypad AFTER a tile is tapped. In typed mode the keypad is always shown.
  const showKeypadStage = roster ? !!selected : true;

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.header}>
          <div style={S.logo}>🍽️</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={S.brand}>DineOpen</div>
            <div style={S.rest}>{restaurant?.name || restaurantName || 'Staff sign in'}</div>
          </div>
          <div style={{ ...S.pill, ...(online ? {} : { color: '#B45309', background: '#FEF3E2' }) }}>{online ? '● Online' : '● Offline'}</div>
        </div>

        {/* ROSTER: who's working? */}
        {roster && !selected && (
          <div style={S.body}>
            <div style={S.who}>Who’s working?</div>
            {loadingRoster ? <div style={S.muted}>Loading team…</div>
              : members.length === 0 ? (
                <div style={S.empty}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>This device isn’t set up yet</div>
                  <div style={S.muted}>Sign in as the owner to set it up.</div>
                </div>
              ) : (
                <div style={S.tiles}>
                  {members.map((m, i) => (
                    <button key={m.id} onClick={() => { setSelected(m); setPin(''); setError(''); }}
                      style={{ ...S.tile, opacity: m.hasPin === false ? 0.5 : 1 }}
                      title={m.hasPin === false ? `${m.name} has no PIN yet` : `Sign in as ${m.name}`}>
                      <span style={{ ...S.av, background: AV[i % AV.length] }}>{initials(m.name)}</span>
                      <span style={S.tileName}>{m.name}</span>
                      <span style={S.tileRole}>{m.hasPin === false ? 'No PIN' : m.role}</span>
                    </button>
                  ))}
                </div>
              )}
            <button style={S.link} onClick={() => onOwnerLogin?.()}>Owner login →</button>
          </div>
        )}

        {/* KEYPAD stage */}
        {showKeypadStage && (
          <div style={S.body}>
            {roster ? (
              <button style={S.backLink} onClick={resetPerson}>← Change person</button>
            ) : (
              <div style={S.who}>Staff sign in</div>
            )}

            {/* WHO */}
            {roster ? (
              <div style={S.pinWho}>
                <span style={{ ...S.avSm, background: AV[Math.max(0, members.findIndex((x) => x.id === selected.id)) % AV.length] }}>{initials(selected.name)}</span>
                <div><div style={{ fontWeight: 800 }}>{selected.name}</div><div style={S.tileRole}>{selected.role}</div></div>
              </div>
            ) : (
              <>
                <label style={S.label}>Staff ID or Username</label>
                <input value={identifier} onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  placeholder="e.g. 10234 or jsmith" autoCapitalize="none" autoCorrect="off" style={S.input} />
              </>
            )}

            {/* PIN | Password toggle */}
            <div style={S.seg}>
              {[{ id: 'pin', label: 'PIN' }, { id: 'password', label: 'Password' }].map((m) => (
                <button key={m.id} type="button" onClick={() => { setMethod(m.id); setError(''); setPin(''); setPassword(''); }}
                  style={{ ...S.segBtn, ...(method === m.id ? S.segOn : {}) }}>{m.label}</button>
              ))}
            </div>

            {method === 'pin' ? (
              <>
                <div style={S.dots}>
                  {[0, 1, 2, 3].map((i) => <span key={i} style={{ ...S.dot, ...(i < pin.length ? S.dotFill : {}) }} />)}
                  {pin.length > 4 && <span style={S.extra}>+{pin.length - 4}</span>}
                </div>
                {error && <div style={S.error}>{error}</div>}
                <div style={S.pad}>
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                    <button key={n} type="button" style={S.key} onClick={() => press(n)}>{n}</button>
                  ))}
                  <button type="button" style={S.keyMut} onClick={() => { setPin(''); setError(''); }}>Clear</button>
                  <button type="button" style={S.key} onClick={() => press('0')}>0</button>
                  <button type="button" style={S.keyMut} onClick={back}>⌫</button>
                </div>
              </>
            ) : (
              <>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Password" onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} style={{ ...S.input, marginTop: 6 }} />
                {error && <div style={S.error}>{error}</div>}
              </>
            )}

            <button type="button" style={{ ...S.loginBtn, opacity: busy ? 0.6 : 1 }} disabled={busy} onClick={submit}>
              {busy ? 'Signing in…' : 'Sign in →'}
            </button>
            <button type="button" style={S.link} onClick={() => onOwnerLogin?.()}>Owner login →</button>
          </div>
        )}
      </div>
      <div style={S.foot}>{roster ? 'Fast offline sign-in · this terminal' : 'Staff sign-in · this terminal'}</div>
    </div>
  );
}

const S = {
  wrap: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FAF6EF', padding: 20, fontFamily: 'ui-sans-serif,-apple-system,"Segoe UI",Roboto,sans-serif' },
  card: { width: '100%', maxWidth: 400, background: '#fff', borderRadius: 22, boxShadow: '0 10px 40px rgba(42,33,28,.12)', overflow: 'hidden', border: '1px solid #EFE6D8' },
  header: { display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', borderBottom: '1px solid #F1E9DC' },
  logo: { width: 36, height: 36, borderRadius: 10, background: '#DC4A3D', display: 'grid', placeItems: 'center', fontSize: 18 },
  brand: { fontWeight: 800, fontSize: 15, color: '#2A211C', letterSpacing: '-.01em' },
  rest: { fontSize: 12, color: '#8A7D74', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  pill: { fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#E7F3EC', padding: '5px 9px', borderRadius: 999, flexShrink: 0 },
  body: { padding: '18px 18px 22px' },
  who: { fontSize: 13, fontWeight: 700, color: '#8A7D74', marginBottom: 12 },
  muted: { fontSize: 13, color: '#8A7D74' },
  empty: { background: '#F7F1E7', border: '1px solid #EEE3D2', borderRadius: 12, padding: '14px 16px', textAlign: 'center', color: '#2A211C' },
  tiles: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  tile: { background: '#F7F1E7', border: '1px solid #EEE3D2', borderRadius: 14, padding: '14px 6px 11px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  av: { width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 16, marginBottom: 8 },
  avSm: { width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 15 },
  tileName: { fontSize: 12, fontWeight: 700, color: '#2A211C', lineHeight: 1.2 },
  tileRole: { fontSize: 10, color: '#8A7D74', textTransform: 'uppercase', letterSpacing: '.04em', marginTop: 2 },
  backLink: { background: 'transparent', border: 'none', color: '#DC4A3D', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 12 },
  pinWho: { display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#6B5E54', marginBottom: 6 },
  input: { width: '100%', boxSizing: 'border-box', padding: '13px 14px', border: '1px solid #E7DDCE', borderRadius: 12, fontSize: 15, outline: 'none', background: '#FCFAF6', color: '#2A211C' },
  seg: { display: 'inline-flex', background: '#F1E9DC', border: '1px solid #EEE3D2', borderRadius: 10, padding: 3, gap: 2, margin: '14px 0 6px' },
  segBtn: { padding: '7px 18px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'transparent', color: '#8A7D74' },
  segOn: { background: '#fff', color: '#DC4A3D', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
  dots: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, margin: '12px 0 14px' },
  dot: { width: 14, height: 14, borderRadius: '50%', border: '2px solid #E7DDCE' },
  dotFill: { background: '#DC4A3D', borderColor: '#DC4A3D' },
  extra: { fontSize: 12, color: '#8A7D74', fontWeight: 700 },
  error: { color: '#DC2626', fontSize: 13, textAlign: 'center', marginBottom: 10, fontWeight: 600 },
  pad: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  key: { background: '#F7F1E7', border: '1px solid #EEE3D2', borderRadius: 13, padding: '17px 0', fontSize: 23, fontWeight: 700, color: '#2A211C', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' },
  keyMut: { background: 'transparent', border: 'none', color: '#8A7D74', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  loginBtn: { width: '100%', marginTop: 16, background: '#DC4A3D', color: '#fff', border: 'none', borderRadius: 13, padding: 15, fontWeight: 800, fontSize: 15, cursor: 'pointer' },
  link: { display: 'block', width: '100%', marginTop: 12, background: 'transparent', border: 'none', color: '#DC4A3D', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 8 },
  foot: { marginTop: 18, fontSize: 12, color: '#8A7D74' },
};
