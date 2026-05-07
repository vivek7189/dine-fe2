use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use tokio::sync::Notify;
use crate::db::AppDb;
use crate::cache_invalidation::invalidate_related_cache;

pub struct SyncDaemon {
    paused: Arc<AtomicBool>,
    notify: Arc<Notify>,
}

impl SyncDaemon {
    pub fn start(db: Arc<AppDb>) -> Arc<Self> {
        let paused = Arc::new(AtomicBool::new(false));
        let notify = Arc::new(Notify::new());

        let p = paused.clone();
        let n = notify.clone();

        tokio::spawn(async move {
            let mut consecutive_failures: u32 = 0;

            loop {
                // Wait for notification or 30-second timer
                tokio::select! {
                    _ = n.notified() => {},
                    _ = tokio::time::sleep(std::time::Duration::from_secs(30)) => {},
                }

                if p.load(Ordering::Relaxed) {
                    continue;
                }

                // Circuit breaker: if too many failures, wait longer
                if consecutive_failures >= 3 {
                    let cooldown = match consecutive_failures {
                        3..=4 => 120,  // 2 min
                        5..=6 => 300,  // 5 min
                        _ => 600,      // 10 min
                    };
                    log_sync_event(&db, "circuit_open", None, None, "paused",
                        &format!("Circuit breaker open, cooling down {}s after {} failures", cooldown, consecutive_failures));
                    tokio::time::sleep(std::time::Duration::from_secs(cooldown)).await;
                    consecutive_failures = 0; // Reset after cooldown
                }

                // Check connectivity with a lightweight HEAD request
                if !check_connectivity().await {
                    continue;
                }

                // Drain mutation queue
                match drain_queue(&db).await {
                    DrainResult::AllSynced => {
                        consecutive_failures = 0;
                    }
                    DrainResult::SomeFailed => {
                        consecutive_failures = 0; // Server errors don't trigger circuit breaker
                    }
                    DrainResult::NetworkError => {
                        consecutive_failures += 1;
                    }
                    DrainResult::Empty => {
                        consecutive_failures = 0;
                    }
                }
            }
        });

        Arc::new(Self { paused, notify })
    }

    pub fn notify_new_mutation(&self) {
        self.notify.notify_one();
    }

    pub fn pause(&self) {
        self.paused.store(true, Ordering::Relaxed);
    }

    pub fn resume(&self) {
        self.paused.store(false, Ordering::Relaxed);
        self.notify.notify_one();
    }

    pub fn is_paused(&self) -> bool {
        self.paused.load(Ordering::Relaxed)
    }
}

enum DrainResult {
    AllSynced,
    SomeFailed,
    NetworkError,
    Empty,
}

async fn check_connectivity() -> bool {
    let client = reqwest::Client::new();
    let base_url = std::env::var("NEXT_PUBLIC_API_URL")
        .unwrap_or_else(|_| "https://dine-backend-lake.vercel.app".to_string());

    client
        .head(&format!("{}/api/health", base_url))
        .timeout(std::time::Duration::from_secs(5))
        .send()
        .await
        .is_ok()
}

async fn drain_queue(db: &AppDb) -> DrainResult {
    let mut had_failures = false;

    loop {
        // Get next pending mutation
        let mutation = {
            let conn = db.conn();
            let result: Result<(String, String, String, Option<String>, Option<String>), _> = conn.query_row(
                "SELECT id, endpoint, method, body_json, headers_json
                 FROM mutation_queue
                 WHERE status = 'pending'
                 ORDER BY priority DESC, queued_at ASC
                 LIMIT 1",
                [],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?, row.get(4)?)),
            );
            match result {
                Ok(m) => m,
                Err(_) => return if had_failures { DrainResult::SomeFailed } else { DrainResult::Empty },
            }
        };

        let (id, endpoint, method, body_json, headers_json) = mutation;

        // Mark as syncing
        {
            let conn = db.conn();
            let _ = conn.execute(
                "UPDATE mutation_queue SET status = 'syncing', last_attempted_at = ?1 WHERE id = ?2",
                rusqlite::params![chrono::Utc::now().timestamp(), id],
            );
        }

        // Get auth token
        let auth_token = {
            let conn = db.conn();
            conn.query_row(
                "SELECT value FROM sync_metadata WHERE key = 'auth_token'",
                [],
                |row| row.get::<_, String>(0),
            ).ok()
        };

        // Build and send request
        let base_url = std::env::var("NEXT_PUBLIC_API_URL")
            .unwrap_or_else(|_| "https://dine-backend-lake.vercel.app".to_string());
        let full_url = format!("{}{}", base_url, endpoint);

        let client = reqwest::Client::new();
        let http_method = match method.to_uppercase().as_str() {
            "POST" => reqwest::Method::POST,
            "PUT" => reqwest::Method::PUT,
            "PATCH" => reqwest::Method::PATCH,
            "DELETE" => reqwest::Method::DELETE,
            _ => reqwest::Method::POST,
        };

        let mut req_builder = client.request(http_method, &full_url);

        // Add stored headers
        if let Some(h) = &headers_json {
            if let Ok(headers) = serde_json::from_str::<std::collections::HashMap<String, String>>(h) {
                for (k, v) in &headers {
                    // Skip auth header — use fresh one from sync_metadata
                    if k.to_lowercase() != "authorization" {
                        req_builder = req_builder.header(k.as_str(), v.as_str());
                    }
                }
            }
        }

        // Add auth token
        if let Some(token) = &auth_token {
            req_builder = req_builder.header("Authorization", token.as_str());
        }

        // Add body
        if let Some(body) = &body_json {
            req_builder = req_builder
                .header("Content-Type", "application/json")
                .body(body.clone());
        }

        let start = std::time::Instant::now();

        match req_builder.timeout(std::time::Duration::from_secs(15)).send().await {
            Ok(resp) => {
                let status = resp.status().as_u16();
                let duration = start.elapsed().as_millis() as i64;

                if status >= 200 && status < 400 {
                    // Success — delete from queue
                    let conn = db.conn();
                    let _ = conn.execute("DELETE FROM mutation_queue WHERE id = ?1", rusqlite::params![id]);

                    // Invalidate related cache
                    invalidate_related_cache(db, &endpoint);

                    log_sync_event_with_duration(db, "synced", Some(&endpoint), Some(&id), "success",
                        &format!("HTTP {}", status), duration);
                } else {
                    // Server error — mark failed, continue to next
                    had_failures = true;
                    let error_text = resp.text().await.unwrap_or_default();
                    let conn = db.conn();
                    let _ = conn.execute(
                        "UPDATE mutation_queue SET status = CASE WHEN retry_count >= max_retries - 1 THEN 'permanently_failed' ELSE 'failed' END,
                         retry_count = retry_count + 1, last_error = ?1 WHERE id = ?2",
                        rusqlite::params![format!("HTTP {}: {}", status, &error_text[..error_text.len().min(500)]), id],
                    );

                    log_sync_event_with_duration(db, "sync_failed", Some(&endpoint), Some(&id), "failed",
                        &format!("HTTP {}", status), duration);
                }
            }
            Err(e) => {
                // Network error — put back to pending, stop draining
                let conn = db.conn();
                let _ = conn.execute(
                    "UPDATE mutation_queue SET status = 'pending', last_error = ?1 WHERE id = ?2",
                    rusqlite::params![format!("Network: {}", e), id],
                );

                log_sync_event(db, "network_error", Some(&endpoint), Some(&id), "error",
                    &format!("Network error: {}", e));

                return DrainResult::NetworkError;
            }
        }

        // Throttle: 500ms between requests
        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
    }
}

fn log_sync_event(db: &AppDb, action: &str, endpoint: Option<&str>, mutation_id: Option<&str>, status: &str, details: &str) {
    log_sync_event_with_duration(db, action, endpoint, mutation_id, status, details, 0);
}

fn log_sync_event_with_duration(db: &AppDb, action: &str, endpoint: Option<&str>, mutation_id: Option<&str>, status: &str, details: &str, duration_ms: i64) {
    let conn = db.conn();
    let _ = conn.execute(
        "INSERT INTO sync_log (timestamp, action, endpoint, mutation_id, status, details, duration_ms)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![
            chrono::Utc::now().timestamp(),
            action, endpoint, mutation_id, status, details, duration_ms
        ],
    );

    // Keep only last 500 log entries
    let _ = conn.execute(
        "DELETE FROM sync_log WHERE id NOT IN (SELECT id FROM sync_log ORDER BY id DESC LIMIT 500)",
        [],
    );
}
