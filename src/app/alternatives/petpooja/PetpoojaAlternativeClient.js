'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Breadcrumb from '../../../components/Breadcrumb';
import InternalLinks from '../../../components/InternalLinks';
import { useState } from 'react';

const comparisonData = [
  { category: 'Pricing & Fees', features: [
    { feature: 'Starting Price', dineopen: '₹300/month ($9.99)', petpooja: '₹1,000+/month (custom quote)', winner: 'dineopen' },
    { feature: 'Transaction Fees', dineopen: '0% — zero transaction fees', petpooja: '1.5-2% per transaction', winner: 'dineopen' },
    { feature: 'Pricing Transparency', dineopen: 'Published on website', petpooja: 'Contact sales for quote', winner: 'dineopen' },
    { feature: 'Free Trial', dineopen: '7 days, no credit card', petpooja: '14 days', winner: 'dineopen' },
    { feature: 'Add-on Costs', dineopen: 'All features included', petpooja: 'Inventory, CRM, online ordering cost extra', winner: 'dineopen' },
    { feature: 'Hardware Required', dineopen: 'Works on any device (phone/tablet/laptop)', petpooja: 'Often requires proprietary hardware', winner: 'dineopen' },
  ]},
  { category: 'Core Features', features: [
    { feature: 'Cloud-Based POS', dineopen: 'Yes — access from anywhere', petpooja: 'Yes', winner: 'tie' },
    { feature: 'GST Billing', dineopen: 'Full CGST/SGST/IGST compliance', petpooja: 'Full GST support', winner: 'tie' },
    { feature: 'KOT (Kitchen Orders)', dineopen: 'Digital KOT included', petpooja: 'Included', winner: 'tie' },
    { feature: 'Menu Management', dineopen: 'AI-powered menu extraction from photos', petpooja: 'Manual menu setup', winner: 'dineopen' },
    { feature: 'Inventory Management', dineopen: 'Included in all plans', petpooja: 'Paid add-on module', winner: 'dineopen' },
    { feature: 'Multi-Location Support', dineopen: 'Unlimited locations (Blaze plan)', petpooja: 'Extra cost per location', winner: 'dineopen' },
  ]},
  { category: 'Technology & AI', features: [
    { feature: 'AI Voice Ordering', dineopen: 'Hindi, English, Tamil, Marathi & more', petpooja: 'Not available', winner: 'dineopen' },
    { feature: 'AI Menu Extraction', dineopen: 'Photo → menu items automatically', petpooja: 'Not available', winner: 'dineopen' },
    { feature: 'Smart Analytics', dineopen: 'AI-powered insights & predictions', petpooja: 'Basic reporting', winner: 'dineopen' },
    { feature: 'QR Code Ordering', dineopen: 'Built-in, customers order & pay', petpooja: 'Available', winner: 'tie' },
    { feature: 'WhatsApp Ordering', dineopen: 'Built-in', petpooja: 'Available (add-on)', winner: 'dineopen' },
    { feature: 'Offline Mode', dineopen: 'Yes — bills sync when online', petpooja: 'Yes', winner: 'tie' },
  ]},
  { category: 'Customer & Loyalty', features: [
    { feature: 'Loyalty Program', dineopen: 'Built-in (points, rewards, referrals)', petpooja: 'Paid add-on', winner: 'dineopen' },
    { feature: 'Customer Database', dineopen: 'Auto-capture with billing', petpooja: 'CRM module (extra cost)', winner: 'dineopen' },
    { feature: 'SMS/WhatsApp Marketing', dineopen: 'Included', petpooja: 'Add-on', winner: 'dineopen' },
    { feature: 'Birthday/Anniversary Alerts', dineopen: 'Automatic', petpooja: 'Via CRM add-on', winner: 'dineopen' },
  ]},
  { category: 'Support & Setup', features: [
    { feature: 'Setup Time', dineopen: '15 minutes self-setup', petpooja: '1-3 days with technician', winner: 'dineopen' },
    { feature: 'Staff Training', dineopen: '15 min — intuitive UI', petpooja: '1-2 hours training needed', winner: 'dineopen' },
    { feature: 'Support Hours', dineopen: '24/7 chat & email', petpooja: 'Business hours primarily', winner: 'dineopen' },
    { feature: 'UI / Interface', dineopen: 'Modern, clean, visual', petpooja: 'Functional but dated', winner: 'dineopen' },
  ]},
];

export default function PetpoojaAlternativeClient() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'Is DineOpen really cheaper than Petpooja?',
      a: 'Yes. DineOpen Spark plan starts at ₹300/month with ALL features included — inventory, loyalty, analytics, QR ordering. Petpooja\'s base plan starts around ₹1,000/month, and inventory, CRM, and online ordering are paid add-ons. With zero transaction fees (vs Petpooja\'s 1.5-2%), a restaurant doing ₹5 lakh/month in transactions saves ₹7,500/month on fees alone — that\'s ₹90,000/year.'
    },
    {
      q: 'What does DineOpen have that Petpooja doesn\'t?',
      a: 'AI voice ordering in regional languages (Hindi, Tamil, Marathi, Telugu), AI-powered menu extraction from photos, built-in loyalty programs at no extra cost, and a modern interface that staff learn in 15 minutes. DineOpen also charges zero transaction fees — Petpooja charges 1.5-2% per transaction.'
    },
    {
      q: 'Can I switch from Petpooja to DineOpen easily?',
      a: 'Yes. Start a free 7-day trial alongside your Petpooja setup. Add your menu (AI extracts it from a photo in 2 minutes). Train staff (15 minutes). Run both systems in parallel for a few days to build confidence, then switch over. No downtime, no data loss.'
    },
    {
      q: 'Does DineOpen work for large restaurant chains?',
      a: 'Yes. The Blaze plan at $89/month (₹2,500/month) supports unlimited locations with centralized menu control, inter-branch stock transfers, location-wise analytics, and role-based staff access. You manage everything from one dashboard.'
    },
    {
      q: 'Is DineOpen good for delivery-heavy restaurants?',
      a: 'DineOpen handles dine-in, takeaway, and delivery orders from a single screen. Customers can order via QR code or WhatsApp. You get delivery zone management, rider tracking, and order status updates. For third-party delivery platforms, orders can be managed manually through the POS.'
    },
    {
      q: 'What about Petpooja\'s delivery aggregator integration?',
      a: 'Petpooja has mature integrations with Zomato and Swiggy — that\'s a genuine strength. DineOpen currently does not have direct Zomato/Swiggy integration. If your business relies heavily on these platforms, Petpooja may be a better fit for that specific need. However, DineOpen\'s direct ordering channels (QR, WhatsApp, website) help you take orders without paying 25-30% commission to aggregators.'
    },
    {
      q: 'Does DineOpen support GST billing?',
      a: 'Full GST compliance — CGST, SGST, IGST auto-calculated. GST-compliant invoices with your GSTIN. GSTR-1 compatible reports. HSN/SAC code support. Works for both 5% (non-AC) and 18% (AC restaurant) tax rates.'
    },
    {
      q: 'What if I need help setting up?',
      a: 'DineOpen is designed for self-setup — most restaurants are live within 15 minutes. But we also offer 24/7 chat support, video call onboarding, and dedicated account managers for chain restaurants. You\'re never on your own.'
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <CommonHeader />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Alternatives', href: '/compare' },
          { label: 'Petpooja Alternative' },
        ]}
      />

      {/* Hero Section */}
      <section style={{
        padding: '80px 20px 60px',
        background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 30%, #fff7ed 60%, #fff1f2 100%)',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            padding: '6px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
          }}>
            Petpooja Alternative — Honest Comparison
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: '800',
            color: '#111827',
            lineHeight: '1.15',
            marginBottom: '20px',
          }}>
            DineOpen vs Petpooja:<br />
            <span style={{ color: '#ef4444' }}>Which POS is Right for You?</span>
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#4b5563',
            maxWidth: '700px',
            margin: '0 auto 32px',
            lineHeight: '1.7',
          }}>
            A fair, detailed comparison of features, pricing, and real trade-offs. We&apos;ll tell you where DineOpen wins — and where Petpooja might be the better choice.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '17px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
              }}
            >
              Try DineOpen Free — 30 Days →
            </Link>
            <a
              href="#comparison"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'white',
                color: '#374151',
                borderRadius: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '17px',
                border: '2px solid #d1d5db',
              }}
            >
              Jump to Comparison ↓
            </a>
          </div>
        </div>
      </section>

      {/* Quick Answer — AEO Block */}
      <section style={{
        padding: '40px 20px',
        backgroundColor: '#fef2f2',
        borderBottom: '1px solid #fecaca'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #fecaca',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Quick Answer</p>
          <p style={{ fontSize: '16px', color: '#1f2937', lineHeight: '1.7', margin: 0 }}>
            <strong>The best Petpooja alternative in 2026 is DineOpen.</strong> It costs ₹300/month vs Petpooja&apos;s ₹1,000+/month, charges zero transaction fees (Petpooja charges 1.5-2%), and includes AI voice ordering, inventory management, loyalty programs, and QR ordering as standard — features Petpooja charges extra for as add-ons. DineOpen does not have Zomato/Swiggy integration (Petpooja does), so restaurants relying heavily on delivery aggregators should factor that in.
          </p>
        </div>
      </section>

      {/* Quick Summary Stats */}
      <section style={{ padding: '48px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { stat: '₹300/mo', label: 'DineOpen starting price', sublabel: 'vs ₹1,000+/mo Petpooja' },
              { stat: '0%', label: 'Transaction fees', sublabel: 'vs 1.5-2% with Petpooja' },
              { stat: '₹90,000+', label: 'Annual savings on fees', sublabel: 'On ₹5 lakh/mo transactions' },
              { stat: '15 min', label: 'Setup time', sublabel: 'vs 1-3 days with Petpooja' },
            ].map((item, i) => (
              <div key={i} style={{
                textAlign: 'center',
                padding: '24px 16px',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: '#fafafa',
              }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>{item.stat}</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Honest Take */}
      <section style={{ padding: '48px 20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
            The Honest Take
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            <div style={{ background: '#f0fdf4', padding: '28px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
              <h3 style={{ color: '#166534', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Where DineOpen Wins</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', lineHeight: '2' }}>
                <li><strong>Price:</strong> 70% cheaper with all features included</li>
                <li><strong>Zero fees:</strong> No per-transaction charges</li>
                <li><strong>AI features:</strong> Voice ordering, menu extraction</li>
                <li><strong>Modern UI:</strong> Staff learn in 15 minutes</li>
                <li><strong>Built-in loyalty:</strong> No add-on cost</li>
                <li><strong>Setup speed:</strong> Self-setup in 15 minutes</li>
              </ul>
            </div>
            <div style={{ background: '#eff6ff', padding: '28px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
              <h3 style={{ color: '#1e40af', fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Where Petpooja Wins</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', lineHeight: '2' }}>
                <li><strong>Delivery integration:</strong> Mature Zomato/Swiggy integration</li>
                <li><strong>Market presence:</strong> 15+ years, large support network</li>
                <li><strong>On-ground support:</strong> Local technicians in most cities</li>
                <li><strong>Brand recognition:</strong> Your CA/accountant may know it</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Calculator */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
            How Much Can You Save?
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px' }}>Based on a restaurant doing ₹5,00,000/month in transactions</p>

          <div style={{ background: '#ffffff', borderRadius: '16px', border: '2px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '2px solid #e5e7eb' }}>
              <div style={{ padding: '32px', textAlign: 'center', borderRight: '2px solid #e5e7eb' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>With Petpooja</div>
                <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>₹1,000/mo subscription</div>
                <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>+ ₹5,000/mo inventory add-on</div>
                <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>+ ₹7,500/mo transaction fees (1.5%)</div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#dc2626', marginTop: '16px' }}>₹1,62,000/yr</div>
              </div>
              <div style={{ padding: '32px', textAlign: 'center', background: '#f0fdf4' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>With DineOpen</div>
                <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>₹300/mo subscription</div>
                <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>Everything included</div>
                <div style={{ fontSize: '16px', color: '#6b7280', marginBottom: '4px' }}>Zero transaction fees</div>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#16a34a', marginTop: '16px' }}>₹3,600/yr</div>
              </div>
            </div>
            <div style={{ padding: '20px', textAlign: 'center', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white' }}>
              <span style={{ fontSize: '22px', fontWeight: '800' }}>You save ₹1,58,400 per year</span>
            </div>
          </div>
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '12px' }}>
            * Petpooja costs are estimates based on user reports. Actual pricing varies — contact Petpooja for current quotes.
          </p>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section id="comparison" style={{ padding: '60px 20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
            Feature-by-Feature Comparison
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px' }}>Every feature compared honestly — including where Petpooja ties or wins</p>

          {comparisonData.map((section) => (
            <div key={section.category} style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '8px' }}>
                {section.category}
              </h3>
              <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr', background: '#f3f4f6', padding: '12px 16px', fontWeight: '700', fontSize: '13px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div>Feature</div>
                  <div style={{ textAlign: 'center', color: '#ef4444' }}>DineOpen</div>
                  <div style={{ textAlign: 'center' }}>Petpooja</div>
                </div>
                {section.features.map((row, idx) => (
                  <div key={row.feature} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1.5fr 1.5fr',
                    padding: '14px 16px',
                    borderTop: '1px solid #f3f4f6',
                    backgroundColor: idx % 2 === 0 ? 'white' : '#fafafa',
                    alignItems: 'center',
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>{row.feature}</div>
                    <div style={{
                      textAlign: 'center',
                      fontSize: '14px',
                      fontWeight: row.winner === 'dineopen' ? '700' : '400',
                      color: row.winner === 'dineopen' ? '#16a34a' : '#374151',
                      backgroundColor: row.winner === 'dineopen' ? '#f0fdf4' : 'transparent',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}>
                      {row.dineopen}
                    </div>
                    <div style={{
                      textAlign: 'center',
                      fontSize: '14px',
                      color: row.winner === 'petpooja' ? '#16a34a' : '#6b7280',
                      fontWeight: row.winner === 'petpooja' ? '700' : '400',
                    }}>
                      {row.petpooja}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What DineOpen Doesn't Have */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
            What DineOpen Doesn&apos;t Have (Yet)
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px' }}>We believe in honesty. Here&apos;s where Petpooja currently has an edge:</p>

          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ background: '#fff7ed', padding: '24px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
              <h4 style={{ color: '#9a3412', marginBottom: '8px', fontSize: '17px', fontWeight: '700' }}>Zomato & Swiggy Direct Integration</h4>
              <p style={{ color: '#374151', margin: 0, lineHeight: '1.7' }}>
                Petpooja has mature, direct integrations with Zomato and Swiggy where delivery orders flow automatically into the POS. DineOpen does not currently have this. If 50%+ of your revenue comes from delivery aggregators, this is a real consideration.
              </p>
              <p style={{ color: '#6b7280', margin: '8px 0 0 0', fontSize: '14px', fontStyle: 'italic' }}>
                Our alternative: DineOpen&apos;s direct QR ordering and WhatsApp ordering help you take orders without paying 25-30% aggregator commissions.
              </p>
            </div>
            <div style={{ background: '#fff7ed', padding: '24px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
              <h4 style={{ color: '#9a3412', marginBottom: '8px', fontSize: '17px', fontWeight: '700' }}>On-Ground Technician Network</h4>
              <p style={{ color: '#374151', margin: 0, lineHeight: '1.7' }}>
                Petpooja has been in the market since 2011 and has local technicians in most Indian cities for on-site setup and hardware support. DineOpen is cloud-first and self-setup — which is faster but means no one physically comes to your restaurant to install hardware.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Choose What */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>
            Which POS Should You Choose?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '2px solid #ef4444' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>🚀</div>
              <h3 style={{ color: '#ef4444', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Choose DineOpen if you...</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', lineHeight: '2.2' }}>
                <li>Run a <strong>single outlet or small chain</strong> (1-5 locations)</li>
                <li>Want <strong>transparent pricing</strong> with no hidden add-on fees</li>
                <li>Need <strong>AI features</strong> like voice ordering and smart analytics</li>
                <li>Primarily serve <strong>dine-in and takeaway</strong> customers</li>
                <li>Want to take <strong>direct orders</strong> (QR, WhatsApp) to avoid aggregator commissions</li>
                <li>Need a POS for <strong>niche verticals</strong> (ice cream, bakery, bar, catering)</li>
                <li>Want to be <strong>live in 15 minutes</strong> with self-setup</li>
              </ul>
            </div>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '2px solid #6b7280' }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>🏢</div>
              <h3 style={{ color: '#374151', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Choose Petpooja if you...</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', lineHeight: '2.2' }}>
                <li>Rely heavily on <strong>Zomato/Swiggy</strong> for 50%+ of your orders</li>
                <li>Want <strong>on-site setup</strong> with local technicians</li>
                <li>Run a <strong>large chain</strong> (10+ locations) with complex needs</li>
                <li>Your <strong>CA/accountant</strong> already uses Petpooja for reconciliation</li>
                <li>Prefer a <strong>well-known brand</strong> with 15+ years in market</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Restaurants Switch */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>
            Why Restaurants Switch from Petpooja to DineOpen
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {[
              {
                icon: '💰',
                title: '70% Lower Cost',
                desc: '₹300/month vs Petpooja\'s ₹1,000+/month. Plus zero transaction fees. A restaurant doing ₹5L/month saves ₹1.5+ lakh per year.'
              },
              {
                icon: '🤖',
                title: 'AI-Powered Features',
                desc: 'Voice ordering in Hindi & English, AI menu extraction from photos, predictive analytics. Technology that Petpooja doesn\'t offer.'
              },
              {
                icon: '⚡',
                title: '15-Minute Setup',
                desc: 'No waiting for technicians. Download the app, photograph your menu, and start billing. Staff learn the interface in 15 minutes.'
              },
              {
                icon: '🎁',
                title: 'Everything Included',
                desc: 'Inventory, loyalty, analytics, QR ordering, WhatsApp orders — all included. No surprise add-on costs like with Petpooja.'
              },
              {
                icon: '📱',
                title: 'Works on Any Device',
                desc: 'Android phone, tablet, iPad, laptop — DineOpen works everywhere. No proprietary hardware required.'
              },
              {
                icon: '🔄',
                title: 'Zero Lock-In',
                desc: 'Monthly billing, cancel anytime. No annual contracts. No hardware lock-in. If you don\'t love it, leave without penalty.'
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#fafafa',
                padding: '28px',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{item.icon}</div>
                <h3 style={{ color: '#111827', fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: '#6b7280', margin: 0, lineHeight: '1.7', fontSize: '15px' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', lineHeight: '1.5' }}>{faq.q}</span>
                  <span style={{
                    fontSize: '20px',
                    color: '#6b7280',
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)',
                    transition: 'transform 0.2s',
                    flexShrink: 0,
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 20px', color: '#4b5563', lineHeight: '1.8', fontSize: '15px' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Read More */}
      <section style={{ padding: '48px 20px', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>
            Related Reading
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { title: 'Petpooja Review 2026', href: '/blog/petpooja-review-2026', desc: 'Honest, detailed review' },
              { title: 'DineOpen vs Petpooja', href: '/vs/dineopen-vs-petpooja', desc: 'Side-by-side comparison' },
              { title: 'Best POS Systems India', href: '/blog/best-restaurant-pos-systems-india-comparison-2024', desc: 'Full market comparison' },
              { title: 'Restaurant Billing App Guide', href: '/blog/restaurant-billing-app-complete-guide', desc: 'Complete buyer\'s guide' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textDecoration: 'none',
                display: 'block',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>{link.title}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{link.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '64px 20px',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>
            Try DineOpen Free for 7 Days
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', lineHeight: '1.7' }}>
            No credit card. No contracts. No hardware needed. Set up in 15 minutes and see if DineOpen is right for your restaurant.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                padding: '18px 36px',
                background: 'white',
                color: '#ef4444',
                borderRadius: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '18px',
              }}
            >
              Start Free Trial →
            </Link>
            <Link
              href="/pricing"
              style={{
                display: 'inline-block',
                padding: '18px 36px',
                background: 'rgba(255,255,255,0.15)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '18px',
                border: '2px solid rgba(255,255,255,0.5)',
              }}
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      <InternalLinks currentPath="/alternatives/petpooja" variant="alternative" />
    </div>
  );
}
