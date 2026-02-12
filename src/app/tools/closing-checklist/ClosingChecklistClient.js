'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function ClosingChecklistClient() {
  const [checkedItems, setCheckedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState('kitchen');

  useEffect(() => {
    const saved = localStorage.getItem('dineopen_closing_checklist');
    if (saved) setCheckedItems(JSON.parse(saved));
  }, []);

  const toggleItem = (id) => {
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    localStorage.setItem('dineopen_closing_checklist', JSON.stringify(updated));
  };

  const resetAll = () => {
    setCheckedItems({});
    localStorage.removeItem('dineopen_closing_checklist');
  };

  const categories = [
    { id: 'kitchen', name: 'Kitchen Closing', icon: '🍳', color: '#ef4444' },
    { id: 'foh', name: 'Front of House', icon: '🪑', color: '#f59e0b' },
    { id: 'cash', name: 'Cash & POS', icon: '💰', color: '#10b981' },
    { id: 'inventory', name: 'Inventory Check', icon: '📦', color: '#6366f1' },
    { id: 'security', name: 'Security & Lockup', icon: '🔒', color: '#8b5cf6' },
  ];

  const checklistItems = {
    kitchen: [
      { id: 'k1', text: 'Turn off all burners, ovens, and grills' },
      { id: 'k2', text: 'Clean cooking stations and prep tables' },
      { id: 'k3', text: 'Cover and date all prepped food items' },
      { id: 'k4', text: 'Store all food in proper containers' },
      { id: 'k5', text: 'Check fridge/freezer temperatures and log' },
      { id: 'k6', text: 'Clean fryer and filter oil (if applicable)' },
      { id: 'k7', text: 'Run dishwasher final cycle and drain' },
      { id: 'k8', text: 'Take out kitchen trash and replace bags' },
      { id: 'k9', text: 'Mop kitchen floors' },
      { id: 'k10', text: 'Turn off exhaust hood and lights' },
    ],
    foh: [
      { id: 'f1', text: 'Clear and wipe all tables' },
      { id: 'f2', text: 'Flip chairs onto tables (if required)' },
      { id: 'f3', text: 'Refill salt, pepper, and condiments' },
      { id: 'f4', text: 'Restock napkins and tissue dispensers' },
      { id: 'f5', text: 'Clean bar area and sink' },
      { id: 'f6', text: 'Wipe menu cards and sanitize' },
      { id: 'f7', text: 'Check restrooms - clean and restock' },
      { id: 'f8', text: 'Vacuum/sweep dining area floor' },
      { id: 'f9', text: 'Take out front-of-house trash' },
      { id: 'f10', text: 'Turn off music and displays' },
    ],
    cash: [
      { id: 'c1', text: 'Run end-of-day report on POS' },
      { id: 'c2', text: 'Count cash drawer and reconcile' },
      { id: 'c3', text: 'Check card payments match POS total' },
      { id: 'c4', text: 'Record any discrepancies in log' },
      { id: 'c5', text: 'Prepare bank deposit if needed' },
      { id: 'c6', text: 'Secure cash in safe' },
      { id: 'c7', text: 'Print daily sales summary' },
      { id: 'c8', text: 'Log out of all POS terminals' },
      { id: 'c9', text: 'Check pending online orders are completed' },
      { id: 'c10', text: 'Disable online ordering for the day' },
    ],
    inventory: [
      { id: 'i1', text: 'Check stock levels of high-use items' },
      { id: 'i2', text: 'Note items running low for next order' },
      { id: 'i3', text: 'Check expiry dates - FIFO rotation' },
      { id: 'i4', text: 'Dispose of any expired items' },
      { id: 'i5', text: 'Log any wastage or spillage' },
      { id: 'i6', text: 'Verify delivery received matches order' },
      { id: 'i7', text: 'Update inventory count in system' },
    ],
    security: [
      { id: 's1', text: 'Check all windows are closed' },
      { id: 's2', text: 'Ensure back door is locked' },
      { id: 's3', text: 'Turn off all unnecessary lights' },
      { id: 's4', text: 'Set AC/heating to night mode' },
      { id: 's5', text: 'Turn off gas main valve' },
      { id: 's6', text: 'Check water taps are closed' },
      { id: 's7', text: 'Arm security system/CCTV check' },
      { id: 's8', text: 'Lock main entrance and shutters' },
      { id: 's9', text: 'Log closing time and staff signatures' },
    ],
  };

  const getCategoryProgress = (catId) => {
    const items = checklistItems[catId];
    const checked = items.filter(item => checkedItems[item.id]).length;
    return { checked, total: items.length, percent: Math.round((checked / items.length) * 100) };
  };

  const getTotalProgress = () => {
    let total = 0, checked = 0;
    Object.keys(checklistItems).forEach(cat => {
      total += checklistItems[cat].length;
      checked += checklistItems[cat].filter(item => checkedItems[item.id]).length;
    });
    return { checked, total, percent: Math.round((checked / total) * 100) };
  };

  const totalProgress = getTotalProgress();
  const currentCat = categories.find(c => c.id === activeCategory);

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ fontSize: '48px' }}>🌙</span>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Closing Checklist</h1>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>
              End your shift right. Never forget a closing task again.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ padding: '16px 32px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <p style={{ fontSize: '32px', fontWeight: '800' }}>{totalProgress.percent}%</p>
                <p style={{ fontSize: '13px', opacity: 0.9 }}>{totalProgress.checked}/{totalProgress.total} done</p>
              </div>
              <button onClick={resetAll} style={{ padding: '16px 24px', backgroundColor: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '12px', color: 'white', cursor: 'pointer', fontSize: '14px' }}>
                🔄 Reset for Tomorrow
              </button>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
              <div>
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'sticky', top: '100px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase' }}>Areas</h3>
                  {categories.map(cat => {
                    const progress = getCategoryProgress(cat.id);
                    return (
                      <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', marginBottom: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer', backgroundColor: activeCategory === cat.id ? `${cat.color}15` : 'transparent', borderLeft: activeCategory === cat.id ? `3px solid ${cat.color}` : '3px solid transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>{cat.icon}</span>
                          <span style={{ fontSize: '13px', fontWeight: activeCategory === cat.id ? '600' : '500', color: '#111827' }}>{cat.name}</span>
                        </div>
                        <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: progress.percent === 100 ? '#dcfce7' : '#f3f4f6', borderRadius: '10px', color: progress.percent === 100 ? '#166534' : '#6b7280' }}>{progress.percent}%</span>
                      </button>
                    );
                  })}
                  <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '10px' }}>
                    <p style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>💡 Pro Tip</p>
                    <p style={{ fontSize: '12px', color: '#166534', marginTop: '4px' }}>Pair with <Link href="/tools/opening-checklist" style={{ textDecoration: 'underline' }}>Opening Checklist</Link> for complete coverage!</p>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>
                  {currentCat?.icon} {currentCat?.name}
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{getCategoryProgress(activeCategory).checked} of {getCategoryProgress(activeCategory).total} completed</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {checklistItems[activeCategory].map(item => (
                    <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', backgroundColor: checkedItems[item.id] ? '#f0fdf4' : '#f9fafb', border: checkedItems[item.id] ? '1px solid #86efac' : '1px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!checkedItems[item.id]} onChange={() => toggleItem(item.id)} style={{ width: '20px', height: '20px', accentColor: currentCat?.color }} />
                      <span style={{ fontSize: '15px', color: '#111827', textDecoration: checkedItems[item.id] ? 'line-through' : 'none', opacity: checkedItems[item.id] ? 0.7 : 1 }}>{item.text}</span>
                    </label>
                  ))}
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
                { name: 'Opening Checklist', href: '/tools/opening-checklist', icon: '☀️' },
                { name: 'Inventory Management', href: '/features/inventory-management', icon: '📦' },
                { name: 'Staff Calculator', href: '/tools/staff-calculator', icon: '👥' },
                { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', icon: '🧮' },
              ].map((tool, idx) => (
                <Link key={idx} href={tool.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{tool.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{tool.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#1e293b', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Automate Your Closing Reports</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>DineOpen POS auto-generates end-of-day reports, tracks cash, and syncs inventory.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
