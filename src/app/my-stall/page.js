'use client';

// Food court stall owner login (staff role `stall_owner`, created from More → Food Court): their own
// stall's sales, commission and payout — nothing else. No sidebar, no other pages; the server only
// lets this login call /api/food-court/me* (backend utils/foodCourt.js).
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt, FaStore, FaSpinner } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { performLogout } from '../../lib/logout';
import { restaurantToday, ymd } from '../../lib/restaurantTime';

const PERIODS = [
  { id: 'today', label: 'Today' }, { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'Last 7 days' }, { id: 'month', label: 'This month' }, { id: 'lastmonth', label: 'Last month' },
];

function rangeFor(period) {
  const t = restaurantToday();
  const shift = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  if (period === 'yesterday') { const y = shift(t, -1); return [ymd(y), ymd(y)]; }
  if (period === 'week') return [ymd(shift(t, -6)), ymd(t)];
  if (period === 'month') return [ymd(new Date(t.getFullYear(), t.getMonth(), 1, 12)), ymd(t)];
  if (period === 'lastmonth') return [ymd(new Date(t.getFullYear(), t.getMonth() - 1, 1, 12)), ymd(new Date(t.getFullYear(), t.getMonth(), 0, 12))];
  return [ymd(t), ymd(t)];
}

function moneyFormatter(currency) {
  const c = String(currency || '').trim();
  if (/^[A-Z]{3}$/.test(c)) {
    try { const f = new Intl.NumberFormat(undefined, { style: 'currency', currency: c, maximumFractionDigits: 2 }); return (n) => f.format(Number(n) || 0); } catch { /* fall through */ }
  }
  const sym = c || '₹';
  return (n) => `${sym}${(Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function MyStallPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }
    if (!localStorage.getItem('authToken') || !user) { router.replace('/login'); return; }
    if (String(user.role || '').toLowerCase() !== 'stall_owner') { router.replace('/home'); return; }
    apiClient.getMyStall()
      .then((r) => setMe(r))
      .catch((e) => setMe({ error: e?.message || 'This login is not active.' }));
  }, [router]);

  const [startDate, endDate] = rangeFor(period);
  const load = useCallback(() => {
    if (!me || me.error) return;
    setLoading(true);
    apiClient.getMyStallReport(startDate, endDate)
      .then(setData)
      .catch((e) => setData({ error: e?.message || 'Could not load your sales' }))
      .finally(() => setLoading(false));
  }, [me, startDate, endDate]);
  useEffect(() => { load(); }, [load]);

  const logout = () => { apiClient.clearToken(); performLogout(); };

  if (!me) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  if (me.error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-lg font-bold text-red-700">{me.error}</div>
        <button onClick={logout} className="px-4 py-2 rounded-lg bg-gray-900 text-white font-semibold">Log out</button>
      </div>
    );
  }

  const money = moneyFormatter(me.currency);
  const s = data && !data.error ? data.stall : null;
  const kpis = s ? [
    ['Orders', s.orders], ['Items sold', s.qty], ['Net sales', money(s.netSales)],
    [`Commission (${s.commissionPct}%)`, money(s.commission)], ['Payable to you', money(s.payable)],
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <FaStore className="text-amber-600" size={20} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 truncate">{me.stall.name}</div>
          <div className="text-xs text-gray-500 truncate">{me.restaurantName}{me.name ? ` · ${me.name}` : ''}</div>
        </div>
        <button onClick={logout} className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm flex items-center gap-2"><FaSignOutAlt /> Log out</button>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {PERIODS.map((p) => (
            <button key={p.id} onClick={() => setPeriod(p.id)} className={`px-3 py-1.5 rounded-lg text-sm ${period === p.id ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>{p.label}</button>
          ))}
        </div>

        {loading || !data ? (
          <div className="p-6 text-gray-500 flex items-center gap-2"><FaSpinner className="animate-spin" /> Loading…</div>
        ) : data.error ? (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{data.error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {kpis.map(([label, value], i) => (
                <div key={label} className={`rounded-xl p-3 border ${i === 4 ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                  <div className="text-xs text-gray-500">{label}</div>
                  <div className={`text-lg font-bold ${i === 4 ? 'text-green-700' : 'text-gray-900'}`}>{value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 mb-4 overflow-x-auto">
              <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">By day</div>
              {data.days.length === 0 ? <div className="p-4 text-sm text-gray-500">No sales in this period.</div> : (
                <table className="w-full text-sm">
                  <thead className="text-gray-500"><tr>{['Day', 'Orders', 'Items', 'Item sales', 'Discount', 'Net sales', 'Commission', 'Payable'].map((h, i) => <th key={h} className={`px-3 py-2 font-medium ${i ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
                  <tbody>
                    {data.days.map((d) => (
                      <tr key={d.day} className="border-t border-gray-100">
                        <td className="px-3 py-2">{d.day}</td>
                        <td className="px-3 py-2 text-right">{d.orders}</td>
                        <td className="px-3 py-2 text-right">{d.qty}</td>
                        <td className="px-3 py-2 text-right">{money(d.itemSales)}</td>
                        <td className="px-3 py-2 text-right text-red-600">{d.discount ? `−${money(d.discount)}` : '—'}</td>
                        <td className="px-3 py-2 text-right font-semibold">{money(d.netSales)}</td>
                        <td className="px-3 py-2 text-right">{money(d.commission)}</td>
                        <td className="px-3 py-2 text-right font-bold text-green-700">{money(d.payable)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">Items sold</div>
              {data.topItems.length === 0 ? <div className="p-4 text-sm text-gray-500">No items sold in this period.</div> : (
                <table className="w-full text-sm">
                  <thead className="text-gray-500"><tr><th className="px-3 py-2 text-left font-medium">Item</th><th className="px-3 py-2 text-right font-medium">Qty</th><th className="px-3 py-2 text-right font-medium">Item sales</th></tr></thead>
                  <tbody>
                    {data.topItems.map((t) => (
                      <tr key={t.name} className="border-t border-gray-100"><td className="px-3 py-2">{t.name}</td><td className="px-3 py-2 text-right">{t.qty}</td><td className="px-3 py-2 text-right">{money(t.itemSales)}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3">Billed orders only. Discounts on a bill are shared over its items by value. Payable = net sales − commission.</p>
          </>
        )}
      </div>
    </div>
  );
}
