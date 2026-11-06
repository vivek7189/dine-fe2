'use client';

// Leads: server-side paged table (GET /api/partners/leads?page&pageSize&q&status&sort), debounced
// search, status tabs with counts, detail drawer, add / edit modal.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Search, Target, Phone, Mail, MapPin, Pencil, Trash2, X, ChevronLeft, ChevronRight, ArrowUpDown, Loader2, Copy, Check, User, CalendarDays } from 'lucide-react';
import partnerApi from '../api';
import { date } from '../format';
import { Alert, Button, Card, Drawer, EmptyState, Field, Modal, PageHeader, inputCls, textareaCls, cx } from './ui';

const STATUSES = [['new', 'New'], ['contacted', 'Contacted'], ['demo', 'Demo done'], ['won', 'Signed up'], ['lost', 'Not interested']];
const STATUS_TEXT = Object.fromEntries(STATUSES);
const STATUS_STYLE = {
  new: ['bg-slate-50 text-slate-700 ring-slate-500/20', 'bg-slate-400'],
  contacted: ['bg-sky-50 text-sky-700 ring-sky-600/20', 'bg-sky-500'],
  demo: ['bg-violet-50 text-violet-700 ring-violet-600/20', 'bg-violet-500'],
  won: ['bg-emerald-50 text-emerald-700 ring-emerald-600/20', 'bg-emerald-500'],
  lost: ['bg-slate-50 text-slate-500 ring-slate-400/20', 'bg-slate-300'],
};
const SORTS = [['updated', 'Recently updated'], ['created', 'Newest first'], ['name', 'Name A–Z'], ['city', 'City'], ['status', 'Status']];
const PAGE_SIZES = [10, 25, 50, 100];
const EMPTY = { businessName: '', contactName: '', phone: '', email: '', city: '', notes: '', status: 'new' };

function initials(s) {
  return String(s || '?').replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}

function StatusPill({ status }) {
  const [cls, dot] = STATUS_STYLE[status] || STATUS_STYLE.new;
  return <span className={cx('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap', cls)}><span className={cx('w-1.5 h-1.5 rounded-full', dot)} />{STATUS_TEXT[status] || status}</span>;
}

// Compact page list: 1 … 4 5 6 … 12
function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const out = [1];
  const from = Math.max(2, page - 1);
  const to = Math.min(pages - 1, page + 1);
  if (from > 2) out.push('…');
  for (let i = from; i <= to; i++) out.push(i);
  if (to < pages - 1) out.push('…');
  out.push(pages);
  return out;
}

function CopyBtn({ value }) {
  const [ok, setOk] = useState(false);
  return (
    <button type="button" aria-label="Copy" onClick={async () => { try { await navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 1200); } catch (_) { /* no clipboard */ } }}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100">
      {ok ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function Leads() {
  const [query, setQuery] = useState({ page: 1, pageSize: 25, q: '', status: 'all', sort: 'updated' });
  const [search, setSearch] = useState('');
  const [res, setRes] = useState(null); // { leads, total, page, pages, pageSize, counts }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null); // lead shown in the drawer
  const [form, setForm] = useState(null); // add / edit modal
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const reqId = useRef(0);

  const load = useCallback(async (qy) => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const r = await partnerApi.leads(qy);
      if (id !== reqId.current) return; // a newer request is on its way
      // Page past the end (e.g. after a delete) → go to the last page.
      if (r.total > 0 && !r.leads.length && qy.page > 1) { setQuery(x => ({ ...x, page: Math.max(1, r.pages) })); return; }
      setRes(r); setError('');
    } catch (e) {
      if (id === reqId.current) setError(e.message);
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);
  useEffect(() => { load(query); }, [query, load]);

  // Debounced search → back to page 1.
  useEffect(() => {
    const t = setTimeout(() => setQuery(x => (x.q === search.trim() ? x : { ...x, q: search.trim(), page: 1 })), 300);
    return () => clearTimeout(t);
  }, [search]);

  const set = (patch) => setQuery(x => ({ ...x, page: 1, ...patch }));
  const closeForm = useCallback(() => { setForm(null); setFormError(''); }, []);
  const closeDrawer = useCallback(() => setOpen(null), []);

  async function save(e) {
    e.preventDefault();
    setBusy(true); setFormError('');
    try {
      const { id, ...body } = form;
      delete body.linkedClient; delete body.createdAt; delete body.updatedAt;
      const r = id ? await partnerApi.updateLead(id, body) : await partnerApi.createLead(body);
      closeForm();
      if (open && id === open.id) setOpen(r.lead);
      await load(id ? query : { ...query, page: 1 });
      if (!id && query.page !== 1) setQuery(x => ({ ...x, page: 1 }));
    } catch (err) { setFormError(err.message); } finally { setBusy(false); }
  }
  async function setStatus(l, status) {
    if (l.status === status) return;
    setError('');
    setRes(r => r && ({ ...r, leads: r.leads.map(x => (x.id === l.id ? { ...x, status } : x)) }));
    if (open && open.id === l.id) setOpen({ ...open, status });
    try { await partnerApi.updateLead(l.id, { status }); } catch (err) { setError(err.message); }
    load(query); // refresh counts / filtered list
  }
  async function remove(l) {
    if (!window.confirm(`Delete "${l.businessName}"?`)) return;
    try { await partnerApi.deleteLead(l.id); closeForm(); setOpen(null); await load(query); } catch (err) { setFormError(err.message); setError(err.message); }
  }

  const counts = (res && res.counts) || {};
  const nothingAtAll = res && counts.all === 0 && !query.q && query.status === 'all';
  const from = res && res.total ? (res.page - 1) * res.pageSize + 1 : 0;
  const to = res ? Math.min(res.total, res.page * res.pageSize) : 0;
  const addBtn = <Button variant="brand" icon={Plus} onClick={() => setForm({ ...EMPTY })}>Add lead</Button>;

  return (
    <div>
      <PageHeader title="Leads" subtitle="Restaurants you're talking to. Only you and DineOpen can see these." action={nothingAtAll ? null : addBtn} />
      {error && <Alert tone="error" className="mb-4">{error}</Alert>}

      {!res && loading && (
        <Card className="p-4 space-y-3 animate-pulse">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-11 rounded-lg bg-slate-100" />)}</Card>
      )}

      {nothingAtAll && (
        <EmptyState icon={Target} title="No leads yet" text="Add the restaurants you're talking to so DineOpen knows they're yours — within 48 hours of first contact." action={addBtn} />
      )}

      {res && !nothingAtAll && (
        <Card className="overflow-hidden">
          {/* Status tabs */}
          <div className="border-b border-slate-100 overflow-x-auto scrollbar-hide">
            <div className="flex px-2 min-w-max" role="tablist">
              {[['all', 'All'], ...STATUSES].map(([k, t]) => (
                <button key={k} type="button" role="tab" aria-selected={query.status === k} onClick={() => set({ status: k })}
                  className={cx('relative px-3.5 h-12 text-sm font-medium whitespace-nowrap transition-colors',
                    query.status === k ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800')}>
                  {t}
                  <span className={cx('ml-2 inline-flex min-w-[22px] justify-center rounded-full px-1.5 py-px text-[11px] tabular-nums',
                    query.status === k ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500')}>{(k === 'all' ? counts.all : counts[k]) ?? 0}</span>
                  {query.status === k && <span className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-red-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-2.5 p-3 sm:px-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, city, phone, e-mail, notes…" className={cx(inputCls, '!pl-9 !pr-9')} aria-label="Search leads" />
              {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="absolute z-10 right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <div className="flex items-center gap-2 sm:ml-auto">
              {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" aria-label="Loading" />}
              <label className="relative">
                <ArrowUpDown className="absolute z-10 left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <select value={query.sort} onChange={e => set({ sort: e.target.value })} aria-label="Sort" className={cx(inputCls, '!pl-8 !pr-8 sm:!w-56')}>
                  {SORTS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
                </select>
              </label>
            </div>
          </div>

          {/* Table (md+) */}
          <div className={cx('transition-opacity', loading && 'opacity-60')}>
            {!res.leads.length ? (
              <div className="py-16 text-center">
                <div className="mx-auto w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3"><Search className="w-5 h-5" /></div>
                <div className="font-medium text-slate-900">No leads match</div>
                <p className="text-sm text-slate-500 mt-1">Try another search or status.</p>
                {(query.q || query.status !== 'all') && <Button variant="secondary" size="sm" className="mt-4" onClick={() => { setSearch(''); setQuery(x => ({ ...x, q: '', status: 'all', page: 1 })); }}>Clear filters</Button>}
              </div>
            ) : (
              <>
                <table className="hidden md:table w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-medium text-slate-500 border-b border-slate-100">
                      <th className="pl-4 pr-3 py-3 font-medium">Restaurant</th>
                      <th className="px-3 py-3 font-medium">City</th>
                      <th className="px-3 py-3 font-medium">Contact</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 font-medium whitespace-nowrap">Updated</th>
                      <th className="pr-4 py-3 w-10"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {res.leads.map(l => (
                      <tr key={l.id} onClick={() => setOpen(l)} className={cx('group cursor-pointer hover:bg-slate-50/80', open && open.id === l.id && 'bg-red-50/40')}>
                        <td className="pl-4 pr-3 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center justify-center">{initials(l.businessName)}</div>
                            <div className="min-w-0">
                              <div className="font-medium text-slate-900 truncate max-w-[18rem] group-hover:text-red-700">{l.businessName}</div>
                              {l.contactName && <div className="text-xs text-slate-500 truncate">{l.contactName}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{l.city || '—'}</td>
                        <td className="px-3 py-3 text-slate-600">
                          <div className="whitespace-nowrap tabular-nums">{l.phone || '—'}</div>
                          {l.email && <div className="text-xs text-slate-500 truncate max-w-[14rem]">{l.email}</div>}
                        </td>
                        <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                          <label className="relative inline-flex">
                            <StatusPill status={l.status} />
                            <select value={l.status} onChange={e => setStatus(l, e.target.value)} aria-label={`Status of ${l.businessName}`} className="absolute inset-0 opacity-0 cursor-pointer">
                              {STATUSES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
                            </select>
                          </label>
                        </td>
                        <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{date(l.updatedAt)}</td>
                        <td className="pr-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                          <button type="button" onClick={() => setForm({ ...l })} aria-label={`Edit ${l.businessName}`} className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 focus:opacity-100"><Pencil className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* List (phones) */}
                <ul className="md:hidden divide-y divide-slate-100">
                  {res.leads.map(l => (
                    <li key={l.id}>
                      <button type="button" onClick={() => setOpen(l)} className="w-full text-left px-4 py-3.5 flex items-start gap-3 active:bg-slate-50">
                        <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center justify-center">{initials(l.businessName)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">{l.businessName}</div>
                          <div className="text-xs text-slate-500 mt-0.5 truncate">{[l.city, l.phone].filter(Boolean).join(' · ') || '—'}</div>
                        </div>
                        <StatusPill status={l.status} />
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Pagination */}
          {res.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-3 px-4 py-3 border-t border-slate-100 text-sm">
              <div className="text-slate-500">Showing <span className="font-medium text-slate-900 tabular-nums">{from}–{to}</span> of <span className="font-medium text-slate-900 tabular-nums">{res.total}</span></div>
              <label className="flex items-center gap-2 text-slate-500 sm:ml-4">
                Rows
                <select value={query.pageSize} onChange={e => set({ pageSize: Number(e.target.value) })} aria-label="Rows per page" className={cx(inputCls, '!h-8 !w-[72px] !pl-2.5 !pr-6 !text-[13px]')}>
                  {PAGE_SIZES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <nav className="flex items-center gap-1 sm:ml-auto" aria-label="Pages">
                <button type="button" disabled={res.page <= 1 || loading} onClick={() => setQuery(x => ({ ...x, page: x.page - 1 }))} aria-label="Previous page"
                  className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"><ChevronLeft className="w-4 h-4" /></button>
                {pageList(res.page, res.pages).map((p, i) => (p === '…'
                  ? <span key={`e${i}`} className="w-8 text-center text-slate-400">…</span>
                  : <button key={p} type="button" onClick={() => setQuery(x => ({ ...x, page: p }))} aria-current={p === res.page ? 'page' : undefined}
                    className={cx('min-w-8 h-8 px-2 rounded-lg text-[13px] font-medium tabular-nums', p === res.page ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100')}>{p}</button>))}
                <button type="button" disabled={res.page >= res.pages || loading} onClick={() => setQuery(x => ({ ...x, page: x.page + 1 }))} aria-label="Next page"
                  className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"><ChevronRight className="w-4 h-4" /></button>
              </nav>
            </div>
          )}
        </Card>
      )}

      {/* Detail drawer */}
      <Drawer open={!!open} title={open ? open.businessName : ''} onClose={closeDrawer}
        footer={open && (
          <div className="flex gap-2">
            <Button variant="danger" icon={Trash2} onClick={() => remove(open)}>Delete</Button>
            <Button className="ml-auto" icon={Pencil} onClick={() => setForm({ ...open })}>Edit lead</Button>
          </div>
        )}>
        {open && (
          <div className="space-y-6">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">Status</div>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map(([k, t]) => (
                  <button key={k} type="button" onClick={() => setStatus(open, k)}
                    className={cx('inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium ring-1 ring-inset transition',
                      open.status === k ? STATUS_STYLE[k][0] : 'bg-white text-slate-500 ring-slate-200 hover:ring-slate-300')}>
                    <span className={cx('w-1.5 h-1.5 rounded-full', open.status === k ? STATUS_STYLE[k][1] : 'bg-slate-300')} />{t}
                  </button>
                ))}
              </div>
            </div>
            <dl className="rounded-xl border border-slate-200 divide-y divide-slate-100 text-sm">
              {[
                [User, 'Contact person', open.contactName],
                [MapPin, 'City', open.city],
                [Phone, 'Phone', open.phone, open.phone && `tel:${open.phone.replace(/[^\d+]/g, '')}`],
                [Mail, 'E-mail', open.email, open.email && `mailto:${open.email}`],
              ].map(([Icon, k, v, href]) => (
                <div key={k} className="flex items-center gap-3 px-3.5 py-2.5">
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <dt className="text-slate-500 w-28 shrink-0">{k}</dt>
                  <dd className="flex-1 min-w-0 font-medium text-slate-800 truncate">{v ? (href ? <a href={href} className="hover:text-red-700">{v}</a> : v) : <span className="text-slate-400 font-normal">—</span>}</dd>
                  {v && <CopyBtn value={v} />}
                </div>
              ))}
            </dl>
            <div>
              <div className="text-xs font-medium text-slate-500 mb-2">Notes</div>
              {open.notes ? <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed rounded-xl bg-slate-50 p-3.5">{open.notes}</p> : <p className="text-sm text-slate-400">No notes.</p>}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />Added {date(open.createdAt)}</span>
              <span>Updated {date(open.updatedAt)}</span>
              {open.linkedClient && <span className="text-emerald-700 font-medium">Now a client</span>}
            </div>
          </div>
        )}
      </Drawer>

      {/* Add / edit */}
      <Modal open={!!form} title={form && form.id ? 'Edit lead' : 'Add lead'} onClose={closeForm} wide>
        {form && (
          <form onSubmit={save} className="grid sm:grid-cols-2 gap-4">
            <Field label="Business name *" className="sm:col-span-2"><input className={inputCls} value={form.businessName} onChange={e => setForm({ ...form, businessName: e.target.value })} required maxLength={160} autoFocus /></Field>
            <Field label="Contact person"><input className={inputCls} value={form.contactName || ''} onChange={e => setForm({ ...form, contactName: e.target.value })} maxLength={120} /></Field>
            <Field label="City"><input className={inputCls} value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} maxLength={80} /></Field>
            <Field label="Phone"><input className={inputCls} type="tel" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} maxLength={30} /></Field>
            <Field label="E-mail"><input className={inputCls} type="email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Status" className="sm:col-span-2">
              <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select>
            </Field>
            <Field label="Notes" className="sm:col-span-2"><textarea className={textareaCls} rows={4} value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} maxLength={2000} /></Field>
            {formError && <Alert tone="error" className="sm:col-span-2">{formError}</Alert>}
            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <div className="ml-auto flex gap-2">
                <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
                <Button variant="brand" busy={busy}>{busy ? 'Saving…' : form.id ? 'Save changes' : 'Add lead'}</Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
