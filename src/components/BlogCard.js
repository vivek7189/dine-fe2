'use client';

import Link from 'next/link';

export default function BlogCard({ post, basePath = '/blog' }) {
  return (
    <article
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
      }}
    >
      <Link href={post.isStatic && post.staticPath ? post.staticPath : `${basePath}/${post.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#ef4444',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '12px',
        }}>
          {post.category}
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '12px',
          lineHeight: '1.3',
        }}>
          {post.title}
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#6b7280',
          lineHeight: '1.6',
          marginBottom: '16px',
        }}>
          {post.excerpt}
        </p>
        <div style={{
          fontSize: '14px',
          color: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </Link>
    </article>
  );
}



