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
