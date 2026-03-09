'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';

export default function KotClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: '📋', title: 'Digital KOT Management', description: 'Every order generates a digital KOT with table number, items, quantities, modifiers, and special instructions. No more illegible handwriting or lost paper tickets.' },
    { icon: '🖨️', title: 'KOT Printing', description: 'Print KOT tickets to thermal printers at any station. Support for multiple printer zones - send appetizers to one printer, drinks to bar, mains to hot kitchen.' },
    { icon: '📝', title: 'Special Instructions', description: 'Dietary needs, allergies, and custom requests appear highlighted on each KOT. Kitchen staff see them at a glance so nothing gets missed.' },
    { icon: '🔄', title: 'Status Workflow', description: 'Track each KOT through its lifecycle: pending, in-progress, ready, completed. One-tap transitions keep the kitchen flowing without confusion.' },
    { icon: '🗑️', title: 'Cancellation with Reason', description: 'Cancel any KOT with a mandatory reason. Management can review cancellation data to identify patterns and reduce food waste.' },
    { icon: '👁️', title: 'Individual KOT Viewing', description: 'Tap any KOT to see full order details - item list, quantities, modifiers, notes, table number, waiter name, and timestamps.' },
  ];

  const kotWorkflow = [
    { step: '1', title: 'Order Entered', desc: 'Waiter enters order via POS, app, or QR scan. KOT is created automatically with all item details.' },
    { step: '2', title: 'KOT Received', desc: 'Kitchen screen shows new KOT with sound alert. KOT displays table, items, modifiers, and special instructions.' },
    { step: '3', title: 'Cooking Started', desc: 'Kitchen staff taps to start. Timer begins tracking preparation time for the order.' },
    { step: '4', title: 'Items Ready', desc: 'Staff marks KOT as ready. Front of house is notified to pick up and serve the order.' },
    { step: '5', title: 'KOT Completed', desc: 'Order served and KOT moves to completed. Available in history for review and reporting.' },
  ];

  const faqs = [
    { q: 'What is a KOT (Kitchen Order Ticket)?', a: 'A KOT is a document sent from the front of house to the kitchen detailing what items need to be prepared. It includes the table number, ordered items with quantities, special instructions, and order time. DineOpen digitizes this entire process so KOTs appear instantly on kitchen screens without paper.' },
    { q: 'Can I print KOT tickets from DineOpen?', a: 'Yes. DineOpen supports printing individual KOT tickets to thermal printers. You can set up multiple printer zones so appetizer KOTs go to the cold station, drink orders go to the bar, and main courses go to the hot kitchen. Paper and digital work side by side.' },
    { q: 'How are special instructions handled on KOTs?', a: 'Special instructions entered by waiters appear highlighted on the KOT so kitchen staff can immediately spot dietary requirements, allergies, or customization requests. Instructions are shown per-item, not just per-order, so complex orders stay clear.' },
    { q: 'Can I cancel a KOT after it has been sent to the kitchen?', a: 'Yes. Authorized staff can cancel a KOT, but a reason must be provided (e.g., customer changed mind, item unavailable). This ensures accountability and gives management data to track and reduce cancellation rates over time.' },
    { q: 'Does the KOT system handle different order types?', a: 'Yes. KOTs are generated for dine-in, takeout, delivery, and room service orders. Each KOT clearly shows the order type so kitchen staff can prioritize preparation and use appropriate packaging for takeout and delivery orders.' },
    { q: 'How does KOT printing work with multiple kitchen stations?', a: 'You can configure printer routing so specific menu categories go to specific stations. For example, beverages print at the bar, desserts at the pastry station, and mains at the grill. Each station only sees what they need to prepare.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen Kitchen / KOT
            </div>
            <h1 style={{ fontSize: isMobile ? '34px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Kitchen Order Ticket System<br />Go Paperless, Stay Organized
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Digital KOTs with printing support, status tracking, special instructions handling, and cancellation management. Every order detail, right where your kitchen needs it.
            </p>
            <Link href="/login?ref=kitchen" style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Complete KOT Management
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

        {/* KOT Workflow */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              KOT Lifecycle
            </h2>
            {kotWorkflow.map((item, idx) => (
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

        {/* KOT Sample */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              What a Digital KOT Looks Like
            </h2>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '2px solid #e5e7eb', fontFamily: 'monospace' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px dashed #d1d5db', paddingBottom: '12px', marginBottom: '12px' }}>
                <p style={{ fontWeight: '700', fontSize: '16px', color: '#111827' }}>KOT #1247</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Table 5 | Dine-in | 7:32 PM</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Waiter: Rahul</p>
              </div>
              <div style={{ borderBottom: '1px dashed #d1d5db', paddingBottom: '12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>2x Butter Chicken</p>
                <p style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>3x Garlic Naan</p>
                <p style={{ fontSize: '14px', color: '#111827', marginBottom: '4px' }}>1x Dal Makhani</p>
                <p style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600', marginTop: '8px' }}>** Less spicy, no onion garnish **</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#6b7280' }}>Status: In Progress</span>
                <span style={{ color: '#ef4444', fontWeight: '600' }}>Timer: 08:24</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>Pricing</h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>KOT system included in all plans. Zero transaction fees.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Spark</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$9.99<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹300/mo in India</p>
                <Link href="/login?ref=kitchen" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Blaze</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$89<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹2,500/mo in India</p>
                <Link href="/login?ref=kitchen" style={{ display: 'block', padding: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px' }}>
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
              Ditch Paper KOTs Today
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>
              Start using digital kitchen order tickets in minutes. No hardware required.
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
