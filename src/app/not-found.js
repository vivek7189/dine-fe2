'use client';

import Link from 'next/link';
import { FaHome, FaSearch } from 'react-icons/fa';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '120px',
        fontWeight: '700',
        color: '#e2e8f0',
        lineHeight: 1
      }}>
        404
      </div>
      <h1 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1f2937',
        margin: '20px 0 10px'
      }}>
        Page Not Found
      </h1>
      <p style={{
        fontSize: '16px',
        color: '#6b7280',
        maxWidth: '400px',
        marginBottom: '30px'
      }}>
        The page you&apos;re looking for doesn&apos;t exist or the restaurant URL may have changed.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          <FaHome />
          Go Home
        </Link>
        <Link
          href="/restaurants"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          <FaSearch />
          Find Restaurants
        </Link>
      </div>
    </div>
  );
}
