'use client';

import { useState } from 'react';
import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function PricingClient() {
  const [currency, setCurrency] = useState('USD');
  const [billingCycle, setBillingCycle] = useState('monthly');

  const prices = {
    USD: { spark: 9.99, sparkRegular: 29.99, blaze: 89, blazeRegular: 249, symbol: '$' },
    GBP: { spark: 8, sparkRegular: 24, blaze: 72, blazeRegular: 199, symbol: '£' },
    INR: { spark: 300, sparkRegular: 999, blaze: 2500, blazeRegular: 7500, symbol: '₹' },
  };

  const currentPrice = prices[currency];

  const plans = [
    {
      name: 'Spark',
      description: 'For growing restaurants',
      price: currentPrice.spark,
      regularPrice: currentPrice.sparkRegular,
      features: [
        { name: 'AI Agent (Voice & Chat)', included: true },
        { name: 'Unlimited Menu Items', included: true },
        { name: 'Up to 3 Locations', included: true },
        { name: 'Complete POS System', included: true },
        { name: 'Unlimited Tables', included: true },
        { name: 'Real-time Kitchen Display', included: true },
        { name: 'GST/Tax Billing', included: true },
        { name: 'Zero Transaction Fees', included: true },
        { name: 'Unlimited Locations', included: false },
        { name: 'Chain Dashboard', included: false },
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Blaze',
      description: 'For restaurant chains',
      price: currentPrice.blaze,
      regularPrice: currentPrice.blazeRegular,
      features: [
        { name: 'Everything in Spark', included: true },
        { name: 'AI Agent: 5,000 Credits', included: true },
        { name: 'Unlimited Locations', included: true },
        { name: 'Chain Dashboard', included: true },
        { name: 'Cross-location Analytics', included: true },
        { name: 'Centralized Menu Management', included: true },
        { name: 'Priority 24/7 Support', included: true },
        { name: 'API Access', included: true },
        { name: 'Custom Integrations', included: true },
        { name: 'Custom Reports', included: true },
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
  ];

  const faqs = [
    { q: 'Is there a free trial?', a: 'Yes! All plans include a free 30-day trial. No credit card required.' },
    { q: 'What are the transaction fees?', a: 'DineOpen charges 0% transaction fees. You only pay your payment processor (Razorpay, Stripe, etc.) directly.' },
    { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.' },
    { q: 'Is there a contract?', a: 'No long-term contracts. All plans are month-to-month. Cancel anytime.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, UPI, net banking, and PayPal.' },
    { q: 'Do you offer discounts for annual billing?', a: 'Yes! Annual billing saves you 20% compared to monthly billing.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '60px 20px 40px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '600px', margin: '0 auto 24px' }}>
            No hidden fees. No transaction charges. Just powerful restaurant software at affordable prices.
          </p>

          {/* Launch Pricing Banner */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '12px', padding: '12px 24px', marginBottom: '32px' }}>
            <span style={{ fontSize: '20px' }}>&#127881;</span>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#92400e' }}>Launch Pricing — Lock It Forever</span>
              <p style={{ fontSize: '12px', color: '#a16207', margin: '2px 0 0' }}>Sign up now and keep today's price forever. Prices will increase after launch.</p>
            </div>
          </div>

          {/* Currency & Billing Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Currency:</span>
              {['USD', 'GBP', 'INR'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: currency === c ? '#ef4444' : 'transparent',
                    color: currency === c ? 'white' : '#374151',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {plans.map((plan) => (
              <div
                key={plan.name}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  boxShadow: plan.popular ? '0 8px 30px rgba(239, 68, 68, 0.2)' : '0 4px 20px rgba(0,0,0,0.08)',
                  border: plan.popular ? '2px solid #ef4444' : '1px solid #e5e7eb',
                  position: 'relative',
                }}
              >
                {plan.popular && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ef4444', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                    MOST POPULAR
                  </div>
                )}

                {/* Discount badge */}
                <div style={{ display: 'inline-block', backgroundColor: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>
                  SAVE {Math.round((1 - plan.price / plan.regularPrice) * 100)}% — Launch Offer
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{plan.name}</h2>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{plan.description}</p>

                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '22px', fontWeight: '600', color: '#9ca3af', textDecoration: 'line-through', marginRight: '8px' }}>{currentPrice.symbol}{plan.regularPrice}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ fontSize: '48px', fontWeight: '800', color: '#111827' }}>{currentPrice.symbol}{plan.price}</span>
                  <span style={{ fontSize: '16px', color: '#6b7280' }}>/month</span>
                </div>
                <p style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginBottom: '24px' }}>Lock this price forever when you sign up today</p>

                <Link
                  href="https://dineopen.com/login"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '14px 24px',
                    backgroundColor: plan.popular ? '#ef4444' : 'white',
                    color: plan.popular ? 'white' : '#ef4444',
                    border: '2px solid #ef4444',
                    borderRadius: '8px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    marginBottom: '24px',
                  }}
                >
                  {plan.cta} →
                </Link>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {plan.features.map((feature, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: idx < plan.features.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      {feature.included ? (
                        <FaCheck style={{ color: '#10b981', flexShrink: 0 }} />
                      ) : (
                        <FaTimes style={{ color: '#d1d5db', flexShrink: 0 }} />
                      )}
                      <span style={{ color: feature.included ? '#374151' : '#9ca3af' }}>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Zero Fees Banner */}
          <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#ecfdf5', borderRadius: '12px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#065f46', marginBottom: '8px' }}>
              Zero Transaction Fees
            </h3>
            <p style={{ color: '#047857' }}>
              Unlike Square (2.6%), Toast (2.49%), or Petpooja (1.5-2%), DineOpen charges 0% on transactions. Save thousands every year.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ backgroundColor: 'white', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{faq.q}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
            Lock In Launch Pricing Today
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '12px' }}>
            Join 500+ restaurants already using DineOpen. Free 30-day trial, no credit card required.
          </p>
          <p style={{ fontSize: '15px', color: '#92400e', fontWeight: '600', marginBottom: '32px' }}>
            Prices will increase after launch. Sign up now to keep today's rate forever.
          </p>
          <Link
            href="https://dineopen.com/login"
            style={{ display: 'inline-block', padding: '16px 40px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', boxShadow: '0 4px 14px rgba(239,68,68,0.4)' }}
          >
            Start Your Free Trial →
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
