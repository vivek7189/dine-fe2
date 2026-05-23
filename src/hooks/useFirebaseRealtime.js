'use client';

import { useEffect, useRef } from 'react';
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../firebase';

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
    if (!restaurantId || !database || !enabled) return;

    const eventsRef = ref(database, `events/${restaurantId}/${category}`);
    // Only listen for events created from now onwards (skip historical)
    const eventsQuery = query(eventsRef, orderByChild('ts'), startAt(Date.now()));

    const handleChildAdded = (snapshot) => {
      const data = snapshot.val();
      if (data) {
        onEventRef.current(data);
      }
    };

    onChildAdded(eventsQuery, handleChildAdded);

    return () => {
      off(eventsQuery, 'child_added', handleChildAdded);
    };
  }, [restaurantId, category, enabled]);
}
