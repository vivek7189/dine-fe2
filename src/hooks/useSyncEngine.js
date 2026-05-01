'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { syncPendingOrders, onSyncStatusChange, queueOfflineOrder as _queueOfflineOrder, generateIdempotencyKey, isSyncInProgress } from '../lib/syncEngine';
import { getOfflineOrderCount } from '../lib/offlineDb';

const OFFLINE_ENABLED_KEY = 'dine_offline_engine_enabled';

export function getOfflineEngineEnabled() {
  try {
    const val = localStorage.getItem(OFFLINE_ENABLED_KEY);
    return val === null ? true : val === 'true'; // default: enabled
  } catch { return true; }
}

export function setOfflineEngineEnabled(enabled) {
  try {
    localStorage.setItem(OFFLINE_ENABLED_KEY, String(!!enabled));
  } catch { /* ignore */ }
}

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
  const [offlineEnabled, _setOfflineEnabled] = useState(() => getOfflineEngineEnabled());
  const syncTimeoutRef = useRef(null);
  const periodicSyncRef = useRef(null);

  const setOfflineEnabled = useCallback((enabled) => {
    _setOfflineEnabled(enabled);
    setOfflineEngineEnabled(enabled);
  }, []);

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

  // Auto-sync when coming back online (syncs even if engine is disabled, to flush existing queued orders)
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

  // Wrapped queueOfflineOrder that respects the enabled flag
  const queueOfflineOrder = useCallback(async (orderData) => {
    if (!offlineEnabled) return null; // Engine disabled — don't queue
    return _queueOfflineOrder(orderData);
  }, [offlineEnabled]);

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
    offlineEnabled,
    setOfflineEnabled,
  };
}
