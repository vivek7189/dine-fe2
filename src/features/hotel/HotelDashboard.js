'use client';
import React from 'react';
import HotelShell from './components/HotelShell';
import DashboardView from './components/DashboardView';

export default function HotelDashboard() {
  return <HotelShell>{(ctx) => <DashboardView {...ctx} />}</HotelShell>;
}
