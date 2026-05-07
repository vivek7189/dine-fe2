mod commands;
mod db;
mod sync;
mod cache_invalidation;

use commands::print::print_document;
use commands::print::list_printers;
use commands::print::set_default_printer;
use commands::print::get_default_printer;
use commands::print::diagnose_print;
use commands::api_proxy::api_request;
use commands::sync_control::{
    get_sync_status, get_pending_mutations, get_sync_history,
    trigger_sync, pause_sync, resume_sync,
    retry_mutation, delete_mutation,
    clear_cache, get_cache_stats,
};
use db::AppDb;
use sync::SyncDaemon;
use std::sync::Arc;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            // Printing
            print_document,
            list_printers,
            set_default_printer,
            get_default_printer,
            diagnose_print,
            // API proxy (offline cache)
            api_request,
            // Sync controls
            get_sync_status,
            get_pending_mutations,
            get_sync_history,
            trigger_sync,
            pause_sync,
            resume_sync,
            retry_mutation,
            delete_mutation,
            clear_cache,
            get_cache_stats,
        ])
        .setup(|app| {
            // Initialize SQLite database for offline cache
            let mut db_path = dirs::config_dir()
                .unwrap_or_else(|| std::env::temp_dir());
            db_path.push("dineopen");
            std::fs::create_dir_all(&db_path).ok();
            db_path.push("offline.db");

            let db = Arc::new(
                AppDb::new(db_path).expect("Failed to initialize offline database")
            );

            // Start background sync daemon
            let sync_daemon = SyncDaemon::start(db.clone());

            // Register as Tauri managed state
            app.manage(db);
            app.manage(sync_daemon);

            // Enable devtools in all builds for debugging
            #[cfg(feature = "devtools")]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running DineOpen POS");
}
