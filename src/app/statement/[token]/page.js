'use client';

// Public customer credit statement (Khatabook-style) — opened from a link the restaurant sends by
// WhatsApp / email. No login. The link is signed and valid 30 days; the customer's phone is masked.

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { DEFAULT_API_BASE, PG_API_BASE } from '../../../lib/apiBase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

function niceDate(ymd) {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export default function PublicStatementPage() {
  const { token } = useParams();
  const [st, setSt] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | expired | missing | error
  const [open, setOpen] = useState({});
  const [qr, setQr] = useState('');

  useEffect(() => {
    if (!token) return undefined;
    let off = false;
    (async () => {
      const bases = [...new Set([PG_API_BASE, DEFAULT_API_BASE, API_URL].filter(Boolean))];
      let last = 'error';
      for (const base of bases) {
        try {
          const res = await fetch(`${base}/api/public/statement/${encodeURIComponent(token)}`);
          if (res.ok) { const j = await res.json(); if (!off) { setSt(j.statement); setState('ok'); } return; }
          if (res.status === 410) { last = 'expired'; break; }
          if (res.status === 404) last = 'missing';
        } catch { /* try next */ }
      }
      if (!off) setState(last);
    })();
    return () => { off = true; };
  }, [token]);

  const money = useMemo(() => {
    const code = (st && st.restaurant.currencyCode) || 'INR';
    const sym = (st && st.restaurant.currencySymbol) || '';
    return (n) => {
      const v = Math.round((Number(n) || 0) * 100) / 100;
      try { return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en', { style: 'currency', currency: code, maximumFractionDigits: 2 }).format(v); }
      catch { return `${sym}${v.toLocaleString()}`; }
    };
  }, [st]);

  const due = st ? st.totals.closingBalance : 0;
  const upi = st && st.restaurant.upiId && st.restaurant.currencyCode === 'INR' && due > 0
    ? `upi://pay?pa=${encodeURIComponent(st.restaurant.upiId)}&pn=${encodeURIComponent(st.restaurant.name)}&am=${due.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Statement')}`
    : null;
  useEffect(() => {
    if (!upi) return;
    QRCode.toDataURL(upi, { width: 180, margin: 1 }).then(setQr).catch(() => {});
  }, [upi]);

  if (state !== 'ok') {
    const text = state === 'loading' ? 'Loading statement…'
      : state === 'expired' ? 'This statement link has expired. Please ask the restaurant for a new one.'
        : state === 'missing' ? 'Statement not found.' : 'Could not load the statement. Please try again.';
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: FONT, color: '#64748b', padding: 24, textAlign: 'center' }}>{text}</div>;
  }

  const r = st.restaurant;
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: FONT, color: '#0f172a' }}>
      <style>{`@media print { .no-print { display: none !important } body { background: #fff } .sheet { box-shadow: none !important; border: none !important } }`}</style>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '16px 14px 40px' }}>
        <div className="sheet" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 16, boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {r.logo ? <img src={r.logo} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} /> : (
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{(r.name || '?').slice(0, 1)}</div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{[r.address, r.phone].filter(Boolean).join(' · ')}</div>
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 13, color: '#334155' }}>
            <b>{st.customer.name}</b>{st.customer.phone ? <span style={{ color: '#94a3b8' }}> · {st.customer.phone}</span> : null}
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Statement · {niceDate(st.period.from)} – {niceDate(st.period.to)}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 10 }}><div style={{ fontSize: 11, color: '#64748b' }}>Total bills ({st.totals.bills})</div><div style={{ fontWeight: 800 }}>{money(st.totals.billed)}</div></div>
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: 10 }}><div style={{ fontSize: 11, color: '#64748b' }}>Paid</div><div style={{ fontWeight: 800, color: '#047857' }}>{money(st.totals.paid)}</div></div>
            <div style={{ background: due > 0 ? '#fef2f2' : '#f0fdf4', borderRadius: 12, padding: 10 }}><div style={{ fontSize: 11, color: '#64748b' }}>Balance due</div><div style={{ fontWeight: 800, color: due > 0 ? '#b91c1c' : '#047857' }}>{money(due)}</div></div>
          </div>
          {st.openingBalance ? <div style={{ marginTop: 10, fontSize: 12, color: '#64748b' }}>Opening balance on {niceDate(st.period.from)}: <b style={{ color: '#0f172a' }}>{money(st.openingBalance)}</b></div> : null}

          <div style={{ marginTop: 14, border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr 92px 92px', background: '#f1f5f9', fontSize: 11, fontWeight: 700, color: '#475569', padding: '8px 10px' }}>
              <div>Date</div><div>Details</div><div style={{ textAlign: 'right' }}>Amount</div><div style={{ textAlign: 'right' }}>Balance</div>
            </div>
            {st.entries.length === 0 && <div style={{ padding: 14, fontSize: 13, color: '#64748b' }}>No activity in this period.</div>}
            {st.entries.map((e, i) => {
              const d = niceDate(e.localDate).split(' ').slice(0, 2).join(' ');
              if (e.type === 'bill') {
                const isOpen = !!open[i];
                return (
                  <div key={i} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <button type="button" onClick={() => setOpen(o => ({ ...o, [i]: !o[i] }))} style={{ width: '100%', display: 'grid', gridTemplateColumns: '72px 1fr 92px 92px', padding: '9px 10px', background: '#fff', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#0f172a', fontFamily: FONT }}>
                      <div style={{ color: '#64748b' }}>{d}</div>
                      <div>
                        Bill #{e.orderNumber} <span style={{ color: '#94a3b8', fontSize: 11 }}>{isOpen ? '▲' : '▼'} {e.items.length} items</span>
                        {e.paidOnBill > 0 && <div style={{ fontSize: 11, color: '#047857' }}>paid {money(e.paidOnBill)}</div>}
                        {e.notInBalance && <div style={{ fontSize: 11, color: '#b45309' }}>due {money(e.dueNow)}</div>}
                      </div>
                      <div style={{ textAlign: 'right' }}>{money(e.amount)}</div>
                      <div style={{ textAlign: 'right', color: '#b91c1c', fontWeight: 600 }}>{money(e.balanceAfter)}</div>
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 10px 10px 82px', fontSize: 12, color: '#475569' }}>
                        {e.items.length === 0 && <div style={{ color: '#94a3b8' }}>No item details</div>}
                        {e.items.map((it, j) => (
                          <div key={j} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '2px 0' }}>
                            <span>{it.qty}× {it.name}{it.variant ? ` (${it.variant})` : ''}</span><span>{money(it.total)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              if (e.type === 'payment') {
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 92px 92px', padding: '9px 10px', background: '#f0fdf4', borderTop: '1px solid #f1f5f9', fontSize: 13 }}>
                    <div style={{ color: '#64748b' }}>{d}</div>
                    <div style={{ color: '#047857' }}>Payment received{e.paymentMethod ? ` · ${e.paymentMethod}` : ''}</div>
                    <div style={{ textAlign: 'right', color: '#047857' }}>−{money(e.amount)}</div>
                    <div style={{ textAlign: 'right', fontWeight: 600 }}>{money(e.balanceAfter)}</div>
                  </div>
                );
              }
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr 92px 92px', padding: '9px 10px', borderTop: '1px solid #f1f5f9', fontSize: 13 }}>
                  <div style={{ color: '#64748b' }}>{d}</div>
                  <div>Adjustment{e.note ? <span style={{ color: '#94a3b8', fontSize: 11 }}> · {e.note}</span> : null}</div>
                  <div style={{ textAlign: 'right' }}>{e.change > 0 ? '+' : '−'}{money(Math.abs(e.change))}</div>
                  <div style={{ textAlign: 'right', fontWeight: 600 }}>{money(e.balanceAfter)}</div>
                </div>
              );
            })}
          </div>

          {upi && (
            <div className="no-print" style={{ marginTop: 16, textAlign: 'center' }}>
              <a href={upi} style={{ display: 'inline-block', background: '#16a34a', color: '#fff', padding: '12px 20px', borderRadius: 12, fontWeight: 800, textDecoration: 'none' }}>Pay {money(due)} via UPI</a>
              {qr && <div style={{ marginTop: 10 }}><img src={qr} alt="UPI QR" style={{ width: 160, height: 160 }} /><div style={{ fontSize: 11, color: '#64748b' }}>{r.upiId}</div></div>}
            </div>
          )}
          <div className="no-print" style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <button type="button" onClick={() => window.print()} style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, cursor: 'pointer' }}>Print / Save PDF</button>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 10 }}>Shared by {r.name} · Powered by DineOpen</div>
      </div>
    </div>
  );
}
