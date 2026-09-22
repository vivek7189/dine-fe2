'use client';
import React from 'react';
import HotelShell from './components/HotelShell';
import ReservationsPanel from './components/ReservationsPanel';

export default function HotelReservations() {
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[var(--h-ink)]">Bookings</h1>
      <p className="mt-1 mb-6 text-[13.5px] text-[var(--h-muted2)]">Every reservation — search, assign, check-in / out and bill.</p>
      <ReservationsPanel {...ctx} />
    </>
  )}</HotelShell>;
}
