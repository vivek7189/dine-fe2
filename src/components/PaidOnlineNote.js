'use client';

// A running order the guest paid ONLINE at the QR (Razorpay / Paytm): how much was paid online and how
// much is still to collect (items added at the POS after paying) — so nobody charges the whole bill
// again. Renders nothing for other orders or once the order is closed.
const CLOSED = ['completed', 'cancelled', 'deleted', 'refunded'];
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export default function PaidOnlineNote({ order, formatCurrency }) {
  if (!order || CLOSED.includes(String(order.status || '').toLowerCase())) return null;
  const online = r2(Number(order.razorpayAmountPaid) || Number(order.paytmAmountPaid) || 0);
  if (!(online > 0)) return null;
  const total = r2(order.finalAmount || order.totalAmount || 0);
  const bal = r2(total - Math.max(online, r2(order.paidAmount)));
  const via = Number(order.paytmAmountPaid) > 0 || String(order.paymentMethod || '').toLowerCase() === 'paytm' ? 'Paytm' : 'Razorpay';
  const fmt = (n) => (formatCurrency ? formatCurrency(n) : `₹${n.toFixed(2)}`);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${bal > 0.5 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
      Paid online {fmt(online)} ({via}) · {bal > 0.5 ? `collect ${fmt(bal)} only` : 'nothing to collect'}
    </span>
  );
}
