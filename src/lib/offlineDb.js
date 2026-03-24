import { openDB } from 'idb';

const DB_NAME = 'dineopen_offline';
const DB_VERSION = 1;

let dbPromise = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Orders pending sync
        if (!db.objectStoreNames.contains('offline_orders')) {
          const store = db.createObjectStore('offline_orders', { keyPath: 'idempotencyKey' });
          store.createIndex('by_status', 'syncStatus');
          store.createIndex('by_created', 'createdAt');
        }

        // Cached API data (menu, categories, tables, tax settings)
        if (!db.objectStoreNames.contains('cached_api')) {
          db.createObjectStore('cached_api', { keyPath: 'cacheKey' });
        }

        // Sync log for debugging
        if (!db.objectStoreNames.contains('sync_log')) {
          const logStore = db.createObjectStore('sync_log', { keyPath: 'id', autoIncrement: true });
          logStore.createIndex('by_time', 'timestamp');
        }
      },
    });
  }
  return dbPromise;
}

// ==========================================
// Offline Orders
// ==========================================

export async function saveOfflineOrder(order) {
  const db = await getDb();
  return db.put('offline_orders', {
    ...order,
    syncStatus: 'pending', // 'pending' | 'syncing' | 'synced' | 'failed'
    retryCount: 0,
    createdAt: Date.now(),
  });
}

export async function getPendingOrders() {
  const db = await getDb();
  return db.getAllFromIndex('offline_orders', 'by_status', 'pending');
}

export async function getFailedOrders() {
  const db = await getDb();
  return db.getAllFromIndex('offline_orders', 'by_status', 'failed');
}

export async function getAllOfflineOrders() {
  const db = await getDb();
  return db.getAll('offline_orders');
}

export async function updateOrderSyncStatus(idempotencyKey, status, extra = {}) {
  const db = await getDb();
  const order = await db.get('offline_orders', idempotencyKey);
  if (order) {
    return db.put('offline_orders', { ...order, syncStatus: status, ...extra, updatedAt: Date.now() });
  }
}

export async function deleteOfflineOrder(idempotencyKey) {
  const db = await getDb();
  return db.delete('offline_orders', idempotencyKey);
}

export async function getOfflineOrderCount() {
  const db = await getDb();
  const pending = await db.getAllFromIndex('offline_orders', 'by_status', 'pending');
  return pending.length;
}

// ==========================================
// Cached API Data
// ==========================================

export async function setCachedData(key, data) {
  const db = await getDb();
  return db.put('cached_api', { cacheKey: key, data, updatedAt: Date.now() });
}

export async function getCachedData(key) {
  const db = await getDb();
  const result = await db.get('cached_api', key);
  return result?.data || null;
}

export async function clearCachedData(keyPrefix) {
  const db = await getDb();
  const tx = db.transaction('cached_api', 'readwrite');
  const keys = await tx.store.getAllKeys();
  for (const key of keys) {
    if (typeof key === 'string' && key.startsWith(keyPrefix)) {
      await tx.store.delete(key);
    }
  }
  await tx.done;
}

// ==========================================
// Sync Log
// ==========================================

export async function addSyncLog(entry) {
  const db = await getDb();
  return db.add('sync_log', { ...entry, timestamp: Date.now() });
}

export async function getSyncLogs(limit = 50) {
  const db = await getDb();
  const all = await db.getAllFromIndex('sync_log', 'by_time');
  return all.slice(-limit).reverse();
}

export async function clearSyncLogs() {
  const db = await getDb();
  return db.clear('sync_log');
}
