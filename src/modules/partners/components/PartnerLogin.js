'use client';

// Partner login + free self sign-up. Phone OTP or Google (Firebase — the server takes the number /
// e-mail from the verified token), or e-mail + password for partners DineOpen set up. A phone / Google
// account that isn't a partner yet gets one short "create your partner account" step. Partner
// accounts are separate from restaurant logins (own table, own token) — nothing here touches them.
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Percent, LineChart, Wallet, ShieldCheck, User, Building2, Globe, ArrowLeft } from 'lucide-react';
import { auth } from '../../../../firebase';
import { signInWithPhoneNumber, RecaptchaVerifier, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import partnerApi, { partnerToken } from '../api';
import { Alert, Button, cx } from './ui';

function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold shadow-lg shadow-red-600/30">D</div>
      <div className={cx('text-[17px] font-semibold tracking-tight', dark ? 'text-white' : 'text-slate-900')}>DineOpen <span className={dark ? 'text-red-400' : 'text-red-600'}>Partners</span></div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const PERKS = [
  [Percent, 'Recurring commission', 'Earn on every payment your restaurants make — not just the first one.'],
  [LineChart, 'Live tracking', 'See every sign-up, trial and payment the moment it happens.'],
  [Wallet, 'Reliable payouts', 'Monthly payouts by bank transfer, with a clear statement.'],
];

function IconInput({ icon: Icon, right, className = '', ...props }) {
  return (
    <div className="relative">
      <Icon className="absolute z-10 left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      <input {...props} className={cx('w-full h-11 !rounded-xl border !border-slate-200 bg-white !pl-10 !pr-3.5 !py-0 !text-[15px] text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:!border-red-400 focus:ring-4 focus:ring-red-500/10', right ? '!pr-11' : '', className)} />
      {right && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{right}</div>}
    </div>
  );
}

export default function PartnerLogin() {
  const router = useRouter();
  const [mode, setMode] = useState('phone'); // 'phone' | 'email' (password set by DineOpen)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  // NEW_PARTNER: { via, idToken, email, phone } → "create your partner account" step
  const [newAcct, setNewAcct] = useState(null);
  const [profile, setProfile] = useState({ name: '', company: '', country: '' });
  const captchaRef = useRef(null);
  const verifierRef = useRef(null);

  useEffect(() => { if (partnerToken.get()) router.replace('/partner'); }, [router]);
  useEffect(() => () => { try { verifierRef.current && verifierRef.current.clear(); } catch (_) { /* gone */ } }, []);

  const done = (res) => { partnerToken.set(res.token); router.replace('/partner'); };

  // Firebase was only needed for the ID token — sign out so nothing else on the site sees it.
  async function tokenThenSignOut(user) {
    const idToken = await user.getIdToken();
    try { await auth.signOut(); } catch (_) { /* only needed the token */ }
    return idToken;
  }

  async function afterVerify(via, idToken, call) {
    try { done(await call(idToken)); } catch (err) {
      if (err && err.code === 'NEW_PARTNER') {
        const v = (err.data && err.data.verified) || {};
        setNewAcct({ via, idToken, email: v.email || '', phone: v.phone || '' });
        setProfile(p => ({ ...p, name: p.name || v.name || '' }));
        setError('');
        return;
      }
      throw err;
    }
  }

  async function loginEmail(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try { done(await partnerApi.login(email.trim(), password)); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function loginGoogle() {
    setError(''); setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const idToken = await tokenThenSignOut(result.user);
      await afterVerify('google', idToken, partnerApi.googleLogin);
    } catch (err) {
      const c = String(err && err.code);
      if (/popup-closed|cancelled-popup/.test(c)) setError('');
      else if (/popup-blocked/.test(c)) setError('Your browser blocked the Google window. Allow pop-ups for dineopen.com and try again.');
      else setError(err && err.status !== undefined ? err.message : 'Google sign-in did not work. Please try again.');
    } finally { setBusy(false); }
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
      const idToken = await tokenThenSignOut(result.user);
      await afterVerify('phone', idToken, partnerApi.phoneLogin);
    } catch (err) {
      setError(err && err.status !== undefined ? err.message : 'Wrong code. Please try again.');
    } finally { setBusy(false); }
  }

  async function createAccount(e) {
    e.preventDefault();
    if (!profile.name.trim()) { setError('Please enter your name.'); return; }
    setError(''); setBusy(true);
    try {
      done(await partnerApi.signup({ idToken: newAcct.idToken, via: newAcct.via, name: profile.name.trim(), company: profile.company.trim(), country: profile.country.trim() }));
    } catch (err) {
      // Verification is valid ~1 hour; after that start again.
      if (err && err.status === 401) { setNewAcct(null); setConfirmation(null); setOtp(''); }
      setError(err && err.message ? err.message : 'Could not create the account. Please try again.');
    } finally { setBusy(false); }
  }

  const setP = (k) => (e) => setProfile(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel (desktop) */}
      <aside className="hidden lg:flex relative overflow-hidden bg-slate-950 text-white p-12 flex-col">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-red-600/25 blur-3xl" />
        <div className="absolute bottom-[-200px] right-[-120px] w-[480px] h-[480px] rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
        <div className="relative"><Logo dark /></div>
        <div className="relative my-auto max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-3 py-1 text-xs font-medium text-white/80 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Partner program
          </div>
          <h2 className="text-4xl font-semibold tracking-tight leading-[1.15]">Grow your income while restaurants grow with DineOpen.</h2>
          <p className="text-white/60 mt-4 text-[15px] leading-relaxed">Everything about your referrals — clients, leads, earnings and payouts — in one place.</p>
          <ul className="mt-10 space-y-5">
            {PERKS.map(([Icon, t, d]) => (
              <li key={t} className="flex gap-4">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center"><Icon className="w-[18px] h-[18px] text-red-300" /></div>
                <div><div className="font-medium">{t}</div><div className="text-sm text-white/55 mt-0.5">{d}</div></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs text-white/40">© {new Date().getFullYear()} DineOpen</div>
      </aside>

      {/* Form */}
      <main className="min-h-screen lg:min-h-0 flex flex-col px-5 sm:px-10 py-8 bg-slate-50 lg:bg-white">
        <div className="lg:hidden"><Logo /></div>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            {newAcct ? (
              <>
                <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Create your partner account</h1>
                <p className="text-slate-500 mt-1.5 text-[15px]">
                  {newAcct.via === 'google' ? <>Signed in as <span className="font-medium text-slate-700">{newAcct.email}</span>.</> : <>Number verified: <span className="font-medium text-slate-700">{newAcct.phone}</span>.</>}
                  {' '}One last step.
                </p>
                <form onSubmit={createAccount} className="space-y-4 mt-8">
                  <label className="block">
                    <span className="block text-[13px] font-medium text-slate-700 mb-1.5">Your name *</span>
                    <IconInput icon={User} autoComplete="name" placeholder="Full name" value={profile.name} onChange={setP('name')} required autoFocus />
                  </label>
                  <label className="block">
                    <span className="block text-[13px] font-medium text-slate-700 mb-1.5">Company <span className="text-slate-400 font-normal">(optional)</span></span>
                    <IconInput icon={Building2} autoComplete="organization" placeholder="Company or business name" value={profile.company} onChange={setP('company')} />
                  </label>
                  <label className="block">
                    <span className="block text-[13px] font-medium text-slate-700 mb-1.5">Country</span>
                    <IconInput icon={Globe} autoComplete="country-name" placeholder="e.g. Switzerland" value={profile.country} onChange={setP('country')} />
                  </label>
                  <Button variant="brand" size="lg" className="w-full" busy={busy}>{busy ? 'Creating…' : <>Create account <ArrowRight className="w-4 h-4" /></>}</Button>
                  <p className="text-xs text-slate-500 text-center leading-relaxed">Free. No fee, no contract to sign and no bank details needed now. You can add payout details later in your dashboard.</p>
                  <button type="button" className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-800" onClick={() => { setNewAcct(null); setConfirmation(null); setOtp(''); setError(''); }}><ArrowLeft className="w-4 h-4" /> Back</button>
                </form>
                {error && <Alert tone="error" className="mt-4">{error}</Alert>}
              </>
            ) : (
              <>
                <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">Partner login</h1>
                <p className="text-slate-500 mt-1.5 text-[15px]">New here? The same steps create your free partner account.</p>

                <button type="button" onClick={loginGoogle} disabled={busy}
                  className="mt-8 w-full h-12 rounded-xl border border-slate-200 bg-white flex items-center justify-center gap-3 text-[15px] font-medium text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-60">
                  <GoogleIcon /> Continue with Google
                </button>

                <div className="flex items-center gap-3 my-6 text-xs text-slate-400"><div className="h-px flex-1 bg-slate-200" />or<div className="h-px flex-1 bg-slate-200" /></div>

                {mode === 'phone' && !confirmation && (
                  <form onSubmit={sendOtp} className="space-y-4">
                    <label className="block">
                      <span className="block text-[13px] font-medium text-slate-700 mb-1.5">Mobile number</span>
                      <IconInput icon={Phone} type="tel" autoComplete="tel" placeholder="+41 79 123 45 67" value={phone} onChange={e => setPhone(e.target.value)} required />
                      <span className="block text-xs text-slate-500 mt-1.5">With country code. We&apos;ll text you a 6-digit code.</span>
                    </label>
                    <Button variant="brand" size="lg" className="w-full" busy={busy}>{busy ? 'Sending…' : 'Send code'}</Button>
                  </form>
                )}
                {mode === 'phone' && confirmation && (
                  <form onSubmit={verifyOtp} className="space-y-4">
                    <label className="block">
                      <span className="block text-[13px] font-medium text-slate-700 mb-1.5">Verification code</span>
                      <input className="w-full h-12 rounded-xl border border-slate-200 bg-white text-center text-xl tracking-[0.5em] font-semibold text-slate-900 focus:outline-none focus:!border-red-400 focus:ring-4 focus:ring-red-500/10" inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required autoFocus />
                      <span className="block text-xs text-slate-500 mt-1.5">Sent to {phone}</span>
                    </label>
                    <Button variant="brand" size="lg" className="w-full" busy={busy} disabled={otp.length < 6}>{busy ? 'Checking…' : 'Verify'}</Button>
                    <button type="button" className="w-full text-sm text-slate-500 hover:text-slate-800" onClick={() => { setConfirmation(null); setOtp(''); }}>Use a different number</button>
                  </form>
                )}

                {mode === 'email' && (
                  <form onSubmit={loginEmail} className="space-y-4">
                    <label className="block">
                      <span className="block text-[13px] font-medium text-slate-700 mb-1.5">E-mail</span>
                      <IconInput icon={Mail} type="email" autoComplete="username" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                    </label>
                    <label className="block">
                      <span className="block text-[13px] font-medium text-slate-700 mb-1.5">Password</span>
                      <IconInput icon={Lock} type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required
                        right={<button type="button" onClick={() => setShowPw(v => !v)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100" aria-label={showPw ? 'Hide password' : 'Show password'}>{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>} />
                    </label>
                    <Button variant="brand" size="lg" className="w-full" busy={busy}>{busy ? 'Logging in…' : <>Log in <ArrowRight className="w-4 h-4" /></>}</Button>
                    <p className="text-xs text-slate-500 text-center">Forgot your password? Write to <a href="mailto:info@dineopen.com" className="text-slate-700 font-medium hover:underline">info@dineopen.com</a></p>
                  </form>
                )}

                <div ref={captchaRef} />
                {error && <Alert tone="error" className="mt-4">{error}</Alert>}

                <div className="mt-5 text-center">
                  {mode === 'phone'
                    ? <button type="button" className="text-sm text-slate-500 hover:text-slate-800" onClick={() => { setMode('email'); setError(''); }}>Have a password from DineOpen? Log in with e-mail</button>
                    : <button type="button" className="text-sm text-slate-500 hover:text-slate-800" onClick={() => { setMode('phone'); setError(''); }}>Log in with your phone instead</button>}
                </div>
              </>
            )}

            <div className="mt-10 pt-6 border-t border-slate-200 text-sm text-slate-500 text-center">
              How the partner programme works: <Link href="/partners" className="text-red-600 font-medium hover:underline">see details</Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="w-3.5 h-3.5" /> Secured connection · Your data is encrypted</div>
      </main>
    </div>
  );
}
