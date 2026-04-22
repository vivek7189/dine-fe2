'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaCheck, FaTimes, FaCheckCircle, FaSpinner, FaPaperPlane, FaPhone, FaEnvelope } from 'react-icons/fa';
import apiClient from '../../lib/api';

export default function PricingClient() {
  const [currency, setCurrency] = useState('INR');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  // Demo Modal State
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoContactType, setDemoContactType] = useState('phone');
  const [demoPhone, setDemoPhone] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [demoRestaurantName, setDemoRestaurantName] = useState('');
  const [demoComment, setDemoComment] = useState('');
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);
  const [demoError, setDemoError] = useState('');

  const handleSubmitDemoRequest = async () => {
    if (demoContactType === 'phone' && !demoPhone.trim()) return setDemoError('Phone number is required');
    if (demoContactType === 'email' && !demoEmail.trim()) return setDemoError('Email is required');
    setDemoSubmitting(true); setDemoError('');
    try {
      let comment = '';
      if (demoRestaurantName.trim()) comment = `Restaurant: ${demoRestaurantName.trim()}`;
      if (demoComment.trim()) comment = comment ? `${comment}\n${demoComment.trim()}` : demoComment.trim();
      await apiClient.submitDemoRequest(demoContactType, demoPhone.trim(), demoEmail.trim(), comment);
      setDemoSuccess(true);
      setTimeout(() => {
        setShowDemoModal(false);
        setDemoSuccess(false);
        setDemoRestaurantName('');
        setDemoPhone('');
        setDemoEmail('');
        setDemoComment('');
      }, 2000);
    } catch (error) { setDemoError(error.message || 'Failed to submit demo request.'); }
    finally { setDemoSubmitting(false); }
  };

  const closeDemoModal = () => {
    setShowDemoModal(false);
    setDemoRestaurantName('');
    setDemoPhone('');
    setDemoEmail('');
    setDemoComment('');
    setDemoError('');
    setDemoSuccess(false);
  };

  const prices = {
    INR: {
      symbol: '₹',
      starter:  { monthly: 299,  annual: 250,  monthlyStrike: 999,  annualBilled: 3000 },
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
  // For INR annual: show yearly total directly (₹3000/year instead of ₹250/month)
  const showYearlyTotal = currency === 'INR' && cycle === 'annual';
  const getPrice = (planKey) => showYearlyTotal ? currentPrice[planKey].annualBilled : currentPrice[planKey][cycle];
  const getStrike = (planKey) => showYearlyTotal ? currentPrice[planKey].monthlyStrike * 12 : currentPrice[planKey].monthlyStrike;
  const getPriceSuffix = () => showYearlyTotal ? '/year' : '/month';
  const getBilledNote = (planKey) => {
    if (showYearlyTotal) return '';
    if (cycle === 'annual') return `Billed ${currentPrice.symbol}${currentPrice[planKey].annualBilled}/year`;
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
            Simple, transparent pricing.<br />No surprises, ever.
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '680px', margin: '0 auto 32px' }}>
            Plans start from <strong style={{ color: '#ef4444' }}>{currentPrice.symbol}{showYearlyTotal ? currentPrice.starter.annualBilled : currentPrice.starter[cycle]}{getPriceSuffix()}</strong>. AI features included. Zero transaction fees. No hidden costs. Cancel anytime.
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
                    <span style={{ fontSize: '16px', color: '#6b7280', marginLeft: '4px' }}>{getPriceSuffix()}</span>
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
              <button
                onClick={() => setShowDemoModal(true)}
                style={{
                  display: 'inline-block',
                  padding: '14px 32px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: '700',
                  border: 'none',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                }}
              >
                📅 Book a Demo →
              </button>
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
            <button
              onClick={() => setShowDemoModal(true)}
              style={{ display: 'inline-block', padding: '16px 36px', backgroundColor: 'white', color: '#111827', border: '2px solid #111827', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              📅 Book a Demo
            </button>
          </div>
        </div>
      </div>
      {/* Demo Modal */}
      {showDemoModal && (
        <div onClick={closeDemoModal} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            {/* Top accent bar */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #ef4444, #f97316, #ef4444)' }} />

            {/* Close button */}
            <button
              onClick={closeDemoModal}
              style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'rgba(0,0,0,0.05)', fontSize: '16px', cursor: 'pointer', color: '#9ca3af', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', zIndex: 1, transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; e.currentTarget.style.color = '#374151'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#9ca3af'; }}
            >
              <FaTimes size={12} />
            </button>

            {demoSuccess ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FaCheckCircle size={32} color="white" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: '#111827' }}>Request Submitted!</h3>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>We&apos;ll contact you shortly to schedule your demo.</p>
              </div>
            ) : (
              <div style={{ padding: '24px 28px 28px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px', color: '#111827' }}>Get a Free Demo</h3>
                  <p style={{ fontSize: '13px', color: '#9ca3af' }}>See DineOpen in action for your restaurant</p>
                </div>

                {/* Contact info banner */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '10px 16px', background: '#f8fafc', borderRadius: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <a href="mailto:info@dineopen.com" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', textDecoration: 'none', fontWeight: '500' }}>
                    <FaEnvelope size={11} color="#ef4444" /> info@dineopen.com
                  </a>
                  <span style={{ color: '#d1d5db', fontSize: '12px' }}>|</span>
                  <a href="tel:+919528632779" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', textDecoration: 'none', fontWeight: '500' }}>
                    <FaPhone size={11} color="#ef4444" /> +91 95286 32779
                  </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Contact method toggle + input */}
                  <div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                      <button
                        onClick={() => { setDemoContactType('phone'); setDemoEmail(''); }}
                        style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${demoContactType === 'phone' ? '#ef4444' : '#e5e7eb'}`, background: demoContactType === 'phone' ? '#fef2f2' : 'white', color: demoContactType === 'phone' ? '#ef4444' : '#6b7280', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FaPhone size={10} /> Phone</span>
                      </button>
                      <button
                        onClick={() => { setDemoContactType('email'); setDemoPhone(''); }}
                        style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: `1.5px solid ${demoContactType === 'email' ? '#ef4444' : '#e5e7eb'}`, background: demoContactType === 'email' ? '#fef2f2' : 'white', color: demoContactType === 'email' ? '#ef4444' : '#6b7280', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FaEnvelope size={10} /> Email</span>
                      </button>
                    </div>
                    {demoContactType === 'phone' ? (
                      <input
                        type="tel"
                        placeholder="+91 95286 32779"
                        value={demoPhone}
                        onChange={(e) => setDemoPhone(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', transition: 'all 0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                      />
                    ) : (
                      <input
                        type="email"
                        placeholder="your@email.com"
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', transition: 'all 0.2s', boxSizing: 'border-box' }}
                        onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                      />
                    )}
                  </div>

                  {/* Restaurant name */}
                  <input
                    type="text"
                    placeholder="Restaurant name (optional)"
                    value={demoRestaurantName}
                    onChange={(e) => setDemoRestaurantName(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />

                  {/* Additional details */}
                  <textarea
                    placeholder="Tell us about your restaurant (optional)"
                    value={demoComment}
                    onChange={(e) => setDemoComment(e.target.value)}
                    rows={2}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', resize: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.outline = 'none'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />

                  {demoError && (
                    <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>
                      {demoError}
                    </div>
                  )}

                  <button
                    onClick={handleSubmitDemoRequest}
                    disabled={demoSubmitting}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', background: demoSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', fontWeight: '700', fontSize: '15px', border: 'none', cursor: demoSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    onMouseEnter={(e) => { if (!demoSubmitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.35)'; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {demoSubmitting ? (
                      <><FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...</>
                    ) : (
                      <><FaPaperPlane size={13} /> Request Demo</>
                    )}
                  </button>
                </div>

                <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '14px', lineHeight: '1.5' }}>
                  No spam, no commitment. We&apos;ll reach out within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
