'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function OpeningChecklistClient() {
  const [checkedItems, setCheckedItems] = useState({});
  const [activeCategory, setActiveCategory] = useState('planning');

  useEffect(() => {
    const saved = localStorage.getItem('dineopen_opening_checklist');
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  const toggleItem = (id) => {
    const updated = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(updated);
    localStorage.setItem('dineopen_opening_checklist', JSON.stringify(updated));
  };

  const categories = [
    { id: 'planning', name: 'Planning & Research', icon: '📋' },
    { id: 'legal', name: 'Legal & Licenses', icon: '📜' },
    { id: 'location', name: 'Location & Setup', icon: '🏪' },
    { id: 'equipment', name: 'Equipment & Inventory', icon: '🍳' },
    { id: 'staff', name: 'Hiring & Training', icon: '👥' },
    { id: 'tech', name: 'Technology & POS', icon: '💻' },
    { id: 'marketing', name: 'Marketing & Launch', icon: '📣' },
  ];

  const checklistItems = {
    planning: [
      { id: 'p1', text: 'Define restaurant concept and cuisine type' },
      { id: 'p2', text: 'Create a detailed business plan' },
      { id: 'p3', text: 'Estimate startup costs and budget' },
      { id: 'p4', text: 'Identify target customers and location' },
      { id: 'p5', text: 'Research competition in the area' },
      { id: 'p6', text: 'Finalize restaurant name and branding' },
      { id: 'p7', text: 'Secure funding (savings, loan, investors)' },
    ],
    legal: [
      { id: 'l1', text: 'Register business (Sole Prop / Pvt Ltd / LLP)' },
      { id: 'l2', text: 'Apply for FSSAI license (Basic/State/Central)' },
      { id: 'l3', text: 'Get GST registration' },
      { id: 'l4', text: 'Apply for Trade License from local authority' },
      { id: 'l5', text: 'Obtain Fire Safety NOC' },
      { id: 'l6', text: 'Get Eating House License (if serving alcohol)' },
      { id: 'l7', text: 'Apply for Liquor License (if applicable)' },
      { id: 'l8', text: 'Signage/Hoarding permission' },
      { id: 'l9', text: 'Health Trade License' },
      { id: 'l10', text: 'Register on EPFO and ESIC for staff' },
    ],
    location: [
      { id: 'lo1', text: 'Finalize location and negotiate lease' },
      { id: 'lo2', text: 'Get rent agreement registered' },
      { id: 'lo3', text: 'Plan kitchen layout and workflow' },
      { id: 'lo4', text: 'Design dining area and ambiance' },
      { id: 'lo5', text: 'Ensure proper ventilation and exhaust' },
      { id: 'lo6', text: 'Set up drainage and plumbing' },
      { id: 'lo7', text: 'Install electrical with proper load' },
      { id: 'lo8', text: 'Complete interior work and painting' },
      { id: 'lo9', text: 'Set up restrooms as per standards' },
      { id: 'lo10', text: 'Install signage and exterior branding' },
    ],
    equipment: [
      { id: 'e1', text: 'Purchase cooking equipment (burners, ovens, tandoor)' },
      { id: 'e2', text: 'Buy refrigeration (fridges, freezers, chillers)' },
      { id: 'e3', text: 'Get food prep equipment (mixers, cutters, prep tables)' },
      { id: 'e4', text: 'Purchase crockery, cutlery, and glassware' },
      { id: 'e5', text: 'Buy furniture (tables, chairs, bar stools)' },
      { id: 'e6', text: 'Install exhaust hood and chimney' },
      { id: 'e7', text: 'Set up dish washing area with equipment' },
      { id: 'e8', text: 'Arrange dry storage shelving' },
      { id: 'e9', text: 'Purchase cleaning supplies and chemicals' },
      { id: 'e10', text: 'Stock initial inventory and ingredients' },
    ],
    staff: [
      { id: 's1', text: 'Define roles and job descriptions' },
      { id: 's2', text: 'Hire Head Chef / Kitchen Manager' },
      { id: 's3', text: 'Hire line cooks and kitchen helpers' },
      { id: 's4', text: 'Hire servers and front-of-house staff' },
      { id: 's5', text: 'Hire cashier and manager' },
      { id: 's6', text: 'Complete staff documentation (Aadhar, PAN)' },
      { id: 's7', text: 'Create staff uniforms' },
      { id: 's8', text: 'Conduct food safety training (FSSAI)' },
      { id: 's9', text: 'Train staff on menu and service standards' },
      { id: 's10', text: 'Do mock service runs before opening' },
    ],
    tech: [
      { id: 't1', text: 'Choose and set up POS system' },
      { id: 't2', text: 'Configure menu with prices in POS' },
      { id: 't3', text: 'Set up payment options (UPI, cards)' },
      { id: 't4', text: 'Create digital menu / QR menu' },
      { id: 't5', text: 'Set up accounting software or integrate' },
      { id: 't6', text: 'Configure inventory management' },
      { id: 't7', text: 'Set up WiFi and internet' },
      { id: 't8', text: 'Install CCTV cameras' },
      { id: 't9', text: 'Set up background music system' },
      { id: 't10', text: 'List on Zomato, Swiggy, Google Maps' },
    ],
    marketing: [
      { id: 'm1', text: 'Create logo and brand identity' },
      { id: 'm2', text: 'Set up Instagram, Facebook pages' },
      { id: 'm3', text: 'Create Google My Business listing' },
      { id: 'm4', text: 'Design and print menu cards' },
      { id: 'm5', text: 'Plan soft launch for friends and family' },
      { id: 'm6', text: 'Plan opening day promotion' },
      { id: 'm7', text: 'Invite local food bloggers and influencers' },
      { id: 'm8', text: 'Print visiting cards and flyers' },
      { id: 'm9', text: 'Set up loyalty program' },
      { id: 'm10', text: 'Grand opening celebration' },
    ],
  };

  const getCategoryProgress = (catId) => {
    const items = checklistItems[catId];
    const checked = items.filter(item => checkedItems[item.id]).length;
    return { checked, total: items.length, percent: Math.round((checked / items.length) * 100) };
  };

  const getTotalProgress = () => {
    let total = 0;
    let checked = 0;
    Object.keys(checklistItems).forEach(cat => {
      total += checklistItems[cat].length;
      checked += checklistItems[cat].filter(item => checkedItems[item.id]).length;
    });
    return { checked, total, percent: Math.round((checked / total) * 100) };
  };

  const totalProgress = getTotalProgress();

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Restaurant Opening Checklist</h1>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '24px' }}>
              Complete step-by-step guide to opening your restaurant in India
            </p>
            <div style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}>
              <p style={{ fontSize: '14px', opacity: 0.9 }}>Your Progress</p>
              <p style={{ fontSize: '32px', fontWeight: '800' }}>{totalProgress.percent}%</p>
              <p style={{ fontSize: '13px', opacity: 0.9 }}>{totalProgress.checked} of {totalProgress.total} tasks completed</p>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
              {/* Categories */}
              <div>
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'sticky', top: '100px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '16px', textTransform: 'uppercase' }}>Categories</h3>
                  {categories.map(cat => {
                    const progress = getCategoryProgress(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px', marginBottom: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                          backgroundColor: activeCategory === cat.id ? '#05966920' : 'transparent',
                          borderLeft: activeCategory === cat.id ? '3px solid #059669' : '3px solid transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>{cat.icon}</span>
                          <span style={{ fontSize: '13px', fontWeight: activeCategory === cat.id ? '600' : '500', color: '#111827' }}>{cat.name}</span>
                        </div>
                        <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: progress.percent === 100 ? '#dcfce7' : '#f3f4f6', borderRadius: '10px', color: progress.percent === 100 ? '#166534' : '#6b7280' }}>
                          {progress.percent}%
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: '#111827' }}>
                  {categories.find(c => c.id === activeCategory)?.icon} {categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
                  {getCategoryProgress(activeCategory).checked} of {getCategoryProgress(activeCategory).total} completed
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {checklistItems[activeCategory].map(item => (
                    <label
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '16px',
                        backgroundColor: checkedItems[item.id] ? '#f0fdf4' : '#f9fafb',
                        border: checkedItems[item.id] ? '1px solid #86efac' : '1px solid #e5e7eb',
                        borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedItems[item.id]}
                        onChange={() => toggleItem(item.id)}
                        style={{ width: '20px', height: '20px', accentColor: '#059669' }}
                      />
                      <span style={{
                        fontSize: '15px', color: '#111827',
                        textDecoration: checkedItems[item.id] ? 'line-through' : 'none',
                        opacity: checkedItems[item.id] ? 0.7 : 1
                      }}>
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '60px 20px', backgroundColor: '#059669', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Ready to Launch Your Restaurant?</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Set up your POS, digital menu, and operations with DineOpen.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
