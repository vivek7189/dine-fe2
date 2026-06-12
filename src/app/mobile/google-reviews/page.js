'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Force mobile embed flag before anything renders
if (typeof window !== 'undefined') {
  window.__DINEOPEN_MOBILE_EMBED__ = true;
}

const GoogleReviews = dynamic(
  () => import('../../../components/GoogleReviews'),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

function LoadingSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid #e5e7eb',
        borderTopColor: '#ef4444',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function MobileGoogleReviewsPage() {
  const [authReady, setAuthReady] = useState(false);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;

    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      if (token && user) {
        // Resolve restaurant
        try {
          const savedId = localStorage.getItem('selectedRestaurantId');
          const savedRestaurant = localStorage.getItem('selectedRestaurant');

          if (savedRestaurant && savedId) {
            setRestaurant(JSON.parse(savedRestaurant));
          } else {
            // Fetch from API
            const apiClient = (await import('../../../lib/api')).default;
            const res = await apiClient.getRestaurants();
            const list = res.restaurants || [];
            const userData = JSON.parse(user);
            let r = null;

            if (userData?.restaurantId) {
              r = list.find(x => x.id === userData.restaurantId);
            }
            if (!r && savedId) {
              r = list.find(x => x.id === savedId);
            }
            if (!r && res.defaultRestaurantId) {
              r = list.find(x => x.id === res.defaultRestaurantId);
            }
            if (!r && list.length > 0) {
              r = list[0];
            }

            if (r) {
              setRestaurant(r);
              localStorage.setItem('selectedRestaurantId', r.id);
              localStorage.setItem('selectedRestaurant', JSON.stringify(r));
            }
          }
        } catch (err) {
          console.error('Mobile Google Reviews: Failed to resolve restaurant:', err);
        }

        setAuthReady(true);
        return;
      }

      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkAuth, 100);
      } else {
        setAuthReady(true);
      }
    };

    checkAuth();
  }, []);

  if (!authReady) {
    return <LoadingSpinner />;
  }

  if (!restaurant) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '60vh', padding: '24px', textAlign: 'center',
        color: '#6b7280', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>G</div>
        <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#374151' }}>No Restaurant Found</h3>
        <p style={{ margin: 0, fontSize: '13px' }}>Please set up a restaurant first.</p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '12px',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}>

      <GoogleReviews
        restaurantId={restaurant.id}
        restaurant={restaurant}
      />
    </div>
  );
}
