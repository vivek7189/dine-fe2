'use client';
// One shell for every hotel page: canvas + a polished top bar (property + date +
// theme switch) and an optional designed page header (icon + title + subtitle +
// actions). Navigation lives in the app sidebar, so there is no in-page tab nav.
import React from 'react';
import { FaSpinner, FaHotel } from 'react-icons/fa';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { useHotelProperty } from '../lib/useHotelProperty';
import { useHotelTheme, THEMES } from '../lib/hotelTheme';
import { Banner } from './ui';

function ThemeToggle() {
  const [theme, setTheme] = useHotelTheme();
  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-[var(--h-border)] bg-[var(--h-surface2)] p-0.5">
      {THEMES.map((t) => (
        <button key={t.id} onClick={() => setTheme(t.id)}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${theme === t.id ? 'text-white shadow-sm' : 'text-[var(--h-muted)] hover:text-[var(--h-ink)]'}`}
          style={theme === t.id ? { backgroundColor: 'var(--h-brand)' } : undefined}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function HotelShell({ children, icon: Icon, title, subtitle, actions }) {
  const { formatCurrency } = useCurrency();
  const { restaurantId, booting, banner, setBanner, notify } = useHotelProperty();

  let outlet = '';
  if (typeof window !== 'undefined') { try { outlet = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}')?.name || ''; } catch { /* noop */ } }
  const now = new Date();
  const dateLabel = `${WD[now.getDay()]}, ${now.getDate()} ${MO[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="min-h-screen bg-[var(--h-canvas)]">
      {/* top bar — property + business date + theme */}
      <div className="sticky top-0 z-20 border-b border-[var(--h-border)] bg-[color-mix(in_srgb,var(--h-canvas)_88%,transparent)] backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl text-white shadow-sm" style={{ background: 'linear-gradient(135deg, var(--h-brand-si), var(--h-brand))' }}>
            <FaHotel size={13} />
          </span>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13.5px] font-semibold text-[var(--h-ink)]">{outlet || 'Hotel'}</div>
            <div className="text-[11px] text-[var(--h-faint)]">Business date · <span className="font-medium text-[var(--h-muted)]">{dateLabel}</span></div>
          </div>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        {/* designed page header (optional) */}
        {(title || actions) && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              {Icon && (
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-[var(--h-brand-soft)] text-[var(--h-brand)] ring-1 ring-[color-mix(in_srgb,var(--h-brand)_18%,transparent)]">
                  <Icon size={18} />
                </span>
              )}
              <div>
                <h1 className="text-[26px] font-bold leading-tight tracking-[-0.02em] text-[var(--h-ink)]">{title}</h1>
                {subtitle && <p className="mt-0.5 text-[13.5px] text-[var(--h-muted)]">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        )}

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
