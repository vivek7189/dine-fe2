'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { FaSpinner, FaArrowRight } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { T, STATUS, Chip } from '../theme';

const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const ymd = (v) => (typeof v === 'string' ? v.slice(0, 10) : v ? new Date(v).toISOString().slice(0, 10) : '');
const initials = (n) => (n || '').trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || '?';

export default function DashboardView({ restaurantId, formatCurrency, notify }) {
  const [rooms, setRooms] = useState([]);
  const [resv, setResv] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const today = localToday();
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : `₹${Number(v || 0).toLocaleString()}`);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const [rm, rs, rep] = await Promise.all([
        hotelApi.listRooms(restaurantId),
        hotelApi.listReservations(restaurantId, { from: addDays(today, -1), to: addDays(today, 2) }),
        hotelApi.reportSummary(restaurantId, { from: today, to: addDays(today, 1), asOf: today }).catch(() => null),
      ]);
      setRooms(rm.rooms || []);
      setResv((rs.reservations || []).filter((r) => r.status !== 'cancelled'));
      setReport(rep?.report || null);
    } catch (e) { notify('error', e.message || 'Failed to load'); }
    finally { setLoading(false); }
  }, [restaurantId, today, notify]);
  useEffect(() => { load(); }, [load]);

  const d = useMemo(() => {
    const total = rooms.length;
    const inHouse = resv.filter((r) => r.status === 'checked_in' && ymd(r.checkIn) <= today && ymd(r.checkOut) > today);
    const arrivals = resv.filter((r) => ymd(r.checkIn) === today && r.status === 'confirmed');
    const departures = resv.filter((r) => ymd(r.checkOut) === today && r.status === 'checked_in');
    const arrivalByRoom = {}; for (const r of arrivals) if (r.roomId) arrivalByRoom[r.roomId] = r;
    const snap = report?.snapshot || {};
    const occ = snap.occupancy != null ? snap.occupancy : (total ? Math.round((inHouse.length / total) * 100) : 0);
    return { total, inHouse, arrivals, departures, arrivalByRoom, occ, adr: snap.adr || 0, revpar: snap.revpar || 0 };
  }, [rooms, resv, report, today]);

  const roomState = (room) => {
    if (room.status === 'occupied') return { ...STATUS.occupied, guest: room.currentGuest };
    if (d.arrivalByRoom[room.id]) return { ...STATUS.arriving, guest: d.arrivalByRoom[room.id].guestName };
    if (room.status === 'out-of-service' || room.housekeepingStatus === 'out-of-order') return { ...STATUS['out-of-order'], guest: null };
    if (room.housekeepingStatus === 'dirty') return { ...STATUS.dirty, guest: null };
    return { ...STATUS.available, guest: null };
  };

  const act = async (fn, id, msg) => { setBusyId(id); try { await fn(); notify('success', msg); await load(); } catch (e) { notify('error', e.message); } finally { setBusyId(null); } };

  if (loading) return <div className="flex items-center gap-2 py-16 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>;

  return (
    <div>
      <h1 className={T.h1}>Front desk</h1>
      <p className={`mt-1 mb-6 ${T.sub}`}>{d.total} rooms · everything for today at a glance</p>

      {/* KPI cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Occupancy" value={`${d.occ}%`} bar={{ pct: d.occ, color: '#4E6E8E' }} />
        <Kpi label="In-house" value={<><span className="tabular-nums">{d.inHouse.length}</span><span className="text-[16px] font-normal text-[var(--h-faint)]"> / {d.total}</span></>} bar={{ pct: d.total ? (d.inHouse.length / d.total) * 100 : 0, color: '#3E7C5A' }} />
        <Kpi label="ADR" value={money(d.adr)} />
        <Kpi label="RevPAR" value={money(d.revpar)} />
        <Kpi label="Arrivals today" value={<span className="text-[#6D5B9A]">{d.arrivals.length}</span>} />
        <Kpi label="Departures" value={<span className="text-[#B58836]">{d.departures.length}</span>} />
      </div>

      {/* arrivals + departures */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ListCard title="Arrivals" count={`${d.arrivals.length} expected`} href="/hotel/pms/reservations" empty="No arrivals today.">
          {d.arrivals.map((r) => (
            <GuestRow key={r.id} name={r.guestName} sub={`${r.roomNumber ? `Rm ${r.roomNumber} · ` : ''}${r.nights} night${r.nights > 1 ? 's' : ''}`} chip={<Chip tone="confirmed">Confirmed</Chip>}
              action={r.roomId
                ? <BrassBtn busy={busyId === r.id} onClick={() => act(() => hotelApi.checkIn(restaurantId, r.id), r.id, `${r.guestName} checked in`)}>Check in</BrassBtn>
                : <span className="text-[11px] text-[#B58836]">Assign room</span>} />
          ))}
        </ListCard>
        <ListCard title="Departures" count={`${d.departures.length} due`} href="/hotel/pms/reservations" empty="No departures today.">
          {d.departures.map((r) => (
            <GuestRow key={r.id} name={r.guestName} sub={`Rm ${r.roomNumber} · checkout`} chip={<Chip tone="in_house">In-house</Chip>}
              action={<BrassBtn busy={busyId === r.id} onClick={() => act(() => hotelApi.checkOut(restaurantId, r.id), r.id, `${r.guestName} checked out`)}>Check out</BrassBtn>} />
          ))}
        </ListCard>
      </div>

      {/* room status grid */}
      <h2 className={`${T.h2} mb-1`}>Room status</h2>
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-[var(--h-text)]">
        {['occupied', 'available', 'dirty', 'arriving', 'out-of-order'].map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-sm ${STATUS[k].dot}`} /> {STATUS[k].label}</span>
        ))}
      </div>
      {rooms.length === 0 ? (
        <div className={`${T.card} py-12 text-center ${T.faint}`}>No rooms yet — add them in Setup.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {rooms.map((room) => {
            const st = roomState(room);
            return (
              <div key={room.id} className={`${T.card} overflow-hidden p-0`}>
                <div className="border-l-[3px] px-3 py-2.5" style={{ borderColor: st.solid }}>
                  <div className="flex items-start justify-between">
                    <span className="text-[17px] font-bold leading-none text-[var(--h-ink)]">{room.roomNumber}</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: st.solid }}>{st.label.split(' · ')[1] || st.label}</span>
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-[var(--h-faint)]">{room.typeName || room.type || ''}</div>
                  <div className="mt-0.5 h-4 truncate text-[12px] text-[var(--h-ink2)]">{st.guest || ''}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, bar }) {
  return (
    <div className={`${T.card} p-4`}>
      <div className={T.label}>{label}</div>
      <div className="mt-1.5 font-serif text-[26px] font-semibold leading-none text-[var(--h-ink)]">{value}</div>
      {bar && (
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--h-track)]">
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, bar.pct)}%`, background: bar.color }} />
        </div>
      )}
    </div>
  );
}
function ListCard({ title, count, href, empty, children }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div className={`${T.card} overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-[var(--h-bsoft)] px-4 py-3">
        <div className="flex items-center gap-2"><span className={T.h2}>{title}</span><span className="rounded-md bg-[var(--h-bsoft2)] px-2 py-0.5 text-[11px] font-medium text-[var(--h-muted)]">{count}</span></div>
        <Link href={href} className={`inline-flex items-center gap-1 text-[12.5px] font-medium ${T.brassText} hover:underline`}>View all <FaArrowRight size={9} /></Link>
      </div>
      <div className="divide-y divide-[var(--h-bsoft2)]">{items.length ? items : <p className="px-4 py-8 text-center text-[13px] text-[var(--h-faint2)]">{empty}</p>}</div>
    </div>
  );
}
function GuestRow({ name, sub, chip, action }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--h-brand-tint)] text-[11px] font-semibold text-[var(--h-brand-ink)]">{initials(name)}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold text-[var(--h-ink)]">{name}</div>
        <div className="truncate text-[12px] text-[var(--h-muted2)]">{sub}</div>
      </div>
      {chip}
      {action}
    </div>
  );
}
function BrassBtn({ busy, onClick, children }) {
  return <button onClick={onClick} disabled={busy} style={{ backgroundColor: 'var(--h-brand)' }} className="inline-flex flex-none items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-50">{busy && <FaSpinner className="animate-spin" size={10} />}{children}</button>;
}
