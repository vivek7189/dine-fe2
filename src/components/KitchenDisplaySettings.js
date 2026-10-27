'use client';

// Settings of a "Kitchen display" login (staff role kitchen_display) — shown in Admin → Staff when that
// role is picked. Saved on the staff member as `kitchenDisplay` (backend utils/kitchenDisplay.js):
//   canUpdateStatus  — the screen can mark Start cooking / Ready / Done (Done never closes the bill)
//   station          — 'choose' (pick Bar / Kitchen / All on each screen) or fixed 'all' | 'bar' | 'kitchen'
const STATIONS = [
  ['choose', 'Pick on each screen'],
  ['all', 'All items'],
  ['kitchen', 'Kitchen'],
  ['bar', 'Bar'],
];

export default function KitchenDisplaySettings({ value, onChange }) {
  const v = { canUpdateStatus: value?.canUpdateStatus !== false, station: value?.station || 'choose' };
  const set = (patch) => onChange({ ...v, ...patch });
  return (
    <div style={{ marginTop: 12, padding: 14, borderRadius: 12, border: '1px solid #fed7aa', background: '#fff7ed' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#9a3412', marginBottom: 4 }}>Kitchen screen login</div>
      <div style={{ fontSize: 12, color: '#7c2d12', lineHeight: 1.5, marginBottom: 12 }}>
        This login opens only the KOT screen (full screen, with Log out) on the website or the DineOpen desktop app.
        It cannot bill, change prices or see sales. Phone is optional.
      </div>

      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', marginBottom: 12 }}>
        <span>
          <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1f2937' }}>Can mark Start / Ready / Done</span>
          <span style={{ display: 'block', fontSize: 12, color: '#6b7280' }}>
            {v.canUpdateStatus ? 'Kitchen updates the order status (Done never closes the bill)' : 'View only — the screen just shows the orders'}
          </span>
        </span>
        <input type="checkbox" checked={v.canUpdateStatus} onChange={(e) => set({ canUpdateStatus: e.target.checked })}
          style={{ width: 20, height: 20, accentColor: '#ea580c', flexShrink: 0 }} />
      </label>

      <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>Which items this screen shows</div>
      <div role="radiogroup" aria-label="Station" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {STATIONS.map(([k, label]) => (
          <button key={k} type="button" role="radio" aria-checked={v.station === k} onClick={() => set({ station: k })}
            style={{ padding: '7px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              border: v.station === k ? '1px solid #ea580c' : '1px solid #e5e7eb',
              background: v.station === k ? '#ea580c' : 'white', color: v.station === k ? 'white' : '#374151' }}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 6 }}>
        Bar / Kitchen use the bar categories set on the KOT screen (Bar / Kitchen button, owner only).
      </div>
    </div>
  );
}
