'use client';

import { useEffect, useRef } from 'react';
import apiClient from '../lib/api';
import { getCachedDashboardData, setCachedDashboardData } from '../utils/dashboardCache';

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes — match dashboardCache.js
const IDLE_DELAY = 2000; // Wait 2s after mount before prefetching

/**
 * useIdlePrefetch — prefetches dashboard data when browser is idle.
 *
 * - Waits 2 seconds after mount
 * - Uses requestIdleCallback (setTimeout fallback for Safari)
 * - Only fetches if cache is missing or stale (>5 min)
 * - Skips if already on /dashboard (it loads its own data)
 * - Properly cleans up all timers/callbacks on unmount (no memory leaks)
 *
 * @param {string} currentPath — current page pathname (to skip on /dashboard)
 */
export function useIdlePrefetch(currentPath) {
  const cleanupRef = useRef(null);

  useEffect(() => {
    // Skip if we're already on the dashboard — it handles its own data loading
    if (currentPath === '/dashboard' || currentPath === '/dashboard/bar') {
      return;
    }

    // Skip if no auth token (not logged in)
    const token = localStorage.getItem('authToken');
    if (!token) return;

    // Check if cache is already fresh — no need to prefetch
    const restaurantId = localStorage.getItem('selectedRestaurantId');
    if (restaurantId) {
      const cached = getCachedDashboardData(restaurantId);
      if (cached && !cached.isStale) {
        return; // Cache is still valid, skip
      }
    }

    let delayTimer = null;
    let idleHandle = null;
    let aborted = false;

    // The actual prefetch work
    const doPrefetch = async () => {
      if (aborted) return;

      try {
        // Re-check restaurant ID (may have changed)
        const rid = localStorage.getItem('selectedRestaurantId');
        let targetRestaurantId = rid;

        // If no saved restaurant, we need to fetch restaurants first
        if (!targetRestaurantId) {
          const res = await apiClient.getRestaurants();
          if (aborted) return;
          const list = res.restaurants || [];
          if (list.length === 0) return;

          const userData = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
          let restaurant = null;
          if (userData?.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(userData.role)) {
            restaurant = list.find(r => r.id === userData.restaurantId);
          } else {
            const defaultId = res.defaultRestaurantId;
            restaurant = (defaultId ? list.find(r => r.id === defaultId) : null) || list[0];
          }
          if (!restaurant) return;
          targetRestaurantId = restaurant.id;
        }

        // Double-check cache freshness (another tab may have updated it)
        const freshCheck = getCachedDashboardData(targetRestaurantId);
        if (freshCheck && !freshCheck.isStale) return;
        if (aborted) return;

        console.log('🔄 Idle prefetch: fetching dashboard data for', targetRestaurantId);

        const [menuResponse, floorsResponse] = await Promise.all([
          apiClient.getMenu(targetRestaurantId).catch(() => ({ menuItems: [] })),
          apiClient.getFloors(targetRestaurantId).catch(() => ({ floors: [] }))
        ]);

        if (aborted) return;

        const menuItems = menuResponse.menuItems || [];
        const floors = floorsResponse.floors || floorsResponse || [];

        setCachedDashboardData(targetRestaurantId, {
          menuItems,
          floors,
          tablesData: { floors, tables: [] }
        });

        console.log('✅ Idle prefetch: dashboard data cached');
      } catch (err) {
        // Silent failure — prefetch is non-critical
        if (!aborted) {
          console.warn('⚠️ Idle prefetch failed (non-critical):', err.message);
        }
      }
    };

    // Schedule: wait 2s → then requestIdleCallback → then fetch
    delayTimer = setTimeout(() => {
      if (aborted) return;

      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(() => {
          if (!aborted) doPrefetch();
        }, { timeout: 5000 }); // Max wait 5s for idle
      } else {
        // Safari fallback — use another setTimeout
        delayTimer = setTimeout(() => {
          if (!aborted) doPrefetch();
        }, 500);
      }
    }, IDLE_DELAY);

    // Cleanup function — prevents memory leaks
    cleanupRef.current = () => {
      aborted = true;
      if (delayTimer) clearTimeout(delayTimer);
      if (idleHandle && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle);
      }
    };

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [currentPath]);
}
