'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import OnlineOrderPage from '../onlineorder/page';

function PlaceOrderContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurant');
  const tableNumber = searchParams.get('table');
  // Takeaway QR carries &orderType=takeaway (no table/seat) so the menu opens in takeaway mode.
  const orderType = searchParams.get('orderType');
  return <OnlineOrderPage restaurantId={restaurantId} tableNumber={tableNumber} orderType={orderType} />;
}

export default function PlaceOrderPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <FaSpinner size={40} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
        <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <PlaceOrderContent />
    </Suspense>
  );
}
