'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaStore, FaMobileAlt, FaRupeeSign, FaCheckCircle, FaArrowRight, FaChevronDown, FaChevronUp, FaShoppingCart, FaCreditCard, FaReceipt, FaClock, FaSearch, FaBolt } from 'react-icons/fa';

export default function SmallRestaurantsClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const whySmall = [
    { icon: <FaRupeeSign size={28} />, title: 'Starts at $20/mo', description: 'The Starter plan gives you a complete POS for just $20/mo ($99/mo for Pro). In India, that is ₹299/mo and ₹1,799/mo respectively. Zero transaction fees means you keep every rupee.' },
    { icon: <FaMobileAlt size={28} />, title: 'No Hardware Needed', description: 'Use your existing phone or tablet. No need to buy expensive POS terminals, printers, or tablets. Open a browser, log in, and start taking orders. That is it.' },
    { icon: <FaClock size={28} />, title: 'Set Up in 30 Minutes', description: 'Sign up, add your menu items, set your tables, and start taking orders. No IT person needed. No installation. No configuration headaches. Demo mode lets you explore first.' },
    { icon: <FaShoppingCart size={28} />, title: 'All Order Types Included', description: 'Dine-in with table selection, takeaway, delivery, and room service - all included in the base plan. You do not pay extra for different order types.' },
    { icon: <FaCreditCard size={28} />, title: 'Cash, Card, and UPI', description: 'Accept all common payment methods from day one. Payment processing is included, and there are zero transaction fees on any plan.' },
    { icon: <FaReceipt size={28} />, title: 'Tax & Receipt Handling', description: 'Automatic tax calculations and receipt printing. Stay compliant without manual calculations. Print receipts with any standard Bluetooth or USB printer.' },
  ];

  const perfectFor = [
    { title: 'Small Restaurants (1-20 tables)', desc: 'Full dine-in POS with table selection, order management, and kitchen sync. Everything a small sit-down restaurant needs without the enterprise price tag.' },
    { title: 'Neighbourhood Cafes', desc: 'Quick counter service with fast checkout. Category browsing and quick search make building orders fast during the morning rush.' },
    { title: 'Food Trucks', desc: 'Runs on your phone. Takeaway order flow, fast payment processing, and receipt printing. No counter space wasted on bulky hardware.' },
    { title: 'Home Bakeries & Cloud Kitchens', desc: 'Start taking orders professionally from day one. Menu management, order tracking, and payment recording - all from your phone for under $10/mo.' },
    { title: 'New Restaurant Openings', desc: 'Get operational immediately without a large upfront investment. Start with Starter and upgrade to Pro as your business grows. All data migrates seamlessly.' },
    { title: 'Seasonal & Pop-Up Restaurants', desc: 'No contracts, no hardware purchases. Pay monthly, use on any device, and cancel if you need to. Perfect for seasonal or event-based operations.' },
  ];

  const comparisonPoints = [
    { label: 'Monthly cost', dineopen: 'From $20/mo', others: '$50-200/mo typical' },
    { label: 'Transaction fees', dineopen: '0%', others: '1.5-3% per transaction' },
    { label: 'Hardware required', dineopen: 'None (use any device)', others: 'Proprietary terminal required' },
    { label: 'Setup time', dineopen: 'Under 30 minutes', others: '1-7 days' },
    { label: 'Contract', dineopen: 'Month-to-month', others: '1-2 year lock-in common' },
    { label: 'Order types', dineopen: 'All 4 included', others: 'Often add-on pricing' },
  ];

  const faqs = [
    { q: 'How much does DineOpen POS cost for small restaurants?', a: 'The Starter plan is $20/mo (₹299/mo in India). It includes full POS with all order types, multi-payment support, receipt printing, and tax calculations. Zero transaction fees on all plans.' },
    { q: 'Do I need to buy special hardware?', a: 'No. DineOpen runs in any web browser on your existing phone, tablet, or laptop. No proprietary terminals needed. For receipts, any standard Bluetooth or USB printer works.' },
    { q: 'How long does setup take?', a: 'Most small restaurants are running in under 30 minutes. Sign up, add menu items, configure tables, and start taking orders. Demo mode is available to explore first.' },
    { q: 'Is it too complex for a small restaurant?', a: 'No. The interface is intuitive and the core workflow - browse menu, take order, process payment - requires minimal training. Advanced features are available but not forced on you.' },
    { q: 'Can I upgrade later as my restaurant grows?', a: 'Yes. Start with Starter at $20/mo and upgrade to Pro at $99/mo when you need multi-location support and real-time updates. All your data carries over automatically.' },
    { q: 'Does it work for food trucks?', a: 'Yes. DineOpen runs on your phone with the takeaway order flow. Take orders, process payments, and print receipts from a mobile device. No counter space needed.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fef2f2 100%)', padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#dc2626', padding: '8px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
              From $20/mo
            </div>
            <h1 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '900', lineHeight: 1.1, color: '#111827', marginBottom: '24px', letterSpacing: '-2px' }}>
              POS for Small Restaurants<br />That Actually Fits Your Budget
            </h1>
            <p style={{ fontSize: isMobile ? '18px' : '20px', color: '#374151', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 40px' }}>
              A full-featured POS system that does not require expensive hardware, long contracts, or a big monthly bill. Start at $20/mo with zero transaction fees. Use your existing phone or tablet.
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

        {/* Why Small Restaurants Choose DineOpen */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Why Small Restaurants Choose DineOpen
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
              Enterprise-grade POS features at a price that makes sense for small businesses.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {whySmall.map((f, i) => (
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

        {/* Perfect For */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Perfect For
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {perfectFor.map((p, i) => (
                <div key={i} style={{ padding: '28px', background: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{p.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              DineOpen vs. Typical Small Restaurant POS
            </h2>
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: '#111827', color: 'white', padding: '16px 24px' }}>
                <span style={{ fontWeight: '700' }}></span>
                <span style={{ fontWeight: '700' }}>DineOpen</span>
                <span style={{ fontWeight: '700' }}>Others</span>
              </div>
              {comparisonPoints.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '16px 24px', borderBottom: i < comparisonPoints.length - 1 ? '1px solid #e5e7eb' : 'none', backgroundColor: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                  <span style={{ fontSize: '15px', color: '#111827', fontWeight: '600' }}>{c.label}</span>
                  <span style={{ fontSize: '15px', color: '#16a34a', fontWeight: '600' }}>{c.dineopen}</span>
                  <span style={{ fontSize: '15px', color: '#6b7280' }}>{c.others}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              Start Small, Grow Big
            </h2>
            <p style={{ fontSize: '18px', color: '#374151', lineHeight: 1.7, marginBottom: '32px' }}>
              Begin with the Starter plan at $20/mo. When you open a second location or need advanced features, upgrade to Pro at $99/mo. All your menu items, order history, and settings carry over automatically.
            </p>
            <div style={{ display: 'inline-block', background: '#f9fafb', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
                <span style={{ fontSize: '48px', fontWeight: '800', color: '#111827' }}>$20</span>
                <span style={{ fontSize: '18px', color: '#6b7280' }}>/mo</span>
              </div>
              <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>₹299/mo in India</p>
              <p style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>Zero transaction fees</p>
            </div>
            <div>
              <Link href="/login?ref=pos" style={{ display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '16px', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial →
              </Link>
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
                { title: 'Takeaway POS', href: '/products/pos/takeaway' },
                { title: 'Dine-In POS', href: '/products/pos/dine-in' },
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
              Your Small Restaurant Deserves a Great POS
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Join thousands of small restaurants using DineOpen. Start free, no credit card required.
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
