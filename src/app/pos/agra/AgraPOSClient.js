'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaGlobe, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaUsers, FaBuilding, FaCamera } from 'react-icons/fa';

export default function AgraPOSClient() {
  const cityFeatures = [
    { icon: <FaGlobe size={24} />, title: 'Multi-Language Tourist Menus', description: 'QR menus in 10+ languages - English, French, German, Spanish, Japanese, Chinese. Serve global tourists seamlessly.' },
    { icon: <FaUsers size={24} />, title: 'Tour Group Billing', description: 'Handle bulk bookings from tour operators. Pre-set menus, group discounts, and quick settlement for buses of tourists.' },
    { icon: <FaCamera size={24} />, title: 'Taj View Premium Seating', description: 'Manage rooftop and Taj-view premium tables. Charge view premiums, handle sunrise/sunset rush efficiently.' },
    { icon: <FaBuilding size={24} />, title: 'Hotel Restaurant Ready', description: 'Room service integration, multi-outlet hotel billing, conference catering for Agra&apos;s hospitality industry.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Agra - City of Taj Mahal
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Restaurant POS for<br />Agra&apos;s Tourism Industry</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              8 million tourists visit Taj Mahal yearly. DineOpen helps Agra restaurants serve them better with multi-language menus, tour group billing, and premium seating management.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#0891b2', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>View Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#ecfeff', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Agra&apos;s Tourism Restaurant Challenges</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {['International tourists needing translated menus', 'Tour bus groups with fixed menus', 'Peak season vs off-season management', 'Taj view premium pricing', 'Multi-currency payment handling', 'Quick turnover for tourist timing'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#0891b2', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Features for Agra Restaurants</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#ecfeff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0891b2', marginBottom: '16px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Serving Agra&apos;s Key Areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { area: 'Taj Ganj', desc: 'Rooftop cafes, budget tourist eateries' },
                { area: 'Fatehabad Road', desc: 'Luxury hotels, fine dining' },
                { area: 'Sadar Bazaar', desc: 'Local restaurants, petha shops' },
                { area: 'MG Road', desc: 'Modern cafes, family restaurants' },
                { area: 'Sikandra', desc: 'Highway restaurants, dhabas' },
                { area: 'Taj East Gate', desc: 'Tourist restaurants, quick service' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#ecfeff', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0891b2', marginBottom: '4px' }}>{item.area}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#ecfeff' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#0891b2', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;We handle 20+ tour buses daily in peak season. DineOpen&apos;s group billing feature saves us hours. The multi-language menus mean tourists can order themselves. Perfect for Agra tourism.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Amit Agarwal</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Taj View Restaurant, Taj Ganj, Agra</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available in Golden Triangle</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[{ name: 'Delhi', href: '/pos/delhi' }, { name: 'Jaipur', href: '/pos/jaipur' }, { name: 'Mathura', href: '/pos/mathura' }, { name: 'Noida', href: '/pos/noida' }].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#0891b2', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{city.name}</Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Ready to Serve More Tourists?</h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>Join Agra restaurants growing with DineOpen.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#0891b2', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
