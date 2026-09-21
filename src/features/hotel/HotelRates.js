'use client';
import React, { useState } from 'react';
import { FaTags, FaGlobe } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import { HotelTabs } from './components/HotelTabs';
import RateGrid from './components/RateGrid';
import ChannelsView from './components/ChannelsView';

const TABS = [{ id: 'rates', label: 'Rate calendar', icon: FaTags }, { id: 'channels', label: 'Channels (OTA)', icon: FaGlobe }];

export default function HotelRates() {
  const [tab, setTab] = useState('rates');
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[#2A241B]">Rates &amp; Calendar</h1>
      <p className="mt-1 mb-5 text-[13.5px] text-[#9A9081]">Per-date pricing and availability — the source of truth for direct bookings and channels.</p>
      <HotelTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'rates' ? <RateGrid {...ctx} /> : <ChannelsView {...ctx} />}
    </>
  )}</HotelShell>;
}
