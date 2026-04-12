'use client';

import { useEffect, useState } from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';

// Set mobile embed flag IMMEDIATELY at module level (before any useEffect/render)
// This ensures pages that check this flag during their initial render won't redirect to /login
if (typeof window !== 'undefined') {
  window.__DINEOPEN_MOBILE_EMBED__ = true;
}

/**
 * Mobile Embed Layout
 * Stripped-down layout for WebView embedding in native apps.
 * - No sidebar, no header, no DineAI button
 * - Auto-authenticates via ?token= and ?user= URL params (handled by root TokenExtractor)
 * - Also accepts ?restaurantId= to pre-select restaurant
 * - Sets window.__DINEOPEN_MOBILE_EMBED__ flag so pages skip login redirects
 * - Full-width, mobile-optimized
 */
export default function MobileLayout({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Reinforce the flag (in case module-level didn't run)
    window.__DINEOPEN_MOBILE_EMBED__ = true;

    // Extract restaurantId from URL if provided (WebView passes it)
    const params = new URLSearchParams(window.location.search);
    const rid = params.get('restaurantId');
    if (rid) {
      localStorage.setItem('selectedRestaurantId', rid);
    }

    // Also extract token/user directly here as a safety net
    // (the root TokenExtractor also does this, but we need it ASAP)
    const token = params.get('token');
    const user = params.get('user');
    if (token) {
      localStorage.setItem('authToken', token);
    }
    if (user) {
      try {
        const parsed = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('user', JSON.stringify(parsed));
      } catch (e) {
        console.error('Mobile layout: failed to parse user param:', e);
      }
    }

    // Wait for auth to be in localStorage before rendering children
    let attempts = 0;
    const checkReady = () => {
      const hasToken = localStorage.getItem('authToken');
      const hasUser = localStorage.getItem('user');
      if (hasToken && hasUser) {
        setReady(true);
        return;
      }
      attempts++;
      if (attempts < 15) {
        setTimeout(checkReady, 100);
      } else {
        // Render anyway after 1.5s — page will handle missing auth
        setReady(true);
      }
    };
    checkReady();

    return () => {
      window.__DINEOPEN_MOBILE_EMBED__ = false;
    };
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
        paddingBottom: '90px',
        // Hide scrollbar for cleaner WebView look
        WebkitOverflowScrolling: 'touch',
      }}>
        <style>{`
          /* Hide scrollbar in WebView */
          body { margin: 0; padding: 0; overflow-x: hidden; }
          body::-webkit-scrollbar { display: none; }
          /* Override any sidebar margin that pages might assume */
          .dashboard-page-content { animation: none !important; }
          /* Fix modals in mobile WebView — ensure they sit above everything and inputs are full-width */
          input, select, textarea { font-size: 16px !important; max-width: 100%; box-sizing: border-box; }
          /* Prevent iOS zoom on input focus */
          @media screen and (max-width: 768px) {
            input, select, textarea { font-size: 16px !important; }
          }
        `}</style>
        {children}
      </div>
    </CurrencyProvider>
  );
}
