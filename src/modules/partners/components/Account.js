'use client';

import { useState } from 'react';
import { KeyRound, LogOut } from 'lucide-react';
import partnerApi, { partnerToken } from '../api';
import { date } from '../format';
import { Alert, Button, Card, Field, PageHeader, inputCls } from './ui';

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
  const rows = [['Name', partner.name], ['Company', partner.company], ['Partner code', partner.code], ['E-mail', partner.email || '—'], ['Phone', partner.phone || '—'], ['Last login', date(partner.lastLoginAt)]].filter(([, v]) => v);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Account" subtitle="Your partner profile and sign-in." />
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="font-semibold text-slate-900">Your details</h2>
          <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 mt-5 text-sm">
            {rows.map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium text-slate-800 mt-0.5 break-words">{v}</dd></div>)}
          </dl>
          <p className="text-xs text-slate-500 mt-5 pt-4 border-t border-slate-100">To change your name, e-mail or phone, write to <a className="font-medium text-slate-700 hover:underline" href="mailto:info@dineopen.com">info@dineopen.com</a>.</p>
        </Card>

        {partner.email && (
          <Card className="p-6">
            <form onSubmit={changePw} className="space-y-4">
              <div className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-slate-400" /><h2 className="font-semibold text-slate-900">{partner.hasPassword ? 'Change password' : 'Set a password'}</h2></div>
              <div className="grid sm:grid-cols-2 gap-4">
                {partner.hasPassword && <Field label="Current password"><input className={inputCls} type="password" autoComplete="current-password" value={cur} onChange={e => setCur(e.target.value)} required /></Field>}
                <Field label="New password" hint="10+ characters, letters and numbers."><input className={inputCls} type="password" autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} required minLength={10} /></Field>
              </div>
              {msg.ok && <Alert tone="success">{msg.ok}</Alert>}
              {msg.err && <Alert tone="error">{msg.err}</Alert>}
              <Button busy={busy}>{busy ? 'Saving…' : 'Save password'}</Button>
            </form>
          </Card>
        )}

        <Card className="p-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1"><div className="font-semibold text-slate-900">Sign out everywhere</div><div className="text-sm text-slate-500 mt-0.5">Logs out every device, including this one.</div></div>
          <Button variant="secondary" icon={LogOut} onClick={logoutAll} className="text-red-600">Log out on all devices</Button>
        </Card>
      </div>
    </div>
  );
}
