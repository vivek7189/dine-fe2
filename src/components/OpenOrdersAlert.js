'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/api';
import { FaHourglassHalf } from 'react-icons/fa';

// Owner / admin Home: a small chip for open orders CARRIED OVER from earlier days ("forgotten
// tabs"), across the outlets they own. Today's running tables are normal service, so they never
// trigger it. Hidden when nothing is waiting. Tap → Open Orders page (settle / cancel / delete).
const MAX_OUTLETS = 30;

async function summaryFor(rid) {
  const cacheKey = 'openSummary_' + rid;
  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cached && Date.now() - cached.t < 60 * 1000) return cached.s;
  } catch (_) {}
  const res = await apiClient.getOpenOrders(rid);
  const s = res?.summary || null;
  if (s) { try { localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), s })); } catch (_) {} }
  return s;
}

export default function OpenOrdersAlert({ style, currencySymbol = '' }) {
  const router = useRouter();
  const [rows, setRows] = useState([]); // [{ id, name, agedCount, agedAmount, oldestDays }]

  const load = useCallback(async () => {
    try {
      const res = await apiClient.getRestaurants();
      let list = (res?.restaurants || []).slice(0, MAX_OUTLETS);
      if (!list.length) {
        const rid = localStorage.getItem('selectedRestaurantId');
        if (rid) list = [{ id: rid, name: '' }];
      }
      const out = await Promise.all(list.map(async r => {
        try {
          const s = await summaryFor(r.id);
          return s && s.agedCount > 0 ? { id: r.id, name: r.name || '', agedCount: s.agedCount, agedAmount: s.agedAmount || 0, oldestDays: s.oldestDays || 0 } : null;
        } catch (_) { return null; }
      }));
      setRows(out.filter(Boolean).sort((a, b) => b.agedCount - a.agedCount));
    } catch (_) { /* non-blocking */ }
  }, []);

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener('open-orders-changed', onChange);
    return () => window.removeEventListener('open-orders-changed', onChange);
  }, [load]);

  if (!rows.length) return null;
  const total = rows.reduce((s, r) => s + r.agedCount, 0);
  const amount = rows.reduce((s, r) => s + r.agedAmount, 0);
  const oldest = Math.max(...rows.map(r => r.oldestDays));
  const money = (n) => `${currencySymbol || ''}${Math.round(n).toLocaleString()}`;
  const tip = `${total} open order${total !== 1 ? 's' : ''} from earlier days (oldest ${oldest} day${oldest !== 1 ? 's' : ''}) — not counted in sales.`
    + (rows.length > 1 ? '\n' + rows.map(r => `${r.name || 'Outlet'}: ${r.agedCount}`).join('\n') : '');

  // Small pill (sits next to the festival chip). Opens the outlet with the most waiting;
  // the Open Orders page has an outlet picker for the rest.
  return (
    <button type="button" className="animate-in" title={tip}
      onClick={() => router.push(`/open-orders?restaurantId=${encodeURIComponent(rows[0].id)}`)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '100%', padding: '6px 12px', borderRadius: 999,
        border: '1px solid #fcd34d', background: '#fffbeb', color: '#92400e', fontSize: 13, cursor: 'pointer', textAlign: 'left', ...style }}>
      <FaHourglassHalf color="#d97706" style={{ flexShrink: 0 }} />
      <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{total} open order{total !== 1 ? 's' : ''}</span>
      <span style={{ fontWeight: 600, color: '#b45309', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>· {money(amount)} · from earlier days</span>
      <span style={{ color: '#b45309', flexShrink: 0 }}>→</span>
    </button>
  );
}
