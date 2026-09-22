'use client';
// Hotel theme system — two switchable palettes (the token CSS lives in
// globals.css under the "Hotel PMS theme tokens" block).
//   • "cardamom"  — the warm editorial look (cream canvas, brass, serif)
//   • "dineopen"  — matches the main DineOpen app (slate canvas, red #ef4444, Inter)
// Every hotel component styles through var(--h-*), so switching the palette on
// <html data-hotel-theme> restyles the whole PMS (including portalled modals).
import { useState, useEffect, useCallback } from 'react';

const KEY = 'dineopen.hotel.theme';
const IDS = ['cardamom', 'dineopen'];
const DEFAULT = 'cardamom';
export const THEMES = [
  { id: 'cardamom', label: 'Cardamom' },
  { id: 'dineopen', label: 'DineOpen' },
];

const applyTheme = (t) => { if (typeof document !== 'undefined') document.documentElement.setAttribute('data-hotel-theme', t); };

export function useHotelTheme() {
  const [theme, setThemeState] = useState(DEFAULT);
  useEffect(() => {
    let t = DEFAULT;
    try { const s = localStorage.getItem(KEY); if (IDS.includes(s)) t = s; } catch { /* noop */ }
    setThemeState(t); applyTheme(t);
  }, []);
  const setTheme = useCallback((t) => {
    if (!IDS.includes(t)) return;
    setThemeState(t); applyTheme(t);
    try { localStorage.setItem(KEY, t); } catch { /* noop */ }
  }, []);
  return [theme, setTheme];
}
