'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaPlug, FaCheckCircle, FaArrowRight, FaSyncAlt, FaUtensils, FaCreditCard, FaChartBar, FaBoxes, FaClock, FaShieldAlt, FaBell } from 'react-icons/fa';

export default function IntegrationsLandingClient() {
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
      name: 'Zomato',
      logo: '/integrations/zomato-logo.svg',
      category: 'Manual entry + reports',
      desc: 'DineOpen does not sync Zomato orders automatically today. Staff record Zomato orders on the DineOpen POS and mark the channel as Zomato, so the kitchen gets a KOT and Zomato sales show up separately in your reports.',
      features: ['Record orders on POS', 'Mark channel as Zomato', 'Separate Zomato sales in reports', 'KOT to kitchen'],
      href: '/integrations/zomato',
      color: '#e23744',
    },
    {
      name: 'Swiggy',
      logo: '/integrations/swiggy-logo.svg',
      category: 'Manual entry + reports',
      desc: 'DineOpen does not sync Swiggy orders automatically today. Staff record Swiggy orders on the DineOpen POS and mark the channel as Swiggy, so the kitchen gets a KOT and Swiggy sales show up separately in your reports.',
      features: ['Record orders on POS', 'Mark channel as Swiggy', 'Separate Swiggy sales in reports', 'KOT to kitchen'],
      href: '/integrations/swiggy',
      color: '#fc8019',
    },
    {
      name: 'Razorpay',
      logo: '/integrations/razorpay-logo.svg',
      category: 'Payment Gateway',
      desc: 'Accept online payments via UPI, credit/debit cards, net banking, and digital wallets through Razorpay. Built-in settlement tracking, automatic reconciliation, and support for advance payments, delivery orders, and subscription billing.',
      features: ['UPI payments', 'Card payments', 'Net banking', 'Settlement tracking', 'Auto reconciliation'],
      href: '/integrations/razorpay',
      color: '#0366d6',
    },
  ];

  const features = [
    {
      icon: <FaSyncAlt size={28} />,
      title: 'Talabat Order Sync (UAE & Gulf)',
      desc: 'Talabat orders arrive in DineOpen automatically, so Gulf restaurants can send them straight to the kitchen. Zomato and Swiggy orders are recorded on the POS by your staff and tagged by channel.',
    },
    {
      icon: <FaUtensils size={28} />,
      title: 'Commission-Free Direct Ordering',
      desc: 'Maintain a single menu in DineOpen for your POS, QR menu, branded online ordering website and WhatsApp ordering. Update once and your direct channels reflect it - with no per-order commission.',
    },
    {
      icon: <FaCreditCard size={28} />,
      title: 'Payment Gateway Integration',
      desc: 'Accept payments via Razorpay across UPI, cards, net banking, and wallets. Settlement reports sync automatically. Track online payments, reconcile with bank deposits, and maintain clean financial records.',
    },
    {
      icon: <FaBoxes size={28} />,
      title: 'Inventory Across Your Channels',
      desc: 'Every order recorded in DineOpen - dine-in, QR, direct online and aggregator orders entered on the POS - deducts stock from the same inventory. Mark items out of stock once for your POS and QR menu.',
    },
    {
      icon: <FaChartBar size={28} />,
      title: 'Consolidated Analytics',
      desc: 'View revenue, order volume, and performance from all channels in a single dashboard. Because staff tag aggregator orders by channel, you can compare dine-in vs Zomato vs Swiggy sales, best-selling items per channel, and overall revenue trends.',
    },
    {
      icon: <FaBell size={28} />,
      title: 'Smart Kitchen Routing',
      desc: 'Orders are automatically routed to the correct kitchen station or printer based on item categories - whether they come from dine-in, QR, direct online ordering, Talabat, or are entered on the POS for Zomato and Swiggy.',
    },
    {
      icon: <FaClock size={28} />,
      title: 'Prep Time Optimization',
      desc: 'Track how long orders take in the kitchen with KOT and kitchen display timings. Better prep time awareness means faster delivery, better ratings and fewer customer complaints.',
    },
    {
      icon: <FaShieldAlt size={28} />,
      title: 'Settlement & Reconciliation',
      desc: 'Track Razorpay settlements in DineOpen, and see Zomato and Swiggy sales separately in your reports so you can check them against aggregator payouts and bank deposits.',
    },
  ];

  const stats = [
    { value: '2', label: 'Live integrations (Razorpay, Talabat)' },
    { value: '0%', label: 'Commission on direct orders' },
    { value: '1', label: 'Sales report for every channel' },
    { value: '₹0', label: 'Integration cost' },
  ];

  const howItWorks = [
    { step: '1', title: 'Connect Payments', desc: 'Link your Razorpay account from DineOpen settings to accept UPI, cards, net banking and wallets. Gulf restaurants can connect Talabat so orders arrive automatically.' },
    { step: '2', title: 'Configure Preferences', desc: 'Set up kitchen stations, printer routing, and payment/channel labels such as Zomato and Swiggy for aggregator orders.' },
    { step: '3', title: 'Record Aggregator Orders', desc: 'Staff enter Zomato and Swiggy orders on the DineOpen POS and mark the channel, so the kitchen gets a KOT and sales are tracked separately.' },
    { step: '4', title: 'Grow Direct Orders', desc: 'Turn on commission-free QR ordering, your branded online ordering website and WhatsApp ordering, and see every channel in one set of reports.' },
  ];

  const useCases = [
    {
      title: 'Cloud Kitchens',
      desc: 'Manage multiple brands from a single DineOpen account. Record Zomato and Swiggy orders per brand, keep separate menus, consolidated billing, and unified kitchen management.',
    },
    {
      title: 'Multi-Outlet Chains',
      desc: 'Each outlet records its Zomato and Swiggy orders in its own DineOpen location, so aggregator sales are tracked per outlet. Centralized menu updates push to all outlets in DineOpen simultaneously.',
    },
    {
      title: 'Dine-In + Delivery Restaurants',
      desc: 'Handle walk-in customers, QR code orders, and aggregator orders entered on the POS from the same system. One kitchen queue, one billing system, one inventory tracker.',
    },
    {
      title: 'Cafes & QSR',
      desc: 'Fast-paced outlets benefit from QR and direct online ordering. Orders appear on KDS instantly, reducing wait times and maximizing throughput during peak hours.',
    },
  ];

  const faqs = [
    { q: 'Which food delivery platforms does DineOpen integrate with?', a: 'Talabat (UAE and Gulf) is integrated - Talabat orders arrive in DineOpen automatically. DineOpen does not sync Zomato or Swiggy orders automatically today: staff record those orders on the POS and mark the channel as Zomato or Swiggy, so aggregator sales show separately in your reports.' },
    { q: 'Do I need to pay extra for integrations?', a: 'No. Integrations such as Razorpay are included with every DineOpen plan. There are no setup fees and no per-order charges from DineOpen.' },
    { q: 'Does DineOpen auto-accept Zomato and Swiggy orders?', a: 'No. There is no automatic order import or auto-accept for Zomato or Swiggy today. Staff enter those orders on the DineOpen POS, which sends a KOT to the kitchen and tracks the sale under the right channel.' },
    { q: 'Can I sync my menu to Zomato and Swiggy?', a: 'Not today. Your DineOpen menu powers your POS, QR menu, branded online ordering website and WhatsApp ordering. Zomato and Swiggy menus are managed in their own partner apps.' },
    { q: 'What payment gateways does DineOpen support?', a: 'DineOpen integrates with Razorpay for accepting online payments via UPI, credit/debit cards, net banking, and digital wallets. Settlement tracking and automatic reconciliation are built in.' },
    { q: 'How long does it take to set up integrations?', a: 'Most integrations can be connected in under 10 minutes. Link your Razorpay account in DineOpen settings, configure your preferences, and you\'re live. No technical knowledge required.' },
    { q: 'Will aggregator orders show up in my sales reports?', a: 'Yes. Zomato and Swiggy orders that staff record on the POS, plus dine-in, QR and direct online orders, are tracked in unified sales reports. You can filter by channel to see performance per platform or view combined revenue across all sources.' },
    { q: 'What happens if my internet goes down?', a: 'DineOpen caches data locally so you can continue taking orders offline. Online payments and Talabat orders need internet connectivity. Data syncs automatically once connectivity is restored.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#2563eb', marginBottom: '24px' }}>
              <FaPlug style={{ marginRight: '6px', verticalAlign: 'middle' }} /> DineOpen Integrations
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Razorpay, Talabat & Your Delivery Channels in One POS
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '750px', margin: '0 auto 36px' }}>
              Accept online payments with Razorpay, receive Talabat orders automatically in the Gulf, and record Zomato and Swiggy orders on the POS so every channel shows up in one set of reports. DineOpen does not sync Zomato or Swiggy orders automatically today.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=integrations" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial
              </Link>
              <Link href="#integrations" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none', display: 'inline-block' }}>
                View All Integrations
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ padding: isMobile ? '40px 20px' : '60px 40px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '24px', textAlign: 'center' }}>
            {stats.map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Integration Cards */}
        <section id="integrations" style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Available Integrations
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              Razorpay is a live integration. Zomato and Swiggy orders are entered on the POS and tracked separately in reports - no automatic sync today.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '28px' }}>
              {integrations.map((integration, i) => (
                <div key={i} style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s, transform 0.2s', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: integration.color }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f3f4f6' }}>
                      <FaPlug size={20} style={{ color: integration.color }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>{integration.name}</h3>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: integration.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{integration.category}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', margin: '16px 0 20px' }}>{integration.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                    {integration.features.map((feature, j) => (
                      <span key={j} style={{ fontSize: '12px', fontWeight: '500', color: '#374151', backgroundColor: '#f3f4f6', padding: '4px 10px', borderRadius: '6px' }}>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Link href={integration.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: '600', color: integration.color, textDecoration: 'none' }}>
                    Learn more <FaArrowRight size={12} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              What You Get with DineOpen Integrations
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              More than just connecting apps — DineOpen integrations automate your workflow end to end.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {features.map((feature, i) => (
                <div key={i} style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #f3f4f6', transition: 'box-shadow 0.2s' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: '20px' }}>
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
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              Set Up in Under 10 Minutes
            </h2>
            {howItWorks.map((item, i) => (
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

        {/* Use Cases */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Built for Every Restaurant Type
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              Whether you run a single outlet or a chain, DineOpen integrations adapt to your setup.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {useCases.map((useCase, i) => (
                <div key={i} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{useCase.title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', margin: 0 }}>{useCase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why DineOpen vs Others */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Why Restaurants Choose DineOpen for Integrations
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>
              Other POS systems charge extra for integrations or limit them to premium plans. DineOpen includes everything.
            </p>
            <div style={{ display: 'grid', gap: '16px' }}>
              {[
                { title: 'Free with Every Plan', desc: 'Razorpay integration and Zomato/Swiggy sales tracking are included at no extra cost on all plans — Starter and Pro.' },
                { title: 'No Per-Order Fees', desc: 'Unlike aggregator management platforms that charge per order, DineOpen has zero transaction fees. Every rupee stays with you.' },
                { title: 'One Set of Reports', desc: 'Dine-in, QR, direct online orders and the Zomato/Swiggy orders you record on the POS all appear in one set of sales reports, split by channel.' },
                { title: 'Indian Restaurant First', desc: 'Built specifically for the Indian restaurant market. Supports GST, FSSAI compliance, Hindi/regional menus, and India-specific payment methods.' },
                { title: 'No Vendor Lock-In', desc: 'Your data is yours. Export orders, customer data, and financial records anytime. Switch on or off integrations freely.' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '2px' }}>
                    <FaCheckCircle style={{ color: '#22c55e', fontSize: '20px' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{item.title}</h3>
                    <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interlinks */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
              Explore Related Products
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { href: '/integrations/zomato', title: 'Zomato + DineOpen', desc: 'How to record Zomato orders on the POS and track Zomato sales in reports.' },
                { href: '/integrations/swiggy', title: 'Swiggy + DineOpen', desc: 'How to record Swiggy orders on the POS and track Swiggy sales in reports.' },
                { href: '/integrations/razorpay', title: 'Razorpay Integration', desc: 'UPI, cards, net banking — accept all online payments with auto reconciliation.' },
                { href: '/products/orders', title: 'Order Management', desc: 'QR ordering, online orders, delivery — manage all order types in one place.' },
                { href: '/products/billing', title: 'Billing Software', desc: 'GST-compliant invoices, tax calculation, and multi-payment support.' },
                { href: '/products/kitchen', title: 'Kitchen Display', desc: 'Real-time kitchen display for managing orders from all channels.' },
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
              Bring Every Order Channel Into One POS Today
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
              Free 7-day trial. Razorpay payments, channel-wise sales reports and commission-free direct ordering included.
            </p>
            <Link href="/login?ref=integrations" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
