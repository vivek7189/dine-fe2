// ─── Direct-to-backend learning (CLOUD app only) ────────────────────────────
//
// Migrated (flagged) accounts live on the GCP backend. Today the desktop cloud
// app talks to the Vercel URL, which transparently reverse-proxies flagged
// accounts to GCP. Vercel tags every such proxied response with a header:
//
//     X-Dine-Backend: https://34-93-129-104.sslip.io
//
// Once the main process sees that header, we adopt that backend DIRECTLY for the
// rest of the session, so subsequent requests skip the extra Vercel→GCP hop.
//
// Design (deliberately conservative):
//   • In-memory only, per session. Self-correcting on restart — if the account is
//     later un-migrated, the header stops appearing and a restart re-homes to Vercel.
//   • Inert for non-migrated accounts: the header never appears → we never switch,
//     behaviour is identical to today.
//   • Inert for local/server mode: learning only ever triggers from an https,
//     non-loopback base, so the embedded-Postgres/hub path (loopback) is untouched.
//   • Whitelisted target host (*.sslip.io = the GCP VM, plus an optional env allow
//     list) as defence-in-depth, even though the header only ever originates from
//     our own Vercel proxy.
//
// Tokens are portable across Vercel and GCP (shared JWT secret), so a session that
// logged in via the proxy keeps working when we switch to talking to GCP directly.

'use strict';

let learnedBackend = null;

function isLoopback(hostname) {
  return /^(127\.|0\.0\.0\.0$|localhost$|::1$|\[::1\]$)/i.test(hostname);
}

// Extra backend hosts may be allow-listed via env (comma-separated), for future
// GCP hosts without shipping a new app build. e.g. DINE_DIRECT_BACKEND_HOSTS.
function envAllowedHosts() {
  return String(process.env.DINE_DIRECT_BACKEND_HOSTS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// Only adopt a backend we trust: an https host in the known GCP family (*.sslip.io)
// or an env-allow-listed host, and only when the CURRENT base is a real (https,
// non-loopback) cloud URL — never in local/server mode.
function isAllowedBackend(currentBase, headerVal) {
  try {
    if (!/^https:\/\//i.test(currentBase)) return false;
    const cur = new URL(currentBase);
    if (isLoopback(cur.hostname)) return false;
    const u = new URL(headerVal);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    const ok = /(^|\.)sslip\.io$/.test(host) || envAllowedHosts().includes(host);
    if (!ok) return false;
    if (u.host === cur.host) return false; // already there / avoid self-loop
    return true;
  } catch {
    return false;
  }
}

// The base URL to use right now. Returns the learned direct backend once we have
// one (only when the caller's default is itself a real cloud URL), else the
// caller's default. Loopback/no-arg callers are unaffected.
function resolveBase(defaultBase) {
  try {
    if (learnedBackend && /^https:\/\//i.test(defaultBase)) {
      const d = new URL(defaultBase);
      if (!isLoopback(d.hostname)) return learnedBackend;
    }
  } catch {
    /* fall through */
  }
  return defaultBase;
}

// Inspect a fetch Response's headers; adopt the advertised backend once (idempotent).
// `headers` is a WHATWG Headers object (Node fetch / Electron net) with .get().
function observeResponse(currentBase, headers) {
  if (learnedBackend) return;
  try {
    const adv =
      headers && typeof headers.get === 'function'
        ? headers.get('x-dine-backend')
        : null;
    if (adv && isAllowedBackend(currentBase, adv)) {
      learnedBackend = adv.replace(/\/+$/, '');
      console.log('[directBackend] Adopted direct backend from X-Dine-Backend:', learnedBackend);
    }
  } catch {
    /* ignore */
  }
}

function getLearnedBackend() {
  return learnedBackend;
}

module.exports = { resolveBase, observeResponse, getLearnedBackend };
