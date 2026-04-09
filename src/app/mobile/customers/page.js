'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Force mobile embed flag before anything renders
if (typeof window !== 'undefined') {
  window.__DINEOPEN_MOBILE_EMBED__ = true;
}

// Reuse the exact same customers page from the dashboard
// The mobile layout strips sidebar/header, so it renders full-width
const CustomersPage = dynamic(
  () => import('../../(dashboard)/customers/page'),
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

export default function MobileCustomersPage() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Wait for auth to be populated in localStorage by the injected JS / TokenExtractor
    // Check repeatedly until auth is found or timeout
    let attempts = 0;
    const maxAttempts = 20; // 2 seconds max

    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      if (token && user) {
        setAuthReady(true);
        return;
      }
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(checkAuth, 100);
      } else {
        // Even if auth isn't found, render anyway — page will show its own error
        setAuthReady(true);
      }
    };

    checkAuth();
  }, []);

  if (!authReady) {
    return <LoadingSpinner />;
  }

  return <CustomersPage />;
}
