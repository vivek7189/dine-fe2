'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function KitchenLandingClient() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: '📋', title: 'Status Filtering', description: 'Filter orders by pending, in-progress, ready, or completed. Keep your kitchen screen focused on what matters right now.' },
    { icon: '🔔', title: 'Sound Notifications', description: 'Audible alerts for new incoming orders. Your kitchen staff never miss a ticket, even during the busiest service hours.' },
    { icon: '⏱️', title: 'Cooking Timers', description: 'Built-in timers for each order help track preparation time. Know exactly how long each dish has been in progress.' },
    { icon: '🔄', title: 'Real-Time Updates', description: 'Orders appear instantly via Pusher real-time sync. No refreshing, no delays - orders show up the moment they are placed.' },
    { icon: '🖨️', title: 'Print Receipts', description: 'Print individual KOT tickets when needed. Perfect for expediting or kitchens transitioning from paper to digital.' },
    { icon: '📅', title: 'Date Filtering', description: 'View orders from today, last 24 hours, or all time. Useful for reviewing past performance and tracking completion rates.' },
    { icon: '▶️', title: 'Status Transitions', description: 'Move orders through stages: start cooking, mark ready, complete. One-tap transitions keep the workflow smooth.' },
    { icon: '🗑️', title: 'Order Deletion with Reason', description: 'Cancel orders with a mandatory reason. Maintains accountability and provides data for reducing cancellations.' },
  ];

  const workflow = [
    { step: '1', title: 'Order Placed', desc: 'Waiter submits order from POS, app, or QR scan' },
    { step: '2', title: 'KOT Appears', desc: 'Order instantly shows on kitchen display with sound alert' },
    { step: '3', title: 'Start Cooking', desc: 'Kitchen staff taps to mark order as in-progress' },
    { step: '4', title: 'Timer Tracks', desc: 'Built-in timer shows elapsed preparation time' },
    { step: '5', title: 'Mark Ready', desc: 'One tap marks order as ready for pickup or serving' },
  ];

  const comparison = [
    { feature: 'Real-time order updates', dineopen: true, freshkds: true },
    { feature: 'Cooking timers', dineopen: true, freshkds: false },
    { feature: 'Sound notifications', dineopen: true, freshkds: true },
    { feature: 'Order deletion with reason', dineopen: true, freshkds: false },
    { feature: 'Print KOT receipts', dineopen: true, freshkds: false },
    { feature: 'Date-based filtering', dineopen: true, freshkds: false },
    { feature: 'Status filtering (5 statuses)', dineopen: true, freshkds: true },
    { feature: 'Individual KOT viewing', dineopen: true, freshkds: true },
    { feature: 'Starting price', dineopen: '$9.99/mo', freshkds: '$29/mo' },
    { feature: 'Transaction fees', dineopen: 'Zero', freshkds: 'Varies' },
  ];

  const faqs = [
    { q: 'What is a Kitchen Display System (KDS)?', a: 'A KDS replaces paper tickets in your kitchen with a digital screen that shows orders in real-time. Orders appear automatically when waiters submit them, with color-coded statuses, cooking timers, and sound alerts so your kitchen never misses an order. It runs on any tablet, monitor, or TV with a web browser.' },
    { q: 'How does DineOpen Kitchen compare to FreshKDS?', a: 'DineOpen Kitchen includes cooking timers, sound notifications, real-time updates, order deletion with reasons, and print receipts - all in the base plan starting at $9.99/mo. FreshKDS starts at $29/mo and charges extra for many features. DineOpen also has zero transaction fees on all plans.' },
    { q: 'Can I filter orders by status in the kitchen display?', a: 'Yes. You can filter by all orders, pending, in-progress, ready, and completed. Combined with date filtering (today, last 24 hours, or all), this keeps your kitchen screen focused only on the orders that matter right now.' },
    { q: 'Does the KDS support sound notifications?', a: 'Yes. DineOpen Kitchen plays audible alerts when new orders arrive so kitchen staff never miss an incoming ticket, even during the busiest service. Sound settings can be adjusted based on your kitchen environment.' },
    { q: 'Can I print KOT tickets from the kitchen display?', a: 'Absolutely. While the digital display reduces paper waste, you can print individual KOT tickets or receipts whenever needed. This is especially useful for expediting or for kitchens gradually transitioning from paper to digital workflows.' },
    { q: 'What devices can run the kitchen display?', a: 'Any device with a web browser works - tablets, monitors, TVs, laptops, or phones. Many restaurants mount an affordable Android tablet or connect a TV in the kitchen. No special hardware or app installation required.' },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen Kitchen
            </div>
            <h1 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Kitchen Display System<br />That Keeps Your Kitchen in Sync
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Replace paper KOT tickets with a real-time digital display. Sound alerts for new orders, cooking timers, status tracking - everything your kitchen needs to run faster and smoother.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=kitchen" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Start Free Trial
              </Link>
              <Link href="/pricing" style={{ padding: '16px 32px', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', backgroundColor: 'transparent' }}>
                See Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ backgroundColor: 'white', padding: '48px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '32px', textAlign: 'center' }}>
            {[
              { metric: '50%', label: 'Faster ticket processing' },
              { metric: '5', label: 'Order status filters' },
              { metric: '0', label: 'Missed orders with alerts' },
              { metric: '$9.99', label: 'Per month starting price' },
            ].map((stat, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>{stat.metric}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Everything Your Kitchen Needs
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '18px', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
              Built from 2,536 lines of real kitchen management code, handling every aspect of kitchen operations.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {features.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How It Works
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
              {workflow.map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center', flex: '1 1 160px', maxWidth: '180px' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 auto 16px' }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              DineOpen Kitchen vs FreshKDS
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px' }}>See why restaurants switch to DineOpen Kitchen.</p>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 20px', backgroundColor: '#f9fafb', fontWeight: '700', fontSize: '14px', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                <span>Feature</span>
                <span style={{ textAlign: 'center' }}>DineOpen</span>
                <span style={{ textAlign: 'center' }}>FreshKDS</span>
              </div>
              {comparison.map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '14px 20px', borderBottom: idx < comparison.length - 1 ? '1px solid #f3f4f6' : 'none', fontSize: '14px' }}>
                  <span style={{ color: '#374151' }}>{row.feature}</span>
                  <span style={{ textAlign: 'center', color: row.dineopen === true ? '#16a34a' : '#111827', fontWeight: typeof row.dineopen === 'string' ? '700' : '400' }}>
                    {row.dineopen === true ? '✓' : row.dineopen === false ? '✗' : row.dineopen}
                  </span>
                  <span style={{ textAlign: 'center', color: row.freshkds === true ? '#16a34a' : row.freshkds === false ? '#ef4444' : '#111827', fontWeight: typeof row.freshkds === 'string' ? '700' : '400' }}>
                    {row.freshkds === true ? '✓' : row.freshkds === false ? '✗' : row.freshkds}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sub-product Links */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Explore Kitchen Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              <Link href="/products/kitchen/kot" style={{ textDecoration: 'none', backgroundColor: '#fef2f2', borderRadius: '12px', padding: '32px', border: '1px solid #fecaca', display: 'block' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Kitchen Order Tickets (KOT)</h3>
                <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.6, marginBottom: '12px' }}>Manage individual KOT tickets, print receipts, track order items, and handle special instructions.</p>
                <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>Learn more →</span>
              </Link>
              <Link href="/products/kitchen/display" style={{ textDecoration: 'none', backgroundColor: '#fef2f2', borderRadius: '12px', padding: '32px', border: '1px solid #fecaca', display: 'block' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Kitchen Display Screens</h3>
                <p style={{ color: '#374151', fontSize: '15px', lineHeight: 1.6, marginBottom: '12px' }}>Real-time display for kitchen screens with status updates, sound notifications, and cooking timers.</p>
                <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>Learn more →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>Zero transaction fees on every plan.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Spark</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>For small restaurants</p>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$9.99<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹300/mo in India</p>
                <Link href="/login?ref=kitchen" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
                  Get Started
                </Link>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Blaze</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>For multi-location restaurants</p>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$89<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹2,500/mo in India</p>
                <Link href="/login?ref=kitchen" style={{ display: 'block', padding: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', textAlign: 'center' }}>
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 0' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}
                >
                  <span style={{ fontSize: '17px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                  <span style={{ fontSize: '24px', color: '#6b7280', transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openFaq === idx && (
                  <p style={{ marginTop: '12px', fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
              Ready to Upgrade Your Kitchen?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>
              Join thousands of restaurants running their kitchen on DineOpen. Start your free trial today.
            </p>
            <Link href="/login?ref=kitchen" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
