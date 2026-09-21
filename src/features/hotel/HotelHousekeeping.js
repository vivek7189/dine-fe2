'use client';
import React from 'react';
import HotelShell from './components/HotelShell';
import HousekeepingBoard from './components/HousekeepingBoard';

export default function HotelHousekeeping() {
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[#2A241B]">Housekeeping</h1>
      <p className="mt-1 mb-6 text-[13.5px] text-[#9A9081]">Turn rooms around: dirty → clean → inspected → ready to sell.</p>
      <HousekeepingBoard {...ctx} />
    </>
  )}</HotelShell>;
}
