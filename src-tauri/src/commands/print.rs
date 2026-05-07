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
    let _width = printer_width; // reserved for future use

    // Inject IE=edge meta tag for Windows WebBrowser fallback rendering.
    // Without this, the WebBrowser ActiveX control defaults to IE7 mode
    // and modern CSS (flexbox, grid) won't render on the receipt.
    let html = if !html.contains("X-UA-Compatible") {
        if html.contains("<head>") {
            html.replacen(
                "<head>",
                r#"<head><meta http-equiv="X-UA-Compatible" content="IE=edge">"#,
                1,
            )
        } else if html.contains("<HEAD>") {
            html.replacen(
                "<HEAD>",
                r#"<HEAD><meta http-equiv="X-UA-Compatible" content="IE=edge">"#,
                1,
            )
        } else {
            html
        }
    } else {
        html
    };

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
            std::thread::sleep(std::time::Duration::from_secs(10));
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
        Command::new("lp")
            .args(["-d", printer_name, file_path])
            .output()
            .map_err(|e| format!("Failed to print via lp: {}", e))?;
        Ok(())
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        use std::path::Path;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        // === WINDOWS SILENT PRINTING ===
        //
        // Why is this complex? Unlike Electron which has built-in webContents.print(),
        // Tauri has NO native silent print API (feature request #5330 was rejected).
        // We must build our own pipeline.
        //
        // Strategy priority:
        //   1. Edge headless → PDF → SumatraPDF (most reliable, zero window flash)
        //   2. PowerShell WebBrowser with STA + hidden Form (fallback)
        //   3. rundll32 PrintHTML (last resort)

        // --- Strategy 1: Edge → PDF → SumatraPDF ---
        // Edge is pre-installed on ALL Windows 10/11. SumatraPDF is a 6MB portable exe
        // bundled in our app's resources. Together they recreate Electron's silent print.
        let pdf_path = format!("{}.pdf", file_path);
        if convert_html_to_pdf_via_edge(file_path, &pdf_path).is_ok() {
            if print_pdf_via_sumatra(&pdf_path, printer_name).is_ok() {
                cleanup_after_delay(&pdf_path);
                return Ok(());
            }
            // SumatraPDF not available — try printing the PDF via PowerShell
            if print_pdf_via_powershell(&pdf_path, printer_name).is_ok() {
                cleanup_after_delay(&pdf_path);
                return Ok(());
            }
            let _ = fs::remove_file(&pdf_path);
        }

        // --- Strategy 2: PowerShell WebBrowser ---
        // Uses .NET WebBrowser control (IE/Trident engine) to render HTML and print.
        // Requires: -STA flag (COM threading), hidden Form (ActiveX host), CREATE_NO_WINDOW.
        if print_html_via_powershell(file_path, printer_name).is_ok() {
            return Ok(());
        }

        // --- Strategy 3: rundll32 PrintHTML ---
        let _ = Command::new("rundll32")
            .args(["mshtml.dll,PrintHTML", file_path])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn();
        Ok(())
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

// ============================================================================
// Windows-only helper functions
// ============================================================================

/// Convert HTML to PDF using Edge headless mode.
/// Edge (msedge.exe) is pre-installed on every Windows 10/11 machine.
#[cfg(target_os = "windows")]
fn convert_html_to_pdf_via_edge(html_path: &str, pdf_path: &str) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    use std::path::Path;
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    // Find Edge on the system
    let edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    ];

    let edge = edge_paths
        .iter()
        .find(|p| Path::new(p).exists())
        .ok_or("Microsoft Edge not found")?;

    let file_url = format!("file:///{}", html_path.replace('\\', "/"));

    let output = Command::new(edge)
        .args([
            "--headless",
            "--disable-gpu",
            "--no-pdf-header-footer",
            "--run-all-compositor-stages-before-draw",
            &format!("--print-to-pdf={}", pdf_path),
            &file_url,
        ])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| format!("Edge headless failed: {}", e))?;

    if Path::new(pdf_path).exists() {
        Ok(())
    } else {
        Err(format!(
            "Edge did not create PDF. Exit: {:?}. Stderr: {}",
            output.status.code(),
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

/// Print a PDF file silently using SumatraPDF (portable, bundled with app).
/// SumatraPDF is looked for at:
///   1. {exe_dir}/resources/SumatraPDF.exe (bundled in Tauri resources)
///   2. {exe_dir}/SumatraPDF.exe (next to the app)
///   3. C:\Program Files\SumatraPDF\SumatraPDF.exe (system-installed)
#[cfg(target_os = "windows")]
fn print_pdf_via_sumatra(pdf_path: &str, printer_name: &str) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    use std::path::{Path, PathBuf};
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    let exe_dir = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()));

    let mut search_paths: Vec<PathBuf> = Vec::new();
    if let Some(ref dir) = exe_dir {
        search_paths.push(dir.join("resources").join("SumatraPDF.exe"));
        search_paths.push(dir.join("SumatraPDF.exe"));
    }
    search_paths.push(PathBuf::from(
        r"C:\Program Files\SumatraPDF\SumatraPDF.exe",
    ));
    search_paths.push(PathBuf::from(
        r"C:\Program Files (x86)\SumatraPDF\SumatraPDF.exe",
    ));

    for sumatra in &search_paths {
        if sumatra.exists() {
            let output = Command::new(sumatra)
                .args([
                    "-silent",
                    "-print-to",
                    printer_name,
                    "-print-settings",
                    "fit", // fit to page — important for thermal receipt width
                    pdf_path,
                ])
                .creation_flags(CREATE_NO_WINDOW)
                .output()
                .map_err(|e| format!("SumatraPDF failed: {}", e))?;

            if output.status.success() {
                return Ok(());
            }
        }
    }

    Err("SumatraPDF not found".to_string())
}

/// Print a PDF silently via PowerShell using .NET System.Drawing.Printing.
/// This sets the target printer as default, uses Start-Process with -Verb Print,
/// then restores the previous default printer.
#[cfg(target_os = "windows")]
fn print_pdf_via_powershell(pdf_path: &str, printer_name: &str) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    let ps_cmd = format!(
        r#"
        $mtx = New-Object System.Threading.Mutex($false, 'Global\DineOpenPrint')
        $acquired = $mtx.WaitOne(15000)
        if (-not $acquired) {{ exit 1 }}
        try {{
            $prev = $null
            try {{ $prev = (Get-CimInstance Win32_Printer -Filter "Default=TRUE" -ErrorAction SilentlyContinue).Name }} catch {{}}
            try {{
                $p = Get-CimInstance Win32_Printer -Filter "Name='{name}'" -ErrorAction SilentlyContinue
                if ($p) {{ Invoke-CimMethod -InputObject $p -MethodName SetDefaultPrinter -ErrorAction SilentlyContinue | Out-Null }}
            }} catch {{}}
            Start-Process -FilePath '{path}' -Verb Print -WindowStyle Hidden
            Start-Sleep -Seconds 3
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
        name = printer_name.replace('\'', "''"),
        path = pdf_path.replace('\'', "''"),
    );

    let result = Command::new("powershell")
        .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", &ps_cmd])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    match result {
        Ok(output) if output.status.success() => Ok(()),
        Ok(output) => Err(format!(
            "PowerShell PDF print failed: {}",
            String::from_utf8_lossy(&output.stderr)
        )),
        Err(e) => Err(format!("PowerShell launch failed: {}", e)),
    }
}

/// Print HTML directly via PowerShell WebBrowser control.
/// This is the fallback when Edge or SumatraPDF are not available.
///
/// Requirements for reliability on Windows:
///   - `-STA` flag: WebBrowser is ActiveX/COM, needs Single-Threaded Apartment
///   - Hidden Form host: ActiveX controls need a Form container
///   - `CREATE_NO_WINDOW`: Prevents console window flash from PowerShell
///   - `$wb.Print()`: .NET WebBrowser.Print() prints silently (per MSDN)
///   - `DocumentCompleted` event: Event-driven, not DoEvents polling
///   - Safety timer: 15s timeout prevents hung PowerShell processes
///   - `file:///` URL: Required for Navigate() on local files
///   - Named mutex: Serializes concurrent prints to prevent default printer races
#[cfg(target_os = "windows")]
fn print_html_via_powershell(file_path: &str, printer_name: &str) -> Result<(), String> {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    let ps_cmd = format!(
        r#"
        Add-Type -AssemblyName System.Windows.Forms
        Add-Type -AssemblyName System.Drawing

        $mtx = New-Object System.Threading.Mutex($false, 'Global\DineOpenPrint')
        $acquired = $mtx.WaitOne(15000)
        if (-not $acquired) {{ exit 1 }}

        try {{
            $prev = $null
            try {{
                $prev = (Get-CimInstance Win32_Printer -Filter "Default=TRUE" -ErrorAction SilentlyContinue).Name
            }} catch {{}}

            try {{
                $p = Get-CimInstance Win32_Printer -Filter "Name='{name}'" -ErrorAction SilentlyContinue
                if ($p) {{ Invoke-CimMethod -InputObject $p -MethodName SetDefaultPrinter -ErrorAction SilentlyContinue | Out-Null }}
            }} catch {{}}

            # Hidden form to host WebBrowser (required for ActiveX/COM)
            $form = New-Object System.Windows.Forms.Form
            $form.ShowInTaskbar = $false
            $form.WindowState = [System.Windows.Forms.FormWindowState]::Minimized
            $form.Opacity = 0
            $form.FormBorderStyle = [System.Windows.Forms.FormBorderStyle]::None
            $form.StartPosition = [System.Windows.Forms.FormStartPosition]::Manual
            $form.Location = New-Object System.Drawing.Point(-32000, -32000)
            $form.Size = New-Object System.Drawing.Size(1, 1)

            $wb = New-Object System.Windows.Forms.WebBrowser
            $wb.ScriptErrorsSuppressed = $true
            $wb.ScrollBarsEnabled = $false
            $wb.Dock = [System.Windows.Forms.DockStyle]::Fill

            # Event-driven: print when document finishes loading
            $script:printDone = $false
            $wb.Add_DocumentCompleted({{
                if (-not $script:printDone) {{
                    $script:printDone = $true
                    Start-Sleep -Milliseconds 400
                    try {{ $wb.Print() }} catch {{}}
                    Start-Sleep -Milliseconds 1500
                    $form.Close()
                }}
            }})

            $form.Controls.Add($wb)
            $wb.Navigate('file:///{path}')

            # Safety: force close after 15 seconds if WebBrowser hangs
            $timer = New-Object System.Windows.Forms.Timer
            $timer.Interval = 15000
            $timer.Add_Tick({{ $form.Close() }})
            $timer.Start()

            $form.ShowDialog() | Out-Null

            $timer.Stop()
            $timer.Dispose()
            $wb.Dispose()
            $form.Dispose()

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
        name = printer_name.replace('\'', "''"),
        path = file_path.replace('\\', "/").replace('\'', "''"),
    );

    let result = Command::new("powershell")
        .args(["-NoProfile", "-STA", "-WindowStyle", "Hidden", "-Command", &ps_cmd])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    match result {
        Ok(output) if output.status.success() => Ok(()),
        Ok(output) => Err(format!(
            "PowerShell HTML print failed: {}",
            String::from_utf8_lossy(&output.stderr)
        )),
        Err(e) => Err(format!("PowerShell launch failed: {}", e)),
    }
}

/// Schedule temp file cleanup after a delay (background thread).
#[cfg(target_os = "windows")]
fn cleanup_after_delay(path: &str) {
    let path = path.to_string();
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_secs(10));
        let _ = fs::remove_file(&path);
    });
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
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        Command::new("cmd")
            .args(["/C", "start", "", file_path])
            .creation_flags(CREATE_NO_WINDOW)
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
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        // Primary: PowerShell Get-CimInstance (works on Win 10/11)
        let ps_cmd = r#"Get-CimInstance Win32_Printer | ForEach-Object { "$($_.Name)|$($_.PortName)|$($_.WorkOffline)" }"#;
        let ps_result = Command::new("powershell")
            .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", ps_cmd])
            .creation_flags(CREATE_NO_WINDOW)
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
                    let ptype = if port.starts_with("BTHHFP")
                        || port.starts_with("BTHLE")
                        || port.contains("Bluetooth")
                    {
                        "bluetooth"
                    } else if port.starts_with("USB") || port.starts_with("DOT4") {
                        "usb"
                    } else if port.contains('.')
                        || port.starts_with("WSD")
                        || port.starts_with("TCP")
                    {
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
                .creation_flags(CREATE_NO_WINDOW)
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

/// Diagnose the print pipeline — checks each component and reports what works.
/// Called from the frontend "Test Print Diagnostics" button.
/// Returns a human-readable report so we can debug remotely.
#[tauri::command]
pub async fn diagnose_print() -> Result<String, String> {
    let mut report = Vec::new();
    report.push("=== DineOpen Print Diagnostics ===".to_string());
    report.push(format!("OS: {}", std::env::consts::OS));
    report.push(format!("Arch: {}", std::env::consts::ARCH));

    // Check saved default printer
    match get_saved_default_printer() {
        Some(p) => report.push(format!("Default printer: {} ({})", p.name, p.printer_type)),
        None => report.push("Default printer: NOT SET (will open print dialog)".to_string()),
    }

    // Check config path
    let config_path = get_config_path();
    report.push(format!("Config path: {:?}", config_path));
    report.push(format!("Config exists: {}", config_path.exists()));

    // Check temp dir
    let temp_dir = std::env::temp_dir();
    report.push(format!("Temp dir: {:?}", temp_dir));

    // Check exe location (for resource bundling)
    if let Ok(exe) = std::env::current_exe() {
        report.push(format!("App exe: {:?}", exe));
        if let Some(dir) = exe.parent() {
            let sumatra = dir.join("resources").join("SumatraPDF.exe");
            report.push(format!("SumatraPDF bundled: {} ({:?})", sumatra.exists(), sumatra));
            let sumatra2 = dir.join("SumatraPDF.exe");
            if sumatra2.exists() {
                report.push(format!("SumatraPDF (next to exe): true"));
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        use std::path::Path;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        // Check Edge
        let edge_paths = [
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        ];
        let mut edge_found = false;
        for p in &edge_paths {
            if Path::new(p).exists() {
                report.push(format!("Edge found: {}", p));
                edge_found = true;
                break;
            }
        }
        if !edge_found {
            report.push("Edge: NOT FOUND".to_string());
        }

        // Check SumatraPDF system install
        let sumatra_sys = [
            r"C:\Program Files\SumatraPDF\SumatraPDF.exe",
            r"C:\Program Files (x86)\SumatraPDF\SumatraPDF.exe",
        ];
        for p in &sumatra_sys {
            if Path::new(p).exists() {
                report.push(format!("SumatraPDF (system): {}", p));
            }
        }

        // Test Edge HTML→PDF conversion
        if edge_found {
            let test_html = temp_dir.join("dineopen_diag_test.html");
            let test_pdf = temp_dir.join("dineopen_diag_test.pdf");
            let _ = fs::write(&test_html, "<html><body><h1>DineOpen Print Test</h1><p>If you see this, printing works!</p></body></html>");

            let edge = edge_paths.iter().find(|p| Path::new(p).exists()).unwrap();
            let url = format!("file:///{}", test_html.to_string_lossy().replace('\\', "/"));
            let result = Command::new(edge)
                .args([
                    "--headless",
                    "--disable-gpu",
                    "--no-pdf-header-footer",
                    "--run-all-compositor-stages-before-draw",
                    &format!("--print-to-pdf={}", test_pdf.to_string_lossy()),
                    &url,
                ])
                .creation_flags(CREATE_NO_WINDOW)
                .output();

            match result {
                Ok(output) => {
                    if test_pdf.exists() {
                        let size = fs::metadata(&test_pdf).map(|m| m.len()).unwrap_or(0);
                        report.push(format!("Edge HTML→PDF: SUCCESS ({} bytes)", size));
                        let _ = fs::remove_file(&test_pdf);
                    } else {
                        report.push(format!(
                            "Edge HTML→PDF: FAILED (no PDF created). Exit: {:?}. Stderr: {}",
                            output.status.code(),
                            String::from_utf8_lossy(&output.stderr)
                        ));
                    }
                }
                Err(e) => report.push(format!("Edge HTML→PDF: ERROR ({})", e)),
            }
            let _ = fs::remove_file(&test_html);
        }

        // List printers
        let ps_cmd = r#"Get-CimInstance Win32_Printer | ForEach-Object { "$($_.Name)|$($_.PortName)|$($_.Default)" }"#;
        let ps_result = Command::new("powershell")
            .args(["-NoProfile", "-WindowStyle", "Hidden", "-Command", ps_cmd])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        match ps_result {
            Ok(output) if output.status.success() => {
                let stdout = String::from_utf8_lossy(&output.stdout);
                let lines: Vec<&str> = stdout.lines().collect();
                report.push(format!("Printers found: {}", lines.len()));
                for line in &lines {
                    report.push(format!("  - {}", line));
                }
            }
            Ok(output) => {
                report.push(format!(
                    "Printer list FAILED: {}",
                    String::from_utf8_lossy(&output.stderr)
                ));
            }
            Err(e) => report.push(format!("PowerShell FAILED: {}", e)),
        }

        // Check PowerShell STA support
        let sta_test = Command::new("powershell")
            .args(["-NoProfile", "-STA", "-WindowStyle", "Hidden", "-Command", "Write-Output 'STA_OK'"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
        match sta_test {
            Ok(output) if String::from_utf8_lossy(&output.stdout).contains("STA_OK") => {
                report.push("PowerShell -STA: SUPPORTED".to_string());
            }
            _ => report.push("PowerShell -STA: NOT SUPPORTED (fallback will be used)".to_string()),
        }
    }

    #[cfg(target_os = "macos")]
    {
        report.push("macOS: uses `lp` command for printing".to_string());
        let output = Command::new("lpstat").args(["-p"]).output();
        match output {
            Ok(o) => {
                let stdout = String::from_utf8_lossy(&o.stdout);
                let count = stdout.lines().filter(|l| l.starts_with("printer ")).count();
                report.push(format!("Printers found: {}", count));
            }
            Err(e) => report.push(format!("lpstat failed: {}", e)),
        }
    }

    report.push("=== End Diagnostics ===".to_string());
    Ok(report.join("\n"))
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
