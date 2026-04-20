'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

const countryData = {
  india: {
    name: 'India', currency: '\u20B9', code: 'INR', locale: 'en-IN',
    presets: {
      small: { label: 'Small (10-20 seats)', rent: 30000, deposit: 150000, interiors: 300000, equipment: 200000, licenses: 25000, marketing: 30000, inventory: 50000, staff3mo: 150000, misc: 50000 },
      medium: { label: 'Medium (30-60 seats)', rent: 75000, deposit: 375000, interiors: 800000, equipment: 500000, licenses: 50000, marketing: 75000, inventory: 100000, staff3mo: 400000, misc: 100000 },
      large: { label: 'Large (60-120 seats)', rent: 200000, deposit: 1000000, interiors: 2000000, equipment: 1200000, licenses: 75000, marketing: 150000, inventory: 200000, staff3mo: 900000, misc: 200000 },
    },
    licensesNote: 'FSSAI, GST, Shop Act, Fire NOC',
    tip: 'Keep 20-30% extra as working capital buffer for the first 6 months.',
  },
  usa: {
    name: 'USA', currency: '$', code: 'USD', locale: 'en-US',
    presets: {
      small: { label: 'Small Cafe (20-30 seats)', rent: 4000, deposit: 12000, interiors: 50000, equipment: 40000, licenses: 5000, marketing: 8000, inventory: 10000, staff3mo: 45000, misc: 15000 },
      medium: { label: 'Casual Dining (40-80 seats)', rent: 8000, deposit: 24000, interiors: 150000, equipment: 100000, licenses: 10000, marketing: 15000, inventory: 20000, staff3mo: 120000, misc: 30000 },
      large: { label: 'Full Service (80-150 seats)', rent: 15000, deposit: 45000, interiors: 350000, equipment: 200000, licenses: 20000, marketing: 30000, inventory: 40000, staff3mo: 250000, misc: 50000 },
    },
    licensesNote: 'Business license, health permit, liquor license, food handler cert',
    tip: 'SBA loans cover up to 85% of startup costs. Average time to profitability: 3-5 years.',
  },
  uk: {
    name: 'UK', currency: '\u00A3', code: 'GBP', locale: 'en-GB',
    presets: {
      small: { label: 'Small Cafe (15-25 seats)', rent: 2500, deposit: 7500, interiors: 30000, equipment: 25000, licenses: 3000, marketing: 5000, inventory: 5000, staff3mo: 30000, misc: 10000 },
      medium: { label: 'Casual Dining (30-60 seats)', rent: 5000, deposit: 15000, interiors: 80000, equipment: 50000, licenses: 5000, marketing: 10000, inventory: 10000, staff3mo: 75000, misc: 20000 },
      large: { label: 'Full Service (60-120 seats)', rent: 12000, deposit: 36000, interiors: 180000, equipment: 100000, licenses: 10000, marketing: 20000, inventory: 20000, staff3mo: 150000, misc: 30000 },
    },
    licensesNote: 'Premises licence, food hygiene cert, EHO inspection, business rates',
    tip: 'Register your food business with the local authority at least 28 days before opening.',
  },
  uae: {
    name: 'UAE', currency: 'AED ', code: 'AED', locale: 'en-AE',
    presets: {
      small: { label: 'Small Restaurant / Cafeteria', rent: 15000, deposit: 45000, interiors: 100000, equipment: 80000, licenses: 30000, marketing: 20000, inventory: 30000, staff3mo: 60000, misc: 30000 },
      medium: { label: 'Mid-Range Restaurant', rent: 35000, deposit: 105000, interiors: 300000, equipment: 200000, licenses: 50000, marketing: 40000, inventory: 50000, staff3mo: 150000, misc: 50000 },
      large: { label: 'Premium / Fine Dining', rent: 80000, deposit: 240000, interiors: 800000, equipment: 400000, licenses: 80000, marketing: 80000, inventory: 80000, staff3mo: 350000, misc: 80000 },
    },
    licensesNote: 'DET trade license, DM food permit, staff visas, Ejari',
    tip: 'Staff visa costs (AED 5,000-8,000 each) are often underestimated. Budget for 2-3 months of operating expenses as working capital.',
  },
  canada: {
    name: 'Canada', currency: 'CAD ', code: 'CAD', locale: 'en-CA',
    presets: {
      small: { label: 'Small Cafe (15-25 seats)', rent: 3500, deposit: 10500, interiors: 50000, equipment: 35000, licenses: 4000, marketing: 6000, inventory: 8000, staff3mo: 40000, misc: 12000 },
      medium: { label: 'Casual Dining (30-60 seats)', rent: 7000, deposit: 21000, interiors: 120000, equipment: 80000, licenses: 8000, marketing: 12000, inventory: 15000, staff3mo: 100000, misc: 25000 },
      large: { label: 'Full Service (60-120 seats)', rent: 14000, deposit: 42000, interiors: 280000, equipment: 160000, licenses: 15000, marketing: 25000, inventory: 30000, staff3mo: 200000, misc: 40000 },
    },
    licensesNote: 'Municipal license, health inspection, AGCO/LCRB liquor, food handler cert',
    tip: 'Check CDAP grants \u2014 up to $2,400 for digital adoption tools like POS systems.',
  },
  australia: {
    name: 'Australia', currency: 'AUD ', code: 'AUD', locale: 'en-AU',
    presets: {
      small: { label: 'Small Cafe (15-25 seats)', rent: 3000, deposit: 9000, interiors: 40000, equipment: 30000, licenses: 3000, marketing: 5000, inventory: 6000, staff3mo: 35000, misc: 10000 },
      medium: { label: 'Casual Dining (30-60 seats)', rent: 6000, deposit: 18000, interiors: 100000, equipment: 60000, licenses: 5000, marketing: 10000, inventory: 12000, staff3mo: 80000, misc: 20000 },
      large: { label: 'Full Service (60-120 seats)', rent: 12000, deposit: 36000, interiors: 250000, equipment: 120000, licenses: 10000, marketing: 20000, inventory: 25000, staff3mo: 170000, misc: 35000 },
    },
    licensesNote: 'Council registration, food safety supervisor, liquor licence, FSANZ',
    tip: 'Award wages and penalty rates (150-250% on weekends/holidays) significantly affect staff costs.',
  },
  singapore: {
    name: 'Singapore', currency: 'SGD ', code: 'SGD', locale: 'en-SG',
    presets: {
      small: { label: 'Hawker Stall / Small Cafe', rent: 3000, deposit: 9000, interiors: 30000, equipment: 25000, licenses: 2000, marketing: 4000, inventory: 5000, staff3mo: 25000, misc: 8000 },
      medium: { label: 'Mid-Range Restaurant', rent: 8000, deposit: 24000, interiors: 120000, equipment: 70000, licenses: 5000, marketing: 10000, inventory: 12000, staff3mo: 80000, misc: 20000 },
      large: { label: 'Premium Restaurant', rent: 18000, deposit: 54000, interiors: 300000, equipment: 150000, licenses: 10000, marketing: 20000, inventory: 25000, staff3mo: 180000, misc: 35000 },
    },
    licensesNote: 'SFA food shop licence, NEA food hygiene, URA approval, liquor licence',
    tip: 'Singapore government offers various grants through Enterprise Singapore for F&B businesses.',
  },
};

const chartColors = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1'];

const faqItems = [
  {
    q: 'How much does it cost to open a restaurant?',
    a: 'Restaurant startup costs vary widely by country, location, and concept. In the USA, a small cafe can start from $175,000-$200,000, while full-service restaurants may need $800,000-$1,000,000+. In India, a small restaurant can begin with 8-10 lakhs, while a medium-sized one needs 20-25 lakhs. Use the calculator above to get a personalized estimate for your specific country and restaurant type.',
  },
  {
    q: 'What are the biggest startup expenses for a restaurant?',
    a: 'The three largest expenses are typically: (1) Interior design and renovation (25-35% of total budget), (2) Kitchen equipment and fit-out (15-25%), and (3) Security deposit and advance rent (10-20%). Together, these account for 60-80% of total startup costs. Staff salaries for the first 3 months before revenue stabilizes are also a significant expense that many first-time owners underestimate.',
  },
  {
    q: 'How long until a restaurant becomes profitable?',
    a: 'Most restaurants take 12-24 months to become consistently profitable, though some may take 3-5 years. Factors include location, concept, competition, and management efficiency. Quick-service and cafe concepts often reach profitability faster (6-12 months) than fine dining establishments. Keeping food costs under 30-35% of revenue and labor under 25-30% are key benchmarks.',
  },
  {
    q: 'Do I need a liquor license to open a restaurant?',
    a: 'A liquor license is only required if you plan to serve alcoholic beverages. Costs and processes vary significantly by country: In the USA, licenses range from $300 to $14,000+ depending on the state. In India, it varies by state and can cost INR 5-25 lakhs annually. In the UK, a premises licence is typically 100-1,905 GBP. Some concepts like cafes, bakeries, and juice bars can operate without one.',
  },
  {
    q: 'What technology do I need to start a restaurant?',
    a: 'At minimum, you need a POS (Point of Sale) system for billing and order management. Modern cloud-based POS systems like DineOpen also include inventory management, staff management, analytics, and online ordering. Budget for: POS software subscription, a tablet or terminal, a receipt printer, and a payment terminal. Many POS providers offer free tiers or trials, so technology costs can be minimal at the start.',
  },
];

const costBreakdownTips = [
  { title: 'Start Small, Scale Later', desc: 'Begin with a smaller space and limited menu. You can always expand once you have steady revenue and understand local demand.' },
  { title: 'Buy Used Equipment', desc: 'Restaurant-grade used equipment from closed businesses can save 40-60% on kitchen costs. Check auctions and dealer sites.' },
  { title: 'Negotiate Your Lease', desc: 'Ask for rent-free fit-out periods (1-3 months), graduated rent increases, and favorable exit clauses. Landlords expect negotiation.' },
  { title: 'Use Free Technology', desc: 'Start with free-tier POS systems like DineOpen instead of expensive legacy systems. Cloud POS eliminates hardware costs.' },
];

export default function StartupCostClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [country, setCountry] = useState('india');
  const [type, setType] = useState('medium');
  const [costs, setCosts] = useState(countryData.india.presets.medium);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const cd = countryData[country];

  const applyPreset = (key) => {
    setType(key);
    setCosts(cd.presets[key]);
  };

  const switchCountry = (key) => {
    setCountry(key);
    setType('medium');
    setCosts(countryData[key].presets.medium);
  };

  const updateCost = (field, value) => {
    setCosts(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const formatCurrency = (n) => {
    return cd.currency + Math.round(n).toLocaleString(cd.locale);
  };

  const formatCompact = (n) => {
    if (country === 'india') {
      if (n >= 10000000) return cd.currency + (n / 10000000).toFixed(1) + ' Cr';
      if (n >= 100000) return cd.currency + (n / 100000).toFixed(1) + 'L';
      if (n >= 1000) return cd.currency + (n / 1000).toFixed(1) + 'K';
      return formatCurrency(n);
    }
    if (n >= 1000000) return cd.currency + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return cd.currency + (n / 1000).toFixed(0) + 'K';
    return formatCurrency(n);
  };

  const categories = [
    { label: 'Rent (3 months)', field: 'rent', multiply: 3, note: '\u00D73 months advance' },
    { label: 'Security Deposit', field: 'deposit' },
    { label: 'Interior & Renovation', field: 'interiors' },
    { label: 'Kitchen Equipment', field: 'equipment' },
    { label: 'Licenses & Permits', field: 'licenses', note: cd.licensesNote },
    { label: 'Marketing & Branding', field: 'marketing' },
    { label: 'Initial Inventory', field: 'inventory' },
    { label: 'Staff Salary (3 months)', field: 'staff3mo' },
    { label: 'Miscellaneous', field: 'misc' },
  ];

  const getCategoryAmount = (cat) => cat.multiply ? costs[cat.field] * cat.multiply : costs[cat.field];
  const totalCost = categories.reduce((sum, cat) => sum + getCategoryAmount(cat), 0);

  const chartData = categories.map((cat, i) => ({
    label: cat.label.replace(/ \(3 months\)/, ''),
    amount: getCategoryAmount(cat),
    percent: totalCost > 0 ? ((getCategoryAmount(cat) / totalCost) * 100).toFixed(1) : 0,
    color: chartColors[i % chartColors.length],
  }));

  const countryKeys = Object.keys(countryData);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Free Tools', href: '/tools/food-cost-calculator' }, { label: 'Startup Cost Calculator' }]} />
      <div style={{ paddingTop: '80px' }}>

        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)', color: 'white', padding: isMobile ? '48px 20px' : '72px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '6px 16px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '13px', marginBottom: '20px', fontWeight: '500', letterSpacing: '0.5px' }}>Free Calculator &bull; No Login Required</div>
            <h1 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>Restaurant Startup Cost Calculator</h1>
            <p style={{ fontSize: isMobile ? '16px' : '18px', opacity: 0.92, lineHeight: '1.6', maxWidth: '650px', margin: '0 auto' }}>Estimate the total investment needed to open your restaurant. Covers rent, equipment, licenses, inventory, staff costs, and more across 7 countries.</p>
          </div>
        </section>

        {/* Calculator Section */}
        <section style={{ padding: isMobile ? '40px 16px' : '60px 20px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            {/* Country Selector */}
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '10px', textAlign: 'center' }}>Select Country</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {countryKeys.map((key) => (
                  <button key={key} onClick={() => switchCountry(key)} style={{
                    padding: isMobile ? '8px 14px' : '10px 20px',
                    borderRadius: '8px',
                    border: country === key ? '2px solid #4f46e5' : '2px solid #d1d5db',
                    backgroundColor: country === key ? '#eef2ff' : 'white',
                    color: country === key ? '#4f46e5' : '#374151',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: isMobile ? '12px' : '14px',
                    transition: 'all 0.15s ease',
                  }}>
                    {countryData[key].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Presets */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {Object.entries(cd.presets).map(([key, val]) => (
                <button key={key} onClick={() => applyPreset(key)} style={{
                  padding: isMobile ? '10px 16px' : '12px 24px',
                  borderRadius: '10px',
                  border: type === key ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                  backgroundColor: type === key ? '#eef2ff' : 'white',
                  color: type === key ? '#4f46e5' : '#374151',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '14px',
                  transition: 'all 0.15s ease',
                }}>
                  {val.label}
                </button>
              ))}
            </div>

            {/* Two-column grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '28px' }}>

              {/* Left: Cost Inputs */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '24px 20px' : '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>Cost Breakdown ({cd.code})</h3>
                {categories.map((cat, idx) => (
                  <div key={idx} style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      <span>{cat.label} {cat.note && <span style={{ fontWeight: '400', color: '#9ca3af', fontSize: '11px' }}>({cat.note})</span>}</span>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>{formatCurrency(getCategoryAmount(cat))}</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px', pointerEvents: 'none' }}>{cd.currency.trim()}</span>
                      <input
                        type="number"
                        value={costs[cat.field]}
                        onChange={(e) => updateCost(cat.field, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 40px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          color: '#111827',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right: Summary + Chart */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Total Card */}
                <div style={{ padding: '28px', backgroundColor: '#4f46e5', borderRadius: '16px', color: 'white', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', opacity: 0.85, marginBottom: '6px', fontWeight: '500' }}>Total Estimated Investment</p>
                  <p style={{ fontSize: isMobile ? '32px' : '40px', fontWeight: '800', lineHeight: '1.1' }}>{formatCompact(totalCost)}</p>
                  <p style={{ fontSize: '14px', opacity: 0.75, marginTop: '6px' }}>{formatCurrency(totalCost)}</p>
                </div>

                {/* Breakdown List */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '20px' : '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '14px' }}>Investment Summary</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {categories.map((cat, idx) => {
                      const amount = getCategoryAmount(cat);
                      const pct = totalCost > 0 ? ((amount / totalCost) * 100).toFixed(1) : 0;
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', backgroundColor: '#f9fafb', borderRadius: '6px', fontSize: '13px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: chartColors[idx], flexShrink: 0 }} />
                            <span style={{ color: '#374151' }}>{cat.label}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>{pct}%</span>
                            <span style={{ fontWeight: '600', color: '#111827', minWidth: '80px', textAlign: 'right' }}>{formatCurrency(amount)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Visual Breakdown Bar */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '20px' : '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '14px' }}>Cost Distribution</h4>
                  {/* Stacked bar */}
                  <div style={{ display: 'flex', height: '28px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                    {chartData.map((item, i) => (
                      item.amount > 0 && (
                        <div
                          key={i}
                          title={`${item.label}: ${item.percent}%`}
                          style={{
                            width: `${item.percent}%`,
                            backgroundColor: item.color,
                            minWidth: item.percent > 0 ? '2px' : 0,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      )
                    ))}
                  </div>
                  {/* Legend */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
                    {chartData.filter(d => d.amount > 0).map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#6b7280' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: item.color, flexShrink: 0 }} />
                        <span>{item.label} ({item.percent}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Country Tip */}
                <div style={{ padding: '14px 16px', backgroundColor: '#fef3c7', borderRadius: '10px', fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                  <strong>Tip:</strong> {cd.tip}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section style={{ padding: isMobile ? '48px 16px' : '72px 20px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>How Much Does It Cost to Open a Restaurant?</h2>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.7', marginBottom: '16px', textAlign: 'center', maxWidth: '750px', margin: '0 auto 16px' }}>
              Restaurant startup costs depend on your country, city, restaurant type, and scale. A small cafe in India can be launched for under 10 lakhs, while a full-service restaurant in the USA may require $500,000 to $1,000,000 or more. In the UK, expect to invest between 50,000 and 400,000 GBP depending on size and location.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.7', marginBottom: '16px', textAlign: 'center', maxWidth: '750px', margin: '0 auto 16px' }}>
              The biggest cost drivers are interior fit-out, kitchen equipment, and location (rent plus deposit). Cities like Dubai, Singapore, and London have higher rents that can dramatically increase your total investment. Licensing requirements also vary significantly: the UAE requires trade licenses and staff visas, while India needs FSSAI and GST registration.
            </p>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.7', marginBottom: '40px', textAlign: 'center', maxWidth: '750px', margin: '0 auto 40px' }}>
              Use this free calculator to estimate startup costs for your specific country and restaurant size. Adjust individual line items to match your local market, and plan for 20-30% additional working capital beyond the estimated total.
            </p>

            {/* Tips Grid */}
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>4 Ways to Reduce Startup Costs</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
              {costBreakdownTips.map((tip, i) => (
                <div key={i} style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{tip.title}</h4>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>{tip.desc}</p>
                </div>
              ))}
            </div>

            {/* Related Tools */}
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Related Free Tools</h3>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[
                  { label: 'Food Cost Calculator', href: '/tools/food-cost-calculator' },
                  { label: 'Menu Price Calculator', href: '/tools/menu-pricing-calculator' },
                  { label: 'Break-Even Calculator', href: '/tools/break-even-calculator' },
                  { label: 'Restaurant Name Generator', href: '/tools/restaurant-name-generator' },
                ].map((tool, i) => (
                  <Link key={i} href={tool.href} style={{
                    padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white',
                    color: '#4f46e5', fontWeight: '600', fontSize: '13px', textDecoration: 'none', transition: 'all 0.15s ease',
                  }}>{tool.label}</Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: isMobile ? '48px 16px' : '72px 20px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqItems.map((faq, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{
                      width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      border: 'none', backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                    <span style={{ fontSize: '20px', color: '#9ca3af', flexShrink: 0, transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }}>+</span>
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: '0 20px 18px', fontSize: '14px', color: '#6b7280', lineHeight: '1.7' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: isMobile ? '48px 16px' : '72px 20px', backgroundColor: '#4f46e5', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginBottom: '16px' }}>Start Your Restaurant the Smart Way</h2>
            <p style={{ fontSize: '16px', opacity: 0.92, marginBottom: '28px', lineHeight: '1.6' }}>DineOpen is free to start \u2014 no setup fees, no hardware costs. Get POS, billing, inventory management, and online ordering from day one.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 36px', backgroundColor: 'white', color: '#4f46e5', borderRadius: '8px', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </section>

        <InternalLinks currentPath="/tools/startup-cost-calculator" variant="tool" />
      </div>
      <Footer />
    </div>
  );
}
