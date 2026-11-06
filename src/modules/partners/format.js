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
  paid: { text: 'Paying', cls: 'bg-green-100 text-green-800' },
  trial: { text: 'Free trial', cls: 'bg-blue-100 text-blue-800' },
  pending: { text: 'Payment pending', cls: 'bg-amber-100 text-amber-800' },
  expired: { text: 'Expired', cls: 'bg-red-100 text-red-700' },
  free: { text: 'Not paying', cls: 'bg-gray-100 text-gray-700' },
};
export const COMMISSION_LABEL = {
  pending: { text: 'On hold', cls: 'bg-amber-100 text-amber-800' },
  payable: { text: 'Ready to pay', cls: 'bg-blue-100 text-blue-800' },
  paid: { text: 'Paid', cls: 'bg-green-100 text-green-800' },
  void: { text: 'Cancelled', cls: 'bg-gray-100 text-gray-500 line-through' },
};
export function Badge({ map, value }) {
  const b = map[value] || { text: value || '—', cls: 'bg-gray-100 text-gray-700' };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${b.cls}`}>{b.text}</span>;
}
