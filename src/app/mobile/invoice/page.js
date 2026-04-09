'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { InvoiceToastProvider } from '../../(dashboard)/invoice/contexts/InvoiceToastContext';

if (typeof window !== 'undefined') {
  window.__DINEOPEN_MOBILE_EMBED__ = true;
}

const InvoiceDashboard = dynamic(
  () => import('../../(dashboard)/invoice/dashboard/page'),
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

export default function MobileInvoicePage() {
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      if (token && user) {
        setAuthReady(true);
        return;
      }
      attempts++;
      if (attempts < 20) {
        setTimeout(checkAuth, 100);
      } else {
        setAuthReady(true);
      }
    };
    checkAuth();
  }, []);

  if (!authReady) return <LoadingSpinner />;

  return (
    <InvoiceToastProvider>
      <div style={{ padding: '16px' }}>
        <InvoiceDashboard />
      </div>
    </InvoiceToastProvider>
  );
}
