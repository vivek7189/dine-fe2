'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaCalendarAlt, FaList, FaSearch, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaArrowRight, FaChevronDown, FaBed } from 'react-icons/fa';

export default function BookingsClient() {
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
    { icon: <FaCalendarAlt size={24} />, title: 'Calendar View', desc: 'Visual calendar showing all bookings by date. See at a glance which rooms are booked, available, or blocked. Color-coded statuses make it easy to scan occupancy.' },
    { icon: <FaList size={24} />, title: 'List View', desc: 'Switch to a tabular list of all bookings with guest name, room number, check-in/out dates, and status. Sort and filter to find any reservation quickly.' },
    { icon: <FaArrowLeft size={24} />, title: 'Month & Year Navigation', desc: 'Navigate forward and backward through months and years. Review past bookings for reporting or look ahead to plan for upcoming busy seasons and holidays.' },
    { icon: <FaCheckCircle size={24} />, title: 'Booking Confirmation', desc: 'Confirm pending reservations with one click. Confirmed bookings automatically block the room for the booked dates, preventing double-booking.' },
    { icon: <FaTimesCircle size={24} />, title: 'Booking Cancellation', desc: 'Cancel bookings when guests change plans. Cancelled rooms are immediately released back to available inventory for the affected dates.' },
    { icon: <FaSearch size={24} />, title: 'Date-Based Lookup', desc: 'Search for bookings by date to find all reservations for a specific day. Useful for planning arrivals, staff scheduling, and room preparation.' },
  ];

  const benefits = [
    { metric: 'Zero', label: 'Double bookings with availability checks' },
    { metric: '1-Click', label: 'Booking confirmation and cancellation' },
    { metric: 'Visual', label: 'Calendar for quick occupancy overview' },
    { metric: 'Complete', label: 'Booking history for all rooms' },
  ];

  const faqs = [
    { q: 'Does DineOpen Hotel have a booking calendar?', a: 'Yes. The booking system includes a visual calendar view where you can see all reservations laid out by date. Each booking shows the guest name, room number, and status. You can also switch to a list view for a tabular format.' },
    { q: 'Can I confirm or cancel bookings?', a: 'Yes. Each booking can be confirmed or cancelled directly from the calendar or list view. When you confirm a booking, the room is blocked for those dates. When you cancel, the room is released back to available inventory immediately.' },
    { q: 'How do I check room availability for a date?', a: 'Use the date-based lookup in the bookings tab. Select your target date and the system shows all rooms with their availability status. This prevents double-bookings and helps you find rooms for walk-in guests.' },
    { q: 'Can I see bookings for past months?', a: 'Yes. The calendar supports month and year navigation. Go back to review past bookings for reporting and analysis, or go forward to see upcoming reservations and plan staffing accordingly.' },
    { q: 'What happens when a booking is cancelled?', a: 'When you cancel a booking, the room is immediately released and marked as available for the previously blocked dates. The cancellation is recorded in the booking history so you can track cancellation patterns.' },
    { q: 'Can I create bookings from the calendar view?', a: 'Yes. Click on an available date in the calendar to start creating a new booking. Select the room, enter guest details, and confirm the reservation, all from the calendar interface.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: accentGradient, color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center', marginTop: '16px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Hotel Booking Management System
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Visual calendar for reservations, date-based availability checking, and one-click booking confirmation. Never double-book a room again.
            </p>
            <Link href="/login?ref=hotel" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', backgroundColor: 'white', color: accentColor, borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section style={{ backgroundColor: 'white', padding: '48px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '32px', textAlign: 'center' }}>
            {benefits.map((stat, i) => (
              <div key={i}>
                <p style={{ fontSize: '32px', fontWeight: '800', color: accentColor, marginBottom: '4px' }}>{stat.metric}</p>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Booking Management Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Calendar and list views to manage every reservation
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

        {/* Calendar vs List */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Two Ways to View Your Bookings
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '32px' }}>
              <div style={{ padding: '32px', borderRadius: '16px', backgroundColor: accentLight, border: `1px solid ${accentColor}20` }}>
                <FaCalendarAlt size={32} color={accentColor} style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Calendar View</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {['Visual date layout', 'Color-coded booking status', 'Month/year navigation', 'Click to create booking', 'Drag-friendly on desktop'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '14px', color: '#374151' }}>
                      <FaCheckCircle size={12} color="#22c55e" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ padding: '32px', borderRadius: '16px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
                <FaList size={32} color={accentColor} style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>List View</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {['Tabular booking data', 'Sort by any column', 'Filter by status', 'Quick search by guest', 'Export-friendly format'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '14px', color: '#374151' }}>
                      <FaCheckCircle size={12} color="#22c55e" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Booking System FAQ
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
                { title: 'Front Desk', link: '/products/hotel/front-desk' },
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
              Take Control of Your Bookings
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Calendar view, list view, and date-based availability. Start your free 7-day trial.
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
