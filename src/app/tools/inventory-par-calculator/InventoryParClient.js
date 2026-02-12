'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function InventoryParClient() {
  const [items, setItems] = useState([
    { name: '', dailyUsage: '', leadTime: '', safetyDays: '2' }
  ]);

  const addItem = () => {
    setItems([...items, { name: '', dailyUsage: '', leadTime: '', safetyDays: '2' }]);
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculatePar = (item) => {
    const daily = parseFloat(item.dailyUsage) || 0;
    const lead = parseFloat(item.leadTime) || 0;
    const safety = parseFloat(item.safetyDays) || 0;
    const parLevel = (daily * lead) + (daily * safety);
    const reorderPoint = daily * lead;
    return { parLevel: Math.ceil(parLevel), reorderPoint: Math.ceil(reorderPoint) };
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ fontSize: '48px' }}>📦</span>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Inventory Par Level Calculator</h1>
            <p style={{ fontSize: '18px', opacity: 0.9 }}>
              Never run out of stock. Never overorder. Find your perfect inventory levels.
            </p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>Calculate Par Levels</h2>
                <button onClick={addItem} style={{ padding: '10px 20px', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>+ Add Item</button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f9fafb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Item Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Daily Usage</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Lead Time (days)</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Safety Stock (days)</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#059669' }}>Par Level</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#f59e0b' }}>Reorder At</th>
                      <th style={{ padding: '12px', width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const { parLevel, reorderPoint } = calculatePar(item);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '12px' }}>
                            <input type="text" placeholder="e.g., Onions (kg)" value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }} />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input type="number" placeholder="10" value={item.dailyUsage} onChange={(e) => updateItem(idx, 'dailyUsage', e.target.value)} style={{ width: '80px', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }} />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input type="number" placeholder="2" value={item.leadTime} onChange={(e) => updateItem(idx, 'leadTime', e.target.value)} style={{ width: '80px', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }} />
                          </td>
                          <td style={{ padding: '12px' }}>
                            <input type="number" placeholder="2" value={item.safetyDays} onChange={(e) => updateItem(idx, 'safetyDays', e.target.value)} style={{ width: '80px', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '14px' }} />
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>{parLevel || '-'}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>{reorderPoint || '-'}</span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button onClick={() => removeItem(idx)} style={{ padding: '6px 10px', backgroundColor: '#fee2e2', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#166534', marginBottom: '12px' }}>📊 Par Level Formula</h3>
                <p style={{ fontSize: '14px', color: '#166534', fontFamily: 'monospace', backgroundColor: 'white', padding: '12px', borderRadius: '6px' }}>
                  Par = (Daily Usage × Lead Time) + Safety Stock
                </p>
              </div>
              <div style={{ backgroundColor: '#fef3c7', padding: '24px', borderRadius: '12px', border: '1px solid #fcd34d' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', marginBottom: '12px' }}>🔔 Reorder Point</h3>
                <p style={{ fontSize: '14px', color: '#92400e' }}>
                  Order when stock reaches this level. Gives you buffer during vendor lead time.
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>💡 Quick Tips</h3>
              <ul style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.8' }}>
                <li><strong>Track actual usage</strong> for 2-4 weeks before setting par levels</li>
                <li><strong>Increase safety stock</strong> for high-demand items or unreliable vendors</li>
                <li><strong>Review monthly</strong> - usage patterns change with seasons</li>
                <li><strong>Perishables</strong> need lower par levels to reduce waste</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Tools</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', icon: '🧮' },
                { name: 'Recipe Cost Calculator', href: '/tools/recipe-cost-calculator', icon: '📝' },
                { name: 'Waste Calculator', href: '/tools/waste-calculator', icon: '🗑️' },
                { name: 'Closing Checklist', href: '/tools/closing-checklist', icon: '✅' },
              ].map((tool, idx) => (
                <Link key={idx} href={tool.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{tool.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{tool.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#6366f1', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Automate Your Inventory</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>DineOpen tracks stock in real-time, auto-calculates par levels, and alerts you before stockouts.</p>
            <Link href="/features/inventory-management" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#6366f1', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Learn More</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
