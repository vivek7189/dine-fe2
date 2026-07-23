'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaBoxes, FaTruck, FaUtensils, FaClipboardList, FaChartLine, FaRobot, FaBarcode, FaFileAlt, FaMicrophone, FaExchangeAlt, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function InventoryLandingClient() {
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
      icon: <FaBoxes size={28} />,
      title: 'Stock Dashboard & Tracking',
      desc: 'Real-time inventory dashboard showing total items, low stock alerts, expiring items, and stock value. Track stock levels across categories with card and list views. Category filtering lets you focus on specific item groups.'
    },
    {
      icon: <FaBarcode size={28} />,
      title: 'Barcode & Item Management',
      desc: 'Add items with barcode support using phone camera or USB/Bluetooth scanners. Manage items with SKU, category, unit of measure, minimum stock level, and supplier linkage. Switch between card and list views.'
    },
    {
      icon: <FaTruck size={28} />,
      title: 'Supplier Management',
      desc: 'Maintain a supplier database with contact details, payment terms, and delivery schedules. Track supplier performance with delivery reliability, price consistency, and quality scores. Compare supplier pricing for the same items.'
    },
    {
      icon: <FaUtensils size={28} />,
      title: 'Recipe Creation & Costing',
      desc: 'Build recipes by mapping ingredients from your inventory with exact quantities. DineOpen automatically calculates recipe cost based on current ingredient prices. Update ingredient prices and all recipe costs recalculate instantly.'
    },
    {
      icon: <FaClipboardList size={28} />,
      title: 'Purchase Orders & GRN',
      desc: 'Create purchase orders, send to suppliers, and track delivery status. Record Goods Received Notes (GRN) on delivery with quantity verification. Automatic stock updates when GRN is confirmed.'
    },
    {
      icon: <FaFileAlt size={28} />,
      title: 'Invoice OCR Processing',
      desc: 'Upload supplier invoice PDFs or photos. OCR extracts item names, quantities, prices, and tax details. Smart suggestions match extracted data to existing inventory items. Review and confirm to auto-create GRN entries.'
    },
    {
      icon: <FaExchangeAlt size={28} />,
      title: 'Stock Transfers & Requisitions',
      desc: 'Transfer stock between restaurant locations with full tracking. Internal requisitions allow kitchen to request items from storage. Track transfer history, pending transfers, and inter-location stock balances.'
    },
    {
      icon: <FaRobot size={28} />,
      title: 'AI Insights & Reorder Suggestions',
      desc: 'AI analyzes consumption patterns, lead times, and seasonal trends to suggest optimal reorder points and quantities. Get waste predictions based on expiry dates and usage rates. Voice recognition for hands-free item entry during stock counts.'
    },
  ];

  const stats = [
    { value: '30%', label: 'Reduction in food waste' },
    { value: '20%', label: 'Lower food costs' },
    { value: '95%', label: 'Stock accuracy' },
    { value: '2hrs', label: 'Saved per day on inventory tasks' },
  ];

  const faqs = [
    { q: 'What is restaurant inventory management software?', a: 'Restaurant inventory management software tracks raw materials, ingredients, and supplies. It monitors stock levels, manages suppliers, calculates recipe costs, generates purchase orders, and provides analytics to reduce waste and control food costs.' },
    { q: 'Does DineOpen support barcode scanning?', a: 'Yes. Scan barcodes using your phone camera or a USB/Bluetooth barcode scanner to quickly add items, check stock levels, or record goods received. Barcode data auto-populates item details.' },
    { q: 'How does invoice OCR work?', a: 'Upload a supplier invoice PDF or photo. DineOpen OCR extracts item names, quantities, prices, and tax details. Smart suggestions match extracted data to your existing inventory items. Review and confirm to auto-create a GRN.' },
    { q: 'Can DineOpen predict when to reorder?', a: 'Yes. AI analyzes your consumption patterns, lead times, and seasonal trends to suggest optimal reorder points and quantities. Get alerts before you run out of critical ingredients.' },
    { q: 'Does it track food waste?', a: 'Yes. Log waste by category (expired, spoiled, overproduction). Analytics show waste patterns, cost impact, and suggestions to reduce waste. Track waste as a percentage of purchases.' },
    { q: 'Can I manage inventory across multiple locations?', a: 'Yes. Track stock independently per location. Transfer stock between locations with full tracking. View consolidated reports or drill down to individual restaurants.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>
              DineOpen Inventory
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Restaurant Inventory Management with AI Insights
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '750px', margin: '0 auto 36px' }}>
              Track stock in real-time, manage suppliers, cost your recipes, generate purchase orders, scan invoices with OCR, and get AI-powered reorder suggestions. Reduce food waste by 30% and lower your food costs by 20%.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=inventory" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial
              </Link>
              <Link href="/products/inventory/stock" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                Stock Management
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

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Complete Inventory Management Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              From stock counts to AI predictions, everything to control your restaurant&apos;s inventory and food costs.
            </p>
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

        {/* Pricing */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>Pricing</h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '40px' }}>Zero transaction fees. Inventory included in all plans.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Spark</h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$9.99<span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>/mo</span></div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Rs.300/mo in India</div>
                {['Stock tracking', 'Item management', 'Category filtering', 'Basic reports'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', marginBottom: '8px', justifyContent: 'center' }}>
                    <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              <div style={{ padding: '32px', borderRadius: '16px', border: '2px solid #ef4444', backgroundColor: 'white', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>POPULAR</div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Blaze</h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$89<span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>/mo</span></div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Rs.2,500/mo in India</div>
                {['Everything in Spark', 'Recipe costing', 'Purchase orders & GRN', 'Invoice OCR', 'AI reorder suggestions', 'Multi-location transfers'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', marginBottom: '8px', justifyContent: 'center' }}>
                    <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interlinks */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Explore Inventory Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { href: '/products/inventory/stock', title: 'Stock Management', desc: 'Real-time stock tracking and reports.' },
                { href: '/products/inventory/suppliers', title: 'Suppliers', desc: 'Supplier database and performance tracking.' },
                { href: '/products/inventory/recipes', title: 'Recipe Costing', desc: 'Ingredient mapping and cost calculation.' },
                { href: '/products/inventory/purchase-orders', title: 'Purchase Orders', desc: 'PO creation, tracking, and GRN.' },
                { href: '/products/inventory/ai-reorder', title: 'AI Reorder', desc: 'Smart reorder suggestions and waste predictions.' },
                { href: '/products/billing', title: 'Billing', desc: 'Integrated billing with GST compliance.' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{link.title}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{link.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#9ca3af', flexShrink: 0, marginLeft: '8px', fontSize: '12px' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', backgroundColor: 'white' }}>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Take Control of Your Inventory</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Reduce waste, lower costs, and never run out of ingredients. Free 7-day trial.</p>
            <Link href="/login?ref=inventory" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
