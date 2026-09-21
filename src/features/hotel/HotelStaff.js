'use client';
// Hotel PMS — staff & area assignments.
import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useHotelProperty } from './lib/useHotelProperty';
import { Banner } from './components/ui';
import HotelNav from './components/HotelNav';
import StaffView from './components/StaffView';

export default function HotelStaff() {
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
          <StaffView restaurantId={restaurantId} notify={notify} />
        </>
      )}
    </div>
  );
}
