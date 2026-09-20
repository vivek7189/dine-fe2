'use client';
// Shared boot: resolve the active property + a lightweight banner notifier.
import { useState, useEffect, useCallback } from 'react';
import { resolveActivePropertyId } from './property';

export function useHotelProperty() {
  const [restaurantId, setRestaurantId] = useState(null);
  const [booting, setBooting] = useState(true);
  const [banner, setBanner] = useState(null); // { tone, msg }

  useEffect(() => {
    let off = false;
    (async () => {
      const rid = await resolveActivePropertyId();
      if (!off) { setRestaurantId(rid); setBooting(false); }
    })();
    return () => { off = true; };
  }, []);

  const notify = useCallback((tone, msg) => {
    setBanner({ tone, msg });
    if (tone === 'success') setTimeout(() => setBanner((b) => (b && b.msg === msg ? null : b)), 3000);
  }, []);

  return { restaurantId, booting, banner, setBanner, notify };
}
