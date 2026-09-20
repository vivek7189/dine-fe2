'use client';
// Hotel PMS — Reservations (front desk). Bookings list, new-booking flow,
// assign / check-in / check-out / cancel.
import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useHotelProperty } from './lib/useHotelProperty';
import { Banner } from './components/ui';
import HotelNav from './components/HotelNav';
import ReservationsPanel from './components/ReservationsPanel';

export default function HotelReservations() {
  const { formatCurrency } = useCurrency();
  const { restaurantId, booting, banner, setBanner, notify } = useHotelProperty();

  if (booting) return <div className="flex items-center gap-2 p-8 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <HotelNav />
      {!restaurantId ? (
        <Banner tone="error">No property selected. Pick a restaurant/property first, then reopen this page.</Banner>
      ) : (
        <>
          {banner && <div className="mb-4"><Banner tone={banner.tone} onClose={() => setBanner(null)}>{banner.msg}</Banner></div>}
          <ReservationsPanel restaurantId={restaurantId} formatCurrency={formatCurrency} notify={notify} />
        </>
      )}
    </div>
  );
}
