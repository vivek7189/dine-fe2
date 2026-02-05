'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '₹999/month', competitor: '₹1,500+/month', winner: 'dineopen' },
  { feature: 'Transaction Fees', dineopen: '0%', competitor: '2-3%', winner: 'dineopen' },
  { feature: 'AI Voice Ordering', dineopen: '✓', competitor: '✗', winner: 'dineopen' },
  { feature: 'Platform Lock-in', dineopen: 'None - works with all', competitor: 'Zomato ecosystem', winner: 'dineopen' },
  { feature: 'Swiggy Integration', dineopen: '✓', competitor: 'Limited', winner: 'dineopen' },
  { feature: 'Multi-Location', dineopen: 'Unlimited (included)', competitor: 'Extra cost', winner: 'dineopen' },
  { feature: 'Offline Mode', dineopen: '✓', competitor: '✓', winner: 'tie' },
  { feature: 'QR Code Menus', dineopen: '✓', competitor: '✓', winner: 'tie' },
];

export default function ZomatoBaseAlternativeClient() {
  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#dc2626', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
              #1 Zomato Base Alternative
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              Looking for a <span style={{ color: '#ef4444' }}>Zomato Base Alternative</span>?
            </h1>
            <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '32px' }}>
              DineOpen works with ALL delivery platforms (not just Zomato), has AI voice ordering, and costs less with zero transaction fees.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
                Start Free Trial →
              </Link>
              <Link href="/compare" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', border: '2px solid #ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
                See Full Comparison
              </Link>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              DineOpen vs Zomato Base
            </h2>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e5e7eb' }}>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Feature</th>
                    <th style={{ padding: '16px', textAlign: 'center', backgroundColor: '#dcfce7' }}>DineOpen</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Zomato Base</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '16px', fontWeight: '500' }}>{row.feature}</td>
                      <td style={{ padding: '16px', textAlign: 'center', backgroundColor: row.winner === 'dineopen' ? '#dcfce7' : 'transparent', fontWeight: row.winner === 'dineopen' ? '600' : '400', color: row.winner === 'dineopen' ? '#16a34a' : '#374151' }}>
                        {row.dineopen}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>{row.competitor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Why Switch from Zomato Base?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                { title: 'No Platform Lock-in', desc: 'DineOpen works with Zomato, Swiggy, and any other platform. You\'re not restricted to one ecosystem.' },
                { title: 'AI Voice Ordering', desc: 'Revolutionary AI that takes orders via voice. Zomato Base doesn\'t offer this technology.' },
                { title: 'Lower Total Cost', desc: 'No transaction fees means you save ₹50,000+ per year compared to Zomato Base.' },
                { title: 'True Multi-Platform', desc: 'Manage Zomato AND Swiggy AND dine-in from one dashboard without extra fees.' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#ef4444', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Ready to Switch?</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
              Start your free 30-day trial. Import your menu in minutes. Keep using Zomato delivery.
            </p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '16px 40px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
