'use client';
// Hotel PMS — Rooms & Types setup. Part of the isolated hotel feature.
import React, { useState } from 'react';
import { FaBed, FaDoorClosed, FaSpinner, FaPercent } from 'react-icons/fa';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useHotelProperty } from './lib/useHotelProperty';
import { Banner } from './components/ui';
import HotelNav from './components/HotelNav';
import RoomTypesPanel from './components/RoomTypesPanel';
import RoomsPanel from './components/RoomsPanel';
import TaxSettingsPanel from './components/TaxSettingsPanel';

const TABS = [
  { id: 'rooms', label: 'Rooms', icon: FaDoorClosed },
  { id: 'types', label: 'Room types', icon: FaBed },
  { id: 'taxes', label: 'Taxes', icon: FaPercent },
];

export default function HotelPmsSetup() {
  const { formatCurrency } = useCurrency();
  const { restaurantId, booting, banner, setBanner, notify } = useHotelProperty();
  const [tab, setTab] = useState('rooms');
  const [typesRefreshKey, setTypesRefreshKey] = useState(0);

  if (booting) return <div className="flex items-center gap-2 p-8 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <HotelNav />

      {!restaurantId ? (
        <Banner tone="error">No property selected. Pick a restaurant/property first, then reopen this page.</Banner>
      ) : (
        <>
          {banner && <div className="mb-4"><Banner tone={banner.tone} onClose={() => setBanner(null)}>{banner.msg}</Banner></div>}

          <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Icon size={13} /> {t.label}
                </button>
              );
            })}
          </div>

          {tab === 'rooms' && (
            <RoomsPanel restaurantId={restaurantId} formatCurrency={formatCurrency} notify={notify} typesRefreshKey={typesRefreshKey} />
          )}
          {tab === 'types' && (
            <RoomTypesPanel restaurantId={restaurantId} formatCurrency={formatCurrency} notify={notify} onChanged={() => setTypesRefreshKey((k) => k + 1)} />
          )}
          {tab === 'taxes' && (
            <TaxSettingsPanel restaurantId={restaurantId} notify={notify} />
          )}
        </>
      )}
    </div>
  );
}
