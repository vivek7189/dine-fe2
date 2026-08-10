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
let socketUrl = null;          // the server URL the current socket was opened against
let joinedRestaurant = null;
// Highest event seq this client has seen. Passed back on (re)connect so the server can replay
// anything we missed while the socket was briefly down (Wi-Fi blip) — matching RTDB's replay.
let lastSeq = 0;
// category -> Set<handler>
const subscribers = new Map();

function ensureSocket(restaurantId) {
  const url = getLocalServerUrl();
  if (!url || !restaurantId) return null;

  // If the server URL changed (e.g. a LAN-IP → 127.0.0.1 loopback upgrade for offline
  // resilience), the old socket is pointed at a now-dead address and will never deliver
  // events. Tear it down so it re-opens against the current URL below. Subscribers are
  // kept (module-level map), so live subscriptions keep working after the reconnect.
  if (socket && socketUrl !== url) {
    try { socket.close(); } catch (_) {}
    socket = null; joinedRestaurant = null; socketUrl = null;
  }

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
  socketUrl = url;
  joinedRestaurant = restaurantId;

  socket.on('connect', () => {
    // On reconnect (lastSeq>0) ask the server to replay events we missed while the socket was
    // down; on the first connect (lastSeq==0) don't — we don't want the pre-existing buffer.
    try {
      socket.emit('join', { restaurantId: joinedRestaurant, sinceSeq: lastSeq > 0 ? lastSeq : undefined });
    } catch (_) {}
  });

  // Initialize our cursor to the server's current seq on the FIRST join so we never replay the
  // whole pre-existing buffer; live events afterwards advance it.
  socket.on('joined', (d) => {
    if (d && Number.isFinite(d.seq) && lastSeq === 0) lastSeq = d.seq;
  });

  // Single listener → fan out to the right category's subscribers.
  socket.on('event', (evt) => {
    if (!evt || !evt.category) return;
    if (Number.isFinite(evt.seq) && evt.seq > lastSeq) lastSeq = evt.seq;
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

/**
 * Force the LAN socket to re-establish against the CURRENT getLocalServerUrl().
 * Called after a server-URL change (e.g. LAN-IP → 127.0.0.1 loopback upgrade) so an
 * already-open socket that was pointed at the old address reconnects. Keeps existing
 * category subscribers, so live views keep updating without re-subscribing.
 */
export function reconnectLan() {
  const rid = joinedRestaurant;
  if (socket) { try { socket.close(); } catch (_) {} }
  socket = null; socketUrl = null; joinedRestaurant = null;
  if (rid) ensureSocket(rid); // re-open against the current URL + re-join the room
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
