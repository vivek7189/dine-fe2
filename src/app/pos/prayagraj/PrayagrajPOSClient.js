'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaWater, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaLeaf, FaUsers, FaUniversity } from 'react-icons/fa';

export default function PrayagrajPOSClient() {
  const cityFeatures = [
    { icon: <FaWater size={24} />, title: 'Sangam Pilgrim Ready', description: 'Triveni Sangam attracts millions of pilgrims. Handle large groups, pure veg requirements, and religious festival rush like Kumbh Mela.' },
    { icon: <FaLeaf size={24} />, title: 'Sattvic & Pure Veg Menu', description: 'Mark items as No Onion-Garlic, Sattvic, Jain-friendly. Perfect for pilgrim restaurants near Sangam and temples.' },
    { icon: <FaUniversity size={24} />, title: 'Student Crowd Support', description: 'Allahabad University and coaching hubs mean student crowds. Affordable meal combos, quick service, loyalty programs.' },
    { icon: <FaUsers size={24} />, title: 'Kumbh Mela Scale', description: 'World\'s largest gathering happens here. Scale from regular to millions during Kumbh with cloud-based operations.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Prayagraj (Allahabad) - City of Sangam
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Restaurant POS for<br />Prayagraj&apos;s Sacred Food Scene</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              From Sangam-area pilgrim restaurants to Civil Lines cafes, DineOpen serves Prayagraj&apos;s unique mix of pilgrims, students, and locals with pure veg features and scalable operations.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#0284c7', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>View Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#e0f2fe', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Prayagraj&apos;s Unique Restaurant Needs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {['Kumbh Mela massive scale', 'Pure vegetarian requirements', 'Student budget meals', 'Sangam pilgrim groups', 'Magh Mela seasonal rush', 'Civil Lines modern cafes'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#0284c7', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Built for Prayagraj Restaurants</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#e0f2fe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', marginBottom: '16px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Popular in These Prayagraj Areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { area: 'Sangam Area', desc: 'Pilgrim restaurants, pure veg' },
                { area: 'Civil Lines', desc: 'Modern cafes, fine dining' },
                { area: 'Katra', desc: 'Local eateries, street food' },
                { area: 'Jhunsi', desc: 'Mela area, temporary setups' },
                { area: 'Tagore Town', desc: 'Student cafes, coaching area' },
                { area: 'Naini', desc: 'Local restaurants, family dining' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#e0f2fe', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0284c7', marginBottom: '4px' }}>{item.area}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#e0f2fe' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#0284c7', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;During Magh Mela, we serve thousands daily. DineOpen&apos;s cloud system helped us scale without any downtime. The pure veg tagging is exactly what Sangam-area restaurants need.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Vinod Tiwari</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Sangam View Restaurant, Jhunsi, Prayagraj</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available in UP</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[{ name: 'Varanasi', href: '/pos/varanasi' }, { name: 'Lucknow', href: '/pos/lucknow' }, { name: 'Ayodhya', href: '/pos/ayodhya' }, { name: 'Kanpur', href: '/pos/kanpur' }].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#0284c7', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{city.name}</Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Ready to Serve Prayagraj Better?</h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>Join restaurants across the holy city using DineOpen.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#0284c7', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
