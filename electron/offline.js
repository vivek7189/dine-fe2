/**
 * DineOpen Electron Offline Engine
 *
 * Single-file offline-first layer using better-sqlite3.
 * All API calls from the renderer are routed through this module via IPC.
 *
 * Architecture:
 *   GET  → try network (10s timeout) → cache result in SQLite
 *          on failure → serve from SQLite cache
 *   POST/PUT/PATCH/DELETE → try network (15s timeout) → invalidate cache
 *          on failure → queue in mutation_queue → sync daemon retries later
 */

const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
const { ipcMain } = require('electron');

// ─── Configuration ───────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dine-be2-phi.vercel.app';
const SYNC_INTERVAL_MS = 30_000;       // 30 seconds
const SYNC_THROTTLE_MS = 500;          // between mutations
const GET_TIMEOUT_MS = 10_000;
const MUTATION_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 10;
const MAX_LOG_ENTRIES = 500;

// ─── Database ────────────────────────────────────────────────────────────────

let db = null;

function initDb(userDataPath) {
  const dbPath = path.join(userDataPath, 'dineopen-offline.sqlite');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS api_cache (
      endpoint TEXT PRIMARY KEY,
      response_json TEXT NOT NULL,
      status_code INTEGER NOT NULL DEFAULT 200,
      cached_at INTEGER NOT NULL,
      ttl_seconds INTEGER NOT NULL DEFAULT 300
    );

    CREATE TABLE IF NOT EXISTS mutation_queue (
      id TEXT PRIMARY KEY,
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      body_json TEXT,
      headers_json TEXT,
      queued_at INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      retry_count INTEGER NOT NULL DEFAULT 0,
      max_retries INTEGER NOT NULL DEFAULT ${MAX_RETRIES},
      last_error TEXT,
      last_attempted_at INTEGER,
      priority INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_mq_status ON mutation_queue(status, priority DESC, queued_at ASC);

    CREATE TABLE IF NOT EXISTS sync_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp INTEGER NOT NULL,
      action TEXT NOT NULL,
      endpoint TEXT,
      mutation_id TEXT,
      status TEXT,
      details TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sl_time ON sync_log(timestamp DESC);
  `);

  // Auto-cleanup old data on startup
  const now = Math.floor(Date.now() / 1000);
  db.prepare('DELETE FROM api_cache WHERE cached_at < ?').run(now - 7 * 86400);          // 7 days
  db.prepare("DELETE FROM sync_log WHERE timestamp < ?").run(now - 3 * 86400);            // 3 days
  db.prepare("DELETE FROM mutation_queue WHERE status = 'permanently_failed' AND queued_at < ?")
    .run(now - 30 * 86400);                                                               // 30 days

  // Recover stuck mutations (stuck in 'syncing' for > 2 min)
  db.prepare("UPDATE mutation_queue SET status = 'pending' WHERE status = 'syncing' AND last_attempted_at < ?")
    .run(now - 120);

  console.log('[Offline] SQLite initialized at', dbPath);
  return db;
}

function closeDb() {
  if (db) { db.close(); db = null; }
}

// ─── Categorized TTLs ───────────────────────────────────────────────────────

function getTTL(endpoint) {
  // HOT: changes frequently
  if (/\/(orders|tables|kot|register|saved-carts)/.test(endpoint)) return 30;
  // WARM: changes occasionally
  if (/\/(menus|categories|inventory|customers|staff)/.test(endpoint)) return 300;
  // COLD: rarely changes
  if (/\/(settings|restaurant|tax|print-settings|floors|admin\/print)/.test(endpoint)) return 3600;
  return 300; // default 5 min
}

// ─── Mutation Priority ──────────────────────────────────────────────────────

function getPriority(endpoint) {
  if (/\/(orders|billing|kot|payments)/.test(endpoint)) return 10;
  return 0;
}

// ─── Cache Invalidation ─────────────────────────────────────────────────────

function invalidateCache(endpoint) {
  const prefixes = getInvalidationPrefixes(endpoint);
  const stmt = db.prepare('DELETE FROM api_cache WHERE endpoint LIKE ?');
  for (const prefix of prefixes) {
    stmt.run(prefix + '%');
  }
}

function getInvalidationPrefixes(endpoint) {
  if (endpoint.includes('/api/orders'))
    return ['/api/orders', '/api/analytics', '/api/daily-summary', '/api/sales'];
  if (endpoint.includes('/api/menus/') || endpoint.includes('/api/menu'))
    return ['/api/menus/', '/api/menu'];
  if (endpoint.includes('/api/categories'))
    return ['/api/categories', '/api/menus/', '/api/menu'];
  if (endpoint.includes('/api/tables') || endpoint.includes('/api/floors'))
    return ['/api/tables', '/api/floors'];
  if (endpoint.includes('/api/tax') || endpoint.includes('/api/admin/tax'))
    return ['/api/tax', '/api/admin/tax', '/api/settings'];
  if (endpoint.includes('/api/settings') || endpoint.includes('/api/restaurant'))
    return ['/api/settings', '/api/restaurant'];
  if (endpoint.includes('/api/customers'))
    return ['/api/customers'];
  if (endpoint.includes('/api/inventory'))
    return ['/api/inventory'];
  if (endpoint.includes('/api/staff') || endpoint.includes('/api/shifts'))
    return ['/api/staff', '/api/shifts'];
  if (endpoint.includes('/api/offers'))
    return ['/api/offers'];
  if (endpoint.includes('/api/kot'))
    return ['/api/kot', '/api/orders'];
  if (endpoint.includes('/api/register'))
    return ['/api/register'];
  if (endpoint.includes('/api/invoices') || endpoint.includes('/api/invoice'))
    return ['/api/invoices', '/api/invoice'];
  if (endpoint.includes('/api/automation'))
    return ['/api/automation'];
  return [];
}

// ─── Sync Log ───────────────────────────────────────────────────────────────

function logSync(action, endpoint, mutationId, status, details) {
  const now = Math.floor(Date.now() / 1000);
  db.prepare(
    'INSERT INTO sync_log (timestamp, action, endpoint, mutation_id, status, details) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(now, action, endpoint || null, mutationId || null, status || null, details || null);

  // Trim old entries
  db.prepare(`DELETE FROM sync_log WHERE id NOT IN (SELECT id FROM sync_log ORDER BY id DESC LIMIT ${MAX_LOG_ENTRIES})`).run();
}

// ─── Store Auth Token ───────────────────────────────────────────────────────

function storeAuthToken(headers) {
  if (!headers) return;
  const authKey = Object.keys(headers).find(k => k.toLowerCase() === 'authorization');
  if (authKey && headers[authKey]) {
    const now = Math.floor(Date.now() / 1000);
    db.prepare('INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, ?)')
      .run('auth_token', headers[authKey], now);
  }
}

function getAuthToken() {
  const row = db.prepare("SELECT value FROM sync_meta WHERE key = 'auth_token'").get();
  return row ? row.value : null;
}

// ─── API Proxy: GET ─────────────────────────────────────────────────────────

async function handleGet(endpoint, headers) {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GET_TIMEOUT_MS);

  try {
    const fetchHeaders = {};
    if (headers) Object.entries(headers).forEach(([k, v]) => { if (v) fetchHeaders[k] = v; });

    const resp = await fetch(fullUrl, { headers: fetchHeaders, signal: controller.signal });
    clearTimeout(timeout);

    const status = resp.status;
    const bodyText = await resp.text();

    // Cache successful responses
    if (status >= 200 && status < 400) {
      const now = Math.floor(Date.now() / 1000);
      const ttl = getTTL(endpoint);
      db.prepare(
        'INSERT OR REPLACE INTO api_cache (endpoint, response_json, status_code, cached_at, ttl_seconds) VALUES (?, ?, ?, ?, ?)'
      ).run(endpoint, bodyText, status, now, ttl);
    }

    let data = null;
    try { data = JSON.parse(bodyText); } catch { data = { raw: bodyText }; }

    return {
      data,
      from_cache: false,
      is_queued: false,
      mutation_id: null,
      status_code: status,
      error: status >= 400 ? bodyText : null,
    };
  } catch (err) {
    clearTimeout(timeout);

    // Network failed — serve from cache
    const row = db.prepare('SELECT response_json, status_code FROM api_cache WHERE endpoint = ?').get(endpoint);

    if (row) {
      let data = null;
      try { data = JSON.parse(row.response_json); } catch {}
      return {
        data,
        from_cache: true,
        is_queued: false,
        mutation_id: null,
        status_code: row.status_code,
        error: null,
      };
    }

    return {
      data: null,
      from_cache: false,
      is_queued: false,
      mutation_id: null,
      status_code: 503,
      error: 'Offline and no cached data available',
    };
  }
}

// ─── API Proxy: Mutation ────────────────────────────────────────────────────

async function handleMutation(endpoint, method, body, headers) {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MUTATION_TIMEOUT_MS);

  try {
    const fetchHeaders = {};
    if (headers) Object.entries(headers).forEach(([k, v]) => { if (v) fetchHeaders[k] = v; });
    if (body && !fetchHeaders['Content-Type']) fetchHeaders['Content-Type'] = 'application/json';

    const resp = await fetch(fullUrl, {
      method: method.toUpperCase(),
      headers: fetchHeaders,
      body: body || undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const status = resp.status;
    const bodyText = await resp.text();
    let data = null;
    try { data = JSON.parse(bodyText); } catch { data = { raw: bodyText }; }

    // Invalidate related cache on success
    if (status >= 200 && status < 400) {
      invalidateCache(endpoint);
    }

    return {
      data,
      from_cache: false,
      is_queued: false,
      mutation_id: null,
      status_code: status,
      error: status >= 400 ? bodyText : null,
    };
  } catch (err) {
    clearTimeout(timeout);

    // Network failed — queue for later sync
    const mutationId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const priority = getPriority(endpoint);

    db.prepare(
      `INSERT INTO mutation_queue (id, endpoint, method, body_json, headers_json, queued_at, status, priority)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`
    ).run(mutationId, endpoint, method, body || null, headers ? JSON.stringify(headers) : null, now, priority);

    logSync('queued', endpoint, mutationId, 'pending', `Queued ${method} for offline sync`);

    // Wake the sync daemon
    wakeSync();

    return {
      data: { success: true, offline: true, mutationId, message: 'Queued for sync' },
      from_cache: false,
      is_queued: true,
      mutation_id: mutationId,
      status_code: 202,
      error: null,
    };
  }
}

// ─── Main API Request Handler ───────────────────────────────────────────────

async function handleApiRequest({ endpoint, method, body, headers }) {
  // Persist auth token so sync daemon can use it
  storeAuthToken(headers);

  const m = (method || 'GET').toUpperCase();
  if (m === 'GET') {
    return handleGet(endpoint, headers);
  }
  return handleMutation(endpoint, m, body, headers);
}

// ─── Sync Daemon ────────────────────────────────────────────────────────────

let syncTimer = null;
let syncWakeResolve = null;
let syncPaused = false;
let consecutiveFailures = 0;

function wakeSync() {
  if (syncWakeResolve) syncWakeResolve();
}

async function startSyncDaemon() {
  console.log('[Offline] Sync daemon started');

  while (true) {
    // Wait for interval or wake signal
    await new Promise(resolve => {
      syncWakeResolve = resolve;
      syncTimer = setTimeout(resolve, SYNC_INTERVAL_MS);
    });
    syncWakeResolve = null;
    if (syncTimer) { clearTimeout(syncTimer); syncTimer = null; }

    if (syncPaused || !db) continue;

    // Circuit breaker
    if (consecutiveFailures >= 3) {
      const cooldown = consecutiveFailures <= 4 ? 120 : consecutiveFailures <= 6 ? 300 : 600;
      logSync('circuit_open', null, null, 'paused',
        `Cooling down ${cooldown}s after ${consecutiveFailures} failures`);
      await new Promise(r => setTimeout(r, cooldown * 1000));
      consecutiveFailures = 0;
    }

    // Check connectivity
    if (!(await checkConnectivity())) continue;

    // Drain the queue
    const result = await drainQueue();
    if (result === 'network_error') {
      consecutiveFailures++;
    } else {
      consecutiveFailures = 0;
    }
  }
}

async function checkConnectivity() {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 5000);
    await fetch(`${API_BASE_URL}/api/health`, { method: 'HEAD', signal: controller.signal });
    clearTimeout(t);
    return true;
  } catch {
    return false;
  }
}

async function drainQueue() {
  let hadFailures = false;

  while (true) {
    if (!db) return 'stopped';

    const mutation = db.prepare(
      `SELECT id, endpoint, method, body_json, headers_json
       FROM mutation_queue WHERE status = 'pending'
       ORDER BY priority DESC, queued_at ASC LIMIT 1`
    ).get();

    if (!mutation) return hadFailures ? 'some_failed' : 'empty';

    const { id, endpoint, method, body_json, headers_json } = mutation;
    const now = Math.floor(Date.now() / 1000);

    // Mark as syncing
    db.prepare("UPDATE mutation_queue SET status = 'syncing', last_attempted_at = ? WHERE id = ?")
      .run(now, id);

    // Build request headers — use fresh auth token
    const headers = {};
    if (headers_json) {
      try {
        const parsed = JSON.parse(headers_json);
        Object.entries(parsed).forEach(([k, v]) => {
          if (k.toLowerCase() !== 'authorization') headers[k] = v;
        });
      } catch {}
    }
    const authToken = getAuthToken();
    if (authToken) headers['Authorization'] = authToken;
    if (body_json && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MUTATION_TIMEOUT_MS);

    try {
      const resp = await fetch(fullUrl, {
        method: method.toUpperCase(),
        headers,
        body: body_json || undefined,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const status = resp.status;

      if (status >= 200 && status < 400) {
        // Success — remove from queue + invalidate cache
        db.prepare('DELETE FROM mutation_queue WHERE id = ?').run(id);
        invalidateCache(endpoint);
        logSync('synced', endpoint, id, 'success', `HTTP ${status}`);
      } else {
        // Server error — increment retry
        hadFailures = true;
        const errorText = await resp.text().catch(() => '');
        db.prepare(
          `UPDATE mutation_queue SET
            status = CASE WHEN retry_count >= max_retries - 1 THEN 'permanently_failed' ELSE 'failed' END,
            retry_count = retry_count + 1,
            last_error = ?
          WHERE id = ?`
        ).run(`HTTP ${status}: ${errorText.slice(0, 500)}`, id);
        logSync('sync_failed', endpoint, id, 'failed', `HTTP ${status}`);
      }
    } catch (err) {
      clearTimeout(timeout);
      // Network error — put back to pending and stop draining
      db.prepare("UPDATE mutation_queue SET status = 'pending', last_error = ? WHERE id = ?")
        .run(`Network: ${err.message}`, id);
      logSync('network_error', endpoint, id, 'error', err.message);
      return 'network_error';
    }

    // Throttle between mutations
    await new Promise(r => setTimeout(r, SYNC_THROTTLE_MS));
  }
}

// ─── IPC Registration ───────────────────────────────────────────────────────

function registerIPC() {
  // Main API proxy — this is the single entry point for ALL API calls from renderer
  ipcMain.handle('electron:apiRequest', async (_event, request) => {
    return handleApiRequest(request);
  });

  // Sync control — for the dashboard UI
  ipcMain.handle('electron:getSyncStatus', async () => {
    const pending = db.prepare("SELECT COUNT(*) as c FROM mutation_queue WHERE status = 'pending'").get().c;
    const failed = db.prepare("SELECT COUNT(*) as c FROM mutation_queue WHERE status = 'failed'").get().c;
    const permFailed = db.prepare("SELECT COUNT(*) as c FROM mutation_queue WHERE status = 'permanently_failed'").get().c;
    const syncing = db.prepare("SELECT COUNT(*) as c FROM mutation_queue WHERE status = 'syncing'").get().c;
    const lastSync = db.prepare("SELECT MAX(timestamp) as t FROM sync_log WHERE action = 'synced'").get();

    return {
      pending_count: pending,
      failed_count: failed,
      permanently_failed_count: permFailed,
      syncing_count: syncing,
      last_sync_at: lastSync?.t || null,
      is_paused: syncPaused,
      is_online: await checkConnectivity(),
    };
  });

  ipcMain.handle('electron:getPendingMutations', async () => {
    return db.prepare(
      `SELECT id, endpoint, method, queued_at, status, retry_count, last_error, last_attempted_at, priority
       FROM mutation_queue
       ORDER BY CASE status WHEN 'syncing' THEN 0 WHEN 'pending' THEN 1 WHEN 'failed' THEN 2 ELSE 3 END,
                priority DESC, queued_at ASC`
    ).all();
  });

  ipcMain.handle('electron:getSyncHistory', async (_event, limit) => {
    return db.prepare(
      'SELECT id, timestamp, action, endpoint, mutation_id, status, details FROM sync_log ORDER BY id DESC LIMIT ?'
    ).all(limit || 50);
  });

  ipcMain.handle('electron:triggerSync', async () => {
    wakeSync();
    return { success: true };
  });

  ipcMain.handle('electron:pauseSync', async () => {
    syncPaused = true;
    return { success: true };
  });

  ipcMain.handle('electron:resumeSync', async () => {
    syncPaused = false;
    wakeSync();
    return { success: true };
  });

  ipcMain.handle('electron:retryMutation', async (_event, id) => {
    db.prepare("UPDATE mutation_queue SET status = 'pending', retry_count = 0, last_error = NULL WHERE id = ?").run(id);
    wakeSync();
    return { success: true };
  });

  ipcMain.handle('electron:deleteMutation', async (_event, id) => {
    db.prepare('DELETE FROM mutation_queue WHERE id = ?').run(id);
    return { success: true };
  });

  ipcMain.handle('electron:clearCache', async () => {
    db.prepare('DELETE FROM api_cache').run();
    return { success: true };
  });

  ipcMain.handle('electron:getCacheStats', async () => {
    const count = db.prepare('SELECT COUNT(*) as c FROM api_cache').get().c;
    const size = db.prepare('SELECT COALESCE(SUM(LENGTH(response_json)), 0) as s FROM api_cache').get().s;
    const oldest = db.prepare('SELECT MIN(cached_at) as t FROM api_cache').get();
    const newest = db.prepare('SELECT MAX(cached_at) as t FROM api_cache').get();
    return {
      entry_count: count,
      total_size_bytes: size,
      oldest_entry_at: oldest?.t || null,
      newest_entry_at: newest?.t || null,
    };
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

function initOfflineEngine(app) {
  initDb(app.getPath('userData'));
  registerIPC();
  startSyncDaemon();
  console.log('[Offline] Engine initialized');
}

function shutdownOfflineEngine() {
  syncPaused = true;
  if (syncTimer) clearTimeout(syncTimer);
  if (syncWakeResolve) syncWakeResolve();
  closeDb();
  console.log('[Offline] Engine shut down');
}

module.exports = { initOfflineEngine, shutdownOfflineEngine };
