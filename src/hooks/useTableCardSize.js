'use client';

import { useEffect, useState } from 'react';

// Table card size on the tables grid: 'xs' | 'sm' | 'md' (default) | 'lg'. Saved per device
// and shared by the /tables page and the billing screen's tables view.
const KEY = 'dine_table_card_size';
const EVT = 'dine-table-card-size';
export const TABLE_CARD_SIZES = ['xs', 'sm', 'md', 'lg'];

const read = () => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === 'compact') return 'sm'; // value saved by the first 2-size switch
    return TABLE_CARD_SIZES.includes(v) ? v : 'md';
  } catch { return 'md'; }
};

export function useTableCardSize() {
  const [size, setSizeState] = useState('md');
  useEffect(() => {
    setSizeState(read());
    const sync = () => setSizeState(read());
    window.addEventListener(EVT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(EVT, sync); window.removeEventListener('storage', sync); };
  }, []);
  const setSize = (next) => {
    try { localStorage.setItem(KEY, next); } catch {}
    setSizeState(next);
    try { window.dispatchEvent(new Event(EVT)); } catch {}
  };
  return [size, setSize];
}

// Grid columns for each size (desktop/tablet; the mobile WebView keeps its own columns).
const MIN_WIDTH = { xs: 100, sm: 132, md: 160, lg: 210 };
export const tableGridColumns = (size) => `repeat(auto-fill, minmax(${MIN_WIDTH[size] || 160}px, 1fr))`;
export const tableGridGap = (size) => (size === 'xs' || size === 'sm') ? '10px' : '20px';

// Small S / M / L / XL switch.
export function TableCardSizeToggle({ size, onChange }) {
  const opts = [
    { k: 'xs', label: 'S', title: 'Smallest cards' },
    { k: 'sm', label: 'M', title: 'Compact cards' },
    { k: 'md', label: 'L', title: 'Normal cards' },
    { k: 'lg', label: 'XL', title: 'Big cards' },
  ];
  return (
    <div role="group" aria-label="Card size" title="Card size" style={{ display: 'flex', gap: '2px', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
      {opts.map(o => (
        <button key={o.k} type="button" onClick={() => onChange(o.k)} title={o.title} aria-label={o.title} aria-pressed={size === o.k} style={{
          minWidth: '28px', height: '26px', padding: '0 6px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          fontSize: '11px', fontWeight: 700,
          backgroundColor: size === o.k ? 'white' : 'transparent',
          color: size === o.k ? '#1f2937' : '#9ca3af',
          boxShadow: size === o.k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Tables screens hide the floating chatbot / voice buttons (see globals.css .dine-fab).
export function useHideFloatingButtons(active = true) {
  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;
    document.body.dataset.tablesScreen = '1';
    return () => { delete document.body.dataset.tablesScreen; };
  }, [active]);
}

// /tables "Focus" mode: left menu hidden (opens from ☰) and a thin top bar. Saved per device;
// the dashboard layout listens for the change event to drop the sidebar.
const FOCUS_KEY = 'dine_tables_focus';
export const TABLES_FOCUS_EVENT = 'dine-tables-focus';
export const readTablesFocus = () => { try { return localStorage.getItem(FOCUS_KEY) === '1'; } catch { return false; } };

export function useTablesFocus() {
  const [focus, setFocusState] = useState(false);
  useEffect(() => {
    setFocusState(readTablesFocus());
    const sync = () => setFocusState(readTablesFocus());
    window.addEventListener(TABLES_FOCUS_EVENT, sync);
    return () => window.removeEventListener(TABLES_FOCUS_EVENT, sync);
  }, []);
  const setFocus = (on) => {
    try { localStorage.setItem(FOCUS_KEY, on ? '1' : '0'); } catch {}
    setFocusState(on);
    try { window.dispatchEvent(new Event(TABLES_FOCUS_EVENT)); } catch {}
  };
  return [focus, setFocus];
}
