'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

const presets = {
  small: { label: 'Small (10-20 seats)', rent: 30000, deposit: 150000, interiors: 300000, equipment: 200000, licenses: 25000, marketing: 30000, inventory: 50000, staff3mo: 150000, misc: 50000 },
  medium: { label: 'Medium (30-60 seats)', rent: 75000, deposit: 375000, interiors: 800000, equipment: 500000, licenses: 50000, marketing: 75000, inventory: 100000, staff3mo: 400000, misc: 100000 },
  large: { label: 'Large (60-120 seats)', rent: 200000, deposit: 1000000, interiors: 2000000, equipment: 1200000, licenses: 75000, marketing: 150000, inventory: 200000, staff3mo: 900000, misc: 200000 },
};

export default function StartupCostClient() {
  const [type, setType] = useState('medium');
  const [costs, setCosts] = useState(presets.medium);

  const applyPreset = (key) => {
    setType(key);
    setCosts(presets[key]);
  };

  const updateCost = (field, value) => {
    setCosts(prev => ({ ...prev, [field]: Number(value) }));
  };

  const totalCost = costs.rent * 3 + costs.deposit + costs.interiors + costs.equipment + costs.licenses + costs.marketing + costs.inventory + costs.staff3mo + costs.misc;
  const formatCurrency = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const formatLakhs = (n) => `₹${(n / 100000).toFixed(1)}L`;

  const categories = [
    { label: 'Rent (3 months)', field: 'rent', multiply: 3, note: '×3 months advance' },
    { label: 'Security Deposit', field: 'deposit' },
    { label: 'Interior & Renovation', field: 'interiors' },
    { label: 'Kitchen Equipment', field: 'equipment' },
    { label: 'Licenses & Permits', field: 'licenses', note: 'FSSAI, GST, Shop Act, etc.' },
    { label: 'Marketing & Branding', field: 'marketing' },
    { label: 'Initial Inventory', field: 'inventory' },
    { label: 'Staff Salary (3 months)', field: 'staff3mo' },
    { label: 'Miscellaneous', field: 'misc' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Startup Cost Calculator' }]} />
      <div style={{ paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px' }}>Free Calculator &bull; No Login</div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Startup Cost Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>Estimate total investment needed to open your restaurant in India. Covers rent, equipment, licenses, inventory & more.</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Presets */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(presets).map(([key, val]) => (
                <button key={key} onClick={() => applyPreset(key)} style={{
                  padding: '12px 24px', borderRadius: '10px', border: type === key ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                  backgroundColor: type === key ? '#eef2ff' : 'white', color: type === key ? '#4f46e5' : '#374151',
                  fontWeight: '600', cursor: 'pointer', fontSize: '14px'
                }}>
                  {val.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              {/* Costs Input */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Cost Breakdown</h3>
                {categories.map((cat, idx) => (
                  <div key={idx} style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      <span>{cat.label} {cat.note && <span style={{ fontWeight: '400', color: '#9ca3af' }}>({cat.note})</span>}</span>
                    </label>
                    <input type="number" value={costs[cat.field]} onChange={(e) => updateCost(cat.field, e.target.value)}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
                  </div>
                ))}
              </div>

              {/* Results */}
              <div style={{ backgroundColor: '#eef2ff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Investment Summary</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {categories.map((cat, idx) => {
                    const amount = cat.multiply ? costs[cat.field] * cat.multiply : costs[cat.field];
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'white', borderRadius: '6px', fontSize: '13px' }}>
                        <span style={{ color: '#374151' }}>{cat.label}</span>
                        <span style={{ fontWeight: '600', color: '#111827' }}>{formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ padding: '20px', backgroundColor: '#4f46e5', borderRadius: '12px', color: 'white', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '4px' }}>Total Estimated Investment</p>
                  <p style={{ fontSize: '36px', fontWeight: '800' }}>{formatLakhs(totalCost)}</p>
                  <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>{formatCurrency(totalCost)}</p>
                </div>

                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', fontSize: '12px', color: '#92400e' }}>
                  Tip: Keep 20-30% extra as working capital buffer for the first 6 months.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#4f46e5', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Start Your Restaurant Right</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen is free to start — no setup fees, no hardware costs. POS, billing, inventory from day one.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#4f46e5', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </section>
        <InternalLinks currentPath="/tools/startup-cost-calculator" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}
