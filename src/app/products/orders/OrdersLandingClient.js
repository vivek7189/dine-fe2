'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function OrdersLandingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: '🌐', title: 'Online Ordering', description: 'Your own branded online ordering page. Customers order directly from your website - no third-party commissions, no middlemen. You own the customer relationship.' },
    { icon: '📱', title: 'QR Code Ordering', description: 'Customers scan a QR code at their table to browse your menu and order. No app download required. Orders go straight to kitchen. Reduces wait time and staff workload.' },
    { icon: '💬', title: 'WhatsApp Ordering', description: 'Accept orders via WhatsApp. Customers browse your menu and place orders through the app they already use. All orders flow into one unified dashboard.' },
    { icon: '🔍', title: 'Order History & Search', description: 'Search orders by ID, customer name, or table number. Full order history with filters for status and type. Review any past order in seconds.' },
    { icon: '📄', title: 'Invoice Generation', description: 'Generate professional invoices for every order. Download as PDF, print directly, or share with customers via WhatsApp or email. Includes taxes and discounts.' },
    { icon: '🔄', title: 'Real-Time Updates', description: 'Orders sync in real-time via Pusher. New orders appear instantly on all devices. Status changes reflect immediately across POS, kitchen display, and waiter apps.' },
    { icon: '📊', title: 'Order Type Filtering', description: 'Filter orders by type: dine-in, takeout, delivery, or room service. Each type has distinct workflows so your team handles them appropriately.' },
    { icon: '🖨️', title: 'Order Printing', description: 'Print order receipts, KOTs, and invoices to thermal or regular printers. Support for multiple print stations and configurable print templates.' },
  ];

  const orderTypes = [
    { type: 'Dine-in', desc: 'Table-based orders from waiters, POS, or customer QR scan. Track by table number with full status lifecycle.', color: '#ef4444' },
    { type: 'Takeout', desc: 'Customers order for pickup. Clear pickup time estimates and ready notifications keep customers informed.', color: '#f59e0b' },
    { type: 'Delivery', desc: 'Delivery orders with address management, driver assignment, and delivery status tracking.', color: '#3b82f6' },
    { type: 'Room Service', desc: 'Perfect for hotels. Orders tagged by room number with delivery tracking and room billing integration.', color: '#8b5cf6' },
  ];

  const workflow = [
    { step: '1', title: 'Customer Orders', desc: 'Via QR scan, website, WhatsApp, or waiter' },
    { step: '2', title: 'Order Received', desc: 'Appears on dashboard with sound notification' },
    { step: '3', title: 'Kitchen Prepares', desc: 'KOT sent to kitchen display automatically' },
    { step: '4', title: 'Order Ready', desc: 'Staff marks ready, customer is notified' },
    { step: '5', title: 'Completed', desc: 'Order served, invoice generated' },
  ];

  const faqs = [
    { q: 'How does QR code ordering work?', a: 'You place a unique QR code at each table. Customers scan it with their phone camera, which opens your digital menu in their browser. They browse items, add modifiers, enter special instructions, and submit the order. It goes straight to your kitchen display or POS. No app download needed by the customer.' },
    { q: 'Does DineOpen charge transaction fees?', a: 'No. DineOpen charges zero transaction fees on all orders, regardless of type. You pay only your monthly subscription ($20/mo Starter or $99/mo Pro). Unlike food delivery platforms that take 15-30% commission, every rupee of revenue stays with you.' },
    { q: 'Can customers order via WhatsApp?', a: 'Yes. DineOpen supports WhatsApp-based ordering where customers can browse your menu and place orders through WhatsApp. These orders flow into the same unified order management dashboard alongside dine-in, QR, and online orders.' },
    { q: 'How do I search past orders?', a: 'DineOpen Orders provides search by order ID, customer name, or table number. You can filter by status (pending, completed, cancelled) and by order type (dine-in, takeout, delivery, room service). Toggle between compact and expanded view to scan orders quickly.' },
    { q: 'Can I generate invoices for orders?', a: 'Yes. DineOpen automatically generates professional invoices for every order, including itemized details, taxes, discounts, and payment information. You can download as PDF, print directly, or share with customers via WhatsApp or email.' },
    { q: 'What order statuses are available?', a: 'Orders flow through: pending (just received), in-progress (being prepared), ready (waiting for pickup/serve), and completed. You can also cancel orders. Each status change syncs in real-time across all connected devices.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen Orders
            </div>
            <h1 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              One System for Every Order Channel
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Online ordering, QR code menus, WhatsApp orders, dine-in, takeout, delivery - all flowing into one dashboard with real-time tracking and zero transaction fees.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=orders" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
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
              { metric: '0%', label: 'Transaction fees' },
              { metric: '4', label: 'Order channels' },
              { metric: '<1s', label: 'Real-time sync' },
              { metric: '$20', label: 'Starting price' },
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Complete Order Management
            </h2>
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

        {/* Order Types */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Every Order Type, One Dashboard
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {orderTypes.map((ot, idx) => (
                <div key={idx} style={{ borderRadius: '12px', padding: '28px', border: '1px solid #e5e7eb', borderLeft: `4px solid ${ot.color}` }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{ot.type}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{ot.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: '80px 20px' }}>
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

        {/* Sub-product Links */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Explore Order Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              <Link href="/products/orders/online" style={{ textDecoration: 'none', backgroundColor: '#fef2f2', borderRadius: '12px', padding: '28px', border: '1px solid #fecaca', display: 'block' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Online Ordering</h3>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>Your branded ordering website with zero commissions.</p>
                <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>Learn more →</span>
              </Link>
              <Link href="/products/orders/qr-ordering" style={{ textDecoration: 'none', backgroundColor: '#fef2f2', borderRadius: '12px', padding: '28px', border: '1px solid #fecaca', display: 'block' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>QR Code Ordering</h3>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>Scan-to-order at the table. No app needed.</p>
                <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>Learn more →</span>
              </Link>
              <Link href="/products/orders/delivery" style={{ textDecoration: 'none', backgroundColor: '#fef2f2', borderRadius: '12px', padding: '28px', border: '1px solid #fecaca', display: 'block' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Delivery Management</h3>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>Manage delivery orders, addresses, and tracking.</p>
                <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>Learn more →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Simple, Transparent Pricing</h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>Zero transaction fees. Every order channel included.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Starter</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>For small restaurants</p>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$20<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹299/mo in India</p>
                <Link href="/login?ref=orders" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Pro</h3>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>For multi-location restaurants</p>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$99<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹1,799/mo in India</p>
                <Link href="/login?ref=orders" style={{ display: 'block', padding: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
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
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
                  <span style={{ fontSize: '17px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                  <span style={{ fontSize: '24px', color: '#6b7280', transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openFaq === idx && <p style={{ marginTop: '12px', fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
              Start Accepting Orders Everywhere
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>
              Online, QR, WhatsApp, dine-in, delivery - one system, zero commissions. Try free today.
            </p>
            <Link href="/login?ref=orders" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
