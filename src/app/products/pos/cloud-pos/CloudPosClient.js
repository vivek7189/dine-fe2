'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaCloud, FaSync, FaMobileAlt, FaLock, FaCheckCircle, FaArrowRight, FaChevronDown, FaChevronUp, FaLaptop, FaGlobe, FaDatabase } from 'react-icons/fa';

export default function CloudPosClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: <FaCloud size={28} />, title: 'True Cloud Architecture', description: 'Your POS lives in the cloud, not on a fragile local machine. Access your restaurant dashboard, reports, and order history from anywhere with an internet connection.' },
    { icon: <FaSync size={28} />, title: 'Real-Time Multi-Device Sync', description: 'Powered by Pusher websockets. When a waiter takes an order on their phone, it appears on the kitchen screen and cashier terminal instantly. All devices stay perfectly in sync.' },
    { icon: <FaMobileAlt size={28} />, title: 'No Hardware Required', description: 'Use your existing phones, tablets, and laptops. No proprietary terminals, no expensive hardware bundles, no vendor lock-in. Any device with a modern browser works.' },
    { icon: <FaLock size={28} />, title: 'Secure & Backed Up', description: 'All data is encrypted in transit and at rest. Automatic daily backups ensure you never lose data. No risk of a crashed hard drive wiping your restaurant records.' },
    { icon: <FaGlobe size={28} />, title: 'Access From Anywhere', description: 'Check sales, view reports, and monitor your restaurant from home, on vacation, or between locations. Your dashboard is always one browser tab away.' },
    { icon: <FaDatabase size={28} />, title: 'Automatic Updates', description: 'New features and security patches deploy automatically. No manual installations, no downtime, no IT staff needed. You always run the latest version.' },
  ];

  const benefits = [
    { traditional: 'Expensive dedicated terminals', cloud: 'Any device you already own' },
    { traditional: 'Manual software updates', cloud: 'Automatic cloud updates' },
    { traditional: 'Data on local hard drive', cloud: 'Encrypted cloud backups' },
    { traditional: 'Single location access', cloud: 'Access from anywhere' },
    { traditional: 'Hardware vendor lock-in', cloud: 'Zero hardware requirements' },
    { traditional: 'Per-terminal licensing', cloud: 'Unlimited devices included' },
  ];

  const faqs = [
    { q: 'What is a cloud-based POS system?', a: 'A cloud-based POS runs entirely in the cloud and is accessed through a web browser. Unlike traditional POS systems that require dedicated hardware and local servers, a cloud POS works on any device. Data syncs in real time across all devices and locations.' },
    { q: 'Do I need special hardware for DineOpen Cloud POS?', a: 'No. DineOpen runs in any modern web browser. Use your existing phone, tablet, laptop, or desktop. For receipt printing, any standard Bluetooth or USB receipt printer works.' },
    { q: 'What happens if my internet goes down?', a: 'DineOpen stores critical data locally so you can continue taking orders during brief outages. When connectivity returns, everything syncs automatically. A mobile hotspot works as a reliable backup.' },
    { q: 'Is my restaurant data secure in the cloud?', a: 'Yes. All data is encrypted in transit and at rest with industry-standard security. Regular automated backups protect against data loss. Cloud storage is safer than a local machine that could be stolen or damaged.' },
    { q: 'Can multiple devices use the POS at the same time?', a: 'Yes. Unlimited devices can connect simultaneously. Waiter on a tablet, cashier on a desktop, kitchen on a screen - all synced in real time via Pusher websockets. No extra per-device fees.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fef2f2 100%)', padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center' }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#dc2626', padding: '8px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: '600', marginBottom: '24px' }}>
              No Hardware Needed
            </div>
            <h1 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: '900', lineHeight: 1.1, color: '#111827', marginBottom: '24px', letterSpacing: '-2px' }}>
              Cloud-Based POS System<br />for Restaurants
            </h1>
            <p style={{ fontSize: isMobile ? '18px' : '20px', color: '#374151', lineHeight: 1.7, maxWidth: '700px', margin: '0 auto 40px' }}>
              Run your entire POS from any browser. Real-time sync across unlimited devices, automatic updates, and encrypted cloud backups. No expensive hardware, no IT headaches.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=pos" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                Start Free Trial <FaArrowRight />
              </Link>
              <Link href="/products/pos" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none' }}>
                See All POS Features
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Why Cloud POS Changes Everything
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
              Traditional POS systems chain you to expensive hardware and a single location. Cloud POS sets you free.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {features.map((f, i) => (
                <div key={i} style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '16px' }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                  <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cloud vs Traditional */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Cloud POS vs. Traditional POS
            </h2>
            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#111827', color: 'white', padding: '16px 24px' }}>
                <span style={{ fontWeight: '700' }}>Traditional POS</span>
                <span style={{ fontWeight: '700' }}>DineOpen Cloud POS</span>
              </div>
              {benefits.map((b, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 24px', borderBottom: i < benefits.length - 1 ? '1px solid #e5e7eb' : 'none', backgroundColor: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                  <span style={{ fontSize: '15px', color: '#6b7280' }}>{b.traditional}</span>
                  <span style={{ fontSize: '15px', color: '#111827', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCheckCircle style={{ color: '#16a34a', flexShrink: 0 }} /> {b.cloud}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: '17px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                  {openFaq === i ? <FaChevronUp style={{ color: '#6b7280', flexShrink: 0 }} /> : <FaChevronDown style={{ color: '#6b7280', flexShrink: 0 }} />}
                </button>
                {openFaq === i && <p style={{ padding: '0 0 20px', fontSize: '15px', lineHeight: 1.7, color: '#374151' }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Cross-links */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '40px 20px' : '60px 40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '24px' }}>Related POS Solutions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { title: 'Takeaway POS', href: '/products/pos/takeaway' },
                { title: 'Dine-In POS', href: '/products/pos/dine-in' },
                { title: 'POS for Small Restaurants', href: '/products/pos/small-restaurants' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ display: 'block', padding: '20px', background: '#f9fafb', borderRadius: '12px', textDecoration: 'none', textAlign: 'center', border: '1px solid #e5e7eb' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{link.title}</span>
                  <span style={{ display: 'block', fontSize: '14px', color: '#ef4444', marginTop: '4px' }}>Learn more →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '40px', fontWeight: '800', marginBottom: '16px' }}>
              Ditch the Hardware. Go Cloud.
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Start your free trial today. Use any device you already have. Set up takes less than 5 minutes.
            </p>
            <Link href="/login?ref=pos" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#dc2626', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
              Start Free Trial →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
