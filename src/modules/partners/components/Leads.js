'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Target, Phone, Mail, MapPin, Pencil, Trash2 } from 'lucide-react';
import partnerApi from '../api';
import { date } from '../format';
import { Alert, Button, Card, EmptyState, Field, Loading, Modal, PageHeader, Segmented, inputCls, textareaCls, cx } from './ui';

const STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['demo', 'Demo done'], ['won', 'Signed up'], ['lost', 'Not interested']];
const STATUS_STYLE = {
  new: 'bg-slate-50 text-slate-700 ring-slate-500/20',
  contacted: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  demo: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  won: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  lost: 'bg-slate-50 text-slate-500 ring-slate-400/20',
};
const EMPTY = { businessName: '', contactName: '', phone: '', email: '', city: '', notes: '', status: 'new' };

function initials(s) {
  return String(s || '?').replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

export default function Leads() {
  const [leads, setLeads] = useState(null);
  const [form, setForm] = useState(null); // null | { ...lead, id? }
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const load = useCallback(() => partnerApi.leads().then(r => setLeads(r.leads)).catch(e => { setError(e.message); setLeads(l => l || []); }), []);
  useEffect(() => { load(); }, [load]);
  const close = useCallback(() => { setForm(null); setFormError(''); }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true); setFormError('');
    try {
      const { id, ...body } = form;
      delete body.linkedClient; delete body.createdAt; delete body.updatedAt;
      if (id) await partnerApi.updateLead(id, body); else await partnerApi.createLead(body);
      close(); await load();
    } catch (err) { setFormError(err.message); } finally { setBusy(false); }
  }
  async function setStatus(l, status) {
    setError('');
    setLeads(ls => ls.map(x => (x.id === l.id ? { ...x, status } : x)));
    try { await partnerApi.updateLead(l.id, { status }); } catch (err) { setError(err.message); load(); }
  }
  async function remove(id) {
    if (!window.confirm('Delete this lead?')) return;
    try { await partnerApi.deleteLead(id); close(); await load(); } catch (err) { setFormError(err.message); }
  }

  const counts = useMemo(() => Object.fromEntries(STATUSES.map(([k]) => [k, (leads || []).filter(l => l.status === k).length])), [leads]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (leads || [])
      .filter(l => filter === 'all' || l.status === filter)
      .filter(l => !s || [l.businessName, l.city, l.contactName, l.phone, l.email].some(v => String(v || '').toLowerCase().includes(s)));
  }, [leads, filter, q]);

  const add = <Button variant="brand" icon={Plus} onClick={() => setForm({ ...EMPTY })}>Add lead</Button>;

  return (
    <div>
      <PageHeader title="Leads" subtitle="Restaurants you're talking to. Only you and DineOpen can see these." action={leads && leads.length > 0 ? add : null} />
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {!leads ? <Loading rows={5} /> : !leads.length ? (
        <EmptyState icon={Target} title="No leads yet" text="Add the restaurants you're talking to so DineOpen knows they're yours — within 48 hours of first contact." action={add} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row gap-3 md:items-center mb-4">
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <Segmented value={filter} onChange={setFilter} options={[['all', 'All', leads.length], ...STATUSES.map(([k, t]) => [k, t, counts[k]])]} />
            </div>
            <div className="relative md:ml-auto md:w-64">
              <Search className="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, city, phone…" className={cx(inputCls, '!pl-9')} aria-label="Search leads" />
            </div>
          </div>

          {!shown.length ? (
            <Card className="p-10 text-center text-sm text-slate-500">No leads match.</Card>
          ) : (
            <Card className="divide-y divide-slate-100 overflow-hidden">
              {shown.map(l => (
                <div key={l.id} className="p-4 sm:px-5 flex gap-4 items-start hover:bg-slate-50/60 transition">
                  <div className="hidden sm:flex w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-xs font-semibold items-center justify-center">{initials(l.businessName)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <button type="button" onClick={() => setForm({ ...l })} className="font-semibold text-slate-900 hover:text-red-700 text-left">{l.businessName}</button>
                      {l.linkedClient && <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 rounded-full px-2 py-0.5">Client</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[13px] text-slate-500">
                      {l.city && <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{l.city}</span>}
                      {l.phone && <a href={`tel:${l.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-1 hover:text-slate-800"><Phone className="w-3.5 h-3.5" />{l.phone}</a>}
                      {l.email && <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1 hover:text-slate-800 truncate max-w-[16rem]"><Mail className="w-3.5 h-3.5 shrink-0" /><span className="truncate">{l.email}</span></a>}
                      {l.contactName && <span>{l.contactName}</span>}
                    </div>
                    {l.notes && <p className="text-[13px] text-slate-600 mt-2 line-clamp-2">{l.notes}</p>}
                    <div className="text-[11px] text-slate-400 mt-1.5">Updated {date(l.updatedAt)}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <select value={l.status} onChange={e => setStatus(l, e.target.value)} aria-label={`Status of ${l.businessName}`}
                      className={cx('h-7 !rounded-full !pl-2.5 !pr-7 !py-0 !text-xs font-medium ring-1 ring-inset !border-0 cursor-pointer focus:outline-none focus:ring-2', STATUS_STYLE[l.status] || STATUS_STYLE.new)}>
                      {STATUSES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
                    </select>
                    <button type="button" onClick={() => setForm({ ...l })} className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  </div>
                </div>
              ))}
            </Card>
          )}
          <p className="text-xs text-slate-400 mt-3">{shown.length} of {leads.length} lead{leads.length === 1 ? '' : 's'}</p>
        </>
      )}

      <Modal open={!!form} title={form && form.id ? 'Edit lead' : 'Add lead'} onClose={close} wide>
        {form && (
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
            <Field label="Business name *" className="sm:col-span-2"><input className={inputCls} value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} required maxLength={160} autoFocus /></Field>
            <Field label="Contact person"><input className={inputCls} value={form.contactName || ''} onChange={e => setForm({ ...form, contactName: e.target.value })} maxLength={120} /></Field>
            <Field label="City"><input className={inputCls} value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} maxLength={80} /></Field>
            <Field label="Phone"><input className={inputCls} value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={30} /></Field>
            <Field label="E-mail"><input className={inputCls} type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Status" className="sm:col-span-2">
              <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
            </Field>
            <Field label="Notes" className="sm:col-span-2"><textarea className={textareaCls} rows={4} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} maxLength={2000} /></Field>
            {formError && <Alert tone="error" className="sm:col-span-2">{formError}</Alert>}
            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              {form.id && <Button type="button" variant="danger" icon={Trash2} onClick={() => remove(form.id)}>Delete</Button>}
              <div className="ml-auto flex gap-2">
                <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
                <Button variant="brand" busy={busy}>{busy ? 'Saving…' : 'Save lead'}</Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
