'use client';

// Food court mode (restaurant.foodCourt — off by default). The food court runs as one restaurant: one
// menu, one central billing counter, one bill that can hold items from several stalls. Here the owner
// sets up the stalls (which menu categories each stall sells, its commission %) and sees each stall's
// sales, commission and payout, worked out from the bills (backend utils/foodCourt.js). Each stall
// owner can get a login that only shows their own stall (/my-stall).
import { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../../lib/api';
import { restaurantToday, ymd } from '../../../lib/restaurantTime';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { FaStore, FaSpinner, FaFileExcel, FaPlus, FaTrash, FaKey, FaInfoCircle } from 'react-icons/fa';

const PERIODS = [
  { id: 'today', label: 'Today' }, { id: 'yesterday', label: 'Yesterday' },
  { id: 'week', label: 'Last 7 days' }, { id: 'month', label: 'This month' }, { id: 'custom', label: 'Custom' },
];

function rangeFor(period, from, to) {
  const t = restaurantToday();
  const shift = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  if (period === 'yesterday') { const y = shift(t, -1); return [ymd(y), ymd(y)]; }
  if (period === 'week') return [ymd(shift(t, -6)), ymd(t)];
  if (period === 'month') return [ymd(new Date(t.getFullYear(), t.getMonth(), 1, 12)), ymd(t)];
  if (period === 'custom' && from && to) return [from, to];
  return [ymd(t), ymd(t)];
}

const newStall = (n) => ({ id: `stall_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name: `Stall ${n}`, ownerName: '', phone: '', categories: [], itemIds: [], commissionPct: 0, active: true });

function resolveRestaurantId() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return localStorage.getItem('selectedRestaurantId') || u.restaurantId || (u.restaurant && u.restaurant.id) || null;
  } catch { return null; }
}

export default function FoodCourtPage() {
  const { formatCurrency } = useCurrency();
  const [rid, setRid] = useState(null);
  const [tab, setTab] = useState('report');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({ enabled: false, stalls: [] });
  const [saved, setSaved] = useState({ enabled: false, stalls: [] });
  const [categories, setCategories] = useState([]);
  const [canEdit, setCanEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [period, setPeriod] = useState('today');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [creds, setCreds] = useState({}); // stallId → { loginId, password } just created
  const [loginBusy, setLoginBusy] = useState('');

  useEffect(() => { setRid(resolveRestaurantId()); }, []);

  useEffect(() => {
    if (!rid) return;
    setLoading(true);
    apiClient.getFoodCourtSettings(rid)
      .then((r) => {
        setSettings(r.settings); setSaved(r.settings); setCategories(r.categories || []); setCanEdit(!!r.canEdit);
        if (!r.settings.enabled) setTab('setup');
      })
      .catch((e) => setError(e?.message || 'Could not load food court settings'))
      .finally(() => setLoading(false));
  }, [rid]);

  const [startDate, endDate] = rangeFor(period, from, to);
  const loadReport = useCallback(() => {
    if (!rid || !saved.enabled) return;
    setReportLoading(true);
    apiClient.getFoodCourtReport(rid, startDate, endDate)
      .then(setReport)
      .catch((e) => setReport({ error: e?.message || 'Could not load the stalls report' }))
      .finally(() => setReportLoading(false));
  }, [rid, saved.enabled, startDate, endDate]);
  useEffect(() => { if (tab === 'report') loadReport(); }, [tab, loadReport]);

  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);
  const catName = useMemo(() => new Map(categories.map((c) => [String(c.id).toLowerCase(), c.name])), [categories]);
  // category id → name of the stall that has it (to show "taken by …")
  const takenBy = useMemo(() => {
    const m = new Map();
    for (const s of settings.stalls) for (const c of s.categories) if (!m.has(String(c).toLowerCase())) m.set(String(c).toLowerCase(), s);
    return m;
  }, [settings.stalls]);

  const setStall = (id, patch) => setSettings((s) => ({ ...s, stalls: s.stalls.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const toggleCat = (stall, cat) => {
    const key = String(cat).toLowerCase();
    const has = stall.categories.some((c) => String(c).toLowerCase() === key);
    setStall(stall.id, { categories: has ? stall.categories.filter((c) => String(c).toLowerCase() !== key) : [...stall.categories, cat] });
  };

  const save = async () => {
    setSaving(true); setNotice(''); setError('');
    try {
      const r = await apiClient.saveFoodCourtSettings(rid, settings);
      setSettings(r.settings); setSaved(r.settings);
      setNotice('Saved');
      setTimeout(() => setNotice(''), 2500);
    } catch (e) {
      setError(e?.message || 'Could not save');
    } finally { setSaving(false); }
  };

  const createLogin = async (stall) => {
    setLoginBusy(stall.id); setError('');
    try {
      const r = await apiClient.addStaff(rid, {
        name: stall.ownerName ? `${stall.ownerName} (${stall.name})` : stall.name,
        phone: stall.phone || undefined,
        role: 'stall_owner',
        stallOwner: { stallId: stall.id },
      });
      if (r && r.credentials) setCreds((c) => ({ ...c, [stall.id]: { loginId: r.credentials.loginId, password: r.credentials.password } }));
    } catch (e) {
      setError(e?.message || 'Could not create the login');
    } finally { setLoginBusy(''); }
  };

  const exportExcel = async () => {
    if (!report || report.error) return;
    const XLSX = await import('xlsx');
    const head = ['Stall', 'Owner', 'Orders', 'Items', 'Item sales', 'Discount', 'Net sales', 'Tax & charges', 'Guest paid', 'Commission %', 'Commission', 'Payable to stall'];
    const line = (r) => [r.name, r.ownerName || '', r.orders, r.qty, r.itemSales, r.discount, r.netSales, r.taxCharges, r.billed, r.id ? r.commissionPct : '', r.commission, r.payable];
    const rows = [head, ...report.stalls.map(line)];
    if (report.unassigned && report.unassigned.itemSales) rows.push(line(report.unassigned));
    rows.push(line({ ...report.totals, name: 'Total', id: null }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([[`Food court stalls ${report.startDate} to ${report.endDate}`], [], ...rows]);
    ws['!cols'] = [{ wch: 24 }, { wch: 18 }, ...new Array(10).fill({ wch: 13 })];
    XLSX.utils.book_append_sheet(wb, ws, 'Stalls');
    XLSX.writeFile(wb, `food-court-stalls-${report.startDate}-to-${report.endDate}.xlsx`);
  };

  if (loading) return <div className="p-8 text-gray-500 flex items-center gap-2"><FaSpinner className="animate-spin" /> Loading…</div>;

  const money = (n) => formatCurrency(Number(n) || 0);
  const card = 'bg-white rounded-xl border border-gray-200';

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-1">
        <FaStore className="text-amber-600" size={22} />
        <h1 className="text-xl font-bold text-gray-900">Food Court</h1>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${saved.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{saved.enabled ? 'On' : 'Off'}</span>
      </div>
      <p className="text-sm text-gray-500 mb-4">One menu and one billing counter for all stalls. Each stall&apos;s sales, commission and payout are worked out from the bills, item by item.</p>

      <div className="flex gap-2 mb-4">
        {[['report', 'Stalls report'], ['setup', 'Set up']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === id ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}>{label}</button>
        ))}
      </div>

      {error && <div className="mb-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {tab === 'report' && (
        !saved.enabled ? (
          <div className={`${card} p-6 text-gray-600 text-sm`}>Food court mode is off. Open <b>Set up</b> to add your stalls and turn it on.</div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {PERIODS.map((p) => (
                <button key={p.id} onClick={() => setPeriod(p.id)} className={`px-3 py-1.5 rounded-lg text-sm ${period === p.id ? 'bg-amber-600 text-white' : 'bg-white border border-gray-200 text-gray-700'}`}>{p.label}</button>
              ))}
              {period === 'custom' && (
                <span className="flex items-center gap-1 text-sm">
                  <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1" />
                  <span>to</span>
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1" />
                </span>
              )}
              <button onClick={exportExcel} disabled={!report || report.error} className="ml-auto px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white flex items-center gap-1 disabled:opacity-50"><FaFileExcel /> Excel</button>
            </div>
            {reportLoading || !report ? (
              <div className="p-6 text-gray-500 flex items-center gap-2"><FaSpinner className="animate-spin" /> Loading…</div>
            ) : report.error ? (
              <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm">{report.error}</div>
            ) : (
              <div className={`${card} overflow-x-auto`}>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      {['Stall', 'Orders', 'Items', 'Item sales', 'Discount', 'Net sales', 'Tax & charges', 'Commission', 'Payable to stall'].map((h, i) => (
                        <th key={h} className={`px-3 py-2 font-semibold ${i ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.stalls.map((s) => (
                      <tr key={s.id} className="border-t border-gray-100">
                        <td className="px-3 py-2"><div className="font-semibold text-gray-900">{s.name}</div>{s.ownerName && <div className="text-xs text-gray-500">{s.ownerName}</div>}</td>
                        <td className="px-3 py-2 text-right">{s.orders}</td>
                        <td className="px-3 py-2 text-right">{s.qty}</td>
                        <td className="px-3 py-2 text-right">{money(s.itemSales)}</td>
                        <td className="px-3 py-2 text-right text-red-600">{s.discount ? `−${money(s.discount)}` : '—'}</td>
                        <td className="px-3 py-2 text-right font-semibold">{money(s.netSales)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{money(s.taxCharges)}</td>
                        <td className="px-3 py-2 text-right">{money(s.commission)} <span className="text-xs text-gray-400">({s.commissionPct}%)</span></td>
                        <td className="px-3 py-2 text-right font-bold text-green-700">{money(s.payable)}</td>
                      </tr>
                    ))}
                    {report.unassigned && report.unassigned.itemSales > 0 && (
                      <tr className="border-t border-gray-100 bg-amber-50">
                        <td className="px-3 py-2"><div className="font-semibold text-amber-800">Not set up for any stall</div><div className="text-xs text-amber-700">Items whose category no stall has — add it to a stall in Set up</div></td>
                        <td className="px-3 py-2 text-right">{report.unassigned.orders}</td>
                        <td className="px-3 py-2 text-right">{report.unassigned.qty}</td>
                        <td className="px-3 py-2 text-right">{money(report.unassigned.itemSales)}</td>
                        <td className="px-3 py-2 text-right text-red-600">{report.unassigned.discount ? `−${money(report.unassigned.discount)}` : '—'}</td>
                        <td className="px-3 py-2 text-right font-semibold">{money(report.unassigned.netSales)}</td>
                        <td className="px-3 py-2 text-right text-gray-600">{money(report.unassigned.taxCharges)}</td>
                        <td className="px-3 py-2 text-right">—</td>
                        <td className="px-3 py-2 text-right">—</td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                      <td className="px-3 py-2">Total</td>
                      <td className="px-3 py-2 text-right">{report.totals.orders}</td>
                      <td className="px-3 py-2 text-right">{report.totals.qty}</td>
                      <td className="px-3 py-2 text-right">{money(report.totals.itemSales)}</td>
                      <td className="px-3 py-2 text-right text-red-600">{report.totals.discount ? `−${money(report.totals.discount)}` : '—'}</td>
                      <td className="px-3 py-2 text-right">{money(report.totals.netSales)}</td>
                      <td className="px-3 py-2 text-right">{money(report.totals.taxCharges)}</td>
                      <td className="px-3 py-2 text-right">{money(report.totals.commission)}</td>
                      <td className="px-3 py-2 text-right text-green-700">{money(report.totals.payable)}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-100">
                  Billed orders only. A bill&apos;s discount and tax/charges are shared over its items by value. Commission is on net sales; payable = net sales − commission. Tax &amp; charges stay with the food court. Total orders counts each bill once.
                </div>
              </div>
            )}
          </div>
        )
      )}

      {tab === 'setup' && (
        <div className="space-y-4">
          <div className={`${card} p-4 flex items-center justify-between gap-4`}>
            <div>
              <div className="font-semibold text-gray-900">Food court mode</div>
              <div className="text-sm text-gray-500">When on, the Stalls report and stall owner logins work. Billing stays exactly the same.</div>
            </div>
            <button disabled={!canEdit} onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
              className={`w-14 h-8 rounded-full relative transition ${settings.enabled ? 'bg-green-500' : 'bg-gray-300'} disabled:opacity-50`} aria-label="Food court mode">
              <span className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition ${settings.enabled ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm flex gap-2">
            <FaInfoCircle className="mt-0.5 shrink-0" />
            <span>Give each stall the menu categories it sells. To print each stall&apos;s kitchen tickets at its own counter, add a kitchen printer per stall with the same categories in Printer settings.</span>
          </div>

          {settings.stalls.map((s) => {
            const isSaved = saved.stalls.some((x) => x.id === s.id);
            return (
              <div key={s.id} className={`${card} p-4 ${s.active ? '' : 'opacity-60'}`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <label className="text-sm"><span className="text-gray-600">Stall name</span>
                    <input value={s.name} disabled={!canEdit} onChange={(e) => setStall(s.id, { name: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
                  <label className="text-sm"><span className="text-gray-600">Owner name</span>
                    <input value={s.ownerName} disabled={!canEdit} onChange={(e) => setStall(s.id, { ownerName: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
                  <label className="text-sm"><span className="text-gray-600">Owner phone</span>
                    <input value={s.phone} disabled={!canEdit} onChange={(e) => setStall(s.id, { phone: e.target.value })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
                  <label className="text-sm"><span className="text-gray-600">Commission %</span>
                    <input type="number" min="0" max="100" step="0.5" value={s.commissionPct} disabled={!canEdit}
                      onChange={(e) => setStall(s.id, { commissionPct: e.target.value === '' ? 0 : Number(e.target.value) })} className="mt-1 w-full border rounded-lg px-3 py-2" /></label>
                </div>
                <div className="mt-3">
                  <div className="text-sm text-gray-600 mb-1">Categories this stall sells</div>
                  <div className="flex flex-wrap gap-2">
                    {categories.length === 0 && <span className="text-sm text-gray-400">No menu categories yet.</span>}
                    {categories.map((c) => {
                      const key = String(c.id).toLowerCase();
                      const mine = s.categories.some((x) => String(x).toLowerCase() === key);
                      const other = !mine && takenBy.get(key);
                      return (
                        <button key={c.id} disabled={!canEdit || !!other} onClick={() => toggleCat(s, c.id)}
                          title={other ? `Already with ${other.name}` : ''}
                          className={`px-3 py-1 rounded-full text-xs border ${mine ? 'bg-amber-600 text-white border-amber-600' : other ? 'bg-gray-50 text-gray-400 border-gray-200 line-through' : 'bg-white text-gray-700 border-gray-300'}`}>
                          {c.name}
                        </button>
                      );
                    })}
                    {s.categories.filter((x) => !catName.has(String(x).toLowerCase())).map((x) => (
                      <span key={x} className="px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-600">{x} (not in menu)</span>
                    ))}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={s.active} disabled={!canEdit} onChange={(e) => setStall(s.id, { active: e.target.checked })} /> Active</label>
                  {canEdit && isSaved && !creds[s.id] && (
                    <button onClick={() => createLogin(s)} disabled={loginBusy === s.id} className="px-3 py-1.5 rounded-lg bg-gray-900 text-white flex items-center gap-1 disabled:opacity-50">
                      {loginBusy === s.id ? <FaSpinner className="animate-spin" /> : <FaKey />} Create login for stall owner
                    </button>
                  )}
                  {canEdit && !isSaved && <span className="text-xs text-gray-500">Save first to create a login for this stall.</span>}
                  {canEdit && (
                    <button onClick={() => setSettings((st) => ({ ...st, stalls: st.stalls.filter((x) => x.id !== s.id) }))} className="ml-auto text-red-600 flex items-center gap-1"><FaTrash /> Remove</button>
                  )}
                </div>
                {creds[s.id] && (
                  <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
                    <div className="font-semibold text-green-800">Login created — share this with the stall owner (shown once)</div>
                    <div className="mt-1">User ID: <b>{creds[s.id].loginId}</b> · Password: <b>{creds[s.id].password}</b></div>
                    <div className="text-xs text-green-700 mt-1">They log in on the normal staff login and see only this stall&apos;s sales. Reset the password or turn the login off in Admin → Staff.</div>
                  </div>
                )}
              </div>
            );
          })}

          {canEdit && (
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setSettings((s) => ({ ...s, stalls: [...s.stalls, newStall(s.stalls.length + 1)] }))} className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm flex items-center gap-2"><FaPlus /> Add stall</button>
              <button onClick={save} disabled={saving || !dirty} className="px-5 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                {saving && <FaSpinner className="animate-spin" />} Save
              </button>
              {notice && <span className="text-sm text-green-700">{notice}</span>}
              {dirty && !saving && <span className="text-sm text-amber-700">Unsaved changes</span>}
            </div>
          )}
          {!canEdit && <div className="text-sm text-gray-500">Only the owner or an admin can change these settings.</div>}
        </div>
      )}
    </div>
  );
}
