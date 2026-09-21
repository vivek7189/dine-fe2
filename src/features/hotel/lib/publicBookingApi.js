// Public direct-booking API — no auth token, plain fetch against the cloud
// backend (which hosts /api/public/hotel/*). Used only by the guest booking page.
import { getCloudApiBase } from '../../../lib/apiBase';

const base = () => getCloudApiBase().replace(/\/+$/, '');
const j = async (r) => {
  const d = await r.json().catch(() => ({}));
  if (!r.ok || d.success === false) throw new Error(d.error || `Request failed (${r.status})`);
  return d;
};

export const publicBookingApi = {
  info: (rid) => fetch(`${base()}/api/public/hotel/${rid}/info`).then(j),
  availability: (rid, checkIn, checkOut) =>
    fetch(`${base()}/api/public/hotel/${rid}/availability?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`).then(j),
  ratePlans: (rid, roomTypeId, checkIn, checkOut, promoCode) => {
    const q = new URLSearchParams({ roomTypeId, checkIn, checkOut });
    if (promoCode) q.set('promoCode', promoCode);
    return fetch(`${base()}/api/public/hotel/${rid}/rate-plans?${q.toString()}`).then(j);
  },
  book: (rid, body) =>
    fetch(`${base()}/api/public/hotel/${rid}/book`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }).then(j),
};
