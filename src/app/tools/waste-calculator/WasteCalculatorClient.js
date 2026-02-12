'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function WasteCalculatorClient() {
  const [entries, setEntries] = useState([
    { item: '', quantity: '', unit: 'kg', costPerUnit: '', reason: 'spoilage' }
  ]);
  const [monthlyRevenue, setMonthlyRevenue] = useState('');

  const reasons = [
    { id: 'spoilage', label: 'Spoilage/Expired', icon: '🥀' },
    { id: 'overproduction', label: 'Over-production', icon: '📈' },
    { id: 'plate', label: 'Plate Waste', icon: '🍽️' },
    { id: 'prep', label: 'Prep Waste', icon: '🔪' },
    { id: 'spillage', label: 'Spillage', icon: '💧' },
  ];

  const addEntry = () => {
    setEntries([...entries, { item: '', quantity: '', unit: 'kg', costPerUnit: '', reason: 'spoilage' }]);
  };

  const updateEntry = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const removeEntry = (index) => {
    if (entries.length > 1) setEntries(entries.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return entries.reduce((sum, e) => {
      const qty = parseFloat(e.quantity) || 0;
      const cost = parseFloat(e.costPerUnit) || 0;
      return sum + (qty * cost);
    }, 0);
  };

  const getWasteByReason = () => {
    const grouped = {};
    reasons.forEach(r => grouped[r.id] = 0);
    entries.forEach(e => {
      const qty = parseFloat(e.quantity) || 0;
      const cost = parseFloat(e.costPerUnit) || 0;
      grouped[e.reason] += qty * cost;
    });
    return grouped;
  };

  const totalWaste = calculateTotal();
  const wasteByReason = getWasteByReason();
  const wastePercentage = monthlyRevenue ? ((totalWaste / parseFloat(monthlyRevenue)) * 100).toFixed(1) : 0;

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ fontSize: '48px' }}>🗑️</span>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Food Waste Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.9 }}>
              Track wastage. Spot patterns. Save money. Help the planet.
            </p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
              <div>
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Log Waste Items</h2>
                    <button onClick={addEntry} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>+ Add</button>
                  </div>

                  {entries.map((entry, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 70px 100px 130px 40px', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
                      <input type="text" placeholder="Item name" value={entry.item} onChange={(e) => updateEntry(idx, 'item', e.target.value)} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }} />
                      <input type="number" placeholder="Qty" value={entry.quantity} onChange={(e) => updateEntry(idx, 'quantity', e.target.value)} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }} />
                      <select value={entry.unit} onChange={(e) => updateEntry(idx, 'unit', e.target.value)} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="pcs">pcs</option>
                      </select>
                      <input type="number" placeholder="₹/unit" value={entry.costPerUnit} onChange={(e) => updateEntry(idx, 'costPerUnit', e.target.value)} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }} />
                      <select value={entry.reason} onChange={(e) => updateEntry(idx, 'reason', e.target.value)} style={{ padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }}>
                        {reasons.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                      </select>
                      <button onClick={() => removeEntry(idx)} style={{ padding: '8px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                    </div>
                  ))}
                </div>

                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Waste by Category</h3>
                  {reasons.map(r => {
                    const amount = wasteByReason[r.id];
                    const percent = totalWaste > 0 ? (amount / totalWaste) * 100 : 0;
                    return (
                      <div key={r.id} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', color: '#4b5563' }}>{r.icon} {r.label}</span>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>₹{amount.toFixed(0)}</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${percent}%`, backgroundColor: '#dc2626', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div style={{ backgroundColor: '#fef2f2', borderRadius: '16px', padding: '24px', border: '1px solid #fecaca', marginBottom: '20px', position: 'sticky', top: '100px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b', marginBottom: '16px' }}>Total Waste Cost</h3>
                  <p style={{ fontSize: '36px', fontWeight: '800', color: '#dc2626', marginBottom: '16px' }}>₹{totalWaste.toFixed(0)}</p>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: '#6b7280' }}>Monthly Revenue (for %)</label>
                    <input type="number" placeholder="₹500000" value={monthlyRevenue} onChange={(e) => setMonthlyRevenue(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', marginTop: '4px' }} />
                  </div>

                  {monthlyRevenue && (
                    <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '8px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280' }}>Waste as % of Revenue</p>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: parseFloat(wastePercentage) > 5 ? '#dc2626' : '#059669' }}>{wastePercentage}%</p>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Industry target: 2-5%</p>
                    </div>
                  )}
                </div>

                <div style={{ backgroundColor: '#ecfdf5', padding: '20px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#166534', marginBottom: '12px' }}>💡 Reduce Waste</h4>
                  <ul style={{ fontSize: '13px', color: '#166534', lineHeight: '1.8', paddingLeft: '16px' }}>
                    <li>Use FIFO (First In, First Out)</li>
                    <li>Track daily - spot patterns</li>
                    <li>Adjust prep based on sales</li>
                    <li>Train staff on portioning</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Tools</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', icon: '🧮' },
                { name: 'Inventory Par Calculator', href: '/tools/inventory-par-calculator', icon: '📦' },
                { name: 'Recipe Cost Calculator', href: '/tools/recipe-cost-calculator', icon: '📝' },
                { name: 'Profit Margin Calculator', href: '/tools/profit-margin-calculator', icon: '💰' },
              ].map((tool, idx) => (
                <Link key={idx} href={tool.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{tool.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{tool.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#dc2626', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Track Waste Automatically</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>DineOpen inventory management tracks waste, identifies patterns, and helps you save thousands monthly.</p>
            <Link href="/solutions/reduce-food-waste" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Learn More</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
