const { app, BrowserWindow, ipcMain, protocol, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net');
const { initOfflineEngine, shutdownOfflineEngine } = require('./offline');

let mainWindow;
let printWindow;
const OUT_DIR = path.join(__dirname, '..', 'out');

// ──── Printer cache (avoid OS enumeration on every print) ────
let cachedPrinters = null;
let printerCacheTime = 0;
const PRINTER_CACHE_TTL = 30000; // 30 seconds

async function getCachedPrinters(webContents) {
  const now = Date.now();
  if (cachedPrinters && (now - printerCacheTime) < PRINTER_CACHE_TTL) {
    return cachedPrinters;
  }
  cachedPrinters = await webContents.getPrintersAsync();
  printerCacheTime = now;
  return cachedPrinters;
}

// ──── Custom protocol to serve Next.js static export ────
// Next.js uses absolute paths like /_next/static/... which don't work with file://
// Register app:// protocol that serves files from the /out directory
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true },
}]);

// ──── Settings persistence (printer, etc.) ────
const settingsPath = path.join(app.getPath('userData'), 'dineopen-settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
  } catch { /* ignore */ }
  return {};
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  } catch { /* ignore */ }
}

// ──── Window creation ────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    title: 'DineOpen POS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false, // Allow app:// protocol to call external APIs (CORS)
    },
  });

  // Load the static export via custom protocol
  // Start at /dashboard — the frontend auth guard will redirect to /login if not authenticated.
  // This preserves the session for users who are already logged in (PIN/MPIN login).
  const indexPath = path.join(OUT_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    mainWindow.loadURL('app://pos/dashboard');
  } else {
    // Dev mode: load from Next.js dev server
    mainWindow.loadURL('http://localhost:3002/dashboard');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // ──── Right-click context menu with Refresh Page ────
  mainWindow.webContents.on('context-menu', (e, params) => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Refresh Page',
        click: () => mainWindow.webContents.reload(),
      },
      { type: 'separator' },
      { label: 'Copy', role: 'copy', enabled: params.editFlags.canCopy },
      { label: 'Paste', role: 'paste', enabled: params.editFlags.canPaste },
      { label: 'Cut', role: 'cut', enabled: params.editFlags.canCut },
      { label: 'Select All', role: 'selectAll' },
    ]);
    contextMenu.popup();
  });

  // ──── Fix: Windows keyboard focus lost after alert()/confirm() dialogs ────
  // Known Electron bug on Windows: after a native JS dialog (alert, confirm, prompt)
  // closes, the BrowserWindow loses keyboard focus and inputs stop accepting keystrokes.
  // Workaround: blur+focus the window whenever the renderer's dialog module fires.
  // See: https://github.com/electron/electron/issues/22923
  //      https://github.com/electron/electron/issues/31917
  if (process.platform === 'win32') {
    const { dialog } = require('electron');
    mainWindow.webContents.on('will-prevent-unload', () => {
      mainWindow.blur();
      setTimeout(() => mainWindow?.focus(), 50);
    });
    // Override renderer-initiated dialogs (alert, confirm, prompt) to refocus after
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.executeJavaScript(`
        (function() {
          const _alert = window.alert;
          const _confirm = window.confirm;
          const _prompt = window.prompt;
          window.alert = function() {
            const result = _alert.apply(this, arguments);
            // Trigger focus recovery via a minimal blur+focus on the active element
            setTimeout(function() {
              window.dispatchEvent(new Event('__electron_refocus'));
            }, 50);
            return result;
          };
          window.confirm = function() {
            const result = _confirm.apply(this, arguments);
            setTimeout(function() {
              window.dispatchEvent(new Event('__electron_refocus'));
            }, 50);
            return result;
          };
          window.prompt = function() {
            const result = _prompt.apply(this, arguments);
            setTimeout(function() {
              window.dispatchEvent(new Event('__electron_refocus'));
            }, 50);
            return result;
          };
          window.addEventListener('__electron_refocus', function() {
            if (window.electronAPI && window.electronAPI._refocusWindow) {
              window.electronAPI._refocusWindow();
            }
          });
        })();
      `).catch(() => {});
    });
  }
}

// ──── Persistent hidden print window (reused across all print jobs) ────
function createPrintWindow() {
  printWindow = new BrowserWindow({
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  printWindow.loadURL('data:text/html;charset=utf-8,<html><body></body></html>');
  printWindow.on('closed', () => {
    printWindow = null;
  });
}

app.whenReady().then(() => {
  // Register app:// protocol to serve Next.js static export from /out
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    let filePath = decodeURIComponent(url.pathname);

    // Try exact file first, then index.html for directory routes
    let fullPath = path.join(OUT_DIR, filePath);

    // If it's a route (no extension), look for directory/index.html
    if (!path.extname(fullPath)) {
      const indexHtml = path.join(fullPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        fullPath = indexHtml;
      } else {
        // Try .html extension
        const htmlFile = fullPath + '.html';
        if (fs.existsSync(htmlFile)) {
          fullPath = htmlFile;
        }
      }
    }

    // Fallback: serve the file if it exists, otherwise 404
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return new Response(fs.readFileSync(fullPath), {
        headers: { 'Content-Type': getMimeType(fullPath) },
      });
    }

    // For SPA-style navigation, fall back to login/index.html
    const loginIndex = path.join(OUT_DIR, 'login', 'index.html');
    if (fs.existsSync(loginIndex)) {
      return new Response(fs.readFileSync(loginIndex), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response('Not Found', { status: 404 });
  });

  createWindow();
  createPrintWindow();

  // Pre-warm printer cache once the print window is ready
  if (printWindow) {
    printWindow.webContents.once('did-finish-load', () => {
      getCachedPrinters(printWindow.webContents)
        .then(p => console.log('[Print] Printer cache warmed:', p.length, 'printers'))
        .catch(() => {});
    });
  }

  // Start printer heartbeat monitoring
  startPrinterHeartbeat();

  try {
    initOfflineEngine(app);
  } catch (err) {
    console.error('[Offline] Failed to initialize offline engine:', err.message);
    // Register fallback API proxy so the app works even without offline engine
    registerFallbackApiProxy();
  }
});

// Fallback: direct cloud proxy when offline engine can't initialize
function registerFallbackApiProxy() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dine-be2-phi.vercel.app';

  // Only register if not already registered by offline engine
  try {
    ipcMain.handle('electron:apiRequest', async (_event, request) => {
      const { method = 'GET', endpoint, body, headers = {} } = request;
      const url = `${API_URL}${endpoint}`;
      const opts = {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
      };
      // body is already JSON-stringified by the renderer's apiClient
      if (body && method !== 'GET') {
        opts.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
      try {
        const res = await fetch(url, opts);
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = { error: text || 'Non-JSON response' }; }
        if (!res.ok) {
          return { error: typeof data === 'string' ? data : JSON.stringify(data), status_code: res.status };
        }
        // Wrap in { data } to match offline engine response format expected by _electronRequest
        return { data };
      } catch (err) {
        return { error: err.message, success: false, status_code: 0 };
      }
    });
  } catch { /* already registered */ }

  // Register stub handlers for other IPC methods that offline engine provides
  const stubs = [
    'electron:getSyncStatus', 'electron:getSyncHistory', 'electron:triggerSync',
    'electron:pauseSync', 'electron:resumeSync', 'electron:forcePull',
    'electron:startHub', 'electron:stopHub', 'electron:getHubInfo',
    'electron:getConnectedTerminals', 'electron:discoverHub', 'electron:getDiscoveredHub',
    'electron:getTerminalId', 'electron:getTerminalConfig', 'electron:isPaired',
    'electron:isHub', 'electron:pairWithHub', 'electron:unpair',
    'electron:getPairingCode', 'electron:regeneratePairingCode', 'electron:getHubQrData',
    'electron:localStaffLogin', 'electron:getImageUrl', 'electron:clearLocalData',
  ];
  for (const channel of stubs) {
    try { ipcMain.handle(channel, async () => null); } catch { /* already registered */ }
  }
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
    '.ttf': 'font/ttf', '.eot': 'application/vnd.ms-fontobject',
    '.txt': 'text/plain', '.map': 'application/json', '.webp': 'image/webp',
  };
  return types[ext] || 'application/octet-stream';
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // On Windows/Linux, quit the app and shut down offline engine
    shutdownOfflineEngine();
    app.quit();
  }
  // On macOS, keep the app running in the dock (standard Mac behavior).
  // Don't shutdown offline engine so it's ready when the window is reopened.
});

app.on('activate', () => {
  // macOS: user clicked the dock icon — reopen the window
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  } else {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Clean up offline engine when the app is fully quitting (Cmd+Q on Mac, or close on Windows/Linux)
  shutdownOfflineEngine();
  stopPrinterHeartbeat();
});

// ──── TCP Printer Support (raw ESC/POS over network) ────

const TCP_CONNECT_TIMEOUT = 5000;  // 5 seconds (WiFi printers can be slow to ACK)
const TCP_DEFAULT_PORT = 9100;     // Standard raw print port
const TCP_MAX_RETRIES = 1;         // Single attempt — retries cause duplicate prints
const TCP_RETRY_DELAYS = [];       // No retries

/**
 * Check if a printer name is actually an IP address (optionally with :port).
 * Examples: "192.168.1.100", "10.0.0.50:9100"
 */
function isIpAddress(name) {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(name);
}

/**
 * Parse IP address string into { host, port }.
 * "192.168.1.100" → { host: "192.168.1.100", port: 9100 }
 * "192.168.1.100:9200" → { host: "192.168.1.100", port: 9200 }
 */
function parseIpPrinter(address) {
  const parts = address.split(':');
  return {
    host: parts[0],
    port: parts.length > 1 ? parseInt(parts[1], 10) : TCP_DEFAULT_PORT,
  };
}

/**
 * Convert HTML receipt to ESC/POS byte commands for thermal printers.
 * Ported from DinePrinterPlugin.java (Capacitor plugin) — same proven approach.
 * Handles bold, center alignment, double-size text, tables, entities.
 */
function htmlToEscPos(html) {
  const chunks = [];

  // ESC @ — Initialize printer
  chunks.push(Buffer.from([0x1B, 0x40]));

  let h = html;

  // Strip entire <head>, <style>, <script> blocks
  h = h.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '');
  h = h.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  h = h.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Block elements → newlines
  h = h.replace(/<br\s*\/?>/gi, '\n');
  h = h.replace(/<hr\s*\/?>/gi, '\n--------------------------------\n');
  h = h.replace(/<p[^>]*>/gi, '\n');
  h = h.replace(/<\/p>/gi, '\n');
  h = h.replace(/<div[^>]*>/gi, '\n');
  h = h.replace(/<\/div>/gi, '\n');

  // Tables → newlines and spacing
  h = h.replace(/<tr[^>]*>/gi, '\n');
  h = h.replace(/<\/tr>/gi, '');
  h = h.replace(/<td[^>]*>/gi, '  ');
  h = h.replace(/<\/td>/gi, '');
  h = h.replace(/<th[^>]*>/gi, '  ');
  h = h.replace(/<\/th>/gi, '');
  h = h.replace(/<table[^>]*>/gi, '\n');
  h = h.replace(/<\/table>/gi, '\n');

  // Formatting markers (using \x01 delimiter, same as Java version)
  h = h.replace(/<(b|strong)[^>]*>/gi, '\x01BOLD_ON\x01');
  h = h.replace(/<\/(b|strong)>/gi, '\x01BOLD_OFF\x01');

  h = h.replace(/<center[^>]*>/gi, '\x01CENTER_ON\x01');
  h = h.replace(/<\/center>/gi, '\x01CENTER_OFF\x01');
  h = h.replace(/<[^>]*text-align\s*:\s*center[^>]*>/gi, '\x01CENTER_ON\x01');

  h = h.replace(/<h[1-2][^>]*>/gi, '\x01LARGE_ON\x01\x01BOLD_ON\x01\x01CENTER_ON\x01');
  h = h.replace(/<\/h[1-2]>/gi, '\x01BOLD_OFF\x01\x01LARGE_OFF\x01\x01CENTER_OFF\x01\n');
  h = h.replace(/<h[3-6][^>]*>/gi, '\x01BOLD_ON\x01');
  h = h.replace(/<\/h[3-6]>/gi, '\x01BOLD_OFF\x01\n');

  // Strip remaining HTML tags
  h = h.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  h = h.replace(/&nbsp;/g, ' ');
  h = h.replace(/&amp;/g, '&');
  h = h.replace(/&lt;/g, '<');
  h = h.replace(/&gt;/g, '>');
  h = h.replace(/&quot;/g, '"');
  h = h.replace(/&#39;/g, "'");
  h = h.replace(/&#8377;|&rupee;|₹/g, 'Rs.');
  h = h.replace(/&#?\w+;/g, ''); // Remove remaining entities

  // Collapse excessive blank lines
  h = h.replace(/\n{3,}/g, '\n\n');
  h = h.trim();

  // Process text with formatting markers
  let bold = false;
  let center = false;
  let large = false;

  const parts = h.split('\x01');
  for (const part of parts) {
    switch (part) {
      case 'BOLD_ON':
        if (!bold) { chunks.push(Buffer.from([0x1B, 0x45, 0x01])); bold = true; }
        break;
      case 'BOLD_OFF':
        if (bold) { chunks.push(Buffer.from([0x1B, 0x45, 0x00])); bold = false; }
        break;
      case 'CENTER_ON':
        if (!center) { chunks.push(Buffer.from([0x1B, 0x61, 0x01])); center = true; }
        break;
      case 'CENTER_OFF':
        if (center) { chunks.push(Buffer.from([0x1B, 0x61, 0x00])); center = false; }
        break;
      case 'LARGE_ON':
        if (!large) { chunks.push(Buffer.from([0x1D, 0x21, 0x11])); large = true; }
        break;
      case 'LARGE_OFF':
        if (large) { chunks.push(Buffer.from([0x1D, 0x21, 0x00])); large = false; }
        break;
      default:
        if (part) chunks.push(Buffer.from(part, 'utf8'));
        break;
    }
  }

  // Reset formatting
  if (bold) chunks.push(Buffer.from([0x1B, 0x45, 0x00]));
  if (center) chunks.push(Buffer.from([0x1B, 0x61, 0x00]));
  if (large) chunks.push(Buffer.from([0x1D, 0x21, 0x00]));

  // Trailing newlines
  chunks.push(Buffer.from('\n\n\n', 'utf8'));

  return Buffer.concat(chunks);
}

/**
 * Send ESC/POS data to a thermal printer via raw TCP socket.
 * @param {string} host - Printer IP address
 * @param {number} port - Printer port (usually 9100)
 * @param {Buffer} data - ESC/POS data from htmlToEscPos()
 */
function printViaTcp(host, port, data) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (err) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      if (err) reject(err);
      else resolve();
    };

    socket.setTimeout(TCP_CONNECT_TIMEOUT);

    socket.on('timeout', () => finish(new Error(`TCP printer timeout connecting to ${host}:${port}`)));
    socket.on('error', (err) => finish(new Error(`TCP printer error (${host}:${port}): ${err.message}`)));

    socket.connect(port, host, () => {
      // Connected — send data
      socket.write(data, () => {
        // Send feed + cut
        const feedCut = Buffer.from([0x1B, 0x64, 0x04, 0x1D, 0x56, 0x00]);
        socket.write(feedCut, () => {
          // Give the printer a moment to process before closing
          setTimeout(() => finish(null), 200);
        });
      });
    });
  });
}

/**
 * Probe a single IP:port to check if a TCP service (likely a printer) is listening.
 * @returns {Promise<boolean>}
 */
function probeTcpPort(host, port, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.on('timeout', () => done(false));
    socket.on('error', () => done(false));
    socket.connect(port, host, () => done(true));
  });
}

// ──── IPC: Printing ────

ipcMain.handle('electron:print', async (event, { html, copies, type, printerWidth, stationId }) => {
  const settings = loadSettings();
  // Route to the correct printer based on job type and optional station
  let deviceName;
  if (type === 'kot' && stationId && settings.stationPrinters?.[stationId]) {
    // Multi-printer mode: per-station printer assignment
    deviceName = settings.stationPrinters[stationId];
  } else if (type === 'kot' && settings.kotPrinter) {
    deviceName = settings.kotPrinter;
  } else if (type === 'bill' && settings.billPrinter) {
    deviceName = settings.billPrinter;
  } else {
    deviceName = settings.defaultPrinter || undefined;
  }

  // Paper width in microns (58mm or 80mm, default 80mm)
  const widthMicrons = printerWidth === 58 ? 58000 : 80000;

  console.log('[Print] type:', type || 'unknown', 'copies:', copies || 1,
    'printer:', deviceName || '(system default)', 'paper:', (printerWidth || 80) + 'mm',
    'html:', html?.length || 0);

  // ──── TCP path: if printer is configured by IP address, send raw ESC/POS ────
  if (deviceName && isIpAddress(deviceName)) {
    const { host, port } = parseIpPrinter(deviceName);
    console.log('[Print] TCP mode → sending ESC/POS to', host + ':' + port);

    // Quick reachability check (500ms) — catches offline printers faster than
    // waiting for the full 3s connect timeout on every retry attempt.
    const reachable = await probeTcpPort(host, port, 500);
    if (!reachable) {
      console.warn('[Print] TCP printer not reachable at', host + ':' + port, '— will still attempt print with retries');
    }

    const escPosData = htmlToEscPos(html);
    const totalCopies = copies || 1;

    // Retry loop (matches dine-app: 3 attempts with 800ms/1500ms backoff)
    let lastErr = null;
    for (let attempt = 0; attempt < TCP_MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const backoffMs = TCP_RETRY_DELAYS[attempt - 1] || 1500;
        console.log(`[Print] TCP retry ${attempt}/${TCP_MAX_RETRIES - 1} in ${backoffMs}ms...`);
        await new Promise(r => setTimeout(r, backoffMs));
      }

      try {
        for (let i = 0; i < totalCopies; i++) {
          await printViaTcp(host, port, escPosData);
          if (i < totalCopies - 1) {
            await new Promise(r => setTimeout(r, 300));
          }
        }
        if (attempt > 0) {
          console.log('[Print] TCP print recovered on attempt', attempt + 1);
        }
        console.log('[Print] TCP print successful (' + totalCopies + ' copies)');
        return { success: true, method: 'tcp', printer: deviceName, attempts: attempt + 1 };
      } catch (err) {
        lastErr = err;
        console.warn(`[Print] TCP attempt ${attempt + 1}/${TCP_MAX_RETRIES} failed:`, err.message);
      }
    }

    console.error('[Print] TCP print failed after', TCP_MAX_RETRIES, 'attempts:', lastErr?.message);
    return { success: false, error: lastErr?.message || 'TCP print failed', method: 'tcp', printer: deviceName, attempts: TCP_MAX_RETRIES };
  }

  // ──── OS driver path: use webContents.print() (existing behavior, unchanged) ────

  // Ensure persistent print window exists
  if (!printWindow || printWindow.isDestroyed()) {
    createPrintWindow();
  }

  // Load HTML into the reusable print window
  await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  // Use cached printer list (avoids OS enumeration on every print)
  const printers = await getCachedPrinters(printWindow.webContents);
  console.log('[Print] Printers:', printers.map(p => `${p.name}(status:${p.status})`).join(', ') || '(none)');

  // If no printers at all, save as PDF fallback.
  // Skip status check when a specific printer is configured — network/IP printers
  // often report non-zero status even when online and ready.
  if (!printers.length) {
    console.log('[Print] No printers found — saving PDF');
    const pdfPath = path.join(app.getPath('desktop'), `DineOpen-print-${Date.now()}.pdf`);
    const pdfData = await printWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: { width: widthMicrons, height: 297000 },
    });
    fs.writeFileSync(pdfPath, pdfData);
    return { success: true, fallback: 'pdf', path: pdfPath };
  }

  // Fire-and-forget: send to printer and return immediately (don't wait for spool)
  printWindow.webContents.print(
    {
      silent: true,
      deviceName,
      copies: copies || 1,
      printBackground: true,
      // Thermal paper size in microns (58mm or 80mm width, long roll height)
      pageSize: { width: widthMicrons, height: 297000 },
      // Use 'none' so the printer driver doesn't add its own margins — CSS padding
      // (via printLeftMargin setting) has full control over content positioning.
      // This is the industry standard for thermal receipt printers and fixes left-side
      // cutoff issues on 58mm printers where 'printableArea' adds unpredictable offsets.
      margins: { marginType: 'none' },
    },
    (success, failureReason) => {
      if (success) {
        console.log('[Print] Sent to printer');
      } else {
        console.error('[Print] Failed:', failureReason);
      }
    }
  );

  return { success: true };
});

ipcMain.handle('electron:listPrinters', async () => {
  if (!mainWindow) return [];
  const printers = await mainWindow.webContents.getPrintersAsync();
  // Populate print cache so next print job is faster
  cachedPrinters = printers;
  printerCacheTime = Date.now();
  return printers;
});

ipcMain.handle('electron:setDefaultPrinter', async (event, { name }) => {
  const settings = loadSettings();
  settings.defaultPrinter = name;
  saveSettings(settings);
  startPrinterHeartbeat(); // Restart heartbeat for new printer
  return { success: true };
});

ipcMain.handle('electron:getDefaultPrinter', async () => {
  const settings = loadSettings();
  return settings.defaultPrinter || null;
});

ipcMain.handle('electron:setPrinterConfig', async (event, config) => {
  const settings = loadSettings();
  if (config.defaultPrinter !== undefined) settings.defaultPrinter = config.defaultPrinter;
  if (config.kotPrinter !== undefined) settings.kotPrinter = config.kotPrinter;
  if (config.billPrinter !== undefined) settings.billPrinter = config.billPrinter;
  if (config.stationPrinters !== undefined) {
    settings.stationPrinters = { ...(settings.stationPrinters || {}), ...config.stationPrinters };
  }
  // Cash drawer settings
  if (config.cashDrawerMode !== undefined) settings.cashDrawerMode = config.cashDrawerMode;
  if (config.cashDrawerPort !== undefined) settings.cashDrawerPort = config.cashDrawerPort;
  // Network printers (manually added IP addresses)
  if (config.networkPrinters !== undefined) settings.networkPrinters = config.networkPrinters;
  saveSettings(settings);
  // Restart heartbeat to pick up new printer config immediately
  startPrinterHeartbeat();
  return { success: true };
});

ipcMain.handle('electron:getPrinterConfig', async () => {
  const settings = loadSettings();
  return {
    defaultPrinter: settings.defaultPrinter || null,
    kotPrinter: settings.kotPrinter || null,
    billPrinter: settings.billPrinter || null,
    stationPrinters: settings.stationPrinters || {},
    cashDrawerMode: settings.cashDrawerMode || 'printer',
    cashDrawerPort: settings.cashDrawerPort || null,
    networkPrinters: settings.networkPrinters || [],
  };
});

// ──── IPC: Network Printer Discovery ────

ipcMain.handle('electron:scanNetworkPrinters', async () => {
  // Get local IP to determine subnet
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIp = null;

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
    if (localIp) break;
  }

  if (!localIp) {
    return { success: false, error: 'No network interface found', printers: [] };
  }

  const subnet = localIp.split('.').slice(0, 3).join('.');
  console.log('[PrintScan] Scanning subnet', subnet + '.x on port', TCP_DEFAULT_PORT);

  const found = [];
  // Scan common printer IP range first (.100-.254), then .1-.99
  const priorities = [];
  for (let i = 100; i <= 254; i++) priorities.push(i);
  for (let i = 1; i < 100; i++) priorities.push(i);

  // Scan in batches of 30 to avoid overwhelming the network
  const BATCH = 30;
  for (let b = 0; b < priorities.length; b += BATCH) {
    const batch = priorities.slice(b, b + BATCH);
    const results = await Promise.all(
      batch.map(async (i) => {
        const ip = `${subnet}.${i}`;
        if (ip === localIp) return null;
        const open = await probeTcpPort(ip, TCP_DEFAULT_PORT);
        return open ? ip : null;
      })
    );
    for (const ip of results) {
      if (ip) {
        found.push({ name: `Network Printer (${ip})`, address: `${ip}:${TCP_DEFAULT_PORT}`, type: 'network' });
        console.log('[PrintScan] Found printer at', ip + ':' + TCP_DEFAULT_PORT);
      }
    }
  }

  console.log('[PrintScan] Scan complete. Found', found.length, 'network printers');
  return { success: true, printers: found };
});

// ──── Printer Heartbeat (connection health monitoring) ────
// Periodically probes configured printers to detect offline/online status changes.
// TCP/IP printers: TCP connect probe on port 9100.
// OS driver printers: check OS printer list and status field.
// Sends 'printer-status' IPC event to renderer on status change.

const HEARTBEAT_INTERVAL_MS = 30000; // 30 seconds, matches dine-app
const HEARTBEAT_PROBE_TIMEOUT = 2000; // 2s timeout for TCP probe

let heartbeatTimer = null;
const printerHealthState = {}; // { [printerName]: { status: 'online'|'offline', lastCheck: timestamp, role: string } }

async function runHeartbeatCheck() {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const settings = loadSettings();
  const printersToCheck = [];

  // Collect all configured printers with their roles
  if (settings.defaultPrinter) printersToCheck.push({ name: settings.defaultPrinter, role: 'default' });
  if (settings.kotPrinter && settings.kotPrinter !== settings.defaultPrinter) {
    printersToCheck.push({ name: settings.kotPrinter, role: 'kot' });
  }
  if (settings.billPrinter && settings.billPrinter !== settings.defaultPrinter && settings.billPrinter !== settings.kotPrinter) {
    printersToCheck.push({ name: settings.billPrinter, role: 'bill' });
  }
  // Station printers
  if (settings.stationPrinters) {
    for (const [stationId, printerName] of Object.entries(settings.stationPrinters)) {
      if (printerName && !printersToCheck.some(p => p.name === printerName)) {
        printersToCheck.push({ name: printerName, role: `station:${stationId}` });
      }
    }
  }

  if (printersToCheck.length === 0) return;

  // Get OS printer list once for all OS-driver checks
  let osPrinters = null;

  for (const printer of printersToCheck) {
    let newStatus = 'offline';

    try {
      if (isIpAddress(printer.name)) {
        // TCP probe for IP-based printers
        const { host, port } = parseIpPrinter(printer.name);
        const reachable = await probeTcpPort(host, port, HEARTBEAT_PROBE_TIMEOUT);
        newStatus = reachable ? 'online' : 'offline';
      } else {
        // OS driver printer — check if it exists in printer list
        if (!osPrinters) {
          try {
            const wc = (printWindow && !printWindow.isDestroyed()) ? printWindow.webContents : mainWindow.webContents;
            osPrinters = await wc.getPrintersAsync();
          } catch {
            osPrinters = [];
          }
        }
        const found = osPrinters.find(p => p.name === printer.name || p.displayName === printer.name);
        // OS printer status: 0 = idle (ready), other values = error/offline
        // However, many drivers report non-zero even when online, so just check existence
        newStatus = found ? 'online' : 'offline';
      }
    } catch {
      newStatus = 'offline';
    }

    const prev = printerHealthState[printer.name];
    const changed = !prev || prev.status !== newStatus;

    printerHealthState[printer.name] = {
      status: newStatus,
      lastCheck: Date.now(),
      role: printer.role,
    };

    // Notify renderer only on status change
    if (changed && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('printer-status', {
        printer: printer.name,
        role: printer.role,
        status: newStatus,
        type: isIpAddress(printer.name) ? 'tcp' : 'os',
      });
    }
  }
}

function startPrinterHeartbeat() {
  stopPrinterHeartbeat();
  // Run first check after 5s delay (let app settle)
  setTimeout(() => {
    runHeartbeatCheck();
    heartbeatTimer = setInterval(runHeartbeatCheck, HEARTBEAT_INTERVAL_MS);
  }, 5000);
}

function stopPrinterHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

ipcMain.handle('electron:getPrinterHealth', async () => {
  return { ...printerHealthState };
});

// ──── IPC: Auto-update ────

let autoUpdater;
let updateDownloaded = false;
let downloadedZipPath = null;

try {
  autoUpdater = require('electron-updater').autoUpdater;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false; // We handle install manually

  autoUpdater.setFeedURL({
    provider: 'generic',
    url: 'https://storage.googleapis.com/dineopen-releases',
  });

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error:', err.message);
  });

  autoUpdater.on('update-downloaded', (info) => {
    updateDownloaded = true;
    // electron-updater provides the downloaded file path directly
    if (info.downloadedFile) {
      downloadedZipPath = info.downloadedFile;
    } else {
      // Fallback: find it in the updater cache
      const cacheDir = path.join(app.getPath('home'), 'Library', 'Caches', 'dine-frontend-updater', 'pending');
      const zipFile = info.files?.find(f => f.url.endsWith('.zip'));
      if (zipFile) {
        downloadedZipPath = path.join(cacheDir, path.basename(zipFile.url));
      }
    }
    console.log('[AutoUpdater] Update downloaded:', info.version, 'zip:', downloadedZipPath, 'exists:', downloadedZipPath ? fs.existsSync(downloadedZipPath) : false);
  });

  autoUpdater.on('download-progress', (progress) => {
    console.log(`[AutoUpdater] Download progress: ${Math.round(progress.percent)}%`);
  });
} catch (err) {
  console.warn('[AutoUpdater] electron-updater not available:', err.message);
}

ipcMain.handle('electron:checkForUpdates', async () => {
  if (!autoUpdater) return { available: false, error: 'updater not available' };
  try {
    console.log('[AutoUpdater] Current version:', app.getVersion());
    console.log('[AutoUpdater] Checking GCS for updates...');
    const result = await autoUpdater.checkForUpdates();
    console.log('[AutoUpdater] Check result:', JSON.stringify(result?.updateInfo || null));
    if (result && result.updateInfo) {
      const remoteVersion = result.updateInfo.version;
      const localVersion = app.getVersion();
      console.log(`[AutoUpdater] Remote: ${remoteVersion}, Local: ${localVersion}`);
      if (remoteVersion !== localVersion) {
        console.log('[AutoUpdater] Update available! Downloading...');
        await autoUpdater.downloadUpdate();
        console.log('[AutoUpdater] Download complete, updateDownloaded =', updateDownloaded);
        return {
          available: true,
          version: remoteVersion,
          installed: true,
        };
      }
    }
    console.log('[AutoUpdater] No update available');
    return { available: false };
  } catch (err) {
    console.error('[AutoUpdater] Check failed:', err);
    return { available: false, error: err.message };
  }
});

ipcMain.handle('electron:restartApp', async () => {
  console.log('[AutoUpdater] Restart requested, updateDownloaded =', updateDownloaded, 'zip:', downloadedZipPath);
  if (updateDownloaded && downloadedZipPath && fs.existsSync(downloadedZipPath)) {
    // Bypass Squirrel.Mac (which requires code signing) — manually extract zip and replace app
    const appPath = path.dirname(path.dirname(path.dirname(app.getAppPath()))); // .app bundle
    console.log('[AutoUpdater] Manual install: extracting', downloadedZipPath, 'to replace', appPath);
    try {
      const { execSync } = require('child_process');
      const tmpDir = path.join(app.getPath('temp'), 'dineopen-update');
      // Clean and extract
      execSync(`rm -rf "${tmpDir}" && mkdir -p "${tmpDir}"`);
      execSync(`ditto -xk "${downloadedZipPath}" "${tmpDir}"`);
      // Find the .app inside the extracted zip
      const extracted = fs.readdirSync(tmpDir).find(f => f.endsWith('.app'));
      if (!extracted) throw new Error('No .app found in update zip');
      const extractedApp = path.join(tmpDir, extracted);
      console.log('[AutoUpdater] Extracted:', extractedApp);
      // Replace the current app — use a shell script that waits for app to quit
      const script = `
        sleep 1
        rm -rf "${appPath}"
        mv "${extractedApp}" "${appPath}"
        rm -rf "${tmpDir}"
        open "${appPath}"
      `;
      const scriptPath = path.join(app.getPath('temp'), 'dineopen-update.sh');
      fs.writeFileSync(scriptPath, script, { mode: 0o755 });
      // Launch the updater script detached so it survives app quit
      const { spawn } = require('child_process');
      spawn('bash', [scriptPath], { detached: true, stdio: 'ignore' }).unref();
      console.log('[AutoUpdater] Update script launched, quitting app...');
      setTimeout(() => app.exit(0), 500);
      return { restarting: true };
    } catch (err) {
      console.error('[AutoUpdater] Manual install failed:', err);
      return { restarting: false, error: err.message };
    }
  } else {
    console.log('[AutoUpdater] No update downloaded, just relaunching...');
    setTimeout(() => {
      app.relaunch();
      app.exit(0);
    }, 500);
    return { restarting: true };
  }
});

ipcMain.handle('electron:getVersion', async () => {
  return app.getVersion();
});

// ──── IPC: Refocus window (Windows alert/confirm focus fix) ────
ipcMain.handle('electron:refocusWindow', async () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.blur();
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.focus();
      }
    }, 50);
  }
  return { success: true };
});

// ──── IPC: ECR Payment Terminal (NAPS Qatar) ────
// Direct HTTPS call to payment terminal on local network.
// Bypasses browser CORS/self-signed cert restrictions.

ipcMain.handle('electron:ecrRequest', async (_event, { url, method, body, timeoutMs }) => {
  const https = require('https');
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body || {});
    const req = https.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port || 8443,
        path: urlObj.pathname,
        method: method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        rejectUnauthorized: false, // NAPS terminals use self-signed certificates
        timeout: timeoutMs || 120000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve({ raw: data });
          }
        });
      }
    );
    req.on('error', (err) => reject(new Error(`ECR terminal error: ${err.message}`)));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('ECR terminal timeout — no response within the allowed time'));
    });
    req.write(postData);
    req.end();
  });
});

// ──── IPC: Weighing Scale (Serial Port) ────
// Communicates with USB/RS-232 weighing scales via serial port.
// Scales typically send continuous ASCII weight data like: "ST,GS,+  0.450 kg\r\n"

let scalePort = null;        // SerialPort instance
let scaleBuffer = '';         // Incoming data buffer
let lastScaleReading = null;  // { weight, unit, stable, timestamp }
let scaleError = null;        // Last error message

function parseScaleData(raw) {
  // Common scale data formats:
  // "ST,GS,+  0.450 kg\r\n"  (stable, gross, positive)
  // "US,GS,+  0.450 kg\r\n"  (unstable)
  // "S S     0.450 kg\r\n"   (stable, simple format)
  // "  0.450 kg\r\n"         (minimal format)
  // "OL"                     (overload)
  const lines = raw.split(/[\r\n]+/).filter(Boolean);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === 'OL') continue;

    // Detect stability: ST or first field "S" = stable
    const stable = /^(ST|S\s)/.test(trimmed) || !/^(US|U\s)/.test(trimmed);

    // Extract numeric weight and unit
    const match = trimmed.match(/([-+]?\s*[\d]+\.?\d*)\s*(kg|g|lb|oz)?/i);
    if (match) {
      const weight = parseFloat(match[1].replace(/\s/g, ''));
      const unit = (match[2] || 'kg').toLowerCase();
      if (!isNaN(weight)) {
        return { weight, unit, stable, timestamp: Date.now() };
      }
    }
  }
  return null;
}

ipcMain.handle('electron:scaleListPorts', async () => {
  try {
    const { SerialPort } = require('serialport');
    const ports = await SerialPort.list();
    return { success: true, ports };
  } catch (err) {
    return { success: false, error: err.message, ports: [] };
  }
});

ipcMain.handle('electron:scaleConnect', async (_event, { port: portPath, baudRate }) => {
  try {
    // Close existing connection if any
    if (scalePort && scalePort.isOpen) {
      scalePort.close();
    }
    scalePort = null;
    scaleBuffer = '';
    lastScaleReading = null;
    scaleError = null;

    const { SerialPort } = require('serialport');
    scalePort = new SerialPort({
      path: portPath,
      baudRate: baudRate || 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      autoOpen: false,
    });

    return new Promise((resolve) => {
      scalePort.open((err) => {
        if (err) {
          scaleError = err.message;
          scalePort = null;
          resolve({ success: false, error: err.message });
          return;
        }

        console.log('[Scale] Connected to', portPath, 'at', baudRate || 9600, 'baud');

        // Save settings
        const settings = loadSettings();
        settings.scalePort = portPath;
        settings.scaleBaudRate = baudRate || 9600;
        settings.scaleEnabled = true;
        saveSettings(settings);

        attachScaleListeners(scalePort);
        resolve({ success: true, port: portPath, baudRate: baudRate || 9600 });
      });
    });
  } catch (err) {
    scaleError = err.message;
    return { success: false, error: err.message };
  }
});

ipcMain.handle('electron:scaleDisconnect', async () => {
  try {
    if (scalePort && scalePort.isOpen) {
      scalePort.close();
    }
    scalePort = null;
    scaleBuffer = '';
    lastScaleReading = null;
    scaleError = null;
    console.log('[Scale] Disconnected');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('electron:scaleGetWeight', async () => {
  if (!scalePort || !scalePort.isOpen) {
    return { success: false, error: 'Scale not connected', reading: null };
  }
  return { success: true, reading: lastScaleReading };
});

ipcMain.handle('electron:scaleGetStatus', async () => {
  const settings = loadSettings();
  return {
    connected: !!(scalePort && scalePort.isOpen),
    port: settings.scalePort || null,
    baudRate: settings.scaleBaudRate || 9600,
    enabled: settings.scaleEnabled || false,
    error: scaleError,
    lastReading: lastScaleReading,
  };
});

// Auto-connect to scale on startup if previously configured
function autoConnectScale() {
  setTimeout(async () => {
    const settings = loadSettings();
    if (!settings.scaleEnabled || !settings.scalePort) return;
    console.log('[Scale] Auto-connecting to', settings.scalePort);
    try {
      const { SerialPort } = require('serialport');
      const ports = await SerialPort.list();
      if (!ports.some(p => p.path === settings.scalePort)) {
        console.log('[Scale] Port', settings.scalePort, 'not found — skipping auto-connect');
        return;
      }
      scalePort = new SerialPort({
        path: settings.scalePort,
        baudRate: settings.scaleBaudRate || 9600,
        dataBits: 8, parity: 'none', stopBits: 1,
      });
      attachScaleListeners(scalePort);
      console.log('[Scale] Auto-connected to', settings.scalePort);
    } catch (err) {
      console.error('[Scale] Auto-connect failed:', err.message);
      scaleError = err.message;
    }
  }, 3000);
}

function attachScaleListeners(port) {
  port.on('data', (data) => {
    scaleBuffer += data.toString('ascii');
    while (scaleBuffer.includes('\n') || scaleBuffer.includes('\r')) {
      const lineEnd = Math.max(scaleBuffer.indexOf('\n'), scaleBuffer.indexOf('\r'));
      const chunk = scaleBuffer.substring(0, lineEnd + 1);
      scaleBuffer = scaleBuffer.substring(lineEnd + 1);
      const reading = parseScaleData(chunk);
      if (reading) {
        lastScaleReading = reading;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('scale-weight', reading);
        }
      }
    }
    if (scaleBuffer.length > 1024) scaleBuffer = scaleBuffer.slice(-256);
  });
  port.on('error', (err) => {
    console.error('[Scale] Port error:', err.message);
    scaleError = err.message;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('scale-weight', { error: err.message, connected: false });
    }
  });
  port.on('close', () => {
    console.log('[Scale] Port closed');
    scalePort = null;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('scale-weight', { error: 'Port closed', connected: false });
    }
  });
}

app.whenReady().then(() => autoConnectScale());

// ──── IPC: Cash Drawer Kick ────
// Opens a cash drawer connected via:
//   1. Printer's DK port (RJ11) — sends ESC/POS command to bill printer
//   2. USB trigger — sends ESC/POS command via serial port

// Standard ESC/POS drawer kick: ESC p <pin> <on-time> <off-time>
// Pin 0 = pin 2 connector (most common), Pin 1 = pin 5 connector
const DRAWER_KICK_CMD = Buffer.from([0x1B, 0x70, 0x00, 0x19, 0x19]); // ESC p 0 25 25
// Some drawers need pin 1 instead — try both if pin 0 doesn't work
const DRAWER_KICK_CMD_PIN1 = Buffer.from([0x1B, 0x70, 0x01, 0x19, 0x19]); // ESC p 1 25 25

ipcMain.handle('electron:openCashDrawer', async () => {
  const settings = loadSettings();
  const mode = settings.cashDrawerMode || 'printer'; // 'printer' | 'usb'
  const platform = require('os').platform();
  const diagnostics = { mode, platform, timestamp: new Date().toISOString() };

  console.log('[CashDrawer] Opening — mode:', mode, 'platform:', platform);

  if (mode === 'usb') {
    // USB trigger mode: send kick command via serial port
    const portPath = settings.cashDrawerPort;
    diagnostics.port = portPath;
    if (!portPath) {
      console.error('[CashDrawer] USB mode but no port configured');
      return { success: false, error: 'No USB drawer port configured', diagnostics };
    }
    try {
      const { SerialPort } = require('serialport');
      return new Promise((resolve) => {
        const port = new SerialPort({ path: portPath, baudRate: 9600, autoOpen: false });
        port.open((err) => {
          if (err) {
            console.error('[CashDrawer] USB port open failed:', err.message);
            resolve({ success: false, error: `USB port open failed: ${err.message}`, diagnostics });
            return;
          }
          // Send both pin 0 and pin 1 commands to cover all drawer wiring
          const combined = Buffer.concat([DRAWER_KICK_CMD, DRAWER_KICK_CMD_PIN1]);
          port.write(combined, (writeErr) => {
            if (writeErr) {
              console.error('[CashDrawer] USB write failed:', writeErr.message);
              port.close(() => {});
              resolve({ success: false, error: `USB write failed: ${writeErr.message}`, diagnostics });
              return;
            }
            port.drain(() => {
              setTimeout(() => {
                port.close(() => {});
                console.log('[CashDrawer] USB kick sent to', portPath);
                resolve({ success: true, mode: 'usb', port: portPath, diagnostics });
              }, 200);
            });
          });
        });
      });
    } catch (err) {
      console.error('[CashDrawer] USB error:', err.message);
      return { success: false, error: err.message, diagnostics };
    }
  }

  // Printer mode (default): send ESC/POS kick command via the bill printer
  const printerName = settings.billPrinter || settings.defaultPrinter;
  diagnostics.printerName = printerName || '(none)';
  diagnostics.billPrinter = settings.billPrinter || '(not set)';
  diagnostics.defaultPrinter = settings.defaultPrinter || '(not set)';

  if (!printerName) {
    console.error('[CashDrawer] No bill printer configured in settings');
    return { success: false, error: 'No bill printer configured. Assign a bill printer in Native Printer Settings first.', diagnostics };
  }

  // Send both pin commands to cover all drawer wiring configurations
  const bothPins = Buffer.concat([DRAWER_KICK_CMD, DRAWER_KICK_CMD_PIN1]);

  try {
    const fs = require('fs');
    const { execSync } = require('child_process');

    if (platform === 'win32') {
      // Windows: send raw bytes directly to the printer device.
      // Method 1: Use the printer's Windows port name (e.g., USB001, COM3) via copy /b
      // Method 2: Use printer share name via copy /b to \\COMPUTERNAME\printer
      // Method 3: Fallback to print /D: via spooler
      const tmpFile = path.join(app.getPath('temp'), `drawer_kick_${Date.now()}.bin`);
      fs.writeFileSync(tmpFile, bothPins);
      diagnostics.tmpFile = tmpFile;

      let sent = false;
      const errors = [];

      // Try 1: Get the printer port from Windows and write directly to it
      // This is the most reliable method — bypasses the spooler entirely
      try {
        const portInfo = execSync(
          `wmic printer where "Name='${printerName.replace(/'/g, "\\'")}"' get PortName /value`,
          { windowsHide: true, timeout: 5000, shell: true, encoding: 'utf8' }
        ).trim();
        const portMatch = portInfo.match(/PortName=(.+)/i);
        if (portMatch) {
          const portName = portMatch[1].trim(); // e.g., USB001, COM3, LPT1
          diagnostics.printerPort = portName;
          console.log('[CashDrawer] Found printer port:', portName);
          execSync(`copy /b "${tmpFile}" "${portName}"`, {
            windowsHide: true, timeout: 5000, shell: true
          });
          sent = true;
          diagnostics.method = 'direct-port';
          console.log('[CashDrawer] Sent via direct port:', portName);
        }
      } catch (portErr) {
        errors.push(`direct-port: ${portErr.message}`);
      }

      // Try 2: Network share path
      if (!sent) {
        try {
          execSync(`copy /b "${tmpFile}" "\\\\%COMPUTERNAME%\\${printerName}"`, {
            windowsHide: true, timeout: 5000, shell: true
          });
          sent = true;
          diagnostics.method = 'network-share';
          console.log('[CashDrawer] Sent via network share');
        } catch (shareErr) {
          errors.push(`network-share: ${shareErr.message}`);
        }
      }

      // Try 3: Print spooler (least reliable for raw bytes)
      if (!sent) {
        try {
          execSync(`print /D:"${printerName}" "${tmpFile}"`, {
            windowsHide: true, timeout: 5000, shell: true
          });
          sent = true;
          diagnostics.method = 'print-spooler';
          console.log('[CashDrawer] Sent via print spooler');
        } catch (spoolErr) {
          errors.push(`print-spooler: ${spoolErr.message}`);
        }
      }

      try { fs.unlinkSync(tmpFile); } catch {}

      if (sent) {
        console.log('[CashDrawer] Kick sent to printer:', printerName, '(Windows, method:', diagnostics.method + ')');
        return { success: true, mode: 'printer', printer: printerName, diagnostics };
      } else {
        diagnostics.errors = errors;
        console.error('[CashDrawer] All Windows methods failed:', errors.join(' | '));
        return {
          success: false,
          error: `Could not send to printer "${printerName}". Tried ${errors.length} methods. Check that the printer is on and connected.`,
          diagnostics
        };
      }
    } else {
      // macOS/Linux: use lpr with raw filter to bypass driver processing
      const tmpFile = path.join(app.getPath('temp'), `drawer_kick_${Date.now()}.bin`);
      fs.writeFileSync(tmpFile, bothPins);
      diagnostics.tmpFile = tmpFile;
      try {
        execSync(`lpr -P "${printerName}" -o raw "${tmpFile}"`, {
          timeout: 5000, shell: true
        });
        diagnostics.method = 'lpr-raw';
      } catch (lprErr) {
        // Fallback: try printf pipe
        try {
          execSync(`printf '\\x1b\\x70\\x00\\x19\\x19\\x1b\\x70\\x01\\x19\\x19' | lpr -P "${printerName}" -o raw`, {
            timeout: 5000, shell: true
          });
          diagnostics.method = 'lpr-pipe';
        } catch (pipeErr) {
          try { fs.unlinkSync(tmpFile); } catch {}
          diagnostics.errors = [lprErr.message, pipeErr.message];
          console.error('[CashDrawer] macOS/Linux all methods failed');
          return { success: false, error: `lpr failed: ${lprErr.message}`, diagnostics };
        }
      }
      try { fs.unlinkSync(tmpFile); } catch {}
      console.log('[CashDrawer] Kick sent to printer:', printerName, '(macOS/Linux, method:', diagnostics.method + ')');
      return { success: true, mode: 'printer', printer: printerName, diagnostics };
    }
  } catch (err) {
    console.error('[CashDrawer] Unexpected error:', err.message);
    diagnostics.fatalError = err.message;
    return { success: false, error: err.message, diagnostics };
  }
});

// ──── IPC: Open external URL in system browser (for desktop auth flow) ────

ipcMain.handle('electron:openExternal', async (_event, url) => {
  const { shell } = require('electron');
  // Only allow https URLs for security
  if (url && url.startsWith('https://')) {
    await shell.openExternal(url);
    return { success: true };
  }
  return { success: false, error: 'Invalid URL' };
});
