'use client';
import React, { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Field, inputCls, Btn } from './ui';

const nightsBetween = (ci, co) => {
  if (!ci || !co) return 0;
  const d = (new Date(co + 'T00:00:00Z') - new Date(ci + 'T00:00:00Z')) / 86400000;
  return d > 0 ? Math.round(d) : 0;
};

export default function NewBookingModal({ restaurantId, open, onClose, onCreated, formatCurrency, initial }) {
  const [form, setForm] = useState({ guestName: '', guestPhone: '', checkIn: '', checkOut: '', adults: 2, children: 0, roomId: '', rate: '' });
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [availErr, setAvailErr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const nights = nightsBetween(form.checkIn, form.checkOut);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // reset on open (honouring an optional prefill from the calendar)
  useEffect(() => {
    if (open) {
      setForm({
        guestName: '', guestPhone: '', adults: 2, children: 0, rate: '',
        checkIn: initial?.checkIn || '', checkOut: initial?.checkOut || '', roomId: initial?.roomId || '',
      });
      setRooms([]); setError(null); setAvailErr(null);
    }
  }, [open, initial]);

  // fetch availability whenever a valid date range is set
  useEffect(() => {
    if (!open || !form.checkIn || !form.checkOut || nights <= 0) { setRooms([]); return; }
    let cancelled = false;
    setLoadingRooms(true); setAvailErr(null);
    hotelApi.availability(restaurantId, form.checkIn, form.checkOut)
      .then((res) => {
        if (cancelled) return;
        const rr = res.rooms || [];
        setRooms(rr);
        if (!rr.length) setAvailErr('No rooms free for those dates.');
        // reconcile a prefilled room: drop it if no longer free; seed rate from tariff
        setForm((f) => {
          if (f.roomId && !rr.find((x) => x.id === f.roomId)) return { ...f, roomId: '' };
          const chosen = rr.find((x) => x.id === f.roomId);
          return chosen && (f.rate === '' || f.rate == null) ? { ...f, rate: chosen.tariff ?? '' } : f;
        });
      })
      .catch((e) => { if (!cancelled) { setRooms([]); setAvailErr(e.message || 'Could not load availability'); } })
      .finally(() => { if (!cancelled) setLoadingRooms(false); });
    return () => { cancelled = true; };
  }, [open, restaurantId, form.checkIn, form.checkOut, nights]);

  const pickRoom = (roomId) => {
    const r = rooms.find((x) => x.id === roomId);
    set({ roomId, rate: form.rate || (r?.tariff ?? '') });
  };

  const total = form.rate !== '' && nights > 0 ? Number(form.rate) * nights : null;

  const submit = async () => {
    if (!form.guestName.trim()) return setError('Guest name is required');
    if (nights <= 0) return setError('Enter valid check-in / check-out dates');
    setSaving(true); setError(null);
    try {
      await hotelApi.createReservation(restaurantId, {
        guestName: form.guestName.trim(), guestPhone: form.guestPhone.trim() || null,
        checkIn: form.checkIn, checkOut: form.checkOut,
        adults: Number(form.adults) || 1, children: Number(form.children) || 0,
        roomId: form.roomId || null, rate: form.rate === '' ? null : Number(form.rate),
        source: 'walk-in',
      });
      onCreated && onCreated();
      onClose();
    } catch (e) {
      setError(e.message || 'Booking failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="New booking"
      wide
      onClose={onClose}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit} disabled={saving}>{saving ? 'Booking…' : 'Create booking'}</Btn>
      </>}
    >
      <div className="space-y-3">
        {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Guest name" required><input className={inputCls} value={form.guestName} onChange={(e) => set({ guestName: e.target.value })} placeholder="Full name" /></Field>
          <Field label="Phone"><input className={inputCls} value={form.guestPhone} onChange={(e) => set({ guestPhone: e.target.value })} placeholder="Optional" /></Field>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <Field label="Check-in" required><input type="date" className={inputCls} value={form.checkIn} onChange={(e) => set({ checkIn: e.target.value, roomId: '' })} /></Field>
          <Field label="Check-out" required><input type="date" className={inputCls} value={form.checkOut} min={form.checkIn || undefined} onChange={(e) => set({ checkOut: e.target.value, roomId: '' })} /></Field>
          <Field label="Adults"><input type="number" min="1" className={inputCls} value={form.adults} onChange={(e) => set({ adults: e.target.value })} /></Field>
          <Field label="Children"><input type="number" min="0" className={inputCls} value={form.children} onChange={(e) => set({ children: e.target.value })} /></Field>
        </div>

        <Field label={`Available rooms${nights > 0 ? ` · ${nights} night${nights > 1 ? 's' : ''}` : ''}`} hint="Leave unassigned to book now and assign a room later.">
          {loadingRooms ? (
            <div className="flex items-center gap-2 py-2 text-sm text-[#A79C88]"><FaSpinner className="animate-spin" size={12} /> Checking availability…</div>
          ) : (
            <select className={inputCls} value={form.roomId} onChange={(e) => pickRoom(e.target.value)} disabled={nights <= 0}>
              <option value="">{nights <= 0 ? 'Pick dates first' : '— Unassigned —'}</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  Room {r.roomNumber}{r.typeName ? ` · ${r.typeName}` : ''}{r.tariff != null ? ` · ${formatCurrency ? formatCurrency(r.tariff) : r.tariff}/night` : ''}
                </option>
              ))}
            </select>
          )}
          {availErr && <span className="mt-1 block text-[11px] text-amber-600">{availErr}</span>}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Nightly rate"><input type="number" min="0" step="0.01" className={inputCls} value={form.rate} onChange={(e) => set({ rate: e.target.value })} placeholder="0" /></Field>
          <Field label="Total">
            <div className={`${inputCls} bg-[#FAF7F0] text-[#4A4335]`}>{total != null ? (formatCurrency ? formatCurrency(total) : total) : '—'}</div>
          </Field>
        </div>
      </div>
    </Modal>
  );
}
