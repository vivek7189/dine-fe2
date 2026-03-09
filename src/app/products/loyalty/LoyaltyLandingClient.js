'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaUsers, FaGift, FaPercent, FaWhatsapp, FaMobile, FaChartLine, FaCheck, FaArrowRight, FaStar, FaCoins, FaHeart, FaBullhorn, FaChevronDown, FaChevronUp, FaDatabase, FaShoppingCart, FaUtensils, FaCog } from 'react-icons/fa';

export default function LoyaltyLandingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: <FaDatabase size={24} />, title: 'Customer CRM', desc: 'Complete customer database with phone, email, and address. Search, sort, and filter your entire customer list. Track order history and last visit for every customer.', link: '/products/loyalty/crm', color: '#3b82f6' },
    { icon: <FaGift size={24} />, title: 'Loyalty Rewards', desc: 'Points-based rewards program that runs automatically. Customers earn points on every order and redeem them for discounts or free items on their next visit.', link: '/products/loyalty/rewards', color: '#7c3aed' },
    { icon: <FaPercent size={24} />, title: 'Offers & Promotions', desc: 'Create and manage promotional offers, discounts, and special deals. Schedule campaigns for festivals, slow days, or seasonal menus to drive traffic.', link: '/products/loyalty/offers', color: '#ef4444' },
    { icon: <FaWhatsapp size={24} />, title: 'WhatsApp Marketing', desc: 'Send targeted campaigns directly to WhatsApp with 95% open rates. Automate birthday wishes, re-engagement messages, and new offer announcements.', link: '/products/loyalty/whatsapp', color: '#25d366' },
    { icon: <FaMobile size={24} />, title: 'Customer App (Crave)', desc: 'A branded customer-facing app where diners can view your menu, place orders, track loyalty points, and receive offers. Build direct relationships with your customers.', link: '/products/loyalty/customer-app', color: '#f59e0b' },
    { icon: <FaChartLine size={24} />, title: 'Engagement Analytics', desc: 'Track customer visit frequency, campaign performance, redemption rates, and lifetime value. Understand which promotions work and optimize your marketing spend.', link: '/products/loyalty', color: '#10b981' },
  ];

  const stats = [
    { value: '40%', label: 'More repeat visits with loyalty programs' },
    { value: '25%', label: 'Higher average order value from loyal customers' },
    { value: '5x', label: 'Cheaper to retain a customer than acquire new one' },
    { value: '95%', label: 'WhatsApp open rate vs 20% for email' },
  ];

  const steps = [
    { num: '1', title: 'Build Your Customer Database', desc: 'Customer details are captured automatically when they order through your POS, QR menu, or the Crave app. No manual data entry needed.' },
    { num: '2', title: 'Set Up Rewards & Offers', desc: 'Define your loyalty rules: points per rupee spent, reward thresholds, and promotional offers. Takes less than 10 minutes to configure.' },
    { num: '3', title: 'Engage on WhatsApp', desc: 'Send targeted campaigns to customer segments. Birthday offers, lapsed customer re-engagement, new menu announcements - all automated.' },
    { num: '4', title: 'Track & Optimize', desc: 'Monitor which campaigns drive visits and revenue. Refine your offers based on real data, not guesswork. Watch your repeat customer rate grow.' },
  ];

  const competitors = [
    { name: 'DineOpen Loyalty', price: '$9.99/mo', priceSub: 'All features included with POS', features: ['Customer CRM', 'Loyalty Rewards', 'WhatsApp Marketing', 'Customer App', 'Offers Management', 'POS Integrated', 'Zero Transaction Fees'], highlight: true },
    { name: 'Reelo', price: '$30+/mo', priceSub: 'Standalone loyalty app', features: ['Customer CRM', 'Loyalty Rewards', 'WhatsApp Marketing', 'No Customer App', 'Offers Management', 'Requires POS Integration', 'Transaction Fees Apply'], highlight: false },
    { name: 'FiveStars', price: '$299+/mo', priceSub: 'US-focused platform', features: ['Customer CRM', 'Loyalty Rewards', 'Email Marketing', 'No Customer App', 'Offers Management', 'Tablet Required', 'Transaction Fees Apply'], highlight: false },
    { name: 'Kangaroo', price: '$59+/mo', priceSub: 'Generic loyalty tool', features: ['Basic CRM', 'Loyalty Rewards', 'Email Marketing', 'No Customer App', 'Basic Offers', 'API Integration', 'Per-Transaction Pricing'], highlight: false },
  ];

  const faqs = [
    { q: 'What is DineOpen Loyalty?', a: 'DineOpen Loyalty is a complete customer engagement platform built into DineOpen. It includes a customer CRM, loyalty rewards program, promotional offers management, WhatsApp marketing campaigns, and a branded customer app called Crave. All features are included in every DineOpen plan with zero transaction fees - no separate subscription needed.' },
    { q: 'How much does DineOpen Loyalty cost?', a: 'All loyalty features are included in your DineOpen subscription. The Spark Plan starts at $9.99/month (Rs 300/month in India) and the Blaze Plan is $89/month (Rs 2,500/month in India). There are zero transaction fees. Unlike Reelo or FiveStars which charge separately for loyalty, everything is bundled with DineOpen.' },
    { q: 'Do I need technical knowledge to set up a loyalty program?', a: 'Not at all. Setting up your loyalty program takes less than 10 minutes. Just define how many points customers earn per order, set your reward thresholds, and create your first promotional offer. The system handles everything automatically - capturing customer data, calculating points, and sending notifications.' },
    { q: 'How is this different from the loyalty-rewards page?', a: 'DineOpen Loyalty is the comprehensive product suite that covers everything related to customer engagement: CRM, rewards, offers, WhatsApp marketing, and the Crave customer app. The loyalty rewards feature is one component within the broader Loyalty platform.' },
    { q: 'Can I import my existing customer database?', a: 'Yes. You can import customer data from spreadsheets or other CRM systems. DineOpen also captures new customer data automatically from every order placed through POS, QR menus, or the Crave app, so your database grows organically over time.' },
    { q: 'What kind of ROI can I expect from a loyalty program?', a: 'Restaurants using loyalty programs typically see a 25-40% increase in repeat visits and a 20-25% increase in average order value. Since retaining a customer costs 5x less than acquiring a new one, the ROI is substantial. Use our Loyalty Program ROI Calculator at /tools/loyalty-program-roi-calculator/ to estimate your specific returns.' },
    { q: 'Does the loyalty program work with online orders?', a: 'Yes. The loyalty program is fully integrated with DineOpen POS, QR menu ordering, and the Crave customer app. Customers earn points regardless of how they order - dine-in, takeaway, or delivery. All data syncs across channels in real time.' },
    { q: 'Can I run different promotions for different customer segments?', a: 'Absolutely. DineOpen lets you segment customers based on visit frequency, order value, last visit date, and more. You can create targeted offers for VIP customers, win-back campaigns for lapsed visitors, or welcome offers for first-timers.' },
  ];

  const crossLinks = [
    { title: 'DineOpen POS', desc: 'Complete point-of-sale system for restaurants', link: '/products/pos-software', icon: <FaShoppingCart size={20} /> },
    { title: 'DineOpen Menu', desc: 'QR code digital menu and online ordering', link: '/products/billing-software', icon: <FaUtensils size={20} /> },
    { title: 'DineOpen Orders', desc: 'Multi-channel order management', link: '/products/restaurant-management', icon: <FaCog size={20} /> },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 50%, #4c1d95 100%)', color: 'white', padding: isMobile ? '60px 20px' : '100px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '28px', fontSize: '14px', fontWeight: '600' }}>
              <FaHeart /> DineOpen Loyalty
            </div>
            <h1 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '800', marginBottom: '24px', lineHeight: 1.15 }}>
              Turn First-Time Visitors<br />Into Loyal Regulars
            </h1>
            <p style={{ fontSize: isMobile ? '18px' : '22px', opacity: 0.95, marginBottom: '40px', maxWidth: '720px', margin: '0 auto 40px', lineHeight: 1.6 }}>
              Customer CRM, loyalty rewards, WhatsApp marketing, and a branded customer app — all included in your DineOpen subscription. Zero transaction fees.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=loyalty" style={{ padding: '16px 36px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Get Started Free <FaArrowRight />
              </Link>
              <Link href="/tools/loyalty-program-roi-calculator/" style={{ padding: '16px 36px', backgroundColor: 'transparent', border: '2px solid rgba(255,255,255,0.7)', color: 'white', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Calculate Your ROI
              </Link>
            </div>
          </div>
        </section>

        {/* Problem Statement */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
              80% of Restaurant Revenue Comes From 20% of Repeat Customers
            </h2>
            <p style={{ fontSize: '18px', color: '#374151', lineHeight: 1.7, marginBottom: '28px' }}>
              Most restaurants spend heavily on acquiring new customers through food delivery apps and ads, while ignoring the customers they already have. The truth is simple: a repeat customer spends 67% more than a new one, and retaining them costs 5x less than finding new ones.
            </p>
            <p style={{ fontSize: '18px', color: '#374151', lineHeight: 1.7, marginBottom: '32px' }}>
              Yet most restaurants have no system to track customers, reward loyalty, or re-engage diners who haven&apos;t visited in a while. DineOpen Loyalty changes that by giving you a complete toolkit to build lasting customer relationships.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '24px' }}>
              {stats.map((stat, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <p style={{ fontSize: '36px', fontWeight: '800', color: '#7c3aed', marginBottom: '6px' }}>{stat.value}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Everything You Need to Build Customer Loyalty
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              Six powerful tools that work together to turn occasional visitors into loyal regulars
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '28px' }}>
              {features.map((feature, idx) => (
                <Link href={feature.link} key={idx} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', transition: 'all 0.3s ease', height: '100%' }}>
                    <div style={{ width: '56px', height: '56px', backgroundColor: `${feature.color}15`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, marginBottom: '20px' }}>
                      {feature.icon}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>{feature.title}</h3>
                    <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6, marginBottom: '16px' }}>{feature.desc}</p>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: feature.color, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      Learn more <FaArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ROI Section */}
        <section style={{ backgroundColor: '#7c3aed', padding: isMobile ? '60px 20px' : '80px 20px', color: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '20px' }}>
              What&apos;s the ROI of a Loyalty Program?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, lineHeight: 1.7, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Restaurants with active loyalty programs see measurable improvements across all key metrics. A cafe with 500 monthly customers implementing a points-based loyalty program can expect to generate an additional $2,000-4,000 in monthly revenue from increased visit frequency alone.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
              {[
                { metric: 'Repeat Visit Rate', before: '15-20%', after: '35-45%' },
                { metric: 'Avg. Order Value', before: '$12-15', after: '$18-22' },
                { metric: 'Customer Lifetime Value', before: '$150', after: '$450+' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '14px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9, marginBottom: '16px' }}>{item.metric}</p>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '12px', opacity: 0.7 }}>Without</p>
                      <p style={{ fontSize: '22px', fontWeight: '700' }}>{item.before}</p>
                    </div>
                    <FaArrowRight style={{ opacity: 0.6 }} />
                    <div>
                      <p style={{ fontSize: '12px', opacity: 0.7 }}>With Loyalty</p>
                      <p style={{ fontSize: '22px', fontWeight: '700', color: '#fbbf24' }}>{item.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/tools/loyalty-program-roi-calculator/" style={{ padding: '16px 36px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '17px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Calculate Your ROI <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              How DineOpen Loyalty Works
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '56px' }}>
              Set up in minutes, runs automatically from day one
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '32px' }}>
              {steps.map((step, idx) => (
                <div key={idx} style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{ width: '68px', height: '68px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '26px', fontWeight: '800', margin: '0 auto 20px' }}>
                    {step.num}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Compare Customer Loyalty Platforms
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              See why restaurants choose DineOpen over standalone loyalty apps
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '20px' }}>
              {competitors.map((comp, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', border: comp.highlight ? '2px solid #7c3aed' : '1px solid #e5e7eb', boxShadow: comp.highlight ? '0 8px 30px rgba(124,58,237,0.15)' : 'none', position: 'relative' }}>
                  {comp.highlight && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#7c3aed', color: 'white', padding: '4px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      BEST VALUE
                    </div>
                  )}
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{comp.name}</h3>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: comp.highlight ? '#7c3aed' : '#111827', marginBottom: '4px' }}>{comp.price}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>{comp.priceSub}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {comp.features.map((feature, fIdx) => (
                      <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 0', fontSize: '13px', color: '#374151' }}>
                        <FaCheck style={{ color: feature.includes('No ') ? '#d1d5db' : '#10b981', flexShrink: 0, fontSize: '12px' }} />
                        <span style={{ color: feature.includes('No ') ? '#9ca3af' : '#374151' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '48px' }}>
              All loyalty features included in every plan. Zero transaction fees.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              <div style={{ padding: '36px', borderRadius: '16px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Spark Plan</h3>
                <p style={{ fontSize: '42px', fontWeight: '800', color: '#7c3aed', marginBottom: '4px' }}>$9.99<span style={{ fontSize: '18px', fontWeight: '500', color: '#6b7280' }}>/month</span></p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Rs 300/month in India</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', textAlign: 'left' }}>
                  {['Customer CRM', 'Loyalty Rewards', 'Offers Management', 'WhatsApp Marketing', 'Customer App (Crave)', 'Analytics Dashboard'].map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '15px', color: '#374151' }}>
                      <FaCheck style={{ color: '#10b981', flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login?ref=loyalty" style={{ display: 'block', padding: '14px', backgroundColor: '#7c3aed', color: 'white', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}>
                  Start Free Trial
                </Link>
              </div>

              <div style={{ padding: '36px', borderRadius: '16px', border: '2px solid #7c3aed', backgroundColor: 'white', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#7c3aed', color: 'white', padding: '4px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                  MOST POPULAR
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Blaze Plan</h3>
                <p style={{ fontSize: '42px', fontWeight: '800', color: '#7c3aed', marginBottom: '4px' }}>$89<span style={{ fontSize: '18px', fontWeight: '500', color: '#6b7280' }}>/month</span></p>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Rs 2,500/month in India</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', textAlign: 'left' }}>
                  {['Everything in Spark', 'Advanced Customer Segments', 'Automated Campaigns', 'Priority WhatsApp Support', 'Multi-Location Support', 'Custom Reward Rules'].map((f, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '15px', color: '#374151' }}>
                      <FaCheck style={{ color: '#10b981', flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login?ref=loyalty" style={{ display: 'block', padding: '14px', backgroundColor: '#7c3aed', color: 'white', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}>
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Frequently Asked Questions
            </h2>

            {faqs.map((faq, idx) => (
              <div key={idx} style={{ marginBottom: '12px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                  {openFaq === idx ? <FaChevronUp style={{ color: '#6b7280', flexShrink: 0 }} /> : <FaChevronDown style={{ color: '#6b7280', flexShrink: 0 }} />}
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 24px 20px', fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Cross-Links */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Part of the DineOpen Platform
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>
              DineOpen Loyalty works seamlessly with the rest of the DineOpen suite
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
              {crossLinks.map((item, idx) => (
                <Link href={item.link} key={idx} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{item.title}</h3>
                      <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center', color: 'white' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: '800', marginBottom: '20px' }}>
              Start Building Customer Loyalty Today
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '36px', lineHeight: 1.6 }}>
              Join thousands of restaurants using DineOpen to turn one-time visitors into loyal regulars. Set up your loyalty program in under 10 minutes.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '18px 40px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
              Get Started Free <FaArrowRight />
            </Link>
            <p style={{ marginTop: '16px', fontSize: '14px', opacity: 0.8 }}>
              No credit card required. All loyalty features included from day one.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
