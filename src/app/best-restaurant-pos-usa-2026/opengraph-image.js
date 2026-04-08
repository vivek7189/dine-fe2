import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Best Restaurant POS USA 2026 — I tested all 6';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 28, color: '#fbbf24', fontWeight: 700 }}>DineOpen</div>
          <div style={{ fontSize: 22, color: '#94a3b8' }}>· founder-tested</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 50 }}>
          <div style={{ fontSize: 80, fontWeight: 800, color: '#fff', lineHeight: 1.05 }}>
            Best Restaurant POS
          </div>
          <div style={{ fontSize: 80, fontWeight: 800, color: '#fbbf24', lineHeight: 1.05 }}>
            USA 2026
          </div>
          <div style={{ fontSize: 32, color: '#cbd5e1', marginTop: 28 }}>
            I tested all 6 so you don&apos;t have to.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 'auto', flexWrap: 'wrap' }}>
          {['DineOpen', 'Toast', 'Square', 'Lightspeed', 'Clover', 'TouchBistro'].map((n, i) => (
            <div
              key={n}
              style={{
                display: 'flex',
                background: i === 0 ? '#fbbf24' : '#1e293b',
                color: i === 0 ? '#0f172a' : '#fff',
                border: i === 0 ? 'none' : '1px solid #475569',
                padding: '12px 20px',
                borderRadius: 999,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {i === 0 ? '#1 ' : `#${i + 1} `}{n}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
