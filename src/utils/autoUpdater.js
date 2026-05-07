// Auto-update utility for Tauri and Electron desktop apps.
// All functions are no-ops on web/Capacitor — safe to import anywhere.

import { isTauri, isElectron } from './platform';

const STORAGE_KEY = 'dineopen_auto_update_enabled';

/** Check if auto-update is enabled (default: true) */
export function isAutoUpdateEnabled() {
  if (typeof window === 'undefined') return false;
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/** Enable or disable auto-update */
export function setAutoUpdateEnabled(enabled) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // ignore storage errors
  }
}

/** Get the current app version */
export async function getAppVersion() {
  if (isTauri()) {
    try {
      const { getVersion } = await import('@tauri-apps/api/app');
      return await getVersion();
    } catch {
      return null;
    }
  }
  if (isElectron()) {
    try {
      return await window.electronAPI.getVersion();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Check for updates and optionally install them.
 *
 * @param {object} options
 * @param {boolean} [options.autoInstall=true] - Automatically download and install if update found
 * @param {function} [options.onUpdateFound] - Called with { version, body } when update is available
 * @param {function} [options.onDownloadProgress] - Called with { downloaded, total } during download
 * @param {function} [options.onUpToDate] - Called when already on latest version
 * @param {function} [options.onError] - Called with error if check fails
 * @returns {Promise<{available: boolean, version?: string}>}
 */
export async function checkForUpdates({
  autoInstall = true,
  onUpdateFound,
  onDownloadProgress,
  onUpToDate,
  onError,
} = {}) {
  if (!isTauri() && !isElectron()) return { available: false };

  // Electron: delegate to main process via IPC
  if (isElectron()) {
    try {
      console.log('[AutoUpdater] Checking for updates (Electron)...');
      const result = await window.electronAPI.checkForUpdates();
      if (result?.available) {
        onUpdateFound?.({ version: result.version, body: '' });
        return { available: true, version: result.version, installed: result.installed };
      }
      onUpToDate?.();
      return { available: false };
    } catch (err) {
      console.error('[AutoUpdater] Electron update check failed:', err);
      onError?.(err);
      return { available: false, error: err.message };
    }
  }

  // Tauri: use plugin-updater
  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    console.log('[AutoUpdater] Checking for updates...');

    const update = await check();

    if (!update) {
      console.log('[AutoUpdater] Already on latest version');
      onUpToDate?.();
      return { available: false };
    }

    console.log('[AutoUpdater] Update available:', update.version);
    onUpdateFound?.({ version: update.version, body: update.body });

    if (!autoInstall) {
      return { available: true, version: update.version };
    }

    // Download and install
    let downloaded = 0;
    let total = 0;

    await update.downloadAndInstall((event) => {
      switch (event.event) {
        case 'Started':
          total = event.data.contentLength || 0;
          console.log('[AutoUpdater] Download started, size:', total);
          break;
        case 'Progress':
          downloaded += event.data.chunkLength;
          onDownloadProgress?.({ downloaded, total });
          break;
        case 'Finished':
          console.log('[AutoUpdater] Download complete');
          break;
      }
    });

    console.log('[AutoUpdater] Update installed, restart required');
    return { available: true, version: update.version, installed: true };
  } catch (err) {
    console.error('[AutoUpdater] Update check failed:', err);
    onError?.(err);
    return { available: false, error: err.message };
  }
}

/** Restart the app to apply a downloaded update */
export async function restartApp() {
  if (isElectron()) {
    try {
      await window.electronAPI.restartApp();
    } catch (err) {
      console.error('[AutoUpdater] Electron relaunch failed:', err);
    }
    return;
  }
  if (!isTauri()) return;
  try {
    const { relaunch } = await import('@tauri-apps/plugin-process');
    await relaunch();
  } catch (err) {
    console.error('[AutoUpdater] Relaunch failed:', err);
  }
}
