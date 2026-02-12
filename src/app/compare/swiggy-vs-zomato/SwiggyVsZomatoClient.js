'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function SwiggyVsZomatoClient() {
  const comparison = [
    { feature: 'Commission Rate', swiggy: '15-25%', zomato: '18-28%', winner: 'swiggy' },
    { feature: 'Cities Covered', swiggy: '500+', zomato: '800+', winner: 'zomato' },
    { feature: 'Payout Cycle', swiggy: 'Weekly', zomato: 'Weekly', winner: 'tie' },
    { feature: 'Onboarding Time', swiggy: '5-7 days', zomato: '3-7 days', winner: 'tie' },
    { feature: 'Minimum Order Value', swiggy: 'Flexible', zomato: 'Flexible', winner: 'tie' },
    { feature: 'Customer Base', swiggy: 'Younger, Urban', zomato: 'Wider, All Ages', winner: 'zomato' },
    { feature: 'Restaurant Analytics', swiggy: 'Good', zomato: 'Better', winner: 'zomato' },
    { feature: 'Ads Platform', swiggy: 'Available', zomato: 'More Options', winner: 'zomato' },
    { feature: 'Support Quality', swiggy: 'Good', zomato: 'Good', winner: 'tie' },
    { feature: 'Menu Flexibility', swiggy: 'High', zomato: 'High', winner: 'tie' },
  ];

  const prosConsSwiggy = {
    pros: [
      'Lower commission rates in most cities',
      'Strong in metro cities',
      'Good delivery partner network',
      'Swiggy Instamart brings extra traffic',
      'Cleaner restaurant dashboard',
    ],
    cons: [
      'Smaller reach in tier-2/3 cities',
      'Less brand recognition in some areas',
      'Limited dine-in features',
    ],
  };

  const prosConsZomato = {
    pros: [
      'Largest food delivery platform in India',
      'Better brand recognition',
      'Strong in all city tiers',
      'Zomato Gold drives dine-in traffic',
      'Better analytics and insights',
    ],
    cons: [
      'Higher commission rates',
      'More competition from restaurants',
      'Complex pricing structure',
    ],
  };

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '24px' }}>
              <div style={{ padding: '16px 24px', backgroundColor: '#fc8019', borderRadius: '12px', fontSize: '24px', fontWeight: '800' }}>Swiggy</div>
              <span style={{ fontSize: '24px' }}>⚡</span>
              <div style={{ padding: '16px 24px', backgroundColor: '#e23744', borderRadius: '12px', fontSize: '24px', fontWeight: '800' }}>Zomato</div>
            </div>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Swiggy vs Zomato for Restaurants</h1>
            <p style={{ fontSize: '18px', opacity: 0.9 }}>
              Which platform is better for your restaurant? Complete comparison inside.
            </p>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Feature Comparison</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '600', color: '#6b7280' }}>Feature</span>
                <span style={{ fontWeight: '700', color: '#fc8019', textAlign: 'center' }}>Swiggy</span>
                <span style={{ fontWeight: '700', color: '#e23744', textAlign: 'center' }}>Zomato</span>
              </div>
              {comparison.map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '16px 24px', borderBottom: idx < comparison.length - 1 ? '1px solid #e5e7eb' : 'none', alignItems: 'center' }}>
                  <span style={{ fontSize: '15px', color: '#111827' }}>{row.feature}</span>
                  <span style={{ textAlign: 'center', fontSize: '15px', fontWeight: row.winner === 'swiggy' ? '600' : '400', color: row.winner === 'swiggy' ? '#fc8019' : '#374151' }}>
                    {row.swiggy} {row.winner === 'swiggy' && '✓'}
                  </span>
                  <span style={{ textAlign: 'center', fontSize: '15px', fontWeight: row.winner === 'zomato' ? '600' : '400', color: row.winner === 'zomato' ? '#e23744' : '#374151' }}>
                    {row.zomato} {row.winner === 'zomato' && '✓'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '8px 16px', backgroundColor: '#fc8019', color: 'white', borderRadius: '8px', fontWeight: '700' }}>Swiggy</div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#059669', marginBottom: '12px' }}>✅ Pros</h4>
                  {prosConsSwiggy.pros.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FaCheck style={{ color: '#059669', fontSize: '12px' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>{p}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '12px' }}>❌ Cons</h4>
                  {prosConsSwiggy.cons.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FaTimes style={{ color: '#dc2626', fontSize: '12px' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ padding: '8px 16px', backgroundColor: '#e23744', color: 'white', borderRadius: '8px', fontWeight: '700' }}>Zomato</div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#059669', marginBottom: '12px' }}>✅ Pros</h4>
                  {prosConsZomato.pros.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FaCheck style={{ color: '#059669', fontSize: '12px' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>{p}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '12px' }}>❌ Cons</h4>
                  {prosConsZomato.cons.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FaTimes style={{ color: '#dc2626', fontSize: '12px' }} />
                      <span style={{ fontSize: '14px', color: '#374151' }}>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>🎯 Our Verdict</h2>
            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '20px' }}>
                <strong>For maximum reach:</strong> List on BOTH platforms. Most successful restaurants use both Swiggy and Zomato to maximize orders.
              </p>
              <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.8, marginBottom: '20px' }}>
                <strong>If you must choose one:</strong>
              </p>
              <ul style={{ fontSize: '15px', color: '#374151', lineHeight: 2, paddingLeft: '20px' }}>
                <li><strong>Choose Swiggy</strong> if you&apos;re in a metro city and want lower commissions</li>
                <li><strong>Choose Zomato</strong> if you&apos;re in a tier-2/3 city or want dine-in traffic too</li>
              </ul>
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Resources</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Swiggy Registration', href: '/resources/swiggy-onboarding', icon: '🍔' },
                { name: 'Zomato Registration', href: '/resources/zomato-onboarding', icon: '🍽️' },
                { name: 'Commission Calculator', href: '/tools/swiggy-zomato-calculator', icon: '🧮' },
                { name: 'POS for India', href: '/india', icon: '🇮🇳' },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#111827', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Manage Both Platforms in One Place</h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px' }}>DineOpen integrates with both Swiggy and Zomato. Auto-accept orders, sync menus, track earnings - all from one dashboard.</p>
            <Link href="/india" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Learn More</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
