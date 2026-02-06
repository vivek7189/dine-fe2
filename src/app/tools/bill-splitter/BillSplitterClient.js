'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaUsers, FaPercent, FaRupeeSign, FaCalculator } from 'react-icons/fa';

export default function BillSplitterClient() {
  const [billAmount, setBillAmount] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [tipPercent, setTipPercent] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [taxPercent, setTaxPercent] = useState(5);
  const [roundUp, setRoundUp] = useState(false);

  const bill = parseFloat(billAmount) || 0;
  const tip = customTip ? parseFloat(customTip) : (bill * (tipPercent / 100));
  const tax = bill * (taxPercent / 100);
  const totalBill = bill + tip + tax;
  let perPerson = numberOfPeople > 0 ? totalBill / numberOfPeople : 0;

  if (roundUp) {
    perPerson = Math.ceil(perPerson / 10) * 10; // Round up to nearest 10
  }

  const tipPresets = [0, 5, 10, 15, 20];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Bill Splitter Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Split the bill easily among friends. Add tip and tax for accurate per-person totals.
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

              {/* Bill Amount */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <FaRupeeSign style={{ marginRight: '8px' }} />
                  Bill Amount
                </label>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="Enter bill amount"
                  style={{ width: '100%', padding: '14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '18px', fontWeight: '600' }}
                />
              </div>

              {/* Number of People */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <FaUsers style={{ marginRight: '8px' }} />
                  Number of People
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                    style={{ width: '48px', height: '48px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '10px', fontSize: '24px', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '28px', fontWeight: '700', minWidth: '60px', textAlign: 'center' }}>{numberOfPeople}</span>
                  <button
                    onClick={() => setNumberOfPeople(numberOfPeople + 1)}
                    style={{ width: '48px', height: '48px', backgroundColor: '#f3f4f6', border: 'none', borderRadius: '10px', fontSize: '24px', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tip */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  <FaPercent style={{ marginRight: '8px' }} />
                  Tip
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {tipPresets.map(t => (
                    <button
                      key={t}
                      onClick={() => { setTipPercent(t); setCustomTip(''); }}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: tipPercent === t && !customTip ? '#f59e0b' : '#f3f4f6',
                        color: tipPercent === t && !customTip ? 'white' : '#374151',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                      }}
                    >
                      {t}%
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={customTip}
                  onChange={(e) => { setCustomTip(e.target.value); setTipPercent(0); }}
                  placeholder="Or enter custom tip amount (₹)"
                  style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              {/* Tax */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  GST/Tax %
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[0, 5, 12, 18].map(t => (
                    <button
                      key={t}
                      onClick={() => setTaxPercent(t)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: taxPercent === t ? '#f59e0b' : '#f3f4f6',
                        color: taxPercent === t ? 'white' : '#374151',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
                      }}
                    >
                      {t}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Round Up */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={roundUp}
                    onChange={(e) => setRoundUp(e.target.checked)}
                    style={{ width: '20px', height: '20px' }}
                  />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Round up to nearest ₹10</span>
                </label>
              </div>

              {/* Results */}
              <div style={{ padding: '24px', backgroundColor: '#fef3c7', borderRadius: '12px' }}>
                <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#92400e' }}>
                    <span>Bill Amount</span>
                    <span>₹{bill.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#92400e' }}>
                    <span>Tip {tipPercent > 0 ? `(${tipPercent}%)` : ''}</span>
                    <span>₹{tip.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#92400e' }}>
                    <span>Tax ({taxPercent}%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: '#92400e', borderTop: '1px solid #fcd34d', paddingTop: '12px' }}>
                    <span>Total</span>
                    <span>₹{totalBill.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ padding: '20px', backgroundColor: '#f59e0b', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '4px' }}>Each Person Pays</p>
                  <p style={{ fontSize: '36px', fontWeight: '800', color: 'white' }}>₹{perPerson.toFixed(roundUp ? 0 : 2)}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>for {numberOfPeople} people</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f59e0b', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Split Bills Automatically at Your Restaurant</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen POS lets customers split bills by person or by item with one tap.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#f59e0b', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
