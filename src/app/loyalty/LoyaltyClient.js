'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaArrowRight, FaGift, FaBirthdayCake, FaUsers, FaStar, FaHeart, FaChartLine } from 'react-icons/fa';

export default function LoyaltyClient() {
  const loyaltyFeatures = [
    { name: 'Restaurant Loyalty Program', href: '/loyalty/restaurant-loyalty-program', desc: 'Complete loyalty program setup for your restaurant', icon: FaStar },
    { name: 'Birthday Rewards', href: '/loyalty/birthday-rewards', desc: 'Automated birthday offers and rewards', icon: FaBirthdayCake },
    { name: 'Referral Program', href: '/loyalty/referral-program', desc: 'Turn customers into brand ambassadors', icon: FaUsers },
    { name: 'Customer Rewards', href: '/loyalty/customer-rewards', desc: 'Points, cashback, and reward systems', icon: FaGift },
    { name: 'Customer Retention', href: '/loyalty/customer-retention', desc: 'Strategies to keep customers coming back', icon: FaHeart },
  ];

  const benefits = [
    { title: 'Increase Repeat Visits', desc: 'Loyalty members visit 2x more often', stat: '2x' },
    { title: 'Higher Average Ticket', desc: 'Members spend 20% more per visit', stat: '20%' },
    { title: 'Reduce Marketing Costs', desc: 'Retain customers at lower cost', stat: '5x' },
    { title: 'Customer Insights', desc: 'Understand customer preferences', stat: '360°' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '24px' }}>
              <FaHeart />
              <span style={{ fontWeight: '600' }}>Customer Loyalty</span>
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Build Lasting Customer Relationships
            </h1>
            <p style={{ fontSize: '22px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Turn first-time visitors into loyal regulars with DineOpen&apos;s powerful loyalty and rewards program.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '18px 36px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ backgroundColor: 'white', padding: '60px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
            {benefits.map((benefit, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>{benefit.stat}</div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{benefit.title}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{benefit.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Loyalty Features */}
        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Loyalty Program Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Everything you need to build a successful loyalty program
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {loyaltyFeatures.map((feature, idx) => (
                <Link key={idx} href={feature.href} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '28px', backgroundColor: 'white', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#fef2f2', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <feature.icon style={{ fontSize: '24px', color: '#ef4444' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{feature.name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{feature.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#ef4444', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
              {[
                { step: '1', title: 'Customer Signs Up', desc: 'Easy enrollment via phone number or QR code' },
                { step: '2', title: 'Earn Points', desc: 'Customers earn points on every purchase' },
                { step: '3', title: 'Redeem Rewards', desc: 'Use points for discounts, free items, or offers' },
                { step: '4', title: 'Track & Analyze', desc: 'See customer behavior and optimize your program' },
              ].map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', margin: '0 auto 16px' }}>
                    {item.step}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.title}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>
              Start Building Customer Loyalty Today
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Free 7-day trial. No credit card required.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="https://dineopen.com/login"
                style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
