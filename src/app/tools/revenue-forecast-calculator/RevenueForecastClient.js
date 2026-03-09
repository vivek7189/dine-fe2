'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

export default function RevenueForecastClient() {
  const [seats, setSeats] = useState(50);
  const [turns, setTurns] = useState(3);
  const [avgCheck, setAvgCheck] = useState(400);
  const [occupancy, setOccupancy] = useState(70);
  const [daysPerMonth, setDaysPerMonth] = useState(26);
  const [calculated, setCalculated] = useState(false);

  const dailyRevenue = seats * turns * avgCheck * (occupancy / 100);
  const monthlyRevenue = dailyRevenue * daysPerMonth;
  const annualRevenue = monthlyRevenue * 12;
  const dailyCovers = Math.round(seats * turns * (occupancy / 100));

  const formatCurrency = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Revenue Forecast Calculator' }]} />
      <div style={{ paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>Free Calculator &bull; No Login</div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Revenue Forecast Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>Estimate your daily, monthly & annual restaurant revenue based on seating capacity, table turnover, and average check.</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Your Restaurant</h3>
                {[
                  { label: 'Total Seats', value: seats, set: setSeats, min: 10, max: 300, step: 5 },
                  { label: 'Table Turns / Day', value: turns, set: setTurns, min: 1, max: 8, step: 0.5 },
                  { label: 'Avg Check (₹)', value: avgCheck, set: setAvgCheck, min: 100, max: 3000, step: 50 },
                  { label: 'Occupancy (%)', value: occupancy, set: setOccupancy, min: 20, max: 100, step: 5 },
                  { label: 'Operating Days / Month', value: daysPerMonth, set: setDaysPerMonth, min: 15, max: 31, step: 1 },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      <span>{f.label}</span><span style={{ color: '#2563eb' }}>{f.value}</span>
                    </label>
                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.value} onChange={(e) => f.set(Number(e.target.value))} style={{ width: '100%', accentColor: '#2563eb' }} />
                  </div>
                ))}
                <button onClick={() => setCalculated(true)} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>Calculate Revenue</button>
              </div>

              <div style={{ backgroundColor: calculated ? '#eff6ff' : '#f9fafb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Revenue Forecast</h3>
                {calculated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Daily Covers</p>
                      <p style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb' }}>{dailyCovers}</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Daily Revenue</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#374151' }}>{formatCurrency(dailyRevenue)}</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Monthly Revenue</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{formatCurrency(monthlyRevenue)}</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#2563eb', borderRadius: '12px', color: 'white' }}>
                      <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Annual Revenue Projection</p>
                      <p style={{ fontSize: '32px', fontWeight: '800' }}>{formatCurrency(annualRevenue)}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>📈</p>
                    <p>Adjust sliders and click Calculate to see your revenue forecast</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#2563eb', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Track Real Revenue with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Get real-time revenue analytics, daily summaries, and insights in DineOpen POS.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#2563eb', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </section>
        <InternalLinks currentPath="/tools/revenue-forecast-calculator" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}
