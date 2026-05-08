/**
 * DineOpen Electron Offline Engine (Local-First)
 *
 * All API calls from the renderer are routed through this module via IPC.
 * Every request goes to local SQLite first. The UI never waits for network.
 * A background sync daemon pushes changes to cloud and pulls updates.
 *
 * Architecture:
 *   ALL requests → localRouter (SQLite) → return instantly
 *   Mutations also → change_log → sync daemon → cloud (background)
 *   Unhandled routes → cloud proxy with cache fallback (legacy behaviour)
 */

const { ipcMain, BrowserWindow } = require('electron');
const { initLocalDb, closeLocalDb, getLocalDb } = require('./localDb');
const { routeLocally } = require('./localRouter');
const {
  startSyncDaemon,
  stopSyncDaemon,
  wakeSync,
  pauseSync,
  resumeSync,
  getSyncStatus,
  getSyncHistory,
  forcePull,
  storeAuthToken,
} = require('./syncDaemon');
const { initImageStore, saveFormDataImage, getImageUrl } = require('./imageStore');
const { startHub, stopHub, isHubRunning, getHubInfo, getConnectedTerminals, getPairingCode, generatePairingCode, verifyStaffLogin: hubVerifyStaffLogin } = require('./hub');
const { advertiseHub, stopAdvertising, discoverHub, stopDiscovery, getDiscoveredHub, cleanup: cleanupLan } = require('./lanDiscovery');
const { getTerminalId, getTerminalConfig, saveTerminalConfig, isPaired, isHub, setHubMode, clearPairing } = require('./terminalIdentity');
const { verifyStaffLogin, saveStaffCredentials } = require('./entityStore');

let WebSocket;
try {
  WebSocket = require('ws');
} catch {
  WebSocket = null;
}

// ─── Hub WebSocket Client (for non-hub terminals) ───────────────────────────

let hubWsClient = null;
let hubWsReconnectTimer = null;

function connectToHub(host, port) {
  if (!WebSocket) return;
  if (hubWsClient && hubWsClient.readyState === WebSocket.OPEN) return;

  const url = `ws://${host}:${port}`;
  try {
    hubWsClient = new WebSocket(url);

    hubWsClient.on('open', () => {
      console.log(`[Offline] Connected to hub WebSocket at ${url}`);
      // Identify ourselves
      const terminalId = getTerminalId();
      const config = getTerminalConfig();
      hubWsClient.send(JSON.stringify({
        type: 'identify',
        terminalId,
        name: config?.terminalName || 'Terminal',
      }));
    });

    hubWsClient.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        // Forward events to all renderer windows
        if (msg.type === 'event' || msg.type === 'change') {
          const windows = BrowserWindow.getAllWindows();
          for (const win of windows) {
            if (win.webContents && !win.webContents.isDestroyed()) {
              win.webContents.send('hub-event', msg);
            }
          }
        }
      } catch {
        // ignore parse errors
      }
    });

    hubWsClient.on('close', () => {
      console.log('[Offline] Hub WebSocket disconnected, reconnecting in 5s...');
      hubWsClient = null;
      clearTimeout(hubWsReconnectTimer);
      hubWsReconnectTimer = setTimeout(() => connectToHub(host, port), 5000);
    });

    hubWsClient.on('error', (err) => {
      console.error('[Offline] Hub WebSocket error:', err.message);
    });
  } catch (err) {
    console.error('[Offline] Failed to connect to hub WebSocket:', err.message);
  }
}

function disconnectFromHub() {
  clearTimeout(hubWsReconnectTimer);
  if (hubWsClient) {
    try { hubWsClient.close(); } catch { /* ignore */ }
    hubWsClient = null;
  }
}

// ─── Configuration ──────────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://dine-be2-phi.vercel.app';
const CLOUD_TIMEOUT_MS = 15_000;

// ─── State ──────────────────────────────────────────────────────────────────

let lanMode = false; // set via config or IPC
let seedingInProgress = false;

// ─── Helpers ────────────────────────────────────────────────────────────────

function getActiveRestaurantId() {
  try {
    const db = getLocalDb();
    const row = db.prepare("SELECT value FROM sync_meta WHERE key = 'active_restaurant_id'").get();
    return row ? row.value : null;
  } catch {
    return null;
  }
}

// ─── Auto-Seed Helper ───────────────────────────────────────────────────────

function hasLocalData(restaurantId) {
  try {
    const db = getLocalDb();
    const row = db.prepare(
      'SELECT COUNT(*) as c FROM menu_items WHERE restaurant_id = ?'
    ).get(restaurantId);
    return row && row.c > 0;
  } catch {
    return false;
  }
}

// ─── Cloud Proxy (fallback for unhandled routes) ────────────────────────────

async function proxyToCloud(endpoint, method, body, headers) {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CLOUD_TIMEOUT_MS);

  const fetchHeaders = {};
  if (headers) {
    Object.entries(headers).forEach(([k, v]) => {
      if (v) fetchHeaders[k] = v;
    });
  }
  if (body && !fetchHeaders['Content-Type']) {
    fetchHeaders['Content-Type'] = 'application/json';
  }

  try {
    const resp = await fetch(fullUrl, {
      method: method.toUpperCase(),
      headers: fetchHeaders,
      body: method.toUpperCase() !== 'GET' ? body || undefined : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const status = resp.status;
    const bodyText = await resp.text();
    let data = null;
    try {
      data = JSON.parse(bodyText);
    } catch {
      data = { raw: bodyText };
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
    return {
      data: null,
      from_cache: false,
      is_queued: false,
      mutation_id: null,
      status_code: 503,
      error: `Network error: ${err.message}`,
    };
  }
}

// ─── Image Upload Interception ──────────────────────────────────────────────

function isImageUpload(endpoint, headers) {
  if (/\/(upload|image)/.test(endpoint)) return true;
  if (headers) {
    const ct =
      headers['Content-Type'] || headers['content-type'] || '';
    if (ct.includes('multipart/form-data')) return true;
  }
  return false;
}

// ─── Main API Request Handler ───────────────────────────────────────────────

async function handleApiRequest({ endpoint, method, body, headers }) {
  const m = (method || 'GET').toUpperCase();

  // 1. Persist auth token for sync daemon
  if (headers) {
    const authKey = Object.keys(headers).find(
      (k) => k.toLowerCase() === 'authorization'
    );
    if (authKey && headers[authKey]) {
      storeAuthToken(headers[authKey]);
    }
  }

  // 2. Persist active restaurant ID and auto-seed if first time
  const ridMatch = endpoint.match(/\/api\/(?:orders|menus|tables|floors|staff|customers|inventory|kot|register|saved-carts|waiters|bookings|invoices)\/([a-zA-Z0-9_-]+)/);
  if (ridMatch) {
    const detectedRid = ridMatch[1];
    try {
      const db = getLocalDb();
      const prevRow = db.prepare("SELECT value FROM sync_meta WHERE key = 'active_restaurant_id'").get();
      const prevRid = prevRow ? prevRow.value : null;

      db.prepare(
        'INSERT OR REPLACE INTO sync_meta (key, value, updated_at) VALUES (?, ?, ?)'
      ).run('active_restaurant_id', detectedRid, Date.now());

      // Auto-seed: if restaurant changed or no menu data exists, trigger forcePull
      if (!seedingInProgress && (prevRid !== detectedRid || !hasLocalData(detectedRid))) {
        seedingInProgress = true;
        console.log(`[Offline] Auto-seeding data for restaurant ${detectedRid}`);
        forcePull(detectedRid)
          .then((results) => {
            console.log('[Offline] Auto-seed complete:', results);
          })
          .catch((err) => {
            console.error('[Offline] Auto-seed failed:', err.message);
          })
          .finally(() => {
            seedingInProgress = false;
          });
      }
    } catch {
      // ignore
    }
  }

  // 3. Intercept image uploads — save locally
  if (m !== 'GET' && isImageUpload(endpoint, headers)) {
    try {
      const ct = headers?.['Content-Type'] || headers?.['content-type'] || '';
      if (ct.includes('multipart/form-data') && body) {
        const bodyBuffer = Buffer.isBuffer(body)
          ? body
          : Buffer.from(body, 'binary');
        const results = saveFormDataImage(bodyBuffer, ct, {
          entityType: 'general',
        });
        return {
          data: {
            success: true,
            images: results.map((r) => ({
              url: r.localUrl,
              id: r.id,
              filename: r.filename,
            })),
          },
          from_cache: false,
          is_queued: true,
          mutation_id: null,
          status_code: 200,
          error: null,
        };
      }
    } catch (err) {
      console.error('[Offline] Image save error:', err.message);
    }
  }

  // 4. Try local router (SQLite) — this is the main path
  const localResult = routeLocally(endpoint, m, body ? tryParse(body) : null);

  if (localResult.handled) {
    // Local SQLite handled the request — return immediately
    // For mutations, wake the sync daemon so it pushes to cloud ASAP
    if (m !== 'GET') {
      wakeSync();
    }

    return {
      data: localResult.data,
      from_cache: false,
      is_queued: m !== 'GET',
      mutation_id: null,
      status_code: localResult.statusCode || 200,
      error: null,
    };
  }

  // 5. Not handled locally — proxy to cloud (fallback for auth, uploads, AI, etc.)
  return proxyToCloud(endpoint, m, body, headers);
}

function tryParse(body) {
  if (!body) return null;
  if (typeof body === 'object') return body;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

// ─── IPC Registration ───────────────────────────────────────────────────────

function registerIPC() {
  // Main API proxy — single entry point for ALL API calls from renderer
  ipcMain.handle('electron:apiRequest', async (_event, request) => {
    return handleApiRequest(request);
  });

  // ── Sync Control ──

  ipcMain.handle('electron:getSyncStatus', async () => {
    return getSyncStatus();
  });

  ipcMain.handle('electron:getSyncHistory', async (_event, limit) => {
    return getSyncHistory(limit || 50);
  });

  ipcMain.handle('electron:triggerSync', async () => {
    wakeSync();
    return { success: true };
  });

  ipcMain.handle('electron:pauseSync', async () => {
    pauseSync();
    return { success: true };
  });

  ipcMain.handle('electron:resumeSync', async () => {
    resumeSync();
    return { success: true };
  });

  ipcMain.handle('electron:forcePull', async (_event, restaurantId) => {
    return forcePull(restaurantId);
  });

  // ── LAN Hub Control ──

  ipcMain.handle('electron:startHub', async (_event, port) => {
    const info = await startHub(port);
    const restaurantId = getActiveRestaurantId();
    advertiseHub(port, { restaurantId });
    setHubMode(true, port);
    lanMode = true;
    return info;
  });

  ipcMain.handle('electron:stopHub', async () => {
    stopAdvertising();
    await stopHub();
    setHubMode(false);
    lanMode = false;
    return { success: true };
  });

  ipcMain.handle('electron:getHubInfo', async () => {
    return getHubInfo();
  });

  ipcMain.handle('electron:getConnectedTerminals', async () => {
    return getConnectedTerminals();
  });

  ipcMain.handle('electron:discoverHub', async () => {
    return new Promise((resolve) => {
      discoverHub(
        (hubInfo) => resolve({ found: true, hub: hubInfo }),
        () => {}
      );
      // Timeout after 5s
      setTimeout(() => resolve({ found: false, hub: getDiscoveredHub() }), 5000);
    });
  });

  ipcMain.handle('electron:getDiscoveredHub', async () => {
    return getDiscoveredHub();
  });

  // ── Terminal Identity & Pairing ──

  ipcMain.handle('electron:getTerminalId', async () => {
    return getTerminalId();
  });

  ipcMain.handle('electron:getTerminalConfig', async () => {
    return getTerminalConfig();
  });

  ipcMain.handle('electron:isPaired', async () => {
    return isPaired();
  });

  ipcMain.handle('electron:isHub', async () => {
    return isHub();
  });

  ipcMain.handle('electron:pairWithHub', async (_event, { host, port, pairingCode, terminalName, role }) => {
    const terminalId = getTerminalId();

    try {
      const resp = await fetch(`http://${host}:${port}/hub/pair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairingCode,
          terminalId,
          name: terminalName || 'Terminal',
          deviceType: 'electron',
          role: role || 'counter',
        }),
      });

      const data = await resp.json();
      if (!data.success) {
        return { success: false, error: data.error || 'Pairing failed' };
      }

      // Save pairing config
      saveTerminalConfig({
        pairedAt: Date.now(),
        hubHost: host,
        hubPort: port,
        restaurantId: data.restaurantId,
        restaurantName: data.restaurantName,
        terminalName: terminalName || 'Terminal',
        role: role || 'counter',
      });

      // Seed local DB with data from hub
      if (data.seedData) {
        const entityStore = require('./entityStore');
        const rid = data.restaurantId;
        const s = data.seedData;
        try {
          if (s.menu_items?.length) entityStore.saveMenuItems(rid, s.menu_items);
          if (s.tables?.length) entityStore.saveTables(rid, s.tables);
          if (s.floors?.length) entityStore.saveFloors(rid, s.floors);
          if (s.staff?.length) {
            entityStore.saveStaff(rid, s.staff);
            entityStore.saveStaffCredentials(rid, s.staff);
          }
          if (s.customers?.length) entityStore.saveCustomers(rid, s.customers);
          if (s.offers?.length) entityStore.saveOffers(rid, s.offers);
          if (s.tax_settings?.length) entityStore.saveTaxSettings(rid, s.tax_settings[0]);
          if (s.billing_settings?.length) entityStore.saveBillingSettings(rid, s.billing_settings[0]);
          if (s.business_settings?.length) entityStore.saveBusinessSettings(rid, s.business_settings[0]);
          if (s.print_settings?.length) entityStore.savePrintSettings(rid, s.print_settings[0]);
          if (s.restaurant?.length) entityStore.saveRestaurant(rid, s.restaurant[0]);
        } catch (err) {
          console.error('[Offline] Seed from hub error:', err.message);
        }
      }

      // Connect WebSocket to hub for real-time events
      connectToHub(host, port);

      return { success: true, restaurantId: data.restaurantId, restaurantName: data.restaurantName };
    } catch (err) {
      return { success: false, error: `Connection failed: ${err.message}` };
    }
  });

  ipcMain.handle('electron:unpair', async () => {
    disconnectFromHub();
    clearPairing();
    return { success: true };
  });

  ipcMain.handle('electron:getPairingCode', async () => {
    return getPairingCode();
  });

  ipcMain.handle('electron:regeneratePairingCode', async () => {
    return generatePairingCode();
  });

  ipcMain.handle('electron:getHubQrData', async () => {
    const info = getHubInfo();
    if (!info.isRunning) return null;
    const os = require('os');
    const nets = os.networkInterfaces();
    let ip = '127.0.0.1';
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          ip = net.address;
          break;
        }
      }
      if (ip !== '127.0.0.1') break;
    }
    const code = getPairingCode();
    return JSON.stringify({ h: ip, p: info.port, c: code.code });
  });

  // ── Local Staff Auth ──

  ipcMain.handle('electron:localStaffLogin', async (_event, { loginId, password }) => {
    // Try local entityStore verification first
    const result = verifyStaffLogin(loginId, password);
    if (result.success) {
      // Generate a local token
      const tokenPayload = {
        staffId: result.staff.id,
        loginId: result.staff.loginId,
        role: result.staff.role,
        restaurantId: result.staff.restaurantId,
        exp: Date.now() + 24 * 60 * 60 * 1000,
        iss: 'dineopen-local',
      };
      const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');
      return {
        success: true,
        token: `local:${token}`,
        user: result.staff,
        restaurant: { id: result.staff.restaurantId },
      };
    }

    // Fallback: try hub if we're paired
    const config = getTerminalConfig();
    if (config?.hubHost) {
      try {
        const resp = await fetch(`http://${config.hubHost}:${config.hubPort}/hub/auth/staff-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ loginId, password }),
        });
        return await resp.json();
      } catch {
        // hub unreachable
      }
    }

    return { success: false, error: 'Invalid credentials' };
  });

  // ── Image helpers ──

  ipcMain.handle('electron:getImageUrl', async (_event, urlOrLocal) => {
    return getImageUrl(urlOrLocal);
  });

  // ── Data management ──

  ipcMain.handle('electron:clearLocalData', async () => {
    const db = getLocalDb();
    if (!db) return { success: false };

    // Clear all entity data but keep sync_meta (auth token, restaurant id)
    const tables = [
      'orders', 'menu_items', 'tables_local', 'floors', 'customers',
      'staff', 'waiters', 'inventory_items', 'recipes', 'rooms',
      'saved_carts', 'kot_queue', 'register', 'invoices', 'bookings',
      'offers', 'offer_settings', 'tax_settings', 'billing_settings',
      'pricing_settings', 'print_settings', 'print_stations',
      'business_settings', 'menu_theme', 'restaurant', 'entities',
    ];

    for (const table of tables) {
      try {
        db.prepare(`DELETE FROM ${table}`).run();
      } catch {
        // table may not exist
      }
    }

    return { success: true };
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

function initOfflineEngine(app) {
  const userDataPath = app.getPath('userData');

  // Initialize local database (creates tables via migrations)
  initLocalDb(userDataPath);

  // Initialize image storage directory
  initImageStore(userDataPath);

  // Register IPC handlers
  registerIPC();

  // Start background sync daemon
  startSyncDaemon();

  // Check for LAN mode config
  try {
    const fs = require('fs');
    const configPath = require('path').join(userDataPath, 'dineopen-settings.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.lanHub) {
        lanMode = true;
        startHub(config.lanHubPort || 3847)
          .then(() => {
            advertiseHub(config.lanHubPort || 3847, {
              restaurantId: config.restaurantId || '',
              terminalName: config.terminalName || 'Hub',
            });
            console.log('[Offline] LAN hub started from config');
          })
          .catch((err) => {
            console.error('[Offline] LAN hub start failed:', err.message);
          });
      } else if (config.lanClient || (config.terminalPairing && config.terminalPairing.pairedAt)) {
        // Client terminal — connect to hub WebSocket
        const pairing = config.terminalPairing;
        if (pairing && pairing.hubHost) {
          connectToHub(pairing.hubHost, pairing.hubPort || 3847);
        }
        // Also auto-discover hub on LAN
        discoverHub(
          (hub) => {
            console.log(`[Offline] Discovered LAN hub at ${hub.host}:${hub.port}`);
            // If we're paired but WS is not connected, try connecting
            if (pairing && !hubWsClient) {
              connectToHub(hub.host, hub.port);
            }
          },
          () => {
            console.log('[Offline] LAN hub went down');
          }
        );
      }
    }
  } catch {
    // no config or parse error — skip LAN
  }

  console.log('[Offline] Local-first engine initialized');
}

function shutdownOfflineEngine() {
  try { stopSyncDaemon(); } catch {}
  try { disconnectFromHub(); } catch {}
  try { stopAdvertising(); } catch {}
  try { stopDiscovery(); } catch {}
  try { cleanupLan(); } catch {}
  try { stopHub().catch(() => {}); } catch {}
  try { closeLocalDb(); } catch {}
  console.log('[Offline] Engine shut down');
}

module.exports = { initOfflineEngine, shutdownOfflineEngine };
