'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function ZomatoOnboardingClient() {
  const requirements = [
    { doc: 'FSSAI License', required: true, note: '14-digit license number' },
    { doc: 'GST Certificate', required: true, note: 'GSTIN for tax compliance' },
    { doc: 'PAN Card', required: true, note: 'Business/proprietor PAN' },
    { doc: 'Bank Account', required: true, note: 'Cancelled cheque or passbook' },
    { doc: 'Menu Card', required: true, note: 'With prices and item descriptions' },
    { doc: 'Restaurant Photos', required: true, note: 'Minimum 5-10 high-quality images' },
    { doc: 'Address Proof', required: true, note: 'Utility bill or rent agreement' },
  ];

  const steps = [
    { step: 1, title: 'Visit Zomato for Business', desc: 'Go to zomato.com/business or download Zomato Restaurant Partner app', time: '2 min' },
    { step: 2, title: 'Create Account', desc: 'Sign up with phone number and email', time: '3 min' },
    { step: 3, title: 'Add Restaurant Details', desc: 'Name, address, cuisine, timings, delivery radius', time: '10 min' },
    { step: 4, title: 'Upload Documents', desc: 'FSSAI, GST, PAN, bank details', time: '10 min' },
    { step: 5, title: 'Upload Menu', desc: 'Add items with photos, prices, and descriptions', time: '30 min' },
    { step: 6, title: 'Verification', desc: 'Zomato verifies documents and details', time: '2-5 days' },
    { step: 7, title: 'Onboarding Call', desc: 'Zomato rep explains dashboard and processes', time: '1 day' },
    { step: 8, title: 'Go Live!', desc: 'Start receiving orders', time: 'Same day' },
  ];

  const commissions = [
    { type: 'Food Delivery', rate: '18-28%', note: 'Based on order value and city' },
    { type: 'Zomato Gold', rate: 'Extra 3-5%', note: 'For membership orders' },
    { type: 'Dine-in (Zomato Pay)', rate: '0-5%', note: 'Optional, for table bookings' },
    { type: 'GST on Commission', rate: '18%', note: 'On the commission amount' },
  ];

  const features = [
    { name: 'Zomato Ads', desc: 'Boost visibility with paid promotions' },
    { name: 'Analytics Dashboard', desc: 'Track orders, revenue, ratings' },
    { name: 'Customer Reviews', desc: 'Respond to reviews, build reputation' },
    { name: 'Hyperpure', desc: 'Order supplies directly from Zomato' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #e23744 0%, #cb202d 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍽️</div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>How to Register on Zomato</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Get your restaurant on India&apos;s largest food platform. Complete guide inside.
            </p>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '40px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
            {[
              { stat: '3-7 days', label: 'Approval Time' },
              { stat: '18-28%', label: 'Commission' },
              { stat: '800+', label: 'Cities' },
              { stat: 'Weekly', label: 'Payouts' },
            ].map((item, idx) => (
              <div key={idx}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#e23744' }}>{item.stat}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>📋 Documents Required</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {requirements.map((req, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: idx < requirements.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px' }}>✅</span>
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{req.doc}</p>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>{req.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>🚀 Registration Steps</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {steps.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#e23744', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>{s.step}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{s.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{s.desc}</p>
                  </div>
                  <div style={{ fontSize: '13px', color: '#e23744', fontWeight: '600', whiteSpace: 'nowrap' }}>⏱ {s.time}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>💰 Zomato Commission Rates</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {commissions.map((c, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{c.type}</p>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: '#e23744' }}>{c.rate}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>{c.note}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <Link href="/tools/swiggy-zomato-calculator" style={{ color: '#e23744', fontWeight: '600', textDecoration: 'underline' }}>
                Calculate your actual earnings →
              </Link>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>🎁 Zomato Partner Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {features.map((f, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#991b1b', marginBottom: '6px' }}>{f.name}</p>
                  <p style={{ fontSize: '14px', color: '#b91c1c' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Guides</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Swiggy Registration', href: '/resources/swiggy-onboarding', icon: '🍔' },
                { name: 'FSSAI License Guide', href: '/resources/fssai-registration', icon: '📜' },
                { name: 'GST for Restaurants', href: '/resources/gst-restaurants', icon: '🧾' },
                { name: 'Commission Calculator', href: '/tools/swiggy-zomato-calculator', icon: '🧮' },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#e23744', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage Zomato Orders Seamlessly</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen integrates with Zomato. Auto-accept orders, sync menu, track performance - all in one dashboard.</p>
            <Link href="/india" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#e23744', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Explore Integration</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
