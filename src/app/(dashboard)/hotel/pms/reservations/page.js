'use client';
// Thin route wrapper — logic lives in src/features/hotel/.
import HotelReservations from '../../../../../features/hotel/HotelReservations';

export default function HotelPmsReservationsPage() {
  return <HotelReservations />;
}
