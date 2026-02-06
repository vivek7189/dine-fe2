'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaBuilding, FaCheck, FaQuoteLeft, FaMapMarkerAlt, FaMotorcycle, FaLaptop, FaShoppingBag } from 'react-icons/fa';

export default function NoidaPOSClient() {
  const cityFeatures = [
    { icon: <FaMotorcycle size={24} />, title: 'Delivery-First Operations', description: 'Built for Noida\'s booming cloud kitchen scene. Manage Zomato, Swiggy, and direct orders from one dashboard.' },
    { icon: <FaLaptop size={24} />, title: 'Corporate & IT Park Ready', description: 'Subscription meals, corporate billing, employee discounts. Perfect for Sector 62, 63 IT park cafeterias.' },
    { icon: <FaShoppingBag size={24} />, title: 'Mall Food Court Support', description: 'High-speed billing for DLF Mall, Mall of India, GIP food courts. Handle rush hours efficiently.' },
    { icon: <FaBuilding size={24} />, title: 'Multi-Brand Management', description: 'Run multiple virtual brands from one kitchen. Separate menus, unified operations for cloud kitchens.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaMapMarkerAlt /> Noida & Greater Noida - NCR&apos;s Food Hub
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Restaurant POS for<br />Noida&apos;s Modern Food Business</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Cloud kitchens, IT park cafes, mall food courts - Noida&apos;s food scene is different. DineOpen is built for delivery-first, corporate-ready, high-volume operations.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>View Pricing</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: '#ede9fe', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>Noida&apos;s Unique F&B Challenges</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {['Heavy delivery orders from aggregators', 'Corporate lunch rush in IT sectors', 'Mall food court high-volume billing', 'Multi-brand cloud kitchen operations', 'Competition from 1000s of restaurants', 'Tech-savvy customer expectations'].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#7c3aed', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Built for Noida&apos;s Food Businesses</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              {cityFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#ede9fe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed', marginBottom: '16px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Serving These Noida Areas</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { area: 'Sector 18', desc: 'Atta Market, GIP Mall restaurants' },
                { area: 'Sector 62-63', desc: 'IT park cafes, corporate canteens' },
                { area: 'Sector 104-137', desc: 'Cloud kitchens, delivery hubs' },
                { area: 'Greater Noida', desc: 'University food courts, malls' },
                { area: 'Noida Expressway', desc: 'Premium dining, cafes' },
                { area: 'Sector 50-52', desc: 'Residential area restaurants' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '12px', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#7c3aed', marginBottom: '4px' }}>{item.area}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#ede9fe' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <FaQuoteLeft style={{ fontSize: '32px', color: '#7c3aed', marginBottom: '20px' }} />
            <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.7 }}>
              &quot;We run 3 virtual brands from our cloud kitchen in Sector 63. DineOpen lets us manage all brands separately while keeping operations unified. Aggregator orders flow smoothly.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Rahul Verma</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>CloudBites Kitchen, Sector 63, Noida</p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Also Available in NCR</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[{ name: 'Delhi', href: '/pos/delhi' }, { name: 'Gurgaon', href: '/pos/gurgaon' }, { name: 'Meerut', href: '/pos/meerut' }, { name: 'Ghaziabad', href: '/pos/ghaziabad' }].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#7c3aed', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>{city.name}</Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>Ready to Scale Your Noida Food Business?</h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>Join 100+ restaurants and cloud kitchens in Noida using DineOpen.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial →</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
