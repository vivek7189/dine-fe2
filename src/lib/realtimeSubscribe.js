'use client';

// Shared real-time subscription that works BOTH online (Firebase RTDB) and offline
// (LAN socket.io, when the terminal is pointed at an on-prem local server). Same event
// payload shape either way — { type, ...payload, ts } — so callers pass one data-level
// handler and don't care about the transport. Mirrors the guard in useFirebaseRealtime.
//
// Use this instead of subscribing to `ref(database, 'events/...')` directly, so live
// KOT / order / table updates and auto-print keep working with no internet.

import { ref, get, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
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
  let activeQuery = null;
  let cancelled = false;
  let serverOffset = 0;
  const handler = (snapshot) => {
    const data = snapshot.val();
    if (data) onData({ ...data, _serverNow: Date.now() + serverOffset });
  };

  // RTDB event timestamps are written by the backend. Starting a query at the Windows machine's
  // Date.now() silently loses every live event when that clock runs ahead. Resolve Firebase's
  // server offset first and include a small overlap; downstream KOT dedup makes the overlap safe.
  // The async setup is cancellation-safe so navigating/unmounting cannot leave a listener behind.
  (async () => {
    if (sinceNow) {
      try {
        const offsetSnap = await Promise.race([
          get(ref(database, '.info/serverTimeOffset')),
          new Promise((_, reject) => setTimeout(() => reject(new Error('server-time timeout')), 2000)),
        ]);
        const value = Number(offsetSnap.val());
        if (Number.isFinite(value)) serverOffset = value;
      } catch (_) { /* use local time; HTTPS event polling remains the independent fallback */ }
    }
    if (cancelled) return;
    const startTs = Date.now() + serverOffset - 5000;
    activeQuery = sinceNow ? query(base, orderByChild('ts'), startAt(startTs)) : base;
    onChildAdded(activeQuery, handler, (err) => { if (onError) onError(err); });
  })();

  return () => {
    cancelled = true;
    if (activeQuery) off(activeQuery, 'child_added', handler);
  };
}
