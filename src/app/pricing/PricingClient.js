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
    USD: { starter: 10, professional: 30, symbol: '$' },
    GBP: { starter: 8, professional: 24, symbol: '£' },
    INR: { starter: 999, professional: 2499, symbol: '₹' },
  };

  const currentPrice = prices[currency];

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small restaurants & cafes',
      price: currentPrice.starter,
      features: [
        { name: 'AI Voice Ordering', included: true },
        { name: 'QR Code Digital Menu', included: true },
        { name: 'POS Billing System', included: true },
        { name: 'Up to 10 Tables', included: true },
        { name: 'Basic Inventory', included: true },
        { name: 'GST/Tax Billing', included: true },
        { name: 'Email Support', included: true },
        { name: 'Unlimited Tables', included: false },
        { name: 'Multi-location Support', included: false },
        { name: 'API Access', included: false },
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Professional',
      description: 'For growing & multi-location restaurants',
      price: currentPrice.professional,
      features: [
        { name: 'Everything in Starter', included: true },
        { name: 'Unlimited Tables', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Multi-location Support', included: true },
        { name: 'Priority 24/7 Support', included: true },
        { name: 'API Access', included: true },
        { name: 'Custom Integrations', included: true },
        { name: 'Dedicated Account Manager', included: true },
        { name: 'White-label Options', included: true },
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
          <p style={{ fontSize: '20px', color: '#6b7280', maxWidth: '600px', margin: '0 auto 32px' }}>
            No hidden fees. No transaction charges. Just powerful restaurant software at affordable prices.
          </p>

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

                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{plan.name}</h2>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{plan.description}</p>

                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '48px', fontWeight: '800', color: '#111827' }}>{currentPrice.symbol}{plan.price}</span>
                  <span style={{ fontSize: '16px', color: '#6b7280' }}>/month</span>
                </div>

                <Link
                  href="https://app.dineopen.com/register"
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
            Ready to Get Started?
          </h2>
          <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px' }}>
            Join 500+ restaurants already using DineOpen. Free 30-day trial, no credit card required.
          </p>
          <Link
            href="https://app.dineopen.com/register"
            style={{ display: 'inline-block', padding: '16px 40px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
          >
            Start Your Free Trial →
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
