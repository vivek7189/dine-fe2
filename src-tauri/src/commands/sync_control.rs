use tauri::State;
use serde::Serialize;
use std::sync::Arc;
use crate::db::AppDb;
use crate::sync::SyncDaemon;

#[derive(Debug, Serialize)]
pub struct SyncStatus {
    pub pending_count: u32,
    pub failed_count: u32,
    pub permanently_failed_count: u32,
    pub syncing_count: u32,
    pub last_sync_at: Option<i64>,
    pub is_paused: bool,
    pub is_online: bool,
}

#[derive(Debug, Serialize)]
pub struct MutationEntry {
    pub id: String,
    pub endpoint: String,
    pub method: String,
    pub queued_at: i64,
    pub status: String,
    pub retry_count: i32,
    pub last_error: Option<String>,
    pub last_attempted_at: Option<i64>,
    pub priority: i32,
}

#[derive(Debug, Serialize)]
pub struct SyncLogEntry {
    pub id: i64,
    pub timestamp: i64,
    pub action: String,
    pub endpoint: Option<String>,
    pub mutation_id: Option<String>,
    pub status: Option<String>,
    pub details: Option<String>,
    pub duration_ms: Option<i64>,
}

#[derive(Debug, Serialize)]
pub struct CacheStats {
    pub entry_count: u32,
    pub total_size_bytes: u64,
    pub oldest_entry_at: Option<i64>,
    pub newest_entry_at: Option<i64>,
}

#[tauri::command]
pub async fn get_sync_status(
    db: State<'_, Arc<AppDb>>,
    sync: State<'_, Arc<SyncDaemon>>,
) -> Result<SyncStatus, String> {
    let (pending, failed, perm_failed, syncing, last_sync) = {
        let conn = db.conn();
        let pending: u32 = conn.query_row(
            "SELECT COUNT(*) FROM mutation_queue WHERE status = 'pending'", [], |r| r.get(0)
        ).unwrap_or(0);
        let failed: u32 = conn.query_row(
            "SELECT COUNT(*) FROM mutation_queue WHERE status = 'failed'", [], |r| r.get(0)
        ).unwrap_or(0);
        let perm_failed: u32 = conn.query_row(
            "SELECT COUNT(*) FROM mutation_queue WHERE status = 'permanently_failed'", [], |r| r.get(0)
        ).unwrap_or(0);
        let syncing: u32 = conn.query_row(
            "SELECT COUNT(*) FROM mutation_queue WHERE status = 'syncing'", [], |r| r.get(0)
        ).unwrap_or(0);
        let last_sync: Option<i64> = conn.query_row(
            "SELECT MAX(timestamp) FROM sync_log WHERE action = 'synced'", [], |r| r.get(0)
        ).unwrap_or(None);
        (pending, failed, perm_failed, syncing, last_sync)
    }; // conn dropped here before await

    let is_online = reqwest::Client::new()
        .head("https://dine-backend-lake.vercel.app/api/health")
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await
        .is_ok();

    Ok(SyncStatus {
        pending_count: pending,
        failed_count: failed,
        permanently_failed_count: perm_failed,
        syncing_count: syncing,
        last_sync_at: last_sync,
        is_paused: sync.is_paused(),
        is_online,
    })
}

#[tauri::command]
pub async fn get_pending_mutations(
    db: State<'_, Arc<AppDb>>,
) -> Result<Vec<MutationEntry>, String> {
    let conn = db.conn();
    let mut stmt = conn.prepare(
        "SELECT id, endpoint, method, queued_at, status, retry_count, last_error, last_attempted_at, priority
         FROM mutation_queue
         ORDER BY CASE status WHEN 'syncing' THEN 0 WHEN 'pending' THEN 1 WHEN 'failed' THEN 2 ELSE 3 END,
                  priority DESC, queued_at ASC"
    ).map_err(|e| e.to_string())?;

    let entries = stmt.query_map([], |row| {
        Ok(MutationEntry {
            id: row.get(0)?,
            endpoint: row.get(1)?,
            method: row.get(2)?,
            queued_at: row.get(3)?,
            status: row.get(4)?,
            retry_count: row.get(5)?,
            last_error: row.get(6)?,
            last_attempted_at: row.get(7)?,
            priority: row.get(8)?,
        })
    }).map_err(|e| e.to_string())?;

    let result: Vec<MutationEntry> = entries.filter_map(|e| e.ok()).collect();
    Ok(result)
}

#[tauri::command]
pub async fn get_sync_history(
    db: State<'_, Arc<AppDb>>,
    limit: Option<u32>,
) -> Result<Vec<SyncLogEntry>, String> {
    let limit = limit.unwrap_or(50);
    let conn = db.conn();
    let mut stmt = conn.prepare(
        "SELECT id, timestamp, action, endpoint, mutation_id, status, details, duration_ms
         FROM sync_log ORDER BY id DESC LIMIT ?1"
    ).map_err(|e| e.to_string())?;

    let entries = stmt.query_map(rusqlite::params![limit], |row| {
        Ok(SyncLogEntry {
            id: row.get(0)?,
            timestamp: row.get(1)?,
            action: row.get(2)?,
            endpoint: row.get(3)?,
            mutation_id: row.get(4)?,
            status: row.get(5)?,
            details: row.get(6)?,
            duration_ms: row.get(7)?,
        })
    }).map_err(|e| e.to_string())?;

    let result: Vec<SyncLogEntry> = entries.filter_map(|e| e.ok()).collect();
    Ok(result)
}

#[tauri::command]
pub async fn trigger_sync(
    sync: State<'_, Arc<SyncDaemon>>,
) -> Result<(), String> {
    sync.notify_new_mutation();
    Ok(())
}

#[tauri::command]
pub async fn pause_sync(
    sync: State<'_, Arc<SyncDaemon>>,
) -> Result<(), String> {
    sync.pause();
    Ok(())
}

#[tauri::command]
pub async fn resume_sync(
    sync: State<'_, Arc<SyncDaemon>>,
) -> Result<(), String> {
    sync.resume();
    Ok(())
}

#[tauri::command]
pub async fn retry_mutation(
    id: String,
    db: State<'_, Arc<AppDb>>,
    sync: State<'_, Arc<SyncDaemon>>,
) -> Result<(), String> {
    let conn = db.conn();
    conn.execute(
        "UPDATE mutation_queue SET status = 'pending', retry_count = 0, last_error = NULL WHERE id = ?1",
        rusqlite::params![id],
    ).map_err(|e| e.to_string())?;
    sync.notify_new_mutation();
    Ok(())
}

#[tauri::command]
pub async fn delete_mutation(
    id: String,
    db: State<'_, Arc<AppDb>>,
) -> Result<(), String> {
    let conn = db.conn();
    conn.execute("DELETE FROM mutation_queue WHERE id = ?1", rusqlite::params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn clear_cache(
    db: State<'_, Arc<AppDb>>,
) -> Result<(), String> {
    let conn = db.conn();
    conn.execute("DELETE FROM api_cache", []).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_cache_stats(
    db: State<'_, Arc<AppDb>>,
) -> Result<CacheStats, String> {
    let conn = db.conn();

    let entry_count: u32 = conn.query_row(
        "SELECT COUNT(*) FROM api_cache", [], |r| r.get(0)
    ).unwrap_or(0);

    let total_size: u64 = conn.query_row(
        "SELECT COALESCE(SUM(LENGTH(response_json)), 0) FROM api_cache", [], |r| r.get(0)
    ).unwrap_or(0);

    let oldest: Option<i64> = conn.query_row(
        "SELECT MIN(cached_at) FROM api_cache", [], |r| r.get(0)
    ).unwrap_or(None);

    let newest: Option<i64> = conn.query_row(
        "SELECT MAX(cached_at) FROM api_cache", [], |r| r.get(0)
    ).unwrap_or(None);

    Ok(CacheStats {
        entry_count,
        total_size_bytes: total_size,
        oldest_entry_at: oldest,
        newest_entry_at: newest,
    })
}
