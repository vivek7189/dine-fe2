import { v4 as uuidv4 } from 'uuid';
import {
  saveOfflineOrder,
  getPendingOrders,
  updateOrderSyncStatus,
  deleteOfflineOrder,
  addSyncLog,
  getOfflineOrderCount,
} from './offlineDb';

const MAX_RETRIES = 5;
const BACKOFF_BASE_MS = 2000;
const MAX_BACKOFF_MS = 30000;

let isSyncing = false;
let syncListeners = [];

/**
 * Register a listener for sync status changes.
 * Returns unsubscribe function.
 */
export function onSyncStatusChange(listener) {
  syncListeners.push(listener);
  return () => {
    syncListeners = syncListeners.filter(l => l !== listener);
  };
}

function notifyListeners(event) {
  syncListeners.forEach(fn => {
    try { fn(event); } catch (e) { console.error('Sync listener error:', e); }
  });
}

/**
 * Generate a UUID v4 idempotency key.
 */
export function generateIdempotencyKey() {
  return uuidv4();
}

/**
 * Queue an order for offline sync.
 * Saves to IndexedDB with syncStatus='pending'.
 */
export async function queueOfflineOrder(orderData) {
  const idempotencyKey = orderData.idempotencyKey || generateIdempotencyKey();
  const orderWithKey = { ...orderData, idempotencyKey, syncSource: 'offline' };

  await saveOfflineOrder({
    idempotencyKey,
    orderData: orderWithKey,
  });

  await addSyncLog({
    idempotencyKey,
    action: 'queued',
    restaurantId: orderData.restaurantId,
  });

  notifyListeners({ type: 'queued', idempotencyKey });
  return idempotencyKey;
}

/**
 * Process all pending offline orders.
 * Sends them to the server one by one (FIFO).
 * Uses exponential backoff on failure.
 * Idempotency keys prevent duplicates.
 */
export async function syncPendingOrders(apiClient) {
  if (isSyncing) return;
  if (!navigator.onLine) return;

  isSyncing = true;
  notifyListeners({ type: 'sync_started' });

  try {
    const pending = await getPendingOrders();
    if (pending.length === 0) {
      isSyncing = false;
      notifyListeners({ type: 'sync_complete', pendingCount: 0 });
      return;
    }

    let syncedCount = 0;
    let failedCount = 0;

    for (const order of pending) {
      // Skip orders that have exceeded max retries
      if (order.retryCount >= MAX_RETRIES) {
        await updateOrderSyncStatus(order.idempotencyKey, 'failed');
        await addSyncLog({
          idempotencyKey: order.idempotencyKey,
          action: 'failed_max_retries',
          retryCount: order.retryCount,
        });
        notifyListeners({ type: 'failed', idempotencyKey: order.idempotencyKey });
        failedCount++;
        continue;
      }

      // Check network before each order
      if (!navigator.onLine) {
        break;
      }

      try {
        await updateOrderSyncStatus(order.idempotencyKey, 'syncing');

        const response = await apiClient.createOrder(order.orderData);

        if (response.order) {
          await deleteOfflineOrder(order.idempotencyKey);
          await addSyncLog({
            idempotencyKey: order.idempotencyKey,
            action: response.idempotent ? 'synced_idempotent' : 'synced',
            orderId: response.order.id,
            dailyOrderId: response.order.dailyOrderId,
          });
          notifyListeners({
            type: 'synced',
            idempotencyKey: order.idempotencyKey,
            orderId: response.order.id,
            dailyOrderId: response.order.dailyOrderId,
            idempotent: response.idempotent || false,
          });
          syncedCount++;

          // Small delay between successful calls to avoid hammering the server
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      } catch (err) {
        const newRetryCount = order.retryCount + 1;
        await updateOrderSyncStatus(order.idempotencyKey, 'pending', {
          retryCount: newRetryCount,
          lastError: err.message,
        });
        await addSyncLog({
          idempotencyKey: order.idempotencyKey,
          action: 'retry_failed',
          error: err.message,
          retryCount: newRetryCount,
        });

        // Exponential backoff before next order
        const delay = Math.min(BACKOFF_BASE_MS * Math.pow(2, order.retryCount), MAX_BACKOFF_MS);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const remaining = await getOfflineOrderCount();
    notifyListeners({
      type: 'sync_complete',
      pendingCount: remaining,
      syncedCount,
      failedCount,
    });
  } catch (err) {
    console.error('Sync engine error:', err);
    notifyListeners({ type: 'sync_error', error: err.message });
  } finally {
    isSyncing = false;
  }
}

/**
 * Check if sync is currently in progress.
 */
export function isSyncInProgress() {
  return isSyncing;
}
