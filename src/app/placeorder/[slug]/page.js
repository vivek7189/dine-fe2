'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import OnlineOrderPage from '../../onlineorder/page';

export default function PlaceOrderSlugPage() {
  const params = useParams();
  const slug = params.slug;
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const resolve = async () => {
      if (!slug) { setError(true); setLoading(false); return; }

      // First try: treat slug as a direct restaurant ID (for backwards compatibility)
      // If it looks like a Firestore ID (alphanumeric, 20 chars), try it directly
      const looksLikeId = /^[a-zA-Z0-9]{15,30}$/.test(slug);

      if (looksLikeId) {
        // Try using it as restaurantId directly
        setRestaurantId(slug);
        setLoading(false);
        return;
      }

      // Otherwise, resolve slug via API
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
        const response = await fetch(`${apiUrl}/api/public/restaurant-by-slug/${slug}`);
        if (response.ok) {
          const data = await response.json();
          if (data.restaurantId) {
            setRestaurantId(data.restaurantId);
            setLoading(false);
            return;
          }
        }
        setError(true);
      } catch (err) {
        console.error('Error resolving slug:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    resolve();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <FaSpinner size={40} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
        <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !restaurantId) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', flexDirection: 'column', gap: '12px' }}>
        <p style={{ fontSize: '18px', fontWeight: '700', color: '#374151' }}>Restaurant not found</p>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>This menu link may be invalid or expired.</p>
      </div>
    );
  }

  return <OnlineOrderPage restaurantId={restaurantId} />;
}
