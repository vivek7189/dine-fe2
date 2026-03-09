'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

export default function ValuationClient() {
  const [annualRevenue, setAnnualRevenue] = useState(5000000);
  const [ownerSalary, setOwnerSalary] = useState(600000);
  const [netProfit, setNetProfit] = useState(800000);
  const [assets, setAssets] = useState(500000);
  const [yearsInBusiness, setYearsInBusiness] = useState(5);
  const [calculated, setCalculated] = useState(false);

  // Revenue multiple: typically 0.25-0.75x for restaurants
  const revenueMultiple = yearsInBusiness >= 5 ? 0.5 : yearsInBusiness >= 3 ? 0.35 : 0.25;
  const revenueValuation = annualRevenue * revenueMultiple;

  // SDE method: (Net Profit + Owner Salary) * multiple (typically 1.5-3x)
  const sde = netProfit + ownerSalary;
  const sdeMultiple = yearsInBusiness >= 5 ? 2.5 : yearsInBusiness >= 3 ? 2 : 1.5;
  const sdeValuation = sde * sdeMultiple;

  // Asset-based: assets + goodwill
  const assetValuation = assets + (netProfit * 1.5);

  const avgValuation = (revenueValuation + sdeValuation + assetValuation) / 3;

  const formatCurrency = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const formatLakhs = (n) => {
    const lakhs = (n / 100000).toFixed(1);
    return `₹${lakhs}L`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Restaurant Valuation Calculator' }]} />
      <div style={{ paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>Free Calculator &bull; No Login</div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Valuation Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>Estimate your restaurant business value using Revenue Multiple, SDE, and Asset-based methods.</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Business Details</h3>
                {[
                  { label: 'Annual Revenue (₹)', value: annualRevenue, set: setAnnualRevenue, min: 1000000, max: 50000000, step: 500000, format: formatLakhs },
                  { label: 'Annual Net Profit (₹)', value: netProfit, set: setNetProfit, min: 0, max: 10000000, step: 100000, format: formatLakhs },
                  { label: 'Owner Salary (₹/year)', value: ownerSalary, set: setOwnerSalary, min: 0, max: 3000000, step: 50000, format: formatLakhs },
                  { label: 'Equipment & Assets (₹)', value: assets, set: setAssets, min: 0, max: 5000000, step: 100000, format: formatLakhs },
                  { label: 'Years in Business', value: yearsInBusiness, set: setYearsInBusiness, min: 1, max: 20, step: 1, format: (v) => `${v} yrs` },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      <span>{f.label}</span><span style={{ color: '#0f766e' }}>{f.format(f.value)}</span>
                    </label>
                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.value} onChange={(e) => f.set(Number(e.target.value))} style={{ width: '100%', accentColor: '#0f766e' }} />
                  </div>
                ))}
                <button onClick={() => setCalculated(true)} style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>Calculate Valuation</button>
              </div>

              <div style={{ backgroundColor: calculated ? '#f0fdfa' : '#f9fafb', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Estimated Valuation</h3>
                {calculated ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '20px', backgroundColor: '#0f766e', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
                      <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Average Estimated Value</p>
                      <p style={{ fontSize: '36px', fontWeight: '800' }}>{formatCurrency(avgValuation)}</p>
                    </div>
                    {[
                      { method: 'Revenue Multiple', value: revenueValuation, detail: `${revenueMultiple}x annual revenue` },
                      { method: 'SDE Method', value: sdeValuation, detail: `${sdeMultiple}x seller discretionary earnings` },
                      { method: 'Asset-Based', value: assetValuation, detail: 'Assets + goodwill' },
                    ].map((m, i) => (
                      <div key={i} style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{m.method}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>{m.detail}</p>
                          </div>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: '#0f766e' }}>{formatCurrency(m.value)}</p>
                        </div>
                      </div>
                    ))}
                    <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                      Note: This is an estimate. Actual valuation depends on location, lease terms, brand, and market conditions. Consult a business valuator for accuracy.
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>🏢</p>
                    <p>Enter your business details to estimate your restaurant value</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#0f766e', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Grow Your Restaurant Value</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen helps increase revenue and streamline operations — boosting your business valuation.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#0f766e', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </section>
        <InternalLinks currentPath="/tools/restaurant-valuation-calculator" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}
