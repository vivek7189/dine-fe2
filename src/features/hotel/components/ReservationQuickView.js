'use client';
import React, { useState } from 'react';
import { FaSignInAlt, FaSignOutAlt, FaReceipt, FaTimesCircle } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Btn, Pill } from './ui';
import FolioDrawer from './FolioDrawer';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ymd = (v) => (typeof v === 'string' ? v.slice(0, 10) : v ? new Date(v).toISOString().slice(0, 10) : '');
const fmt = (v) => { const s = ymd(v); if (!s) return '—'; const [, m, d] = s.split('-'); return `${MONTHS[+m - 1]} ${+d}`; };

export default function ReservationQuickView({ restaurantId, reservation, formatCurrency, onClose, onChanged, notify }) {
  const [busy, setBusy] = useState(false);
  const [showFolio, setShowFolio] = useState(false);
  const r = reservation;

  const act = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); notify && notify('success', okMsg); onChanged && onChanged(); onClose(); }
    catch (e) { notify && notify('error', e.message || 'Action failed'); setBusy(false); }
  };

  if (showFolio) {
    return <FolioDrawer restaurantId={restaurantId} reservation={r} formatCurrency={formatCurrency} onClose={onClose} onChanged={onChanged} />;
  }

  return (
    <Modal open title={r.guestName} onClose={onClose}
      footer={<>
        {(r.status === 'checked_in' || r.status === 'checked_out') && (
          <Btn variant="ghost" onClick={() => setShowFolio(true)}><FaReceipt size={12} /> Folio</Btn>
        )}
        {r.status === 'confirmed' && r.roomId && (
          <Btn onClick={() => act(() => hotelApi.checkIn(restaurantId, r.id), `${r.guestName} checked in`)} disabled={busy}><FaSignInAlt size={12} /> Check-in</Btn>
        )}
        {r.status === 'checked_in' && (
          <Btn onClick={() => act(() => hotelApi.checkOut(restaurantId, r.id), `${r.guestName} checked out`)} disabled={busy}><FaSignOutAlt size={12} /> Check-out</Btn>
        )}
      </>}
    >
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Pill value={r.status === 'checked_in' ? 'occupied' : r.status === 'checked_out' ? 'inspected' : 'reserved'} />
          <span className="capitalize text-slate-500">{r.status.replace('_', ' ')}</span>
        </div>
        <Row label="Room" value={r.roomNumber ? `${r.roomNumber}` : 'Unassigned'} />
        <Row label="Stay" value={`${fmt(r.checkIn)} → ${fmt(r.checkOut)} · ${r.nights} night${r.nights > 1 ? 's' : ''}`} />
        <Row label="Guests" value={`${r.adults} adult${r.adults > 1 ? 's' : ''}${r.children ? `, ${r.children} child` : ''}`} />
        <Row label="Total" value={r.totalAmount != null ? (formatCurrency ? formatCurrency(r.totalAmount) : r.totalAmount) : '—'} />
        {r.guestPhone && <Row label="Phone" value={r.guestPhone} />}
        {(r.status === 'confirmed' || r.status === 'checked_in') && (
          <button
            onClick={() => { if (window.confirm(`Cancel booking for ${r.guestName}?`)) act(() => hotelApi.cancelReservation(restaurantId, r.id), 'Booking cancelled'); }}
            disabled={busy} className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600">
            <FaTimesCircle size={11} /> Cancel booking
          </button>
        )}
      </div>
    </Modal>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-50 py-1.5">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
