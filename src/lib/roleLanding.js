'use client';

import apiClient from './api';

// Role-landing (opt-in): after a fresh login, send the role to the page it works on
// (e.g. cashier → Tables). apiClient.getRedirectPath() reads posSettings.roleLandingPages,
// so we first make sure the restaurant's posSettings is loaded (the login response doesn't
// include it) by persisting selectedRestaurant if needed. Returns the role's configured path,
// or '' when role-landing is off/unset so the caller keeps its normal /home redirect.
// Best-effort; never throws.
//
// Shared by both the main login page (email / Google / PIN / phone-OTP) and the local-server
// PIN login, so every login path honours the same role-landing setting.
export async function resolveRoleLanding(user) {
  if (typeof window === 'undefined') return '';
  try {
    let sr = null;
    try { sr = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null'); } catch {}
    if (!sr || !sr.posSettings) {
      try {
        const data = await apiClient.getRestaurants();
        const list = (data && (data.restaurants || data)) || [];
        if (Array.isArray(list) && list.length) {
          const rid = user?.restaurantId || user?.defaultRestaurantId || localStorage.getItem('selectedRestaurantId');
          const chosen = (rid && list.find((r) => r.id === rid))
            || (user?.defaultRestaurantId && list.find((r) => r.id === user.defaultRestaurantId))
            || list[0];
          if (chosen) {
            localStorage.setItem('selectedRestaurant', JSON.stringify(chosen));
            localStorage.setItem('selectedRestaurantId', chosen.id);
          }
        }
      } catch (_) { /* fetch is best-effort */ }
    }
    const dest = apiClient.getRedirectPath();
    return (dest && dest !== '/home') ? dest : '';
  } catch { return ''; }
}

export default resolveRoleLanding;
