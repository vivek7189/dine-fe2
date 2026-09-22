'use client';
import React from 'react';
import HotelShell from './components/HotelShell';
import GuestsView from './components/GuestsView';

export default function HotelGuests() {
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[var(--h-ink)]">Guests</h1>
      <p className="mt-1 mb-6 text-[13.5px] text-[var(--h-muted2)]">Guest profiles &amp; history — shared across your hotel and restaurant.</p>
      <GuestsView {...ctx} />
    </>
  )}</HotelShell>;
}
