'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

export default function TableManagementClient() {
  const [tables, setTables] = useState(20);
  const [avgSeats, setAvgSeats] = useState(4);
  const [operatingHours, setOperatingHours] = useState(10);
  const [avgDiningTime, setAvgDiningTime] = useState(45);
  const [currentTurnover, setCurrentTurnover] = useState(2.5);
  const [avgCheck, setAvgCheck] = useState(500);
  const [calculated, setCalculated] = useState(false);

  const maxTurnsPerDay = (operatingHours * 60) / avgDiningTime;
  const optimizedTurnover = Math.min(currentTurnover * 1.3, maxTurnsPerDay);
  const currentCovers = Math.round(tables * avgSeats * currentTurnover * 0.75);
  const optimizedCovers = Math.round(tables * avgSeats * optimizedTurnover * 0.85);
  const currentRevenue = currentCovers * avgCheck;
  const optimizedRevenue = optimizedCovers * avgCheck;
  const additionalRevenue = optimizedRevenue - currentRevenue;
  const additionalCovers = optimizedCovers - currentCovers;

  const formatCurrency = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Table Turnover Optimizer' }]} />

      <div style={{ paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              Free Calculator &bull; No Login Required
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Table Turnover Optimizer</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Calculate your daily covers and revenue potential. See how optimizing table turnover boosts income.
            </p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Restaurant Details</h3>
                {[
                  { label: 'Number of Tables', value: tables, set: setTables, min: 5, max: 100, step: 1 },
                  { label: 'Avg Seats Per Table', value: avgSeats, set: setAvgSeats, min: 2, max: 10, step: 1 },
                  { label: 'Operating Hours', value: operatingHours, set: setOperatingHours, min: 4, max: 18, step: 1 },
                  { label: 'Avg Dining Time (min)', value: avgDiningTime, set: setAvgDiningTime, min: 15, max: 120, step: 5 },
                  { label: 'Current Turns / Day', value: currentTurnover, set: setCurrentTurnover, min: 1, max: 8, step: 0.5 },
                  { label: 'Avg Check (₹)', value: avgCheck, set: setAvgCheck, min: 100, max: 3000, step: 50 },
                ].map((field, idx) => (
                  <div key={idx} style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      <span>{field.label}</span>
                      <span style={{ color: '#0891b2' }}>{field.value}</span>
                    </label>
                    <input type="range" min={field.min} max={field.max} step={field.step} value={field.value}
                      onChange={(e) => field.set(Number(e.target.value))} style={{ width: '100%', accentColor: '#0891b2' }} />
                  </div>
                ))}
                <button onClick={() => setCalculated(true)} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>
                  Calculate Potential
                </button>
              </div>

              <div style={{ backgroundColor: calculated ? '#ecfeff' : '#f9fafb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Revenue Potential</h3>
                {calculated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Current Covers</p>
                        <p style={{ fontSize: '24px', fontWeight: '700', color: '#374151' }}>{currentCovers}</p>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Optimized Covers</p>
                        <p style={{ fontSize: '24px', fontWeight: '700', color: '#0891b2' }}>{optimizedCovers}</p>
                      </div>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Table Turnover Improvement</p>
                      <p style={{ fontSize: '20px', fontWeight: '700', color: '#374151' }}>{currentTurnover}x → {optimizedTurnover.toFixed(1)}x</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Daily Revenue Comparison</p>
                      <p style={{ fontSize: '16px', color: '#374151' }}>Current: <strong>{formatCurrency(currentRevenue)}</strong></p>
                      <p style={{ fontSize: '16px', color: '#0891b2' }}>Optimized: <strong>{formatCurrency(optimizedRevenue)}</strong></p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#0891b2', borderRadius: '12px', color: 'white' }}>
                      <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Additional Revenue / Day</p>
                      <p style={{ fontSize: '32px', fontWeight: '800' }}>+{formatCurrency(additionalRevenue)}</p>
                      <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.9 }}>+{additionalCovers} covers &bull; Monthly: +{formatCurrency(additionalRevenue * 26)}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>🪑</p>
                    <p>Adjust the sliders and click Calculate to see your table optimization potential</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#0891b2', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Smart Table Management with DineOpen</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Visual floor plans, real-time table status, table timers, reservation management.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#0891b2', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/table-management" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}
