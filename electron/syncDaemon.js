/**
 * DineOpen Sync Daemon
 *
 * Background bidirectional sync between local SQLite and the cloud API.
 * Runs in the Electron main process. The UI never waits for this -- it
 * operates completely in the background. When online it syncs within
 * seconds; when offline it accumulates changes and syncs on reconnect.
 *
 * Loop:
 *   1. PUSH  change_log WHERE synced=0  ->  cloud API
 *   2. PULL  cloud updates since last pull  ->  local SQLite
 *   3. Sleep (5 s online / 30 s offline) or wake on signal
 */

const { getLocalDb } = require('./localDb');
const entityStore = require('./entityStore');

// ─── Configuration ──────────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://dine-be2-phi.vercel.app';

const SYNC_INTERVAL_ONLINE_MS = 5_000;
const SYNC_INTERVAL_OFFLINE_MS = 30_000;
const PUSH_BATCH_SIZE = 20;
const PUSH_THROTTLE_MS = 200;
const PULL_TIMEOUT_MS = 15_000;
const PUSH_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 10;
const CONNECTIVITY_CHECK_TIMEOUT_MS = 5_000;
const MAX_LOG_ENTRIES = 500;

// ─── State ──────────────────────────────────────────────────────────────────

let isRunning = false;
let isPaused = false;
let isOnline = false;
let wakeResolve = null;
let consecutiveFailures = 0;
let lastPullTimestamp = 0;
let authToken = null;

// In-memory cache of per-entity pull times so we don't query sync_meta each
// cycle for every entity type.
const entityPullTimes = {};

// ─── Pull Entity Definitions ────────────────────────────────────────────────

const PULL_ENTITIES = [
  { type: 'orders', endpoint: (rid) => `/api/orders/${rid}`, key: 'orders', store: 'saveOrders' },
  { type: 'menu_items', endpoint: (rid) => `/api/menus/${rid}`, key: 'menuItems', store: 'saveMenuItems' },
  { type: 'tables', endpoint: (rid) => `/api/tables/${rid}`, key: 'tables', store: 'saveTables' },
  { type: 'floors', endpoint: (rid) => `/api/floors/${rid}`, key: 'floors', store: 'saveFloors' },
  { type: 'tax_settings', endpoint: (rid) => `/api/admin/tax/${rid}`, key: null, store: 'saveTaxSettings' },
  { type: 'business_settings', endpoint: (rid) => `/api/admin/business/${rid}`, key: null, store: 'saveBusinessSettings' },
  { type: 'billing_settings', endpoint: (rid) => `/api/admin/business/${rid}`, key: 'billingSettings', store: 'saveBillingSettings' },
  { type: 'print_settings', endpoint: (rid) => `/api/admin/print-settings/${rid}`, key: null, store: 'savePrintSettings' },
  { type: 'staff', endpoint: (rid) => `/api/staff/${rid}`, key: 'staff', store: 'saveStaff' },
  { type: 'waiters', endpoint: (rid) => `/api/waiters/${rid}`, key: 'waiters', store: 'saveWaiters' },
  { type: 'customers', endpoint: (rid) => `/api/customers/${rid}`, key: 'customers', store: 'saveCustomers' },
  { type: 'inventory', endpoint: (rid) => `/api/inventory/${rid}`, key: 'items', store: 'saveInventoryItems' },
  { type: 'saved_carts', endpoint: (rid) => `/api/saved-carts/${rid}`, key: 'carts', store: 'saveSavedCarts' },
  { type: 'kot', endpoint: (rid) => `/api/kot/${rid}`, key: 'orders', store: 'saveKotItems' },
  { type: 'register', endpoint: (rid) => `/api/register/${rid}/current`, key: null, store: 'saveRegister' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function interruptibleSleep(ms) {
  return new Promise((resolve) => {
    wakeResolve = resolve;
    const timer = setTimeout(() => {
      wakeResolve = null;
      resolve();
    }, ms);
    if (timer && typeof timer.unref === 'function') timer.unref();
  });
}

function throttle(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Auth Token ─────────────────────────────────────────────────────────────

function getAuthToken() {
  if (authToken) return authToken;

  const db = getLocalDb();
  if (!db) return null;

  try {
    const row = db.prepare("SELECT value FROM sync_meta WHERE key = 'auth_token'").get();
    if (row) {
      authToken = row.value;
    }
    return authToken;
  } catch {
    return null;
  }
}

function refreshAuthTokenFromDb() {
  const db = getLocalDb();
  if (!db) return;

  try {
    const row = db.prepare("SELECT value FROM sync_meta WHERE key = 'auth_token'").get();
    if (row) authToken = row.value;
  } catch {
    // ignore
  }
}

function storeAuthToken(token) {
  if (!token) return;

  authToken = token;

  const db = getLocalDb();
  if (!db) return;

  try {
    db.prepare(
      'INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, ?)'
    ).run('auth_token', token, Date.now());
  } catch (err) {
    console.error('[SyncDaemon] Failed to store auth token:', err.message);
  }
}

// ─── Sync Logging ───────────────────────────────────────────────────────────

function logSyncAction(action, endpoint, details) {
  const db = getLocalDb();
  if (!db) return;

  try {
    db.prepare(
      'INSERT INTO sync_log (timestamp, action, endpoint, details) VALUES (?, ?, ?, ?)'
    ).run(Date.now(), action, endpoint || null, details || null);

    // Trim to most recent entries
    db.prepare(
      `DELETE FROM sync_log WHERE id NOT IN (SELECT id FROM sync_log ORDER BY id DESC LIMIT ${MAX_LOG_ENTRIES})`
    ).run();
  } catch (err) {
    console.error('[SyncDaemon] logSyncAction error:', err.message);
  }
}

// ─── Connectivity ───────────────────────────────────────────────────────────

async function checkConnectivity() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONNECTIVITY_CHECK_TIMEOUT_MS);
    await fetch(`${API_BASE_URL}/api/health`, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return true;
  } catch {
    return false;
  }
}

// ─── Fetch from Cloud ───────────────────────────────────────────────────────

async function fetchFromCloud(endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PULL_TIMEOUT_MS);

  const headers = { 'Content-Type': 'application/json' };
  const token = getAuthToken();
  if (token) headers['Authorization'] = token;

  try {
    const resp = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// ─── PUSH ───────────────────────────────────────────────────────────────────

async function pushChanges() {
  const db = getLocalDb();
  if (!db) return 'error';

  let rows;
  try {
    rows = db
      .prepare(
        `SELECT id, endpoint, method, payload, retry_count
         FROM change_log
         WHERE synced = 0 AND retry_count < ?
         ORDER BY id ASC
         LIMIT ?`
      )
      .all(MAX_RETRIES, PUSH_BATCH_SIZE);
  } catch (err) {
    console.error('[SyncDaemon] pushChanges query error:', err.message);
    return 'error';
  }

  if (!rows || rows.length === 0) return 'empty';

  let hadError = false;

  for (const entry of rows) {
    const { id, endpoint, method, payload } = entry;

    const headers = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) headers['Authorization'] = token;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), PUSH_TIMEOUT_MS);

    try {
      const resp = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: (method || 'POST').toUpperCase(),
        headers,
        body: payload || undefined,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const status = resp.status;

      if (status >= 200 && status < 300) {
        db.prepare('UPDATE change_log SET synced = 1 WHERE id = ?').run(id);
        logSyncAction('push_success', endpoint, `HTTP ${status}`);
      } else if (status === 401 || status === 403) {
        refreshAuthTokenFromDb();
        const retryToken = getAuthToken();
        if (retryToken) {
          headers['Authorization'] = retryToken;
        }

        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), PUSH_TIMEOUT_MS);

        try {
          const resp2 = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: (method || 'POST').toUpperCase(),
            headers,
            body: payload || undefined,
            signal: controller2.signal,
          });
          clearTimeout(timeout2);

          if (resp2.status >= 200 && resp2.status < 300) {
            db.prepare('UPDATE change_log SET synced = 1 WHERE id = ?').run(id);
            logSyncAction('push_success', endpoint, `HTTP ${resp2.status} (after auth refresh)`);
          } else {
            db.prepare(
              'UPDATE change_log SET retry_count = retry_count + 1, sync_error = ? WHERE id = ?'
            ).run(`Auth retry failed: HTTP ${resp2.status}`, id);
            logSyncAction('push_auth_fail', endpoint, `HTTP ${resp2.status}`);
            hadError = true;
          }
        } catch (retryErr) {
          clearTimeout(timeout2);
          db.prepare(
            'UPDATE change_log SET retry_count = retry_count + 1, sync_error = ? WHERE id = ?'
          ).run(`Auth retry network error: ${retryErr.message}`, id);
          logSyncAction('push_auth_fail', endpoint, retryErr.message);
          hadError = true;
        }
      } else if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        const errorText = await resp.text().catch(() => '');
        db.prepare(
          'UPDATE change_log SET synced = 1, retry_count = retry_count + 1, sync_error = ? WHERE id = ?'
        ).run(`Client error HTTP ${status}: ${errorText.slice(0, 500)}`, id);
        logSyncAction('push_client_error', endpoint, `HTTP ${status} (non-retryable)`);
      } else {
        const errorText = await resp.text().catch(() => '');
        db.prepare(
          'UPDATE change_log SET retry_count = retry_count + 1, sync_error = ? WHERE id = ?'
        ).run(`Server error HTTP ${status}: ${errorText.slice(0, 500)}`, id);
        logSyncAction('push_server_error', endpoint, `HTTP ${status}`);
        hadError = true;
      }
    } catch (err) {
      clearTimeout(timeout);
      db.prepare(
        'UPDATE change_log SET retry_count = retry_count + 1, sync_error = ? WHERE id = ?'
      ).run(`Network error: ${err.message}`, id);
      logSyncAction('push_network_error', endpoint, err.message);
      hadError = true;
    }

    // Check if max retries exceeded
    try {
      const updated = db
        .prepare('SELECT retry_count FROM change_log WHERE id = ? AND synced = 0')
        .get(id);
      if (updated && updated.retry_count >= MAX_RETRIES) {
        db.prepare(
          "UPDATE change_log SET synced = 1, sync_error = 'max_retries_exceeded' WHERE id = ?"
        ).run(id);
        logSyncAction('push_max_retries', endpoint, `Gave up after ${MAX_RETRIES} retries`);
      }
    } catch {
      // ignore
    }

    await throttle(PUSH_THROTTLE_MS);
  }

  return hadError ? 'error' : 'ok';
}

// ─── PULL ───────────────────────────────────────────────────────────────────

function getLastPullTime(entityType) {
  if (entityPullTimes[entityType] !== undefined) {
    return entityPullTimes[entityType];
  }

  const db = getLocalDb();
  if (!db) return 0;

  try {
    const row = db
      .prepare('SELECT value FROM sync_meta WHERE key = ?')
      .get(`last_pull_${entityType}`);
    const t = row ? Number(row.value) : 0;
    entityPullTimes[entityType] = t;
    return t;
  } catch {
    return 0;
  }
}

function setLastPullTime(entityType, timestamp) {
  entityPullTimes[entityType] = timestamp;

  const db = getLocalDb();
  if (!db) return;

  try {
    db.prepare(
      'INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, ?)'
    ).run(`last_pull_${entityType}`, String(timestamp), Date.now());
  } catch {
    // ignore
  }
}

function shouldPull(entityType) {
  const now = Date.now();
  const lastPull = getLastPullTime(entityType);

  // HOT: pull every cycle (~5 s)
  if (/orders|tables|kot|register/.test(entityType)) return now - lastPull > 5_000;

  // WARM: pull every 5 minutes
  if (/menu|customers|inventory|staff|saved_carts|waiters/.test(entityType))
    return now - lastPull > 300_000;

  // COLD: pull every 30 minutes
  return now - lastPull > 1_800_000;
}

function getActiveRestaurantId() {
  const db = getLocalDb();
  if (!db) return null;

  try {
    const row = db
      .prepare("SELECT value FROM sync_meta WHERE key = 'active_restaurant_id'")
      .get();
    return row ? row.value : null;
  } catch {
    return null;
  }
}

async function pullUpdates() {
  const restaurantId = getActiveRestaurantId();
  if (!restaurantId) return 'skip';

  let hadError = false;

  for (const entity of PULL_ENTITIES) {
    if (!shouldPull(entity.type)) continue;

    try {
      const data = await fetchFromCloud(entity.endpoint(restaurantId));

      if (data && typeof entityStore[entity.store] === 'function') {
        const items = entity.key ? data[entity.key] : data;
        if (items !== undefined && items !== null) {
          entityStore[entity.store](restaurantId, items);
          setLastPullTime(entity.type, Date.now());
          logSyncAction(
            'pull_success',
            entity.endpoint(restaurantId),
            `${entity.type}: ${Array.isArray(items) ? items.length : 1} item(s)`
          );
          // Also cache staff credentials for offline/LAN auth
          if (entity.type === 'staff' && Array.isArray(items)) {
            try {
              entityStore.saveStaffCredentials(restaurantId, items);
            } catch {
              // staff_credentials table may not exist yet
            }
          }
        }
      } else if (data === null) {
        hadError = true;
      }
    } catch (err) {
      logSyncAction('pull_error', entity.endpoint(restaurantId), `${entity.type}: ${err.message}`);
      hadError = true;
    }
  }

  // Update global last pull timestamp
  const db = getLocalDb();
  if (db) {
    try {
      db.prepare(
        'INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, ?)'
      ).run('last_pull_timestamp', String(Date.now()), Date.now());
      lastPullTimestamp = Date.now();
    } catch {
      // ignore
    }
  }

  return hadError ? 'error' : 'ok';
}

// ─── Force Pull (initial seeding) ───────────────────────────────────────────

async function forcePull(restaurantId) {
  const db = getLocalDb();
  if (!db) throw new Error('Local database not initialized');

  // Persist active restaurant id
  db.prepare(
    'INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, ?)'
  ).run('active_restaurant_id', restaurantId, Date.now());

  const results = {};

  for (const entity of PULL_ENTITIES) {
    try {
      const data = await fetchFromCloud(entity.endpoint(restaurantId));

      if (data) {
        const items = entity.key ? data[entity.key] : data;
        if (items !== undefined && items !== null) {
          if (typeof entityStore[entity.store] === 'function') {
            entityStore[entity.store](restaurantId, items);
          }
          results[entity.type] = {
            success: true,
            count: Array.isArray(items) ? items.length : 1,
          };
          setLastPullTime(entity.type, Date.now());
        } else {
          results[entity.type] = { success: true, count: 0 };
        }
      } else {
        results[entity.type] = { success: false, error: 'No data returned' };
      }
    } catch (err) {
      results[entity.type] = { success: false, error: err.message };
    }
  }

  // Update global last pull timestamp
  db.prepare(
    'INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, ?)'
  ).run('last_pull_timestamp', String(Date.now()), Date.now());
  lastPullTimestamp = Date.now();

  logSyncAction('force_pull', null, `Seeded ${Object.keys(results).length} entity types`);

  return results;
}

// ─── Main Daemon Loop ───────────────────────────────────────────────────────

async function runLoop() {
  while (isRunning) {
    await interruptibleSleep(isOnline ? SYNC_INTERVAL_ONLINE_MS : SYNC_INTERVAL_OFFLINE_MS);

    if (!isRunning) break;
    if (isPaused || !getLocalDb()) continue;

    // Circuit breaker: cool down after repeated failures
    if (consecutiveFailures >= 5) {
      const cooldownSec = Math.min(consecutiveFailures * 60, 600);
      logSyncAction(
        'circuit_open',
        null,
        `Cooling down ${cooldownSec}s after ${consecutiveFailures} failures`
      );
      await interruptibleSleep(cooldownSec * 1_000);
      consecutiveFailures = 0;
      if (!isRunning) break;
    }

    // Check connectivity
    isOnline = await checkConnectivity();
    if (!isOnline) continue;

    // PUSH local changes to the cloud
    let pushResult = 'ok';
    try {
      pushResult = await pushChanges();
    } catch (err) {
      console.error('[SyncDaemon] pushChanges crashed:', err.message);
      pushResult = 'error';
    }

    // PULL updates from the cloud
    let pullResult = 'ok';
    try {
      pullResult = await pullUpdates();
    } catch (err) {
      console.error('[SyncDaemon] pullUpdates crashed:', err.message);
      pullResult = 'error';
    }

    if (pushResult === 'error' || pullResult === 'error') {
      consecutiveFailures++;
    } else {
      consecutiveFailures = 0;
    }
  }
}

// ─── Daemon Control ─────────────────────────────────────────────────────────

function startSyncDaemon() {
  if (isRunning) return;

  const db = getLocalDb();

  if (db) {
    try {
      const pullRow = db
        .prepare("SELECT value FROM sync_meta WHERE key = 'last_pull_timestamp'")
        .get();
      if (pullRow) lastPullTimestamp = Number(pullRow.value);
    } catch {
      // ignore
    }

    try {
      const tokenRow = db
        .prepare("SELECT value FROM sync_meta WHERE key = 'auth_token'")
        .get();
      if (tokenRow) authToken = tokenRow.value;
    } catch {
      // ignore
    }
  }

  isRunning = true;
  console.log('[SyncDaemon] Started');
  logSyncAction('daemon_start', null, 'Sync daemon started');

  runLoop().catch((err) => {
    console.error('[SyncDaemon] Loop crashed unexpectedly:', err);
    isRunning = false;
  });
}

function stopSyncDaemon() {
  isRunning = false;
  if (wakeResolve) {
    wakeResolve();
    wakeResolve = null;
  }
  console.log('[SyncDaemon] Stopped');
  logSyncAction('daemon_stop', null, 'Sync daemon stopped');
}

function wakeSync() {
  if (wakeResolve) {
    wakeResolve();
    wakeResolve = null;
  }
}

function pauseSync() {
  isPaused = true;
  logSyncAction('daemon_pause', null, 'Sync paused');
}

function resumeSync() {
  isPaused = false;
  logSyncAction('daemon_resume', null, 'Sync resumed');
  wakeSync();
}

// ─── Status / History ───────────────────────────────────────────────────────

function getSyncStatus() {
  const db = getLocalDb();

  let pendingCount = 0;
  let failedCount = 0;
  let lastPushAt = null;
  let lastPullAt = null;

  if (db) {
    try {
      const pending = db
        .prepare('SELECT COUNT(*) as c FROM change_log WHERE synced = 0')
        .get();
      pendingCount = pending ? pending.c : 0;
    } catch {
      // change_log may not exist yet
    }

    try {
      const failed = db
        .prepare(
          'SELECT COUNT(*) as c FROM change_log WHERE synced = 0 AND retry_count >= ?'
        )
        .get(MAX_RETRIES);
      failedCount = failed ? failed.c : 0;
    } catch {
      // ignore
    }

    try {
      const pushRow = db
        .prepare("SELECT value FROM sync_meta WHERE key = 'last_push_timestamp'")
        .get();
      lastPushAt = pushRow ? Number(pushRow.value) : null;
    } catch {
      // ignore
    }

    try {
      const pullRow = db
        .prepare("SELECT value FROM sync_meta WHERE key = 'last_pull_timestamp'")
        .get();
      lastPullAt = pullRow ? Number(pullRow.value) : null;
    } catch {
      // ignore
    }
  }

  return {
    isOnline,
    isPaused,
    isRunning,
    pendingCount,
    failedCount,
    lastPushAt,
    lastPullAt,
    consecutiveFailures,
  };
}

function getSyncHistory(limit = 50) {
  const db = getLocalDb();
  if (!db) return [];

  try {
    return db
      .prepare(
        'SELECT id, timestamp, action, endpoint, details FROM sync_log ORDER BY id DESC LIMIT ?'
      )
      .all(limit);
  } catch {
    return [];
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  startSyncDaemon,
  stopSyncDaemon,
  wakeSync,
  pauseSync,
  resumeSync,
  getSyncStatus,
  getSyncHistory,
  forcePull,
  storeAuthToken,
};
