'use client';

// Staff requests (asked by MFC for the staff "More" menu) — four kinds on one page:
//   Repairs       staff report something broken (where, how urgent, photos) → fixed
//   Suggestions   an idea or a problem, optionally without the sender's name
//   New dishes    R&D: a chef proposes a dish (ingredients, estimated cost + suggested price in the
//                 restaurant's own currency, photos) → the owner tries / approves / declines it
//   Marketing     the owner / a manager gives tasks (promotion, recruitment, offer, event, festival
//                 decoration, celebration…) with a due date to roles / staff; they post progress + photos
// Staff see their own (and marketing tasks given to them); owner / admin / manager see everything.
// ?kind=repair | suggestion | idea | task opens that tab.

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { Photos, PhotoPicker } from '../../../components/requests/RequestPhotos';
import RepairTicket, { RefTag } from '../../../components/requests/RepairTicket';

const MANAGER_ROLES = ['owner', 'admin', 'co-owner', 'manager'];
const KINDS = [['repair', 'Repairs'], ['suggestion', 'Suggestions'], ['idea', 'New dishes'], ['task', 'Marketing']];
const card = { background: '#fff', border: '1px solid #eef0f3', borderRadius: 14, padding: 16, marginBottom: 14 };
const muted = { color: '#6b7280', fontSize: 13 };
const h2 = { fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 10px' };
const input = { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' };
const label = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };
const pill = (bg, fg) => ({ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: bg, color: fg, whiteSpace: 'nowrap' });
const btn = (bg, fg = '#fff', border = 'none') => ({ padding: '9px 14px', borderRadius: 9, border, background: bg, color: fg, fontWeight: 700, fontSize: 13, cursor: 'pointer' });
const STATUS_STYLE = {
  open: pill('#fef3c7', '#92400e'), in_progress: pill('#dbeafe', '#1d4ed8'), done: pill('#dcfce7', '#15803d'), closed: pill('#f3f4f6', '#4b5563'),
};
// Status names per kind (a dish idea is "Trying it / Approved / Not now").
const STATUS_TEXT = {
  idea: { open: 'New', in_progress: 'Trying it', done: 'Approved', closed: 'Not now' },
  task: { open: 'To do', in_progress: 'In progress', done: 'Done', closed: 'Closed' },
  _: { open: 'Open', in_progress: 'In progress', done: 'Done', closed: 'Closed' },
};
const statusText = (kind, s) => (STATUS_TEXT[kind] || STATUS_TEXT._)[s] || s;
const URGENCY = { low: 'Low', normal: 'Normal', urgent: 'Urgent' };
// Generic worldwide wording — the owner's own words go in the title / details.
const TASK_CATEGORIES = [
  ['promotion', 'Promotion'], ['offer', 'Offer / discount'], ['recruitment', 'Staff recruitment'], ['event', 'Event (annual day…)'],
  ['decoration', 'Festival decorations'], ['celebration', 'Celebration (birthdays…)'], ['other', 'Other'],
];
const catName = (k) => (TASK_CATEGORIES.find(([x]) => x === k) || [null, 'Other'])[1];
const when = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const day = (ymd) => { if (!ymd) return ''; const d = new Date(`${ymd}T12:00:00`); return isNaN(d) ? ymd : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); };
const EMPTY = {
  title: '', details: '', location: '', urgency: 'normal', anonymous: false, photos: [],
  ingredients: '', course: '', estCost: '', suggestedPrice: '',
  category: 'promotion', dueDate: '', assignees: { roles: [], staffIds: [] },
};
const FORM_TEXT = {
  repair: { h: 'Report a repair', t: 'What needs repair?', tp: 'e.g. Fridge 2 not cooling', d: 'Details (optional)', dp: 'Since when, what happens…', ok: 'Sent — the manager has been told.', add: 'Report a repair' },
  suggestion: { h: 'Send a suggestion', t: 'Subject', tp: 'e.g. Second billing counter at lunch', d: 'Your suggestion', dp: 'What would make work better?', ok: 'Thank you — your suggestion was sent.', add: 'Add a suggestion' },
  idea: { h: 'Propose a new dish', t: 'Dish name', tp: 'e.g. Pepper chicken roll', d: 'What is it? How is it served?', dp: 'Taste, portion, why guests would like it…', ok: 'Thank you — your dish idea was sent to the owner.', add: 'Propose a new dish' },
  task: { h: 'Give a marketing task', t: 'What needs to be done?', tp: 'e.g. Decorations for the festival weekend', d: 'Instructions', dp: 'What exactly, budget, who to contact…', ok: 'Task sent — the people doing it have been told.', add: 'Give a marketing task' },
};
const INTRO = {
  repair: 'Something broken or not working? Report it — add a photo so the manager sees how urgent it is.',
  suggestion: 'An idea or a problem? Tell the owner — you can send it without your name.',
  idea: 'Have an idea for a new dish? Describe it, add photos and what it would cost — the owner can try it.',
  task: 'Marketing tasks given to you — promotions, events, decorations, recruitment. Post progress with photos.',
};

function StaffRequestsContent() {
  const params = useSearchParams();
  const initial = (KINDS.find(([k]) => k === params?.get('kind')) || KINDS[0])[0];
  const [kind, setKind] = useState(initial);
  const [user, setUser] = useState(null);
  const [rid, setRid] = useState(null);
  const [list, setList] = useState(null);
  const [open, setOpen] = useState({ repair: 0, suggestion: 0, idea: 0, task: 0 });
  const [view, setView] = useState('active');           // managers: active | all
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reply, setReply] = useState({});                // id → reply text being typed
  const [progress, setProgress] = useState({});          // task id → { note, photos }
  const [staff, setStaff] = useState([]);                // managers: who a task can go to
  const [viewer, setViewer] = useState(null);            // photo opened full size
  const [search, setSearch] = useState('');              // number (42, REP-0042) or words
  const [dupes, setDupes] = useState(null);              // repair: "is this the same as REP-0042?"
  const { currencySettings, formatCurrency } = useCurrency();
  const symbol = (currencySettings && currencySettings.currencySymbol) || '';
  const money = (n) => (n == null || n === '' ? '' : (formatCurrency ? formatCurrency(Number(n)) : `${symbol}${n}`));
  const isManager = MANAGER_ROLES.includes(String(user?.role || '').toLowerCase());

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(u);
      setRid(localStorage.getItem('selectedRestaurantId') || u.restaurantId || null);
    } catch (_) { setUser({}); }
  }, []);

  const load = async () => {
    if (!rid || !user) return;
    try {
      if (isManager) {
        const r = await apiClient.getStaffRequests(rid);
        setList(r.requests || []); setOpen({ repair: 0, suggestion: 0, idea: 0, task: 0, ...(r.open || {}) });
      } else {
        const r = await apiClient.getMyStaffRequests(rid);
        setList(r.requests || []);
      }
      setError('');
    } catch (e) { setError(e?.message || 'Could not load'); setList([]); }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [rid, user]);
  useEffect(() => {
    // Staff: the form is always open (except marketing — tasks come from the managers).
    setShowForm(!isManager && kind !== 'task'); setForm(EMPTY); setNotice(''); setDupes(null); setSearch('');
  }, [kind, isManager]);
  useEffect(() => {
    if (!isManager || !rid || !['task', 'repair'].includes(kind) || staff.length) return;
    apiClient.getStaffRequestAssignable(rid).then(r => setStaff(r?.staff || [])).catch(() => {});
  }, [isManager, rid, kind, staff.length]);
  const roles = [...new Set(staff.flatMap(s => [s.role, ...(s.extraRoles || [])]).filter(Boolean))].sort();

  const send = async (confirmNew = false) => {
    const t = FORM_TEXT[kind];
    if (!form.title.trim() && !form.details.trim()) { setError(kind === 'repair' ? 'Say what needs repair' : kind === 'idea' ? 'Name the dish' : kind === 'task' ? 'Say what needs to be done' : 'Write your suggestion'); return; }
    if (kind === 'task' && !form.assignees.roles.length && !form.assignees.staffIds.length) { setError('Choose who does it — roles or staff'); return; }
    setBusy('send'); setError('');
    try {
      const r = await apiClient.createStaffRequest(rid, { kind, ...form, ...(confirmNew ? { confirmNew: true } : {}) });
      setForm(EMPTY); setDupes(null);
      setNotice(`${t.ok}${r?.request?.refNo ? ` Your number is ${r.request.refNo} — quote it any time.` : ''}`);
      if (isManager || kind === 'task') setShowForm(false);
      await load();
    } catch (e) {
      if (e?.code === 'POSSIBLE_DUPLICATE' && Array.isArray(e?.data?.matches)) setDupes(e.data.matches);
      else setError(e?.message || 'Could not send it');
    }
    finally { setBusy(null); }
  };
  // "Yes, it's the same problem" → my details + photos go on that ticket
  const joinTicket = async (m) => {
    setBusy('send'); setError('');
    try {
      await apiClient.staffRequestSameIssue(rid, m.id, { note: [form.title, form.details].filter(Boolean).join(' — '), photos: form.photos, urgency: form.urgency });
      setForm(EMPTY); setDupes(null);
      setNotice(`Added to ${m.refNo || 'the open ticket'} — you'll be told when it's fixed.`);
      if (isManager) setShowForm(false);
      await load();
    } catch (e) { setError(e?.message || 'Could not add it'); }
    finally { setBusy(null); }
  };
  // show the change at once, then refresh the lists + waiting counts
  const replaceItem = (r) => { setList(l => (l || []).map(x => (x.id === r.id ? { ...x, ...r } : x))); load(); };
  const withdraw = async (r) => {
    setBusy(r.id);
    try { await apiClient.withdrawStaffRequest(rid, r.id); await load(); }
    catch (e) { setError(e?.message || 'Could not withdraw it'); }
    finally { setBusy(null); }
  };
  const update = async (r, patch) => {
    setBusy(r.id);
    try {
      const text = reply[r.id];
      await apiClient.updateStaffRequest(rid, r.id, { ...patch, ...(text != null && text.trim() !== (r.reply || '') ? { reply: text.trim() } : {}) });
      setReply(x => { const n = { ...x }; delete n[r.id]; return n; });
      await load();
    } catch (e) { setError(e?.message || 'Could not update it'); }
    finally { setBusy(null); }
  };
  const postProgress = async (r, status) => {
    const p = progress[r.id] || { note: '', photos: [] };
    if (!status && !p.note.trim() && !p.photos.length) { setError('Write an update or add a photo'); return; }
    setBusy(r.id); setError('');
    try {
      await apiClient.postStaffTaskProgress(rid, r.id, { note: p.note.trim(), photos: p.photos, ...(status ? { status } : {}) });
      setProgress(x => { const n = { ...x }; delete n[r.id]; return n; });
      await load();
    } catch (e) { setError(e?.message || 'Could not save the update'); }
    finally { setBusy(null); }
  };

  const qText = search.trim().toLowerCase();
  const qNum = (qText.match(/^(?:[a-z]{3})?\s*-?\s*0*(\d{1,7})$/) || [])[1];
  const matchesSearch = (r) => !qText
    || (qNum && r.refNo && Number(String(r.refNo).replace(/\D/g, '')) === Number(qNum) && (!/^[a-z]{3}/.test(qText) || String(r.refNo).toLowerCase().startsWith(qText.slice(0, 3))))
    || `${r.refNo || ''} ${r.title} ${r.location || ''} ${r.details || ''} ${r.staffName || ''}`.toLowerCase().includes(qText);
  const mine = (list || []).filter(r => r.kind === kind && matchesSearch(r));
  const shown = isManager && view === 'active' && !qText ? mine.filter(r => ['open', 'in_progress'].includes(r.status)) : mine;
  const ft = FORM_TEXT[kind];
  const listTitle = isManager
    ? { repair: 'Reported repairs', suggestion: 'Suggestions received', idea: 'Dish ideas from the team', task: 'Marketing tasks' }[kind]
    : { repair: 'My repair reports', suggestion: 'My suggestions', idea: 'My dish ideas', task: 'My tasks' }[kind];
  const emptyText = qText ? 'Nothing matches that number or word.' : isManager && view === 'active' ? 'Nothing waiting.'
    : { repair: 'No repairs reported yet.', suggestion: 'No suggestions yet.', idea: 'No dish ideas yet.', task: isManager ? 'No marketing tasks yet.' : 'No marketing tasks for you yet.' }[kind];
  const staffName = (id) => (staff.find(s => s.id === id) || {}).name || '';
  const margin = (r) => (r.estCost > 0 && r.suggestedPrice > 0 ? Math.round(((r.suggestedPrice - r.estCost) / r.suggestedPrice) * 100) : null);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '4px 0 2px' }}>{isManager ? 'Staff requests & tasks' : (KINDS.find(([k]) => k === kind) || [])[1]}</h1>
      <p style={{ ...muted, margin: '0 0 14px' }}>
        {isManager ? 'Repairs, suggestions and dish ideas from your staff, and the marketing tasks you give. Update the status and reply — they are told.' : INTRO[kind]}
      </p>

      <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 14, overflowX: 'auto' }}>
        {KINDS.map(([k, t]) => (
          <button key={k} type="button" onClick={() => setKind(k)}
            style={{ flex: 1, minWidth: 92, padding: '9px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap',
              background: kind === k ? '#fff' : 'transparent', color: kind === k ? '#111827' : '#64748b', boxShadow: kind === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            {t}{isManager && open[k] > 0 ? <span style={{ ...pill('#ef4444', '#fff'), marginLeft: 6 }}>{open[k]}</span> : null}
          </button>
        ))}
      </div>

      {error && <div role="alert" style={{ ...card, background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c', fontSize: 14 }}>{error}</div>}
      {notice && <div style={{ ...card, background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857', fontSize: 14 }}>{notice}</div>}

      {/* New one (staff: always open, except tasks; managers: on demand) */}
      {isManager && !showForm && (
        <button type="button" onClick={() => setShowForm(true)} style={{ ...btn('#fff', '#111827', '1px solid #d1d5db'), marginBottom: 14 }}>+ {ft.add}</button>
      )}
      {showForm && (kind !== 'task' || isManager) && (
        <section style={card}>
          <h2 style={h2}>{ft.h}</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={label} htmlFor="sr-title">{ft.t}</label>
              <input id="sr-title" value={form.title} maxLength={140} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={ft.tp} style={input} />
            </div>
            {kind === 'repair' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={label} htmlFor="sr-where">Where?</label>
                  <input id="sr-where" value={form.location} maxLength={120} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Kitchen, Table 6, Toilet" style={input} />
                </div>
                <div>
                  <label style={label}>How urgent?</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {Object.entries(URGENCY).map(([k, t]) => (
                      <button key={k} type="button" onClick={() => setForm(f => ({ ...f, urgency: k }))}
                        style={{ flex: 1, padding: '9px 6px', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13,
                          border: `1.5px solid ${form.urgency === k ? (k === 'urgent' ? '#dc2626' : '#111827') : '#e5e7eb'}`,
                          background: form.urgency === k ? (k === 'urgent' ? '#fef2f2' : '#f9fafb') : '#fff', color: k === 'urgent' ? '#b91c1c' : '#111827' }}>{t}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {kind === 'idea' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                <div><label style={label} htmlFor="sr-course">Course / category</label>
                  <input id="sr-course" value={form.course} maxLength={60} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="e.g. Starter, Main, Dessert" style={input} /></div>
                <div><label style={label} htmlFor="sr-cost">Estimated cost{symbol ? ` (${symbol})` : ''}</label>
                  <input id="sr-cost" type="number" min="0" step="0.01" inputMode="decimal" value={form.estCost} onChange={e => setForm(f => ({ ...f, estCost: e.target.value }))} placeholder="Per plate" style={input} /></div>
                <div><label style={label} htmlFor="sr-price">Suggested price{symbol ? ` (${symbol})` : ''}</label>
                  <input id="sr-price" type="number" min="0" step="0.01" inputMode="decimal" value={form.suggestedPrice} onChange={e => setForm(f => ({ ...f, suggestedPrice: e.target.value }))} placeholder="Menu price" style={input} /></div>
              </div>
            )}
            {kind === 'task' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div><label style={label} htmlFor="sr-cat">Type</label>
                  <select id="sr-cat" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={input}>
                    {TASK_CATEGORIES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
                  </select></div>
                <div><label style={label} htmlFor="sr-due">Due by (optional)</label>
                  <input id="sr-due" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={input} /></div>
              </div>
            )}
            {kind === 'task' && (
              <div>
                <label style={label}>Who does it · roles and / or staff</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  {roles.map(r => {
                    const on = form.assignees.roles.includes(r);
                    return <button key={r} type="button" onClick={() => setForm(f => ({ ...f, assignees: { ...f.assignees, roles: on ? f.assignees.roles.filter(x => x !== r) : [...f.assignees.roles, r] } }))}
                      style={{ ...pill(on ? '#4f46e5' : '#f3f4f6', on ? '#fff' : '#374151'), border: 'none', cursor: 'pointer', padding: '5px 11px', fontSize: 12 }}>{r}</button>;
                  })}
                </div>
                <details>
                  <summary style={{ cursor: 'pointer', fontSize: 12, color: '#4f46e5', fontWeight: 600 }}>+ Choose staff{form.assignees.staffIds.length ? ` (${form.assignees.staffIds.length} chosen)` : ''}</summary>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, maxHeight: 160, overflow: 'auto' }}>
                    {staff.map(s => {
                      const id = s.id; const on = form.assignees.staffIds.includes(id);
                      return <button key={id} type="button" onClick={() => setForm(f => ({ ...f, assignees: { ...f.assignees, staffIds: on ? f.assignees.staffIds.filter(x => x !== id) : [...f.assignees.staffIds, id] } }))}
                        style={{ ...pill(on ? '#047857' : '#f3f4f6', on ? '#fff' : '#374151'), border: 'none', cursor: 'pointer', padding: '5px 11px', fontSize: 12 }}>{s.name}{s.role ? ` · ${s.role}` : ''}</button>;
                    })}
                  </div>
                </details>
              </div>
            )}
            <div>
              <label style={label} htmlFor="sr-details">{ft.d}</label>
              <textarea id="sr-details" value={form.details} maxLength={2000} rows={4} onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                placeholder={ft.dp} style={{ ...input, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            {kind === 'idea' && (
              <div>
                <label style={label} htmlFor="sr-ingr">Main ingredients</label>
                <textarea id="sr-ingr" value={form.ingredients} maxLength={1000} rows={2} onChange={e => setForm(f => ({ ...f, ingredients: e.target.value }))}
                  placeholder="e.g. Chicken, black pepper, onion, flatbread" style={{ ...input, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
            )}
            <PhotoPicker rid={rid} value={form.photos} onChange={(photos) => setForm(f => ({ ...f, photos }))} />
            {kind === 'suggestion' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.anonymous} onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} style={{ width: 16, height: 16 }} />
                Send without my name
              </label>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {(isManager || kind === 'task') && <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Cancel</button>}
              {!dupes && <button type="button" disabled={busy === 'send'} onClick={() => send(false)} style={{ ...btn('#047857'), opacity: busy === 'send' ? 0.6 : 1 }}>{busy === 'send' ? 'Sending…' : 'Send'}</button>}
            </div>
            {dupes && (
              <div role="alert" style={{ border: '1px solid #fde68a', background: '#fffbeb', borderRadius: 12, padding: 12, display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#92400e' }}>This may already be reported — is it the same problem?</div>
                {dupes.map(m => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', background: '#fff', borderRadius: 9, padding: '8px 10px', border: '1px solid #fef3c7' }}>
                    <div style={{ fontSize: 13, minWidth: 0 }}>
                      <RefTag refNo={m.refNo} /> <b>{m.title}</b>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{m.location ? `${m.location} · ` : ''}{statusText('repair', m.status)} · {when(m.createdAt)}{m.staffName ? ` · ${m.staffName}` : ''}</div>
                    </div>
                    <button type="button" disabled={busy === 'send'} onClick={() => joinTicket(m)} style={btn('#111827')}>Yes, same — add mine</button>
                  </div>
                ))}
                <div><button type="button" disabled={busy === 'send'} onClick={() => send(true)} style={btn('#fff', '#374151', '1px solid #d1d5db')}>No, it&apos;s a different problem — new ticket</button></div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* List */}
      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <h2 style={{ ...h2, margin: 0 }}>{listTitle}</h2>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search number (e.g. 42) or word" aria-label="Search by number or word"
            style={{ ...input, padding: '6px 10px', fontSize: 13, width: 220, maxWidth: '100%', flex: '0 1 220px' }} />
          {isManager && (
            <div style={{ display: 'flex', gap: 4 }}>
              {[['active', 'To do'], ['all', 'All']].map(([k, t]) => (
                <button key={k} type="button" onClick={() => setView(k)} style={{ ...pill(view === k ? '#111827' : '#f3f4f6', view === k ? '#fff' : '#374151'), border: 'none', cursor: 'pointer', padding: '5px 12px', fontSize: 12 }}>{t}</button>
              ))}
            </div>
          )}
        </div>
        {list === null ? <span style={muted}>Loading…</span>
          : shown.length === 0 ? <span style={muted}>{emptyText}</span>
            : (
              <div style={{ display: 'grid', gap: 10 }}>
                {shown.map(r => {
                  if (r.kind === 'repair') {
                    return <RepairTicket key={r.id} r={r} rid={rid} me={user?.id || user?.userId} isManager={isManager} staff={staff} money={money}
                      onChanged={replaceItem} onOpenPhoto={setViewer} defaultOpen={!!qText && shown.length === 1} />;
                  }
                  const typing = reply[r.id];
                  const prog = progress[r.id] || { note: '', photos: [] };
                  const overdue = r.kind === 'task' && r.dueDate && ['open', 'in_progress'].includes(r.status) && r.dueDate < new Date().toISOString().slice(0, 10);
                  const canProgress = r.kind === 'task' && ['open', 'in_progress', 'done'].includes(r.status) && (isManager || r.assignedToMe);
                  const m = margin(r);
                  return (
                    <div key={r.id} style={{ border: `1px solid ${(r.urgency === 'urgent' || overdue) && ['open', 'in_progress'].includes(r.status) ? '#fecaca' : '#f1f5f9'}`, borderRadius: 12, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14.5, color: '#111827', overflowWrap: 'anywhere' }}>{r.refNo && <><RefTag refNo={r.refNo} />{' '}</>}{r.title}</div>
                          <div style={{ ...muted, fontSize: 12, marginTop: 2 }}>
                            {when(r.createdAt)}
                            {r.kind === 'repair' && r.location ? ` · ${r.location}` : ''}
                            {r.kind === 'idea' && r.course ? ` · ${r.course}` : ''}
                            {r.kind === 'task' ? ` · ${catName(r.category)}${r.dueDate ? ` · due ${day(r.dueDate)}` : ''}` : ''}
                            {r.kind !== 'task' && isManager ? ` · ${r.staffName || 'Staff'}${r.staffRole ? ` (${r.staffRole})` : ''}` : ''}
                            {r.kind === 'task' && !isManager && r.staffName ? ` · from ${r.staffName}` : ''}
                            {!isManager && r.anonymous ? ' · sent without your name' : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {r.kind === 'repair' && r.urgency === 'urgent' && <span style={pill('#fef2f2', '#b91c1c')}>Urgent</span>}
                          {overdue && <span style={pill('#fef2f2', '#b91c1c')}>Overdue</span>}
                          <span style={STATUS_STYLE[r.status] || STATUS_STYLE.open}>{statusText(r.kind, r.status)}</span>
                        </div>
                      </div>
                      {r.details && <p style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', margin: '8px 0 0', color: '#374151', overflowWrap: 'anywhere' }}>{r.details}</p>}
                      {r.kind === 'idea' && (r.ingredients || r.estCost != null || r.suggestedPrice != null) && (
                        <div style={{ fontSize: 13, color: '#374151', marginTop: 8, display: 'grid', gap: 2 }}>
                          {r.ingredients && <div><b>Ingredients:</b> {r.ingredients}</div>}
                          {(r.estCost != null || r.suggestedPrice != null) && (
                            <div>{r.estCost != null && <span><b>Cost:</b> {money(r.estCost)}</span>}{r.estCost != null && r.suggestedPrice != null ? ' · ' : ''}{r.suggestedPrice != null && <span><b>Price:</b> {money(r.suggestedPrice)}</span>}{m != null && <span style={{ color: m >= 60 ? '#047857' : m >= 30 ? '#b45309' : '#b91c1c' }}> · margin {m}%</span>}</div>
                          )}
                        </div>
                      )}
                      {r.kind === 'task' && isManager && r.assignees && (
                        <div style={{ ...muted, fontSize: 12, marginTop: 6 }}>For: {[...(r.assignees.roles || []), ...(r.assignees.staffIds || []).map(id => staffName(id) || 'a staff member')].join(', ')}</div>
                      )}
                      <Photos urls={r.photos || []} onOpen={setViewer} />
                      {r.kind === 'task' && Array.isArray(r.updates) && r.updates.length > 0 && (
                        <div style={{ marginTop: 10, borderLeft: '3px solid #e0e7ff', paddingLeft: 10, display: 'grid', gap: 8 }}>
                          {r.updates.map((u, i) => (
                            <div key={i} style={{ fontSize: 13 }}>
                              <div style={{ ...muted, fontSize: 12 }}>{u.byName || 'Staff'} · {when(u.at)}{u.status ? ` · ${statusText('task', u.status)}` : ''}</div>
                              {u.note && <div style={{ whiteSpace: 'pre-wrap', color: '#374151' }}>{u.note}</div>}
                              <Photos urls={u.photos || []} onOpen={setViewer} />
                            </div>
                          ))}
                        </div>
                      )}
                      {r.reply && <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 13.5 }}><b>Reply{r.handledByName ? ` · ${r.handledByName}` : ''}:</b> {r.reply}</div>}

                      {canProgress && (
                        <div style={{ marginTop: 10, display: 'grid', gap: 8, background: '#f8fafc', borderRadius: 10, padding: 10 }}>
                          <input value={prog.note} onChange={e => setProgress(x => ({ ...x, [r.id]: { ...prog, note: e.target.value } }))} placeholder="Progress update (optional)" style={{ ...input, padding: '8px 10px', fontSize: 13 }} />
                          <PhotoPicker rid={rid} value={prog.photos} onChange={(photos) => setProgress(x => ({ ...x, [r.id]: { ...prog, photos } }))} />
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button type="button" disabled={busy === r.id} onClick={() => postProgress(r)} style={btn('#fff', '#1d4ed8', '1px solid #bfdbfe')}>Post update</button>
                            {r.status === 'open' && <button type="button" disabled={busy === r.id} onClick={() => postProgress(r, 'in_progress')} style={btn('#1d4ed8')}>Started</button>}
                            {r.status !== 'done' && <button type="button" disabled={busy === r.id} onClick={() => postProgress(r, 'done')} style={btn('#047857')}>Done</button>}
                          </div>
                        </div>
                      )}

                      {!isManager && r.kind !== 'task' && r.status === 'open' && (
                        <button type="button" disabled={busy === r.id} onClick={() => withdraw(r)} style={{ ...btn('#fff', '#b91c1c', '1px solid #fecaca'), marginTop: 10, padding: '6px 12px', fontSize: 12 }}>Withdraw</button>
                      )}
                      {isManager && ['open', 'in_progress'].includes(r.status) && (
                        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                          <input value={typing ?? ''} onChange={e => setReply(x => ({ ...x, [r.id]: e.target.value }))} placeholder={r.kind === 'task' ? 'Note to the team (optional)' : 'Reply to the staff member (optional)'} style={{ ...input, padding: '8px 10px', fontSize: 13 }} />
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {r.kind === 'idea' ? (<>
                              {r.status === 'open' && <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'in_progress' })} style={btn('#1d4ed8')}>Try it</button>}
                              <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'done' })} style={btn('#047857')}>Approve</button>
                              <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'closed' })} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Not now</button>
                            </>) : r.kind === 'task' ? (
                              <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'closed' })} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Close task</button>
                            ) : (<>
                              {r.status === 'open' && <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'in_progress' })} style={btn('#1d4ed8')}>In progress</button>}
                              <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'done' })} style={btn('#047857')}>{r.kind === 'repair' ? 'Fixed' : 'Done'}</button>
                              <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'closed' })} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Close</button>
                            </>)}
                            {typing != null && typing.trim() !== '' && <button type="button" disabled={busy === r.id} onClick={() => update(r, {})} style={btn('#fff', '#047857', '1px solid #a7f3d0')}>Send reply</button>}
                          </div>
                        </div>
                      )}
                      {isManager && ['done', 'closed'].includes(r.status) && (
                        <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'open' })} style={{ ...btn('#fff', '#374151', '1px solid #d1d5db'), marginTop: 10, padding: '6px 12px', fontSize: 12 }}>Reopen</button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
      </section>

      {viewer && (
        <div role="dialog" aria-label="Photo" onClick={() => setViewer(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={viewer} alt="Attached photo, full size" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}

// useSearchParams (?kind) needs a Suspense boundary in the App Router.
export default function StaffRequestsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24, color: '#6b7280' }}>Loading…</div>}>
      <StaffRequestsContent />
    </Suspense>
  );
}
