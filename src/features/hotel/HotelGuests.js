'use client';
import React from 'react';
import { FaUser } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import GuestsView from './components/GuestsView';

export default function HotelGuests() {
  return (
    <HotelShell icon={FaUser} title="Guests" subtitle="Guest profiles & history — shared across your hotel and restaurant.">
      {(ctx) => <GuestsView {...ctx} />}
    </HotelShell>
  );
}
