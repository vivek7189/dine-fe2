'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

function getInvoiceAppUrl() {
  if (process.env.NEXT_PUBLIC_INVOICE_URL) return process.env.NEXT_PUBLIC_INVOICE_URL;
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3005';
  }
  return 'https://dine-invoice-fe.vercel.app';
}

const INVOICE_APP_URL = getInvoiceAppUrl();

export default function InvoicePage() {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const tokenSentRef = useRef(false);

  const sendTokenToIframe = useCallback(() => {
    if (tokenSentRef.current) return;
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    const restaurantId = localStorage.getItem('selectedRestaurantId');

    if (iframeRef.current?.contentWindow && token) {
      iframeRef.current.contentWindow.postMessage({
        type: 'DINEOPEN_AUTH',
        token,
        user: user ? JSON.parse(user) : null,
        restaurantId,
      }, INVOICE_APP_URL);
      tokenSentRef.current = true;
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const origin = new URL(INVOICE_APP_URL).origin;
        if (event.origin !== origin) return;
      } catch {
        return;
      }

      if (event.data?.type === 'INVOICE_READY') {
        sendTokenToIframe();
      }
      if (event.data?.type === 'INVOICE_AUTH_SUCCESS') {
        setLoading(false);
      }
      if (event.data?.type === 'INVOICE_AUTH_ERROR') {
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendTokenToIframe]);

  const handleIframeLoad = () => {
    // Fallback: send token after iframe loads (in case INVOICE_READY was missed)
    setTimeout(() => {
      sendTokenToIframe();
      // Auto-dismiss loading after a reasonable timeout
      setTimeout(() => setLoading(false), 2000);
    }, 500);
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9fafb',
          zIndex: 10,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 32, height: 32,
              border: '3px solid #0ea5e9',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
            }} />
            <p style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>
              Loading Invoice...
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <iframe
        ref={iframeRef}
        src={`${INVOICE_APP_URL}/dashboard?embed=true`}
        onLoad={handleIframeLoad}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          minHeight: '100vh',
        }}
        allow="clipboard-write"
        title="DineOpen Invoice"
      />
    </div>
  );
}
