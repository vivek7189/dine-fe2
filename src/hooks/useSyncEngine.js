'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncPendingOrders, onSyncStatusChange, queueOfflineOrder, generateIdempotencyKey, isSyncInProgress } from '../lib/syncEngine';
import { getOfflineOrderCount } from '../lib/offlineDb';

/**
 * Hook that manages the offline sync engine.
 * Auto-syncs when network comes back online.
 * Provides pending count, sync events, and manual sync trigger.
 */
export function useSyncEngine(apiClient) {
  const { isOnline, networkTransition, clearTransition } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncEvent, setLastSyncEvent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef(null);
  const periodicSyncRef = useRef(null);

  // Listen for sync status changes
  useEffect(() => {
    const unsub = onSyncStatusChange((event) => {
      setLastSyncEvent(event);
      if (event.type === 'sync_started') {
        setIsSyncing(true);
      } else if (['sync_complete', 'sync_error'].includes(event.type)) {
        setIsSyncing(false);
      }
      if (['sync_complete', 'synced', 'queued', 'failed'].includes(event.type)) {
        getOfflineOrderCount().then(setPendingCount);
      }
    });

    // Initial count
    getOfflineOrderCount().then(setPendingCount);

    return unsub;
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && apiClient) {
      // Debounce to avoid rapid-fire syncs
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncPendingOrders(apiClient);
      }, 2000);
    }
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [isOnline, pendingCount, apiClient]);

  // Periodic sync attempt every 30s when online and there are pending orders
  useEffect(() => {
    if (isOnline && pendingCount > 0 && apiClient) {
      periodicSyncRef.current = setInterval(() => {
        if (navigator.onLine) {
          syncPendingOrders(apiClient);
        }
      }, 30000);
    } else {
      if (periodicSyncRef.current) clearInterval(periodicSyncRef.current);
    }
    return () => {
      if (periodicSyncRef.current) clearInterval(periodicSyncRef.current);
    };
  }, [isOnline, pendingCount, apiClient]);

  const manualSync = useCallback(() => {
    if (isOnline && apiClient) {
      syncPendingOrders(apiClient);
    }
  }, [isOnline, apiClient]);

  return {
    pendingCount,
    isOnline,
    isSyncing,
    lastSyncEvent,
    networkTransition,
    clearTransition,
    manualSync,
    queueOfflineOrder,
    generateIdempotencyKey,
  };
}
