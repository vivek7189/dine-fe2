'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaUtensils, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaUsers, FaLeaf, FaClock } from 'react-icons/fa';

export default function AmritsarPOSClient() {
  const cityFeatures = [
    { icon: <FaUtensils size={24} />, title: 'Legendary Dhaba Ready', description: 'Built for Amritsar\'s famous dhabas. Handle late-night rush, butter chicken crowds, and high-volume Punjabi food billing.' },
    { icon: <FaLeaf size={24} />, title: 'Langar & Pure Veg Support', description: 'Golden Temple brings millions of pilgrims. Mark Sattvic items, manage langar-style bulk cooking, pure veg restaurant billing.' },
    { icon: <FaUsers size={24} />, title: 'Tourist Group Billing', description: 'Wagah Border tourists, Golden Temple pilgrims - handle large group orders, fixed menu packages, and quick turnaround.' },
    { icon: <FaClock size={24} />, title: '24-Hour Operations', description: 'Amritsar never sleeps. Late-night kulcha shops, 24-hour dhabas - DineOpen handles round-the-clock shift management.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Amritsar - Food Capital of Punjab
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Restaurant POS for<br />Amritsar&apos;s Legendary Food Scene</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              From iconic Kesar Da Dhaba to Golden Temple area eateries, DineOpen powers Amritsar&apos;s world-famous food businesses with high-volume billing and 24/7 operations.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#b45309', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>View Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#fef3c7', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Amritsar&apos;s Unique Food Business Needs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {['Famous dhaba high-volume rush', 'Golden Temple pilgrim groups', 'Wagah Border tourist timing', 'Late-night kulcha crowds', 'Lassi & street food quick billing', 'Wedding catering bulk orders'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#b45309', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Built for Amritsar Food Legends</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b45309', marginBottom: '16px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Serving Amritsar&apos;s Famous Areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { area: 'Golden Temple Area', desc: 'Pilgrim restaurants, pure veg' },
                { area: 'Town Hall', desc: 'Heritage dhabas, street food' },
                { area: 'Lawrence Road', desc: 'Modern restaurants, cafes' },
                { area: 'Hall Bazaar', desc: 'Traditional eateries, sweets' },
                { area: 'Ranjit Avenue', desc: 'Family restaurants, buffets' },
                { area: 'GT Road', desc: 'Highway dhabas, 24-hour spots' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#b45309', marginBottom: '4px' }}>{item.area}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#fef3c7' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#b45309', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;Our dhaba serves 2000+ customers daily. DineOpen handles our rush hours perfectly - quick billing, kitchen display, everything. It understands Punjabi food business.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Gurpreet Singh</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Bade Bhai Ka Dhaba, Town Hall, Amritsar</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available in Punjab</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[{ name: 'Chandigarh', href: '/pos/chandigarh' }, { name: 'Ludhiana', href: '/pos/ludhiana' }, { name: 'Jalandhar', href: '/pos/jalandhar' }, { name: 'Patiala', href: '/pos/patiala' }].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#b45309', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{city.name}</Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Ready to Serve Amritsar Better?</h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>Join legendary dhabas and restaurants across Amritsar using DineOpen.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#b45309', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
