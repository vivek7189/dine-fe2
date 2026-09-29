'use client';

// StaffAccessGate — the "Clock in to start" screen of Staff Access Rules (Admin → Staff Access).
// Shown only to staff whose role must clock in, while they are not clocked in / on approved leave /
// past their shift. Owner, admin, co-owner and manager never see it. The server enforces the rule
// (423 STAFF_ACCESS_*); this screen explains it and offers Clock in / Manager PIN / Log out.
// It also keeps the latest rules on apiClient (apiClient.getStaffAccess()) for other screens.
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { FaUserClock, FaLock, FaUmbrellaBeach, FaKey, FaSignOutAlt } from 'react-icons/fa';
import apiClient from '../lib/api';

const NEVER_RESTRICTED = ['owner', 'admin', 'co-owner', 'manager', 'super-admin', 'super_admin'];
const FREE_PATHS = ['/attendance', '/login', '/profile'];
const POLL_MS = 60 * 1000;
const TITLES = {
  NOT_CLOCKED_IN: { icon: FaUserClock, title: 'Clock in to start', color: '#4f46e5' },
  ON_LEAVE: { icon: FaUmbrellaBeach, title: 'You’re on leave today', color: '#d97706' },
  SHIFT_ENDED: { icon: FaLock, title: 'Your shift has ended', color: '#dc2626' },
};

export default function StaffAccessGate() {
  const pathname = usePathname() || '';
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState(null); // /me response
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState('');
  const userRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  const rid = () => { try { return localStorage.getItem('selectedRestaurantId'); } catch { return null; } };

  const check = useCallback(async (fresh = false) => {
    const user = apiClient.getUser ? apiClient.getUser() : null;
    userRef.current = user;
    const role = String(user?.role || '').toLowerCase();
    const r = rid();
    if (!user || !r || NEVER_RESTRICTED.includes(role)) { setState(null); return; }
    try {
      const res = await apiClient.getStaffAccessMe(r, { fresh });
      if (apiClient.setStaffAccess) apiClient.setStaffAccess(res);
      setState(res);
      try { window.dispatchEvent(new CustomEvent('staffAccessChanged', { detail: res })); } catch (_) { /* ignore */ }
    } catch (_) { /* never block on a failed check */ }
  }, []);

  useEffect(() => {
    if (!mounted) return undefined;
    check(true);
    const onBlocked = () => check(true);
    const onFocus = () => check(false);
    window.addEventListener('staffAccessBlocked', onBlocked);
    window.addEventListener('focus', onFocus);
    window.addEventListener('restaurantChanged', onBlocked);
    const id = setInterval(() => check(false), POLL_MS);
    return () => {
      window.removeEventListener('staffAccessBlocked', onBlocked);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('restaurantChanged', onBlocked);
      clearInterval(id);
    };
  }, [mounted, check]);

  const blocked = !!(state && state.restricted && state.clock && state.clock.ok === false);
  if (!mounted || !blocked || FREE_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) return null;

  const reason = state.clock.reason || 'NOT_CLOCKED_IN';
  const t = TITLES[reason] || TITLES.NOT_CLOCKED_IN;
  const Icon = t.icon;
  const shift = state.clock.shift || state.clock.nextShift;
  const me = userRef.current || {};

  const clockIn = async () => {
    setBusy(true); setMsg('');
    try {
      await apiClient.request(`/api/attendance/${rid()}/clock-in`, { method: 'POST', body: JSON.stringify({ staffId: me.id || me.userId, staffName: me.name || '' }) });
      await check(true);
    } catch (e) { setMsg(e.message || 'Could not clock in'); }
    finally { setBusy(false); }
  };
  const override = async () => {
    if (!/^\d{4,8}$/.test(pin)) { setMsg('Enter the manager’s 4–8 digit PIN'); return; }
    setBusy(true); setMsg('');
    try {
      await apiClient.staffAccessOverride(rid(), { staffId: me.id || me.userId, pin });
      setPin(''); setPinOpen(false);
      await check(true);
    } catch (e) { setMsg(e.message || 'Wrong PIN'); }
    finally { setBusy(false); }
  };
  const logout = () => {
    try { apiClient.forceLogout && apiClient.forceLogout(); } catch (_) { /* ignore */ }
    if (!window.__DINEOPEN_MOBILE_EMBED__) router.push('/login');
  };

  const btn = (bg, color = '#fff') => ({ padding: '12px 18px', borderRadius: 12, border: 'none', background: bg, color, fontWeight: 700, fontSize: 14, cursor: busy ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' });

  return createPortal(
    <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 10050, background: 'rgba(15,23,42,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 400, padding: 24, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: `${t.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Icon size={26} color={t.color} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>{t.title}</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>{state.message || ''}</p>
        {shift && (
          <div style={{ fontSize: 12, color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 10px', marginBottom: 14 }}>
            {state.clock.shift ? 'Your shift' : 'Next shift'}: <strong>{shift.startTime}–{shift.endTime}</strong>{shift.date ? ` · ${shift.date}` : ''}
          </div>
        )}
        <div style={{ display: 'grid', gap: 10 }}>
          {reason === 'NOT_CLOCKED_IN' && (
            <button type="button" disabled={busy} onClick={clockIn} style={btn('linear-gradient(135deg,#6366f1,#4f46e5)')}>
              <FaUserClock /> {busy ? 'Please wait…' : 'Clock in'}
            </button>
          )}
          {!pinOpen ? (
            <button type="button" disabled={busy} onClick={() => { setPinOpen(true); setMsg(''); }} style={btn('#f1f5f9', '#0f172a')}>
              <FaKey /> Manager PIN
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input autoFocus inputMode="numeric" type="password" maxLength={8} value={pin} placeholder="Manager PIN"
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))} onKeyDown={e => { if (e.key === 'Enter') override(); }}
                style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 16, letterSpacing: 4, textAlign: 'center' }} />
              <button type="button" disabled={busy} onClick={override} style={{ ...btn('#0f172a'), width: 'auto' }}>OK</button>
            </div>
          )}
          <button type="button" onClick={() => router.push('/attendance')} style={btn('#fff', '#4f46e5')}>My attendance & shifts</button>
          <button type="button" onClick={logout} style={{ ...btn('#fff', '#64748b'), fontWeight: 600 }}><FaSignOutAlt /> Log out</button>
        </div>
        {msg && <p style={{ fontSize: 12, color: '#dc2626', margin: '12px 0 0' }}>{msg}</p>}
      </div>
    </div>,
    document.body
  );
}
