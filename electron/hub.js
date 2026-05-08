/**
 * DineOpen LAN Hub Server
 *
 * Runs on one designated Electron terminal to enable real-time communication
 * between multiple POS terminals on the same local network WITHOUT internet.
 *
 * Architecture:
 *   - Express HTTP server for REST API (mirrors cloud endpoints)
 *   - WebSocket server for real-time change + event broadcasting
 *   - Reads/writes from the hub's local SQLite via better-sqlite3
 *   - Pairing system: 6-digit code, terminal registry, staff local auth
 */

const express = require('express');
const http = require('http');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let bcryptjs;
try {
  bcryptjs = require('bcryptjs');
} catch {
  // bcryptjs not installed — staff login will fail gracefully
  bcryptjs = null;
}

// ─── State ──────────────────────────────────────────────────────────────────

let server = null;
let wss = null;
let db = null;
const terminals = new Map(); // ws -> { id, name, connectedAt, ... }

// Pairing code state
let pairingCode = null;
let pairingCodeCreatedAt = 0;
const PAIRING_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── SQLite helpers ─────────────────────────────────────────────────────────

function getDb() {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'dineopen-offline.sqlite');
    db = new Database(dbPath, { readonly: false, fileMustExist: false });
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');

    db.exec(`
      CREATE TABLE IF NOT EXISTS hub_entities (
        entity_type TEXT NOT NULL,
        entity_id   TEXT NOT NULL,
        restaurant_id TEXT NOT NULL DEFAULT '',
        data_json   TEXT NOT NULL,
        updated_at  INTEGER NOT NULL,
        PRIMARY KEY (entity_type, entity_id)
      );

      CREATE TABLE IF NOT EXISTS paired_terminals (
        terminal_id   TEXT PRIMARY KEY,
        name          TEXT NOT NULL DEFAULT 'Terminal',
        role          TEXT NOT NULL DEFAULT 'counter',
        device_type   TEXT NOT NULL DEFAULT 'electron',
        paired_at     INTEGER NOT NULL,
        last_seen     INTEGER,
        meta_json     TEXT
      );

      CREATE TABLE IF NOT EXISTS staff_credentials (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        login_id TEXT,
        password_hash TEXT,
        name TEXT,
        role TEXT,
        page_access TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_hub_staff_cred_login ON staff_credentials(login_id);
    `);
  }
  return db;
}

// ─── Pairing Code ───────────────────────────────────────────────────────────

function generatePairingCode() {
  pairingCode = String(crypto.randomInt(100000, 999999));
  pairingCodeCreatedAt = Date.now();
  console.log(`[Hub] New pairing code generated: ${pairingCode}`);
  return pairingCode;
}

function getPairingCode() {
  if (!pairingCode || Date.now() - pairingCodeCreatedAt > PAIRING_CODE_TTL_MS) {
    generatePairingCode();
  }
  return {
    code: pairingCode,
    createdAt: pairingCodeCreatedAt,
    expiresAt: pairingCodeCreatedAt + PAIRING_CODE_TTL_MS,
  };
}

function validatePairingCode(code) {
  if (!pairingCode) return false;
  if (Date.now() - pairingCodeCreatedAt > PAIRING_CODE_TTL_MS) return false;
  return String(code) === String(pairingCode);
}

// ─── Terminal Registry ──────────────────────────────────────────────────────

function registerTerminal(terminalId, name, role, deviceType, meta) {
  const d = getDb();
  d.prepare(`
    INSERT INTO paired_terminals (terminal_id, name, role, device_type, paired_at, last_seen, meta_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(terminal_id) DO UPDATE SET
      name = excluded.name,
      role = excluded.role,
      device_type = excluded.device_type,
      last_seen = excluded.last_seen,
      meta_json = excluded.meta_json
  `).run(
    terminalId,
    name || 'Terminal',
    role || 'counter',
    deviceType || 'electron',
    Date.now(),
    Date.now(),
    meta ? JSON.stringify(meta) : null,
  );
}

function updateTerminalLastSeen(terminalId) {
  try {
    const d = getDb();
    d.prepare('UPDATE paired_terminals SET last_seen = ? WHERE terminal_id = ?')
      .run(Date.now(), terminalId);
  } catch {
    // ignore
  }
}

function isTerminalPaired(terminalId) {
  const d = getDb();
  const row = d.prepare('SELECT terminal_id FROM paired_terminals WHERE terminal_id = ?').get(terminalId);
  return !!row;
}

function getAllPairedTerminals() {
  const d = getDb();
  const rows = d.prepare('SELECT * FROM paired_terminals ORDER BY paired_at').all();

  // Merge with live connection status
  const liveIds = new Set();
  for (const [, info] of terminals) {
    liveIds.add(info.id);
  }

  return rows.map((r) => ({
    terminalId: r.terminal_id,
    name: r.name,
    role: r.role,
    deviceType: r.device_type,
    pairedAt: r.paired_at,
    lastSeen: r.last_seen,
    meta: r.meta_json ? JSON.parse(r.meta_json) : null,
    online: liveIds.has(r.terminal_id),
  }));
}

// ─── Seed Data for Pairing ──────────────────────────────────────────────────

function getSeedData(restaurantId) {
  const d = getDb();
  const types = ['restaurant', 'menu_items', 'tables', 'floors', 'staff',
    'tax_settings', 'billing_settings', 'business_settings', 'print_settings',
    'pricing_settings', 'customers', 'offers', 'offer_settings'];

  const seed = {};
  for (const t of types) {
    const rows = restaurantId
      ? d.prepare('SELECT data_json FROM hub_entities WHERE entity_type = ? AND restaurant_id = ?').all(t, restaurantId)
      : d.prepare('SELECT data_json FROM hub_entities WHERE entity_type = ?').all(t);
    seed[t] = rows.map((r) => {
      try { return JSON.parse(r.data_json); } catch { return r.data_json; }
    });
  }
  return seed;
}

// ─── Staff Local Auth ───────────────────────────────────────────────────────

function verifyStaffLogin(loginId, password) {
  const d = getDb();

  // Try staff_credentials table first (synced from cloud)
  try {
    const cred = d.prepare(
      'SELECT id, login_id, password_hash, name, role, restaurant_id FROM staff_credentials WHERE login_id = ?'
    ).get(loginId);

    if (cred && bcryptjs && bcryptjs.compareSync(password, cred.password_hash)) {
      return {
        success: true,
        staff: {
          id: cred.id,
          loginId: cred.login_id,
          name: cred.name,
          role: cred.role,
          restaurantId: cred.restaurant_id,
        },
      };
    }
  } catch {
    // table may not exist yet
  }

  // Fallback: check hub_entities staff records
  try {
    const staffRows = d.prepare(
      "SELECT data_json FROM hub_entities WHERE entity_type = 'staff'"
    ).all();

    for (const row of staffRows) {
      try {
        const staff = JSON.parse(row.data_json);
        if (staff.loginId === loginId || staff.username === loginId) {
          if (bcryptjs && staff.password && bcryptjs.compareSync(password, staff.password)) {
            return {
              success: true,
              staff: {
                id: staff.id || staff._id,
                loginId: staff.loginId,
                name: staff.name,
                role: staff.role,
                restaurantId: staff.restaurantId || staff.restaurant_id,
              },
            };
          }
        }
      } catch {
        continue;
      }
    }
  } catch {
    // ignore
  }

  return { success: false, error: 'Invalid credentials' };
}

// ─── Pusher-Compatible Event Broadcasting ───────────────────────────────────

const ENTITY_EVENT_MAP = {
  orders: {
    CREATE: 'order-created',
    UPDATE: 'order-updated',
    DELETE: 'order-deleted',
  },
  menu_items: {
    CREATE: 'menu-item-created',
    UPDATE: 'menu-updated',
    DELETE: 'menu-item-deleted',
  },
  tables: {
    CREATE: 'table-updated',
    UPDATE: 'table-updated',
    DELETE: 'table-updated',
  },
};

function broadcastEntityEvent(entityType, operation, data, entityId) {
  const eventMap = ENTITY_EVENT_MAP[entityType];
  if (!eventMap) return;

  const eventName = eventMap[operation];
  if (!eventName) return;

  // Check for order status update specifically
  if (entityType === 'orders' && operation === 'UPDATE' && data && data.status) {
    broadcast(null, {
      type: 'event',
      event: 'order-status-updated',
      data: { orderId: entityId, ...data },
    });
    return;
  }

  broadcast(null, {
    type: 'event',
    event: eventName,
    data: { orderId: entityId, entityId, ...data },
  });
}

// ─── Apply changes to local SQLite ──────────────────────────────────────────

function applyChange(msg) {
  try {
    const d = getDb();

    switch (msg.operation) {
      case 'CREATE':
      case 'UPDATE': {
        const dataJson = typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data);
        d.prepare(`
          INSERT INTO hub_entities (entity_type, entity_id, restaurant_id, data_json, updated_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(entity_type, entity_id) DO UPDATE SET
            data_json = excluded.data_json,
            restaurant_id = excluded.restaurant_id,
            updated_at = excluded.updated_at
        `).run(
          msg.entityType,
          msg.entityId,
          msg.restaurantId || '',
          dataJson,
          Date.now(),
        );

        // Keep staff_credentials in sync whenever staff data has login info
        if (msg.entityType === 'staff') {
          try {
            const staff = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data;
            if (staff && (staff.loginId || staff.login_id) && (staff.password || staff.passwordHash)) {
              d.prepare(`
                INSERT INTO staff_credentials (id, restaurant_id, login_id, password_hash, name, role, page_access, synced_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                  login_id = excluded.login_id, password_hash = excluded.password_hash,
                  name = excluded.name, role = excluded.role,
                  page_access = excluded.page_access, synced_at = excluded.synced_at
              `).run(
                msg.entityId,
                msg.restaurantId || staff.restaurantId || '',
                staff.loginId || staff.login_id || '',
                staff.password || staff.passwordHash || '',
                staff.name || '',
                staff.role || 'employee',
                staff.pageAccess ? JSON.stringify(staff.pageAccess) : null,
                Date.now()
              );
            }
          } catch { /* staff_credentials sync is best-effort */ }
        }
        break;
      }
      case 'DELETE': {
        d.prepare(
          'DELETE FROM hub_entities WHERE entity_type = ? AND entity_id = ?'
        ).run(msg.entityType, msg.entityId);

        // Also remove from staff_credentials
        if (msg.entityType === 'staff') {
          try { d.prepare('DELETE FROM staff_credentials WHERE id = ?').run(msg.entityId); } catch {}
        }
        break;
      }
    }
  } catch (e) {
    console.error('[Hub] Failed to apply change:', e.message);
  }
}

// ─── Pull data from local SQLite ────────────────────────────────────────────

function getPullData(entityType, restaurantId) {
  try {
    const d = getDb();
    let rows;

    if (restaurantId) {
      rows = d.prepare(
        'SELECT data_json FROM hub_entities WHERE entity_type = ? AND restaurant_id = ? ORDER BY updated_at DESC'
      ).all(entityType, restaurantId);
    } else {
      rows = d.prepare(
        'SELECT data_json FROM hub_entities WHERE entity_type = ? ORDER BY updated_at DESC'
      ).all(entityType);
    }

    return rows.map((r) => {
      try {
        return JSON.parse(r.data_json);
      } catch {
        return r.data_json;
      }
    });
  } catch (e) {
    console.error('[Hub] Failed to pull data:', e.message);
    return [];
  }
}

// ─── Broadcast to all terminals except sender ───────────────────────────────

function broadcast(excludeWs, message) {
  const msgStr = JSON.stringify(message);
  for (const [ws] of terminals) {
    if (ws !== excludeWs && ws.readyState === 1) {
      try {
        ws.send(msgStr);
      } catch (e) {
        console.error('[Hub] Broadcast send error:', e.message);
      }
    }
  }
}

// ─── Handle incoming WebSocket messages from terminals ──────────────────────

function handleTerminalMessage(senderWs, msg) {
  switch (msg.type) {
    case 'identify': {
      const info = terminals.get(senderWs);
      if (info) {
        // If terminal provides its persistent ID, use it
        if (msg.terminalId && isTerminalPaired(msg.terminalId)) {
          info.id = msg.terminalId;
          updateTerminalLastSeen(msg.terminalId);
        }
        info.name = msg.name || 'Terminal';
        if (msg.terminalMeta) info.meta = msg.terminalMeta;
      }
      break;
    }

    case 'change': {
      applyChange(msg);

      broadcast(senderWs, {
        type: 'change',
        entityType: msg.entityType,
        entityId: msg.entityId,
        operation: msg.operation,
        data: msg.data,
        restaurantId: msg.restaurantId,
        sourceTerminal: terminals.get(senderWs)?.id,
        timestamp: Date.now(),
      });

      // Also broadcast as Pusher-compatible event
      broadcastEntityEvent(msg.entityType, msg.operation, msg.data, msg.entityId);
      break;
    }

    case 'pull': {
      const pullData = getPullData(msg.entityType, msg.restaurantId);
      senderWs.send(
        JSON.stringify({
          type: 'pull_response',
          entityType: msg.entityType,
          data: pullData,
        }),
      );
      break;
    }

    case 'ping': {
      senderWs.send(JSON.stringify({ type: 'pong', hubTime: Date.now() }));
      break;
    }

    default:
      console.warn('[Hub] Unknown message type:', msg.type);
  }
}

// ─── REST API routes ────────────────────────────────────────────────────────

function buildApi(expressApp) {
  expressApp.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      role: 'hub',
      terminals: terminals.size,
      uptime: process.uptime(),
    });
  });

  // ── Pairing endpoints ──

  expressApp.get('/hub/pairing-code', (_req, res) => {
    res.json({ success: true, ...getPairingCode() });
  });

  expressApp.post('/hub/pairing-code/regenerate', (_req, res) => {
    generatePairingCode();
    res.json({ success: true, ...getPairingCode() });
  });

  expressApp.post('/hub/pair', (req, res) => {
    const { pairingCode: code, terminalId, name, deviceType, role } = req.body;

    if (!validatePairingCode(code)) {
      return res.status(403).json({ success: false, error: 'Invalid or expired pairing code' });
    }

    if (!terminalId) {
      return res.status(400).json({ success: false, error: 'terminalId is required' });
    }

    // Register terminal
    registerTerminal(terminalId, name, role, deviceType);

    // Get restaurant ID from hub's sync_meta or hub_entities
    let restaurantId = '';
    try {
      const d = getDb();
      // Try sync_meta first
      const meta = d.prepare("SELECT value FROM sync_meta WHERE key = 'active_restaurant_id'").get();
      if (meta) restaurantId = meta.value;
      // Fallback: find from hub_entities
      if (!restaurantId) {
        const row = d.prepare("SELECT restaurant_id FROM hub_entities WHERE restaurant_id != '' LIMIT 1").get();
        if (row) restaurantId = row.restaurant_id;
      }
    } catch {
      // ignore
    }

    // Get restaurant name
    let restaurantName = '';
    try {
      const restData = getPullData('restaurant', restaurantId);
      if (restData.length > 0 && restData[0].name) {
        restaurantName = restData[0].name;
      }
    } catch {
      // ignore
    }

    // Return seed data
    const seedData = getSeedData(restaurantId);

    res.json({
      success: true,
      restaurantId,
      restaurantName,
      terminalId,
      seedData,
    });

    console.log(`[Hub] Terminal paired: ${terminalId} (${name || 'unnamed'}, ${deviceType})`);
  });

  // ── Terminal management ──

  expressApp.get('/hub/terminals', (_req, res) => {
    res.json({
      success: true,
      terminals: getAllPairedTerminals(),
    });
  });

  expressApp.patch('/hub/terminals/:terminalId', (req, res) => {
    const { terminalId } = req.params;
    const { name, role } = req.body;
    const d = getDb();

    const existing = d.prepare('SELECT * FROM paired_terminals WHERE terminal_id = ?').get(terminalId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Terminal not found' });
    }

    if (name) d.prepare('UPDATE paired_terminals SET name = ? WHERE terminal_id = ?').run(name, terminalId);
    if (role) d.prepare('UPDATE paired_terminals SET role = ? WHERE terminal_id = ?').run(role, terminalId);

    res.json({ success: true });
  });

  expressApp.delete('/hub/terminals/:terminalId', (req, res) => {
    const { terminalId } = req.params;
    const d = getDb();
    d.prepare('DELETE FROM paired_terminals WHERE terminal_id = ?').run(terminalId);

    // Disconnect the WebSocket if connected
    for (const [ws, info] of terminals) {
      if (info.id === terminalId) {
        try {
          ws.send(JSON.stringify({ type: 'unpaired', timestamp: Date.now() }));
          ws.close(1000, 'Unpaired by admin');
        } catch {
          // ignore
        }
        break;
      }
    }

    res.json({ success: true });
    console.log(`[Hub] Terminal unpaired: ${terminalId}`);
  });

  // ── Staff local auth ──

  expressApp.post('/hub/auth/staff-login', (req, res) => {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
      return res.status(400).json({ success: false, error: 'loginId and password required' });
    }

    if (!bcryptjs) {
      return res.status(500).json({ success: false, error: 'bcryptjs not installed on hub' });
    }

    const result = verifyStaffLogin(loginId, password);

    if (result.success) {
      // Generate a simple token (base64 JSON, valid 24h)
      const tokenPayload = {
        staffId: result.staff.id,
        loginId: result.staff.loginId,
        role: result.staff.role,
        restaurantId: result.staff.restaurantId,
        exp: Date.now() + 24 * 60 * 60 * 1000,
        iss: 'dineopen-hub',
      };
      const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

      res.json({
        success: true,
        token: `hub:${token}`,
        user: result.staff,
        restaurant: { id: result.staff.restaurantId },
      });
    } else {
      res.status(401).json({ success: false, error: result.error });
    }
  });

  // ── Entity CRUD (existing, enhanced with event broadcasting) ──

  // GET entities by type and restaurantId
  expressApp.get('/api/:entityType/:restaurantId', (req, res) => {
    try {
      const { entityType, restaurantId } = req.params;
      const data = getPullData(entityType, restaurantId);
      res.json({ success: true, data });
    } catch (e) {
      console.error('[Hub REST] GET error:', e.message);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // POST create staff (specific route — must be before generic /api/:entityType)
  expressApp.post('/api/staff/:restaurantId', (req, res) => {
    try {
      const { restaurantId } = req.params;
      const body = req.body;
      const id = body.id || body._id || crypto.randomUUID();

      // Generate loginId (5-digit numeric)
      let loginId = body.loginId;
      if (!loginId) {
        const d = getDb();
        const existingLogins = new Set();
        try {
          const rows = d.prepare(
            "SELECT data_json FROM hub_entities WHERE entity_type = 'staff'"
          ).all();
          rows.forEach(r => {
            try { const s = JSON.parse(r.data_json); if (s.loginId) existingLogins.add(s.loginId); } catch {}
          });
        } catch {}

        let attempts = 0;
        do {
          loginId = String(Math.floor(10000 + Math.random() * 90000));
          attempts++;
        } while (existingLogins.has(loginId) && attempts < 100);
      }

      // Generate temporary password (8-char base-36)
      const temporaryPassword = body.password || Math.random().toString(36).slice(-8);

      // Hash password
      let hashedPassword = '';
      if (bcryptjs) {
        hashedPassword = bcryptjs.hashSync(temporaryPassword, 10);
      }

      const staffData = {
        ...body,
        id,
        loginId,
        password: hashedPassword,
        restaurantId,
        status: body.status || 'active',
        provider: 'staff',
        temporaryPassword: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in hub_entities
      applyChange({
        entityType: 'staff',
        entityId: id,
        operation: 'CREATE',
        data: staffData,
        restaurantId,
      });

      // Store in staff_credentials for local login on hub
      try {
        const d = getDb();
        d.prepare(`
          INSERT INTO staff_credentials (id, restaurant_id, login_id, password_hash, name, role, page_access, synced_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            login_id = excluded.login_id, password_hash = excluded.password_hash,
            name = excluded.name, role = excluded.role,
            page_access = excluded.page_access, synced_at = excluded.synced_at
        `).run(
          id, restaurantId, loginId, hashedPassword,
          staffData.name || '', staffData.role || 'employee',
          staffData.pageAccess ? JSON.stringify(staffData.pageAccess) : null,
          Date.now()
        );
      } catch (e) {
        console.error('[Hub] Failed to save staff credentials:', e.message);
      }

      // Broadcast to all terminals
      broadcast(null, {
        type: 'change',
        entityType: 'staff',
        entityId: id,
        operation: 'CREATE',
        data: staffData,
        restaurantId,
        sourceTerminal: '__hub_rest__',
        timestamp: Date.now(),
      });

      broadcastEntityEvent('staff', 'CREATE', staffData, id);

      res.status(201).json({
        success: true,
        message: 'Staff member added successfully. Login credentials generated.',
        staff: staffData,
        credentials: {
          loginId,
          username: staffData.username || null,
          password: temporaryPassword,
        },
      });
    } catch (e) {
      console.error('[Hub REST] POST staff error:', e.message);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // POST create entity
  expressApp.post('/api/:entityType', (req, res) => {
    try {
      const { entityType } = req.params;
      const body = req.body;
      const entityId = body.id || body._id || crypto.randomUUID();
      const restaurantId = body.restaurantId || body.restaurant_id || '';

      const changeMsg = {
        entityType,
        entityId,
        operation: 'CREATE',
        data: body,
        restaurantId,
      };

      applyChange(changeMsg);

      broadcast(null, {
        type: 'change',
        ...changeMsg,
        sourceTerminal: '__hub_rest__',
        timestamp: Date.now(),
      });

      // Broadcast Pusher-compatible event
      broadcastEntityEvent(entityType, 'CREATE', body, entityId);

      res.json({ success: true, id: entityId });
    } catch (e) {
      console.error('[Hub REST] POST error:', e.message);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // PUT update entity
  expressApp.put('/api/:entityType/:entityId', (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const body = req.body;
      const restaurantId = body.restaurantId || body.restaurant_id || '';

      const changeMsg = {
        entityType,
        entityId,
        operation: 'UPDATE',
        data: body,
        restaurantId,
      };

      applyChange(changeMsg);

      broadcast(null, {
        type: 'change',
        ...changeMsg,
        sourceTerminal: '__hub_rest__',
        timestamp: Date.now(),
      });

      broadcastEntityEvent(entityType, 'UPDATE', body, entityId);

      res.json({ success: true });
    } catch (e) {
      console.error('[Hub REST] PUT error:', e.message);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // PATCH partial update entity
  expressApp.patch('/api/:entityType/:entityId', (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const body = req.body;
      const restaurantId = body.restaurantId || body.restaurant_id || '';

      const d = getDb();
      const existing = d
        .prepare('SELECT data_json FROM hub_entities WHERE entity_type = ? AND entity_id = ?')
        .get(entityType, entityId);

      let merged = body;
      if (existing) {
        try {
          const prev = JSON.parse(existing.data_json);
          merged = { ...prev, ...body };
        } catch {
          // use body as-is
        }
      }

      const changeMsg = {
        entityType,
        entityId,
        operation: 'UPDATE',
        data: merged,
        restaurantId,
      };

      applyChange(changeMsg);

      broadcast(null, {
        type: 'change',
        ...changeMsg,
        sourceTerminal: '__hub_rest__',
        timestamp: Date.now(),
      });

      broadcastEntityEvent(entityType, 'UPDATE', merged, entityId);

      res.json({ success: true });
    } catch (e) {
      console.error('[Hub REST] PATCH error:', e.message);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // DELETE entity
  expressApp.delete('/api/:entityType/:entityId', (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const restaurantId = req.query.restaurantId || '';

      const changeMsg = {
        entityType,
        entityId,
        operation: 'DELETE',
        data: null,
        restaurantId,
      };

      applyChange(changeMsg);

      broadcast(null, {
        type: 'change',
        ...changeMsg,
        sourceTerminal: '__hub_rest__',
        timestamp: Date.now(),
      });

      broadcastEntityEvent(entityType, 'DELETE', { entityId }, entityId);

      res.json({ success: true });
    } catch (e) {
      console.error('[Hub REST] DELETE error:', e.message);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // GET single entity by type and id
  expressApp.get('/api/:entityType/entity/:entityId', (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const d = getDb();
      const row = d
        .prepare('SELECT data_json FROM hub_entities WHERE entity_type = ? AND entity_id = ?')
        .get(entityType, entityId);

      if (!row) {
        return res.status(404).json({ success: false, error: 'Not found' });
      }

      res.json({ success: true, data: JSON.parse(row.data_json) });
    } catch (e) {
      console.error('[Hub REST] GET single error:', e.message);
      res.status(500).json({ success: false, error: e.message });
    }
  });
}

// ─── Public API ─────────────────────────────────────────────────────────────

function startHub(port = 3847) {
  return new Promise((resolve, reject) => {
    if (server) {
      console.warn('[Hub] Already running');
      return resolve(getHubInfo());
    }

    try {
      const expressApp = express();
      expressApp.use(express.json({ limit: '10mb' }));

      // CORS — allow any origin on LAN
      expressApp.use((_req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        if (_req.method === 'OPTIONS') return res.sendStatus(204);
        next();
      });

      buildApi(expressApp);

      // Generate initial pairing code
      generatePairingCode();

      server = http.createServer(expressApp);
      wss = new WebSocketServer({ server });

      wss.on('connection', (ws, req) => {
        const tempId = crypto.randomUUID();
        terminals.set(ws, {
          id: tempId,
          connectedAt: Date.now(),
          name: 'Terminal',
          remoteAddress: req.socket.remoteAddress,
        });

        console.log(
          `[Hub] Terminal connected from ${req.socket.remoteAddress}. Total: ${terminals.size}`,
        );

        ws.send(
          JSON.stringify({
            type: 'welcome',
            terminalId: tempId,
            hubTime: Date.now(),
            connectedTerminals: terminals.size,
          }),
        );

        broadcast(ws, {
          type: 'terminal_joined',
          terminalId: tempId,
          totalTerminals: terminals.size,
          timestamp: Date.now(),
        });

        ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString());
            handleTerminalMessage(ws, msg);
          } catch (e) {
            console.error('[Hub] Bad message:', e.message);
          }
        });

        ws.on('close', () => {
          const info = terminals.get(ws);
          terminals.delete(ws);
          console.log(
            `[Hub] Terminal disconnected: ${info?.id}. Total: ${terminals.size}`,
          );

          broadcast(null, {
            type: 'terminal_left',
            terminalId: info?.id,
            totalTerminals: terminals.size,
            timestamp: Date.now(),
          });
        });

        ws.on('error', (err) => {
          console.error('[Hub] WebSocket error:', err.message);
        });
      });

      wss.on('error', (err) => {
        console.error('[Hub] WSS error:', err.message);
      });

      server.on('error', (err) => {
        console.error('[Hub] Server error:', err.message);
        reject(err);
      });

      server.listen(port, '0.0.0.0', () => {
        console.log(`[Hub] Running on 0.0.0.0:${port}`);
        resolve(getHubInfo());
      });
    } catch (e) {
      console.error('[Hub] Failed to start:', e.message);
      reject(e);
    }
  });
}

function stopHub() {
  return new Promise((resolve) => {
    if (!server) {
      console.warn('[Hub] Not running');
      return resolve();
    }

    console.log('[Hub] Shutting down...');

    for (const [ws] of terminals) {
      try {
        ws.send(JSON.stringify({ type: 'hub_shutdown', timestamp: Date.now() }));
        ws.close(1001, 'Hub shutting down');
      } catch {
        // ignore send errors during shutdown
      }
    }
    terminals.clear();

    if (wss) {
      wss.close(() => {
        console.log('[Hub] WebSocket server closed');
      });
      wss = null;
    }

    server.close(() => {
      console.log('[Hub] HTTP server closed');
      server = null;
      resolve();
    });

    setTimeout(() => {
      if (server) {
        server = null;
        wss = null;
        console.warn('[Hub] Forced shutdown');
        resolve();
      }
    }, 5000);
  });
}

function isHubRunning() {
  return server !== null && server.listening;
}

function getHubInfo() {
  if (!server) {
    return { port: null, terminalCount: 0, isRunning: false, pairingCode: null };
  }
  const addr = server.address();
  return {
    port: addr?.port || null,
    address: addr?.address || null,
    terminalCount: terminals.size,
    isRunning: true,
    pairingCode: getPairingCode(),
  };
}

function getConnectedTerminals() {
  return getAllPairedTerminals();
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  startHub,
  stopHub,
  isHubRunning,
  getHubInfo,
  getConnectedTerminals,
  getPairingCode,
  generatePairingCode,
  verifyStaffLogin,
  broadcastEntityEvent,
};
