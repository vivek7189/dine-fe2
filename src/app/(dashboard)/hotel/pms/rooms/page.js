'use client';
// Thin route wrapper. All logic lives in the isolated src/features/hotel/ folder,
// so this page can be removed by deleting the feature folder + this file.
import HotelPmsSetup from '../../../../../features/hotel/HotelPmsSetup';

export default function HotelPmsRoomsPage() {
  return <HotelPmsSetup />;
}
