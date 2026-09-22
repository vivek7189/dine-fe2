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
  return (
    <HotelShell icon={FaTags} title="Rates & Calendar" subtitle="Per-date pricing and availability — the source of truth for direct bookings and channels.">
      {(ctx) => (
        <>
          <HotelTabs tabs={TABS} active={tab} onChange={setTab} />
          {tab === 'rates' ? <RateGrid {...ctx} /> : tab === 'plans' ? <RatePlansPanel {...ctx} /> : <ChannelsView {...ctx} />}
        </>
      )}
    </HotelShell>
  );
}
