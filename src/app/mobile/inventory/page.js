'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Force mobile embed flag before anything renders
if (typeof window !== 'undefined') {
  window.__DINEOPEN_MOBILE_EMBED__ = true;
}

// Reuse the exact same inventory page from the dashboard
const InventoryPage = dynamic(
  () => import('../../(dashboard)/inventory/page'),
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

export default function MobileInventoryPage() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20;

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
        setAuthReady(true);
      }
    };

    checkAuth();
  }, []);

  if (!authReady) {
    return <LoadingSpinner />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}>
      <style>{`
        input, textarea, select { font-size: 16px !important; }
      `}</style>
      <InventoryPage />
    </div>
  );
}
