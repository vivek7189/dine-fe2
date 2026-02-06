'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaRupeeSign, FaMicrophone, FaHeadset, FaStore, FaArrowRight } from 'react-icons/fa';

const comparisonData = [
  { feature: 'Monthly Price', dineopen: '₹999/month', competitor: '₹2,500-5,000/month', winner: 'dineopen' },
  { feature: 'Setup Fee', dineopen: '₹0', competitor: '₹15,000-50,000', winner: 'dineopen' },
  { feature: 'AI Voice Ordering', dineopen: '✓', competitor: '✗', winner: 'dineopen' },
  { feature: 'Multi-language Support', dineopen: '10+ Indian languages', competitor: 'Limited', winner: 'dineopen' },
  { feature: 'QR Code Menus', dineopen: '✓ Included', competitor: '✓ Included', winner: 'tie' },
  { feature: 'Kitchen Display (KDS)', dineopen: '✓ Included', competitor: '✓ Extra cost', winner: 'dineopen' },
  { feature: 'Zomato/Swiggy Integration', dineopen: '✓ Free', competitor: '✓ Available', winner: 'tie' },
  { feature: 'Multi-Outlet Support', dineopen: '₹999/outlet', competitor: 'Custom pricing', winner: 'dineopen' },
  { feature: 'Contract', dineopen: 'Month-to-month', competitor: 'Annual contract', winner: 'dineopen' },
  { feature: 'Customer Support', dineopen: '24/7 WhatsApp', competitor: 'Business hours', winner: 'dineopen' },
];

export default function POSistAlternativeClient() {
  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero Section */}
        <section style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '20px', fontSize: '14px', marginBottom: '24px' }}>
              #1 POSist Alternative in India
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Looking for a <span style={{ color: '#fcd34d' }}>POSist Alternative</span>?
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              DineOpen offers everything POSist does plus AI voice ordering in Indian languages. 60% lower cost, no setup fees, no annual contracts.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ea580c', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Start Free Trial <FaArrowRight style={{ marginLeft: '8px' }} />
              </Link>
              <Link href="/compare" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                See Full Comparison
              </Link>
            </div>
          </div>
        </section>

        {/* Savings */}
        <section style={{ backgroundColor: '#fff7ed', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>Your Potential Savings vs POSist</h2>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>First year cost comparison (single outlet):</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '24px' }}>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>POSist (with setup)</p>
                  <p style={{ fontSize: '32px', fontWeight: '800', color: '#dc2626' }}>₹80,000+/year</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>(₹30K setup + ₹4K/month)</p>
                </div>
                <div>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>DineOpen</p>
                  <p style={{ fontSize: '32px', fontWeight: '800', color: '#059669' }}>₹11,988/year</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>(₹0 setup + ₹999/month)</p>
                </div>
              </div>
              <div style={{ padding: '16px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                <p style={{ fontSize: '24px', fontWeight: '800', color: '#166534' }}>Save ₹68,000+ in first year!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              DineOpen vs POSist: Feature Comparison
            </h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Feature</th>
                    <th style={{ padding: '16px', textAlign: 'center', backgroundColor: '#ffedd5', fontWeight: '600' }}>DineOpen</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>POSist</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '500' }}>{row.feature}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', backgroundColor: row.winner === 'dineopen' ? '#fff7ed' : 'transparent', color: row.winner === 'dineopen' ? '#ea580c' : '#374151', fontWeight: row.winner === 'dineopen' ? '600' : '400' }}>
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
              Why Indian Restaurants Switch from POSist to DineOpen
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaRupeeSign size={32} style={{ color: '#ea580c', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>60% Lower Cost</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>POSist charges ₹2,500-5,000/month plus setup fees. DineOpen is ₹999/month with zero setup cost.</p>
              </div>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaMicrophone size={32} style={{ color: '#ea580c', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>AI Voice in Indian Languages</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>Take orders by voice in Hindi, Tamil, Telugu, Bengali, Marathi & more. POSist doesn&apos;t have this.</p>
              </div>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaHeadset size={32} style={{ color: '#ea580c', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>24/7 WhatsApp Support</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>Get help anytime via WhatsApp. POSist support is limited to business hours.</p>
              </div>
              <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                <FaStore size={32} style={{ color: '#ea580c', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Transparent Multi-Outlet Pricing</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.7 }}>₹999/outlet/month for chains. POSist has complex custom pricing that&apos;s hard to predict.</p>
              </div>
            </div>
          </div>
        </section>

        {/* City-specific links */}
        <section style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              DineOpen POS Available Across India
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
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
              ].map((city) => (
                <Link key={city.href} href={city.href} style={{ padding: '8px 16px', backgroundColor: 'white', borderRadius: '20px', color: '#ea580c', textDecoration: 'none', fontWeight: '500', fontSize: '14px' }}>
                  {city.name}
                </Link>
              ))}
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '24px' }}>
              Compare with Other POS Systems
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
              {[
                { name: 'Petpooja Alternative', href: '/alternatives/petpooja' },
                { name: 'Square Alternative', href: '/alternatives/square' },
                { name: 'Toast Alternative', href: '/alternatives/toast' },
                { name: 'Compare All POS', href: '/compare' },
              ].map((link) => (
                <Link key={link.href} href={link.href} style={{ padding: '12px 24px', backgroundColor: 'white', borderRadius: '8px', color: '#ea580c', textDecoration: 'none', fontWeight: '600', fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Switch from POSist?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Start your free 30-day trial. No credit card. No setup fee. No annual contract.
            </p>
            <Link
              href="https://app.dineopen.com/register"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#ea580c', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
