'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

export default function GoogleBusinessClient() {
  const steps = [
    { step: 1, title: 'Create/Claim Profile', desc: 'Visit business.google.com and add your restaurant or claim existing listing' },
    { step: 2, title: 'Verify Ownership', desc: 'Google sends postcard, call, or email to verify you own the business' },
    { step: 3, title: 'Complete All Details', desc: 'Add hours, phone, website, menu link, attributes' },
    { step: 4, title: 'Add Photos', desc: 'Upload high-quality photos of food, interior, exterior (minimum 10)' },
    { step: 5, title: 'Enable Features', desc: 'Turn on reservations, ordering, messaging' },
    { step: 6, title: 'Collect Reviews', desc: 'Ask happy customers to leave Google reviews' },
  ];

  const optimization = [
    { tip: 'Complete every field', desc: '100% complete profiles rank higher' },
    { tip: 'Add 20+ photos', desc: 'Restaurants with more photos get 42% more clicks' },
    { tip: 'Post weekly updates', desc: 'Share specials, events, new items' },
    { tip: 'Respond to all reviews', desc: 'Both positive and negative - shows you care' },
    { tip: 'Keep hours updated', desc: 'Especially for holidays and special occasions' },
    { tip: 'Use relevant attributes', desc: 'Outdoor seating, delivery, vegetarian options, etc.' },
  ];

  const benefits = [
    { stat: '46%', label: 'of all searches', desc: 'are looking for local businesses' },
    { stat: '76%', label: 'of people', desc: 'visit within 24 hours after local search' },
    { stat: '28%', label: 'of local searches', desc: 'result in a purchase' },
    { stat: 'FREE', label: 'marketing', desc: 'No cost to set up and maintain' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ fontSize: '48px' }}>📍</span>
            <h1 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Google My Business for Restaurants</h1>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              Get found when hungry customers search &quot;restaurants near me&quot;
            </p>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '50px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center' }}>
            {benefits.map((b, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '36px', fontWeight: '800', color: '#4285f4', marginBottom: '4px' }}>{b.stat}</p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{b.label}</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Setup Steps</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {steps.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#4285f4', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{s.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>💡 Optimization Tips</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {optimization.map((o, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e40af', marginBottom: '6px' }}>{o.tip}</p>
                  <p style={{ fontSize: '14px', color: '#3b82f6' }}>{o.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>What to Include in Your Profile</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>📝 Basic Info</h4>
                  <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: 2, paddingLeft: '20px' }}>
                    <li>Restaurant name (exact)</li>
                    <li>Full address</li>
                    <li>Phone number</li>
                    <li>Website URL</li>
                    <li>Operating hours</li>
                    <li>Category (Restaurant, Cafe, etc.)</li>
                  </ul>
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>📸 Photos to Add</h4>
                  <ul style={{ fontSize: '14px', color: '#6b7280', lineHeight: 2, paddingLeft: '20px' }}>
                    <li>Exterior/storefront</li>
                    <li>Interior/ambiance</li>
                    <li>Popular dishes</li>
                    <li>Menu (if no website)</li>
                    <li>Team/staff</li>
                    <li>Special events</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Guides</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Swiggy Registration', href: '/resources/swiggy-onboarding', icon: '🍔' },
                { name: 'Zomato Registration', href: '/resources/zomato-onboarding', icon: '🍽️' },
                { name: 'Improve Reviews', href: '/solutions/improve-reviews', icon: '⭐' },
                { name: 'Review Response Generator', href: '/tools/review-response-generator', icon: '💬' },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#4285f4', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Collect Reviews Automatically</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen sends automatic review requests to happy customers. Build your Google reputation effortlessly.</p>
            <Link href="/loyalty" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#4285f4', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Learn More</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
