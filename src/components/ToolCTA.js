'use client';

import Link from 'next/link';
import posthog from 'posthog-js';

// Trial prompt shown right after a free tool's result. The UTM tags and the PostHog event
// let us see which tools bring sign-ups.
export default function ToolCTA({ tool, title, text, cta = 'Start 7-day free trial' }) {
  const href = `/login?utm_source=dineopen&utm_medium=tool&utm_campaign=${tool}`;
  return (
    <div style={{
      marginTop: '24px', padding: '18px 20px', borderRadius: '12px',
      border: '1px solid #fecaca', backgroundColor: '#fff7f6',
      display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between',
      textAlign: 'left',
    }}>
      <div style={{ flex: '1 1 260px' }}>
        <div style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>{title}</div>
        <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px', lineHeight: 1.5 }}>{text}</div>
      </div>
      <Link
        href={href}
        onClick={() => { try { posthog.capture('tool_cta_click', { tool }); } catch { /* analytics optional */ } }}
        style={{
          backgroundColor: '#ef4444', color: '#ffffff', padding: '12px 18px', borderRadius: '10px',
          fontWeight: 700, fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap',
        }}
      >
        {cta} →
      </Link>
    </div>
  );
}
