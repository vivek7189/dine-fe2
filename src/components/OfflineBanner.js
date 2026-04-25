'use client';

import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { FaWifi, FaSync } from 'react-icons/fa';

/**
 * Reusable offline indicator banner.
 * Shows when the user is offline with optional pending sync count.
 *
 * Usage:
 *   <OfflineBanner pendingCount={pendingCount} />
 */
export default function OfflineBanner({ pendingCount = 0 }) {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div style={{
      background: '#fef3c7',
      border: '1px solid #f59e0b',
      borderRadius: '8px',
      padding: '10px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      color: '#92400e',
    }}>
      <FaWifi style={{ flexShrink: 0, opacity: 0.7 }} />
      <div style={{ flex: 1 }}>
        <strong>You&apos;re offline</strong> — using cached data.
        {pendingCount > 0 && (
          <span style={{ marginLeft: 8 }}>
            <FaSync style={{ display: 'inline', marginRight: 4, fontSize: 11 }} />
            {pendingCount} order{pendingCount !== 1 ? 's' : ''} pending sync
          </span>
        )}
      </div>
    </div>
  );
}
