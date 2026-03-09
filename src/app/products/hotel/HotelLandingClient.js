'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaBed, FaCalendarAlt, FaSignInAlt, FaConciergeBell, FaBroom, FaFileInvoice, FaCheckCircle, FaArrowRight, FaChevronDown, FaHotel, FaUsers, FaBuilding, FaUmbrellaBeach } from 'react-icons/fa';

export default function HotelLandingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: <FaBed size={28} />, title: 'Room Management', description: 'Add rooms individually or in bulk. Track room status, availability by date, and schedule maintenance. Filter by current or scheduled views.', link: '/products/hotel/rooms' },
    { icon: <FaCalendarAlt size={28} />, title: 'Booking System', description: 'Calendar and list views for bookings. Navigate by month and year, confirm or cancel reservations, and check availability by date.', link: '/products/hotel/bookings' },
    { icon: <FaSignInAlt size={28} />, title: 'Check-in / Check-out', description: 'Streamlined check-in modal with guest details. Manage active stays, process check-outs, and create guest profiles on the spot.', link: '/products/hotel/front-desk' },
    { icon: <FaConciergeBell size={28} />, title: 'Room Service', description: 'In-room dining orders integrated with the restaurant POS. KOT sent directly to kitchen. Charges added to guest folio automatically.', link: '/products/hotel/room-service' },
    { icon: <FaBroom size={28} />, title: 'Housekeeping', description: 'Schedule cleaning and maintenance tasks. Track room status indicators. Filter rooms by clean, dirty, or maintenance status.', link: '/products/hotel/housekeeping' },
    { icon: <FaFileInvoice size={28} />, title: 'Invoice Generation', description: 'Generate and print invoices for guest stays including room charges, room service, and taxes. Complete billing history maintained.', link: '/products/hotel/front-desk' },
  ];

  const steps = [
    { num: '1', title: 'Set Up Rooms', desc: 'Add your rooms with types, floor details, and pricing. Use bulk add to set up quickly.' },
    { num: '2', title: 'Manage Bookings', desc: 'Accept reservations via calendar view. Check room availability by date before confirming.' },
    { num: '3', title: 'Check-in Guests', desc: 'Process check-ins with guest details. Create profiles, assign rooms, and start the stay.' },
    { num: '4', title: 'Serve & Check-out', desc: 'Handle room service, housekeeping, and generate final invoice at check-out.' },
  ];

  const audiences = [
    { icon: <FaHotel size={32} />, title: 'Small Hotels', desc: 'Properties with 5-50 rooms that need simple, affordable management without enterprise complexity.' },
    { icon: <FaBuilding size={32} />, title: 'Boutique Hotels', desc: 'Unique stays that want to focus on guest experience, not software. Clean interface, fast operations.' },
    { icon: <FaUsers size={32} />, title: 'Hotel-Restaurants', desc: 'Hotels with in-house restaurants. Seamless integration between room service and kitchen operations.' },
    { icon: <FaUmbrellaBeach size={32} />, title: 'Resorts & Lodges', desc: 'Small resorts, guest houses, and lodges looking for cloud-based management accessible from anywhere.' },
  ];

  const comparisons = [
    { feature: 'Pricing', dineopen: 'From $9.99/mo', comp1: 'From $50/mo', comp2: 'From $40/mo', comp3: 'From $46/mo' },
    { feature: 'Restaurant POS Integration', dineopen: 'Built-in', comp1: 'Third-party', comp2: 'Third-party', comp3: 'Add-on' },
    { feature: 'Room Service to Kitchen', dineopen: 'Direct KOT', comp1: 'Manual', comp2: 'Separate module', comp3: 'Not available' },
    { feature: 'Setup Time', dineopen: '10 minutes', comp1: '1-2 days', comp2: '1 day', comp3: '2-3 hours' },
    { feature: 'Free Trial', dineopen: '30 days', comp1: '14 days', comp2: '14 days', comp3: '30 days' },
    { feature: 'Bulk Room Add', dineopen: 'Yes', comp1: 'Yes', comp2: 'Yes', comp3: 'No' },
    { feature: 'Cloud-Based', dineopen: 'Yes', comp1: 'Yes', comp2: 'Yes', comp3: 'Yes' },
  ];

  const faqs = [
    { q: 'What is DineOpen Hotel management software?', a: 'DineOpen Hotel is a cloud-based hotel management module within the DineOpen platform. It helps small hotels, boutique stays, and hotel-restaurants manage rooms, bookings, check-ins, housekeeping, room service, and invoicing from one dashboard. It is not a booking marketplace like Booking.com or OYO -- it is operational software for hotel staff.' },
    { q: 'Is this a full hotel booking engine?', a: 'No. DineOpen Hotel is property management software for day-to-day hotel operations. It manages your room inventory, guest check-ins, housekeeping schedules, and generates invoices. If you need an online booking marketplace, you would use a separate OTA platform.' },
    { q: 'How much does it cost?', a: 'The Spark Plan starts at $9.99/month (Rs 300/month in India). The Blaze Plan at $89/month (Rs 2,500/month in India) includes advanced features for larger properties. Both plans include the hotel management module along with the restaurant POS.' },
    { q: 'Can I manage room service orders?', a: 'Yes. Room service is fully integrated with the restaurant POS. When a guest orders food from their room, the order is sent as a KOT (Kitchen Order Ticket) directly to the kitchen, just like a dine-in order. Charges are automatically added to the guest folio.' },
    { q: 'How do I add rooms to the system?', a: 'You can add rooms individually with details like room number, type, floor, and pricing. For faster setup, use the bulk add feature to create multiple rooms at once. You can also set room status and schedule maintenance periods.' },
    { q: 'Does it handle guest profiles?', a: 'Yes. During check-in, you can create guest profiles with contact details and ID information. Guest history is maintained so you can see past stays and preferences when a returning guest checks in.' },
    { q: 'What devices does it work on?', a: 'DineOpen Hotel is cloud-based and works on any device with a web browser -- desktops, laptops, tablets, and smartphones. No special hardware or software installation required.' },
    { q: 'Who is this best for?', a: 'DineOpen Hotel is designed for small hotels (under 50 rooms), boutique hotels, guest houses, hotel-restaurants, lodges, dharamshalas, and small resorts. If you run a large hotel chain with hundreds of rooms, you may need an enterprise PMS instead.' },
  ];

  const accentColor = '#4f46e5';
  const accentLight = '#eef2ff';
  const accentGradient = 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)';

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: accentGradient, color: 'white', padding: isMobile ? '60px 20px' : '100px 20px', textAlign: 'center', marginTop: '16px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              Hotel Management Module
            </div>
            <h1 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15, letterSpacing: '-1px' }}>
              Complete Hotel Management<br />Made Simple
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '36px', maxWidth: '700px', margin: '0 auto 36px', lineHeight: 1.6 }}>
              Manage rooms, bookings, check-ins, housekeeping, and room service from one dashboard. Built for small hotels and hotel-restaurants that need powerful tools without enterprise pricing.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=hotel" style={{ padding: '16px 32px', backgroundColor: 'white', color: accentColor, borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Start Free Trial <FaArrowRight />
              </Link>
              <Link href="#pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Everything You Need to Run Your Hotel
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
              Six core modules that cover every aspect of small hotel operations
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {features.map((f, i) => (
                <Link key={i} href={f.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ padding: '28px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s', cursor: 'pointer' }}>
                    <div style={{ width: '56px', height: '56px', backgroundColor: accentLight, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, marginBottom: '16px' }}>
                      {f.icon}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '12px' }}>{f.description}</p>
                    <span style={{ fontSize: '14px', color: accentColor, fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Learn more <FaArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '32px' }}>
              {steps.map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', background: accentGradient, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 auto 16px' }}>
                    {s.num}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Who Is DineOpen Hotel For?
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Built for operators who want simplicity over enterprise complexity
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {audiences.map((a, i) => (
                <div key={i} style={{ padding: '32px', backgroundColor: accentLight, borderRadius: '16px', display: 'flex', gap: '20px', alignItems: isMobile ? 'flex-start' : 'center' }}>
                  <div style={{ color: accentColor, flexShrink: 0 }}>{a.icon}</div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{a.title}</h3>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6 }}>{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              DineOpen Hotel vs Other PMS Software
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              See how DineOpen compares to popular hotel management platforms
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: accentColor, color: 'white' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontWeight: '600' }}>Feature</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '700' }}>DineOpen Hotel</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600' }}>Hotelogix</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600' }}>eZee</th>
                    <th style={{ padding: '14px 16px', textAlign: 'center', fontWeight: '600' }}>Little Hotelier</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '500', color: '#111827' }}>{row.feature}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: accentColor, fontWeight: '700' }}>{row.dineopen}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>{row.comp1}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>{row.comp2}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>{row.comp3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section id="pricing" style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Simple, Affordable Pricing
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Hotel management included with every DineOpen plan
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              <div style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Spark Plan</h3>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', color: '#111827' }}>$9.99</span>
                  <span style={{ fontSize: '16px', color: '#6b7280' }}>/month</span>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Rs 300/month in India</p>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                  {['Room management', 'Booking calendar', 'Check-in / check-out', 'Invoice generation', 'Guest profiles', 'Restaurant POS included'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '14px', color: '#374151' }}>
                      <FaCheckCircle size={14} color="#22c55e" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/login?ref=hotel" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '8px', border: `2px solid ${accentColor}`, color: accentColor, fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}>
                  Start Free Trial
                </Link>
              </div>
              <div style={{ padding: '32px', borderRadius: '16px', border: `2px solid ${accentColor}`, backgroundColor: 'white', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '24px', backgroundColor: accentColor, color: 'white', padding: '4px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>RECOMMENDED</div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Blaze Plan</h3>
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '36px', fontWeight: '800', color: '#111827' }}>$89</span>
                  <span style={{ fontSize: '16px', color: '#6b7280' }}>/month</span>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Rs 2,500/month in India</p>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                  {['Everything in Spark', 'Room service integration', 'Housekeeping management', 'Maintenance scheduling', 'Operation history & reports', 'Priority support'].map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '14px', color: '#374151' }}>
                      <FaCheckCircle size={14} color="#22c55e" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/login?ref=hotel" style={{ display: 'block', textAlign: 'center', padding: '14px', borderRadius: '8px', background: accentGradient, color: 'white', fontWeight: '700', textDecoration: 'none', fontSize: '16px' }}>
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                  <FaChevronDown style={{ flexShrink: 0, color: '#6b7280', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </button>
                {openFaq === i && (
                  <p style={{ padding: '0 0 20px', fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Explore the DineOpen Platform
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Hotel management works seamlessly with these DineOpen products
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {[
                { title: 'DineOpen POS', desc: 'Full restaurant point-of-sale system with billing, orders, and kitchen management.', link: '/products/pos-software' },
                { title: 'DineOpen Menu', desc: 'Digital QR menu for dine-in guests and room service ordering.', link: '/products/restaurant-management' },
                { title: 'DineOpen Billing', desc: 'GST-ready billing with tax calculation, invoice printing, and payment processing.', link: '/products/billing-software' },
              ].map((p, i) => (
                <Link key={i} href={p.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ padding: '28px', borderRadius: '16px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', transition: 'box-shadow 0.2s' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{p.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '12px' }}>{p.desc}</p>
                    <span style={{ fontSize: '14px', color: accentColor, fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Learn more <FaArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', background: accentGradient, color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Simplify Your Hotel Operations?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Start your free 30-day trial. No credit card required. Set up your property in under 10 minutes.
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
