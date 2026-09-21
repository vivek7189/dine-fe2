'use client';
import React from 'react';
import HotelShell from './components/HotelShell';
import GroupsView from './components/GroupsView';

export default function HotelGroups() {
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[#2A241B]">Groups &amp; Blocks</h1>
      <p className="mt-1 mb-6 text-[13.5px] text-[#9A9081]">Weddings, corporate offsites &amp; tour allotments — block rooms, track pickup, manage the rooming list.</p>
      <GroupsView {...ctx} />
    </>
  )}</HotelShell>;
}
