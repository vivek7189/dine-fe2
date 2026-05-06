mod commands;

use commands::print::print_document;
use commands::print::list_printers;
use commands::print::set_default_printer;
use commands::print::get_default_printer;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            print_document,
            list_printers,
            set_default_printer,
            get_default_printer,
        ])
        .setup(|app| {
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
