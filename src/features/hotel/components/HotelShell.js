'use client';
// One shell for every hotel page: warm canvas + slim property context bar +
// property gate + banner. Navigation lives in the app sidebar (hotel workspace),
// so there is no in-page tab nav — the two never stack.
import React from 'react';
import { FaSpinner, FaCircle } from 'react-icons/fa';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useHotelProperty } from '../lib/useHotelProperty';
import { useHotelTheme, THEMES } from '../lib/hotelTheme';
import { Banner } from './ui';

function ThemeToggle() {
  const [theme, setTheme] = useHotelTheme();
  return (
    <div className="ml-auto inline-flex items-center gap-1 rounded-lg border border-[var(--h-border)] bg-[var(--h-surface)] p-0.5">
      {THEMES.map((t) => (
        <button key={t.id} onClick={() => setTheme(t.id)}
          className={`rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition ${theme === t.id ? 'text-white' : 'text-[var(--h-muted)] hover:text-[var(--h-ink)]'}`}
          style={theme === t.id ? { backgroundColor: 'var(--h-brand)' } : undefined}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function HotelShell({ children }) {
  const { formatCurrency } = useCurrency();
  const { restaurantId, booting, banner, setBanner, notify } = useHotelProperty();

  let outlet = '';
  if (typeof window !== 'undefined') { try { outlet = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}')?.name || ''; } catch { /* noop */ } }
  const now = new Date();
  const dateLabel = `${WD[now.getDay()]}, ${now.getDate()} ${MO[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="min-h-screen bg-[var(--h-canvas)]">
      <div className="px-4 py-5 sm:px-6">
        {/* property context bar */}
        <div className="mb-6 flex flex-wrap items-center gap-2.5 border-b border-[var(--h-border)] pb-4">
          <FaCircle size={8} className="text-[#3E7C5A]" />
          <span className="text-[15px] font-semibold text-[var(--h-ink)]">{outlet || 'Hotel'}</span>
          <span className="text-[13px] text-[var(--h-faint)]">· Business date <span className="font-medium text-[var(--h-text)]">{dateLabel}</span></span>
          <ThemeToggle />
        </div>

        {booting ? (
          <div className="flex items-center gap-2 py-16 text-[var(--h-faint)]"><FaSpinner className="animate-spin" /> Loading…</div>
        ) : !restaurantId ? (
          <Banner tone="error">No property selected. Pick a restaurant/property first, then reopen this page.</Banner>
        ) : (
          <>
            {banner && <div className="mb-4"><Banner tone={banner.tone} onClose={() => setBanner(null)}>{banner.msg}</Banner></div>}
            {children({ restaurantId, notify, formatCurrency })}
          </>
        )}
      </div>
    </div>
  );
}
