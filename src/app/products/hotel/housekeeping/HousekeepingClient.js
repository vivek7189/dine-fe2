'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaBroom, FaWrench, FaFilter, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaBed, FaClipboardCheck, FaChevronDown, FaArrowRight } from 'react-icons/fa';

export default function HousekeepingClient() {
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
    { icon: <FaWrench size={24} />, title: 'Maintenance Scheduling', desc: 'Schedule maintenance for any room with start and end dates. Add a reason for the maintenance (plumbing, AC repair, renovation, etc.). The room is automatically blocked from bookings during the maintenance period.' },
    { icon: <FaBroom size={24} />, title: 'Cleaning Status Tracking', desc: 'Track room cleaning status in real-time. When a guest checks out, the room moves to "needs cleaning" status. Once housekeeping is done, mark the room as clean and it becomes available for the next guest.' },
    { icon: <FaFilter size={24} />, title: 'Room Status Filtering', desc: 'Filter all rooms by their housekeeping status: clean, needs cleaning, under maintenance, or occupied. Housekeeping staff can see only the rooms that need attention, prioritizing their workflow.' },
    { icon: <FaExclamationTriangle size={24} />, title: 'Status Indicators', desc: 'Visual color-coded indicators on every room: green for clean and available, red for occupied, yellow for needs cleaning, grey for under maintenance. Quick visual overview of the entire property at a glance.' },
    { icon: <FaCalendarAlt size={24} />, title: 'Scheduled View', desc: 'View upcoming maintenance and cleaning schedules. Plan ahead by seeing which rooms will need attention in the coming days based on check-outs and scheduled maintenance windows.' },
    { icon: <FaClipboardCheck size={24} />, title: 'Turnover Management', desc: 'Manage the guest-to-guest room turnover process. Track rooms from check-out through cleaning to ready-for-check-in. Ensure no guest is assigned a room that has not been properly prepared.' },
  ];

  const statuses = [
    { color: '#22c55e', label: 'Clean / Available', desc: 'Room is cleaned, inspected, and ready for the next guest. Available for booking and check-in.' },
    { color: '#ef4444', label: 'Occupied', desc: 'Guest is currently checked in. Room is not available for new bookings for the current dates.' },
    { color: '#f59e0b', label: 'Needs Cleaning', desc: 'Guest has checked out. Room needs cleaning before it can be assigned to a new guest.' },
    { color: '#6b7280', label: 'Under Maintenance', desc: 'Room is blocked for repairs or renovation. Not available for bookings until maintenance ends.' },
  ];

  const faqs = [
    { q: 'How does housekeeping management work in DineOpen Hotel?', a: 'DineOpen Hotel tracks every room with a status indicator: clean, occupied, needs cleaning, or under maintenance. When a guest checks out, the room automatically moves to "needs cleaning" status. Housekeeping staff can filter to see only rooms that need attention, update the status once cleaning is done, and the room becomes available again. For maintenance, you can schedule periods with start/end dates and reasons.' },
    { q: 'Can I schedule maintenance for rooms?', a: 'Yes. Select any room, set the maintenance start and end dates, and add a reason (plumbing repair, AC servicing, painting, etc.). The room is automatically blocked from bookings for the maintenance period and shows as grey/unavailable in the room view. When maintenance ends, the room returns to available status.' },
    { q: 'What room status indicators are available?', a: 'Four color-coded statuses: Green means clean and available for check-in. Red means a guest is currently checked in. Yellow means the guest has checked out and the room needs cleaning. Grey means the room is under maintenance and blocked from bookings.' },
    { q: 'How do I track room turnover between guests?', a: 'The system handles this automatically. When a guest checks out, the room status changes to "needs cleaning" (yellow). Housekeeping staff see it in their filtered view, clean the room, and mark it as clean (green). Only then can the room be assigned to a new guest for check-in.' },
    { q: 'Does housekeeping status affect bookings?', a: 'Yes. Rooms that are under maintenance or needs cleaning do not show as available for immediate check-in. This prevents front desk staff from assigning a dirty or broken room to a guest. Only rooms with clean/available status can accept new check-ins.' },
    { q: 'Can I see which rooms need cleaning right now?', a: 'Yes. Use the status filter to show only rooms with "needs cleaning" status. This gives housekeeping staff a focused list of rooms that need attention, ordered by room number for efficient floor-by-floor cleaning.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: accentGradient, color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center', marginTop: '16px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Hotel Housekeeping Management
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Schedule maintenance, track room cleaning status, and manage turnover between guests. Color-coded indicators give you a property overview at a glance.
            </p>
            <Link href="/login?ref=hotel" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', backgroundColor: 'white', color: accentColor, borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* Room Status Guide */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Room Status at a Glance
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Color-coded indicators for every room in your property
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '20px' }}>
              {statuses.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: s.color, flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{s.label}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Housekeeping Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Tools to keep every room guest-ready
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

        {/* Turnover Process */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Room Turnover Process
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { step: '1', title: 'Guest Checks Out', desc: 'Room status automatically changes from occupied (red) to needs cleaning (yellow).', color: '#f59e0b' },
                { step: '2', title: 'Housekeeping Cleans Room', desc: 'Staff sees the room in their "needs cleaning" filter and performs cleaning.', color: '#f59e0b' },
                { step: '3', title: 'Mark as Clean', desc: 'Staff marks the room as clean. Status changes to available (green).', color: '#22c55e' },
                { step: '4', title: 'Ready for Next Guest', desc: 'Room is now available for booking and check-in. Front desk can assign it to arriving guests.', color: '#22c55e' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: s.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '800', flexShrink: 0 }}>
                    {s.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{s.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Housekeeping FAQ
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
                { title: 'Room Service', link: '/products/hotel/room-service' },
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
              Keep Every Room Guest-Ready
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Maintenance scheduling, cleaning tracking, and status indicators. Start your free 7-day trial.
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
