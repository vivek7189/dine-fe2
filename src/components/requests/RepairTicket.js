'use client';

// A repair as a ticket (MFC: "who is assigned, what action has been taken, whether the company has
// been called, message from the company, what follow up — until the problem is solved; then case
// closed", "tracking is all done by the number"). Collapsed: number, what, where, who, next follow-up.
// Open: the details, company / cost / follow-up, the full history (who did what, when, photos), and
// actions — add to the history, mark fixed (how it was fixed), close without a fix (why), reopen.
//   managers: everything · assigned person: history + started / fixed · reporter & "reported again":
//   notes + photos.

import { useState } from 'react';
import apiClient from '../../lib/api';
import { Photos, PhotoPicker } from './RequestPhotos';

const STALE_DAYS = 3;
const KIND_UI = {
  note: ['📝', 'Note'], called: ['📞', 'Called the company'], vendor_reply: ['💬', 'Company replied'], visit: ['🔧', 'Technician visited'],
  part: ['📦', 'Part ordered'], follow_up: ['📅', 'Follow-up set'], status: ['•', 'Status'], assigned: ['👤', 'Assigned'],
  reopened: ['↺', 'Reopened'], same_issue: ['➕', 'Reported again'],
};
const ADD_KINDS = ['note', 'called', 'vendor_reply', 'visit', 'part', 'follow_up'];
const STATUS = {
  open: ['Open', '#fef3c7', '#92400e'], in_progress: ['In progress', '#dbeafe', '#1d4ed8'], done: ['Fixed', '#dcfce7', '#15803d'], closed: ['Closed', '#f3f4f6', '#4b5563'],
};
const pill = (bg, fg) => ({ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: bg, color: fg, whiteSpace: 'nowrap' });
const inp = { width: '100%', padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13.5, background: '#fff', boxSizing: 'border-box' };
const lbl = { fontSize: 11.5, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 4 };
const btn = (bg, fg = '#fff', border = 'none') => ({ padding: '8px 13px', borderRadius: 9, border, background: bg, color: fg, fontWeight: 700, fontSize: 13, cursor: 'pointer' });
const when = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const dayText = (ymd) => { if (!ymd) return ''; const d = new Date(`${ymd}T12:00:00`); return isNaN(d) ? ymd : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); };
const todayYmd = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export function RefTag({ refNo }) {
  if (!refNo) return null;
  return <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11.5, fontWeight: 700, color: '#334155', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '1px 6px', whiteSpace: 'nowrap' }}>{refNo}</span>;
}

export default function RepairTicket({ r, rid, me, isManager, staff = [], money, onChanged, onOpenPhoto, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [add, setAdd] = useState({ kind: 'note', note: '', photos: [], followUpDate: '' });
  const [finish, setFinish] = useState(null); // { to: 'done' | 'closed' | 'open', text }
  const [edit, setEdit] = useState(null);     // managers: { assignedTo, vendorName, vendorPhone, cost, followUpDate }

  const assignedToMe = r.assignedTo && String(r.assignedTo.staffId) === String(me);
  const canAct = isManager || assignedToMe;                         // started / fixed
  const canWrite = isManager || assignedToMe || String(r.staffId) === String(me) || (r.watchers || []).map(String).includes(String(me)) || r.watching;
  const active = ['open', 'in_progress'].includes(r.status);
  const log = Array.isArray(r.updates) ? r.updates : [];
  const lastAt = log.length ? log[log.length - 1].at : r.createdAt;
  const idleDays = lastAt ? Math.floor((Date.now() - new Date(lastAt).getTime()) / 86400000) : 0;
  const followDue = active && r.followUpDate && r.followUpDate <= todayYmd();
  const [sText, sBg, sFg] = STATUS[r.status] || STATUS.open;

  const run = async (key, fn) => {
    setBusy(key); setErr('');
    try { const res = await fn(); if (res?.request) onChanged(res.request); return true; }
    catch (e) { setErr(e?.message || 'Could not save'); return false; }
    finally { setBusy(''); }
  };
  const addToHistory = async () => {
    if (add.kind === 'follow_up' && !add.followUpDate) return setErr('Choose the follow-up date');
    if (!add.note.trim() && !add.photos.length && add.kind === 'note') return setErr('Write what was done, or add a photo');
    const okd = await run('add', () => apiClient.logStaffRequest(rid, r.id, { kind: add.kind, note: add.note.trim(), photos: add.photos, ...(add.kind === 'follow_up' ? { followUpDate: add.followUpDate } : {}) }));
    if (okd) setAdd({ kind: 'note', note: '', photos: [], followUpDate: '' });
  };
  const doFinish = async () => {
    const t = (finish.text || '').trim();
    if (finish.to === 'done' && !t) return setErr('Write how it was fixed');
    if (finish.to === 'closed' && !t) return setErr('Say why it is closed without a fix');
    const okd = await run('finish', () => (finish.to === 'done' && !isManager
      ? apiClient.logStaffRequest(rid, r.id, { kind: 'note', note: '', status: 'done', resolution: t })
      : apiClient.updateStaffRequest(rid, r.id, finish.to === 'done' ? { status: 'done', resolution: t }
        : finish.to === 'closed' ? { status: 'closed', reply: t } : { status: 'open', reason: t })));
    if (okd) setFinish(null);
  };
  const started = () => run('start', () => (isManager ? apiClient.updateStaffRequest(rid, r.id, { status: 'in_progress' })
    : apiClient.logStaffRequest(rid, r.id, { kind: 'note', note: 'Started work', status: 'in_progress' })));
  const saveEdit = async () => {
    const okd = await run('edit', () => apiClient.updateStaffRequest(rid, r.id, {
      assignedTo: edit.assignedTo || '', vendor: { name: edit.vendorName, phone: edit.vendorPhone }, cost: edit.cost, followUpDate: edit.followUpDate || null,
    }));
    if (okd) setEdit(null);
  };

  return (
    <div style={{ border: `1px solid ${active && (r.urgency === 'urgent' || followDue) ? '#fecaca' : '#eef0f3'}`, borderRadius: 12, background: '#fff' }}>
      {/* summary row */}
      <button type="button" onClick={() => setOpen(v => !v)} aria-expanded={open}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 12, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <RefTag refNo={r.refNo} />
            <span style={{ fontWeight: 700, fontSize: 14.5, color: '#111827', overflowWrap: 'anywhere' }}>{r.title}</span>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {r.location && <span>📍 {r.location}</span>}
            <span>👤 {r.assignedTo ? r.assignedTo.name : <i>not assigned</i>}</span>
            {active && r.followUpDate && <span style={{ color: followDue ? '#b91c1c' : '#6b7280', fontWeight: followDue ? 700 : 400 }}>📅 follow up {dayText(r.followUpDate)}</span>}
            {active && idleDays >= STALE_DAYS && <span style={{ color: '#b45309', fontWeight: 600 }}>no update for {idleDays} days</span>}
            <span>{when(r.createdAt)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {active && r.urgency === 'urgent' && <span style={pill('#fef2f2', '#b91c1c')}>Urgent</span>}
          {r.reopenCount > 0 && <span style={pill('#fff7ed', '#c2410c')}>Reopened{r.reopenCount > 1 ? ` ×${r.reopenCount}` : ''}</span>}
          <span style={pill(sBg, sFg)}>{sText}</span>
        </div>
      </button>

      {open && (
        <div style={{ padding: '0 12px 12px', borderTop: '1px solid #f3f4f6' }}>
          {err && <div role="alert" style={{ background: '#fef2f2', color: '#b91c1c', borderRadius: 8, padding: '7px 10px', fontSize: 12.5, marginTop: 10 }}>{err}</div>}
          <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 10 }}>
            Reported by {r.staffName || 'staff'}{r.staffRole ? ` (${r.staffRole})` : ''} · {when(r.createdAt)}
            {(r.watchers || []).length > 0 && ` · reported again by ${(r.watchers || []).length} more`}
          </div>
          {r.details && <p style={{ fontSize: 13.5, whiteSpace: 'pre-wrap', margin: '6px 0 0', color: '#374151', overflowWrap: 'anywhere' }}>{r.details}</p>}
          <Photos urls={r.photos || []} onOpen={onOpenPhoto} />

          {r.status === 'done' && r.resolution && (
            <div style={{ marginTop: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 9, padding: '8px 10px', fontSize: 13, color: '#166534' }}>
              <b>Fixed:</b> {r.resolution}{r.closedByName ? <span style={{ color: '#4b5563' }}> · {r.closedByName}, {when(r.closedAt)}</span> : null}
            </div>
          )}
          {r.status === 'closed' && (r.reply || r.resolution) && (
            <div style={{ marginTop: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '8px 10px', fontSize: 13, color: '#334155' }}>
              <b>Closed:</b> {r.reply || r.resolution}
            </div>
          )}

          {/* company / cost / follow-up / assigned */}
          {!edit ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginTop: 10, fontSize: 13 }}>
              <div><span style={lbl}>Assigned to</span>{r.assignedTo ? r.assignedTo.name : '—'}</div>
              <div><span style={lbl}>Company / technician</span>{r.vendor && (r.vendor.name || r.vendor.phone) ? <>{r.vendor.name}{r.vendor.phone ? <> · <a href={`tel:${r.vendor.phone.replace(/[^\d+]/g, '')}`} style={{ color: '#2563eb' }}>{r.vendor.phone}</a></> : null}</> : '—'}</div>
              <div><span style={lbl}>Cost</span>{r.cost != null ? money(r.cost) : '—'}</div>
              <div><span style={lbl}>Next follow-up</span>{active && r.followUpDate ? dayText(r.followUpDate) : '—'}</div>
              {isManager && <div style={{ alignSelf: 'end' }}><button type="button" onClick={() => setEdit({ assignedTo: r.assignedTo?.staffId || '', vendorName: r.vendor?.name || '', vendorPhone: r.vendor?.phone || '', cost: r.cost ?? '', followUpDate: r.followUpDate || '' })} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Change</button></div>}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginTop: 10, padding: 10, background: '#f8fafc', borderRadius: 10 }}>
              <div><label style={lbl}>Assigned to</label>
                <select style={inp} value={edit.assignedTo} onChange={e => setEdit(x => ({ ...x, assignedTo: e.target.value }))}>
                  <option value="">Nobody yet</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}{s.role ? ` · ${s.role}` : ''}</option>)}
                </select></div>
              <div><label style={lbl}>Company / technician</label><input style={inp} value={edit.vendorName} maxLength={100} onChange={e => setEdit(x => ({ ...x, vendorName: e.target.value }))} placeholder="e.g. CoolTech Services" /></div>
              <div><label style={lbl}>Their phone</label><input style={inp} type="tel" value={edit.vendorPhone} maxLength={30} onChange={e => setEdit(x => ({ ...x, vendorPhone: e.target.value }))} placeholder="+65 6123 4567" /></div>
              <div><label style={lbl}>Cost</label><input style={inp} type="number" min="0" step="0.01" inputMode="decimal" value={edit.cost} onChange={e => setEdit(x => ({ ...x, cost: e.target.value }))} /></div>
              <div><label style={lbl}>Next follow-up</label><input style={inp} type="date" value={edit.followUpDate} onChange={e => setEdit(x => ({ ...x, followUpDate: e.target.value }))} /></div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'end' }}>
                <button type="button" disabled={busy === 'edit'} onClick={saveEdit} style={btn('#111827')}>{busy === 'edit' ? 'Saving…' : 'Save'}</button>
                <button type="button" onClick={() => setEdit(null)} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Cancel</button>
              </div>
            </div>
          )}

          {/* history */}
          <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: '#374151' }}>History</div>
          <div style={{ marginTop: 6, borderLeft: '2px solid #e5e7eb', paddingLeft: 12, display: 'grid', gap: 10 }}>
            <div style={{ fontSize: 13 }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{when(r.createdAt)} · {r.staffName || 'Staff'}</div>
              <div>🆕 Reported{r.urgency === 'urgent' ? ' as urgent' : ''}</div>
            </div>
            {log.map((u, i) => {
              const isStatus = u.kind === 'status' || (!u.kind && u.status);
              const [icon, name] = isStatus ? [u.status === 'done' ? '✅' : u.status === 'closed' ? '⛔' : '▶️', (STATUS[u.status] || [u.status])[0]]
                : u.kind === 'assigned' ? ['👤', 'Assigned to'] : (KIND_UI[u.kind] || KIND_UI.note);
              const text = u.kind === 'assigned' ? u.note
                : u.kind === 'follow_up' ? `${dayText(u.followUpDate)}${u.note ? ` — ${u.note}` : ''}`
                : u.note;
              return (
                <div key={i} style={{ fontSize: 13 }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{when(u.at)} · {u.byName || 'Staff'}</div>
                  <div style={{ color: '#111827' }}>{icon} <b style={{ fontWeight: 600 }}>{name}</b>{text ? <span style={{ color: '#374151' }}>{u.kind === 'assigned' ? ' ' : ' — '}{text}</span> : null}</div>
                  {u.vendor && (u.vendor.name || u.vendor.phone) && <div style={{ fontSize: 12, color: '#6b7280' }}>{u.vendor.name}{u.vendor.phone ? ` · ${u.vendor.phone}` : ''}</div>}
                  <Photos urls={u.photos || []} onOpen={onOpenPhoto} />
                </div>
              );
            })}
          </div>

          {/* add to the history */}
          {active && canWrite && (
            <div style={{ marginTop: 12, background: '#f8fafc', borderRadius: 10, padding: 10, display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {(canAct ? ADD_KINDS : ['note']).map(k => (
                  <button key={k} type="button" onClick={() => setAdd(a => ({ ...a, kind: k }))}
                    style={{ padding: '5px 10px', borderRadius: 999, border: `1px solid ${add.kind === k ? '#111827' : '#e5e7eb'}`, background: add.kind === k ? '#111827' : '#fff', color: add.kind === k ? '#fff' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {KIND_UI[k][0]} {k === 'follow_up' ? 'Set follow-up' : KIND_UI[k][1]}
                  </button>
                ))}
              </div>
              {add.kind === 'follow_up' && <input type="date" min={todayYmd()} style={{ ...inp, maxWidth: 200 }} value={add.followUpDate} onChange={e => setAdd(a => ({ ...a, followUpDate: e.target.value }))} />}
              <input style={inp} maxLength={1000} value={add.note} onChange={e => setAdd(a => ({ ...a, note: e.target.value }))}
                placeholder={{ called: 'Who you called and what they said', vendor_reply: 'What the company said, e.g. technician Tuesday 10 am', visit: 'What the technician did', part: 'Which part, when it comes', follow_up: 'What to check on that day', note: 'What happened' }[add.kind]} />
              <PhotoPicker rid={rid} value={add.photos} onChange={(photos) => setAdd(a => ({ ...a, photos }))} />
              <div><button type="button" disabled={busy === 'add'} onClick={addToHistory} style={btn('#111827')}>{busy === 'add' ? 'Saving…' : 'Add to history'}</button></div>
            </div>
          )}

          {/* status actions */}
          {finish ? (
            <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
              <label style={lbl}>{finish.to === 'done' ? 'How was it fixed? (the reporter is told)' : finish.to === 'closed' ? 'Why is it closed without a fix?' : 'Why reopen it?'}</label>
              <textarea rows={2} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} value={finish.text} onChange={e => setFinish(f => ({ ...f, text: e.target.value }))}
                placeholder={finish.to === 'done' ? 'e.g. CoolTech replaced the compressor' : finish.to === 'closed' ? 'e.g. Fridge replaced with a new one' : 'e.g. Not cooling again'} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" disabled={busy === 'finish'} onClick={doFinish} style={btn(finish.to === 'done' ? '#047857' : '#111827')}>{busy === 'finish' ? 'Saving…' : finish.to === 'done' ? 'Mark fixed' : finish.to === 'closed' ? 'Close ticket' : 'Reopen'}</button>
                <button type="button" onClick={() => setFinish(null)} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Cancel</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {active && canAct && r.status === 'open' && <button type="button" disabled={!!busy} onClick={started} style={btn('#1d4ed8')}>Started</button>}
              {active && canAct && <button type="button" onClick={() => setFinish({ to: 'done', text: '' })} style={btn('#047857')}>Mark fixed…</button>}
              {active && isManager && <button type="button" onClick={() => setFinish({ to: 'closed', text: '' })} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Close without fix…</button>}
              {!active && isManager && <button type="button" onClick={() => setFinish({ to: 'open', text: '' })} style={btn('#fff', '#374151', '1px solid #d1d5db')}>Reopen…</button>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
