'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaMountain, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaGlobe, FaCoffee, FaHotel } from 'react-icons/fa';

export default function ShimlaPOSClient() {
  const cityFeatures = [
    { icon: <FaMountain size={24} />, title: 'Mall Road Cafe Ready', description: 'Shimla\'s iconic Mall Road is full of cafes. Handle tourist rush, window seating premiums, and peak season crowds efficiently.' },
    { icon: <FaGlobe size={24} />, title: 'Tourist Multi-Language', description: 'International and domestic tourists need easy menus. QR ordering in multiple languages, tourist-friendly billing.' },
    { icon: <FaCoffee size={24} />, title: 'Heritage Cafe & Bakery', description: 'Colonial-era cafes and bakeries are Shimla\'s charm. Manage specialty coffee, fresh pastries, and British-era recipes.' },
    { icon: <FaHotel size={24} />, title: 'Hotel Restaurant Ready', description: 'Shimla\'s hospitality industry thrives on tourism. Room service, resort dining, honeymoon packages - all integrated.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Shimla - Queen of Hill Stations
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Restaurant POS for<br />Shimla&apos;s Tourism Industry</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              From Mall Road heritage cafes to Kufri resort restaurants, DineOpen powers Shimla&apos;s vibrant food and hospitality scene with tourist-ready features.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#4f46e5', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>View Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#e0e7ff', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Shimla&apos;s Tourism Restaurant Needs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {['Peak season tourist rush', 'Mall Road high footfall', 'Hotel room service integration', 'Heritage cafe ambiance billing', 'Snow season crowd management', 'Honeymoon couple packages'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#4f46e5', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Built for Shimla Cafes & Hotels</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#e0e7ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', marginBottom: '16px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Popular in These Shimla Areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { area: 'Mall Road', desc: 'Heritage cafes, tourist restaurants' },
                { area: 'Lakkar Bazaar', desc: 'Local eateries, snack shops' },
                { area: 'The Ridge', desc: 'Premium cafes, view restaurants' },
                { area: 'Kufri', desc: 'Resort restaurants, adventure cafes' },
                { area: 'Chotta Shimla', desc: 'Family restaurants, local dining' },
                { area: 'Sanjauli', desc: 'Student cafes, budget eateries' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#e0e7ff', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#4f46e5', marginBottom: '4px' }}>{item.area}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#e0e7ff' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#4f46e5', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;Our heritage cafe on Mall Road sees massive crowds during snow season. DineOpen&apos;s table management and quick billing helps us serve more tourists without compromising the experience.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Ankit Sharma</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Indian Coffee House, Mall Road, Shimla</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available in Himachal</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[{ name: 'Manali', href: '/pos/manali' }, { name: 'Dharamshala', href: '/pos/dharamshala' }, { name: 'Chandigarh', href: '/pos/chandigarh' }, { name: 'Kasol', href: '/pos/kasol' }].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#4f46e5', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{city.name}</Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Ready to Serve Shimla Better?</h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>Join cafes and hotels across Shimla using DineOpen.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#4f46e5', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
