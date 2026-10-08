'use client';

// Customer statements — automatic email and/or WhatsApp to customers who owe money (owner / manager).
// Each channel off / daily / weekly, both at the same local hour / weekday (restaurant clock).
// WhatsApp goes from the restaurant's connected WhatsApp (approved due_statement template).

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../../lib/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hourLabel = (h) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;

export default function StatementSettings({ restaurantId, onClose }) {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [waConnected, setWaConnected] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;
    apiClient.getStatementSettings(restaurantId)
      .then(r => { setS({ autoWhatsapp: 'off', ...(r.settings || { autoEmail: 'off', weekday: 1, hour: 9 }) }); setWaConnected(r.whatsappConnected !== false); })
      .catch(() => setS({ autoEmail: 'off', autoWhatsapp: 'off', weekday: 1, hour: 9 }));
  }, [restaurantId]);

  const save = async () => {
    setSaving(true); setNote('');
    try { const r = await apiClient.saveStatementSettings(restaurantId, s); setS(r.settings); setNote('Saved'); }
    catch (e) { setNote(e.message || 'Could not save'); }
    finally { setSaving(false); }
  };

  if (typeof document === 'undefined') return null;
  const anyOn = !!s && (s.autoEmail !== 'off' || s.autoWhatsapp !== 'off');
  const anyWeekly = !!s && (s.autoEmail === 'weekly' || s.autoWhatsapp === 'weekly');
  const sel = { width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff' };
  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Customer statements</div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 14px' }}>
          Automatically send a statement to every customer who has a balance due — by email (customers with an
          email address) and/or WhatsApp (customers with a phone number). Customers with no due get nothing.
          To send one now, open the customer and press <b>Send statement</b>.
        </p>
        {!s ? <div style={{ color: '#64748b' }}>Loading…</div> : (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Automatic WhatsApp</label>
                <select value={s.autoWhatsapp} onChange={e => setS({ ...s, autoWhatsapp: e.target.value })} style={{ ...sel, marginTop: 4 }}>
                  <option value="off">Off</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Automatic email</label>
                <select value={s.autoEmail} onChange={e => setS({ ...s, autoEmail: e.target.value })} style={{ ...sel, marginTop: 4 }}>
                  <option value="off">Off</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
            {s.autoWhatsapp !== 'off' && !waConnected && (
              <div style={{ fontSize: 12, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 8px', marginTop: 8 }}>
                WhatsApp isn&apos;t connected for this restaurant yet — connect it in Automation → WhatsApp, or nothing will be sent.
              </div>
            )}
            {anyOn && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {anyWeekly && (
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Day</label>
                    <select value={s.weekday} onChange={e => setS({ ...s, weekday: Number(e.target.value) })} style={{ ...sel, marginTop: 4 }}>
                      {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Time</label>
                  <select value={s.hour} onChange={e => setS({ ...s, hour: Number(e.target.value) })} style={{ ...sel, marginTop: 4 }}>
                    {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
                  </select>
                </div>
              </div>
            )}
            {anyOn && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 10 }}>
                {[['WhatsApp', s.autoWhatsapp], ['Email', s.autoEmail]].filter(([, f]) => f !== 'off').map(([ch, f]) => `${ch}: ${f === 'daily' ? 'every day' : `every ${DAYS[s.weekday]}`}`).join(' · ')} at {hourLabel(s.hour)} (restaurant time), with the current balance due.
                {s.autoWhatsapp !== 'off' && ' Each WhatsApp message is a paid business message.'}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
              <button onClick={save} disabled={saving} style={{ padding: '9px 16px', border: 'none', borderRadius: 10, background: '#ef4444', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save'}</button>
              {note && <span style={{ fontSize: 12, color: note === 'Saved' ? '#047857' : '#b91c1c' }}>{note}</span>}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
