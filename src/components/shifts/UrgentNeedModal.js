'use client';

// "Need extra staff (urgent)" — MFC: someone took urgent leave or didn't show up. The manager picks the
// day + time + role (or the absent person's shift, which fills them in), how many and a note; the
// server creates open shifts, publishes them and alerts the staff who can do that role and are free.
// Staff take it in My Shifts and the manager approves (the usual open-shift flow).

import { useMemo, useState } from 'react';
import apiClient from '../../lib/api';

const box = { position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 };
const card = { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', padding: 20, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' };
const lbl = { fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', margin: '12px 0 6px' };
const inp = { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', background: '#fff' };
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

export default function UrgentNeedModal({ restaurantId, staff = [], shifts = [], onClose, onDone }) {
  const [date, setDate] = useState(todayISO());
  const [coverId, setCoverId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [role, setRole] = useState('');
  const [count, setCount] = useState(1);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const roles = useMemo(() => {
    const set = new Set();
    staff.filter(s => s.status === 'active').forEach(s => { if (s.role) set.add(s.role); (s.extraRoles || []).forEach(r => r && set.add(r)); });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [staff]);
  const nameOf = (id) => (staff.find(s => s.id === id) || {}).name || '';
  const dayShifts = shifts.filter(s => s.date === date && s.staffId)
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

  const pickCover = (id) => {
    setCoverId(id);
    const sh = shifts.find(s => s.id === id);
    if (sh) { setStartTime(sh.startTime || ''); setEndTime(sh.endTime || ''); setRole(sh.role || ''); }
  };

  const send = async () => {
    setError('');
    if (!startTime || !endTime) return setError('Choose the start and end time');
    if (!role) return setError('Choose the role you need');
    setBusy(true);
    try {
      const r = await apiClient.requestUrgentStaff(restaurantId, { date, startTime, endTime, role, count, note: note.trim(), coverShiftId: coverId || undefined });
      setResult(r);
      onDone && onDone();
    } catch (e) {
      setError(e?.message || 'Could not send the alert');
    } finally { setBusy(false); }
  };

  return (
    <div style={box} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>Need extra staff (urgent)</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Someone is on leave or didn&apos;t come? Staff who can do the role and are free get an alert now and can take the shift in My Shifts — you approve.</div>

        {result ? (
          <div style={{ marginTop: 16 }}>
            <div style={{ background: '#ecfdf5', color: '#065f46', borderRadius: 10, padding: 12, fontSize: 14, fontWeight: 600 }}>
              Alert sent to {result.notified?.staff || 0} staff{result.created > 1 ? ` for ${result.created} places` : ''}.
            </div>
            {(result.notified?.skippedBusy || result.notified?.skippedLeave) ? (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                Not alerted: {result.notified.skippedBusy || 0} already on a shift then, {result.notified.skippedLeave || 0} on leave.
              </div>
            ) : null}
            {result.notified?.staff === 0 && <div style={{ fontSize: 12, color: '#b45309', marginTop: 8 }}>Nobody with that role is free — the open shift is still posted in Shifts.</div>}
            <button type="button" onClick={onClose} style={{ marginTop: 16, width: '100%', padding: 12, borderRadius: 10, border: 'none', background: '#111827', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Done</button>
          </div>
        ) : (
          <>
            <label style={lbl} htmlFor="un-date">Day</label>
            <input id="un-date" type="date" style={inp} value={date} onChange={(e) => { setDate(e.target.value); setCoverId(''); }} />
            {dayShifts.length > 0 && (<>
              <label style={lbl} htmlFor="un-cover">Covering for (optional)</label>
              <select id="un-cover" style={inp} value={coverId} onChange={(e) => (e.target.value ? pickCover(e.target.value) : setCoverId(''))}>
                <option value="">— not covering anyone —</option>
                {dayShifts.map(s => <option key={s.id} value={s.id}>{nameOf(s.staffId) || s.staffName || 'Staff'} · {s.role} · {s.startTime}–{s.endTime}</option>)}
              </select>
            </>)}
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}><label style={lbl} htmlFor="un-start">From</label><input id="un-start" type="time" style={inp} value={startTime} onChange={(e) => setStartTime(e.target.value)} /></div>
              <div style={{ flex: 1 }}><label style={lbl} htmlFor="un-end">To</label><input id="un-end" type="time" style={inp} value={endTime} onChange={(e) => setEndTime(e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 2 }}>
                <label style={lbl} htmlFor="un-role">Role needed</label>
                <select id="un-role" style={inp} value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="">Choose…</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={lbl} htmlFor="un-count">How many</label>
                <input id="un-count" type="number" min={1} max={10} style={inp} value={count} onChange={(e) => setCount(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))} />
              </div>
            </div>
            <label style={lbl} htmlFor="un-note">Note (optional)</label>
            <input id="un-note" style={inp} value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} placeholder={coverId ? `Cover for ${nameOf((shifts.find(s => s.id === coverId) || {}).staffId)}` : 'e.g. Lunch rush, 2 waiters short'} />
            {error && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 10 }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1.5px solid #e5e7eb', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={send} disabled={busy} style={{ flex: 2, padding: 12, borderRadius: 10, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 800, cursor: busy ? 'wait' : 'pointer' }}>{busy ? 'Sending…' : 'Send alert'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
