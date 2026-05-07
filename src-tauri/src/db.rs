use rusqlite::{Connection, params};
use std::sync::Mutex;
use std::path::PathBuf;

pub struct AppDb {
    conn: Mutex<Connection>,
}

impl AppDb {
    pub fn new(db_path: PathBuf) -> Result<Self, String> {
        let conn = Connection::open(&db_path)
            .map_err(|e| format!("Failed to open SQLite: {}", e))?;

        // WAL mode for concurrent reads + better crash recovery
        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;")
            .map_err(|e| format!("PRAGMA failed: {}", e))?;

        Self::migrate(&conn)?;

        Ok(Self { conn: Mutex::new(conn) })
    }

    fn migrate(conn: &Connection) -> Result<(), String> {
        conn.execute_batch("
            CREATE TABLE IF NOT EXISTS api_cache (
                endpoint TEXT NOT NULL,
                response_json TEXT NOT NULL,
                status_code INTEGER NOT NULL DEFAULT 200,
                cached_at INTEGER NOT NULL,
                ttl_seconds INTEGER NOT NULL DEFAULT 300,
                PRIMARY KEY (endpoint)
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
                max_retries INTEGER NOT NULL DEFAULT 10,
                last_error TEXT,
                last_attempted_at INTEGER,
                priority INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS sync_metadata (
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
                details TEXT,
                duration_ms INTEGER
            );

            CREATE INDEX IF NOT EXISTS idx_mutation_status
                ON mutation_queue(status, queued_at);
            CREATE INDEX IF NOT EXISTS idx_sync_log_time
                ON sync_log(timestamp DESC);
        ").map_err(|e| format!("Migration failed: {}", e))?;

        Ok(())
    }

    pub fn conn(&self) -> std::sync::MutexGuard<'_, Connection> {
        self.conn.lock().expect("DB mutex poisoned")
    }
}
