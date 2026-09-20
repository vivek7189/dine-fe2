'use client';
// Public guest booking page — /book/hotel/<restaurantId>. No auth, no dashboard.
import { useParams } from 'next/navigation';
import PublicBooking from '../../../../features/hotel/PublicBooking';

export default function PublicHotelBookingPage() {
  const { restaurantId } = useParams();
  return <PublicBooking restaurantId={restaurantId} />;
}
