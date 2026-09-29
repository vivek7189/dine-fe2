// Client helpers for Staff Access Rules (Admin → Staff Access). The server enforces everything;
// these only hide what the logged-in staff member isn't allowed to use (rules loaded by
// StaffAccessGate into apiClient.getStaffAccess()). No rules / not restricted → everything allowed.
import apiClient from './api';

// same normalisation as the backend (utils/staffAccess.normOrderType)
export function normOrderType(t) {
  const s = String(t || 'dine_in').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (['takeaway', 'take_away', 'parcel', 'pickup', 'pick_up', 'to_go', 'togo'].includes(s)) return 'takeaway';
  if (['dine_in', 'dinein', 'dine', 'counter'].includes(s)) return 'dine_in'; // counter = in-store
  if (['delivery', 'home_delivery'].includes(s)) return 'delivery';
  return s;
}

export function staffAccessRules() {
  try {
    const sa = apiClient.getStaffAccess ? apiClient.getStaffAccess() : null;
    return sa && sa.restricted && sa.rules ? sa.rules : null;
  } catch { return null; }
}

// Filter a list of order types ({ id }) to the ones this staff member may take. Never returns an
// empty list (fails open — the server still refuses a disallowed type).
export function filterAllowedOrderTypes(types) {
  const rules = staffAccessRules();
  const allowed = rules && Array.isArray(rules.allowedOrderTypes) && rules.allowedOrderTypes.length ? rules.allowedOrderTypes : null;
  if (!allowed || !Array.isArray(types)) return types;
  const out = types.filter(t => allowed.includes(normOrderType(t && (t.id || t))));
  return out.length ? out : types;
}
