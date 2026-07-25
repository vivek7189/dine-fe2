'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

const RATES = [
  { value: 20, label: '20% — Standard (eat-in, hot takeaway)' },
  { value: 5, label: '5% — Reduced' },
  { value: 0, label: '0% — Zero-rated (most cold takeaway)' },
];

export default function VatCalculatorClient() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(20);
  const [mode, setMode] = useState('add'); // 'add' = net→gross, 'remove' = gross→net

  const amt = parseFloat(amount) || 0;
  let net, vat, gross;
  if (mode === 'add') {
    net = amt; vat = amt * (rate / 100); gross = net + vat;
  } else {
    gross = amt; net = amt / (1 + rate / 100); vat = gross - net;
  }
  const money = (n) => '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const label = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' };
  const input = { width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '16px', color: '#111827', outline: 'none' };
  const card = { background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' };
  const seg = (active) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px', background: active ? '#fff' : 'transparent', color: active ? '#111827' : '#6b7280', boxShadow: active ? '0 2px 8px rgba(0,0,0,0.08)' : 'none' });

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', background: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>UK VAT Calculator</h1>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '620px', margin: '0 auto' }}>Add or remove UK VAT at 20%, 5% or 0% and see the net, VAT and gross instantly. Built for restaurants, pubs & takeaways. Free forever.</p>
          </div>

          <div style={{ ...card, marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#f3f4f6', borderRadius: '10px', marginBottom: '16px' }}>
              <button style={seg(mode === 'add')} onClick={() => setMode('add')}>Add VAT (net → gross)</button>
              <button style={seg(mode === 'remove')} onClick={() => setMode('remove')}>Remove VAT (gross → net)</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={label}>{mode === 'add' ? 'Net amount (excl. VAT)' : 'Gross amount (incl. VAT)'}</label>
                <input style={input} type="number" inputMode="decimal" placeholder="100.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label style={label}>VAT rate</label>
                <select style={{ ...input, cursor: 'pointer' }} value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}>
                  {RATES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px', background: '#f9fafb', borderRadius: '12px', padding: '20px' }}>
              <Row label="Net (excl. VAT)" value={money(net)} />
              <Row label={`VAT (${rate}%)`} value={money(vat)} bold />
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
              <Row label="Gross (incl. VAT)" value={money(gross)} big />
            </div>
          </div>

          <div style={card}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>How UK restaurant VAT works</h2>
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, marginBottom: '16px' }}>
              Standard UK VAT is 20%. For restaurants the rate depends on how food is sold: <strong>eat-in and hot takeaway are standard-rated at 20%</strong>, while <strong>most cold takeaway food is zero-rated (0%)</strong>. Getting this split right on every order matters for your VAT return. <Link href="/uk" style={{ color: '#ef4444', fontWeight: 600 }}>DineOpen’s EPOS</Link> applies the correct eat-in vs takeaway VAT automatically and exports Making Tax Digital data to Xero.
            </p>
            {FAQS.map((f) => (
              <div key={f.q} style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '14px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{f.q}</div>
                <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>{f.a}</div>
              </div>
            ))}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/tools/food-cost-calculator" style={pill}>Food Cost Calculator</Link>
              <Link href="/blog/free-qr-code-menu-uk-restaurants" style={pill}>Free QR Menu (UK)</Link>
              <Link href="/uk" style={pill}>UK Restaurant EPOS</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const FAQS = [
  { q: 'What is the VAT rate for UK restaurants?', a: 'The standard UK VAT rate is 20%. Eat-in meals and hot takeaway food are standard-rated at 20%, while most cold takeaway food (eaten off the premises) is zero-rated at 0%. A reduced 5% rate applies to some supplies.' },
  { q: 'How do I remove VAT from a gross price?', a: 'Divide the gross (VAT-inclusive) amount by 1.20 for the 20% rate to get the net amount, then subtract to find the VAT. For example, £120 gross ÷ 1.20 = £100 net, so the VAT is £20. This calculator does it instantly in “Remove VAT” mode.' },
  { q: 'Do I charge VAT on takeaway food in the UK?', a: 'Hot takeaway food is standard-rated at 20%, but most cold takeaway food is zero-rated. Because the rate depends on eat-in vs takeaway and hot vs cold, an EPOS that applies the right rate per item keeps your VAT return accurate.' },
];

const pill = { fontSize: '13px', fontWeight: 700, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 14px', textDecoration: 'none' };

function Row({ label, value, bold, big }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
      <span style={{ fontSize: big ? '16px' : '14px', color: '#6b7280', fontWeight: bold || big ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: big ? '24px' : '15px', fontWeight: bold || big ? 800 : 600, color: big ? '#ef4444' : '#111827' }}>{value}</span>
    </div>
  );
}
