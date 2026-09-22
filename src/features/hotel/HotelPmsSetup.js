'use client';
import React, { useState } from 'react';
import { FaBed, FaDoorClosed, FaConciergeBell, FaPercent, FaShieldAlt, FaCog } from 'react-icons/fa';
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
  return (
    <HotelShell icon={FaCog} title="Setup" subtitle="Rooms, room types, add-on services, taxes and policies.">
      {(ctx) => (
        <>
          <HotelTabs tabs={TABS} active={tab} onChange={setTab} />
          {tab === 'rooms' && <RoomsPanel {...ctx} typesRefreshKey={typesRefreshKey} />}
          {tab === 'types' && <RoomTypesPanel {...ctx} onChanged={() => setTypesRefreshKey((k) => k + 1)} />}
          {tab === 'services' && <ServicesPanel {...ctx} />}
          {tab === 'taxes' && <TaxSettingsPanel {...ctx} />}
          {tab === 'policies' && <PoliciesPanel {...ctx} />}
        </>
      )}
    </HotelShell>
  );
}
