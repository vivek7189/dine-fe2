'use client';

// Pause / resume WhatsApp orders right now (owner or admin). Separate from the order timings: while
// paused, customers who message get the message below, and the bot's order link shows "closed".
// Backend: PUT /api/whatsapp-ordering/pause/:restaurantId (owner / co-owner / admin only).
import { useEffect, useState } from 'react';
import apiClient from '../lib/api';

const DEFAULT_MESSAGE = 'Sorry, we are not taking orders right now. Please try again later. 🙏';
const PAUSE_ROLES = ['owner', 'co-owner', 'admin', 'super_admin'];

function myRole() {
  try { return String(JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase(); } catch { return ''; }
}

export default function WhatsAppPauseCard({ restaurantId, orderingPaused, botOn = true, onChange }) {
  const [pause, setPause] = useState(orderingPaused || null);
  const [message, setMessage] = useState((orderingPaused && orderingPaused.message) || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [canChange, setCanChange] = useState(false);

  useEffect(() => { setCanChange(PAUSE_ROLES.includes(myRole())); }, []);
  useEffect(() => { setPause(orderingPaused || null); setMessage((orderingPaused && orderingPaused.message) || ''); }, [orderingPaused]);

  const paused = !!(pause && pause.paused);

  const save = async (nextPaused) => {
    setSaving(true); setError('');
    try {
      const res = await apiClient.request(`/api/whatsapp-ordering/pause/${restaurantId}`, { method: 'PUT', body: { paused: nextPaused, message: message.trim() } });
      if (!res || res.success === false) throw new Error((res && res.error) || 'Could not save');
      setPause(res.orderingPaused);
      if (onChange) onChange(res.orderingPaused);
    } catch (e) {
      setError(e?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!restaurantId) return null;
  const when = pause && pause.at ? new Date(pause.at).toLocaleString([], { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '';

  return (
    <div style={{ borderRadius: 14, padding: '14px 16px', marginBottom: 18, border: `1px solid ${paused ? '#fecaca' : '#bbf7d0'}`, background: paused ? '#fef2f2' : '#f0fdf4' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontWeight: 800, fontSize: 15.5, color: paused ? '#b91c1c' : '#15803d' }}>
            {paused ? '⏸ WhatsApp orders paused' : '● Taking WhatsApp orders'}
          </div>
          <div style={{ fontSize: 12.5, color: '#4b5563', marginTop: 2 }}>
            {paused
              ? `Customers who message get your message below.${pause.by ? ` Paused by ${pause.by}` : ''}${when ? ` · ${when}` : ''}`
              : botOn ? 'Busy or stock finished? Pause to stop new WhatsApp orders right away.' : 'The WhatsApp order bot is switched off.'}
          </div>
        </div>
        {canChange && (
          <button type="button" disabled={saving} onClick={() => save(!paused)}
            style={{ padding: '10px 18px', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: saving ? 'wait' : 'pointer', color: 'white', background: paused ? '#16a34a' : '#ef4444' }}>
            {saving ? 'Saving…' : paused ? '▶ Resume orders' : '⏸ Pause orders'}
          </button>
        )}
      </div>
      {canChange && (
        <div style={{ marginTop: 10 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Message customers get while paused</label>
          <textarea value={message} maxLength={300} rows={2} disabled={saving} onChange={(e) => setMessage(e.target.value)} placeholder={DEFAULT_MESSAGE}
            style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13.5, resize: 'vertical', boxSizing: 'border-box', background: 'white' }} />
          {paused && (
            <button type="button" disabled={saving} onClick={() => save(true)}
              style={{ marginTop: 6, padding: '6px 12px', borderRadius: 8, border: '1px solid #fecaca', background: 'white', color: '#b91c1c', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>
              Update message
            </button>
          )}
        </div>
      )}
      {!canChange && <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>Only the owner or an admin can pause or resume.</div>}
      {error && <div style={{ fontSize: 12.5, color: '#b91c1c', marginTop: 6 }}>{error}</div>}
    </div>
  );
}
