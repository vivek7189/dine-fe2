'use client';

// WhatsApp bot settings the owner / admin controls: button ordering on/off, languages, payment options
// (+ payment link / UPI ID), order types, welcome message, pack word, minimum order. The bot reads them
// on every message, so a save shows in the next chat. Backend: PUT /api/whatsapp-ordering/bot-settings.
import { useEffect, useState } from 'react';
import apiClient from '../lib/api';

const EDIT_ROLES = ['owner', 'co-owner', 'admin', 'super_admin'];
const LANGS = [['en', 'English'], ['te', 'తెలుగు (Telugu)']];
const PAYS = [['cod', '💵 Cash on delivery / at counter'], ['upi', '📱 UPI on delivery'], ['online', '💳 Pay online (link or UPI ID)']];
const TYPES = [['delivery', '🛵 Home delivery'], ['takeaway', '🏪 Pickup'], ['dine-in', '🍽️ Dine-in']];

function myRole() {
  try { return String(JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase(); } catch { return ''; }
}
const fromConfig = (c) => {
  const q = (c && c.quickFlow) || {};
  return {
    enabled: !!q.enabled,
    languages: Array.isArray(q.languages) && q.languages.length ? q.languages : ['en'],
    payments: Array.isArray(q.payments) && q.payments.length ? q.payments : ['cod'],
    paymentLink: (c && c.paymentLink) || '',
    upiId: (c && c.upiId) || '',
    orderTypes: Array.isArray(c && c.orderTypes) ? c.orderTypes : [],
    welcome: q.welcome || '',
    unitWord: q.unitWord || 'Pack',
    minOrder: Number(q.minOrder) || 0,
    listPrices: q.listPrices !== false, // item list shows pack sizes + prices (off = names only)
  };
};

export default function WhatsAppBotSettingsCard({ restaurantId, config, currencySymbol = '₹', onSaved }) {
  const [f, setF] = useState(() => fromConfig(config));
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ ok: '', err: '' });
  const [canEdit, setCanEdit] = useState(false);
  useEffect(() => { setCanEdit(EDIT_ROLES.includes(myRole())); }, []);
  useEffect(() => { setF(fromConfig(config)); }, [config]);

  const toggle = (key, val) => setF((p) => ({ ...p, [key]: p[key].includes(val) ? p[key].filter((x) => x !== val) : [...p[key], val] }));
  const set = (key, val) => { setMsg({ ok: '', err: '' }); setF((p) => ({ ...p, [key]: val })); };

  const save = async () => {
    // Same checks as the server, so the owner sees the reason before saving.
    if (!f.languages.length) return setMsg({ ok: '', err: 'Choose at least one language.' });
    if (!f.payments.length) return setMsg({ ok: '', err: 'Choose at least one payment option.' });
    if (f.payments.includes('online') && !f.paymentLink.trim() && !f.upiId.trim()) return setMsg({ ok: '', err: 'Add a payment link or UPI ID for "Pay online".' });
    setSaving(true); setMsg({ ok: '', err: '' });
    try {
      const res = await apiClient.request(`/api/whatsapp-ordering/bot-settings/${restaurantId}`, { method: 'PUT', body: { ...f, minOrder: Number(f.minOrder) || 0 } });
      if (!res || res.success === false) throw new Error((res && res.error) || 'Could not save');
      setMsg({ ok: 'Saved. The bot uses these settings from the next message.', err: '' });
      if (onSaved) onSaved(res.settings);
    } catch (e) {
      setMsg({ ok: '', err: e?.message || 'Could not save. Please try again.' });
    } finally { setSaving(false); }
  };

  if (!restaurantId) return null;
  const box = { border: '1px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', marginBottom: 18, background: 'white' };
  const label = { fontSize: 12.5, fontWeight: 700, color: '#374151', margin: '12px 0 6px' };
  const chip = (on) => ({ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999, border: `1px solid ${on ? '#86efac' : '#e5e7eb'}`, background: on ? '#f0fdf4' : 'white', color: on ? '#15803d' : '#374151', fontSize: 13, fontWeight: 600, cursor: canEdit ? 'pointer' : 'default', marginRight: 8, marginBottom: 8 });
  const input = { width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13.5, boxSizing: 'border-box' };
  const dis = !canEdit || saving;

  return (
    <div style={box} data-testid="wa-bot-settings">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 15.5, color: '#111827' }}>🤖 WhatsApp bot settings</div>
          <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>How customers order on WhatsApp. Changes apply from the next message.</div>
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '10px 12px', borderRadius: 10, background: f.enabled ? '#f0fdf4' : '#f9fafb', border: `1px solid ${f.enabled ? '#bbf7d0' : '#e5e7eb'}`, cursor: canEdit ? 'pointer' : 'default' }}>
        <input type="checkbox" checked={f.enabled} disabled={dis} onChange={(e) => set('enabled', e.target.checked)} />
        <span style={{ fontSize: 13.5 }}><b>Button ordering</b> — customers tap buttons for everything (category → item → pack → quantity → location → payment). Off = the classic chat flow.</span>
      </label>

      <div style={label}>Languages</div>
      {LANGS.map(([k, t]) => <button key={k} type="button" disabled={dis} onClick={() => toggle('languages', k)} style={chip(f.languages.includes(k))}>{f.languages.includes(k) ? '✓ ' : ''}{t}</button>)}

      <div style={label}>Payment options</div>
      {PAYS.map(([k, t]) => <button key={k} type="button" disabled={dis} onClick={() => toggle('payments', k)} style={chip(f.payments.includes(k))}>{f.payments.includes(k) ? '✓ ' : ''}{t}</button>)}
      {f.payments.includes('online') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          <div><div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Payment link</div>
            <input style={input} value={f.paymentLink} disabled={dis} onChange={(e) => set('paymentLink', e.target.value)} placeholder="https://rzp.io/l/… or https://paytm.me/…" /></div>
          <div><div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>or UPI ID</div>
            <input style={input} value={f.upiId} disabled={dis} onChange={(e) => set('upiId', e.target.value)} placeholder="yourshop@okhdfcbank" /></div>
        </div>
      )}

      <div style={label}>Order types</div>
      {TYPES.map(([k, t]) => <button key={k} type="button" disabled={dis} onClick={() => toggle('orderTypes', k)} style={chip(f.orderTypes.includes(k))}>{f.orderTypes.includes(k) ? '✓ ' : ''}{t}</button>)}
      <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: -2 }}>Two or more = the customer picks. Delivery asks for the location.</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 6 }}>
        <div><div style={label}>Minimum order ({currencySymbol})</div>
          <input style={input} type="number" min="0" value={f.minOrder} disabled={dis} onChange={(e) => set('minOrder', e.target.value)} placeholder="0 = none" /></div>
        <div><div style={label}>Pack word</div>
          <input style={input} value={f.unitWord} maxLength={12} disabled={dis} onChange={(e) => set('unitWord', e.target.value)} placeholder="Pack" /></div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 13.5, color: '#374151', cursor: canEdit ? 'pointer' : 'default' }}>
        <input type="checkbox" checked={f.listPrices} disabled={dis} onChange={(e) => set('listPrices', e.target.checked)} />
        Show weight &amp; price in the item list <span style={{ color: '#9ca3af', fontSize: 12 }}>(off = item names only)</span>
      </label>

      <div style={label}>Welcome message (optional)</div>
      <textarea style={{ ...input, resize: 'vertical' }} rows={2} maxLength={500} value={f.welcome} disabled={dis} onChange={(e) => set('welcome', e.target.value)} placeholder="Welcome to our shop! Fresh meat delivered to your door." />

      {msg.err && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 8 }}>{msg.err}</div>}
      {msg.ok && <div style={{ color: '#15803d', fontSize: 13, marginTop: 8 }}>✓ {msg.ok}</div>}
      {canEdit ? (
        <button type="button" onClick={save} disabled={saving} style={{ marginTop: 12, padding: '10px 18px', borderRadius: 10, border: 'none', background: saving ? '#e5e7eb' : '#16a34a', color: saving ? '#9ca3af' : 'white', fontWeight: 700, fontSize: 14, cursor: saving ? 'wait' : 'pointer' }}>
          {saving ? 'Saving…' : 'Save bot settings'}
        </button>
      ) : (
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 10 }}>Only the owner or an admin can change these settings.</div>
      )}
    </div>
  );
}
