'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaUsers, FaUserShield, FaKey, FaClipboardList, FaUserPlus, FaLock, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function StaffClient() {
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
      icon: <FaUserPlus size={28} />,
      title: 'Staff CRUD Operations',
      desc: 'Add staff members with name, phone number, email, designation, and joining date. Edit details anytime. Deactivate staff when they leave without losing their historical data. Search and filter staff by role, status, or location.'
    },
    {
      icon: <FaUserShield size={28} />,
      title: 'Role-Based Access Control',
      desc: 'Three built-in roles: Employee (take orders, generate bills), Manager (edit menus, view reports, manage tables), and Admin (full access including settings, staff management, and financials). Create unlimited custom roles with granular permission sets for each module.'
    },
    {
      icon: <FaKey size={28} />,
      title: 'Credentials Management',
      desc: 'Generate unique login credentials for each staff member. Set initial passwords, force password changes on first login, and reset passwords remotely. Revoke access instantly when a staff member is terminated. Session management prevents unauthorized access.'
    },
    {
      icon: <FaClipboardList size={28} />,
      title: 'Activity Logging & Audit Trail',
      desc: 'Every action is logged: orders taken, bills generated, voids and cancellations, discounts applied, cash drawer openings, inventory adjustments, and settings changes. Filter logs by staff member, date range, or action type. Essential for loss prevention.'
    },
    {
      icon: <FaLock size={28} />,
      title: 'Granular Permission Sets',
      desc: 'Control access at the feature level: can this role view billing reports? Edit menu items? Process refunds? Manage inventory? Each permission can be set to Full Access, View Only, or No Access. Over 30 configurable permission points.'
    },
    {
      icon: <FaUsers size={28} />,
      title: 'Multi-Location Staff Assignment',
      desc: 'Assign staff to specific restaurant locations. Transfer staff between locations with a few clicks. Staff who work at multiple locations can switch between them in the app. Track performance per location for staff working across sites.'
    },
  ];

  const roles = [
    { role: 'Employee', permissions: 'Take orders, generate bills, view own performance', color: '#22c55e' },
    { role: 'Manager', permissions: 'All employee access + edit menus, view reports, manage tables, process refunds', color: '#3b82f6' },
    { role: 'Admin', permissions: 'Full access including settings, staff management, financials, and configuration', color: '#ef4444' },
    { role: 'Custom', permissions: 'Define your own permission set from 30+ granular permission points', color: '#8b5cf6' },
  ];

  const faqs = [
    { q: 'What staff roles can I create?', a: 'DineOpen includes built-in roles: Employee (basic access), Manager (operational control), and Admin (full access). Create unlimited custom roles with granular permissions for each feature module.' },
    { q: 'How do staff credentials work?', a: 'Each staff member gets a unique username and password. Admins can generate credentials, force password resets, and revoke access instantly. Staff log in via the app to access their permitted features.' },
    { q: 'Can I track staff activity?', a: 'Yes. Activity logs record every action: orders taken, bills generated, voids, discounts, cash drawer openings, and more. Filter by staff member, date, or action type.' },
    { q: 'How many staff can I add?', a: 'DineOpen allows unlimited staff members on all plans. There are no per-user fees. Add as many employees, managers, and admins as you need.' },
    { q: 'Can staff access the system on their own phones?', a: 'Yes. Staff log in from any device - their phone, a shared tablet, or desktop. Role permissions ensure they only access what they are allowed to.' },
    { q: 'Can I assign staff to multiple locations?', a: 'Yes. Staff can be assigned to one or multiple locations. They switch between locations in the app. Activity is tracked per location for accurate performance reporting.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>Staff Management</div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Restaurant Staff Management & Access Control
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Add staff, assign roles, manage credentials, and track activity. Built-in Employee, Manager, and Admin roles with custom role creation. Unlimited staff members, no per-user fees.
            </p>
            <Link href="/login?ref=admin" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Roles */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: '32px' }}>Staff Roles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {roles.map((r, i) => (
                <div key={i} style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', borderLeft: `4px solid ${r.color}` }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{r.role}</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af', lineHeight: '1.5' }}>{r.permissions}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>Staff Management Features</h2>
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
                { href: '/products/admin', title: 'Admin Overview', desc: 'Complete admin suite.' },
                { href: '/products/admin/shifts', title: 'Shift Scheduling', desc: 'Schedule and track staff shifts.' },
                { href: '/products/admin/multi-restaurant', title: 'Multi-Restaurant', desc: 'Assign staff across locations.' },
                { href: '/products/billing', title: 'Billing', desc: 'Staff-linked billing and reporting.' },
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Staff Management FAQ</h2>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Start Managing Your Team</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Unlimited staff, no per-user fees. Free 30-day trial.</p>
            <Link href="/login?ref=admin" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
