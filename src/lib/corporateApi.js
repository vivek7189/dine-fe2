// Corporate Meal module — web API client. Thin wrapper over the shared apiClient so it reuses
// auth, base URL, retry and offline handling. All calls hit /api/corporate/* (flag-gated on BE).
import apiClient from './api';

const req = (endpoint, opts = {}) => apiClient.request(endpoint, opts);
const qs = (obj) => {
  const p = Object.entries(obj || {}).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  return p.length ? `?${p.join('&')}` : '';
};

// Authenticated binary download (PDF). apiClient.request() JSON-parses responses, so hit fetch
// directly, reusing the same base URL + bearer token, then save the blob.
async function downloadBlob(endpoint, filename) {
  const token = apiClient.getToken?.();
  const res = await fetch(`${apiClient.baseURL}${endpoint}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!res.ok) { let msg = 'Download failed'; try { msg = (await res.json()).error || msg; } catch { /* non-json */ } throw new Error(msg); }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const corporateApi = {
  // ── Enablement (ungated) ──
  getFlag: () => req('/api/corporate-admin/flag'),
  setFlag: (enabled) => req('/api/corporate-admin/flag', { method: 'POST', body: { enabled } }),

  // ── Clients ──
  listClients: () => req('/api/corporate/clients'),
  getClient: (id) => req(`/api/corporate/clients/${id}`),
  createClient: (body) => req('/api/corporate/clients', { method: 'POST', body }),
  updateClient: (id, body) => req(`/api/corporate/clients/${id}`, { method: 'PATCH', body }),
  deleteClient: (id) => req(`/api/corporate/clients/${id}`, { method: 'DELETE' }),

  // ── Sites ──
  listSites: (params) => req(`/api/corporate/sites${qs(params)}`),
  createSite: (body) => req('/api/corporate/sites', { method: 'POST', body }),
  updateSite: (id, body) => req(`/api/corporate/sites/${id}`, { method: 'PATCH', body }),
  deleteSite: (id) => req(`/api/corporate/sites/${id}`, { method: 'DELETE' }),

  // ── Employees ──
  listEmployees: (params) => req(`/api/corporate/employees${qs(params)}`),
  getEmployee: (id) => req(`/api/corporate/employees/${id}`),
  createEmployee: (body) => req('/api/corporate/employees', { method: 'POST', body }),
  updateEmployee: (id, body) => req(`/api/corporate/employees/${id}`, { method: 'PATCH', body }),
  deleteEmployee: (id) => req(`/api/corporate/employees/${id}`, { method: 'DELETE' }),
  importEmployees: (siteId, employees) => req('/api/corporate/employees/import', { method: 'POST', body: { siteId, employees } }),
  rotateQr: (id) => req(`/api/corporate/employees/${id}/qr`, { method: 'POST' }),

  // ── Meal periods ──
  listMealPeriods: (params) => req(`/api/corporate/meal-periods${qs(params)}`),
  createMealPeriod: (body) => req('/api/corporate/meal-periods', { method: 'POST', body }),
  updateMealPeriod: (id, body) => req(`/api/corporate/meal-periods/${id}`, { method: 'PATCH', body }),
  deleteMealPeriod: (id) => req(`/api/corporate/meal-periods/${id}`, { method: 'DELETE' }),

  // ── Bookings ──
  listBookings: (params) => req(`/api/corporate/bookings${qs(params)}`),
  createBooking: (body) => req('/api/corporate/bookings', { method: 'POST', body }),
  cancelBooking: (id) => req(`/api/corporate/bookings/${id}`, { method: 'DELETE' }),

  // ── Verify (counter) ──
  verify: (body) => req('/api/corporate/verify', { method: 'POST', body }),

  // ── Live counts ──
  counts: (params) => req(`/api/corporate/counts${qs(params)}`),

  // ── Billing (Phase 4) — monthly client invoices ──
  billing: {
    generateInvoice: (clientId, month) => req(`/api/corporate/billing/clients/${clientId}/invoices/generate`, { method: 'POST', body: { month } }),
    listInvoices: (clientId) => req(`/api/corporate/billing/clients/${clientId}/invoices`),
    getInvoice: (id) => req(`/api/corporate/billing/invoices/${id}`),
    reconcileInvoice: (id, body) => req(`/api/corporate/billing/invoices/${id}/reconcile`, { method: 'POST', body }),
    emailInvoice: (id, to) => req(`/api/corporate/billing/invoices/${id}/email`, { method: 'POST', body: { to } }),
    // PDF is a binary stream — fetch as a blob (with auth) and trigger a browser download.
    downloadInvoicePdf: (id, filename) => downloadBlob(`/api/corporate/billing/invoices/${id}/pdf`, filename || `invoice_${id}.pdf`),
  },

  // ── Client portal access (Phase 5) — operator side ──
  setClientPortal: (clientId, enabled) => req(`/api/corporate/clients/${clientId}/portal`, { method: 'POST', body: { enabled } }),
  rotateClientPortal: (clientId) => req(`/api/corporate/clients/${clientId}/portal/rotate`, { method: 'POST' }),

  // ── Reports (Phase 6) — MIS ──
  reports: {
    summary: (params) => req(`/api/corporate/reports/summary${qs(params)}`),
    consumption: (params) => req(`/api/corporate/reports/consumption${qs(params)}`),
    subsidy: (params) => req(`/api/corporate/reports/subsidy${qs(params)}`),
  },

  // ── Employee self-service (resolved by the caller's phone) ──
  employee: {
    me: () => req('/api/corporate-employee/me'),
    menu: () => req('/api/corporate-employee/menu'),
    bookings: (params) => req(`/api/corporate-employee/bookings${qs(params)}`),
    book: (body) => req('/api/corporate-employee/book', { method: 'POST', body }),
    cancel: (id) => req(`/api/corporate-employee/book/${id}`, { method: 'DELETE' }),
    wallet: () => req('/api/corporate-employee/wallet'),
  },
};

export default corporateApi;
