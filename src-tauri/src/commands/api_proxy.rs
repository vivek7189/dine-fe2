use tauri::State;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use crate::db::AppDb;
use crate::sync::SyncDaemon;
use crate::cache_invalidation::invalidate_related_cache;

#[derive(Debug, Deserialize)]
pub struct ApiProxyRequest {
    pub endpoint: String,
    pub method: String,
    pub body: Option<String>,
    pub headers: Option<HashMap<String, String>>,
    pub cache_ttl: Option<i64>,
}

#[derive(Debug, Serialize, Clone)]
pub struct ApiProxyResponse {
    pub data: Option<serde_json::Value>,
    pub from_cache: bool,
    pub is_queued: bool,
    pub mutation_id: Option<String>,
    pub status_code: u16,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn api_request(
    request: ApiProxyRequest,
    db: State<'_, Arc<AppDb>>,
    sync: State<'_, Arc<SyncDaemon>>,
) -> Result<ApiProxyResponse, String> {
    let is_get = request.method.to_uppercase() == "GET";
    let base_url = std::env::var("NEXT_PUBLIC_API_URL")
        .unwrap_or_else(|_| "https://dine-backend-lake.vercel.app".to_string());
    let full_url = format!("{}{}", base_url, request.endpoint);

    // Store auth token for sync daemon to use later
    if let Some(headers) = &request.headers {
        if let Some(auth) = headers.get("Authorization").or_else(|| headers.get("authorization")) {
            let conn = db.conn();
            let now = chrono::Utc::now().timestamp();
            let _ = conn.execute(
                "INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES ('auth_token', ?1, ?2)",
                rusqlite::params![auth, now],
            );
        }
    }

    if is_get {
        handle_get_request(&request, &db, &full_url).await
    } else {
        handle_mutation_request(&request, &db, &sync, &full_url).await
    }
}

async fn handle_get_request(
    request: &ApiProxyRequest,
    db: &AppDb,
    full_url: &str,
) -> Result<ApiProxyResponse, String> {
    let client = reqwest::Client::new();
    let mut req_builder = client.get(full_url);

    if let Some(headers) = &request.headers {
        for (k, v) in headers {
            req_builder = req_builder.header(k.as_str(), v.as_str());
        }
    }

    match req_builder.timeout(std::time::Duration::from_secs(10)).send().await {
        Ok(resp) => {
            let status = resp.status().as_u16();
            let body_text = resp.text().await.unwrap_or_default();

            // Cache successful responses
            if status >= 200 && status < 400 {
                let ttl = request.cache_ttl.unwrap_or(300);
                let conn = db.conn();
                let _ = conn.execute(
                    "INSERT OR REPLACE INTO api_cache (endpoint, response_json, status_code, cached_at, ttl_seconds)
                     VALUES (?1, ?2, ?3, ?4, ?5)",
                    rusqlite::params![request.endpoint, body_text, status, chrono::Utc::now().timestamp(), ttl],
                );
            }

            let data: Option<serde_json::Value> = serde_json::from_str(&body_text).ok();
            Ok(ApiProxyResponse {
                data,
                from_cache: false,
                is_queued: false,
                mutation_id: None,
                status_code: status,
                error: if status >= 400 { Some(body_text) } else { None },
            })
        }
        Err(_) => {
            // Network failed — serve from SQLite cache
            let conn = db.conn();
            let result: Result<(String, u16), _> = conn.query_row(
                "SELECT response_json, status_code FROM api_cache WHERE endpoint = ?1",
                rusqlite::params![request.endpoint],
                |row| Ok((row.get(0)?, row.get(1)?)),
            );

            match result {
                Ok((cached_json, status)) => {
                    let data: Option<serde_json::Value> = serde_json::from_str(&cached_json).ok();
                    Ok(ApiProxyResponse {
                        data,
                        from_cache: true,
                        is_queued: false,
                        mutation_id: None,
                        status_code: status,
                        error: None,
                    })
                }
                Err(_) => {
                    Ok(ApiProxyResponse {
                        data: None,
                        from_cache: false,
                        is_queued: false,
                        mutation_id: None,
                        status_code: 503,
                        error: Some("Offline and no cached data available".into()),
                    })
                }
            }
        }
    }
}

async fn handle_mutation_request(
    request: &ApiProxyRequest,
    db: &AppDb,
    sync: &SyncDaemon,
    full_url: &str,
) -> Result<ApiProxyResponse, String> {
    let client = reqwest::Client::new();
    let method = match request.method.to_uppercase().as_str() {
        "POST" => reqwest::Method::POST,
        "PUT" => reqwest::Method::PUT,
        "PATCH" => reqwest::Method::PATCH,
        "DELETE" => reqwest::Method::DELETE,
        _ => reqwest::Method::POST,
    };

    let mut req_builder = client.request(method, full_url);
    if let Some(headers) = &request.headers {
        for (k, v) in headers {
            req_builder = req_builder.header(k.as_str(), v.as_str());
        }
    }
    if let Some(body) = &request.body {
        req_builder = req_builder
            .header("Content-Type", "application/json")
            .body(body.clone());
    }

    match req_builder.timeout(std::time::Duration::from_secs(15)).send().await {
        Ok(resp) => {
            let status = resp.status().as_u16();
            let body_text = resp.text().await.unwrap_or_default();
            let data: Option<serde_json::Value> = serde_json::from_str(&body_text).ok();

            // On successful mutation, invalidate related cache
            if status >= 200 && status < 400 {
                invalidate_related_cache(db, &request.endpoint);
            }

            Ok(ApiProxyResponse {
                data,
                from_cache: false,
                is_queued: false,
                mutation_id: None,
                status_code: status,
                error: if status >= 400 { Some(body_text) } else { None },
            })
        }
        Err(_) => {
            // Network failed — queue the mutation
            let mutation_id = uuid::Uuid::new_v4().to_string();

            // Determine priority: order-related = high priority
            let priority = if request.endpoint.contains("/api/orders")
                || request.endpoint.contains("/api/billing")
                || request.endpoint.contains("/api/kot")
            {
                10
            } else {
                0
            };

            let conn = db.conn();
            conn.execute(
                "INSERT INTO mutation_queue (id, endpoint, method, body_json, headers_json, queued_at, status, priority)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'pending', ?7)",
                rusqlite::params![
                    mutation_id,
                    request.endpoint,
                    request.method,
                    request.body,
                    request.headers.as_ref().map(|h| serde_json::to_string(h).unwrap_or_default()),
                    chrono::Utc::now().timestamp(),
                    priority,
                ],
            ).map_err(|e| format!("Failed to queue mutation: {}", e))?;

            // Log the queued mutation
            let _ = conn.execute(
                "INSERT INTO sync_log (timestamp, action, endpoint, mutation_id, status, details)
                 VALUES (?1, 'queued', ?2, ?3, 'pending', 'Mutation queued for offline sync')",
                rusqlite::params![chrono::Utc::now().timestamp(), request.endpoint, mutation_id],
            );

            // Notify sync daemon
            sync.notify_new_mutation();

            Ok(ApiProxyResponse {
                data: Some(serde_json::json!({
                    "success": true,
                    "offline": true,
                    "mutationId": mutation_id,
                    "message": "Queued for sync"
                })),
                from_cache: false,
                is_queued: true,
                mutation_id: Some(mutation_id),
                status_code: 202,
                error: None,
            })
        }
    }
}
