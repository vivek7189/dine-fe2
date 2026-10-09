'use client';

// Books → Meetings (owner / manager), asked by MFC: schedule a meeting for chosen roles (chef, dosai
// master…) or chosen staff → they're notified; afterwards mark who attended, write the conclusion,
// decisions and goals / targets per role or person (incl. promotion goals), then "Publish minutes" —
// everyone invited gets it (those who missed it: "you missed…") and must acknowledge it. Reminders go to
// whoever hasn't. Staff see their meetings, minutes and goals under My meetings.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaPlus, FaUsers, FaBell, FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaTrash } from 'react-icons/fa';

const inp = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, width: '100%', boxSizing: 'border-box' };
const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };
const chip = (on, color = '#4f46e5') => ({ padding: '5px 11px', borderRadius: 999, border: `1px solid ${on ? color : '#d1d5db'}`, background: on ? `${color}14` : '#fff', color: on ? color : '#374151', fontSize: 12, fontWeight: on ? 700 : 500, cursor: 'pointer' });
const btn = (bg, fg = '#fff') => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: bg === '#fff' ? '1px solid #d1d5db' : 'none', background: bg, color: fg, fontWeight: 700, fontSize: 13, cursor: 'pointer' });
const TYPES = [['meeting', 'Meeting'], ['training', 'Training'], ['briefing', 'Briefing'], ['review', 'Review'], ['other', 'Other']];
const GOAL_CATS = [['target', 'Target'], ['skill', 'Skill'], ['promotion', 'Promotion'], ['other', 'Other']];
const ATT = [['present', 'Present', '#047857'], ['late', 'Late', '#b45309'], ['absent', 'Absent', '#b91c1c'], ['excused', 'Excused', '#6b7280']];

const localDT = (iso) => {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return { date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, time: `${p(d.getHours())}:${p(d.getMinutes())}` };
};
const whenText = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
const blankForm = () => {
  const t = new Date(Date.now() + 24 * 3600e3); t.setMinutes(0, 0, 0); t.setHours(15);
  const { date, time } = localDT(t.toISOString());
  return { title: '', meetingType: 'meeting', date, time, durationMin: 30, location: '', agenda: '', audience: { everyone: false, roles: [], staffIds: [] } };
};

export default function MeetingsTab({ restaurantId, apiClient, staffList = [], isMobile }) {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState('upcoming'); // upcoming | past | all

  const staff = useMemo(() => (staffList || []).filter(s => !['deleted', 'inactive', 'disabled'].includes(String(s.status || '').toLowerCase()))
    .map(s => ({ id: s.id || s.staffId || s._id, name: s.name || s.staffName || '', role: s.role || '' })), [staffList]);
  const roles = useMemo(() => [...new Set(staff.map(s => s.role).filter(Boolean))].sort(), [staff]);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true); setError('');
    try { const r = await apiClient.getStaffMeetings(restaurantId); setMeetings(r.meetings || []); }
    catch (e) { setError(e?.message || 'Could not load meetings.'); }
    finally { setLoading(false); }
  }, [restaurantId, apiClient]);
  useEffect(() => { load(); }, [load]);

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(''), 5000); };
  const sentText = (n) => (n && n.sent != null ? ` · notified ${n.sent} staff${n.whatsapp ? ` (${n.whatsapp} on WhatsApp)` : ''}` : '');

  const create = async () => {
    setError('');
    if (!form.title.trim()) return setError('Give the meeting a title.');
    if (!form.date || !form.time) return setError('Choose the date and time.');
    const a = form.audience;
    if (!a.everyone && !a.roles.length && !a.staffIds.length) return setError('Choose who is invited — roles or staff.');
    setSaving(true);
    try {
      const r = await apiClient.createStaffMeeting(restaurantId, {
        title: form.title, meetingType: form.meetingType, scheduledAt: new Date(`${form.date}T${form.time}`).toISOString(),
        durationMin: form.durationMin, location: form.location, agenda: form.agenda, audience: a, notify: true,
      });
      setShowForm(false); setForm(blankForm()); flash(`Meeting scheduled ✓${sentText(r.notified)}`);
      await load();
    } catch (e) { setError(e?.message || 'Could not schedule the meeting.'); }
    finally { setSaving(false); }
  };

  const now = Date.now();
  const shown = meetings.filter(m => filter === 'all' || (filter === 'upcoming'
    ? (m.status === 'scheduled' && new Date(m.scheduledAt).getTime() > now - 6 * 3600e3)
    : !(m.status === 'scheduled' && new Date(m.scheduledAt).getTime() > now - 6 * 3600e3)));
  const pendingMinutes = meetings.filter(m => m.status === 'scheduled' && new Date(m.scheduledAt).getTime() < now).length;

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #eef0f3', padding: isMobile ? 12 : 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaUsers color="#4f46e5" /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Staff Meetings</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Schedule by role, record the conclusion &amp; goals, staff acknowledge.</div>
          </div>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={btn('#4f46e5')}><FaPlus size={11} /> New Meeting</button>
      </div>
      {msg && <div style={{ background: '#ecfdf5', color: '#047857', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 10 }}>{msg}</div>}
      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 10 }}>{error}</div>}
      {pendingMinutes > 0 && <div style={{ background: '#fffbeb', color: '#92400e', borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 10 }}>{pendingMinutes} meeting(s) took place — mark attendance, write the conclusion and publish the minutes.</div>}

      {showForm && (
        <div style={{ border: '1px solid #e0e7ff', background: '#fafaff', borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Title</label><input style={inp} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Kitchen weekly meeting" /></div>
            <div><label style={lbl}>Type</label><select style={inp} value={form.meetingType} onChange={e => setForm({ ...form, meetingType: e.target.value })}>{TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 10, marginTop: 10 }}>
            <div><label style={lbl}>Date</label><input type="date" style={inp} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><label style={lbl}>Time</label><input type="time" style={inp} value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
            <div><label style={lbl}>Minutes</label><input type="number" min="5" style={inp} value={form.durationMin} onChange={e => setForm({ ...form, durationMin: e.target.value })} /></div>
            <div><label style={lbl}>Place</label><input style={inp} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Kitchen / office" /></div>
          </div>
          <div style={{ marginTop: 10 }}><label style={lbl}>Agenda</label><textarea rows={3} style={{ ...inp, resize: 'vertical' }} value={form.agenda} onChange={e => setForm({ ...form, agenda: e.target.value })} placeholder="What will be discussed" /></div>
          <Audience value={form.audience} onChange={(audience) => setForm({ ...form, audience })} roles={roles} staff={staff} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <button onClick={() => setShowForm(false)} style={btn('#fff', '#374151')}>Cancel</button>
            <button disabled={saving} onClick={create} style={{ ...btn('#4f46e5'), opacity: saving ? 0.6 : 1 }}><FaBell size={11} /> {saving ? 'Saving…' : 'Schedule & notify'}</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[['upcoming', 'Upcoming'], ['past', 'Past & cancelled'], ['all', 'All']].map(([k, l]) => <button key={k} onClick={() => setFilter(k)} style={chip(filter === k)}>{l}</button>)}
      </div>
      {loading ? <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
        : !shown.length ? <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>{filter === 'upcoming' ? 'No upcoming meetings.' : 'No meetings here yet.'}</div>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shown.map(m => (
              <MeetingCard key={m.id} m={m} open={openId === m.id} onToggle={() => setOpenId(openId === m.id ? null : m.id)}
                restaurantId={restaurantId} apiClient={apiClient} roles={roles} staff={staff} isMobile={isMobile}
                onChanged={async (text) => { if (text) flash(text); await load(); }} onError={setError} sentText={sentText} />
            ))}
          </div>
        )}
    </div>
  );
}

// Who is invited: everyone, roles, and / or chosen staff.
function Audience({ value, onChange, roles, staff }) {
  const [q, setQ] = useState('');
  const set = (patch) => onChange({ ...value, ...patch });
  const toggleRole = (r) => set({ roles: value.roles.includes(r) ? value.roles.filter(x => x !== r) : [...value.roles, r] });
  const toggleStaff = (id) => set({ staffIds: value.staffIds.includes(id) ? value.staffIds.filter(x => x !== id) : [...value.staffIds, id] });
  const matches = staff.filter(s => !q || s.name.toLowerCase().includes(q.toLowerCase()));
  const count = value.everyone ? staff.length : new Set([...staff.filter(s => value.roles.includes(s.role)).map(s => s.id), ...value.staffIds]).size;
  return (
    <div style={{ marginTop: 10 }}>
      <label style={lbl}>Who is invited · {count} staff</label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <button type="button" onClick={() => set({ everyone: !value.everyone })} style={chip(value.everyone, '#047857')}>Everyone</button>
        {roles.map(r => <button type="button" key={r} onClick={() => toggleRole(r)} style={chip(value.roles.includes(r))}>{r}</button>)}
      </div>
      {!value.everyone && (
        <details>
          <summary style={{ cursor: 'pointer', fontSize: 12, color: '#4f46e5', fontWeight: 600 }}>+ Add specific staff{value.staffIds.length ? ` (${value.staffIds.length})` : ''}</summary>
          <input placeholder="Search staff" value={q} onChange={e => setQ(e.target.value)} style={{ ...inp, margin: '8px 0', maxWidth: 260 }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 160, overflow: 'auto' }}>
            {matches.map(s => <button type="button" key={s.id} onClick={() => toggleStaff(s.id)} style={chip(value.staffIds.includes(s.id))}>{s.name}{s.role ? ` · ${s.role}` : ''}</button>)}
          </div>
        </details>
      )}
    </div>
  );
}

function MeetingCard({ m, open, onToggle, restaurantId, apiClient, roles, staff, isMobile, onChanged, onError, sentText }) {
  const [att, setAtt] = useState(m.attendance || {});
  const [minutes, setMinutes] = useState(m.minutes || '');
  const [decisions, setDecisions] = useState(m.decisions || '');
  const [goals, setGoals] = useState(m.goals || []);
  const [busy, setBusy] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  useEffect(() => { setAtt(m.attendance || {}); setMinutes(m.minutes || ''); setDecisions(m.decisions || ''); setGoals(m.goals || []); }, [m]);

  const invitees = m.invitees || [];
  const acks = m.acks || {};
  const acked = invitees.filter(i => acks[i.staffId]).length;
  const past = new Date(m.scheduledAt).getTime() < Date.now();
  const published = m.status === 'completed' && m.minutesPublishedAt;
  const status = m.status === 'cancelled' ? ['Cancelled', '#b91c1c', '#fef2f2']
    : published ? [`Minutes out · ${acked}/${invitees.length} read`, acked === invitees.length ? '#047857' : '#b45309', acked === invitees.length ? '#ecfdf5' : '#fffbeb']
    : past ? ['Write the minutes', '#b45309', '#fffbeb'] : ['Scheduled', '#4f46e5', '#eef2ff'];

  const run = async (key, fn, okText) => {
    setBusy(key); onError('');
    try { const r = await fn(); await onChanged(typeof okText === 'function' ? okText(r) : okText); }
    catch (e) { onError(e?.message || 'Something went wrong.'); }
    finally { setBusy(''); }
  };
  const save = () => run('save', () => apiClient.updateStaffMeeting(restaurantId, m.id, { attendance: att, minutes, decisions, goals }), 'Saved ✓');
  const publish = () => run('publish', async () => {
    await apiClient.updateStaffMeeting(restaurantId, m.id, { attendance: att, minutes, decisions, goals });
    return apiClient.publishMeetingMinutes(restaurantId, m.id);
  }, (r) => `Minutes published ✓${sentText(r && r.notified)}`);
  const remind = () => run('remind', () => apiClient.remindStaffMeeting(restaurantId, m.id), (r) => (r && r.message) || `Reminder sent ✓${sentText(r && r.notified)}`);
  const cancel = () => run('cancel', () => apiClient.cancelStaffMeeting(restaurantId, m.id, reason), (r) => `Meeting cancelled${sentText(r && r.notified)}`);

  const editable = m.status !== 'cancelled';
  const addGoal = () => setGoals(g => [...g, { id: Math.random().toString(36).slice(2, 10), text: '', target: '', category: 'target', roles: [], staffIds: [], dueDate: null, status: 'open' }]);
  const setGoal = (i, patch) => setGoals(g => g.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', opacity: m.status === 'cancelled' ? 0.65 : 1 }}>
      <div onClick={onToggle} style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', cursor: 'pointer' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#111827' }}>{m.title}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{whenText(m.scheduledAt)} · {m.durationMin} min{m.location ? ` · ${m.location}` : ''} · {invitees.length} invited{m.audience?.roles?.length ? ` (${m.audience.roles.join(', ')})` : ''}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, color: status[1], background: status[2] }}>{status[0]}</span>
          {open ? <FaChevronUp size={12} color="#9ca3af" /> : <FaChevronDown size={12} color="#9ca3af" />}
        </div>
      </div>
      {open && (
        <div style={{ padding: '0 12px 14px', borderTop: '1px solid #f3f4f6' }}>
          {m.agenda && <p style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap', margin: '10px 0' }}><b>Agenda:</b> {m.agenda}</p>}
          {m.cancelledReason && <p style={{ fontSize: 13, color: '#b91c1c' }}>Cancelled: {m.cancelledReason}</p>}

          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '10px 0 6px' }}>Attendance{published ? ' & who has read the minutes' : ''}</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {invitees.map(i => (
              <div key={i.staffId} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13 }}>
                <span style={{ minWidth: isMobile ? 120 : 180, fontWeight: 600 }}>{i.name || i.staffId}<span style={{ color: '#9ca3af', fontWeight: 400 }}>{i.role ? ` · ${i.role}` : ''}</span></span>
                {editable && ATT.map(([k, l, c]) => <button key={k} type="button" onClick={() => setAtt(a => ({ ...a, [i.staffId]: a[i.staffId] === k ? undefined : k }))} style={{ ...chip(att[i.staffId] === k, c), padding: '3px 9px' }}>{l}</button>)}
                {published && (acks[i.staffId]
                  ? <span style={{ color: '#047857', fontSize: 12, fontWeight: 700 }}><FaCheck size={10} /> read {new Date(acks[i.staffId].at).toLocaleDateString()}</span>
                  : <span style={{ color: '#b45309', fontSize: 12, fontWeight: 600 }}>not read yet</span>)}
              </div>
            ))}
          </div>

          {editable && (<>
            <div style={{ marginTop: 12 }}><label style={lbl}>Conclusion / minutes</label><textarea rows={4} style={{ ...inp, resize: 'vertical' }} value={minutes} onChange={e => setMinutes(e.target.value)} placeholder="What was discussed and concluded" /></div>
            <div style={{ marginTop: 10 }}><label style={lbl}>Decisions</label><textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={decisions} onChange={e => setDecisions(e.target.value)} placeholder="Decisions everyone must follow" /></div>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ ...lbl, margin: 0 }}>Goals &amp; targets (per role or person · promotion goals)</label>
              <button type="button" onClick={addGoal} style={{ ...btn('#fff', '#4f46e5'), padding: '5px 10px', fontSize: 12 }}><FaPlus size={10} /> Goal</button>
            </div>
            {goals.map((g, i) => (
              <div key={g.id} style={{ border: '1px solid #eef0f3', borderRadius: 10, padding: 10, marginTop: 8, background: '#fcfcfd' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 120px 140px 32px', gap: 8, alignItems: 'end' }}>
                  <div><label style={lbl}>Goal</label><input style={inp} value={g.text} onChange={e => setGoal(i, { text: e.target.value })} placeholder="e.g. Prepare 40 dosai / hour" /></div>
                  <div><label style={lbl}>Target / measure</label><input style={inp} value={g.target} onChange={e => setGoal(i, { target: e.target.value })} placeholder="e.g. by month end" /></div>
                  <div><label style={lbl}>Kind</label><select style={inp} value={g.category} onChange={e => setGoal(i, { category: e.target.value })}>{GOAL_CATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                  <div><label style={lbl}>Due</label><input type="date" style={inp} value={g.dueDate || ''} onChange={e => setGoal(i, { dueDate: e.target.value || null })} /></div>
                  <button type="button" title="Remove goal" onClick={() => setGoals(x => x.filter((_, j) => j !== i))} style={{ border: 'none', background: 'none', color: '#b91c1c', cursor: 'pointer', paddingBottom: 8 }}><FaTrash size={12} /></button>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: '#6b7280' }}>For:</span>
                  {roles.map(r => <button key={r} type="button" onClick={() => setGoal(i, { roles: g.roles.includes(r) ? g.roles.filter(x => x !== r) : [...g.roles, r] })} style={{ ...chip(g.roles.includes(r)), padding: '3px 9px' }}>{r}</button>)}
                  <select value="" onChange={e => { const id = e.target.value; if (id) setGoal(i, { staffIds: g.staffIds.includes(id) ? g.staffIds : [...g.staffIds, id] }); }} style={{ ...inp, width: 'auto', padding: '4px 8px', fontSize: 12 }}>
                    <option value="">+ person</option>
                    {invitees.map(x => <option key={x.staffId} value={x.staffId}>{x.name}</option>)}
                  </select>
                  {g.staffIds.map(id => <span key={id} style={{ ...chip(true, '#047857'), padding: '3px 9px' }} onClick={() => setGoal(i, { staffIds: g.staffIds.filter(x => x !== id) })}>{(staff.find(s => s.id === id) || invitees.find(s => s.staffId === id) || {}).name || id} ✕</span>)}
                  {published && <select value={g.status} onChange={e => setGoal(i, { status: e.target.value })} style={{ ...inp, width: 'auto', padding: '4px 8px', fontSize: 12, marginLeft: 'auto' }}><option value="open">Open</option><option value="achieved">Achieved</option><option value="missed">Missed</option></select>}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              <button disabled={!!busy} onClick={save} style={btn('#fff', '#374151')}>{busy === 'save' ? 'Saving…' : 'Save'}</button>
              <button disabled={!!busy} onClick={publish} style={btn('#047857')}><FaBell size={11} /> {busy === 'publish' ? 'Publishing…' : published ? 'Re-publish & notify' : 'Publish minutes & notify'}</button>
              <button disabled={!!busy} onClick={remind} style={btn('#fff', '#4f46e5')}><FaBell size={11} /> {busy === 'remind' ? 'Sending…' : published ? 'Remind who hasn’t read' : 'Send reminder'}</button>
              {!published && !cancelling && <button onClick={() => setCancelling(true)} style={{ ...btn('#fff', '#b91c1c'), marginLeft: 'auto' }}><FaTimes size={11} /> Cancel meeting</button>}
            </div>
            {cancelling && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <input style={{ ...inp, maxWidth: 320 }} value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (sent to the staff)" />
                <button disabled={!!busy} onClick={cancel} style={btn('#b91c1c')}>{busy === 'cancel' ? 'Cancelling…' : 'Cancel & notify'}</button>
                <button onClick={() => setCancelling(false)} style={btn('#fff', '#374151')}>Keep it</button>
              </div>
            )}
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Publishing sends the minutes to everyone invited — those marked absent get &quot;You missed this meeting&quot; — and each must tap &quot;I have read it&quot;.</div>
          </>)}
        </div>
      )}
    </div>
  );
}
