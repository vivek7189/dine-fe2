'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function PricingClient() {
  const [currency, setCurrency] = useState('INR');
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'

  // Price tables. Annual prices are billed yearly but shown as effective
  // per-month so users see the discount visually. Annual = ~17% off monthly
  // (2 months free), which is the standard SaaS discount and easy to message.
  //
  // India-first strategy:
  //   ₹400 base price = lowest in the Indian POS market (Petpooja real
  //   out-the-door cost is ₹1,800-3,500/mo once add-ons are factored in).
  //   Even our Pro tier at ₹1,499/mo annual undercuts Petpooja by ~₹500/mo
  //   while bundling AI features Petpooja doesn't have.
  const prices = {
    INR: {
      symbol: '₹',
      starter:  { monthly: 400,  annual: 333,  monthlyStrike: 999,  annualBilled: 3996 },
      growth:   { monthly: 899,  annual: 749,  monthlyStrike: 1999, annualBilled: 8988 },
      pro:      { monthly: 1799, annual: 1499, monthlyStrike: 3999, annualBilled: 17988 },
    },
    USD: {
      symbol: '$',
      starter:  { monthly: 10, annual: 8,  monthlyStrike: 29,  annualBilled: 96 },
      growth:   { monthly: 22, annual: 18, monthlyStrike: 59,  annualBilled: 216 },
      pro:      { monthly: 45, annual: 37, monthlyStrike: 119, annualBilled: 444 },
    },
    GBP: {
      symbol: '£',
      starter:  { monthly: 8,  annual: 7,  monthlyStrike: 24, annualBilled: 84 },
      growth:   { monthly: 18, annual: 15, monthlyStrike: 49, annualBilled: 180 },
      pro:      { monthly: 36, annual: 30, monthlyStrike: 99, annualBilled: 360 },
    },
  };

  const currentPrice = prices[currency];
  const cycle = billingCycle; // 'monthly' or 'annual'

  // Helper to pull the right number for the active billing cycle
  const getPrice = (planKey) => currentPrice[planKey][cycle];
  const getStrike = (planKey) => currentPrice[planKey].monthlyStrike;
  const getBilledNote = (planKey) => {
    if (cycle === 'annual') {
      return `Billed ${currentPrice.symbol}${currentPrice[planKey].annualBilled}/year`;
    }
    return 'Billed monthly';
  };

  const plans = [
    {
      key: 'starter',
      name: 'Starter',
      tagline: 'For new restaurants & cafes',
      description: 'Everything a single outlet needs to run billing, KOT printing, and QR ordering.',
      cta: 'Start Free Trial',
      ctaLink: 'https://dineopen.com/login',
      popular: false,
      features: [
        '1 outlet',
        'Unlimited orders & menu items',
        'Unlimited staff accounts',
        'Cloud POS (web + Android tablet)',
        'KOT thermal printing (Bluetooth/USB/network)',
        'QR menu & QR ordering',
        'Bill printing with GST',
        'Basic inventory tracking',
        'Daily sales reports',
        'WhatsApp & email support',
        '0% transaction fees',
      ],
      excluded: [
        'AI Voice Ordering',
        'Multi-outlet management',
        'Captain / Waiter app',
      ],
    },
    {
      key: 'growth',
      name: 'Growth',
      tagline: 'For busy restaurants',
      description: 'Everything in Starter + AI features, advanced inventory, captain app, and customer loyalty.',
      cta: 'Start Free Trial',
      ctaLink: 'https://dineopen.com/login',
      popular: true,
      features: [
        'Up to 2 outlets',
        'Everything in Starter, plus:',
        'AI Voice Ordering (waiter speaks, AI takes order)',
        'AI Menu Generator & AI Insights',
        'AI Sales Assistant',
        'Captain / Waiter app (Android & iOS)',
        'Kitchen Display System (KDS)',
        'Advanced inventory (recipes, vendors, stock alerts)',
        'Multi-tier pricing (AC / Non-AC / Takeaway)',
        'Customer loyalty & khata (credit ledger)',
        'Table management & reservations',
        'Online ordering website (your branded)',
        'WhatsApp ordering bot',
        'Advanced analytics & profit reports',
        'Priority chat & phone support',
      ],
      excluded: [],
    },
    {
      key: 'pro',
      name: 'Pro',
      tagline: 'For restaurant chains',
      description: 'Everything in Growth + multi-outlet chain dashboard and centralized control.',
      cta: 'Start Free Trial',
      ctaLink: 'https://dineopen.com/login',
      popular: false,
      features: [
        'Up to 5 outlets',
        'Everything in Growth, plus:',
        'Centralized chain dashboard',
        'Cross-outlet analytics & reporting',
        'Centralized menu & inventory management',
        'Centralized staff & role management',
        'Outlet-wise profit & loss',
        'Franchise-ready architecture',
        'API access for custom integrations',
        'Aggregator integration (Swiggy / Zomato sync)',
        'Custom user roles & permissions',
        'Dedicated onboarding session',
        'Priority 24/7 support',
      ],
      excluded: [],
    },
  ];

  // Enterprise tier — always custom, drives demo bookings
  const enterprise = {
    name: 'Enterprise',
    tagline: 'For 5+ outlets, franchises & cloud kitchens',
    description:
      'Custom pricing for large chains. Unlimited outlets, dedicated account manager, custom integrations, on-site training, and SLA-backed support.',
    bullets: [
      'Unlimited outlets',
      'Dedicated Customer Success Manager',
      'Custom integrations & API access',
      'On-site training & onboarding',
      'White-label customer app',
      'Custom reports & dashboards',
      'SLA-backed uptime guarantee',
      'Priority feature requests',
      'Volume discounts on AI usage',
      'Contract-based billing',
    ],
  };

  // Competitor comparison row (India). Numbers are real out-the-door prices
  // including the add-ons most restaurants need (KOT printer module, captain
  // app, inventory module). Petpooja's headline ₹833/mo is misleading once
  // add-ons are factored in.
  const compare = [
    { name: 'DineOpen Growth',     price: '₹749/mo',          ai: true,  txn: '0%',     setup: 'Free' },
    { name: 'Petpooja (real cost)', price: '₹1,800-3,500/mo', ai: false, txn: '0%',     setup: '₹3,000+' },
    { name: 'Restroworks (POSist)', price: '₹2,000-4,000/mo', ai: false, txn: '0%',     setup: '₹5,000+' },
    { name: 'PosBytz Pro',          price: '₹1,499/mo',       ai: false, txn: '0%',     setup: 'Paid' },
    { name: 'Limetray',             price: '₹1,500-5,000/mo', ai: false, txn: '0%',     setup: 'Paid' },
    { name: 'Toast (US)',           price: '₹5,800/mo',       ai: false, txn: '2.49%',  setup: 'Paid' },
    { name: 'Square (US)',          price: '₹0 + 2.6%',       ai: false, txn: '2.6%',   setup: 'Free' },
  ];

  const faqs = [
    { q: 'Is there a free trial?', a: 'Yes — 14-day free trial on all plans. No credit card required. Full access to every feature.' },
    { q: 'Why is DineOpen so much cheaper than Petpooja or Restroworks?', a: 'We are a modern cloud-native product built by a small team — no legacy infrastructure, no sales armies, no expensive offices. We pass those savings to you. We also bundle AI features (Voice Ordering, AI Menu Generator, AI Insights) that competitors charge extra for or don\'t offer at all.' },
    { q: 'What are the transaction fees?', a: 'DineOpen charges 0% transaction fees, ever. You only pay your payment processor (Razorpay, Paytm, Stripe) at their standard rates — and even those are 0% for UPI in India when using our recommended Paytm integration.' },
    { q: 'Can I switch plans later?', a: 'Yes — upgrade or downgrade anytime from your dashboard. Changes take effect immediately and we prorate the difference.' },
    { q: 'Is there a long-term contract?', a: 'No. Monthly plans are pay-as-you-go and you can cancel anytime. Annual plans save you ~17% (2 months free) but are also flexible — you can cancel at the end of the term.' },
    { q: 'What payment methods do you accept?', a: 'India: UPI, all credit/debit cards, net banking, Razorpay, Paytm. International: Stripe, all major cards, PayPal.' },
    { q: 'Do you offer discounts for annual billing?', a: 'Yes — annual billing saves you ~17% compared to monthly (effectively 2 months free). The discount is shown automatically when you toggle annual.' },
    { q: 'I am moving from Petpooja / Restroworks. Do you help migrate?', a: 'Yes! We offer free menu and customer data migration from Petpooja, Restroworks, PosBytz, Square, and Toast. Our team handles the entire transition. Just book a demo and we\'ll take care of it.' },
    { q: 'What hardware do I need?', a: 'Just an Android tablet/phone (or any computer with a browser) and a thermal printer (Bluetooth, USB, or network). Use any printer you already have — we support all major brands. No proprietary hardware lock-in.' },
    { q: 'Is my data safe?', a: 'Yes. All data is encrypted in transit (TLS 1.3) and at rest. We use Google Cloud Firestore for storage with daily backups. You own your data and can export it anytime.' },
    { q: 'Do you have an Enterprise plan for 10+ outlets?', a: 'Yes — book a demo and we\'ll build a custom plan for you with volume discounts, dedicated support, and any custom features you need.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '60px 20px 32px' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: '700', marginBottom: '20px' }}>
            ⚡ THE WORLD&apos;S MOST AFFORDABLE AI-POWERED POS
          </div>
          <h1 style={{ fontSize: '44px', fontWeight: '800', color: '#111827', marginBottom: '16px', lineHeight: '1.1' }}>
            Pricing built for restaurants,<br />not enterprise sales teams.
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '680px', margin: '0 auto 32px' }}>
            Plans start from <strong style={{ color: '#ef4444' }}>{currentPrice.symbol}{currentPrice.starter[cycle]}/month</strong>. AI features included. Zero transaction fees. No hidden costs. Cancel anytime.
          </p>

          {/* Currency + Billing Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'white', padding: '6px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              {['INR', 'USD', 'GBP'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: currency === c ? '#ef4444' : 'transparent',
                    color: currency === c ? 'white' : '#374151',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'white', padding: '6px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <button
                onClick={() => setBillingCycle('monthly')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: cycle === 'monthly' ? '#111827' : 'transparent',
                  color: cycle === 'monthly' ? 'white' : '#374151',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: cycle === 'annual' ? '#111827' : 'transparent',
                  color: cycle === 'annual' ? 'white' : '#374151',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Annual
                <span style={{ backgroundColor: '#10b981', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>SAVE 17%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards (3 main plans) */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {plans.map((plan) => {
              const price = getPrice(plan.key);
              const strike = getStrike(plan.key);
              const billedNote = getBilledNote(plan.key);
              return (
                <div
                  key={plan.key}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: plan.popular ? '0 12px 40px rgba(239, 68, 68, 0.25)' : '0 4px 20px rgba(0,0,0,0.06)',
                    border: plan.popular ? '2px solid #ef4444' : '1px solid #e5e7eb',
                    position: 'relative',
                    transform: plan.popular ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                  {plan.popular && (
                    <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '6px 18px', borderRadius: '999px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
                      ⭐ MOST POPULAR
                    </div>
                  )}

                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>{plan.name}</h2>
                  <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{plan.tagline}</p>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px', minHeight: '40px', lineHeight: '1.5' }}>{plan.description}</p>

                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '600', color: '#9ca3af', textDecoration: 'line-through' }}>{currentPrice.symbol}{strike}</span>
                    <span style={{ marginLeft: '8px', fontSize: '11px', color: '#10b981', fontWeight: '700', backgroundColor: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                      SAVE {Math.round((1 - price / strike) * 100)}%
                    </span>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ fontSize: '52px', fontWeight: '800', color: '#111827', lineHeight: '1' }}>{currentPrice.symbol}{price}</span>
                    <span style={{ fontSize: '16px', color: '#6b7280', marginLeft: '4px' }}>/month</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>{billedNote}</p>

                  <Link
                    href={plan.ctaLink}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      padding: '14px 24px',
                      backgroundColor: plan.popular ? '#ef4444' : 'white',
                      color: plan.popular ? 'white' : '#ef4444',
                      border: '2px solid #ef4444',
                      borderRadius: '10px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      marginBottom: '24px',
                      fontSize: '15px',
                    }}
                  >
                    {plan.cta} →
                  </Link>

                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {plan.features.map((f, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0' }}>
                        <FaCheck style={{ color: '#10b981', flexShrink: 0, marginTop: '4px', fontSize: '12px' }} />
                        <span style={{ color: '#374151', fontSize: '14px', lineHeight: '1.5' }}>{f}</span>
                      </li>
                    ))}
                    {plan.excluded.map((f, idx) => (
                      <li key={`x-${idx}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0' }}>
                        <FaTimes style={{ color: '#d1d5db', flexShrink: 0, marginTop: '4px', fontSize: '12px' }} />
                        <span style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.5' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enterprise tier — book demo */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 60px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
              borderRadius: '20px',
              padding: '40px',
              color: 'white',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'inline-block', backgroundColor: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.5px' }}>
                ENTERPRISE
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px', lineHeight: '1.2' }}>{enterprise.name}</h2>
              <p style={{ fontSize: '14px', color: '#fca5a5', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{enterprise.tagline}</p>
              <p style={{ fontSize: '16px', color: '#d1d5db', marginBottom: '24px', lineHeight: '1.6' }}>{enterprise.description}</p>
              <Link
                href="/contact"
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  fontSize: '15px',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                }}
              >
                📅 Book a Demo →
              </Link>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
                Custom pricing • Volume discounts • Free migration from any POS
              </p>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
              {enterprise.bullets.map((b, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '4px 0' }}>
                  <FaCheck style={{ color: '#10b981', flexShrink: 0, marginTop: '4px', fontSize: '12px' }} />
                  <span style={{ color: '#e5e7eb', fontSize: '14px', lineHeight: '1.5' }}>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Competitor comparison */}
        <div style={{ backgroundColor: 'white', padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '12px' }}>
              How DineOpen compares
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
              Real out-the-door prices including add-ons most restaurants actually need.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>POS</th>
                    <th style={{ padding: '16px', textAlign: 'left', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Built-in</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Txn Fee</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Setup Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {compare.map((row, idx) => {
                    const isUs = row.name.startsWith('DineOpen');
                    return (
                      <tr key={idx} style={{ borderTop: '1px solid #f3f4f6', backgroundColor: isUs ? '#fef2f2' : 'white' }}>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: isUs ? '800' : '600', color: isUs ? '#991b1b' : '#111827' }}>
                          {isUs && '⭐ '}{row.name}
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: isUs ? '#991b1b' : '#374151' }}>{row.price}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px' }}>
                          {row.ai ? <FaCheck style={{ color: '#10b981' }} /> : <FaTimes style={{ color: '#d1d5db' }} />}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: row.txn === '0%' ? '#10b981' : '#ef4444', fontWeight: '700' }}>{row.txn}</td>
                        <td style={{ padding: '16px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>{row.setup}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '16px', fontStyle: 'italic' }}>
              Pricing data based on publicly available information and customer-reported costs as of 2026. Petpooja headline price (₹833/mo) excludes mandatory add-ons.
            </p>
          </div>
        </div>

        {/* Zero Fees / Trust banner */}
        <div style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px', backgroundColor: '#ecfdf5', borderRadius: '16px', textAlign: 'center', border: '1px solid #a7f3d0' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#065f46', marginBottom: '8px' }}>
              🎯 Zero Transaction Fees. Forever.
            </h3>
            <p style={{ color: '#047857', fontSize: '15px', maxWidth: '680px', margin: '0 auto' }}>
              Square charges 2.6%. Toast charges 2.49%. Petpooja takes commission on online orders.
              DineOpen charges <strong>0%</strong>. On a restaurant doing ₹10 lakh/month, that&apos;s
              <strong> ₹26,000+ saved every month</strong>.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ backgroundColor: 'white', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <details key={idx} style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', cursor: 'pointer' }}>
                  <summary style={{ fontSize: '16px', fontWeight: '700', color: '#111827', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {faq.q}
                    <span style={{ color: '#ef4444', fontSize: '20px' }}>+</span>
                  </summary>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: '12px 0 0', lineHeight: '1.6' }}>{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div style={{ padding: '60px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            Start your 14-day free trial
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>
            Join 500+ restaurants already running on DineOpen.
          </p>
          <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '32px' }}>
            No credit card required • Free migration from your old POS • Cancel anytime
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '16px 36px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '16px', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' }}
            >
              Start Free Trial →
            </Link>
            <Link
              href="/contact"
              style={{ display: 'inline-block', padding: '16px 36px', backgroundColor: 'white', color: '#111827', border: '2px solid #111827', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}
            >
              📅 Book a Demo
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
