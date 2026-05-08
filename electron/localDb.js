const path = require('path');
const Database = require('better-sqlite3');

let db = null;

const SCHEMA_VERSION = 2;

// ---------------------------------------------------------------------------
// Migration definitions
// ---------------------------------------------------------------------------

const migrations = {
  1: (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS restaurant (
        id TEXT PRIMARY KEY,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        name TEXT,
        category TEXT,
        price REAL,
        data TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
      CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

      CREATE TABLE IF NOT EXISTS floors (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        name TEXT,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS tables_local (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        floor_id TEXT,
        name TEXT,
        status TEXT DEFAULT 'available',
        current_order_id TEXT,
        data TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_tables_local_restaurant_id ON tables_local(restaurant_id);
      CREATE INDEX IF NOT EXISTS idx_tables_local_status ON tables_local(status);

      CREATE TABLE IF NOT EXISTS tax_settings (
        restaurant_id TEXT PRIMARY KEY,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS billing_settings (
        restaurant_id TEXT PRIMARY KEY,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS pricing_settings (
        restaurant_id TEXT PRIMARY KEY,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        name TEXT,
        phone TEXT,
        data TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
      CREATE INDEX IF NOT EXISTS idx_customers_restaurant_id ON customers(restaurant_id);

      CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS offer_settings (
        restaurant_id TEXT PRIMARY KEY,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        name TEXT,
        current_stock REAL,
        data TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_inventory_items_restaurant_id ON inventory_items(restaurant_id);

      CREATE TABLE IF NOT EXISTS recipes (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        menu_item_id TEXT,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS saved_carts (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        type TEXT DEFAULT 'parked',
        name TEXT,
        data TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_saved_carts_restaurant_id ON saved_carts(restaurant_id);

      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        daily_order_id TEXT,
        status TEXT,
        table_id TEXT,
        total REAL,
        data TEXT,
        idempotency_key TEXT UNIQUE,
        is_local INTEGER DEFAULT 0,
        synced_at INTEGER,
        created_at INTEGER,
        updated_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_is_local ON orders(is_local);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

      CREATE TABLE IF NOT EXISTS local_sequences (
        restaurant_id TEXT,
        date TEXT,
        next_sequence INTEGER DEFAULT 1,
        PRIMARY KEY (restaurant_id, date)
      );

      CREATE TABLE IF NOT EXISTS staff (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        name TEXT,
        role TEXT,
        data TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_staff_restaurant_id ON staff(restaurant_id);

      CREATE TABLE IF NOT EXISTS waiters (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        name TEXT,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS print_settings (
        restaurant_id TEXT PRIMARY KEY,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS print_stations (
        restaurant_id TEXT PRIMARY KEY,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS business_settings (
        restaurant_id TEXT PRIMARY KEY,
        data TEXT,
        synced_at INTEGER
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        data TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_bookings_restaurant_id ON bookings(restaurant_id);

      CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        order_id TEXT,
        data TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_invoices_restaurant_id ON invoices(restaurant_id);

      CREATE TABLE IF NOT EXISTS kot_queue (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        order_id TEXT,
        status TEXT,
        data TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_kot_queue_restaurant_id ON kot_queue(restaurant_id);
      CREATE INDEX IF NOT EXISTS idx_kot_queue_status ON kot_queue(status);

      CREATE TABLE IF NOT EXISTS register (
        id TEXT PRIMARY KEY,
        restaurant_id TEXT,
        status TEXT,
        data TEXT,
        synced_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_register_restaurant_id ON register(restaurant_id);

      CREATE TABLE IF NOT EXISTS menu_theme (
        restaurant_id TEXT PRIMARY KEY,
        data TEXT,
        synced_at INTEGER
      );

      -- Generic entity store for unmapped entities
      CREATE TABLE IF NOT EXISTS entities (
        id TEXT,
        entity_type TEXT,
        restaurant_id TEXT,
        data TEXT,
        updated_at INTEGER,
        sync_status TEXT DEFAULT 'synced',
        PRIMARY KEY (id, entity_type)
      );
      CREATE INDEX IF NOT EXISTS idx_entities_type_restaurant ON entities(entity_type, restaurant_id);

      -- Change log for sync
      CREATE TABLE IF NOT EXISTS change_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT,
        entity_id TEXT,
        restaurant_id TEXT,
        operation TEXT,
        endpoint TEXT,
        method TEXT,
        payload TEXT,
        timestamp INTEGER,
        synced INTEGER DEFAULT 0,
        sync_error TEXT,
        retry_count INTEGER DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_change_log_synced ON change_log(synced);
      CREATE INDEX IF NOT EXISTS idx_change_log_entity ON change_log(entity_type, entity_id);

      -- Sync metadata
      CREATE TABLE IF NOT EXISTS sync_meta (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at INTEGER
      );

      -- Sync log for debugging
      CREATE TABLE IF NOT EXISTS sync_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER,
        action TEXT,
        endpoint TEXT,
        details TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp ON sync_log(timestamp DESC);

      -- Local image queue
      CREATE TABLE IF NOT EXISTS image_queue (
        id TEXT PRIMARY KEY,
        local_path TEXT,
        entity_type TEXT,
        entity_id TEXT,
        field_name TEXT,
        status TEXT DEFAULT 'pending',
        cloud_url TEXT,
        created_at INTEGER
      );
      CREATE INDEX IF NOT EXISTS idx_image_queue_status ON image_queue(status);
    `);
  },

  2: (db) => {
    db.exec(`
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
      CREATE INDEX IF NOT EXISTS idx_staff_cred_login ON staff_credentials(login_id);
      CREATE INDEX IF NOT EXISTS idx_staff_cred_restaurant ON staff_credentials(restaurant_id);
    `);
  },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ensureMetaTable(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS _meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

function getSchemaVersion(database) {
  const row = database.prepare("SELECT value FROM _meta WHERE key = 'schema_version'").get();
  return row ? parseInt(row.value, 10) : 0;
}

function setSchemaVersion(database, version) {
  database.prepare(
    "INSERT OR REPLACE INTO _meta (key, value) VALUES ('schema_version', ?)"
  ).run(String(version));
}

function runMigrations(database) {
  ensureMetaTable(database);
  const currentVersion = getSchemaVersion(database);

  for (let v = currentVersion + 1; v <= SCHEMA_VERSION; v++) {
    const migrate = migrations[v];
    if (!migrate) {
      throw new Error(`Missing migration for version ${v}`);
    }
    database.transaction(() => {
      migrate(database);
      setSchemaVersion(database, v);
    })();
    console.log(`[localDb] Migrated to schema version ${v}`);
  }
}

function cleanupOnStartup(database) {
  const now = Date.now();
  const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const twoMinutesAgo = now - 2 * 60 * 1000;

  // Remove old sync_log entries (older than 3 days)
  const syncLogResult = database
    .prepare('DELETE FROM sync_log WHERE timestamp < ?')
    .run(threeDaysAgo);
  if (syncLogResult.changes > 0) {
    console.log(`[localDb] Cleaned up ${syncLogResult.changes} old sync_log entries`);
  }

  // Remove old synced change_log entries (older than 7 days)
  const changeLogResult = database
    .prepare('DELETE FROM change_log WHERE synced = 1 AND timestamp < ?')
    .run(sevenDaysAgo);
  if (changeLogResult.changes > 0) {
    console.log(`[localDb] Cleaned up ${changeLogResult.changes} old change_log entries`);
  }

  // Recover stuck change_log items: unsynced with retry_count > 0 and not
  // attempted in the last 2 minutes. Reset retry_count so they get retried.
  const stuckResult = database
    .prepare(
      'UPDATE change_log SET retry_count = 0 WHERE synced = 0 AND retry_count > 0 AND timestamp < ?'
    )
    .run(twoMinutesAgo);
  if (stuckResult.changes > 0) {
    console.log(`[localDb] Recovered ${stuckResult.changes} stuck change_log entries`);
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function initLocalDb(userDataPath) {
  if (db) {
    return db;
  }

  const dbPath = path.join(userDataPath, 'dine-local.db');
  db = new Database(dbPath);

  // Pragma settings
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');

  runMigrations(db);
  cleanupOnStartup(db);

  console.log(`[localDb] Database initialized at ${dbPath}`);
  return db;
}

function closeLocalDb() {
  if (db) {
    db.close();
    db = null;
    console.log('[localDb] Database closed');
  }
}

function getLocalDb() {
  if (!db) {
    throw new Error('Local database not initialized. Call initLocalDb() first.');
  }
  return db;
}

module.exports = { initLocalDb, closeLocalDb, getLocalDb };
