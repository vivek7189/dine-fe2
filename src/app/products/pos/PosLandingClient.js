'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaShoppingCart, FaCreditCard, FaBolt, FaMapMarkerAlt, FaTruck, FaUtensils, FaCheckCircle, FaArrowRight, FaSearch, FaReceipt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function PosLandingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: <FaShoppingCart size={28} />, title: 'Order Management', description: 'Interactive menu browsing with category filters, quick search, and short code lookup. Build orders with a shopping cart, manage quantities, and add special instructions - all from one screen.' },
    { icon: <FaCreditCard size={28} />, title: 'Multi-Payment Support', description: 'Accept cash, credit/debit cards, and UPI payments. Select the method at checkout, generate receipts instantly, and keep clean records for accounting. Zero transaction fees on all plans.' },
    { icon: <FaBolt size={28} />, title: 'Real-Time Updates', description: 'Powered by Pusher websockets. Orders appear on kitchen screens the moment they are placed. Status changes propagate instantly across all devices - no manual refresh needed.' },
    { icon: <FaMapMarkerAlt size={28} />, title: 'Multi-Location', description: 'Switch between restaurant locations from the POS interface. Each location maintains its own menu, staff, tables, and settings. Consolidated reporting across all branches.' },
    { icon: <FaTruck size={28} />, title: 'Delivery & Takeaway', description: 'Dedicated order flows for takeout and delivery. Manage delivery addresses, packaging notes, and rider assignments alongside your dine-in orders in one unified queue.' },
    { icon: <FaUtensils size={28} />, title: 'Dine-In & Room Service', description: 'Visual table selection for dine-in with manual table number entry. Room service mode for hotels with room selection. Saved orders queue lets you park and recall orders easily.' },
  ];

  const steps = [
    { num: '1', title: 'Browse Menu', desc: 'Search items by name, category, or short code. Add to cart with one tap.' },
    { num: '2', title: 'Choose Order Type', desc: 'Select dine-in (pick table), takeout, delivery, or room service.' },
    { num: '3', title: 'Confirm & Pay', desc: 'Review the order, apply taxes automatically, and select payment method.' },
    { num: '4', title: 'Print & Track', desc: 'Print receipt, send KOT to kitchen, and track order status in real time.' },
  ];

  const audiences = [
    { name: 'Restaurants', desc: 'Full-service and casual dining with table management and dine-in ordering.' },
    { name: 'Cafes & Bakeries', desc: 'Quick-service counter ordering with fast checkout and takeaway support.' },
    { name: 'Bars & Lounges', desc: 'Tab management, drink modifiers, and multi-payment splitting.' },
    { name: 'Cloud Kitchens', desc: 'Delivery-first operations with multi-brand menu management.' },
    { name: 'Food Trucks', desc: 'Mobile-friendly POS that runs on your phone. No bulky hardware needed.' },
  ];

  const comparisons = [
    { name: 'DineOpen POS', price: 'From $20/mo', txFee: '0%', cloud: 'Yes', multiLoc: 'Yes', hardware: 'None required', highlight: true },
    { name: 'Petpooja', price: 'Custom quote', txFee: 'Varies', cloud: 'Yes', multiLoc: 'Add-on', hardware: 'Proprietary' },
    { name: 'Square POS', price: 'Free + fees', txFee: '2.6% + 10c', cloud: 'Yes', multiLoc: 'Yes', hardware: 'Square terminal' },
    { name: 'Toast POS', price: 'From $69/mo', txFee: '2.49% + 15c', cloud: 'Yes', multiLoc: 'Add-on', hardware: 'Toast terminal' },
    { name: 'POSist', price: 'Custom quote', txFee: 'Varies', cloud: 'Yes', multiLoc: 'Add-on', hardware: 'Optional' },
  ];

  const faqs = [
    { q: 'What is a restaurant POS system?', a: 'A restaurant POS (Point of Sale) system is software that handles order taking, payment processing, and restaurant operations from a single interface. DineOpen POS supports dine-in, takeout, delivery, and room service orders with real-time kitchen sync.' },
    { q: 'Does DineOpen POS charge transaction fees?', a: 'No. DineOpen charges zero transaction fees on all plans. You pay only the monthly subscription - Starter at $20/mo or Pro at $99/mo. Every dollar your restaurant earns stays with you.' },
    { q: 'Can I use DineOpen POS on my phone or tablet?', a: 'Yes. DineOpen POS is fully cloud-based and works on any device with a modern browser - phones, tablets, laptops, or desktops. No special hardware or app download required.' },
    { q: 'Does DineOpen POS support multiple payment methods?', a: 'Yes. DineOpen POS supports cash, credit/debit cards, and UPI payments. Select the payment method at checkout, and the system records it automatically for your accounting records.' },
    { q: 'Can I manage multiple restaurant locations?', a: 'Yes. DineOpen POS includes built-in multi-location support. Switch between locations from the POS interface, manage separate menus and staff for each, and view consolidated reports.' },
    { q: 'How do real-time updates work?', a: 'DineOpen uses Pusher for real-time websocket connections. When an order is placed, the kitchen sees it instantly. When the kitchen marks an order ready, the waiter gets notified immediately. No page refreshing needed.' },
    { q: 'Is there a demo mode?', a: 'Yes. DineOpen POS includes a built-in demo mode with sample menu items. Explore the full interface, create test orders, and experience the workflow before setting up your own restaurant.' },
    { q: 'How does DineOpen compare to Square or Toast?', a: 'DineOpen offers zero transaction fees (Square charges 2.6%+10c, Toast 2.49%+15c per transaction), no hardware lock-in, and plans starting at just $20/mo versus Toast at $69/mo. Multi-location support is included on all plans.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fef2f2 100%)', padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#dc2626', padding: '8px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
              Zero Transaction Fees
            </div>
            <h1 style={{ fontSize: isMobile ? '36px' : '56px', fontWeight: '900', lineHeight: 1.1, color: '#111827', marginBottom: '24px', letterSpacing: '-2px' }}>
              The Smartest Restaurant<br />POS System
            </h1>
            <p style={{ fontSize: isMobile ? '18px' : '22px', color: '#374151', lineHeight: 1.7, maxWidth: '750px', margin: '0 auto 40px' }}>
              Take orders, process payments, and manage your restaurant from any device. Built for dine-in, takeout, delivery, and room service with real-time kitchen sync and multi-location support.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=pos" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial <FaArrowRight />
              </Link>
              <Link href="#comparison" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none', display: 'inline-block' }}>
                Compare Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ backgroundColor: 'white', padding: '48px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
            {[
              { metric: '0%', label: 'Transaction fees' },
              { metric: '4', label: 'Order types supported' },
              { metric: '<2s', label: 'Order to kitchen' },
              { metric: '99.9%', label: 'Uptime guarantee' },
            ].map((stat, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '42px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>{stat.metric}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Everything You Need at the Counter
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              DineOpen POS is built from a 6,770-line production dashboard. Every feature listed below exists and works today.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {features.map((f, i) => (
                <div key={i} style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '32px' }}>
              {steps.map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Built for Every Food Business
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {audiences.map((a, i) => (
                <div key={i} style={{ background: 'white', padding: '28px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{a.name}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section id="comparison" style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              DineOpen vs. Other POS Systems
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              See how DineOpen stacks up against popular alternatives
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    {['POS System', 'Price', 'Tx Fees', 'Cloud', 'Multi-Location', 'Hardware'].map((h, i) => (
                      <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '700', color: '#111827' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: c.highlight ? '#fef2f2' : 'transparent' }}>
                      <td style={{ padding: '14px 16px', fontWeight: c.highlight ? '700' : '500', color: c.highlight ? '#dc2626' : '#111827' }}>{c.name}</td>
                      <td style={{ padding: '14px 16px', color: '#374151' }}>{c.price}</td>
                      <td style={{ padding: '14px 16px', color: c.highlight ? '#16a34a' : '#374151', fontWeight: c.highlight ? '700' : '400' }}>{c.txFee}</td>
                      <td style={{ padding: '14px 16px', color: '#374151' }}>{c.cloud}</td>
                      <td style={{ padding: '14px 16px', color: '#374151' }}>{c.multiLoc}</td>
                      <td style={{ padding: '14px 16px', color: '#374151' }}>{c.hardware}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Simple, Transparent Pricing
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '32px' }}>
              {[
                { plan: 'Starter', price: '$20', inr: '₹299', period: '/mo', desc: 'Everything a single-location restaurant needs to get started.', items: ['Full POS with all order types', 'Multi-payment support', 'Receipt printing', 'Tax calculations', 'Demo mode'] },
                { plan: 'Pro', price: '$99', inr: '₹1,799', period: '/mo', desc: 'For growing restaurants and multi-location businesses.', items: ['Everything in Starter', 'Multi-location management', 'Real-time Pusher updates', 'Saved orders queue', 'Priority support'], highlight: true },
              ].map((p, i) => (
                <div key={i} style={{ background: 'white', padding: '40px 32px', borderRadius: '16px', border: p.highlight ? '2px solid #ef4444' : '1px solid #e5e7eb', position: 'relative' }}>
                  {p.highlight && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '4px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '700' }}>Most Popular</div>}
                  <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{p.plan}</h3>
                  <div style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '42px', fontWeight: '800', color: '#111827' }}>{p.price}</span>
                    <span style={{ fontSize: '16px', color: '#6b7280' }}>{p.period}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{p.inr}/mo in India</p>
                  <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600', marginBottom: '20px' }}>Zero transaction fees</p>
                  <p style={{ fontSize: '15px', color: '#374151', marginBottom: '24px', lineHeight: 1.6 }}>{p.desc}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                    {p.items.map((item, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '15px', color: '#374151' }}>
                        <FaCheckCircle style={{ color: '#16a34a', flexShrink: 0 }} /> {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/login?ref=pos" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '10px', fontWeight: '700', fontSize: '15px', textDecoration: 'none', background: p.highlight ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'white', color: p.highlight ? 'white' : '#111827', border: p.highlight ? 'none' : '1px solid #e5e7eb' }}>
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '17px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                  {openFaq === i ? <FaChevronUp style={{ color: '#6b7280', flexShrink: 0 }} /> : <FaChevronDown style={{ color: '#6b7280', flexShrink: 0 }} />}
                </button>
                {openFaq === i && (
                  <p style={{ padding: '0 0 20px', fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              Explore POS Solutions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { title: 'Cloud POS', desc: 'No hardware, works everywhere', href: '/products/pos/cloud-pos' },
                { title: 'Takeaway POS', desc: 'Built for takeout operations', href: '/products/pos/takeaway' },
                { title: 'Dine-In POS', desc: 'Table management & ordering', href: '/products/pos/dine-in' },
                { title: 'Small Restaurants', desc: 'Affordable, essential features', href: '/products/pos/small-restaurants' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ display: 'block', padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none', transition: 'box-shadow 0.2s' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{link.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{link.desc}</p>
                  <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: '600', marginTop: '8px', display: 'inline-block' }}>Learn more →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '40px', fontWeight: '800', marginBottom: '16px' }}>
              Ready to Upgrade Your Restaurant?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Start with a free trial. No credit card required. Set up your menu and start taking orders in minutes.
            </p>
            <Link href="/login?ref=pos" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
