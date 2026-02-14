'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function TipCalculatorClient() {
  const [billAmount, setBillAmount] = useState('');
  const [tipPercent, setTipPercent] = useState(18);
  const [numPeople, setNumPeople] = useState(1);
  const [currency, setCurrency] = useState('$');

  const bill = parseFloat(billAmount) || 0;
  const tipAmount = bill * (tipPercent / 100);
  const totalAmount = bill + tipAmount;
  const perPersonTip = tipAmount / numPeople;
  const perPersonTotal = totalAmount / numPeople;

  const tipPresets = [10, 15, 18, 20, 25];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              Restaurant Tip Calculator
            </h1>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Calculate tips instantly, split bills between guests, and get per-person amounts. Free forever.
            </p>
          </div>

          {/* Calculator Card */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
            {/* Bill Amount */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Bill Amount
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }}
                >
                  <option value="$">$ USD</option>
                  <option value="£">£ GBP</option>
                  <option value="₹">₹ INR</option>
                  <option value="€">€ EUR</option>
                </select>
                <input
                  type="number"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="0.00"
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '18px' }}
                />
              </div>
            </div>

            {/* Tip Percentage */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Tip Percentage: {tipPercent}%
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {tipPresets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setTipPercent(preset)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: tipPercent === preset ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: tipPercent === preset ? '#fef2f2' : 'white',
                      color: tipPercent === preset ? '#ef4444' : '#374151',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={tipPercent}
                onChange={(e) => setTipPercent(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444' }}
              />
            </div>

            {/* Number of People */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                Split Between
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => setNumPeople(Math.max(1, numPeople - 1))}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '20px', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ fontSize: '24px', fontWeight: '700', minWidth: '60px', textAlign: 'center' }}>
                  {numPeople} {numPeople === 1 ? 'person' : 'people'}
                </span>
                <button
                  onClick={() => setNumPeople(numPeople + 1)}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '20px', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Results */}
            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Tip Amount</p>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{currency}{tipAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total with Tip</p>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>{currency}{totalAmount.toFixed(2)}</p>
                </div>
                {numPeople > 1 && (
                  <>
                    <div>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Tip per Person</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{currency}{perPersonTip.toFixed(2)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total per Person</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>{currency}{perPersonTotal.toFixed(2)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tipping Guide */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
              Restaurant Tipping Guide
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                <strong>10-15%</strong> - Acceptable service, counter service, or takeout
              </div>
              <div style={{ padding: '16px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                <strong>18-20%</strong> - Good service, standard for sit-down restaurants
              </div>
              <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                <strong>20-25%</strong> - Excellent service, fine dining, or large groups
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ef4444', borderRadius: '16px', color: 'white' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
              Run a Restaurant? Try DineOpen POS
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>
              AI-powered billing, QR menus, tip tracking & more. Free 30-day trial.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
            >
              Start Free Trial →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
