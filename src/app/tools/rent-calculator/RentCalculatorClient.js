'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function RentCalculatorClient() {
  const [method, setMethod] = useState('revenue');
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [avgCheck, setAvgCheck] = useState('');
  const [dailyCovers, setDailyCovers] = useState('');
  const [proposedRent, setProposedRent] = useState('');

  const getMonthlyRevenue = () => {
    if (method === 'revenue') {
      return parseFloat(monthlyRevenue) || 0;
    }
    const check = parseFloat(avgCheck) || 0;
    const covers = parseFloat(dailyCovers) || 0;
    return check * covers * 30;
  };

  const calculateRent = () => {
    const revenue = getMonthlyRevenue();
    if (revenue <= 0) return null;

    const rent = parseFloat(proposedRent) || 0;
    const rentPercent = rent > 0 ? (rent / revenue) * 100 : 0;

    return {
      revenue,
      conservative: revenue * 0.05,
      moderate: revenue * 0.08,
      aggressive: revenue * 0.10,
      proposedRent: rent,
      rentPercent,
      isHealthy: rentPercent <= 10,
      isCritical: rentPercent > 15,
    };
  };

  const result = calculateRent();

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Rent Affordability Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Calculate how much rent your restaurant can sustainably afford
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
              {/* Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Revenue Details</h3>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Calculate Based On
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setMethod('revenue')}
                      style={{
                        flex: 1, padding: '12px',
                        backgroundColor: method === 'revenue' ? '#dc2626' : '#f3f4f6',
                        color: method === 'revenue' ? 'white' : '#374151',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
                      }}
                    >
                      Monthly Revenue
                    </button>
                    <button
                      onClick={() => setMethod('covers')}
                      style={{
                        flex: 1, padding: '12px',
                        backgroundColor: method === 'covers' ? '#dc2626' : '#f3f4f6',
                        color: method === 'covers' ? 'white' : '#374151',
                        border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'
                      }}
                    >
                      Daily Covers
                    </button>
                  </div>
                </div>

                {method === 'revenue' ? (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Expected Monthly Revenue (₹)
                    </label>
                    <input
                      type="number"
                      value={monthlyRevenue}
                      onChange={(e) => setMonthlyRevenue(e.target.value)}
                      placeholder="e.g., 1000000"
                      style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                    />
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Average Bill Value (₹)
                      </label>
                      <input
                        type="number"
                        value={avgCheck}
                        onChange={(e) => setAvgCheck(e.target.value)}
                        placeholder="e.g., 500"
                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                      />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Expected Daily Covers
                      </label>
                      <input
                        type="number"
                        value={dailyCovers}
                        onChange={(e) => setDailyCovers(e.target.value)}
                        placeholder="e.g., 100"
                        style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                      />
                    </div>
                  </>
                )}

                <div style={{ marginBottom: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Proposed Rent (Optional - ₹/month)
                  </label>
                  <input
                    type="number"
                    value={proposedRent}
                    onChange={(e) => setProposedRent(e.target.value)}
                    placeholder="e.g., 80000"
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  />
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Enter to check if a specific rent is affordable</p>
                </div>
              </div>

              {/* Results */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Rent Affordability</h3>

                {result ? (
                  <>
                    <div style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '12px', marginBottom: '24px', textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Expected Monthly Revenue</p>
                      <p style={{ fontSize: '28px', fontWeight: '800', color: '#111827' }}>₹{result.revenue.toLocaleString()}</p>
                    </div>

                    <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Affordable Rent Range</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', backgroundColor: '#dcfce7', borderRadius: '8px', border: '1px solid #86efac' }}>
                        <span style={{ color: '#166534', fontWeight: '500' }}>Conservative (5%)</span>
                        <span style={{ color: '#166534', fontWeight: '700' }}>₹{result.conservative.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', backgroundColor: '#fef9c3', borderRadius: '8px', border: '1px solid #fde047' }}>
                        <span style={{ color: '#854d0e', fontWeight: '500' }}>Moderate (8%)</span>
                        <span style={{ color: '#854d0e', fontWeight: '700' }}>₹{result.moderate.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                        <span style={{ color: '#991b1b', fontWeight: '500' }}>Max Limit (10%)</span>
                        <span style={{ color: '#991b1b', fontWeight: '700' }}>₹{result.aggressive.toLocaleString()}</span>
                      </div>
                    </div>

                    {result.proposedRent > 0 && (
                      <div style={{
                        padding: '20px',
                        backgroundColor: result.isCritical ? '#fef2f2' : result.isHealthy ? '#f0fdf4' : '#fefce8',
                        borderRadius: '12px',
                        border: `2px solid ${result.isCritical ? '#dc2626' : result.isHealthy ? '#22c55e' : '#eab308'}`
                      }}>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Proposed Rent Analysis</p>
                        <p style={{ fontSize: '24px', fontWeight: '800', color: result.isCritical ? '#dc2626' : result.isHealthy ? '#22c55e' : '#eab308' }}>
                          {result.rentPercent.toFixed(1)}% of Revenue
                        </p>
                        <p style={{ fontSize: '14px', marginTop: '8px', color: result.isCritical ? '#dc2626' : result.isHealthy ? '#166534' : '#854d0e' }}>
                          {result.isCritical ? '⚠️ Too High! This rent is not sustainable.' :
                           result.isHealthy ? '✅ This rent is within healthy limits.' :
                           '⚡ Slightly high. Negotiate if possible.'}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    <p>Enter revenue details to calculate affordable rent</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div style={{ marginTop: '48px', backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>Restaurant Rent Guidelines</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Industry Benchmarks</h4>
                  <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8', paddingLeft: '20px' }}>
                    <li>Target: 5-8% of gross revenue</li>
                    <li>Maximum: 10% (risky above this)</li>
                    <li>Mall locations: 8-12% + CAM</li>
                    <li>High street: 6-10% typical</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Negotiation Tips</h4>
                  <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8', paddingLeft: '20px' }}>
                    <li>Ask for rent-free fit-out period</li>
                    <li>Negotiate revenue-share model</li>
                    <li>Lock in annual escalation cap</li>
                    <li>Include exit clause for first year</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Hidden Costs</h4>
                  <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8', paddingLeft: '20px' }}>
                    <li>CAM charges (mall)</li>
                    <li>Property tax share</li>
                    <li>Security deposit (3-6 months)</li>
                    <li>Annual escalation (5-10%)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#dc2626', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Plan Your Restaurant Finances</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Use our complete startup guide to budget for all expenses.</p>
            <Link href="/resources/startup-guide" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Read Startup Guide
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
