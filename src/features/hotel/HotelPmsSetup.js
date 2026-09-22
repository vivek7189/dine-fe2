'use client';
import React, { useState } from 'react';
import { FaBed, FaDoorClosed, FaConciergeBell, FaPercent, FaShieldAlt } from 'react-icons/fa';
import HotelShell from './components/HotelShell';
import { HotelTabs } from './components/HotelTabs';
import RoomTypesPanel from './components/RoomTypesPanel';
import RoomsPanel from './components/RoomsPanel';
import TaxSettingsPanel from './components/TaxSettingsPanel';
import ServicesPanel from './components/ServicesPanel';
import PoliciesPanel from './components/PoliciesPanel';

const TABS = [
  { id: 'rooms', label: 'Rooms', icon: FaDoorClosed },
  { id: 'types', label: 'Room types', icon: FaBed },
  { id: 'services', label: 'Services', icon: FaConciergeBell },
  { id: 'taxes', label: 'Taxes', icon: FaPercent },
  { id: 'policies', label: 'Policies', icon: FaShieldAlt },
];

export default function HotelPmsSetup() {
  const [tab, setTab] = useState('rooms');
  const [typesRefreshKey, setTypesRefreshKey] = useState(0);
  return <HotelShell>{(ctx) => (
    <>
      <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[#2A241B]">Setup</h1>
      <p className="mt-1 mb-5 text-[13.5px] text-[#9A9081]">Rooms, room types, add-on services and taxes.</p>
      <HotelTabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'rooms' && <RoomsPanel {...ctx} typesRefreshKey={typesRefreshKey} />}
      {tab === 'types' && <RoomTypesPanel {...ctx} onChanged={() => setTypesRefreshKey((k) => k + 1)} />}
      {tab === 'services' && <ServicesPanel {...ctx} />}
      {tab === 'taxes' && <TaxSettingsPanel {...ctx} />}
      {tab === 'policies' && <PoliciesPanel {...ctx} />}
    </>
  )}</HotelShell>;
}
