'use client';
// Hotel PMS — Front Desk (home / overview). Warm editorial design.
import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useHotelProperty } from './lib/useHotelProperty';
import { Banner } from './components/ui';
import HotelNav from './components/HotelNav';
import DashboardView from './components/DashboardView';

export default function HotelDashboard() {
  const { formatCurrency } = useCurrency();
  const { restaurantId, booting, banner, setBanner, notify } = useHotelProperty();
  if (booting) return <div className="flex items-center gap-2 p-8 text-[#A79C88]"><FaSpinner className="animate-spin" /> Loading…</div>;
  return (
    <div className="min-h-screen bg-[#F6F3EC]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8">
        <HotelNav />
        {!restaurantId ? (
          <Banner tone="error">No property selected. Pick a restaurant/property first, then reopen this page.</Banner>
        ) : (
          <>
            {banner && <div className="mb-4"><Banner tone={banner.tone} onClose={() => setBanner(null)}>{banner.msg}</Banner></div>}
            <DashboardView restaurantId={restaurantId} formatCurrency={formatCurrency} notify={notify} />
          </>
        )}
      </div>
    </div>
  );
}
