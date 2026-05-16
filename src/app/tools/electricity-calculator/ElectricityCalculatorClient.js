'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import { FaPlus, FaTrash, FaBolt, FaChevronDown, FaChevronUp, FaCalculator, FaLightbulb } from 'react-icons/fa';

const REGIONS = [
  { name: 'India - Maharashtra', currency: '\u20B9', rate: 9.5, country: 'India' },
  { name: 'India - Delhi', currency: '\u20B9', rate: 7.0, country: 'India' },
  { name: 'India - Karnataka', currency: '\u20B9', rate: 8.0, country: 'India' },
  { name: 'India - Tamil Nadu', currency: '\u20B9', rate: 6.5, country: 'India' },
  { name: 'India - Gujarat', currency: '\u20B9', rate: 7.5, country: 'India' },
  { name: 'USA (Average)', currency: '$', rate: 0.12, country: 'USA' },
  { name: 'UK', currency: '\u00A3', rate: 0.30, country: 'UK' },
  { name: 'UAE (DEWA)', currency: 'AED', rate: 0.38, country: 'UAE' },
  { name: 'Qatar (Kahramaa)', currency: 'QAR', rate: 0.09, country: 'Qatar' },
];

const EQUIPMENT_PRESETS = [
  { name: 'Split AC (1.5 ton)', watts: 1800, category: 'HVAC', defaultHours: 12 },
  { name: 'Split AC (2 ton)', watts: 2400, category: 'HVAC', defaultHours: 12 },
  { name: 'Central AC / Cassette', watts: 5000, category: 'HVAC', defaultHours: 12 },
  { name: 'Exhaust Fan (Kitchen)', watts: 200, category: 'HVAC', defaultHours: 10 },
  { name: 'Ceiling Fan', watts: 75, category: 'HVAC', defaultHours: 14 },
  { name: 'Walk-in Cooler', watts: 1500, category: 'Refrigeration', defaultHours: 24 },
  { name: 'Double-door Fridge', watts: 350, category: 'Refrigeration', defaultHours: 24 },
  { name: 'Deep Freezer', watts: 500, category: 'Refrigeration', defaultHours: 24 },
  { name: 'Display Cooler', watts: 400, category: 'Refrigeration', defaultHours: 18 },
  { name: 'Commercial Oven', watts: 3000, category: 'Cooking', defaultHours: 6 },
  { name: 'Tandoor (Electric)', watts: 4000, category: 'Cooking', defaultHours: 5 },
  { name: 'Induction Cooktop', watts: 2000, category: 'Cooking', defaultHours: 8 },
  { name: 'Microwave', watts: 1200, category: 'Cooking', defaultHours: 3 },
  { name: 'Mixer/Grinder', watts: 750, category: 'Cooking', defaultHours: 2 },
  { name: 'Commercial Dishwasher', watts: 1800, category: 'Cooking', defaultHours: 4 },
  { name: 'LED Lights (per 10)', watts: 100, category: 'Lighting', defaultHours: 14 },
  { name: 'Decorative/Accent Lights', watts: 200, category: 'Lighting', defaultHours: 10 },
  { name: 'Signboard/Neon', watts: 150, category: 'Lighting', defaultHours: 10 },
  { name: 'POS System + Printer', watts: 200, category: 'Other', defaultHours: 14 },
  { name: 'CCTV System', watts: 100, category: 'Other', defaultHours: 24 },
  { name: 'Water Purifier (RO)', watts: 60, category: 'Other', defaultHours: 8 },
  { name: 'Music System', watts: 150, category: 'Other', defaultHours: 12 },
  { name: 'Washing Machine', watts: 500, category: 'Other', defaultHours: 3 },
];

const CATEGORY_COLORS = {
  HVAC: '#ef4444',
  Refrigeration: '#3b82f6',
  Cooking: '#f59e0b',
  Lighting: '#10b981',
  Other: '#8b5cf6',
};

const OPTIMIZATION_TIPS = [
  'Switch to inverter ACs to save 30-50% on HVAC costs',
  'Use LED lighting to cut lighting bills by 75%',
  'Install timers on exhaust fans and signboards',
  'Consider solar panels for 30-50% offset',
  'Regular maintenance of refrigeration units improves efficiency by 15%',
];

const faqData = [
  {
    q: 'What is the average electricity bill for a restaurant?',
    a: 'Electricity bills vary significantly based on size, location, and equipment. In India, a small restaurant may pay \u20B98,000-\u20B920,000/month while a large fine-dining establishment can see bills of \u20B950,000-\u20B980,000/month. In the US, typical restaurant electricity costs range from $1,000-$5,000/month. In the UK, expect \u00A3800-\u00A33,000/month depending on size and equipment.',
  },
  {
    q: 'How much electricity does a commercial kitchen use?',
    a: 'A commercial kitchen typically uses 1,000-5,000 kWh per month depending on equipment and operating hours. Air conditioning alone accounts for 40-60% of total electricity consumption in most restaurants. Refrigeration is the second largest consumer at 15-25%, followed by cooking equipment at 10-20%.',
  },
  {
    q: 'How can I reduce my restaurant\'s electricity bill?',
    a: 'The most effective strategies include: switching to inverter ACs (saves 30-50%), replacing all lighting with LEDs (saves 75% on lighting), installing solar panels (30-50% offset), scheduling high-power equipment during off-peak hours, regular maintenance of refrigeration and HVAC systems, and using timers and sensors for non-essential equipment like signboards and exhaust fans.',
  },
  {
    q: 'Should I switch to solar for my restaurant?',
    a: 'Solar is increasingly viable for restaurants, especially in India (government subsidies of 20-40%), UAE (net metering available), and sunny regions. A typical restaurant rooftop can accommodate 5-15 kW of solar panels. The payback period is typically 4-6 years, after which you get nearly free electricity for 15-20 more years. Many states offer net metering, allowing you to sell excess power back to the grid.',
  },
  {
    q: 'What percentage of restaurant revenue should go to electricity?',
    a: 'Industry benchmarks suggest electricity should be 3-8% of revenue. Quick-service restaurants (QSR) typically spend 2-4% due to smaller spaces and less HVAC. Casual dining averages 4-6%. Fine dining can go up to 8% due to extensive climate control, mood lighting, and larger spaces. If your electricity costs exceed 8% of revenue, it is time to audit your equipment and consider efficiency upgrades.',
  },
];

const relatedTools = [
  { name: 'Break-Even Calculator', href: '/tools/break-even-calculator', desc: 'Calculate how many orders you need to cover all costs.' },
  { name: 'Rent Calculator', href: '/tools/rent-calculator', desc: 'Determine the ideal rent budget for your restaurant.' },
  { name: 'Startup Cost Calculator', href: '/tools/startup-cost-calculator', desc: 'Estimate total investment needed to open your restaurant.' },
  { name: 'Profit Margin Calculator', href: '/tools/profit-margin-calculator', desc: 'Analyze profit margins across your restaurant operations.' },
];

let idCounter = 0;
function generateId() {
  idCounter += 1;
  return 'eq_' + idCounter + '_' + Date.now();
}

function getDefaultEquipment() {
  const acPreset = EQUIPMENT_PRESETS.find(p => p.name === 'Split AC (1.5 ton)');
  const fridgePreset = EQUIPMENT_PRESETS.find(p => p.name === 'Double-door Fridge');
  const ledPreset = EQUIPMENT_PRESETS.find(p => p.name === 'LED Lights (per 10)');
  return [
    { id: generateId(), name: acPreset.name, watts: acPreset.watts, hours: acPreset.defaultHours, quantity: 1, category: acPreset.category },
    { id: generateId(), name: fridgePreset.name, watts: fridgePreset.watts, hours: fridgePreset.defaultHours, quantity: 1, category: fridgePreset.category },
    { id: generateId(), name: ledPreset.name, watts: ledPreset.watts, hours: ledPreset.defaultHours, quantity: 1, category: ledPreset.category },
  ];
}

export default function ElectricityCalculatorClient() {
  const [selectedRegion, setSelectedRegion] = useState(0);
  const [equipment, setEquipment] = useState(getDefaultEquipment);
  const [monthlyRevenue, setMonthlyRevenue] = useState('');
  const [ordersPerDay, setOrdersPerDay] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [showPresets, setShowPresets] = useState(false);

  const region = REGIONS[selectedRegion];
  const currency = region.currency;
  const rate = region.rate;

  // Calculations
  const itemCosts = equipment.map(item => {
    const monthlyKwh = (item.watts * item.hours * 30 * item.quantity) / 1000;
    const monthlyCost = monthlyKwh * rate;
    return { ...item, monthlyKwh, monthlyCost };
  });

  const totalMonthlyCost = itemCosts.reduce((sum, item) => sum + item.monthlyCost, 0);
  const totalMonthlyKwh = itemCosts.reduce((sum, item) => sum + item.monthlyKwh, 0);

  const orders = parseFloat(ordersPerDay) || 0;
  const revenue = parseFloat(monthlyRevenue) || 0;
  const costPerOrder = orders > 0 ? totalMonthlyCost / (orders * 30) : 0;
  const percentOfRevenue = revenue > 0 ? (totalMonthlyCost / revenue) * 100 : 0;

  // Category breakdown
  const categoryBreakdown = {};
  itemCosts.forEach(item => {
    if (!categoryBreakdown[item.category]) {
      categoryBreakdown[item.category] = { cost: 0, kwh: 0 };
    }
    categoryBreakdown[item.category].cost += item.monthlyCost;
    categoryBreakdown[item.category].kwh += item.monthlyKwh;
  });

  const categories = Object.keys(categoryBreakdown);
  const categoryPercentages = categories.map(cat => ({
    name: cat,
    percentage: totalMonthlyCost > 0 ? (categoryBreakdown[cat].cost / totalMonthlyCost) * 100 : 0,
    cost: categoryBreakdown[cat].cost,
    color: CATEGORY_COLORS[cat] || '#6b7280',
  }));

  // Pie chart SVG calculations
  const pieSegments = [];
  let cumulativePercent = 0;
  categoryPercentages.forEach(cat => {
    if (cat.percentage > 0) {
      pieSegments.push({
        ...cat,
        offset: cumulativePercent,
      });
      cumulativePercent += cat.percentage;
    }
  });

  const addEquipment = (preset) => {
    setEquipment([...equipment, {
      id: generateId(),
      name: preset.name,
      watts: preset.watts,
      hours: preset.defaultHours,
      quantity: 1,
      category: preset.category,
    }]);
    setShowPresets(false);
  };

  const removeEquipment = (id) => {
    setEquipment(equipment.filter(item => item.id !== id));
  };

  const updateEquipment = (id, field, value) => {
    setEquipment(equipment.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    boxSizing: 'border-box',
  };

  const buttonPrimary = {
    padding: '12px 24px',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <>
      <CommonHeader />

      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'Inter, sans-serif' }}>
        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: 'white', padding: '70px 20px 50px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '4px 14px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '12px', marginBottom: '16px', letterSpacing: '0.5px' }}>
              Free Calculator &bull; No Login Required
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>
              Restaurant Electricity Cost Calculator
            </h1>
            <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '620px', margin: '0 auto', lineHeight: '1.6' }}>
              Calculate your restaurant&apos;s monthly electricity costs, see category-wise breakdowns, and get optimization tips to reduce your bill.
            </p>
          </div>
        </section>

        {/* Calculator Section */}
        <section style={{ padding: '50px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

            {/* Region Selection */}
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <FaBolt style={{ color: '#16a34a', fontSize: '20px' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Select Your Region</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {REGIONS.map((r, idx) => (
                  <button
                    key={r.name}
                    onClick={() => setSelectedRegion(idx)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: selectedRegion === idx ? '2px solid #16a34a' : '1px solid #e5e7eb',
                      backgroundColor: selectedRegion === idx ? '#f0fdf4' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: selectedRegion === idx ? '600' : '400',
                      color: '#111827',
                    }}
                  >
                    <div>{r.name}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>{r.currency}{r.rate}/kWh</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment List */}
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FaCalculator style={{ color: '#16a34a', fontSize: '20px' }} />
                  <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Your Equipment</h2>
                </div>
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  style={buttonPrimary}
                >
                  <FaPlus /> Add Equipment
                </button>
              </div>

              {/* Preset Dropdown */}
              {showPresets && (
                <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', maxHeight: '300px', overflowY: 'auto' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Select equipment to add:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                    {EQUIPMENT_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => addEquipment(preset)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '12px',
                          color: '#111827',
                        }}
                      >
                        <div style={{ fontWeight: '600' }}>{preset.name}</div>
                        <div style={{ color: '#6b7280', marginTop: '2px' }}>{preset.watts}W &middot; {preset.category}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment Items */}
              {equipment.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  <p>No equipment added. Click &quot;Add Equipment&quot; to get started.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {equipment.map((item) => {
                    const itemKwh = (item.watts * item.hours * 30 * item.quantity) / 1000;
                    const itemCost = itemKwh * rate;
                    return (
                      <div key={item.id} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: CATEGORY_COLORS[item.category] || '#6b7280' }}></span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{item.name}</span>
                            <span style={{ fontSize: '11px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>{item.category}</span>
                          </div>
                          <button
                            onClick={() => removeEquipment(item.id)}
                            style={{ padding: '6px 10px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', alignItems: 'end' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Watts</label>
                            <input
                              type="number"
                              value={item.watts}
                              onChange={(e) => updateEquipment(item.id, 'watts', parseInt(e.target.value) || 0)}
                              style={{ ...inputStyle, padding: '8px', fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Hours/Day</label>
                            <input
                              type="number"
                              value={item.hours}
                              onChange={(e) => updateEquipment(item.id, 'hours', parseInt(e.target.value) || 0)}
                              style={{ ...inputStyle, padding: '8px', fontSize: '13px' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Quantity</label>
                            <input
                              type="number"
                              value={item.quantity}
                              min="1"
                              onChange={(e) => updateEquipment(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              style={{ ...inputStyle, padding: '8px', fontSize: '13px' }}
                            />
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '11px', color: '#6b7280' }}>{itemKwh.toFixed(1)} kWh/mo</p>
                            <p style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>{currency}{itemCost.toFixed(2)}/mo</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Revenue & Orders Inputs */}
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Optional: Revenue & Order Data</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Monthly Revenue ({currency})</label>
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    placeholder="e.g. 500000"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Orders Per Day</label>
                  <input
                    type="number"
                    value={ordersPerDay}
                    onChange={(e) => setOrdersPerDay(e.target.value)}
                    placeholder="e.g. 50"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            {equipment.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                {/* Summary Card */}
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Monthly Summary</h3>
                  <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', textAlign: 'center', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: '#166534', marginBottom: '6px', fontWeight: '600' }}>TOTAL MONTHLY COST</p>
                    <p style={{ fontSize: '36px', fontWeight: '800', color: '#16a34a', lineHeight: '1.1' }}>{currency}{totalMonthlyCost.toFixed(2)}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '6px' }}>{totalMonthlyKwh.toFixed(1)} kWh total consumption</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '14px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                      <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Cost Per Order</p>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                        {orders > 0 ? `${currency}${costPerOrder.toFixed(2)}` : '--'}
                      </p>
                    </div>
                    <div style={{ padding: '14px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                      <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>% of Revenue</p>
                      <p style={{ fontSize: '18px', fontWeight: '700', color: percentOfRevenue > 8 ? '#dc2626' : percentOfRevenue > 5 ? '#f59e0b' : '#16a34a' }}>
                        {revenue > 0 ? `${percentOfRevenue.toFixed(1)}%` : '--'}
                      </p>
                    </div>
                  </div>

                  {revenue > 0 && (
                    <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', backgroundColor: percentOfRevenue > 8 ? '#fef2f2' : percentOfRevenue > 5 ? '#fffbeb' : '#f0fdf4' }}>
                      <p style={{ fontSize: '12px', color: percentOfRevenue > 8 ? '#dc2626' : percentOfRevenue > 5 ? '#d97706' : '#166534' }}>
                        {percentOfRevenue > 8
                          ? 'Your electricity cost is above the 8% benchmark. Consider energy audits and efficiency upgrades.'
                          : percentOfRevenue > 5
                          ? 'Your electricity cost is moderate. There may be room for optimization.'
                          : 'Your electricity cost is within healthy benchmarks. Good job!'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pie Chart Card */}
                <div style={cardStyle}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Cost Breakdown by Category</h3>

                  {totalMonthlyCost > 0 ? (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <svg width="180" height="180" viewBox="0 0 42 42">
                          <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#e5e7eb" strokeWidth="5" />
                          {pieSegments.map((segment, idx) => {
                            const circumference = 2 * Math.PI * 15.91549430918954;
                            const strokeDash = (segment.percentage / 100) * circumference;
                            const strokeGap = circumference - strokeDash;
                            const strokeOffset = circumference - (segment.offset / 100) * circumference + (circumference * 0.25);
                            return (
                              <circle
                                key={idx}
                                cx="21"
                                cy="21"
                                r="15.91549430918954"
                                fill="transparent"
                                stroke={segment.color}
                                strokeWidth="5"
                                strokeDasharray={`${strokeDash} ${strokeGap}`}
                                strokeDashoffset={strokeOffset}
                                strokeLinecap="butt"
                              />
                            );
                          })}
                        </svg>
                      </div>

                      {/* Legend */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {categoryPercentages.filter(c => c.percentage > 0).map((cat) => (
                          <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: cat.color, display: 'inline-block' }}></span>
                              <span style={{ fontSize: '13px', color: '#374151' }}>{cat.name}</span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{cat.percentage.toFixed(1)}%</span>
                              <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>{currency}{cat.cost.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                      <p>Add equipment to see the breakdown.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optimization Tips */}
            {equipment.length > 0 && totalMonthlyCost > 0 && (
              <div style={{ ...cardStyle, marginBottom: '24px', borderLeft: '4px solid #16a34a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <FaLightbulb style={{ color: '#f59e0b', fontSize: '20px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>Optimization Tips</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {OPTIMIZATION_TIPS.map((tip, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                      <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '14px', marginTop: '1px' }}>&#10003;</span>
                      <span style={{ fontSize: '14px', color: '#374151' }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* SEO Content Section 1 */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>How to Reduce Restaurant Electricity Bills</h2>

            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Electricity is one of the largest recurring expenses for restaurants, often ranking just behind rent and labor. For most restaurants, the electricity bill ranges from 3% to 8% of revenue, but poorly managed energy use can push this figure much higher. Understanding where your power goes is the first step to reducing costs.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Air conditioning is the single largest electricity consumer in most restaurants, accounting for 40-60% of the total bill. Switching from conventional fixed-speed ACs to inverter technology can reduce HVAC costs by 30-50%. Additionally, proper insulation, reflective window films, and strategic seating away from heat sources can reduce the load on your AC units significantly.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Refrigeration is the second major consumer, running 24 hours a day. Regular maintenance including cleaning condenser coils, checking door seals, and maintaining proper temperature settings can improve efficiency by 15-20%. Organize your walk-in cooler to allow proper air circulation and avoid placing hot items directly inside.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Lighting upgrades offer the fastest ROI. Replacing all conventional bulbs and tube lights with LEDs can cut your lighting bill by 75%. LEDs also produce less heat, reducing the load on air conditioning. Install motion sensors in restrooms, storage areas, and staff rooms to eliminate waste from lights left on in unoccupied spaces.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Finally, consider investing in solar panels. With government subsidies in India (20-40% off installation cost) and net metering policies in many states, a rooftop solar system can offset 30-50% of your electricity consumption. The payback period is typically 4-6 years, after which you enjoy nearly free power for another 15-20 years.
            </p>
          </div>
        </section>

        {/* SEO Content Section 2 */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>Energy-Efficient Kitchen Equipment</h2>

            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              When purchasing new kitchen equipment, energy efficiency should be a top priority alongside performance. An energy-efficient commercial refrigerator may cost 15-20% more upfront but will save 30-40% on electricity over its lifetime, usually paying for itself within 2-3 years.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Look for equipment with high star ratings (BEE ratings in India, ENERGY STAR in the US). Inverter-based compressors in refrigerators and air conditioners adjust their speed based on load, consuming significantly less power during low-demand periods. For cooking equipment, induction cooktops are 85-90% energy efficient compared to 40% for gas burners.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Commercial dishwashers with heat recovery systems capture steam and hot air to pre-heat incoming water, reducing both electricity and water consumption. Modern dishwashers use 40-50% less energy than models from 10 years ago while delivering better cleaning results.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              For HVAC, consider VRF (Variable Refrigerant Flow) systems for larger restaurants. These systems can simultaneously heat and cool different zones, recovering waste heat from areas that need cooling and redirecting it to areas that need heating. While the initial investment is higher, operational savings of 30-50% make it worthwhile for restaurants over 2000 sq ft.
            </p>
          </div>
        </section>

        {/* SEO Content Section 3 */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>Restaurant Utility Cost Benchmarks</h2>

            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Understanding industry benchmarks helps you assess whether your electricity costs are in line with similar businesses. These benchmarks vary by restaurant type, location, and climate, but provide a useful reference point for evaluating your energy management.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Quick-service restaurants (QSRs) and fast food outlets typically spend 2-4% of revenue on electricity. Their smaller footprint, limited seating areas, and shorter operating hours keep utility costs manageable. However, high-volume QSRs with extensive deep-frying equipment may trend toward the higher end.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Casual dining restaurants generally fall in the 4-6% range. These establishments have larger dining areas requiring more extensive HVAC, full kitchens with diverse equipment, and longer operating hours. The addition of bar areas with refrigerated display units can push costs higher.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              Fine dining restaurants may spend 5-8% of revenue on electricity. While their per-cover revenue is higher, they also require extensive climate control for guest comfort, sophisticated lighting systems for ambiance, larger kitchen operations, and often have wine storage requiring precise temperature control.
            </p>
            <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151', marginBottom: '16px' }}>
              If your electricity costs exceed these benchmarks, it is a strong signal to conduct an energy audit. Common culprits include aging HVAC systems, poorly maintained refrigeration, inefficient lighting, and equipment left running during non-operational hours.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqData.map((faq, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{
                      width: '100%',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827', paddingRight: '12px' }}>{faq.q}</span>
                    {openFaq === idx ? <FaChevronUp style={{ color: '#6b7280', flexShrink: 0 }} /> : <FaChevronDown style={{ color: '#6b7280', flexShrink: 0 }} />}
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: '0 20px 18px', fontSize: '14px', lineHeight: '1.7', color: '#4b5563' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '60px 20px', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px' }}>Track All Your Restaurant Expenses in One Place</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px', lineHeight: '1.6' }}>
              DineOpen POS gives you real-time expense tracking including electricity, rent, labor, and food costs. Get automated reports, identify cost leaks, and improve profitability with data-driven decisions.
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: 'white',
                color: '#4f46e5',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '700',
                textDecoration: 'none',
              }}
            >
              Explore DineOpen POS
            </Link>
          </div>
        </section>

        {/* Related Tools */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Related Tools</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {relatedTools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  style={{
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb',
                    textDecoration: 'none',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{tool.name}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>{tool.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <InternalLinks currentPath="/tools/electricity-calculator" variant="tool" />
      </div>

      <Footer />
    </>
  );
}
