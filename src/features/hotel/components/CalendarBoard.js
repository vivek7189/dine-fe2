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
// inline colors (guaranteed to render regardless of Tailwind JIT)
const BAR_COLOR = {
  confirmed: '#6D5B9A',   // arriving / confirmed → purple
  checked_in: '#4E6E8E',  // in-house → blue
  checked_out: '#B58836', // departed → gold
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
          <button onClick={() => setStart(addDays(start, -7))} className="rounded-lg border border-[var(--h-border2)] p-2 text-[var(--h-text)] hover:bg-[var(--h-hover)]" aria-label="Previous week"><FaChevronLeft size={12} /></button>
          <button onClick={() => setStart(today)} className="rounded-lg border border-[var(--h-border2)] px-3 py-1.5 text-sm font-medium text-[var(--h-ink2)] hover:bg-[var(--h-hover)]">Today</button>
          <button onClick={() => setStart(addDays(start, 7))} className="rounded-lg border border-[var(--h-border2)] p-2 text-[var(--h-text)] hover:bg-[var(--h-hover)]" aria-label="Next week"><FaChevronRight size={12} /></button>
          <span className="ml-1 text-sm font-medium text-[var(--h-text)]">{rangeLabel}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--h-muted)]">
          {unassigned > 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700">{unassigned} unassigned</span>}
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-[#6D5B9A]" /> Confirmed</span>
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-[#4E6E8E]" /> In-house</span>
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-[var(--h-faint3)]" /> Departed</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--h-border)] py-16 text-center text-[var(--h-faint)]">
          <FaBed className="mx-auto mb-2" size={22} /> No rooms yet — add rooms in <span className="font-medium text-[var(--h-muted)]">Rooms &amp; Types</span> first.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--h-border)] shadow-sm">
          <div className="min-w-[840px]">
            {/* header */}
            <div className="flex border-b border-[var(--h-border)] bg-[color-mix(in_srgb,var(--h-surface2)_80%,transparent)]">
              <div className="w-40 flex-none border-r border-[var(--h-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--h-faint)]">Room</div>
              <div className="flex flex-1">
                {days.map((d) => {
                  const wd = toDate(d).getUTCDay();
                  const isToday = d === today;
                  const free = Math.max(0, rooms.length - (occupiedByDay[d] || 0));
                  return (
                    <div key={d} className={`flex-1 border-l border-[var(--h-bsoft2)] py-1.5 text-center ${isToday ? 'bg-[var(--h-brand-soft)]' : (wd === 0 || wd === 6) ? 'bg-[color-mix(in_srgb,var(--h-bsoft2)_70%,transparent)]' : ''}`}>
                      <div className={`text-[10px] font-medium uppercase ${isToday ? 'text-[var(--h-brand)]' : 'text-[var(--h-faint)]'}`}>{WD[wd]}</div>
                      <div className={`text-[13px] font-semibold tabular-nums ${isToday ? 'text-[var(--h-brand-ink)]' : 'text-[var(--h-ink2)]'}`}>{+d.split('-')[2]}</div>
                      <div className={`text-[9px] tabular-nums ${free === 0 ? 'text-rose-400' : 'text-[var(--h-faint)]'}`}>{free} free</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* rows */}
            {rooms.map((room, idx) => (
              <div key={room.id} className={`flex border-b border-[var(--h-divider)] last:border-0 ${idx % 2 ? 'bg-[color-mix(in_srgb,var(--h-surface2)_30%,transparent)]' : 'bg-white'} hover:bg-[color-mix(in_srgb,var(--h-brand-soft)_20%,transparent)]`}>
                <div className="w-40 flex-none border-r border-[var(--h-bsoft2)] px-3 py-2.5">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold text-[var(--h-ink)]">{room.roomNumber}</span>
                    <span className="truncate text-[11px] capitalize text-[var(--h-faint)]">{room.typeName || room.type || ''}</span>
                  </div>
                  {room.floor != null && room.floor !== '' && <span className="text-[10px] text-[var(--h-faint3)]">Floor {room.floor}</span>}
                </div>
                <div className="relative flex flex-1">
                  {days.map((d) => {
                    const wd = toDate(d).getUTCDay();
                    return <button key={d} onClick={() => setNewFor({ roomId: room.id, checkIn: d, checkOut: addDays(d, 1) })}
                      className={`group flex-1 border-l border-[var(--h-bsoft2)] ${d === today ? 'bg-[var(--h-brand-tint)]' : (wd === 0 || wd === 6) ? 'bg-[var(--h-surface2)]' : ''}`} aria-label={`Book room ${room.roomNumber} on ${d}`}>
                      <span className="flex h-full min-h-[42px] items-center justify-center opacity-0 group-hover:opacity-100"><FaPlus size={9} className="text-[var(--h-brand-tint2)]" /></span>
                    </button>;
                  })}
                  {(byRoom[room.id] || []).map((r) => {
                    const st = barStyle(r);
                    if (!st) return null;
                    return (
                      <button key={r.id} onClick={() => setSelected(r)}
                        style={{ ...st, backgroundColor: BAR_COLOR[r.status] || 'var(--h-faint3)', color: '#fff' }}
                        title={`${r.guestName} · ${ymd(r.checkIn)} → ${ymd(r.checkOut)} · ${r.nights}n`}
                        className="absolute top-2 bottom-2 mx-[3px] flex items-center gap-1 overflow-hidden rounded-md px-2 text-[11px] font-semibold shadow-sm ring-1 ring-black/10 transition hover:brightness-110">
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
    indigo: 'bg-[var(--h-brand-soft)] text-[var(--h-brand)]', sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--h-border)] bg-white px-3.5 py-3 shadow-sm">
      <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={14} /></span>
      <div className="min-w-0">
        <div className="text-lg font-semibold leading-none text-[var(--h-ink)] tabular-nums">{value}</div>
        <div className="mt-0.5 truncate text-[11px] text-[var(--h-faint)]">{label} · {sub}</div>
      </div>
    </div>
  );
}
