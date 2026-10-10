'use client';

// Repairs + suggestions (asked by MFC for the staff "More" menu).
//   Staff:    report a repair (what, where, how urgent) or send a suggestion (can be anonymous), and
//             see what happened to their own; withdraw one that nobody has picked up yet.
//   Managers: everyone's requests, open ones first → In progress / Done / Close with a reply
//             (the sender is notified). ?kind=repair | suggestion opens that tab.

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import apiClient from '../../../lib/api';

const MANAGER_ROLES = ['owner', 'admin', 'co-owner', 'manager'];
const card = { background: '#fff', border: '1px solid #eef0f3', borderRadius: 14, padding: 16, marginBottom: 14 };
const muted = { color: '#6b7280', fontSize: 13 };
const h2 = { fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 10px' };
const input = { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box' };
const label = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 };
const pill = (bg, fg) => ({ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: bg, color: fg, whiteSpace: 'nowrap' });
const btn = (bg, fg = '#fff', border = 'none') => ({ padding: '9px 14px', borderRadius: 9, border, background: bg, color: fg, fontWeight: 700, fontSize: 13, cursor: 'pointer' });
const STATUS = {
  open: { text: 'Open', style: pill('#fef3c7', '#92400e') },
  in_progress: { text: 'In progress', style: pill('#dbeafe', '#1d4ed8') },
  done: { text: 'Done', style: pill('#dcfce7', '#15803d') },
  closed: { text: 'Closed', style: pill('#f3f4f6', '#4b5563') },
};
const URGENCY = { low: 'Low', normal: 'Normal', urgent: 'Urgent' };
const when = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const EMPTY = { title: '', details: '', location: '', urgency: 'normal', anonymous: false };

function StaffRequestsContent() {
  const params = useSearchParams();
  const [kind, setKind] = useState(params?.get('kind') === 'suggestion' ? 'suggestion' : 'repair');
  const [user, setUser] = useState(null);
  const [rid, setRid] = useState(null);
  const [list, setList] = useState(null);
  const [open, setOpen] = useState({ repair: 0, suggestion: 0 });
  const [view, setView] = useState('active');           // managers: active | all
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reply, setReply] = useState({});                // id → reply text being typed
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
        setList(r.requests || []); setOpen(r.open || { repair: 0, suggestion: 0 });
      } else {
        const r = await apiClient.getMyStaffRequests(rid);
        setList(r.requests || []);
      }
      setError('');
    } catch (e) { setError(e?.message || 'Could not load'); setList([]); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [rid, user]);
  useEffect(() => { setShowForm(!isManager); setForm(EMPTY); setNotice(''); }, [kind, isManager]);

  const send = async () => {
    if (!form.title.trim() && !form.details.trim()) { setError(kind === 'repair' ? 'Say what needs repair' : 'Write your suggestion'); return; }
    setBusy('send'); setError('');
    try {
      await apiClient.createStaffRequest(rid, { kind, ...form });
      setForm(EMPTY);
      setNotice(kind === 'repair' ? 'Sent — the manager has been told.' : 'Thank you — your suggestion was sent.');
      if (isManager) setShowForm(false);
      await load();
    } catch (e) { setError(e?.message || 'Could not send it'); }
    finally { setBusy(null); }
  };
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

  const mine = (list || []).filter(r => r.kind === kind);
  const shown = isManager && view === 'active' ? mine.filter(r => ['open', 'in_progress'].includes(r.status)) : mine;
  const title = kind === 'repair' ? 'Repair works' : 'Suggestions';

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '4px 0 2px' }}>{isManager ? 'Repairs & suggestions' : title}</h1>
      <p style={{ ...muted, margin: '0 0 14px' }}>
        {isManager ? 'What your staff reported or suggested. Update the status and reply — they are told.'
          : kind === 'repair' ? 'Something broken or not working? Report it here and see when it is fixed.'
            : 'An idea or a problem? Tell the owner — you can send it without your name.'}
      </p>

      {/* Repairs | Suggestions */}
      <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 14 }}>
        {[['repair', 'Repairs'], ['suggestion', 'Suggestions']].map(([k, t]) => (
          <button key={k} type="button" onClick={() => setKind(k)}
            style={{ flex: 1, padding: '9px 10px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13.5,
              background: kind === k ? '#fff' : 'transparent', color: kind === k ? '#111827' : '#64748b', boxShadow: kind === k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            {t}{isManager && open[k] > 0 ? <span style={{ ...pill('#ef4444', '#fff'), marginLeft: 6 }}>{open[k]}</span> : null}
          </button>
        ))}
      </div>

      {error && <div role="alert" style={{ ...card, background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c', fontSize: 14 }}>{error}</div>}
      {notice && <div style={{ ...card, background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857', fontSize: 14 }}>{notice}</div>}

      {/* New request (staff: always open; managers: on demand) */}
      {isManager && !showForm && (
        <button type="button" onClick={() => setShowForm(true)} style={{ ...btn('#fff', '#111827', '1px solid #d1d5db'), marginBottom: 14 }}>
          + {kind === 'repair' ? 'Report a repair' : 'Add a suggestion'}
        </button>
      )}
      {showForm && (
        <section style={card}>
          <h2 style={h2}>{kind === 'repair' ? 'Report a repair' : 'Send a suggestion'}</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label style={label}>{kind === 'repair' ? 'What needs repair?' : 'Subject'}</label>
              <input value={form.title} maxLength={140} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder={kind === 'repair' ? 'e.g. Fridge 2 not cooling' : 'e.g. Second billing counter at lunch'} style={input} />
            </div>
            {kind === 'repair' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={label}>Where?</label>
                  <input value={form.location} maxLength={120} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Kitchen, Table 6, Toilet" style={input} />
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
            <div>
              <label style={label}>{kind === 'repair' ? 'Details (optional)' : 'Your suggestion'}</label>
              <textarea value={form.details} maxLength={2000} rows={4} onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                placeholder={kind === 'repair' ? 'Since when, what happens…' : 'What would make work better?'} style={{ ...input, resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            {kind === 'suggestion' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.anonymous} onChange={e => setForm(f => ({ ...f, anonymous: e.target.checked }))} style={{ width: 16, height: 16 }} />
                Send without my name
              </label>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {isManager && <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Cancel</button>}
              <button type="button" disabled={busy === 'send'} onClick={send} style={{ ...btn('#047857'), opacity: busy === 'send' ? 0.6 : 1 }}>{busy === 'send' ? 'Sending…' : 'Send'}</button>
            </div>
          </div>
        </section>
      )}

      {/* List */}
      <section style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <h2 style={{ ...h2, margin: 0 }}>{isManager ? (kind === 'repair' ? 'Reported repairs' : 'Suggestions received') : (kind === 'repair' ? 'My repair reports' : 'My suggestions')}</h2>
          {isManager && (
            <div style={{ display: 'flex', gap: 4 }}>
              {[['active', 'To do'], ['all', 'All']].map(([k, t]) => (
                <button key={k} type="button" onClick={() => setView(k)} style={{ ...pill(view === k ? '#111827' : '#f3f4f6', view === k ? '#fff' : '#374151'), border: 'none', cursor: 'pointer', padding: '5px 12px', fontSize: 12 }}>{t}</button>
              ))}
            </div>
          )}
        </div>
        {list === null ? <span style={muted}>Loading…</span>
          : shown.length === 0 ? <span style={muted}>{isManager && view === 'active' ? 'Nothing waiting.' : kind === 'repair' ? 'No repairs reported yet.' : 'No suggestions yet.'}</span>
            : (
              <div style={{ display: 'grid', gap: 10 }}>
                {shown.map(r => {
                  const st = STATUS[r.status] || STATUS.open;
                  const typing = reply[r.id];
                  return (
                    <div key={r.id} style={{ border: `1px solid ${r.urgency === 'urgent' && ['open', 'in_progress'].includes(r.status) ? '#fecaca' : '#f1f5f9'}`, borderRadius: 12, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14.5, color: '#111827', overflowWrap: 'anywhere' }}>{r.title}</div>
                          <div style={{ ...muted, fontSize: 12, marginTop: 2 }}>
                            {when(r.createdAt)}
                            {r.kind === 'repair' && r.location ? ` · ${r.location}` : ''}
                            {isManager ? ` · ${r.staffName || 'Staff'}${r.staffRole ? ` (${r.staffRole})` : ''}` : r.anonymous ? ' · sent without your name' : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          {r.kind === 'repair' && r.urgency === 'urgent' && <span style={pill('#fef2f2', '#b91c1c')}>Urgent</span>}
                          <span style={st.style}>{st.text}</span>
                        </div>
                      </div>
                      {r.details && <p style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', margin: '8px 0 0', color: '#374151', overflowWrap: 'anywhere' }}>{r.details}</p>}
                      {r.reply && <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 8, background: '#f8fafc', fontSize: 13.5 }}><b>Reply{r.handledByName ? ` · ${r.handledByName}` : ''}:</b> {r.reply}</div>}

                      {!isManager && r.status === 'open' && (
                        <button type="button" disabled={busy === r.id} onClick={() => withdraw(r)} style={{ ...btn('#fff', '#b91c1c', '1px solid #fecaca'), marginTop: 10, padding: '6px 12px', fontSize: 12 }}>Withdraw</button>
                      )}
                      {isManager && ['open', 'in_progress'].includes(r.status) && (
                        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                          <input value={typing ?? ''} onChange={e => setReply(x => ({ ...x, [r.id]: e.target.value }))} placeholder="Reply to the staff member (optional)" style={{ ...input, padding: '8px 10px', fontSize: 13 }} />
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {r.status === 'open' && <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'in_progress' })} style={btn('#1d4ed8')}>In progress</button>}
                            <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'done' })} style={btn('#047857')}>{r.kind === 'repair' ? 'Fixed' : 'Done'}</button>
                            <button type="button" disabled={busy === r.id} onClick={() => update(r, { status: 'closed' })} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Close</button>
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
