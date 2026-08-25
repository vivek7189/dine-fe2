'use client';

/**
 * Local-server configuration — points this terminal at the on-premise "server"
 * machine (the one running dine-backend + local Postgres on the LAN) for complete
 * offline operation.
 *
 * When a local server URL is set:
 *   - api.js uses it as the API base and talks HTTP directly to it (bypassing the
 *     legacy Electron SQLite IPC path).
 *   - lanRealtime.js opens a socket.io connection to it for live events.
 *
 * When unset (default), everything behaves exactly as before (cloud API + RTDB).
 *
 * Stored in localStorage so it survives restarts and is shared across the app.
 */

const KEY = 'dineopen_local_server_url';

/** Normalize to a clean `http://host:port` origin (no trailing slash). */
function normalize(url) {
  if (!url) return null;
  let u = String(url).trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = `http://${u}`;
  return u.replace(/\/+$/, '');
}

/** The configured local server origin, or null when not in local-server mode. */
export function getLocalServerUrl() {
  if (typeof window === 'undefined') return null;
  try {
    // Allow a build-time default too (e.g. kiosk images), localStorage wins.
    return normalize(window.localStorage.getItem(KEY)) ||
      normalize(process.env.NEXT_PUBLIC_LOCAL_SERVER_URL) || null;
  } catch (_) {
    return null;
  }
}

/** Set (or clear, with null/'') the local server and persist it. */
export function setLocalServerUrl(url) {
  if (typeof window === 'undefined') return null;
  const norm = normalize(url);
  try {
    if (norm) window.localStorage.setItem(KEY, norm);
    else window.localStorage.removeItem(KEY);
  } catch (_) {}
  return norm;
}

export function isLocalServerMode() {
  return !!getLocalServerUrl();
}

/**
 * True ONLY in the offline/LAN "server" Electron app (build-unified.yml bakes
 * NEXT_PUBLIC_APP_KIND=server). The cloud Electron app + web leave it unset. All LAN / hub /
 * Online-LAN-toggle / offline-sync UI is gated on this so it never appears in the cloud build.
 */
export function isServerApp() {
  return process.env.NEXT_PUBLIC_APP_KIND === 'server';
}

/**
 * If the on-prem server answers on this machine's loopback (127.0.0.1:3003), then the
 * server is CO-LOCATED with this POS — prefer loopback. Loopback keeps working even with
 * Wi-Fi/LAN OFF (true offline), whereas a stored LAN-IP or `dineopen-server.local` name
 * disappears the instant the network interface goes down, which makes offline orders hang.
 *
 * Safe on separate terminals: a machine with no local server fails the probe, so its
 * configured LAN URL is left untouched. Returns the URL now in effect (or null).
 * Only acts inside the installed app (Electron/Capacitor) — plain web is never touched.
 */
const LOOPBACK_URL = 'http://127.0.0.1:3003';
// The cloud backend to probe = the SAME one getApiBase() uses online: the per-user pin
// (dineopen_backend_url — this account's real backend, e.g. GCP/Postgres) if set, else the baked
// Postgres/GCP default. NEVER Vercel for the local-server app. Read from localStorage/env directly
// so this module never imports apiBase (which imports us — would be circular).
const PG_DEFAULT_URL = (process.env.NEXT_PUBLIC_PG_API_URL || 'https://34-93-129-104.sslip.io').replace(/\/+$/, '');
function cloudTarget() {
  try {
    const pin = window.localStorage.getItem('dineopen_backend_url');
    if (pin) return pin.replace(/\/+$/, '');
  } catch (_) {}
  return PG_DEFAULT_URL;
}

async function probeHealth(url, ms) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    const res = await fetch(`${url}/api/health`, { signal: ctrl.signal, cache: 'no-store' });
    clearTimeout(timer);
    return res.ok;
  } catch (_) { return false; }
}

/**
 * Reconcile routing to REAL connectivity by probing the cloud (NOT navigator.onLine, which lies
 * inside Electron). Sets/clears the "offline pin" (localStorage) so getApiBase() routes correctly:
 *   • cloud reachable   → clear the pin  → ONLINE  → cloud (whole account, like the web)
 *   • cloud unreachable → pin loopback   → OFFLINE → the co-located local server (bound restaurant)
 * Returns the effective local URL (loopback when offline) or null (when online/cloud).
 */
export async function preferLoopbackIfLocal() {
  // NO pre-emptive cloud probing. Probing a slow cloud VM (3s timeout) intermittently timed out and
  // then falsely pinned the terminal to the single-restaurant local server (routing the whole app
  // to local → "1 restaurant"). Routing state (the loopback pin) is now managed explicitly:
  //   • cleared on owner login (online) — see activateLocalServer
  //   • set on the OS 'offline' event, cleared on the 'online' event — see OfflineFallback
  // Account-level reads always go to the cloud regardless (apiClient.accountScopeBase()).
  return getLocalServerUrl();
}
