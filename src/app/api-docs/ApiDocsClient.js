'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaCode, FaBolt, FaPlug, FaShoppingCart, FaCreditCard, FaWhatsapp, FaCheckCircle, FaArrowRight, FaChartLine, FaFileExport } from 'react-icons/fa';

export default function ApiDocsClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const integrations = [
    {
      icon: <FaShoppingCart size={28} />,
      title: 'Food Delivery Platforms',
      desc: 'Sync orders from Zomato and Swiggy directly into your POS. No manual entry — online orders appear on your KDS and billing screen instantly. Menu items, prices, and availability update in real-time across platforms.'
    },
    {
      icon: <FaCreditCard size={28} />,
      title: 'Payment Gateways',
      desc: 'Accept payments via Razorpay, Stripe, UPI, and all major card terminals. Payment status syncs automatically with your billing system. Supports split payments, partial refunds, and end-of-day settlement reports.'
    },
    {
      icon: <FaWhatsapp size={28} />,
      title: 'WhatsApp Business',
      desc: 'Send order confirmations, digital receipts, reservation reminders, and loyalty updates via WhatsApp. Automated messages trigger on key events — no manual sending needed. Customers can reply to reorder or confirm bookings.'
    },
    {
      icon: <FaCode size={28} />,
      title: 'REST API',
      desc: 'Programmatic access to your restaurant data — orders, menu, inventory, customers, tables, and reports. Build custom dashboards, connect with your own apps, or automate workflows. JSON responses with standard HTTP methods.'
    },
    {
      icon: <FaBolt size={28} />,
      title: 'Webhooks',
      desc: 'Real-time HTTP callbacks when events happen in your restaurant — new order, payment received, low inventory alert, reservation created. Push data to your systems instantly without polling. Configure per-event or catch-all endpoints.'
    },
    {
      icon: <FaFileExport size={28} />,
      title: 'Accounting & Reports',
      desc: 'Export sales data to Tally, Zoho Books, or as CSV/Excel. GST-compliant invoice generation with automatic HSN codes. Daily, weekly, and monthly reports auto-generated and emailed to your accountant.'
    },
  ];

  const apiEndpoints = [
    { method: 'GET', path: '/orders', desc: 'List orders with filters (date, status, type)' },
    { method: 'POST', path: '/orders', desc: 'Create a new order (dine-in, takeaway, delivery)' },
    { method: 'GET', path: '/menu', desc: 'Fetch menu items, categories, and pricing' },
    { method: 'PUT', path: '/menu/items/{id}', desc: 'Update item price, availability, or details' },
    { method: 'GET', path: '/inventory', desc: 'Current stock levels and low-stock alerts' },
    { method: 'GET', path: '/reports/sales', desc: 'Sales reports by date range, category, or item' },
  ];

  const faqs = [
    { q: 'Does DineOpen have an API?', a: 'Yes. DineOpen provides a REST API that lets you programmatically access POS data, orders, menu items, inventory, customers, and reports. API access is available on the Blaze plan.' },
    { q: 'Which food delivery platforms does DineOpen integrate with?', a: 'DineOpen integrates with Zomato and Swiggy for automatic order sync. Online orders appear directly in your POS — no manual entry needed. Menu and availability sync in real-time.' },
    { q: 'What payment gateways are supported?', a: 'DineOpen supports Razorpay and Stripe for online payments, UPI for direct bank transfers, and all major card terminals. Payment status syncs automatically with your billing system.' },
    { q: 'Can I get webhook notifications?', a: 'Yes. Configure webhooks to receive real-time HTTP callbacks when events occur — new order placed, payment received, inventory low, reservation created, and more. Use webhooks to connect DineOpen with your own systems.' },
    { q: 'Is there a setup fee for integrations?', a: 'No. All pre-built integrations (Zomato, Swiggy, Razorpay, WhatsApp) are included at no extra cost on the Blaze plan. API access is also included. Custom integration support is available on request.' },
    { q: 'Can I build custom integrations?', a: 'Absolutely. Use the REST API and webhooks to connect DineOpen with any system — your own apps, third-party tools, or automation platforms like Zapier. Full API documentation is provided with your Blaze plan access.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '24px' }}>
              API & Integrations
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Connect Your Entire Restaurant Stack
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '750px', margin: '0 auto 36px' }}>
              Integrate DineOpen with Zomato, Swiggy, Razorpay, WhatsApp, and your own systems. REST API, webhooks, and 20+ pre-built connectors — so your POS talks to everything.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=api-docs" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Get API Access <FaArrowRight style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
              </Link>
              <Link href="/pricing" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                View Plans
              </Link>
            </div>
          </div>
        </section>

        {/* Integration Highlights */}
        <section style={{ padding: isMobile ? '40px 20px' : '60px 40px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: '32px' }}>
              Pre-Built Integrations
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { name: 'Zomato', color: '#e23744', desc: 'Order sync' },
                { name: 'Swiggy', color: '#fc8019', desc: 'Order sync' },
                { name: 'Razorpay', color: '#2563eb', desc: 'Payments' },
                { name: 'WhatsApp', color: '#25d366', desc: 'Notifications' },
              ].map((item) => (
                <div key={item.name} style={{ padding: '20px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color, margin: '0 auto 12px', boxShadow: `0 0 12px ${item.color}60` }} />
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>{item.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Everything You Need to Integrate
            </h2>
            <p style={{ fontSize: '17px', color: '#6b7280', textAlign: 'center', maxWidth: '600px', margin: '0 auto 48px' }}>
              From food delivery platforms to payment gateways — connect your restaurant operations in one place.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {integrations.map((f, i) => (
                <div key={i} style={{ padding: '32px', borderRadius: '16px', backgroundColor: 'white', border: '1px solid #e5e7eb' }}>
                  <div style={{ color: '#2563eb', marginBottom: '16px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{f.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Endpoints Preview */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              REST API Overview
            </h2>
            <p style={{ fontSize: '17px', color: '#6b7280', textAlign: 'center', maxWidth: '600px', margin: '0 auto 48px' }}>
              Clean, well-documented endpoints for every part of your restaurant operations.
            </p>
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundColor: '#1e293b' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                <span style={{ color: '#94a3b8', fontSize: '13px', marginLeft: '12px', fontFamily: 'monospace' }}>api.dineopen.com/v1</span>
              </div>
              <div style={{ padding: '24px' }}>
                {apiEndpoints.map((ep, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '8px' : '16px', padding: '12px 0', borderBottom: i < apiEndpoints.length - 1 ? '1px solid #334155' : 'none', flexDirection: isMobile ? 'column' : 'row' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: ep.method === 'GET' ? '#22c55e' : ep.method === 'POST' ? '#3b82f6' : '#f59e0b', minWidth: '50px' }}>
                      {ep.method}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#e2e8f0', minWidth: isMobile ? 'auto' : '220px' }}>
                      {ep.path}
                    </span>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                      {ep.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Get Started in 3 Steps
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '32px' }}>
              {[
                { step: '1', title: 'Sign Up for Blaze', desc: 'API access and all integrations are included in the Blaze plan. Start with a free trial — no credit card required.' },
                { step: '2', title: 'Connect Your Platforms', desc: 'Enable Zomato, Swiggy, Razorpay, or WhatsApp integrations from your dashboard with one click. No code needed for pre-built connectors.' },
                { step: '3', title: 'Build Custom Flows', desc: 'Use the REST API and webhooks to connect DineOpen with your own systems. Full documentation and sample code provided.' },
              ].map((s) => (
                <div key={s.step} style={{ textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', fontSize: '20px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    {s.step}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{s.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7' }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Mention */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>
              Included in Blaze Plan
            </h2>
            <p style={{ fontSize: '17px', color: '#6b7280', lineHeight: '1.7', marginBottom: '32px' }}>
              All integrations and API access come bundled with the Blaze plan. No per-API-call charges, no hidden fees.
            </p>
            <div style={{ padding: '32px', borderRadius: '16px', border: '2px solid #2563eb', backgroundColor: '#f0f9ff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', textAlign: 'left' }}>
                {[
                  'REST API access',
                  'Webhook notifications',
                  'Zomato order sync',
                  'Swiggy order sync',
                  'Razorpay / Stripe payments',
                  'WhatsApp Business messaging',
                  'Tally / accounting export',
                  'Dedicated integration support',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#374151' }}>
                    <FaCheckCircle size={16} color="#2563eb" />
                    {item}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '24px' }}>
                <Link href="/pricing" style={{ padding: '14px 28px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block' }}>
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                  <span style={{ fontSize: '20px', color: '#6b7280', transform: openFaq === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openFaq === i && (
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7', padding: '0 0 20px' }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #1e3a5f 0%, #111827 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>
              Ready to Connect Your Restaurant?
            </h2>
            <p style={{ fontSize: '18px', color: '#cbd5e1', lineHeight: '1.7', marginBottom: '32px' }}>
              Start your free trial today. All integrations included — set up Zomato, Swiggy, and payment gateways in under 5 minutes.
            </p>
            <Link href="/login?ref=api-docs" style={{ padding: '16px 40px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial <FaArrowRight style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
