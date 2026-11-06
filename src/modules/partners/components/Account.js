'use client';

import { useState } from 'react';
import partnerApi, { partnerToken } from '../api';
import { date } from '../format';

export default function Account({ partner }) {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [msg, setMsg] = useState({ ok: '', err: '' });
  const [busy, setBusy] = useState(false);

  async function changePw(e) {
    e.preventDefault();
    setBusy(true); setMsg({ ok: '', err: '' });
    try {
      const r = await partnerApi.changePassword(cur, next);
      partnerToken.set(r.token); // other devices are logged out; this one keeps going
      setCur(''); setNext('');
      setMsg({ ok: 'Password changed. Other devices have been logged out.', err: '' });
    } catch (err) { setMsg({ ok: '', err: err.message }); } finally { setBusy(false); }
  }
  async function logoutAll() {
    if (!window.confirm('Log out on every device, including this one?')) return;
    try { await partnerApi.logoutEverywhere(); } catch (_) { /* token already dead */ }
    partnerToken.clear(); window.location.href = '/partner/login';
  }
  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm';
  return (
    <div className="space-y-4 max-w-xl">
      <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm">
        <div className="font-bold text-gray-900 mb-2">Your details</div>
        <dl className="grid grid-cols-2 gap-y-1">
          <dt className="text-gray-500">Name</dt><dd className="font-semibold">{partner.name}</dd>
          {partner.company && <><dt className="text-gray-500">Company</dt><dd className="font-semibold">{partner.company}</dd></>}
          <dt className="text-gray-500">Partner code</dt><dd className="font-semibold">{partner.code}</dd>
          <dt className="text-gray-500">E-mail</dt><dd className="font-semibold">{partner.email || '—'}</dd>
          <dt className="text-gray-500">Phone</dt><dd className="font-semibold">{partner.phone || '—'}</dd>
          <dt className="text-gray-500">Last login</dt><dd className="font-semibold">{date(partner.lastLoginAt)}</dd>
        </dl>
        <p className="text-xs text-gray-500 mt-2">To change your name, e-mail or phone, contact DineOpen.</p>
      </div>
      {partner.email && (
        <form onSubmit={changePw} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="font-bold text-gray-900">{partner.hasPassword ? 'Change password' : 'Set a password'}</div>
          {partner.hasPassword && <input className={input} type="password" autoComplete="current-password" placeholder="Current password" value={cur} onChange={e => setCur(e.target.value)} required />}
          <input className={input} type="password" autoComplete="new-password" placeholder="New password (10+ characters, letters and numbers)" value={next} onChange={e => setNext(e.target.value)} required minLength={10} />
          <button disabled={busy} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-60">{busy ? 'Saving…' : 'Save password'}</button>
          {msg.ok && <div className="text-sm text-green-700">{msg.ok}</div>}
          {msg.err && <div role="alert" className="text-sm text-red-700">{msg.err}</div>}
        </form>
      )}
      <button type="button" onClick={logoutAll} className="text-sm text-red-600 underline">Log out on all devices</button>
    </div>
  );
}
