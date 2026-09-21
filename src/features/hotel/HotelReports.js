'use client';
import React, { useState } from 'react';
import { FaBuilding, FaLayerGroup } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import { HotelTabs } from './components/HotelTabs';
import ReportsView from './components/ReportsView';
import ChainView from './components/ChainView';

const TABS = [{ id: 'property', label: 'This property', icon: FaBuilding }, { id: 'group', label: 'Group', icon: FaLayerGroup }];

export default function HotelReports() {
  const [tab, setTab] = useState('property');
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[#2A241B]">Reports</h1>
      <p className="mt-1 mb-5 text-[13.5px] text-[#9A9081]">Occupancy, ADR, RevPAR and the night-audit view — for this property or the whole group.</p>
      <HotelTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'property' ? <ReportsView {...ctx} /> : <ChainView {...ctx} />}
    </>
  )}</HotelShell>;
}
