'use client';
// Shared primitives for the hotel PMS — warm editorial design (Cardamom House).
// Every hotel page composes these so the look stays consistent and premium.
import React from 'react';
import { FaTimes } from 'react-icons/fa';

// Inputs ----------------------------------------------------------------------
export const inputCls =
  'w-full rounded-lg border border-[#DFD7C6] bg-white px-3 py-2 text-[13.5px] text-[#2A241B] outline-none transition focus:border-[#9A7B45] focus:ring-2 focus:ring-[#9A7B45]/15 placeholder:text-[#B3A88F]';

export function Field({ label, children, hint, required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.06em] text-[#8A8172]">
        {label}{required && <span className="text-[#9B4A3A]"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-[#B3A88F]">{hint}</span>}
    </label>
  );
}

// Buttons ---------------------------------------------------------------------
export function Btn({ variant = 'primary', children, className = '', style, ...rest }) {
  // Inline colors so buttons render reliably regardless of Tailwind JIT.
  const bg = { primary: '#9A7B45', danger: '#9B4A3A' }[variant];
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-60';
  if (variant === 'ghost') {
    return <button {...rest} className={`${base} border border-[#DDD4C2] bg-white text-[#4A4335] hover:bg-[#F3EFE6] ${className}`} style={style}>{children}</button>;
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
  blocked: { c: 'bg-[#EFEAE0] text-[#7A6F58]', d: 'bg-[#A79C88]' },
  'out-of-service': { c: 'bg-[#EFEAE0] text-[#9A9081]', d: 'bg-[#A79C88]' },
  clean: { c: 'bg-[#E7F1EA] text-[#356B4E]', d: 'bg-[#3E7C5A]' },
  dirty: { c: 'bg-[#F6EEDD] text-[#8A6721]', d: 'bg-[#B58836]' },
  inspected: { c: 'bg-[#EAF0F5] text-[#3F5C79]', d: 'bg-[#4E6E8E]' },
  'out-of-order': { c: 'bg-[#F5E6E2] text-[#8A3F31]', d: 'bg-[#9B4A3A]' },
};
export function Pill({ value, dot = true }) {
  const t = PILL[value] || { c: 'bg-[#EFEAE0] text-[#7A6F58]', d: 'bg-[#A79C88]' };
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
    info: 'bg-[#F1ECE1] text-[#6E6656] border-[#E4DCC9]',
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
    brass: 'bg-[#F3EAD7] text-[#876A3A]', indigo: 'bg-[#EEEAF6] text-[#5A4A85]', sky: 'bg-[#EAF0F5] text-[#3F5C79]',
    emerald: 'bg-[#E7F1EA] text-[#356B4E]', rose: 'bg-[#F5E6E2] text-[#8A3F31]', amber: 'bg-[#F6EEDD] text-[#8A6721]', slate: 'bg-[#EFEAE0] text-[#7A6F58]',
  };
  return (
    <div className="rounded-2xl border border-[#EBE4D6] bg-white p-4 shadow-[0_1px_2px_rgba(40,33,20,0.05)]">
      <div className="flex items-center gap-3">
        {Icon && <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${tones[tone] || tones.brass}`}><Icon size={14} /></span>}
        <div className="min-w-0">
          <div className="font-serif text-[22px] font-semibold leading-none text-[#2A241B]">{value}</div>
          <div className="mt-0.5 truncate text-[11px] text-[#A79C88]">{label}{sub ? ` · ${sub}` : ''}</div>
        </div>
      </div>
      {bar != null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#EDE7DB]"><div className="h-full rounded-full bg-[#9A7B45]" style={{ width: `${Math.min(100, bar)}%` }} /></div>
      )}
    </div>
  );
}

// Modal -----------------------------------------------------------------------
export function Modal({ open, title, onClose, children, footer, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#2A241B]/40 p-4 backdrop-blur-[2px] sm:items-center">
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl border border-[#EBE4D6] bg-[#FBF9F4] shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-[#EFE9DD] px-5 py-3.5">
          <h3 className="font-serif text-[16px] font-semibold text-[#2A241B]">{title}</h3>
          <button onClick={onClose} className="text-[#A79C88] hover:text-[#6E6656]" aria-label="Close"><FaTimes /></button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-[#EFE9DD] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
