'use client';

// Password reset — two modes:
//  • no ?token  → enter email → we email a one-time reset link (generic response, no enumeration)
//  • ?token=..  → set a new password (new + confirm) using the emailed one-time token
// Public page (outside the (dashboard) auth gate). useSearchParams requires a Suspense boundary.

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';

const card = { width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', padding: '32px 28px', boxSizing: 'border-box' };
const input = { width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const label = { display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 };
const btn = (disabled) => ({ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: disabled ? '#fca5a5' : '#ef4444', color: '#fff', fontSize: 15, fontWeight: 700, cursor: disabled ? 'default' : 'pointer', marginTop: 8 });

function ResetInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Request-link mode
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  // Reset mode
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  // Shared
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const requestLink = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Please enter your email');
    setBusy(true);
    try { await apiClient.forgotPassword(email.trim().toLowerCase()); setSent(true); }
    catch { setSent(true); } // generic — never reveal
    finally { setBusy(false); }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setError('');
    if (pw.length < 6) return setError('Password must be at least 6 characters');
    if (pw !== confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      const res = await apiClient.resetPassword(token, pw);
      if (res?.success) setDone(true);
      else setError(res?.error || 'This reset link is invalid or has expired.');
    } catch (err) {
      setError(err?.message || 'This reset link is invalid or has expired.');
    } finally { setBusy(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fdf6ec', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={card}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#ef4444' }}>🍽️ DineOpen</span>
        </div>

        {/* ── Set a new password (from the emailed link) ── */}
        {token ? (
          done ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <h2 style={{ margin: '0 0 6px', color: '#1f2937' }}>Password reset</h2>
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 18 }}>You can now log in with your new password.</p>
              <a href="/login" style={{ ...btn(false), display: 'inline-block', textDecoration: 'none', boxSizing: 'border-box' }}>Go to Login</a>
            </div>
          ) : (
            <form onSubmit={submitReset}>
              <h2 style={{ margin: '0 0 4px', color: '#1f2937', textAlign: 'center' }}>Set a new password</h2>
              <p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', marginBottom: 18 }}>Choose a new password for your account.</p>
              <div style={{ marginBottom: 14 }}>
                <label style={label}>New password</label>
                <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 6 characters" style={input} autoComplete="new-password" />
              </div>
              <div style={{ marginBottom: 6 }}>
                <label style={label}>Confirm password</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" style={input} autoComplete="new-password" />
              </div>
              {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{error}
                {/expired|invalid|used/i.test(error) && <> · <a href="/reset-password" style={{ color: '#ef4444', fontWeight: 600 }}>Request a new link</a></>}
              </div>}
              <button type="submit" disabled={busy || !pw || !confirm} style={btn(busy || !pw || !confirm)}>{busy ? 'Resetting…' : 'Reset Password'}</button>
            </form>
          )
        ) : (
          // ── Request a reset link ──
          sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📧</div>
              <h2 style={{ margin: '0 0 6px', color: '#1f2937' }}>Check your email</h2>
              <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 18 }}>If an account exists for <b>{email}</b>, we've sent a link to reset your password. It expires in 30 minutes.</p>
              <a href="/login" style={{ color: '#ef4444', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>← Back to Login</a>
            </div>
          ) : (
            <form onSubmit={requestLink}>
              <h2 style={{ margin: '0 0 4px', color: '#1f2937', textAlign: 'center' }}>Forgot password?</h2>
              <p style={{ color: '#6b7280', fontSize: 13, textAlign: 'center', marginBottom: 18 }}>Enter your email and we'll send you a link to reset it.</p>
              <div style={{ marginBottom: 6 }}>
                <label style={label}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={input} autoComplete="email" />
              </div>
              {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 8 }}>{error}</div>}
              <button type="submit" disabled={busy || !email} style={btn(busy || !email)}>{busy ? 'Sending…' : 'Send reset link'}</button>
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <a href="/login" style={{ color: '#6b7280', fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>← Back to Login</a>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Loading…</div>}>
      <ResetInner />
    </Suspense>
  );
}
