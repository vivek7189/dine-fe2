'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import Breadcrumb from '../../../components/Breadcrumb';

const currencyOptions = [
  { symbol: '$', label: '$ USD' },
  { symbol: '\u00a3', label: '\u00a3 GBP' },
  { symbol: '\u20b9', label: '\u20b9 INR' },
  { symbol: '\u20ac', label: '\u20ac EUR' },
  { symbol: 'AED', label: 'AED' },
  { symbol: 'C$', label: 'C$ CAD' },
  { symbol: 'A$', label: 'A$ AUD' },
  { symbol: 'S$', label: 'S$ SGD' },
];

const benchmarks = [
  { type: 'Fast Food / QSR', cost: '25-30%', margin: '70-75%' },
  { type: 'Casual Dining', cost: '28-35%', margin: '65-72%' },
  { type: 'Fine Dining', cost: '30-35%', margin: '65-70%' },
  { type: 'Cafe / Coffee', cost: '20-25%', margin: '75-80%' },
  { type: 'Pizza', cost: '25-30%', margin: '70-75%' },
  { type: 'Bar / Drinks', cost: '18-24%', margin: '76-82%' },
  { type: 'Cloud Kitchen', cost: '15-25%', margin: '75-85%' },
  { type: 'Food Truck', cost: '28-35%', margin: '65-72%' },
  { type: 'Bakery / Dessert', cost: '20-28%', margin: '72-80%' },
];

const faqData = [
  {
    q: 'What is a good food cost percentage?',
    a: 'A good food cost percentage typically falls between 28-35% for most restaurants. Fast food and QSR establishments aim for 25-30%, casual dining targets 28-32%, and fine dining can range from 30-35%. Cloud kitchens often achieve the best food cost at 15-25% since they have no dine-in overhead. Cafes and bakeries can reach 20-25% thanks to high-margin beverages and baked goods.',
  },
  {
    q: 'How do I calculate profit margin?',
    a: 'Profit Margin (%) = ((Selling Price - Food Cost) / Selling Price) x 100. For example, if a dish sells for $20 and the ingredients cost $6, the profit margin is ((20 - 6) / 20) x 100 = 70%. This means 70 cents of every dollar earned is gross profit. Note that this is gross margin, not net margin -- you still need to account for labor, rent, and other operating expenses.',
  },
  {
    q: "What's the difference between margin and markup?",
    a: 'Margin and markup both measure profitability but use different bases. Margin is profit as a percentage of the selling price: ((Price - Cost) / Price) x 100. Markup is profit as a percentage of the cost: ((Price - Cost) / Cost) x 100. For example, a dish costing $5 sold at $15 has a 66.7% margin but a 200% markup. Restaurants typically talk in terms of food cost percentage (the inverse of margin), while markup is more common in retail.',
  },
  {
    q: 'How can I lower my food costs?',
    a: 'Key strategies to reduce food costs: (1) Negotiate with suppliers or switch to local vendors for better pricing. (2) Reduce waste through proper storage, FIFO rotation, and portion control. (3) Cross-utilize ingredients across multiple dishes to minimize spoilage. (4) Use seasonal ingredients that are cheaper and fresher. (5) Track inventory weekly to identify shrinkage. (6) Engineer your menu to promote high-margin items. (7) Standardize recipes so every cook uses the same quantities.',
  },
  {
    q: 'What profit margin should a restaurant aim for?',
    a: 'Restaurants should aim for a gross profit margin of 65-75% on food (meaning food cost of 25-35%). However, the net profit margin after all expenses (labor, rent, utilities, marketing) is typically 5-15% for a well-run restaurant. Fast food and cloud kitchens can achieve higher net margins (10-18%) due to lower labor costs, while fine dining often operates at thinner net margins (3-9%) despite higher check averages.',
  },
];

const breadcrumbItems = [
  { label: 'Home', href: '/' },
  { label: 'Free Tools', href: '/tools' },
  { label: 'Profit Margin Calculator', href: '/tools/profit-margin-calculator' },
];

function createEmptyItem() {
  return { name: '', foodCost: '', sellingPrice: '' };
}

export default function ProfitMarginCalculatorClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [currency, setCurrency] = useState('$');
  const [foodCost, setFoodCost] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [targetMargin, setTargetMargin] = useState(70);
  const [openFaq, setOpenFaq] = useState(null);
  const [showMultiItem, setShowMultiItem] = useState(false);
  const [items, setItems] = useState([createEmptyItem(), createEmptyItem()]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Single-item calculations
  const cost = parseFloat(foodCost) || 0;
  const price = parseFloat(sellingPrice) || 0;
  const foodCostPercent = price > 0 ? (cost / price) * 100 : 0;
  const grossProfit = price - cost;
  const profitMargin = price > 0 ? ((price - cost) / price) * 100 : 0;
  const suggestedPrice = cost > 0 ? cost / (1 - targetMargin / 100) : 0;
  const markup = cost > 0 ? ((price - cost) / cost) * 100 : 0;

  // Multi-item calculations
  const multiItemResults = items.map((item) => {
    const c = parseFloat(item.foodCost) || 0;
    const p = parseFloat(item.sellingPrice) || 0;
    const margin = p > 0 ? ((p - c) / p) * 100 : 0;
    const fcp = p > 0 ? (c / p) * 100 : 0;
    const gp = p - c;
    return { ...item, margin, foodCostPercent: fcp, grossProfit: gp };
  });
  const validMultiItems = multiItemResults.filter((i) => parseFloat(i.sellingPrice) > 0);
  const avgMargin = validMultiItems.length > 0 ? validMultiItems.reduce((sum, i) => sum + i.margin, 0) / validMultiItems.length : 0;
  const totalCost = validMultiItems.reduce((sum, i) => sum + (parseFloat(i.foodCost) || 0), 0);
  const totalRevenue = validMultiItems.reduce((sum, i) => sum + (parseFloat(i.sellingPrice) || 0), 0);
  const overallMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };
  const addItem = () => setItems([...items, createEmptyItem()]);
  const removeItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Margin health
  function getMarginHealth(margin) {
    if (margin >= 70) return { color: '#059669', bg: '#d1fae5', label: 'Healthy', desc: 'Your margin is strong. Well above the industry average of 65-70%.' };
    if (margin >= 60) return { color: '#d97706', bg: '#fef3c7', label: 'Average', desc: 'Your margin is in the average range (60-70%). Room for improvement.' };
    return { color: '#dc2626', bg: '#fee2e2', label: 'Low', desc: 'Your margin is below 60%. Consider raising prices or reducing food costs.' };
  }

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: isMobile ? '24px' : '32px',
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

  return (
    <>
      <CommonHeader />
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
        padding: isMobile ? '48px 20px 40px' : '64px 20px 56px',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span style={{
            display: 'inline-block',
            padding: '6px 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px',
            backdropFilter: 'blur(4px)',
          }}>
            Free Calculator &bull; No Login
          </span>
          <h1 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            marginBottom: '16px',
            lineHeight: 1.2,
          }}>
            Food Cost & Profit Margin Calculator
          </h1>
          <p style={{
            fontSize: isMobile ? '16px' : '18px',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Calculate food cost percentage, profit margins, and find the ideal menu price for any dish.
          </p>
        </div>
      </section>

      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 20px' }}>

          {/* Calculator Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '24px',
            marginBottom: '40px',
          }}>
            {/* Input Card */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
                Enter Your Numbers
              </h2>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {currencyOptions.map((c) => (
                    <option key={c.symbol} value={c.symbol}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Food Cost (Ingredients)</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '14px' }}>{currency}</span>
                  <input
                    type="number"
                    value={foodCost}
                    onChange={(e) => setFoodCost(e.target.value)}
                    placeholder="0.00"
                    style={{ ...inputStyle, paddingLeft: currency.length > 1 ? '48px' : '32px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Selling Price</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '14px' }}>{currency}</span>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="0.00"
                    style={{ ...inputStyle, paddingLeft: currency.length > 1 ? '48px' : '32px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={labelStyle}>Target Profit Margin: {targetMargin}%</label>
                <input
                  type="range"
                  min="50"
                  max="85"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#059669' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af' }}>
                  <span>50%</span><span>70%</span><span>85%</span>
                </div>
              </div>
            </div>

            {/* Results Card */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
                Your Results
              </h2>

              {/* Food Cost Percentage */}
              <div style={{
                marginBottom: '20px',
                padding: '16px',
                backgroundColor: foodCostPercent <= 30 ? '#d1fae5' : foodCostPercent <= 35 ? '#fef3c7' : '#fee2e2',
                borderRadius: '10px',
              }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Food Cost Percentage</p>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: foodCostPercent <= 30 ? '#059669' : foodCostPercent <= 35 ? '#d97706' : '#dc2626',
                }}>
                  {foodCostPercent.toFixed(1)}%
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Target: 25-35%</p>
              </div>

              {/* Metric Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '14px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Gross Profit</p>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: '#111827' }}>
                    {currency}{grossProfit.toFixed(2)}
                  </p>
                </div>
                <div style={{ padding: '14px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Profit Margin</p>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: profitMargin >= 65 ? '#059669' : '#d97706' }}>
                    {profitMargin.toFixed(1)}%
                  </p>
                </div>
                <div style={{ padding: '14px', backgroundColor: '#f3f4f6', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Markup</p>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: '#111827' }}>{markup.toFixed(0)}%</p>
                </div>
                <div style={{ padding: '14px', backgroundColor: '#dbeafe', borderRadius: '10px' }}>
                  <p style={{ fontSize: '12px', color: '#1e40af', marginBottom: '4px' }}>Suggested Price</p>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: '#1e40af' }}>
                    {currency}{suggestedPrice.toFixed(2)}
                  </p>
                  <p style={{ fontSize: '10px', color: '#6b7280' }}>For {targetMargin}% margin</p>
                </div>
              </div>

              {/* Margin Health Indicator */}
              {price > 0 && (
                <div style={{
                  padding: '16px',
                  backgroundColor: getMarginHealth(profitMargin).bg,
                  borderRadius: '10px',
                  border: `1px solid ${getMarginHealth(profitMargin).color}20`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: getMarginHealth(profitMargin).color }}>
                      Margin Health: {getMarginHealth(profitMargin).label}
                    </span>
                  </div>
                  {/* Visual bar */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                  }}>
                    <div style={{
                      width: `${Math.min(profitMargin, 100)}%`,
                      height: '100%',
                      backgroundColor: getMarginHealth(profitMargin).color,
                      borderRadius: '4px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <p style={{ fontSize: '12px', color: '#374151', margin: 0, lineHeight: 1.4 }}>
                    Your margin is {profitMargin.toFixed(1)}% &mdash; industry average is 65-70%.{' '}
                    {getMarginHealth(profitMargin).desc}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Multi-Item Mode */}
          <div style={{ ...cardStyle, marginBottom: '40px' }}>
            <div
              onClick={() => setShowMultiItem(!showMultiItem)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                Multi-Item Margin Calculator
              </h2>
              <span style={{
                fontSize: '20px',
                color: '#6b7280',
                transform: showMultiItem ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}>
                &#9660;
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px', marginBottom: showMultiItem ? '20px' : '0' }}>
              Compare margins across multiple menu items at once.
            </p>

            {showMultiItem && (
              <>
                {/* Header row (desktop only) */}
                {!isMobile && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 80px 80px 40px',
                    gap: '8px',
                    marginBottom: '8px',
                    padding: '0 4px',
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Item Name</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Food Cost</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Selling Price</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>Margin</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>FC %</span>
                    <span />
                  </div>
                )}

                {items.map((item, idx) => {
                  const result = multiItemResults[idx];
                  return isMobile ? (
                    <div key={idx} style={{
                      padding: '16px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '10px',
                      marginBottom: '12px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Item {idx + 1}</span>
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(idx)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        style={{ ...inputStyle, marginBottom: '8px' }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <input
                          type="number"
                          placeholder={`Cost (${currency})`}
                          value={item.foodCost}
                          onChange={(e) => updateItem(idx, 'foodCost', e.target.value)}
                          style={inputStyle}
                        />
                        <input
                          type="number"
                          placeholder={`Price (${currency})`}
                          value={item.sellingPrice}
                          onChange={(e) => updateItem(idx, 'sellingPrice', e.target.value)}
                          style={inputStyle}
                        />
                      </div>
                      {parseFloat(item.sellingPrice) > 0 && (
                        <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                          <span style={{ color: result.margin >= 65 ? '#059669' : result.margin >= 55 ? '#d97706' : '#dc2626', fontWeight: '600' }}>
                            Margin: {result.margin.toFixed(1)}%
                          </span>
                          <span style={{ color: '#6b7280' }}>
                            FC: {result.foodCostPercent.toFixed(1)}%
                          </span>
                          <span style={{ color: '#374151', fontWeight: '500' }}>
                            Profit: {currency}{result.grossProfit.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div key={idx} style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 80px 80px 40px',
                      gap: '8px',
                      marginBottom: '8px',
                      alignItems: 'center',
                    }}>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        style={{ ...inputStyle, padding: '10px 12px' }}
                      />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.foodCost}
                        onChange={(e) => updateItem(idx, 'foodCost', e.target.value)}
                        style={{ ...inputStyle, padding: '10px 12px' }}
                      />
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.sellingPrice}
                        onChange={(e) => updateItem(idx, 'sellingPrice', e.target.value)}
                        style={{ ...inputStyle, padding: '10px 12px' }}
                      />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: result.margin >= 65 ? '#059669' : result.margin >= 55 ? '#d97706' : '#dc2626',
                        textAlign: 'center',
                      }}>
                        {parseFloat(item.sellingPrice) > 0 ? `${result.margin.toFixed(1)}%` : '-'}
                      </span>
                      <span style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
                        {parseFloat(item.sellingPrice) > 0 ? `${result.foodCostPercent.toFixed(1)}%` : '-'}
                      </span>
                      <button
                        onClick={() => removeItem(idx)}
                        disabled={items.length <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: items.length <= 1 ? '#d1d5db' : '#dc2626',
                          cursor: items.length <= 1 ? 'default' : 'pointer',
                          fontSize: '16px',
                          padding: '4px',
                        }}
                        title="Remove item"
                      >
                        &#10005;
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={addItem}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    border: '1px dashed #d1d5db',
                    borderRadius: '8px',
                    color: '#374151',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    marginTop: '8px',
                    marginBottom: '20px',
                  }}
                >
                  + Add Item
                </button>

                {/* Multi-item summary */}
                {validMultiItems.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
                    gap: '12px',
                    padding: '20px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '10px',
                    border: '1px solid #bbf7d0',
                  }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Items Analyzed</p>
                      <p style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{validMultiItems.length}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Overall Margin</p>
                      <p style={{ fontSize: '20px', fontWeight: '700', color: overallMargin >= 65 ? '#059669' : '#d97706' }}>
                        {overallMargin.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Cost</p>
                      <p style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{currency}{totalCost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total Revenue</p>
                      <p style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>{currency}{totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Benchmarks */}
          <div style={{ ...cardStyle, marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
              Industry Benchmarks
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
              Typical food cost and margin ranges by restaurant type.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: '12px',
            }}>
              {benchmarks.map((item, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '10px',
                  textAlign: 'center',
                  border: '1px solid #f3f4f6',
                }}>
                  <p style={{ fontWeight: '600', color: '#111827', marginBottom: '8px', fontSize: '14px' }}>{item.type}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '2px' }}>Food Cost: {item.cost}</p>
                  <p style={{ fontSize: '13px', color: '#059669', fontWeight: '600' }}>Margin: {item.margin}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SEO Content: Understanding Restaurant Profit Margins */}
          <div style={{ ...cardStyle, marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Understanding Restaurant Profit Margins
            </h2>

            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              What is food cost percentage?
            </h3>
            <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, marginBottom: '16px' }}>
              Food cost percentage is the ratio of ingredient costs to selling price, expressed as a percentage. It tells you how much of every dollar (or rupee, pound, euro) earned goes toward raw materials. The formula is simple: <strong>Food Cost % = (Ingredient Cost / Selling Price) x 100</strong>. For example, if a pasta dish uses $3.50 in ingredients and sells for $14, the food cost is 25%.
            </p>

            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              What are ideal profit margin ranges?
            </h3>
            <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, marginBottom: '16px' }}>
              Most restaurants target a gross profit margin of 65-75% on food items, which corresponds to a food cost of 25-35%. Beverages typically have higher margins (75-85%), while proteins like steak or seafood may have lower margins (55-65%). The key is to balance your menu so that high-margin items offset the lower-margin ones. Your overall blended food cost should ideally stay between 28-32%.
            </p>

            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              How to improve your profit margins
            </h3>
            <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, marginBottom: '0' }}>
              Start by tracking food costs weekly, not monthly. Negotiate with multiple suppliers and compare prices. Reduce waste through proper portioning, FIFO inventory rotation, and cross-utilizing ingredients across dishes. Use menu engineering to promote high-margin items with strategic placement. Consider adjusting portion sizes slightly rather than raising prices. Finally, monitor your theoretical vs. actual food cost to catch theft, over-portioning, or spoilage early.
            </p>
          </div>

          {/* SEO Content: Menu Pricing Strategies */}
          <div style={{ ...cardStyle, marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Menu Pricing Strategies
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>
                  Cost-Plus Pricing
                </h3>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
                  Calculate total ingredient cost and multiply by 3-4x to set the menu price. Simple and ensures a consistent margin, but does not account for what customers are willing to pay.
                </p>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e40af', marginBottom: '8px' }}>
                  Competition-Based Pricing
                </h3>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
                  Research what nearby restaurants charge for similar dishes and price competitively. Works well in saturated markets but may lead to a race to the bottom if not careful.
                </p>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', marginBottom: '8px' }}>
                  Value-Based Pricing
                </h3>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
                  Price based on the perceived value to the customer. A dish with premium ingredients, unique preparation, or strong branding can command higher prices regardless of food cost.
                </p>
              </div>

              <div style={{ padding: '20px', backgroundColor: '#fdf2f8', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#9d174d', marginBottom: '8px' }}>
                  Psychological Pricing
                </h3>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, margin: 0 }}>
                  Use prices ending in .95 or .99, remove currency symbols from menus, and avoid dotted lines to prices. Anchor expensive items at the top of each section to make other items feel like a better deal.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Related tools:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Link href="/tools/food-cost-calculator" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
                  Food Cost Calculator
                </Link>
                <Link href="/tools/menu-engineering" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
                  Menu Engineering
                </Link>
                <Link href="/tools/break-even-calculator" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
                  Break-Even Calculator
                </Link>
                <Link href="/tools/revenue-forecast-calculator" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
                  Revenue Forecast
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{ ...cardStyle, marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              Frequently Asked Questions
            </h2>
            {faqData.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: idx < faqData.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827', lineHeight: 1.4 }}>
                    {faq.q}
                  </span>
                  <span style={{
                    fontSize: '18px',
                    color: '#6b7280',
                    flexShrink: 0,
                    transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}>
                    &#9660;
                  </span>
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 0 16px 0' }}>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7, margin: 0 }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '32px 20px' : '48px 40px',
            backgroundColor: '#ef4444',
            borderRadius: '16px',
            color: 'white',
            marginBottom: '40px',
          }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '700', marginBottom: '12px' }}>
              Track Margins Automatically with DineOpen
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
              Automated inventory tracking, real-time cost analysis, and profit reports for every dish on your menu. Free to start.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: 'white',
                color: '#ef4444',
                borderRadius: '8px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '16px',
              }}
            >
              Start Free Trial &rarr;
            </Link>
          </div>
        </div>
      </div>

      <InternalLinks currentPath="/tools/profit-margin-calculator" variant="tool" />
      <Footer />
    </>
  );
}
