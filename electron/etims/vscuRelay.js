/**
 * Kenya KRA eTIMS — VSCU local relay (Electron main process).
 *
 * The VSCU JAR runs on the restaurant's own machine/LAN (e.g.
 * http://localhost:8088). The cloud backend can't reach it, and a browser can't
 * either (https→http mixed content). The Electron main process CAN, so it acts
 * as a thin, validated relay:
 *
 *   renderer → ipc 'etims:relay' { url, path, body } → this module POSTs to the
 *   local VSCU and returns the JSON response.
 *
 * SECURITY: to stop the renderer from being tricked into posting anywhere, the
 * relay ONLY allows loopback / private-LAN targets (where a VSCU can live). Any
 * public host is rejected. This is registered once from main.js.
 */

'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Permit loopback + RFC1918 private IP ranges + LAN hostnames. LAN hostnames are:
// mDNS/.local, common home/LAN suffixes, and BARE single-label machine names (e.g.
// "desktop-bugkgo7") — a name with NO dot cannot be a public internet domain (those
// always carry a TLD), so it is LAN-scoped by definition. This lets a multi-terminal
// setup point every till at the one VSCU machine by its IP (recommended, always
// resolves) OR by its PC name, while still refusing any public host (SSRF guard).
function isPrivateHost(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, ''); // tolerate [::1] IPv6 brackets
  if (h === 'localhost' || h === '::1') return true;
  if (h.endsWith('.local') || h.endsWith('.lan') || h.endsWith('.internal') || h.endsWith('.home') || h.endsWith('.home.arpa')) return true;
  // IPv4 literal?
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) {
    // Not an IP → allow only bare single-label LAN hostnames (no dots), e.g. a Windows
    // computer name. A dotted name that isn't a private IP or LAN suffix above is a
    // public FQDN → refuse.
    return !h.includes('.');
  }
  const a = +m[1], b = +m[2];
  if (a === 127) return true;                       // 127.0.0.0/8 loopback
  if (a === 10) return true;                        // 10.0.0.0/8
  if (a === 192 && b === 168) return true;          // 192.168.0.0/16
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 169 && b === 254) return true;          // link-local
  return false;                                     // public IP → refuse
}

// Relay timeout (ms). The renderer forwards the value the BACKEND decided per-store
// (etimsConfig.relayTimeoutMs, surfaced in every payload response) so it can be tuned
// from admin with NO app rebuild. Default 90s; clamp 5s–300s so a bad value can neither
// freeze the till for minutes nor be uselessly short. Legacy 2nd-arg still honoured.
function clampTimeout(v) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return 90000;
  return Math.min(300000, Math.max(5000, Math.round(n)));
}

// Map a Node socket error to a stable, human-triageable class. Additive telemetry only —
// nothing here changes control flow; callers that ignore `errorClass` are unaffected.
function classifyErr(err) {
  const code = err && err.code;
  if (code === 'ECONNREFUSED') return 'REFUSED';         // nothing listening → VSCU not running
  if (code === 'ETIMEDOUT') return 'TIMEOUT';            // socket-level timeout
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return 'DNS'; // bad host / LAN name unresolved
  if (code === 'ECONNRESET' || code === 'EPIPE') return 'RESET';  // VSCU closed mid-response
  if (code === 'CERT_HAS_EXPIRED' || (code && String(code).startsWith('ERR_TLS'))) return 'TLS';
  return 'NETWORK';
}

function relay({ url, path = '', body, timeoutMs: bodyTimeout } = {}, timeoutMsArg) {
  const timeoutMs = clampTimeout(bodyTimeout != null ? bodyTimeout : timeoutMsArg);
  const startedAt = Date.now();
  const elapsed = () => Date.now() - startedAt;
  return new Promise((resolve) => {
    let target;
    try {
      target = new URL((url || '').replace(/\/+$/, '') + (path || ''));
    } catch (e) {
      return resolve({ ok: false, error: 'Invalid VSCU URL', errorClass: 'BAD_URL', latencyMs: elapsed(), timeoutMs });
    }
    if (!isPrivateHost(target.hostname)) {
      return resolve({ ok: false, error: `Refused: VSCU target must be a local/LAN address (got ${target.hostname}).`, errorClass: 'REFUSED_NONLOCAL', latencyMs: elapsed(), timeoutMs });
    }
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return resolve({ ok: false, error: 'VSCU URL must be http(s)', errorClass: 'BAD_URL', latencyMs: elapsed(), timeoutMs });
    }

    const payload = Buffer.from(JSON.stringify(body || {}), 'utf8');
    const lib = target.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        path: target.pathname + target.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length },
        // Local VSCU often uses a self-signed cert; don't fail on it (LAN only).
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      (resp) => {
        let data = '';
        resp.on('data', (c) => { data += c; });
        resp.on('end', () => {
          let json = null;
          try { json = JSON.parse(data); } catch { /* non-JSON */ }
          const ok = resp.statusCode >= 200 && resp.statusCode < 300;
          resolve({ ok, status: resp.statusCode, data: json, raw: json ? undefined : data, latencyMs: elapsed(), timeoutMs, ...(ok ? {} : { errorClass: `HTTP_${resp.statusCode}` }) });
        });
      }
    );
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: `VSCU timed out after ${Math.round(timeoutMs / 1000)}s. Is the VSCU running on this machine?`, errorClass: 'TIMEOUT', latencyMs: elapsed(), timeoutMs }); });
    req.on('error', (err) => { resolve({ ok: false, error: `Could not reach the VSCU: ${err.message}`, errorClass: classifyErr(err), latencyMs: elapsed(), timeoutMs }); });
    req.write(payload);
    req.end();
  });
}

/**
 * Register the IPC handler. Call once from main.js:
 *   require('./etims/vscuRelay').register(ipcMain);
 */
function register(ipcMain) {
  try {
    ipcMain.handle('etims:relay', async (_event, args) => relay(args || {}));
  } catch (e) {
    // already registered (hot reload) — ignore
  }
}

module.exports = { register, relay, isPrivateHost };
