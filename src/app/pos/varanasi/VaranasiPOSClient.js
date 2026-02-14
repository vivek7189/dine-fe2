'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaLeaf, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaGlobe, FaWater, FaStore } from 'react-icons/fa';

export default function VaranasiPOSClient() {
  const cityFeatures = [
    { icon: <FaLeaf size={24} />, title: 'Sattvic & Pure Veg Menu', description: 'Mark items as No Onion-Garlic, Sattvic, Jain-friendly. Perfect for pilgrims visiting Kashi Vishwanath.' },
    { icon: <FaWater size={24} />, title: 'Ghat-View Cafe Ready', description: 'Manage rooftop and ghat-view seating. Handle sunrise aarti crowd with quick service features.' },
    { icon: <FaGlobe size={24} />, title: 'Tourist Multi-Language', description: 'QR menus in English, Japanese, Korean for international tourists. Multi-currency display option.' },
    { icon: <FaStore size={24} />, title: 'Street Food & Lassi Shops', description: 'Quick billing for famous Banarasi chaat, lassi, and thandai shops. High-volume, low-ticket orders.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Varanasi (Banaras) - Spiritual Capital of India
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Restaurant POS for<br />Varanasi&apos;s Sacred Food Culture</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              From Dashashwamedh Ghat cafes to Godowlia chaat shops, DineOpen serves Varanasi&apos;s unique mix of pilgrims, tourists, and locals with pure veg features and quick billing.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>View Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#fef2f2', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Varanasi&apos;s Unique Restaurant Needs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {['Pure vegetarian menu requirements', 'International tourist footfall', 'Ghat aarti timing rush hours', 'Famous lassi & thandai shops', 'Dev Deepawali festival rush', 'Banarasi street food billing'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#dc2626', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Built for Varanasi Food Businesses</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', marginBottom: '16px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Popular in These Varanasi Areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { area: 'Dashashwamedh Ghat', desc: 'Ghat-view cafes, rooftop restaurants' },
                { area: 'Assi Ghat', desc: 'Tourist cafes, bakeries, organic food' },
                { area: 'Godowlia', desc: 'Chaat shops, lassi corners, sweets' },
                { area: 'Lanka (BHU)', desc: 'Student cafes, quick service' },
                { area: 'Sigra', desc: 'Family restaurants, modern cafes' },
                { area: 'Cantonment', desc: 'Multi-cuisine, fine dining' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>{item.area}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#fef2f2' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#dc2626', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;Our ghat-view cafe gets Japanese, Korean, and Western tourists daily. DineOpen&apos;s multi-language QR menu solved our communication problems. The pure veg tagging is perfect for our sattvic kitchen.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Suresh Pandey</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Ganga View Cafe, Assi Ghat, Varanasi</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available Nearby</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[{ name: 'Lucknow', href: '/pos/lucknow' }, { name: 'Prayagraj', href: '/pos/prayagraj' }, { name: 'Haridwar', href: '/pos/haridwar' }, { name: 'Ayodhya', href: '/pos/ayodhya' }].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#dc2626', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{city.name}</Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Ready to Serve Varanasi Better?</h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>Join restaurants across Banaras using DineOpen.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
