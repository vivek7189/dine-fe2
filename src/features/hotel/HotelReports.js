'use client';
// Hotel PMS — reports. Two scopes: this property, or the whole group (chain).
import React, { useState } from 'react';
import { FaSpinner, FaBuilding, FaLayerGroup } from 'react-icons/fa';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useHotelProperty } from './lib/useHotelProperty';
import { Banner } from './components/ui';
import HotelNav from './components/HotelNav';
import ReportsView from './components/ReportsView';
import ChainView from './components/ChainView';

const SCOPES = [
  { id: 'property', label: 'This property', icon: FaBuilding },
  { id: 'group', label: 'Group', icon: FaLayerGroup },
];

export default function HotelReports() {
  const { formatCurrency } = useCurrency();
  const { restaurantId, booting, banner, setBanner, notify } = useHotelProperty();
  const [scope, setScope] = useState('property');

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
            {SCOPES.map((s) => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setScope(s.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${scope === s.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <Icon size={13} /> {s.label}
                </button>
              );
            })}
          </div>

          {scope === 'property'
            ? <ReportsView restaurantId={restaurantId} formatCurrency={formatCurrency} notify={notify} />
            : <ChainView formatCurrency={formatCurrency} notify={notify} />}
        </>
      )}
    </div>
  );
}
