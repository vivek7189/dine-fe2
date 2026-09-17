'use client';
// ─────────────────────────────────────────────────────────────────────────────
// socketRealtimeClient.js — client for the self-hosted socket.io realtime bus (the zero-cost,
// per-restaurant alternative to Firebase RTDB). ONE shared socket per restaurant is multiplexed
// across every category subscription (orders/kot/billing/…), ref-counted so it disconnects when
// nothing is listening. Events are dispatched to handlers by payload.category — same payload shape
// the RTDB path delivers, so callers are unchanged.
//
// Which transport a restaurant uses is decided by the backend (`GET /api/realtime/config/:rid` →
// {transport:'socket'|'rtdb'}). Default is 'rtdb', so nothing here runs unless the backend has
// opted a restaurant into socket. On reconnect we replay missed events via `since` (print parity).
// ─────────────────────────────────────────────────────────────────────────────
import { io } from 'socket.io-client';
import { getCloudApiBase } from './apiBase';

const clients = new Map();          // restaurantId -> { socket, handlers: Map(category -> Set), lastTs }
const transportCache = new Map();   // restaurantId -> { transport, at }

// Ask the backend which realtime channel this restaurant uses (cached 60s).
export async function getRealtimeTransport(restaurantId) {
  if (!restaurantId) return 'rtdb';
  const c = transportCache.get(restaurantId);
  if (c && Date.now() - c.at < 60000) return c.transport;
  try {
    const res = await fetch(`${getCloudApiBase()}/api/realtime/config/${restaurantId}`);
    const j = await res.json();
    const t = j && j.transport === 'socket' ? 'socket' : 'rtdb';
    transportCache.set(restaurantId, { transport: t, at: Date.now() });
    return t;
  } catch (_) {
    return 'rtdb'; // fail safe → stay on RTDB
  }
}

function getClient(restaurantId) {
  let c = clients.get(restaurantId);
  if (c) return c;

  c = { socket: null, handlers: new Map(), lastTs: 0 };
  const getToken = () => { try { return localStorage.getItem('authToken') || ''; } catch (_) { return ''; } };

  const socket = io(getCloudApiBase(), {
    path: '/rt.io',
    transports: ['websocket'],
    // auth is a FUNCTION → re-evaluated on every (re)connect, so `since` carries the last-seen ts
    // for gap-free replay after a network blip (missed-print recovery).
    auth: (cb) => cb({ token: getToken(), restaurantId, since: c.lastTs || 0 }),
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  });

  socket.on('event', (payload) => {
    if (!payload) return;
    if (payload.ts && payload.ts > c.lastTs) c.lastTs = payload.ts;
    const set = c.handlers.get(payload.category);
    if (set) set.forEach((fn) => { try { fn(payload); } catch (_) {} });
  });

  c.socket = socket;
  clients.set(restaurantId, c);
  return c;
}

// Subscribe a (category, handler). Returns an unsubscribe fn. Shares one socket per restaurant.
export function subscribeSocket(restaurantId, category, onEvent) {
  const c = getClient(restaurantId);
  if (!c.handlers.has(category)) c.handlers.set(category, new Set());
  c.handlers.get(category).add(onEvent);

  return () => {
    const set = c.handlers.get(category);
    if (set) { set.delete(onEvent); if (set.size === 0) c.handlers.delete(category); }
    if (c.handlers.size === 0) {
      try { c.socket.close(); } catch (_) {}
      clients.delete(restaurantId);
    }
  };
}
