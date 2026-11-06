// Partner sign-up links (?partner=CODE on any dineopen.com page). First touch is kept for 30 days;
// after the owner logs in, the code is sent once to /api/partners/attribute (server only links
// brand-new accounts that never paid).
import { getApiBase } from '@/lib/apiBase';

const KEY = 'dineopen_partner_ref';
const TTL = 30 * 24 * 60 * 60 * 1000;

export function captureReferral() {
  try {
    const code = new URLSearchParams(window.location.search).get('partner');
    if (!code || !/^[A-Za-z0-9]{3,20}$/.test(code)) return;
    const prev = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (prev && prev.code && Date.now() - prev.at < TTL) return; // first touch wins
    localStorage.setItem(KEY, JSON.stringify({ code: code.toUpperCase(), at: Date.now() }));
  } catch (_) { /* storage blocked */ }
}

// Called with the restaurant login token right after it is saved. Fire-and-forget, never throws.
export function attributeAfterLogin(token) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!saved || !saved.code || !token || Date.now() - saved.at > TTL) return;
    localStorage.removeItem(KEY); // one try only
    fetch(`${getApiBase()}/api/partners/attribute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code: saved.code }),
    }).catch(() => {});
  } catch (_) { /* storage blocked */ }
}
