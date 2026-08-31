'use client';
import React from 'react';

// Merchandising badges for the public (QR) menu. Kept in sync with the default
// onlineorder page's MENU_BADGES so every theme shows the same pill.
export const MENU_BADGES = {
  bestseller:  { label: 'Bestseller',    emoji: '🔥', bg: '#fef3c7', color: '#b45309' },
  new:         { label: 'New',           emoji: '🆕', bg: '#dbeafe', color: '#1d4ed8' },
  chef:        { label: "Chef's Special", emoji: '👨‍🍳', bg: '#ede9fe', color: '#6d28d9' },
  recommended: { label: 'Recommended',   emoji: '⭐', bg: '#dcfce7', color: '#15803d' },
};

// Small self-contained pill (inline styles) so it drops cleanly into any theme
// regardless of that theme's CSS. Returns null for unknown/empty badges — safe no-op.
export default function PublicMenuBadge({ badge, style = {} }) {
  const b = MENU_BADGES[String(badge || '').toLowerCase()];
  if (!b) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 8px',
      borderRadius: '999px', fontSize: '10px', fontWeight: 700, lineHeight: 1.4,
      background: b.bg, color: b.color, whiteSpace: 'nowrap',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12)', ...style,
    }}>
      <span aria-hidden>{b.emoji}</span>{b.label}
    </span>
  );
}
