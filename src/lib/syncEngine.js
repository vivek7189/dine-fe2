import { v4 as uuidv4 } from 'uuid';
import {
  saveOfflineOrder,
  getPendingOrders,
  getFailedOrders,
  updateOrderSyncStatus,
  deleteOfflineOrder,
  addSyncLog,
  getOfflineOrderCount,
} from './offlineDb';

const MAX_RETRIES = 5;
const BACKOFF_BASE_MS = 2000;
const MAX_BACKOFF_MS = 30000;
const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 1000;

// ==========================================
// Circuit Breaker
// ==========================================

const CIRCUIT_STATES = { CLOSED: 'closed', OPEN: 'open', HALF_OPEN: 'half_open' };
const CIRCUIT_COOLDOWNS = [2 * 60000, 5 * 60000, 10 * 60000]; // 2m, 5m, 10m

let circuit = {
  state: CIRCUIT_STATES.CLOSED,
  consecutiveFailures: 0,
  openedAt: 0,
  cooldownIndex: 0,
  lastSuccessAt: 0,
};

function isCircuitOpen() {
  if (circuit.state === CIRCUIT_STATES.CLOSED) return false;
  if (circuit.state === CIRCUIT_STATES.HALF_OPEN) return false;

  // Check if cooldown has elapsed → transition to HALF_OPEN
  const cooldown = CIRCUIT_COOLDOWNS[Math.min(circuit.cooldownIndex, CIRCUIT_COOLDOWNS.length - 1)];
  if (Date.now() - circuit.openedAt >= cooldown) {
    circuit.state = CIRCUIT_STATES.HALF_OPEN;
    notifyListeners({ type: 'circuit_half_open', cooldownIndex: circuit.cooldownIndex });
    return false;
  }

  return true; // Still in cooldown
}

function recordSyncSuccess() {
  circuit.state = CIRCUIT_STATES.CLOSED;
  circuit.consecutiveFailures = 0;
  circuit.cooldownIndex = 0;
  circuit.lastSuccessAt = Date.now();
}

function recordSyncFailure() {
  circuit.consecutiveFailures++;

  if (circuit.consecutiveFailures >= 3) {
    circuit.state = CIRCUIT_STATES.OPEN;
    circuit.openedAt = Date.now();
    const cooldown = CIRCUIT_COOLDOWNS[Math.min(circuit.cooldownIndex, CIRCUIT_COOLDOWNS.length - 1)];
    notifyListeners({
      type: 'circuit_open',
      cooldownMs: cooldown,
      consecutiveFailures: circuit.consecutiveFailures,
    });
    circuit.cooldownIndex = Math.min(circuit.cooldownIndex + 1, CIRCUIT_COOLDOWNS.length - 1);
  }
}

/** Reset circuit breaker (e.g., on manual retry or network transition) */
export function resetCircuitBreaker() {
  circuit.state = CIRCUIT_STATES.HALF_OPEN;
  circuit.consecutiveFailures = 0;
}

/** Get current circuit breaker state for UI */
export function getCircuitState() {
  const cooldown = CIRCUIT_COOLDOWNS[Math.min(circuit.cooldownIndex, CIRCUIT_COOLDOWNS.length - 1)];
  const elapsed = Date.now() - circuit.openedAt;
  return {
    state: circuit.state,
    consecutiveFailures: circuit.consecutiveFailures,
    nextRetryIn: circuit.state === CIRCUIT_STATES.OPEN ? Math.max(0, cooldown - elapsed) : 0,
    lastSuccessAt: circuit.lastSuccessAt,
  };
}

// ==========================================
// Sync Engine Core
// ==========================================

let isSyncing = false;
let syncListeners = [];

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

export function generateIdempotencyKey() {
  return uuidv4();
}

/**
 * Queue an action for offline sync.
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

function cleanOrderData(data) {
  const { _offlineAction, _paymentData, _existingOrderId, _cancelReason, _restaurantId, _menuItemId, _menuUpdateData, ...clean } = data;
  return clean;
}

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
        try {
          await apiClient.verifyPayment({
            ...orderData._paymentData,
            orderId: response.order.id,
          });
        } catch (payErr) {
          console.error('Payment verification failed for offline billing (order created):', payErr);
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

    case 'cancel_order': {
      const orderId = orderData._existingOrderId;
      const reason = orderData._cancelReason || 'Cancelled offline';
      await apiClient.cancelOrder(orderId, reason);
      return { order: { id: orderId }, actionType: action };
    }

    case 'reset_all_tables': {
      const rid = orderData._restaurantId || orderData.restaurantId;
      await apiClient.resetAllTables(rid);
      return { order: { id: 'reset_tables_' + rid }, actionType: action };
    }

    case 'update_menu_item': {
      const itemId = orderData._menuItemId;
      const updateData = orderData._menuUpdateData;
      const rid = orderData._restaurantId || orderData.restaurantId;
      await apiClient.updateMenuItem(itemId, updateData, rid);
      return { order: { id: itemId }, actionType: action };
    }

    case 'create_order':
    default: {
      const response = await apiClient.createOrder(cleanData);
      return { order: response.order, idempotent: response.idempotent, actionType: action };
    }
  }
}

// ==========================================
// Sync a single order (extracted for reuse)
// ==========================================

async function syncSingleOrder(apiClient, order) {
  if (order.retryCount >= MAX_RETRIES) {
    await updateOrderSyncStatus(order.idempotencyKey, 'failed');
    await addSyncLog({
      idempotencyKey: order.idempotencyKey,
      action: 'failed_max_retries',
      retryCount: order.retryCount,
    });
    notifyListeners({ type: 'failed', idempotencyKey: order.idempotencyKey });
    return { success: false, reason: 'max_retries' };
  }

  await updateOrderSyncStatus(order.idempotencyKey, 'syncing');

  try {
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
      recordSyncSuccess();
      return { success: true };
    }
    return { success: false, reason: 'no_order_returned' };
  } catch (err) {
    const newRetryCount = (order.retryCount || 0) + 1;
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

    // Detect network errors vs server errors
    const isNetworkError = /fetch|network|load failed|cancelled|timeout/i.test(err.message);
    if (isNetworkError) {
      recordSyncFailure();
    }
    // Server errors (400, 500) don't trip the circuit — they're order-specific

    return { success: false, reason: 'error', isNetworkError, error: err.message };
  }
}

// ==========================================
// Recover stuck orders
// ==========================================

async function recoverStuckOrders() {
  try {
    const { getDb } = await import('./offlineDb');
    const db = await getDb();
    const allOrders = await db.getAll('offline_orders');
    const stuckOrders = allOrders.filter(o => o.syncStatus === 'syncing' && Date.now() - (o.updatedAt || o.createdAt) > 60000);
    for (const stuck of stuckOrders) {
      await updateOrderSyncStatus(stuck.idempotencyKey, 'pending', { retryCount: stuck.retryCount || 0 });
    }
  } catch { /* recovery is best-effort */ }
}

// ==========================================
// Sync: single-threaded FIFO (for small batches)
// ==========================================

export async function syncPendingOrders(apiClient) {
  if (isSyncing) return;
  if (!navigator.onLine) return;
  if (isCircuitOpen()) {
    notifyListeners({ type: 'circuit_blocked', ...getCircuitState() });
    return;
  }

  isSyncing = true;
  notifyListeners({ type: 'sync_started' });

  try {
    await recoverStuckOrders();

    const pending = await getPendingOrders();
    if (pending.length === 0) {
      isSyncing = false;
      notifyListeners({ type: 'sync_complete', pendingCount: 0, syncedCount: 0, failedCount: 0 });
      return;
    }

    // Auto-select batch mode for large queues
    if (pending.length > 10) {
      isSyncing = false;
      return syncPendingOrdersBatch(apiClient);
    }

    let syncedCount = 0;
    let failedCount = 0;

    for (const order of pending) {
      if (!navigator.onLine || isCircuitOpen()) break;

      const result = await syncSingleOrder(apiClient, order);
      if (result.success) {
        syncedCount++;
        await new Promise(resolve => setTimeout(resolve, 400));
      } else {
        failedCount++;
        if (result.isNetworkError) break; // Stop on network errors
        // Server errors: continue to next order (exponential backoff)
        const delay = Math.min(BACKOFF_BASE_MS * Math.pow(2, order.retryCount || 0), MAX_BACKOFF_MS);
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

// ==========================================
// Batch sync (for 10+ pending orders)
// ==========================================

export async function syncPendingOrdersBatch(apiClient) {
  if (isSyncing) return;
  if (!navigator.onLine) return;
  if (isCircuitOpen()) {
    notifyListeners({ type: 'circuit_blocked', ...getCircuitState() });
    return;
  }

  isSyncing = true;
  notifyListeners({ type: 'sync_started' });

  try {
    await recoverStuckOrders();

    const pending = await getPendingOrders();
    if (pending.length === 0) {
      isSyncing = false;
      notifyListeners({ type: 'sync_complete', pendingCount: 0, syncedCount: 0, failedCount: 0 });
      return;
    }

    let syncedCount = 0;
    let failedCount = 0;
    let networkError = false;

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      if (!navigator.onLine || isCircuitOpen() || networkError) break;

      const batch = pending.slice(i, i + BATCH_SIZE);

      notifyListeners({
        type: 'sync_progress',
        current: i,
        total: pending.length,
        syncedCount,
      });

      const results = await Promise.allSettled(
        batch.map(order => syncSingleOrder(apiClient, order))
      );

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
          syncedCount++;
        } else {
          failedCount++;
          const val = result.status === 'fulfilled' ? result.value : { isNetworkError: true };
          if (val.isNetworkError) networkError = true;
        }
      }

      // Throttle between batches
      if (i + BATCH_SIZE < pending.length && !networkError) {
        await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
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
    console.error('Batch sync error:', err);
    notifyListeners({ type: 'sync_error', error: err.message });
  } finally {
    isSyncing = false;
  }
}

// ==========================================
// Retry helpers
// ==========================================

/** Retry a single failed order by resetting its status */
export async function retrySingleOrder(idempotencyKey) {
  await updateOrderSyncStatus(idempotencyKey, 'pending', { retryCount: 0, lastError: null });
  resetCircuitBreaker();
  notifyListeners({ type: 'retry_queued', idempotencyKey });
}

/** Retry all failed orders */
export async function retryAllFailed() {
  const failed = await getFailedOrders();
  for (const order of failed) {
    await updateOrderSyncStatus(order.idempotencyKey, 'pending', { retryCount: 0, lastError: null });
  }
  resetCircuitBreaker();
  notifyListeners({ type: 'retry_all_queued', count: failed.length });
}

/** Delete a failed order permanently (user confirmed it's not needed) */
export async function deleteFailedOrder(idempotencyKey) {
  await deleteOfflineOrder(idempotencyKey);
  await addSyncLog({ idempotencyKey, action: 'deleted_by_user' });
  notifyListeners({ type: 'order_deleted', idempotencyKey });
}

/** Get all failed orders for display */
export async function getFailedOrdersList() {
  return getFailedOrders();
}

export function isSyncInProgress() {
  return isSyncing;
}
