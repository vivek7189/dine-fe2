'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import TableBillingModal from '../../../components/TableBillingModal';
import { FaSpinner, FaExclamationTriangle, FaCheck, FaBan, FaTrash, FaClock, FaChair, FaUser, FaReceipt, FaSearch, FaChevronDown, FaChevronUp, FaTimes, FaSyncAlt } from 'react-icons/fa';

/**
 * Open Orders — every order that was placed (KOT fired) but never settled or voided, across
 * ALL dates (last 90 days), with age. This is the "unclosed checks" list every POS has. From
 * here staff resolve each hanging order:
 *   SETTLE  → the normal bill screen (payment method, split, tax, print) — same as the POS, so
 *             sales, payment-method totals, customer credit and the table all update correctly
 *   CANCEL  → abandoned / customer left (void, kept for audit, not a sale)
 *   DELETE  → created by mistake
 * Open orders never count as sales, so cleaning them up keeps the reports honest.
 * ?restaurantId=… opens a specific outlet (used by the Home card and the daily email).
 */
const PAGE_SIZE = 20;
const OPEN_EVENT = 'open-orders-changed'; // Sidebar badge + Home card listen to refresh

const notifyChanged = (rid) => {
  try { localStorage.removeItem('openSummary_' + rid); } catch (_) {}
  try { window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { restaurantId: rid } })); } catch (_) {}
};

function ConfirmSheet({ open, title, body, confirmLabel, danger, defaultReason, busy, progress, onCancel, onConfirm }) {
  const [reason, setReason] = useState(defaultReason || '');
  useEffect(() => { if (open) setReason(defaultReason || ''); }, [open, defaultReason]);
  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 20px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', background: danger ? '#dc2626' : '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <b style={{ fontSize: 15 }}>{title}</b>
          <button type="button" disabled={busy} onClick={onCancel} aria-label="Close"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0, width: 30, height: 30, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer' }}><FaTimes /></button>
        </div>
        <div style={{ padding: 18, display: 'grid', gap: 12 }}>
          <div style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.5 }}>{body}</div>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>Reason</span>
            <input value={reason} onChange={e => setReason(e.target.value)} disabled={busy}
              style={{ padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none' }} />
          </label>
          {progress && <div style={{ fontSize: 12.5, color: '#6b7280' }}>{progress}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" disabled={busy} onClick={onCancel} style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', fontWeight: 600, fontSize: 13.5, cursor: 'pointer' }}>Back</button>
            <button type="button" disabled={busy} onClick={() => onConfirm(reason.trim())}
              style={{ padding: '9px 16px', borderRadius: 10, border: 'none', background: danger ? '#dc2626' : '#d97706', color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: busy ? 0.7 : 1 }}>
              {busy && <FaSpinner className="animate-spin" size={12} />} {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Full order detail (all items with price, notes, totals) — fetched when the row is opened.
function OrderDetail({ orderId, formatCurrency, tz }) {
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let alive = true;
    apiClient.getOrderById(orderId)
      .then(r => { if (alive) setOrder((r?.orders && r.orders[0]) || r?.order || null); })
      .catch(e => { if (alive) setErr(e?.message || 'Could not load the order.'); });
    return () => { alive = false; };
  }, [orderId]);
  if (err) return <div className="text-xs text-red-600">{err}</div>;
  if (!order) return <div className="text-xs text-gray-400 flex items-center gap-2"><FaSpinner className="animate-spin" /> Loading details…</div>;
  const items = Array.isArray(order.items) ? order.items : [];
  const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const lineTotal = (i) => num(i.total ?? i.totalPrice ?? (num(i.price) * num(i.quantity || 1)));
  const subtotal = num(order.totalAmount ?? order.subtotal ?? items.reduce((s, i) => s + lineTotal(i), 0));
  const tax = num(order.taxAmount);
  const discount = num(order.manualDiscount) + num(order.offerDiscount) + num(order.discountAmount);
  const finalAmt = num(order.finalAmount || order.totalAmount);
  const fmtTime = (v) => {
    const d = v?._seconds ? new Date(v._seconds * 1000) : new Date(v);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', ...(tz ? { timeZone: tz } : {}) });
  };
  const cust = order.customerInfo || order.customer || {};
  const note = order.notes || order.specialInstructions || order.orderNotes;
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div><div className="text-gray-400">Placed</div><div className="font-semibold text-gray-800">{fmtTime(order.createdAt) || '—'}</div></div>
        <div><div className="text-gray-400">Last change</div><div className="font-semibold text-gray-800">{fmtTime(order.updatedAt) || '—'}</div></div>
        <div><div className="text-gray-400">Customer</div><div className="font-semibold text-gray-800 truncate">{cust.name || '—'}{cust.phone ? ` · ${cust.phone}` : ''}</div></div>
        <div><div className="text-gray-400">Staff</div><div className="font-semibold text-gray-800 truncate">{order.staffInfo?.waiterName || order.staffInfo?.name || order.waiterName || '—'}</div></div>
      </div>
      <div className="rounded-lg border border-gray-100 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr><th className="text-left font-semibold px-3 py-2">Item</th><th className="text-right font-semibold px-3 py-2">Qty</th><th className="text-right font-semibold px-3 py-2">Price</th><th className="text-right font-semibold px-3 py-2">Total</th></tr>
          </thead>
          <tbody>
            {items.map((i, idx) => {
              const variant = i.selectedVariant?.name || i.variant?.name || (typeof i.variant === 'string' ? i.variant : '');
              const extras = (i.selectedToppings || i.toppings || i.addons || []).map(x => x?.name || x).filter(Boolean);
              const st = i.status === 'cancelled' || i.voided;
              return (
                <tr key={idx} className={`border-t border-gray-100 ${st ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  <td className="px-3 py-2">
                    <div className="font-medium">{i.name || i.itemName}{variant ? ` (${variant})` : ''}</div>
                    {extras.length > 0 && <div className="text-[11px] text-gray-500">+ {extras.join(', ')}</div>}
                    {(i.notes || i.specialInstructions) && <div className="text-[11px] text-amber-700">Note: {i.notes || i.specialInstructions}</div>}
                  </td>
                  <td className="px-3 py-2 text-right">{i.quantity || 1}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(num(i.price))}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatCurrency(lineTotal(i))}</td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td colSpan={4} className="px-3 py-3 text-gray-400">No items on this order.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap justify-end gap-x-5 gap-y-1 text-xs text-gray-600">
        <span>Subtotal <b className="text-gray-900">{formatCurrency(subtotal)}</b></span>
        {tax > 0 && <span>Tax <b className="text-gray-900">{formatCurrency(tax)}</b></span>}
        {discount > 0 && <span>Discount <b className="text-gray-900">−{formatCurrency(discount)}</b></span>}
        <span>Total <b className="text-gray-900">{formatCurrency(finalAmt)}</b></span>
      </div>
      {note && <div className="text-xs text-gray-600"><b>Order note:</b> {note}</div>}
    </div>
  );
}

function OpenOrdersContent() {
  const searchParams = useSearchParams();
  const { formatCurrency } = useCurrency();
  const [restaurants, setRestaurants] = useState([]);   // outlets this user can switch between
  const [restaurant, setRestaurant] = useState(null);   // full restaurant object (billing needs its settings)
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [view, setView] = useState(null);                // 'aged' | 'today' | 'all' (null until first load)
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState(() => new Set());
  const [confirm, setConfirm] = useState(null);          // { kind: 'cancel'|'delete', orders: [...] }
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmProgress, setConfirmProgress] = useState('');
  const [notice, setNotice] = useState('');
  // Settle → normal bill screen
  const [billOrder, setBillOrder] = useState(null);
  const [billData, setBillData] = useState({ taxSettings: null, menuItems: null, printSettings: null });
  const restaurantId = restaurant?.id || null;
  // Delete is a per-restaurant switch (super admin) — same rule as Order History.
  const canDelete = restaurant?.orderSettings?.allowOrderDelete === true;
  const tz = restaurant?.posSettings?.timezone || restaurant?.timezone || (apiClient.getRestaurantTimezone ? apiClient.getRestaurantTimezone() : null) || undefined;

  // Resolve the outlet: ?restaurantId (if this user has it) → staff's own → selected → default.
  useEffect(() => {
    (async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const wanted = searchParams?.get('restaurantId') || null;
        let list = [];
        try { const res = await apiClient.getRestaurants(); list = res?.restaurants || []; } catch (_) {}
        const staffRid = userData.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(userData.role) ? userData.restaurantId : null;
        const savedId = localStorage.getItem('selectedRestaurantId');
        const pickId = (wanted && (list.some(r => r.id === wanted) || wanted === userData.restaurantId) ? wanted : null)
          || staffRid || savedId || (list[0] && list[0].id) || userData.restaurantId || null;
        let r = list.find(x => x.id === pickId) || null;
        if (!r && pickId) {
          try { const one = await apiClient.getRestaurant(pickId); r = one?.restaurant || one || null; if (r && !r.id) r.id = pickId; } catch (_) {}
        }
        setRestaurants(staffRid ? [] : list);
        if (r) setRestaurant(r); else { setLoading(false); setError('No restaurant found for this account.'); }
      } catch (_) { setLoading(false); }
    })();
  }, [searchParams]);

  const load = useCallback(async (keepView = false) => {
    if (!restaurantId) return;
    setLoading(true); setError('');
    try {
      const res = await apiClient.getOpenOrders(restaurantId);
      const list = res.openOrders || [];
      setOrders(list);
      setSummary(res.summary || null);
      // Open on the orders that need attention: the ones carried over from earlier days.
      if (!keepView) setView((res.summary?.agedCount || 0) > 0 ? 'aged' : 'all');
      setSelected(prev => new Set([...prev].filter(id => list.some(o => o.id === id))));
    } catch (e) {
      setError(e?.message || 'Could not load open orders.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { setPage(1); setExpanded(null); setSelected(new Set()); load(false); }, [load]);

  const counts = useMemo(() => ({
    aged: orders.filter(o => o.aged).length,
    today: orders.filter(o => !o.aged).length,
    all: orders.length,
  }), [orders]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter(o => {
      if (view === 'aged' && !o.aged) return false;
      if (view === 'today' && o.aged) return false;
      if (!t) return true;
      return [o.orderNumber, o.tableNumber, o.customerName, o.createdBy, o.orderType, ...(o.items || []).map(i => i.name)]
        .some(v => v != null && String(v).toLowerCase().includes(t));
    });
  }, [orders, view, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, pages);
  const pageRows = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);
  useEffect(() => { setPage(1); }, [view, q]);

  const toggle = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const allOnPage = pageRows.length > 0 && pageRows.every(o => selected.has(o.id));
  const togglePage = () => setSelected(prev => {
    const n = new Set(prev);
    if (allOnPage) pageRows.forEach(o => n.delete(o.id)); else pageRows.forEach(o => n.add(o.id));
    return n;
  });
  const selectedOrders = orders.filter(o => selected.has(o.id));

  const removeLocally = (ids) => {
    const gone = orders.filter(o => ids.includes(o.id));
    setOrders(prev => prev.filter(o => !ids.includes(o.id)));
    setSelected(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
    setSummary(prev => {
      if (!prev) return prev;
      const amt = gone.reduce((s, o) => s + (o.amount || 0), 0);
      const agedGone = gone.filter(o => o.aged);
      return { ...prev, count: Math.max(0, prev.count - gone.length), amount: Math.max(0, (prev.amount || 0) - amt),
        agedCount: Math.max(0, (prev.agedCount || 0) - agedGone.length), agedAmount: Math.max(0, (prev.agedAmount || 0) - agedGone.reduce((s, o) => s + (o.amount || 0), 0)) };
    });
  };

  // Cancel / delete one or many (one at a time, so each order's own stock/table/stat rules run).
  const runConfirm = async (reason) => {
    if (!confirm) return;
    const { kind, orders: list } = confirm;
    setConfirmBusy(true);
    const done = []; const failed = [];
    for (let i = 0; i < list.length; i++) {
      const o = list[i];
      if (list.length > 1) setConfirmProgress(`${i + 1} of ${list.length}…`);
      try {
        if (kind === 'cancel') await apiClient.cancelOrder(o.id, reason);
        else await apiClient.deleteOrder(o.id, reason);
        done.push(o.id);
      } catch (e) {
        failed.push(`#${o.orderNumber ?? o.id.slice(-5)}: ${e?.message || 'failed'}`);
      }
    }
    removeLocally(done);
    notifyChanged(restaurantId);
    setConfirmBusy(false); setConfirmProgress(''); setConfirm(null);
    const verb = kind === 'cancel' ? 'cancelled' : 'deleted';
    setNotice(failed.length
      ? `${done.length} ${verb}. ${failed.length} could not be ${verb} — ${failed.slice(0, 3).join('; ')}${failed.length > 3 ? '…' : ''}`
      : `${done.length} order${done.length !== 1 ? 's' : ''} ${verb}.`);
  };

  const openBill = (o) => {
    setBillOrder(o);
    if (!billData.taxSettings) apiClient.getTaxSettings(restaurantId).then(res => setBillData(d => ({ ...d, taxSettings: res?.taxSettings || res || null }))).catch(() => {});
    if (!billData.menuItems) apiClient.getMenu(restaurantId).then(res => setBillData(d => ({ ...d, menuItems: res?.menuItems || res?.items || [] }))).catch(() => {});
    if (!billData.printSettings) apiClient.getPrintSettings(restaurantId).then(res => { if (res?.success) setBillData(d => ({ ...d, printSettings: res.printSettings })); }).catch(() => {});
  };
  const closeBill = () => { setBillOrder(null); notifyChanged(restaurantId); load(true); };

  const ageLabel = (d) => d <= 0 ? 'Today' : d === 1 ? '1 day' : `${d} days`;
  const placed = (iso) => {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', ...(tz ? { timeZone: tz } : {}) });
  };
  const chip = (id, label, n) => (
    <button key={id} type="button" onClick={() => setView(id)}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${view === id ? 'bg-amber-600 border-amber-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
      {label} <span className={view === id ? 'text-amber-100' : 'text-gray-400'}>{n}</span>
    </button>
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <FaReceipt className="text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Open Orders</h1>
          <p className="text-xs sm:text-sm text-gray-500">Orders placed but never settled (last 90 days). Not counted in sales — settle or cancel them{canDelete ? ' (or delete ones made by mistake)' : ''}.</p>
        </div>
        {restaurants.length > 1 && (
          <select value={restaurantId || ''} onChange={e => { const r = restaurants.find(x => x.id === e.target.value); if (r) setRestaurant(r); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white max-w-[220px]">
            {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        )}
        <button type="button" onClick={() => load(true)} title="Refresh" className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50"><FaSyncAlt size={13} /></button>
      </div>

      {/* Summary */}
      {summary && summary.count > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-semibold uppercase text-amber-700">Open orders</div>
            <div className="text-2xl font-extrabold text-amber-900">{summary.count}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-xs font-semibold uppercase text-amber-700">Unsettled value</div>
            <div className="text-2xl font-extrabold text-amber-900">{formatCurrency(summary.amount || 0)}</div>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 col-span-2 sm:col-span-1">
            <div className="text-xs font-semibold uppercase text-red-700">From earlier days</div>
            <div className="text-2xl font-extrabold text-red-800">{summary.agedCount}{summary.agedCount > 0 ? <span className="text-sm font-semibold"> · {formatCurrency(summary.agedAmount || 0)} · oldest {summary.oldestDays}d</span> : null}</div>
          </div>
        </div>
      )}

      {notice && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-start justify-between gap-3">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="text-emerald-700"><FaTimes size={12} /></button>
        </div>
      )}

      {/* Filters */}
      {!loading && !error && orders.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {chip('aged', 'Earlier days', counts.aged)}
          {chip('today', 'Today', counts.today)}
          {chip('all', 'All', counts.all)}
          <div className="relative ml-auto w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Order #, table, customer, staff, item"
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-amber-400" />
          </div>
        </div>
      )}

      {/* Bulk bar */}
      {selectedOrders.length > 0 && (
        <div className="mt-3 sticky z-10 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 flex flex-wrap items-center gap-2" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
          <span className="text-sm font-semibold text-amber-900">{selectedOrders.length} selected · {formatCurrency(selectedOrders.reduce((s, o) => s + (o.amount || 0), 0))}</span>
          <button type="button" onClick={() => setSelected(new Set())} className="text-xs text-amber-800 underline">Clear</button>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => setConfirm({ kind: 'cancel', orders: selectedOrders })} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-amber-300 text-amber-800 bg-white hover:bg-amber-100"><FaBan size={11} /> Cancel selected</button>
            {canDelete && <button type="button" onClick={() => setConfirm({ kind: 'delete', orders: selectedOrders })} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-red-200 text-red-700 bg-white hover:bg-red-50"><FaTrash size={10} /> Delete selected</button>}
          </div>
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400"><FaSpinner className="animate-spin mr-2" /> Loading open orders…</div>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>
      ) : orders.length === 0 ? (
        <div className="mt-10 text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
            <FaCheck className="text-emerald-500 text-xl" />
          </div>
          <p className="text-gray-800 font-semibold">All clear — no open orders</p>
          <p className="text-gray-400 text-sm mt-1">Every order has been settled or voided.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 text-center py-12 bg-white rounded-2xl border border-gray-100 text-sm text-gray-500">
          {q ? 'No open order matches your search.' : view === 'aged' ? 'Nothing carried over from earlier days.' : 'No open orders from today.'}
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={allOnPage} onChange={togglePage} className="w-4 h-4 accent-amber-600" /> Select all on this page
            </label>
            <span>Showing {(curPage - 1) * PAGE_SIZE + 1}–{Math.min(curPage * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
          </div>
          <div className="mt-2 space-y-3">
            {pageRows.map(o => {
              const isOpen = expanded === o.id;
              return (
                <div key={o.id} className={`rounded-xl border bg-white shadow-sm ${o.aged ? 'border-red-200' : 'border-gray-100'} ${selected.has(o.id) ? 'ring-2 ring-amber-300' : ''}`}>
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} className="mt-1 w-4 h-4 accent-amber-600 flex-shrink-0" aria-label="Select order" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900">#{o.orderNumber ?? '—'}</span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${o.aged ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            <FaClock size={9} /> {ageLabel(o.ageDays)} open
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">{o.status}{o.paymentStatus ? ` · ${o.paymentStatus}` : ''}</span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                          <span>{placed(o.createdAt)}</span>
                          {o.tableNumber && <span className="inline-flex items-center gap-1"><FaChair size={10} /> Table {o.tableNumber}{o.chairNumber ? ` · chair ${o.chairNumber}` : ''}</span>}
                          {o.customerName && <span className="inline-flex items-center gap-1"><FaUser size={10} /> {o.customerName}</span>}
                          {o.orderType && <span className="capitalize">{String(o.orderType).replace(/[_-]+/g, ' ')}</span>}
                          {o.createdBy && <span>by {o.createdBy}</span>}
                        </div>
                        {!isOpen && o.items?.length > 0 && (
                          <div className="mt-1.5 text-xs text-gray-600 truncate">
                            {o.items.map(i => `${i.qty}× ${i.name}`).join(', ')}{o.itemCount > o.items.reduce((s, i) => s + (i.qty || 1), 0) ? ' …' : ''}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-extrabold text-gray-900">{formatCurrency(o.amount || 0)}</div>
                        <div className="text-[11px] text-gray-400">{o.itemCount} item{o.itemCount !== 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    {isOpen && <div className="mt-3 pt-3 border-t border-gray-100"><OrderDetail orderId={o.id} formatCurrency={formatCurrency} tz={tz} /></div>}

                    {/* Actions */}
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                      <button type="button" onClick={() => openBill(o)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
                        <FaCheck size={11} /> Settle (take payment)
                      </button>
                      <button type="button" onClick={() => setConfirm({ kind: 'cancel', orders: [o] })} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100">
                        <FaBan size={11} /> Cancel / void
                      </button>
                      {canDelete && (
                        <button type="button" onClick={() => setConfirm({ kind: 'delete', orders: [o] })} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                          <FaTrash size={10} /> Delete
                        </button>
                      )}
                      <button type="button" onClick={() => setExpanded(isOpen ? null : o.id)} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline">
                        {isOpen ? <>Hide details <FaChevronUp size={10} /></> : <>Full details <FaChevronDown size={10} /></>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
              <button type="button" disabled={curPage <= 1} onClick={() => { setPage(curPage - 1); setExpanded(null); }} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40">‹ Prev</button>
              <span className="text-gray-600">Page {curPage} of {pages}</span>
              <button type="button" disabled={curPage >= pages} onClick={() => { setPage(curPage + 1); setExpanded(null); }} className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white disabled:opacity-40">Next ›</button>
            </div>
          )}
        </>
      )}

      {/* Guidance */}
      {!loading && orders.length > 0 && (
        <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-4 text-xs text-gray-500 leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-gray-600 mb-1"><FaExclamationTriangle className="text-amber-500" /> What to do</div>
          <b>Settle</b> — the customer paid but the bill was never closed: opens the bill, pick how they paid (counts as a sale).
          &nbsp;·&nbsp; <b>Cancel / void</b> — the order was abandoned or the customer left (kept for audit, not a sale).
          {canDelete && <>&nbsp;·&nbsp; <b>Delete</b> — it was created by mistake.</>}
        </div>
      )}

      <ConfirmSheet
        open={!!confirm}
        title={confirm?.kind === 'delete' ? (confirm?.orders.length > 1 ? `Delete ${confirm.orders.length} orders` : 'Delete order') : (confirm?.orders?.length > 1 ? `Cancel ${confirm.orders.length} orders` : 'Cancel order')}
        danger={confirm?.kind === 'delete'}
        body={confirm ? (confirm.orders.length === 1
          ? <>Order <b>#{confirm.orders[0].orderNumber ?? '—'}</b> · {formatCurrency(confirm.orders[0].amount || 0)}{confirm.orders[0].tableNumber ? ` · Table ${confirm.orders[0].tableNumber}` : ''}. {confirm.kind === 'delete' ? 'Use only if it was created by mistake.' : 'Use this if the customer left or the order was abandoned. It will not count as a sale.'}</>
          : <><b>{confirm.orders.length} orders</b> · {formatCurrency(confirm.orders.reduce((s, o) => s + (o.amount || 0), 0))}. {confirm.kind === 'delete' ? 'Use only for orders created by mistake.' : 'They will not count as sales.'}</>) : null}
        confirmLabel={confirm?.kind === 'delete' ? 'Delete' : 'Cancel order'}
        defaultReason={confirm?.kind === 'delete' ? 'Created in error' : 'Abandoned open order'}
        busy={confirmBusy}
        progress={confirmProgress}
        onCancel={() => { if (!confirmBusy) setConfirm(null); }}
        onConfirm={runConfirm}
      />

      {billOrder && restaurant && (
        <TableBillingModal
          open={!!billOrder}
          table={{ id: billOrder.tableId || null, name: billOrder.tableNumber || null, floorId: billOrder.floorId || null, currentOrderId: billOrder.id }}
          title={billOrder.tableNumber ? `Table ${billOrder.tableNumber} — Bill` : `Order #${billOrder.orderNumber ?? ''} — Bill`}
          onClose={closeBill}
          selectedRestaurant={restaurant}
          restaurantName={restaurant?.name || ''}
          taxSettings={billData.taxSettings}
          menuItems={billData.menuItems}
          printSettings={billData.printSettings}
          billingSettings={restaurant?.billingSettings || {}}
          countryCode={restaurant?.countryCode || 'IN'}
          businessType={restaurant?.businessType || 'restaurant'}
          onRefreshTables={() => { notifyChanged(restaurantId); load(true); }}
        />
      )}
    </div>
  );
}

// useSearchParams (?restaurantId) needs a Suspense boundary in the App Router.
export default function OpenOrdersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-24 text-gray-400"><FaSpinner className="animate-spin mr-2" /> Loading open orders…</div>}>
      <OpenOrdersContent />
    </Suspense>
  );
}
