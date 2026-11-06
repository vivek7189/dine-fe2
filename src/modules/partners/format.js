// Money is in minor units (paise / cents) with a currency code.
export function money(minor, currency) {
  const n = (Number(minor) || 0) / 100;
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2 }).format(n);
  } catch (_) {
    return `${currency || ''} ${n.toFixed(2)}`;
  }
}
export function date(d) {
  if (!d) return '—';
  const x = new Date(d);
  return isNaN(x) ? '—' : x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
export const BILLING_LABEL = {
  paid: { text: 'Paying', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  trial: { text: 'Free trial', cls: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500' },
  pending: { text: 'Payment pending', cls: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
  expired: { text: 'Expired', cls: 'bg-red-50 text-red-700 ring-red-600/20', dot: 'bg-red-500' },
  free: { text: 'Not paying', cls: 'bg-slate-50 text-slate-600 ring-slate-500/20', dot: 'bg-slate-400' },
};
export const COMMISSION_LABEL = {
  pending: { text: 'On hold', cls: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
  payable: { text: 'Ready to pay', cls: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500' },
  paid: { text: 'Paid', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  void: { text: 'Cancelled', cls: 'bg-slate-50 text-slate-500 ring-slate-500/20 line-through', dot: 'bg-slate-400' },
};
export function Badge({ map, value }) {
  const b = map[value] || { text: value || '—', cls: 'bg-slate-50 text-slate-600 ring-slate-500/20', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap ${b.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />{b.text}
    </span>
  );
}
