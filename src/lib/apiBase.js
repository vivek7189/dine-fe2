// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for "which backend does this browser talk to".
//
// Every file that needs the API base URL must call getApiBase() — never read
// process.env.NEXT_PUBLIC_API_URL or hardcode a URL. Change the resolution here,
// once, and it reflects on every page (and after any refresh), because getApiBase()
// reads at call time from localStorage.
//
// Resolution order (highest priority first):
//   1. Offline LAN server (this terminal is pointed at an on-prem box)
//   2. Local-server app (NEXT_PUBLIC_APP_KIND=server) → its baked GCP/PG default (never Vercel)
//   3. Persisted per-user/restaurant "home" backend / pgBackendUrl pin (survives refresh)
//   4. Remote-config default (cached from BACKEND_CONFIG_URL — the cutover switch; skipped in dev)
//   5. Default cloud backend (NEXT_PUBLIC_API_URL, baked at build time)
//
// Persistence = localStorage (source of truth, client-side, survives refresh) +
// a cookie mirror (so SSR/middleware could read it later if ever needed).
// ─────────────────────────────────────────────────────────────────────────────
import { getLocalServerUrl, isServerApp } from './localServer';

// The chosen-backend key. Kept identical to the one the ApiClient already persists
// so the two never disagree (dine-admin pgBackendUrl switch used this too).
export const BACKEND_URL_KEY = 'dineopen_backend_url';
const COOKIE_KEY = 'dineopen_backend';

// Default cloud backend (existing users / fallback). Built at deploy time.
export const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://dine-be2.vercel.app';

// New-user (Postgres/GCP) backend. Overridable per environment; falls back to the VM.
export const PG_API_BASE =
  process.env.NEXT_PUBLIC_PG_API_URL || 'https://34-93-129-104.sslip.io';

// ── Remote backend config (for a one-flip, zero-rebuild cutover) ──────────────
// A tiny always-up JSON (hosted OFF Vercel, e.g. Google Cloud Storage) that says
// which default backend all clients should use. Baked ONCE here; the file's
// contents are edited centrally at cutover. getApiBase() reads the CACHED value
// (refreshed async at startup) so it stays synchronous and can never block.
// Shape: { "defaultBackend": "https://…", "v": 1 }
const REMOTE_DEFAULT_KEY = 'dineopen_remote_default';
export const BACKEND_CONFIG_URL =
  process.env.NEXT_PUBLIC_BACKEND_CONFIG_URL ||
  'https://storage.googleapis.com/dineopen-public-config/backend.json';

const norm = (u) => (u ? String(u).replace(/\/+$/, '') : u); // strip trailing slash

// NOTE: isServerApp() (NEXT_PUBLIC_APP_KIND === 'server') lives in ./localServer and is
// imported above — the LOCAL-SERVER Electron build is baked to the native GCP/Postgres VM
// and must NEVER route to Vercel.

/**
 * The one function every file uses. Reads at call time, so it is always correct
 * on any page and immediately after a refresh.
 *
 * Applies to WEB and the CLOUD Electron app (existing→Vercel default, new→PG once
 * pinned at login). The LOCAL-SERVER Electron app is hard-pinned to LAN-or-GCP and
 * skips the per-user routing entirely.
 */
export function getApiBase() {
  if (typeof window === 'undefined') return norm(DEFAULT_API_BASE); // SSR
  const local = getLocalServerUrl();
  if (local) return norm(local);
  // Local-server app: never Vercel — always its baked native GCP/PG backend.
  if (isServerApp()) return norm(DEFAULT_API_BASE);
  try {
    // per-user / pgBackendUrl pin wins over the remote default
    const persisted = window.localStorage.getItem(BACKEND_URL_KEY);
    if (persisted) return norm(persisted);
    // remote-config default (cached from BACKEND_CONFIG_URL at startup) — the cutover switch.
    // Only in real builds: never let the remote override a local dev backend (localhost).
    const remote = window.localStorage.getItem(REMOTE_DEFAULT_KEY);
    if (remote && !/localhost|127\.0\.0\.1/.test(DEFAULT_API_BASE)) return norm(remote);
  } catch (_) { /* private mode / storage disabled */ }
  return norm(DEFAULT_API_BASE);
}

/**
 * Fetch the remote backend config once at startup and cache its `defaultBackend`.
 * Fire-and-forget: getApiBase() reads the cache, so this never blocks. On any
 * failure it leaves the last cache (or baked default) intact — cannot break routing.
 * Skipped for the local-server app (that one is hard-pinned to its baked GCP backend).
 * The new value takes effect on the next getApiBase() read (typically next page load).
 */
export async function refreshRemoteBackend() {
  // Skip on SSR, the local-server app (always baked PG), and local dev (localhost default) —
  // dev must never be pulled to a cloud backend by the remote config.
  if (typeof window === 'undefined' || isServerApp() || /localhost|127\.0\.0\.1/.test(DEFAULT_API_BASE)) return;
  try {
    const res = await fetch(BACKEND_CONFIG_URL, { cache: 'no-store' });
    if (!res.ok) return;
    const cfg = await res.json();
    const url = cfg && cfg.defaultBackend;
    if (typeof url === 'string' && /^https?:\/\//.test(url)) {
      window.localStorage.setItem(REMOTE_DEFAULT_KEY, norm(url));
    }
  } catch (_) { /* offline / 404 / bad JSON → keep last cache or baked default */ }
}

/**
 * Pin the backend the user was authenticated against (call once, at successful
 * login/signup). Persisted so every page + refresh routes here until logout.
 * Pass a full URL (DEFAULT_API_BASE or PG_API_BASE).
 */
export function setApiBase(url) {
  if (typeof window === 'undefined' || !url) return;
  const u = norm(url);
  try { window.localStorage.setItem(BACKEND_URL_KEY, u); } catch (_) {}
  try { document.cookie = `${COOKIE_KEY}=${encodeURIComponent(u)};path=/;max-age=31536000;SameSite=Lax`; } catch (_) {}
}

/** Clear the pin (call on logout) so the next login re-resolves from scratch. */
export function clearApiBase() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(BACKEND_URL_KEY); } catch (_) {}
  try { document.cookie = `${COOKIE_KEY}=;path=/;max-age=0`; } catch (_) {}
}

/** True when the browser is currently pinned to the Postgres/GCP backend. */
export function isOnPgBackend() {
  return norm(getApiBase()) === norm(PG_API_BASE);
}
