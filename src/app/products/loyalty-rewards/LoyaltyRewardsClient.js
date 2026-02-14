'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaGift, FaStar, FaCoins, FaWhatsapp, FaUsers, FaChartLine, FaPercent, FaBirthdayCake, FaShareAlt, FaMobile, FaCheck, FaArrowRight } from 'react-icons/fa';

export default function LoyaltyRewardsClient() {
  const [activeTab, setActiveTab] = useState('points');

  const loyaltyTypes = [
    {
      id: 'points',
      title: 'Points Program',
      icon: <FaCoins size={24} />,
      description: 'Customers earn points on every order. Redeem for discounts or free items.',
      example: 'Earn 1 point per ₹10 spent. 100 points = ₹50 off',
      color: '#f59e0b',
    },
    {
      id: 'visits',
      title: 'Visit-Based Rewards',
      icon: <FaStar size={24} />,
      description: 'Reward customers after a set number of visits.',
      example: 'Visit 10 times, get 11th meal free',
      color: '#8b5cf6',
    },
    {
      id: 'cashback',
      title: 'Cashback Program',
      icon: <FaPercent size={24} />,
      description: 'Give percentage cashback that can be used on next visit.',
      example: '5% cashback on every order, use anytime',
      color: '#10b981',
    },
    {
      id: 'tiered',
      title: 'Tiered Membership',
      icon: <FaGift size={24} />,
      description: 'VIP tiers with increasing benefits for top customers.',
      example: 'Silver → Gold → Platinum with better rewards',
      color: '#ef4444',
    },
  ];

  const features = [
    { icon: <FaWhatsapp />, title: 'WhatsApp Campaigns', desc: 'Send personalized offers directly to WhatsApp. 95% open rate vs 20% for email.' },
    { icon: <FaBirthdayCake />, title: 'Birthday Rewards', desc: 'Auto-send birthday discounts. Customers feel special, you get guaranteed visits.' },
    { icon: <FaShareAlt />, title: 'Referral Program', desc: 'Turn customers into marketers. Reward both referrer and new customer.' },
    { icon: <FaMobile />, title: 'Digital Loyalty Cards', desc: 'No plastic cards needed. Customers access rewards via phone number.' },
    { icon: <FaUsers />, title: 'Customer Segmentation', desc: 'Target VIPs, lapsed customers, or new visitors with different offers.' },
    { icon: <FaChartLine />, title: 'Analytics Dashboard', desc: 'Track redemption rates, customer lifetime value, and campaign ROI.' },
  ];

  const stats = [
    { value: '40%', label: 'Increase in repeat visits' },
    { value: '25%', label: 'Higher average order value' },
    { value: '3x', label: 'Customer lifetime value' },
    { value: '95%', label: 'WhatsApp open rate' },
  ];

  const competitors = [
    { name: 'DineOpen', price: 'FREE', priceSub: 'Included with POS', features: ['Points & Rewards', 'WhatsApp Marketing', 'Referrals', 'POS Integration', 'Analytics'], highlight: true },
    { name: 'Reelo', price: '₹2,500+/mo', priceSub: 'Standalone app', features: ['Points & Rewards', 'WhatsApp Marketing', 'Referrals', 'POS Integration', 'Analytics'], highlight: false },
    { name: 'Bingage', price: '₹1,999+/mo', priceSub: 'Standalone app', features: ['Points & Rewards', 'WhatsApp Marketing', 'Referrals', 'Limited POS', 'Basic Analytics'], highlight: false },
    { name: 'Kangaroo', price: '$59+/mo', priceSub: 'US-focused', features: ['Points & Rewards', 'Email Marketing', 'Referrals', 'API Integration', 'Analytics'], highlight: false },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '24px' }}>
              <FaGift /> Loyalty & Rewards Program
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Turn First-Time Visitors Into<br />Loyal Regulars
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Build customer loyalty with points, rewards, cashback & WhatsApp marketing. Included FREE with DineOpen POS - no extra fees like Reelo or Bingage.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Start Free Trial <FaArrowRight style={{ marginLeft: '8px' }} />
              </Link>
              <Link href="/alternatives/reelo" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Compare with Reelo
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ backgroundColor: 'white', padding: '40px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
            {stats.map((stat, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '42px', fontWeight: '800', color: '#7c3aed', marginBottom: '4px' }}>{stat.value}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Loyalty Types */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Choose Your Loyalty Program Type
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Multiple reward structures to match your restaurant&apos;s style
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {loyaltyTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setActiveTab(type.id)}
                  style={{
                    padding: '28px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: activeTab === type.id ? `0 8px 30px ${type.color}30` : '0 4px 20px rgba(0,0,0,0.05)',
                    border: activeTab === type.id ? `2px solid ${type.color}` : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <div style={{ width: '56px', height: '56px', backgroundColor: `${type.color}20`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: type.color, marginBottom: '16px' }}>
                    {type.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{type.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>{type.description}</p>
                  <div style={{ padding: '12px', backgroundColor: '#f3f4f6', borderRadius: '8px', fontSize: '13px', color: '#374151' }}>
                    <strong>Example:</strong> {type.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Everything You Need to Build Loyalty
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Powerful features included FREE with your DineOpen subscription
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#ede9fe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', flexShrink: 0 }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{feature.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: '80px 20px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Compare Loyalty Program Software
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              See why DineOpen is the best value for restaurant loyalty
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {competitors.map((comp, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '28px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: comp.highlight ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                    boxShadow: comp.highlight ? '0 8px 30px rgba(124,58,237,0.15)' : 'none',
                    position: 'relative',
                  }}
                >
                  {comp.highlight && (
                    <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#7c3aed', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      BEST VALUE
                    </div>
                  )}
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{comp.name}</h3>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: comp.highlight ? '#7c3aed' : '#111827', marginBottom: '4px' }}>{comp.price}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>{comp.priceSub}</p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {comp.features.map((feature, fIdx) => (
                      <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', fontSize: '14px', color: '#374151' }}>
                        <FaCheck style={{ color: '#10b981', flexShrink: 0 }} /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link href="/alternatives/reelo" style={{ color: '#7c3aed', fontWeight: '600', textDecoration: 'none' }}>
                See detailed Reelo comparison →
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How It Works
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
              {[
                { step: '1', title: 'Customer Orders', desc: 'Customer places order via POS, QR menu, or online' },
                { step: '2', title: 'Auto Earn Points', desc: 'Points automatically added based on your rules' },
                { step: '3', title: 'WhatsApp Notification', desc: 'Customer gets instant notification of points earned' },
                { step: '4', title: 'Easy Redemption', desc: 'Redeem points on next visit with phone number' },
              ].map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 auto 16px' }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Frequently Asked Questions
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { q: 'Is the loyalty program really free?', a: 'Yes! Unlike Reelo (₹2,500+/mo) or Bingage, DineOpen includes loyalty & rewards FREE with all POS plans starting at ₹999/month.' },
                { q: 'Do customers need to download an app?', a: 'No app needed. Customers enroll with their phone number. They get WhatsApp notifications and can check/redeem points anytime.' },
                { q: 'Can I customize the rewards structure?', a: 'Absolutely. Set your own points-per-rupee ratio, redemption rules, expiry dates, and special offers. Full flexibility.' },
                { q: 'Does it work with online orders?', a: 'Yes! Loyalty works across dine-in, takeaway, QR orders, and third-party delivery (Zomato/Swiggy orders can be manually added).' },
                { q: 'How do customers redeem rewards?', a: 'At checkout, just enter their phone number. Available rewards show automatically. Apply with one click.' },
              ].map((faq, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{faq.q}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Start Building Customer Loyalty Today
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Free 30-day trial. Loyalty program included. No credit card required.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
