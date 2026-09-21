'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaHotel } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';

const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const PRESETS = [{ id: '7', label: 'Last 7 days', days: 7 }, { id: '30', label: 'Last 30 days', days: 30 }, { id: 'mtd', label: 'This month', days: null }];

export default function ChainView({ formatCurrency, notify }) {
  const today = localToday();
  const [preset, setPreset] = useState('30');
  const [from, setFrom] = useState(addDays(today, -29));
  const [to, setTo] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toFixed(2));

  const applyPreset = (p) => {
    setPreset(p.id);
    if (p.id === 'mtd') { const d = new Date(); setFrom(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`); setTo(today); }
    else { setFrom(addDays(today, -(p.days - 1))); setTo(today); }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hotelApi.chainSummary({ from, to: addDays(to, 1), asOf: today });
      setReport(res.report);
    } catch (e) { notify('error', e.message || 'Failed to load group report'); }
    finally { setLoading(false); }
  }, [from, to, today, notify]);

  useEffect(() => { load(); }, [load]);

  const t = report?.totals;
  const maxRev = report?.properties?.length ? Math.max(1, ...report.properties.map((p) => p.totalRevenue)) : 1;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl border border-[#EBE4D6] bg-white p-1">
          {PRESETS.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${preset === p.id ? 'bg-[#9A7B45] text-white' : 'text-[#6E6656] hover:bg-[#F3EFE6]'}`}>{p.label}</button>
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
      ) : !t ? (
        <div className="rounded-xl border border-dashed border-[#EBE4D6] py-12 text-center text-[#A79C88]">
          <FaHotel className="mx-auto mb-2" size={22} /> No hotel properties found for your account.
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Kpi label="Properties" value={t.properties} accent />
            <Kpi label="Occupancy" value={`${t.occupancy}%`} />
            <Kpi label="ADR" value={money(t.adr)} />
            <Kpi label="RevPAR" value={money(t.revpar)} />
            <Kpi label="Room revenue" value={money(t.roomRevenue)} />
            <Kpi label="Total revenue" value={money(t.totalRevenue)} strong />
          </div>

          <div className="rounded-xl border border-[#EBE4D6] bg-white p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#A79C88]">By property</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-[#A79C88]">
                  <tr>
                    <th className="py-1.5 pr-2 font-medium">Property</th>
                    <th className="py-1.5 px-2 font-medium">Rooms</th>
                    <th className="py-1.5 px-2 font-medium">Occ</th>
                    <th className="py-1.5 px-2 font-medium">ADR</th>
                    <th className="py-1.5 px-2 font-medium">RevPAR</th>
                    <th className="py-1.5 pl-2 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F1E8]">
                  {report.properties.map((p) => (
                    <tr key={p.id} className="hover:bg-[#F3EFE6]/60">
                      <td className="py-2 pr-2 font-medium text-[#2A241B]">{p.name}</td>
                      <td className="py-2 px-2 tabular-nums text-[#8A8172]">{p.roomsAvailable}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[#F1ECE1]"><div className="h-full rounded-full bg-[#F3EAD7]0" style={{ width: `${Math.min(100, p.occupancy)}%` }} /></div>
                          <span className="tabular-nums text-xs text-[#8A8172]">{p.occupancy}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 tabular-nums text-[#6E6656]">{money(p.adr)}</td>
                      <td className="py-2 px-2 tabular-nums text-[#6E6656]">{money(p.revpar)}</td>
                      <td className="py-2 pl-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-[#F1ECE1] sm:block"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${(p.totalRevenue / maxRev) * 100}%` }} /></div>
                          <span className="tabular-nums font-medium text-[#4A4335]">{money(p.totalRevenue)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
