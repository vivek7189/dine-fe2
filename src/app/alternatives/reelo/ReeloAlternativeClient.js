'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import InternalLinks from '../../../components/InternalLinks';
import { FaCheck, FaTimes, FaGift, FaWhatsapp, FaRupeeSign } from 'react-icons/fa';

const comparisonData = [
  { feature: 'Loyalty & Rewards', dineopen: '✓ Included FREE', reelo: '✓ Core feature', winner: 'dineopen' },
  { feature: 'Monthly Price', dineopen: '₹999/mo (all-in-one)', reelo: '₹2,500+/mo (loyalty only)', winner: 'dineopen' },
  { feature: 'POS Billing System', dineopen: '✓ Included', reelo: '✗ Need separate POS', winner: 'dineopen' },
  { feature: 'WhatsApp Campaigns', dineopen: '✓ Included', reelo: '✓ Included', winner: 'tie' },
  { feature: 'AI Voice Ordering', dineopen: '✓ Included', reelo: '✗ Not available', winner: 'dineopen' },
  { feature: 'QR Code Menus', dineopen: '✓ Included', reelo: '✗ Not available', winner: 'dineopen' },
  { feature: 'Points System', dineopen: '✓', reelo: '✓', winner: 'tie' },
  { feature: 'Cashback Rewards', dineopen: '✓', reelo: '✓', winner: 'tie' },
  { feature: 'Birthday Rewards', dineopen: '✓', reelo: '✓', winner: 'tie' },
  { feature: 'Referral Program', dineopen: '✓', reelo: '✓', winner: 'tie' },
  { feature: 'Inventory Management', dineopen: '✓ Included', reelo: '✗ Not available', winner: 'dineopen' },
  { feature: 'Zomato/Swiggy Integration', dineopen: '✓ Included', reelo: '✓ Available', winner: 'tie' },
  { feature: 'Customer Analytics', dineopen: '✓', reelo: '✓', winner: 'tie' },
  { feature: 'SMS Campaigns', dineopen: '✓', reelo: '✓', winner: 'tie' },
  { feature: 'Free Trial', dineopen: '30 days', reelo: '14 days', winner: 'dineopen' },
];

export default function ReeloAlternativeClient() {
  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#fef3c7', color: '#92400e', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
              <FaGift /> Best Reelo Alternative
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#111827', marginBottom: '16px', lineHeight: 1.2 }}>
              Get <span style={{ color: '#7c3aed' }}>Reelo Features FREE</span><br />with DineOpen POS
            </h1>
            <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '32px' }}>
              Why pay ₹2,500+/month for just loyalty when DineOpen gives you loyalty, POS, AI ordering, QR menus, and inventory - all for ₹999/month?
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: '#7c3aed', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
                Start Free Trial →
              </Link>
              <Link href="/products/loyalty-rewards" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#7c3aed', border: '2px solid #7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>
                See Loyalty Features
              </Link>
            </div>
          </div>
        </section>

        {/* Cost Savings */}
        <section style={{ padding: '40px 20px', backgroundColor: '#ecfdf5' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#065f46', textAlign: 'center', marginBottom: '32px' }}>
              <FaRupeeSign style={{ marginRight: '8px' }} /> Your Annual Savings
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              <div style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>With Reelo + Separate POS</p>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '16px' }}>Reelo (₹2,500) + POS (₹1,500) = ₹4,000/mo</p>
                <p style={{ fontSize: '36px', fontWeight: '800', color: '#dc2626' }}>₹48,000/year</p>
              </div>
              <div style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', textAlign: 'center', border: '2px solid #10b981' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>With DineOpen (All-in-One)</p>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '16px' }}>POS + Loyalty + AI + QR = ₹999/mo</p>
                <p style={{ fontSize: '36px', fontWeight: '800', color: '#10b981' }}>₹11,988/year</p>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <p style={{ fontSize: '28px', fontWeight: '800', color: '#065f46' }}>Save ₹36,000+ per year!</p>
            </div>
          </div>
        </section>

        {/* Why Reelo Users Are Frustrated */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Common Frustrations with Reelo
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { issue: 'Need separate POS software', solution: 'DineOpen is an all-in-one: POS + Loyalty + Everything' },
                { issue: 'High monthly cost for just loyalty', solution: 'DineOpen includes loyalty FREE with POS' },
                { issue: 'No AI or voice ordering', solution: 'DineOpen has AI voice ordering in Hindi & English' },
                { issue: 'No QR menu/ordering system', solution: 'DineOpen includes QR menus and contactless ordering' },
                { issue: 'Multiple dashboards to manage', solution: 'Single unified dashboard for everything' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaTimes style={{ color: '#dc2626', flexShrink: 0 }} />
                    <span style={{ color: '#6b7280' }}>{item.issue}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaCheck style={{ color: '#10b981', flexShrink: 0 }} />
                    <span style={{ color: '#065f46', fontWeight: '500' }}>{item.solution}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Full Comparison */}
        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              DineOpen vs Reelo: Full Comparison
            </h2>
            <div style={{ backgroundColor: '#f9fafb', borderRadius: '16px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e5e7eb' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Feature</th>
                    <th style={{ padding: '16px', textAlign: 'center', backgroundColor: '#ede9fe', fontWeight: '600' }}>DineOpen</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Reelo</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500' }}>{row.feature}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px', backgroundColor: row.winner === 'dineopen' ? '#dcfce7' : row.winner === 'tie' ? '#ede9fe' : 'transparent', color: row.winner === 'dineopen' ? '#16a34a' : '#374151', fontWeight: row.winner === 'dineopen' ? '600' : '400' }}>
                        {row.dineopen}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                        {row.reelo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              What You Get with DineOpen (That Reelo Doesn&apos;t Offer)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                { title: 'Complete POS System', desc: 'Fast billing, GST invoices, payment processing - not just loyalty' },
                { title: 'AI Voice Ordering', desc: 'Take orders by voice in Hindi & English. Revolutionary technology.' },
                { title: 'QR Code Menus', desc: 'Contactless ordering from any table. Customers order themselves.' },
                { title: 'Inventory Management', desc: 'Track stock levels, get low-stock alerts, reduce wastage.' },
                { title: 'Kitchen Display (KDS)', desc: 'Send orders directly to kitchen screens. No paper tickets.' },
                { title: 'Zomato/Swiggy Integration', desc: 'Manage delivery orders in the same dashboard as dine-in.' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #7c3aed' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section style={{ padding: '60px 20px', backgroundColor: '#ede9fe' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '22px', color: '#5b21b6', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.6 }}>
              &quot;We were paying ₹4,000/month for Reelo + our old POS. Switched to DineOpen and now pay ₹999 for everything - loyalty, billing, inventory. The AI ordering is a bonus we didn&apos;t expect!&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Amit Patel</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Owner, Chai Point Cafe, Ahmedabad</p>
          </div>
        </section>

        {/* Migration */}
        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Easy Migration from Reelo
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
              Our team helps you migrate your customer data and loyalty points. No data lost, no downtime.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
              {[
                { step: '1', text: 'Export customer data from Reelo' },
                { step: '2', text: 'Import into DineOpen (we help)' },
                { step: '3', text: 'Set up your loyalty rules' },
                { step: '4', text: 'Go live same day!' },
              ].map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#7c3aed', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '700', margin: '0 auto 12px' }}>
                    {item.step}
                  </div>
                  <p style={{ fontSize: '14px', color: '#374151', maxWidth: '120px' }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Switch from Reelo?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Get loyalty + POS + AI + QR menus for less than what you pay for Reelo alone. Free 7-day trial.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial - No Credit Card →
            </Link>
            <p style={{ marginTop: '16px', opacity: 0.8, fontSize: '14px' }}>Join 500+ restaurants that switched from Reelo</p>
          </div>
        </section>
      </div>
      <InternalLinks currentPath="/alternatives/reelo" variant="alternative" />
      <Footer />
    </>
  );
}
