'use client';

import { useEffect, useState, useCallback } from 'react';
import { FaBirthdayCake, FaTimes } from 'react-icons/fa';
import apiClient from '../lib/api';

/**
 * Home → Staff alerts: birthdays coming up and annual leave (on leave today / soon, requests
 * waiting, running low, everyone's balance). Data: /api/staff-alerts/:rid — owner / admins see
 * everyone, managers the staff they manage; anyone else gets 403 and the card stays hidden.
 * The owner / admins also get a daily phone alert (birthdays, leave) — settings in "View all".
 */
const fmtDate = (ymd) => {
  const [y, m, d] = String(ymd || '').split('-').map(Number);
  if (!y) return ymd || '';
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
};
const when = (n) => (n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`);

export default function StaffAlertsCard({ restaurantId, isMobile = false, canEditSettings = false }) {
  const [data, setData] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    try { setData(await apiClient.getStaffAlerts(restaurantId)); }
    catch (e) { setHidden(true); } // 403 (not allowed) or unavailable → no card
  }, [restaurantId]);
  useEffect(() => { load(); }, [load]);

  if (hidden || !data) return null;
  const week = (data.birthdays || []).filter(b => b.daysUntil <= 7);
  const L = data.leave || { pending: [], onLeaveToday: [], upcoming: [], low: [], balances: [] };
  const tomorrow = L.upcoming.filter(l => l.daysUntil === 1);
  const chips = [
    ...week.slice(0, 3).map(b => ({ key: `b${b.staffId}`, color: b.daysUntil === 0 ? '#be185d' : '#9d174d', bg: b.daysUntil === 0 ? '#fce7f3' : '#fdf2f8', text: `🎂 ${b.name} · ${when(b.daysUntil)}${b.turning ? ` (${b.turning})` : ''}` })),
    ...(L.onLeaveToday.length ? [{ key: 'today', color: '#065f46', bg: '#ecfdf5', text: `🌴 On leave today: ${L.onLeaveToday.map(l => l.name).slice(0, 3).join(', ')}${L.onLeaveToday.length > 3 ? ` +${L.onLeaveToday.length - 3}` : ''}` }] : []),
    ...(tomorrow.length ? [{ key: 'tom', color: '#065f46', bg: '#f0fdf4', text: `🌴 From tomorrow: ${tomorrow.map(l => l.name).slice(0, 3).join(', ')}` }] : []),
    ...(L.pending.length ? [{ key: 'pend', color: '#92400e', bg: '#fffbeb', text: `📝 ${L.pending.length} leave request${L.pending.length > 1 ? 's' : ''} waiting` }] : []),
    ...(L.low.length ? [{ key: 'low', color: '#991b1b', bg: '#fef2f2', text: `⚠️ ${new Set(L.low.map(x => x.staffId)).size} low on leave` }] : []),
  ];

  return (
    <>
      <div className="animate-in" style={{ marginBottom: '20px', borderRadius: '14px', border: '1px solid #e9d5ff', background: 'linear-gradient(135deg,#faf5ff,#fdf2f8)', padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: '#6b21a8', fontSize: 14 }}>
            <FaBirthdayCake /> Staff alerts
          </div>
          <button onClick={() => setOpen(true)} style={{ border: 'none', background: 'transparent', color: '#7c3aed', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>View all →</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {chips.length ? chips.map(c => (
            <span key={c.key} style={{ fontSize: 12, fontWeight: 600, color: c.color, background: c.bg, borderRadius: 999, padding: '4px 10px' }}>{c.text}</span>
          )) : (
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              No birthdays or leave this week.{data.staffWithDob === 0 ? ' Add dates of birth in Admin → Staff → Staff Profile to get birthday alerts.' : ''}
            </span>
          )}
        </div>
      </div>
      {open && <StaffAlertsModal data={data} restaurantId={restaurantId} isMobile={isMobile} canEditSettings={canEditSettings} onClose={() => setOpen(false)} onSaved={load} />}
    </>
  );
}

function StaffAlertsModal({ data, restaurantId, isMobile, canEditSettings, onClose, onSaved }) {
  const L = data.leave;
  const [tab, setTab] = useState('birthdays');
  const [s, setS] = useState(data.settings || {});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const th = { textAlign: 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, padding: '6px 8px', borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap' };
  const td = { fontSize: 13, color: '#111827', padding: '7px 8px', borderBottom: '1px solid #f9fafb', whiteSpace: 'nowrap' };
  const tabBtn = (id, label) => (
    <button key={id} onClick={() => setTab(id)} style={{ padding: '7px 12px', borderRadius: 999, border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer', background: tab === id ? '#7c3aed' : '#f3f4f6', color: tab === id ? '#fff' : '#374151' }}>{label}</button>
  );
  const saveSettings = async () => {
    setSaving(true); setMsg('');
    try { await apiClient.saveHrSettings(restaurantId, { alerts: s }); setMsg('Saved.'); onSaved && onSaved(); }
    catch (e) { setMsg(e?.message || 'Could not save.'); }
    finally { setSaving(false); }
  };
  const list = (rows, render, empty) => (rows.length ? <div style={{ display: 'grid', gap: 6 }}>{rows.map(render)}</div> : <div style={{ fontSize: 13, color: '#9ca3af' }}>{empty}</div>);
  const row = (key, left, right, color = '#111827') => (
    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, border: '1px solid #f3f4f6', borderRadius: 10, padding: '8px 12px', fontSize: 13 }}>
      <span style={{ color, fontWeight: 600 }}>{left}</span><span style={{ color: '#6b7280' }}>{right}</span>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10004, padding: 12 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 820, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>Staff alerts</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Birthdays and annual leave · leave year {data.leaveYear}–{String(Number(data.leaveYear) + 1).slice(2)}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ border: 'none', background: '#f3f4f6', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes /></button>
        </div>
        <div style={{ padding: '10px 18px', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid #f9fafb' }}>
          {tabBtn('birthdays', `🎂 Birthdays (${data.birthdays.length})`)}
          {tabBtn('leave', `🌴 Leave (${L.onLeaveToday.length + L.upcoming.length + L.pending.length})`)}
          {tabBtn('balances', '📊 Leave balances')}
          {canEditSettings && tabBtn('settings', '⚙ Alerts')}
        </div>
        <div style={{ padding: '14px 18px 18px', overflowY: 'auto' }}>
          {tab === 'birthdays' && (
            <>
              {list(data.birthdays, b => row(b.staffId, `${b.daysUntil === 0 ? '🎉 ' : ''}${b.name}${b.role ? ` · ${b.role}` : ''}`, `${when(b.daysUntil)} · ${fmtDate(b.date)}${b.turning ? ` · turning ${b.turning}` : ''}`, b.daysUntil === 0 ? '#be185d' : '#111827'), 'No birthdays in the next 30 days.')}
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10 }}>{data.staffWithDob} of {data.staffCount} staff have a date of birth (Admin → Staff → Staff Profile, or My Pay → My Profile).</div>
            </>
          )}
          {tab === 'leave' && (
            <div style={{ display: 'grid', gap: 14 }}>
              <div><div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>On leave today</div>
                {list(L.onLeaveToday, l => row(l.id, l.name, `${l.type} · till ${fmtDate(l.endDate)}${l.halfDay ? ' · half day' : ''}`), 'Nobody.')}</div>
              <div><div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Starting in the next 7 days</div>
                {list(L.upcoming, l => row(l.id, l.name, `${when(l.daysUntil)} · ${l.type} · ${fmtDate(l.startDate)}${l.endDate !== l.startDate ? ` – ${fmtDate(l.endDate)}` : ''}${l.halfDay ? ' · half day' : ''}`), 'None.')}</div>
              <div><div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>Waiting for approval (Attendance → Leave)</div>
                {list(L.pending, l => row(l.id, l.name, `${l.type} · ${fmtDate(l.startDate)}${l.endDate !== l.startDate ? ` – ${fmtDate(l.endDate)}` : ''}${l.days ? ` · ${l.days} day${l.days > 1 ? 's' : ''}` : ''}`, '#92400e'), 'None.')}</div>
              <div><div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 6 }}>Low on leave (≤ {data.settings.lowLeaveDays} day{data.settings.lowLeaveDays === 1 ? '' : 's'} left)</div>
                {list(L.low, (x, i) => row(`${x.staffId}${i}`, x.name, `${x.type}: ${x.remaining} of ${x.total} left`, '#991b1b'), 'Nobody.')}</div>
            </div>
          )}
          {tab === 'balances' && (
            L.types.length === 0 ? <div style={{ fontSize: 13, color: '#9ca3af' }}>No leave types yet — set them in Attendance → Settings.</div> : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={th}>Staff</th>{L.types.map(t => <th key={t.id} style={th}>{t.shortName || t.name} (left / total)</th>)}</tr></thead>
                  <tbody>
                    {L.balances.map(b => (
                      <tr key={b.staffId}>
                        <td style={{ ...td, fontWeight: 600 }}>{b.name}<span style={{ color: '#9ca3af', fontWeight: 400 }}>{b.role ? ` · ${b.role}` : ''}</span></td>
                        {L.types.map(t => {
                          const r = b.types.find(x => x.id === t.id);
                          const low = r && r.total > 0 && r.remaining <= data.settings.lowLeaveDays;
                          return <td key={t.id} style={{ ...td, color: low ? '#b91c1c' : '#111827', fontWeight: low ? 700 : 400 }}>{r ? `${r.remaining} / ${r.total}${r.used ? ` (used ${r.used})` : ''}` : '—'}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
          {tab === 'settings' && canEditSettings && (
            <div style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
              <div style={{ fontSize: 12, color: '#6b7280' }}>A daily phone notification goes to the owner and admins (DineOpen app) from 9 am: birthdays and leave.</div>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
                <input type="checkbox" checked={s.birthdays !== false} onChange={e => setS({ ...s, birthdays: e.target.checked })} /> Birthday alerts — on the day and
                <select value={s.birthdayDaysBefore ?? 1} onChange={e => setS({ ...s, birthdayDaysBefore: Number(e.target.value) })} style={{ padding: '4px 6px', borderRadius: 6, border: '1px solid #e5e7eb' }}>
                  {[0, 1, 2, 3, 7].map(n => <option key={n} value={n}>{n === 0 ? 'no advance alert' : `${n} day${n > 1 ? 's' : ''} before`}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
                <input type="checkbox" checked={s.leave !== false} onChange={e => setS({ ...s, leave: e.target.checked })} /> Leave alerts — who starts leave tomorrow, requests waiting
              </label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13 }}>
                Show &ldquo;low on leave&rdquo; at
                <input type="number" min="0" max="30" value={s.lowLeaveDays ?? 2} onChange={e => setS({ ...s, lowLeaveDays: Number(e.target.value) })} style={{ width: 64, padding: '4px 6px', borderRadius: 6, border: '1px solid #e5e7eb' }} /> days left or less
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={saveSettings} disabled={saving} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: saving ? '#c4b5fd' : '#7c3aed', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
                {msg && <span style={{ fontSize: 12, color: /Saved/.test(msg) ? '#166534' : '#b91c1c' }}>{msg}</span>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
