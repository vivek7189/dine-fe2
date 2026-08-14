// Shared app-update state (desktop only).
//
// One background check per app session, shared by every UI that shows update status
// (header pill, Home banner) — so we never kick off duplicate downloads. The Electron
// check auto-downloads in the background and resolves when the update is ready to
// install; Tauri behaves the same. Web/Capacitor: no-op.

import { getAppVersion, checkForUpdates, restartApp, isAutoUpdateEnabled } from '../utils/autoUpdater';
import { isElectron, isTauri } from '../utils/platform';

// status: 'idle' (no update) | 'checking' (checking/downloading in background) | 'ready' (downloaded, restart to apply) | 'error'
let state = { status: 'idle', currentVersion: null, newVersion: null, dismissed: false };
const listeners = new Set();
let started = false;

function emit() { listeners.forEach((l) => { try { l(state); } catch (_) {} }); }
function set(patch) { state = { ...state, ...patch }; emit(); }

export function getUpdateState() { return state; }
export function subscribeUpdate(fn) { listeners.add(fn); try { fn(state); } catch (_) {} return () => listeners.delete(fn); }
export function dismissUpdate() { set({ dismissed: true }); }
export async function restartForUpdate() { try { await restartApp(); } catch (_) {} }

/** Kick off the one-per-session background check. Safe to call repeatedly. */
export async function startUpdateCheck() {
  if (started || typeof window === 'undefined') return;
  if (!isElectron() && !isTauri()) return;   // desktop apps only
  if (!isAutoUpdateEnabled()) return;         // respect the user's toggle
  started = true;
  try { const v = await getAppVersion(); if (v) set({ currentVersion: v }); } catch (_) {}
  set({ status: 'checking' });
  try {
    const res = await checkForUpdates({ autoInstall: true });
    if (res?.available) set({ status: 'ready', newVersion: res.version || null });
    else set({ status: 'idle' });
  } catch (_) {
    set({ status: 'error' });
  }
}
