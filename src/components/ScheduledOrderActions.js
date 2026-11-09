'use client';

// Order History → Scheduled: actions on a scheduled order.
//   • WhatsApp bulk / party order (order.bulkOrder): its details (pickup / delivery, guests, note) and
//     Confirm / Decline — the customer is told on WhatsApp. Decline cancels the order (with the reason).
//   • Any scheduled order not in the kitchen yet: "Send to kitchen" (kitchen screen + KOT now). A bulk
//     order needs Confirm first.
// Backend: POST /api/orders/:id/bulk-decision, POST /api/orders/:id/send-to-kitchen, PATCH /api/orders/:id/cancel.
import { useState } from 'react';
import apiClient from '../lib/api';

const CLOSED = ['completed', 'cancelled', 'deleted', 'refunded'];
const FULFIL = { takeaway: '🥡 Pickup', delivery: '🛵 Delivery', 'dine-in': '🍽️ At the restaurant' };
const STATE = {
  requested: ['Waiting for your confirmation', 'bg-amber-100 text-amber-800'],
  confirmed: ['Confirmed', 'bg-emerald-100 text-emerald-700'],
  declined: ['Declined', 'bg-red-100 text-red-700'],
};

export default function ScheduledOrderActions({ order, onChanged }) {
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState(null); // { ok, text }
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  if (!order) return null;
  const b = order.bulkOrder || null;
  const status = String(order.status || '').toLowerCase();
  const open = !CLOSED.includes(status);
  const canSend = open && order.isScheduled && !order.scheduledFired && (!b || b.state === 'confirmed');

  const waNote = (r) => (r && r.whatsapp === 'sent' ? ' Customer told on WhatsApp.'
    : r && r.whatsapp === 'failed' ? ' WhatsApp not delivered — please call the customer.' : ' (No WhatsApp sent — please call the customer.)');
  const run = async (key, fn) => {
    setBusy(key); setMsg(null);
    try { await fn(); } catch (e) { setMsg({ ok: false, text: e?.message || 'Something went wrong' }); }
    setBusy('');
  };
  const confirm = () => run('confirm', async () => {
    const r = await apiClient.request(`/api/orders/${order.id}/bulk-decision`, { method: 'POST', body: { decision: 'confirmed' } });
    if (!r || r.success === false) throw new Error((r && r.error) || 'Could not confirm');
    setMsg({ ok: true, text: `Confirmed.${r.already ? '' : waNote(r)}` });
    onChanged && onChanged();
  });
  const decline = () => run('decline', async () => {
    const why = reason.trim();
    if (!why) throw new Error('Write a short reason for the customer.');
    const c = await apiClient.cancelOrder(order.id, why);
    if (c && c.success === false) throw new Error(c.error || 'Could not cancel');
    const r = await apiClient.request(`/api/orders/${order.id}/bulk-decision`, { method: 'POST', body: { decision: 'declined', reason: why } });
    if (!r || r.success === false) throw new Error((r && r.error) || 'Cancelled, but the customer was not told');
    setDeclining(false);
    setMsg({ ok: true, text: `Declined and cancelled.${waNote(r)}` });
    onChanged && onChanged();
  });
  const sendToKitchen = () => run('send', async () => {
    const r = await apiClient.request(`/api/orders/${order.id}/send-to-kitchen`, { method: 'POST', body: {} });
    if (!r || r.success === false) throw new Error((r && r.error) || 'Could not send to the kitchen');
    setMsg({ ok: true, text: 'Sent to the kitchen.' });
    onChanged && onChanged();
  });

  if (!b && !canSend && !msg) return null;
  const [stateLabel, stateCls] = b ? (STATE[b.state] || [b.state, 'bg-gray-100 text-gray-600']) : [];
  const btn = 'flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition-all disabled:opacity-60';

  return (
    <div className="mt-2 pt-2 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
      {b && (
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="font-bold text-fuchsia-700 bg-fuchsia-50 border border-fuchsia-200 px-2 py-0.5 rounded-full">🎉 {b.label || 'Bulk order'}</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full ${stateCls}`}>{stateLabel}</span>
          {FULFIL[b.type] && <span className="text-gray-600">{FULFIL[b.type]}</span>}
          {b.guests ? <span className="text-gray-600">· 👥 {b.guests} people</span> : null}
          {b.note ? <span className="text-gray-600 truncate max-w-full">· 📝 {b.note}</span> : null}
          {b.state === 'declined' && b.declineReason ? <span className="text-red-600">· {b.declineReason}</span> : null}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
        {b && b.state === 'requested' && open && !declining && (
          <>
            <button type="button" disabled={!!busy} onClick={confirm} className={`${btn} text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700`}>
              {busy === 'confirm' ? 'Confirming…' : '✓ Confirm'}
            </button>
            <button type="button" disabled={!!busy} onClick={() => { setDeclining(true); setMsg(null); }} className={`${btn} text-red-700 bg-white border-red-200 hover:bg-red-50`}>
              ✕ Decline
            </button>
          </>
        )}
        {declining && (
          <div className="flex flex-wrap items-center gap-1.5 w-full">
            <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} placeholder="Reason for the customer (e.g. fully booked that day)"
              className="flex-1 min-w-[200px] px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg" />
            <button type="button" disabled={!!busy} onClick={decline} className={`${btn} text-white bg-red-600 border-red-600 hover:bg-red-700`}>
              {busy === 'decline' ? 'Declining…' : 'Decline & tell customer'}
            </button>
            <button type="button" disabled={!!busy} onClick={() => setDeclining(false)} className={`${btn} text-gray-600 bg-white border-gray-200`}>Back</button>
          </div>
        )}
        {canSend && !declining && (
          <button type="button" disabled={!!busy} onClick={sendToKitchen} className={`${btn} text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100`}>
            {busy === 'send' ? 'Sending…' : '🔥 Send to kitchen'}
          </button>
        )}
        {msg && <span className={`text-[11px] ${msg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
