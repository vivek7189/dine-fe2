'use client';

import { useEffect, useState } from 'react';
import partnerApi from '../api';
import { date } from '../format';

const LABEL = { pending: 'Waiting for review', approved: 'Approved — linked to you', rejected: 'Not approved' };

export default function Claims() {
  const [claims, setClaims] = useState(null);
  const [lookup, setLookup] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState({ ok: '', err: '' });
  const [busy, setBusy] = useState(false);
  const load = () => partnerApi.claims().then(r => setClaims(r.claims)).catch(e => setMsg({ ok: '', err: e.message }));
  useEffect(() => { load(); }, []);

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
    <div className="space-y-4">
      <form onSubmit={submit} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div>
          <h3 className="font-bold text-gray-900">Claim an existing client</h3>
          <p className="text-sm text-gray-600 mt-1">Brought us a restaurant that signed up without your link? Give us the owner&apos;s phone or e-mail and we&apos;ll review it.</p>
        </div>
        <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Owner's phone or e-mail" value={lookup} onChange={e => setLookup(e.target.value)} required maxLength={120} />
        <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows={2} placeholder="How did you bring them? (helps us approve faster)" value={note} onChange={e => setNote(e.target.value)} maxLength={1000} />
        <button disabled={busy} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-60">{busy ? 'Sending…' : 'Send claim'}</button>
        {msg.ok && <div className="text-sm text-green-700">{msg.ok}</div>}
        {msg.err && <div role="alert" className="text-sm text-red-700">{msg.err}</div>}
      </form>
      {claims && claims.length > 0 && (
        <div className="grid gap-2">
          {claims.map(c => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-3 text-sm">
              <div className="flex flex-wrap gap-2"><span className="font-semibold text-gray-900 flex-1">{c.clientName || c.lookup}</span><span className={c.status === 'approved' ? 'text-green-700' : c.status === 'rejected' ? 'text-red-700' : 'text-amber-700'}>{LABEL[c.status] || c.status}</span></div>
              <div className="text-xs text-gray-500 mt-0.5">Sent {date(c.createdAt)}{c.decisionNote ? ` · ${c.decisionNote}` : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
