// Partner portal API client. Separate from the restaurant apiClient on purpose: own token key, never
// sends the restaurant login, and the restaurant app never sends the partner token.
import { getApiBase } from '@/lib/apiBase';

const TOKEN_KEY = 'dineopen_partner_token';

export const partnerToken = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (_) { return ''; } },
  set: (t) => { try { localStorage.setItem(TOKEN_KEY, t); } catch (_) { /* private mode */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch (_) { /* private mode */ } },
};

export class PartnerApiError extends Error {
  constructor(message, status, code) { super(message); this.status = status; this.code = code; }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const t = auth ? partnerToken.get() : '';
  if (t) headers.Authorization = `Bearer ${t}`;
  let res;
  try {
    res = await fetch(`${getApiBase()}/api/partners${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  } catch (_) {
    throw new PartnerApiError('Could not reach the server. Check your internet and try again.', 0);
  }
  const json = await res.json().catch(() => ({}));
  if (res.status === 401 && auth) {
    partnerToken.clear();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/partner/login')) window.location.href = '/partner/login';
  }
  if (!res.ok || json.success === false) throw new PartnerApiError(json.error || 'Something went wrong. Please try again.', res.status, json.code);
  return json;
}

const partnerApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  phoneLogin: (idToken) => request('/auth/phone', { method: 'POST', body: { idToken }, auth: false }),
  apply: (data) => request('/apply', { method: 'POST', body: data, auth: false }),
  me: () => request('/me'),
  clients: () => request('/clients'),
  commissions: () => request('/commissions'),
  payouts: () => request('/payouts'),
  leads: () => request('/leads'),
  createLead: (d) => request('/leads', { method: 'POST', body: d }),
  updateLead: (id, d) => request(`/leads/${encodeURIComponent(id)}`, { method: 'PATCH', body: d }),
  deleteLead: (id) => request(`/leads/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  claims: () => request('/claims'),
  createClaim: (d) => request('/claims', { method: 'POST', body: d }),
  payoutDetails: () => request('/payout-details'),
  savePayoutDetails: (d) => request('/payout-details', { method: 'PUT', body: d }),
  changePassword: (currentPassword, newPassword) => request('/password', { method: 'POST', body: { currentPassword, newPassword } }),
  logoutEverywhere: () => request('/logout-everywhere', { method: 'POST' }),
};

export default partnerApi;
