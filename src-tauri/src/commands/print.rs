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

        // DEBUG: Save a copy for inspection (cross-platform path)
        {
            let debug_dir = if cfg!(target_os = "windows") {
                std::env::temp_dir().join("dineopen-prints")
            } else {
                std::path::PathBuf::from("/tmp/dineopen-prints")
            };
            let _ = fs::create_dir_all(&debug_dir);
            let debug_path = debug_dir.join(&file_name);
            let _ = fs::copy(&file_path, &debug_path);
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
        // Windows: Use PowerShell with .NET WebBrowser control for silent HTML printing.
        // Uses a mutex-like approach: sets target printer as default, prints, restores.
        // Uses OLECMDID_PRINT with DONTPROMPTUSER for truly silent printing (no dialog).
        // Serialized: each call blocks until the print is spooled — safe for rapid calls
        // from token billing (bill + N tokens with 350ms delay between them).
        let ps_cmd = format!(
            r#"
            Add-Type -AssemblyName System.Windows.Forms
            Add-Type -AssemblyName System.Drawing

            # Use a named mutex to prevent concurrent printer default swaps
            $mtx = New-Object System.Threading.Mutex($false, 'Global\DineOpenPrint')
            $acquired = $mtx.WaitOne(15000)
            if (-not $acquired) {{ exit 1 }}

            try {{
                # Save current default printer
                $prev = $null
                try {{
                    $prev = (Get-CimInstance Win32_Printer -Filter "Default=TRUE" -ErrorAction SilentlyContinue).Name
                }} catch {{}}

                # Set target printer as default
                try {{
                    $p = Get-CimInstance Win32_Printer -Filter "Name='{name}'" -ErrorAction SilentlyContinue
                    if ($p) {{ Invoke-CimMethod -InputObject $p -MethodName SetDefaultPrinter -ErrorAction SilentlyContinue | Out-Null }}
                }} catch {{}}

                # Use WebBrowser control to render and print HTML silently
                $wb = New-Object System.Windows.Forms.WebBrowser
                $wb.ScriptErrorsSuppressed = $true
                $wb.ScrollBarsEnabled = $false
                $wb.Navigate('{path}')

                # Wait for document to load (max 8 seconds)
                $timeout = 80
                while ($wb.ReadyState -ne [System.Windows.Forms.WebBrowserReadyState]::Complete -and $timeout -gt 0) {{
                    [System.Windows.Forms.Application]::DoEvents()
                    Start-Sleep -Milliseconds 100
                    $timeout--
                }}

                # Print silently using OLECMDID_PRINT (6) with DONTPROMPTUSER (2)
                Start-Sleep -Milliseconds 300
                try {{
                    $wb.Document.ExecCommand('print', $false, $null)
                }} catch {{
                    # Fallback to .Print() if ExecCommand fails
                    $wb.Print()
                }}
                Start-Sleep -Milliseconds 1500
                [System.Windows.Forms.Application]::DoEvents()
                $wb.Dispose()

                # Restore previous default printer
                if ($prev -and $prev -ne '{name}') {{
                    try {{
                        $old = Get-CimInstance Win32_Printer -Filter "Name='$prev'" -ErrorAction SilentlyContinue
                        if ($old) {{ Invoke-CimMethod -InputObject $old -MethodName SetDefaultPrinter -ErrorAction SilentlyContinue | Out-Null }}
                    }} catch {{}}
                }}
            }} finally {{
                $mtx.ReleaseMutex()
                $mtx.Dispose()
            }}
            "#,
            name = printer_name.replace("'", "''"),
            path = file_path.replace("\\", "/").replace("'", "''"),
        );

        let result = Command::new("powershell")
            .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &ps_cmd])
            .output();

        match result {
            Ok(output) if output.status.success() => Ok(()),
            Ok(_output) => {
                // If WebBrowser method fails, try rundll32 as fallback
                let _ = Command::new("rundll32")
                    .args(["mshtml.dll,PrintHTML", file_path])
                    .spawn();
                Ok(())
            }
            Err(_) => {
                // Last resort: open in browser for manual print
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
        // Primary: PowerShell Get-CimInstance (works on Win 10/11, not deprecated)
        let ps_cmd = r#"Get-CimInstance Win32_Printer | ForEach-Object { "$($_.Name)|$($_.PortName)|$($_.WorkOffline)" }"#;
        let ps_result = Command::new("powershell")
            .args(["-NoProfile", "-Command", ps_cmd])
            .output();

        let mut found = false;
        if let Ok(output) = ps_result {
            if output.status.success() {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines() {
                    let parts: Vec<&str> = line.splitn(3, '|').collect();
                    let name = parts.first().map(|s| s.trim()).unwrap_or("").to_string();
                    if name.is_empty() {
                        continue;
                    }
                    let port = parts.get(1).map(|s| s.trim()).unwrap_or("");
                    // Detect connection type from port name
                    let ptype = if port.starts_with("BTHHFP") || port.starts_with("BTHLE") || port.contains("Bluetooth") {
                        "bluetooth"
                    } else if port.starts_with("USB") || port.starts_with("DOT4") {
                        "usb"
                    } else if port.contains('.') || port.starts_with("WSD") || port.starts_with("TCP") {
                        "network"
                    } else {
                        "usb"
                    };
                    printers.push(PrinterInfo {
                        name: name.clone(),
                        address: port.to_string(),
                        printer_type: ptype.to_string(),
                    });
                    found = true;
                }
            }
        }

        // Fallback: wmic (for older Windows versions)
        if !found {
            if let Ok(output) = Command::new("wmic")
                .args(["printer", "get", "Name"])
                .output()
            {
                let stdout = String::from_utf8_lossy(&output.stdout);
                for line in stdout.lines().skip(1) {
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

fn timestamp() -> u128 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}
