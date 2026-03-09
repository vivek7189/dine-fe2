'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaClock, FaCalendarAlt, FaExchangeAlt, FaUserCheck, FaCalculator, FaBell, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

export default function ShiftsClient() {
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
      icon: <FaCalendarAlt size={28} />,
      title: 'Shift Templates & Scheduling',
      desc: 'Create reusable shift templates: Morning (6AM-2PM), Afternoon (2PM-10PM), Night (10PM-6AM), or custom time ranges. Drag and drop staff into shifts on a weekly calendar view. Copy the previous week schedule and modify as needed. Publish schedules for staff to view instantly.'
    },
    {
      icon: <FaClock size={28} />,
      title: 'Drag-and-Drop Assignment',
      desc: 'Visual weekly calendar shows all staff and shift slots. Drag staff names into shift blocks to assign. Color-coded by role (employee, manager) for quick identification. See staff availability, time-off requests, and assigned hours at a glance while scheduling.'
    },
    {
      icon: <FaUserCheck size={28} />,
      title: 'Attendance Tracking',
      desc: 'Staff check in and out via the DineOpen app using their phone. Real-time attendance dashboard shows who is on shift, who is late, and who is absent. Late arrivals are flagged with time difference. Track patterns of tardiness per staff member over time.'
    },
    {
      icon: <FaExchangeAlt size={28} />,
      title: 'Shift Swap Requests',
      desc: 'Staff can request shift swaps with colleagues through the app. They select the shift they want to swap and propose an alternative. The other staff member accepts or declines. Manager gives final approval. Both parties and the schedule update automatically.'
    },
    {
      icon: <FaCalculator size={28} />,
      title: 'Payroll Hours Calculation',
      desc: 'Automatically calculate total hours worked per staff member based on check-in and check-out times. Track regular hours vs overtime. Set different hourly rates for weekdays, weekends, and holidays. Export detailed hour reports for payroll processing.'
    },
    {
      icon: <FaBell size={28} />,
      title: 'Notifications & Reminders',
      desc: 'Staff receive push notifications when new schedules are published, shift assignments change, or their swap requests are approved. Shift reminders sent 1 hour before start time. Managers get alerts for no-shows 15 minutes after shift start.'
    },
  ];

  const shiftTemplates = [
    { name: 'Morning', time: '6:00 AM - 2:00 PM', color: '#f59e0b', desc: 'Opening, breakfast, lunch prep' },
    { name: 'Afternoon', time: '2:00 PM - 10:00 PM', color: '#3b82f6', desc: 'Lunch service, dinner prep, dinner service' },
    { name: 'Night', time: '10:00 PM - 6:00 AM', color: '#6366f1', desc: 'Late night service, closing, cleanup' },
    { name: 'Split Shift', time: '10 AM-2 PM, 6 PM-10 PM', color: '#10b981', desc: 'Peak hours only coverage' },
  ];

  const faqs = [
    { q: 'How do I create shift schedules?', a: 'Create shift templates (morning, afternoon, night) and assign staff using drag-and-drop. Copy previous week schedules and modify as needed. Publish schedules for staff to view on their app.' },
    { q: 'Can staff request shift swaps?', a: 'Yes. Staff request shift swaps with colleagues through the app. Managers review and approve/deny requests. Both parties are notified of the outcome.' },
    { q: 'How does attendance tracking work?', a: 'Staff check in and out via the app at shift start and end. Managers see real-time attendance. Late arrivals and early departures are flagged. Overtime is calculated automatically.' },
    { q: 'Does it calculate payroll hours?', a: 'Yes. DineOpen tracks total hours worked, overtime hours, and attendance. Export hourly reports for payroll processing. Set different rates for regular and overtime hours.' },
    { q: 'Can I schedule across multiple locations?', a: 'Yes. Schedule staff at different locations on different days. View cross-location schedules to avoid conflicts. Track hours per location for accurate payroll allocation.' },
    { q: 'Can staff view their schedule on their phone?', a: 'Yes. Staff see their upcoming shifts, swap requests, and attendance history in the DineOpen app. They receive notifications for any schedule changes or new assignments.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>

        <section style={{ padding: isMobile ? '48px 20px 60px' : '80px 40px 100px', textAlign: 'center', background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '24px', fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '24px' }}>Shift Scheduling</div>
            <h1 style={{ fontSize: isMobile ? '30px' : '48px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Restaurant Shift Scheduling & Attendance
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#374151', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto 36px' }}>
              Create shift templates, assign staff with drag-and-drop, track attendance in real-time, manage swap requests, and calculate payroll hours. Staff view schedules and check in/out from their phones.
            </p>
            <Link href="/login?ref=admin" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-block', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
              Start Free Trial
            </Link>
          </div>
        </section>

        {/* Shift Templates */}
        <section style={{ padding: isMobile ? '48px 20px' : '64px 40px', backgroundColor: '#111827' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: 'white', textAlign: 'center', marginBottom: '32px' }}>Shift Templates</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
              {shiftTemplates.map((s, i) => (
                <div key={i} style={{ padding: '24px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '12px', borderLeft: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '4px' }}>{s.name}</div>
                  <div style={{ fontSize: '14px', color: s.color, fontWeight: '600', marginBottom: '8px' }}>{s.time}</div>
                  <div style={{ fontSize: '13px', color: '#9ca3af' }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>Scheduling Features</h2>
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
                { href: '/products/admin/staff', title: 'Staff Management', desc: 'Roles, credentials, and permissions.' },
                { href: '/products/admin/multi-restaurant', title: 'Multi-Restaurant', desc: 'Cross-location scheduling.' },
                { href: '/products/tables', title: 'Tables', desc: 'Assign staff to floor sections.' },
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>Shift Scheduling FAQ</h2>
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
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Schedule Smarter, Not Harder</h2>
            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>Drag-and-drop scheduling with attendance tracking. Free 30-day trial.</p>
            <Link href="/login?ref=admin" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>Start Free Trial</Link>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
