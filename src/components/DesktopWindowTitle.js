'use client';

import { useEffect } from 'react';

// Desktop app only: puts the selected restaurant's name in the window title bar.
// No login or no restaurant -> '' -> the app shows its default 'DineOpen POS'.
function currentName() {
  try {
    if (!localStorage.getItem('authToken')) return '';
    const r = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
    return (r && typeof r.name === 'string') ? r.name.trim() : '';
  } catch {
    return '';
  }
}

export default function DesktopWindowTitle() {
  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.electronAPI : null;
    if (!api || typeof api.setWindowTitle !== 'function') return;
    let last = null;
    const sync = () => {
      const name = currentName();
      if (name === last) return;
      last = name;
      api.setWindowTitle(name).catch(() => {});
    };
    sync();
    // The restaurant is saved in many places, so also re-check every few seconds.
    const timer = setInterval(sync, 3000);
    window.addEventListener('restaurantChanged', sync);
    window.addEventListener('storage', sync);
    return () => {
      clearInterval(timer);
      window.removeEventListener('restaurantChanged', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return null;
}
