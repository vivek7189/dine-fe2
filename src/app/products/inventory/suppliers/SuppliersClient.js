'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaTruck, FaChartLine, FaBalanceScale, FaCreditCard, FaUndoAlt, FaAddressBook, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function SuppliersClient() {
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
      icon: <FaAddressBook size={28} />,
      title: 'Supplier Database',
      desc: 'Maintain a comprehensive supplier directory with company name, contact person, phone, email, address, GSTIN, and bank details. Tag suppliers by category (vegetables, dairy, meat, packaging, etc.) for quick filtering. Add notes about delivery schedules and special arrangements.'
    },
    {
      icon: <FaChartLine size={28} />,
      title: 'Performance Tracking',
      desc: 'DineOpen automatically tracks four key metrics for each supplier: delivery reliability (on-time percentage), price consistency (price variation over time), quality score (based on returns and rejections), and order fulfillment rate. Suppliers are ranked to identify your best partners.'
    },
    {
      icon: <FaBalanceScale size={28} />,
      title: 'Price Comparison',
      desc: 'When creating purchase orders, view the same item priced from all linked suppliers side by side. Compare not just unit price but also minimum order quantity, delivery time, and quality score. Make data-driven procurement decisions to lower food costs.'
    },
    {
      icon: <FaCreditCard size={28} />,
      title: 'Payment Term Management',
      desc: 'Configure payment terms per supplier: Cash on Delivery, 7-day credit, 15-day credit, 30-day credit, or custom terms. Track outstanding payments with due date alerts. View payment history and generate supplier-wise payment reports for reconciliation.'
    },
    {
      icon: <FaUndoAlt size={28} />,
      title: 'Returns & Quality Tracking',
      desc: 'Log supplier returns with reason codes: quality issue, wrong item, damaged goods, short delivery, or expired items. Each return impacts the supplier quality score. Generate return reports for dispute resolution and track credit notes received.'
    },
    {
      icon: <FaTruck size={28} />,
      title: 'Multi-Supplier Item Linking',
      desc: 'Link multiple suppliers to the same inventory item with different prices, lead times, and minimum order quantities. The system suggests the best supplier based on your preferences (lowest price, fastest delivery, or highest quality score).'
    },
  ];

  const faqs = [
    { q: 'How does supplier performance tracking work?', a: 'DineOpen tracks delivery reliability (on-time percentage), price consistency, quality scores (based on returns/rejections), and order fulfillment rate. Suppliers are scored and ranked so you can identify your best and worst performers.' },
    { q: 'Can I compare prices across suppliers?', a: 'Yes. When creating a purchase order, DineOpen shows the same item\'s price from all linked suppliers. Compare prices, delivery times, and quality scores to choose the best supplier for each order.' },
    { q: 'How do I manage payment terms?', a: 'Set payment terms per supplier: COD, 7-day credit, 15-day credit, 30-day credit, or custom. DineOpen tracks outstanding payments and due dates. Get alerts before payment deadlines.' },
    { q: 'Can I track supplier returns?', a: 'Yes. Log returns with reason (quality issue, wrong item, damaged goods). Returns are tracked against the supplier quality score. Generate return reports for dispute resolution.' },
    { q: 'Does it support multiple suppliers per item?', a: 'Yes. Link multiple suppliers to the same inventory item with different prices and lead times. When creating purchase orders, choose the best supplier based on price, availability, and performance.' },
    { q: 'Can I import my existing supplier list?', a: 'Yes. Upload a CSV or Excel file with supplier details. DineOpen maps columns automatically and imports your entire supplier database. You can also add suppliers one by one.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>Supplier Management</div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Restaurant Supplier & Vendor Management
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Build a reliable supplier network with performance tracking, price comparison, payment management, and quality scoring. Know which vendors deliver on time, offer the best prices, and maintain consistent quality.
            </p>
            <Link href="/login?ref=inventory" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>Supplier Management Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {features.map((feature, i) => (
                <div key={i} style={{ background: '#f9fafb', padding: '32px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '20px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', margin: 0 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Related Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { href: '/products/inventory', title: 'Inventory Overview', desc: 'Complete inventory management suite.' },
                { href: '/products/inventory/purchase-orders', title: 'Purchase Orders', desc: 'Create POs and send to suppliers.' },
                { href: '/products/inventory/stock', title: 'Stock Management', desc: 'Real-time stock tracking and alerts.' },
                { href: '/products/inventory/ai-reorder', title: 'AI Reorder', desc: 'Smart suggestions for optimal ordering.' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
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

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Supplier FAQ</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', padding: '20px 24px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                    <span style={{ fontSize: '20px', color: '#6b7280', transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </button>
                  {openFaq === idx && <div style={{ padding: '0 24px 20px' }}><p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{faq.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Build Your Supplier Network</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Track performance, compare prices, and never miss a payment. Free 30-day trial.</p>
            <Link href="/login?ref=inventory" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
