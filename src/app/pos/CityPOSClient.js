'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import InternalLinks from '../../components/InternalLinks';
import Breadcrumb from '../../components/Breadcrumb';
import { FaCheck, FaMapMarkerAlt, FaStar, FaQuoteLeft } from 'react-icons/fa';

export default function CityPOSClient({ cityData }) {
  const {
    city,
    state,
    country,
    currency,
    price,
    highlights,
    restaurants,
    testimonial,
    localKeywords,
  } = cityData;

  const features = [
    { title: 'AI Voice Ordering', desc: 'Take orders by voice in local languages' },
    { title: 'QR Code Menus', desc: 'Contactless digital menus for every table' },
    { title: 'POS Billing', desc: 'Fast, accurate billing with tax compliance' },
    { title: 'Inventory Management', desc: 'Track stock levels in real-time' },
    { title: 'Delivery Integration', desc: 'Connect with Zomato, Swiggy & more' },
    { title: 'Analytics & Reports', desc: 'Understand your business performance' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Locations', href: '/pos/mumbai' },
          { label: `POS in ${city}` },
        ]} />
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaMapMarkerAlt />
              <span>{city}, {state}, {country}</span>
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '16px' }}>
              Best Restaurant POS in {city}
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Trusted by {restaurants} restaurants in {city}. AI-powered billing, QR menus, and delivery integrations.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="https://dineopen.com/login"
                style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
              >
                Start Free Trial →
              </Link>
              <Link
                href="/pricing"
                style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
              >
                View Pricing
              </Link>
            </div>
            <p style={{ marginTop: '16px', opacity: 0.8 }}>Starting at {currency}{price}/month • No credit card required</p>
          </div>
        </div>

        {/* Highlights */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
            Why {city} Restaurants Choose DineOpen
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {highlights.map((highlight, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FaCheck style={{ color: '#059669' }} />
                </div>
                <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ backgroundColor: 'white', padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Complete Restaurant Management for {city}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial */}
        {testimonial && (
          <div style={{ padding: '60px 20px', backgroundColor: '#fef2f2' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
              <FaQuoteLeft style={{ fontSize: '32px', color: '#ef4444', marginBottom: '20px' }} />
              <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.6 }}>
                &quot;{testimonial.quote}&quot;
              </p>
              <div>
                <p style={{ fontWeight: '700', color: '#111827' }}>{testimonial.author}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{testimonial.business}, {city}</p>
              </div>
            </div>
          </div>
        )}

        {/* Local Areas */}
        <div style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              Serving Restaurants Across {city}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {localKeywords.map((area, idx) => (
                <span key={idx} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', fontSize: '14px', color: '#374151', border: '1px solid #e5e7eb' }}>
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Other Cities */}
        <div style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              DineOpen Restaurant POS Available In
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
              {[
                { name: 'Mumbai', href: '/pos/mumbai' },
                { name: 'Delhi', href: '/pos/delhi' },
                { name: 'Bangalore', href: '/pos/bangalore' },
                { name: 'Chennai', href: '/pos/chennai' },
                { name: 'Hyderabad', href: '/pos/hyderabad' },
                { name: 'Pune', href: '/pos/pune' },
                { name: 'Kolkata', href: '/pos/kolkata' },
                { name: 'Ahmedabad', href: '/pos/ahmedabad' },
                { name: 'Jaipur', href: '/pos/jaipur' },
                { name: 'Lucknow', href: '/pos/lucknow' },
                { name: 'Chandigarh', href: '/pos/chandigarh' },
                { name: 'Kochi', href: '/pos/kochi' },
                { name: 'Goa', href: '/pos/goa' },
              ].map((c) => (
                <Link key={c.href} href={c.href} style={{ padding: '8px 16px', backgroundColor: 'white', borderRadius: '20px', color: '#ef4444', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                  {c.name}
                </Link>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {[
                { name: 'USA', href: '/pos/usa' },
                { name: 'UK', href: '/pos/uk' },
                { name: 'UAE', href: '/pos/uae' },
                { name: 'Singapore', href: '/pos/singapore' },
                { name: 'Canada', href: '/pos/canada' },
                { name: 'Australia', href: '/pos/australia' },
              ].map((c) => (
                <Link key={c.href} href={c.href} style={{ padding: '8px 16px', backgroundColor: '#ef4444', borderRadius: '20px', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Transform Your {city} Restaurant?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
              Join {restaurants} restaurants in {city} using DineOpen. Free 30-day trial.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '16px 40px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial →
            </Link>
          </div>
        </div>
      </div>
      <InternalLinks currentPath={`/pos/${city.toLowerCase().replace(/\s+/g, '-')}`} variant="city" />
      <Footer />
    </>
  );
}
