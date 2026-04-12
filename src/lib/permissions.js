// Granular feature permission utilities
// Shared between admin page and all feature pages

export const ADMIN_TAB_OPS = [
  'settings', 'tax', 'pricing', 'payments', 'billingSettings',
  'currency', 'print', 'features', 'restaurants', 'staff',
  'orderManagement', 'offers', 'loyalty', 'googleReviews'
];

export const FEATURE_OPS = {
  inventory: ['read', 'add', 'update', 'delete'],
  menu: ['read', 'add', 'update', 'delete', 'markOutOfStock'],
  orders: ['read', 'update', 'cancel', 'refund', 'completeBill'],
  tables: ['read', 'add', 'update', 'delete', 'reset'],
  customers: ['read', 'add', 'update', 'delete'],
  offers: ['read', 'add', 'update', 'delete'],
  admin: ADMIN_TAB_OPS
};

export const OP_LABELS = {
  read: 'View',
  add: 'Add',
  update: 'Edit',
  delete: 'Delete',
  markOutOfStock: 'Out of Stock',
  cancel: 'Cancel',
  refund: 'Refund',
  completeBill: 'Complete Bill',
  reset: 'Reset All'
};

export const ADMIN_TAB_LABELS = {
  settings: 'General',
  tax: 'Tax Management',
  pricing: 'Pricing Rules',
  payments: 'Payment Settings',
  billingSettings: 'Billing',
  currency: 'Currency',
  print: 'Print Settings',
  features: 'Features',
  restaurants: 'Restaurants',
  staff: 'Staff',
  orderManagement: 'Order Management',
  offers: 'Offers & Discounts',
  loyalty: 'Loyalty Program',
  googleReviews: 'Google Reviews',
};

export const ADMIN_TAB_ID_TO_KEY = {
  'settings': 'settings',
  'tax': 'tax',
  'pricing': 'pricing',
  'payments': 'payments',
  'billing-settings': 'billingSettings',
  'currency': 'currency',
  'print': 'print',
  'features': 'features',
  'restaurants': 'restaurants',
  'staff': 'staff',
  'order-management': 'orderManagement',
  'offers': 'offers',
  'loyalty': 'loyalty',
  'google-reviews': 'googleReviews',
};

/**
 * Resolve permissions for a feature from pageAccess.
 * Handles boolean (legacy) and object (granular) formats.
 */
export function resolveFeaturePermissions(pageAccess, feature) {
  const ops = FEATURE_OPS[feature] || ['read', 'add', 'update', 'delete'];
  const val = pageAccess?.[feature];
  if (typeof val === 'object' && val !== null) {
    const result = {};
    for (const op of ops) result[op] = !!val[op];
    return result;
  }
  const boolVal = !!val;
  const result = {};
  for (const op of ops) result[op] = boolVal;
  return result;
}

/**
 * Check if a user can perform a specific operation on a feature.
 * Owner/admin always can. Manager allowed by default if no explicit restriction.
 */
export function canPerform(user, pageAccess, feature, operation) {
  const role = user?.role?.toLowerCase();
  if (role === 'owner' || role === 'admin') return true;

  // Legacy standalone boolean fallbacks
  if (feature === 'orders' && operation === 'completeBill' && pageAccess?.completeBill !== undefined) {
    return !!pageAccess.completeBill;
  }
  if (feature === 'tables' && operation === 'reset' && pageAccess?.resetTables !== undefined) {
    return !!pageAccess.resetTables;
  }

  const perms = resolveFeaturePermissions(pageAccess, feature);
  if (perms[operation]) return true;

  // Manager fallback: if feature key not present at all, allow
  if (role === 'manager' && pageAccess?.[feature] === undefined) return true;

  return false;
}

// Backward-compatible alias
export function resolveInventoryPermissions(pageAccess) {
  return resolveFeaturePermissions(pageAccess, 'inventory');
}
