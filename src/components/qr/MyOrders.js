'use client';

// "My orders" on the QR / online menu: the orders placed FROM THIS PHONE (their ids are kept in this
// browser, per restaurant), each with its live status from the public order-status endpoint and a
// link to the tracking page. No login and no phone lookup — a guest only ever sees the orders this
// device placed (order ids are long random ids), never someone else's by typing a number.
import { useEffect, useState } from 'react';
import { FaTimes, FaSpinner, FaChevronRight } from 'react-icons/fa';
import apiClient from '../../lib/api.js';

const KEY = (restaurantId) => `dineopen_my_orders_${restaurantId}`;
const KEEP = 15;                         // newest orders kept
const MAX_AGE_MS = 30 * 24 * 3600 * 1000; // forget after 30 days

export function readMyOrders(restaurantId) {
  if (typeof window === 'undefined' || !restaurantId) return [];
  try {
    const list = JSON.parse(localStorage.getItem(KEY(restaurantId)) || '[]');
    const now = Date.now();
    return Array.isArray(list) ? list.filter(o => o && typeof o.id === 'string' && o.id && now - (Number(o.at) || 0) < MAX_AGE_MS) : [];
  } catch (_) {
    return [];
  }
}

// After an order is placed (or items were added to the running order → same id, moved to the top).
export function rememberMyOrder(restaurantId, orderId) {
  if (typeof window === 'undefined' || !restaurantId || !orderId) return readMyOrders(restaurantId);
  const next = [{ id: String(orderId), at: Date.now() }, ...readMyOrders(restaurantId).filter(o => o.id !== String(orderId))].slice(0, KEEP);
  try { localStorage.setItem(KEY(restaurantId), JSON.stringify(next)); } catch (_) { /* private mode / full — list just isn't kept */ }
  return next;
}

// A random key for this phone (no personal data) — sent with QR orders so a restaurant using "separate
// bill per guest" can tell this guest's next order (→ their own bill) from another guest's on the table.
export function guestDeviceKey() {
  if (typeof window === 'undefined') return null;
  try {
    let k = localStorage.getItem('dineopen_guest_key');
    if (!k || !/^[A-Za-z0-9_-]{8,64}$/.test(k)) {
      const rnd = (window.crypto && window.crypto.getRandomValues) ? Array.from(window.crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, '0')).join('') : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
      k = `g_${rnd}`;
      localStorage.setItem('dineopen_guest_key', k);
    }
    return k;
  } catch (_) {
    return null;
  }
}

const STATUS = {
  pending: ['Received', '#b45309', '#fef3c7'],
  awaiting_approval: ['Waiting for the restaurant', '#b45309', '#fef3c7'],
  pending_payment: ['Waiting for payment', '#b45309', '#fef3c7'],
  confirmed: ['Confirmed', '#1d4ed8', '#dbeafe'],
  preparing: ['Being prepared', '#6d28d9', '#ede9fe'],
  ready: ['Ready', '#047857', '#d1fae5'],
  served: ['Served', '#047857', '#d1fae5'],
  completed: ['Completed', '#374151', '#f3f4f6'],
  cancelled: ['Cancelled', '#b91c1c', '#fee2e2'],
  rejected: ['Not accepted', '#b91c1c', '#fee2e2'],
};

export default function MyOrdersSheet({ restaurantId, orders, onClose, brandColor = '#ef4444', cs = '₹' }) {
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const got = await Promise.all(orders.map(async (o) => {
        try {
          const r = await apiClient.request(`/api/public/order-status/${encodeURIComponent(o.id)}`);
          return r && r.id ? { ...r, at: o.at, trackId: o.id } : null;
        } catch (_) {
          return null; // removed / not found → not listed
        }
      }));
      if (alive) setRows(got.filter(Boolean));
    })();
    return () => { alive = false; };
  }, [orders]);

  const when = (ms) => {
    const d = new Date(ms);
    const today = new Date().toDateString() === d.toDateString();
    return today ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', width: '100%', maxWidth: '520px', maxHeight: '80vh', overflowY: 'auto', borderRadius: '20px 20px 0 0', padding: '18px 16px 24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>My orders</h3>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <FaTimes size={14} color="#374151" />
          </button>
        </div>
        <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#6b7280' }}>Orders placed from this phone</p>
        {rows === null ? (
          <div style={{ textAlign: 'center', padding: '28px', color: '#6b7280' }}><FaSpinner className="animate-spin" size={20} /></div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: '#6b7280', fontSize: '14px' }}>No orders yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rows.map((r) => {
              const key = r.approval?.state === 'rejected' ? 'rejected' : r.status;
              const [label, fg, bg] = STATUS[key] || [String(r.status || '').replace(/_/g, ' '), '#374151', '#f3f4f6'];
              return (
                <a key={r.trackId} href={`/order-status/${r.trackId}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '14px', border: '1px solid #e5e7eb', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>#{r.token}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: fg, background: bg, padding: '2px 8px', borderRadius: '999px' }}>{label}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {when(r.at)} · {r.itemCount} item{r.itemCount === 1 ? '' : 's'} · {cs}{Number(r.total || 0).toFixed(2)}
                    </div>
                  </div>
                  <FaChevronRight size={12} color={brandColor} />
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
