'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function MenuEngineeringClient() {
  const [items, setItems] = useState([
    { name: 'Butter Chicken', cost: 120, price: 350, sales: 150 },
    { name: 'Dal Makhani', cost: 40, price: 180, sales: 200 },
    { name: 'Truffle Pasta', cost: 200, price: 450, sales: 30 },
    { name: 'Garden Salad', cost: 30, price: 150, sales: 25 },
  ]);

  const addItem = () => {
    setItems([...items, { name: '', cost: '', price: '', sales: '' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const analyzeMenu = () => {
    const validItems = items.filter(i => i.name && i.cost && i.price && i.sales);
    if (validItems.length < 2) return null;

    const analyzed = validItems.map(item => {
      const cost = parseFloat(item.cost) || 0;
      const price = parseFloat(item.price) || 0;
      const sales = parseFloat(item.sales) || 0;
      const profit = price - cost;
      const margin = price > 0 ? ((profit / price) * 100) : 0;
      const revenue = price * sales;
      const totalProfit = profit * sales;

      return { ...item, cost, price, sales, profit, margin, revenue, totalProfit };
    });

    const avgProfit = analyzed.reduce((sum, i) => sum + i.profit, 0) / analyzed.length;
    const avgSales = analyzed.reduce((sum, i) => sum + i.sales, 0) / analyzed.length;

    const categorized = analyzed.map(item => {
      const highProfit = item.profit >= avgProfit;
      const highPopularity = item.sales >= avgSales;

      let category, color, advice;
      if (highProfit && highPopularity) {
        category = 'Star';
        color = '#22c55e';
        advice = 'Maintain quality, feature prominently, consider slight price increase';
      } else if (highProfit && !highPopularity) {
        category = 'Puzzle';
        color = '#eab308';
        advice = 'Increase visibility, train staff to recommend, consider repositioning';
      } else if (!highProfit && highPopularity) {
        category = 'Plowhorse';
        color = '#3b82f6';
        advice = 'Reduce portion or cost, pair with high-margin items, consider price increase';
      } else {
        category = 'Dog';
        color = '#ef4444';
        advice = 'Consider removing, rebrand, or significantly rework the dish';
      }

      return { ...item, category, color, advice };
    });

    const summary = {
      stars: categorized.filter(i => i.category === 'Star').length,
      puzzles: categorized.filter(i => i.category === 'Puzzle').length,
      plowhorses: categorized.filter(i => i.category === 'Plowhorse').length,
      dogs: categorized.filter(i => i.category === 'Dog').length,
      avgProfit,
      avgSales,
      totalRevenue: analyzed.reduce((sum, i) => sum + i.revenue, 0),
      totalProfit: analyzed.reduce((sum, i) => sum + i.totalProfit, 0),
    };

    return { items: categorized, summary };
  };

  const result = analyzeMenu();

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Menu Engineering Matrix</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Categorize menu items into Stars, Puzzles, Plowhorses & Dogs to maximize profit
            </p>
          </div>
        </section>

        {/* Calculator */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            {/* Input Table */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Enter Menu Items</h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600' }}>Item Name</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>Food Cost (₹)</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>Selling Price (₹)</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600' }}>Monthly Sales</th>
                      <th style={{ padding: '12px', width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateItem(i, 'name', e.target.value)}
                            placeholder="Dish name"
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            value={item.cost}
                            onChange={(e) => updateItem(i, 'cost', e.target.value)}
                            placeholder="120"
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(i, 'price', e.target.value)}
                            placeholder="350"
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <input
                            type="number"
                            value={item.sales}
                            onChange={(e) => updateItem(i, 'sales', e.target.value)}
                            placeholder="150"
                            style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          <button
                            onClick={() => removeItem(i)}
                            style={{ padding: '8px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                onClick={addItem}
                style={{ marginTop: '16px', padding: '12px 24px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                + Add Item
              </button>
            </div>

            {result && (
              <>
                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  {[
                    { label: 'Stars', count: result.summary.stars, color: '#22c55e', icon: '⭐' },
                    { label: 'Puzzles', count: result.summary.puzzles, color: '#eab308', icon: '🧩' },
                    { label: 'Plowhorses', count: result.summary.plowhorses, color: '#3b82f6', icon: '🐴' },
                    { label: 'Dogs', count: result.summary.dogs, color: '#ef4444', icon: '🐕' },
                  ].map((cat, i) => (
                    <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', borderTop: `4px solid ${cat.color}` }}>
                      <p style={{ fontSize: '24px', marginBottom: '4px' }}>{cat.icon}</p>
                      <p style={{ fontSize: '28px', fontWeight: '800', color: cat.color }}>{cat.count}</p>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>{cat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Results Table */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Menu Analysis Results</h3>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f3f4f6' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Item</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>Category</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>Profit/Item</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>Sales</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px' }}>Total Profit</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Recommendation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.items.map((item, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '14px', fontWeight: '600' }}>{item.name}</td>
                            <td style={{ padding: '14px', textAlign: 'center' }}>
                              <span style={{ padding: '4px 12px', backgroundColor: `${item.color}20`, color: item.color, borderRadius: '20px', fontWeight: '600', fontSize: '13px' }}>
                                {item.category}
                              </span>
                            </td>
                            <td style={{ padding: '14px', textAlign: 'center', fontWeight: '600' }}>₹{item.profit}</td>
                            <td style={{ padding: '14px', textAlign: 'center' }}>{item.sales}</td>
                            <td style={{ padding: '14px', textAlign: 'center', fontWeight: '600', color: '#22c55e' }}>₹{item.totalProfit.toLocaleString()}</td>
                            <td style={{ padding: '14px', fontSize: '13px', color: '#6b7280' }}>{item.advice}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Avg Profit Threshold</p>
                      <p style={{ fontSize: '20px', fontWeight: '700' }}>₹{result.summary.avgProfit.toFixed(0)}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Avg Sales Threshold</p>
                      <p style={{ fontSize: '20px', fontWeight: '700' }}>{result.summary.avgSales.toFixed(0)}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Total Revenue</p>
                      <p style={{ fontSize: '20px', fontWeight: '700' }}>₹{result.summary.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '12px', color: '#6b7280' }}>Total Profit</p>
                      <p style={{ fontSize: '20px', fontWeight: '700', color: '#22c55e' }}>₹{result.summary.totalProfit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#8b5cf6', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Get Real-Time Menu Analytics</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen automatically tracks item performance and suggests optimizations.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#8b5cf6', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
