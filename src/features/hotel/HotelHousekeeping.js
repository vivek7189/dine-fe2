'use client';
import React from 'react';
import { FaBroom } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import HousekeepingBoard from './components/HousekeepingBoard';

export default function HotelHousekeeping() {
  return (
    <HotelShell icon={FaBroom} title="Housekeeping" subtitle="Turn rooms around: dirty → clean → inspected → ready to sell.">
      {(ctx) => <HousekeepingBoard {...ctx} />}
    </HotelShell>
  );
}
