// POS "Scan to pay" screen after a bill is completed (Customer App → Show UPI → "On POS after the bill",
// customerAppSettings.upiView.posAfterBill, backend utils/qrUpiView.js). Off unless set. TSMC 27 Nov.
// View only: the bill is already completed — the screen shows the restaurant's UPI QR + ID to turn
// towards the guest, and staff close it. It mounts on its own (not inside the order panel), so the
// panel resetting for the next order doesn't close it.
import { createElement as h } from 'react';
import { createRoot } from 'react-dom/client';

const POS = ['upi', 'all'];
const UPI_ID = /^[\w.-]{1,}@[a-zA-Z][\w.-]{1,}$/;

// The restaurant's setting → what to show after a bill paid by `paymentMethod`, or null.
export function posUpiFor(upiView, paymentMethod) {
  const u = upiView && typeof upiView === 'object' ? upiView : null;
  if (!u || !POS.includes(u.posAfterBill)) return null;
  const upiId = UPI_ID.test(String(u.upiId || '').trim()) ? String(u.upiId).trim() : '';
  const qrUrl = /^https:\/\/\S+$/i.test(String(u.qrUrl || '')) ? u.qrUrl : '';
  if (!upiId && !qrUrl) return null;
  if (u.posAfterBill === 'upi' && String(paymentMethod || '').toLowerCase() !== 'upi') return null;
  return { upiId, qrUrl, name: String(u.name || '').slice(0, 60) };
}

let current = null; // { root, el }
function close() {
  if (!current) return;
  const { root, el } = current;
  current = null;
  try { root.unmount(); } catch (_) { /* gone */ }
  try { el.remove(); } catch (_) { /* gone */ }
}

function Screen({ upi, amountText }) {
  return h('div', {
    'data-testid': 'pos-upi-after-bill',
    style: { position: 'fixed', inset: 0, zIndex: 200000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  },
  h('div', { style: { background: '#fff', borderRadius: 18, width: '100%', maxWidth: 400, padding: '20px 20px 16px', textAlign: 'center', boxShadow: '0 16px 40px rgba(0,0,0,0.3)', color: '#111827' } },
    h('div', { style: { fontSize: 13, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5 } }, 'Bill completed'),
    h('div', { style: { fontSize: 22, fontWeight: 800, marginTop: 4 } }, amountText ? `Scan to pay ${amountText}` : 'Scan to pay'),
    upi.name ? h('div', { style: { fontSize: 14, color: '#6b7280', marginTop: 2 } }, upi.name) : null,
    upi.qrUrl ? h('img', { src: upi.qrUrl, alt: 'UPI QR code', style: { display: 'block', width: '100%', maxWidth: 300, height: 'auto', margin: '14px auto 0', borderRadius: 10 } }) : null,
    upi.upiId ? h('div', { style: { marginTop: 12, fontSize: 13, color: '#6b7280' } }, 'UPI ID: ',
      h('span', { 'data-testid': 'pos-upi-id', style: { fontSize: 16, fontWeight: 700, color: '#111827', wordBreak: 'break-all' } }, upi.upiId)) : null,
    h('button', {
      type: 'button', 'data-testid': 'pos-upi-close', onClick: close, autoFocus: true,
      style: { marginTop: 16, width: '100%', padding: '12px', border: 'none', borderRadius: 12, background: '#111827', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' },
    }, 'Close'),
  ));
}

// Show the screen (replaces one still open). Never throws — it must not disturb billing.
export function showPosUpiAfterBill(upi, amountText) {
  try {
    if (!upi || typeof document === 'undefined') return;
    close();
    const el = document.createElement('div');
    document.body.appendChild(el);
    const root = createRoot(el);
    current = { root, el };
    root.render(h(Screen, { upi, amountText }));
  } catch (e) {
    console.warn('UPI after-bill screen (non-blocking):', e);
  }
}
