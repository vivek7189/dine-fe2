import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function makeVsImage({ competitor, color, dineCost, theirCost, hook }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          padding: 60,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 28, color: '#fbbf24', fontWeight: 700 }}>
          DineOpen · honest comparison
        </div>

        <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, color: '#fff', marginTop: 50, lineHeight: 1 }}>
          {`DineOpen vs `}
        </div>
        <div style={{ display: 'flex', fontSize: 84, fontWeight: 800, color, lineHeight: 1, marginTop: 8 }}>
          {competitor}
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#cbd5e1', marginTop: 28 }}>
          {hook}
        </div>

        <div style={{ display: 'flex', marginTop: 'auto', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', background: '#fbbf24', color: '#0f172a', padding: '20px 28px', borderRadius: 12, fontWeight: 700 }}>
            <div style={{ display: 'flex', fontSize: 16 }}>DineOpen / year</div>
            <div style={{ display: 'flex', fontSize: 36 }}>{dineCost}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', background: '#1e293b', color: '#fff', border: `2px solid ${color}`, padding: '20px 28px', borderRadius: 12, fontWeight: 700 }}>
            <div style={{ display: 'flex', fontSize: 16, color: '#94a3b8' }}>{`${competitor} / year`}</div>
            <div style={{ display: 'flex', fontSize: 36 }}>{theirCost}</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
