'use client';

// Shared real-time subscription that works BOTH online (Firebase RTDB) and offline
// (LAN socket.io, when the terminal is pointed at an on-prem local server). Same event
// payload shape either way — { type, ...payload, ts } — so callers pass one data-level
// handler and don't care about the transport. Mirrors the guard in useFirebaseRealtime.
//
// Use this instead of subscribing to `ref(database, 'events/...')` directly, so live
// KOT / order / table updates and auto-print keep working with no internet.

import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../firebase';
import { isLocalServerMode } from './localServer';
import { subscribeLan } from './lanRealtime';

/**
 * @param {string} restaurantId
 * @param {string} category  — 'orders' | 'tables' | 'menu' | 'kot' | 'billing' | ...
 * @param {(data:object)=>void} onData  — receives the event payload
 * @param {{ sinceNow?: boolean, onError?: (e:Error)=>void }} [opts]
 * @returns {() => void} unsubscribe
 */
export function subscribeRestaurantEvents(restaurantId, category, onData, opts = {}) {
  const { sinceNow = true, onError } = opts;
  if (!restaurantId) return () => {};

  // Offline LAN mode: events arrive over the local-server socket.
  if (isLocalServerMode()) {
    const unsub = subscribeLan(restaurantId, category, (data) => { if (data) onData(data); });
    return typeof unsub === 'function' ? unsub : () => {};
  }

  // Cloud mode: Firebase RTDB.
  if (!database) return () => {};
  const base = ref(database, `events/${restaurantId}/${category}`);
  const q = sinceNow ? query(base, orderByChild('ts'), startAt(Date.now())) : base;
  const handler = (snapshot) => { const data = snapshot.val(); if (data) onData(data); };
  onChildAdded(q, handler, (err) => { if (onError) onError(err); });
  return () => { off(q, 'child_added', handler); };
}
