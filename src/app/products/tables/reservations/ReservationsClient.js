'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaCalendarCheck, FaClock, FaUserFriends, FaWhatsapp, FaBell, FaClipboardList, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function ReservationsClient() {
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
      icon: <FaCalendarCheck size={28} />,
      title: 'Online Booking Page',
      desc: 'Get a custom booking page for your restaurant that you can link from your website, Google My Business listing, Instagram bio, or share directly via WhatsApp. Customers pick their preferred date, time, and party size without calling. Booking is confirmed instantly with a reference number.'
    },
    {
      icon: <FaClock size={28} />,
      title: 'Time Slot Management',
      desc: 'Define your available booking slots with full control over opening hours, last booking time, minimum/maximum reservation duration, and buffer time between seatings. Block specific dates for private events or holidays. Set different slot configurations for weekdays and weekends.'
    },
    {
      icon: <FaUserFriends size={28} />,
      title: 'Party Size Matching',
      desc: 'When a customer books for 6 people, DineOpen automatically shows only tables that can seat 6 or more. For large parties, the system suggests merging adjacent tables. Prevents overbooking small tables and maximizes your seating capacity utilization.'
    },
    {
      icon: <FaWhatsapp size={28} />,
      title: 'WhatsApp Confirmations & Reminders',
      desc: 'Booking confirmations are sent immediately via WhatsApp with date, time, and reference number. Automated reminders go out 2 hours before the reservation. Customers can cancel or modify by replying. No-show tracking identifies unreliable bookers.'
    },
    {
      icon: <FaClipboardList size={28} />,
      title: 'Walk-In & Waitlist Management',
      desc: 'Staff can add walk-in guests from the dashboard and assign available tables immediately. During peak hours, the waitlist feature queues customers with estimated wait times. Notifications are sent when their table is ready.'
    },
    {
      icon: <FaBell size={28} />,
      title: 'Customer Database & History',
      desc: 'Every booking builds your customer database with contact details, visit history, and preferences. Tag VIP customers, track dietary restrictions, and note special occasions. Use this data for personalized WhatsApp marketing campaigns.'
    },
  ];

  const bookingFormFields = [
    'Date selection with calendar picker',
    'Available time slots display',
    'Party size (guests count)',
    'Customer name & phone number',
    'Email address (optional)',
    'Special requests & notes',
    'Seating preference (indoor/outdoor)',
    'Occasion type (birthday, anniversary)',
  ];

  const faqs = [
    { q: 'Can customers book tables online?', a: 'Yes. Share your DineOpen booking page link on your website, Google My Business, Instagram, or WhatsApp. Customers select date, time, and party size. Booking confirmation is instant with a reference number.' },
    { q: 'How are time slots managed?', a: 'You define available time slots, minimum/maximum booking durations, and buffer time between reservations. The system prevents double-booking and shows only available slots to customers.' },
    { q: 'Can I set booking limits?', a: 'Yes. Set maximum bookings per time slot, minimum advance booking time, and maximum party size. Block specific dates for private events or holidays.' },
    { q: 'Does it send booking reminders?', a: 'Automated reminders are sent via WhatsApp or SMS 2 hours before the reservation. No-show tracking helps identify unreliable bookers over time.' },
    { q: 'Can staff manage walk-in reservations?', a: 'Yes. Staff can add walk-in guests directly from the dashboard, assign tables, and track waiting time. The waitlist feature manages overflow during peak hours.' },
    { q: 'Is there a no-show policy feature?', a: 'Yes. Track no-shows per customer. Set up automatic flagging of repeat no-show customers. Optionally require a small deposit for peak hour bookings to reduce no-shows.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>
              Reservations
            </div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Online Restaurant Reservation System
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Accept table bookings 24/7 from your website, social media, or Google listing. Automatic time slot management, WhatsApp confirmations, walk-in handling, and customer database building.
            </p>
            <Link href="/login?ref=tables" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Booking Form Fields */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>
              What the Booking Form Captures
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '12px' }}>
              {bookingFormFields.map((item, i) => (
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
              Reservation Features
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
                { href: '/products/tables', title: 'Table Management', desc: 'Floor management, status tracking, and capacity configuration.' },
                { href: '/products/tables/floor-plan', title: 'Floor Planning', desc: 'Visual floor layouts with table placement.' },
                { href: '/products/billing', title: 'Billing', desc: 'Table-linked billing and payment processing.' },
                { href: '/products/admin', title: 'Restaurant Admin', desc: 'Staff management and operational settings.' },
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Reservation FAQ</h2>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Start Accepting Reservations Online</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Set up your booking page in 5 minutes. Free 30-day trial.</p>
            <Link href="/login?ref=tables" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
