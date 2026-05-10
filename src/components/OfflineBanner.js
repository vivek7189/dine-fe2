'use client';

import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { FaWifi, FaSync, FaLock } from 'react-icons/fa';

/**
 * Reusable offline indicator banner.
 * Shows "read-only" mode when offline + optional pending/failed sync counts.
 * Detailed sync management is in Admin → Offline Data.
 *
 * Usage:
 *   <OfflineBanner pendingCount={pendingCount} failedCount={0} />
 */
export default function OfflineBanner({ pendingCount = 0, failedCount = 0 }) {
  const { isOnline } = useNetworkStatus();

  // Electron: offline mode is fully functional (SQLite), not read-only — hide the banner
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.apiRequest;
  if (isElectron) return null;

  if (isOnline && failedCount === 0) return null;
  if (isOnline && pendingCount === 0 && failedCount === 0) return null;

  return (
    <div style={{
      background: isOnline ? '#fef2f2' : '#fef3c7',
      border: `1px solid ${isOnline ? '#fca5a5' : '#f59e0b'}`,
      borderRadius: '8px',
      padding: '10px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '14px',
      color: isOnline ? '#991b1b' : '#92400e',
    }}>
      <FaWifi style={{ flexShrink: 0, opacity: 0.7 }} />
      <div style={{ flex: 1 }}>
        {!isOnline && (
          <>
            <strong>You&apos;re offline</strong> — viewing cached data
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 6, padding: '1px 8px', borderRadius: '4px', background: '#fde68a', color: '#92400e', fontSize: '12px', fontWeight: 600 }}>
              <FaLock size={9} /> Read-only
            </span>
          </>
        )}
        {pendingCount > 0 && (
          <span style={{ marginLeft: isOnline ? 0 : 8 }}>
            <FaSync style={{ display: 'inline', marginRight: 4, fontSize: 11 }} />
            {pendingCount} order{pendingCount !== 1 ? 's' : ''} pending sync
          </span>
        )}
        {failedCount > 0 && (
          <span style={{ marginLeft: 8, color: '#dc2626' }}>
            · {failedCount} failed
          </span>
        )}
      </div>
    </div>
  );
}
