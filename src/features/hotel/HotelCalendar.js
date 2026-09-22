'use client';
import React from 'react';
import HotelShell from './components/HotelShell';
import CalendarBoard from './components/CalendarBoard';

export default function HotelCalendar() {
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[var(--h-ink)]">Reservations · tape chart</h1>
      <p className="mt-1 mb-6 text-[13.5px] text-[var(--h-muted2)]">Every room down the side, the nights across. Click a cell to book, a bar to open the stay.</p>
      <CalendarBoard {...ctx} />
    </>
  )}</HotelShell>;
}
