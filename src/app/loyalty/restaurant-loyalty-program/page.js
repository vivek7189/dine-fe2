'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaGift, FaStar, FaMobile, FaChartLine, FaUsers, FaCheck, FaCoins } from 'react-icons/fa';


export default function RestaurantLoyaltyProgramPage() {
  const features = [
    { icon: FaCoins, title: 'Points System', desc: 'Customers earn points per rupee spent. Simple, transparent, rewarding.' },
    { icon: FaStar, title: 'Tier Rewards', desc: 'Bronze, Silver, Gold tiers. Higher tiers get better perks. Gamification that works.' },
    { icon: FaMobile, title: 'Digital Wallet', desc: 'No plastic cards. Points tracked in app. Customers check balance anytime.' },
    { icon: FaChartLine, title: 'Analytics', desc: 'See which rewards drive visits. Track redemption rates. Optimize your program.' },
  ];

  const benefits = [
    '67% of customers prefer restaurants with loyalty programs',
    'Loyal customers spend 67% more than new ones',
    'Cost 5x less to retain than acquire new customers',
    'Build a database of your best customers',
    'Send targeted promotions to high-value guests',
    'Turn occasional visitors into regulars',
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', marginBottom: '20px', fontSize: '14px' }}>Customer Loyalty</div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Restaurant Loyalty Program</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Turn first-time visitors into lifelong regulars. Points, rewards, tiers - all built into your POS.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#f59e0b', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/login" style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Why Loyalty Programs Work</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                { problem: 'Customers come once, never return', solution: 'Points incentivize repeat visits' },
                { problem: 'No way to identify your best customers', solution: 'Track spending, visit frequency, preferences' },
                { problem: 'Competitors stealing your customers', solution: 'Rewards create switching costs' },
                { problem: 'Marketing to strangers is expensive', solution: 'Market to loyal customers for free' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>PROBLEM</div>
                  <p style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>{item.problem}</p>
                  <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600', marginBottom: '8px' }}>SOLUTION</div>
                  <p style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{item.solution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Loyalty Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', backgroundColor: '#fef3c7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <feature.icon style={{ fontSize: '32px', color: '#f59e0b' }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>The Numbers Don&apos;t Lie</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {benefits.map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: '#fffbeb', borderRadius: '12px' }}>
                  <FaCheck style={{ color: '#f59e0b', fontSize: '20px', flexShrink: 0 }} />
                  <span style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Related Features</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/loyalty/customer-rewards" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Customer Rewards</Link>
              <Link href="/loyalty/customer-retention" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Customer Retention</Link>
              <Link href="/loyalty/referral-program" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Referral Program</Link>
              <Link href="/loyalty/birthday-rewards" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Birthday Rewards</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Start Your Loyalty Program</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>Built into DineOpen. No extra apps needed.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: '#f59e0b', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
