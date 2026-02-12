'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaCheck, FaCalendarAlt, FaRoute, FaUsers, FaReceipt, FaMobile, FaBell, FaChartLine } from 'react-icons/fa';

export default function TiffinServicesClient() {
  const features = [
    { icon: FaCalendarAlt, title: 'Subscription Management', desc: 'Weekly, monthly, custom plans. Auto-renewal, pause, cancel options.' },
    { icon: FaRoute, title: 'Delivery Route Planning', desc: 'Optimize delivery routes. Assign riders. Track live location.' },
    { icon: FaUsers, title: 'Customer Database', desc: 'Store preferences, allergies, delivery addresses. Send personalized menus.' },
    { icon: FaReceipt, title: 'Auto Invoicing', desc: 'Generate monthly bills automatically. GST compliant invoices.' },
    { icon: FaBell, title: 'WhatsApp Notifications', desc: 'Menu updates, delivery alerts, payment reminders via WhatsApp.' },
    { icon: FaChartLine, title: 'Analytics', desc: 'Track subscriber count, retention, revenue trends.' },
  ];

  const painPoints = [
    { problem: 'Tracking who paid for the month', solution: 'Auto-generated payment status dashboard' },
    { problem: 'Managing pause/resume requests', solution: 'Self-service customer app for subscriptions' },
    { problem: 'Remembering food preferences', solution: 'Customer profiles with dietary notes' },
    { problem: 'Delivery route confusion', solution: 'Optimized route maps for delivery staff' },
    { problem: 'Month-end billing headache', solution: 'One-click invoice generation for all' },
  ];

  const plans = [
    { name: 'Weekly Plan', meals: '6 days lunch', price: '₹1,200' },
    { name: 'Monthly Lunch', meals: '26 days lunch', price: '₹4,500' },
    { name: 'Monthly Full', meals: '26 days lunch + dinner', price: '₹8,000' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ fontSize: '64px' }}>🍱</span>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', marginTop: '16px' }}>
              POS for Tiffin Services
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Manage subscriptions, track deliveries, and grow your dabba business with ease.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#d97706', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/contact" style={{ padding: '16px 32px', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Book Demo</Link>
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Built for Tiffin Business Challenges</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {painPoints.map((p, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>😫</span>
                    <span style={{ fontSize: '15px', color: '#6b7280' }}>{p.problem}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>✅</span>
                    <span style={{ fontSize: '15px', color: '#059669', fontWeight: '500' }}>{p.solution}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Features for Tiffin Services</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {features.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <f.icon style={{ fontSize: '22px', color: '#d97706' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Sample Meal Plans You Can Create</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {plans.map((p, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#fffbeb', borderRadius: '12px', textAlign: 'center', border: '2px solid #fcd34d' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>{p.name}</p>
                  <p style={{ fontSize: '14px', color: '#a16207', marginBottom: '12px' }}>{p.meals}</p>
                  <p style={{ fontSize: '28px', fontWeight: '800', color: '#d97706' }}>{p.price}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginTop: '20px' }}>
              Create unlimited custom plans with flexible pricing
            </p>
          </div>
        </section>

        <section style={{ padding: '40px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Solutions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Cloud Kitchen POS', href: '/for/cloud-kitchens', icon: '☁️' },
                { name: 'Catering Software', href: '/for/catering', icon: '🍽️' },
                { name: 'Delivery Management', href: '/features/delivery-management', icon: '🚚' },
                { name: 'WhatsApp Ordering', href: '/features/whatsapp-ordering', icon: '📱' },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#f59e0b', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Ready to Scale Your Tiffin Business?</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Join 500+ tiffin services using DineOpen to manage subscriptions and grow.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#d97706', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>View Pricing</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
