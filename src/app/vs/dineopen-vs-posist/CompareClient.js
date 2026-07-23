'use client';

import Link from 'next/link';
import { useState } from 'react';
import CommonHeader from '../../../components/CommonHeader';
import Breadcrumb from '../../../components/Breadcrumb';
import InternalLinks from '../../../components/InternalLinks';

const comparisonData = [
  { category: 'Pricing & Fees', features: [
    { feature: 'Starting Price', dineopen: '₹300/month ($9.99)', posist: '₹2,000-5,000+/month (custom quote)', winner: 'dineopen' },
    { feature: 'Transaction Fees', dineopen: '0% — zero transaction fees', posist: 'Varies by plan', winner: 'dineopen' },
    { feature: 'Setup Fee', dineopen: '₹0', posist: '₹15,000-50,000 (typical)', winner: 'dineopen' },
    { feature: 'Pricing Transparency', dineopen: 'Published on website', posist: 'Contact sales for custom quote', winner: 'dineopen' },
    { feature: 'Contract Terms', dineopen: 'Month-to-month, cancel anytime', posist: 'Annual contracts typical', winner: 'dineopen' },
    { feature: 'Hardware Required', dineopen: 'Works on any device', posist: 'Proprietary hardware often required', winner: 'dineopen' },
  ]},
  { category: 'Core Features', features: [
    { feature: 'Cloud-Based POS', dineopen: 'Yes — access from anywhere', posist: 'Yes — enterprise cloud', winner: 'tie' },
    { feature: 'GST Billing', dineopen: 'Full CGST/SGST/IGST compliance', posist: 'Full GST support', winner: 'tie' },
    { feature: 'Kitchen Display System', dineopen: 'Included in all plans', posist: 'Included', winner: 'tie' },
    { feature: 'Inventory Management', dineopen: 'Included in all plans', posist: 'Advanced (enterprise-grade)', winner: 'posist' },
    { feature: 'Zomato/Swiggy Integration', dineopen: 'Not available', posist: 'Direct integration with all major aggregators', winner: 'posist' },
    { feature: 'Menu Management', dineopen: 'AI-powered extraction from photos', posist: 'Centralized menu control', winner: 'tie' },
  ]},
  { category: 'Technology & AI', features: [
    { feature: 'AI Voice Ordering', dineopen: 'Hindi, English, Tamil, Marathi & more', posist: 'Not available', winner: 'dineopen' },
    { feature: 'AI Chat Assistant', dineopen: 'Built-in for operations help', posist: 'Not available', winner: 'dineopen' },
    { feature: 'AI Menu Extraction', dineopen: 'Photo to menu items automatically', posist: 'Not available', winner: 'dineopen' },
    { feature: 'Smart Analytics', dineopen: 'AI-powered insights', posist: 'Advanced reporting & dashboards', winner: 'tie' },
    { feature: 'QR Code Ordering', dineopen: 'Built-in, customers order and pay', posist: 'Available', winner: 'tie' },
    { feature: 'WhatsApp Ordering', dineopen: 'Built-in', posist: 'Not standard', winner: 'dineopen' },
  ]},
  { category: 'Enterprise & Scale', features: [
    { feature: 'Multi-Outlet Management', dineopen: 'Unlimited (Blaze plan)', posist: 'Purpose-built for chains', winner: 'posist' },
    { feature: 'Centralized Reporting', dineopen: 'Yes — all locations in one dashboard', posist: 'Advanced chain-wide analytics', winner: 'posist' },
    { feature: 'Dedicated Account Manager', dineopen: 'For Blaze plan customers', posist: 'Standard for all customers', winner: 'posist' },
    { feature: 'On-Ground Support', dineopen: 'Remote support (24/7 chat & email)', posist: 'Local technicians in major cities', winner: 'posist' },
    { feature: 'Franchise Management', dineopen: 'Basic franchise support', posist: 'Advanced franchise controls', winner: 'posist' },
    { feature: 'Custom Integrations', dineopen: 'API available', posist: 'Extensive third-party ecosystem', winner: 'posist' },
  ]},
];

const faqs = [
  {
    q: 'Is DineOpen really a viable alternative to POSist for restaurant chains?',
    a: 'For small-to-medium chains with 1-5 outlets, absolutely. DineOpen offers all the core POS features at a fraction of the cost, plus AI capabilities that POSist lacks. However, for large enterprise chains with 10+ outlets that need deep aggregator integration, dedicated on-ground support, and advanced franchise management, POSist is purpose-built for that use case. Be honest about your scale and needs before deciding.'
  },
  {
    q: 'Why is POSist so much more expensive than DineOpen?',
    a: 'POSist (Restroworks) positions itself as an enterprise platform. The higher price includes dedicated account managers, on-ground technician support, custom integrations, and direct delivery aggregator connections. You are paying for a support infrastructure, not just software. For large chains that need this level of service, the cost can be justified. For smaller restaurants, it is often overkill.'
  },
  {
    q: 'Does DineOpen have Zomato and Swiggy integration?',
    a: 'No. DineOpen does not currently have direct Zomato or Swiggy integration. This is a genuine limitation. If more than 40-50% of your revenue comes from delivery aggregators, POSist is likely a better fit for that specific need. DineOpen focuses on direct ordering channels — QR code menus, WhatsApp ordering, and website ordering — which help restaurants take orders without paying 25-30% aggregator commissions.'
  },
  {
    q: 'What AI features does DineOpen have that POSist does not?',
    a: 'DineOpen offers AI voice ordering in multiple Indian languages (Hindi, English, Tamil, Marathi, Telugu, and more), an AI chat assistant that helps with daily restaurant operations, and AI-powered menu extraction that converts a photo of your physical menu into a digital menu in minutes. POSist focuses on traditional POS and enterprise management but has not invested in AI-powered features as of 2026.'
  },
  {
    q: 'Can I migrate from POSist to DineOpen without losing data?',
    a: 'You can start a free 7-day DineOpen trial alongside your POSist setup. Use AI menu extraction to digitize your menu instantly. Historical transaction data from POSist would need to be exported separately for your records. We recommend running both systems in parallel for 5-7 days before switching. If you have complex multi-outlet setups or custom POSist integrations, plan for a 2-week transition period.'
  },
  {
    q: 'Which POS is better for a single restaurant in India?',
    a: 'For a single-outlet restaurant, DineOpen is almost always the better choice. At Rs 300/month with all features included, zero transaction fees, and 15-minute self-setup, it is dramatically more affordable than POSist which starts at Rs 2,000-5,000/month and is designed for chains. POSist is enterprise software — powerful, but expensive and complex for a single restaurant.'
  },
];

export default function CompareClient() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Comparisons', href: '/vs' },
          { label: 'DineOpen vs POSist' },
        ]}
      />

      {/* Hero Section */}
      <section style={{
        padding: '80px 20px 60px',
        background: 'linear-gradient(135deg, #fefce8 0%, #fff7ed 40%, #fef2f2 100%)',
        borderBottom: '1px solid #e5e7eb',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #ea580c, #dc2626)',
            color: 'white',
            padding: '6px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
          }}>
            Honest Side-by-Side Comparison
          </div>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '20px',
            lineHeight: '1.2',
          }}>
            DineOpen vs POSist (Restroworks):<br />
            <span style={{ color: '#ea580c' }}>Which POS Fits Your Restaurant?</span>
          </h1>
          <p style={{
            fontSize: '19px',
            color: '#4b5563',
            lineHeight: '1.7',
            maxWidth: '700px',
            margin: '0 auto 16px',
          }}>
            Two very different restaurant platforms for two very different needs. DineOpen is built for small-to-medium restaurants with AI-first technology. POSist (Restroworks) is built for enterprise chains. Here&apos;s an honest breakdown to help you choose.
          </p>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            fontStyle: 'italic',
            marginBottom: '32px',
          }}>
            No spin, no bashing. We&apos;ll tell you where POSist genuinely wins too.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '700',
                textDecoration: 'none',
                fontSize: '17px',
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
              }}
            >
              Try DineOpen Free — 30 Days
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
              Jump to Comparison
            </a>
          </div>
        </div>
      </section>

      {/* Quick Summary Stats */}
      <section style={{ padding: '48px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { stat: '₹300/mo', label: 'DineOpen starting price', sublabel: 'vs ₹2,000-5,000+/mo POSist' },
              { stat: '0%', label: 'DineOpen transaction fees', sublabel: 'Zero hidden charges' },
              { stat: '15 min', label: 'DineOpen setup time', sublabel: 'vs days/weeks with POSist' },
              { stat: '20+', label: 'Countries supported', sublabel: 'POSist: India & select markets' },
            ].map((item, i) => (
              <div key={i} style={{
                textAlign: 'center',
                padding: '24px 16px',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                background: '#fafafa',
              }}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ea580c', marginBottom: '4px' }}>{item.stat}</div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Summary Cards */}
      <section style={{ padding: '48px 20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '32px' }}>
            Quick Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* DineOpen Card */}
            <div style={{
              border: '2px solid #ea580c',
              borderRadius: '16px',
              padding: '32px',
              backgroundColor: '#fff7ed',
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#ea580c', marginBottom: '16px' }}>DineOpen</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', fontStyle: 'italic' }}>Best for: Small-to-medium restaurants, 1-5 outlets</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  '₹300/month Spark plan ($9.99) | $89/month Blaze plan',
                  'AI voice ordering, chat assistant, menu extraction',
                  'Zero transaction fees on all plans',
                  '15-minute self-setup, works on any device',
                  '7-day free trial, no credit card required',
                  'No Zomato/Swiggy integration (honest limitation)',
                ].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: i === 5 ? '#dc2626' : '#16a34a', fontWeight: '700', flexShrink: 0 }}>{i === 5 ? '\u2717' : '\u2713'}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* POSist Card */}
            <div style={{
              border: '2px solid #4f46e5',
              borderRadius: '16px',
              padding: '32px',
              backgroundColor: '#eef2ff',
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#4f46e5', marginBottom: '16px' }}>POSist (Restroworks)</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', fontStyle: 'italic' }}>Best for: Enterprise chains, 10+ outlets</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  '₹2,000-5,000+/month per outlet (custom pricing)',
                  'Enterprise-grade multi-outlet management',
                  'Direct Zomato/Swiggy/aggregator integration',
                  'On-ground technician support in major cities',
                  'Dedicated account managers for all customers',
                  'No AI features (voice ordering, chat, etc.)',
                ].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: i === 5 ? '#dc2626' : '#4f46e5', fontWeight: '700', flexShrink: 0 }}>{i === 5 ? '\u2717' : '\u2713'}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section id="comparison" style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
            Feature-by-Feature Comparison
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px' }}>
            Every feature compared honestly — including where POSist wins
          </p>

          {comparisonData.map((section) => (
            <div key={section.category} style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '8px' }}>
                {section.category}
              </h3>
              <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr', background: '#111827', padding: '12px 16px', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <div style={{ color: '#ffffff' }}>Feature</div>
                  <div style={{ textAlign: 'center', color: '#fb923c' }}>DineOpen</div>
                  <div style={{ textAlign: 'center', color: '#a5b4fc' }}>POSist</div>
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
                      color: row.winner === 'posist' ? '#16a34a' : '#6b7280',
                      fontWeight: row.winner === 'posist' ? '700' : '400',
                      backgroundColor: row.winner === 'posist' ? '#f0fdf4' : 'transparent',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}>
                      {row.posist}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#9ca3af' }}>
            Green highlighting indicates the winner in each category. POSist pricing is estimated based on user reports — contact POSist for current quotes.
          </p>
        </div>
      </section>

      {/* Where DineOpen Wins */}
      <section style={{ padding: '60px 20px', backgroundColor: '#fff7ed' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Where DineOpen Wins
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            Areas where DineOpen has a clear advantage over POSist
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { title: 'AI-Powered Features', desc: 'Voice ordering in 10+ Indian languages, AI chat assistant, and menu extraction from photos. POSist has no equivalent AI capabilities.' },
              { title: 'Dramatically Lower Cost', desc: 'Starting at ₹300/month vs POSist\'s ₹2,000-5,000+/month. For a single outlet, that\'s ₹20,000-56,000+ saved per year.' },
              { title: 'Zero Transaction Fees', desc: 'Keep 100% of your revenue. No hidden per-transaction charges eating into your margins on any plan.' },
              { title: 'Self-Setup in 15 Minutes', desc: 'No waiting for technicians, no installation appointments. Download, photograph your menu, start billing. Works on any phone or tablet.' },
              { title: 'No Annual Contracts', desc: 'Month-to-month billing, cancel anytime. POSist typically requires annual contracts with significant upfront commitments.' },
              { title: 'WhatsApp Ordering', desc: 'Built-in WhatsApp ordering lets customers place orders directly — no aggregator commissions, no third-party dependency.' },
            ].map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #fed7aa',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#ea580c', marginBottom: '8px' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where POSist Wins */}
      <section style={{ padding: '60px 20px', backgroundColor: '#eef2ff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Where POSist (Restroworks) Wins
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            Credit where it&apos;s due — POSist has real strengths, especially for enterprise
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { title: 'Delivery Aggregator Integration', desc: 'Direct, mature integrations with Zomato, Swiggy, and other delivery platforms. Orders flow automatically into the POS. DineOpen does not have this.' },
              { title: 'Enterprise Chain Management', desc: 'Purpose-built for 10-100+ outlet chains with centralized control, franchise management, and chain-wide analytics that go beyond what DineOpen offers.' },
              { title: 'On-Ground Support Team', desc: 'Local technicians in major Indian cities for in-person setup, hardware installation, and troubleshooting. DineOpen is remote-support only.' },
              { title: 'Dedicated Account Managers', desc: 'Every POSist customer gets a dedicated account manager. DineOpen offers this only on the Blaze plan for chain restaurants.' },
              { title: 'Advanced Reporting', desc: 'Enterprise-grade reporting with chain-wide comparisons, franchise benchmarking, and deep operational analytics built for multi-outlet decision-making.' },
              { title: 'Established Enterprise Track Record', desc: 'POSist has years of experience managing large restaurant chains. If you run 20+ outlets, that enterprise DNA matters.' },
            ].map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #c7d2fe',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#4f46e5', marginBottom: '8px' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Choose What */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>
            Which POS Should You Choose?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '2px solid #ea580c' }}>
              <h3 style={{ color: '#ea580c', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Choose DineOpen if you...</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', lineHeight: '2.2' }}>
                <li>Run a <strong>single outlet or small chain</strong> (1-5 locations)</li>
                <li>Want <strong>transparent, affordable pricing</strong> without enterprise markup</li>
                <li>Need <strong>AI features</strong> like voice ordering and smart menu extraction</li>
                <li>Primarily serve <strong>dine-in and takeaway</strong> customers</li>
                <li>Want to take <strong>direct orders</strong> via QR and WhatsApp to avoid aggregator fees</li>
                <li>Need to <strong>get started fast</strong> — 15 minutes, no technician visit</li>
                <li>Operate in <strong>multiple countries</strong> — DineOpen works in 20+ markets</li>
              </ul>
            </div>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '2px solid #4f46e5' }}>
              <h3 style={{ color: '#4f46e5', fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Choose POSist if you...</h3>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', lineHeight: '2.2' }}>
                <li>Run a <strong>large chain with 10+ outlets</strong> needing enterprise controls</li>
                <li>Rely heavily on <strong>Zomato/Swiggy</strong> for 40%+ of your orders</li>
                <li>Need <strong>on-ground technicians</strong> for setup and hardware support</li>
                <li>Want a <strong>dedicated account manager</strong> from day one</li>
                <li>Require <strong>advanced franchise management</strong> with granular controls</li>
                <li>Have <strong>complex integrations</strong> with ERP, accounting, or custom systems</li>
                <li>Prefer a <strong>proven enterprise brand</strong> with a long chain-restaurant track record</li>
              </ul>
            </div>
          </div>
          <div style={{
            marginTop: '32px',
            backgroundColor: '#fffbeb',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #fde68a',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '16px', color: '#92400e', margin: 0, lineHeight: '1.7' }}>
              <strong>The honest truth:</strong> These two platforms serve different segments. Comparing them is a bit like comparing a nimble sedan to a heavy-duty truck — both are great vehicles, but for different jobs. If you&apos;re a single restaurant or small chain, DineOpen will save you money and give you AI tools. If you&apos;re a 20-outlet enterprise, POSist&apos;s infrastructure is built for you.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Breakdown */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
            Pricing Comparison (1-Year Cost)
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px' }}>
            Estimated annual costs for different restaurant sizes
          </p>

          <div style={{ display: 'grid', gap: '24px' }}>
            {[
              { label: 'Single Outlet Restaurant', dineSub: 300, posistLow: 2000, posistHigh: 5000, outlets: 1 },
              { label: 'Small Chain (3 Outlets)', dineSub: 300, posistLow: 2000, posistHigh: 5000, outlets: 3 },
              { label: 'Growing Chain (5 Outlets)', dineSub: 300, posistLow: 2000, posistHigh: 5000, outlets: 5 },
            ].map((s, i) => {
              const dineTotal = s.dineSub * 12 * s.outlets;
              const posistLowTotal = s.posistLow * 12 * s.outlets;
              const posistHighTotal = s.posistHigh * 12 * s.outlets;
              const savingsLow = posistLowTotal - dineTotal;
              const savingsHigh = posistHighTotal - dineTotal;

              return (
                <div key={i} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '28px',
                  backgroundColor: '#ffffff',
                }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>
                    {s.label} <span style={{ fontWeight: '400', color: '#6b7280', fontSize: '15px' }}>({s.outlets} outlet{s.outlets > 1 ? 's' : ''})</span>
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{
                      backgroundColor: '#fff7ed',
                      borderRadius: '10px',
                      padding: '20px',
                      border: '1px solid #fed7aa',
                    }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>DineOpen (Spark)</p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>₹{s.dineSub}/month x {s.outlets} outlet{s.outlets > 1 ? 's' : ''} x 12</p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>Transaction fees: ₹0</p>
                      <p style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a', marginTop: '12px', marginBottom: 0 }}>
                        ₹{dineTotal.toLocaleString('en-IN')}<span style={{ fontSize: '14px', fontWeight: '400' }}>/year</span>
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: '#eef2ff',
                      borderRadius: '10px',
                      padding: '20px',
                      border: '1px solid #c7d2fe',
                    }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>POSist (estimated)</p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>₹{s.posistLow.toLocaleString('en-IN')}-{s.posistHigh.toLocaleString('en-IN')}/month x {s.outlets} x 12</p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}>+ setup fees (not included)</p>
                      <p style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626', marginTop: '12px', marginBottom: 0 }}>
                        ₹{posistLowTotal.toLocaleString('en-IN')}-{posistHighTotal.toLocaleString('en-IN')}<span style={{ fontSize: '14px', fontWeight: '400' }}>/year</span>
                      </p>
                    </div>
                  </div>
                  <div style={{
                    marginTop: '16px',
                    backgroundColor: '#dcfce7',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    textAlign: 'center',
                  }}>
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#15803d', margin: 0 }}>
                      Save ₹{savingsLow.toLocaleString('en-IN')}-{savingsHigh.toLocaleString('en-IN')}/year with DineOpen
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '16px' }}>
            * POSist uses custom pricing. Estimates based on industry reports and user feedback. Setup fees (₹15,000-50,000) not included. Contact POSist for current quotes.
          </p>
        </div>
      </section>

      {/* What DineOpen Doesn't Have */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '8px', textAlign: 'center' }}>
            What DineOpen Doesn&apos;t Have (Honestly)
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px' }}>
            We believe in transparency. Here&apos;s where POSist has a genuine edge:
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              {
                title: 'Zomato & Swiggy Direct Integration',
                desc: 'POSist has mature, battle-tested integrations with Zomato, Swiggy, and other delivery aggregators. Orders flow automatically into the POS without manual entry. DineOpen does not have this. If delivery aggregators are a major revenue channel for your restaurant, this is a significant consideration.',
                alternative: 'DineOpen\'s alternative: Direct ordering via QR codes and WhatsApp helps you take orders without paying 25-30% aggregator commissions.',
              },
              {
                title: 'On-Ground Technician Network',
                desc: 'POSist has local technicians in major Indian cities who can physically visit your restaurant for setup, hardware installation, and troubleshooting. DineOpen is cloud-first with remote support only — faster to set up, but no one comes to your location.',
                alternative: 'DineOpen\'s alternative: Self-setup in 15 minutes on any device. 24/7 remote support via chat and email.',
              },
              {
                title: 'Enterprise Franchise Management',
                desc: 'For large franchise operations with 10-100+ outlets, POSist offers granular franchise controls, benchmarking across locations, and enterprise-grade access management that goes beyond DineOpen\'s current multi-location capabilities.',
                alternative: 'DineOpen\'s Blaze plan ($89/month) supports unlimited locations with centralized control, but it is built for growing chains, not massive enterprise franchises.',
              },
            ].map((item, i) => (
              <div key={i} style={{ background: '#fff7ed', padding: '24px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                <h4 style={{ color: '#9a3412', marginBottom: '8px', fontSize: '17px', fontWeight: '700' }}>{item.title}</h4>
                <p style={{ color: '#374151', margin: '0 0 8px 0', lineHeight: '1.7' }}>{item.desc}</p>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px', fontStyle: 'italic' }}>{item.alternative}</p>
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

      {/* Related Reading */}
      <section style={{ padding: '48px 20px', backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>
            Related Reading
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[
              { title: 'POSist Alternative', href: '/alternatives/posist', desc: 'Full alternative comparison page' },
              { title: 'Petpooja Review 2026', href: '/blog/petpooja-review-2026', desc: 'Honest, detailed review' },
              { title: 'Best POS Systems India', href: '/blog/best-restaurant-pos-systems-india-comparison-2024', desc: 'Full market comparison guide' },
              { title: 'DineOpen vs Petpooja', href: '/vs/dineopen-vs-petpooja', desc: 'Side-by-side POS comparison' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                textDecoration: 'none',
                display: 'block',
              }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#ea580c', marginBottom: '4px' }}>{link.title}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{link.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '34px', fontWeight: '800', color: '#ffffff', marginBottom: '16px' }}>
            Try DineOpen Free for 7 Days
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px', lineHeight: '1.6' }}>
            See if DineOpen is the right fit for your restaurant. No credit card, no contracts, no hardware needed. Full access to all features including AI voice ordering.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="https://dineopen.com/login"
              style={{
                display: 'inline-block',
                backgroundColor: '#ffffff',
                color: '#ea580c',
                padding: '18px 40px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '800',
                textDecoration: 'none',
              }}
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              style={{
                display: 'inline-block',
                padding: '18px 40px',
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
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            {['No credit card needed', '7-day full access', 'Cancel anytime'].map((item, i) => (
              <span key={i} style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                &#10003; {item}
              </span>
            ))}
          </div>
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/pricing" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'underline' }}>View Pricing</Link>
            <Link href="/products/ai-agent" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'underline' }}>Explore AI Agent</Link>
            <Link href="/products/pos-software" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'underline' }}>POS Software</Link>
            <Link href="/alternatives/posist" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'underline' }}>POSist Alternative</Link>
            <Link href="/tools/roi-calculator" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textDecoration: 'underline' }}>ROI Calculator</Link>
          </div>
        </div>
      </section>

      <InternalLinks currentPath="/vs/dineopen-vs-posist" variant="alternative" />
    </div>
  );
}
