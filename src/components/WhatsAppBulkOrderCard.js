'use client';

// Bulk / party orders on the WhatsApp bot (owner / admin). Off by default. The customer picks
// "🎉 Bulk / Party order", a date + time slot, pickup / delivery / at the restaurant, orders with large
// quantities, adds guests + a note; it arrives as a SCHEDULED order (Order History → Scheduled) to
// confirm, then Send to kitchen. Backend: PUT /api/whatsapp-ordering/bulk-order (utils/waBulkOrder).
import { useEffect, useState } from 'react';
import apiClient from '../lib/api';

const EDIT_ROLES = ['owner', 'co-owner', 'admin', 'super_admin'];
const FULFIL = [['takeaway', '🥡 Pickup'], ['delivery', '🛵 Delivery'], ['dine-in', '🍽️ At the restaurant']];
const TIME_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function myRole() {
  try { return String(JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase(); } catch { return ''; }
}
const fromConfig = (c) => {
  const b = (c && c.bulkOrder) || {};
  return {
    enabled: b.enabled === true,
    label: b.label || 'Bulk / Party order',
    minNoticeHours: b.minNoticeHours != null ? b.minNoticeHours : 24,
    maxDaysAhead: b.maxDaysAhead != null ? b.maxDaysAhead : 30,
    slotMode: b.slotMode === 'fixed' ? 'fixed' : 'hours',
    slotEveryMinutes: b.slotEveryMinutes || 60,
    slotsText: Array.isArray(b.slots) ? b.slots.join(', ') : '',
    fulfilment: Array.isArray(b.fulfilment) && b.fulfilment.length ? b.fulfilment : ['takeaway'],
    maxQtyPerItem: b.maxQtyPerItem || 500,
    minOrderAmount: b.minOrderAmount || 0,
    minTotalQty: b.minTotalQty || 0,
    askGuests: b.askGuests !== false,
    askNote: b.askNote !== false,
    confirmRequired: b.confirmRequired !== false,
  };
};

export default function WhatsAppBulkOrderCard({ restaurantId, config, currencySymbol = '₹', onSaved }) {
  const [f, setF] = useState(() => fromConfig(config));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ ok: '', err: '' });
  const [canEdit, setCanEdit] = useState(false);
  useEffect(() => { setCanEdit(EDIT_ROLES.includes(myRole())); }, []);
  useEffect(() => { setF(fromConfig(config)); }, [config]);

  const set = (key, val) => { setMsg({ ok: '', err: '' }); setF((p) => ({ ...p, [key]: val })); };
  const toggleFulfil = (k) => set('fulfilment', f.fulfilment.includes(k) ? f.fulfilment.filter((x) => x !== k) : [...f.fulfilment, k]);

  const save = async () => {
    const slots = f.slotsText.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean);
    if (!f.fulfilment.length) return setMsg({ ok: '', err: 'Choose at least one of Pickup / Delivery / At the restaurant.' });
    if (f.slotMode === 'fixed') {
      if (!slots.length) return setMsg({ ok: '', err: 'Add at least one time, like 12:30, 19:30.' });
      const bad = slots.filter((s) => !TIME_RE.test(s));
      if (bad.length) return setMsg({ ok: '', err: `Times must be like 13:30 (wrong: ${bad.slice(0, 3).join(', ')}).` });
    }
    setSaving(true); setMsg({ ok: '', err: '' });
    try {
      const body = {
        enabled: f.enabled, label: f.label, minNoticeHours: Number(f.minNoticeHours) || 0, maxDaysAhead: Number(f.maxDaysAhead) || 30,
        slotMode: f.slotMode, slotEveryMinutes: Number(f.slotEveryMinutes) || 60, slots, fulfilment: f.fulfilment,
        maxQtyPerItem: Number(f.maxQtyPerItem) || 500, minOrderAmount: Number(f.minOrderAmount) || 0, minTotalQty: Number(f.minTotalQty) || 0,
        askGuests: f.askGuests, askNote: f.askNote, confirmRequired: f.confirmRequired,
      };
      const res = await apiClient.request(`/api/whatsapp-ordering/bulk-order/${restaurantId}`, { method: 'PUT', body });
      if (!res || res.success === false) throw new Error((res && res.error) || 'Could not save');
      setMsg({ ok: 'Saved. The bot uses these settings from the next message.', err: '' });
      if (onSaved) onSaved({ bulkOrder: res.bulkOrder });
    } catch (e) {
      setMsg({ ok: '', err: e?.message || 'Could not save. Please try again.' });
    } finally { setSaving(false); }
  };

  if (!restaurantId) return null;
  const box = { border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', marginBottom: 18, background: 'white' };
  const label = { fontSize: 12.5, fontWeight: 700, color: '#374151', margin: '12px 0 6px' };
  const hint = { fontSize: 11.5, color: '#9ca3af', marginTop: 4 };
  const chip = (on) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999, border: `1px solid ${on ? '#86efac' : '#e5e7eb'}`, background: on ? '#f0fdf4' : 'white', color: on ? '#15803d' : '#374151', fontSize: 13, fontWeight: 600, cursor: canEdit ? 'pointer' : 'default', marginRight: 8, marginBottom: 8 });
  const input = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13.5, boxSizing: 'border-box' };
  const dis = !canEdit || saving;
  const check = (key, text) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13.5, color: '#374151', cursor: canEdit ? 'pointer' : 'default' }}>
      <input type="checkbox" checked={!!f[key]} disabled={dis} onChange={(e) => set(key, e.target.checked)} /> {text}
    </label>
  );

  return (
    <div style={box} data-testid="wa-bulk-settings">
      <div style={{ fontWeight: 800, fontSize: 15.5, color: '#111827' }}>🎉 Bulk / Party orders</div>
      <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>
        A third choice on WhatsApp for team parties and big orders: the customer picks a date and time, orders large quantities, and you confirm it from Order History → Scheduled.
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '10px 12px', borderRadius: 10, background: f.enabled ? '#f0fdf4' : '#f9fafb', border: `1px solid ${f.enabled ? '#bbf7d0' : '#e5e7eb'}`, cursor: canEdit ? 'pointer' : 'default' }}>
        <input type="checkbox" checked={f.enabled} disabled={dis} onChange={(e) => set('enabled', e.target.checked)} />
        <span style={{ fontSize: 13.5 }}><b>Take bulk / party orders on WhatsApp</b></span>
      </label>

      {f.enabled && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
            <div><div style={label}>Button name</div>
              <input style={input} value={f.label} maxLength={24} disabled={dis} onChange={(e) => set('label', e.target.value)} placeholder="Bulk / Party order" /></div>
            <div><div style={label}>Minimum notice (hours)</div>
              <input style={input} type="number" min="0" max="720" value={f.minNoticeHours} disabled={dis} onChange={(e) => set('minNoticeHours', e.target.value)} />
              <div style={hint}>0 = same day is fine</div></div>
            <div><div style={label}>Days ahead</div>
              <input style={input} type="number" min="1" max="90" value={f.maxDaysAhead} disabled={dis} onChange={(e) => set('maxDaysAhead', e.target.value)} /></div>
          </div>

          <div style={label}>Time slots</div>
          <button type="button" disabled={dis} onClick={() => set('slotMode', 'hours')} style={chip(f.slotMode === 'hours')}>{f.slotMode === 'hours' ? '✓ ' : ''}Inside my WhatsApp ordering hours</button>
          <button type="button" disabled={dis} onClick={() => set('slotMode', 'fixed')} style={chip(f.slotMode === 'fixed')}>{f.slotMode === 'fixed' ? '✓ ' : ''}My own times</button>
          {f.slotMode === 'hours' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
              Every
              <select value={f.slotEveryMinutes} disabled={dis} onChange={(e) => set('slotEveryMinutes', Number(e.target.value))} style={{ ...input, width: 'auto' }}>
                {[15, 30, 60, 120].map((m) => <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60} hour${m > 60 ? 's' : ''}`}</option>)}
              </select>
              <span style={hint}>(no ordering hours set → 11 AM – 10 PM)</span>
            </div>
          ) : (
            <div><input style={input} value={f.slotsText} disabled={dis} onChange={(e) => set('slotsText', e.target.value)} placeholder="12:30, 13:30, 19:30, 20:30" />
              <div style={hint}>24-hour times, separated by commas</div></div>
          )}

          <div style={label}>How they get it</div>
          {FULFIL.map(([k, t]) => <button key={k} type="button" disabled={dis} onClick={() => toggleFulfil(k)} style={chip(f.fulfilment.includes(k))}>{f.fulfilment.includes(k) ? '✓ ' : ''}{t}</button>)}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
            <div><div style={label}>Max of one item</div>
              <input style={input} type="number" min="1" max="5000" value={f.maxQtyPerItem} disabled={dis} onChange={(e) => set('maxQtyPerItem', e.target.value)} /></div>
            <div><div style={label}>Minimum order ({currencySymbol})</div>
              <input style={input} type="number" min="0" value={f.minOrderAmount} disabled={dis} onChange={(e) => set('minOrderAmount', e.target.value)} placeholder="0 = none" /></div>
            <div><div style={label}>Minimum items in total</div>
              <input style={input} type="number" min="0" value={f.minTotalQty} disabled={dis} onChange={(e) => set('minTotalQty', e.target.value)} placeholder="0 = none" /></div>
          </div>

          {check('askGuests', 'Ask how many people')}
          {check('askNote', 'Ask for a note (spice level, serving time, cutlery…)')}
          {check('confirmRequired', 'I confirm each order (the customer is told "request sent", then "confirmed" on WhatsApp)')}
        </>
      )}

      {msg.err && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 8 }}>{msg.err}</div>}
      {msg.ok && <div style={{ color: '#15803d', fontSize: 13, marginTop: 8 }}>✓ {msg.ok}</div>}
      {canEdit ? (
        <button type="button" onClick={save} disabled={saving} style={{ marginTop: 12, padding: '10px 18px', borderRadius: 10, border: 'none', background: saving ? '#e5e7eb' : '#16a34a', color: saving ? '#9ca3af' : 'white', fontWeight: 700, fontSize: 14, cursor: saving ? 'wait' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save bulk order settings'}
        </button>
      ) : (
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>Only the owner or an admin can change these settings.</div>
      )}
    </div>
  );
}
