'use client';
import React, { useState } from 'react';
import { FaBuilding, FaLayerGroup, FaMoon } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import { HotelTabs } from './components/HotelTabs';
import ReportsView from './components/ReportsView';
import ChainView from './components/ChainView';
import NightAuditView from './components/NightAuditView';

const TABS = [
  { id: 'property', label: 'This property', icon: FaBuilding },
  { id: 'audit', label: 'Night audit', icon: FaMoon },
  { id: 'group', label: 'Group', icon: FaLayerGroup },
];

export default function HotelReports() {
  const [tab, setTab] = useState('property');
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[var(--h-ink)]">Reports</h1>
      <p className="mt-1 mb-5 text-[13.5px] text-[var(--h-muted2)]">Occupancy, ADR, RevPAR and the night-audit view — for this property or the whole group.</p>
      <HotelTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'property' ? <ReportsView {...ctx} /> : tab === 'audit' ? <NightAuditView {...ctx} /> : <ChainView {...ctx} />}
    </>
  )}</HotelShell>;
}
