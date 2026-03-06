'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Breadcrumb from '../../components/Breadcrumb';
import Footer from '../../components/Footer';
import InternalLinks from '../../components/InternalLinks';

const posData = [
  {
    name: 'DineOpen',
    price: '₹300/month',
    trial: '30-day free trial',
    bestFor: 'Small to mid-size restaurants wanting an affordable all-in-one with AI',
    pros: [
      'Lowest price in the market at ₹300/month with zero transaction fees',
      'AI voice ordering in Hindi, English, Tamil, Marathi and more',
      'AI-powered menu extraction from photos — set up in minutes',
      'Cloud-based: works on any phone, tablet, or laptop',
      'Includes KDS, inventory, loyalty, waiter app, analytics in base price',
      'Offline billing mode for unreliable internet areas',
    ],
    cons: [
      'No Zomato/Swiggy integration — not ideal if aggregator orders are a big part of your revenue',
      'Newer brand — less market presence compared to Petpooja or POSist',
      'No dedicated hardware — relies on your existing devices',
    ],
    verdict: 'Best value for money if you primarily do dine-in or direct orders. The AI features are genuinely useful, not gimmicky. But if Zomato/Swiggy orders are 30%+ of your business, the lack of aggregator integration is a real limitation.',
    highlight: true,
  },
  {
    name: 'Petpooja',
    price: '₹1,000+/month',
    trial: '14-day trial',
    bestFor: 'Restaurants heavily dependent on Zomato/Swiggy orders',
    pros: [
      'Strongest Zomato/Swiggy/aggregator integration in the market',
      '15+ years in the Indian market — large dealer and support network',
      'Wide range of hardware options and integrations',
      'Good for multi-outlet management',
      'Strong payment gateway partnerships',
    ],
    cons: [
      'Add-on pricing model — inventory, CRM, online ordering cost extra',
      'Total cost often reaches ₹2,000-3,000/month with needed add-ons',
      'UI feels dated compared to newer competitors',
      'Setup typically requires a technician visit (1-3 days)',
      'Per-transaction fees on some integrations',
    ],
    verdict: 'The safe, established choice. If you get a lot of Zomato and Swiggy orders, Petpooja&apos;s integration alone can justify the higher price. But be aware of the add-on pricing — the ₹1,000 base price rarely tells the full story.',
    highlight: false,
  },
  {
    name: 'POSist (Restroworks)',
    price: '₹2,000-5,000+/month',
    trial: 'Demo only',
    bestFor: 'Restaurant chains with 10+ outlets needing enterprise features',
    pros: [
      'Purpose-built for multi-outlet chain management',
      'Strong CRM and customer data analytics',
      'Good delivery aggregator integrations',
      'Robust reporting for franchise operations',
      'International presence — good if you plan to expand abroad',
    ],
    cons: [
      'Expensive — not practical for single-outlet restaurants',
      'Complex setup requiring professional onboarding',
      'Overkill for small restaurants — you pay for features you won&apos;t use',
      'Long-term contracts often required',
      'Custom pricing means you have to negotiate',
    ],
    verdict: 'If you run a chain of 10+ restaurants and need centralized control, POSist is worth the premium. For a single restaurant or even 2-3 outlets, it&apos;s overpriced and overcomplicated.',
    highlight: false,
  },
  {
    name: 'Gofrugal',
    price: '₹15,000-30,000 one-time',
    trial: 'Demo only',
    bestFor: 'Retail-restaurant combos and businesses preferring desktop software',
    pros: [
      'One-time license fee — no recurring monthly costs',
      'Strong retail + restaurant hybrid features',
      'Deep inventory and supply chain management',
      'Works fully offline — no internet dependency',
      'Good for restaurants attached to grocery stores or bakeries',
    ],
    cons: [
      'Desktop-based — tied to specific computers, not truly cloud',
      'High upfront cost can be a barrier for new restaurants',
      'Interface is functional but not modern',
      'Mobile access is limited compared to cloud-native solutions',
      'Annual maintenance charges (AMC) apply for updates and support',
    ],
    verdict: 'A solid choice if you want to pay once and own your software, especially for bakery-restaurants or restaurant-retail combos. But the desktop-first approach feels increasingly outdated as the industry moves to cloud and mobile.',
    highlight: false,
  },
  {
    name: 'Marg ERP',
    price: '₹4,500/year',
    trial: 'Demo available',
    bestFor: 'Restaurants that prioritize accounting and GST compliance above all else',
    pros: [
      'Extremely strong accounting and GST features',
      'Very affordable at ₹4,500/year',
      'Deep tax compliance — GSTR filing support',
      'Large chartered accountant network familiar with the software',
      'Good for businesses with complex tax structures',
    ],
    cons: [
      'POS features are basic compared to dedicated restaurant POS systems',
      'Desktop-only with a dated Windows interface',
      'No AI features, no modern ordering workflows',
      'Kitchen display, waiter app not available',
      'Restaurant-specific features (table management, KOT) are afterthoughts',
      'Steep learning curve for restaurant staff',
    ],
    verdict: 'If your accountant insists on Marg and you mainly need billing + GST compliance, it works. But as a restaurant POS, it lacks the operational features (KDS, waiter app, table management) that dedicated systems offer.',
    highlight: false,
  },
];

const decisionMatrix = [
  {
    type: 'Small Dhaba / Street Food',
    budget: '₹300-500/month',
    recommendation: 'DineOpen',
    reason: 'Cheapest option, works on a basic Android phone, offline billing, simple interface that staff can learn in 15 minutes. No need for aggregator integration at this level.',
  },
  {
    type: 'Casual Dining (1-3 outlets)',
    budget: '₹1,000-3,000/month',
    recommendation: 'DineOpen or Petpooja',
    reason: 'DineOpen if you prioritize cost and AI features. Petpooja if Zomato/Swiggy orders are a significant revenue channel. Both handle GST, KOT, and inventory well.',
  },
  {
    type: 'Fine Dining',
    budget: '₹2,000-5,000/month',
    recommendation: 'POSist or Petpooja',
    reason: 'Fine dining needs strong CRM, reservation management, and detailed customer data. POSist&apos;s CRM features are best-in-class for this segment.',
  },
  {
    type: 'Restaurant Chain (10+ outlets)',
    budget: '₹5,000+/month',
    recommendation: 'POSist (Restroworks)',
    reason: 'Centralized menu management, franchise reporting, and multi-location analytics. The higher cost is justified at scale.',
  },
  {
    type: 'Cloud Kitchen',
    budget: '₹1,000-2,000/month',
    recommendation: 'Petpooja or DineOpen',
    reason: 'Cloud kitchens live on aggregator platforms — Petpooja&apos;s Zomato/Swiggy integration is critical here. DineOpen works if you do your own delivery.',
  },
  {
    type: 'Bakery / Retail+Restaurant',
    budget: '₹15,000-30,000 one-time',
    recommendation: 'Gofrugal',
    reason: 'Best hybrid retail+restaurant features. One-time cost model suits bakeries with stable, predictable operations.',
  },
];

const checklist = [
  { item: 'GST-compliant billing', detail: 'Auto CGST/SGST calculation, HSN codes, tax reports' },
  { item: 'UPI and digital payments', detail: 'Accept UPI, cards, wallets directly from the POS' },
  { item: 'KOT (Kitchen Order Ticket)', detail: 'Digital KOT sent to kitchen display or printer' },
  { item: 'Offline billing mode', detail: 'Bills should work even when internet drops' },
  { item: 'Inventory management', detail: 'Track raw materials, get low-stock alerts, wastage tracking' },
  { item: 'Multi-language support', detail: 'Hindi, Tamil, Marathi, Telugu — important for staff usability' },
  { item: 'Reporting and analytics', detail: 'Daily sales, item-wise reports, peak hours, staff performance' },
  { item: 'Table management', detail: 'Visual table layout, merge/split bills, table-wise tracking' },
  { item: 'Delivery integration', detail: 'Zomato/Swiggy sync if aggregator orders are significant for you' },
  { item: 'Data export', detail: 'Export to Tally, Excel, or your accountant&apos;s preferred format' },
  { item: 'Mobile access', detail: 'Owner should be able to check sales from their phone anywhere' },
  { item: 'Customer data and loyalty', detail: 'Save customer info, track repeat visits, run loyalty programs' },
];

export default function BestPOSIndiaClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [expandedPOS, setExpandedPOS] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Best Restaurant POS India 2026' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero Section */}
      <section style={{
        padding: isMobile ? '50px 20px 60px' : '70px 40px 90px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 30%, #ffffff 100%)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            backgroundColor: '#dbeafe',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#1e40af',
            marginBottom: '24px',
          }}>
            Updated for 2026 — Independent Comparison
          </div>
          <h1 style={{
            fontSize: isMobile ? '32px' : '52px',
            fontWeight: '900',
            lineHeight: '1.1',
            color: '#111827',
            marginBottom: '24px',
            letterSpacing: '-2px',
          }}>
            Best Restaurant POS Systems in India (2026)
          </h1>
          <p style={{
            fontSize: isMobile ? '17px' : '20px',
            color: '#4b5563',
            lineHeight: '1.7',
            maxWidth: '750px',
            margin: '0 auto 20px',
          }}>
            India has 7.5 million+ restaurants, but only about 15% use a POS system. If you&apos;re one of the 85% still
            using manual billing, or looking to switch from an overpriced system — this guide compares the top 5 options
            with real pricing, real pros and cons, and honest recommendations.
          </p>
          <p style={{
            fontSize: '15px',
            color: '#6b7280',
            lineHeight: '1.6',
            maxWidth: '650px',
            margin: '0 auto',
          }}>
            The Indian F&amp;B industry is growing at 10-12% annually. The right POS system isn&apos;t just about billing
            — it&apos;s about GST compliance, inventory control, and understanding your business through data.
          </p>
        </div>
      </section>

      {/* What Indian Restaurants Actually Need */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        backgroundColor: '#ffffff',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px',
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            What Indian Restaurants Actually Need from a POS
          </h2>
          <p style={{
            fontSize: '17px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: '1.7',
          }}>
            Running a restaurant in India has unique challenges that generic international POS systems don&apos;t address.
            Here&apos;s what actually matters:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '20px',
          }}>
            {[
              {
                title: 'GST-Compliant Billing',
                desc: 'CGST, SGST, IGST auto-calculation is non-negotiable. Your POS must generate invoices that satisfy GST requirements, handle HSN/SAC codes, and produce reports your CA can use for GSTR filing.',
              },
              {
                title: 'UPI and Digital Payments',
                desc: 'India processes 10+ billion UPI transactions monthly. Your POS needs to accept UPI, PhonePe, Google Pay, Paytm, and cards — ideally with instant reconciliation so you&apos;re not manually matching payments.',
              },
              {
                title: 'Hindi and Regional Language Support',
                desc: 'Your staff may not be comfortable with English-only interfaces. POS systems that support Hindi, Tamil, Marathi, Telugu, or other regional languages see faster adoption and fewer billing errors.',
              },
              {
                title: 'Offline Mode',
                desc: 'Internet connectivity in India is improving but still unreliable in many areas. Your POS must work offline for billing, then sync data when connectivity returns. This is especially critical during peak hours.',
              },
              {
                title: 'Affordable Pricing',
                desc: 'The average Indian restaurant has tighter margins than Western counterparts. A POS that costs ₹5,000/month might make sense for a chain, but it&apos;s unaffordable for the lakhs of small restaurants and dhabas across India.',
              },
              {
                title: 'Simple Setup and Training',
                desc: 'Most restaurant staff in India aren&apos;t tech-savvy. The POS needs to be learnable in 15-30 minutes, not require days of training. Photo-based menu setup and intuitive interfaces make a huge difference.',
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '28px',
                borderRadius: '14px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#fafafa',
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#4b5563', margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top 5 Comparison */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px',
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            Top 5 Restaurant POS Systems in India 2026
          </h2>
          <p style={{
            fontSize: '17px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: '1.7',
          }}>
            We&apos;ve compared these based on pricing, features, ease of use, and suitability for different
            restaurant types. No vendor paid for placement on this list.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {posData.map((pos, index) => (
              <div key={index} style={{
                borderRadius: '16px',
                border: pos.highlight ? '2px solid #16a34a' : '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
              }}>
                {/* Header - always visible */}
                <div
                  onClick={() => setExpandedPOS(expandedPOS === index ? -1 : index)}
                  style={{
                    padding: isMobile ? '20px' : '28px 32px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    backgroundColor: pos.highlight ? '#f0fdf4' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '800',
                      color: '#9ca3af',
                      minWidth: '24px',
                    }}>
                      #{index + 1}
                    </span>
                    <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: '#111827', margin: 0 }}>
                      {pos.name}
                    </h3>
                    {pos.highlight && (
                      <span style={{
                        padding: '3px 10px',
                        backgroundColor: '#dcfce7',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#166534',
                      }}>
                        Best Value
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{pos.price}</span>
                    <span style={{
                      fontSize: '13px',
                      color: '#6b7280',
                      backgroundColor: '#f3f4f6',
                      padding: '4px 10px',
                      borderRadius: '8px',
                    }}>
                      {pos.trial}
                    </span>
                    <span style={{
                      fontSize: '20px',
                      color: '#9ca3af',
                      transform: expandedPOS === index ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      display: 'inline-block',
                    }}>
                      &#9660;
                    </span>
                  </div>
                </div>

                {/* Expanded content */}
                {expandedPOS === index && (
                  <div style={{
                    padding: isMobile ? '0 20px 24px' : '0 32px 32px',
                    borderTop: '1px solid #f3f4f6',
                    paddingTop: '24px',
                  }}>
                    <p style={{
                      fontSize: '15px',
                      color: '#6b7280',
                      marginBottom: '24px',
                      fontStyle: 'italic',
                    }}>
                      Best for: {pos.bestFor}
                    </p>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                      gap: '24px',
                      marginBottom: '24px',
                    }}>
                      {/* Pros */}
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#16a34a', marginBottom: '12px' }}>
                          What&apos;s Good
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'none' }}>
                          {pos.pros.map((pro, i) => (
                            <li key={i} style={{
                              fontSize: '14px',
                              lineHeight: '1.7',
                              color: '#374151',
                              marginBottom: '6px',
                              position: 'relative',
                              paddingLeft: '4px',
                            }}>
                              <span style={{ color: '#16a34a', marginRight: '8px' }}>+</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#dc2626', marginBottom: '12px' }}>
                          What&apos;s Not
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'none' }}>
                          {pos.cons.map((con, i) => (
                            <li key={i} style={{
                              fontSize: '14px',
                              lineHeight: '1.7',
                              color: '#374151',
                              marginBottom: '6px',
                              position: 'relative',
                              paddingLeft: '4px',
                            }}>
                              <span style={{ color: '#dc2626', marginRight: '8px' }}>-</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Verdict */}
                    <div style={{
                      padding: '20px 24px',
                      backgroundColor: '#f9fafb',
                      borderRadius: '12px',
                      borderLeft: '4px solid #3b82f6',
                    }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af', marginBottom: '6px' }}>
                        Our Honest Take
                      </p>
                      <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', margin: 0 }}>
                        {pos.verdict}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Comparison Table */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        backgroundColor: '#ffffff',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '40px',
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            Quick Comparison Table
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
              minWidth: '800px',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Feature</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', color: '#16a34a', borderBottom: '2px solid #16a34a', backgroundColor: '#f0fdf4' }}>DineOpen</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Petpooja</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>POSist</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Gofrugal</th>
                  <th style={{ padding: '14px 12px', textAlign: 'left', fontWeight: '700', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Marg ERP</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Monthly Cost', dineopen: '₹300/mo', petpooja: '₹1,000+/mo', posist: '₹2,000-5,000+/mo', gofrugal: '₹15K-30K one-time', marg: '₹4,500/year' },
                  { feature: 'Transaction Fees', dineopen: 'None', petpooja: '1.5-2%', posist: 'Varies', gofrugal: 'None', marg: 'None' },
                  { feature: 'Cloud-Based', dineopen: 'Yes', petpooja: 'Yes', posist: 'Yes', gofrugal: 'Desktop + cloud add-on', marg: 'Desktop only' },
                  { feature: 'GST Billing', dineopen: 'Full', petpooja: 'Full', posist: 'Full', gofrugal: 'Full', marg: 'Strongest' },
                  { feature: 'Zomato/Swiggy', dineopen: 'No', petpooja: 'Best-in-class', posist: 'Yes', gofrugal: 'Limited', marg: 'No' },
                  { feature: 'AI Features', dineopen: 'Voice ordering, menu extraction', petpooja: 'No', posist: 'Basic analytics', gofrugal: 'No', marg: 'No' },
                  { feature: 'Offline Mode', dineopen: 'Yes', petpooja: 'Yes', posist: 'Limited', gofrugal: 'Full (desktop)', marg: 'Full (desktop)' },
                  { feature: 'KDS Included', dineopen: 'Yes', petpooja: 'Add-on', posist: 'Yes', gofrugal: 'Add-on', marg: 'No' },
                  { feature: 'Inventory', dineopen: 'Included', petpooja: 'Add-on', posist: 'Included', gofrugal: 'Included', marg: 'Basic' },
                  { feature: 'Setup Time', dineopen: '15 minutes', petpooja: '1-3 days', posist: '3-7 days', gofrugal: '1-2 days', marg: '1-2 days' },
                  { feature: 'Best For', dineopen: 'Small-mid restaurants', petpooja: 'Aggregator-heavy', posist: 'Large chains', gofrugal: 'Retail+restaurant', marg: 'Accounting-first' },
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: '600', color: '#111827' }}>{row.feature}</td>
                    <td style={{ padding: '12px', color: '#16a34a', fontWeight: '500', backgroundColor: '#fafff9' }}>{row.dineopen}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{row.petpooja}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{row.posist}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{row.gofrugal}</td>
                    <td style={{ padding: '12px', color: '#4b5563' }}>{row.marg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
            color: '#9ca3af',
            fontStyle: 'italic',
          }}>
            Pricing as of early 2026. Contact each vendor for latest quotes. Add-on costs can significantly increase total spend.
          </p>
        </div>
      </section>

      {/* How to Choose - Decision Matrix */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px',
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            How to Choose: Match Your Restaurant Type
          </h2>
          <p style={{
            fontSize: '17px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: '1.7',
          }}>
            There&apos;s no single &quot;best&quot; POS. The right choice depends on your restaurant type,
            budget, and what matters most to your business.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '20px',
          }}>
            {decisionMatrix.map((item, i) => (
              <div key={i} style={{
                padding: '28px',
                borderRadius: '14px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>
                    {item.type}
                  </h3>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.budget}
                  </span>
                </div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#1e40af',
                  marginBottom: '8px',
                }}>
                  Recommended: {item.recommendation}
                </p>
                <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#4b5563', margin: 0 }}>
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Look For - Checklist */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        backgroundColor: '#ffffff',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '16px',
            textAlign: 'center',
            letterSpacing: '-1px',
          }}>
            What to Look For: Your POS Checklist
          </h2>
          <p style={{
            fontSize: '17px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: '1.7',
          }}>
            Before you sign up for any POS, make sure it checks these boxes. Print this list and ask each vendor about every item.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '16px',
          }}>
            {checklist.map((check, i) => (
              <div key={i} style={{
                padding: '20px 24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#fafafa',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
              }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  border: '2px solid #d1d5db',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  fontSize: '14px',
                  color: '#9ca3af',
                }}>
                  &#9744;
                </span>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                    {check.item}
                  </p>
                  <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#6b7280', margin: 0 }}>
                    {check.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#ffffff',
            marginBottom: '20px',
            lineHeight: '1.2',
            letterSpacing: '-1px',
          }}>
            Ready to Try the Most Affordable Restaurant POS in India?
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#9ca3af',
            marginBottom: '16px',
            lineHeight: '1.7',
          }}>
            DineOpen starts at ₹300/month with zero transaction fees. AI voice ordering, cloud POS, GST billing,
            inventory, KDS, and loyalty — all included. No add-on pricing. Set up in 15 minutes.
          </p>
          <p style={{
            fontSize: '15px',
            color: '#6b7280',
            marginBottom: '36px',
            lineHeight: '1.6',
          }}>
            Honest note: If you need Zomato/Swiggy integration, consider Petpooja. If you&apos;re a 10+ outlet chain,
            look at POSist. But if you want the best value for a standalone restaurant — give DineOpen a try.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://dineopen.com/login" style={{
              padding: '18px 40px',
              fontSize: '17px',
              fontWeight: '700',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              boxShadow: '0 4px 20px rgba(22, 163, 74, 0.4)',
            }}>
              Start 30-Day Free Trial
            </a>
            <Link href="/pricing" style={{
              padding: '18px 40px',
              fontSize: '17px',
              fontWeight: '700',
              borderRadius: '12px',
              background: 'transparent',
              color: '#ffffff',
              border: '2px solid #4b5563',
              textDecoration: 'none',
              display: 'inline-block',
            }}>
              View Full Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Related Reading */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 40px',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: isMobile ? '24px' : '32px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '32px',
            textAlign: 'center',
            letterSpacing: '-0.5px',
          }}>
            Related Reading
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '16px',
          }}>
            {[
              { title: 'Free Restaurant Billing Software', href: '/free-restaurant-billing-software', desc: 'Start with a 30-day free trial of DineOpen' },
              { title: 'DineOpen vs Petpooja', href: '/alternatives/petpooja', desc: 'Detailed head-to-head comparison' },
              { title: 'GST Billing Software for Restaurants', href: '/gst-billing-software-restaurant', desc: 'Everything about GST compliance for restaurants' },
              { title: 'Restaurant POS Features', href: '/features', desc: 'Complete feature breakdown of DineOpen' },
              { title: 'Pricing Plans', href: '/pricing', desc: 'Transparent pricing — no hidden fees' },
              { title: 'Free GST Calculator', href: '/tools/gst-calculator', desc: 'Calculate GST on restaurant bills instantly' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{
                padding: '20px 24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                textDecoration: 'none',
                display: 'block',
                transition: 'border-color 0.2s',
              }}>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>
                  {link.title}
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                  {link.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <InternalLinks currentPath="/best-restaurant-pos-india" variant="tool" />
      <Footer />
    </div>
  );
}
