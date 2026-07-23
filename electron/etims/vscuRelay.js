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

// Only loopback + RFC1918 private ranges + *.local (mDNS) are permitted.
function isPrivateHost(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local')) return true;
  // IPv6 loopback
  if (h === '::1' || h === '[::1]') return true;
  // IPv4 checks
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const a = +m[1], b = +m[2];
  if (a === 127) return true;                       // 127.0.0.0/8 loopback
  if (a === 10) return true;                        // 10.0.0.0/8
  if (a === 192 && b === 168) return true;          // 192.168.0.0/16
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 169 && b === 254) return true;          // link-local
  return false;
}

function relay({ url, path = '', body }, timeoutMs = 30000) {
  return new Promise((resolve) => {
    let target;
    try {
      target = new URL((url || '').replace(/\/+$/, '') + (path || ''));
    } catch (e) {
      return resolve({ ok: false, error: 'Invalid VSCU URL' });
    }
    if (!isPrivateHost(target.hostname)) {
      return resolve({ ok: false, error: `Refused: VSCU target must be a local/LAN address (got ${target.hostname}).` });
    }
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return resolve({ ok: false, error: 'VSCU URL must be http(s)' });
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
          resolve({ ok: resp.statusCode >= 200 && resp.statusCode < 300, status: resp.statusCode, data: json, raw: json ? undefined : data });
        });
      }
    );
    req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: `VSCU timed out after ${Math.round(timeoutMs / 1000)}s. Is the VSCU running on this machine?` }); });
    req.on('error', (err) => { resolve({ ok: false, error: `Could not reach the VSCU: ${err.message}` }); });
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
