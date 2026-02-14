'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaIndustry, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaUtensils, FaUsers, FaClock } from 'react-icons/fa';

export default function MeerutPOSClient() {
  const cityFeatures = [
    { icon: <FaIndustry size={24} />, title: 'Industrial Canteen Ready', description: 'Manage factory canteens and worker mess halls. Pre-paid meal cards, shift-based billing, bulk meal management for Meerut\'s industrial workforce.' },
    { icon: <FaUtensils size={24} />, title: 'Famous Food Street Billing', description: 'Quick billing for Meerut\'s legendary chaat, tikki, and jalebi shops. High-volume, low-ticket transactions handled efficiently.' },
    { icon: <FaUsers size={24} />, title: 'Wedding & Catering Support', description: 'Meerut\'s big wedding industry needs bulk catering billing. Manage tent-house orders, party bookings, and bulk food supply.' },
    { icon: <FaClock size={24} />, title: 'Sports Academy Meals', description: 'Meerut is India\'s sports goods hub. Manage athlete mess, hostel canteens, and sports academy meal subscriptions.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Meerut - Sports Capital of India
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Restaurant POS for<br />Meerut&apos;s Industrial & Food Scene</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              From industrial canteens to famous chaat streets, DineOpen serves Meerut&apos;s unique mix of factory workers, sports academies, and legendary street food vendors.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ea580c', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>View Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#fff7ed', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Meerut&apos;s Food Business Challenges</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {['Factory canteen bulk billing', 'Famous street food high volume', 'Wedding season catering rush', 'Sports hostel meal management', 'Multi-shift worker meals', 'Jalebi-ghewar sweet shops'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#ea580c', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Built for Meerut Food Businesses</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#fff7ed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c', marginBottom: '16px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Popular in These Meerut Areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { area: 'Abu Lane', desc: 'Famous chaat street, street food' },
                { area: 'Sadar Bazaar', desc: 'Restaurants, sweet shops' },
                { area: 'Shastri Nagar', desc: 'Family restaurants, cafes' },
                { area: 'Begum Bridge', desc: 'Industrial area canteens' },
                { area: 'Modipuram', desc: 'Highway dhabas, restaurants' },
                { area: 'Pallavpuram', desc: 'Modern cafes, food outlets' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#fff7ed', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ea580c', marginBottom: '4px' }}>{item.area}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#fff7ed' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#ea580c', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;We run a canteen for 500+ factory workers across 3 shifts. DineOpen&apos;s pre-paid card system and bulk billing saves us hours daily. Perfect for industrial messes.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Rakesh Tyagi</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Modi Industries Canteen, Modipuram, Meerut</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available Nearby</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[{ name: 'Delhi', href: '/pos/delhi' }, { name: 'Noida', href: '/pos/noida' }, { name: 'Ghaziabad', href: '/pos/ghaziabad' }, { name: 'Saharanpur', href: '/pos/saharanpur' }].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#ea580c', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{city.name}</Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Ready to Modernize Your Meerut Business?</h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>Join restaurants and canteens across Meerut using DineOpen.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#ea580c', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
