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
 * Queue an action for offline sync.
 * Supports multiple action types via _offlineAction field:
 * - 'create_order' (default) → POST /api/orders
 * - 'create_saved_cart' → POST /api/saved-carts
 * - 'complete_billing_new' → POST /api/orders + POST /api/payments/verify
 * - 'complete_billing_existing' → PATCH /api/orders/:id + POST /api/payments/verify
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
    actionType: orderData._offlineAction || 'create_order',
    restaurantId: orderData.restaurantId,
  });

  notifyListeners({ type: 'queued', idempotencyKey });
  return idempotencyKey;
}

/**
 * Strip internal metadata fields before sending to API.
 */
function cleanOrderData(data) {
  const { _offlineAction, _paymentData, _existingOrderId, ...clean } = data;
  return clean;
}

/**
 * Execute a single offline action based on its type.
 * Returns { success: true, result } or throws on failure.
 */
async function executeOfflineAction(apiClient, orderData) {
  const action = orderData._offlineAction || 'create_order';
  const cleanData = cleanOrderData(orderData);

  switch (action) {
    case 'create_saved_cart': {
      const response = await apiClient.createSavedCart(cleanData);
      return { order: response.cart, actionType: action };
    }

    case 'complete_billing_new': {
      const response = await apiClient.createOrder(cleanData);
      if (response.order && orderData._paymentData) {
        // Fire payment verification with the real order ID from server
        try {
          await apiClient.verifyPayment({
            ...orderData._paymentData,
            orderId: response.order.id,
          });
        } catch (payErr) {
          console.error('Payment verification failed for offline billing (order created):', payErr);
          // Order was created successfully — payment can be retried manually
        }
      }
      return { order: response.order, actionType: action };
    }

    case 'complete_billing_existing': {
      const orderId = orderData._existingOrderId;
      const response = await apiClient.updateOrder(orderId, cleanData);
      if (response.data && orderData._paymentData) {
        try {
          await apiClient.verifyPayment(orderData._paymentData);
        } catch (payErr) {
          console.error('Payment verification failed for offline billing (order updated):', payErr);
        }
      }
      return { order: response.data || { id: orderId }, actionType: action };
    }

    case 'create_order':
    default: {
      const response = await apiClient.createOrder(cleanData);
      return { order: response.order, idempotent: response.idempotent, actionType: action };
    }
  }
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
    // Recover any orders stuck in 'syncing' state (e.g. from browser crash mid-sync)
    try {
      const { getDb } = await import('./offlineDb');
      const db = await getDb();
      const allOrders = await db.getAll('offline_orders');
      const stuckOrders = allOrders.filter(o => o.syncStatus === 'syncing' && Date.now() - (o.updatedAt || o.createdAt) > 60000);
      for (const stuck of stuckOrders) {
        await updateOrderSyncStatus(stuck.idempotencyKey, 'pending', { retryCount: stuck.retryCount || 0 });
      }
    } catch (e) { /* recovery is best-effort */ }

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

        const result = await executeOfflineAction(apiClient, order.orderData);

        if (result.order) {
          await deleteOfflineOrder(order.idempotencyKey);
          await addSyncLog({
            idempotencyKey: order.idempotencyKey,
            action: result.idempotent ? 'synced_idempotent' : 'synced',
            actionType: result.actionType,
            orderId: result.order.id,
            dailyOrderId: result.order.dailyOrderId,
          });
          notifyListeners({
            type: 'synced',
            idempotencyKey: order.idempotencyKey,
            actionType: result.actionType,
            orderId: result.order.id,
            dailyOrderId: result.order.dailyOrderId,
            idempotent: result.idempotent || false,
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
