'use client';
// Hotel PMS — rate calendar + OTA channels.
import React, { useState } from 'react';
import { FaSpinner, FaTags, FaGlobe } from 'react-icons/fa';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useHotelProperty } from './lib/useHotelProperty';
import { Banner } from './components/ui';
import HotelNav from './components/HotelNav';
import RateGrid from './components/RateGrid';
import ChannelsView from './components/ChannelsView';

const TABS = [
  { id: 'rates', label: 'Rate calendar', icon: FaTags },
  { id: 'channels', label: 'Channels (OTA)', icon: FaGlobe },
];

export default function HotelRates() {
  const { formatCurrency } = useCurrency();
  const { restaurantId, booting, banner, setBanner, notify } = useHotelProperty();
  const [tab, setTab] = useState('rates');

  if (booting) return <div className="flex items-center gap-2 p-8 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <HotelNav />
      {!restaurantId ? (
        <Banner tone="error">No property selected. Pick a restaurant/property first, then reopen this page.</Banner>
      ) : (
        <>
          {banner && <div className="mb-4"><Banner tone={banner.tone} onClose={() => setBanner(null)}>{banner.msg}</Banner></div>}

          <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-white p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Icon size={13} /> {t.label}
                </button>
              );
            })}
          </div>

          {tab === 'rates'
            ? <RateGrid restaurantId={restaurantId} formatCurrency={formatCurrency} notify={notify} />
            : <ChannelsView restaurantId={restaurantId} notify={notify} />}
        </>
      )}
    </div>
  );
}
