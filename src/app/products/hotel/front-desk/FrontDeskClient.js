'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaSignInAlt, FaSignOutAlt, FaUserPlus, FaFileInvoice, FaConciergeBell, FaFilter, FaIdCard, FaHistory, FaCheckCircle, FaChevronDown, FaArrowRight } from 'react-icons/fa';

export default function FrontDeskClient() {
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
    { icon: <FaSignInAlt size={24} />, title: 'Check-in Modal', desc: 'A streamlined check-in form captures guest name, contact number, ID details, and room assignment. The room status updates to occupied automatically once check-in is confirmed.' },
    { icon: <FaSignOutAlt size={24} />, title: 'Check-out Operations', desc: 'Process check-outs with a complete summary of room charges, room service orders, and taxes. Generate the final invoice and release the room back to available inventory.' },
    { icon: <FaUserPlus size={24} />, title: 'Guest Profile Creation', desc: 'Create guest profiles during check-in with contact details and ID information. Profiles are saved for future visits, so returning guests are recognized instantly.' },
    { icon: <FaFilter size={24} />, title: 'Active Status Filtering', desc: 'Filter the check-ins tab by status: currently checked-in, pending check-out, or all guests. Quickly find any active stay without scrolling through the full list.' },
    { icon: <FaConciergeBell size={24} />, title: 'Room Service Integration', desc: 'Place room service orders directly from the guest check-in screen. Orders are sent to the kitchen via KOT and charges are added to the guest folio automatically.' },
    { icon: <FaFileInvoice size={24} />, title: 'Invoice Generation', desc: 'Generate detailed invoices at check-out with room charges, room service, taxes, and payment details. Print invoices or share them digitally with guests.' },
    { icon: <FaIdCard size={24} />, title: 'Guest Information', desc: 'Store guest details including name, phone, email, ID type and number, and special requests. Access this information throughout the stay for personalized service.' },
    { icon: <FaHistory size={24} />, title: 'Operation History', desc: 'Complete history of all front desk operations including check-ins, check-outs, cancellations, and modifications. Filter by date range, room, or status.' },
  ];

  const workflow = [
    { step: '1', title: 'Guest Arrives', desc: 'Search for existing reservation or create walk-in booking.' },
    { step: '2', title: 'Check-in', desc: 'Enter guest details, assign room, verify ID, and confirm check-in.' },
    { step: '3', title: 'During Stay', desc: 'Handle room service orders, housekeeping requests, and guest queries.' },
    { step: '4', title: 'Check-out', desc: 'Review charges, generate invoice, process payment, release room.' },
  ];

  const faqs = [
    { q: 'How does check-in work in DineOpen Hotel?', a: 'Click the check-in button for a reserved room or start a walk-in check-in. The check-in modal captures guest name, phone number, ID type and number, and any special requests. Once confirmed, the room status changes to occupied and the guest profile is created or updated.' },
    { q: 'Can I generate invoices at check-out?', a: 'Yes. At check-out, the system compiles all charges -- room rate for the stay duration, room service orders, and applicable taxes -- into a single invoice. You can print the invoice or share it digitally. The invoice includes your hotel details, guest information, and itemized charges.' },
    { q: 'Does the front desk integrate with room service?', a: 'Yes. From the active check-in screen, staff can place food and beverage orders for the room. These orders are sent as KOTs (Kitchen Order Tickets) directly to the kitchen, just like dine-in orders. All charges automatically appear on the guest folio for billing at check-out.' },
    { q: 'Can I see a history of all front desk operations?', a: 'Yes. The history tab shows all check-ins, check-outs, cancellations, and modifications with timestamps. You can filter by date range, room number, or operation type to find any specific transaction.' },
    { q: 'What guest information is captured during check-in?', a: 'The check-in form captures: guest name, phone number, email address, ID type (Aadhaar, passport, driving license, etc.), ID number, number of guests, and special requests or notes. All information is saved to the guest profile for future visits.' },
    { q: 'Can returning guests be checked in faster?', a: 'Yes. When a returning guest arrives, you can search for their existing profile by name or phone number. Their details auto-fill from the saved profile, so you only need to assign a room and confirm the check-in.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: accentGradient, color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center', marginTop: '16px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Hotel Front Desk Software
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Streamlined check-in and check-out, guest profile management, room service integration, and invoice generation. Everything your front desk needs in one screen.
            </p>
            <Link href="/login?ref=hotel" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', backgroundColor: 'white', color: accentColor, borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* Workflow */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              The Guest Journey at Your Front Desk
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
              Front Desk Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Tools built for fast, efficient front office operations
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

        {/* Invoice Details */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Professional Invoice Generation
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '32px' }}>
              Every check-out produces a complete, printable invoice
            </p>
            <div style={{ padding: '32px', borderRadius: '16px', backgroundColor: accentLight, border: `1px solid ${accentColor}20` }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '20px' }}>Invoice Includes:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
                {[
                  'Hotel name and contact details',
                  'Guest name and contact info',
                  'Room number and type',
                  'Check-in and check-out dates',
                  'Number of nights stayed',
                  'Room rate per night',
                  'Room service itemized charges',
                  'Tax calculation (GST ready)',
                  'Total amount due',
                  'Payment method and status',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151' }}>
                    <FaCheckCircle size={14} color="#22c55e" /> {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Front Desk FAQ
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
                { title: 'Room Service', link: '/products/hotel/room-service' },
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
              Streamline Your Front Desk Operations
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Faster check-ins, professional invoices, and happy guests. Start your free 7-day trial.
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
