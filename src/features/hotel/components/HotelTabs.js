'use client';
import React from 'react';

// Warm segmented control used for in-page sub-tabs.
export function HotelTabs({ tabs, active, onChange }) {
  return (
    <div className="mb-5 inline-flex rounded-xl border border-[var(--h-border2)] bg-white p-1 shadow-[0_1px_2px_rgba(40,33,20,0.04)]">
      {tabs.map((t) => {
        const Icon = t.icon;
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition ${on ? 'bg-[var(--h-brand)] text-white shadow-sm' : 'text-[var(--h-muted)] hover:bg-[var(--h-hover)] hover:text-[var(--h-ink2)]'}`}>
            {Icon && <Icon size={12.5} />} {t.label}
          </button>
        );
      })}
    </div>
  );
}
