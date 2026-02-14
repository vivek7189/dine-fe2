'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaCheck, FaMapMarkerAlt, FaCity, FaUtensils, FaArrowRight, FaQuoteLeft } from 'react-icons/fa';

export default function StatePOSClient({ stateData }) {
  const {
    state,
    tagline,
    description,
    highlights,
    cities,
    industries,
    testimonial,
    localFeatures,
    compliance,
  } = stateData;

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
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '70px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              <FaMapMarkerAlt />
              <span>{state}, India</span>
            </div>
            <h1 style={{ fontSize: '44px', fontWeight: '800', marginBottom: '16px' }}>
              Restaurant POS Software in {state}
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '12px' }}>
              {tagline}
            </p>
            <p style={{ fontSize: '16px', opacity: 0.85, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
              {description}
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="https://dineopen.com/login"
                style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
              >
                View Pricing
              </Link>
            </div>
            <p style={{ marginTop: '16px', opacity: 0.8 }}>Starting at ₹999/month • No credit card required</p>
          </div>
        </div>

        {/* Highlights */}
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
            Why {state} Restaurants Choose DineOpen
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {highlights.map((highlight, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FaCheck style={{ color: '#059669' }} />
                </div>
                <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cities in State */}
        <div style={{ backgroundColor: 'white', padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
              <FaCity style={{ fontSize: '24px', color: '#ef4444' }} />
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                Cities in {state}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {cities.map((city, idx) => (
                <Link key={idx} href={city.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>{city.name}</div>
                    <div style={{ fontSize: '13px', color: '#ef4444' }}>{city.restaurants}</div>
                  </div>
                  <FaArrowRight style={{ color: '#9ca3af' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Local Features */}
        {localFeatures && (
          <div style={{ padding: '60px 20px', backgroundColor: '#fef2f2' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
                Features for {state} Restaurants
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {localFeatures.map((feature, idx) => (
                  <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Industries */}
        <div style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '40px' }}>
              <FaUtensils style={{ fontSize: '24px', color: '#ef4444' }} />
              <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827' }}>
                Popular Restaurant Types in {state}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {industries.map((ind, idx) => (
                <Link key={idx} href={ind.href} style={{ display: 'block', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{ind.name}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>{ind.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonial */}
        {testimonial && (
          <div style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
            <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
              <FaQuoteLeft style={{ fontSize: '32px', color: '#ef4444', marginBottom: '20px' }} />
              <p style={{ fontSize: '20px', color: '#374151', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.6 }}>
                &quot;{testimonial.quote}&quot;
              </p>
              <div>
                <p style={{ fontWeight: '700', color: '#111827' }}>{testimonial.author}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{testimonial.business}</p>
              </div>
            </div>
          </div>
        )}

        {/* Compliance */}
        {compliance && (
          <div style={{ padding: '60px 20px', backgroundColor: 'white' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
                Compliance Resources for {state}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                {compliance.map((item, idx) => (
                  <Link key={idx} href={item.href} style={{ padding: '12px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', color: '#374151', textDecoration: 'none', fontSize: '14px', border: '1px solid #e5e7eb' }}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other States */}
        <div style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              DineOpen Available Across India
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
              {[
                { name: 'Maharashtra', href: '/india/maharashtra' },
                { name: 'Karnataka', href: '/india/karnataka' },
                { name: 'Tamil Nadu', href: '/india/tamil-nadu' },
                { name: 'Delhi NCR', href: '/india/delhi-ncr' },
                { name: 'Gujarat', href: '/india/gujarat' },
              ].map((s) => (
                <Link key={s.href} href={s.href} style={{ padding: '10px 20px', backgroundColor: 'white', borderRadius: '20px', color: '#ef4444', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                  {s.name}
                </Link>
              ))}
            </div>
            <Link href="/india" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>
              View All India →
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Transform Your {state} Restaurant?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
              Join thousands of restaurants in {state} using DineOpen. Free 30-day trial.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '16px 40px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
