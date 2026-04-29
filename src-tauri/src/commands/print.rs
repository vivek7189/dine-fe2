use serde::{Deserialize, Serialize};
use std::fs;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PrinterInfo {
    pub name: String,
    pub address: String,
    #[serde(rename = "type")]
    pub printer_type: String,
}

/// Print an HTML document.
/// If a default printer is set, prints directly (no dialog) — ideal for thermal printers.
/// Otherwise, opens in system print dialog.
#[tauri::command]
pub async fn print_document(
    html: String,
    print_type: String,
    printer_width: Option<u32>,
    copies: Option<u32>,
) -> Result<(), String> {
    let copy_count = copies.unwrap_or(1);

    // Write HTML to temp file
    let temp_dir = std::env::temp_dir();
    let file_name = format!("dineopen_{}_{}.html", print_type, timestamp());
    let file_path = temp_dir.join(&file_name);
    fs::write(&file_path, &html).map_err(|e| format!("Failed to write temp file: {}", e))?;

    let file_str = file_path.to_str().unwrap_or_default().to_string();

    // Check if a default printer is configured → print directly (no dialog)
    if let Some(printer) = get_saved_default_printer() {
        for _ in 0..copy_count {
            direct_print(&file_str, &printer.name)?;
        }
        // Clean up temp file after a delay
        let path_clone = file_path.clone();
        std::thread::spawn(move || {
            std::thread::sleep(std::time::Duration::from_secs(5));
            let _ = fs::remove_file(path_clone);
        });
        return Ok(());
    }

    // No default printer → open system print dialog
    open_in_browser(&file_str)?;

    Ok(())
}

/// Print directly to a named printer without showing a dialog.
fn direct_print(file_path: &str, printer_name: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        // macOS: use lp command to send to specific printer
        // For HTML, we convert to PDF first using cupsfilter, or use textutil
        // Simplest: use lp with raw text (works for thermal printers)
        Command::new("lp")
            .args(["-d", printer_name, file_path])
            .output()
            .map_err(|e| format!("Failed to print via lp: {}", e))?;
        Ok(())
    }

    #[cfg(target_os = "windows")]
    {
        // Windows: use PowerShell to set the target printer and print the HTML file.
        // Start-Process with -Verb Print tells Windows to use the default "print"
        // handler for .html files. We temporarily set the default printer so it
        // goes to the right device (important for thermal printers).
        let ps_cmd = format!(
            r#"
            $prev = (Get-WmiObject -Query "SELECT * FROM Win32_Printer WHERE Default=TRUE").Name
            $p = Get-WmiObject -Query "SELECT * FROM Win32_Printer WHERE Name='{name}'"
            if ($p) {{ $p.SetDefaultPrinter() | Out-Null }}
            Start-Process '{path}' -Verb Print -WindowStyle Hidden
            Start-Sleep -Seconds 3
            if ($prev) {{
                $old = Get-WmiObject -Query "SELECT * FROM Win32_Printer WHERE Name='$prev'"
                if ($old) {{ $old.SetDefaultPrinter() | Out-Null }}
            }}
            "#,
            name = printer_name.replace("'", "''"),
            path = file_path.replace("'", "''"),
        );

        let result = Command::new("powershell")
            .args(["-NoProfile", "-Command", &ps_cmd])
            .output();

        match result {
            Ok(output) if output.status.success() => Ok(()),
            _ => {
                // Fallback: open in default browser for manual print
                let _ = Command::new("cmd")
                    .args(["/C", "start", "", file_path])
                    .spawn();
                Ok(())
            }
        }
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        // Linux fallback
        Command::new("lp")
            .args(["-d", printer_name, file_path])
            .output()
            .map_err(|e| format!("Failed to print via lp: {}", e))?;
        Ok(())
    }
}

/// Open a file in the default browser (fallback for system print dialog).
fn open_in_browser(file_path: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        Command::new("open")
            .arg(file_path)
            .spawn()
            .map_err(|e| format!("Failed to open: {}", e))?;
    }

    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/C", "start", "", file_path])
            .spawn()
            .map_err(|e| format!("Failed to open: {}", e))?;
    }

    Ok(())
}

/// List available system printers.
#[tauri::command]
pub async fn list_printers() -> Result<Vec<PrinterInfo>, String> {
    let mut printers = Vec::new();

    #[cfg(target_os = "macos")]
    {
        let output = Command::new("lpstat")
            .args(["-p"])
            .output()
            .map_err(|e| format!("Failed to list printers: {}", e))?;

        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            if line.starts_with("printer ") {
                let name = line
                    .strip_prefix("printer ")
                    .unwrap_or("")
                    .split_whitespace()
                    .next()
                    .unwrap_or("Unknown")
                    .to_string();
                printers.push(PrinterInfo {
                    name: name.clone(),
                    address: name,
                    printer_type: "usb".to_string(),
                });
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Try wmic first (works on all Windows editions including Home)
        let wmic_result = Command::new("wmic")
            .args(["printer", "get", "Name"])
            .output();

        let mut found = false;
        if let Ok(output) = wmic_result {
            let stdout = String::from_utf8_lossy(&output.stdout);
            for line in stdout.lines().skip(1) {
                // skip header line "Name"
                let name = line.trim().to_string();
                if !name.is_empty() {
                    printers.push(PrinterInfo {
                        name: name.clone(),
                        address: name,
                        printer_type: "usb".to_string(),
                    });
                    found = true;
                }
            }
        }

        // Fallback to PowerShell Get-Printer (available on Pro/Enterprise)
        if !found {
            if let Ok(output) = Command::new("powershell")
                .args([
                    "-NoProfile",
                    "-Command",
                    "(Get-WmiObject -Query \"SELECT Name FROM Win32_Printer\").Name",
                ])
                .output()
            {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines() {
                    let name = line.trim().to_string();
                    if !name.is_empty() {
                        printers.push(PrinterInfo {
                            name: name.clone(),
                            address: name,
                            printer_type: "usb".to_string(),
                        });
                    }
                }
            }
        }
    }

    Ok(printers)
}

/// Set the default printer name (persisted in config file).
#[tauri::command]
pub async fn set_default_printer(printer_name: String) -> Result<(), String> {
    let config_path = get_config_path();
    if let Some(parent) = config_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    fs::write(&config_path, &printer_name)
        .map_err(|e| format!("Failed to save printer config: {}", e))?;
    Ok(())
}

/// Get the currently configured default printer.
#[tauri::command]
pub async fn get_default_printer() -> Result<Option<PrinterInfo>, String> {
    Ok(get_saved_default_printer())
}

fn get_saved_default_printer() -> Option<PrinterInfo> {
    let config_path = get_config_path();
    match fs::read_to_string(&config_path) {
        Ok(name) if !name.trim().is_empty() => Some(PrinterInfo {
            name: name.trim().to_string(),
            address: name.trim().to_string(),
            printer_type: "usb".to_string(),
        }),
        _ => None,
    }
}

fn get_config_path() -> std::path::PathBuf {
    let mut path = dirs::config_dir().unwrap_or_else(std::env::temp_dir);
    path.push("dineopen");
    path.push("printer.conf");
    path
}

fn timestamp() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
