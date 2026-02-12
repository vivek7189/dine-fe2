'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaUserFriends, FaShare, FaGift, FaChartLine, FaCheck } from 'react-icons/fa';


export default function ReferralProgramPage() {
  const howItWorks = [
    { step: '1', title: 'Customer Gets Code', desc: 'Each customer has a unique referral code or link to share.' },
    { step: '2', title: 'Friend Signs Up', desc: 'Friend orders using the code. Both get credited.' },
    { step: '3', title: 'Both Get Rewarded', desc: 'Referrer gets points/discount. Friend gets welcome bonus.' },
    { step: '4', title: 'Viral Growth', desc: 'Happy customers bring more customers. Free marketing.' },
  ];

  const benefits = [
    'Acquire customers at near-zero cost',
    'Referred customers have 4x higher lifetime value',
    'Word-of-mouth is most trusted marketing',
    'Track which customers refer most',
    'Auto-credit rewards, no manual work',
    'Works with WhatsApp, SMS, social sharing',
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FaUserFriends style={{ fontSize: '64px', marginBottom: '20px' }} />
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Referral Program for Restaurants</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Turn happy customers into brand ambassadors. Refer a friend, both get rewarded. Growth on autopilot.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#8b5cf6', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/login" style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>How Referrals Work</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
              {howItWorks.map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px', fontWeight: '700' }}>{item.step}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Why Referral Programs Work</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {benefits.map((benefit, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <FaCheck style={{ color: '#8b5cf6', fontSize: '20px', flexShrink: 0 }} />
                  <span style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Referral Reward Ideas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                { title: 'Cash Back', example: 'Refer a friend, both get ₹100 off' },
                { title: 'Points Bonus', example: 'Earn 500 bonus points per referral' },
                { title: 'Free Items', example: 'Free dessert for referrer, 20% off for friend' },
                { title: 'Tier Upgrades', example: '3 referrals = automatic Gold status' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#faf5ff', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280' }}>{item.example}</p>
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
              <Link href="/loyalty/customer-rewards" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Customer Rewards</Link>
              <Link href="/features/whatsapp-ordering" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>WhatsApp Sharing</Link>
              <Link href="/loyalty/customer-retention" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Customer Retention</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Grow Through Referrals</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>Your customers are your best marketers.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: '#8b5cf6', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
