/**
 * Single source of truth for page access permissions.
 * Used by: Sidebar, layout.js route guard, admin staff permission editor.
 * When adding a new page/route, add it here and it propagates everywhere.
 */

import { FEATURE_OPS } from './permissions';

// ─── All permission-gated pages ───
export const PAGE_ACCESS_CONFIG = [
  // Main nav pages
  { key: 'dashboard', label: 'Dashboard / Billing', icon: 'FaCashRegister', category: 'main' },
  { key: 'history', label: 'Order History', icon: 'FaClipboardList', category: 'main' },
  { key: 'tables', label: 'Tables', icon: 'FaChair', category: 'main' },
  { key: 'menu', label: 'Menu', icon: 'FaUtensils', category: 'main' },
  { key: 'kot', label: 'Kitchen (KOT)', icon: 'FaFire', category: 'main' },
  { key: 'inventory', label: 'Inventory', icon: 'FaBoxes', category: 'main' },
  { key: 'customers', label: 'Customers', icon: 'FaUsers', category: 'main' },
  { key: 'analytics', label: 'Analytics', icon: 'FaChartBar', category: 'main' },
  { key: 'completeBill', label: 'Billing / Register', icon: 'FaCreditCard', category: 'main' },
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
};

// ─── Pages accessible without any permission check ───
export const ALWAYS_ACCESSIBLE = ['/profile', '/home', '/more'];

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
};
