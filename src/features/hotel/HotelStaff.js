'use client';
import React from 'react';
import { FaUsers } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import StaffView from './components/StaffView';

export default function HotelStaff() {
  return (
    <HotelShell icon={FaUsers} title="Staff" subtitle="Your team, organised by the area they cover.">
      {(ctx) => <StaffView {...ctx} />}
    </HotelShell>
  );
}
