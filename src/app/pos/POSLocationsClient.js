'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaMapMarkerAlt, FaArrowRight, FaGlobe } from 'react-icons/fa';

export default function POSLocationsClient() {
  const majorCities = [
    { name: 'Mumbai', href: '/pos/mumbai', restaurants: '10,000+' },
    { name: 'Delhi', href: '/pos/delhi', restaurants: '8,000+' },
    { name: 'Bangalore', href: '/pos/bangalore', restaurants: '7,000+' },
    { name: 'Chennai', href: '/pos/chennai', restaurants: '5,000+' },
    { name: 'Hyderabad', href: '/pos/hyderabad', restaurants: '4,500+' },
    { name: 'Pune', href: '/pos/pune', restaurants: '4,000+' },
    { name: 'Kolkata', href: '/pos/kolkata', restaurants: '3,500+' },
    { name: 'Ahmedabad', href: '/pos/ahmedabad', restaurants: '3,000+' },
  ];

  const moreCities = [
    { name: 'Jaipur', href: '/pos/jaipur' },
    { name: 'Lucknow', href: '/pos/lucknow' },
    { name: 'Chandigarh', href: '/pos/chandigarh' },
    { name: 'Kochi', href: '/pos/kochi' },
    { name: 'Goa', href: '/pos/goa' },
    { name: 'Surat', href: '/pos/surat' },
    { name: 'Indore', href: '/pos/indore' },
    { name: 'Nagpur', href: '/pos/nagpur' },
    { name: 'Coimbatore', href: '/pos/coimbatore' },
    { name: 'Noida', href: '/pos/noida' },
    { name: 'Agra', href: '/pos/agra' },
    { name: 'Amritsar', href: '/pos/amritsar' },
    { name: 'Dehradun', href: '/pos/dehradun' },
    { name: 'Haridwar', href: '/pos/haridwar' },
    { name: 'Rishikesh', href: '/pos/rishikesh' },
    { name: 'Meerut', href: '/pos/meerut' },
    { name: 'Mussoorie', href: '/pos/mussoorie' },
    { name: 'Prayagraj', href: '/pos/prayagraj' },
    { name: 'Saharanpur', href: '/pos/saharanpur' },
    { name: 'Shimla', href: '/pos/shimla' },
  ];

  const international = [
    { name: 'USA', href: '/pos/usa', flag: '🇺🇸' },
    { name: 'UK', href: '/pos/uk', flag: '🇬🇧' },
    { name: 'UAE', href: '/pos/uae', flag: '🇦🇪' },
    { name: 'Singapore', href: '/pos/singapore', flag: '🇸🇬' },
    { name: 'Canada', href: '/pos/canada', flag: '🇨🇦' },
    { name: 'Australia', href: '/pos/australia', flag: '🇦🇺' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '24px' }}>
              <FaMapMarkerAlt />
              <span style={{ fontWeight: '600' }}>25+ Cities Worldwide</span>
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Restaurant POS Software in Your City
            </h1>
            <p style={{ fontSize: '22px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Local support, regional features, and city-specific integrations. Find DineOpen in your city.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '18px 36px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Major Cities */}
        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>🇮🇳</span>
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                Major Cities in India
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Trusted by thousands of restaurants in these cities
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {majorCities.map((city, idx) => (
                <Link key={idx} href={city.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px', backgroundColor: 'white', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{city.name}</div>
                    <div style={{ fontSize: '14px', color: '#ef4444', fontWeight: '500' }}>{city.restaurants} restaurants</div>
                  </div>
                  <FaArrowRight style={{ color: '#ef4444', fontSize: '18px' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* More Cities */}
        <div style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              More Cities in India
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              {moreCities.map((city, idx) => (
                <Link key={idx} href={city.href} style={{ display: 'block', padding: '16px 20px', backgroundColor: '#f9fafb', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb', textAlign: 'center', fontSize: '16px', fontWeight: '500', color: '#111827', transition: 'all 0.2s' }}>
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* International */}
        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <FaGlobe style={{ fontSize: '28px', color: '#ef4444' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                International Locations
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              DineOpen is available worldwide
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {international.map((country, idx) => (
                <Link key={idx} href={country.href} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', backgroundColor: 'white', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: '32px' }}>{country.flag}</span>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{country.name}</div>
                  <FaArrowRight style={{ color: '#ef4444', marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>
              Don&apos;t See Your City?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              DineOpen works everywhere. Contact us for local support in your area.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="https://dineopen.com/login"
                style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/india"
                style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
              >
                Explore India Hub
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
