'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaStar, FaComments, FaBell, FaChartLine, FaThumbsUp, FaExclamationTriangle } from 'react-icons/fa';

export default function ImproveReviewsClient() {
  const strategies = [
    { icon: FaBell, title: 'Ask at the Right Time', desc: 'Request reviews when customers are happiest - right after a great meal, not days later.' },
    { icon: FaComments, title: 'Make It Easy', desc: 'QR codes on tables, links in receipts, WhatsApp follow-ups with direct review links.' },
    { icon: FaThumbsUp, title: 'Respond to Everything', desc: 'Thank positive reviewers, address concerns professionally. Shows you care.' },
    { icon: FaChartLine, title: 'Track and Improve', desc: 'Monitor trends, fix recurring complaints, celebrate improvements.' },
  ];

  const negativeResponse = [
    { dont: 'Get defensive or argue', do: 'Acknowledge their experience' },
    { dont: 'Ignore negative reviews', do: 'Respond within 24-48 hours' },
    { dont: 'Use generic templates', do: 'Personalize each response' },
    { dont: 'Make excuses', do: 'Offer to make it right offline' },
  ];

  const platforms = [
    { name: 'Google', importance: 'Critical - most searched', tip: 'Focus on Google first - highest visibility' },
    { name: 'Zomato', importance: 'Very High in India', tip: 'Detailed reviews affect discovery ranking' },
    { name: 'Swiggy', importance: 'High for delivery', tip: 'Ratings affect order placement' },
    { name: 'Instagram', importance: 'Social proof', tip: 'Repost customer photos and stories' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              {[1,2,3,4,5].map(i => <FaStar key={i} style={{ fontSize: '32px' }} />)}
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px' }}>Improve Your Restaurant Reviews</h1>
            <p style={{ fontSize: '20px', opacity: 0.95 }}>
              Turn happy customers into 5-star ambassadors. Handle critics like a pro.
            </p>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '40px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', textAlign: 'center' }}>
            {[
              { stat: '93%', label: 'of customers read reviews before dining' },
              { stat: '1 star', label: 'increase = 5-9% more revenue' },
              { stat: '40%', label: 'won&apos;t visit places with < 4 stars' },
            ].map((s, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#eab308' }}>{s.stat}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Proven Strategies</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              {strategies.map((s, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#fef9c3', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <s.icon style={{ fontSize: '22px', color: '#ca8a04' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>
              <FaExclamationTriangle style={{ color: '#dc2626', marginRight: '12px' }} />
              Handling Negative Reviews
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: '#fef2f2', padding: '24px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '16px' }}>❌ Don&apos;t</h4>
                {negativeResponse.map((r, idx) => (
                  <p key={idx} style={{ fontSize: '14px', color: '#991b1b', marginBottom: '8px' }}>• {r.dont}</p>
                ))}
              </div>
              <div style={{ backgroundColor: '#f0fdf4', padding: '24px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#16a34a', marginBottom: '16px' }}>✓ Do</h4>
                {negativeResponse.map((r, idx) => (
                  <p key={idx} style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>• {r.do}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Platform Priority</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {platforms.map((p, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 1fr', gap: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{p.name}</span>
                  <span style={{ fontSize: '14px', color: '#ca8a04', fontWeight: '500' }}>{p.importance}</span>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>{p.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Helpful Tools</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Review Response Generator', href: '/tools/review-response-generator', icon: '💬' },
                { name: 'Google Business Guide', href: '/resources/google-business-guide', icon: '📍' },
                { name: 'Customer Retention', href: '/loyalty/customer-retention', icon: '🤝' },
                { name: 'Loyalty Program', href: '/loyalty/restaurant-loyalty-program', icon: '⭐' },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#eab308', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Automate Review Collection</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>DineOpen automatically sends review requests to happy customers. Build your reputation on autopilot.</p>
            <Link href="/loyalty" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#ca8a04', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Learn More</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
