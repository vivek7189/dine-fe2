'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

export default function CLVCalculatorClient() {
  const [avgSpend, setAvgSpend] = useState(450);
  const [visitsPerMonth, setVisitsPerMonth] = useState(2);
  const [lifespanYears, setLifespanYears] = useState(3);
  const [profitMargin, setProfitMargin] = useState(25);
  const [acquisitionCost, setAcquisitionCost] = useState(200);
  const [calculated, setCalculated] = useState(false);

  const totalRevenue = avgSpend * visitsPerMonth * 12 * lifespanYears;
  const clv = totalRevenue * (profitMargin / 100);
  const roi = acquisitionCost > 0 ? ((clv - acquisitionCost) / acquisitionCost * 100).toFixed(0) : 0;
  const monthlyValue = avgSpend * visitsPerMonth * (profitMargin / 100);

  const formatCurrency = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Customer Lifetime Value Calculator' }]} />
      <div style={{ paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>Free Calculator &bull; No Login</div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Customer Lifetime Value Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>Know how much each customer is worth to your restaurant over their lifetime. Make smarter marketing & retention decisions.</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Customer Details</h3>
                {[
                  { label: 'Avg Spend Per Visit (₹)', value: avgSpend, set: setAvgSpend, min: 100, max: 3000, step: 50 },
                  { label: 'Visits Per Month', value: visitsPerMonth, set: setVisitsPerMonth, min: 1, max: 10, step: 0.5 },
                  { label: 'Customer Lifespan (Years)', value: lifespanYears, set: setLifespanYears, min: 1, max: 10, step: 0.5 },
                  { label: 'Profit Margin (%)', value: profitMargin, set: setProfitMargin, min: 5, max: 60, step: 1 },
                  { label: 'Acquisition Cost (₹)', value: acquisitionCost, set: setAcquisitionCost, min: 0, max: 2000, step: 50 },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      <span>{f.label}</span><span style={{ color: '#7c3aed' }}>{f.value}</span>
                    </label>
                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.value} onChange={(e) => f.set(Number(e.target.value))} style={{ width: '100%', accentColor: '#7c3aed' }} />
                  </div>
                ))}
                <button onClick={() => setCalculated(true)} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>Calculate CLV</button>
              </div>

              <div style={{ backgroundColor: calculated ? '#f5f3ff' : '#f9fafb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Customer Value</h3>
                {calculated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '20px', backgroundColor: '#7c3aed', borderRadius: '12px', color: 'white' }}>
                      <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '4px' }}>Customer Lifetime Value (CLV)</p>
                      <p style={{ fontSize: '36px', fontWeight: '800' }}>{formatCurrency(clv)}</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Total Revenue Per Customer</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#374151' }}>{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Monthly Profit Per Customer</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#059669' }}>{formatCurrency(monthlyValue)}</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Acquisition ROI</p>
                      <p style={{ fontSize: '24px', fontWeight: '700', color: Number(roi) > 0 ? '#059669' : '#dc2626' }}>{roi}%</p>
                    </div>
                    <div style={{ padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                      <p style={{ fontSize: '14px', color: '#065f46', fontWeight: '600' }}>
                        {Number(roi) > 100 ? 'Great ROI! Your acquisition cost is well below CLV.' : 'Consider increasing retention to improve CLV.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>👤</p>
                    <p>Adjust sliders and click Calculate to see your customer lifetime value</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#7c3aed', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Increase Customer Lifetime Value</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen loyalty programs boost repeat visits by 40% and increase CLV automatically.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </section>
        <InternalLinks currentPath="/tools/customer-lifetime-value-calculator" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}
