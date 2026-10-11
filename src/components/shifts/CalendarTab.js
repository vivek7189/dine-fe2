'use client';

// Shift Scheduling → Calendar (MFC): one month of everything to plan the rota around —
// staff birthdays, work and wedding anniversaries, important personal days (prayer / religious days,
// weddings, child birth, family events…), approved leave, and the restaurant's festivals & holidays.
// Filter by kind, click a day for details, "Coming up" for the next 30 days, add a date for anyone.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { formatDateISO, datesByDay, dateIcon, dateText, titleCase } from './constants';
import StaffDatesEditor from './StaffDatesEditor';

const KINDS = [
  ['birthday', 'Birthdays', '🎂'],
  ['anniversary', 'Anniversaries', '🎉'],
  ['important', 'Important days', '📌'],
  ['leave', 'Leave', '🌴'],
  ['festival', 'Festivals & holidays', '⭐'],
];
const kindKey = (e) => (e.kind === 'work_anniversary' || e.kind === 'wedding_anniversary' ? 'anniversary' : e.kind);
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STORE = 'shifts.calendar.kinds';
const pill = (e) => ({
  birthday: ['#fdf2f8', '#9d174d'], anniversary: ['#f5f3ff', '#5b21b6'], important: ['#eff6ff', '#1e40af'],
  leave: ['#f1f5f9', '#475569'], festival: ['#fffbeb', '#92400e'],
}[kindKey(e)] || ['#f3f4f6', '#374151']);

export default function CalendarTab({ restaurantId, staff = [], isMobile }) {
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [events, setEvents] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shown, setShown] = useState(() => new Set(KINDS.map(k => k[0])));
  const [day, setDay] = useState(null);           // selected YYYY-MM-DD
  const [editFor, setEditFor] = useState(null);   // staffId whose dates are being edited
  const [pick, setPick] = useState(false);
  const [stats, setStats] = useState(null);       // { withDob, count }

  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (Array.isArray(s) && s.length) setShown(new Set(s)); } catch (_) {} }, []);
  const toggleKind = (k) => setShown(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); try { localStorage.setItem(STORE, JSON.stringify([...n])); } catch (_) {} return n; });

  // Monday-first grid covering the month
  const grid = useMemo(() => {
    const first = new Date(month);
    const lead = (first.getDay() + 6) % 7;
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - lead);
    const cells = [];
    for (let i = 0; i < 42; i++) cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    while (cells.length > 35 && cells[cells.length - 7].getMonth() !== month.getMonth()) cells.splice(cells.length - 7, 7);
    return cells;
  }, [month]);
  const from = formatDateISO(grid[0]), to = formatDateISO(grid[grid.length - 1]);
  const todayKey = formatDateISO(new Date());

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true); setError('');
    const soonTo = formatDateISO(new Date(Date.now() + 30 * 86400000));
    try {
      const [staffDates, cal, soon, festSoon] = await Promise.all([
        apiClient.getStaffDates(restaurantId, from, to),
        apiClient.getCalendar(restaurantId, { from, to }).catch(() => null),
        apiClient.getStaffDates(restaurantId, todayKey, soonTo).catch(() => null),
        apiClient.getCalendar(restaurantId, { from: todayKey, to: soonTo }).catch(() => null),
      ]);
      const fest = (list) => (list || []).filter(e => e && e.date && !e.hidden).map(e => ({ id: `fe-${e.source}-${e.id}-${e.date}`, kind: 'festival', date: e.date, ...(e.endDate ? { endDate: e.endDate } : {}), label: e.name || e.nameEn || 'Event', name: '' }));
      setEvents([...(staffDates?.events || []), ...fest(cal?.events)]);
      setUpcoming([...(soon?.events || []), ...fest(festSoon?.events)].sort((a, b) => a.date.localeCompare(b.date)));
    } catch (e) { setError(e?.message || 'Could not load the calendar'); }
    finally { setLoading(false); }
  }, [restaurantId, from, to, todayKey]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!restaurantId) return;
    apiClient.getStaffAlerts(restaurantId).then(r => r && setStats({ withDob: r.staffWithDob || 0, count: r.staffCount || 0 })).catch(() => {});
  }, [restaurantId]);

  const visible = events.filter(e => shown.has(kindKey(e)));
  const byDay = useMemo(() => datesByDay(visible), [visible]);
  const dayEvents = day ? (byDay[day] || []) : [];
  const activeStaff = (staff || []).filter(s => !['deleted', 'inactive', 'disabled'].includes(String(s.status || '').toLowerCase())).sort((a, b) => String(a.name).localeCompare(String(b.name)));
  const soonList = upcoming.filter(e => shown.has(kindKey(e))).slice(0, 40);
  const fmt = (ymd, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => { const [y, m, d] = ymd.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString(undefined, opts); };

  const EventRow = ({ e, showDate }) => (
    <div style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f8fafc', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 17, lineHeight: 1.2 }}>{e.kind === 'festival' ? '⭐' : dateIcon(e)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#111827' }}>{e.name || e.label}{e.role ? <span style={{ color: '#9ca3af', fontWeight: 500 }}> · {titleCase(e.role)}</span> : null}</div>
        <div style={{ fontSize: 12, color: '#6b7280' }}>
          {showDate ? `${fmt(e.date)}${e.endDate ? ` – ${fmt(e.endDate)}` : ''} · ` : (e.endDate ? `${fmt(e.date)} – ${fmt(e.endDate)} · ` : '')}
          {e.name ? dateText({ ...e, name: '' }) : (e.kind === 'festival' ? 'Festival / holiday' : '')}
        </div>
        {e.note && <div style={{ fontSize: 12, color: '#4b5563', marginTop: 2 }}>{e.note}</div>}
      </div>
      {e.staffId && <button type="button" onClick={() => setEditFor(e.staffId)} style={{ border: 'none', background: 'none', color: '#4f46e5', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Dates</button>}
    </div>
  );

  return (
    <div>
      {/* toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button type="button" aria-label="Previous month" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} style={navBtn}><FaChevronLeft size={11} /></button>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111827', minWidth: 150, textAlign: 'center' }}>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
          <button type="button" aria-label="Next month" onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} style={navBtn}><FaChevronRight size={11} /></button>
          <button type="button" onClick={() => { const d = new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); setDay(todayKey); }} style={{ ...navBtn, padding: '7px 12px', fontSize: 12.5, fontWeight: 600 }}>Today</button>
        </div>
        <button type="button" onClick={() => setPick(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: '#111827', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}><FaPlus size={10} /> Add a staff date</button>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {KINDS.map(([k, name, icon]) => (
          <button key={k} type="button" onClick={() => toggleKind(k)} aria-pressed={shown.has(k)}
            style={{ padding: '5px 11px', borderRadius: 999, border: `1px solid ${shown.has(k) ? '#cbd5e1' : '#f1f5f9'}`, background: shown.has(k) ? '#fff' : '#f8fafc', color: shown.has(k) ? '#111827' : '#9ca3af', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
            {icon} {name}
          </button>
        ))}
      </div>
      {stats && stats.count > 0 && stats.withDob < stats.count && (
        <div style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 12 }}>
          🎂 {stats.withDob} of {stats.count} staff have a birthday saved — add the rest with “Add a staff date”, or staff can add their own in My Shifts → My dates.
        </div>
      )}
      {error && <div role="alert" style={{ background: '#fef2f2', color: '#b91c1c', borderRadius: 10, padding: '8px 12px', fontSize: 13, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 300px', gap: 16, alignItems: 'start' }}>
        {/* month */}
        <div style={{ background: '#fff', border: '1px solid #eef0f3', borderRadius: 16, overflow: 'hidden', opacity: loading ? 0.6 : 1, transition: 'opacity .15s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#fafafa', borderBottom: '1px solid #f1f5f9' }}>
            {WEEKDAYS.map(w => <div key={w} style={{ padding: '8px 6px', fontSize: 11.5, fontWeight: 700, color: '#6b7280', textAlign: 'center' }}>{w}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {grid.map((d, i) => {
              const k = formatDateISO(d);
              // staff first; a festival lasting several days shows on its first day and each Monday only
              const list = (byDay[k] || []).filter(e => e.kind !== 'festival' || !e.endDate || e.date === k || i % 7 === 0)
                .sort((a, b) => (a.kind === 'festival') - (b.kind === 'festival'));
              const out = d.getMonth() !== month.getMonth();
              const sel = day === k;
              const max = isMobile ? 0 : 3;
              return (
                <button key={k} type="button" onClick={() => setDay(sel ? null : k)}
                  style={{ minHeight: isMobile ? 54 : 96, padding: 6, border: 'none', borderRight: (i % 7) < 6 ? '1px solid #f8fafc' : 'none', borderBottom: '1px solid #f8fafc',
                    background: sel ? '#f5f7ff' : '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3, outline: sel ? '2px solid #c7d2fe' : 'none', outlineOffset: -2 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: out ? '#cbd5e1' : '#111827', ...(k === todayKey ? { background: '#dc2626', color: '#fff', borderRadius: 999, padding: '1px 7px' } : {}) }}>{d.getDate()}</span>
                  {isMobile ? (
                    list.length > 0 && <span style={{ fontSize: 11, lineHeight: 1 }}>{list.slice(0, 3).map(e => <span key={e.id}>{e.kind === 'festival' ? '⭐' : dateIcon(e)}</span>)}{list.length > 3 ? <span style={{ color: '#6b7280', fontSize: 10 }}>+{list.length - 3}</span> : null}</span>
                  ) : (<>
                    {list.slice(0, max).map(e => {
                      const [bg, fg] = pill(e);
                      return (
                        <span key={e.id} title={e.kind === 'festival' ? e.label : dateText(e)}
                          style={{ display: 'block', fontSize: 11, fontWeight: 600, color: fg, background: bg, borderRadius: 6, padding: '2px 5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity: out ? 0.5 : 1 }}>
                          {e.kind === 'festival' ? '⭐' : dateIcon(e)} {e.kind === 'festival' ? `${e.label}${e.endDate && e.date !== k ? ' (cont.)' : ''}` : String(e.name || '').split(' ')[0]}
                        </span>
                      );
                    })}
                    {list.length > max && <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>+{list.length - max} more</span>}
                  </>)}
                </button>
              );
            })}
          </div>
        </div>

        {/* side: selected day or coming up */}
        <div style={{ background: '#fff', border: '1px solid #eef0f3', borderRadius: 16, padding: '14px 16px' }}>
          {day ? (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>{fmt(day, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
              <button type="button" aria-label="Close" onClick={() => setDay(null)} style={{ border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer' }}><FaTimes size={12} /></button>
            </div>
            {dayEvents.length ? dayEvents.map(e => <EventRow key={e.id} e={e} />) : <div style={{ fontSize: 13, color: '#9ca3af', padding: '10px 0' }}>Nothing on this day.</div>}
          </>) : (<>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 2 }}>Coming up</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Next 30 days</div>
            {soonList.length ? soonList.map(e => <EventRow key={e.id} e={e} showDate />) : <div style={{ fontSize: 13, color: '#9ca3af', padding: '10px 0' }}>Nothing in the next 30 days.</div>}
          </>)}
        </div>
      </div>

      {(pick || editFor) && (
        <div role="dialog" aria-label="Staff dates" onClick={() => { setPick(false); setEditFor(null); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.25)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: isMobile ? '100%' : 440, maxWidth: '100%', height: '100%', background: '#fff', boxShadow: '-8px 0 24px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <select value={editFor || ''} onChange={e => { setEditFor(e.target.value || null); setPick(true); }}
                style={{ flex: 1, padding: '9px 11px', border: '1px solid #e5e7eb', borderRadius: 9, fontSize: 14, fontWeight: 600, background: '#fff' }}>
                <option value="">Choose a staff member…</option>
                {activeStaff.map(s => <option key={s.id} value={s.id}>{s.name}{s.role ? ` · ${titleCase(s.role)}` : ''}</option>)}
              </select>
              <button type="button" aria-label="Close" onClick={() => { setPick(false); setEditFor(null); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280' }}><FaTimes /></button>
            </div>
            <div style={{ padding: 18, overflowY: 'auto', flex: 1 }}>
              {editFor ? <StaffDatesEditor restaurantId={restaurantId} staffId={editFor} onSaved={load} isMobile={isMobile} />
                : <div style={{ fontSize: 13, color: '#6b7280' }}>Choose who the date is for. Staff can also add their own in My Shifts → My dates.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn = { padding: '7px 10px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' };
