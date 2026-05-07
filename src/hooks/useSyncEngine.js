'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import {
  syncPendingOrders,
  onSyncStatusChange,
  queueOfflineOrder as _queueOfflineOrder,
  generateIdempotencyKey,
  isSyncInProgress,
  getCircuitState,
  resetCircuitBreaker,
  retrySingleOrder as _retrySingleOrder,
  retryAllFailed as _retryAllFailed,
  deleteFailedOrder as _deleteFailedOrder,
  getFailedOrdersList,
  pauseSyncEngine,
  resumeSyncEngine,
  isSyncEnginePaused,
} from '../lib/syncEngine';
import { getOfflineOrderCount } from '../lib/offlineDb';

const OFFLINE_ENABLED_KEY = 'dine_offline_engine_enabled';

// Singleton periodic sync — only 1 timer globally regardless of hook instances
let _periodicTimer = null;
let _periodicApiClient = null;

function startPeriodicSync(apiClient) {
  if (_periodicTimer) return; // Already running
  _periodicApiClient = apiClient;
  _periodicTimer = setInterval(() => {
    if (navigator.onLine && _periodicApiClient && !isSyncInProgress()) {
      getOfflineOrderCount().then(count => {
        if (count > 0) syncPendingOrders(_periodicApiClient);
      });
    }
  }, 30000);
}

function stopPeriodicSync() {
  if (_periodicTimer) {
    clearInterval(_periodicTimer);
    _periodicTimer = null;
    _periodicApiClient = null;
  }
}

export function getOfflineEngineEnabled() {
  try {
    const val = localStorage.getItem(OFFLINE_ENABLED_KEY);
    return val === null ? true : val === 'true';
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
 * Singleton periodic timer — no memory leaks from multiple instances.
 */
export function useSyncEngine(apiClient) {
  const { isOnline, networkTransition, clearTransition } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [failedOrders, setFailedOrders] = useState([]);
  const [lastSyncEvent, setLastSyncEvent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [circuitInfo, setCircuitInfo] = useState(() => getCircuitState());
  const [offlineEnabled, _setOfflineEnabled] = useState(() => getOfflineEngineEnabled());
  const [syncPaused, setSyncPaused] = useState(() => isSyncEnginePaused());
  const syncTimeoutRef = useRef(null);

  const setOfflineEnabled = useCallback((enabled) => {
    _setOfflineEnabled(enabled);
    setOfflineEngineEnabled(enabled);
  }, []);

  // Refresh counts + failed list
  const refreshCounts = useCallback(async () => {
    const count = await getOfflineOrderCount();
    setPendingCount(count);
    const failed = await getFailedOrdersList();
    setFailedOrders(failed);
    setCircuitInfo(getCircuitState());
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
      if (event.type === 'sync_paused') setSyncPaused(true);
      if (event.type === 'sync_resumed') setSyncPaused(false);
      if (['sync_complete', 'synced', 'queued', 'failed', 'retry_queued', 'retry_all_queued', 'order_deleted', 'circuit_open', 'circuit_half_open'].includes(event.type)) {
        refreshCounts();
      }
    });

    // Initial count
    refreshCounts();

    return unsub;
  }, [refreshCounts]);

  // Auto-sync when coming back online (resets circuit breaker on network transition)
  useEffect(() => {
    if (isOnline && pendingCount > 0 && apiClient) {
      if (networkTransition === 'went_online') {
        resetCircuitBreaker();
      }
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        syncPendingOrders(apiClient);
      }, 2000);
    }
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [isOnline, pendingCount, apiClient, networkTransition]);

  // Start/stop singleton periodic sync
  useEffect(() => {
    if (isOnline && apiClient) {
      startPeriodicSync(apiClient);
    } else {
      stopPeriodicSync();
    }
    return () => {
      // Don't stop on unmount — singleton keeps running for other instances
      // It self-checks navigator.onLine before each sync
    };
  }, [isOnline, apiClient]);

  const manualSync = useCallback(() => {
    if (isOnline && apiClient) {
      resetCircuitBreaker();
      syncPendingOrders(apiClient);
    }
  }, [isOnline, apiClient]);

  const queueOfflineOrder = useCallback(async (orderData) => {
    if (!offlineEnabled) return null;
    return _queueOfflineOrder(orderData);
  }, [offlineEnabled]);

  const retrySingleOrder = useCallback(async (idempotencyKey) => {
    await _retrySingleOrder(idempotencyKey);
    if (isOnline && apiClient) {
      setTimeout(() => syncPendingOrders(apiClient), 500);
    }
  }, [isOnline, apiClient]);

  const retryAllFailed = useCallback(async () => {
    await _retryAllFailed();
    if (isOnline && apiClient) {
      setTimeout(() => syncPendingOrders(apiClient), 500);
    }
  }, [isOnline, apiClient]);

  const deleteFailedOrder = useCallback(async (idempotencyKey) => {
    await _deleteFailedOrder(idempotencyKey);
    await refreshCounts();
  }, [refreshCounts]);

  const handlePauseSync = useCallback(() => {
    pauseSyncEngine();
    stopPeriodicSync();
  }, []);

  const handleResumeSync = useCallback(() => {
    resumeSyncEngine();
    if (isOnline && apiClient) {
      startPeriodicSync(apiClient);
      // Trigger immediate sync on resume
      setTimeout(() => syncPendingOrders(apiClient), 500);
    }
  }, [isOnline, apiClient]);

  return {
    pendingCount,
    failedOrders,
    isOnline,
    isSyncing,
    lastSyncEvent,
    circuitInfo,
    networkTransition,
    clearTransition,
    manualSync,
    queueOfflineOrder,
    generateIdempotencyKey,
    offlineEnabled,
    setOfflineEnabled,
    retrySingleOrder,
    retryAllFailed,
    deleteFailedOrder,
    syncPaused,
    pauseSync: handlePauseSync,
    resumeSync: handleResumeSync,
  };
}
