'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { FaSpinner, FaExclamationTriangle, FaCheck, FaBan, FaTrash, FaClock, FaChair, FaUser, FaReceipt } from 'react-icons/fa';

/**
 * Open Orders — every order that was placed (KOT fired) but never settled or voided, across
 * ALL dates, with age. This is the "unclosed checks" list every POS has. From here staff
 * resolve each hanging order: SETTLE (it was paid → mark completed), CANCEL (abandoned → void),
 * or DELETE (created in error). Open orders never count as sales, so cleaning them up keeps the
 * reports honest and surfaces money that should have been collected.
 */
export default function OpenOrdersPage() {
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  // Resolve the active restaurant (same pattern as the reports pages)
  useEffect(() => {
    (async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(userData.role)) {
          setRestaurantId(userData.restaurantId);
        } else {
          const savedId = localStorage.getItem('selectedRestaurantId');
          if (savedId) setRestaurantId(savedId);
          else {
            const res = await apiClient.getRestaurants();
            const list = res.restaurants || [];
            const resolved = (res.defaultRestaurantId ? list.find(r => r.id === res.defaultRestaurantId) : null) || list[0];
            if (resolved) setRestaurantId(resolved.id);
          }
        }
      } catch (_) { /* ignore */ }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true); setError('');
    try {
      const res = await apiClient.getOpenOrders(restaurantId);
      setOrders(res.openOrders || []);
      setSummary(res.summary || null);
    } catch (e) {
      setError(e?.message || 'Could not load open orders.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  const act = async (order, kind) => {
    const labels = {
      settle: `Mark order #${order.orderNumber ?? ''} as SETTLED (paid & closed)?`,
      cancel: `Cancel/void order #${order.orderNumber ?? ''}? Use this if the order was abandoned.`,
      delete: `Delete order #${order.orderNumber ?? ''} permanently? Use only if it was created by mistake.`,
    };
    if (typeof window !== 'undefined' && !window.confirm(labels[kind])) return;
    let reason = '';
    if (kind === 'cancel' || kind === 'delete') {
      reason = (typeof window !== 'undefined' && window.prompt('Reason (optional):', kind === 'cancel' ? 'Abandoned open tab' : 'Created in error')) || '';
    }
    setBusyId(order.id);
    try {
      if (kind === 'settle') await apiClient.completeOrder(order.id);
      else if (kind === 'cancel') await apiClient.cancelOrder(order.id, reason);
      else if (kind === 'delete') await apiClient.deleteOrder(order.id, reason);
      // optimistic remove, then reconcile
      setOrders(prev => prev.filter(o => o.id !== order.id));
      setSummary(prev => prev ? { ...prev, count: Math.max(0, prev.count - 1), amount: Math.max(0, (prev.amount || 0) - (order.amount || 0)) } : prev);
      try { localStorage.removeItem('openSummary_' + restaurantId); } catch (_) {} // refresh the home indicator
    } catch (e) {
      alert(e?.message || `Could not ${kind} the order.`);
      load();
    } finally {
      setBusyId(null);
    }
  };

  const ageLabel = (d) => d <= 0 ? 'Today' : d === 1 ? '1 day' : `${d} days`;

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
          <FaReceipt className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Open Orders</h1>
          <p className="text-xs sm:text-sm text-gray-500">Orders placed but never settled. Not counted in sales — settle or void them.</p>
        </div>
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
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="text-xs font-semibold uppercase text-red-700">Carried over (older days)</div>
            <div className="text-2xl font-extrabold text-red-800">{summary.agedCount}{summary.oldestDays > 0 ? <span className="text-sm font-semibold"> · oldest {summary.oldestDays}d</span> : null}</div>
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
      ) : (
        <div className="mt-5 space-y-3">
          {orders.map(o => {
            const busy = busyId === o.id;
            return (
              <div key={o.id} className={`rounded-xl border bg-white p-4 shadow-sm ${o.aged ? 'border-red-200' : 'border-gray-100'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Left: identity + items */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">#{o.orderNumber ?? '—'}</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${o.aged ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        <FaClock size={9} /> {ageLabel(o.ageDays)} open
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">{o.status}{o.paymentStatus ? ` · ${o.paymentStatus}` : ''}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      {o.tableNumber && <span className="inline-flex items-center gap-1"><FaChair size={10} /> Table {o.tableNumber}</span>}
                      {o.customerName && <span className="inline-flex items-center gap-1"><FaUser size={10} /> {o.customerName}</span>}
                      {o.orderType && <span className="capitalize">{String(o.orderType).replace(/[_-]+/g, ' ')}</span>}
                      {o.createdBy && <span>by {o.createdBy}</span>}
                    </div>
                    {o.items?.length > 0 && (
                      <div className="mt-1.5 text-xs text-gray-600 truncate">
                        {o.items.map(i => `${i.qty}× ${i.name}`).join(', ')}{o.itemCount > o.items.length ? ' …' : ''}
                      </div>
                    )}
                  </div>
                  {/* Right: amount */}
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-gray-900">{formatCurrency(o.amount || 0)}</div>
                    <div className="text-[11px] text-gray-400">{o.itemCount} item{o.itemCount !== 1 ? 's' : ''}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                  <button disabled={busy} onClick={() => act(o, 'settle')} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                    {busy ? <FaSpinner className="animate-spin" size={11} /> : <FaCheck size={11} />} Settle (paid)
                  </button>
                  <button disabled={busy} onClick={() => act(o, 'cancel')} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 disabled:opacity-50">
                    <FaBan size={11} /> Cancel / void
                  </button>
                  <button disabled={busy} onClick={() => act(o, 'delete')} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                    <FaTrash size={10} /> Delete
                  </button>
                  {o.tableNumber && (
                    <button disabled={busy} onClick={() => router.push('/tables')} className="ml-auto text-xs font-semibold text-blue-600 hover:underline">Open on floor →</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guidance */}
      {!loading && orders.length > 0 && (
        <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-4 text-xs text-gray-500 leading-relaxed">
          <div className="flex items-center gap-2 font-semibold text-gray-600 mb-1"><FaExclamationTriangle className="text-amber-500" /> What to do</div>
          <b>Settle</b> — the customer paid but the bill was never closed (marks it a completed sale).
          &nbsp;·&nbsp; <b>Cancel / void</b> — the order was abandoned or the customer left (keeps an audit trail, not a sale).
          &nbsp;·&nbsp; <b>Delete</b> — it was created by mistake. Resolving these keeps your sales reports accurate.
        </div>
      )}
    </div>
  );
}
