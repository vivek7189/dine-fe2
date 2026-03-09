'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaBuilding, FaSyncAlt, FaChartBar, FaExchangeAlt, FaGlobeAmericas, FaCog, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function MultiRestaurantClient() {
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
      icon: <FaBuilding size={28} />,
      title: 'Unlimited Location Management',
      desc: 'Add any number of restaurant locations under your account. Each location operates with its own menu, staff roster, inventory, billing, and settings. Add new locations in minutes with configurable templates. Clone an existing location to speed up setup for new branches.'
    },
    {
      icon: <FaSyncAlt size={28} />,
      title: 'Menu Synchronization',
      desc: 'Create a master menu at the headquarters level and push it to selected locations. Each branch can customize prices for local markets, toggle item availability, and add location-specific specials. When you add a new dish to the master menu, it appears at all synced locations.'
    },
    {
      icon: <FaChartBar size={28} />,
      title: 'Consolidated Reporting',
      desc: 'View aggregate sales, revenue, order count, and customer metrics across all locations from a single dashboard. Compare location performance side by side. Identify your top and bottom performers. Drill down to any individual restaurant for detailed analysis.'
    },
    {
      icon: <FaExchangeAlt size={28} />,
      title: 'Inter-Location Transfers',
      desc: 'Transfer inventory between locations when one branch has excess stock and another is running low. Track transfer requests, approvals, in-transit items, and receipt confirmation. Reduce waste and emergency purchases across your chain.'
    },
    {
      icon: <FaGlobeAmericas size={28} />,
      title: 'Multi-Currency & Tax Support',
      desc: 'Support for 150+ country currencies with proper symbol, decimal, and formatting rules. Each location uses its local currency and tax regulations (GST for India, VAT for UAE, Sales Tax for US). Reports show converted values for headquarters comparison.'
    },
    {
      icon: <FaCog size={28} />,
      title: 'Centralized Settings',
      desc: 'Manage brand-wide settings centrally: loyalty programs, promotion templates, print layouts, and order flow configurations. Override specific settings per location when needed. Changes pushed from HQ propagate to all connected locations.'
    },
  ];

  const faqs = [
    { q: 'How many locations can I manage?', a: 'Unlimited. DineOpen supports any number of restaurant locations under one account. Add new locations anytime - each gets independent menus, staff, inventory, and billing.' },
    { q: 'Can I see reports across all locations?', a: 'Yes. View consolidated sales, revenue, and performance reports across all locations. Drill down to individual restaurants. Compare performance between locations side by side.' },
    { q: 'How does menu synchronization work?', a: 'Create a master menu and push it to selected locations. Each location can modify prices, toggle availability, or add location-specific items. Core items stay in sync while allowing local flexibility.' },
    { q: 'Can staff work at multiple locations?', a: 'Yes. Assign staff to multiple locations. They switch between locations in the app. Performance and activity are tracked per location.' },
    { q: 'Does it support international locations?', a: 'Yes. DineOpen supports 150+ currencies with proper formatting. Each location uses its local currency, tax rates, and regulatory requirements. Reports show converted values.' },
    { q: 'Can I clone a location setup?', a: 'Yes. When adding a new branch, clone an existing location to copy its menu, tax settings, printer configuration, and staff roles. Modify what differs and you are ready to operate in minutes.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>Multi-Location</div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Multi-Restaurant & Chain Management
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Manage unlimited restaurant locations from one dashboard. Sync menus across branches, view consolidated reports, transfer inventory between locations, and support 150+ currencies for international operations.
            </p>
            <Link href="/login?ref=admin" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>Multi-Location Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {features.map((feature, i) => (
                <div key={i} style={{ background: '#f9fafb', padding: '32px', borderRadius: '16px', border: '1px solid #f3f4f6' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '20px' }}>{feature.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', margin: 0 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Related Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { href: '/products/admin', title: 'Admin Overview', desc: 'Complete admin management suite.' },
                { href: '/products/admin/staff', title: 'Staff Management', desc: 'Multi-location staff assignment.' },
                { href: '/products/inventory', title: 'Inventory', desc: 'Inter-location stock transfers.' },
                { href: '/products/billing', title: 'Billing', desc: 'Location-wise billing and reporting.' },
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

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Multi-Restaurant FAQ</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', padding: '20px 24px', background: 'white', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                    <span style={{ fontSize: '20px', color: '#6b7280', transform: openFaq === idx ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
                  </button>
                  {openFaq === idx && <div style={{ padding: '0 24px 20px' }}><p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: 0 }}>{faq.a}</p></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Scale to Multiple Locations</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Unlimited locations, one dashboard. Free 30-day trial.</p>
            <Link href="/login?ref=admin" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
