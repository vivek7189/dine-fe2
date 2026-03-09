'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaBoxes, FaBarcode, FaBell, FaCalendarTimes, FaThList, FaChartBar, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function StockClient() {
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
      title: 'Real-Time Stock Dashboard',
      desc: 'The inventory dashboard shows total item count, total stock value, low stock items, and expiring items at a glance. Color-coded badges highlight items needing attention. Drill down to any category or individual item for detailed stock history and movement logs.'
    },
    {
      icon: <FaBarcode size={28} />,
      title: 'Barcode Scanning',
      desc: 'Use your phone camera or a USB/Bluetooth barcode scanner to add new items, check stock levels, or record goods received. Scanning a barcode instantly pulls up item details, current stock, last purchase price, and supplier information. Great for quick stock counts.'
    },
    {
      icon: <FaBell size={28} />,
      title: 'Low Stock Alerts',
      desc: 'Set minimum stock levels (reorder points) for each item. When stock falls below the threshold, alerts appear on the dashboard and optionally via WhatsApp or email. Priority alerts for critical ingredients ensure you never run out during service.'
    },
    {
      icon: <FaCalendarTimes size={28} />,
      title: 'Expiry Date Tracking',
      desc: 'Record expiry dates when receiving goods. DineOpen highlights items expiring within your configured window (3, 7, or 14 days). Use FIFO (First In, First Out) tracking to ensure older stock is used first. Reduce waste from expired ingredients.'
    },
    {
      icon: <FaThList size={28} />,
      title: 'Card & List Views with Filtering',
      desc: 'Toggle between visual card view (with item images and stock gauges) and compact list view (table format for quick scanning). Filter by category, supplier, stock status (low, normal, overstock), or search by item name, SKU, or barcode.'
    },
    {
      icon: <FaChartBar size={28} />,
      title: 'Stock Reports & Usage Analytics',
      desc: 'Generate stock valuation reports, consumption trend analysis, wastage reports, and stock movement history. Compare actual vs theoretical usage to identify discrepancies. Export reports in Excel, CSV, or PDF. Schedule automated weekly reports.'
    },
  ];

  const dashboardMetrics = [
    'Total items in inventory',
    'Total stock value (cost)',
    'Items below reorder point',
    'Items expiring this week',
    'Stock received today',
    'Stock consumed today',
    'Top 10 consumed items',
    'Category-wise breakdown',
  ];

  const faqs = [
    { q: 'How does real-time stock tracking work?', a: 'Stock levels update automatically when orders are placed (deducting ingredients via recipes), when GRNs are recorded (adding received goods), and when waste is logged. The dashboard always shows current quantities.' },
    { q: 'Can I set low stock alerts?', a: 'Yes. Set minimum stock levels per item. When stock falls below the threshold, you get alerts on the dashboard and optional WhatsApp/email notifications. Never run out of critical ingredients.' },
    { q: 'Does it track item expiry dates?', a: 'Yes. Record expiry dates when receiving goods. DineOpen alerts you about items expiring soon (configurable: 3, 7, or 14 days) so you can use them first or plan menu specials.' },
    { q: 'Can I view stock in different formats?', a: 'Yes. Switch between card view (visual with images) and list view (compact table format). Filter by category, supplier, stock status, or search by name/barcode.' },
    { q: 'How are stock reports generated?', a: 'Generate reports for stock value, usage trends, wastage analysis, consumption by category, and stock movement history. Export in Excel, CSV, or PDF format.' },
    { q: 'Can I do physical stock counts?', a: 'Yes. Start a stock count session, scan or enter actual quantities, and DineOpen shows variances against system stock. Approve adjustments to reconcile. Count history is maintained for auditing.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>Stock Management</div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Real-Time Restaurant Stock Tracking
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Track every ingredient in real-time with barcode scanning, low stock alerts, expiry date monitoring, and detailed usage analytics. Know exactly what you have, what you need, and what is about to expire.
            </p>
            <Link href="/login?ref=inventory" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Dashboard Metrics at a Glance</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
              {dashboardMetrics.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', backgroundColor: 'white', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                  <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>Stock Tracking Features</h2>
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
                { href: '/products/inventory/suppliers', title: 'Suppliers', desc: 'Supplier database and performance tracking.' },
                { href: '/products/inventory/recipes', title: 'Recipe Costing', desc: 'Map ingredients and calculate recipe costs.' },
                { href: '/products/inventory/purchase-orders', title: 'Purchase Orders', desc: 'Create POs and track deliveries.' },
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Stock Management FAQ</h2>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Start Tracking Stock in Real-Time</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Set up your inventory in minutes. Free 30-day trial.</p>
            <Link href="/login?ref=inventory" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
