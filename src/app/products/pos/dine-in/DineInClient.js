'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaUtensils, FaTable, FaClipboardList, FaBell, FaCheckCircle, FaArrowRight, FaChevronDown, FaChevronUp, FaUsers, FaCreditCard, FaDoorOpen, FaBolt } from 'react-icons/fa';

export default function DineInClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: <FaTable size={28} />, title: 'Table Selection', description: 'Select from available tables when creating a dine-in order. Visual table list shows which tables are free, occupied, or reserved. Link every order to its table for accurate tracking.' },
    { icon: <FaClipboardList size={28} />, title: 'Manual Table Entry', description: 'Not every table is in your system. Enter table numbers manually for outdoor seating, pop-up tables, or private dining areas. Full flexibility without being locked into a fixed floor plan.' },
    { icon: <FaDoorOpen size={28} />, title: 'Room Service Mode', description: 'Hotels and resorts can switch to room service mode. Select a room number and the order is linked to that room. Kitchen receives the KOT with room details for delivery to the correct floor and room.' },
    { icon: <FaBolt size={28} />, title: 'Real-Time Kitchen Sync', description: 'Orders placed at the table appear on the kitchen display instantly via Pusher websockets. Kitchen staff see new orders the moment they are submitted - no delay, no missed orders.' },
    { icon: <FaUsers size={28} />, title: 'Saved Orders Queue', description: 'Park an in-progress order and come back to it. Guests still deciding? Save the order. Need to add desserts later? Recall the saved order, add items, and close the bill when ready.' },
    { icon: <FaCreditCard size={28} />, title: 'Flexible Payment', description: 'Accept cash, card, or UPI at the table. Process payment when the guest is ready, print the receipt, and free up the table. The entire bill-to-payment flow happens at the table on your device.' },
  ];

  const workflow = [
    { num: '1', title: 'Seat the Guest', desc: 'Select "Dine-In" and choose the table number from the list or enter it manually.' },
    { num: '2', title: 'Take the Order', desc: 'Browse the menu, search items, add to cart. Works from any phone, tablet, or terminal.' },
    { num: '3', title: 'Kitchen Receives KOT', desc: 'Order appears on kitchen display instantly. Kitchen prepares and marks items ready.' },
    { num: '4', title: 'Serve & Close Bill', desc: 'Serve the food, add extras if needed, process payment, and print receipt.' },
  ];

  const dineInBenefits = [
    { title: 'Faster Table Turns', desc: 'Orders go directly to kitchen without walking to a terminal. Guests get food faster, tables turn over quicker, and you serve more covers per shift.' },
    { title: 'Fewer Order Mistakes', desc: 'No more illegible handwritten notes or miscommunication. Digital orders are accurate and complete. Modifiers, special requests, and allergies are clearly recorded.' },
    { title: 'Better Guest Experience', desc: 'Staff spend more time at the table and less time running to the POS terminal. Guests feel attended to, and order accuracy builds trust and repeat visits.' },
    { title: 'Simplified Room Service', desc: 'Hotels can take room service orders with the same POS. Room number linking, kitchen sync, and delivery tracking - no separate room service system needed.' },
  ];

  const faqs = [
    { q: 'How does table selection work in DineOpen POS?', a: 'When you select "Dine-In" as the order type, DineOpen shows available tables. Pick from the list or manually enter a table number. The order is linked to that table for tracking and billing.' },
    { q: 'Does DineOpen support room service for hotels?', a: 'Yes. DineOpen includes a dedicated room service order type. Select "Room Service", choose or enter a room number, and the order is linked to that room. The kitchen receives the KOT with room details.' },
    { q: 'Can waiters take orders at the table?', a: 'Yes. DineOpen works on any device. Waiters can browse the menu, add items, and submit orders directly from the table. Orders sync to the kitchen display in real time via Pusher.' },
    { q: 'How do saved orders work for dine-in?', a: 'The saved orders queue lets you park an order and return to it later. Useful when guests are still deciding or when you need to add items to an existing table order. Recall, modify, and close when ready.' },
    { q: 'Can I enter table numbers manually?', a: 'Yes. DineOpen supports both table selection from a list and manual entry. Type in any number for outdoor seating, temporary tables, or areas not in your configured layout.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fef2f2 100%)', padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#dc2626', padding: '8px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
              Table Management + Ordering
            </div>
            <h1 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '900', lineHeight: 1.1, color: '#111827', marginBottom: '24px', letterSpacing: '-2px' }}>
              Dine-In POS System for<br />Full-Service Restaurants
            </h1>
            <p style={{ fontSize: isMobile ? '18px' : '20px', color: '#374151', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 40px' }}>
              Select tables, take orders at the table, and sync with the kitchen in real time. DineOpen POS handles your entire dine-in workflow from seating to bill settlement, including room service for hotels.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=pos" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial <FaArrowRight />
              </Link>
              <Link href="/products/pos" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                See All POS Features
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How Dine-In Ordering Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '32px' }}>
              {workflow.map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 auto 16px', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Dine-In Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
              Purpose-built for sit-down dining, from casual cafes to fine dining and hotel room service.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {features.map((f, i) => (
                <div key={i} style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Why Dine-In Restaurants Choose DineOpen
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {dineInBenefits.map((b, i) => (
                <div key={i} style={{ padding: '28px', background: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{b.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: '17px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                  {openFaq === i ? <FaChevronUp style={{ color: '#6b7280', flexShrink: 0 }} /> : <FaChevronDown style={{ color: '#6b7280', flexShrink: 0 }} />}
                </button>
                {openFaq === i && <p style={{ padding: '0 0 20px', fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '40px 20px' : '60px 40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '24px' }}>Related POS Solutions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { title: 'Cloud POS', href: '/products/pos/cloud-pos' },
                { title: 'Takeaway POS', href: '/products/pos/takeaway' },
                { title: 'POS for Small Restaurants', href: '/products/pos/small-restaurants' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ display: 'block', padding: '20px', background: '#f9fafb', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{link.title}</span>
                  <span style={{ display: 'block', fontSize: '14px', color: '#ef4444', marginTop: '4px' }}>Learn more →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '40px', fontWeight: '800', marginBottom: '16px' }}>
              Transform Your Dine-In Experience
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Start your free trial and take your first table order in minutes. No hardware purchase needed.
            </p>
            <Link href="/login?ref=pos" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
