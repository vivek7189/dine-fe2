'use client';
// Thin route wrapper — logic lives in src/features/hotel/.
import HotelHousekeeping from '../../../../../features/hotel/HotelHousekeeping';

export default function HotelPmsHousekeepingPage() {
  return <HotelHousekeeping />;
}
