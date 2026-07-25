'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

// Effective sales tax on restaurant meals by province (GST, HST, or GST+QST for Quebec).
const PROVINCE_RATES = {
  Alberta: 5, 'British Columbia': 5, Manitoba: 5, 'New Brunswick': 15,
  'Newfoundland and Labrador': 15, 'Northwest Territories': 5, 'Nova Scotia': 14,
  Nunavut: 5, Ontario: 13, 'Prince Edward Island': 15, Quebec: 14.975,
  Saskatchewan: 5, Yukon: 5,
};
const PROVINCE_NOTE = {
  Ontario: '13% HST', Quebec: '5% GST + 9.975% QST', Alberta: '5% GST (no PST)',
  'British Columbia': '5% GST', 'New Brunswick': '15% HST', 'Nova Scotia': '14% HST',
};

export default function GstHstCalculatorClient() {
  const [amount, setAmount] = useState('');
  const [province, setProvince] = useState('Ontario');
  const [mode, setMode] = useState('add');

  const rate = PROVINCE_RATES[province] ?? 5;
  const amt = parseFloat(amount) || 0;
  let net, tax, total;
  if (mode === 'add') { net = amt; tax = amt * (rate / 100); total = net + tax; }
  else { total = amt; net = amt / (1 + rate / 100); tax = total - net; }
  const money = (n) => 'C$' + n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>Canada GST/HST Calculator</h1>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '620px', margin: '0 auto' }}>Calculate GST, HST or Quebec QST on restaurant meals by province. Add or remove tax instantly. Free forever.</p>
          </div>

          <div style={{ ...card, marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#f3f4f6', borderRadius: '10px', marginBottom: '16px' }}>
              <button style={seg(mode === 'add')} onClick={() => setMode('add')}>Add tax (net → total)</button>
              <button style={seg(mode === 'remove')} onClick={() => setMode('remove')}>Remove tax (total → net)</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={label}>{mode === 'add' ? 'Amount (pre-tax)' : 'Total (incl. tax)'}</label>
                <input style={input} type="number" inputMode="decimal" placeholder="100.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label style={label}>Province / territory</label>
                <select style={{ ...input, cursor: 'pointer' }} value={province} onChange={(e) => setProvince(e.target.value)}>
                  {Object.keys(PROVINCE_RATES).map((p) => <option key={p} value={p}>{p} — {PROVINCE_RATES[p]}%</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '20px', background: '#f9fafb', borderRadius: '12px', padding: '20px' }}>
              <Row label={`Tax rate (${PROVINCE_NOTE[province] || `${rate}%`})`} value={`${rate}%`} />
              <Row label="Net (pre-tax)" value={money(net)} />
              <Row label="GST/HST/QST" value={money(tax)} bold />
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '10px 0' }} />
              <Row label="Total" value={money(total)} big />
            </div>
          </div>

          <div style={card}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', marginBottom: '10px' }}>How GST/HST works for Canadian restaurants</h2>
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.7, marginBottom: '16px' }}>
              Canada charges a 5% federal GST. Some provinces combine it with their provincial tax into a single HST — for example 13% in Ontario and 15% in the Atlantic provinces — while Quebec adds a separate 9.975% QST on top of GST. Restaurant meals are generally taxable. <Link href="/canada" style={{ color: '#ef4444', fontWeight: 600 }}>DineOpen’s POS</Link> applies the correct GST/HST/QST by province automatically and supports Quebec’s Bill 72 pre-tax tipping and bilingual receipts.
            </p>
            {FAQS.map((f) => (
              <div key={f.q} style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '14px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{f.q}</div>
                <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: 1.6 }}>{f.a}</div>
              </div>
            ))}
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link href="/tools/food-cost-calculator" style={pill}>Food Cost Calculator</Link>
              <Link href="/canada/quebec" style={pill}>Quebec POS (Bill 72)</Link>
              <Link href="/canada" style={pill}>Canada Restaurant POS</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

const FAQS = [
  { q: 'What is the GST/HST rate on restaurant meals in Canada?', a: 'It depends on the province: 5% GST in Alberta, BC, Saskatchewan, Manitoba and the territories; 13% HST in Ontario; 15% HST in New Brunswick, Newfoundland & Labrador and PEI; 14% HST in Nova Scotia; and 5% GST + 9.975% QST (about 14.975%) in Quebec.' },
  { q: 'Does Quebec charge QST as well as GST on restaurant food?', a: 'Yes. Quebec applies the 5% federal GST plus a 9.975% provincial QST, for roughly 14.975% total. Quebec also requires bilingual French receipts and Bill 72 pre-tax tip presentation.' },
  { q: 'How do I remove GST/HST from a total?', a: 'Divide the tax-inclusive total by 1 plus the rate. For example, in Ontario (13% HST): C$113 ÷ 1.13 = C$100 net, so the tax is C$13. This calculator does it instantly in “Remove tax” mode.' },
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
