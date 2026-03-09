'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaReceipt, FaFileInvoice, FaCalculator, FaCreditCard, FaCheckCircle, FaArrowRight, FaRupeeSign, FaMobileAlt } from 'react-icons/fa';

export default function BillingLandingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    {
      icon: <FaReceipt size={28} />,
      title: 'Instant Bill Generation',
      desc: 'Generate detailed bills for dine-in, takeaway, and delivery orders in seconds. Each bill includes itemized charges, tax breakdowns, discounts applied, and payment mode. Print thermal receipts or share digital bills via WhatsApp and SMS.'
    },
    {
      icon: <FaFileInvoice size={28} />,
      title: 'GST Compliant Invoices',
      desc: 'Every invoice automatically includes your GSTIN, HSN/SAC codes, and proper CGST/SGST/IGST split. Compliant with Indian GST regulations out of the box. No manual calculations or formatting needed.'
    },
    {
      icon: <FaCalculator size={28} />,
      title: 'Automatic Tax Calculation',
      desc: 'Configure GST rates (5%, 12%, 18%, 28%) per item category. The system calculates CGST, SGST, and IGST automatically based on supply location. Service charges and packaging fees handled separately with correct tax treatment.'
    },
    {
      icon: <FaCreditCard size={28} />,
      title: 'Multiple Payment Methods',
      desc: 'Accept cash, credit/debit cards, UPI payments (Google Pay, PhonePe, Paytm), and digital wallets. Support split payments across methods. Real-time payment reconciliation keeps your books balanced.'
    },
    {
      icon: <FaRupeeSign size={28} />,
      title: 'Tax Record Maintenance',
      desc: 'Maintain complete tax records required for GST filing. Generate GSTR-1 and GSTR-3B compatible reports. Export tax summaries in Excel or CSV format for your chartered accountant. Never miss a filing deadline.'
    },
    {
      icon: <FaMobileAlt size={28} />,
      title: 'Payment Gateway Integration',
      desc: 'Built-in support for Razorpay and Dodo payment gateways. Accept online payments for delivery orders, advance bookings, and subscription plans. Automatic settlement tracking and reconciliation reports.'
    },
  ];

  const benefits = [
    { value: '30s', label: 'Average bill generation time' },
    { value: '100%', label: 'GST compliant invoices' },
    { value: '0%', label: 'Transaction fees' },
    { value: '6+', label: 'Payment methods supported' },
  ];

  const faqs = [
    { q: 'Does DineOpen Billing support GST invoicing?', a: 'Yes. DineOpen generates fully GST-compliant invoices with HSN codes, GSTIN display, and automatic CGST/SGST/IGST calculation based on your restaurant location and customer state.' },
    { q: 'What payment methods does DineOpen Billing support?', a: 'DineOpen supports cash, credit/debit cards, UPI (Google Pay, PhonePe, Paytm), digital wallets, and payment gateways like Razorpay and Dodo. Split payments across multiple methods are also supported.' },
    { q: 'How much does DineOpen Billing cost?', a: 'DineOpen Billing starts at $9.99/month (Rs.300/month in India) on the Spark plan. The Blaze plan at $89/month (Rs.2,500 in India) includes advanced features. Zero transaction fees on all plans.' },
    { q: 'Can I generate tax reports for GST filing?', a: 'Yes. DineOpen maintains complete tax records and generates reports compatible with GSTR-1, GSTR-3B, and other GST filing formats. Export data in Excel or CSV for your accountant.' },
    { q: 'Does DineOpen support multiple tax rates?', a: 'Absolutely. Configure different GST rates (5%, 12%, 18%, 28%) per item category. The system handles service tax, packaging charges, and delivery charges separately with proper tax treatment.' },
    { q: 'Can I customize my invoice template?', a: 'Yes. Customize your invoice layout with your restaurant logo, address, FSSAI number, custom footer messages, and terms. Choose between thermal printer format and A4 format for different use cases.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>
              DineOpen Billing
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Restaurant Billing Software with GST Compliance
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '750px', margin: '0 auto 36px' }}>
              Generate GST-compliant bills, calculate taxes automatically, accept payments via UPI, cards, and wallets, and maintain complete tax records for filing. Built for Indian restaurants with support for HSN codes, CGST/SGST split, and payment gateways like Razorpay.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=billing" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial
              </Link>
              <Link href="/products/billing/gst" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none', display: 'inline-block' }}>
                GST Billing Details
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ padding: isMobile ? '40px 20px' : '60px 40px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '24px', textAlign: 'center' }}>
            {benefits.map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Complete Billing Features for Restaurants
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              Everything you need to handle billing, invoicing, taxes, and payments at your restaurant.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {features.map((feature, i) => (
                <div key={i} style={{ background: '#f9fafb', padding: '32px', borderRadius: '16px', border: '1px solid #f3f4f6', transition: 'box-shadow 0.2s' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '20px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', margin: 0 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              How DineOpen Billing Works
            </h2>
            {[
              { step: '1', title: 'Set Up Tax Rates', desc: 'Configure your GSTIN, HSN codes, and applicable tax rates per item category. Set service charge and packaging charge rules.' },
              { step: '2', title: 'Take Orders & Generate Bills', desc: 'Orders from POS, waiter app, or QR menu automatically generate itemized bills with correct tax calculations.' },
              { step: '3', title: 'Accept Payment', desc: 'Customers pay via cash, card, UPI, or wallet. Split payments supported. Razorpay and Dodo handle online payments.' },
              { step: '4', title: 'Track & File Taxes', desc: 'All transactions are recorded with full tax details. Export GST reports monthly for filing. Your accountant will thank you.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', marginBottom: '36px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing preview */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '40px' }}>Zero transaction fees. No hidden charges.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Spark</h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$9.99<span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>/mo</span></div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Rs.300/mo in India</div>
                {['Bill generation', 'GST invoices', 'Tax calculation', 'UPI & card payments'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', marginBottom: '8px', justifyContent: 'center' }}>
                    <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              <div style={{ padding: '32px', borderRadius: '16px', border: '2px solid #ef4444', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>POPULAR</div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Blaze</h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$89<span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>/mo</span></div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Rs.2,500/mo in India</div>
                {['Everything in Spark', 'Razorpay/Dodo integration', 'Subscription billing', 'Tax filing reports', 'Multi-location billing'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', marginBottom: '8px', justifyContent: 'center' }}>
                    <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interlinks */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
              Explore Billing Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { href: '/products/billing/gst', title: 'GST Billing', desc: 'HSN codes, CGST/SGST split, and GST-compliant invoice generation.' },
                { href: '/products/billing/invoices', title: 'Invoice Generation', desc: 'Custom invoice templates, thermal printing, and digital bill sharing.' },
                { href: '/products/inventory', title: 'Inventory Management', desc: 'Track stock levels, manage suppliers, and control food costs.' },
                { href: '/products/admin', title: 'Restaurant Admin', desc: 'Staff management, multi-location setup, and tax configuration.' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{link.title}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{link.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#9ca3af', flexShrink: 0, marginLeft: '12px' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ width: '100%', padding: '20px 24px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                    <span style={{ fontSize: '20px', color: '#6b7280', transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: '0 24px 20px' }}>
                      <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>
              Start Generating GST-Compliant Bills Today
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
              Free 30-day trial. No credit card required. Set up billing in under 5 minutes.
            </p>
            <Link href="/login?ref=billing" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
