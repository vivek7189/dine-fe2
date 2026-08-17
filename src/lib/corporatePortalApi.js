// Corporate CLIENT portal API (Phase 5). Separate audience from the operator/employee apps:
// authenticated by a per-client portal token (NOT the restaurant JWT), sent as x-portal-token.
// Reuses apiClient only for its resolved base URL.
import apiClient from './api';

const qs = (obj) => {
  const p = Object.entries(obj || {}).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  return p.length ? `?${p.join('&')}` : '';
};

async function preq(endpoint, token) {
  if (!token) throw new Error('Missing portal token');
  const res = await fetch(`${apiClient.baseURL}${endpoint}`, { headers: { 'x-portal-token': token } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const corporatePortalApi = {
  me: (token) => preq('/api/corporate-portal/me', token),
  consumption: (token, params) => preq(`/api/corporate-portal/consumption${qs(params)}`, token),
  invoices: (token) => preq('/api/corporate-portal/invoices', token),
  invoice: (token, id) => preq(`/api/corporate-portal/invoices/${id}`, token),

  // PDF download (binary) — authenticate with the token header, save the blob.
  async downloadPdf(token, id, filename) {
    const res = await fetch(`${apiClient.baseURL}/api/corporate-portal/invoices/${id}/pdf`, { headers: { 'x-portal-token': token } });
    if (!res.ok) { let msg = 'Download failed'; try { msg = (await res.json()).error || msg; } catch { /* non-json */ } throw new Error(msg); }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename || `invoice_${id}.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },
};

export default corporatePortalApi;
