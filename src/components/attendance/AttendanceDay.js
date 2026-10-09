'use client';

// One staff member's attendance day on the web: the summary every table shows (state, first in / last
// out, breaks, net worked time, exceptions), the day timeline (sessions, breaks, where each punch came
// from, edit history) and the session editor (owner / manager fixes a day — a missed punch-out, a
// forgotten break, a split shift). Numbers come from the server's day calculation (record.calc);
// older records without it fall back to their clock-in / clock-out.

import { useState } from 'react';
import { fmtTime } from '../../lib/restaurantTime';

const t12 = (v) => (v ? fmtTime(v, 'en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }, '-') : '-');
const hhmm = (v) => { if (!v) return ''; const t = fmtTime(v, 'en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }); return /^\d{2}:\d{2}$/.test(t) ? t : ''; };
export const fmtMins = (m) => {
  const n = Math.max(0, Math.round(Number(m) || 0));
  if (!n) return '0m';
  const h = Math.floor(n / 60), mm = n % 60;
  return h ? (mm ? `${h}h ${mm}m` : `${h}h`) : `${mm}m`;
};

// → { state, firstIn, lastOut, workedMin, breakMin, breaks, sessions, exceptions, open, hasCalc }
export function dayView(a) {
  const c = a && a.calc;
  if (c && c.version) {
    return {
      hasCalc: true,
      state: c.state, open: !!c.open,
      firstIn: c.firstIn, lastOut: c.state === 'done' ? c.lastOut : (c.lastOut || null),
      workedMin: Number(c.workedMinutes) || 0, breakMin: Number(c.breakMinutes) || 0,
      paidBreakMin: Number(c.paidBreakMinutes) || 0,
      breaks: c.breaks || [], sessions: c.sessions || [], exceptions: c.exceptions || [],
      scheduledMin: Number(c.scheduledMinutes) || 0, notes: c.notes || [], ignored: c.ignored || [],
    };
  }
  // older record: one span (or app sessions + the current one)
  const ms = (v) => { const d = new Date(v && v._seconds ? v._seconds * 1000 : v); return d.getTime(); };
  const inT = a && (a.firstClockIn || a.clockIn), outT = a && a.clockOut;
  let worked = 0;
  if (a && a.totalHours != null && a.totalHours !== '') worked = Math.round(Number(a.totalHours) * 60);
  else if (inT && outT) worked = Math.max(0, Math.round((ms(outT) - ms(inT)) / 60000));
  return {
    hasCalc: false,
    state: a && a.clockIn ? (a.clockOut ? 'done' : 'working') : 'none', open: !!(a && a.clockIn && !a.clockOut),
    firstIn: inT || null, lastOut: outT || null, workedMin: worked, breakMin: 0, paidBreakMin: 0,
    breaks: [], sessions: inT ? [{ in: inT, out: outT || null, minutes: worked }] : [], exceptions: [], scheduledMin: 0, notes: [], ignored: [],
  };
}

const STATE = {
  working: { label: 'Working', bg: '#dcfce7', color: '#166534' },
  on_break: { label: 'On break', bg: '#fef9c3', color: '#854d0e' },
  done: { label: 'Done', bg: '#f3f4f6', color: '#374151' },
  missing_out: { label: 'Missing punch-out', bg: '#fee2e2', color: '#b91c1c' },
};
export function StateBadge({ view }) {
  const s = STATE[view.state];
  if (!s) return null;
  return <span style={{ padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>;
}

const SEV = { error: { bg: '#fee2e2', color: '#b91c1c' }, warn: { bg: '#fef3c7', color: '#92400e' }, info: { bg: '#f3f4f6', color: '#4b5563' } };
const CODE_LABEL = {
  MISSING_OUT: 'Missing punch-out', AUTO_CLOSED: 'Auto clock-out', REPEAT_OUT_ASSUMED: 'Repeat tap?', LONG_BREAK: 'Long break',
  NOT_ON_ROTA: 'Not on rota', EARLY_LEAVE: 'Left early', EDITED_AFTER_PAYROLL: 'Edited after payroll', REPEAT_TAP: 'Repeat tap',
};
// error + warning flags (late / repeat taps are informational and shown elsewhere)
export function ExceptionChips({ exceptions = [], showInfo = false }) {
  const seen = new Set();
  const list = exceptions.filter(e => (showInfo || e.severity !== 'info') && CODE_LABEL[e.code] && !seen.has(e.code) && seen.add(e.code));
  if (!list.length) return null;
  return (
    <span style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
      {list.map(e => {
        const c = SEV[e.severity] || SEV.info;
        return <span key={e.code} title={e.message} style={{ padding: '2px 7px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, background: c.bg, color: c.color, whiteSpace: 'nowrap' }}>{CODE_LABEL[e.code]}</span>;
      })}
    </span>
  );
}
export const needsAttention = (a) => (dayView(a).exceptions || []).some(e => e.severity === 'error' || e.severity === 'warn');

const SRC_ICON = { biometric: '📟', app: '📱', web: '💻', manual: '✍️', auto: '⏱', rule: '⏱', legacy: '•' };
const srcLabel = (s) => ({ biometric: 'biometric', app: 'app', web: 'web', manual: 'edited', auto: 'auto clock-out', rule: 'auto clock-out', legacy: '' })[s] ?? (s || '');

// Expanded row: timeline bar, sessions / breaks list, flags, notes and edit history.
export function DayDetail({ record, canEdit, onEdit }) {
  const v = dayView(record);
  const pts = [...v.sessions.flatMap(s => [s.in, s.out]), ...v.breaks.flatMap(b => [b.start, b.end])].filter(Boolean).map(x => new Date(x).getTime());
  const lo = pts.length ? Math.min(...pts) : 0;
  const hiRaw = pts.length ? Math.max(...pts) : 1;
  const hi = v.open ? Math.max(hiRaw, Date.now()) : hiRaw;
  const span = Math.max(1, hi - lo);
  const pos = (x) => `${((new Date(x).getTime() - lo) / span) * 100}%`;
  const width = (a, b) => `${Math.max(0.6, ((new Date(b || Date.now()).getTime() - new Date(a).getTime()) / span) * 100)}%`;
  const edits = Array.isArray(record.timeEdits) ? record.timeEdits : [];
  return (
    <div style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: '10px', fontSize: '13px' }}>
      {v.sessions.length > 0 && (
        <div style={{ position: 'relative', height: '22px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '10px', overflow: 'hidden' }}>
          {v.sessions.map((s, i) => (
            <div key={`s${i}`} title={`Work ${t12(s.in)} – ${s.out ? t12(s.out) : 'now'}`}
              style={{ position: 'absolute', top: 0, bottom: 0, left: pos(s.in), width: width(s.in, s.out), background: s.missingOut ? '#fca5a5' : s.auto ? '#93c5fd' : '#86efac' }} />
          ))}
          {v.breaks.map((b, i) => (
            <div key={`b${i}`} title={`Break ${fmtMins(b.minutes)}`}
              style={{ position: 'absolute', top: 0, bottom: 0, left: pos(b.start), width: width(b.start, b.end), background: 'repeating-linear-gradient(45deg,#fde68a,#fde68a 4px,#fef3c7 4px,#fef3c7 8px)' }} />
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gap: '4px' }}>
        {v.sessions.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, minWidth: '74px' }}>Session {i + 1}</span>
            <span>{SRC_ICON[s.inSrc] || ''} {t12(s.in)} → {s.out ? <>{SRC_ICON[s.outSrc] || ''} {t12(s.out)}</> : (s.missingOut ? <b style={{ color: '#b91c1c' }}>no punch-out</b> : <b style={{ color: '#166534' }}>working</b>)}</span>
            <span style={{ color: '#6b7280' }}>{s.out ? fmtMins(s.minutes) : ''}{s.auto ? ' · closed automatically' : ''}{s.inSrc && srcLabel(s.inSrc) ? ` · ${srcLabel(s.inSrc)}` : ''}</span>
            {v.breaks[i] && <span style={{ color: '#92400e' }}>· then break {fmtMins(v.breaks[i].minutes)}{v.breaks[i].open ? ' (now)' : ''}</span>}
          </div>
        ))}
        {!v.sessions.length && <span style={{ color: '#9ca3af' }}>No clock-in this day.</span>}
      </div>
      <div style={{ marginTop: '8px', display: 'flex', gap: '14px', flexWrap: 'wrap', color: '#374151' }}>
        <span>Worked <b>{fmtMins(v.workedMin)}</b></span>
        {v.breakMin > 0 && <span>Breaks <b>{fmtMins(v.breakMin)}</b>{v.paidBreakMin ? ` (${fmtMins(v.paidBreakMin)} paid)` : ' (unpaid)'}</span>}
        {v.scheduledMin > 0 && <span>Rota <b>{fmtMins(v.scheduledMin)}</b></span>}
      </div>
      {v.exceptions.length > 0 && (
        <ul style={{ margin: '8px 0 0', paddingLeft: '18px', color: '#374151' }}>
          {v.exceptions.map((e, i) => <li key={i} style={{ color: (SEV[e.severity] || SEV.info).color }}>{e.message}</li>)}
        </ul>
      )}
      {v.notes.length > 0 && <div style={{ marginTop: '6px', color: '#6b7280', fontSize: '12px' }}>{v.notes.join(' · ')}</div>}
      {edits.length > 0 && (
        <details style={{ marginTop: '8px' }}>
          <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '12px' }}>Edit history ({edits.length})</summary>
          {edits.slice().reverse().map((e, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}>
              {e.at ? new Date(e.at).toLocaleString() : ''} · {e.byName || e.by || 'someone'}{e.reason ? ` · "${e.reason}"` : ''}
              {e.from && (e.from.clockIn || e.from.clockOut) ? ` · was ${t12(e.from.clockIn)} – ${t12(e.from.clockOut)}` : ''}
            </div>
          ))}
        </details>
      )}
      {canEdit && onEdit && (
        <div style={{ marginTop: '10px' }}>
          <button onClick={onEdit} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>✏️ Edit sessions</button>
        </div>
      )}
    </div>
  );
}

// Session editor (owner / manager): the whole day as sessions — add the missed punch-out, split a day
// with a break, add a second shift. Times are the restaurant's clock; a time earlier than the one
// before it is the next morning (night shift).
export function SessionEditor({ record, staffName, onCancel, onSave, saving }) {
  const v = dayView(record);
  const [rows, setRows] = useState(() => (v.sessions.length ? v.sessions : [{ in: null, out: null }]).map(s => ({ in: hhmm(s.in), out: s.out ? hhmm(s.out) : '' })));
  const [reason, setReason] = useState('');
  const set = (i, k, val) => setRows(r => r.map((x, j) => (j === i ? { ...x, [k]: val } : x)));
  const valid = rows.some(r => r.in) && rows.every(r => !r.out || r.in);
  const inp = { padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' };
  return (
    <div onClick={saving ? undefined : onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', padding: '20px', width: '100%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>Edit day · {staffName || record.staffName || ''}</h3>
        <p style={{ margin: '0 0 12px', color: '#6b7280', fontSize: '12px' }}>{record.date} · each session is a clock-in and clock-out; the gaps between are breaks.</p>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ width: '70px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>Session {i + 1}</span>
            <input type="time" value={r.in} onChange={e => set(i, 'in', e.target.value)} style={inp} />
            <span style={{ color: '#9ca3af' }}>→</span>
            <input type="time" value={r.out} onChange={e => set(i, 'out', e.target.value)} style={inp} placeholder="still working" />
            {rows.length > 1 && <button onClick={() => setRows(x => x.filter((_, j) => j !== i))} title="Remove" style={{ border: 'none', background: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '16px' }}>✕</button>}
          </div>
        ))}
        <button onClick={() => setRows(x => [...x, { in: '', out: '' }])} style={{ border: '1px dashed #d1d5db', background: '#fff', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', marginBottom: '10px' }}>+ Add session</button>
        <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Reason (e.g. forgot to punch out)" style={{ ...inp, width: '100%', boxSizing: 'border-box', marginBottom: '12px' }} />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} disabled={saving} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Cancel</button>
          <button disabled={!valid || saving} onClick={() => onSave(rows.filter(r => r.in).map(r => ({ in: r.in, out: r.out || null })), reason)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: !valid || saving ? 0.6 : 1 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
