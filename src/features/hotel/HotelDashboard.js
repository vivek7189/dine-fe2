'use client';
import React from 'react';
import { FaThLarge } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import DashboardView from './components/DashboardView';

export default function HotelDashboard() {
  return (
    <HotelShell icon={FaThLarge} title="Front desk" subtitle="Everything for today, at a glance.">
      {(ctx) => <DashboardView {...ctx} />}
    </HotelShell>
  );
}
