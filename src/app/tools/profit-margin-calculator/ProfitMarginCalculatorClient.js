'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function ProfitMarginCalculatorClient() {
  const [currency, setCurrency] = useState('$');
  const [foodCost, setFoodCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [targetMargin, setTargetMargin] = useState(70);

  const cost = parseFloat(foodCost) || 0;
  const price = parseFloat(sellingPrice) || 0;

  const foodCostPercent = price > 0 ? (cost / price) * 100 : 0;
  const grossProfit = price - cost;
  const profitMargin = price > 0 ? ((price - cost) / price) * 100 : 0;
  const suggestedPrice = cost > 0 ? cost / (1 - targetMargin / 100) : 0;
  const markup = cost > 0 ? ((price - cost) / cost) * 100 : 0;

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              Food Cost & Profit Margin Calculator
            </h1>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Calculate your food cost percentage, profit margins, and find the ideal menu price for any dish.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {/* Input Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Enter Your Numbers</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                  <option value="$">$ USD</option>
                  <option value="£">£ GBP</option>
                  <option value="₹">₹ INR</option>
                  <option value="€">€ EUR</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Food Cost (Ingredients)</label>
                <input type="number" value={foodCost} onChange={(e) => setFoodCost(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Selling Price</label>
                <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Target Profit Margin: {targetMargin}%</label>
                <input type="range" min="50" max="85" value={targetMargin} onChange={(e) => setTargetMargin(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#ef4444' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
                  <span>50%</span><span>70%</span><span>85%</span>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Your Results</h2>

              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: foodCostPercent <= 30 ? '#d1fae5' : foodCostPercent <= 35 ? '#fef3c7' : '#fee2e2', borderRadius: '10px' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Food Cost Percentage</p>
                <p style={{ fontSize: '32px', fontWeight: '800', color: foodCostPercent <= 30 ? '#059669' : foodCostPercent <= 35 ? '#d97706' : '#dc2626' }}>{foodCostPercent.toFixed(1)}%</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Target: 25-35%</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Gross Profit</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{currency}{grossProfit.toFixed(2)}</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Profit Margin</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: profitMargin >= 65 ? '#059669' : '#d97706' }}>{profitMargin.toFixed(1)}%</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Markup</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>{markup.toFixed(0)}%</p>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#dbeafe', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>Suggested Price</p>
                  <p style={{ fontSize: '24px', fontWeight: '700', color: '#1e40af' }}>{currency}{suggestedPrice.toFixed(2)}</p>
                  <p style={{ fontSize: '10px', color: '#6b7280' }}>For {targetMargin}% margin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benchmarks */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Industry Benchmarks</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { type: 'Fast Food', cost: '25-30%', margin: '70-75%' },
                { type: 'Casual Dining', cost: '28-35%', margin: '65-72%' },
                { type: 'Fine Dining', cost: '30-35%', margin: '65-70%' },
                { type: 'Cafe/Coffee', cost: '20-25%', margin: '75-80%' },
                { type: 'Pizza', cost: '25-30%', margin: '70-75%' },
                { type: 'Bar/Drinks', cost: '18-24%', margin: '76-82%' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.type}</p>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>Food Cost: {item.cost}</p>
                  <p style={{ fontSize: '14px', color: '#059669' }}>Margin: {item.margin}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ef4444', borderRadius: '16px', color: 'white' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Track All Your Costs with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>Automated inventory tracking, cost analysis, and profit reports. Free 30-day trial.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
