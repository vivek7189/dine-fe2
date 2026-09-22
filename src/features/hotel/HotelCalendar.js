'use client';
import React from 'react';
import { FaRegClock } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import CalendarBoard from './components/CalendarBoard';

export default function HotelCalendar() {
  return (
    <HotelShell icon={FaRegClock} title="Reservations · tape chart"
      subtitle="Every room down the side, the nights across. Click a cell to book, a bar to open the stay.">
      {(ctx) => <CalendarBoard {...ctx} />}
    </HotelShell>
  );
}
