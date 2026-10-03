// "Served by" — the staff member a counter order's SALES are credited to (Staff Sales report).
// Chosen on the POS order panel by a counter login (owner / manager / cashier) and remembered on
// THIS terminal, per restaurant, until changed or cleared. Sent with every new order as
// `servedBy: { id, name }`; the backend validates it and stores it as the order's server
// (waiterId), ahead of the table's assigned server.

const KEY = (rid) => `dineopen_served_by_${rid}`;
export const SERVED_BY_EVENT = 'servedByChanged';

// Logins that type orders at the counter for someone else.
export const COUNTER_ROLES = new Set(['owner', 'admin', 'co-owner', 'manager', 'cashier']);

export function currentUserRole() {
  if (typeof window === 'undefined') return '';
  try { return String(JSON.parse(localStorage.getItem('user') || '{}').role || '').toLowerCase(); } catch { return ''; }
}

export function getServedBy(restaurantId) {
  if (!restaurantId || typeof window === 'undefined') return null;
  try {
    const v = JSON.parse(localStorage.getItem(KEY(restaurantId)) || 'null');
    return v && v.id ? { id: String(v.id), name: v.name || '' } : null;
  } catch { return null; }
}

export function setServedBy(restaurantId, staff) {
  if (!restaurantId || typeof window === 'undefined') return;
  try {
    if (staff && staff.id) localStorage.setItem(KEY(restaurantId), JSON.stringify({ id: String(staff.id), name: staff.name || '' }));
    else localStorage.removeItem(KEY(restaurantId));
    window.dispatchEvent(new CustomEvent(SERVED_BY_EVENT, { detail: { restaurantId } }));
  } catch { /* storage blocked */ }
}

// Stamp a new order with this terminal's "Served by" (unless the caller set one, or it's a
// customer self-order). Only counter logins carry it — a waiter's own orders credit the waiter.
export function stampServedBy(orderData) {
  if (!orderData || orderData.servedBy || orderData.orderType === 'customer_self_order') return orderData;
  if (!COUNTER_ROLES.has(currentUserRole())) return orderData;
  const sb = getServedBy(orderData.restaurantId);
  if (sb) orderData.servedBy = sb;
  return orderData;
}
