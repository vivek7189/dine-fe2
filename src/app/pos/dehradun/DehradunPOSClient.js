'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCoffee, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaGraduationCap, FaMotorcycle, FaMountain } from 'react-icons/fa';

export default function DehradunPOSClient() {
  const cityFeatures = [
    { icon: <FaCoffee size={24} />, title: 'Cafe Culture Ready', description: 'Perfect for Dehradun\'s booming cafe scene. Quick billing, combo deals, and loyalty programs for regular customers.' },
    { icon: <FaGraduationCap size={24} />, title: 'Student-Friendly Features', description: 'Manage student discounts, meal subscriptions for hostel students, and budget combo meals for college crowds.' },
    { icon: <FaMotorcycle size={24} />, title: 'Delivery Integration', description: 'Connect with Zomato, Swiggy for Dehradun deliveries. Perfect for Rajpur Road and Clock Tower area restaurants.' },
    { icon: <FaMountain size={24} />, title: 'Tourist Season Ready', description: 'Handle weekend tourist rush from Delhi-NCR. Quick table turnover and QR ordering for faster service.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Dehradun, Uttarakhand - Gateway to Hills
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Restaurant POS for<br />Dehradun&apos;s Growing Food Scene</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              From Rajpur Road cafes to Clock Tower restaurants, DineOpen powers Dehradun&apos;s food businesses with affordable, feature-rich POS that handles students, tourists, and locals.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#2563eb', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>View Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#dbeafe', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Dehradun Restaurant Needs We Address</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {['Growing cafe culture on Rajpur Road', 'Student crowd from IIT, DU, colleges', 'Weekend tourist rush from Delhi-NCR', 'Competitive delivery market', 'Bakery & confectionery businesses', 'Multi-cuisine restaurants'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#2563eb', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Features for Dehradun Businesses</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: '16px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Popular in These Dehradun Areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                { area: 'Rajpur Road', desc: 'Premium cafes, fine dining, bakeries' },
                { area: 'Clock Tower', desc: 'Traditional restaurants, street food' },
                { area: 'Paltan Bazaar', desc: 'Quick service, local eateries' },
                { area: 'Race Course', desc: 'Family restaurants, cloud kitchens' },
                { area: 'Sahastradhara Road', desc: 'Tourist cafes, dhabas' },
                { area: 'ISBT Area', desc: 'Quick service, traveler food' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>{item.area}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#dbeafe' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#2563eb', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;Our cafe on Rajpur Road was struggling with weekend rushes. DineOpen&apos;s QR ordering lets customers order from their table. Our service speed improved 40% and we handle more covers now.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Aditya Rawat</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>The Coffee Culture, Rajpur Road, Dehradun</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available Nearby</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[{ name: 'Haridwar', href: '/pos/haridwar' }, { name: 'Rishikesh', href: '/pos/rishikesh' }, { name: 'Mussoorie', href: '/pos/mussoorie' }, { name: 'Noida', href: '/pos/noida' }, { name: 'Delhi', href: '/pos/delhi' }].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#2563eb', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{city.name}</Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Ready to Grow Your Dehradun Restaurant?</h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>Join 30+ restaurants in Dehradun using DineOpen.</p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#2563eb', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
