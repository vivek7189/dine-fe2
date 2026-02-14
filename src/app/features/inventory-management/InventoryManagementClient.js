'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaBoxes, FaExclamationTriangle, FaReceipt, FaChartLine, FaCalculator, FaBell, FaClipboardList, FaSync } from 'react-icons/fa';

export default function InventoryManagementClient() {
  const features = [
    { icon: FaBoxes, title: 'Real-Time Stock Tracking', desc: 'Know exactly what you have. Updated with every sale automatically.' },
    { icon: FaExclamationTriangle, title: 'Low Stock Alerts', desc: 'Get notified before you run out. Never 86 a popular item.' },
    { icon: FaReceipt, title: 'Recipe Costing', desc: 'Link ingredients to recipes. Know exact cost per dish.' },
    { icon: FaCalculator, title: 'Par Level Management', desc: 'Set optimal stock levels. Auto-suggest purchase orders.' },
    { icon: FaChartLine, title: 'Waste Tracking', desc: 'Log waste by reason. Identify patterns. Reduce losses.' },
    { icon: FaSync, title: 'Vendor Management', desc: 'Track vendors, prices, lead times. Compare and save.' },
    { icon: FaBell, title: 'Expiry Tracking', desc: 'FIFO alerts. Never serve expired ingredients.' },
    { icon: FaClipboardList, title: 'Stock Take', desc: 'Easy physical count. Spot variances instantly.' },
  ];

  const benefits = [
    { stat: '15-20%', label: 'Reduction in Food Cost', desc: 'By tracking waste and optimizing orders' },
    { stat: '5+ hrs', label: 'Saved Weekly', desc: 'On manual inventory counts and ordering' },
    { stat: '90%', label: 'Fewer Stockouts', desc: 'With automated low stock alerts' },
    { stat: '100%', label: 'Cost Visibility', desc: 'Know your food cost in real-time' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FaBoxes style={{ fontSize: '64px', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>
              Inventory Management
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Track every ingredient. Reduce waste. Know your true food cost. All automatic.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#047857', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/contact" style={{ padding: '16px 32px', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '40px', textAlign: 'center' }}>Why Restaurants Love Our Inventory System</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {benefits.map((b, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '16px' }}>
                  <p style={{ fontSize: '36px', fontWeight: '800', color: '#059669', marginBottom: '8px' }}>{b.stat}</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{b.label}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Complete Inventory Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {features.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <f.icon style={{ fontSize: '22px', color: '#059669' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>How It Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {[
                { step: '1', title: 'Add Ingredients', desc: 'Import or add your inventory items with units, costs, and vendors' },
                { step: '2', title: 'Link to Recipes', desc: 'Connect ingredients to menu items. System tracks usage automatically' },
                { step: '3', title: 'Track & Optimize', desc: 'Get alerts, reports, and insights to reduce waste and costs' },
              ].map((s, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#059669', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', margin: '0 auto 16px' }}>{s.step}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Tools & Features</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', icon: '🧮' },
                { name: 'Par Level Calculator', href: '/tools/inventory-par-calculator', icon: '📊' },
                { name: 'Waste Calculator', href: '/tools/waste-calculator', icon: '🗑️' },
                { name: 'Recipe Cost Calculator', href: '/tools/recipe-cost-calculator', icon: '📝' },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#059669', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Take Control of Your Inventory</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Start tracking stock, reducing waste, and saving money today.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
