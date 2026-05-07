// Thin wrapper around Tauri invoke for sync control commands.
// Returns null if not running in Tauri (safe for web).

function isTauriEnv() {
  return typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;
}

async function invoke(cmd, args) {
  if (!isTauriEnv()) return null;
  return window.__TAURI_INTERNALS__.invoke(cmd, args);
}

export async function getSyncStatus() {
  return invoke('get_sync_status');
}

export async function getPendingMutations() {
  return invoke('get_pending_mutations');
}

export async function getSyncHistory(limit = 50) {
  return invoke('get_sync_history', { limit });
}

export async function triggerSync() {
  return invoke('trigger_sync');
}

export async function pauseSync() {
  return invoke('pause_sync');
}

export async function resumeSync() {
  return invoke('resume_sync');
}

export async function retryMutation(id) {
  return invoke('retry_mutation', { id });
}

export async function deleteMutation(id) {
  return invoke('delete_mutation', { id });
}

export async function clearCache() {
  return invoke('clear_cache');
}

export async function getCacheStats() {
  return invoke('get_cache_stats');
}
