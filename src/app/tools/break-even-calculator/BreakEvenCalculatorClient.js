'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function BreakEvenCalculatorClient() {
  const [currency, setCurrency] = useState('$');
  const [fixedCosts, setFixedCosts] = useState('');
  const [avgOrderValue, setAvgOrderValue] = useState('');
  const [variableCostPercent, setVariableCostPercent] = useState(35);

  const fixed = parseFloat(fixedCosts) || 0;
  const avgOrder = parseFloat(avgOrderValue) || 0;
  const variablePercent = variableCostPercent / 100;

  const contributionMargin = avgOrder * (1 - variablePercent);
  const breakEvenOrders = contributionMargin > 0 ? Math.ceil(fixed / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenOrders * avgOrder;
  const ordersPerDay = breakEvenOrders / 30;

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              Restaurant Break-Even Calculator
            </h1>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Find out how many orders or customers you need each month to cover your costs and start making profit.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {/* Input Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Your Business Numbers</h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                  <option value="$">$ USD</option>
                  <option value="£">£ GBP</option>
                  <option value="₹">₹ INR</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Monthly Fixed Costs</label>
                <input type="number" value={fixedCosts} onChange={(e) => setFixedCosts(e.target.value)} placeholder="Rent, salaries, utilities, etc." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }} />
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Include rent, salaries, insurance, loan payments</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Average Order Value</label>
                <input type="number" value={avgOrderValue} onChange={(e) => setAvgOrderValue(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Variable Costs: {variableCostPercent}% of sales</label>
                <input type="range" min="20" max="50" value={variableCostPercent} onChange={(e) => setVariableCostPercent(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#ef4444' }} />
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Food costs, packaging, payment processing fees</p>
              </div>
            </div>

            {/* Results Card */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Your Break-Even Point</h2>

              <div style={{ marginBottom: '20px', padding: '24px', backgroundColor: '#fef2f2', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#991b1b', marginBottom: '8px' }}>Orders Needed Per Month</p>
                <p style={{ fontSize: '48px', fontWeight: '800', color: '#dc2626' }}>{breakEvenOrders.toLocaleString()}</p>
                <p style={{ fontSize: '14px', color: '#991b1b' }}>≈ {ordersPerDay.toFixed(0)} orders/day</p>
              </div>

              <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Break-Even Revenue</p>
                <p style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>{currency}{breakEvenRevenue.toLocaleString()}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>per month</p>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#ecfdf5', borderRadius: '10px' }}>
                <p style={{ fontSize: '14px', color: '#065f46', marginBottom: '4px' }}>Contribution Margin Per Order</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{currency}{contributionMargin.toFixed(2)}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Amount left after variable costs</p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>How to Lower Your Break-Even Point</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {[
                { title: 'Reduce Fixed Costs', desc: 'Negotiate rent, optimize staffing, reduce utilities' },
                { title: 'Increase Average Order', desc: 'Upsell, combo meals, add-ons, desserts' },
                { title: 'Lower Food Costs', desc: 'Better supplier deals, reduce waste, portion control' },
                { title: 'Improve Efficiency', desc: 'Faster service = more customers per day' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                  <h3 style={{ fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ef4444', borderRadius: '16px', color: 'white' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Track Your Numbers with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>Real-time sales analytics, cost tracking, and profit reports. Free 30-day trial.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
