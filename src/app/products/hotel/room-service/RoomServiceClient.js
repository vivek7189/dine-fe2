'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaConciergeBell, FaUtensils, FaReceipt, FaClipboardList, FaBell, FaSync, FaCashRegister, FaClock, FaCheckCircle, FaChevronDown, FaArrowRight } from 'react-icons/fa';

export default function RoomServiceClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const accentColor = '#4f46e5';
  const accentLight = '#eef2ff';
  const accentGradient = 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)';

  const features = [
    { icon: <FaConciergeBell size={24} />, title: 'In-Room Dining Orders', desc: 'Staff can place food and beverage orders for any checked-in guest directly from the hotel module. Select the room, browse the menu, and submit the order in seconds.' },
    { icon: <FaClipboardList size={24} />, title: 'KOT Integration', desc: 'Room service orders generate Kitchen Order Tickets (KOTs) that go straight to the kitchen display or printer. The kitchen sees room service orders alongside dine-in orders with clear room number labels.' },
    { icon: <FaSync size={24} />, title: 'POS Integration', desc: 'Room service uses the same menu, pricing, and kitchen workflow as the restaurant POS. No separate menu setup needed. Any item available in the restaurant is available for room service.' },
    { icon: <FaReceipt size={24} />, title: 'Automatic Folio Charges', desc: 'Every room service order is automatically charged to the guest folio. At check-out, the invoice shows an itemized breakdown of all room service orders during the stay.' },
    { icon: <FaClock size={24} />, title: 'Order Tracking', desc: 'Track the status of room service orders from placed to preparing to delivered. Staff knows exactly when food is ready to be taken to the guest room.' },
    { icon: <FaCashRegister size={24} />, title: 'Consolidated Billing', desc: 'Room charges, room service, and taxes are consolidated into a single invoice. No manual calculation or separate bills for dining. One bill covers the entire stay.' },
  ];

  const workflow = [
    { step: '1', title: 'Guest Calls Front Desk', desc: 'Guest requests food or beverages from their room.' },
    { step: '2', title: 'Staff Places Order', desc: 'Front desk staff selects the room, browses menu, and adds items to the order.' },
    { step: '3', title: 'KOT Sent to Kitchen', desc: 'Order is sent to kitchen as a KOT with room number clearly marked.' },
    { step: '4', title: 'Food Delivered to Room', desc: 'Kitchen prepares the order, staff delivers it, charges are on the folio.' },
  ];

  const benefits = [
    { title: 'No Separate System', desc: 'Room service is built into DineOpen. The same POS that handles your restaurant handles room service. One platform, one menu, one kitchen workflow.' },
    { title: 'No Manual Billing', desc: 'Forget writing down room service orders on paper and adding them up at checkout. Every order is tracked digitally and appears on the guest invoice automatically.' },
    { title: 'Kitchen Efficiency', desc: 'The kitchen sees room service orders on the same screen as dine-in orders. No context switching, no separate printers. Just clear labels showing which orders go to which room.' },
  ];

  const faqs = [
    { q: 'How does room service work with the POS?', a: 'Room service orders are placed from the hotel check-in screen using the same menu as the restaurant. When staff submits an order, it generates a KOT (Kitchen Order Ticket) sent to the kitchen display or printer. The kitchen prepares the food and marks it ready. Staff delivers it to the room. All charges are automatically added to the guest folio for billing at checkout.' },
    { q: 'Can guests order from the full restaurant menu?', a: 'Yes. Room service uses the same menu as the restaurant POS, including all categories, items, variants, and pricing. Staff can add special instructions or modifications to any order, just like a dine-in order.' },
    { q: 'Are room service charges included in the final invoice?', a: 'Yes. Every room service order is tracked and linked to the guest room. At check-out, the invoice includes an itemized list of all room service orders with individual prices, along with room charges and applicable taxes.' },
    { q: 'Do I need a separate system for room service?', a: 'No. Room service is built into DineOpen Hotel and works with the DineOpen restaurant POS. There is no separate software, no additional setup, and no extra cost. If you have the hotel module and the POS, room service works out of the box.' },
    { q: 'How does the kitchen know it is a room service order?', a: 'Room service KOTs are clearly labeled with the room number and marked as room service orders. The kitchen can distinguish them from dine-in orders at a glance on their kitchen display or printed ticket.' },
    { q: 'Can I track the status of room service orders?', a: 'Yes. You can see the status of each room service order: placed, preparing, ready, and delivered. This helps front desk staff know when to arrange delivery to the guest room.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: accentGradient, color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center', marginTop: '16px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Hotel Room Service Ordering System
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              In-room dining orders sent directly to the kitchen via KOT. Charges added to guest folio automatically. Fully integrated with your restaurant POS.
            </p>
            <Link href="/login?ref=hotel" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', backgroundColor: 'white', color: accentColor, borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How Room Service Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '32px' }}>
              {workflow.map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', background: accentGradient, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 auto 16px' }}>
                    {s.step}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Room Service Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Seamless integration between hotel rooms and restaurant kitchen
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {features.map((f, i) => (
                <div key={i} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: accentLight, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '14px' }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Why Integrated Room Service Matters
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {benefits.map((b, i) => (
                <div key={i} style={{ padding: '28px', backgroundColor: accentLight, borderRadius: '16px', borderLeft: `4px solid ${accentColor}` }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{b.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Room Service FAQ
            </h2>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                  <FaChevronDown style={{ flexShrink: 0, color: '#6b7280', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                {openFaq === i && <p style={{ padding: '0 0 20px', fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Related Pages */}
        <section style={{ padding: isMobile ? '40px 20px' : '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: '24px' }}>Explore Other Hotel Features</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { title: 'Rooms', link: '/products/hotel/rooms' },
                { title: 'Bookings', link: '/products/hotel/bookings' },
                { title: 'Front Desk', link: '/products/hotel/front-desk' },
                { title: 'Housekeeping', link: '/products/hotel/housekeeping' },
              ].map((p, i) => (
                <Link key={i} href={p.link} style={{ display: 'block', padding: '16px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', textDecoration: 'none', color: accentColor, fontWeight: '600', fontSize: '15px' }}>
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', background: accentGradient, color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '16px' }}>
              Offer Room Service Without the Complexity
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              One system for restaurant and room service. Start your free 30-day trial.
            </p>
            <Link href="/login?ref=hotel" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: accentColor, borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
