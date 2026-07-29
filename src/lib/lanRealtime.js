'use client';

/**
 * LAN real-time client — the offline sibling of Firebase RTDB on the frontend.
 *
 * When this terminal is pointed at a local "server" machine (the one running
 * dine-backend + local Postgres on the LAN), it connects a single socket.io
 * connection to that server and receives the SAME live events (orders, tables,
 * KOT, billing, menu) that Firebase RTDB delivers when online — but over the
 * local network, with no internet.
 *
 * The backend (services/lanRealtime.js) emits `event` messages shaped exactly
 * like an RTDB event: { category, type, ...payload, ts }. We fan those out to
 * per-category subscribers so `useFirebaseRealtime` can consume them unchanged.
 *
 * Fully additive: if no local server is configured, nothing here runs and the
 * app uses Firebase RTDB exactly as before.
 */

import { io } from 'socket.io-client';
import { getLocalServerUrl } from './localServer';

let socket = null;
let joinedRestaurant = null;
// category -> Set<handler>
const subscribers = new Map();

function ensureSocket(restaurantId) {
  const url = getLocalServerUrl();
  if (!url || !restaurantId) return null;

  if (socket && joinedRestaurant === restaurantId) return socket;

  // Restaurant changed → rejoin room on the same socket.
  if (socket && joinedRestaurant !== restaurantId) {
    try { socket.emit('leave', joinedRestaurant); } catch (_) {}
    joinedRestaurant = restaurantId;
    try { socket.emit('join', { restaurantId }); } catch (_) {}
    return socket;
  }

  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 8000,
  });
  joinedRestaurant = restaurantId;

  socket.on('connect', () => {
    try { socket.emit('join', { restaurantId: joinedRestaurant }); } catch (_) {}
  });

  // Single listener → fan out to the right category's subscribers.
  socket.on('event', (evt) => {
    if (!evt || !evt.category) return;
    const set = subscribers.get(evt.category);
    if (!set || set.size === 0) return;
    // Deliver the RTDB-compatible payload: { type, ...payload, ts } (category kept too).
    set.forEach((fn) => { try { fn(evt); } catch (_) {} });
  });

  return socket;
}

/**
 * Subscribe to a category of LAN events for a restaurant.
 * @returns {function} unsubscribe
 */
export function subscribeLan(restaurantId, category, handler) {
  const s = ensureSocket(restaurantId);
  if (!s) return () => {};
  if (!subscribers.has(category)) subscribers.set(category, new Set());
  subscribers.get(category).add(handler);
  return () => {
    const set = subscribers.get(category);
    if (set) set.delete(handler);
  };
}

/** True when a local server is configured (offline LAN mode). */
export function isLanRealtimeActive() {
  return !!getLocalServerUrl();
}

/** Tear down the socket (e.g. when switching back to cloud). */
export function closeLanRealtime() {
  if (socket) {
    try { socket.close(); } catch (_) {}
  }
  socket = null;
  joinedRestaurant = null;
  subscribers.clear();
}
