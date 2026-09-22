'use client';
import React, { useState } from 'react';
import { FaSignInAlt, FaSignOutAlt, FaReceipt, FaTimesCircle, FaWallet } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Modal, Btn, Pill, Field, inputCls } from './ui';
import FolioDrawer from './FolioDrawer';

const PAY = ['cash', 'card', 'upi', 'bank', 'other'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ymd = (v) => (typeof v === 'string' ? v.slice(0, 10) : v ? new Date(v).toISOString().slice(0, 10) : '');
const fmt = (v) => { const s = ymd(v); if (!s) return '—'; const [, m, d] = s.split('-'); return `${MONTHS[+m - 1]} ${+d}`; };

export default function ReservationQuickView({ restaurantId, reservation, formatCurrency, onClose, onChanged, notify }) {
  const [busy, setBusy] = useState(false);
  const [showFolio, setShowFolio] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [dep, setDep] = useState({ amount: '', method: 'cash' });
  const [cancelOpen, setCancelOpen] = useState(false);
  const [waiveFee, setWaiveFee] = useState(false);
  const r = reservation;
  const money = (v) => (formatCurrency ? formatCurrency(v || 0) : Number(v || 0).toLocaleString());

  const act = async (fn, okMsg) => {
    setBusy(true);
    try { await fn(); notify && notify('success', okMsg); onChanged && onChanged(); onClose(); }
    catch (e) { notify && notify('error', e.message || 'Action failed'); setBusy(false); }
  };

  const saveDeposit = async () => {
    const amount = Number(dep.amount);
    if (!(amount > 0)) return notify && notify('error', 'Enter a deposit amount');
    setBusy(true);
    try {
      await hotelApi.takeDeposit(restaurantId, r.id, { amount, method: dep.method });
      notify && notify('success', `Deposit of ${money(amount)} recorded`);
      onChanged && onChanged(); onClose();
    } catch (e) { notify && notify('error', e.message || 'Could not record deposit'); setBusy(false); }
  };

  const doCancel = () => act(() => hotelApi.cancelReservation(restaurantId, r.id, null, waiveFee), waiveFee ? 'Booking cancelled (fee waived)' : 'Booking cancelled');

  if (showFolio) {
    return <FolioDrawer restaurantId={restaurantId} reservation={r} formatCurrency={formatCurrency} onClose={onClose} onChanged={onChanged} />;
  }

  return (
    <Modal open title={r.guestName} onClose={onClose}
      footer={<>
        {(r.status === 'checked_in' || r.status === 'checked_out') && (
          <Btn variant="ghost" onClick={() => setShowFolio(true)}><FaReceipt size={12} /> Folio</Btn>
        )}
        {r.status === 'confirmed' && (
          <Btn variant="ghost" onClick={() => setDepositOpen(true)} disabled={busy}><FaWallet size={12} /> Deposit</Btn>
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
          <span className="capitalize text-[var(--h-muted)]">{r.status.replace('_', ' ')}</span>
        </div>
        <Row label="Room" value={r.roomNumber ? `${r.roomNumber}` : 'Unassigned'} />
        <Row label="Stay" value={`${fmt(r.checkIn)} → ${fmt(r.checkOut)} · ${r.nights} night${r.nights > 1 ? 's' : ''}`} />
        <Row label="Guests" value={`${r.adults} adult${r.adults > 1 ? 's' : ''}${r.children ? `, ${r.children} child` : ''}`} />
        <Row label="Total" value={r.totalAmount != null ? money(r.totalAmount) : '—'} />
        {r.depositAmount ? <Row label="Deposit paid" value={money(r.depositAmount)} /> : null}
        {r.guestPhone && <Row label="Phone" value={r.guestPhone} />}
        {(r.status === 'confirmed' || r.status === 'checked_in') && (
          <button onClick={() => { setWaiveFee(false); setCancelOpen(true); }}
            disabled={busy} className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--h-faint)] hover:text-rose-600">
            <FaTimesCircle size={11} /> Cancel booking
          </button>
        )}
      </div>

      {/* Deposit sub-modal */}
      {depositOpen && (
        <Modal open title="Record deposit / advance" onClose={() => setDepositOpen(false)}
          footer={<><Btn variant="ghost" onClick={() => setDepositOpen(false)}>Cancel</Btn><Btn onClick={saveDeposit} disabled={busy}>{busy ? 'Saving…' : 'Record deposit'}</Btn></>}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount" required><input type="number" min="0" step="0.01" className={inputCls} value={dep.amount} onChange={(e) => setDep({ ...dep, amount: e.target.value })} autoFocus /></Field>
            <Field label="Method"><select className={inputCls} value={dep.method} onChange={(e) => setDep({ ...dep, method: e.target.value })}>{PAY.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}</select></Field>
          </div>
          <p className="mt-2 text-[12px] text-[var(--h-faint)]">Advance is credited to the guest folio and offsets the balance at check-out.</p>
        </Modal>
      )}

      {/* Cancel sub-modal with policy-fee waive */}
      {cancelOpen && (
        <Modal open title="Cancel booking" onClose={() => setCancelOpen(false)}
          footer={<><Btn variant="ghost" onClick={() => setCancelOpen(false)}>Keep booking</Btn><Btn variant="danger" onClick={doCancel} disabled={busy}>{busy ? 'Cancelling…' : 'Cancel booking'}</Btn></>}>
          <p className="text-[13.5px] text-[var(--h-ink2)]">Cancel the booking for <strong>{r.guestName}</strong>?</p>
          <p className="mt-1 text-[12px] text-[var(--h-muted)]">Any cancellation fee (per your policy &amp; timing) will be posted to the folio.</p>
          <label className="mt-3 flex items-center gap-2 text-[13px] text-[var(--h-text)]">
            <input type="checkbox" checked={waiveFee} onChange={(e) => setWaiveFee(e.target.checked)} className="h-4 w-4 rounded border-[var(--h-border2)]" /> Waive the cancellation fee
          </label>
        </Modal>
      )}
    </Modal>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between border-b border-[var(--h-divider)] py-1.5">
      <span className="text-[var(--h-faint)]">{label}</span>
      <span className="font-medium text-[var(--h-ink2)]">{value}</span>
    </div>
  );
}
