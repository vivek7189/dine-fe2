'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaFileInvoice, FaCalculator, FaChartBar, FaShieldAlt, FaCheckCircle, FaArrowRight, FaPercent, FaBarcode } from 'react-icons/fa';

export default function GstClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const gstFeatures = [
    {
      icon: <FaBarcode size={28} />,
      title: 'Automatic HSN Code Mapping',
      desc: 'DineOpen automatically maps the correct HSN/SAC codes to your menu categories. Restaurant services fall under SAC 9963, while packaged food items use appropriate HSN codes from Chapter 21. No manual lookup needed - set it once during menu creation.'
    },
    {
      icon: <FaPercent size={28} />,
      title: 'CGST/SGST/IGST Split',
      desc: 'For dine-in and local delivery, GST is automatically split into equal CGST and SGST components. For inter-state catering or delivery across state borders, IGST is applied instead. Your invoices always show the correct tax split.'
    },
    {
      icon: <FaCalculator size={28} />,
      title: 'Multiple Tax Rate Support',
      desc: 'Configure 5% GST for non-AC restaurants, 5% for AC restaurants (post-2019 revision), or 18% for hotels above Rs.7,500 room tariff. Different rates for food, beverages, and packaged items on the same bill are handled seamlessly.'
    },
    {
      icon: <FaShieldAlt size={28} />,
      title: 'E-Invoice & IRN Generation',
      desc: 'For restaurants meeting the e-invoicing turnover threshold, generate Invoice Reference Numbers (IRN) through NIC integration. QR codes are automatically added to invoices as required by current GST regulations.'
    },
    {
      icon: <FaChartBar size={28} />,
      title: 'GSTR-1 & GSTR-3B Reports',
      desc: 'Generate filing-ready reports with B2B invoice summaries, B2C aggregate data, HSN-wise summaries, and document details. Export in JSON format for direct upload to the GST portal or Excel for your CA.'
    },
    {
      icon: <FaFileInvoice size={28} />,
      title: 'Tax Audit Trail',
      desc: 'Every invoice modification, cancellation, or credit note is tracked with timestamps and user details. Maintain a complete audit trail for GST department inspections. Amendment history is preserved for compliance.'
    },
  ];

  const taxRates = [
    { category: 'Non-AC Restaurant', rate: '5%', itc: 'No ITC', details: 'CGST 2.5% + SGST 2.5%' },
    { category: 'AC Restaurant', rate: '5%', itc: 'No ITC', details: 'CGST 2.5% + SGST 2.5%' },
    { category: 'Hotel (>Rs.7,500 tariff)', rate: '18%', itc: 'With ITC', details: 'CGST 9% + SGST 9%' },
    { category: 'Packaged Food (MRP)', rate: '5-18%', itc: 'Varies', details: 'Based on HSN code' },
    { category: 'Outdoor Catering', rate: '5%', itc: 'No ITC', details: 'CGST 2.5% + SGST 2.5%' },
    { category: 'Alcoholic Beverages', rate: 'State VAT', itc: 'Not under GST', details: 'State-specific rates' },
  ];

  const faqs = [
    { q: 'What GST rates apply to restaurants in India?', a: 'Non-AC restaurants charge 5% GST without ITC. AC and luxury restaurants also charge 5% GST (post-2019 revision). Restaurants in hotels with room tariff above Rs.7,500 charge 18% GST with ITC. DineOpen supports all rate configurations.' },
    { q: 'What are HSN codes for restaurant items?', a: 'HSN (Harmonized System of Nomenclature) codes classify food items for GST. SAC 9963 covers restaurant services, HSN 2106 covers food preparations, and Chapter 22 covers beverages. DineOpen auto-maps correct codes to your menu categories.' },
    { q: 'How does DineOpen handle CGST and SGST?', a: 'For intra-state transactions, DineOpen splits GST equally into CGST and SGST. For inter-state transactions (e.g., catering across state lines), it applies IGST instead. This is determined automatically based on your business and customer locations.' },
    { q: 'Can DineOpen generate GSTR-1 reports?', a: 'Yes. DineOpen generates GSTR-1 compatible reports with B2B and B2C invoice summaries, HSN-wise summaries, and document details. Export in JSON or Excel format for direct upload to the GST portal.' },
    { q: 'Is e-invoicing supported?', a: 'DineOpen supports e-invoicing for restaurants above the applicable turnover threshold. Generate IRN through NIC integration and include QR codes on invoices as required by GST law.' },
    { q: 'How are credit notes handled for GST?', a: 'When you issue a refund or cancel an order, DineOpen generates a GST-compliant credit note linked to the original invoice. Credit notes are automatically included in your GSTR-1 filing data with proper adjustments.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>
              GST Compliance
            </div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              GST Billing Software for Indian Restaurants
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Automatic HSN code mapping, CGST/SGST/IGST split, multiple tax rates, e-invoicing support, and GSTR-1/3B filing reports. Stay fully compliant with Indian GST regulations without any manual calculations.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=billing" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial
              </Link>
              <Link href="/products/billing/invoices" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                Invoice Features
              </Link>
            </div>
          </div>
        </section>

        {/* Tax Rate Table */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
              GST Rates for Restaurants in India
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '32px' }}>
              DineOpen automatically applies the correct rate based on your restaurant type
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111827' }}>
                    <th style={{ padding: '14px 20px', textAlign: 'left', color: 'white', fontSize: '14px', fontWeight: '600' }}>Category</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', color: 'white', fontSize: '14px', fontWeight: '600' }}>GST Rate</th>
                    <th style={{ padding: '14px 20px', textAlign: 'center', color: 'white', fontSize: '14px', fontWeight: '600' }}>ITC</th>
                    <th style={{ padding: '14px 20px', textAlign: 'left', color: 'white', fontSize: '14px', fontWeight: '600' }}>Tax Split</th>
                  </tr>
                </thead>
                <tbody>
                  {taxRates.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{row.category}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#ef4444', fontWeight: '700', textAlign: 'center' }}>{row.rate}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>{row.itc}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: '#374151' }}>{row.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              GST Billing Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {gstFeatures.map((feature, i) => (
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
                { href: '/products/billing', title: 'DineOpen Billing', desc: 'Complete billing solution with payment gateway support.' },
                { href: '/products/billing/invoices', title: 'Invoice Generation', desc: 'Custom invoice templates and digital bill sharing.' },
                { href: '/products/admin', title: 'Tax Configuration', desc: 'Configure tax rates, types, and multi-tax rules.' },
                { href: '/products/inventory', title: 'Inventory Management', desc: 'Stock tracking with purchase invoice matching.' },
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
              GST Billing FAQ
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
              Get GST-Compliant Billing in Minutes
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
              Set up your GSTIN, configure tax rates, and start generating compliant invoices today.
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
