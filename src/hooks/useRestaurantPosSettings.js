'use client';

// The restaurant's posSettings (payment methods etc.): the saved copy at once, then fresh from the server.
import { useEffect, useState } from 'react';
import apiClient from '../lib/api';

function savedPosSettings(restaurantId) {
  try {
    const r = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}') || {};
    if (!restaurantId || !r.id || r.id === restaurantId) return r.posSettings || {};
  } catch (e) { /* no saved restaurant */ }
  return {};
}

export default function useRestaurantPosSettings(restaurantId) {
  const [posSettings, setPosSettings] = useState({});
  useEffect(() => {
    let alive = true;
    setPosSettings(savedPosSettings(restaurantId));
    if (!restaurantId) return undefined;
    apiClient.getRestaurant(restaurantId).then((res) => {
      const r = (res && (res.restaurant || res.data)) || res || {};
      if (alive && r && r.posSettings) setPosSettings(r.posSettings);
    }).catch(() => { /* keep the saved copy */ });
    return () => { alive = false; };
  }, [restaurantId]);
  return posSettings;
}
