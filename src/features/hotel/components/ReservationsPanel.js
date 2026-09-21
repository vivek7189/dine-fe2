'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaSpinner, FaSignInAlt, FaSignOutAlt, FaBed, FaTimesCircle, FaCalendarCheck, FaReceipt } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Btn, Pill, StatCard } from './ui';
import NewBookingModal from './NewBookingModal';
import FolioDrawer from './FolioDrawer';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ymd = (v) => (typeof v === 'string' ? v.slice(0, 10) : v ? new Date(v).toISOString().slice(0, 10) : '');
const fmtDate = (v) => { const s = ymd(v); if (!s) return '—'; const [, m, d] = s.split('-'); return `${MONTHS[+m - 1]} ${+d}`; };
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const FILTERS = [
  { id: 'upcoming', label: 'Upcoming', params: { status: 'confirmed' } },
  { id: 'inhouse', label: 'In-house', params: { status: 'checked_in' } },
  { id: 'checkedout', label: 'Checked-out', params: { status: 'checked_out' } },
  { id: 'all', label: 'All', params: {} },
];

// Assign-room modal — lists rooms free for THIS reservation's dates.
function AssignModal({ restaurantId, reservation, onClose, onAssigned, formatCurrency }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  useEffect(() => {
    let off = false;
    hotelApi.availability(restaurantId, ymd(reservation.checkIn), ymd(reservation.checkOut), { excludeReservationId: reservation.id })
      .then((r) => !off && setRooms(r.rooms || []))
      .catch((e) => !off && setErr(e.message))
      .finally(() => !off && setLoading(false));
    return () => { off = true; };
  }, [restaurantId, reservation]);
  const assign = async (roomId) => {
    setBusy(true); setErr(null);
    try { await hotelApi.assignRoom(restaurantId, reservation.id, roomId); onAssigned(); onClose(); }
    catch (e) { setErr(e.message || 'Assign failed'); setBusy(false); }
  };
  return (
    <Modal open title={`Assign a room · ${reservation.guestName}`} onClose={onClose}>
      <p className="mb-3 text-sm text-slate-500">{fmtDate(reservation.checkIn)} → {fmtDate(reservation.checkOut)} · {reservation.nights} night{reservation.nights > 1 ? 's' : ''}</p>
      {err && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : rooms.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No rooms free for these dates.</p>
      ) : (
        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {rooms.map((r) => (
            <button key={r.id} disabled={busy} onClick={() => assign(r.id)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-sm hover:border-indigo-400 hover:bg-indigo-50/40 disabled:opacity-50">
              <span className="font-medium text-slate-800">Room {r.roomNumber}{r.typeName ? <span className="font-normal text-slate-500"> · {r.typeName}</span> : null}</span>
              <span className="text-slate-500">{r.tariff != null ? (formatCurrency ? formatCurrency(r.tariff) : r.tariff) : ''}</span>
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function ReservationsPanel({ restaurantId, formatCurrency, notify }) {
  const [filter, setFilter] = useState('upcoming');
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [assign, setAssign] = useState(null);
  const [folioRes, setFolioRes] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    const today = localToday();
    try {
      const params = FILTERS.find((f) => f.id === filter)?.params || {};
      const [res, near] = await Promise.all([
        hotelApi.listReservations(restaurantId, params),
        hotelApi.listReservations(restaurantId, { from: addDays(today, -1), to: addDays(today, 2) }),
      ]);
      setRows(res.reservations || []);
      const n = (near.reservations || []).filter((r) => r.status !== 'cancelled');
      setSummary({
        arrivals: n.filter((r) => ymd(r.checkIn) === today).length,
        departures: n.filter((r) => ymd(r.checkOut) === today && r.status !== 'checked_out').length,
        inHouse: n.filter((r) => r.status === 'checked_in' && ymd(r.checkIn) <= today && ymd(r.checkOut) > today).length,
        unassigned: n.filter((r) => !r.roomId && r.status === 'confirmed').length,
      });
    } catch (e) {
      notify('error', e.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, filter, notify]);

  useEffect(() => { load(); }, [load]);

  const act = async (fn, id, okMsg) => {
    setBusyId(id);
    try { await fn(); notify('success', okMsg); await load(); }
    catch (e) { notify('error', e.message || 'Action failed'); }
    finally { setBusyId(null); }
  };
  const doCheckIn = (r) => act(() => hotelApi.checkIn(restaurantId, r.id), r.id, `${r.guestName} checked in`);
  const doCheckOut = (r) => act(() => hotelApi.checkOut(restaurantId, r.id), r.id, `${r.guestName} checked out`);
  const doCancel = (r) => { if (window.confirm(`Cancel booking for ${r.guestName}?`)) act(() => hotelApi.cancelReservation(restaurantId, r.id), r.id, 'Booking cancelled'); };

  const bookingUrl = typeof window !== 'undefined' ? `${window.location.origin}/book/hotel/${restaurantId}` : '';
  const [copied, setCopied] = useState(false);
  const copyLink = () => { try { navigator.clipboard.writeText(bookingUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* noop */ } };

  return (
    <div>
      {summary && (
        <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatCard icon={FaSignInAlt} tone="emerald" label="Arrivals today" value={summary.arrivals} />
          <StatCard icon={FaBed} tone="indigo" label="In-house" value={summary.inHouse} />
          <StatCard icon={FaSignOutAlt} tone="rose" label="Departures today" value={summary.departures} />
          <StatCard icon={FaCalendarCheck} tone="amber" label="Unassigned" value={summary.unassigned} />
        </div>
      )}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2 text-sm">
        <FaCalendarCheck className="text-indigo-500" size={12} />
        <span className="text-indigo-700">Direct booking link:</span>
        <a href={bookingUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-xs text-indigo-600 hover:underline">{bookingUrl}</a>
        <button onClick={copyLink} className="rounded-md border border-indigo-200 bg-white px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${filter === f.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Btn onClick={() => setShowNew(true)}><FaPlus size={12} /> New booking</Btn>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-slate-400">
          <FaCalendarCheck className="mx-auto mb-2" size={22} />
          No reservations here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-2 font-medium">Guest</th>
                <th className="px-4 py-2 font-medium">Room</th>
                <th className="px-4 py-2 font-medium">Stay</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-slate-800">{r.guestName}</div>
                    <div className="text-xs text-slate-400">{r.guestPhone || r.code}</div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{r.roomNumber || <span className="text-amber-600">Unassigned</span>}</td>
                  <td className="px-4 py-2.5 text-slate-600">{fmtDate(r.checkIn)} → {fmtDate(r.checkOut)}<span className="ml-1 text-xs text-slate-400">· {r.nights}n</span></td>
                  <td className="px-4 py-2.5 text-slate-600">{r.totalAmount != null ? (formatCurrency ? formatCurrency(r.totalAmount) : r.totalAmount) : '—'}</td>
                  <td className="px-4 py-2.5"><Pill value={r.status === 'checked_in' ? 'occupied' : r.status === 'checked_out' ? 'inspected' : r.status === 'cancelled' ? 'out-of-service' : 'reserved'} /><span className="ml-1 text-xs capitalize text-slate-400">{r.status.replace('_', ' ')}</span></td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      {busyId === r.id && <FaSpinner className="animate-spin text-slate-400" />}
                      {r.status === 'confirmed' && !r.roomId && (
                        <button onClick={() => setAssign(r)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"><FaBed size={11} /> Assign</button>
                      )}
                      {r.status === 'confirmed' && r.roomId && (
                        <button onClick={() => doCheckIn(r)} disabled={busyId === r.id} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"><FaSignInAlt size={11} /> Check-in</button>
                      )}
                      {(r.status === 'checked_in' || r.status === 'checked_out') && (
                        <button onClick={() => setFolioRes(r)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"><FaReceipt size={11} /> Folio</button>
                      )}
                      {r.status === 'checked_in' && (
                        <button onClick={() => doCheckOut(r)} disabled={busyId === r.id} className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-50"><FaSignOutAlt size={11} /> Check-out</button>
                      )}
                      {(r.status === 'confirmed' || r.status === 'checked_in') && (
                        <button onClick={() => doCancel(r)} disabled={busyId === r.id} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"><FaTimesCircle size={11} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewBookingModal restaurantId={restaurantId} open={showNew} onClose={() => setShowNew(false)} onCreated={() => { notify('success', 'Booking created'); load(); }} formatCurrency={formatCurrency} />
      {assign && <AssignModal restaurantId={restaurantId} reservation={assign} onClose={() => setAssign(null)} onAssigned={() => { notify('success', 'Room assigned'); load(); }} formatCurrency={formatCurrency} />}
      {folioRes && <FolioDrawer restaurantId={restaurantId} reservation={folioRes} formatCurrency={formatCurrency} onClose={() => setFolioRes(null)} onChanged={load} />}
    </div>
  );
}
