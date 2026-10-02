'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaStore, FaMobile, FaCloud, FaUtensils, FaBoxes, FaChartBar, FaReceipt } from 'react-icons/fa';

export default function POSSoftwareClient() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <nav style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(20px)', 
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: isMobile ? '0 16px' : '0 32px', 
          height: isMobile ? '64px' : '72px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ 
              width: isMobile ? '36px' : '40px', 
              height: isMobile ? '36px' : '40px', 
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              fontWeight: '800',
              fontSize: isMobile ? '16px' : '18px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}>
              DO
            </div>
            <span style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>
              DineOpen
            </span>
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleLogin} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
              Login
            </button>
            <button onClick={handleLogin} style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center', background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? '36px' : '56px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-2px' }}>
            What is restaurant POS software?
          </h1>
          <p style={{ fontSize: isMobile ? '18px' : '22px', color: '#4b5563', lineHeight: '1.7', maxWidth: '800px', margin: '0 auto 40px' }}>
            Restaurant POS software is a point-of-sale system designed for restaurants to process orders, generate bills, manage menus, track inventory, and handle payments. DineOpen POS software is a cloud-based system that works on any device with internet access, making it ideal for small restaurants, cafes, and cloud kitchens in India.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleLogin} style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', cursor: 'pointer' }}>
              Start Free Trial
            </button>
            <Link href="/#pricing" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none', display: 'inline-block' }}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
            POS Software Features
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '32px' }}>
            {[
              { icon: <FaReceipt />, title: 'POS Billing', desc: 'Process orders, generate bills, accept payments via cash, card, UPI, and digital wallets. Print receipts and maintain transaction records.' },
              { icon: <FaUtensils />, title: 'Menu Management', desc: 'Create digital menus, add items with prices, organize by categories, and update availability in real-time across all devices.' },
              { icon: <FaBoxes />, title: 'Inventory Tracking', desc: 'Track stock levels, monitor ingredient usage, receive low-stock alerts, and generate purchase order suggestions automatically.' },
              { icon: <FaMobile />, title: 'Online Orders', desc: 'Process orders from WhatsApp, QR menus, and web platforms. Orders appear in real-time and are sent to kitchen via KOT.' },
              { icon: <FaChartBar />, title: 'Reports & Analytics', desc: 'View sales reports, revenue summaries, item-wise analysis, inventory reports, and profit margin calculations in real-time.' },
              { icon: <FaCloud />, title: 'Cloud-Based', desc: 'Access your POS system from any device with internet. No hardware installation required. Works on computers, tablets, and smartphones.' }
            ].map((feature, i) => (
              <div key={i} style={{ background: '#f9fafb', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '32px', color: '#ef4444', marginBottom: '16px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#374151' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
            Who Should Use DineOpen POS Software?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
            <Link href="/products/pos-software/small-restaurants" style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Small Restaurants</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#374151' }}>Ideal for restaurants with 1-20 tables. Affordable pricing starting at ₹899/month. Simple interface, no technical expertise required.</p>
            </Link>
            <Link href="/products/pos-software/cafes" style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Cafes</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#374151' }}>Perfect for cafes serving 50-500 customers daily. Fast billing, QR menu support, and online order processing.</p>
            </Link>
            <Link href="/products/pos-software/cloud-kitchens" style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb', textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Cloud Kitchens</h3>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#374151' }}>Best for cloud kitchens processing 20-200 orders per day. Online order management, inventory tracking, and delivery integration.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {[
              { q: 'What is POS software for restaurants?', a: 'POS software for restaurants is a system that processes orders, generates bills, manages menus, tracks inventory, and handles payments. DineOpen POS software is cloud-based and works on any device with internet access.' },
              { q: 'Is DineOpen POS software suitable for small restaurants?', a: 'Yes, DineOpen POS software is specifically designed for small and mid-sized restaurants in India. It offers affordable pricing starting at ₹899/month, making it accessible for small businesses.' },
              { q: 'Does DineOpen POS require hardware installation?', a: 'No, DineOpen POS software is cloud-based and does not require hardware installation. It works on any device with internet access, including computers, tablets, and smartphones.' },
              { q: 'Can I use DineOpen POS on multiple devices?', a: 'Yes, DineOpen POS software can be accessed from multiple devices simultaneously. All data is synced in real-time across all devices.' }
            ].map((faq, i) => (
              <div key={i} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '32px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{faq.q}</h3>
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#374151' }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


