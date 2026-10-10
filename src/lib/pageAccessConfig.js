/**
 * Single source of truth for page access permissions.
 * Used by: Sidebar, layout.js route guard, admin staff permission editor.
 * When adding a new page/route, add it here and it propagates everywhere.
 */

import { FEATURE_OPS } from './permissions';

// ─── All permission-gated pages ───
export const PAGE_ACCESS_CONFIG = [
  // Main nav pages
  { key: 'dashboard', label: 'POS screen (take orders)', icon: 'FaCashRegister', category: 'main' },
  { key: 'history', label: 'Order History', icon: 'FaClipboardList', category: 'main' },
  { key: 'tables', label: 'Tables', icon: 'FaChair', category: 'main' },
  { key: 'menu', label: 'Menu', icon: 'FaUtensils', category: 'main' },
  { key: 'kot', label: 'Kitchen (KOT)', icon: 'FaFire', category: 'main' },
  { key: 'inventory', label: 'Inventory', icon: 'FaBoxes', category: 'main' },
  { key: 'customers', label: 'Customers', icon: 'FaUsers', category: 'main' },
  { key: 'analytics', label: 'Analytics', icon: 'FaChartBar', category: 'main' },
  { key: 'completeBill', label: 'Complete bill (take payment)', icon: 'FaCreditCard', category: 'main' },
  { key: 'invoice', label: 'Invoice', icon: 'FaFileInvoice', category: 'main' },
  { key: 'offers', label: 'Offers', icon: 'FaTag', category: 'main' },
  { key: 'admin', label: 'Admin Settings', icon: 'FaCog', category: 'main' },

  // App-level features (default enabled, owner can disable per staff)
  { key: 'printer', label: 'Printer Settings', icon: 'FaPrint', category: 'main' },

  // "More" sub-pages
  { key: 'hotel', label: 'Hotel PMS', icon: 'FaHotel', category: 'more' },
  { key: 'bookings', label: 'Bookings & Catering', icon: 'FaCalendarAlt', category: 'more' },
  { key: 'parking', label: 'Parking', icon: 'FaCar', category: 'more' },
  { key: 'dineai', label: 'DineAI Studio', icon: 'FaRobot', category: 'more' },
  { key: 'shifts', label: 'Shifts', icon: 'FaClock', category: 'more' },
  { key: 'books', label: 'Books & Accounting', icon: 'FaBook', category: 'more' },
  { key: 'feedback', label: 'Feedback', icon: 'FaCommentDots', category: 'more' },
  { key: 'calendar', label: 'Event Calendar', icon: 'FaCalendarAlt', category: 'more' },
];

// ─── Route segment → pageAccess key mapping ───
// Used by layout.js (route guard) and Sidebar (nav filtering)
export const ROUTE_TO_ACCESS_KEY = {
  '/dashboard': 'dashboard',
  '/orders': 'history',
  '/orderhistory': 'history',
  '/tables': 'tables',
  '/customers': 'customers',
  '/menu': 'menu',
  '/inventory': 'inventory',
  '/kot': 'kot',
  '/admin': 'admin',
  '/hotel': 'hotel',
  '/invoice': 'invoice',
  '/billing': 'completeBill',
  '/register': 'completeBill',
  '/books': 'admin',
  '/dineai': 'analytics',
  '/analytics': 'analytics',
  '/shifts': 'admin',
  '/shifts-cash': 'shifts',
  '/attendance': 'admin',
  '/offers': 'offers',
  '/automation': 'admin',
  '/spaces': 'admin',
  '/parking': 'parking',
  '/whatsapp-ordering': 'analytics',
  '/social-media': 'analytics',
  '/feedback': 'admin',
  '/bookings': 'bookings',
  '/phone-agent': 'analytics',
  '/google-reviews': 'admin',
  '/calendar': 'calendar',
};

// ─── Pages accessible without any permission check ───
export const ALWAYS_ACCESSIBLE = ['/profile', '/home', '/more'];

// Pages a WAITER normally has (true in the waiter role default). Waiters historically bypassed
// pageAccess entirely; we now let an owner restrict ONLY these normally-available pages (e.g. hide
// Order History). Pages that were only ever shown to waiters via that legacy bypass (KOT, Admin,
// etc. — false in the waiter default) stay visible exactly as before, so no existing waiter loses
// access by default. An owner opting a waiter OUT of one of these keys is honored.
export const WAITER_ENFORCEABLE_KEYS = new Set(['dashboard', 'history', 'tables', 'menu']);

// Keys added after staff records already existed: ON unless the owner explicitly turned them off
// (a missing key = allowed). The server still decides — e.g. the calendar API answers 403 to staff
// when the owner switched "Staff can view" off, and the nav entry then hides itself.
export const DEFAULT_ON_ACCESS_KEYS = new Set(['calendar']);

// Resolve a default-on key: undefined/null → true; otherwise the usual truthiness rules.
export function defaultOnAccessAllowed(pageAccess, key) {
  const v = pageAccess ? pageAccess[key] : undefined;
  if (v === undefined || v === null) return true;
  if (typeof v === 'object') return Object.values(v).some(Boolean);
  return !!v;
}

// Copy of a pageAccess map with missing default-on keys filled in as true (staff editors).
export function withDefaultOnAccess(pageAccess) {
  if (!pageAccess || typeof pageAccess !== 'object') return pageAccess;
  const out = { ...pageAccess };
  for (const k of DEFAULT_ON_ACCESS_KEYS) if (out[k] === undefined || out[k] === null) out[k] = true;
  return out;
}

// ─── Helper: check if a pageAccess key has granular sub-operations ───
export function hasGranularOps(key) {
  return !!FEATURE_OPS[key];
}

// ─── Helper: get all pageAccess keys (for iteration) ───
export function getAllAccessKeys() {
  return PAGE_ACCESS_CONFIG.map(p => p.key);
}

// ─── Nav item ID → pageAccess key mapping (for Sidebar/Navigation) ───
// Maps sidebar nav item `id` to the corresponding pageAccess key.
export const NAV_ID_TO_ACCESS_KEY = {
  'pos': 'dashboard',
  'orders': 'history',
  'tables': 'tables',
  'customers': 'customers',
  'menu': 'menu',
  'inventory': 'inventory',
  'kot': 'kot',
  'admin': 'admin',
  'hotel': 'hotel',
  'invoice': 'invoice',
  'billing': 'completeBill',
  'books': 'admin',
  'dineai': 'analytics',
  'phone-agent': 'analytics',
  'whatsapp-ordering': 'analytics',
  'social-media': 'analytics',
  'shifts': 'admin',
  'shifts-cash': 'shifts',
  'register': 'completeBill',
  'attendance': 'admin',
  'google-reviews': 'admin',
  'spaces': 'admin',
  'parking': 'parking',
  'bookings': 'bookings',
  'feedback': 'admin',
  'calendar': 'calendar',
};


// ─── One access rule for route guard, Sidebar, Home tiles and page buttons ───
// Pages that ALSO open with their own tick (owners tick "Books" for an accountant without Admin).
// Either key allows the page — widening only, nobody loses access. (Shifts rota deliberately not
// here: the "Shifts" tick is Shifts & Cash, it must not open the staff rota.)
export const ROUTE_ALT_ACCESS_KEYS = { '/books': ['books'], '/feedback': ['feedback'], '/dineai': ['dineai'] };
export const NAV_ALT_ACCESS_KEYS = { books: ['books'], feedback: ['feedback'], dineai: ['dineai'] };

// Is a pageAccess value "on"? (object = any sub-permission on)
export function accessValueOn(v) {
  if (typeof v === 'object' && v !== null) return Object.values(v).some(Boolean);
  return !!v;
}

// Latest permissions: the copy the Sidebar refreshes from the server (navPageAccess) — so a change
// the owner makes mid-shift applies without logging out — else the login copy on the user.
export function getEffectivePageAccess(user) {
  if (typeof window !== 'undefined' && user) {
    try {
      // only this user's copy (a shared counter PC: the previous person's copy must never apply)
      const uid = String(user.id || user.userId || '');
      if (uid && localStorage.getItem('navPageAccessUser') === uid) {
        const fresh = JSON.parse(localStorage.getItem('navPageAccess') || 'null');
        if (fresh && typeof fresh === 'object') return fresh;
      }
    } catch (_) { /* fall back */ }
  }
  return (user && user.pageAccess) || null;
}

// May this user open this route? (Same rules as before; used by the layout guard and Home tiles.)
export function canAccessRoute(pathname, user, pageAccess) {
  if (!user || !user.role) return false;
  // Owner and admin bypass pageAccess (consistent with Sidebar)
  if (['owner', 'admin'].includes(user.role)) return true;
  // Always-accessible pages
  if (ALWAYS_ACCESSIBLE.some(p => pathname === p || pathname.startsWith(p + '/'))) return true;
  const routeSegment = '/' + String(pathname || '').split('/').filter(Boolean)[0];
  const accessKey = ROUTE_TO_ACCESS_KEY[routeSegment];
  if (!accessKey) return true; // Unknown routes default to accessible (profile, etc.)
  // Newer pages (e.g. Calendar): allowed unless explicitly turned off, for every staff role.
  if (DEFAULT_ON_ACCESS_KEYS.has(accessKey)) return defaultOnAccessAllowed(pageAccess, accessKey);
  // Waiters: only owner-restrictable on the pages they normally have, and only when explicitly set.
  if (user.role === 'waiter') {
    if (!WAITER_ENFORCEABLE_KEYS.has(accessKey)) return true;
    if (!pageAccess) return true;
    const v = pageAccess[accessKey];
    if (v === undefined || v === null) return true;
    return accessValueOn(v);
  }
  if (!pageAccess) return false;
  if (accessValueOn(pageAccess[accessKey])) return true;
  return (ROUTE_ALT_ACCESS_KEYS[routeSegment] || []).some(k => accessValueOn(pageAccess[k]));
}
