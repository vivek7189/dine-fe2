'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '$10/month', competitor: '$14.95+/month', winner: 'dineopen' },
  { feature: 'Transaction Fees', dineopen: '0%', competitor: '2.3-3.5%', winner: 'dineopen' },
  { feature: 'AI Voice Ordering', dineopen: '✓', competitor: '✗', winner: 'dineopen' },
  { feature: 'Hardware Required', dineopen: 'No - any device', competitor: 'Clover hardware only', winner: 'dineopen' },
  { feature: 'Contract Length', dineopen: 'Month-to-month', competitor: 'Often 3+ years', winner: 'dineopen' },
  { feature: 'QR Code Menus', dineopen: '✓', competitor: 'Add-on cost', winner: 'dineopen' },
  { feature: 'Multi-Location', dineopen: 'Unlimited (included)', competitor: 'Extra per location', winner: 'dineopen' },
  { feature: 'Kitchen Display', dineopen: '✓ (included)', competitor: '✓', winner: 'tie' },
];

export default function CloverAlternativeClient() {
  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
              #1 Clover Alternative
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              Looking for a <span style={{ color: '#1d4ed8' }}>Clover Alternative</span>?
            </h1>
            <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '32px' }}>
              DineOpen works on ANY device (no expensive Clover hardware), has AI voice ordering, and costs less with zero transaction fees and no long-term contracts.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: '#1d4ed8', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
                Start Free Trial →
              </Link>
              <Link href="/compare" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#1d4ed8', border: '2px solid #1d4ed8', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
                See Full Comparison
              </Link>
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px', backgroundColor: '#fef3c7' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#92400e', marginBottom: '16px' }}>Tired of Clover&apos;s Hardware Lock-in?</h2>
            <p style={{ color: '#a16207' }}>
              Clover requires expensive proprietary hardware. DineOpen runs on any phone, tablet, or computer you already own. Save thousands on hardware costs.
            </p>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              DineOpen vs Clover
            </h2>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e5e7eb' }}>
                    <th style={{ padding: '16px', textAlign: 'left' }}>Feature</th>
                    <th style={{ padding: '16px', textAlign: 'center', backgroundColor: '#dcfce7' }}>DineOpen</th>
                    <th style={{ padding: '16px', textAlign: 'center' }}>Clover</th>
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
              Why Switch from Clover?
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                { title: 'No Hardware Lock-in', desc: 'Use any phone, tablet, or computer. No need to buy expensive Clover terminals.' },
                { title: 'AI Voice Ordering', desc: 'Revolutionary AI that takes orders via voice. Clover doesn\'t offer this technology.' },
                { title: 'No Long Contracts', desc: 'Month-to-month billing. Cancel anytime. No 3-year commitments like Clover.' },
                { title: 'Zero Transaction Fees', desc: 'Keep more of your revenue. Clover charges 2.3-3.5% per transaction.' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#1d4ed8', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Ready to Switch from Clover?</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>
              Start your free 7-day trial. No hardware to buy. No long-term contracts.
            </p>
            <Link href="https://dineopen.com/login" style={{ display: 'inline-block', padding: '16px 40px', backgroundColor: 'white', color: '#1d4ed8', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <InternalLinks currentPath="/alternatives/clover" variant="alternative" />
      <Footer />
    </>
  );
}
