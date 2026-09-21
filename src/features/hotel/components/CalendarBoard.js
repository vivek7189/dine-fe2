'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaSpinner, FaPlus, FaSignInAlt, FaSignOutAlt, FaBed, FaDoorOpen } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import NewBookingModal from './NewBookingModal';
import ReservationQuickView from './ReservationQuickView';

// ── pure (TZ-safe) date helpers ──
const toDate = (s) => new Date(s + 'T00:00:00Z');
const toYmd = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = toDate(s); d.setUTCDate(d.getUTCDate() + n); return toYmd(d); };
const diffDays = (a, b) => Math.round((toDate(b) - toDate(a)) / 86400000);
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const ymd = (v) => (typeof v === 'string' ? v.slice(0, 10) : v ? new Date(v).toISOString().slice(0, 10) : '');
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAYS = 14;
const STATUS_BAR = {
  confirmed: 'bg-amber-400 text-amber-950',
  checked_in: 'bg-emerald-500 text-white',
  checked_out: 'bg-slate-300 text-slate-600',
};

export default function CalendarBoard({ restaurantId, formatCurrency, notify }) {
  const [start, setStart] = useState(localToday());
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFor, setNewFor] = useState(null);
  const [selected, setSelected] = useState(null);

  const days = useMemo(() => Array.from({ length: DAYS }, (_, i) => addDays(start, i)), [start]);
  const windowEnd = addDays(start, DAYS);
  const today = localToday();

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const [rm, rs] = await Promise.all([
        hotelApi.listRooms(restaurantId),
        hotelApi.listReservations(restaurantId, { from: start, to: windowEnd }),
      ]);
      setRooms(rm.rooms || []);
      setReservations((rs.reservations || []).filter((r) => r.status !== 'cancelled'));
    } catch (e) {
      notify('error', e.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, start, windowEnd, notify]);

  useEffect(() => { load(); }, [load]);

  const byRoom = useMemo(() => {
    const m = {};
    for (const r of reservations) if (r.roomId) (m[r.roomId] = m[r.roomId] || []).push(r);
    return m;
  }, [reservations]);
  const unassigned = reservations.filter((r) => !r.roomId).length;

  // per-day occupied count (assigned reservations overlapping that night)
  const occupiedByDay = useMemo(() => {
    const m = {};
    for (const d of days) {
      m[d] = reservations.filter((r) => r.roomId && ymd(r.checkIn) <= d && ymd(r.checkOut) > d).length;
    }
    return m;
  }, [reservations, days]);

  // today snapshot
  const stat = useMemo(() => {
    const total = rooms.length;
    const occ = occupiedByDay[today] ?? reservations.filter((r) => r.roomId && ymd(r.checkIn) <= today && ymd(r.checkOut) > today).length;
    const arrivals = reservations.filter((r) => ymd(r.checkIn) === today).length;
    const departures = reservations.filter((r) => ymd(r.checkOut) === today).length;
    return { total, occ, arrivals, departures, free: Math.max(0, total - occ), pct: total ? Math.round((occ / total) * 100) : 0 };
  }, [rooms, reservations, occupiedByDay, today]);

  const barStyle = (r) => {
    const ci = ymd(r.checkIn), co = ymd(r.checkOut);
    const left = Math.max(0, diffDays(start, ci));
    const right = Math.min(DAYS, diffDays(start, co));
    if (right <= left) return null;
    return { left: `${(left / DAYS) * 100}%`, width: `${((right - left) / DAYS) * 100}%` };
  };

  const rangeLabel = `${MO[+ymd(start).split('-')[1] - 1]} ${+ymd(start).split('-')[2]} – ${MO[+ymd(addDays(start, DAYS - 1)).split('-')[1] - 1]} ${+ymd(addDays(start, DAYS - 1)).split('-')[2]}`;

  return (
    <div>
      {/* summary strip */}
      <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat icon={FaBed} tone="indigo" label="Occupancy today" value={`${stat.pct}%`} sub={`${stat.occ}/${stat.total} rooms`} />
        <Stat icon={FaDoorOpen} tone="sky" label="Available today" value={stat.free} sub="rooms free" />
        <Stat icon={FaSignInAlt} tone="emerald" label="Arrivals today" value={stat.arrivals} sub="check-ins" />
        <Stat icon={FaSignOutAlt} tone="rose" label="Departures today" value={stat.departures} sub="check-outs" />
      </div>

      {/* toolbar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setStart(addDays(start, -7))} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50" aria-label="Previous week"><FaChevronLeft size={12} /></button>
          <button onClick={() => setStart(today)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Today</button>
          <button onClick={() => setStart(addDays(start, 7))} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50" aria-label="Next week"><FaChevronRight size={12} /></button>
          <span className="ml-1 text-sm font-medium text-slate-600">{rangeLabel}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {unassigned > 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">{unassigned} unassigned</span>}
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" /> Confirmed</span>
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" /> In-house</span>
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-300" /> Departed</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
          <FaBed className="mx-auto mb-2" size={22} /> No rooms yet — add rooms in <span className="font-medium text-slate-500">Rooms &amp; Types</span> first.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
          <div className="min-w-[840px]">
            {/* header */}
            <div className="flex border-b border-slate-200 bg-slate-50/80">
              <div className="w-40 flex-none border-r border-slate-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Room</div>
              <div className="flex flex-1">
                {days.map((d) => {
                  const wd = toDate(d).getUTCDay();
                  const isToday = d === today;
                  const free = Math.max(0, rooms.length - (occupiedByDay[d] || 0));
                  return (
                    <div key={d} className={`flex-1 border-l border-slate-100 py-1.5 text-center ${isToday ? 'bg-indigo-50' : (wd === 0 || wd === 6) ? 'bg-slate-100/70' : ''}`}>
                      <div className={`text-[10px] font-medium uppercase ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>{WD[wd]}</div>
                      <div className={`text-[13px] font-semibold tabular-nums ${isToday ? 'text-indigo-700' : 'text-slate-700'}`}>{+d.split('-')[2]}</div>
                      <div className={`text-[9px] tabular-nums ${free === 0 ? 'text-rose-400' : 'text-slate-400'}`}>{free} free</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* rows */}
            {rooms.map((room, idx) => (
              <div key={room.id} className={`flex border-b border-slate-50 last:border-0 ${idx % 2 ? 'bg-slate-50/30' : 'bg-white'} hover:bg-indigo-50/20`}>
                <div className="w-40 flex-none border-r border-slate-100 px-3 py-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-slate-800">{room.roomNumber}</span>
                    <span className="truncate text-[11px] capitalize text-slate-400">{room.typeName || room.type || ''}</span>
                  </div>
                  {room.floor != null && room.floor !== '' && <span className="text-[10px] text-slate-300">Floor {room.floor}</span>}
                </div>
                <div className="relative flex flex-1">
                  {days.map((d) => {
                    const wd = toDate(d).getUTCDay();
                    return <button key={d} onClick={() => setNewFor({ roomId: room.id, checkIn: d, checkOut: addDays(d, 1) })}
                      className={`group flex-1 border-l border-slate-100 ${d === today ? 'bg-indigo-50/40' : (wd === 0 || wd === 6) ? 'bg-slate-50/50' : ''}`} aria-label={`Book room ${room.roomNumber} on ${d}`}>
                      <span className="flex h-full min-h-[42px] items-center justify-center opacity-0 group-hover:opacity-100"><FaPlus size={9} className="text-indigo-300" /></span>
                    </button>;
                  })}
                  {(byRoom[room.id] || []).map((r) => {
                    const st = barStyle(r);
                    if (!st) return null;
                    return (
                      <button key={r.id} onClick={() => setSelected(r)} style={st}
                        title={`${r.guestName} · ${ymd(r.checkIn)} → ${ymd(r.checkOut)} · ${r.nights}n`}
                        className={`absolute top-2 bottom-2 mx-[3px] flex items-center gap-1 overflow-hidden rounded-md px-2 text-[11px] font-semibold shadow-sm ring-1 ring-black/5 transition hover:brightness-105 ${STATUS_BAR[r.status] || 'bg-slate-300'}`}>
                        {r.status === 'checked_in' && <FaBed size={9} className="flex-none opacity-80" />}
                        <span className="truncate">{r.guestName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {newFor && (
        <NewBookingModal restaurantId={restaurantId} open initial={newFor} formatCurrency={formatCurrency}
          onClose={() => setNewFor(null)} onCreated={() => { setNewFor(null); notify('success', 'Booking created'); load(); }} />
      )}
      {selected && (
        <ReservationQuickView restaurantId={restaurantId} reservation={selected} formatCurrency={formatCurrency}
          onClose={() => setSelected(null)} onChanged={load} notify={notify} />
      )}
    </div>
  );
}

function Stat({ icon: Icon, tone, label, value, sub }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600', sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
      <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={14} /></span>
      <div className="min-w-0">
        <div className="text-lg font-semibold leading-none text-slate-900 tabular-nums">{value}</div>
        <div className="mt-0.5 truncate text-[11px] text-slate-400">{label} · {sub}</div>
      </div>
    </div>
  );
}
