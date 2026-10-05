'use client';

// Customer statements — automatic email to customers who owe money (owner / manager).
// Off / daily / weekly, at a local hour (restaurant clock). WhatsApp is always sent by staff
// from the customer's profile ("Send statement"), never automatically.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import apiClient from '../../lib/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hourLabel = (h) => `${((h + 11) % 12) + 1}:00 ${h < 12 ? 'AM' : 'PM'}`;

export default function StatementSettings({ restaurantId, onClose }) {
  const [s, setS] = useState(null);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!restaurantId) return;
    apiClient.getStatementSettings(restaurantId)
      .then(r => setS(r.settings || { autoEmail: 'off', weekday: 1, hour: 9 }))
      .catch(() => setS({ autoEmail: 'off', weekday: 1, hour: 9 }));
  }, [restaurantId]);

  const save = async () => {
    setSaving(true); setNote('');
    try { const r = await apiClient.saveStatementSettings(restaurantId, s); setS(r.settings); setNote('Saved'); }
    catch (e) { setNote(e.message || 'Could not save'); }
    finally { setSaving(false); }
  };

  if (typeof document === 'undefined') return null;
  const sel = { width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, background: '#fff' };
  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Customer statements</div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 14px' }}>
          Automatically email a statement to every customer who has a balance due and an email address.
          To send by WhatsApp, open the customer and press <b>Send statement</b>.
        </p>
        {!s ? <div style={{ color: '#64748b' }}>Loading…</div> : (
          <>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>Automatic email</label>
            <select value={s.autoEmail} onChange={e => setS({ ...s, autoEmail: e.target.value })} style={{ ...sel, marginTop: 4 }}>
              <option value="off">Off</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            {s.autoEmail !== 'off' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                {s.autoEmail === 'weekly' && (
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
            {s.autoEmail !== 'off' && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 10 }}>
                {s.autoEmail === 'daily' ? 'Every day' : `Every ${DAYS[s.weekday]}`} at {hourLabel(s.hour)} (restaurant time), covering the {s.autoEmail === 'daily' ? 'previous day' : 'previous 7 days'} with the current balance.
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
