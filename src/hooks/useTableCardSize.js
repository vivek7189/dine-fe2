'use client';

import { useEffect, useState } from 'react';
import { FaExpandAlt, FaCompressAlt } from 'react-icons/fa';

// Table card size on the tables grid ('normal' | 'compact'). Saved per device and
// shared by the /tables page and the billing screen's tables view.
const KEY = 'dine_table_card_size';
const EVT = 'dine-table-card-size';

const read = () => {
  try { return localStorage.getItem(KEY) === 'compact' ? 'compact' : 'normal'; } catch { return 'normal'; }
};

export function useTableCardSize() {
  const [size, setSizeState] = useState('normal');
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
export const tableGridColumns = (size) => size === 'compact'
  ? 'repeat(auto-fill, minmax(132px, 1fr))'
  : 'repeat(auto-fill, minmax(160px, 1fr))';

// Small two-icon switch: bigger cards / compact cards.
export function TableCardSizeToggle({ size, onChange }) {
  const opts = [
    { k: 'normal', I: FaExpandAlt, title: 'Bigger cards' },
    { k: 'compact', I: FaCompressAlt, title: 'Compact cards' },
  ];
  return (
    <div role="group" aria-label="Card size" style={{ display: 'flex', gap: '2px', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
      {opts.map(o => (
        <button key={o.k} type="button" onClick={() => onChange(o.k)} title={o.title} aria-label={o.title} aria-pressed={size === o.k} style={{
          width: '30px', height: '28px', borderRadius: '8px', border: 'none', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: size === o.k ? 'white' : 'transparent',
          color: size === o.k ? '#1f2937' : '#9ca3af',
          boxShadow: size === o.k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        }}>
          <o.I size={11} />
        </button>
      ))}
    </div>
  );
}
