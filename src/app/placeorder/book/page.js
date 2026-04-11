'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import OnlineOrderPage from '../../onlineorder/page';

function BookContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant');
  return <OnlineOrderPage restaurantId={restaurantId} themeOverride="book" />;
}

export default function BookThemePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <FaSpinner size={40} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <BookContent />
    </Suspense>
  );
}
