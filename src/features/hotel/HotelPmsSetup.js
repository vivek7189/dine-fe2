'use client';
// Hotel PMS — Rooms & Types setup. First real page of the isolated hotel feature.
// Everything it needs lives under src/features/hotel/.
import React, { useState, useEffect } from 'react';
import { FaBed, FaDoorClosed, FaHotel, FaSpinner } from 'react-icons/fa';
import { useCurrency } from '../../contexts/CurrencyContext';
import { resolveActivePropertyId } from './lib/property';
import { Banner } from './components/ui';
import RoomTypesPanel from './components/RoomTypesPanel';
import RoomsPanel from './components/RoomsPanel';

const TABS = [
  { id: 'rooms', label: 'Rooms', icon: FaDoorClosed },
  { id: 'types', label: 'Room types', icon: FaBed },
];

export default function HotelPmsSetup() {
  const { formatCurrency } = useCurrency();
  const [restaurantId, setRestaurantId] = useState(null);
  const [booting, setBooting] = useState(true);
  const [tab, setTab] = useState('rooms');
  const [banner, setBanner] = useState(null); // { tone, msg }
  const [typesRefreshKey, setTypesRefreshKey] = useState(0);

  const notify = (tone, msg) => {
    setBanner({ tone, msg });
    if (tone === 'success') setTimeout(() => setBanner((b) => (b && b.msg === msg ? null : b)), 3000);
  };

  useEffect(() => {
    (async () => {
      const rid = await resolveActivePropertyId();
      setRestaurantId(rid);
      setBooting(false);
    })();
  }, []);

  if (booting) {
    return <div className="flex items-center gap-2 p-8 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>;
  }
  if (!restaurantId) {
    return (
      <div className="p-8">
        <Banner tone="error">No property selected. Pick a restaurant/property first, then reopen this page.</Banner>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <header className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white"><FaHotel /></div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Rooms &amp; Types</h1>
          <p className="text-sm text-slate-500">Set up your room inventory and the types that rates hang off.</p>
        </div>
      </header>

      {banner && (
        <div className="mb-4">
          <Banner tone={banner.tone} onClose={() => setBanner(null)}>{banner.msg}</Banner>
        </div>
      )}

      <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'rooms' ? (
        <RoomsPanel restaurantId={restaurantId} formatCurrency={formatCurrency} notify={notify} typesRefreshKey={typesRefreshKey} />
      ) : (
        <RoomTypesPanel restaurantId={restaurantId} formatCurrency={formatCurrency} notify={notify} onChanged={() => setTypesRefreshKey((k) => k + 1)} />
      )}
    </div>
  );
}
