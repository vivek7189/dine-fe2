// Which bills / KOTs THIS device printed itself, by the id it printed them under (for a bill made
// offline that is the bill's idempotencyKey). Kept 24 h in localStorage so it survives the app
// restarting after a power cut. After sync the server repeats the print under the real order id,
// tagged offlineSync + the same idempotencyKey — useAutoPrint skips it only when that key is here,
// i.e. only when this very device really printed it. Never throws (printing must never break).
const KEY = 'dineopen_local_print_log';
const TTL_MS = 24 * 60 * 60 * 1000;
const MAX = 800;

function read() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    return JSON.parse(window.localStorage.getItem(KEY) || '{}') || {};
  } catch (_) { return {}; }
}

export function recordLocalPrint(id) {
  if (!id || typeof window === 'undefined') return;
  try {
    const now = Date.now();
    const log = read();
    log[String(id)] = now;
    const kept = Object.entries(log)
      .filter(([, ts]) => now - Number(ts) < TTL_MS)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(kept)));
  } catch (_) { /* never break printing */ }
}

export function wasPrintedLocally(id) {
  if (!id) return false;
  try {
    const ts = read()[String(id)];
    return !!ts && Date.now() - Number(ts) < TTL_MS;
  } catch (_) { return false; }
}
