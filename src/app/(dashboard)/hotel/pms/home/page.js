'use client';
// Thin route wrapper — logic lives in src/features/hotel/.
import HotelDashboard from '../../../../../features/hotel/HotelDashboard';

export default function HotelPmsHomePage() {
  return <HotelDashboard />;
}
