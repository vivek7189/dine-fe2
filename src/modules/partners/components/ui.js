'use client';

// Small shared UI pieces for the partner portal (one look across every tab).
import { useEffect } from 'react';
import { X, Loader2, AlertCircle, CheckCircle2, Info } from 'lucide-react';

export const cx = (...a) => a.filter(Boolean).join(' ');

export function Card({ className = '', children, ...rest }) {
  return <div className={cx('bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]', className)} {...rest}>{children}</div>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-[22px] sm:text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const BTN = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
  brand: 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/20',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'text-red-600 hover:bg-red-50',
};
export function Button({ variant = 'primary', size = 'md', busy = false, icon: Icon, className = '', children, disabled, ...rest }) {
  const sz = size === 'sm' ? 'h-8 px-3 text-[13px] gap-1.5' : size === 'lg' ? 'h-11 px-5 text-[15px] gap-2' : 'h-10 px-4 text-sm gap-2';
  return (
    <button disabled={disabled || busy} className={cx('inline-flex items-center justify-center rounded-xl font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-1', sz, BTN[variant], className)} {...rest}>
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </button>
  );
}

export const inputCls = 'w-full h-10 !rounded-xl border !border-slate-200 bg-white !px-3.5 !py-0 !text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:!border-red-400 focus:ring-4 focus:ring-red-500/10 disabled:bg-slate-50';
export const textareaCls = 'w-full !rounded-xl border !border-slate-200 bg-white !px-3.5 !py-2.5 !text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:!border-red-400 focus:ring-4 focus:ring-red-500/10';

export function Field({ label, hint, className = '', children }) {
  return (
    <label className={cx('block', className)}>
      {label && <span className="block text-[13px] font-medium text-slate-700 mb-1.5">{label}</span>}
      {children}
      {hint && <span className="block text-xs text-slate-500 mt-1.5">{hint}</span>}
    </label>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <Card className="px-6 py-12 text-center">
      {Icon && <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4"><Icon className="w-6 h-6" /></div>}
      <div className="font-semibold text-slate-900">{title}</div>
      {text && <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </Card>
  );
}

const TONES = {
  error: ['bg-red-50 border-red-200 text-red-800', AlertCircle],
  success: ['bg-emerald-50 border-emerald-200 text-emerald-800', CheckCircle2],
  info: ['bg-sky-50 border-sky-200 text-sky-900', Info],
};
export function Alert({ tone = 'info', children, className = '' }) {
  const [cls, Icon] = TONES[tone] || TONES.info;
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cx('flex gap-2.5 items-start rounded-xl border px-3.5 py-2.5 text-sm', cls, className)}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" /><div className="min-w-0">{children}</div>
    </div>
  );
}

export function Loading({ rows = 3 }) {
  return (
    <div className="space-y-3 animate-pulse" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-200/60" />)}
    </div>
  );
}

export function Modal({ open, title, onClose, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const k = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cx('relative w-full bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto', wide ? 'sm:max-w-2xl' : 'sm:max-w-lg')}>
        <div className="sticky top-0 bg-white/95 backdrop-blur flex items-center px-5 py-4 border-b border-slate-100">
          <div className="font-semibold text-slate-900 flex-1">{title}</div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Segmented({ value, onChange, options, className = '' }) {
  return (
    <div className={cx('inline-flex bg-slate-100 rounded-xl p-1 gap-1', className)} role="tablist">
      {options.map(([k, t, n]) => (
        <button key={k} type="button" role="tab" aria-selected={value === k} onClick={() => onChange(k)}
          className={cx('px-3 h-8 rounded-lg text-[13px] font-medium whitespace-nowrap transition', value === k ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800')}>
          {t}{n !== undefined && <span className={cx('ml-1.5 text-[11px] tabular-nums', value === k ? 'text-slate-500' : 'text-slate-400')}>{n}</span>}
        </button>
      ))}
    </div>
  );
}
