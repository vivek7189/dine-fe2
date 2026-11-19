'use client';

// Event calendar → scheduled orders + bookings on their day (posSettings.calendarOrders, off by default;
// the owner turns it on from the calendar legend). Read-only: the same lists Order History →
// Scheduled / Bookings load. Anything that fails to load just shows nothing.
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import apiClient from '../../lib/api';

function savedRestaurant() {
  try { return JSON.parse(localStorage.getItem('selectedRestaurant') || 'null'); } catch { return null; }
}

function isOwner() {
  try { return String(JSON.parse(localStorage.getItem('user') || 'null')?.role || '').toLowerCase() === 'owner'; } catch { return false; }
}

function toDate(v) {
  if (!v) return null;
  if (typeof v === 'object') {
    const s = v._seconds ?? v.seconds;
    if (s != null) return new Date(Number(s) * 1000);
    if (typeof v.toDate === 'function') return v.toDate();
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

// YYYY-MM-DD at the restaurant (its time zone when set, else this device).
function dayKeyOf(d, tz) {
  try { return d.toLocaleDateString('en-CA', tz ? { timeZone: tz } : undefined); } catch { return d.toLocaleDateString('en-CA'); }
}

function timeOf(d, tz) {
  try { return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', ...(tz ? { timeZone: tz } : {}) }); } catch { return ''; }
}

export function useCalendarOrders(restaurantId, range) {
  const [enabled, setEnabled] = useState(false);
  const [canToggle, setCanToggle] = useState(false);
  const [tz, setTz] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const r = savedRestaurant();
    const ps = (r && r.id === restaurantId && r.posSettings) || {};
    setEnabled(ps.calendarOrders === true);
    setTz(ps.timezone || null);
    setCanToggle(isOwner());
  }, [restaurantId]);

  useEffect(() => {
    if (!enabled || !restaurantId || !range) { setOrders([]); setBookings([]); return undefined; }
    let alive = true;
    apiClient.getOrders(restaurantId, { page: 1, limit: 200, isScheduled: 'true' })
      .then((res) => { if (alive) setOrders(Array.isArray(res?.orders) ? res.orders : []); })
      .catch(() => { if (alive) setOrders([]); });
    apiClient.getBookings(restaurantId, { startDate: range.from, endDate: range.to })
      .then((res) => { if (alive) setBookings(Array.isArray(res?.bookings) ? res.bookings : []); })
      .catch(() => { if (alive) setBookings([]); });
    return () => { alive = false; };
  }, [enabled, restaurantId, range]);

  const setOn = useCallback(async (on) => {
    if (!restaurantId) return;
    setSaving(true);
    try {
      await apiClient.updateRestaurant(restaurantId, { posSettingsPatch: { calendarOrders: on ? true : null } });
      const r = savedRestaurant();
      if (r && r.id === restaurantId) {
        try { localStorage.setItem('selectedRestaurant', JSON.stringify({ ...r, posSettings: { ...(r.posSettings || {}), calendarOrders: on ? true : undefined } })); } catch { /* ignore */ }
      }
      setEnabled(on);
    } catch (e) {
      console.warn('[calendar] could not change orders & bookings setting:', e?.message); // owner-only on the server
    } finally { setSaving(false); }
  }, [restaurantId]);

  // day → { orders: [...], bookings: [...] }
  const byDay = useMemo(() => {
    const m = {};
    const slot = (k) => m[k] || (m[k] = { orders: [], bookings: [] });
    for (const o of orders) {
      if (o.status === 'cancelled' || o.status === 'deleted') continue;
      const d = toDate(o.scheduledFor);
      if (!d) continue;
      slot(dayKeyOf(d, tz)).orders.push({ ...o, _at: d, _time: timeOf(d, tz) });
    }
    for (const b of bookings) {
      if (!b.eventDate || b.status === 'cancelled') continue;
      slot(String(b.eventDate).slice(0, 10)).bookings.push(b);
    }
    Object.values(m).forEach((x) => {
      x.orders.sort((a, b) => a._at - b._at);
      x.bookings.sort((a, b) => String(a.eventTime || '').localeCompare(String(b.eventTime || '')));
    });
    return m;
  }, [orders, bookings, tz]);

  return { enabled, canToggle, saving, setOn, byDay };
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function DayOrderChips({ entry, onOpen }) {
  if (!entry || (!entry.orders.length && !entry.bookings.length)) return null;
  return (
    <>
      {entry.orders.length > 0 && (
        <span className="dcal-chip" data-testid="cal-orders-chip" title="Scheduled orders" onClick={(ev) => { ev.stopPropagation(); onOpen(); }}
          style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe' }}>🛵 {plural(entry.orders.length, 'order', 'orders')}</span>
      )}
      {entry.bookings.length > 0 && (
        <span className="dcal-chip" data-testid="cal-bookings-chip" title="Bookings" onClick={(ev) => { ev.stopPropagation(); onOpen(); }}
          style={{ background: '#ecfdf5', color: '#047857', borderColor: '#a7f3d0' }}>📅 {plural(entry.bookings.length, 'booking', 'bookings')}</span>
      )}
    </>
  );
}

export function DayOrderDots({ entry }) {
  if (!entry) return null;
  return (
    <>
      {entry.orders.length > 0 && <span style={{ background: '#2563eb' }} />}
      {entry.bookings.length > 0 && <span style={{ background: '#059669' }} />}
    </>
  );
}

const typeLabel = (t) => ({ delivery: 'Delivery', takeaway: 'Takeaway', 'dine-in': 'Dine-in', dine_in: 'Dine-in' }[t] || t || '');

export function DayOrderList({ entry, formatCurrency }) {
  if (!entry || (!entry.orders.length && !entry.bookings.length)) return null;
  const row = { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, textDecoration: 'none', color: '#0f172a', fontSize: 13 };
  return (
    <div data-testid="cal-day-orders" style={{ marginBottom: 10, display: 'grid', gap: 6 }}>
      {entry.orders.map((o) => {
        const items = (o.items || []).map((i) => `${i.quantity || 1}× ${i.name}`).join(', ');
        const who = o.customerInfo?.name || o.customerName || '';
        return (
          <Link key={o.id} href="/orderhistory?view=scheduled" style={{ ...row, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <span style={{ fontWeight: 800, color: '#1d4ed8', minWidth: 64 }}>🛵 {o._time}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <b>{typeLabel(o.orderType)}</b>{who ? ` · ${who}` : ''}
              <span style={{ display: 'block', color: '#475569', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{items}</span>
            </span>
            <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
              <b>{formatCurrency(Number(o.finalAmount ?? o.totalAmount) || 0)}</b>
              <span style={{ display: 'block', fontSize: 11, color: '#64748b' }}>{o.status}</span>
            </span>
          </Link>
        );
      })}
      {entry.bookings.map((b) => (
        <Link key={b.id} href="/orderhistory?view=bookings" style={{ ...row, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <span style={{ fontWeight: 800, color: '#047857', minWidth: 64 }}>📅 {b.eventTime || ''}</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <b>{b.customer?.name || b.eventName || b.bookingNumber}</b>
            {b.guestCount ? ` · ${b.guestCount} guests` : ''}
            <span style={{ display: 'block', color: '#475569', fontSize: 12 }}>{[b.eventName, b.type].filter(Boolean).join(' · ')}</span>
          </span>
          <span style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
            {b.totalAmount ? <b>{formatCurrency(Number(b.totalAmount) || 0)}</b> : null}
            <span style={{ display: 'block', fontSize: 11, color: '#64748b' }}>{b.status}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export function monthOrderCounts(byDay, monthPrefix) {
  let orders = 0, bookings = 0;
  for (const [k, v] of Object.entries(byDay)) {
    if (k.slice(0, 7) !== monthPrefix) continue;
    orders += v.orders.length; bookings += v.bookings.length;
  }
  return { orders, bookings };
}
