'use client';
import React from 'react';
import HotelShell from './components/HotelShell';
import GroupsView from './components/GroupsView';

export default function HotelGroups() {
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[var(--h-ink)]">Groups &amp; Blocks</h1>
      <p className="mt-1 mb-6 text-[13.5px] text-[var(--h-muted2)]">Weddings, corporate offsites &amp; tour allotments — block rooms, track pickup, manage the rooming list.</p>
      <GroupsView {...ctx} />
    </>
  )}</HotelShell>;
}
