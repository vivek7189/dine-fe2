'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';

export default function OnlineClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: '🌐', title: 'Your Branded Ordering Page', description: 'A clean, fast-loading ordering page with your restaurant name, logo, and complete menu. Customers order directly from you - no third-party branding.' },
    { icon: '💰', title: 'Zero Commissions', description: 'Unlike Zomato, Swiggy, or UberEats that take 15-30% per order, DineOpen charges zero commissions. Pay only your flat monthly subscription and keep all revenue.' },
    { icon: '📱', title: 'Mobile-First Design', description: 'Over 80% of online food orders come from phones. Your ordering page is optimized for mobile with fast loading, easy navigation, and quick checkout.' },
    { icon: '🔔', title: 'Instant Order Notifications', description: 'New online orders trigger sound alerts on your dashboard. Orders appear in real-time on POS, kitchen display, and waiter apps simultaneously.' },
    { icon: '📄', title: 'Automatic Invoices', description: 'Every order generates a professional invoice with itemized details, taxes, and discounts. Download PDF, print, or share with customers via WhatsApp.' },
    { icon: '🔗', title: 'Share Your Link Anywhere', description: 'Share your ordering URL on social media, Google Maps, WhatsApp status, Instagram bio, or print it on flyers. Every order through this link is commission-free.' },
  ];

  const comparisonData = [
    { feature: 'Commission per order', dineopen: '0%', aggregator: '15-30%' },
    { feature: 'Customer data ownership', dineopen: 'You own it', aggregator: 'Platform owns it' },
    { feature: 'Your branding', dineopen: 'Full branding', aggregator: 'Platform branding' },
    { feature: 'Monthly cost', dineopen: 'From $9.99', aggregator: 'Free + commission' },
    { feature: 'Menu control', dineopen: 'Full control', aggregator: 'Limited' },
    { feature: 'On 100 orders/day', dineopen: '$9.99/mo total', aggregator: '$450-900/mo in fees' },
  ];

  const faqs = [
    { q: 'How is DineOpen different from Zomato or Swiggy?', a: 'DineOpen gives you your own branded ordering page with zero commissions. Zomato and Swiggy take 15-30% of every order and own the customer relationship. With DineOpen, you pay a flat $9.99/mo (₹300 in India) and keep 100% of order revenue. You also own all customer data.' },
    { q: 'Do customers need to download an app?', a: 'No. Your ordering page works in any web browser on phone, tablet, or desktop. Customers visit your URL, browse the menu, and place their order. No app download, no account creation required. This removes friction and increases order completion rates.' },
    { q: 'Can I customize my ordering page?', a: 'Yes. Your page features your restaurant name, logo, and full menu with categories, images, modifiers, and descriptions. The layout is clean and optimized for mobile devices where most orders originate.' },
    { q: 'How do I receive online orders?', a: 'Online orders appear instantly on your DineOpen dashboard with sound notifications. They also generate KOTs that show on your kitchen display. You can manage orders from any device - POS terminal, tablet, or phone.' },
    { q: 'Can I accept online payments?', a: 'Yes. DineOpen integrates with popular payment gateways for UPI, credit/debit cards, and digital wallets. You can also offer cash on delivery for takeout and delivery orders. Payment flexibility increases order conversion.' },
    { q: 'How much can I save vs food delivery platforms?', a: 'If you process 100 orders per day averaging $15 each, a 20% platform commission costs you $9,000/month. With DineOpen at $9.99/mo, you save $8,990/month. The savings are even more dramatic for higher-volume restaurants.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen Orders / Online
            </div>
            <h1 style={{ fontSize: isMobile ? '34px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Your Own Online Ordering<br />Zero Commissions
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Stop paying 15-30% to aggregator platforms. Launch your branded ordering page and keep 100% of revenue. Flat monthly fee, zero transaction fees.
            </p>
            <Link href="/login?ref=orders" style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Savings Calculator */}
        <section style={{ backgroundColor: 'white', padding: '48px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>How Much Are You Losing to Commissions?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: '#fef2f2', borderRadius: '12px', padding: '24px' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>50 orders/day on aggregator (20% fee)</p>
                <p style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444' }}>-$4,500/mo</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Lost to commissions</p>
              </div>
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '24px' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Same orders on DineOpen</p>
                <p style={{ fontSize: '28px', fontWeight: '800', color: '#16a34a' }}>$9.99/mo</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Flat fee, keep everything</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Everything You Need for Online Orders
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

        {/* Comparison Table */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              DineOpen vs Food Aggregators
            </h2>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 20px', backgroundColor: '#111827', color: 'white', fontWeight: '700', fontSize: '14px' }}>
                <span>Feature</span>
                <span style={{ textAlign: 'center' }}>DineOpen</span>
                <span style={{ textAlign: 'center' }}>Aggregators</span>
              </div>
              {comparisonData.map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '14px 20px', borderBottom: idx < comparisonData.length - 1 ? '1px solid #e5e7eb' : 'none', fontSize: '14px', backgroundColor: 'white' }}>
                  <span style={{ color: '#374151' }}>{row.feature}</span>
                  <span style={{ textAlign: 'center', color: '#16a34a', fontWeight: '600' }}>{row.dineopen}</span>
                  <span style={{ textAlign: 'center', color: '#ef4444', fontWeight: '600' }}>{row.aggregator}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '40px' }}>Pricing</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Spark</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$9.99<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹300/mo in India</p>
                <Link href="/login?ref=orders" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Blaze</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$89<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹2,500/mo in India</p>
                <Link href="/login?ref=orders" style={{ display: 'block', padding: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Stop Paying Commissions</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>Launch your own online ordering in minutes. Keep 100% of revenue.</p>
            <Link href="/login?ref=orders" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
