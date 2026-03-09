'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaBed, FaPlusCircle, FaLayerGroup, FaWrench, FaCalendarCheck, FaFilter, FaTrashAlt, FaEye, FaCheckCircle, FaChevronDown, FaArrowRight } from 'react-icons/fa';

export default function RoomsClient() {
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
    { icon: <FaPlusCircle size={24} />, title: 'Single Room Add', desc: 'Add rooms one at a time with full details: room number, type (single, double, suite), floor, pricing, and amenities. Perfect for setting up unique rooms.' },
    { icon: <FaLayerGroup size={24} />, title: 'Bulk Room Creation', desc: 'Add multiple rooms at once by specifying a range. Set shared attributes like room type and floor, then create all rooms in one action. Set up a 30-room hotel in minutes.' },
    { icon: <FaFilter size={24} />, title: 'Status Filtering', desc: 'Filter rooms by status: available, occupied, reserved, maintenance, or cleaning. Get an instant overview of your property at any time.' },
    { icon: <FaCalendarCheck size={24} />, title: 'Date-Based Availability', desc: 'Check which rooms are available for specific dates. See current bookings and scheduled maintenance that affects availability for any date range.' },
    { icon: <FaEye size={24} />, title: 'Current & Scheduled Views', desc: 'Toggle between current room status and scheduled view. See what rooms look like right now or plan ahead by viewing future bookings and maintenance.' },
    { icon: <FaWrench size={24} />, title: 'Maintenance Scheduling', desc: 'Schedule maintenance periods for rooms with start/end dates and reason. Rooms are automatically blocked from bookings during maintenance windows.' },
    { icon: <FaTrashAlt size={24} />, title: 'Delete with Tracking', desc: 'Remove rooms from inventory with a required reason. All deletions are logged in operation history for complete audit trail and accountability.' },
    { icon: <FaBed size={24} />, title: 'Room Status Indicators', desc: 'Visual indicators show room status at a glance: green for available, red for occupied, yellow for reserved, grey for maintenance. Quick visual property overview.' },
  ];

  const faqs = [
    { q: 'How do I add rooms to DineOpen Hotel?', a: 'You can add rooms individually by filling in room details like number, type, floor, and pricing. For faster setup, use the bulk add feature where you specify a room number range and shared attributes, and all rooms are created at once.' },
    { q: 'What room statuses are available?', a: 'DineOpen tracks these room statuses: Available (ready for guests), Occupied (guest checked in), Reserved (booking confirmed), Under Maintenance (blocked for repairs), and Cleaning (being prepared for next guest). You can filter by any status.' },
    { q: 'Can I check availability for specific dates?', a: 'Yes. The date-based availability feature shows you which rooms are free, booked, or under maintenance for any date. This helps you avoid double-bookings and plan ahead for busy periods.' },
    { q: 'How does maintenance scheduling work?', a: 'Select a room, set the maintenance start and end dates, and add a reason. The room is automatically marked as unavailable during that period. Staff can filter to see all rooms currently in maintenance.' },
    { q: 'What happens when I delete a room?', a: 'When you delete a room, you must provide a reason (renovation, permanently closed, etc.). The deletion and reason are recorded in the operation history so you have a complete audit trail.' },
    { q: 'Can I see both current and future room status?', a: 'Yes. The current view shows real-time room status. The scheduled view lets you look ahead to see future bookings and maintenance that will affect room availability.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: accentGradient, color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center', marginTop: '16px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Hotel Room Management Software
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Add, organize, and track every room in your property. Bulk creation, status filtering, date-based availability, and maintenance scheduling -- all in one place.
            </p>
            <Link href="/login?ref=hotel" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', backgroundColor: 'white', color: accentColor, borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Room Management Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Everything you need to manage your room inventory efficiently
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {features.map((f, i) => (
                <div key={i} style={{ padding: '28px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
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

        {/* How Bulk Add Works */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Set Up Your Entire Property in Minutes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {[
                { step: '1', title: 'Choose Room Type', desc: 'Select room type (single, double, deluxe, suite) and floor number.' },
                { step: '2', title: 'Set Room Range', desc: 'Enter starting and ending room numbers for bulk creation.' },
                { step: '3', title: 'Set Pricing', desc: 'Add base price and any additional charges for the room type.' },
                { step: '4', title: 'Create All Rooms', desc: 'One click creates all rooms in the range with shared attributes.' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', background: accentGradient, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '800', flexShrink: 0 }}>
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
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Room Management FAQ
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
        <section style={{ padding: isMobile ? '40px 20px' : '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: '24px' }}>Explore Other Hotel Features</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
              {[
                { title: 'Bookings', link: '/products/hotel/bookings' },
                { title: 'Front Desk', link: '/products/hotel/front-desk' },
                { title: 'Room Service', link: '/products/hotel/room-service' },
                { title: 'Housekeeping', link: '/products/hotel/housekeeping' },
              ].map((p, i) => (
                <Link key={i} href={p.link} style={{ display: 'block', padding: '16px', textAlign: 'center', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: 'white', textDecoration: 'none', color: accentColor, fontWeight: '600', fontSize: '15px' }}>
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
              Set Up Your Room Inventory Today
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Add all your rooms in minutes with bulk creation. Start your free 30-day trial.
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
