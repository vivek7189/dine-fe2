'use client';
// Charge a restaurant / room-service bill to an in-house guest's folio.
// Isolated in features/hotel — the POS mounts it only for hotel accounts.
import React, { useState, useEffect } from 'react';
import { FaSpinner, FaBed, FaUtensils } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Btn } from './ui';

export default function ChargeToRoomModal({ restaurantId, amount, description, sourceRef, formatCurrency, onClose, onCharged }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toFixed(2));

  useEffect(() => {
    let off = false;
    hotelApi.listReservations(restaurantId, { status: 'checked_in' })
      .then((r) => { if (!off) setGuests((r.reservations || []).filter((x) => x.roomId)); })
      .catch((e) => { if (!off) setErr(e.message || 'Could not load in-house guests'); })
      .finally(() => { if (!off) setLoading(false); });
    return () => { off = true; };
  }, [restaurantId]);

  const charge = async (guest) => {
    setBusy(true); setErr(null);
    try {
      await hotelApi.postToRoom(restaurantId, {
        roomId: guest.roomId,
        description: description || 'Restaurant charge',
        amount: Number(amount) || 0,
        type: 'food',
        sourceRef: sourceRef || null,
      });
      onCharged && onCharged(guest);
    } catch (e) {
      setErr(e.message || 'Charge failed');
      setBusy(false);
    }
  };

  return (
    <Modal open title="Charge to room" onClose={busy ? undefined : onClose}>
      <div className="mb-3 flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2">
        <span className="flex items-center gap-2 text-sm text-indigo-700"><FaUtensils size={12} /> Bill amount</span>
        <span className="text-lg font-semibold text-indigo-800">{money(amount)}</span>
      </div>
      {description && <p className="mb-3 text-xs text-slate-400">{description}</p>}
      {err && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}

      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">In-house guests</div>
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : guests.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No checked-in guests to charge.</p>
      ) : (
        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {guests.map((g) => (
            <button key={g.id} disabled={busy} onClick={() => charge(g)}
              className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5 text-left hover:border-indigo-400 hover:bg-indigo-50/40 disabled:opacity-50">
              <span>
                <span className="block text-sm font-medium text-slate-800">{g.guestName}</span>
                <span className="block text-xs text-slate-400">Room {g.roomNumber}</span>
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-indigo-600"><FaBed size={11} /> Charge</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Btn variant="ghost" onClick={onClose} disabled={busy}>Cancel</Btn>
      </div>
    </Modal>
  );
}
