'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaBuilding, FaUsers, FaKey, FaSyncAlt, FaPercent, FaGlobeAmericas, FaPrint, FaClock, FaStar, FaCog, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function AdminLandingClient() {
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
      title: 'Multi-Restaurant Management',
      desc: 'Manage unlimited restaurant locations from a single dashboard. Each location operates independently with its own menu, staff, inventory, and billing. Switch between locations instantly. View consolidated reports or drill down to individual restaurants.'
    },
    {
      icon: <FaUsers size={28} />,
      title: 'Staff Management & Roles',
      desc: 'Add staff members with name, contact details, and role assignment. Built-in roles: Employee, Manager, Admin, or create custom roles with granular permissions. Control who can access billing, edit menus, view reports, or manage inventory.'
    },
    {
      icon: <FaKey size={28} />,
      title: 'Credentials & Access Control',
      desc: 'Generate login credentials for each staff member. Manage passwords, force password resets, and revoke access instantly when staff leave. Activity logs track who did what and when. Two-factor authentication available for admin accounts.'
    },
    {
      icon: <FaSyncAlt size={28} />,
      title: 'Menu Synchronization',
      desc: 'Create a master menu and push it to selected locations. Each location can customize prices, availability, and add location-specific items while keeping the core menu synchronized. Update a dish once and it reflects everywhere.'
    },
    {
      icon: <FaPercent size={28} />,
      title: 'Tax Configuration',
      desc: 'Configure tax rates (GST 5%, 12%, 18%, 28%), tax types (inclusive/exclusive), and multiple tax rules per item category. Set up service charges, packaging fees, and delivery charges with proper tax treatment. Support for VAT in non-Indian locations.'
    },
    {
      icon: <FaGlobeAmericas size={28} />,
      title: 'Currency Management',
      desc: 'Support for 150+ country currencies with proper formatting (symbol, decimal places, position). Ideal for restaurant chains operating in multiple countries. Each location uses its local currency while reports can show converted values.'
    },
    {
      icon: <FaPrint size={28} />,
      title: 'Printer & POS Settings',
      desc: 'Configure thermal printer layouts, receipt formats, and print station assignments (kitchen, bar, billing counter). Support for 58mm and 80mm printers. Set up multiple printers with routing rules based on order type or item category.'
    },
    {
      icon: <FaStar size={28} />,
      title: 'Google Reviews Integration',
      desc: 'Connect your Google My Business listing to monitor reviews from your DineOpen dashboard. Track average rating trends, read and respond to reviews, and get alerts for new reviews. Use customer feedback to improve service quality.'
    },
  ];

  const stats = [
    { value: '150+', label: 'Currencies supported' },
    { value: '4', label: 'Built-in staff roles' },
    { value: 'Unlimited', label: 'Restaurant locations' },
    { value: '0%', label: 'Transaction fees' },
  ];

  const faqs = [
    { q: 'Can I manage multiple restaurants from one account?', a: 'Yes. DineOpen Admin supports unlimited restaurant locations under one account. Each location has independent menus, staff, inventory, and billing. Switch between locations instantly from the dashboard.' },
    { q: 'What staff roles are supported?', a: 'Built-in roles: Employee, Manager, Admin. Create custom roles with granular permissions for each feature (billing, inventory, menu editing, reporting, etc.). Assign multiple roles to a single staff member.' },
    { q: 'Can I sync menus across locations?', a: 'Yes. Create a master menu and push it to selected locations. Each location can have local modifications (prices, availability, location-specific items) while keeping the core menu synchronized.' },
    { q: 'Does DineOpen support Google Reviews integration?', a: 'Yes. Connect your Google My Business listing to display reviews on your dashboard. Track rating trends, read and respond to reviews directly. Great for monitoring customer sentiment.' },
    { q: 'How does shift scheduling work?', a: 'Create shift templates (morning, afternoon, evening). Assign staff with drag-and-drop scheduling. Staff view schedules, request swaps, and check in/out via the app. Track hours for payroll.' },
    { q: 'Can I configure different tax rates for different items?', a: 'Yes. Set different GST rates (5%, 12%, 18%, 28%) per item category. Configure inclusive or exclusive tax, service charges, packaging fees, and delivery charges with proper tax treatment.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>
              DineOpen Admin
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Restaurant Management System for Multi-Location Chains
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '750px', margin: '0 auto 36px' }}>
              Manage staff with role-based access, run multiple restaurant locations, configure taxes and currencies, schedule shifts, set up printers, and monitor Google Reviews. Everything you need to run your restaurant operations from one dashboard.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=admin" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial
              </Link>
              <Link href="/products/admin/staff" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                Staff Management
              </Link>
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '40px 20px' : '60px 40px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '24px', textAlign: 'center' }}>
            {stats.map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              Complete Restaurant Administration
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              From staff roles to printer configuration, every admin feature your restaurant needs.
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

        {/* Pricing */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '16px' }}>Pricing</h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '40px' }}>Zero transaction fees. Admin tools included in all plans.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', maxWidth: '700px', margin: '0 auto' }}>
              <div style={{ padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', backgroundColor: 'white' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Spark</h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$9.99<span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>/mo</span></div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Rs.300/mo in India</div>
                {['Staff management', 'Role assignment', 'Tax configuration', 'Printer setup'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', marginBottom: '8px', justifyContent: 'center' }}>
                    <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
              <div style={{ padding: '32px', borderRadius: '16px', border: '2px solid #ef4444', backgroundColor: 'white', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', backgroundColor: '#ef4444', color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>POPULAR</div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>Blaze</h3>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444', marginBottom: '4px' }}>$89<span style={{ fontSize: '16px', color: '#6b7280', fontWeight: '500' }}>/mo</span></div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Rs.2,500/mo in India</div>
                {['Everything in Spark', 'Multi-location', 'Menu sync', 'Shift scheduling', 'Google Reviews', 'Custom roles'].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#374151', marginBottom: '8px', justifyContent: 'center' }}>
                    <FaCheckCircle style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Interlinks */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Explore Admin Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { href: '/products/admin/staff', title: 'Staff Management', desc: 'Roles, credentials, and permissions.' },
                { href: '/products/admin/multi-restaurant', title: 'Multi-Restaurant', desc: 'Manage multiple locations.' },
                { href: '/products/admin/shifts', title: 'Shift Scheduling', desc: 'Staff scheduling and attendance.' },
                { href: '/products/billing', title: 'Billing', desc: 'GST billing and payments.' },
                { href: '/products/inventory', title: 'Inventory', desc: 'Stock and supplier management.' },
                { href: '/products/tables', title: 'Tables', desc: 'Table and reservation management.' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{link.title}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{link.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#9ca3af', flexShrink: 0, marginLeft: '8px', fontSize: '12px' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', backgroundColor: 'white' }}>
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

        {/* CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Take Control of Your Restaurant Operations</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Staff management, multi-location, and more. Free 30-day trial.</p>
            <Link href="/login?ref=admin" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
