// Connect your own WhatsApp number (Meta Embedded Signup).
// Computer: Facebook opens as a popup (FB.login) — unchanged.
// Phone browser: a popup becomes a separate tab and its result is often lost (the DineOpen tab gets
// frozen / reloaded), so Facebook opens in the SAME tab and comes back to /whatsapp/connected with
// a one-time code; that page finishes the connection. A random `state` (kept in this browser) proves
// the code came back from the signup this browser started.
export const FACEBOOK_APP_ID = '1591044548986175';
export const EMBEDDED_SIGNUP_CONFIG_ID = process.env.NEXT_PUBLIC_WA_TECH_PROVIDER_CONFIG_ID || '1297353665849277';
export const CONNECT_RETURN_PATH = '/whatsapp/connected';
const STATE_KEY = 'dine_wa_connect';
const STATE_TTL_MS = 30 * 60 * 1000;

export function isPhoneBrowser() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  if (window.electronAPI) return false;
  return /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(navigator.userAgent || '');
}

export const connectReturnUrl = () => `${window.location.origin}${CONNECT_RETURN_PATH}`;

export function startPhoneConnect(restaurantId) {
  const a = new Uint8Array(16);
  window.crypto.getRandomValues(a);
  const state = Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
  try { localStorage.setItem(STATE_KEY, JSON.stringify({ state, restaurantId, at: Date.now() })); } catch (_) { return false; }
  const extras = { setup: {}, featureType: '', sessionInfoVersion: '3', version: 'v4' };
  const q = new URLSearchParams({
    client_id: FACEBOOK_APP_ID,
    config_id: EMBEDDED_SIGNUP_CONFIG_ID,
    response_type: 'code',
    override_default_response_type: 'true',
    redirect_uri: connectReturnUrl(),
    state,
    extras: JSON.stringify(extras),
  });
  window.location.href = `https://www.facebook.com/v26.0/dialog/oauth?${q.toString()}`;
  return true;
}

// The signup this browser started, if `state` matches and it's recent. Used once, then cleared.
export function takePhoneConnect(state) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STATE_KEY) || 'null'); localStorage.removeItem(STATE_KEY); } catch (_) { saved = null; }
  if (!saved || !state || saved.state !== state || !saved.restaurantId) return null;
  if (Date.now() - Number(saved.at || 0) > STATE_TTL_MS) return null;
  return saved;
}
