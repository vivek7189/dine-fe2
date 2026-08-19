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
export async function preferLoopbackIfLocal(probeMs = 1500) {
  if (typeof window === 'undefined') return getLocalServerUrl();
  const isInstalledApp = !!window.electronAPI || !!window.Capacitor;
  if (!isInstalledApp) return getLocalServerUrl();
  const LOOPBACK = 'http://127.0.0.1:3003';
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), probeMs);
    const res = await fetch(`${LOOPBACK}/api/health`, { signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) {
      // A co-located server is up — but only ADOPT it once it has data (provisioned).
      // Before first provisioning the local DB is empty, so routing to it would break
      // login/menu. Until then we stay on the cloud, so the app works online out of the
      // box; once seeded, we switch to loopback (offline-capable). If /provision/status
      // isn't available (not a local-server build), treat "up" as adopt (legacy behavior).
      try {
        const sc = new AbortController();
        const st = setTimeout(() => sc.abort(), probeMs);
        const pr = await fetch(`${LOOPBACK}/api/provision/status`, { signal: sc.signal });
        clearTimeout(st);
        if (pr.ok) {
          const j = await pr.json().catch(() => ({}));
          if (j && j.provisioned === false) {
            // Server present but not seeded yet → keep using the cloud for now.
            if (getLocalServerUrl() === LOOPBACK) setLocalServerUrl(null);
            return getLocalServerUrl();
          }
        }
      } catch (_) { /* status endpoint absent → fall through and adopt */ }
      if (getLocalServerUrl() !== LOOPBACK) setLocalServerUrl(LOOPBACK);
      return LOOPBACK;
    }
  } catch (_) { /* no local server on this machine — keep whatever is configured */ }
  return getLocalServerUrl();
}
