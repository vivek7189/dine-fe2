// Roles (rolesV2 restaurants only): pages that have no pageAccess key today, and the role permission
// each one needs. The existing pageAccess guard keeps handling every other page exactly as before.
// Owner / admin (co-owner) are never checked. Permissions come from /api/user/page-access
// (`permissions`, sent only when the restaurant has roles on).

// (dashboard) routes — first path segment
export const ROLES_ROUTE_PERMISSION = {
  '/audit-trail': 'page.analytics',
  '/cancelled-orders': 'page.analytics',
  '/comp-report': 'page.analytics',
  '/hourly-report': 'page.analytics',
  '/menu-engineering': 'page.analytics',
  '/promotion-report': 'page.analytics',
  '/sales-summary': 'page.analytics',
  '/staff-sales': 'page.analytics',
  '/reprint-log': 'orders.view',
  '/open-orders': 'orders.view',
  '/split-bills': 'orders.view',
  '/customer-app': 'settings.features',
  '/settings': 'settings.settings',
  '/my-pay': 'page.myPay',
};

// /mobile/<page> (opened inside the dine-app)
export const ROLES_MOBILE_PERMISSION = {
  admin: 'settings.settings',
  billing: 'page.billing',
  books: 'page.books',
  'customer-app': 'settings.features',
  customers: 'customers.view',
  dashboard: 'page.dashboard',
  'google-reviews': 'settings.googleReviews',
  inventory: 'inventory.view',
  invoice: 'page.invoice',
  menu: 'menu.view',
  offers: 'offers.view',
  orderhistory: 'page.history',
  'sales-summary': 'page.analytics',
  tables: 'tables.view',
  'my-pay': 'page.myPay',
};

const FULL_ACCESS = ['owner', 'admin', 'co-owner'];

// true = allowed; false = the role doesn't allow this page.
export function rolesAllowsPath(pathname, role, permissions, { mobile = false } = {}) {
  if (!permissions || FULL_ACCESS.includes(String(role || '').toLowerCase())) return true;
  const parts = String(pathname || '').split('/').filter(Boolean);
  const key = mobile ? ROLES_MOBILE_PERMISSION[parts[1] || ''] : ROLES_ROUTE_PERMISSION['/' + (parts[0] || '')];
  if (!key) return true;
  return permissions[key] === 'allow';
}
