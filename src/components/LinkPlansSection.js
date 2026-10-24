'use client';

// Billing page: plans set for this restaurant in dine-admin, each paid ONCE through its own
// Razorpay payment link (rzp.io/…). Prices include GST. Paying switches the plan on for the
// period automatically (webhook / return from Razorpay); "I've paid — check" asks Razorpay too.
import { useEffect, useMemo, useState } from 'react';
import { FaCheck, FaQrcode, FaExternalLinkAlt, FaSyncAlt } from 'react-icons/fa';

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

function LinkQr({ url }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let alive = true;
    import('qrcode').then((QR) => (QR.default || QR).toDataURL(url, { width: 220, margin: 1 }))
      .then((d) => { if (alive) setSrc(d); }).catch(() => {});
    return () => { alive = false; };
  }, [url]);
  if (!src) return <div style={{ width: 180, height: 180, margin: '0 auto', background: '#f3f4f6', borderRadius: 8 }} />;
  return <img src={src} alt="Scan to pay" style={{ width: 180, height: 180, display: 'block', margin: '0 auto' }} />;
}

export default function LinkPlansSection({ plans, apiBase, token, subscription, onPaid, isMobile }) {
  const periods = useMemo(() => [...new Set(plans.map((p) => p.period))], [plans]);
  const [period, setPeriod] = useState(periods.includes('yearly') ? 'yearly' : periods[0]);
  const [qrFor, setQrFor] = useState(null);
  const [checking, setChecking] = useState(null);
  const [msg, setMsg] = useState(null);
  const shown = plans.filter((p) => p.period === period);
  const featured = shown.length > 2 ? shown[Math.floor((shown.length - 1) / 2)]?.id : null;

  const check = async (plan) => {
    setChecking(plan.id); setMsg(null);
    try {
      const r = await fetch(`${apiBase}/api/billing/link-plans/${plan.id}/check`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json().catch(() => ({}));
      if (d.paid) { setMsg({ ok: true, text: `Payment received — ${plan.name} is active${d.accessUntil ? ' until ' + new Date(d.accessUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}.` }); onPaid && onPaid(); }
      else setMsg({ ok: false, text: d.error || 'No payment found for this plan yet. If you just paid, wait a minute and check again.' });
    } catch (_) { setMsg({ ok: false, text: 'Could not check right now — please try again.' }); }
    setChecking(null);
  };

  const activeName = subscription && subscription.status === 'active' ? subscription.planName : null;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: 12, padding: isMobile ? 16 : 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 20 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', textAlign: 'center', margin: '0 0 6px' }}>Your DineOpen plans</h2>
      <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', margin: '0 0 16px' }}>Prices include GST · one-time payment through Razorpay · UPI, card or net banking</p>

      {periods.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', padding: 4, borderRadius: 999 }}>
            {['yearly', 'monthly'].filter((x) => periods.includes(x)).map((x) => (
              <button key={x} type="button" onClick={() => setPeriod(x)} style={{ padding: '7px 18px', borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, background: period === x ? 'white' : 'transparent', color: period === x ? '#111827' : '#6b7280', boxShadow: period === x ? '0 1px 3px rgba(0,0,0,0.12)' : 'none' }}>
                {x === 'yearly' ? 'Yearly' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>
      )}

      {msg && (
        <div style={{ margin: '0 auto 16px', maxWidth: 620, padding: '10px 14px', borderRadius: 10, fontSize: 13, background: msg.ok ? '#f0fdf4' : '#fff7ed', color: msg.ok ? '#166534' : '#9a3412', border: `1px solid ${msg.ok ? '#bbf7d0' : '#fed7aa'}` }}>{msg.text}</div>
      )}

      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(shown.length, 4) || 1}, minmax(0, 1fr))` }}>
        {shown.map((p) => {
          const hot = p.id === featured;
          const dark = shown.length >= 4 && p === shown[shown.length - 1];
          const current = activeName && activeName === p.name;
          return (
            <div key={p.id} style={{ position: 'relative', borderRadius: 14, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0,
              background: dark ? '#1f2937' : 'white', color: dark ? 'white' : '#111827',
              border: hot ? '2px solid #ef4444' : dark ? '2px solid #1f2937' : '1px solid #e5e7eb',
              boxShadow: hot ? '0 8px 24px rgba(239,68,68,0.15)' : 'none' }}>
              {(p.badge || hot) && (
                <span style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: dark ? '#f59e0b' : '#ef4444', color: 'white' }}>{p.badge || 'Most popular'}</span>
              )}
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{p.name}</div>
                {p.description && <div style={{ fontSize: 12, color: dark ? '#d1d5db' : '#6b7280', marginTop: 2 }}>{p.description}</div>}
              </div>
              <div>
                <span style={{ fontSize: 30, fontWeight: 800 }}>{inr(p.amount)}</span>
                <span style={{ fontSize: 13, color: dark ? '#d1d5db' : '#6b7280' }}> /{p.period === 'yearly' ? 'year' : 'month'}</span>
                {p.period === 'yearly' && <div style={{ fontSize: 11, color: dark ? '#d1d5db' : '#6b7280' }}>≈ {inr(Math.round(p.amount / 12))}/month · GST included</div>}
                {p.period === 'monthly' && <div style={{ fontSize: 11, color: dark ? '#d1d5db' : '#6b7280' }}>GST included</div>}
              </div>
              {current && (
                <div style={{ textAlign: 'center', padding: '6px', borderRadius: 8, fontWeight: 700, fontSize: 12, background: '#dcfce7', color: '#166534' }}>Your current plan{subscription.endDate ? ` · until ${new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</div>
              )}
              {p.linkUrl ? (
                <a href={p.linkUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none',
                    background: hot || dark ? '#ef4444' : 'white', color: hot || dark ? 'white' : '#111827', border: hot || dark ? 'none' : '1px solid #d1d5db' }}>
                  {current ? 'Renew' : 'Pay'} {inr(p.amount)} with Razorpay <FaExternalLinkAlt size={11} />
                </a>
              ) : (
                <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>Payment link coming soon</div>
              )}
              {p.linkUrl && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setQrFor(qrFor === p.id ? null : p.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: dark ? 'white' : '#374151', border: `1px solid ${dark ? '#4b5563' : '#e5e7eb'}` }}>
                    <FaQrcode size={12} /> {qrFor === p.id ? 'Hide QR' : 'Scan QR'}
                  </button>
                  <button type="button" disabled={checking === p.id} onClick={() => check(p)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: dark ? 'white' : '#374151', border: `1px solid ${dark ? '#4b5563' : '#e5e7eb'}` }}>
                    <FaSyncAlt size={11} /> {checking === p.id ? 'Checking…' : "I've paid"}
                  </button>
                </div>
              )}
              {qrFor === p.id && p.linkUrl && (
                <div style={{ background: 'white', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                  <LinkQr url={p.linkUrl} />
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>Scan with any phone camera to pay</div>
                </div>
              )}
              {p.features.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '6px 0 0', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {p.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: 1.35, fontWeight: /:$/.test(f) ? 700 : 400 }}>
                      {!/:$/.test(f) && <FaCheck size={11} style={{ color: '#22c55e', flexShrink: 0, marginTop: 3 }} />}
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
