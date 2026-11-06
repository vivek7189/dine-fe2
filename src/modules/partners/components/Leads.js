'use client';

import { useEffect, useState } from 'react';
import partnerApi from '../api';
import { date } from '../format';

const STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['demo', 'Demo done'], ['won', 'Signed up'], ['lost', 'Not interested']];
const EMPTY = { businessName: '', contactName: '', phone: '', email: '', city: '', notes: '', status: 'new' };

export default function Leads() {
  const [leads, setLeads] = useState(null);
  const [form, setForm] = useState(null); // null | { ...lead, id? }
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => partnerApi.leads().then(r => setLeads(r.leads)).catch(e => setError(e.message));
  useEffect(() => { load(); }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { id, ...body } = form;
      delete body.linkedClient; delete body.createdAt; delete body.updatedAt;
      if (id) await partnerApi.updateLead(id, body); else await partnerApi.createLead(body);
      setForm(null); await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function remove(id) {
    if (!window.confirm('Delete this lead?')) return;
    try { await partnerApi.deleteLead(id); await load(); } catch (err) { setError(err.message); }
  }
  const input = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm';
  if (!leads) return <div className="text-gray-500 text-sm">{error || 'Loading…'}</div>;
  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <p className="text-sm text-gray-600 flex-1">Businesses you are talking to. Only you (and DineOpen) can see these.</p>
        {!form && <button type="button" onClick={() => setForm({ ...EMPTY })} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold">Add lead</button>}
      </div>
      {error && <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
      {form && (
        <form onSubmit={save} className="bg-white border border-gray-200 rounded-xl p-4 grid md:grid-cols-2 gap-3">
          <input className={input} placeholder="Business name *" value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} required maxLength={160} />
          <input className={input} placeholder="Contact person" value={form.contactName || ''} onChange={e => setForm({ ...form, contactName: e.target.value })} maxLength={120} />
          <input className={input} placeholder="Phone" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={30} />
          <input className={input} placeholder="E-mail" type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input className={input} placeholder="City" value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} maxLength={80} />
          <select className={input} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
          <textarea className={`${input} md:col-span-2`} rows={2} placeholder="Notes" value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} maxLength={2000} />
          <div className="md:col-span-2 flex gap-2">
            <button disabled={busy} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-60">{busy ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setForm(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-sm">Cancel</button>
          </div>
        </form>
      )}
      {!leads.length && !form && <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">No leads yet.</div>}
      <div className="grid gap-2">
        {leads.map(l => (
          <div key={l.id} className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap gap-2 items-center">
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900">{l.businessName}{l.city ? <span className="text-gray-500 font-normal"> · {l.city}</span> : null}</div>
              <div className="text-xs text-gray-500">{[l.contactName, l.phone, l.email].filter(Boolean).join(' · ') || '—'} · updated {date(l.updatedAt)}</div>
              {l.notes && <div className="text-xs text-gray-600 mt-1 whitespace-pre-wrap">{l.notes}</div>}
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{(STATUSES.find(s => s[0] === l.status) || [, l.status])[1]}</span>
            <button type="button" onClick={() => setForm({ ...l })} className="text-sm text-gray-700 underline">Edit</button>
            <button type="button" onClick={() => remove(l.id)} className="text-sm text-red-600 underline">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
