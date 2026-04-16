'use client';

import Link from 'next/link';

export default function StaticBlogCard() {
  return (
    <article
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        border: '2px solid #fef7f0',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(239, 68, 68, 0.15)';
        e.currentTarget.style.borderColor = '#ef4444';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.borderColor = '#fef7f0';
      }}
    >
      <Link href="/blog/increase-footfall-2026" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '0',
          height: '0',
          borderStyle: 'solid',
          borderWidth: '0 60px 60px 0',
          borderColor: 'transparent #ef4444 transparent transparent',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          color: 'white',
          fontSize: '12px',
          fontWeight: '700',
          zIndex: 2,
          transform: 'rotate(45deg)',
          transformOrigin: 'center'
        }}>
          NEW
        </div>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#ef4444',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
        }}>
          Restaurant Growth
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '12px',
          lineHeight: '1.3',
        }}>
          10 Proven Strategies to Increase Restaurant Footfall in 2026
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.6',
          marginBottom: '16px',
        }}>
          Discover proven strategies to increase restaurant footfall in 2026. Learn about AI-powered ordering, QR menus, social media marketing, and customer engagement tactics.
        </p>
        <div style={{
          fontSize: '14px',
          color: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <time dateTime="2025-01-15">
            January 15, 2025
          </time>
          <span>•</span>
          <span style={{ color: '#ef4444', fontWeight: '600' }}>Read More →</span>
        </div>
      </Link>
    </article>
  );
}

