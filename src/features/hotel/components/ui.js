'use client';
// Shared primitives for the hotel PMS — warm editorial design (Cardamom House).
// Every hotel page composes these so the look stays consistent and premium.
import React from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

// Inputs ----------------------------------------------------------------------
export const inputCls =
  'w-full rounded-lg border border-[var(--h-border2)] bg-white px-3 py-2 text-[13.5px] text-[var(--h-ink)] outline-none transition focus:border-[var(--h-brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--h-brand)_15%,transparent)] placeholder:text-[var(--h-faint2)]';

export function Field({ label, children, hint, required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--h-muted)]">
        {label}{required && <span className="text-[#9B4A3A]"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-[var(--h-faint2)]">{hint}</span>}
    </label>
  );
}

// Buttons ---------------------------------------------------------------------
export function Btn({ variant = 'primary', children, className = '', style, ...rest }) {
  // Inline colors so buttons render reliably regardless of Tailwind JIT.
  const bg = { primary: 'var(--h-brand)', danger: '#9B4A3A' }[variant];
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
  if (variant === 'ghost') {
    return <button {...rest} className={`${base} border border-[var(--h-border2)] bg-white text-[var(--h-ink2)] hover:bg-[var(--h-hover)] ${className}`} style={style}>{children}</button>;
  }
  return (
    <button {...rest} style={{ backgroundColor: bg, color: '#fff', ...style }}
      className={`${base} text-white shadow-sm hover:brightness-110 ${className}`}>
      {children}
    </button>
  );
}

// Status chip with a leading dot -------------------------------------------------
const PILL = {
  available: { c: 'bg-[#E7F1EA] text-[#356B4E]', d: 'bg-[#3E7C5A]' },
  occupied: { c: 'bg-[#EAF0F5] text-[#3F5C79]', d: 'bg-[#4E6E8E]' },
  reserved: { c: 'bg-[#EEEAF6] text-[#5A4A85]', d: 'bg-[#6D5B9A]' },
  blocked: { c: 'bg-[var(--h-chip)] text-[var(--h-text2)]', d: 'bg-[var(--h-faint)]' },
  'out-of-service': { c: 'bg-[var(--h-chip)] text-[var(--h-muted2)]', d: 'bg-[var(--h-faint)]' },
  clean: { c: 'bg-[#E7F1EA] text-[#356B4E]', d: 'bg-[#3E7C5A]' },
  dirty: { c: 'bg-[#F6EEDD] text-[#8A6721]', d: 'bg-[#B58836]' },
  inspected: { c: 'bg-[#EAF0F5] text-[#3F5C79]', d: 'bg-[#4E6E8E]' },
  'out-of-order': { c: 'bg-[#F5E6E2] text-[#8A3F31]', d: 'bg-[#9B4A3A]' },
};
export function Pill({ value, dot = true }) {
  const t = PILL[value] || { c: 'bg-[var(--h-chip)] text-[var(--h-text2)]', d: 'bg-[var(--h-faint)]' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${t.c}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${t.d}`} />}
      {String(value || '').replace(/-/g, ' ') || '—'}
    </span>
  );
}

// Banner ----------------------------------------------------------------------
export function Banner({ tone = 'info', children, onClose }) {
  if (!children) return null;
  const tones = {
    success: 'bg-[#E7F1EA] text-[#2F6047] border-[#CFE3D6]',
    error: 'bg-[#F5E6E2] text-[#8A3F31] border-[#EAD1C9]',
    info: 'bg-[var(--h-bsoft2)] text-[var(--h-text)] border-[var(--h-border2)]',
  };
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] ${tones[tone] || tones.info}`}>
      <span className="flex-1">{children}</span>
      {onClose && <button onClick={onClose} className="mt-0.5 opacity-60 hover:opacity-100" aria-label="Dismiss"><FaTimes size={12} /></button>}
    </div>
  );
}

// KPI / stat card -------------------------------------------------------------
export function StatCard({ icon: Icon, tone = 'brass', label, value, sub, bar }) {
  const tones = {
    brass: 'bg-[var(--h-brand-soft)] text-[var(--h-brand-ink)]', indigo: 'bg-[#EEEAF6] text-[#5A4A85]', sky: 'bg-[#EAF0F5] text-[#3F5C79]',
    emerald: 'bg-[#E7F1EA] text-[#356B4E]', rose: 'bg-[#F5E6E2] text-[#8A3F31]', amber: 'bg-[#F6EEDD] text-[#8A6721]', slate: 'bg-[var(--h-chip)] text-[var(--h-text2)]',
  };
  return (
    <div className="rounded-2xl border border-[var(--h-border)] bg-white p-4 shadow-[0_1px_2px_rgba(40,33,20,0.05)]">
      <div className="flex items-center gap-3">
        {Icon && <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${tones[tone] || tones.brass}`}><Icon size={14} /></span>}
        <div className="min-w-0">
          <div className="font-serif text-[22px] font-semibold leading-none text-[var(--h-ink)]">{value}</div>
          <div className="mt-0.5 truncate text-[11px] text-[var(--h-faint)]">{label}{sub ? ` · ${sub}` : ''}</div>
        </div>
      </div>
      {bar != null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--h-track)]"><div className="h-full rounded-full bg-[var(--h-brand)]" style={{ width: `${Math.min(100, bar)}%` }} /></div>
      )}
    </div>
  );
}

// Modal -----------------------------------------------------------------------
export function Modal({ open, title, onClose, children, footer, wide }) {
  if (!open || typeof document === 'undefined') return null;
  // Rendered via a portal on <body> so the overlay covers the whole screen —
  // including the app sidebar — regardless of where it's mounted in the tree.
  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto bg-[color-mix(in_srgb,var(--h-ink)_50%,transparent)] p-4 backdrop-blur-[2px] sm:items-center" onClick={onClose}>
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl border border-[var(--h-border)] bg-[var(--h-surface)] shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[var(--h-bsoft)] px-5 py-3.5">
          <h3 className="font-serif text-[16px] font-semibold text-[var(--h-ink)]">{title}</h3>
          <button onClick={onClose} className="text-[var(--h-faint)] hover:text-[var(--h-text)]" aria-label="Close"><FaTimes /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[var(--h-bsoft)] px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
