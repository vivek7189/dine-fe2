// ─────────────────────────────────────────────────────────────────────────────
// Hotel PMS — web API client.
//
// Thin wrapper over the shared apiClient (reuses auth token, base-URL resolution,
// retry + offline handling). Every call targets the isolated /api/hotel/pms/*
// namespace on the GCP/Postgres backend and carries the active property id
// (restaurantId) that hotelScope authorizes on the server.
//
// This whole feature lives under src/features/hotel/ and is removable by deleting
// the folder + its route pages + the one Sidebar entry.
// ─────────────────────────────────────────────────────────────────────────────
import apiClient from '../../../lib/api';

const BASE = '/api/hotel/pms';

const qs = (obj) => {
  const parts = Object.entries(obj || {})
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

// restaurantId is required by every endpoint (property scope). Fold it into the
// query string (GET/DELETE) or the JSON body (POST/PATCH).
const req = (endpoint, opts = {}) => apiClient.request(endpoint, opts);
const withRid = (obj, rid) => ({ ...(obj || {}), restaurantId: rid });

const hotelApi = {
  // ── Room types ──
  listRoomTypes: (rid, params) => req(`${BASE}/room-types${qs(withRid(params, rid))}`),
  createRoomType: (rid, body) => req(`${BASE}/room-types`, { method: 'POST', body: withRid(body, rid) }),
  updateRoomType: (rid, id, body) => req(`${BASE}/room-types/${id}`, { method: 'PATCH', body: withRid(body, rid) }),
  deleteRoomType: (rid, id) => req(`${BASE}/room-types/${id}${qs({ restaurantId: rid })}`, { method: 'DELETE' }),

  // ── Rooms ──
  listRooms: (rid, params) => req(`${BASE}/rooms${qs(withRid(params, rid))}`),
  getRoom: (rid, id) => req(`${BASE}/rooms/${id}${qs({ restaurantId: rid })}`),
  createRoom: (rid, body) => req(`${BASE}/rooms`, { method: 'POST', body: withRid(body, rid) }),
  updateRoom: (rid, id, body) => req(`${BASE}/rooms/${id}`, { method: 'PATCH', body: withRid(body, rid) }),
  setRoomStatus: (rid, id, status) => req(`${BASE}/rooms/${id}/status`, { method: 'PATCH', body: withRid({ status }, rid) }),
  setRoomHousekeeping: (rid, id, housekeepingStatus) =>
    req(`${BASE}/rooms/${id}/housekeeping`, { method: 'PATCH', body: withRid({ housekeepingStatus }, rid) }),
  deleteRoom: (rid, id) => req(`${BASE}/rooms/${id}${qs({ restaurantId: rid })}`, { method: 'DELETE' }),

  // ── Reservations ──
  availability: (rid, checkIn, checkOut, params) =>
    req(`${BASE}/reservations/availability${qs({ ...params, restaurantId: rid, checkIn, checkOut })}`),
  listReservations: (rid, params) => req(`${BASE}/reservations${qs(withRid(params, rid))}`),
  getReservation: (rid, id) => req(`${BASE}/reservations/${id}${qs({ restaurantId: rid })}`),
  createReservation: (rid, body) => req(`${BASE}/reservations`, { method: 'POST', body: withRid(body, rid) }),
  updateReservation: (rid, id, body) => req(`${BASE}/reservations/${id}`, { method: 'PATCH', body: withRid(body, rid) }),
  assignRoom: (rid, id, roomId) => req(`${BASE}/reservations/${id}/assign`, { method: 'PATCH', body: withRid({ roomId }, rid) }),
  checkIn: (rid, id) => req(`${BASE}/reservations/${id}/check-in`, { method: 'POST', body: withRid({}, rid) }),
  checkOut: (rid, id) => req(`${BASE}/reservations/${id}/check-out`, { method: 'POST', body: withRid({}, rid) }),
  cancelReservation: (rid, id, reason) => req(`${BASE}/reservations/${id}/cancel`, { method: 'POST', body: withRid({ reason }, rid) }),

  // ── Folio / charge-to-room ──
  folioByReservation: (rid, reservationId) => req(`${BASE}/folios/by-reservation/${reservationId}${qs({ restaurantId: rid })}`),
  folioByRoom: (rid, roomId) => req(`${BASE}/folios/by-room/${roomId}${qs({ restaurantId: rid })}`),
  getFolio: (rid, id) => req(`${BASE}/folios/${id}${qs({ restaurantId: rid })}`),
  postCharge: (rid, folioId, body) => req(`${BASE}/folios/${folioId}/charges`, { method: 'POST', body: withRid(body, rid) }),
  postToRoom: (rid, body) => req(`${BASE}/folios/post-to-room`, { method: 'POST', body: withRid(body, rid) }),
  voidCharge: (rid, folioId, itemId) => req(`${BASE}/folios/${folioId}/charges/${itemId}${qs({ restaurantId: rid })}`, { method: 'DELETE' }),
  addPayment: (rid, folioId, body) => req(`${BASE}/folios/${folioId}/payments`, { method: 'POST', body: withRid(body, rid) }),
  settleFolio: (rid, folioId, force) => req(`${BASE}/folios/${folioId}/settle`, { method: 'POST', body: withRid({ force }, rid) }),
};

// ── Reports ──
hotelApi.reportSummary = (rid, params) => req(`${BASE}/reports/summary${qs(withRid(params, rid))}`);

// ── Tax ──
hotelApi.getTax = (rid) => req(`${BASE}/tax${qs({ restaurantId: rid })}`);
hotelApi.saveTax = (rid, body) => req(`${BASE}/tax`, { method: 'PUT', body: withRid(body, rid) });

// ── Chain (multi-property; owner-scoped, no restaurantId needed) ──
hotelApi.chainProperties = () => req(`${BASE}/chain/properties`);
hotelApi.chainSummary = (params) => req(`${BASE}/chain/summary${qs(params)}`);

// ── Rate calendar ──
hotelApi.getRates = (rid, from, to) => req(`${BASE}/rates${qs({ restaurantId: rid, from, to })}`);
hotelApi.setRate = (rid, body) => req(`${BASE}/rates`, { method: 'PUT', body: withRid(body, rid) });
hotelApi.bulkRate = (rid, body) => req(`${BASE}/rates/bulk`, { method: 'PUT', body: withRid(body, rid) });

// ── Rate plans & packages (BAR / CP / corporate / promo) ──
hotelApi.listRatePlans = (rid, all) => req(`${BASE}/rate-plans${qs({ restaurantId: rid, all: all ? 1 : undefined })}`);
hotelApi.createRatePlan = (rid, body) => req(`${BASE}/rate-plans`, { method: 'POST', body: withRid(body, rid) });
hotelApi.updateRatePlan = (rid, id, body) => req(`${BASE}/rate-plans/${id}`, { method: 'PATCH', body: withRid(body, rid) });
hotelApi.deleteRatePlan = (rid, id) => req(`${BASE}/rate-plans/${id}${qs({ restaurantId: rid })}`, { method: 'DELETE' });
hotelApi.seedRatePlans = (rid) => req(`${BASE}/rate-plans/seed-defaults`, { method: 'POST', body: withRid({}, rid) });
hotelApi.quoteRatePlans = (rid, roomTypeId, checkIn, checkOut, promoCode) =>
  req(`${BASE}/rate-plans/quote${qs({ restaurantId: rid, roomTypeId, checkIn, checkOut, promoCode })}`);

// ── Night audit (end-of-day) ──
hotelApi.nightAuditStatus = (rid) => req(`${BASE}/night-audit/status${qs({ restaurantId: rid })}`);
hotelApi.nightAuditHistory = (rid, limit) => req(`${BASE}/night-audit/history${qs({ restaurantId: rid, limit })}`);
hotelApi.runNightAudit = (rid, notes) => req(`${BASE}/night-audit/run`, { method: 'POST', body: withRid({ notes }, rid) });

// ── Group / block bookings ──
hotelApi.listGroups = (rid, status) => req(`${BASE}/groups${qs({ restaurantId: rid, status })}`);
hotelApi.getGroup = (rid, id) => req(`${BASE}/groups/${id}${qs({ restaurantId: rid })}`);
hotelApi.groupRoomingList = (rid, id) => req(`${BASE}/groups/${id}/rooming-list${qs({ restaurantId: rid })}`);
hotelApi.createGroup = (rid, body) => req(`${BASE}/groups`, { method: 'POST', body: withRid(body, rid) });
hotelApi.updateGroup = (rid, id, body) => req(`${BASE}/groups/${id}`, { method: 'PATCH', body: withRid(body, rid) });
hotelApi.bookIntoGroup = (rid, id, body) => req(`${BASE}/groups/${id}/book`, { method: 'POST', body: withRid(body, rid) });
hotelApi.releaseGroup = (rid, id) => req(`${BASE}/groups/${id}/release`, { method: 'POST', body: withRid({}, rid) });
hotelApi.deleteGroup = (rid, id) => req(`${BASE}/groups/${id}${qs({ restaurantId: rid })}`, { method: 'DELETE' });

// ── Services catalog ──
hotelApi.listServices = (rid) => req(`${BASE}/services${qs({ restaurantId: rid })}`);
hotelApi.createService = (rid, body) => req(`${BASE}/services`, { method: 'POST', body: withRid(body, rid) });
hotelApi.updateService = (rid, id, body) => req(`${BASE}/services/${id}`, { method: 'PATCH', body: withRid(body, rid) });
hotelApi.deleteService = (rid, id) => req(`${BASE}/services/${id}${qs({ restaurantId: rid })}`, { method: 'DELETE' });

// ── Guests / CRM (shared customers) ──
hotelApi.listGuests = (rid, search) => req(`${BASE}/guests${qs({ restaurantId: rid, search })}`);
hotelApi.getGuest = (rid, id) => req(`${BASE}/guests/${id}${qs({ restaurantId: rid })}`);
hotelApi.updateGuest = (rid, id, body) => req(`${BASE}/guests/${id}`, { method: 'PATCH', body: withRid(body, rid) });

// ── Staff & area assignments ──
hotelApi.listStaff = (rid, params) => req(`${BASE}/staff${qs(withRid(params, rid))}`);
hotelApi.createStaff = (rid, body) => req(`${BASE}/staff`, { method: 'POST', body: withRid(body, rid) });
hotelApi.updateStaff = (rid, id, body) => req(`${BASE}/staff/${id}`, { method: 'PATCH', body: withRid(body, rid) });
hotelApi.deleteStaff = (rid, id) => req(`${BASE}/staff/${id}${qs({ restaurantId: rid })}`, { method: 'DELETE' });

// ── OTA channels ──
hotelApi.getChannels = (rid) => req(`${BASE}/channels${qs({ restaurantId: rid })}`);
hotelApi.connectChannel = (rid, code) => req(`${BASE}/channels/connect`, { method: 'POST', body: withRid({ code }, rid) });
hotelApi.disconnectChannel = (rid, id) => req(`${BASE}/channels/${id}/disconnect`, { method: 'POST', body: withRid({}, rid) });
hotelApi.pushChannel = (rid, id, from, to) => req(`${BASE}/channels/${id}/push`, { method: 'POST', body: withRid({ from, to }, rid) });
hotelApi.channelLogs = (rid, id) => req(`${BASE}/channels/${id}/logs${qs({ restaurantId: rid })}`);

export const FOLIO_ITEM_TYPES = ['room', 'food', 'beverage', 'service', 'tax', 'discount', 'misc'];
export const PAY_METHODS = ['cash', 'card', 'upi', 'bank', 'other'];

// Server-side allowed values (kept in sync with hotel/repos/roomsRepo.js).
export const SELL_STATUS = ['available', 'occupied', 'reserved', 'blocked', 'out-of-service'];
export const HK_STATUS = ['clean', 'dirty', 'inspected', 'out-of-order'];

export default hotelApi;
