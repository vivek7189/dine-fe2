'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaBirthdayCake, FaGift, FaEnvelope, FaCalendarAlt, FaCheck } from 'react-icons/fa';


export default function BirthdayRewardsPage() {
  const features = [
    { icon: FaCalendarAlt, title: 'Birthday Collection', desc: 'Capture birthdays at signup or first visit. Build your customer database.' },
    { icon: FaEnvelope, title: 'Auto Messages', desc: 'WhatsApp/SMS sent automatically on birthdays with personalized offers.' },
    { icon: FaGift, title: 'Special Offers', desc: 'Free dessert, percentage off, bonus points. You decide the reward.' },
    { icon: FaBirthdayCake, title: 'Birthday Month', desc: 'Extend offers to entire birthday month. More chances to visit.' },
  ];

  const rewardIdeas = [
    'Free dessert or cake slice',
    '25% off entire bill',
    'Double points on birthday visit',
    'Free appetizer for the table',
    'Complimentary drink',
    'Special birthday combo meal',
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FaBirthdayCake style={{ fontSize: '64px', marginBottom: '20px' }} />
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Birthday Rewards Program</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Make customers feel special on their birthday. Auto-send wishes and exclusive offers. Watch them celebrate with you.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ec4899', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/login" style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Why Birthday Programs Work</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', textAlign: 'center' }}>
              {[
                { stat: '85%', desc: 'Feel more loyal to brands that remember birthdays' },
                { stat: '3x', desc: 'Higher redemption rate than regular offers' },
                { stat: '4+', desc: 'Average group size for birthday celebrations' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: '#ec4899' }}>{item.stat}</div>
                  <div style={{ fontSize: '15px', color: '#6b7280' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>How It Works</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', backgroundColor: '#fce7f3', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <feature.icon style={{ fontSize: '32px', color: '#ec4899' }} />
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
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Birthday Reward Ideas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {rewardIdeas.map((idea, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: '#fdf2f8', borderRadius: '12px' }}>
                  <FaCheck style={{ color: '#ec4899', fontSize: '20px', flexShrink: 0 }} />
                  <span style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{idea}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Sample Birthday Message</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '20px' }}>🎂</span>
                </div>
                <span style={{ fontWeight: '600', color: '#111827' }}>Your Restaurant</span>
              </div>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>
                Happy Birthday! 🎉<br /><br />
                We hope you have an amazing day! To celebrate, here&apos;s a special gift: <strong>FREE dessert</strong> on your next visit this month!<br /><br />
                Show this message to redeem. Valid until [date].<br /><br />
                - Team [Restaurant Name]
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Related Features</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/loyalty/restaurant-loyalty-program" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Loyalty Program</Link>
              <Link href="/loyalty/customer-rewards" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Customer Rewards</Link>
              <Link href="/features/whatsapp-ordering" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>WhatsApp Marketing</Link>
              <Link href="/loyalty/customer-retention" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Customer Retention</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Celebrate With Your Customers</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>Birthday automation that builds loyalty.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: '#ec4899', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
