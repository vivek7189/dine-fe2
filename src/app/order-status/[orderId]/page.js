'use client';

// Public, no-login "track my order" page for customers. The unguessable orderId
// in the URL is the access token. Shows a live status tracker that a guest opens
// on their phone (linked from the "order ready" WhatsApp and a receipt QR).
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { openPaytmCheckout } from '../../../utils/paytmCheckout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Ordered pipeline the tracker walks through. `served`/`completed` both land on
// the final step; `cancelled` is handled separately.
const STEPS = [
  { key: 'placed', label: 'Order Placed', icon: '🧾', match: ['pending', 'confirmed'] },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', match: ['preparing'] },
  { key: 'ready', label: 'Ready', icon: '✅', match: ['ready'] },
  { key: 'done', label: 'Served', icon: '🍽️', match: ['served', 'completed'] },
];

function currentStepIndex(status) {
  const i = STEPS.findIndex((s) => s.match.includes(status));
  return i === -1 ? 0 : i;
}

export default function OrderStatusPage() {
  const params = useParams();
  const orderId = params?.orderId;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const prevReadyRef = useRef(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');

  const load = useCallback(async () => {
    if (!orderId || !API_BASE_URL) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/order-status/${orderId}`);
      if (!res.ok) {
        if (res.status === 404) setError('Order not found');
        else setError('Could not load order');
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setError(null);
      // Gentle vibrate when it flips to ready (mobile browsers that support it).
      if (json.status === 'ready' && !prevReadyRef.current && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([120, 60, 120]);
      }
      prevReadyRef.current = json.status === 'ready';
    } catch (e) {
      setError('Could not load order');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Initial load + poll every 8s (4s while a Paytm payment is being confirmed) + refresh on focus.
  const waitingForPayment = data?.status === 'pending_payment';
  useEffect(() => {
    load();
    const id = setInterval(load, waitingForPayment ? 4000 : 8000);
    const onFocus = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onFocus);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onFocus); };
  }, [load, waitingForPayment]);

  // Paytm: open the payment page again (closed / failed first try).
  const payNow = async () => {
    if (!orderId || !API_BASE_URL || paying) return;
    setPaying(true); setPayError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/paytm/${orderId}/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Could not open Paytm');
      if (json.paytm && openPaytmCheckout(json.paytm)) return; // leaving the page
      await load();
    } catch (e) {
      setPayError(e.message || 'Could not open Paytm');
    }
    setPaying(false);
  };

  const status = data?.status;
  const isCancelled = status === 'cancelled';
  // QR order approval: the restaurant hasn't accepted the order yet / didn't accept it.
  const isAwaiting = status === 'awaiting_approval';
  const isRejected = isCancelled && data?.approval?.state === 'rejected';
  // Paytm online payment: waiting for Paytm's confirmation / not paid / paid but not placed.
  const pay = data?.payment?.method === 'paytm' ? data.payment : null;
  const isPayPending = status === 'pending_payment';
  const payFailed = isPayPending && pay?.lastStatus === 'TXN_FAILURE';
  const isUnpaidCancel = isCancelled && pay && ['expired', 'failed'].includes(pay.state);
  const isPaidNotPlaced = isCancelled && pay?.state === 'paid_not_placed';
  const stepIdx = currentStepIndex(status);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', display: 'flex', justifyContent: 'center' }}>
      <style>{`
        :root { --bg:#f6f7f9; --fg:#0f172a; --card:#ffffff; --muted:#64748b; --line:#e5e7eb; --accent:#16a34a; }
        @media (prefers-color-scheme: dark) { :root { --bg:#0b1120; --fg:#f1f5f9; --card:#111827; --muted:#94a3b8; --line:#1f2937; --accent:#22c55e; } }
        :root[data-theme="dark"] { --bg:#0b1120; --fg:#f1f5f9; --card:#111827; --muted:#94a3b8; --line:#1f2937; --accent:#22c55e; }
        :root[data-theme="light"] { --bg:#f6f7f9; --fg:#0f172a; --card:#ffffff; --muted:#64748b; --line:#e5e7eb; --accent:#16a34a; }
        @keyframes pulse { 0%,100%{ transform:scale(1);opacity:1 } 50%{ transform:scale(1.06);opacity:.85 } }
      `}</style>

      <div style={{ width: '100%', maxWidth: 460, padding: '24px 18px 40px' }}>
        {loading && !data ? (
          <p style={{ textAlign: 'center', color: 'var(--muted)', marginTop: 80 }}>Loading your order…</p>
        ) : error ? (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <div style={{ fontSize: 40 }}>🔍</div>
            <p style={{ color: 'var(--muted)' }}>{error}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              {data.restaurant?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.restaurant.logo} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', marginBottom: 8 }} />
              ) : null}
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--muted)' }}>{data.restaurant?.name || ''}</div>
            </div>

            {/* Token card */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '22px 18px', textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 12, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' }}>Your token</div>
              <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.1, margin: '4px 0 8px' }}>#{data.token}</div>
              {isPayPending ? (
                <div>
                  {payFailed ? (
                    <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 13, padding: '5px 14px', borderRadius: 999 }}>
                      Payment didn&apos;t go through
                    </div>
                  ) : (
                    <div style={{ display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', fontWeight: 700, fontSize: 13, padding: '5px 14px', borderRadius: 999, animation: 'pulse 1.6s ease-in-out infinite' }}>
                      💳 Confirming your payment…
                    </div>
                  )}
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                    {payFailed ? 'No money was taken. You can try again.' : 'Paid already? This updates by itself in a few seconds. Your order goes to the kitchen as soon as the payment is confirmed.'}
                  </p>
                  {pay?.canRetry ? (
                    <button onClick={payNow} disabled={paying} style={{ marginTop: 14, width: '100%', padding: '12px 16px', borderRadius: 12, border: 'none', background: '#002e6e', color: '#fff', fontWeight: 700, fontSize: 15, cursor: paying ? 'wait' : 'pointer', opacity: paying ? 0.7 : 1 }}>
                      {paying ? 'Opening Paytm…' : (payFailed ? 'Try paying again' : 'Complete payment with Paytm')}
                    </button>
                  ) : null}
                  {payError ? <p style={{ margin: '8px 0 0', fontSize: 12, color: '#dc2626' }}>{payError}</p> : null}
                </div>
              ) : isPaidNotPlaced ? (
                <div>
                  <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 13, padding: '5px 14px', borderRadius: 999 }}>
                    Order could not be placed
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--muted)' }}>
                    {data.refundStatus === 'refunded' || data.refundStatus === 'refund_pending' ? 'Your payment is being refunded to you.' : 'Your payment will be refunded — please contact the restaurant.'}
                  </p>
                </div>
              ) : isUnpaidCancel ? (
                <div>
                  <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 13, padding: '5px 14px', borderRadius: 999 }}>
                    Payment not completed
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--muted)' }}>The order was not placed. Please order again.</p>
                  {data.refundStatus ? <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--muted)' }}>A late payment is being refunded to you.</p> : null}
                </div>
              ) : isRejected ? (
                <div>
                  <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 13, padding: '5px 14px', borderRadius: 999 }}>
                    {data.approval?.autoRejected ? 'Not accepted in time' : 'Order not accepted'}
                  </div>
                  {data.approval?.reason ? <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--muted)' }}>{data.approval.reason}</p> : null}
                  {data.refundStatus ? (
                    <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                      {data.refundStatus === 'refunded' ? 'Your payment has been refunded.' : 'Your payment will be refunded by the restaurant.'}
                    </p>
                  ) : null}
                </div>
              ) : isCancelled ? (
                <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 13, padding: '5px 14px', borderRadius: 999 }}>
                  Order Cancelled
                </div>
              ) : isAwaiting ? (
                <div style={{ display: 'inline-block', background: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: 13, padding: '5px 14px', borderRadius: 999, animation: 'pulse 1.6s ease-in-out infinite' }}>
                  ⏳ Waiting for the restaurant to accept
                </div>
              ) : (
                <div style={{
                  display: 'inline-block', fontWeight: 700, fontSize: 13, padding: '5px 14px', borderRadius: 999,
                  background: status === 'ready' ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 15%, transparent)',
                  color: status === 'ready' ? '#fff' : 'var(--accent)',
                  animation: status === 'ready' ? 'pulse 1.4s ease-in-out infinite' : 'none',
                }}>
                  {status === 'ready' ? '🎉 Ready — please collect' : STEPS[stepIdx].label}
                </div>
              )}
            </div>

            {pay && !isPayPending && !isCancelled && (pay.paymentStatus === 'paid' || pay.paymentStatus === 'partial') ? (
              <div style={{ textAlign: 'center', marginTop: -8, marginBottom: 14 }}>
                <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#1d4ed8', background: '#dbeafe', padding: '4px 12px', borderRadius: 999 }}>
                  ✓ Paid with Paytm{pay.paymentStatus === 'partial' ? ' (part — pay the rest at the counter)' : ''}
                </span>
              </div>
            ) : null}

            {/* Stepper */}
            {!isCancelled && !isPayPending && (
              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '18px', marginBottom: 18 }}>
                {STEPS.map((step, i) => {
                  const done = i < stepIdx;
                  const active = i === stepIdx;
                  return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, flexShrink: 0,
                        background: done || active ? 'var(--accent)' : 'color-mix(in srgb, var(--muted) 18%, transparent)',
                        color: done || active ? '#fff' : 'var(--muted)',
                        animation: active ? 'pulse 1.4s ease-in-out infinite' : 'none',
                      }}>{done ? '✓' : step.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: active ? 700 : 500, color: done || active ? 'var(--fg)' : 'var(--muted)' }}>{isAwaiting && i === 0 ? 'Order sent — waiting for the restaurant' : step.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order meta */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: 14 }}>
              <span>{data.itemCount} item{data.itemCount !== 1 ? 's' : ''} · {(data.orderType || 'dine-in').replace('_', ' ')}</span>
              {data.total ? <span style={{ fontWeight: 700, color: 'var(--fg)' }}>{Number(data.total).toLocaleString()}</span> : null}
            </div>

            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11, marginTop: 18 }}>
              This page updates automatically.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
