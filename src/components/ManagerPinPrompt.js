'use client';

// Asks for the manager PIN when the server says an action needs one (Roles → "Needs manager PIN").
// lib/api.js calls window.__dineRequestManagerPin({ message, wrong }) → Promise<pin | null>, then retries
// the request with the PIN. Mounted once in the dashboard and /mobile layouts.
import { useEffect, useRef, useState } from 'react';

export default function ManagerPinPrompt() {
  const [ask, setAsk] = useState(null); // { message, wrong, resolve }
  const [pin, setPin] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    window.__dineRequestManagerPin = ({ message, wrong } = {}) => new Promise((resolve) => {
      setPin('');
      setAsk({ message: message || 'A manager PIN is needed for this.', wrong: !!wrong, resolve });
    });
    return () => { if (window.__dineRequestManagerPin) delete window.__dineRequestManagerPin; };
  }, []);

  useEffect(() => { if (ask && inputRef.current) inputRef.current.focus(); }, [ask]);

  if (!ask) return null;
  const done = (value) => { const r = ask.resolve; setAsk(null); setPin(''); r(value); };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="mgr-pin-title"
      style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onKeyDown={(e) => { if (e.key === 'Escape') done(null); }}>
      <form onSubmit={(e) => { e.preventDefault(); if (pin.trim()) done(pin.trim()); }}
        style={{ background: '#fff', borderRadius: 14, width: '100%', maxWidth: 340, padding: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
        <h2 id="mgr-pin-title" style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: '#111827' }}>Manager PIN</h2>
        <p style={{ margin: '0 0 12px', fontSize: 13.5, color: '#4b5563' }}>{ask.message}</p>
        {ask.wrong && <p role="alert" style={{ margin: '0 0 10px', fontSize: 13, color: '#b91c1c', fontWeight: 600 }}>Wrong PIN — try again.</p>}
        <label htmlFor="mgr-pin-input" style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>PIN</label>
        <input id="mgr-pin-input" ref={inputRef} type="password" inputMode="numeric" autoComplete="off" value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\s/g, '').slice(0, 12))}
          style={{ width: '100%', marginTop: 4, padding: '10px 12px', fontSize: 18, letterSpacing: 4, border: '1px solid #d1d5db', borderRadius: 10, boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => done(null)} style={{ padding: '9px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button type="submit" disabled={!pin.trim()} style={{ padding: '9px 16px', borderRadius: 8, border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 700, cursor: pin.trim() ? 'pointer' : 'not-allowed', opacity: pin.trim() ? 1 : 0.5 }}>Approve</button>
        </div>
      </form>
    </div>
  );
}
