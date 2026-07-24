'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaChair, FaCalendarAlt, FaLayerGroup, FaUsers, FaCheckCircle, FaArrowRight, FaClock, FaThLarge, FaChartBar, FaSearch } from 'react-icons/fa';

export default function TablesLandingClient() {
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
      icon: <FaLayerGroup size={28} />,
      title: 'Multi-Floor Management',
      desc: 'Add unlimited floors to represent your restaurant layout - ground floor, rooftop, private dining, outdoor patio, or banquet halls. Each floor gets its own table map with independent capacity tracking and availability statistics.'
    },
    {
      icon: <FaChair size={28} />,
      title: 'Table CRUD & Configuration',
      desc: 'Create, edit, and manage tables with capacity settings (2-seater, 4-seater, 6-seater, or custom). Set table shapes, merge tables for large groups, and assign table numbers. Bulk creation with number ranges (e.g., T1-T20) saves setup time.'
    },
    {
      icon: <FaThLarge size={28} />,
      title: 'Real-Time Status Tracking',
      desc: 'Visual color-coded indicators show table status at a glance: green for available, red for occupied, yellow for reserved, and gray for blocked. Status updates instantly as orders are placed, bills are settled, or reservations check in.'
    },
    {
      icon: <FaCalendarAlt size={28} />,
      title: 'Date & Time Booking',
      desc: 'Full reservation system with date picker, time slot selection, and party size matching. Customers can book via your website while staff can manage walk-in allocations. Avoid double-booking with real-time availability checks.'
    },
    {
      icon: <FaUsers size={28} />,
      title: 'Booking with Customer Details',
      desc: 'Capture customer name, phone number, email, party size, and special requests during booking. Build a customer database for repeat visits. Send automated booking confirmations and reminders via WhatsApp or SMS.'
    },
    {
      icon: <FaChartBar size={28} />,
      title: 'Availability Statistics',
      desc: 'Dashboard shows total tables, currently available, occupied, and reserved counts per floor. Track table turnover rates, average dining duration, and peak hour occupancy to optimize your seating capacity and staffing.'
    },
  ];

  const statuses = [
    { status: 'Available', color: '#22c55e', desc: 'Table is clean and ready for seating' },
    { status: 'Occupied', color: '#ef4444', desc: 'Guests are currently seated and dining' },
    { status: 'Reserved', color: '#f59e0b', desc: 'Booking confirmed for upcoming time slot' },
    { status: 'Blocked', color: '#6b7280', desc: 'Table temporarily unavailable (maintenance, private event)' },
  ];

  const faqs = [
    { q: 'Can I manage multiple floors?', a: 'Yes. DineOpen Tables supports unlimited floors. Add, edit, or delete floors and assign tables to each. View floor-wise availability at a glance and switch between floors in the dashboard.' },
    { q: 'How does the reservation system work?', a: 'Customers or staff can book tables by selecting date, time, party size, and preferred seating. The system shows only available tables for the requested slot. Confirmation is sent via WhatsApp or SMS.' },
    { q: 'Can I create tables in bulk?', a: 'Yes. Use bulk table creation to add multiple tables at once by specifying a number range (e.g., Table 1-20), capacity, and floor assignment. Saves significant setup time for new restaurants.' },
    { q: 'What table statuses are tracked?', a: 'DineOpen tracks four statuses: Available (green), Occupied (red), Reserved (yellow), and Blocked (gray). Status updates in real-time as orders are placed, completed, or reservations are checked in.' },
    { q: 'Does DineOpen Tables integrate with billing?', a: 'Yes. When a table is occupied, orders are linked to that table. Bills are generated per table, and the table automatically returns to Available status when the bill is settled.' },
    { q: 'Can customers book tables online?', a: 'Yes. Share your booking link on your website or social media. Customers select date, time, and party size, then receive instant confirmation. You control available time slots and capacity limits.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>
              DineOpen Tables
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Table Management & Reservation System for Restaurants
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '750px', margin: '0 auto 36px' }}>
              Manage floors, tables, and reservations from one dashboard. Real-time status tracking, date/time booking, bulk table creation, and visual floor plans. Know exactly which tables are available, occupied, or reserved at any moment.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=tables" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial
              </Link>
              <Link href="/products/tables/reservations" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                Reservation Details
              </Link>
            </div>
          </div>
        </section>

        {/* Status Indicators */}
        <section style={{ padding: isMobile ? '40px 20px' : '60px 40px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: '32px' }}>
              Real-Time Table Status Tracking
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
              {statuses.map((s, i) => (
                <div key={i} style={{ padding: '24px 20px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', textAlign: 'center', border: `2px solid ${s.color}30` }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: s.color, margin: '0 auto 12px', boxShadow: `0 0 12px ${s.color}60` }} />
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '6px' }}>{s.status}</div>
                  <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Complete Table Management Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              From floor planning to reservations, everything to manage your restaurant seating efficiently.
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

        {/* How Booking Works */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              How Table Booking Works
            </h2>
            {[
              { step: '1', title: 'Customer Selects Date & Time', desc: 'Via your website booking page or in-restaurant, customers choose their preferred date, time slot, and party size.' },
              { step: '2', title: 'System Shows Available Tables', desc: 'DineOpen checks availability across all floors and shows only tables that can accommodate the party size at the requested time.' },
              { step: '3', title: 'Booking Confirmed Instantly', desc: 'Customer provides name and contact details. Confirmation is sent via WhatsApp or SMS with booking reference number.' },
              { step: '4', title: 'Table Ready on Arrival', desc: 'Staff sees the reservation in the dashboard. Table status changes to Reserved (yellow) before arrival. Check-in marks it as Occupied.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '24px', marginBottom: '36px', alignItems: 'flex-start' }}>
                <div style={{ minWidth: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>Pricing</h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '40px' }}>Zero transaction fees. Table management included in all plans.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Starter</h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$20<span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>/mo</span></div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Rs.299/mo in India</div>
                {['Table management', 'Floor planning', 'Status tracking', 'Basic reservations'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', marginBottom: '8px', justifyContent: 'center' }}>
                    <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              <div style={{ padding: '32px', borderRadius: '16px', border: '2px solid #ef4444', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>POPULAR</div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Pro</h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$99<span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>/mo</span></div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Rs.1,799/mo in India</div>
                {['Everything in Starter', 'Online booking page', 'WhatsApp confirmations', 'Availability analytics', 'Multi-floor support'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', marginBottom: '8px', justifyContent: 'center' }}>
                    <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interlinks */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Explore Table Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { href: '/products/tables/reservations', title: 'Reservations', desc: 'Date/time booking with customer details and confirmations.' },
                { href: '/products/tables/floor-plan', title: 'Floor Planning', desc: 'Visual floor layouts with drag-and-drop table placement.' },
                { href: '/products/billing', title: 'Billing', desc: 'Table-linked billing with GST compliance.' },
                { href: '/products/admin', title: 'Restaurant Admin', desc: 'Multi-location setup with staff assignments.' },
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
              Frequently Asked Questions
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
              Start Managing Tables Smarter
            </h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
              Set up your floor plan and start taking reservations in minutes. Free 7-day trial.
            </p>
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
