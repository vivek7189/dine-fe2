'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaPrint, FaWhatsapp, FaFileAlt, FaPalette, FaDownload, FaHistory, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function InvoicesClient() {
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
      icon: <FaPalette size={28} />,
      title: 'Customizable Invoice Templates',
      desc: 'Design your invoice with your restaurant logo, name, address, GSTIN, and FSSAI license number. Add custom footer messages like promotional offers, WiFi passwords, or feedback links. Preview before printing to ensure perfect formatting every time.'
    },
    {
      icon: <FaPrint size={28} />,
      title: 'Thermal Printer Support',
      desc: 'Works with all major ESC/POS thermal printers including Epson TM series, Star Micronics, and generic USB/Bluetooth POS printers. Supports both 58mm and 80mm paper widths. Configure print layout, font sizes, and item column widths from settings.'
    },
    {
      icon: <FaWhatsapp size={28} />,
      title: 'Digital Bill Sharing',
      desc: 'Send invoices directly to customer WhatsApp as PDF or image. Share unique bill links via SMS. Customers can view itemized bills, tax breakdowns, and payment details from their phone. Reduces paper usage and improves the customer experience.'
    },
    {
      icon: <FaFileAlt size={28} />,
      title: 'Multiple Invoice Formats',
      desc: 'Generate thermal receipts for quick counter billing, A4 invoices for formal transactions, and compact digital formats for online orders. Each format includes all mandatory fields: GSTIN, HSN codes, tax breakdown, and FSSAI number.'
    },
    {
      icon: <FaDownload size={28} />,
      title: 'Bulk Export & Reports',
      desc: 'Export all invoices for any date range in PDF, Excel, or CSV format. Filter by payment method, tax rate, order type (dine-in, takeaway, delivery), or staff member. Essential for monthly accounting and tax filing preparation.'
    },
    {
      icon: <FaHistory size={28} />,
      title: 'Invoice History & Duplicates',
      desc: 'Access complete invoice history with search by bill number, date, customer name, or amount. Reprint or reshare any past invoice instantly. Issue credit notes and revised invoices with automatic linking to the original transaction.'
    },
  ];

  const invoiceElements = [
    'Restaurant name, address & logo',
    'GSTIN & FSSAI license number',
    'Bill number & date/time',
    'Itemized order with quantities',
    'HSN/SAC codes per item',
    'CGST/SGST/IGST breakdown',
    'Discounts & coupons applied',
    'Service charge (if applicable)',
    'Total with tax summary',
    'Payment method & transaction ID',
    'QR code for digital payment',
    'Custom footer messages',
  ];

  const faqs = [
    { q: 'Can I customize invoice templates?', a: 'Yes. Add your restaurant logo, FSSAI number, custom headers and footers, terms and conditions, and promotional messages. Choose between thermal printer format (58mm/80mm) and A4 format.' },
    { q: 'Does DineOpen support thermal printers?', a: 'DineOpen works with most ESC/POS thermal printers including Epson, Star Micronics, and generic USB/Bluetooth printers. Supports both 58mm and 80mm paper widths with configurable layouts.' },
    { q: 'Can I send invoices via WhatsApp?', a: 'Yes. Share digital invoices directly to customer WhatsApp numbers as PDF or image. Customers can also access their bills via a unique link. Great for reducing paper waste.' },
    { q: 'Are duplicate and credit note invoices supported?', a: 'Yes. Generate duplicate invoices anytime from transaction history. Issue GST-compliant credit notes for refunds or cancellations, automatically linked to the original invoice.' },
    { q: 'Can I export invoices in bulk?', a: 'Export all invoices for a date range in PDF, Excel, or CSV format. Useful for monthly accounting, tax filing, and audit purposes. Filter by payment method, tax rate, or order type.' },
    { q: 'What mandatory information is included on invoices?', a: 'Every invoice includes restaurant name, GSTIN, FSSAI number, bill number, date/time, itemized list with HSN codes, CGST/SGST split, total amount, and payment details as required by Indian regulations.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>
              Invoice Generation
            </div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Professional Restaurant Invoice Generation
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Custom-branded invoices with thermal printer support, WhatsApp sharing, bulk export, and complete GST compliance. From counter billing to formal tax invoices, DineOpen handles every format your restaurant needs.
            </p>
            <Link href="/login?ref=billing" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* What's on an invoice */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>
              What Every DineOpen Invoice Includes
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
              {invoiceElements.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                  <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              Invoice Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {features.map((feature, i) => (
                <div key={i} style={{ background: '#f9fafb', padding: '32px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
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

        {/* Interlinks */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Related Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { href: '/products/billing', title: 'DineOpen Billing', desc: 'Complete billing with payment gateway support.' },
                { href: '/products/billing/gst', title: 'GST Billing', desc: 'HSN codes, tax rates, and GSTR filing reports.' },
                { href: '/products/admin', title: 'Printer Settings', desc: 'Configure POS printers, layouts, and formats.' },
                { href: '/products/tables', title: 'Table Management', desc: 'Link bills to specific tables and reservations.' },
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

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
              Invoice FAQ
            </h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', padding: '20px 24px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
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
              Start Generating Professional Invoices
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
              Set up your invoice template in minutes. Free 7-day trial with no credit card required.
            </p>
            <Link href="/login?ref=billing" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
