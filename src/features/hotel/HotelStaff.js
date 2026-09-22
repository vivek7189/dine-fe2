'use client';
import React from 'react';
import HotelShell from './components/HotelShell';
import StaffView from './components/StaffView';

export default function HotelStaff() {
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[var(--h-ink)]">Staff</h1>
      <p className="mt-1 mb-6 text-[13.5px] text-[var(--h-muted2)]">Your team, organised by the area they cover.</p>
      <StaffView {...ctx} />
    </>
  )}</HotelShell>;
}
