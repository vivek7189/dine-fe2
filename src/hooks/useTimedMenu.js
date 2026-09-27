'use client';

// Menu items as the POS should show them right now: items outside their timings (item or category)
// are marked unavailable with the hours (see lib/menuSchedule.applyMenuTimings). Re-checked every
// 30 s so an item opens/closes on screen without a reload. The backend enforces the same rule.
import { useEffect, useMemo, useState } from 'react';
import apiClient from '../lib/api';
import { applyMenuTimings, hasAnyTimings } from '../lib/menuSchedule';

export default function useTimedMenu(items, restaurant) {
  const rid = restaurant?.id || restaurant?._id || (typeof restaurant === 'string' ? restaurant : null);
  const tz = (restaurant && typeof restaurant === 'object' && restaurant.posSettings?.timezone) || undefined;
  const [categories, setCategories] = useState(null);
  const [tick, setTick] = useState(0);

  // Clock only when this menu actually uses timings (no extra re-renders for everyone else).
  const timed = hasAnyTimings(items, categories);
  useEffect(() => {
    if (!timed) return undefined;
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, [timed]);

  useEffect(() => {
    if (!rid) return undefined;
    let alive = true;
    apiClient.getCategories(rid)
      .then(r => { if (alive) setCategories(Array.isArray(r) ? r : (r?.categories || [])); })
      .catch(() => {});
    return () => { alive = false; };
  }, [rid]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => applyMenuTimings(items, categories, tz), [items, categories, tz, tick]);
}
