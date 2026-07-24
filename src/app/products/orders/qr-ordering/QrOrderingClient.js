'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';

export default function QrOrderingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: '📱', title: 'Scan & Browse', description: 'Customers scan the QR code with their phone camera. Your full menu opens instantly in their browser - categories, images, descriptions, prices, and modifiers. No app download needed.' },
    { icon: '🍽️', title: 'Customize Orders', description: 'Customers add modifiers (extra cheese, no onion), select variants (size, spice level), and enter special instructions. Just like ordering with a waiter, but self-service.' },
    { icon: '⚡', title: 'Instant Kitchen Delivery', description: 'Submitted orders go straight to your kitchen display as a KOT. No waiter middleman, no delays. Kitchen starts preparing immediately.' },
    { icon: '🔢', title: 'Table-Specific QR Codes', description: 'Each table gets a unique QR code. Orders are automatically tagged with the table number so kitchen and servers know exactly where food goes.' },
    { icon: '➕', title: 'Add More Items Anytime', description: 'Customers can scan the QR again to add more items. Each new order creates a separate KOT while all items stay grouped under the same table for billing.' },
    { icon: '👨‍👩‍👧‍👦', title: 'Reduce Staff Workload', description: 'Customers handle their own ordering. Waiters focus on serving food, answering questions, and providing great hospitality instead of writing orders.' },
  ];

  const workflow = [
    { step: '1', title: 'Customer Scans QR', desc: 'Phone camera opens your digital menu in the browser' },
    { step: '2', title: 'Browses Menu', desc: 'Swipes through categories, views items with images' },
    { step: '3', title: 'Customizes & Orders', desc: 'Adds modifiers, special instructions, submits order' },
    { step: '4', title: 'Kitchen Gets KOT', desc: 'Order appears on kitchen display with table number' },
    { step: '5', title: 'Food Served', desc: 'Staff delivers to the correct table' },
  ];

  const benefits = [
    { metric: '30-40%', label: 'Less front-of-house staff needed' },
    { metric: '0', label: 'App downloads required' },
    { metric: '95%', label: 'Order accuracy rate' },
    { metric: '20%', label: 'Higher average order value' },
  ];

  const faqs = [
    { q: 'How does QR code ordering work?', a: 'Place a unique QR code on each table. Customers scan with their phone camera, which opens your digital menu in their browser. They browse items, add modifiers and special instructions, and submit the order. It goes straight to your kitchen display as a KOT - no app download, no waiter needed for order taking.' },
    { q: 'Do customers need to download an app?', a: 'No. The QR code opens a web page directly in the customer\'s phone browser. They can browse the full menu, customize items, and place orders without downloading anything. This works on any smartphone - iPhone or Android - and removes the friction that kills app-based ordering adoption.' },
    { q: 'Can I have different QR codes for different tables?', a: 'Yes. Each table gets a unique QR code that identifies the table number. When customers scan and order, the kitchen automatically knows which table the order belongs to. You can generate and print all QR codes from your DineOpen dashboard.' },
    { q: 'Does QR ordering reduce staffing needs?', a: 'It significantly reduces order-taking workload. Customers place orders themselves, so waiters focus on food delivery, answering questions, and providing hospitality. Many restaurants report needing 30-40% fewer front-of-house staff during service with QR ordering enabled.' },
    { q: 'Can customers add more items after initial order?', a: 'Yes. Customers can scan the QR code again anytime to add more items to their table. Each new order creates a separate KOT for the kitchen while keeping all items grouped under the same table for final billing. No limit on re-orders.' },
    { q: 'What about customers who prefer ordering with a waiter?', a: 'QR ordering is complementary, not a replacement. Customers who prefer the traditional waiter experience can still order that way. The waiter uses the DineOpen app or POS as usual. QR ordering simply adds a self-service option that many diners, especially younger ones, prefer.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen Orders / QR Ordering
            </div>
            <h1 style={{ fontSize: isMobile ? '34px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              QR Code Ordering<br />Scan. Browse. Order. Done.
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Customers scan a QR code at their table, browse your full menu, customize their order, and submit - straight to your kitchen. No app download, no waiting for a waiter.
            </p>
            <Link href="/login?ref=orders" style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section style={{ backgroundColor: 'white', padding: '48px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '32px', textAlign: 'center' }}>
            {benefits.map((stat, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>{stat.metric}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How QR Ordering Works
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

        {/* Features */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              QR Ordering Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {features.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '28px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QR Setup Guide */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Set Up QR Ordering in 3 Steps
            </h2>
            {[
              { step: '1', title: 'Add Your Menu', desc: 'Enter menu items with categories, prices, images, and modifiers in your DineOpen dashboard.' },
              { step: '2', title: 'Generate QR Codes', desc: 'DineOpen generates a unique QR code for each table. Download and print them as table tents or stickers.' },
              { step: '3', title: 'Customers Start Ordering', desc: 'Place QR codes on tables. Customers scan and order. Orders flow to your kitchen display automatically.' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px', marginBottom: '32px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '800', flexShrink: 0 }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '40px' }}>Pricing</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Starter</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$20<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹299/mo in India</p>
                <Link href="/login?ref=orders" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Pro</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$99<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹1,799/mo in India</p>
                <Link href="/login?ref=orders" style={{ display: 'block', padding: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Let Customers Order Themselves</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>Set up QR ordering in minutes. Print codes, place on tables, done.</p>
            <Link href="/login?ref=orders" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
