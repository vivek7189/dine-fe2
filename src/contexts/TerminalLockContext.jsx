'use client';

// Terminal PIN lock (shared POS). Flag-gated by posSettings.terminalLock.enabled —
// when off, this is a pass-through (no overlay, no behavior change). When on, the
// POS is covered by a PIN pad; a staff enters their PIN to unlock and becomes the
// "operator" that the next orders are attributed to. Auto-locks after each order
// and/or after idle, per config. Operator session lives in sessionStorage so a
// page refresh doesn't force a re-PIN mid-order.

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import apiClient from '../lib/api';

const TerminalLockContext = createContext({
  enabled: false, locked: false, operator: null, lock: () => {}, lockAfterOrder: () => {},
});

export const useTerminalLock = () => useContext(TerminalLockContext);

const STORAGE_KEY = 'dineTerminalOperator';
const readOperator = () => {
  try { const v = sessionStorage.getItem(STORAGE_KEY); return v ? JSON.parse(v) : null; } catch { return null; }
};

export function TerminalLockProvider({ restaurantId, restaurantName, terminalLock, children }) {
  const enabled = !!(terminalLock && terminalLock.enabled);
  const mode = terminalLock?.mode || 'after-order'; // 'after-order' | 'idle' | 'both'
  const idleSeconds = Math.max(15, Number(terminalLock?.idleSeconds) || 60);

  // Pages the lock never covers:
  //  • /admin — ALWAYS (owner's escape hatch: reach settings to assign PINs / disable the
  //    lock, so enabling it before anyone has a PIN can't brick the terminal).
  //  • Any page the owner whitelisted as a passive display (e.g. the Kitchen Display /kot),
  //    which must stay fully visible + usable. Default when unset: /kot.
  // NOTE: pages NOT whitelisted are still locked — but the overlay is translucent, so the
  // live view shows through and only ACTIONS require the PIN (e.g. Tables status is visible;
  // opening a table to order asks for the PIN).
  const pathname = usePathname();
  const unlockedPages = Array.isArray(terminalLock?.unlockedPages) ? terminalLock.unlockedPages : ['/kot'];
  const overlaySuppressed = !!(pathname && (
    pathname === '/admin' || pathname.startsWith('/admin/') ||
    unlockedPages.some((p) => p && (pathname === p || pathname.startsWith(p + '/')))
  ));

  const [operator, setOperator] = useState(null);
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const idleTimer = useRef(null);

  // Decide the lock state on mount. The operator is stored in sessionStorage on unlock and
  // CLEARED by lock()/idle/after-order. sessionStorage survives an in-session document reload
  // (SPA nav, and the Electron app:// page reloads that happen on every left-nav click) but is
  // gone on a genuine app reopen / new tab. So:
  //   • operator present  → the terminal is mid-session and already unlocked → STAY unlocked
  //     (do NOT force a PIN on every navigation — this was the "random re-lock on nav" bug).
  //   • operator absent   → fresh reopen, or we were just locked (after-order/idle/manual) → LOCK.
  useEffect(() => {
    if (!enabled) { setLocked(false); setOperator(null); return; }
    const stored = readOperator();
    if (stored && stored.id) {
      setOperator(stored);   // resume the unlocked session (prefill/attribution)
      setLocked(false);
    } else {
      setLocked(true);       // reopen or post-lock → require the PIN
    }
  }, [enabled]);

  const lock = useCallback(() => {
    if (!enabled) return;
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
    setOperator(null); setPin(''); setError(''); setLocked(true);
  }, [enabled]);

  const lockAfterOrder = useCallback(() => {
    if (enabled && (mode === 'after-order' || mode === 'both')) lock();
  }, [enabled, mode, lock]);

  // Idle auto-lock
  useEffect(() => {
    if (!enabled || locked || !(mode === 'idle' || mode === 'both')) return;
    const reset = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => lock(), idleSeconds * 1000);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { events.forEach(e => window.removeEventListener(e, reset)); if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, [enabled, locked, mode, idleSeconds, lock]);

  const submitPin = useCallback(async (value) => {
    const p = String(value != null ? value : pin);
    if (!/^\d{4,8}$/.test(p) || busy) { setError('Enter a 4–8 digit PIN'); return; }
    setBusy(true); setError('');
    try {
      const res = await apiClient.verifyStaffPin(restaurantId, p);
      if (res && res.valid && res.operator) {
        const op = { ...res.operator, at: Date.now() };
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(op)); } catch {}
        setOperator(op); setLocked(false); setPin('');
      } else { setError('Wrong PIN'); setPin(''); }
    } catch (e) {
      setError(e?.message === 'Wrong PIN' || e?.response?.status === 401 ? 'Wrong PIN' : (e?.message || 'Could not verify PIN')); setPin('');
    } finally { setBusy(false); }
  }, [pin, busy, restaurantId]);

  const press = (d) => {
    setError('');
    setPin(prev => {
      const next = (prev + d).slice(0, 8);
      if (next.length >= 4 && d !== '') { /* allow manual submit; auto-submit at 4 optional */ }
      return next;
    });
  };

  // Escape valve — sign out entirely so the terminal can never be locked forever
  // (wrong account, or lock enabled before anyone had a PIN). Lands on /login; the
  // owner can then log in / disable the lock. Same pattern as Toast/Square/Clover.
  const signOut = useCallback(() => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
    try { apiClient.forceLogout(); } catch {}
    if (typeof window !== 'undefined') window.location.href = '/login';
  }, []);

  const ctx = { enabled, locked, operator, lock, lockAfterOrder };

  return (
    <TerminalLockContext.Provider value={ctx}>
      {children}
      {enabled && locked && !overlaySuppressed && (
        // Translucent + blurred so staff can glance at the screen state behind the lock,
        // while the overlay still captures every click (nothing is interactive until unlocked).
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(7px)', WebkitBackdropFilter: 'blur(7px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px', background: '#fff', borderRadius: '20px', padding: '26px 24px', boxShadow: '0 24px 70px rgba(0,0,0,0.4)', textAlign: 'center' }}>
            <button type="button" onClick={signOut} title="Sign out"
              style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#64748b', fontSize: '11px', fontWeight: 700 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign out
            </button>
            <div style={{ width: '54px', height: '54px', borderRadius: '16px', background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '24px' }}>🔒</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{restaurantName || 'Terminal locked'}</div>
            <div style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 16px' }}>Enter your PIN to continue</div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '14px', minHeight: '20px' }}>
              {Array.from({ length: Math.max(4, pin.length) }).map((_, i) => (
                <span key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: i < pin.length ? '#ef4444' : '#e2e8f0' }} />
              ))}
            </div>
            {error && <div style={{ color: '#dc2626', fontSize: '12.5px', fontWeight: 600, marginBottom: '10px' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['1','2','3','4','5','6','7','8','9'].map(d => (
                <button key={d} type="button" onClick={() => press(d)} disabled={busy}
                  style={{ padding: '16px 0', fontSize: '20px', fontWeight: 700, borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}>{d}</button>
              ))}
              <button type="button" onClick={() => { setPin(''); setError(''); }} disabled={busy}
                style={{ padding: '16px 0', fontSize: '13px', fontWeight: 700, borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}>Clear</button>
              <button type="button" onClick={() => press('0')} disabled={busy}
                style={{ padding: '16px 0', fontSize: '20px', fontWeight: 700, borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', cursor: 'pointer' }}>0</button>
              <button type="button" onClick={() => setPin(p => p.slice(0, -1))} disabled={busy}
                style={{ padding: '16px 0', fontSize: '18px', fontWeight: 700, borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}>⌫</button>
            </div>

            <button type="button" onClick={() => submitPin()} disabled={busy || pin.length < 4}
              style={{ width: '100%', marginTop: '14px', padding: '13px', fontSize: '15px', fontWeight: 800, borderRadius: '12px', border: 'none', cursor: busy || pin.length < 4 ? 'not-allowed' : 'pointer', color: '#fff', background: busy || pin.length < 4 ? '#fca5a5' : 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
              {busy ? 'Checking…' : 'Unlock'}
            </button>
          </div>
        </div>
      )}
    </TerminalLockContext.Provider>
  );
}

export default TerminalLockContext;
