'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaIdCard, FaWallet, FaBolt, FaChartBar, FaMobile, FaUsers, FaClock, FaShieldAlt } from 'react-icons/fa';

export default function CollegeCanteensClient() {
  const features = [
    { icon: FaIdCard, title: 'Student ID Integration', desc: 'Link with college IDs. Scan and bill in seconds. No cash needed.' },
    { icon: FaWallet, title: 'Prepaid Wallet System', desc: 'Parents load money. Students spend. Full transparency.' },
    { icon: FaBolt, title: 'Fast Billing', desc: 'Handle 100+ orders during lunch rush. No queues.' },
    { icon: FaChartBar, title: 'Usage Reports', desc: 'Track spending patterns. Send reports to parents/admin.' },
    { icon: FaMobile, title: 'Pre-Order App', desc: 'Students order ahead. Skip the queue. Pick up ready food.' },
    { icon: FaShieldAlt, title: 'Spending Limits', desc: 'Set daily/weekly limits. Control junk food purchases.' },
  ];

  const benefits = [
    { who: 'Students', benefit: 'No cash, fast service, pre-order option' },
    { who: 'Parents', benefit: 'Track spending, set limits, peace of mind' },
    { who: 'Canteen Staff', benefit: 'Fast billing, fewer errors, less theft' },
    { who: 'College Admin', benefit: 'Reports, hygiene tracking, vendor management' },
  ];

  const stats = [
    { stat: '50%', label: 'Faster Billing' },
    { stat: '0', label: 'Cash Handling' },
    { stat: '100%', label: 'Spending Visibility' },
    { stat: '30%', label: 'Less Food Waste' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <section style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span style={{ fontSize: '64px' }}>🎓</span>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '20px', marginTop: '16px' }}>
              POS for College Canteens
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Student ID billing. Prepaid wallets. Rush-hour ready. Built for campus life.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#1d4ed8', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/contact" style={{ padding: '16px 32px', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Request Demo</Link>
            </div>
          </div>
        </section>

        <section style={{ backgroundColor: 'white', padding: '40px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
            {stats.map((item, idx) => (
              <div key={idx}>
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#3b82f6' }}>{item.stat}</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Features for Campus Canteens</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {features.map((f, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', padding: '28px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    <f.icon style={{ fontSize: '22px', color: '#2563eb' }} />
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
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>Benefits for Everyone</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {benefits.map((b, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e40af', marginBottom: '8px' }}>{b.who}</p>
                  <p style={{ fontSize: '15px', color: '#1e3a8a' }}>{b.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>How It Works</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { step: '1', title: 'Setup Student Database', desc: 'Import student IDs from college system or add manually' },
                { step: '2', title: 'Parents Load Wallet', desc: 'UPI, cards, or cash deposit at counter' },
                { step: '3', title: 'Student Scans ID', desc: 'At counter or self-service kiosk' },
                { step: '4', title: 'Select & Pay', desc: 'Amount deducted from wallet instantly' },
                { step: '5', title: 'Track Everything', desc: 'Parents get SMS/WhatsApp updates' },
              ].map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}>{s.step}</div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{s.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '40px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px', textAlign: 'center' }}>Related Solutions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { name: 'Corporate Cafeteria', href: '/solutions/corporate-cafeteria', icon: '🏢' },
                { name: 'Hospital Canteens', href: '/for/hospital-canteens', icon: '🏥' },
                { name: 'Canteen Management', href: '/for/canteens', icon: '🍽️' },
                { name: 'QSR / Fast Food', href: '/for/qsr', icon: '🍔' },
              ].map((item, idx) => (
                <Link key={idx} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '10px', textDecoration: 'none', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: '60px 20px', backgroundColor: '#3b82f6', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Modernize Your Campus Canteen</h2>
            <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '24px' }}>Join 200+ educational institutions using DineOpen for canteen management.</p>
            <Link href="/pricing" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: 'white', color: '#1d4ed8', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Get Started</Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
