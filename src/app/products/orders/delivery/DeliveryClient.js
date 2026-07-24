'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';

export default function DeliveryClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const features = [
    { icon: '📦', title: 'Delivery Order Dashboard', description: 'All delivery orders in one view. Filter by status (pending, preparing, out for delivery, delivered) to manage your delivery pipeline efficiently.' },
    { icon: '📍', title: 'Address Management', description: 'Customer addresses are captured and stored with delivery orders. Returning customers get auto-filled addresses for faster repeat ordering.' },
    { icon: '🔄', title: 'Real-Time Status Tracking', description: 'Track delivery orders through every stage: received, preparing, packaged, picked up, delivered. All status changes sync in real-time via Pusher.' },
    { icon: '📄', title: 'Delivery Invoices', description: 'Generate invoices with delivery charges, itemized order details, taxes, and payment information. Download PDF, print, or share with customers.' },
    { icon: '🖨️', title: 'Print Delivery Labels', description: 'Print order details and delivery address for packaging. Ensures the right order reaches the right customer with the right items.' },
    { icon: '🔍', title: 'Order History & Search', description: 'Search past delivery orders by order ID, customer name, or phone number. Filter by status, date range, and use compact or expanded views for quick review.' },
  ];

  const deliveryWorkflow = [
    { step: '1', title: 'Order Received', desc: 'Customer orders online, via WhatsApp, or phone. Address and delivery details are captured.' },
    { step: '2', title: 'Kitchen Prepares', desc: 'KOT is sent to kitchen with delivery tag. Kitchen prioritizes packaging-friendly preparation.' },
    { step: '3', title: 'Ready for Pickup', desc: 'Order is packaged and marked ready. Delivery person is notified or assigned.' },
    { step: '4', title: 'Out for Delivery', desc: 'Order picked up by driver. Status updated in real-time across all devices.' },
    { step: '5', title: 'Delivered', desc: 'Delivery confirmed. Invoice generated and order moves to completed history.' },
  ];

  const faqs = [
    { q: 'How does DineOpen handle delivery orders?', a: 'Delivery orders flow into DineOpen just like dine-in orders but with delivery-specific fields: customer address, phone number, delivery notes, and estimated delivery time. Orders are tagged as delivery type so kitchen staff know to prepare and package accordingly.' },
    { q: 'Does DineOpen charge commission on delivery orders?', a: 'No. DineOpen charges zero commissions on all delivery orders. You pay only your flat monthly subscription ($20/mo Starter or $99/mo Pro). Unlike Zomato, Swiggy, or UberEats that take 15-30% of every order, you keep all your delivery revenue.' },
    { q: 'Can I track delivery order status?', a: 'Yes. Delivery orders have full status tracking: pending, preparing, ready for pickup, out for delivery, and delivered. Each status change syncs in real-time across POS, kitchen display, and management dashboard. You always know where every delivery order stands.' },
    { q: 'How do customers place delivery orders?', a: 'Customers can order through your online ordering page, WhatsApp, or by calling your restaurant. Staff can also enter delivery orders directly in the POS. All delivery orders appear in the same unified dashboard regardless of the order channel.' },
    { q: 'Can I generate invoices for delivery orders?', a: 'Yes. DineOpen generates professional invoices for every delivery order including itemized details, delivery charges, taxes, discounts, and payment information. Download as PDF, print for packaging, or share with customers via WhatsApp.' },
    { q: 'Do I need my own delivery drivers?', a: 'DineOpen manages the order and preparation workflow. For actual delivery, you can use your own delivery staff, partner with local delivery services, or use any third-party delivery fleet. The system tracks the order through all stages regardless of who delivers.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              DineOpen Orders / Delivery
            </div>
            <h1 style={{ fontSize: isMobile ? '34px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Delivery Order Management<br />Zero Commissions
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Manage delivery orders from order to doorstep. Track status, manage addresses, generate invoices - all without paying a rupee in commissions.
            </p>
            <Link href="/login?ref=orders" style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Delivery Management Features
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {features.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Delivery Order Lifecycle
            </h2>
            {deliveryWorkflow.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px', marginBottom: '32px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '800', flexShrink: 0 }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Commission Savings */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Save Thousands on Delivery Commissions
            </h2>
            <p style={{ color: '#6b7280', fontSize: '18px', marginBottom: '40px' }}>See how much you save with your own delivery system vs aggregator platforms.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
              <div style={{ backgroundColor: '#fef2f2', borderRadius: '12px', padding: '28px', border: '1px solid #fecaca' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Aggregator (25% commission)</p>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>30 delivery orders/day, avg $18</p>
                <p style={{ fontSize: '32px', fontWeight: '800', color: '#ef4444' }}>-$4,050/mo</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Lost to commissions</p>
              </div>
              <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '28px', border: '1px solid #bbf7d0' }}>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>DineOpen (flat fee)</p>
                <p style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>Same 30 orders/day</p>
                <p style={{ fontSize: '32px', fontWeight: '800', color: '#16a34a' }}>$20/mo</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>Keep all revenue</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '40px' }}>Pricing</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Starter</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$20<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹299/mo in India</p>
                <Link href="/login?ref=orders" style={{ display: 'block', padding: '14px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '2px solid #ef4444' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>Pro</h3>
                <p style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$99<span style={{ fontSize: '16px', fontWeight: '400', color: '#6b7280' }}>/mo</span></p>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>₹1,799/mo in India</p>
                <Link href="/login?ref=orders" style={{ display: 'block', padding: '14px', backgroundColor: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ borderBottom: '1px solid #e5e7eb', padding: '20px 0' }}>
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
                  <span style={{ fontSize: '17px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                  <span style={{ fontSize: '24px', color: '#6b7280', transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openFaq === idx && <p style={{ marginTop: '12px', fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: 'white', marginBottom: '16px' }}>Own Your Delivery Channel</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '18px', marginBottom: '32px' }}>Stop paying commissions on every delivery. Manage orders directly and keep all revenue.</p>
            <Link href="/login?ref=orders" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
