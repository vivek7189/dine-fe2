const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { initOfflineEngine, shutdownOfflineEngine } = require('./offline');

let mainWindow;

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
    },
  });

  // Load the static export
  const indexPath = path.join(__dirname, '..', 'out', 'index.html');
  if (fs.existsSync(indexPath)) {
    mainWindow.loadFile(indexPath);
  } else {
    // Dev mode: load from Next.js dev server (go straight to login)
    mainWindow.loadURL('http://localhost:3002/login');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  try {
    initOfflineEngine(app);
  } catch (err) {
    console.error('[Offline] Failed to initialize offline engine:', err.message);
  }
});

app.on('window-all-closed', () => {
  shutdownOfflineEngine();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ──── IPC: Printing ────

ipcMain.handle('electron:print', async (event, { html, copies }) => {
  const settings = loadSettings();
  const deviceName = settings.defaultPrinter || undefined;

  console.log('[Print] Request received — copies:', copies || 1, 'printer:', deviceName || '(system default)');
  console.log('[Print] HTML length:', html?.length || 0);

  const printWin = new BrowserWindow({
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });

  await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

  // Check if any printers are available
  const printers = await printWin.webContents.getPrintersAsync();
  console.log('[Print] Available printers:', printers.map(p => p.name).join(', ') || '(none)');

  // If no working printers, save as PDF to prove the pipeline works
  if (!printers.length || printers.every(p => p.status !== 0)) {
    console.log('[Print] No active printer found — saving PDF as proof');
    const pdfPath = path.join(app.getPath('desktop'), `DineOpen-print-test-${Date.now()}.pdf`);
    const pdfData = await printWin.webContents.printToPDF({
      printBackground: true,
      pageSize: { width: 80000, height: 297000 }, // ~80mm receipt width
    });
    fs.writeFileSync(pdfPath, pdfData);
    printWin.close();
    console.log('[Print] PDF saved to:', pdfPath);
    return { success: true, fallback: 'pdf', path: pdfPath };
  }

  return new Promise((resolve, reject) => {
    printWin.webContents.print(
      {
        silent: true,
        deviceName,
        copies: copies || 1,
        printBackground: true,
      },
      (success, failureReason) => {
        printWin.close();
        if (success) {
          console.log('[Print] ✓ Sent to printer successfully');
          resolve({ success: true });
        } else {
          console.error('[Print] ✗ Failed:', failureReason);
          reject(new Error(failureReason || 'Print failed'));
        }
      }
    );
  });
});

ipcMain.handle('electron:listPrinters', async () => {
  if (!mainWindow) return [];
  return mainWindow.webContents.getPrintersAsync();
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

// ──── IPC: Auto-update ────

let autoUpdater;
try {
  autoUpdater = require('electron-updater').autoUpdater;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error:', err.message);
  });
} catch (err) {
  console.warn('[AutoUpdater] electron-updater not available:', err.message);
}

ipcMain.handle('electron:checkForUpdates', async () => {
  if (!autoUpdater) return { available: false, error: 'updater not available' };
  try {
    const result = await autoUpdater.checkForUpdates();
    if (result && result.updateInfo && result.updateInfo.version !== app.getVersion()) {
      // Download the update
      await autoUpdater.downloadUpdate();
      return {
        available: true,
        version: result.updateInfo.version,
        installed: true,
      };
    }
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
