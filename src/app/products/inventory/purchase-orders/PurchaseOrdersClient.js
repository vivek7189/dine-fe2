'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaClipboardList, FaTruck, FaFileInvoice, FaSync, FaSearch, FaCheckDouble, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function PurchaseOrdersClient() {
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
      icon: <FaClipboardList size={28} />,
      title: 'Purchase Order Creation',
      desc: 'Select a supplier and add items with quantities. DineOpen suggests optimal quantities based on current stock, reorder points, and consumption patterns. Set expected delivery date and add notes. Send POs via WhatsApp, email, or print for the supplier.'
    },
    {
      icon: <FaTruck size={28} />,
      title: 'Delivery & GRN Tracking',
      desc: 'When goods arrive, create a Goods Received Note (GRN) against the purchase order. Compare ordered vs received quantities, note discrepancies, log damaged items, and check expiry dates. Stock levels update automatically when GRN is approved.'
    },
    {
      icon: <FaFileInvoice size={28} />,
      title: 'Invoice OCR Processing',
      desc: 'Upload supplier invoice PDFs or photos. DineOpen OCR extracts item names, quantities, unit prices, tax amounts, and totals. Smart matching links extracted items to your inventory and the corresponding PO. Review discrepancies and approve with one click.'
    },
    {
      icon: <FaSearch size={28} />,
      title: 'PO Status Tracking',
      desc: 'Track every purchase order through its lifecycle: Draft, Sent to Supplier, Partially Received, Fully Received, and Closed. The procurement dashboard shows pending deliveries, overdue orders, and items awaiting GRN confirmation.'
    },
    {
      icon: <FaSync size={28} />,
      title: 'Recurring Purchase Orders',
      desc: 'Set up recurring POs for regular suppliers with configurable schedules (daily, weekly, bi-weekly, monthly). Auto-generate purchase orders with preset items and quantities. Modify before sending if needed. Saves time on repetitive ordering.'
    },
    {
      icon: <FaCheckDouble size={28} />,
      title: 'Three-Way Matching',
      desc: 'DineOpen performs three-way matching between Purchase Order, GRN, and Supplier Invoice. Discrepancies in quantity, price, or items are flagged for review. Approve matched entries for automatic payment processing and stock updates.'
    },
  ];

  const poStatuses = [
    { status: 'Draft', color: '#6b7280', desc: 'PO created but not yet sent' },
    { status: 'Sent', color: '#3b82f6', desc: 'Sent to supplier, awaiting delivery' },
    { status: 'Partially Received', color: '#f59e0b', desc: 'Some items received, rest pending' },
    { status: 'Fully Received', color: '#22c55e', desc: 'All items received and GRN confirmed' },
    { status: 'Closed', color: '#111827', desc: 'PO completed and reconciled' },
  ];

  const faqs = [
    { q: 'How do I create a purchase order?', a: 'Select a supplier, add items with quantities, and submit. DineOpen shows suggested quantities based on current stock levels and reorder points. Send the PO via WhatsApp, email, or print.' },
    { q: 'What is a GRN (Goods Received Note)?', a: 'A GRN records what was actually received against a purchase order. Compare ordered vs received quantities, note discrepancies, and confirm receipt. Stock levels update automatically when approved.' },
    { q: 'How does invoice OCR work with POs?', a: 'Upload the supplier invoice PDF or photo. OCR extracts line items, quantities, and prices. DineOpen matches them against the corresponding PO to highlight discrepancies. Approve to auto-generate GRN.' },
    { q: 'Can I track PO status?', a: 'Yes. Track POs through statuses: Draft, Sent, Partially Received, Fully Received, and Closed. Dashboard shows pending deliveries, overdue orders, and recently received shipments.' },
    { q: 'Does it support recurring purchase orders?', a: 'Yes. Set up recurring POs for regular orders (e.g., daily milk, weekly vegetables). DineOpen auto-generates POs on schedule with configurable quantities.' },
    { q: 'What is three-way matching?', a: 'Three-way matching compares the Purchase Order, GRN, and Supplier Invoice. Any discrepancies in quantity, price, or items are flagged. This ensures you only pay for what you ordered and received.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>Purchase Orders</div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Purchase Order & GRN System for Restaurants
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Create purchase orders, send to suppliers, track deliveries, record goods received, and match invoices with OCR. Complete procurement workflow from order to payment.
            </p>
            <Link href="/login?ref=inventory" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* PO Status Flow */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: '32px' }}>Purchase Order Lifecycle</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)', gap: '12px' }}>
              {poStatuses.map((s, i) => (
                <div key={i} style={{ padding: '20px 16px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', textAlign: 'center' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: s.color, margin: '0 auto 10px' }} />
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '4px' }}>{s.status}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.4' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>Purchase Order Features</h2>
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
                { href: '/products/inventory', title: 'Inventory Overview', desc: 'Complete inventory management.' },
                { href: '/products/inventory/suppliers', title: 'Suppliers', desc: 'Supplier database and performance.' },
                { href: '/products/inventory/stock', title: 'Stock Management', desc: 'Auto stock updates from GRN.' },
                { href: '/products/inventory/ai-reorder', title: 'AI Reorder', desc: 'AI-suggested PO quantities.' },
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Purchase Order FAQ</h2>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Streamline Your Procurement</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>From purchase order to payment, automate your procurement workflow. Free 30-day trial.</p>
            <Link href="/login?ref=inventory" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
