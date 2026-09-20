'use client';
// Hotel PMS — tape-chart calendar (rooms × dates occupancy grid).
import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useHotelProperty } from './lib/useHotelProperty';
import { Banner } from './components/ui';
import HotelNav from './components/HotelNav';
import CalendarBoard from './components/CalendarBoard';

export default function HotelCalendar() {
  const { formatCurrency } = useCurrency();
  const { restaurantId, booting, banner, setBanner, notify } = useHotelProperty();

  if (booting) return <div className="flex items-center gap-2 p-8 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <HotelNav />
      {!restaurantId ? (
        <Banner tone="error">No property selected. Pick a restaurant/property first, then reopen this page.</Banner>
      ) : (
        <>
          {banner && <div className="mb-4"><Banner tone={banner.tone} onClose={() => setBanner(null)}>{banner.msg}</Banner></div>}
          <CalendarBoard restaurantId={restaurantId} formatCurrency={formatCurrency} notify={notify} />
        </>
      )}
    </div>
  );
}
