'use client';

// Partner login: e-mail + password (given by DineOpen) or phone OTP (Firebase phone auth — the server
// takes the number from the verified token).
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '../../../../firebase';
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import partnerApi, { partnerToken } from '../api';

export default function PartnerLogin() {
  const router = useRouter();
  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const captchaRef = useRef(null);
  const verifierRef = useRef(null);

  useEffect(() => { if (partnerToken.get()) router.replace('/partner'); }, [router]);
  useEffect(() => () => { try { verifierRef.current && verifierRef.current.clear(); } catch (_) { /* gone */ } }, []);

  const done = (res) => { partnerToken.set(res.token); router.replace('/partner'); };

  async function loginEmail(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try { done(await partnerApi.login(email.trim(), password)); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function sendOtp(e) {
    e.preventDefault();
    setError('');
    const full = phone.trim().replace(/[^\d+]/g, '');
    if (!/^\+\d{8,15}$/.test(full)) { setError('Enter your number with country code, e.g. +1 555 123 4567 or +91 98765 43210'); return; }
    setBusy(true);
    try {
      if (!verifierRef.current) {
        captchaRef.current.innerHTML = '';
        const el = document.createElement('div');
        captchaRef.current.appendChild(el);
        verifierRef.current = new RecaptchaVerifier(auth, el, { size: 'invisible' });
      }
      setConfirmation(await signInWithPhoneNumber(auth, full, verifierRef.current));
    } catch (err) {
      try { verifierRef.current && verifierRef.current.clear(); } catch (_) { /* gone */ }
      verifierRef.current = null;
      setError(/too-many-requests/.test(String(err && err.code)) ? 'Too many tries. Please wait a while and try again.' : 'Could not send the code. Check the number and try again.');
    } finally { setBusy(false); }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      const result = await confirmation.confirm(otp.trim());
      const idToken = await result.user.getIdToken();
      try { await auth.signOut(); } catch (_) { /* only needed the token */ }
      done(await partnerApi.phoneLogin(idToken));
    } catch (err) {
      setError(err && err.status !== undefined ? err.message : 'Wrong code. Please try again.');
    } finally { setBusy(false); }
  }

  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-400';
  const btn = 'w-full rounded-lg py-2.5 font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 disabled:opacity-60';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-2xl font-extrabold text-gray-900">DineOpen <span className="text-red-600">Partners</span></div>
          <p className="text-sm text-gray-500 mt-1">Log in to see your clients, earnings and payouts.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-5" role="tablist">
            {[['email', 'E-mail & password'], ['phone', 'Phone OTP']].map(([k, t]) => (
              <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => { setMode(k); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md ${mode === k ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>{t}</button>
            ))}
          </div>

          {mode === 'email' && (
            <form onSubmit={loginEmail} className="space-y-3">
              <input className={input} type="email" autoComplete="username" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
              <input className={input} type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button className={btn} disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
            </form>
          )}

          {mode === 'phone' && !confirmation && (
            <form onSubmit={sendOtp} className="space-y-3">
              <input className={input} type="tel" autoComplete="tel" placeholder="+1 555 123 4567" value={phone} onChange={e => setPhone(e.target.value)} required />
              <p className="text-xs text-gray-500">Use the number registered with DineOpen. We&apos;ll text you a code.</p>
              <button className={btn} disabled={busy}>{busy ? 'Sending…' : 'Send code'}</button>
            </form>
          )}
          {mode === 'phone' && confirmation && (
            <form onSubmit={verifyOtp} className="space-y-3">
              <input className={`${input} tracking-widest text-center`} inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
              <button className={btn} disabled={busy || otp.length < 6}>{busy ? 'Checking…' : 'Verify & log in'}</button>
              <button type="button" className="w-full text-sm text-gray-500" onClick={() => { setConfirmation(null); setOtp(''); }}>Use a different number</button>
            </form>
          )}
          <div ref={captchaRef} />

          {error && <div role="alert" className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        </div>
        <p className="text-center text-sm text-gray-500 mt-5">
          Not a partner yet? <Link href="/partners#apply" className="text-red-600 font-semibold">Apply here</Link>
        </p>
      </div>
    </div>
  );
}
