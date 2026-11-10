// The Razorpay checkout this phone started on a restaurant's QR / online page, until its order is
// placed. If the page is lost while the guest pays in their UPI app (iPhone Safari unloads it), the
// page asks the server on its next load / when shown again (POST /api/public/razorpay/recover) and
// the paid order is placed then. The server also checks by itself (backend utils/qrPayRescue).
const KEY = (restaurantId) => `dineRzpPending:${restaurantId}`;
const MAX_AGE_MS = 24 * 3600 * 1000;

export function readPendingRzp(restaurantId) {
  try {
    const v = JSON.parse(localStorage.getItem(KEY(restaurantId)) || 'null');
    if (!v || typeof v.razorpayOrderId !== 'string' || !v.at || Date.now() - v.at > MAX_AGE_MS) return null;
    return v;
  } catch {
    return null;
  }
}

export function writePendingRzp(restaurantId, razorpayOrderId) {
  try { localStorage.setItem(KEY(restaurantId), JSON.stringify({ razorpayOrderId, at: Date.now() })); } catch { /* private mode */ }
}

export function clearPendingRzp(restaurantId) {
  try { localStorage.removeItem(KEY(restaurantId)); } catch { /* private mode */ }
}
