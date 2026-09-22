'use client';
import React from 'react';
import HotelShell from './components/HotelShell';
import HousekeepingBoard from './components/HousekeepingBoard';

export default function HotelHousekeeping() {
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[var(--h-ink)]">Housekeeping</h1>
      <p className="mt-1 mb-6 text-[13.5px] text-[var(--h-muted2)]">Turn rooms around: dirty → clean → inspected → ready to sell.</p>
      <HousekeepingBoard {...ctx} />
    </>
  )}</HotelShell>;
}
