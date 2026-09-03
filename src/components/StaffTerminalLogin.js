'use client';

/**
 * StaffTerminalLogin — the staff login screen for the CLOUD electron app + WEB, shown only when a
 * device is opted into staff-PIN terminal mode (isStaffPinMode() in the login page; DEFAULT OFF).
 *
 * SECURITY: unlike the local-server app (trusted LAN → tiles + PIN), this screen is reachable over
 * the internet, so it deliberately does NOT show a staff roster/tiles (no enumeration) and never
 * lets anyone "pick a face and guess a PIN". The staff member must TYPE their Staff ID / username,
 * then enter their PIN (keypad) OR password. Identity + secret — both required. Backend applies a
 * per-account lockout (5 attempts / 15 min). "Owner login →" always escapes to the normal login.
 *
 * The local-server OfflineLogin (tiles + PIN, offline) is a separate component and is unchanged.
 */
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/api';

export default function StaffTerminalLogin({ onOwnerLogin, onSuccess, restaurantName }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  // Default to PIN: staff sign in with the SAME PIN the owner set for them in Admin → Staff (the one
  // they already use on the terminal). Password remains available as a fallback.
  const [method, setMethod] = useState('pin'); // 'pin' | 'password'
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

  const finish = useCallback((data) => {
    if (data?.user) apiClient.setUser(data.user);
    if (onSuccess) { onSuccess(data); return; }
    router.replace(data?.redirectTo || '/home');
  }, [onSuccess, router]);

  const submit = useCallback(async () => {
    const id = identifier.trim();
    if (!id) { setError('Enter your Staff ID or username'); return; }
    if (method === 'pin' && pin.length < 4) { setError('Enter your PIN'); return; }
    if (method === 'password' && !password) { setError('Enter your password'); return; }
    setBusy(true); setError('');
    try {
      const data = method === 'pin'
        ? await apiClient.pinLogin(id, pin)
        : await apiClient.staffLogin(id, password);
      if (data?.token && (data.success || data.message)) {
        finish(data);
      } else {
        setError(data?.error || 'Login failed');
        setPin(''); setPassword('');
      }
    } catch (e) {
      setError(e?.message || e?.error || 'Invalid credentials');
      setPin(''); setPassword('');
    } finally {
      setBusy(false);
    }
  }, [identifier, method, pin, password, finish]);

  const press = (d) => { if (!busy) { setError(''); setPin((p) => (p + d).slice(0, 10)); } };
  const back = () => { if (!busy) { setError(''); setPin((p) => p.slice(0, -1)); } };

  return (
    <div style={S.wrap}>
      <div style={S.card}>
        <div style={S.header}>
          <div style={S.logo}>🍽️</div>
          <div>
            <div style={S.brand}>DineOpen</div>
            <div style={S.restName}>{restaurantName || 'Staff login'}</div>
          </div>
          <div style={{ ...S.pill, ...(online ? {} : { color: '#B45309', background: '#FEF3E2' }) }}>{online ? '● Online' : '● Offline'}</div>
        </div>

        <div style={S.body}>
          <div style={S.who}>Staff sign in</div>

          <label style={S.label}>Staff ID or Username</label>
          <input
            value={identifier}
            onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
            placeholder="e.g. 10234 or jsmith"
            autoCapitalize="none"
            autoCorrect="off"
            style={S.input}
          />

          {/* PIN | Password segmented toggle */}
          <div style={S.seg}>
            {[{ id: 'pin', label: 'PIN' }, { id: 'password', label: 'Password' }].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => { setMethod(m.id); setError(''); setPin(''); setPassword(''); }}
                style={{ ...S.segBtn, ...(method === m.id ? S.segOn : {}) }}
              >{m.label}</button>
            ))}
          </div>

          {method === 'pin' ? (
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
                  <button key={n} type="button" style={S.key} onClick={() => press(n)}>{n}</button>
                ))}
                <button type="button" style={S.keyMut} onClick={() => { setPin(''); setError(''); }}>Clear</button>
                <button type="button" style={S.key} onClick={() => press('0')}>0</button>
                <button type="button" style={S.keyMut} onClick={back}>⌫</button>
              </div>
              <div style={S.hint}>Use the PIN your manager set for you (same as on the terminal).</div>
            </>
          ) : (
            <>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Password"
                onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
                style={{ ...S.input, marginTop: 4 }}
              />
              {error && <div style={S.error}>{error}</div>}
            </>
          )}

          <button
            type="button"
            style={{ ...S.loginBtn, opacity: busy ? 0.6 : 1 }}
            disabled={busy}
            onClick={submit}
          >
            {busy ? 'Signing in…' : 'Sign in →'}
          </button>

          <button type="button" style={S.linkBtn} onClick={() => onOwnerLogin?.()}>Owner login →</button>
        </div>
      </div>
      <div style={S.footNote}>Staff sign in · this terminal</div>
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
  pill: { marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#16A34A', background: '#E7F3EC', padding: '5px 9px', borderRadius: 999 },
  body: { padding: '18px 18px 22px' },
  who: { fontSize: 13, fontWeight: 700, color: '#8A7D74', marginBottom: 12 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#6B5E54', marginBottom: 6 },
  input: { width: '100%', boxSizing: 'border-box', padding: '13px 14px', border: '1px solid #E7DDCE', borderRadius: 12, fontSize: 15, outline: 'none', background: '#FCFAF6', color: '#2A211C' },
  seg: { display: 'inline-flex', background: '#F1E9DC', border: '1px solid #EEE3D2', borderRadius: 10, padding: 3, gap: 2, margin: '14px 0 6px' },
  segBtn: { padding: '7px 18px', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'transparent', color: '#8A7D74' },
  segOn: { background: '#fff', color: '#DC4A3D', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' },
  dots: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, margin: '12px 0 14px' },
  dot: { width: 14, height: 14, borderRadius: '50%', border: '2px solid #E7DDCE' },
  dotFilled: { background: '#DC4A3D', borderColor: '#DC4A3D' },
  extra: { fontSize: 12, color: '#8A7D74', fontWeight: 700 },
  error: { color: '#DC2626', fontSize: 13, textAlign: 'center', marginBottom: 10, fontWeight: 600 },
  pad: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 },
  key: { background: '#F7F1E7', border: '1px solid #EEE3D2', borderRadius: 13, padding: '15px 0', fontSize: 22, fontWeight: 700, color: '#2A211C', cursor: 'pointer', fontVariantNumeric: 'tabular-nums' },
  keyMut: { background: 'transparent', border: 'none', color: '#8A7D74', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
  loginBtn: { width: '100%', marginTop: 16, background: '#DC4A3D', color: '#fff', border: 'none', borderRadius: 13, padding: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer' },
  linkBtn: { display: 'block', width: '100%', marginTop: 12, background: 'transparent', border: 'none', color: '#DC4A3D', fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: 8 },
  hint: { marginTop: 12, fontSize: 11, color: '#8A7D74', textAlign: 'center', lineHeight: 1.4 },
  footNote: { marginTop: 18, fontSize: 12, color: '#8A7D74' },
};
