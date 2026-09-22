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
      <p className="mb-3 text-sm text-[var(--h-muted)]">{fmtDate(reservation.checkIn)} → {fmtDate(reservation.checkOut)} · {reservation.nights} night{reservation.nights > 1 ? 's' : ''}</p>
      {err && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : rooms.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--h-faint)]">No rooms free for these dates.</p>
      ) : (
        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {rooms.map((r) => (
            <button key={r.id} disabled={busy} onClick={() => assign(r.id)}
              className="flex w-full items-center justify-between rounded-lg border border-[var(--h-border)] px-3 py-2 text-left text-sm hover:border-[var(--h-brand-si)] hover:bg-[var(--h-brand-tint)] disabled:opacity-50">
              <span className="font-medium text-[var(--h-ink)]">Room {r.roomNumber}{r.typeName ? <span className="font-normal text-[var(--h-muted)]"> · {r.typeName}</span> : null}</span>
              <span className="text-[var(--h-muted)]">{r.tariff != null ? (formatCurrency ? formatCurrency(r.tariff) : r.tariff) : ''}</span>
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
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-[var(--h-brand-tint2)] bg-[var(--h-brand-tint)] px-3 py-2 text-sm">
        <FaCalendarCheck className="text-[var(--h-brand)]" size={12} />
        <span className="text-[var(--h-brand-ink)]">Direct booking link:</span>
        <a href={bookingUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--h-brand)] hover:underline">{bookingUrl}</a>
        <button onClick={copyLink} className="rounded-md border border-[var(--h-brand-tint2)] bg-white px-2 py-1 text-xs font-medium text-[var(--h-brand)] hover:bg-[var(--h-brand-soft)]">{copied ? 'Copied!' : 'Copy'}</button>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-[var(--h-border)] bg-white p-1">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${filter === f.id ? 'bg-[var(--h-brand)] text-white' : 'text-[var(--h-text)] hover:bg-[var(--h-hover)]'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Btn onClick={() => setShowNew(true)}><FaPlus size={12} /> New booking</Btn>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--h-border)] py-12 text-center text-[var(--h-faint)]">
          <FaCalendarCheck className="mx-auto mb-2" size={22} />
          No reservations here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--h-border)]">
          <table className="min-w-full divide-y divide-[var(--h-bsoft2)] text-sm">
            <thead className="bg-[var(--h-surface2)] text-left text-xs uppercase tracking-wide text-[var(--h-faint)]">
              <tr>
                <th className="px-4 py-2 font-medium">Guest</th>
                <th className="px-4 py-2 font-medium">Room</th>
                <th className="px-4 py-2 font-medium">Stay</th>
                <th className="px-4 py-2 font-medium">Total</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--h-divider)]">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[color-mix(in_srgb,var(--h-hover)_60%,transparent)]">
                  <td className="px-4 py-2.5">
                    <div className="font-semibold text-[var(--h-ink)]">{r.guestName}</div>
                    <div className="text-xs text-[var(--h-faint)]">{r.guestPhone || r.code}</div>
                  </td>
                  <td className="px-4 py-2.5 text-[var(--h-text)]">{r.roomNumber || <span className="text-amber-600">Unassigned</span>}</td>
                  <td className="px-4 py-2.5 text-[var(--h-text)]">{fmtDate(r.checkIn)} → {fmtDate(r.checkOut)}<span className="ml-1 text-xs text-[var(--h-faint)]">· {r.nights}n</span></td>
                  <td className="px-4 py-2.5 text-[var(--h-text)]">{r.totalAmount != null ? (formatCurrency ? formatCurrency(r.totalAmount) : r.totalAmount) : '—'}</td>
                  <td className="px-4 py-2.5">{(() => {
                    const S = { confirmed: ['Confirmed', '#6D5B9A', '#EEEAF6'], checked_in: ['In-house', '#4E6E8E', '#EAF0F5'], checked_out: ['Departed', '#8A6721', '#F6EEDD'], cancelled: ['Cancelled', 'var(--h-muted2)', 'var(--h-canvas2)'], no_show: ['No-show', '#8A3F31', '#F5E6E2'] }[r.status] || ['—', 'var(--h-muted)', 'var(--h-bsoft2)'];
                    return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: S[1], background: S[2] }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: S[1] }} />{S[0]}</span>;
                  })()}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      {busyId === r.id && <FaSpinner className="animate-spin text-[var(--h-faint)]" />}
                      {r.status === 'confirmed' && !r.roomId && (
                        <button onClick={() => setAssign(r)} className="inline-flex items-center gap-1 rounded-md border border-[var(--h-border2)] px-2 py-1 text-xs text-[var(--h-ink2)] hover:bg-[var(--h-hover)]"><FaBed size={11} /> Assign</button>
                      )}
                      {r.status === 'confirmed' && r.roomId && (
                        <button onClick={() => doCheckIn(r)} disabled={busyId === r.id} style={{ backgroundColor: 'var(--h-brand)' }} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"><FaSignInAlt size={11} /> Check-in</button>
                      )}
                      {(r.status === 'checked_in' || r.status === 'checked_out') && (
                        <button onClick={() => setFolioRes(r)} className="inline-flex items-center gap-1 rounded-md border border-[var(--h-border2)] px-2 py-1 text-xs text-[var(--h-ink2)] hover:bg-[var(--h-hover)]"><FaReceipt size={11} /> Folio</button>
                      )}
                      {r.status === 'checked_in' && (
                        <button onClick={() => doCheckOut(r)} disabled={busyId === r.id} style={{ backgroundColor: '#4E6E8E' }} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"><FaSignOutAlt size={11} /> Check-out</button>
                      )}
                      {(r.status === 'confirmed' || r.status === 'checked_in') && (
                        <button onClick={() => doCancel(r)} disabled={busyId === r.id} className="inline-flex items-center gap-1 rounded-md border border-[var(--h-border)] px-2 py-1 text-xs text-[var(--h-muted)] hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"><FaTimesCircle size={11} /></button>
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
