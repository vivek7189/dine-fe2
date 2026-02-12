'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaRedo, FaHeart, FaGift, FaEnvelope, FaChartLine, FaCheck } from 'react-icons/fa';


export default function BoostRepeatCustomersPage() {
  const features = [
    { icon: FaHeart, title: 'Customer Profiles', desc: 'Know your customers. Order history, preferences, visit frequency. Personal touch at scale.' },
    { icon: FaGift, title: 'Loyalty Rewards', desc: 'Points, tiers, perks. Give customers reasons to come back.' },
    { icon: FaEnvelope, title: 'Smart Campaigns', desc: 'Auto-send offers to inactive customers. Win them back before they forget.' },
    { icon: FaChartLine, title: 'Retention Metrics', desc: 'Track repeat rate, lifetime value, churn risk. Know what\'s working.' },
  ];

  const strategies = [
    { title: 'First Visit Bonus', desc: 'Reward first-timers with points. Incentivize second visit.' },
    { title: 'Birthday Rewards', desc: 'Auto-send birthday offers. Celebrations bring groups.' },
    { title: 'Win-Back Campaigns', desc: 'Target customers who haven\'t visited in 30+ days.' },
    { title: 'VIP Treatment', desc: 'Recognize top spenders. Make them feel special.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FaRedo style={{ fontSize: '64px', marginBottom: '20px' }} />
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Boost Repeat Customers</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              First visits are expensive. Repeat visits are profitable. Turn one-timers into regulars.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#a855f7', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/login" style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>The Value of Repeat Customers</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', textAlign: 'center' }}>
              {[
                { stat: '67%', desc: 'More spent by returning customers' },
                { stat: '5x', desc: 'Cheaper than acquiring new ones' },
                { stat: '80%', desc: 'Future revenue from 20% of customers' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: '#a855f7' }}>{item.stat}</div>
                  <div style={{ fontSize: '15px', color: '#6b7280' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Repeat Customer Tools</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', backgroundColor: '#f3e8ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <feature.icon style={{ fontSize: '32px', color: '#a855f7' }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Proven Strategies</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {strategies.map((strategy, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#faf5ff', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{strategy.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280' }}>{strategy.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>What Makes Customers Return</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {[
                'Feeling recognized and valued',
                'Rewards for their loyalty',
                'Personalized offers',
                'Consistent great experience',
                'Exclusive perks',
                'Easy ordering and payment',
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <FaCheck style={{ color: '#a855f7', fontSize: '20px', flexShrink: 0 }} />
                  <span style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Related Features</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/loyalty/restaurant-loyalty-program" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Loyalty Program</Link>
              <Link href="/loyalty/customer-retention" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Customer Retention</Link>
              <Link href="/loyalty/birthday-rewards" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Birthday Rewards</Link>
              <Link href="/features/whatsapp-ordering" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>WhatsApp Marketing</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Turn Visitors Into Regulars</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>Build a loyal customer base that keeps coming back.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: '#a855f7', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
