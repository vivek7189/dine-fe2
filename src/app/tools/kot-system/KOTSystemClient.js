'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

export default function KOTSystemClient() {
  const [ordersPerDay, setOrdersPerDay] = useState(80);
  const [avgPrepTime, setAvgPrepTime] = useState(15);
  const [errorRate, setErrorRate] = useState(8);
  const [avgOrderValue, setAvgOrderValue] = useState(350);
  const [calculated, setCalculated] = useState(false);

  const digitalErrorRate = Math.max(errorRate * 0.15, 0.5);
  const timeSavedPerOrder = 3;
  const totalTimeSavedMin = ordersPerDay * timeSavedPerOrder;
  const totalTimeSavedHrs = (totalTimeSavedMin / 60).toFixed(1);
  const errorsSavedPerDay = Math.round(ordersPerDay * (errorRate / 100) - ordersPerDay * (digitalErrorRate / 100));
  const costPerError = avgOrderValue * 0.5;
  const dailySavings = errorsSavedPerDay * costPerError;
  const monthlySavings = dailySavings * 26;

  const formatCurrency = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'KOT Efficiency Calculator' }]} />

      <div style={{ paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>
              Free Calculator &bull; No Login Required
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>KOT Efficiency Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Calculate how much time and money a digital KOT system saves your kitchen.
            </p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Kitchen Details</h3>
                {[
                  { label: 'Orders Per Day', value: ordersPerDay, set: setOrdersPerDay, min: 10, max: 500, step: 10 },
                  { label: 'Avg Prep Time (min)', value: avgPrepTime, set: setAvgPrepTime, min: 5, max: 45, step: 1 },
                  { label: 'Current Error Rate (%)', value: errorRate, set: setErrorRate, min: 1, max: 25, step: 1 },
                  { label: 'Avg Order Value (₹)', value: avgOrderValue, set: setAvgOrderValue, min: 100, max: 2000, step: 50 },
                ].map((field, idx) => (
                  <div key={idx} style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      <span>{field.label}</span>
                      <span style={{ color: '#059669' }}>{field.value}</span>
                    </label>
                    <input type="range" min={field.min} max={field.max} step={field.step} value={field.value}
                      onChange={(e) => field.set(Number(e.target.value))} style={{ width: '100%', accentColor: '#059669' }} />
                  </div>
                ))}
                <button onClick={() => setCalculated(true)} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>
                  Calculate Savings
                </button>
              </div>

              <div style={{ backgroundColor: calculated ? '#ecfdf5' : '#f9fafb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Your KOT Savings</h3>
                {calculated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#059669' }}>{totalTimeSavedHrs}h</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>Time Saved / Day</p>
                      </div>
                      <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <p style={{ fontSize: '28px', fontWeight: '800', color: '#059669' }}>{errorsSavedPerDay}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>Errors Prevented / Day</p>
                      </div>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Error Rate Reduction</p>
                      <p style={{ fontSize: '20px', fontWeight: '700', color: '#374151' }}>{errorRate}% → {digitalErrorRate.toFixed(1)}%</p>
                      <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${100 - (digitalErrorRate / errorRate * 100)}%`, backgroundColor: '#059669', borderRadius: '4px' }} />
                      </div>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: '#059669', borderRadius: '12px', color: 'white' }}>
                      <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Monthly Cost Savings</p>
                      <p style={{ fontSize: '32px', fontWeight: '800' }}>{formatCurrency(monthlySavings)}</p>
                      <p style={{ fontSize: '14px', marginTop: '8px', opacity: 0.9 }}>Annual: {formatCurrency(monthlySavings * 12)}</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>🍳</p>
                    <p>Adjust the sliders and click Calculate to see your KOT efficiency gains</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#059669', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Go Digital with DineOpen KOT</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Real-time kitchen display, auto-print KOTs, multi-station routing.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/kot-system" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}
