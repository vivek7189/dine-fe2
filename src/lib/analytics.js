// Product analytics (PostHog). Tracks the owner's journey — signup → restaurant → menu →
// first order → payment — plus API errors, so the daily report can show where new users
// drop off. Only IDs and roles are sent (no names, phones or emails). No-op when PostHog
// isn't initialised (no key, server render, Electron desktop app).
import posthog from 'posthog-js';

const enabled = () => typeof window !== 'undefined' && !!window.__posthogInitialized && !window.electronAPI;

export function track(event, props = {}) {
  if (!enabled()) return;
  try { posthog.capture(event, props); } catch { /* analytics must never break the app */ }
}

// Fire an event only once per key (e.g. first menu item per restaurant), using localStorage.
export function trackOnce(event, key, props = {}) {
  if (!enabled() || !key) return;
  const flag = `ph_once_${event}_${key}`;
  try {
    if (localStorage.getItem(flag)) return;
    localStorage.setItem(flag, '1');
  } catch { /* storage blocked: fall through and track anyway */ }
  track(event, props);
}

export function identifyUser(user) {
  if (!enabled() || !user) return;
  const id = user.id || user.userId || user._id || user.uid;
  if (!id) return;
  try {
    posthog.identify(String(id), {
      role: user.role || null,
      restaurant_id: user.restaurantId || null,
      signup_method: user.provider || null,
    });
  } catch { /* ignore */ }
}

// Call right after a successful login/signup response.
export function trackAuth(resp, method) {
  if (!resp) return;
  identifyUser(resp.user);
  track(resp.isNewUser ? 'signup_completed' : 'login_completed', {
    method,
    is_new_user: !!resp.isNewUser,
    has_restaurants: resp.hasRestaurants ?? null,
  });
}

export function resetAnalytics() {
  if (!enabled()) return;
  try { posthog.reset(); } catch { /* ignore */ }
}

// API failures, deduped per endpoint+status per page load so a retry loop can't flood events.
const seenErrors = new Set();
export function trackApiError(endpoint, status, method = 'GET') {
  if (!enabled()) return;
  const path = String(endpoint || '').split('?')[0]
    .replace(/[0-9a-fA-F]{24}|[A-Za-z0-9]{20,}/g, ':id')   // Firestore-style / long ids
    .replace(/\/\d+(?=\/|$)/g, '/:n');
  const key = `${method} ${path} ${status}`;
  if (seenErrors.has(key)) return;
  seenErrors.add(key);
  track('api_error', { endpoint: path, status: status || 0, method });
}
