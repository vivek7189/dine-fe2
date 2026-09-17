'use client';

import { useEffect, useRef } from 'react';
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../firebase';
import { isLocalServerMode } from '../lib/localServer';
import { subscribeLan } from '../lib/lanRealtime';
import { getRealtimeTransport, subscribeSocket } from '../lib/socketRealtimeClient';

/**
 * Hook to subscribe to Firebase Realtime Database events for a restaurant.
 *
 * @param {string} restaurantId  — restaurant to listen for
 * @param {string} category      — 'orders' | 'tables' | 'menu' | 'kot' | 'billing' | 'retail'
 * @param {function} onEvent     — callback receiving { type, ...payload, ts }
 * @param {boolean} enabled      — set false to skip subscription (default true)
 */
export function useFirebaseRealtime(restaurantId, category, onEvent, enabled = true) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!restaurantId || !enabled) return;

    // ── Local-server (offline LAN) mode: receive events over socket.io instead of
    // Firebase RTDB. Same payload shape, so the caller's handler is unchanged. ──
    if (isLocalServerMode()) {
      const unsub = subscribeLan(restaurantId, category, (data) => {
        if (data) onEventRef.current(data);
      });
      return unsub;
    }

    // ── Cloud realtime — the backend decides the transport per restaurant ──
    //   'socket' → our self-hosted socket.io bus (zero-cost, on the VM); 'rtdb' (DEFAULT) → Firebase RTDB.
    // The choice is async (a tiny cached config fetch), so we run it inside the effect with a cancel
    // guard. RTDB remains the default — nothing changes unless the backend opted this restaurant in.
    let cleanup = null;
    let cancelled = false;

    (async () => {
      let transport = 'rtdb';
      try { transport = await getRealtimeTransport(restaurantId); } catch (_) {}
      if (cancelled) return;

      if (transport === 'socket') {
        cleanup = subscribeSocket(restaurantId, category, (data) => {
          if (data) onEventRef.current(data);
        });
        return;
      }

      // ── Firebase RTDB (default) ──
      if (!database) return;
      const eventsRef = ref(database, `events/${restaurantId}/${category}`);
      // Only listen for events created from now onwards (skip historical)
      const eventsQuery = query(eventsRef, orderByChild('ts'), startAt(Date.now()));
      const handleChildAdded = (snapshot) => {
        const data = snapshot.val();
        if (data) onEventRef.current(data);
      };
      onChildAdded(eventsQuery, handleChildAdded);
      cleanup = () => off(eventsQuery, 'child_added', handleChildAdded);
    })();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [restaurantId, category, enabled]);
}
