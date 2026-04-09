'use client';

import { useEffect, useState } from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';

/**
 * Mobile Embed Layout
 * Stripped-down layout for WebView embedding in native apps.
 * - No sidebar, no header, no DineAI button
 * - Auto-authenticates via ?token= and ?user= URL params (handled by root TokenExtractor)
 * - Also accepts ?restaurantId= to pre-select restaurant
 * - Full-width, mobile-optimized
 */
export default function MobileLayout({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Extract restaurantId from URL if provided (WebView passes it)
    const params = new URLSearchParams(window.location.search);
    const rid = params.get('restaurantId');
    if (rid) {
      localStorage.setItem('selectedRestaurantId', rid);
    }

    // TokenExtractor in root layout already handles ?token= and ?user=
    // Give it a tick to finish before rendering children
    const timer = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb',
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

  return (
    <CurrencyProvider>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        overflow: 'auto',
        // Hide scrollbar for cleaner WebView look
        WebkitOverflowScrolling: 'touch',
      }}>
        <style>{`
          /* Hide scrollbar in WebView */
          body { margin: 0; padding: 0; overflow-x: hidden; }
          body::-webkit-scrollbar { display: none; }
          /* Override any sidebar margin that pages might assume */
          .dashboard-page-content { animation: none !important; }
        `}</style>
        {children}
      </div>
    </CurrencyProvider>
  );
}
