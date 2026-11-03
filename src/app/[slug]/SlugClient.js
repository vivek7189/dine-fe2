'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { FaSpinner } from 'react-icons/fa';
import OnlineOrderPage from '../onlineorder/page';
import { RESERVED_PATHS, RESERVED_REDIRECTS } from './slugReserved';

export default function SlugClient({ slug, initialRestaurantId = null }) {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState(initialRestaurantId);
  const [loading, setLoading] = useState(!initialRestaurantId);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    const fetchRestaurantBySlug = async () => {
      const slugLower = slug?.toLowerCase();
      // Redirect reserved paths that have a dedicated sub-URL (avoids 404 and restaurant-by-slug API call)
      if (slugLower && RESERVED_REDIRECTS[slugLower]) {
        router.replace(RESERVED_REDIRECTS[slugLower]);
        return;
      }
      // Check if this is a reserved path (no redirect, show 404)
      if (RESERVED_PATHS.includes(slugLower)) {
        setNotFoundState(true);
        setLoading(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
        const response = await fetch(`${apiUrl}/api/public/restaurant-by-slug/${slug}`);

        if (!response.ok) {
          setNotFoundState(true);
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.restaurantId) {
          setRestaurantId(data.restaurantId);
        } else {
          setNotFoundState(true);
        }
      } catch (error) {
        console.error('Error fetching restaurant by slug:', error);
        setNotFoundState(true);
      } finally {
        setLoading(false);
      }
    };

    // The server already found the restaurant; only look it up here if that check couldn't run.
    if (slug && !initialRestaurantId) {
      fetchRestaurantBySlug();
    }
  }, [slug]);

  // Show loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <FaSpinner size={40} color="#ef4444" style={{ animation: 'spin 1s linear infinite' }} />
        <style jsx global>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show 404 if restaurant not found
  if (notFoundState) {
    return notFound();
  }

  // Render the OnlineOrderPage with the resolved restaurantId
  return <OnlineOrderPage restaurantId={restaurantId} />;
}
