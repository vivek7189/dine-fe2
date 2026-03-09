'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaLayerGroup, FaThLarge, FaPlusCircle, FaChartPie, FaObjectGroup, FaCog, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function FloorPlanClient() {
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
      desc: 'Add unlimited floors to match your restaurant layout: ground floor, mezzanine, rooftop terrace, outdoor patio, private dining room, or banquet hall. Each floor operates independently with its own table set, capacity counts, and availability statistics. Switch between floors with a single tap.'
    },
    {
      icon: <FaThLarge size={28} />,
      title: 'Visual Table Grid',
      desc: 'Tables are displayed in a clean visual grid with color-coded status indicators. Green for available, red for occupied, yellow for reserved, gray for blocked. See table numbers, capacity, and current order status at a glance. Staff can tap any table to view details or take action.'
    },
    {
      icon: <FaPlusCircle size={28} />,
      title: 'Bulk Table Creation',
      desc: 'Create multiple tables at once by specifying a number range (e.g., Table 1 through Table 20), floor assignment, and default capacity. Set all tables as 4-seater or mix capacities. Saves significant time during initial restaurant setup or when adding a new floor.'
    },
    {
      icon: <FaObjectGroup size={28} />,
      title: 'Table Merging & Splitting',
      desc: 'For large groups, merge adjacent tables into a single combined unit with total capacity. The merged table tracks as one order. When the group leaves, split them back to individual tables. Merging history is maintained for reporting purposes.'
    },
    {
      icon: <FaChartPie size={28} />,
      title: 'Floor-Wise Statistics',
      desc: 'Each floor displays real-time statistics: total tables, available count, occupied count, reserved count, and total capacity. The main dashboard aggregates all floors for a complete restaurant overview. Track peak hour occupancy patterns over time.'
    },
    {
      icon: <FaCog size={28} />,
      title: 'Table Configuration',
      desc: 'Set table capacity (2, 4, 6, 8, or custom), table type (standard, booth, bar, outdoor), minimum and maximum covers, and preferred seating category. Configure auto-release timers so tables automatically return to available status after expected dining duration.'
    },
  ];

  const floorExamples = [
    { name: 'Ground Floor', tables: '20 tables', capacity: '80 seats', desc: 'Main dining area with bar seating' },
    { name: 'First Floor', tables: '15 tables', capacity: '60 seats', desc: 'AC dining with family booths' },
    { name: 'Rooftop', tables: '10 tables', capacity: '40 seats', desc: 'Open-air dining and events' },
    { name: 'Private Dining', tables: '3 rooms', capacity: '30 seats', desc: 'Private rooms for parties' },
  ];

  const faqs = [
    { q: 'How do I set up a floor plan?', a: 'Add floors from the Tables section, then create tables on each floor with number, capacity, and type. Tables are displayed in a visual grid with color-coded status indicators. The whole setup takes under 10 minutes.' },
    { q: 'Can I add multiple floors?', a: 'Yes. Add unlimited floors like Ground Floor, First Floor, Rooftop, Outdoor, or Banquet Hall. Each floor has independent table management and availability tracking.' },
    { q: 'How does bulk table creation work?', a: 'Specify a number range (e.g., 1-20), select the floor, set capacity (2/4/6 seater), and DineOpen creates all 20 tables at once. Much faster than adding tables individually.' },
    { q: 'Can I see occupancy per floor?', a: 'Yes. Each floor shows total tables, available, occupied, and reserved counts. The dashboard provides floor-wise statistics to help you direct guests and manage capacity.' },
    { q: 'Can I merge tables for large groups?', a: 'Yes. Select adjacent tables and merge them temporarily for large parties. The merged tables show as a single unit with combined capacity. Unmerge them when the group leaves.' },
    { q: 'How do auto-release timers work?', a: 'Set expected dining duration per table type (e.g., 90 minutes for dinner). If a table has been occupied beyond this time without a new order, staff gets a notification. Helps with table turnover management.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        {/* Hero */}
        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>
              Floor Planning
            </div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Restaurant Floor Plan & Table Layout
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Design your restaurant layout with multiple floors, configure table capacities, create tables in bulk, and track real-time occupancy. Visual grid displays make it easy for staff to manage seating at a glance.
            </p>
            <Link href="/login?ref=tables" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Floor Examples */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: '32px' }}>
              Example Floor Configuration
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {floorExamples.map((floor, i) => (
                <div key={i} style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{floor.name}</div>
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>{floor.tables}</span>
                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>{floor.capacity}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>{floor.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              Floor Plan Features
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
                { href: '/products/tables', title: 'Table Management', desc: 'Complete table CRUD and status tracking.' },
                { href: '/products/tables/reservations', title: 'Reservations', desc: 'Online booking with WhatsApp confirmations.' },
                { href: '/products/billing', title: 'Billing', desc: 'Table-linked billing and payment processing.' },
                { href: '/products/admin', title: 'Multi-Location', desc: 'Manage floor plans across multiple restaurants.' },
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Floor Plan FAQ</h2>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Design Your Restaurant Floor Plan</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Set up floors and tables in under 10 minutes. Free 30-day trial.</p>
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
