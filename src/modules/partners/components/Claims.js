'use client';

import { useCallback, useEffect, useState } from 'react';
import { Send, Clock3, CheckCircle2, XCircle } from 'lucide-react';
import partnerApi from '../api';
import { date } from '../format';
import { Alert, Button, Card, Field, PageHeader, inputCls, textareaCls, cx } from './ui';

const LABEL = {
  pending: ['Waiting for review', 'text-amber-700 bg-amber-50 ring-amber-600/20', Clock3],
  approved: ['Approved — linked to you', 'text-emerald-700 bg-emerald-50 ring-emerald-600/20', CheckCircle2],
  rejected: ['Not approved', 'text-red-700 bg-red-50 ring-red-600/20', XCircle],
};

export default function Claims() {
  const [claims, setClaims] = useState(null);
  const [lookup, setLookup] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState({ ok: '', err: '' });
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => partnerApi.claims().then(r => setClaims(r.claims)).catch(e => setMsg({ ok: '', err: e.message })), []);
  useEffect(() => { load(); }, [load]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg({ ok: '', err: '' });
    try {
      await partnerApi.createClaim({ lookup: lookup.trim(), note: note.trim() });
      setLookup(''); setNote('');
      setMsg({ ok: 'Sent. We will check it and let you know.', err: '' });
      await load();
    } catch (err) { setMsg({ ok: '', err: err.message }); } finally { setBusy(false); }
  }
  return (
    <div>
      <PageHeader title="Claims" subtitle="Brought us a restaurant that signed up without your link? Ask us to link it to you." />
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6 items-start">
        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <h2 className="font-semibold text-slate-900">Claim an existing client</h2>
            <Field label="Owner's phone or e-mail"><input className={inputCls} placeholder="+1 555 123 4567 or owner@restaurant.com" value={lookup} onChange={e => setLookup(e.target.value)} required maxLength={120} /></Field>
            <Field label="How did you bring them?" hint="A short note helps us approve faster."><textarea className={textareaCls} rows={3} value={note} onChange={e => setNote(e.target.value)} maxLength={1000} /></Field>
            {msg.ok && <Alert tone="success">{msg.ok}</Alert>}
            {msg.err && <Alert tone="error">{msg.err}</Alert>}
            <Button variant="brand" icon={Send} busy={busy}>{busy ? 'Sending…' : 'Send claim'}</Button>
          </form>
        </Card>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Your claims</h2>
          {claims && !claims.length && <Card className="p-8 text-center text-sm text-slate-500">You haven&apos;t sent any claims.</Card>}
          {claims && claims.length > 0 && (
            <Card className="divide-y divide-slate-100">
              {claims.map(c => {
                const [t, cls, Icon] = LABEL[c.status] || [c.status, 'text-slate-600 bg-slate-50 ring-slate-500/20', Clock3];
                return (
                  <div key={c.id} className="p-4 flex gap-3 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 truncate">{c.clientName || c.lookup}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Sent {date(c.createdAt)}{c.decisionNote ? ` · ${c.decisionNote}` : ''}</div>
                    </div>
                    <span className={cx('inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 ring-1 ring-inset whitespace-nowrap', cls)}><Icon className="w-3.5 h-3.5" />{t}</span>
                  </div>
                );
              })}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
