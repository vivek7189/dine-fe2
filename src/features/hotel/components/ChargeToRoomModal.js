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
      <div className="mb-3 flex items-center justify-between rounded-lg bg-[var(--h-brand-soft)] px-3 py-2">
        <span className="flex items-center gap-2 text-sm text-[var(--h-brand-ink)]"><FaUtensils size={12} /> Bill amount</span>
        <span className="text-lg font-semibold text-[var(--h-brand-ink)]">{money(amount)}</span>
      </div>
      {description && <p className="mb-3 text-xs text-[var(--h-faint)]">{description}</p>}
      {err && <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{err}</div>}

      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--h-faint)]">In-house guests</div>
      {loading ? (
        <div className="flex items-center gap-2 py-6 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
      ) : guests.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--h-faint)]">No checked-in guests to charge.</p>
      ) : (
        <div className="max-h-72 space-y-1.5 overflow-y-auto">
          {guests.map((g) => (
            <button key={g.id} disabled={busy} onClick={() => charge(g)}
              className="flex w-full items-center justify-between rounded-lg border border-[var(--h-border)] px-3 py-2.5 text-left hover:border-[var(--h-brand-si)] hover:bg-[var(--h-brand-tint)] disabled:opacity-50">
              <span>
                <span className="block text-sm font-medium text-[var(--h-ink)]">{g.guestName}</span>
                <span className="block text-xs text-[var(--h-faint)]">Room {g.roomNumber}</span>
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-[var(--h-brand)]"><FaBed size={11} /> Charge</span>
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
