'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaBed, FaSignInAlt, FaSignOutAlt, FaUsers } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';

const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = (s) => { if (!s) return '—'; const [, m, d] = String(s).slice(0, 10).split('-'); return `${MONTHS[+m - 1]} ${+d}`; };

const PRESETS = [
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: 'mtd', label: 'This month', days: null },
];

export default function ReportsView({ restaurantId, formatCurrency, notify }) {
  const today = localToday();
  const [preset, setPreset] = useState('30');
  const [from, setFrom] = useState(addDays(today, -29));
  const [to, setTo] = useState(today); // inclusive UI end; API gets exclusive (to+1)
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toFixed(2));

  const applyPreset = (p) => {
    setPreset(p.id);
    if (p.id === 'mtd') { const d = new Date(); setFrom(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`); setTo(today); }
    else { setFrom(addDays(today, -(p.days - 1))); setTo(today); }
  };

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res = await hotelApi.reportSummary(restaurantId, { from, to: addDays(to, 1), asOf: today });
      setReport(res.report);
    } catch (e) { notify('error', e.message || 'Failed to load report'); }
    finally { setLoading(false); }
  }, [restaurantId, from, to, today, notify]);

  useEffect(() => { load(); }, [load]);

  const t = report?.totals;
  const snap = report?.snapshot;
  const maxRev = report ? Math.max(1, ...report.daily.map((d) => d.revenue)) : 1;

  return (
    <div>
      {/* range controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border border-[#EBE4D6] bg-white p-1">
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${preset === p.id ? 'bg-[#9A7B45] text-white' : 'text-[#6E6656] hover:bg-[#F3EFE6]'}`}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-sm">
          <input type="date" value={from} max={to} onChange={(e) => { setPreset(''); setFrom(e.target.value); }} className="rounded-lg border border-[#DFD7C6] px-2 py-1.5 text-[#4A4335]" />
          <span className="text-[#A79C88]">→</span>
          <input type="date" value={to} min={from} max={today} onChange={(e) => { setPreset(''); setTo(e.target.value); }} className="rounded-lg border border-[#DFD7C6] px-2 py-1.5 text-[#4A4335]" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[#A79C88]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : !report ? (
        <p className="py-10 text-center text-[#A79C88]">No report.</p>
      ) : (
        <>
          {/* KPI cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Kpi label="Occupancy" value={`${t.occupancy}%`} accent />
            <Kpi label="ADR" value={money(t.adr)} />
            <Kpi label="RevPAR" value={money(t.revpar)} />
            <Kpi label="Room revenue" value={money(t.roomRevenue)} />
            <Kpi label="F&B / other" value={money(t.fnbRevenue)} />
            <Kpi label="Total revenue" value={money(t.totalRevenue)} strong />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* night audit snapshot */}
            <div className="rounded-xl border border-[#EBE4D6] bg-white p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#A79C88]">Today · {fmtDate(snap.date)}</div>
              <div className="space-y-2.5">
                <SnapRow icon={FaSignInAlt} label="Arrivals" value={snap.arrivals} tone="emerald" />
                <SnapRow icon={FaSignOutAlt} label="Departures" value={snap.departures} tone="indigo" />
                <SnapRow icon={FaUsers} label="In-house" value={snap.inHouse} tone="slate" />
                <SnapRow icon={FaBed} label="Rooms sold" value={`${snap.roomsSold} / ${snap.roomsAvailable}`} tone="slate" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#F1ECE1] pt-3 text-center">
                <MiniStat label="Occ" value={`${snap.occupancy}%`} />
                <MiniStat label="ADR" value={money(snap.adr)} />
                <MiniStat label="RevPAR" value={money(snap.revpar)} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#F1ECE1] pt-3 text-center">
                <MiniStat label="Collected" value={money(t.paymentsCollected)} />
                <MiniStat label="Outstanding" value={money(t.outstanding)} danger={t.outstanding > 0} />
              </div>
            </div>

            {/* daily breakdown */}
            <div className="rounded-xl border border-[#EBE4D6] bg-white p-4 lg:col-span-2">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#A79C88]">Daily · {report.range.nights} nights</div>
              <div className="max-h-80 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-white text-left text-xs uppercase tracking-wide text-[#A79C88]">
                    <tr>
                      <th className="py-1.5 pr-2 font-medium">Date</th>
                      <th className="py-1.5 px-2 font-medium">Sold</th>
                      <th className="py-1.5 px-2 font-medium">Occ</th>
                      <th className="py-1.5 px-2 font-medium">ADR</th>
                      <th className="py-1.5 pl-2 text-right font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F1E8]">
                    {report.daily.map((d) => (
                      <tr key={d.date} className="hover:bg-[#F3EFE6]/60">
                        <td className="py-1.5 pr-2 text-[#6E6656] whitespace-nowrap">{fmtDate(d.date)}</td>
                        <td className="py-1.5 px-2 tabular-nums text-[#6E6656]">{d.sold}/{d.available}</td>
                        <td className="py-1.5 px-2">
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[#F1ECE1]"><div className="h-full rounded-full bg-[#F3EAD7]0" style={{ width: `${Math.min(100, d.occupancy)}%` }} /></div>
                            <span className="tabular-nums text-xs text-[#8A8172]">{d.occupancy}%</span>
                          </div>
                        </td>
                        <td className="py-1.5 px-2 tabular-nums text-[#6E6656]">{money(d.adr)}</td>
                        <td className="py-1.5 pl-2 text-right tabular-nums text-[#4A4335]">{money(d.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, accent, strong }) {
  return (
    <div className={`rounded-xl border p-3.5 ${accent ? 'border-[#E3D6BA] bg-[#F3EAD7]' : strong ? 'border-[#DFD7C6] bg-[#FAF7F0]' : 'border-[#EBE4D6] bg-white'}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-[#A79C88]">{label}</div>
      <div className={`mt-1 text-xl font-semibold tabular-nums ${accent ? 'text-[#876A3A]' : 'text-[#2A241B]'}`}>{value}</div>
    </div>
  );
}
function SnapRow({ icon: Icon, label, value, tone }) {
  const tones = { emerald: 'text-emerald-600 bg-emerald-50', indigo: 'text-[#9A7B45] bg-[#F3EAD7]', slate: 'text-[#8A8172] bg-[#F1ECE1]' };
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-[#6E6656]"><span className={`flex h-6 w-6 items-center justify-center rounded-md ${tones[tone]}`}><Icon size={11} /></span>{label}</span>
      <span className="text-sm font-semibold tabular-nums text-[#2A241B]">{value}</span>
    </div>
  );
}
function MiniStat({ label, value, danger }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[#A79C88]">{label}</div>
      <div className={`text-sm font-semibold tabular-nums ${danger ? 'text-rose-600' : 'text-[#2A241B]'}`}>{value}</div>
    </div>
  );
}
