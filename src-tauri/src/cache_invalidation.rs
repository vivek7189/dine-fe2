use crate::db::AppDb;
use rusqlite::params;

/// Given a mutation endpoint, return cache endpoint prefixes to invalidate.
/// This ensures that when data is modified, related cached GET responses are cleared
/// so subsequent reads fetch fresh data.
pub fn invalidate_related_cache(db: &AppDb, mutation_endpoint: &str) {
    let prefixes = get_related_prefixes(mutation_endpoint);
    let conn = db.conn();
    for prefix in prefixes {
        let _ = conn.execute(
            "DELETE FROM api_cache WHERE endpoint LIKE ?1",
            params![format!("{}%", prefix)],
        );
    }
}

fn get_related_prefixes(endpoint: &str) -> Vec<&str> {
    // Order-related mutations invalidate orders + analytics
    if endpoint.contains("/api/orders") {
        return vec!["/api/orders", "/api/analytics", "/api/daily-summary", "/api/sales"];
    }

    // Menu mutations
    if endpoint.contains("/api/menus/") || endpoint.contains("/api/menu") {
        return vec!["/api/menus/", "/api/menu"];
    }

    // Category mutations
    if endpoint.contains("/api/categories") {
        return vec!["/api/categories", "/api/menus/", "/api/menu"];
    }

    // Table/floor mutations
    if endpoint.contains("/api/tables") || endpoint.contains("/api/floors") {
        return vec!["/api/tables", "/api/floors"];
    }

    // Tax/settings mutations affect everything that uses tax
    if endpoint.contains("/api/tax") || endpoint.contains("/api/admin/tax") {
        return vec!["/api/tax", "/api/admin/tax", "/api/settings"];
    }

    // Restaurant settings
    if endpoint.contains("/api/settings") || endpoint.contains("/api/restaurant") {
        return vec!["/api/settings", "/api/restaurant"];
    }

    // Customer mutations
    if endpoint.contains("/api/customers") {
        return vec!["/api/customers"];
    }

    // Inventory mutations
    if endpoint.contains("/api/inventory") {
        return vec!["/api/inventory"];
    }

    // Staff/shift mutations
    if endpoint.contains("/api/staff") || endpoint.contains("/api/shifts") {
        return vec!["/api/staff", "/api/shifts"];
    }

    // Offer mutations
    if endpoint.contains("/api/offers") {
        return vec!["/api/offers"];
    }

    // KOT mutations
    if endpoint.contains("/api/kot") {
        return vec!["/api/kot", "/api/orders"];
    }

    // Register/cash mutations
    if endpoint.contains("/api/register") {
        return vec!["/api/register"];
    }

    // Invoice mutations
    if endpoint.contains("/api/invoices") || endpoint.contains("/api/invoice") {
        return vec!["/api/invoices", "/api/invoice"];
    }

    // Automation mutations
    if endpoint.contains("/api/automation") {
        return vec!["/api/automation"];
    }

    // Default: invalidate the exact endpoint
    vec![]
}
