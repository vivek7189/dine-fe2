'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheck, FaTimes, FaArrowRight, FaDollarSign, FaMicrophone, FaGlobe, FaStore } from 'react-icons/fa';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '$10/month', competitor: '$69-299/month', winner: 'dineopen' },
  { feature: 'Transaction Fees', dineopen: '0%', competitor: '2.6% + 10¢', winner: 'dineopen' },
  { feature: 'AI Voice Ordering', dineopen: '✓', competitor: '✗', winner: 'dineopen' },
  { feature: 'QR Code Menus', dineopen: '✓ Free', competitor: '✓ Extra cost', winner: 'dineopen' },
  { feature: 'Multi-Location', dineopen: 'Unlimited ($10/outlet)', competitor: 'Per location pricing', winner: 'dineopen' },
  { feature: 'Kitchen Display (KDS)', dineopen: '✓ Included', competitor: '✓ Extra module', winner: 'dineopen' },
  { feature: 'Inventory Management', dineopen: '✓ Included', competitor: '✓ Included', winner: 'tie' },
  { feature: 'Delivery Integration', dineopen: '✓ Free', competitor: '✓ Available', winner: 'tie' },
  { feature: 'Hardware Required', dineopen: 'No (any device)', competitor: 'iPad required', winner: 'dineopen' },
  { feature: 'Contract', dineopen: 'Month-to-month', competitor: 'Annual contract', winner: 'dineopen' },
];

export default function LightspeedAlternativeClient() {
  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', marginBottom: '24px' }}>
              #1 Lightspeed Restaurant Alternative
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Looking for a <span style={{ color: '#fcd34d' }}>Lightspeed Alternative</span>?
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              DineOpen gives you everything Lightspeed offers plus AI voice ordering at 70% lower cost. No annual contracts, no expensive hardware required.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#4f46e5', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Start Free Trial <FaArrowRight style={{ marginLeft: '8px' }} />
              </Link>
              <Link href="/compare" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                See Full Comparison
              </Link>
            </div>
          </div>
        </section>

        {/* Savings Calculator */}
        <section style={{ backgroundColor: '#ecfdf5', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Your Potential Savings vs Lightspeed</h2>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>Based on a single-location restaurant:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '24px' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>Lightspeed Restaurant Pro</p>
                  <p style={{ fontSize: '32px', fontWeight: '800', color: '#dc2626' }}>$3,588/year</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>($299/month)</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>DineOpen Complete</p>
                  <p style={{ fontSize: '32px', fontWeight: '800', color: '#059669' }}>$120/year</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>($10/month)</p>
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                <p style={{ fontSize: '24px', fontWeight: '800', color: '#065f46' }}>Save $3,468+ per year!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              DineOpen vs Lightspeed: Feature Comparison
            </h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Feature</th>
                    <th style={{ padding: '16px', textAlign: 'center', backgroundColor: '#d1fae5', fontWeight: '600' }}>DineOpen</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Lightspeed</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '500' }}>{row.feature}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', backgroundColor: row.winner === 'dineopen' ? '#ecfdf5' : 'transparent', color: row.winner === 'dineopen' ? '#059669' : '#374151', fontWeight: row.winner === 'dineopen' ? '600' : '400' }}>
                        {row.dineopen}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#6b7280' }}>
                        {row.competitor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why Switch */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Why Restaurants Switch from Lightspeed to DineOpen
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaDollarSign size={32} style={{ color: '#059669', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>70% Lower Cost</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>Lightspeed costs $69-299/month. DineOpen is just $10/month with all features included. No hidden fees.</p>
              </div>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaMicrophone size={32} style={{ color: '#4f46e5', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>AI Voice Ordering</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>Take orders hands-free with AI in multiple languages. Lightspeed doesn&apos;t offer this feature at any price.</p>
              </div>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaGlobe size={32} style={{ color: '#ef4444', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>No Hardware Lock-in</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>Works on any device - phone, tablet, or computer. No need to buy expensive iPad hardware.</p>
              </div>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaStore size={32} style={{ color: '#f59e0b', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Unlimited Locations</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>Add unlimited restaurant locations at just $10/outlet. Lightspeed charges per-location fees.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              Compare DineOpen with Other POS Systems
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              {[
                { name: 'Square Alternative', href: '/alternatives/square' },
                { name: 'Toast Alternative', href: '/alternatives/toast' },
                { name: 'TouchBistro Alternative', href: '/alternatives/touchbistro' },
                { name: 'POSist Alternative', href: '/alternatives/posist' },
                { name: 'Petpooja Alternative', href: '/alternatives/petpooja' },
                { name: 'Compare All POS', href: '/compare' },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{ padding: '12px 24px', backgroundColor: 'white', borderRadius: '8px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Switch from Lightspeed?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Start your free 30-day trial. No credit card required. Import your menu in minutes.
            </p>
            <Link
              href="https://app.dineopen.com/register"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#4f46e5', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial - No Credit Card →
            </Link>
            <p style={{ marginTop: '16px', opacity: 0.8, fontSize: '14px' }}>Join 500+ restaurants that switched from Lightspeed</p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
