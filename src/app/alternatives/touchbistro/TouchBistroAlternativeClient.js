'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import { FaCloud, FaMobileAlt, FaMicrophone, FaGlobe, FaArrowRight } from 'react-icons/fa';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '$10/month', competitor: '$69-399/month', winner: 'dineopen' },
  { feature: 'System Type', dineopen: 'Cloud-based', competitor: 'Local server + Cloud', winner: 'dineopen' },
  { feature: 'AI Voice Ordering', dineopen: '✓', competitor: '✗', winner: 'dineopen' },
  { feature: 'Device Requirement', dineopen: 'Any device', competitor: 'iPad only', winner: 'dineopen' },
  { feature: 'QR Code Menus', dineopen: '✓ Included', competitor: '✓ Extra module', winner: 'dineopen' },
  { feature: 'Kitchen Display (KDS)', dineopen: '✓ Included', competitor: '✓ Extra $19/month', winner: 'dineopen' },
  { feature: 'Online Ordering', dineopen: '✓ Included', competitor: '✓ Extra $50/month', winner: 'dineopen' },
  { feature: 'Reservations', dineopen: '✓ Included', competitor: '✓ Extra $229/month', winner: 'dineopen' },
  { feature: 'Offline Mode', dineopen: '✓', competitor: '✓', winner: 'tie' },
  { feature: 'Contract Length', dineopen: 'Month-to-month', competitor: '1-2 year contract', winner: 'dineopen' },
];

export default function TouchBistroAlternativeClient() {
  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', marginBottom: '24px' }}>
              #1 TouchBistro Alternative
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Looking for a <span style={{ color: '#fcd34d' }}>TouchBistro Alternative</span>?
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              DineOpen is 100% cloud-based, works on any device (not just iPads), and includes AI voice ordering. All for 75% less than TouchBistro.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#0891b2', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Start Free Trial <FaArrowRight style={{ marginLeft: '8px' }} />
              </Link>
              <Link href="/compare" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                See Full Comparison
              </Link>
            </div>
          </div>
        </section>

        {/* Savings */}
        <section style={{ backgroundColor: '#ecfdf5', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Your Potential Savings vs TouchBistro</h2>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>TouchBistro with KDS, Online Ordering & Reservations:</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '24px' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>TouchBistro Total</p>
                  <p style={{ fontSize: '32px', fontWeight: '800', color: '#dc2626' }}>$4,548/year</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>($69 + $19 + $50 + $229/month)</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>DineOpen (All Included)</p>
                  <p style={{ fontSize: '32px', fontWeight: '800', color: '#059669' }}>$120/year</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>($10/month, everything included)</p>
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#d1fae5', borderRadius: '8px' }}>
                <p style={{ fontSize: '24px', fontWeight: '800', color: '#065f46' }}>Save $4,428+ per year!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              DineOpen vs TouchBistro: Feature Comparison
            </h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Feature</th>
                    <th style={{ padding: '16px', textAlign: 'center', backgroundColor: '#cffafe', fontWeight: '600' }}>DineOpen</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>TouchBistro</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '500' }}>{row.feature}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', backgroundColor: row.winner === 'dineopen' ? '#ecfeff' : 'transparent', color: row.winner === 'dineopen' ? '#0891b2' : '#374151', fontWeight: row.winner === 'dineopen' ? '600' : '400' }}>
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
              Why Restaurants Switch from TouchBistro to DineOpen
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaCloud size={32} style={{ color: '#0891b2', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>100% Cloud-Based</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>TouchBistro needs local servers. DineOpen is fully cloud - access from anywhere, no server maintenance.</p>
              </div>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaMobileAlt size={32} style={{ color: '#0891b2', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Works on Any Device</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>TouchBistro requires iPads. DineOpen works on any phone, tablet, or computer. Use what you have.</p>
              </div>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaMicrophone size={32} style={{ color: '#0891b2', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>AI Voice Ordering</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>Take orders hands-free with AI in multiple languages. TouchBistro doesn&apos;t have this feature.</p>
              </div>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaGlobe size={32} style={{ color: '#0891b2', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>All Features Included</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>TouchBistro charges extra for KDS, online ordering, reservations. DineOpen includes everything.</p>
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
                { name: 'Lightspeed Alternative', href: '/alternatives/lightspeed' },
                { name: 'POSist Alternative', href: '/alternatives/posist' },
                { name: 'Clover Alternative', href: '/alternatives/clover' },
                { name: 'Compare All POS', href: '/compare' },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{ padding: '12px 24px', backgroundColor: 'white', borderRadius: '8px', color: '#0891b2', textDecoration: 'none', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Switch from TouchBistro?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Start your free 7-day trial. No credit card required. No contracts.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#0891b2', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial - No Credit Card →
            </Link>
          </div>
        </section>
      </div>
      <InternalLinks currentPath="/alternatives/touchbistro" variant="alternative" />
      <Footer />
    </>
  );
}
