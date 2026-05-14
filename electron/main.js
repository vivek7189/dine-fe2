const { app, BrowserWindow, ipcMain, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
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
});

// ──── IPC: Printing ────

ipcMain.handle('electron:print', async (event, { html, copies, type }) => {
  const settings = loadSettings();
  // Route to the correct printer based on job type
  let deviceName;
  if (type === 'kot' && settings.kotPrinter) {
    deviceName = settings.kotPrinter;
  } else if (type === 'bill' && settings.billPrinter) {
    deviceName = settings.billPrinter;
  } else {
    deviceName = settings.defaultPrinter || undefined;
  }

  console.log('[Print] type:', type || 'unknown', 'copies:', copies || 1,
    'printer:', deviceName || '(system default)', 'html:', html?.length || 0);

  // Ensure persistent print window exists
  if (!printWindow || printWindow.isDestroyed()) {
    createPrintWindow();
  }

  // Load HTML into the reusable print window
  await printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  // Use cached printer list (avoids OS enumeration on every print)
  const printers = await getCachedPrinters(printWindow.webContents);
  console.log('[Print] Printers:', printers.map(p => p.name).join(', ') || '(none)');

  // If no working printers, save as PDF fallback
  if (!printers.length || printers.every(p => p.status !== 0)) {
    console.log('[Print] No active printer — saving PDF');
    const pdfPath = path.join(app.getPath('desktop'), `DineOpen-print-${Date.now()}.pdf`);
    const pdfData = await printWindow.webContents.printToPDF({
      printBackground: true,
      pageSize: { width: 80000, height: 297000 },
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
      // Force 80mm thermal paper size (in microns: 80mm = 80000, height auto = long roll)
      pageSize: { width: 80000, height: 297000 },
      // Zero margins so content fills full paper width (margins handled in CSS)
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
  saveSettings(settings);
  return { success: true };
});

ipcMain.handle('electron:getPrinterConfig', async () => {
  const settings = loadSettings();
  return {
    defaultPrinter: settings.defaultPrinter || null,
    kotPrinter: settings.kotPrinter || null,
    billPrinter: settings.billPrinter || null,
  };
});

// ──── IPC: Auto-update ────

let autoUpdater;
try {
  autoUpdater = require('electron-updater').autoUpdater;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // GitHub token for accessing releases (read-only, works with private or public repo)
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'kevinjane71',
    repo: 'dine-frontend',
    token: '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',
  });

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error:', err.message);
  });
} catch (err) {
  console.warn('[AutoUpdater] electron-updater not available:', err.message);
}

ipcMain.handle('electron:checkForUpdates', async () => {
  if (!autoUpdater) return { available: false, error: 'updater not available' };
  try {
    console.log('[AutoUpdater] Current version:', app.getVersion());
    console.log('[AutoUpdater] Checking GitHub for updates...');
    const result = await autoUpdater.checkForUpdates();
    console.log('[AutoUpdater] Check result:', JSON.stringify(result?.updateInfo || null));
    if (result && result.updateInfo) {
      const remoteVersion = result.updateInfo.version;
      const localVersion = app.getVersion();
      console.log(`[AutoUpdater] Remote: ${remoteVersion}, Local: ${localVersion}`);
      if (remoteVersion !== localVersion) {
        console.log('[AutoUpdater] Update available! Downloading...');
        await autoUpdater.downloadUpdate();
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
  if (autoUpdater) {
    autoUpdater.quitAndInstall();
  } else {
    app.relaunch();
    app.exit(0);
  }
});

ipcMain.handle('electron:getVersion', async () => {
  return app.getVersion();
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
