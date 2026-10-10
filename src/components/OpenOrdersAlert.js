'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/api';

// Owner / admin Home: open orders CARRIED OVER from earlier days ("forgotten tabs"), across the
// outlets they own. Today's running tables are normal service, so they never trigger it. Hidden
// when nothing is waiting. Tap → Open Orders page for that outlet (settle / cancel / delete).
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
  const go = (rid) => router.push(`/open-orders?restaurantId=${encodeURIComponent(rid)}`);
  const money = (n) => `${currencySymbol || ''}${Math.round(n).toLocaleString()}`;

  return (
    <div style={{ borderRadius: 14, border: '1px solid #fde68a', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', padding: '14px 18px', ...style }}>
      <div onClick={() => go(rows[0].id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>⚠️</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#92400e' }}>
              {total} open order{total !== 1 ? 's' : ''} from earlier days · {money(amount)}
            </div>
            <div style={{ fontSize: 12, color: '#a16207' }}>
              Oldest {oldest} day{oldest !== 1 ? 's' : ''}. Not counted in sales — settle, cancel or delete them.
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#b45309', whiteSpace: 'nowrap' }}>Review →</div>
      </div>
      {rows.length > 1 && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {rows.map(r => (
            <button key={r.id} type="button" onClick={() => go(r.id)}
              style={{ border: '1px solid #fcd34d', background: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: '#92400e', cursor: 'pointer' }}>
              {r.name || 'Outlet'} · {r.agedCount}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
