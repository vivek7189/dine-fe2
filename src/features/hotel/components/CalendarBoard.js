'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaSpinner, FaPlus } from 'react-icons/fa';
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

const DAYS = 14; // window length

const STATUS_BAR = {
  confirmed: 'bg-amber-400/90 text-amber-950',
  checked_in: 'bg-emerald-500/90 text-white',
  checked_out: 'bg-slate-300 text-slate-600',
};

export default function CalendarBoard({ restaurantId, formatCurrency, notify }) {
  const [start, setStart] = useState(localToday());
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFor, setNewFor] = useState(null); // { roomId, checkIn, checkOut }
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

  // reservations grouped by room, only those with a room assigned
  const byRoom = useMemo(() => {
    const m = {};
    for (const r of reservations) if (r.roomId) (m[r.roomId] = m[r.roomId] || []).push(r);
    return m;
  }, [reservations]);
  const unassigned = reservations.filter((r) => !r.roomId).length;

  // bar geometry within the DAYS window (check_out exclusive)
  const barStyle = (r) => {
    const ci = ymd(r.checkIn), co = ymd(r.checkOut);
    const left = Math.max(0, diffDays(start, ci));
    const right = Math.min(DAYS, diffDays(start, co));
    if (right <= left) return null;
    return { left: `${(left / DAYS) * 100}%`, width: `${((right - left) / DAYS) * 100}%` };
  };

  return (
    <div>
      {/* toolbar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setStart(addDays(start, -7))} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50" aria-label="Previous week"><FaChevronLeft size={12} /></button>
          <button onClick={() => setStart(today)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Today</button>
          <button onClick={() => setStart(addDays(start, 7))} className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50" aria-label="Next week"><FaChevronRight size={12} /></button>
          <span className="ml-1 text-sm text-slate-500">{MO[+ymd(start).split('-')[1] - 1]} {(+ymd(start).split('-')[2])} – {MO[+ymd(addDays(start, DAYS - 1)).split('-')[1] - 1]} {(+ymd(addDays(start, DAYS - 1)).split('-')[2])}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {unassigned > 0 && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">{unassigned} unassigned</span>}
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" /> Confirmed</span>
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" /> In-house</span>
          <span className="flex items-center gap-1"><i className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-300" /> Departed</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : rooms.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-400">No rooms yet — add rooms first.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <div className="min-w-[760px]">
            {/* header */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              <div className="w-36 flex-none px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Room</div>
              <div className="flex flex-1">
                {days.map((d) => {
                  const wd = new Date(d + 'T00:00:00Z').getUTCDay();
                  const isToday = d === today;
                  return (
                    <div key={d} className={`flex-1 border-l border-slate-100 py-1.5 text-center text-[11px] ${isToday ? 'bg-indigo-50 font-semibold text-indigo-700' : (wd === 0 || wd === 6) ? 'bg-slate-100/60 text-slate-400' : 'text-slate-500'}`}>
                      <div>{WD[wd]}</div>
                      <div className="tabular-nums">{+d.split('-')[2]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* rows */}
            {rooms.map((room) => (
              <div key={room.id} className="flex border-b border-slate-50 last:border-0 hover:bg-slate-50/40">
                <div className="w-36 flex-none px-3 py-2.5">
                  <div className="text-sm font-semibold text-slate-800">{room.roomNumber}</div>
                  <div className="text-[11px] text-slate-400">{room.typeName || room.type || ''}</div>
                </div>
                <div className="relative flex flex-1">
                  {/* day cells (click to book) */}
                  {days.map((d) => (
                    <button key={d} onClick={() => setNewFor({ roomId: room.id, checkIn: d, checkOut: addDays(d, 1) })}
                      className="group flex-1 border-l border-slate-100" aria-label={`Book room ${room.roomNumber} on ${d}`}>
                      <span className="flex h-full min-h-[40px] items-center justify-center opacity-0 group-hover:opacity-100"><FaPlus size={9} className="text-slate-300" /></span>
                    </button>
                  ))}
                  {/* reservation bars */}
                  {(byRoom[room.id] || []).map((r) => {
                    const st = barStyle(r);
                    if (!st) return null;
                    return (
                      <button key={r.id} onClick={() => setSelected(r)} style={st}
                        title={`${r.guestName} · ${ymd(r.checkIn)} → ${ymd(r.checkOut)}`}
                        className={`absolute top-1.5 bottom-1.5 mx-0.5 flex items-center overflow-hidden rounded px-1.5 text-[11px] font-medium shadow-sm hover:brightness-105 ${STATUS_BAR[r.status] || 'bg-slate-300'}`}>
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
