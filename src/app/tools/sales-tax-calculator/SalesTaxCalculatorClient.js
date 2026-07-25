'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

// Statewide base sales-tax rates (%). Local city/county rates add on top —
// the calculator lets the user enter a local rate for an exact total.
const STATE_RATES = {
  Alabama: 4, Alaska: 0, Arizona: 5.6, Arkansas: 6.5, California: 7.25, Colorado: 2.9,
  Connecticut: 6.35, Delaware: 0, 'District of Columbia': 6, Florida: 6, Georgia: 4, Hawaii: 4,
  Idaho: 6, Illinois: 6.25, Indiana: 7, Iowa: 6, Kansas: 6.5, Kentucky: 6, Louisiana: 4.45,
  Maine: 5.5, Maryland: 6, Massachusetts: 6.25, Michigan: 6, Minnesota: 6.875, Mississippi: 7,
  Missouri: 4.225, Montana: 0, Nebraska: 5.5, Nevada: 6.85, 'New Hampshire': 0, 'New Jersey': 6.625,
  'New Mexico': 4.875, 'New York': 4, 'North Carolina': 4.75, 'North Dakota': 5, Ohio: 5.75,
  Oklahoma: 4.5, Oregon: 0, Pennsylvania: 6, 'Rhode Island': 7, 'South Carolina': 6, 'South Dakota': 4.2,
  Tennessee: 7, Texas: 6.25, Utah: 6.1, Vermont: 6, Virginia: 5.3, Washington: 6.5, 'West Virginia': 6,
  Wisconsin: 5, Wyoming: 4,
};

const FAQS = [
  { q: 'How do I calculate US restaurant sales tax?', a: 'Multiply the pre-tax amount by the combined sales-tax rate (state base rate plus any local city/county rate), then add it to the subtotal. For example, a $100 check in California (7.25% base) with a 1.5% local rate = $100 × 8.75% = $8.75 tax, for a $108.75 total.' },
  { q: 'Does every US state charge sales tax on restaurant food?', a: 'No. Five states have no statewide sales tax — Alaska, Delaware, Montana, New Hampshire and Oregon — though Alaska allows local sales taxes. Most other states tax prepared restaurant food, and some apply special meals taxes on top.' },
  { q: 'What is the difference between state and local sales tax?', a: 'The state base rate is set statewide; cities and counties can add local rates on top. A POS like DineOpen applies the correct combined rate automatically by location so you never have to look it up.' },
];

export default function SalesTaxCalculatorClient() {
  const [amount, setAmount] = useState('');
  const [state, setState] = useState('California');
  const [localRate, setLocalRate] = useState('');

  const base = STATE_RATES[state] ?? 0;
  const local = parseFloat(localRate) || 0;
  const rate = base + local;
  const amt = parseFloat(amount) || 0;
  const tax = amt * (rate / 100);
  const total = amt + tax;
  const money = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const label = { display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151', marginBottom: '6px' };
  const input = { width: '100%', padding: '12px 14px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '16px', color: '#111827', outline: 'none' };
  const card = { background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', background: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>US Restaurant Sales Tax Calculator</h1>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '620px', margin: '0 auto' }}>Calculate restaurant sales tax by state in seconds. Add your local city/county rate for an exact total. Free forever.</p>
          </div>

          <div style={{ ...card, marginBottom: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={label}>Amount (pre-tax)</label>
                <input style={input} type="number" inputMode="decimal" placeholder="100.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label style={label}>State</label>
                <select style={{ ...input, cursor: 'pointer' }} value={state} onChange={(e) => setState(e.target.value)}>
                  {Object.keys(STATE_RATES).map((s) => <option key={s} value={s}>{s} — {STATE_RATES[s]}%</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <label style={label}>Local city/county rate (optional %)</label>
              <input style={input} type="number" inputMode="decimal" placeholder="e.g. 1.5" value={localRate} onChange={(e) => setLocalRate(e.target.value)} />
            </div>

            <div style={{ marginTop: '20px', background: '#f9fafb', borderRadius: '12px', padding: '20px' }}>
              <Row label={`State base rate (${state})`} value={`${base}%`} />
              {local > 0 && <Row label="Local rate" value={`${local}%`} />}
              <Row label="Combined rate" value={`${rate.toFixed(3).replace(/\.?0+$/, '')}%`} bold />
              <Row label="Sales tax" value={money(tax)} bold />
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
              <Row label="Total with tax" value={money(total)} big />
            </div>
          </div>

          {/* SEO / AEO content */}
          <div style={card}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>How US restaurant sales tax works</h2>
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, marginBottom: '16px' }}>
              US sales tax is charged as a percentage of the pre-tax check. Each state sets a base rate, and cities and counties can add local rates on top — so two restaurants in the same state can charge different totals. Rather than looking rates up by hand, <Link href="/usa" style={{ color: '#ef4444', fontWeight: 600 }}>DineOpen’s POS</Link> applies the correct combined rate automatically by location, handles special meals taxes, and produces IRS Form 8027 tip reporting.
            </p>
            {FAQS.map((f) => (
              <div key={f.q} style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '14px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{f.q}</div>
                <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>{f.a}</div>
              </div>
            ))}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/tools/tip-calculator" style={pill}>Tip Calculator</Link>
              <Link href="/tools/food-cost-calculator" style={pill}>Food Cost Calculator</Link>
              <Link href="/usa" style={pill}>US Restaurant POS</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const pill = { fontSize: '13px', fontWeight: 700, color: '#ef4444', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '8px 14px', textDecoration: 'none' };

function Row({ label, value, bold, big }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
      <span style={{ fontSize: big ? '16px' : '14px', color: '#6b7280', fontWeight: bold || big ? 700 : 500 }}>{label}</span>
      <span style={{ fontSize: big ? '24px' : '15px', fontWeight: bold || big ? 800 : 600, color: big ? '#ef4444' : '#111827' }}>{value}</span>
    </div>
  );
}

export { FAQS };
