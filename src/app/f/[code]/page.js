'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

export default function FeedbackShortRedirect() {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!params.code) return;
    fetch(`${API_URL}/api/feedback/public/form/s/${params.code}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.formId) {
          router.replace(`/feedback/${data.formId}?src=qr`);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [params.code, router]);

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>Form Not Found</h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>This feedback link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ fontSize: '14px', color: '#6b7280' }}>Loading feedback form...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
