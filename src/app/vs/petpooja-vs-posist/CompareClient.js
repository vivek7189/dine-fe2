'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Breadcrumb from '../../../components/Breadcrumb';
import InternalLinks from '../../../components/InternalLinks';

const comparisonData = [
  { feature: 'Founded', petpooja: '2011, Ahmedabad', posist: '2012, New Delhi', winner: 'tie' },
  { feature: 'Current Brand Name', petpooja: 'Petpooja', posist: 'Restroworks (formerly POSist)', winner: 'tie' },
  { feature: 'Starting Price', petpooja: '₹1,000+/month', posist: '₹2,000-5,000+/month', winner: 'petpooja' },
  { feature: 'Transaction Fees', petpooja: '1.5-2%', posist: 'Custom/Negotiable', winner: 'tie' },
  { feature: 'Best For', petpooja: 'Small-Medium Restaurants', posist: 'Enterprise Chains (10+ outlets)', winner: 'tie' },
  { feature: 'Zomato Integration', petpooja: 'Direct API, Auto-accept', posist: 'Available', winner: 'petpooja' },
  { feature: 'Swiggy Integration', petpooja: 'Direct API, Auto-accept', posist: 'Available', winner: 'petpooja' },
  { feature: 'Multi-Location Analytics', petpooja: 'Basic', posist: 'Advanced, Centralized', winner: 'posist' },
  { feature: 'Cloud POS', petpooja: '✓', posist: '✓', winner: 'tie' },
  { feature: 'GST Billing', petpooja: '✓', posist: '✓', winner: 'tie' },
  { feature: 'Kitchen Display System', petpooja: '✓', posist: '✓', winner: 'tie' },
  { feature: 'Inventory Management', petpooja: '✓', posist: '✓ Advanced', winner: 'posist' },
  { feature: 'CRM / Loyalty', petpooja: 'Basic (Add-on)', posist: 'Advanced (Built-in)', winner: 'posist' },
  { feature: 'UI / Ease of Use', petpooja: 'Simple, Intuitive', posist: 'Feature-rich, Steeper Learning Curve', winner: 'petpooja' },
  { feature: 'Customer Support', petpooja: 'Phone, Chat, 150+ Cities', posist: 'Dedicated Account Manager', winner: 'tie' },
  { feature: 'International Presence', petpooja: 'Primarily India', posist: '40+ Countries', winner: 'posist' },
  { feature: 'Free Trial', petpooja: '14 days', posist: 'Demo only', winner: 'petpooja' },
  { feature: 'Hardware Requirement', petpooja: 'Android tablets, optional proprietary', posist: 'Works on most devices', winner: 'tie' },
];

const breadcrumbItems = [
  { label: 'Home', href: '/' },
  { label: 'Comparisons', href: '/vs' },
  { label: 'Petpooja vs POSist' },
];

export default function CompareClient() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <CommonHeader />

      <div style={{ paddingTop: '70px' }}>
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Hero Section */}
      <section style={{
        padding: '48px 20px 60px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fce7f3 50%, #ede9fe 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#ffffff',
            color: '#92400e',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '24px',
            border: '1px solid #fde68a',
          }}>
            Neutral Third-Party Comparison
          </div>
          <h1 style={{
            fontSize: '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '20px',
            lineHeight: '1.2',
          }}>
            Petpooja vs POSist: Which Restaurant POS Should You Choose?
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#4b5563',
            lineHeight: '1.7',
            maxWidth: '650px',
            margin: '0 auto 16px',
          }}>
            Two of India&apos;s most popular restaurant POS platforms, compared head-to-head. No bias, no sales pitch — just the facts to help you make the right decision for your restaurant.
          </p>
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            fontStyle: 'italic',
          }}>
            Last updated: March 2026. We are not affiliated with either Petpooja or POSist.
          </p>
        </div>
      </section>

      {/* Quick Snapshot */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '40px' }}>
            Quick Snapshot
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Petpooja Card */}
            <div style={{
              border: '2px solid #f59e0b',
              borderRadius: '16px',
              padding: '32px',
              backgroundColor: '#fffbeb',
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#b45309', marginBottom: '16px' }}>Petpooja</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'Founded 2011 in Ahmedabad, Gujarat',
                  '₹1,000+/month starting price',
                  '1.5-2% transaction fees',
                  'Best for: Small-medium restaurants',
                  'Strong Zomato/Swiggy direct integration',
                  'Support in 150+ Indian cities',
                  '7-day free trial available',
                ].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#f59e0b', fontWeight: '700', flexShrink: 0 }}>&#9679;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* POSist Card */}
            <div style={{
              border: '2px solid #8b5cf6',
              borderRadius: '16px',
              padding: '32px',
              backgroundColor: '#f5f3ff',
            }}>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#6d28d9', marginBottom: '16px' }}>POSist (Restroworks)</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'Founded 2012 in New Delhi, rebranded to Restroworks',
                  '₹2,000-5,000+/month (custom pricing)',
                  'Enterprise-focused, negotiable fees',
                  'Best for: Chains with 10+ outlets',
                  'Advanced multi-location analytics',
                  'Presence in 40+ countries',
                  'Demo-based onboarding (no free trial)',
                ].map((item, i) => (
                  <li key={i} style={{ padding: '8px 0', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ color: '#8b5cf6', fontWeight: '700', flexShrink: 0 }}>&#9679;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '40px' }}>
            Detailed Comparison
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#111827' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', color: '#ffffff', fontSize: '15px', fontWeight: '700' }}>Feature</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#fbbf24', fontSize: '15px', fontWeight: '700' }}>Petpooja</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', color: '#c4b5fd', fontSize: '15px', fontWeight: '700' }}>POSist (Restroworks)</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>{row.feature}</td>
                    <td style={{
                      padding: '14px 20px',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: row.winner === 'petpooja' ? '#b45309' : '#374151',
                      fontWeight: row.winner === 'petpooja' ? '700' : '400',
                    }}>
                      {row.petpooja}
                      {row.winner === 'petpooja' && <span style={{ marginLeft: '6px', color: '#16a34a' }}>&#10003;</span>}
                    </td>
                    <td style={{
                      padding: '14px 20px',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: row.winner === 'posist' ? '#6d28d9' : '#374151',
                      fontWeight: row.winner === 'posist' ? '700' : '400',
                    }}>
                      {row.posist}
                      {row.winner === 'posist' && <span style={{ marginLeft: '6px', color: '#16a34a' }}>&#10003;</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#9ca3af' }}>
            &#10003; Green checkmark indicates an advantage in that category. &quot;Tie&quot; means both perform similarly.
          </p>
        </div>
      </section>

      {/* Where Petpooja Wins */}
      <section style={{ padding: '60px 20px', backgroundColor: '#fffbeb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Where Petpooja Wins
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            Petpooja&apos;s clear advantages over POSist
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              {
                title: 'Better for Small-Medium Restaurants',
                desc: 'Petpooja&apos;s pricing and feature set are designed for single-outlet and small chain restaurants. You don&apos;t need to negotiate enterprise contracts or go through lengthy sales cycles.',
              },
              {
                title: 'Superior Zomato/Swiggy Integration',
                desc: 'Direct API integration with auto-accept, real-time menu sync, and order management for Zomato and Swiggy. This is Petpooja&apos;s standout feature for delivery-heavy restaurants.',
              },
              {
                title: 'Lower Starting Price',
                desc: 'At ₹1,000+/month, Petpooja is significantly more affordable than POSist&apos;s custom enterprise pricing which typically starts at ₹2,000-5,000+/month.',
              },
              {
                title: 'Wider City Coverage for Support',
                desc: 'Petpooja has on-ground support teams in 150+ Indian cities. POSist focuses more on dedicated account managers for enterprise clients, which can leave smaller restaurants underserved.',
              },
            ].map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #fde68a',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#b45309', marginBottom: '8px' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where POSist Wins */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f5f3ff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Where POSist (Restroworks) Wins
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '40px', fontSize: '16px' }}>
            POSist&apos;s clear advantages over Petpooja
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              {
                title: 'Enterprise-Grade Features',
                desc: 'POSist is built for scale. Role-based access controls, franchise management, centralized menu management, and enterprise reporting are all first-class features.',
              },
              {
                title: 'Multi-Location Analytics',
                desc: 'Centralized dashboards that let you compare performance across 10, 50, or 100+ outlets. Real-time data aggregation that Petpooja&apos;s basic multi-outlet features can&apos;t match.',
              },
              {
                title: 'Better for 10+ Outlet Chains',
                desc: 'If you run a large restaurant chain, POSist&apos;s dedicated account management, custom integrations, and enterprise SLAs provide the support structure you need.',
              },
              {
                title: 'International Presence',
                desc: 'POSist operates in 40+ countries across the Middle East, Southeast Asia, and beyond. Petpooja is primarily focused on the Indian market.',
              },
            ].map((card, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #ddd6fe',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#6d28d9', marginBottom: '8px' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Choose What */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '40px' }}>
            Who Should Choose What?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Choose Petpooja */}
            <div style={{
              backgroundColor: '#fffbeb',
              borderRadius: '16px',
              padding: '32px',
              border: '2px solid #f59e0b',
            }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#b45309', marginBottom: '20px' }}>Choose Petpooja If...</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'You run 1-5 restaurant outlets in India',
                  'Zomato and Swiggy delivery is a major revenue channel',
                  'You want an affordable POS without enterprise sales negotiations',
                  'You need on-ground support in your city',
                  'You prefer a simpler interface with a shorter learning curve',
                  'You want a free trial to test before committing',
                ].map((item, i) => (
                  <li key={i} style={{
                    padding: '10px 0',
                    borderBottom: i < 5 ? '1px solid #fef3c7' : 'none',
                    fontSize: '15px',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>&#10140;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Choose POSist */}
            <div style={{
              backgroundColor: '#f5f3ff',
              borderRadius: '16px',
              padding: '32px',
              border: '2px solid #8b5cf6',
            }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#6d28d9', marginBottom: '20px' }}>Choose POSist (Restroworks) If...</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {[
                  'You operate 10+ restaurant outlets or a franchise',
                  'You need centralized analytics across all locations',
                  'You have international operations or expansion plans',
                  'You want dedicated account management and enterprise SLAs',
                  'Advanced inventory and supply chain management is a priority',
                  'You need custom integrations with ERP or accounting systems',
                ].map((item, i) => (
                  <li key={i} style={{
                    padding: '10px 0',
                    borderBottom: i < 5 ? '1px solid #ede9fe' : 'none',
                    fontSize: '15px',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    <span style={{ color: '#8b5cf6', fontWeight: '700', fontSize: '18px', flexShrink: 0 }}>&#10140;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Verdict */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>
            The Verdict
          </h2>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '40px 32px',
            border: '1px solid #e5e7eb',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: '17px', color: '#374151', lineHeight: '1.8', margin: '0 0 16px 0' }}>
              There&apos;s no single &quot;better&quot; option here — it genuinely depends on your restaurant&apos;s size, needs, and growth stage.
            </p>
            <p style={{ fontSize: '17px', color: '#374151', lineHeight: '1.8', margin: '0 0 16px 0' }}>
              <strong>Petpooja</strong> is the smarter choice for most small-to-medium Indian restaurants. It&apos;s more affordable, easier to set up, and has the best delivery aggregator integration in the market. If Zomato and Swiggy orders are a big part of your business, Petpooja handles that workflow exceptionally well.
            </p>
            <p style={{ fontSize: '17px', color: '#374151', lineHeight: '1.8', margin: '0 0 16px 0' }}>
              <strong>POSist (Restroworks)</strong> is the better choice for enterprise chains and multi-location businesses. If you&apos;re managing 10+ outlets and need centralized analytics, franchise management, and international support, POSist&apos;s enterprise features justify the higher price.
            </p>
            <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
              Both are established, reputable platforms. Your decision should come down to your specific restaurant size and operational needs.
            </p>
          </div>
        </div>
      </section>

      {/* Consider DineOpen Too */}
      <section style={{ padding: '60px 20px', backgroundColor: '#f0fdf4' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '700', textAlign: 'center', color: '#111827', marginBottom: '12px' }}>
            Consider DineOpen Too
          </h2>
          <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '32px', fontSize: '15px' }}>
            If neither Petpooja nor POSist feels like the right fit
          </p>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #bbf7d0',
          }}>
            <p style={{ fontSize: '16px', color: '#374151', lineHeight: '1.8', margin: '0 0 20px 0' }}>
              If you&apos;re looking for something different from both Petpooja and POSist, <strong>DineOpen</strong> offers a modern alternative with AI-powered features at a significantly lower price point.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Monthly Price', value: '₹300/month' },
                { label: 'Transaction Fees', value: '0% (Zero)' },
                { label: 'AI Features', value: 'Voice ordering, Chat assistant, Menu extraction' },
                { label: 'Free Trial', value: '30 days, full access' },
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#15803d' }}>{item.value}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.7', margin: '0 0 20px 0' }}>
              DineOpen is especially worth considering if you want cutting-edge AI automation (voice ordering, WhatsApp ordering) without the high costs of traditional POS platforms. At ₹300/month with zero transaction fees, it&apos;s a fraction of the cost of either Petpooja or POSist.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/alternatives/petpooja" style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                border: '1px solid #bbf7d0',
              }}>
                DineOpen vs Petpooja
              </Link>
              <Link href="/alternatives/posist" style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                border: '1px solid #bbf7d0',
              }}>
                DineOpen vs POSist
              </Link>
              <Link href="/pricing" style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#15803d',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
              }}>
                See DineOpen Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: '60px 20px', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', textAlign: 'center', color: '#111827', marginBottom: '32px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {[
              {
                q: 'What is the main difference between Petpooja and POSist?',
                a: 'Petpooja targets small-to-medium restaurants with affordable pricing and strong Zomato/Swiggy integration. POSist (now Restroworks) targets enterprise chains with advanced multi-location analytics and international presence.',
              },
              {
                q: 'Which is cheaper — Petpooja or POSist?',
                a: 'Petpooja is cheaper, starting at ₹1,000+/month. POSist uses custom enterprise pricing typically ranging from ₹2,000-5,000+/month depending on outlets and features needed.',
              },
              {
                q: 'Is Petpooja or POSist better for Zomato and Swiggy integration?',
                a: 'Petpooja has superior delivery aggregator integration with direct API connections, auto-accept for orders, and real-time menu syncing. POSist integrates too, but delivery workflows are not its primary strength.',
              },
              {
                q: 'Which POS is better for large restaurant chains?',
                a: 'POSist (Restroworks) is generally better for chains with 10+ outlets due to its centralized analytics, franchise management, enterprise SLAs, and dedicated account management.',
              },
              {
                q: 'Are there alternatives to both Petpooja and POSist?',
                a: 'Yes. DineOpen offers AI-powered features at ₹300/month with zero transaction fees. It is a modern alternative for restaurants wanting automation at a lower price point.',
              },
            ].map((faq, i) => (
              <div key={i} style={{
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #e5e7eb',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{faq.q}</h3>
                <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.7', margin: 0 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Reading */}
      <section style={{ padding: '48px 20px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Reading</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              { title: 'Petpooja Alternative', href: '/alternatives/petpooja', desc: 'Full alternative comparison' },
              { title: 'POSist Alternative', href: '/alternatives/posist', desc: 'Full alternative comparison' },
              { title: 'DineOpen vs Petpooja', href: '/vs/dineopen-vs-petpooja', desc: 'Side-by-side with DineOpen' },
              { title: 'DineOpen vs POSist', href: '/vs/dineopen-vs-posist', desc: 'Side-by-side with DineOpen' },
              { title: 'Best POS India 2026', href: '/blog/best-restaurant-pos-systems-india-comparison-2024', desc: 'Complete market guide' },
              { title: 'Restaurant Billing Guide', href: '/blog/restaurant-billing-app-complete-guide', desc: 'Buyer&apos;s guide for billing apps' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #e5e7eb', textDecoration: 'none', display: 'block', backgroundColor: '#ffffff' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '4px' }}>{link.title}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>{link.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <InternalLinks currentPath="/vs/petpooja-vs-posist" variant="alternative" />
    </div>
  );
}
