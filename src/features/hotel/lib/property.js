// Resolve the active property (restaurantId) for hotel PMS pages — mirrors the
// convention used across the dashboard (bookings, tables, etc.): staff tokens are
// bound to their restaurant; owners/admins use the selected restaurant.
import apiClient from '../../../lib/api';

const STAFF_ROLES = ['waiter', 'manager', 'employee', 'cashier'];

export async function resolveActivePropertyId() {
  if (typeof window === 'undefined') return null;

  let user = {};
  try { user = JSON.parse(localStorage.getItem('user') || '{}'); } catch { /* noop */ }

  const role = (user.role || '').toLowerCase();
  if (user.restaurantId && STAFF_ROLES.includes(role)) return user.restaurantId;

  const saved = localStorage.getItem('selectedRestaurantId');
  if (saved) return saved;

  try {
    const resp = await apiClient.getRestaurants();
    if (resp?.restaurants?.length) return resp.restaurants[0].id;
  } catch { /* offline / no access */ }

  return user.restaurantId || null;
}
