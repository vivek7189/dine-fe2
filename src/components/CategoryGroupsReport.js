'use client';

// Sales Summary → Category Sales: "Groups" (Food / Drinks … totals) and "By day" (one row per date).
// Groups are a report-only setting (restaurant.reportGroups) — the menu and POS never change.
// Figures come from /api/analytics/:id/category-by-day: the same rules as the category table
// (completed / paid bills, item price × qty, the restaurant's calendar day).

import { useEffect, useMemo, useState } from 'react';
import apiClient from '../lib/api';
import { FaFileExcel, FaSpinner, FaTimes, FaPlus, FaLayerGroup } from 'react-icons/fa';

const NONE = '__none';
const fmtDay = (d) => { try { return new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', weekday: 'short' }); } catch (_) { return d; } };

export default function CategoryGroupsReport({ restaurantId, startDate, endDate, subRestaurantId, mode, formatCurrency }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [cols, setCols] = useState('groups');   // By day columns: groups | categories
  const [setup, setSetup] = useState(false);
  const [reload, setReload] = useState(0);
  const [pick, setPick] = useState('');          // By day: one category → its dishes as columns
  const [itemRows, setItemRows] = useState(null); // dishes per day (loaded when needed)

  const qsFor = (extra) => new URLSearchParams({ startDate, endDate, ...(subRestaurantId ? { subRestaurantId } : {}), ...(extra || {}) });
  const loadItems = async () => {
    if (itemRows) return itemRows;
    const r = await apiClient.request(`/api/analytics/${restaurantId}/category-by-day?${qsFor({ items: '1' })}`);
    setItemRows(r?.items || []);
    return r?.items || [];
  };
  useEffect(() => { setItemRows(null); }, [restaurantId, startDate, endDate, subRestaurantId, reload]);
  useEffect(() => { if (pick && mode === 'byday' && !itemRows) loadItems().catch((e) => setErr(e?.message || 'Could not load dishes')); }, [pick, mode, itemRows]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!restaurantId || !startDate || !endDate) return;
    let alive = true;
    setLoading(true); setErr('');
    apiClient.request(`/api/analytics/${restaurantId}/category-by-day?${qsFor()}`)
      .then((r) => { if (alive) setData(r); })
      .catch((e) => { if (alive) { setData(null); setErr(e?.message || 'Could not load'); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [restaurantId, startDate, endDate, subRestaurantId, reload]); // eslint-disable-line react-hooks/exhaustive-deps

  const groups = useMemo(() => {
    const g = (data?.reportGroups || []).map((x) => ({ id: x.id, name: x.name }));
    const anyNone = (data?.categories || []).some((c) => !c.group);
    return anyNone ? [...g, { id: NONE, name: g.length ? 'Not in a group' : 'All categories' }] : g;
  }, [data]);
  const groupKey = (c) => c.group || NONE;

  // totals per category / group, overall and per day
  const calc = useMemo(() => {
    const cats = data?.categories || [];
    const per = {};          // key → { qty, revenue }
    const byDay = {};        // date → { key → revenue }  (key = category key or group id)
    const dayTotal = {};
    for (const d of data?.dates || []) {
      byDay[d] = {}; dayTotal[d] = 0;
      for (const c of cats) {
        const v = data.days?.[d]?.[c.key];
        if (!v) continue;
        const k = cols === 'groups' ? groupKey(c) : c.key;
        byDay[d][k] = (byDay[d][k] || 0) + v.revenue;
        dayTotal[d] += v.revenue;
        if (!per[c.key]) per[c.key] = { qty: 0, revenue: 0 };
        per[c.key].qty += v.qty; per[c.key].revenue += v.revenue;
      }
    }
    const perGroup = {};
    for (const c of cats) {
      const p = per[c.key]; if (!p) continue;
      const g = groupKey(c);
      if (!perGroup[g]) perGroup[g] = { qty: 0, revenue: 0 };
      perGroup[g].qty += p.qty; perGroup[g].revenue += p.revenue;
    }
    const total = Object.values(per).reduce((s, p) => s + p.revenue, 0);
    const totalQty = Object.values(per).reduce((s, p) => s + p.qty, 0);
    return { per, perGroup, byDay, dayTotal, total, totalQty };
  }, [data, cols]);

  const r2 = (n) => Math.round((n || 0) * 100) / 100;
  const pct = (n) => (calc.total > 0 ? Math.round((n / calc.total) * 1000) / 10 : 0);
  const catsSorted = useMemo(() => [...(data?.categories || [])].filter((c) => calc.per[c.key]).sort((a, b) => calc.per[b.key].revenue - calc.per[a.key].revenue), [data, calc]);
  const columns = cols === 'groups'
    ? groups.filter((g) => calc.perGroup[g.id])
    : catsSorted.map((c) => ({ id: c.key, name: c.name }));

  // one category picked: rows = days with sales of it, columns = its dishes
  const picked = useMemo(() => {
    if (!pick || !itemRows) return null;
    const rows = itemRows.filter((r) => r.cat === pick);
    const per = {}; const byDay = {}; const dayTotal = {}; const dayQty = {};
    for (const r of rows) {
      if (!per[r.name]) per[r.name] = { qty: 0, revenue: 0 };
      per[r.name].qty += r.qty; per[r.name].revenue += r.revenue;
      byDay[r.day] = byDay[r.day] || {};
      const c = byDay[r.day][r.name] || { qty: 0, revenue: 0 };
      byDay[r.day][r.name] = { qty: c.qty + r.qty, revenue: c.revenue + r.revenue };
      dayTotal[r.day] = (dayTotal[r.day] || 0) + r.revenue; dayQty[r.day] = (dayQty[r.day] || 0) + r.qty;
    }
    const dishes = Object.keys(per).sort((a, b) => per[b].revenue - per[a].revenue);
    const days = (data?.dates || []).filter((d) => dayTotal[d]);
    return { per, byDay, dayTotal, dayQty, dishes, days, total: Object.values(per).reduce((s, p) => s + p.revenue, 0), qty: Object.values(per).reduce((s, p) => s + p.qty, 0) };
  }, [pick, itemRows, data]);

  const download = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    if (mode === 'groups') {
      const rows = [['Group', 'Category', 'Items Sold', 'Amount', '% of Total']];
      for (const g of groups) {
        const pg = calc.perGroup[g.id]; if (!pg) continue;
        rows.push([g.name, '', pg.qty, r2(pg.revenue), `${pct(pg.revenue)}%`]);
        for (const c of catsSorted.filter((x) => groupKey(x) === g.id)) rows.push(['', c.name, calc.per[c.key].qty, r2(calc.per[c.key].revenue), `${pct(calc.per[c.key].revenue)}%`]);
      }
      rows.push(['Total', '', calc.totalQty, r2(calc.total), '100%']);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'groups');
    } else {
      const rows = [['Date', ...columns.map((c) => c.name), 'Total']];
      for (const d of data.dates) rows.push([d, ...columns.map((c) => r2(calc.byDay[d][c.id] || 0)), r2(calc.dayTotal[d])]);
      rows.push(['Total', ...columns.map((c) => r2(cols === 'groups' ? calc.perGroup[c.id]?.revenue : calc.per[c.id]?.revenue)), r2(calc.total)]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), cols === 'groups' ? 'by day - groups' : 'by day - categories');
    }
    // every dish, every day (filter by category / item in Excel)
    try {
      const its = await loadItems();
      const nameOf = (k) => (data.categories || []).find((c) => c.key === k)?.name || k;
      const sheet = [['Date', 'Category', 'Item', 'Qty', 'Amount'],
        ...[...its].sort((a, b) => a.day.localeCompare(b.day) || String(nameOf(a.cat)).localeCompare(String(nameOf(b.cat))) || b.revenue - a.revenue)
          .map((r) => [r.day, nameOf(r.cat), r.name, r.qty, r2(r.revenue)])];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet), 'items by day');
    } catch (_) { /* the summary sheet still downloads */ }
    XLSX.writeFile(wb, `sales-${mode === 'groups' ? 'groups' : 'by-day'}-${startDate}-to-${endDate}.xlsx`);
  };

  if (loading && !data) return <div className="py-12 text-center text-gray-400"><FaSpinner className="animate-spin inline" /></div>;
  if (err) return <div className="py-10 text-center text-red-600 text-sm">{err}</div>;
  if (!data) return null;

  const noGroups = !(data.reportGroups || []).length;

  return (
    <div>
      <div className="px-4 py-2.5 border-b border-gray-100 flex flex-wrap items-center gap-2">
        {mode === 'byday' && (
          <select value={pick} onChange={(e) => setPick(e.target.value)} className={`border rounded-lg px-2 py-1.5 text-xs font-semibold ${pick ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-600'}`}>
            <option value="">All categories</option>
            {catsSorted.map((c) => <option key={c.key} value={c.key}>{c.name} — its dishes</option>)}
          </select>
        )}
        {mode === 'byday' && !pick && (
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
            {[['groups', 'Groups'], ['categories', 'Categories']].map(([k, t]) => (
              <button key={k} onClick={() => setCols(k)} className={`px-3 py-1.5 ${cols === k ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>{t}</button>
            ))}
          </div>
        )}
        <span className="text-xs text-gray-500">{fmtDay(data.startDate)} – {fmtDay(data.endDate)} · item sales before discount & tax</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setSetup(true)} className="flex items-center gap-1.5 border border-gray-200 bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50">
            <FaLayerGroup className="text-xs" /> {noGroups ? 'Set up groups' : 'Edit groups'}
          </button>
          <button onClick={download} className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm">
            <FaFileExcel className="text-xs" /> Download Excel
          </button>
        </div>
      </div>

      {noGroups && (mode === 'groups' || (cols === 'groups' && !pick)) && (
        <div className="mx-4 mt-3 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          No groups yet. Tap <b>Set up groups</b> to put your categories into groups like <b>Food</b> and <b>Drinks</b> — reports only, your menu stays the same.
        </div>
      )}

      {mode === 'byday' && pick ? (
        !picked ? <div className="py-12 text-center text-gray-400"><FaSpinner className="animate-spin inline" /></div>
        : !picked.days.length ? <div className="text-center py-12 text-gray-400">No sales of this category in this period</div> : (
        <div className="overflow-x-auto">
          <div className="px-4 pt-3 text-xs text-gray-500">Only days with sales of <b>{catsSorted.find((c) => c.key === pick)?.name}</b> · {picked.days.length} day{picked.days.length === 1 ? '' : 's'}</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="px-3 py-2.5 font-semibold text-left sticky left-0 bg-gray-50">Date</th>
                {picked.dishes.map((n) => <th key={n} className="px-3 py-2.5 font-semibold text-right whitespace-nowrap normal-case">{n}</th>)}
                <th className="px-3 py-2.5 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {picked.days.map((d) => (
                <tr key={d}>
                  <td className="px-3 py-2 whitespace-nowrap sticky left-0 bg-white text-gray-700">{fmtDay(d)}</td>
                  {picked.dishes.map((n) => { const v = picked.byDay[d]?.[n]; return (
                    <td key={n} className="px-3 py-2 text-right text-gray-700">{v ? <>{formatCurrency(r2(v.revenue))}<div className="text-[11px] text-gray-400">× {v.qty}</div></> : '–'}</td>
                  ); })}
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(r2(picked.dayTotal[d]))}<div className="text-[11px] text-gray-400 font-normal">× {picked.dayQty[d]}</div></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                <td className="px-3 py-3 sticky left-0 bg-gray-50 text-gray-800">Total</td>
                {picked.dishes.map((n) => <td key={n} className="px-3 py-3 text-right text-gray-900">{formatCurrency(r2(picked.per[n].revenue))}<div className="text-[11px] text-gray-500">× {picked.per[n].qty}</div></td>)}
                <td className="px-3 py-3 text-right text-emerald-700">{formatCurrency(r2(picked.total))}<div className="text-[11px] text-gray-500">× {picked.qty}</div></td>
              </tr>
            </tfoot>
          </table>
        </div>
        )
      ) : calc.total === 0 ? (
        <div className="text-center py-12 text-gray-400">No sales in this period</div>
      ) : mode === 'groups' ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-2.5 font-semibold">Group / Category</th>
                <th className="px-4 py-2.5 font-semibold text-center">Items Sold</th>
                <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                <th className="px-4 py-2.5 font-semibold text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groups.filter((g) => calc.perGroup[g.id]).sort((a, b) => calc.perGroup[b.id].revenue - calc.perGroup[a.id].revenue).map((g) => (
                [<tr key={g.id} className="bg-emerald-50/40">
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{g.name}</td>
                  <td className="px-4 py-3 text-center text-sm font-bold text-blue-700">{calc.perGroup[g.id].qty}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatCurrency(r2(calc.perGroup[g.id].revenue))}</td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-emerald-700">{pct(calc.perGroup[g.id].revenue)}%</td>
                </tr>,
                ...catsSorted.filter((c) => groupKey(c) === g.id).map((c) => (
                  <tr key={g.id + c.key}>
                    <td className="px-4 py-2 text-sm text-gray-600" style={{ paddingLeft: 36 }}><span className="text-gray-400 mr-1">›</span>{c.name}</td>
                    <td className="px-4 py-2 text-center text-sm text-gray-600">{calc.per[c.key].qty}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-700">{formatCurrency(r2(calc.per[c.key].revenue))}</td>
                    <td className="px-4 py-2 text-right text-xs text-gray-500">{pct(calc.per[c.key].revenue)}%</td>
                  </tr>
                ))]
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                <td className="px-4 py-3 text-gray-800">Total</td>
                <td className="px-4 py-3 text-center text-blue-800 text-sm">{calc.totalQty}</td>
                <td className="px-4 py-3 text-right text-emerald-700 text-sm">{formatCurrency(r2(calc.total))}</td>
                <td className="px-4 py-3 text-right text-xs text-gray-500">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="px-3 py-2.5 font-semibold text-left sticky left-0 bg-gray-50">Date</th>
                {columns.map((c) => <th key={c.id} className="px-3 py-2.5 font-semibold text-right whitespace-nowrap">{c.name}</th>)}
                <th className="px-3 py-2.5 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.dates.map((d) => (
                <tr key={d} className={calc.dayTotal[d] ? '' : 'text-gray-300'}>
                  <td className="px-3 py-2 whitespace-nowrap sticky left-0 bg-white text-gray-700">{fmtDay(d)}</td>
                  {columns.map((c) => <td key={c.id} className="px-3 py-2 text-right text-gray-700">{calc.byDay[d][c.id] ? formatCurrency(r2(calc.byDay[d][c.id])) : '–'}</td>)}
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">{calc.dayTotal[d] ? formatCurrency(r2(calc.dayTotal[d])) : '–'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                <td className="px-3 py-3 sticky left-0 bg-gray-50 text-gray-800">Total</td>
                {columns.map((c) => <td key={c.id} className="px-3 py-3 text-right text-gray-900">{formatCurrency(r2(cols === 'groups' ? calc.perGroup[c.id]?.revenue : calc.per[c.id]?.revenue))}</td>)}
                <td className="px-3 py-3 text-right text-emerald-700">{formatCurrency(r2(calc.total))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {setup && (
        <GroupSetup restaurantId={restaurantId} initial={data.reportGroups || []} onClose={() => setSetup(false)} onSaved={() => { setSetup(false); setReload((n) => n + 1); }} />
      )}
    </div>
  );
}

// Put each menu category into a group (one group per category). Reports only.
function GroupSetup({ restaurantId, initial, onClose, onSaved }) {
  const [cats, setCats] = useState(null);
  const [groups, setGroups] = useState(() => (initial.length ? initial : [{ id: 'food', name: 'Food', categories: [] }, { id: 'drinks', name: 'Drinks', categories: [] }]).map((g) => ({ ...g })));
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const norm = (v) => String(v || '').trim().toLowerCase();

  useEffect(() => {
    apiClient.getMenu(restaurantId).then((r) => {
      const items = r?.menuItems || [];
      setCats((r?.categories || []).filter((c) => !String(c.id || '').startsWith('qrmenu-')).map((c) => ({ id: c.id, name: c.name, n: items.filter((i) => norm(i.category) === norm(c.id) && i.status !== 'deleted').length })));
    }).catch((e) => { setCats([]); setErr(e?.message || 'Could not load categories'); });
  }, [restaurantId]);

  const groupOf = (c) => groups.find((g) => (g.categories || []).some((x) => norm(x) === norm(c.id) || norm(x) === norm(c.name)))?.id || '';
  const assign = (c, gid) => setGroups((list) => list.map((g) => {
    const rest = (g.categories || []).filter((x) => norm(x) !== norm(c.id) && norm(x) !== norm(c.name));
    return { ...g, categories: g.id === gid ? [...rest, c.id] : rest };
  }));
  const setAll = (gid, ids) => setGroups((list) => list.map((g) => ({ ...g, categories: g.id === gid ? [...new Set([...(g.categories || []), ...ids])] : (g.categories || []).filter((x) => !ids.includes(x)) })));
  const addGroup = () => {
    const name = newName.trim(); if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `g${groups.length + 1}`;
    if (groups.some((g) => g.id === id)) return;
    setGroups([...groups, { id, name, categories: [] }]); setNewName('');
  };
  const save = async () => {
    setBusy(true); setErr('');
    try {
      await apiClient.request(`/api/restaurants/${restaurantId}/report-groups`, { method: 'PUT', body: { reportGroups: groups } });
      onSaved();
    } catch (e) { setErr(e?.message || 'Could not save'); setBusy(false); }
  };
  const unassigned = (cats || []).filter((c) => !groupOf(c));

  return (
    <div className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center">
          <div className="flex-1">
            <div className="font-bold text-gray-900">Report groups</div>
            <div className="text-xs text-gray-500">Which categories add up to each group in your sales reports. Your menu and POS stay the same.</div>
          </div>
          <button onClick={onClose} className="text-gray-500 p-1"><FaTimes /></button>
        </div>
        <div className="p-4 overflow-y-auto flex flex-col gap-3">
          <div className="flex flex-wrap gap-2 items-center">
            {groups.map((g) => (
              <span key={g.id} className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full pl-3 pr-1 py-1 text-sm font-semibold">
                <input value={g.name} onChange={(e) => setGroups(groups.map((x) => (x.id === g.id ? { ...x, name: e.target.value } : x)))} className="bg-transparent w-24 outline-none" />
                <span className="text-xs text-emerald-600 font-normal">{(g.categories || []).length}</span>
                <button onClick={() => setGroups(groups.filter((x) => x.id !== g.id))} title="Remove group" className="px-1 text-emerald-700"><FaTimes size={10} /></button>
              </span>
            ))}
            <span className="inline-flex items-center gap-1">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addGroup(); }} placeholder="New group, e.g. Cafe" className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-40" />
              <button onClick={addGroup} className="border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600"><FaPlus size={10} /></button>
            </span>
          </div>
          {!cats ? <div className="py-8 text-center text-gray-400"><FaSpinner className="animate-spin inline" /></div> : (
            <>
              <div className="text-xs text-gray-500">{unassigned.length ? `${unassigned.length} categor${unassigned.length === 1 ? 'y is' : 'ies are'} not in a group yet` : 'Every category is in a group'}</div>
              <div className="border border-gray-100 rounded-xl divide-y divide-gray-50">
                {cats.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 px-3 py-2">
                    <div className="flex-1 min-w-0 text-sm text-gray-800 truncate">{c.name} <span className="text-xs text-gray-400">· {c.n}</span></div>
                    <select value={groupOf(c)} onChange={(e) => assign(c, e.target.value)} className={`border rounded-lg px-2 py-1 text-sm ${groupOf(c) ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-500'}`}>
                      <option value="">Not in a group</option>
                      {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {unassigned.length > 0 && groups.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
                  Put the rest ({unassigned.length}) into:
                  {groups.map((g) => <button key={g.id} onClick={() => setAll(g.id, unassigned.map((c) => c.id))} className="border border-gray-200 rounded-full px-2.5 py-1 text-gray-700 hover:bg-gray-50">{g.name}</button>)}
                </div>
              )}
            </>
          )}
          {err && <div className="text-sm text-red-600 font-semibold">{err}</div>}
        </div>
        <div className="px-4 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button onClick={onClose} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700">Cancel</button>
          <button onClick={save} disabled={busy || !cats} className="bg-emerald-600 text-white rounded-lg px-4 py-1.5 text-sm font-semibold disabled:opacity-50">{busy ? 'Saving…' : 'Save groups'}</button>
        </div>
      </div>
    </div>
  );
}
