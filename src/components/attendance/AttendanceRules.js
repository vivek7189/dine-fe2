'use client';

// Attendance → Settings → Rules: how punches become worked time (breaks, repeat taps, missing
// punch-out, late, overtime, rounding) — the server applies them to every way time is recorded
// (biometric, app, web, manual edits). Owner edits; managers see them. Only the settings changed here
// are sent (the rest keep following the defaults / older Attendance settings).
// Plus "Recalculate days": preview how past days change under the current rules, then apply.

import { useEffect, useState } from 'react';
import * as attendanceApi from '../../services/attendanceApi';
import { fmtMins } from './AttendanceDay';

const card = { background: '#fff', borderRadius: '12px', padding: '18px', border: '1px solid #e5e7eb', marginBottom: '14px' };
const label = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' };
const hint = { fontSize: '11px', color: '#6b7280', marginTop: '3px' };
const input = { padding: '7px 9px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', width: '110px' };
const chip = (on) => ({ padding: '6px 12px', borderRadius: '999px', border: `1px solid ${on ? '#ef4444' : '#d1d5db'}`, background: on ? '#fef2f2' : '#fff', color: on ? '#b91c1c' : '#374151', fontWeight: on ? 700 : 500, fontSize: '12px', cursor: 'pointer' });
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '14px' };

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const clone = (o) => JSON.parse(JSON.stringify(o || {}));
// what changed between a and b (b's values)
function diff(a, b) {
  const out = {};
  for (const k of Object.keys(b || {})) {
    if (isObj(b[k])) { const d = diff((a || {})[k], b[k]); if (Object.keys(d).length) out[k] = d; }
    else if (JSON.stringify((a || {})[k]) !== JSON.stringify(b[k])) out[k] = b[k];
  }
  return out;
}

export default function AttendanceRules({ restaurantId, userRole, showToast }) {
  const canEdit = ['owner', 'admin', 'co-owner'].includes(String(userRole || '').toLowerCase());
  const [loaded, setLoaded] = useState(null);
  const [r, setR] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!restaurantId) return;
    attendanceApi.getAttendanceRules(restaurantId).then(res => { setLoaded(clone(res.rules)); setR(clone(res.rules)); }).catch(e => setErr(e.message || 'Could not load the rules'));
  }, [restaurantId]);

  if (err) return <div style={card}><b>Attendance rules</b><p style={{ color: '#b91c1c', fontSize: '13px' }}>{err}</p></div>;
  if (!r) return <div style={card}>Loading attendance rules…</div>;

  const set = (path, val) => setR(cur => {
    const next = clone(cur); let o = next; const keys = path.split('.');
    keys.slice(0, -1).forEach(k => { o[k] = o[k] || {}; o = o[k]; });
    o[keys[keys.length - 1]] = val; return next;
  });
  const num = (path, v, { min = 0, max = 999 } = {}) => set(path, v === '' ? '' : Math.max(min, Math.min(max, Number(v))));
  const changes = diff(loaded, r);
  const dirty = Object.keys(changes).length > 0;
  const save = async () => {
    setSaving(true);
    try {
      const res = await attendanceApi.saveAttendanceRules(restaurantId, changes);
      setLoaded(clone(res.rules)); setR(clone(res.rules));
      showToast && showToast(`Rules saved ✓${res.recalculated ? ` · ${res.recalculated} day(s) of today / yesterday updated` : ''}`, 'success');
    } catch (e) { showToast && showToast(e.message || 'Could not save the rules', 'error'); }
    setSaving(false);
  };
  const dis = !canEdit;

  return (
    <div>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Attendance rules</h3>
          {canEdit && <button disabled={!dirty || saving} onClick={save} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: !dirty || saving ? 0.5 : 1 }}>{saving ? 'Saving…' : 'Save rules'}</button>}
        </div>
        <p style={{ ...hint, fontSize: '12px', margin: '0 0 6px' }}>
          How punches become worked time — for the biometric machine, the app, the web and manual edits alike. New days follow these rules; use <b>Recalculate days</b> below for past days.
          {!canEdit && ' Only the owner can change them.'}
        </p>
      </div>

      <div style={card}>
        <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Punches</h4>
        <div style={grid}>
          <div>
            <label style={label}>Same punch if within (min)</label>
            <input type="number" disabled={dis} style={input} value={r.punches.mergeWindowMinutes} onChange={e => num('punches.mergeWindowMinutes', e.target.value, { max: 30 })} />
            <div style={hint}>A machine punch this soon after the previous one is a repeat tap and is ignored.</div>
          </div>
          <div>
            <label style={label}>Not a break if shorter than (min)</label>
            <input type="number" disabled={dis} style={input} value={r.punches.minBreakMinutes} onChange={e => num('punches.minBreakMinutes', e.target.value, { max: 120 })} />
            <div style={hint}>A gap shorter than this counts as work. A last punch this soon after a punch-out is taken as tapping out again.</div>
          </div>
        </div>
      </div>

      <div style={card}>
        <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Breaks</h4>
        <div style={grid}>
          <div>
            <label style={label}>Break time is</label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button disabled={dis} onClick={() => set('breaks.paid', false)} style={chip(!r.breaks.paid)}>Unpaid</button>
              <button disabled={dis} onClick={() => set('breaks.paid', true)} style={chip(r.breaks.paid)}>Paid</button>
            </div>
            <div style={hint}>Unpaid: the time between punch-out and punch-in again is not worked time.</div>
          </div>
          {!r.breaks.paid && (
            <div>
              <label style={label}>Paid break allowance (min / day)</label>
              <input type="number" disabled={dis} style={input} value={r.breaks.paidAllowanceMinutes} onChange={e => num('breaks.paidAllowanceMinutes', e.target.value, { max: 240 })} />
              <div style={hint}>e.g. 15 → the first 15 min of breaks each day are still paid.</div>
            </div>
          )}
          <div>
            <label style={label}>No break punched → deduct</label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button disabled={dis} onClick={() => set('breaks.autoDeduct.enabled', !r.breaks.autoDeduct.enabled)} style={chip(r.breaks.autoDeduct.enabled)}>{r.breaks.autoDeduct.enabled ? 'On' : 'Off'}</button>
              {r.breaks.autoDeduct.enabled && (<>
                <input type="number" disabled={dis} style={{ ...input, width: '64px' }} value={r.breaks.autoDeduct.minutes} onChange={e => num('breaks.autoDeduct.minutes', e.target.value, { max: 240 })} /><span style={{ fontSize: '12px' }}>min after</span>
                <input type="number" disabled={dis} style={{ ...input, width: '56px' }} value={r.breaks.autoDeduct.afterHours} onChange={e => num('breaks.autoDeduct.afterHours', e.target.value, { max: 24 })} /><span style={{ fontSize: '12px' }}>h worked</span>
              </>)}
            </div>
            <div style={hint}>For staff who never punch their break.</div>
          </div>
          <div>
            <label style={label}>Flag breaks longer than (min, 0 = off)</label>
            <input type="number" disabled={dis} style={input} value={r.breaks.flagLongerThanMinutes} onChange={e => num('breaks.flagLongerThanMinutes', e.target.value, { max: 1440 })} />
          </div>
        </div>
      </div>

      <div style={card}>
        <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Forgot to punch out</h4>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {[['flag', 'Flag it for a manager'], ['shiftEnd', 'Close at the rota shift end'], ['fixedTime', 'Close at the auto clock-out time']].map(([k, l]) => (
            <button key={k} disabled={dis} onClick={() => set('missingOut.mode', k)} style={chip(r.missingOut.mode === k)}>{l}</button>
          ))}
        </div>
        <div style={hint}>
          {r.missingOut.mode === 'flag' && 'The day shows "Missing punch-out" and that session is not counted until a manager adds the time.'}
          {r.missingOut.mode === 'shiftEnd' && 'Closed at the end of their rota shift (or the work end time) and marked "Auto clock-out" for a manager to check.'}
          {r.missingOut.mode === 'fixedTime' && 'Closed at the auto clock-out time set in Attendance settings above, and marked "Auto clock-out".'}
        </div>
        <div style={{ ...grid, marginTop: '10px' }}>
          <div>
            <label style={label}>Missing after (hours open)</label>
            <input type="number" disabled={dis} style={input} value={r.missingOut.maxOpenHours} onChange={e => num('missingOut.maxOpenHours', e.target.value, { min: 1, max: 48 })} />
          </div>
          <div>
            <label style={label}>…or hours after their rota shift ends</label>
            <input type="number" disabled={dis} style={input} value={r.missingOut.afterShiftHours} onChange={e => num('missingOut.afterShiftHours', e.target.value, { min: 0.5, max: 24 })} />
          </div>
          {r.missingOut.mode !== 'flag' && (
            <div>
              <label style={label}>Wait after that time (min)</label>
              <input type="number" disabled={dis} style={input} value={r.missingOut.graceMinutes} onChange={e => num('missingOut.graceMinutes', e.target.value, { max: 240 })} />
              <div style={hint}>Time for them to punch out themselves first.</div>
            </div>
          )}
        </div>
      </div>

      <div style={card}>
        <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Late &amp; early leave</h4>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          {[['rota', 'Against their rota shift'], ['workHours', 'Against work hours'], ['off', 'Don’t track']].map(([k, l]) => (
            <button key={k} disabled={dis} onClick={() => set('late.basis', k)} style={chip(r.late.basis === k)}>{l}</button>
          ))}
        </div>
        <div style={hint}>Rota: each shift slot separately (a split shift has two starts); not on the rota → the work hours above.</div>
        <div style={{ ...grid, marginTop: '10px' }}>
          <div>
            <label style={label}>Late grace (min)</label>
            <input type="number" disabled={dis} style={input} value={r.late.graceMinutes ?? ''} onChange={e => num('late.graceMinutes', e.target.value, { max: 240 })} />
          </div>
          <div>
            <label style={label}>Early-leave grace (min)</label>
            <input type="number" disabled={dis} style={input} value={r.late.earlyLeaveGraceMinutes} onChange={e => num('late.earlyLeaveGraceMinutes', e.target.value, { max: 240 })} />
          </div>
        </div>
      </div>

      <div style={card}>
        <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Overtime</h4>
        <div style={hint}>Overtime on / off, the basic hours a day and the pay rate are in <b>Books → Payroll → Settings</b> (or the Overtime setting above). Overtime is worked out from net worked time (unpaid breaks excluded).</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '10px 0' }}>
          <button disabled={dis} onClick={() => set('overtime.basis', 'daily')} style={chip(r.overtime.basis === 'daily')}>Beyond the day&apos;s basic hours</button>
          <button disabled={dis} onClick={() => set('overtime.basis', 'rota')} style={chip(r.overtime.basis === 'rota')}>Beyond their rostered hours</button>
        </div>
        <div style={grid}>
          <div>
            <label style={label}>Count overtime only from (min)</label>
            <input type="number" disabled={dis} style={input} value={r.overtime.minMinutes} onChange={e => num('overtime.minMinutes', e.target.value, { max: 600 })} />
            <div style={hint}>e.g. 30 → 20 extra minutes are not overtime.</div>
          </div>
          <div>
            <label style={label}>Round overtime down to (min)</label>
            <input type="number" disabled={dis} style={input} value={r.overtime.roundDownMinutes} onChange={e => num('overtime.roundDownMinutes', e.target.value, { min: 1, max: 60 })} />
          </div>
        </div>
      </div>

      <div style={card}>
        <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Rounding worked time</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px' }}>Round to</span>
          <select disabled={dis} value={r.rounding.minutes} onChange={e => set('rounding.minutes', Number(e.target.value))} style={{ ...input, width: '90px' }}>
            {[1, 5, 10, 15, 30].map(m => <option key={m} value={m}>{m === 1 ? 'exact' : `${m} min`}</option>)}
          </select>
          {r.rounding.minutes > 1 && ['nearest', 'down', 'up'].map(m => <button key={m} disabled={dis} onClick={() => set('rounding.mode', m)} style={chip(r.rounding.mode === m)}>{m}</button>)}
        </div>
      </div>

      {canEdit && <Recalculate restaurantId={restaurantId} showToast={showToast} dirty={dirty} />}
    </div>
  );
}

// Preview how days change under the current rules, then apply (owner).
function Recalculate({ restaurantId, showToast, dirty }) {
  const today = new Date();
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [from, setFrom] = useState(ymd(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [to, setTo] = useState(ymd(today));
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [includeLocked, setIncludeLocked] = useState(false);
  const run = async (apply) => {
    setBusy(true); setConfirm(false);
    try {
      const r = await attendanceApi.recalculateAttendance(restaurantId, { from, to, apply, includeLocked });
      setRes(r);
      if (apply) showToast && showToast(`${r.written} day(s) updated ✓`, 'success');
    } catch (e) { showToast && showToast(e.message || 'Could not recalculate', 'error'); }
    setBusy(false);
  };
  const h = (x) => (x == null ? '–' : `${Math.round(Number(x) * 100) / 100}h`);
  return (
    <div style={card}>
      <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>Recalculate days</h4>
      <div style={hint}>Re-work past days with the rules above (after changing a rule, or for days recorded before multiple punches were supported). Preview first — nothing changes until you apply. Days in a month whose payroll is already approved are not changed unless you tick the box.</div>
      {dirty && <div style={{ ...hint, color: '#b45309' }}>Save the rules first — the preview uses the saved rules.</div>}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
        <input type="date" value={from} onChange={e => { setFrom(e.target.value); setRes(null); }} style={{ ...input, width: '150px' }} />
        <span>→</span>
        <input type="date" value={to} onChange={e => { setTo(e.target.value); setRes(null); }} style={{ ...input, width: '150px' }} />
        <label style={{ fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center' }}><input type="checkbox" checked={includeLocked} onChange={e => setIncludeLocked(e.target.checked)} />include approved-payroll months</label>
        <button disabled={busy} onClick={() => run(false)} style={{ padding: '7px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>{busy && !confirm ? 'Working…' : 'Preview'}</button>
      </div>
      {res && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '13px', marginBottom: '8px' }}>
            {res.applied ? <b>{res.written} day(s) updated.</b> : <>Checked <b>{res.checked}</b> day(s) — <b>{res.changed}</b> would change.</>}
          </div>
          {res.rows.length > 0 && (
            <div style={{ maxHeight: '320px', overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead><tr style={{ background: '#f9fafb' }}>{['Date', 'Staff', 'Hours', 'Overtime', 'Late', 'Flags'].map(x => <th key={x} style={{ padding: '6px 8px', textAlign: 'left' }}>{x}</th>)}</tr></thead>
                <tbody>
                  {res.rows.map(row => (
                    <tr key={row.id} style={{ borderTop: '1px solid #f3f4f6', opacity: row.locked && !includeLocked ? 0.55 : 1 }}>
                      <td style={{ padding: '6px 8px' }}>{row.date}</td>
                      <td style={{ padding: '6px 8px' }}>{row.staffName || row.staffId}{row.locked ? ' 🔒' : ''}</td>
                      <td style={{ padding: '6px 8px' }}>{h(row.before.totalHours)} → <b>{h(row.after.totalHours)}</b></td>
                      <td style={{ padding: '6px 8px' }}>{h(row.before.overtimeHours)} → <b>{h(row.after.overtimeHours)}</b></td>
                      <td style={{ padding: '6px 8px' }}>{row.before.lateBy ?? '–'} → <b>{row.after.lateBy ?? '–'}</b>{row.after.lateBy != null ? 'm' : ''}</td>
                      <td style={{ padding: '6px 8px' }}>{(row.exceptions || []).filter(c => !['LATE', 'REPEAT_TAP'].includes(c)).join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!res.applied && res.changed > 0 && (
            <div style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              {!confirm
                ? <button onClick={() => setConfirm(true)} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Apply to {res.changed} day(s)…</button>
                : <>
                    <span style={{ fontSize: '12px', color: '#b45309' }}>This changes hours / overtime used by payroll. Sure?</span>
                    <button disabled={busy} onClick={() => run(true)} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: '#b91c1c', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{busy ? 'Applying…' : 'Yes, apply'}</button>
                    <button onClick={() => setConfirm(false)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>Cancel</button>
                  </>}
            </div>
          )}
        </div>
      )}
      <div style={{ ...hint, marginTop: '8px' }}>Worked time is shown in hours ({fmtMins(90)} = 1.5h).</div>
    </div>
  );
}
