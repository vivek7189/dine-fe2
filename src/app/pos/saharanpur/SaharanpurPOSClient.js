'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaLeaf, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaIndustry, FaStore, FaTruck } from 'react-icons/fa';

export default function SaharanpurPOSClient() {
  const cityFeatures = [
    { icon: <FaLeaf size={24} />, title: 'Timber Town Sweet Shops', description: 'Saharanpur is famous for sweets and snacks. Quick billing for mithai shops, namkeen stores, and traditional food businesses.' },
    { icon: <FaIndustry size={24} />, title: 'Industrial Canteen Ready', description: 'Wood carving and paper industries employ thousands. Manage factory canteens, worker mess halls, and bulk meal operations.' },
    { icon: <FaStore size={24} />, title: 'Market Area Restaurants', description: 'Court Road and Sadar Bazaar restaurants serve busy shoppers. Quick service, takeaway billing, and high footfall management.' },
    { icon: <FaTruck size={24} />, title: 'Highway Dhaba Support', description: 'On Delhi-Dehradun highway route. Perfect for dhabas with traveler rush, quick turnaround, and 24-hour operations.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Saharanpur - Wood Carving Capital
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Restaurant POS for<br />Saharanpur&apos;s Food Businesses</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              From Court Road eateries to highway dhabas, DineOpen helps Saharanpur&apos;s restaurants, sweet shops, and industrial canteens with efficient billing and operations.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#65a30d', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>View Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#ecfccb', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Saharanpur&apos;s Food Business Needs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {['Famous sweet shop billing', 'Industrial worker canteens', 'Market area quick service', 'Highway dhaba travelers', 'Wedding catering orders', 'Local namkeen shops'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#65a30d', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Built for Saharanpur Businesses</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#ecfccb', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#65a30d', marginBottom: '16px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Popular in These Saharanpur Areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { area: 'Court Road', desc: 'Restaurants, sweet shops' },
                { area: 'Sadar Bazaar', desc: 'Market eateries, snacks' },
                { area: 'Railway Road', desc: 'Quick service, takeaway' },
                { area: 'Chilkana Road', desc: 'Industrial area canteens' },
                { area: 'Delhi Road', desc: 'Highway dhabas, restaurants' },
                { area: 'Behat Road', desc: 'Local restaurants, cafes' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#ecfccb', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#65a30d', marginBottom: '4px' }}>{item.area}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#ecfccb' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#65a30d', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;Our sweet shop handles hundreds of customers daily, especially during festivals. DineOpen&apos;s quick billing and inventory tracking helps us manage rush periods perfectly.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Rajesh Agarwal</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Agarwal Sweets, Court Road, Saharanpur</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available Nearby</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[{ name: 'Dehradun', href: '/pos/dehradun' }, { name: 'Meerut', href: '/pos/meerut' }, { name: 'Haridwar', href: '/pos/haridwar' }, { name: 'Muzaffarnagar', href: '/pos/muzaffarnagar' }].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#65a30d', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{city.name}</Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Ready to Grow Your Saharanpur Business?</h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>Join restaurants and shops across Saharanpur using DineOpen.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#65a30d', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
