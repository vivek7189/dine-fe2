'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaStore, FaMobile, FaCloud } from 'react-icons/fa';

export default function SmallRestaurantsClient() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = () => router.push('/login');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 32px', height: isMobile ? '64px' : '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: isMobile ? '36px' : '40px', height: isMobile ? '36px' : '40px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: isMobile ? '16px' : '18px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
              DO
            </div>
            <span style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' }}>DineOpen</span>
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleLogin} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>Login</button>
            <button onClick={handleLogin} style={{ padding: '10px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Get Started</button>
          </div>
        </div>
      </nav>

      <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', textAlign: 'center', background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? '36px' : '56px', fontWeight: '900', lineHeight: '1.1', color: '#111827', marginBottom: '24px', letterSpacing: '-2px' }}>
            Is DineOpen POS good for small restaurants in India?
          </h1>
          <p style={{ fontSize: isMobile ? '18px' : '22px', color: '#4b5563', lineHeight: '1.7', maxWidth: '800px', margin: '0 auto 40px' }}>
            Yes, DineOpen POS software is specifically designed for small restaurants in India. It offers affordable pricing starting at ₹899/month, making it accessible for small businesses with limited budgets. The system includes all essential features: POS billing, menu management, inventory tracking, GST billing, and online orders.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleLogin} style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', border: 'none', cursor: 'pointer' }}>Start Free Trial</button>
            <Link href="/#pricing" style={{ padding: '16px 32px', fontSize: '16px', fontWeight: '700', borderRadius: '12px', background: 'white', color: '#111827', border: '1px solid #e5e7eb', textDecoration: 'none', display: 'inline-block' }}>View Pricing</Link>
          </div>
        </div>
      </section>

      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: '800', color: '#111827', marginBottom: '32px', textAlign: 'center' }}>
            Why Small Restaurants Choose DineOpen POS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px', marginBottom: '48px' }}>
            {[
              { icon: <FaStore />, title: 'Affordable Pricing', desc: 'Starting at ₹899/month. Perfect for small restaurants with limited budgets.' },
              { icon: <FaMobile />, title: 'No Hardware Required', desc: 'Works on smartphones, tablets, or computers. No expensive POS hardware installation needed.' },
              { icon: <FaCloud />, title: 'Easy to Use', desc: 'Simple interface designed for small restaurants. No technical expertise required. Start using immediately.' },
              { icon: <FaCheckCircle />, title: 'All Essential Features', desc: 'POS billing, menu management, inventory tracking, GST billing, and online orders included.' }
            ].map((feature, i) => (
              <div key={i} style={{ background: '#f9fafb', padding: '32px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '32px', color: '#ef4444', marginBottom: '16px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                <p style={{ fontSize: '16px', lineHeight: '1.7', color: '#374151' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


