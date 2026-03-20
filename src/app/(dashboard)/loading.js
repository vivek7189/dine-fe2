'use client';

export default function DashboardLoading() {
  return (
    <div style={{
      padding: '32px 40px',
      minHeight: '100vh',
      background: '#f8fafc',
      animation: 'pulseContent 1.2s ease-in-out infinite',
    }}>
      <style>{`
        @keyframes pulseContent {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      {/* Header skeleton */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          width: '260px', height: '32px', borderRadius: '8px',
          background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
          marginBottom: '10px',
        }} />
        <div style={{
          width: '180px', height: '16px', borderRadius: '6px',
          background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }} />
      </div>

      {/* Stat cards skeleton */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px', marginBottom: '24px',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            height: '120px', borderRadius: '16px',
            background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.5s ease-in-out infinite ${i * 0.1}s`,
          }} />
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            width: '72px', height: '72px', borderRadius: '12px',
            background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
            backgroundSize: '200% 100%',
            animation: `shimmer 1.5s ease-in-out infinite ${i * 0.05}s`,
          }} />
        ))}
      </div>

      {/* Content area skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        <div style={{
          height: '300px', borderRadius: '14px',
          background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            height: '140px', borderRadius: '14px',
            background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite 0.1s',
          }} />
          <div style={{
            height: '140px', borderRadius: '14px',
            background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s ease-in-out infinite 0.2s',
          }} />
        </div>
      </div>
    </div>
  );
}
