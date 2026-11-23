'use client';

// Order History → Sales Summary → "Groups by day": each day's sales per report group (Food, Drinks, …)
// with month totals, bills per day and an Excel (Groups by day / Monthly / Categories by month).
// Only for restaurants that have set up report groups (Reports → Sales Summary → Category Sales →
// Set up groups); figures come from /api/analytics/:id/category-by-day — the same rules as Category Sales.
import { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../lib/api';

const NONE = '__none__';
const catId = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthLabel = (ym) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
const dayLabel = (d) => `${d.slice(8, 10)} ${MONTHS[Number(d.slice(5, 7)) - 1]} ${d.slice(0, 4)}`;
const weekday = (d) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
const r0 = (v) => Math.round(Number(v) || 0);

// The restaurant's report groups and, when it has any, its category sales per day for the range.
export function useSummaryGroups(restaurantId, startDate, endDate, skip) {
  const [groups, setGroups] = useState({ id: '', list: [] });
  const [state, setState] = useState({ key: '', data: null, loading: false, error: '' });
  const [reloadN, setReloadN] = useState(0); // bumped after the groups are edited

  useEffect(() => {
    if (!restaurantId || skip) { setGroups({ id: '', list: [] }); return undefined; }
    let alive = true;
    apiClient.request(`/api/restaurants/${restaurantId}/report-groups`)
      .then((r) => { if (alive) setGroups({ id: restaurantId, list: Array.isArray(r?.reportGroups) ? r.reportGroups : [] }); })
      .catch(() => { if (alive) setGroups({ id: restaurantId, list: [] }); }); // no groups / not allowed → nothing extra shown
    return () => { alive = false; };
  }, [restaurantId, skip, reloadN]);

  const has = groups.id === restaurantId && groups.list.length > 0;
  useEffect(() => {
    if (!has || !startDate || !endDate) return undefined;
    const key = `${restaurantId}|${startDate}|${endDate}`;
    let alive = true;
    setState({ key, data: null, loading: true, error: '' });
    apiClient.request(`/api/analytics/${restaurantId}/category-by-day?${new URLSearchParams({ startDate, endDate })}`)
      .then((d) => { if (alive) setState({ key, data: d, loading: false, error: '' }); })
      .catch((e) => {
        if (!alive) return;
        const msg = /one year/.test(e?.message || '') ? 'Groups by day works for up to one year — please pick a shorter date range.' : (e?.message || 'Could not load the group sales');
        setState({ key, data: null, loading: false, error: msg });
      });
    return () => { alive = false; };
  }, [has, restaurantId, startDate, endDate, reloadN]);

  // category (name or key, as on the item rows) → group id ('' = not in a group)
  const groupOf = useMemo(() => {
    const m = {};
    (groups.list || []).forEach((g) => (g.categories || []).forEach((c) => { m[catId(c)] = g.id; }));
    (state.data?.categories || []).forEach((c) => {
      if (!c.group) return;
      m[catId(c.key)] = c.group;
      if (c.name) m[catId(c.name)] = c.group;
    });
    return (cat) => m[catId(cat)] || '';
  }, [groups.list, state.data]);

  const reload = useCallback(() => setReloadN((n) => n + 1), []);
  return { groups: has ? groups.list : [], data: state.data, loading: state.loading, error: state.error, groupOf, reload };
}

// Columns, day rows (every day of the range), month totals and grand total
export function buildGroupsByDay(data) {
  if (!data) return null;
  const listed = (data.reportGroups || []).map((g) => ({ id: g.id, name: g.name }));
  const cats = data.categories || [];
  const cols = cats.some((c) => !c.group) ? [...listed, { id: NONE, name: 'Not in a group' }] : listed;
  const groupOfKey = {};
  cats.forEach((c) => { groupOfKey[c.key] = c.group || NONE; });
  const bills = data.bills || null;
  // bill discount + bill total per day (newer servers) → Discount and Net sales columns; Net sales = Order History
  const billTotals = data.billTotals || null;
  const rows = [];
  const months = [];
  const grand = { by: {}, total: 0, bills: 0, discount: 0, net: 0 };
  let month = null;
  for (const d of data.dates || []) {
    const ym = d.slice(0, 7);
    if (!month || month.ym !== ym) { month = { ym, label: monthLabel(ym), by: {}, total: 0, bills: 0, discount: 0, net: 0 }; months.push(month); }
    const by = {};
    let total = 0;
    Object.entries((data.days || {})[d] || {}).forEach(([k, v]) => {
      const g = groupOfKey[k] || NONE;
      const rev = Number(v && v.revenue) || 0;
      by[g] = (by[g] || 0) + rev;
      total += rev;
    });
    const b = bills ? Number(bills[d]) || 0 : null;
    const bt = (billTotals && billTotals[d]) || {};
    const discount = Number(bt.discount) || 0;
    const net = Number(bt.net) || 0;
    rows.push({ day: d, ym, by, total, bills: b, discount, net });
    [month, grand].forEach((t) => {
      Object.entries(by).forEach(([g, v]) => { t.by[g] = (t.by[g] || 0) + v; });
      t.total += total;
      if (b != null) t.bills += b;
      t.discount += discount;
      t.net += net;
    });
  }
  return { cols, rows, months, grand, hasBills: !!bills, hasNet: !!billTotals };
}

// Excel: Groups by day / Monthly / Categories by month (the layout Mwikoo checked)
export async function downloadGroupsByDayExcel(data, fileSuffix) {
  const r = buildGroupsByDay(data);
  if (!r || !r.rows.length) return false;
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();
  const { cols, rows, months, grand, hasBills, hasNet } = r;
  const netHead = hasNet ? ['Discount', 'Net sales'] : [];
  const netCells = (t) => (hasNet ? [r0(t.discount), r0(t.net)] : []);
  const head = ['Date', 'Day', ...cols.map((c) => c.name), 'Total', ...netHead, ...(hasBills ? ['Bills'] : [])];
  const line = (a, b, t) => [a, b, ...cols.map((c) => r0(t.by[c.id])), r0(t.total), ...netCells(t), ...(hasBills ? [t.bills] : [])];
  const aoa = [head];
  months.forEach((m) => {
    rows.filter((x) => x.ym === m.ym).forEach((x) => aoa.push(line(dayLabel(x.day), weekday(x.day), x)));
    aoa.push(line(`${m.label} total`, '', m));
  });
  aoa.push(line('Grand total', '', grand));
  const ws1 = XLSX.utils.aoa_to_sheet(aoa);
  ws1['!cols'] = [{ wch: 16 }, { wch: 6 }, ...cols.map(() => ({ wch: 15 })), { wch: 15 }, ...netHead.map(() => ({ wch: 14 })), { wch: 8 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Groups by day');

  const pct = (v, t) => (t ? `${((v / t) * 100).toFixed(1)}%` : '');
  const aoa2 = [['Month', ...cols.map((c) => c.name), 'Total', ...netHead, ...cols.map((c) => `${c.name} %`)]];
  months.forEach((m) => aoa2.push([m.label, ...cols.map((c) => r0(m.by[c.id])), r0(m.total), ...netCells(m), ...cols.map((c) => pct(m.by[c.id] || 0, m.total))]));
  aoa2.push(['Total', ...cols.map((c) => r0(grand.by[c.id])), r0(grand.total), ...netCells(grand), ...cols.map((c) => pct(grand.by[c.id] || 0, grand.total))]);
  if (hasNet) {
    aoa2.push([]);
    aoa2.push(['Total = item price × qty (before bill discount). Net sales = bill totals after discount — the same as Order History.']);
  }
  const ws2 = XLSX.utils.aoa_to_sheet(aoa2);
  ws2['!cols'] = [{ wch: 12 }, ...cols.map(() => ({ wch: 15 })), { wch: 15 }, ...netHead.map(() => ({ wch: 14 })), ...cols.map(() => ({ wch: 12 }))];
  XLSX.utils.book_append_sheet(wb, ws2, 'Monthly');

  // every category under its group, month by month
  const per = {};
  Object.entries(data.days || {}).forEach(([d, byCat]) => Object.entries(byCat || {}).forEach(([k, v]) => {
    if (!per[k]) per[k] = {};
    per[k][d.slice(0, 7)] = (per[k][d.slice(0, 7)] || 0) + (Number(v && v.revenue) || 0);
  }));
  const aoa3 = [['Group', 'Category', ...months.map((m) => m.label), 'Total']];
  cols.forEach((g) => {
    const cats = (data.categories || []).filter((c) => (c.group || NONE) === g.id && per[c.key])
      .map((c) => ({ name: c.name || c.key, vals: months.map((m) => r0(per[c.key][m.ym])) }))
      .sort((a, b) => b.vals.reduce((s, v) => s + v, 0) - a.vals.reduce((s, v) => s + v, 0));
    if (!cats.length) return;
    cats.forEach((c) => aoa3.push([g.name, c.name, ...c.vals, c.vals.reduce((s, v) => s + v, 0)]));
    const sums = months.map((_, i) => cats.reduce((s, c) => s + c.vals[i], 0));
    aoa3.push([`${g.name} total`, '', ...sums, sums.reduce((s, v) => s + v, 0)]);
  });
  const ws3 = XLSX.utils.aoa_to_sheet(aoa3);
  ws3['!cols'] = [{ wch: 16 }, { wch: 30 }, ...months.map(() => ({ wch: 13 })), { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Categories by month');

  XLSX.writeFile(wb, `sales-by-group-${fileSuffix}.xlsx`);
  return true;
}

export function groupsByDayCsv(data) {
  const r = buildGroupsByDay(data);
  if (!r || !r.rows.length) return null;
  const { cols, rows, months, grand, hasBills, hasNet } = r;
  const out = [['Date', 'Day', ...cols.map((c) => c.name), 'Total', ...(hasNet ? ['Discount', 'Net sales'] : []), ...(hasBills ? ['Bills'] : [])]];
  const line = (a, b, t) => [a, b, ...cols.map((c) => r0(t.by[c.id])), r0(t.total), ...(hasNet ? [r0(t.discount), r0(t.net)] : []), ...(hasBills ? [t.bills] : [])];
  months.forEach((m) => {
    rows.filter((x) => x.ym === m.ym).forEach((x) => out.push(line(x.day, weekday(x.day), x)));
    out.push(line(`${m.label} total`, '', m));
  });
  out.push(line('Grand total', '', grand));
  return out;
}

export function GroupsByDayTable({ data, loading, error, formatCurrency, onEditGroups }) {
  const r = useMemo(() => buildGroupsByDay(data), [data]);
  if (loading || (!data && !error)) return <div className="text-center py-12 text-gray-400 text-sm">Loading sales by group…</div>;
  if (error) return <div className="text-center py-10 px-4 text-sm text-amber-700" data-testid="groups-byday-error">{error}</div>;
  if (!r || !r.rows.length || !r.grand.total) return <div className="text-center py-12 text-gray-400">No sales in this date range.</div>;
  const { cols, rows, months, grand, hasBills, hasNet } = r;
  const ungrouped = (data.categories || []).filter((c) => !c.group).map((c) => c.name || c.key);
  const money = (v) => (v ? formatCurrency(Math.round(v)) : <span className="text-gray-300">0</span>);
  const cells = (t, cls) => (
    <>
      {cols.map((c) => <td key={c.id} className={`px-3 py-2 text-right text-sm whitespace-nowrap ${cls}`}>{money(t.by[c.id])}</td>)}
      <td className={`px-3 py-2 text-right text-sm whitespace-nowrap font-bold ${cls}`}>{money(t.total)}</td>
      {hasNet && <td className={`px-3 py-2 text-right text-sm whitespace-nowrap text-rose-600 ${cls}`}>{t.discount ? <>−{formatCurrency(Math.round(t.discount))}</> : <span className="text-gray-300">0</span>}</td>}
      {hasNet && <td className={`px-3 py-2 text-right text-sm whitespace-nowrap font-bold ${cls}`} data-testid="groups-byday-net">{money(t.net)}</td>}
      {hasBills && <td className={`px-3 py-2 text-center text-sm ${cls}`}>{t.bills}</td>}
    </>
  );
  return (
    <div data-testid="groups-byday">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-start gap-2">
        <p className="flex-1 text-xs text-gray-500" data-testid="groups-byday-help">
          Each day&apos;s sales split by your groups ({cols.filter((c) => c.id !== NONE).map((c) => c.name).join(', ')}). Amount = item price × qty on paid bills, before bill discount, service charge and tax — same as Category Sales.{hasNet && <> <b>Net sales</b> = bill totals after discount — the same figure as Order History.</>} Excel has 3 sheets: Groups by day, Monthly, Categories by month.
          {' '}A new category is <b>not in a group</b> until you add it with <b>Edit groups</b>.
        </p>
        {onEditGroups && (
          <button type="button" onClick={onEditGroups} data-testid="groups-byday-edit"
            className="shrink-0 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            Edit groups
          </button>
        )}
      </div>
      {ungrouped.length > 0 && (
        <p className="px-4 py-2 text-xs text-amber-800 bg-amber-50 border-b border-amber-100" data-testid="groups-byday-ungrouped">
          Not in any group: <b>{ungrouped.join(', ')}</b> — {onEditGroups ? <>tap <b>Edit groups</b> to put {ungrouped.length === 1 ? 'it' : 'them'} in one.</> : 'add them under Reports → Sales Summary → Category Sales → Set up groups.'}
        </p>
      )}
      <div className="overflow-x-auto max-h-[70vh]">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
              <th className="px-3 py-2.5 font-semibold text-left">Date</th>
              {cols.map((c) => <th key={c.id} className="px-3 py-2.5 font-semibold text-right">{c.name}</th>)}
              <th className="px-3 py-2.5 font-semibold text-right">Total</th>
              {hasNet && <th className="px-3 py-2.5 font-semibold text-right">Discount</th>}
              {hasNet && <th className="px-3 py-2.5 font-semibold text-right" title="Bill totals after discount — the same as Order History">Net sales</th>}
              {hasBills && <th className="px-3 py-2.5 font-semibold text-center">Bills</th>}
            </tr>
          </thead>
          {months.map((m) => (
            <tbody key={m.ym} className="divide-y divide-gray-50">
              {rows.filter((x) => x.ym === m.ym).map((x) => (
                <tr key={x.day} className={x.total ? 'hover:bg-gray-50/60' : 'text-gray-400'}>
                  <td className="px-3 py-2 text-sm text-gray-800 whitespace-nowrap">{dayLabel(x.day)} <span className="text-xs text-gray-400">{weekday(x.day)}</span></td>
                  {cells(x, 'text-gray-700')}
                </tr>
              ))}
              <tr className="bg-rose-50/70 border-t border-rose-100" data-testid="groups-byday-month">
                <td className="px-3 py-2 text-sm font-bold text-gray-800 whitespace-nowrap">{m.label} total</td>
                {cells(m, 'font-bold text-gray-800')}
              </tr>
            </tbody>
          ))}
          <tfoot>
            <tr className="bg-gray-50 border-t-2 border-gray-200" data-testid="groups-byday-total">
              <td className="px-3 py-3 text-sm font-bold text-gray-800">Grand total</td>
              {cells(grand, 'font-bold text-emerald-700')}
            </tr>
            <tr className="bg-gray-50 text-xs text-gray-500">
              <td className="px-3 pb-3">Share</td>
              {cols.map((c) => <td key={c.id} className="px-3 pb-3 text-right">{grand.total ? `${(((grand.by[c.id] || 0) / grand.total) * 100).toFixed(1)}%` : ''}</td>)}
              <td className="px-3 pb-3 text-right">100%</td>
              {hasNet && <><td /><td /></>}
              {hasBills && <td />}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export const GROUP_PREFIX = 'grp:';
