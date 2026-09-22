'use client';
import React, { useState } from 'react';
import { FaTags, FaGlobe, FaLayerGroup } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import { HotelTabs } from './components/HotelTabs';
import RateGrid from './components/RateGrid';
import RatePlansPanel from './components/RatePlansPanel';
import ChannelsView from './components/ChannelsView';

const TABS = [
  { id: 'rates', label: 'Rate calendar', icon: FaTags },
  { id: 'plans', label: 'Rate plans & packages', icon: FaLayerGroup },
  { id: 'channels', label: 'Channels (OTA)', icon: FaGlobe },
];

export default function HotelRates() {
  const [tab, setTab] = useState('rates');
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[var(--h-ink)]">Rates &amp; Calendar</h1>
      <p className="mt-1 mb-5 text-[13.5px] text-[var(--h-muted2)]">Per-date pricing and availability — the source of truth for direct bookings and channels.</p>
      <HotelTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'rates' ? <RateGrid {...ctx} /> : tab === 'plans' ? <RatePlansPanel {...ctx} /> : <ChannelsView {...ctx} />}
    </>
  )}</HotelShell>;
}
