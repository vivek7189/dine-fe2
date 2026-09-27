'use client';

// "Available only at certain times" editor for a menu item or a category.
// value: null | { enabled, days: [0..6] (empty = every day), windows: [{ from: 'HH:MM', to: 'HH:MM' }] }
// The backend enforces the same schedule as a hard stop (orders outside the hours are refused).
import { describeSchedule, DAY_NAMES } from '@/lib/menuSchedule';

const DEFAULT = { enabled: true, days: [], windows: [{ from: '12:00', to: '15:00' }] };

export default function AvailabilityScheduleEditor({ value, onChange, label = 'Available only at certain times', compact = false }) {
  const on = !!(value && value.enabled !== false && Array.isArray(value.windows) && value.windows.length);
  const v = on ? value : null;
  const set = (patch) => onChange({ ...(v || DEFAULT), ...patch, enabled: true });
  const days = v ? (v.days || []) : [];
  const windows = v ? v.windows : [];

  const toggleDay = (d) => {
    const cur = days.length ? days : [0, 1, 2, 3, 4, 5, 6];
    const next = cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d].sort();
    set({ days: next.length === 7 ? [] : next });
  };
  const setWindow = (i, patch) => set({ windows: windows.map((w, k) => (k === i ? { ...w, ...patch } : w)) });

  const box = { padding: compact ? '10px 12px' : '12px 14px', borderRadius: 10, border: `1px solid ${on ? '#c7d2fe' : '#e5e7eb'}`, background: on ? '#eef2ff' : '#f9fafb', marginBottom: 16 };
  const chip = (active) => ({ padding: '4px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${active ? '#4f46e5' : '#d1d5db'}`, background: active ? '#4f46e5' : '#fff', color: active ? '#fff' : '#374151' });
  const timeInput = { padding: '6px 8px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 13, background: '#fff' };

  return (
    <div style={box}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked ? DEFAULT : null)} style={{ width: 16, height: 16, accentColor: '#4f46e5', cursor: 'pointer' }} />
        <span>
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: on ? '#3730a3' : '#374151' }}>{label}</span>
          <span style={{ display: 'block', fontSize: 11, color: '#6b7280', marginTop: 1 }}>
            {on ? `Can be ordered: ${describeSchedule(v)}. At other times it shows "Not available now" and can't be ordered.` : 'Off — can be ordered any time the restaurant is open.'}
          </span>
        </span>
      </label>

      {on && (
        <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4b5563', marginBottom: 5 }}>Days</div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {DAY_NAMES.map((n, d) => (
                <button key={n} type="button" style={chip(days.length === 0 || days.includes(d))} onClick={() => toggleDay(d)}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4b5563', marginBottom: 5 }}>Times</div>
            <div style={{ display: 'grid', gap: 6 }}>
              {windows.map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <input type="time" value={w.from} onChange={(e) => setWindow(i, { from: e.target.value })} style={timeInput} aria-label="From" />
                  <span style={{ fontSize: 12, color: '#6b7280' }}>to</span>
                  <input type="time" value={w.to} onChange={(e) => setWindow(i, { to: e.target.value })} style={timeInput} aria-label="To" />
                  {w.to && w.from && w.to <= w.from && w.to !== w.from && <span style={{ fontSize: 11, color: '#6b7280' }}>(runs past midnight)</span>}
                  {windows.length > 1 && (
                    <button type="button" onClick={() => set({ windows: windows.filter((_, k) => k !== i) })}
                      style={{ border: 'none', background: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16, lineHeight: 1 }} aria-label="Remove time">×</button>
                  )}
                </div>
              ))}
            </div>
            {windows.length < 4 && (
              <button type="button" onClick={() => set({ windows: [...windows, { from: '19:00', to: '23:00' }] })}
                style={{ marginTop: 6, border: 'none', background: 'none', color: '#4f46e5', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                + Add another time
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
