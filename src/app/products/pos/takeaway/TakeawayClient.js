'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaTruck, FaBox, FaClock, FaSearch, FaReceipt, FaCheckCircle, FaArrowRight, FaChevronDown, FaChevronUp, FaShoppingBag, FaBolt } from 'react-icons/fa';

export default function TakeawayClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: <FaShoppingBag size={28} />, title: 'Takeout Order Flow', description: 'Dedicated takeout mode in the POS. Select "Takeaway" as order type, build the order from the menu, and check out in seconds. No table selection needed - straight to cart and payment.' },
    { icon: <FaTruck size={28} />, title: 'Delivery Management', description: 'Switch to delivery mode to capture delivery addresses and special instructions. Track orders from kitchen preparation through to dispatch. Manage your delivery queue alongside takeout orders.' },
    { icon: <FaSearch size={28} />, title: 'Quick Item Search', description: 'Find menu items instantly with name search or short code lookup. When you have 20 customers waiting for pickup, speed matters. Category filters and quick search keep things fast.' },
    { icon: <FaClock size={28} />, title: 'Saved Orders Queue', description: 'Phone-ahead orders are common in takeaway. Save an order when the customer calls, then recall it from the queue when they arrive. Process payment and print receipt in one step.' },
    { icon: <FaReceipt size={28} />, title: 'Instant Receipts', description: 'Print receipts the moment payment is processed. Receipts include order details, payment method, and tax breakdown. Customers get their paperwork and their food at the same time.' },
    { icon: <FaBolt size={28} />, title: 'Real-Time Kitchen Sync', description: 'Takeaway orders appear on the kitchen display instantly via Pusher. Kitchen staff can prioritize preparation based on pickup time. No more shouting across the counter.' },
  ];

  const workflow = [
    { num: '1', title: 'Select Takeaway', desc: 'Choose "Takeaway" or "Delivery" as the order type in the POS.' },
    { num: '2', title: 'Build Order', desc: 'Browse menu by category, search by name or short code, add items to cart.' },
    { num: '3', title: 'Process Payment', desc: 'Accept cash, card, or UPI. Taxes calculated automatically.' },
    { num: '4', title: 'Print & Dispatch', desc: 'Print receipt and KOT. Kitchen prepares, customer picks up or rider delivers.' },
  ];

  const useCases = [
    { title: 'Quick-Service Restaurants', desc: 'High-volume takeout with fast checkout. Short code search and quick menu access reduce queue time for counter-service restaurants.' },
    { title: 'Cloud Kitchens', desc: 'Delivery-first operations managing multiple brands. Separate menus per brand, unified order queue, and delivery tracking from one POS.' },
    { title: 'Pizza & Burger Joints', desc: 'Phone orders, walk-in pickups, and delivery all flowing through one system. Save phone orders and process them when the customer arrives.' },
    { title: 'Bakeries & Sweet Shops', desc: 'Counter service with pre-packaged items. Fast item search, quantity management, and receipt printing for high-volume retail takeaway.' },
  ];

  const faqs = [
    { q: 'What is a takeaway POS system?', a: 'A takeaway POS system is designed for restaurants that handle takeout and delivery orders. It includes order queuing, fast checkout, delivery management, and kitchen sync - all optimized for high-volume takeaway operations.' },
    { q: 'Can I manage both takeaway and dine-in orders?', a: 'Yes. DineOpen POS supports takeaway, dine-in, delivery, and room service order types in one system. Switch between order types from the same interface and manage them in a single queue.' },
    { q: 'Does DineOpen support delivery order management?', a: 'Yes. DineOpen includes a dedicated delivery order flow where you can capture delivery addresses, add special instructions, and track order status from preparation to delivery.' },
    { q: 'How does the saved orders queue work?', a: 'The saved orders queue lets you park in-progress orders and recall them later. When a customer calls ahead, save their order and process payment when they arrive for pickup.' },
    { q: 'Can customers pay with UPI for takeaway?', a: 'Yes. DineOpen supports cash, card, and UPI payments for all order types including takeaway. The payment method is recorded with each order for accounting.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fef2f2 100%)', padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#dc2626', padding: '8px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
              Takeout + Delivery
            </div>
            <h1 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '900', lineHeight: 1.1, color: '#111827', marginBottom: '24px', letterSpacing: '-2px' }}>
              Takeaway POS System<br />Built for Speed
            </h1>
            <p style={{ fontSize: isMobile ? '18px' : '20px', color: '#374151', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 40px' }}>
              Take orders faster, manage deliveries, and keep your kitchen in sync. DineOpen POS handles takeout and delivery with dedicated workflows, saved order queues, and instant kitchen notifications.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=pos" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial <FaArrowRight />
              </Link>
              <Link href="/products/pos" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                See All POS Features
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How Takeaway Ordering Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '32px' }}>
              {workflow.map((s, i) => (
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

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Takeaway-Specific Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
              Every feature is built into DineOpen POS and works today. No add-ons, no extra charges.
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

        {/* Use Cases */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Who Uses Takeaway POS
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {useCases.map((u, i) => (
                <div key={i} style={{ padding: '28px', background: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{u.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{u.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: '17px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                  {openFaq === i ? <FaChevronUp style={{ color: '#6b7280', flexShrink: 0 }} /> : <FaChevronDown style={{ color: '#6b7280', flexShrink: 0 }} />}
                </button>
                {openFaq === i && <p style={{ padding: '0 0 20px', fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '40px 20px' : '60px 40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '24px' }}>Related POS Solutions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { title: 'Cloud POS', href: '/products/pos/cloud-pos' },
                { title: 'Dine-In POS', href: '/products/pos/dine-in' },
                { title: 'POS for Small Restaurants', href: '/products/pos/small-restaurants' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ display: 'block', padding: '20px', background: '#f9fafb', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{link.title}</span>
                  <span style={{ display: 'block', fontSize: '14px', color: '#ef4444', marginTop: '4px' }}>Learn more →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '40px', fontWeight: '800', marginBottom: '16px' }}>
              Speed Up Your Takeaway Operations
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Start your free trial today. Take your first takeaway order in under 5 minutes.
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
