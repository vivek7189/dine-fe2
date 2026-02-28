import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'DineOpen - The Global Restaurant Operating System'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '36px',
              fontWeight: '800',
            }}
          >
            DO
          </div>
          <span style={{ fontSize: '56px', fontWeight: '800', color: 'white' }}>
            DineOpen
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#ef4444',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          The Global Restaurant Operating System
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            color: '#9ca3af',
            fontSize: '22px',
            fontWeight: '500',
          }}
        >
          <span>Cloud POS</span>
          <span>|</span>
          <span>AI Agent</span>
          <span>|</span>
          <span>Inventory</span>
          <span>|</span>
          <span>Analytics</span>
          <span>|</span>
          <span>Loyalty</span>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop: '40px',
            padding: '16px 40px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '12px',
            color: 'white',
            fontSize: '24px',
            fontWeight: '700',
          }}
        >
          Start Free Trial - dineopen.com
        </div>
      </div>
    ),
    { ...size }
  )
}
