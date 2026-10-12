'use client';

// QR order approval — POS panel (Customers → App Settings → "Approve customer orders").
// Lists customer (QR / online) orders waiting for approval with Approve / Reject, on every
// dashboard page, and repeats an alert while any order is waiting. Renders nothing when the
// restaurant doesn't use approval (one light request on load; then it only wakes up on an
// order event that says an order is waiting).

import { useCallback, useEffect, useRef, useState } from 'react';
import apiClient from '../lib/api';
import { subscribeRestaurantEvents } from '../lib/realtimeSubscribe';
import { useCurrency } from '../contexts/CurrencyContext';
import { FaCheck, FaTimes, FaChevronDown, FaChevronUp, FaClock } from 'react-icons/fa';

const AWAITING = 'awaiting_approval';

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [0, 0.22].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.18);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.2);
    });
    setTimeout(() => ctx.close().catch(() => {}), 800);
  } catch (_) { /* sound is best-effort */ }
}

const ago = (iso) => {
  if (!iso) return '';
  const m = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 1 ? 'just now' : `${m} min ago`;
};

export default function QrApprovalPanel({ restaurantId }) {
  const { getCurrencySymbol } = useCurrency();
  const currency = (getCurrencySymbol && getCurrencySymbol()) || '';
  const [state, setState] = useState({ enabled: false, canApprove: false, reminderMinutes: 1, orders: [] });
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState({});           // orderId → 'approve' | 'reject'
  const [rejecting, setRejecting] = useState(null); // orderId showing the reason box
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [, setTick] = useState(0);
  const loadSeq = useRef(0);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    const seq = ++loadSeq.current;
    try {
      const r = await apiClient.request(`/api/qr-approval/${restaurantId}/pending`, { method: 'GET' });
      if (seq !== loadSeq.current || !r) return;
      setState({ enabled: !!r.enabled, canApprove: !!r.canApprove, reminderMinutes: Number(r.reminderMinutes) || 0, orders: Array.isArray(r.orders) ? r.orders : [] });
    } catch (_) { /* older backend / offline — panel stays hidden */ }
  }, [restaurantId]);

  // Initial load per restaurant.
  useEffect(() => { setState(s => ({ ...s, orders: [] })); load(); }, [load]);

  // Live: a held order arrives, or one we list changes status → refresh the list.
  // (Refs keep ONE subscription per restaurant instead of re-subscribing on every list change.)
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => {
    if (!restaurantId) return;
    let t = null;
    const unsub = subscribeRestaurantEvents(restaurantId, 'orders', (data) => {
      if (!data) return;
      // Ignore the reconnect replay of old events.
      if (data.ts && Date.now() - data.ts > 2 * 60 * 1000) return;
      const isHeld = data.status === AWAITING;
      const touchesListed = stateRef.current.orders.some(o => o.id === (data.orderId || data.id));
      if (isHeld && data.type === 'order-created' && stateRef.current.canApprove !== false) { beep(); setOpen(true); }
      if (isHeld || touchesListed) {
        if (t) clearTimeout(t);
        t = setTimeout(load, 600);
      }
    });
    return () => { if (t) clearTimeout(t); unsub(); };
  }, [restaurantId, load]);

  // Safety net while something is waiting (missed event, another terminal acted): refresh every 30s.
  const waiting = state.orders.length;
  useEffect(() => {
    if (!waiting) return;
    const iv = setInterval(() => { load(); setTick(x => x + 1); }, 30000);
    return () => clearInterval(iv);
  }, [waiting, load]);

  // Reminder alert while orders wait (only for people who can act on them).
  useEffect(() => {
    if (!waiting || !state.canApprove || !(state.reminderMinutes > 0)) return;
    const iv = setInterval(() => { beep(); setOpen(true); }, state.reminderMinutes * 60000);
    return () => clearInterval(iv);
  }, [waiting, state.canApprove, state.reminderMinutes]);

  const decide = async (orderId, action) => {
    setError('');
    setBusy(b => ({ ...b, [orderId]: action }));
    try {
      await apiClient.decideQrOrder(orderId, action, action === 'reject' ? reason.trim() : '');
      setState(s => ({ ...s, orders: s.orders.filter(o => o.id !== orderId) }));
      if (action === 'reject') { setRejecting(null); setReason(''); }
      setTimeout(load, 800);
    } catch (e) {
      setError(e?.message || 'Could not update the order');
      load();
    } finally {
      setBusy(b => { const n = { ...b }; delete n[orderId]; return n; });
    }
  };

  if (!waiting) return null;

  return (
    <div style={{ position: 'fixed', right: '16px', bottom: '16px', zIndex: 10000, width: '360px', maxWidth: 'calc(100vw - 32px)' }}>
      <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 12px 40px rgba(0,0,0,.18)', border: '1px solid #fde68a', overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#fffbeb', border: 'none', borderBottom: open ? '1px solid #fde68a' : 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>{waiting}</span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: '#92400e' }}>
            Customer order{waiting > 1 ? 's' : ''} waiting for approval
          </span>
          {open ? <FaChevronDown color="#92400e" /> : <FaChevronUp color="#92400e" />}
        </button>

        {open && (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {error && <div style={{ margin: '10px 14px 0', padding: '8px 10px', background: '#fef2f2', color: '#b91c1c', borderRadius: '8px', fontSize: '12px' }}>{error}</div>}
            {state.orders.map((o) => {
              const b = busy[o.id];
              return (
                <div key={o.id} style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                      {o.tableNumber ? `Table ${o.tableNumber}${o.chairNumber ? ` · Seat ${o.chairNumber}` : ''}` : (o.orderType === 'delivery' ? 'Delivery' : 'Takeaway')}
                    </span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>#{o.dailyOrderId ?? String(o.orderNumber || o.id).slice(-4)}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FaClock size={10} />{ago(o.requestedAt)}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#374151', marginTop: '4px', lineHeight: 1.45 }}>
                    {o.customerName ? <b>{o.customerName}: </b> : null}
                    {o.items.map((i, k) => `${i.quantity}× ${i.name}${i.variant ? ` (${i.variant})` : ''}`).join(', ')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{currency}{Number(o.total || 0).toFixed(2)}</span>
                    {o.paidOnline && <span style={{ fontSize: '10px', fontWeight: 700, color: '#047857', background: '#d1fae5', borderRadius: '6px', padding: '2px 6px' }}>PAID ONLINE</span>}
                    {o.lastError && <span style={{ fontSize: '11px', color: '#b91c1c' }}>{o.lastError}</span>}
                  </div>

                  {state.canApprove ? (
                    rejecting === o.id ? (
                      <div style={{ marginTop: '8px' }}>
                        <input
                          autoFocus
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Reason (optional) — e.g. item finished"
                          maxLength={200}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button type="button" disabled={!!b} onClick={() => decide(o.id, 'reject')}
                            style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: b ? 0.6 : 1 }}>
                            {b === 'reject' ? 'Rejecting…' : 'Confirm reject'}
                          </button>
                          <button type="button" onClick={() => { setRejecting(null); setReason(''); }}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>Back</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button type="button" disabled={!!b || o.processing} onClick={() => decide(o.id, 'approve')}
                          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', opacity: (b || o.processing) ? 0.6 : 1 }}>
                          <FaCheck size={11} /> {b === 'approve' || o.processing ? 'Approving…' : 'Approve'}
                        </button>
                        <button type="button" disabled={!!b || o.processing} onClick={() => { setRejecting(o.id); setReason(''); }}
                          style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                          <FaTimes size={11} /> Reject
                        </button>
                      </div>
                    )
                  ) : (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>Waiting for a manager to approve.</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
