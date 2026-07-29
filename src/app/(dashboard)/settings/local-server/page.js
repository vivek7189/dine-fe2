'use client';

import LocalServerSettings from '../../../../components/LocalServerSettings';

export default function LocalServerPage() {
  return (
    <div style={{ padding: '24px', maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Local Server (Offline)</h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0, maxWidth: 560, lineHeight: 1.6 }}>
          For sites that must keep billing and printing running without internet. One machine on
          the network runs the server; point every terminal here at it. Cash, orders, KOT printing
          and live table updates all work on the local network with no connection.
        </p>
      </div>
      <LocalServerSettings />
    </div>
  );
}
