/**
 * Electron Sync Control — renderer-side wrappers for offline engine IPC.
 * Used by OfflineDataTab.js dashboard to display sync status, manage queue, etc.
 */

function isElectronEnv() {
  return typeof window !== 'undefined' && window.electronAPI?.offlineSync !== undefined;
}

async function invoke(method, ...args) {
  if (!isElectronEnv()) return null;
  return window.electronAPI.offlineSync[method](...args);
}

export async function getSyncStatus() {
  return invoke('getSyncStatus');
}

export async function getPendingMutations() {
  return invoke('getPendingMutations');
}

export async function getSyncHistory(limit = 50) {
  return invoke('getSyncHistory', limit);
}

export async function triggerSync() {
  return invoke('triggerSync');
}

export async function pauseSync() {
  return invoke('pauseSync');
}

export async function resumeSync() {
  return invoke('resumeSync');
}

export async function retryMutation(id) {
  return invoke('retryMutation', id);
}

export async function deleteMutation(id) {
  return invoke('deleteMutation', id);
}

export async function clearCache() {
  return invoke('clearCache');
}

export async function getCacheStats() {
  return invoke('getCacheStats');
}
