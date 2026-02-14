'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaMountain, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaGlobe, FaCoffee, FaHotel } from 'react-icons/fa';

export default function MussooriePOSClient() {
  const cityFeatures = [
    { icon: <FaMountain size={24} />, title: 'Valley View Cafe Ready', description: 'Manage rooftop cafes with valley views. Premium seating charges, sunset timing rush, perfect for Mall Road cafes.' },
    { icon: <FaGlobe size={24} />, title: 'Tourist Multi-Language', description: 'QR menus in English, Hindi for domestic tourists. Handle peak season rush from Delhi-NCR weekend visitors.' },
    { icon: <FaCoffee size={24} />, title: 'Cafe & Bakery Focused', description: 'Mussoorie is known for cafes and bakeries. Quick billing for pastries, Maggi points, and chai spots on Mall Road.' },
    { icon: <FaHotel size={24} />, title: 'Hotel Restaurant Ready', description: 'Room service integration, resort billing, honeymoon package meals. Perfect for Mussoorie\'s hospitality industry.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Mussoorie - Queen of Hills
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Restaurant POS for<br />Mussoorie&apos;s Hill Station Cafes</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              From Mall Road cafes to Kempty Falls eateries, DineOpen helps Mussoorie&apos;s tourism-driven food businesses handle seasonal rush, tourist crowds, and scenic dining experiences.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#0d9488', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>View Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#ccfbf1', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Mussoorie&apos;s Tourism Restaurant Needs</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {['Peak season weekend rush', 'Mall Road cafe high footfall', 'Hotel room service integration', 'Maggi point quick billing', 'Valley view premium seating', 'Honeymoon couple packages'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#0d9488', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Built for Mussoorie Cafes & Restaurants</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#ccfbf1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0d9488', marginBottom: '16px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Popular in These Mussoorie Areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { area: 'Mall Road', desc: 'Cafes, restaurants, bakeries' },
                { area: 'Kempty Falls', desc: 'Tourist eateries, Maggi points' },
                { area: 'Library Chowk', desc: 'Heritage cafes, fine dining' },
                { area: 'Landour', desc: 'Boutique cafes, bakeries' },
                { area: 'Picture Palace', desc: 'Fast food, tourist spots' },
                { area: 'Company Garden', desc: 'Garden cafes, snack shops' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#ccfbf1', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#0d9488', marginBottom: '4px' }}>{item.area}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#ccfbf1' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#0d9488', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;Our Mall Road cafe gets packed every weekend with Delhi tourists. DineOpen&apos;s quick billing and table management helps us serve more customers. The seasonal reporting is perfect for planning.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Vikram Rawat</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Mountain View Cafe, Mall Road, Mussoorie</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available in Uttarakhand</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[{ name: 'Dehradun', href: '/pos/dehradun' }, { name: 'Rishikesh', href: '/pos/rishikesh' }, { name: 'Haridwar', href: '/pos/haridwar' }, { name: 'Nainital', href: '/pos/nainital' }].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#0d9488', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{city.name}</Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Ready to Serve More Tourists?</h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>Join cafes across Mussoorie using DineOpen.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#0d9488', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
