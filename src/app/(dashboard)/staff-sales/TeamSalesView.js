'use client';

// Staff Sales → Teams by station. Each station's daily sales (e.g. Takeaway counter = takeaway
// orders), who took its orders, the team on the rota there (station + duty on the shift, checked
// against attendance) and — when the station has an incentive % — each person's share.
// Stations are set up in Shift Scheduling → Settings → Stations & team incentives.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '../../../lib/api';
import { FaSpinner, FaStore, FaFileExcel, FaCheck, FaTimes } from 'react-icons/fa';

const fmtDay = (d) => { try { return new Date(`${d}T12:00:00`).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' }); } catch { return d; } };

export default function TeamSalesView({ restaurantId, startDate, endDate, formatCurrency }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!restaurantId || !startDate || !endDate) { setLoading(false); setData(null); return undefined; }
    let alive = true;
    setLoading(true); setError('');
    apiClient.getTeamSales(restaurantId, { startDate, endDate })
      .then((r) => { if (alive) setData(r?.data || null); })
      .catch((e) => { if (alive) { setData(null); setError(e?.message || 'Could not load team sales'); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [restaurantId, startDate, endDate]);

  if (loading) return <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-blue-500 text-3xl" /></div>;
  if (error) return <div className="text-center py-16 text-red-600 text-sm">{error}</div>;
  if (!data) return null;

  if (!data.stations?.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold"><FaStore className="text-red-500" /> Set up your stations first</div>
        <p className="text-sm text-gray-600 leading-relaxed">
          A station is a part of the business whose sales its team shares — e.g. <b>Takeaway counter</b> (takeaway orders) with
          Main packer, Assistant and Helpers, or <b>Dine-in floor</b>. Add them in Shift Scheduling → Settings, then set the station
          and duty on each person&apos;s shift. This page then shows every station&apos;s daily sales, who took the orders, who worked
          it (checked against attendance) and each person&apos;s incentive.
        </p>
        <Link href="/shifts" className="inline-block mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700">Open Shift Scheduling</Link>
      </div>
    );
  }

  const anyRate = data.stations.some((s) => s.ratePct > 0);
  const anyTeam = data.days.some((d) => d.stations.some((c) => c.team.length));

  const downloadExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const ppl = [['Staff', 'Duties', 'Days worked', 'Days absent', 'Station sales', 'Incentive'],
      ...data.people.map((p) => [p.name, p.duties.join(', '), p.daysWorked, p.absentDays, p.stationSales, p.incentive])];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ppl), 'Team incentives');
    const rows = [['Date', 'Station', 'Sales', 'Orders', 'Incentive %', 'Pool', 'Staff', 'Duty', 'Came in', 'Incentive']];
    data.days.forEach((d) => d.stations.forEach((c) => {
      if (!c.team.length) rows.push([d.date, c.name, c.sales, c.orders, c.ratePct, c.pool, '', '', '', '']);
      c.team.forEach((m) => rows.push([d.date, c.name, c.sales, c.orders, c.ratePct, c.pool, m.name, m.duty, m.present === null ? 'not recorded' : m.present ? 'yes' : 'no', m.incentive]));
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'By day');
    const tk = [['Date', 'Station', 'Order taker', 'Orders', 'Sales']];
    data.days.forEach((d) => d.stations.forEach((c) => c.takers.forEach((t) => tk.push([d.date, c.name, t.name, t.orders, t.sales]))));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(tk), 'Order takers');
    XLSX.writeFile(wb, `team-sales-${data.dateRange.start}-to-${data.dateRange.end}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Station totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {data.totals.map((t) => (
          <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 font-medium uppercase flex items-center gap-1.5"><FaStore className="text-red-400" /> {t.name}</div>
            <div className="text-xl font-bold text-gray-900 mt-1 tabular-nums">{formatCurrency(t.sales)}</div>
            <div className="text-xs text-gray-500 mt-0.5">{t.orders} orders{t.ratePct > 0 ? <> · team pool <b className="text-emerald-700">{formatCurrency(t.pool)}</b> ({t.ratePct}%)</> : ''}</div>
          </div>
        ))}
      </div>

      {!anyTeam && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
          No one has a station on their shifts for these days. In Shift Scheduling, open a shift and pick its <b>Station</b> and <b>Duty</b>.
        </div>
      )}

      {/* People */}
      {data.people.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-gray-800">Team members <span className="text-xs text-gray-400 font-normal">this period</span></h3>
            <button onClick={downloadExcel} className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700">
              <FaFileExcel className="text-xs" /> Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                  <th className="px-4 py-2.5 font-semibold">Staff</th>
                  <th className="px-4 py-2.5 font-semibold">Duties</th>
                  <th className="px-4 py-2.5 font-semibold text-center">Days worked</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Station sales</th>
                  {anyRate && <th className="px-4 py-2.5 font-semibold text-right">Incentive</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.people.map((p) => (
                  <tr key={p.staffId}>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-2.5 text-gray-600">{p.duties.join(', ') || '—'}</td>
                    <td className="px-4 py-2.5 text-center tabular-nums">{p.daysWorked}{p.absentDays > 0 && <span className="ml-1 text-xs text-red-500">({p.absentDays} absent)</span>}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatCurrency(p.stationSales)}</td>
                    {anyRate && <td className="px-4 py-2.5 text-right tabular-nums font-bold text-emerald-700">{formatCurrency(p.incentive)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Day by day */}
      <div className="space-y-4">
        {data.days.map((d) => (
          <div key={d.date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
              <span className="font-bold text-gray-800">{fmtDay(d.date)}</span>
              {!d.attendanceRecorded && <span className="text-[11px] text-gray-400">no attendance punches this day — everyone on the rota counts</span>}
            </div>
            <div className="divide-y divide-gray-100">
              {d.stations.map((c) => (
                <div key={c.id} className="p-4 grid gap-4 md:grid-cols-[220px_1fr]">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800">{c.name}</div>
                    <div className="text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(c.sales)}</div>
                    <div className="text-xs text-gray-500">{c.orders} orders{c.pool > 0 ? <> · pool <b className="text-emerald-700">{formatCurrency(c.pool)}</b></> : ''}</div>
                    {c.takers.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">Orders taken by</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.takers.map((t) => (
                            <span key={t.name} className="text-[11px] bg-gray-100 text-gray-700 rounded-full px-2 py-0.5">{t.name} · {t.orders} · {formatCurrency(t.sales)}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    {c.team.length === 0 ? (
                      <p className="text-sm text-gray-400">No one on the rota at this station.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-[11px] text-gray-400 uppercase">
                              <th className="py-1 pr-3 font-semibold">Team</th>
                              <th className="py-1 pr-3 font-semibold">Duty</th>
                              <th className="py-1 pr-3 font-semibold text-center">Came in</th>
                              {c.pool > 0 && <th className="py-1 font-semibold text-right">Incentive</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {c.team.map((m) => (
                              <tr key={m.staffId} className={m.present === false ? 'text-gray-400' : ''}>
                                <td className="py-1.5 pr-3 font-medium">{m.name}</td>
                                <td className="py-1.5 pr-3">{m.duty || '—'}</td>
                                <td className="py-1.5 pr-3 text-center">
                                  {m.present === null ? <span className="text-gray-300">—</span> : m.present ? <FaCheck className="inline text-emerald-600" /> : <FaTimes className="inline text-red-500" title="No clock-in — gets no share" />}
                                </td>
                                {c.pool > 0 && <td className="py-1.5 text-right tabular-nums font-semibold">{formatCurrency(m.incentive)}</td>}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {data.days.length === 0 && <div className="text-center py-12 text-gray-400">No sales or rota for this period.</div>}
      </div>
    </div>
  );
}
