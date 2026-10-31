'use client';

// Sales Summary → Comparison: what each item / category / group sold per month, week or day across
// the chosen range — Qty and Amount side by side per period, with totals (and Group → Category →
// Item subtotals, Tally-style). Excel in the same layout. Figures: /api/analytics/:id/sales-comparison
// (same rules as Category Sales: completed / paid bills, price × qty, the restaurant's calendar day).

import { useEffect, useMemo, useState } from 'react';
import apiClient from '../lib/api';
import { FaFileExcel, FaSpinner, FaSearch } from 'react-icons/fa';

const NONE = '__none';
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const fmtQty = (n) => { const v = r2(n); return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''); };

export default function SalesComparisonReport({ restaurantId, startDate, endDate, subRestaurantId, formatCurrency }) {
  const [kind, setKind] = useState('sales');      // sales | stock (purchased vs used)
  const [by, setBy] = useState('month');          // month | week | day
  const [rowsBy, setRowsBy] = useState('items');  // items | categories | groups
  const [groupF, setGroupF] = useState('');       // '' = all, group id or NONE
  const [catF, setCatF] = useState('');           // '' = all, category key
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const money = formatCurrency || ((v) => r2(v).toFixed(2));

  // a long range can't be shown day by day — fall back to week
  const days = startDate && endDate ? Math.round((new Date(`${endDate}T12:00:00Z`) - new Date(`${startDate}T12:00:00Z`)) / 86400000) + 1 : 0;
  const dayTooLong = days > 62;
  useEffect(() => { if (by === 'day' && dayTooLong) setBy('week'); }, [by, dayTooLong]);

  useEffect(() => {
    if (kind !== 'sales' || !restaurantId || !startDate || !endDate || (by === 'day' && dayTooLong)) return;
    let alive = true;
    setLoading(true); setErr('');
    const qs = new URLSearchParams({ startDate, endDate, by, ...(subRestaurantId ? { subRestaurantId } : {}) });
    apiClient.request(`/api/analytics/${restaurantId}/sales-comparison?${qs}`)
      .then((r) => { if (alive) setData(r); })
      .catch((e) => { if (alive) { setData(null); setErr(e?.message || 'Could not load'); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [restaurantId, startDate, endDate, subRestaurantId, by, dayTooLong, kind]);

  const periods = data?.periods || [];
  const catByKey = useMemo(() => Object.fromEntries((data?.categories || []).map((c) => [c.key, c])), [data]);
  const groups = useMemo(() => {
    const g = (data?.reportGroups || []).map((x) => ({ id: x.id, name: x.name }));
    const anyNone = (data?.categories || []).some((c) => !c.group);
    return anyNone && g.length ? [...g, { id: NONE, name: 'Not in a group' }] : g;
  }, [data]);
  const groupName = (id) => groups.find((g) => g.id === id)?.name || 'Not in a group';
  const hasGroups = groups.some((g) => g.id !== NONE);

  // rows after the filters, at item level
  const items = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (data?.items || []).filter((it) => {
      const c = catByKey[it.cat];
      if (groupF && (c?.group || NONE) !== groupF) return false;
      if (catF && it.cat !== catF) return false;
      if (t && !`${it.name} ${it.size || ''} ${c?.name || ''}`.toLowerCase().includes(t)) return false;
      return true;
    });
  }, [data, catByKey, groupF, catF, q]);

  const sumInto = (acc, it) => {
    for (const p of periods) {
      acc.qty[p.key] = r2((acc.qty[p.key] || 0) + (it.qty[p.key] || 0));
      acc.amount[p.key] = r2((acc.amount[p.key] || 0) + (it.amount[p.key] || 0));
    }
    acc.totalQty = r2(acc.totalQty + it.totalQty);
    acc.totalAmount = r2(acc.totalAmount + it.totalAmount);
    return acc;
  };
  const blank = (extra) => ({ qty: {}, amount: {}, totalQty: 0, totalAmount: 0, ...extra });

  // display rows: { kind: 'group' | 'cat' | 'item' | 'total', label, ...figures }
  const rows = useMemo(() => {
    const catName = (k) => catByKey[k]?.name || k;
    const gOf = (it) => catByKey[it.cat]?.group || NONE;
    const out = [];
    if (rowsBy === 'groups') {
      const m = new Map();
      items.forEach((it) => { const g = gOf(it); if (!m.has(g)) m.set(g, blank({ kind: 'item', label: hasGroups ? groupName(g) : 'All categories' })); sumInto(m.get(g), it); });
      out.push(...[...m.values()].sort((a, b) => b.totalAmount - a.totalAmount));
    } else if (rowsBy === 'categories') {
      const m = new Map();
      items.forEach((it) => { if (!m.has(it.cat)) m.set(it.cat, blank({ kind: 'item', label: catName(it.cat), sub: hasGroups ? groupName(gOf(it)) : '' })); sumInto(m.get(it.cat), it); });
      out.push(...[...m.values()].sort((a, b) => b.totalAmount - a.totalAmount));
    } else {
      // Group → Category → Item, each level with its subtotal, biggest first
      const tree = new Map();
      items.forEach((it) => {
        const g = hasGroups ? gOf(it) : '';
        if (!tree.has(g)) tree.set(g, { tot: blank({ kind: 'group', label: hasGroups ? groupName(g) : '' }), cats: new Map() });
        const gn = tree.get(g); sumInto(gn.tot, it);
        if (!gn.cats.has(it.cat)) gn.cats.set(it.cat, { tot: blank({ kind: 'cat', label: catName(it.cat) }), items: [] });
        const cn = gn.cats.get(it.cat); sumInto(cn.tot, it); cn.items.push(it);
      });
      [...tree.values()].sort((a, b) => b.tot.totalAmount - a.tot.totalAmount).forEach((gn) => {
        if (hasGroups) out.push(gn.tot);
        [...gn.cats.values()].sort((a, b) => b.tot.totalAmount - a.tot.totalAmount).forEach((cn) => {
          out.push(cn.tot);
          cn.items.sort((a, b) => b.totalAmount - a.totalAmount).forEach((it) => out.push({ ...it, kind: 'item', label: it.size ? `${it.name} · ${it.size}` : it.name }));
        });
      });
    }
    return out;
  }, [items, rowsBy, catByKey, hasGroups]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = useMemo(() => items.reduce((acc, it) => sumInto(acc, it), blank({ kind: 'total', label: 'Total' })), [items, periods]); // eslint-disable-line react-hooks/exhaustive-deps

  const catOptions = useMemo(() => (data?.categories || [])
    .filter((c) => !groupF || (c.group || NONE) === groupF)
    .sort((a, b) => a.name.localeCompare(b.name)), [data, groupF]);

  const downloadExcel = async () => {
    const XLSX = await import('xlsx');
    const head1 = [''];
    const head2 = [rowsBy === 'groups' ? 'Group' : rowsBy === 'categories' ? 'Category' : 'Item Name'];
    periods.forEach((p) => { head1.push(p.label, ''); head2.push('Qty Sold', 'Amount'); });
    head1.push('Total', ''); head2.push('Qty Sold', 'Amount');
    if (rowsBy === 'items') head2.push('Category', ...(hasGroups ? ['Group'] : []));
    const line = (r) => [r.label, ...periods.flatMap((p) => [r2(r.qty[p.key] || 0), r2(r.amount[p.key] || 0)]), r2(r.totalQty), r2(r.totalAmount)];
    const aoa = [head1, head2];
    rows.forEach((r) => {
      const row = line(r);
      if (rowsBy === 'items') {
        if (r.kind === 'item') { const c = catByKey[r.cat]; row.push(c?.name || r.cat, ...(hasGroups ? [groupName(c?.group || NONE)] : [])); }
        else row[0] = r.kind === 'group' ? `${r.label} (group total)` : `${r.label} (category total)`;
      }
      aoa.push(row);
    });
    aoa.push([], line(total));
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges'] = [...periods.map((_, i) => ({ s: { r: 0, c: 1 + i * 2 }, e: { r: 0, c: 2 + i * 2 } })), { s: { r: 0, c: 1 + periods.length * 2 }, e: { r: 0, c: 2 + periods.length * 2 } }];
    ws['!cols'] = [{ wch: 34 }, ...periods.flatMap(() => [{ wch: 10 }, { wch: 14 }]), { wch: 10 }, { wch: 14 }, { wch: 22 }, { wch: 16 }];
    for (let R = 2; R < aoa.length; R++) for (let C = 1; C <= periods.length * 2 + 2; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell && typeof cell.v === 'number') cell.z = C % 2 === 0 ? '#,##0.00' : '#,##0.##';
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales comparison');
    XLSX.writeFile(wb, `sales-comparison-${by}-${startDate}-to-${endDate}.xlsx`);
  };

  const seg = (opts, val, set, testId) => (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold" data-testid={testId}>
      {opts.map(([k, t, disabled]) => (
        <button key={k} disabled={disabled} title={disabled ? 'Up to 62 days — pick Week or Month' : undefined} onClick={() => set(k)}
          className={`px-3 py-1.5 ${val === k ? 'bg-emerald-600 text-white' : disabled ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{t}</button>
      ))}
    </div>
  );
  const rowStyle = (k) => k === 'group' ? 'bg-emerald-50 font-bold text-gray-900' : k === 'cat' ? 'bg-gray-50 font-semibold text-gray-800' : k === 'total' ? 'bg-gray-100 font-bold text-gray-900' : 'text-gray-700';

  return (
    <div data-testid="sales-comparison">
      <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3">
        {seg([['sales', 'Sales'], ['stock', 'Stock: purchased vs used']], kind, setKind, 'cmp-kind')}
        {seg([['month', 'Month'], ['week', 'Week'], ['day', 'Day', dayTooLong]], by, setBy, 'cmp-by')}
        {kind === 'sales' && seg([['items', 'Items'], ['categories', 'Categories'], ['groups', 'Groups']], rowsBy, setRowsBy, 'cmp-rows')}
        {kind === 'sales' && hasGroups && (
          <select value={groupF} onChange={(e) => { setGroupF(e.target.value); setCatF(''); }} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs" data-testid="cmp-group">
            <option value="">All groups</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        )}
        {kind === 'sales' && rowsBy === 'items' && (
          <select value={catF} onChange={(e) => setCatF(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs max-w-[200px]" data-testid="cmp-cat">
            <option value="">All categories</option>
            {catOptions.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
          </select>
        )}
        {(kind === 'stock' || rowsBy === 'items') && (
          <div className="relative">
            <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search item…" className="border border-gray-200 rounded-lg pl-7 pr-2 py-1.5 text-xs w-40" />
          </div>
        )}
        {kind === 'sales' && <button onClick={downloadExcel} disabled={!rows.length} data-testid="cmp-excel"
          className="ml-auto flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
          <FaFileExcel className="text-xs" /> Download Excel
        </button>}
      </div>
      {kind === 'stock' ? (
        <StockMovement restaurantId={restaurantId} startDate={startDate} endDate={endDate} by={by} dayTooLong={dayTooLong} q={q} />
      ) : <>
      {!hasGroups && data && (
        <div className="px-4 py-2 text-xs text-gray-500 bg-amber-50 border-b border-amber-100">
          Tip: set up groups (e.g. Food / Drinks) in Category Sales → Groups to see group totals here.
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-gray-400"><FaSpinner className="animate-spin inline mr-2" />Loading…</div>
      ) : err ? (
        <div className="p-6 text-center text-red-600 text-sm">{err}</div>
      ) : !rows.length ? (
        <div className="p-10 text-center text-gray-400 text-sm">No sales in this range</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="cmp-table">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th rowSpan={2} className="px-3 py-2 text-left font-semibold sticky left-0 bg-gray-50 min-w-[200px]">{rowsBy === 'groups' ? 'Group' : rowsBy === 'categories' ? 'Category' : 'Item'}</th>
                {periods.map((p) => <th key={p.key} colSpan={2} className="px-3 pt-2 text-center font-semibold border-l border-gray-200 whitespace-nowrap normal-case text-gray-700">{p.label}</th>)}
                <th colSpan={2} className="px-3 pt-2 text-center font-semibold border-l border-gray-200">Total</th>
              </tr>
              <tr className="bg-gray-50 text-[11px] text-gray-500">
                {[...periods, { key: '__t' }].map((p) => [
                  <th key={`${p.key}q`} className="px-3 pb-2 text-right font-medium border-l border-gray-200">Qty</th>,
                  <th key={`${p.key}a`} className="px-3 pb-2 text-right font-medium">Amount</th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {[...rows, total].map((r, i) => (
                <tr key={`${r.kind}-${r.key || r.label}-${i}`} className={`border-t border-gray-100 ${rowStyle(r.kind)}`} data-kind={r.kind}>
                  <td className={`px-3 py-2 sticky left-0 ${r.kind === 'group' ? 'bg-emerald-50' : r.kind === 'cat' || r.kind === 'total' ? 'bg-gray-50' : 'bg-white'} ${r.kind === 'item' && rowsBy === 'items' ? 'pl-7' : ''}`}>
                    {r.label}{r.sub ? <span className="text-[11px] text-gray-400 ml-1.5">{r.sub}</span> : null}
                  </td>
                  {periods.map((p) => [
                    <td key={`${p.key}q`} className="px-3 py-2 text-right border-l border-gray-100 tabular-nums">{r.qty[p.key] ? fmtQty(r.qty[p.key]) : <span className="text-gray-300">0</span>}</td>,
                    <td key={`${p.key}a`} className="px-3 py-2 text-right tabular-nums whitespace-nowrap">{r.amount[p.key] ? money(r.amount[p.key]) : <span className="text-gray-300">–</span>}</td>,
                  ])}
                  <td className="px-3 py-2 text-right border-l border-gray-100 tabular-nums font-semibold">{fmtQty(r.totalQty)}</td>
                  <td className="px-3 py-2 text-right tabular-nums font-semibold whitespace-nowrap">{money(r.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </>}
    </div>
  );
}

// Stock: purchased vs used — per stock item (beer bottles, spirits…): opening stock, what came in
// (purchases / receipts) and what went out through sales per period, closing stock, and how much of
// what was bought has sold. From the stock ledger; /api/analytics/:id/stock-movement.
function StockMovement({ restaurantId, startDate, endDate, by, dayTooLong, q }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [onlyMoved, setOnlyMoved] = useState(true);
  useEffect(() => {
    if (!restaurantId || !startDate || !endDate || (by === 'day' && dayTooLong)) return;
    let alive = true;
    setLoading(true); setErr('');
    apiClient.request(`/api/analytics/${restaurantId}/stock-movement?${new URLSearchParams({ startDate, endDate, by })}`)
      .then((r) => { if (alive) setData(r); })
      .catch((e) => { if (alive) { setData(null); setErr(e?.message || 'Could not load'); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [restaurantId, startDate, endDate, by, dayTooLong]);
  const periods = data?.periods || [];
  const rows = useMemo(() => {
    const t = (q || '').trim().toLowerCase();
    return (data?.items || []).filter((it) => (!t || `${it.name} ${it.category}`.toLowerCase().includes(t))
      && (!onlyMoved || it.totalReceived || it.totalSold || it.totalOther));
  }, [data, q, onlyMoved]);
  const pct = (it) => (it.totalReceived > 0 ? Math.round((it.totalSold / it.totalReceived) * 100) : null);
  const num = (v) => (v ? fmtQty(v) : <span className="text-gray-300">0</span>);

  const downloadExcel = async () => {
    const XLSX = await import('xlsx');
    const head1 = ['', '', ''];
    const head2 = ['Stock item', 'Unit', 'Opening'];
    periods.forEach((p) => { head1.push(p.label, ''); head2.push('Received', 'Used by sales'); });
    head1.push('Total', '', '', '', '');
    head2.push('Received', 'Used by sales', 'Other (counts / waste)', 'Closing', 'Used ÷ received %');
    const aoa = [head1, head2, ...rows.map((it) => [it.name, it.unit, it.opening ?? '', ...periods.flatMap((p) => [it.received[p.key] || 0, it.sold[p.key] || 0]),
      it.totalReceived, it.totalSold, it.totalOther, it.closing ?? '', pct(it) ?? ''])];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!merges'] = periods.map((_, i) => ({ s: { r: 0, c: 3 + i * 2 }, e: { r: 0, c: 4 + i * 2 } }));
    ws['!cols'] = [{ wch: 32 }, { wch: 8 }, { wch: 10 }, ...periods.flatMap(() => [{ wch: 10 }, { wch: 13 }]), { wch: 10 }, { wch: 13 }, { wch: 18 }, { wch: 10 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock purchased vs used');
    XLSX.writeFile(wb, `stock-purchased-vs-used-${by}-${startDate}-to-${endDate}.xlsx`);
  };

  if (loading) return <div className="p-10 text-center text-gray-400"><FaSpinner className="animate-spin inline mr-2" />Loading…</div>;
  if (err) return <div className="p-6 text-center text-red-600 text-sm">{err}</div>;
  return (
    <div data-testid="stock-movement">
      <div className="px-4 py-2 flex flex-wrap items-center gap-3 border-b border-gray-100 text-xs text-gray-600">
        <label className="flex items-center gap-1.5"><input type="checkbox" checked={onlyMoved} onChange={(e) => setOnlyMoved(e.target.checked)} /> Only items with movement</label>
        <span className="text-gray-400">Received = purchases / goods received (less returns). Used = sold through bills. Stock records start when stock was set up.</span>
        <button onClick={downloadExcel} disabled={!rows.length} data-testid="stock-excel"
          className="ml-auto flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
          <FaFileExcel className="text-xs" /> Download Excel
        </button>
      </div>
      {!rows.length ? <div className="p-10 text-center text-gray-400 text-sm">No stock movement in this range</div> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="stock-table">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th rowSpan={2} className="px-3 py-2 text-left font-semibold sticky left-0 bg-gray-50 min-w-[200px]">Stock item</th>
                <th rowSpan={2} className="px-3 py-2 text-right font-semibold">Opening</th>
                {periods.map((p) => <th key={p.key} colSpan={2} className="px-3 pt-2 text-center font-semibold border-l border-gray-200 whitespace-nowrap normal-case text-gray-700">{p.label}</th>)}
                <th rowSpan={2} className="px-3 py-2 text-right font-semibold border-l border-gray-200">Closing</th>
                <th rowSpan={2} className="px-3 py-2 text-right font-semibold">Sold of bought</th>
              </tr>
              <tr className="bg-gray-50 text-[11px] text-gray-500">
                {periods.map((p) => [
                  <th key={`${p.key}r`} className="px-3 pb-2 text-right font-medium border-l border-gray-200">In</th>,
                  <th key={`${p.key}s`} className="px-3 pb-2 text-right font-medium">Used</th>,
                ])}
              </tr>
            </thead>
            <tbody>
              {rows.map((it) => {
                const p = pct(it);
                const slow = it.totalReceived > 0 && it.totalSold === 0;
                return (
                  <tr key={it.id} className="border-t border-gray-100 text-gray-700">
                    <td className="px-3 py-2 sticky left-0 bg-white">
                      {it.name}<span className="text-[11px] text-gray-400 ml-1.5">{it.unit}</span>
                      {slow && <span className="ml-2 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">not moving</span>}
                      {it.oversold > 0 && <span className="ml-2 text-[10px] text-red-600" title="Sold more than the stock showed">oversold {fmtQty(it.oversold)}</span>}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{it.opening == null ? '–' : fmtQty(it.opening)}</td>
                    {periods.map((pp) => [
                      <td key={`${pp.key}r`} className="px-3 py-2 text-right border-l border-gray-100 tabular-nums text-emerald-700">{num(it.received[pp.key])}</td>,
                      <td key={`${pp.key}s`} className="px-3 py-2 text-right tabular-nums">{num(it.sold[pp.key])}</td>,
                    ])}
                    <td className="px-3 py-2 text-right border-l border-gray-100 tabular-nums font-semibold">{it.closing == null ? '–' : fmtQty(it.closing)}</td>
                    <td className={`px-3 py-2 text-right tabular-nums font-semibold ${p == null ? 'text-gray-300' : p < 50 ? 'text-amber-700' : 'text-gray-900'}`}>{p == null ? '–' : `${p}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
