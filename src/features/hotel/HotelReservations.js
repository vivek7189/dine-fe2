'use client';
import React from 'react';
import { FaCalendarCheck } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import ReservationsPanel from './components/ReservationsPanel';

export default function HotelReservations() {
  return (
    <HotelShell icon={FaCalendarCheck} title="Bookings" subtitle="Every reservation — search, assign, check-in / out and bill.">
      {(ctx) => <ReservationsPanel {...ctx} />}
    </HotelShell>
  );
}
