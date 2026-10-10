// Offline app only (DineOpen POS Server build): while this PC is running on its LOCAL server
// (internet down), saving the menu or the owner's settings is refused with a clear message.
//
// Why: owner settings (tax, currency, prices, billing, business details, customer app) only flow
// cloud → PC, so an offline edit here would be silently overwritten on reconnect; the menu syncs as
// one record both ways, so an offline edit and a web edit would overwrite each other. Selling,
// bills, customers and credit are unaffected, and marking an item sold out / available still works.
//
// In the normal online app and on the web, isServerApp() is false → this never blocks anything.
import { isServerApp, getLocalServerUrl } from './localServer';

const LOCKED = [
  /^\/api\/menus\//,                    // create / edit / delete / bulk items, AI names
  /^\/api\/categories\//,
  /^\/api\/menu-items\//,               // item images
  /^\/api\/menu-theme\//,
  /^\/api\/admin\/tax\//,
  /^\/api\/admin\/currency\//,
  /^\/api\/admin\/business\//,
  /^\/api\/restaurants\/[^/]+\/(customer-app-settings|pricing-settings|billing-settings)\b/,
];

// The one menu change allowed offline: switching an item sold out / available.
const AVAILABILITY_ONLY = new Set(['isAvailable']);

export const OFFLINE_EDIT_LOCKED_MESSAGE =
  'This PC is offline. Menu, prices and settings can be changed again when the internet is back. Marking an item sold out still works.';

function bodyObject(body) {
  if (!body) return null;
  if (typeof body === 'object' && !(typeof FormData !== 'undefined' && body instanceof FormData)) return body;
  if (typeof body === 'string') { try { return JSON.parse(body); } catch { return null; } }
  return null;
}

// Returns the message to show when this save must be refused, else null.
export function offlineEditBlocked(endpoint, method, body) {
  const m = String(method || 'GET').toUpperCase();
  if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return null;
  try {
    if (!isServerApp() || !getLocalServerUrl()) return null;   // online app / web / offline app while online
  } catch { return null; }
  const path = String(endpoint || '').split('?')[0];
  if (!LOCKED.some((re) => re.test(path))) return null;
  if (m === 'PATCH' && /^\/api\/menus\/item\//.test(path)) {
    const b = bodyObject(body);
    const keys = b ? Object.keys(b) : [];
    if (keys.length && keys.every((k) => AVAILABILITY_ONLY.has(k))) return null;
  }
  return OFFLINE_EDIT_LOCKED_MESSAGE;
}
