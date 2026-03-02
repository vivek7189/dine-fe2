'use client';

import Link from 'next/link';

/**
 * Breadcrumb - Visible breadcrumb navigation for SEO and UX
 * @param {Array} items - Array of { label, href } objects. Last item is current page (no link).
 */
export default function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '12px 20px',
      fontSize: '13px',
      color: '#6b7280',
    }}>
      <ol style={{
        display: 'flex',
        flexWrap: 'wrap',
        listStyle: 'none',
        margin: 0,
        padding: 0,
        gap: '4px',
        alignItems: 'center',
      }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href || index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {index > 0 && <span style={{ color: '#d1d5db' }}>/</span>}
              {isLast ? (
                <span style={{ color: '#111827', fontWeight: '500' }}>{item.label}</span>
              ) : (
                <Link href={item.href} style={{ color: '#6b7280', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
