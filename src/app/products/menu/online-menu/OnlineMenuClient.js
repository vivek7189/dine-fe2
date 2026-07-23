'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGlobe, FaMobileAlt, FaSync, FaShareAlt, FaCheckCircle, FaSearch, FaChevronDown } from 'react-icons/fa';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';

export default function OnlineMenuClient() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: <FaGlobe size={28} />, title: 'Share Anywhere', description: 'Get a unique URL for your menu. Share it on social media, Google My Business, WhatsApp, your website, or print it on business cards. Customers access your menu from any browser.' },
    { icon: <FaMobileAlt size={28} />, title: 'Mobile-First Design', description: 'Your online menu looks stunning on phones, tablets, and desktops. Responsive layouts ensure every customer gets the best experience regardless of their device.' },
    { icon: <FaSync size={28} />, title: 'Real-Time Sync', description: 'Changes you make in DineOpen POS reflect on your online menu instantly. Update prices, mark items unavailable, or add new dishes — your online menu stays current automatically.' },
    { icon: <FaShareAlt size={28} />, title: 'Social Media Ready', description: 'Your online menu link works perfectly when shared on Instagram, Facebook, WhatsApp, and Twitter. Preview cards show your restaurant name and branding.' },
    { icon: <FaSearch size={28} />, title: 'SEO Friendly', description: 'Your online menu is indexable by Google. Customers searching for your restaurant can find your menu directly in search results, driving more traffic to your business.' },
    { icon: <FaCheckCircle size={28} />, title: 'Always Updated', description: 'No more outdated PDFs or third-party menu sites with wrong prices. Your DineOpen online menu is the single source of truth, always showing current offerings.' },
  ];

  const benefits = [
    'Customers browse your full menu before visiting',
    'Reduces phone calls asking "What do you serve?"',
    'Works with Google My Business menu link',
    'Shareable on all social media platforms',
    'Auto-syncs with your POS — no double data entry',
    'Beautiful themes match your restaurant brand',
    'Supports veg/non-veg indicators and item photos',
    'Category-based navigation for easy browsing',
  ];

  const faqs = [
    { q: 'How do I share my restaurant menu online?', a: 'With DineOpen Menu, simply add your menu items, choose a theme, and you get a shareable online menu link. Share it on social media, Google My Business, your website, or anywhere. Your menu auto-syncs with your POS so prices and availability are always up to date.' },
    { q: 'Can customers order directly from the online menu?', a: 'Yes! DineOpen online menus can be connected to the ordering system. Customers can browse your menu, add items to cart, and place orders directly. Orders appear in your POS in real-time.' },
    { q: 'Does the online menu update automatically?', a: 'Yes. When you update prices, add new items, or mark items as unavailable in DineOpen, your online menu updates in real-time. No need to manually update a separate website.' },
    { q: 'Is the online menu mobile-friendly?', a: 'Absolutely. DineOpen online menus are fully responsive and look great on phones, tablets, and desktops. Most customers will browse on their phones, so mobile-first design is built in.' },
    { q: 'Can I put my online menu on Google My Business?', a: 'Yes! Copy your DineOpen menu link and add it to your Google My Business listing under the menu URL field. This helps customers see your menu directly from Google Search and Maps.' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* Hero */}
      <section style={{ padding: isMobile ? '40px 20px 60px' : '60px 40px 80px', background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: '600', marginBottom: '20px' }}>
            DineOpen Menu
          </div>
          <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '900', color: '#111827', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-1px' }}>
            Share Your Restaurant Menu Online
          </h1>
          <p style={{ fontSize: isMobile ? '16px' : '20px', color: '#4b5563', lineHeight: '1.7', marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
            Give customers instant access to your full menu from any device. Your online menu stays perfectly in sync with your POS — update once, see it everywhere.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login?ref=menu" style={{ padding: '14px 28px', borderRadius: '10px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: '700', fontSize: '16px', textDecoration: 'none', display: 'inline-block' }}>
              Create Your Online Menu
            </Link>
            <Link href="/products/menu" style={{ padding: '14px 28px', borderRadius: '10px', background: 'white', color: '#111827', fontWeight: '700', fontSize: '16px', textDecoration: 'none', border: '1px solid #e5e7eb', display: 'inline-block' }}>
              All Menu Features
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
            Everything You Need for an Online Menu
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
            {features.map((f, i) => (
              <div key={i} style={{ padding: '28px', borderRadius: '16px', border: '1px solid #e5e7eb', backgroundColor: '#fafafa', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ color: '#ef4444', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
            Why Your Restaurant Needs an Online Menu
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '16px' }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '10px', backgroundColor: '#fff', border: '1px solid #e5e7eb' }}>
                <FaCheckCircle size={18} color="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span style={{ fontSize: '15px', color: '#374151', lineHeight: '1.5' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
            Go Online in 3 Simple Steps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { step: '1', title: 'Add Your Menu', desc: 'Add items with names, prices, descriptions, and photos. Organize into categories like Starters, Mains, Desserts.' },
              { step: '2', title: 'Pick a Theme', desc: 'Choose from 6 beautiful menu themes. Customize colors and header images to match your restaurant brand.' },
              { step: '3', title: 'Share the Link', desc: 'Copy your unique menu URL and share it on Google, social media, WhatsApp, or embed it on your website.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', margin: '0 auto 16px' }}>{s.step}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '40px' }}>
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <div key={i} style={{ marginBottom: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#fff', overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                <FaChevronDown size={14} color="#6b7280" style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }} />
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', fontSize: '15px', color: '#4b5563', lineHeight: '1.7' }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related Pages */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 40px', backgroundColor: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Explore More DineOpen Menu Features</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { name: 'QR Menu', href: '/products/menu/qr-menu' },
              { name: 'Digital Menu Builder', href: '/products/menu/digital-menu' },
              { name: 'Menu Management', href: '/products/menu/management' },
              { name: 'Menu Themes', href: '/products/menu/themes' },
              { name: 'DineOpen Orders', href: '/products/orders' },
              { name: 'DineOpen POS', href: '/products/pos' },
            ].map((link, i) => (
              <Link key={i} href={link.href} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: '800', color: '#fff', marginBottom: '16px' }}>
            Put Your Menu Online Today
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '28px', lineHeight: '1.6' }}>
            Start your 7-day free trial. Create a beautiful online menu in minutes.
          </p>
          <Link href="/login?ref=menu" style={{ padding: '16px 36px', borderRadius: '10px', backgroundColor: '#fff', color: '#ef4444', fontWeight: '700', fontSize: '16px', textDecoration: 'none', display: 'inline-block' }}>
            Start Free Trial
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
