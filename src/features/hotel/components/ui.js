'use client';
// Tiny presentational primitives shared by the hotel PMS panels. Self-contained
// (Tailwind only) so the whole feature stays in one folder.
import React from 'react';
import { FaTimes } from 'react-icons/fa';

// Inline status banner (success / error). Auto-styled by tone.
export function Banner({ tone = 'info', children, onClose }) {
  if (!children) return null;
  const tones = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${tones[tone] || tones.info}`}>
      <span className="flex-1">{children}</span>
      {onClose && (
        <button onClick={onClose} className="mt-0.5 opacity-60 hover:opacity-100" aria-label="Dismiss">
          <FaTimes size={12} />
        </button>
      )}
    </div>
  );
}

// Premium status chip with a leading status dot.
const PILL_TONES = {
  available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  occupied: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  reserved: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blocked: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  'out-of-service': 'bg-slate-100 text-slate-500 ring-slate-500/20',
  clean: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  dirty: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  inspected: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'out-of-order': 'bg-rose-50 text-rose-700 ring-rose-600/20',
};
const DOT_TONES = {
  available: 'bg-emerald-500', occupied: 'bg-rose-500', reserved: 'bg-amber-500',
  blocked: 'bg-slate-400', 'out-of-service': 'bg-slate-400',
  clean: 'bg-emerald-500', dirty: 'bg-amber-500', inspected: 'bg-sky-500', 'out-of-order': 'bg-rose-500',
};
export function Pill({ value, dot = true }) {
  const label = String(value || '').replace(/-/g, ' ');
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset ${PILL_TONES[value] || 'bg-slate-100 text-slate-600 ring-slate-500/20'}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOT_TONES[value] || 'bg-slate-400'}`} />}
      {label || '—'}
    </span>
  );
}

// Labeled form field wrapper.
export function Field({ label, children, hint, required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">
        {label}{required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

export const inputCls =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

// Centered modal dialog.
export function Modal({ open, title, onClose, children, footer, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center">
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <FaTimes />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

// Compact KPI card used in the summary strips across hotel pages.
export function StatCard({ icon: Icon, tone = 'indigo', label, value, sub }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600', sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600', slate: 'bg-slate-100 text-slate-500',
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
      {Icon && <span className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${tones[tone]}`}><Icon size={14} /></span>}
      <div className="min-w-0">
        <div className="text-lg font-semibold leading-none text-slate-900 tabular-nums">{value}</div>
        <div className="mt-0.5 truncate text-[11px] text-slate-400">{label}{sub ? ` · ${sub}` : ''}</div>
      </div>
    </div>
  );
}

export function Btn({ variant = 'primary', children, ...rest }) {
  const styles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300',
    ghost: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:cursor-not-allowed ${styles[variant]} ${rest.className || ''}`}
    >
      {children}
    </button>
  );
}
