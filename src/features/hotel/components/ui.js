'use client';
// Shared primitives for the hotel PMS — warm editorial design (Cardamom House).
// Every hotel page composes these so the look stays consistent and premium.
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaChevronDown, FaCheck } from 'react-icons/fa';

// Inputs ----------------------------------------------------------------------
export const inputCls =
  'w-full rounded-lg border border-[var(--h-border2)] bg-white px-3 py-2 text-[13.5px] text-[var(--h-ink)] outline-none transition focus:border-[var(--h-brand)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--h-brand)_15%,transparent)] placeholder:text-[var(--h-faint2)]';

// Custom Select ----------------------------------------------------------------
// A themed dropdown that replaces the native <select>. The menu is portalled to
// <body> (z above modals) and fixed-positioned under the trigger, so it never
// gets clipped inside a modal/drawer. options = [{ value, label, sub?, right?, disabled? }].
export function Select({ value, onChange, options = [], placeholder = 'Select…', disabled, className = '' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((o) => String(o.value) === String(value));

  const place = useCallback(() => {
    const el = btnRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const below = vh - r.bottom;
    const menuH = Math.min(288, options.length * 40 + 8);
    const up = below < menuH + 12 && r.top > below;
    setPos({ left: r.left, width: r.width, top: up ? undefined : r.bottom + 6, bottom: up ? vh - r.top + 6 : undefined });
  }, [options.length]);

  useEffect(() => {
    if (!open) return;
    place();
    const onDoc = (e) => { if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = () => place();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', onScroll, true);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', place); window.removeEventListener('scroll', onScroll, true); };
  }, [open, place]);

  const pick = (o) => { if (o.disabled) return; onChange(o.value); setOpen(false); };

  return (
    <>
      <button type="button" ref={btnRef} disabled={disabled} onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left text-[13.5px] outline-none transition ${open ? 'border-[var(--h-brand)] ring-2 ring-[color-mix(in_srgb,var(--h-brand)_15%,transparent)]' : 'border-[var(--h-border2)]'} ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-[var(--h-brand)]'} ${className}`}>
        <span className={`flex min-w-0 items-center gap-2 truncate ${selected ? 'text-[var(--h-ink)]' : 'text-[var(--h-faint2)]'}`}>
          {selected ? (<><span className="truncate">{selected.label}</span>{selected.right != null && <span className="ml-1 shrink-0 text-[12px] text-[var(--h-muted)]">{selected.right}</span>}</>) : placeholder}
        </span>
        <FaChevronDown size={11} className={`shrink-0 text-[var(--h-faint)] transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && pos && typeof document !== 'undefined' && createPortal(
        <div ref={menuRef} className="hotel-fade fixed z-[10060] overflow-auto rounded-xl border border-[var(--h-border)] bg-[var(--h-surface)] py-1 shadow-[0_16px_40px_-12px_rgba(20,16,8,0.35)]"
          style={{ left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: 288 }}>
          {options.length === 0 && <div className="px-3 py-2 text-[12.5px] text-[var(--h-faint)]">No options</div>}
          {options.map((o) => {
            const on = String(o.value) === String(value);
            return (
              <button type="button" key={String(o.value)} onClick={() => pick(o)} disabled={o.disabled}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] transition ${o.disabled ? 'cursor-not-allowed opacity-45' : 'hover:bg-[var(--h-hover)]'} ${on ? 'bg-[var(--h-brand-soft)]' : ''}`}>
                <span className="flex min-w-0 flex-col">
                  <span className={`truncate ${on ? 'font-semibold text-[var(--h-brand-ink)]' : 'text-[var(--h-ink)]'}`}>{o.label}</span>
                  {o.sub && <span className="truncate text-[11px] text-[var(--h-faint)]">{o.sub}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {o.right != null && <span className="text-[12px] text-[var(--h-muted)]">{o.right}</span>}
                  {on && <FaCheck size={10} className="text-[var(--h-brand)]" />}
                </span>
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

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
export function Modal({ open, title, subtitle, icon: Icon, onClose, children, footer, wide, size }) {
  if (!open || typeof document === 'undefined') return null;
  const maxW = { sm: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-3xl', '2xl': 'max-w-4xl' }[size] || (wide ? 'max-w-2xl' : 'max-w-md');
  // Rendered via a portal on <body> so the overlay covers the whole screen —
  // including the app sidebar (z above it) — regardless of where it's mounted.
  return createPortal(
    <div className="hotel-fade fixed inset-0 z-[10050] flex items-start justify-center overflow-y-auto bg-[color-mix(in_srgb,var(--h-ink)_55%,transparent)] p-4 backdrop-blur-[3px] sm:items-center" onClick={onClose}>
      <div className={`hotel-pop w-full ${maxW} overflow-hidden rounded-2xl border border-[var(--h-border)] bg-[var(--h-surface)] shadow-[0_24px_60px_-12px_rgba(20,16,8,0.35)]`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-[var(--h-bsoft)] bg-[var(--h-surface2)] px-5 py-4">
          <div className="flex items-start gap-3">
            {Icon && <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[var(--h-brand-soft)] text-[var(--h-brand)]"><Icon size={14} /></span>}
            <div>
              <h3 className="font-serif text-[17px] font-semibold leading-tight text-[var(--h-ink)]">{title}</h3>
              {subtitle && <p className="mt-0.5 text-[12px] text-[var(--h-muted)]">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 flex-none items-center justify-center rounded-lg text-[var(--h-faint)] transition hover:bg-[var(--h-hover)] hover:text-[var(--h-text)]" aria-label="Close"><FaTimes size={13} /></button>
        </div>
        <div className="max-h-[calc(100vh-13rem)] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[var(--h-bsoft)] bg-[var(--h-surface2)] px-5 py-3.5">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
