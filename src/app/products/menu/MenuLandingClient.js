'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaQrcode, FaPalette, FaUtensils, FaMobileAlt, FaGlobe, FaCheck, FaArrowRight, FaStar, FaChevronDown, FaChevronUp, FaLeaf, FaSync, FaShareAlt, FaSearch, FaImages, FaExternalLinkAlt } from 'react-icons/fa';

export default function MenuLandingClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const faqs = [
    { q: 'How do I create a digital menu for my restaurant?', a: 'Sign up for DineOpen (it&apos;s free!), add your menu items with prices and images, choose from 6 beautiful themes, and generate a QR code. Your digital menu is live in minutes. You can also bulk upload items from a spreadsheet.' },
    { q: 'How does a QR code menu work?', a: 'Customers scan the QR code with their phone camera. Your digital menu opens instantly in their browser — no app download needed. They can browse categories, see images, check veg/non-veg indicators, and view prices.' },
    { q: 'Is DineOpen Menu really free?', a: 'Yes! DineOpen Menu is completely free to use. Create your digital menu, generate QR codes, share online — all at no cost. No hidden fees, no transaction charges.' },
    { q: 'What menu themes are available?', a: 'DineOpen offers 6 professionally designed themes: Default (clean and modern), Classic (elegant), Bistro (warm cafe style), Cube (grid-based visual), Book (page-turning), and Carousel (swipeable cards). All fully responsive.' },
    { q: 'Can I add veg and non-veg indicators?', a: 'Yes! Built-in veg/non-veg indicators with green and red dots. Essential for Indian restaurants and helpful for all customers to quickly identify suitable dishes.' },
    { q: 'Do I need to print new QR codes when I update my menu?', a: 'No. Your QR code stays the same forever. Update prices, add items, or change availability — customers always see the latest version without reprinting.' },
    { q: 'Can customers order from the digital menu?', a: 'Yes! Connect your menu to DineOpen Orders and customers can browse, add to cart, and place orders directly. Orders appear in your POS in real-time.' },
    { q: 'How is DineOpen different from Menubly?', a: 'DineOpen offers 6 unique themes with 3D previews, built-in POS integration, veg/non-veg indicators, bulk upload, and short codes. Plus it includes billing, inventory, loyalty programs, and AI features — all free.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>

        {/* Hero Section - Menubly-inspired split layout */}
        <section style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fff5f5 30%, #ffffff 100%)',
          padding: isMobile ? '40px 20px 60px' : '80px 40px 100px',
          overflow: 'hidden',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: isMobile ? 'block' : 'flex', alignItems: 'center', gap: '60px' }}>
            {/* Left: Text */}
            <div style={{ flex: 1, marginBottom: isMobile ? '40px' : 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#dcfce7', color: '#16a34a', padding: '8px 16px', borderRadius: '24px', fontSize: '14px', fontWeight: '700', marginBottom: '24px' }}>
                100% Free — No Credit Card Required
              </div>
              <h1 style={{ fontSize: isMobile ? '36px' : '56px', fontWeight: '900', color: '#111827', lineHeight: 1.08, marginBottom: '24px', letterSpacing: '-2px' }}>
                Showcase Your Restaurant Online &amp;{' '}
                <span style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Get More Customers
                </span>
              </h1>
              <p style={{ fontSize: isMobile ? '17px' : '20px', color: '#4b5563', lineHeight: 1.7, marginBottom: '32px', maxWidth: '520px' }}>
                Create a stunning digital menu with QR codes in minutes. Customers scan, browse, and order — no app needed. Always up-to-date, always beautiful.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <Link href="/login?ref=menu" style={{ padding: '16px 32px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontWeight: '700', fontSize: '17px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}>
                  Create Your Free Menu <FaArrowRight size={14} />
                </Link>
                <Link href="/products/menu/qr-menu" style={{ padding: '16px 28px', borderRadius: '12px', background: 'white', color: '#111827', fontWeight: '700', fontSize: '17px', textDecoration: 'none', border: '2px solid #e5e7eb' }}>
                  See QR Menu Demo
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  { value: '1,000+', label: 'Restaurants' },
                  { value: '6', label: 'Themes' },
                  { value: '0%', label: 'Fees' },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444', margin: 0 }}>{s.value}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Live Phone Mockup */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {/* iPhone Frame */}
              <div style={{
                width: isMobile ? '280px' : '320px',
                height: isMobile ? '560px' : '640px',
                borderRadius: '40px',
                border: '10px solid #1f2937',
                backgroundColor: '#1f2937',
                boxShadow: '0 30px 60px rgba(0,0,0,0.2), 0 0 0 2px #374151, inset 0 0 0 2px #374151',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {/* Live iframe */}
                <iframe
                  src="https://www.dineopen.com/placeorder?restaurant=LUETVd1eMwu4Bm7PvP9K"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '30px',
                    backgroundColor: '#ffffff',
                  }}
                  title="DineOpen Live Menu Preview"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                />
              </div>

              {/* Open in New Tab link */}
              <a
                href="https://www.dineopen.com/placeorder?restaurant=LUETVd1eMwu4Bm7PvP9K"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '14px', fontWeight: '600', color: '#ef4444', textDecoration: 'none' }}
              >
                <FaExternalLinkAlt size={12} /> Open Live Menu in New Tab
              </a>

              {/* Floating QR Badge with real QR code */}
              <div style={{
                position: 'absolute',
                bottom: isMobile ? '60px' : '80px',
                left: isMobile ? '-10px' : '-30px',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                textAlign: 'center',
              }}>
                <img
                  src="/qr-menu-demo.png"
                  alt="Scan QR code to preview live menu"
                  style={{ width: '80px', height: '80px', borderRadius: '8px', display: 'block', margin: '0 auto 6px' }}
                />
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#111827', margin: 0 }}>Scan to Preview</p>
              </div>

              {/* Floating "Live" Badge */}
              <div style={{
                position: 'absolute',
                top: isMobile ? '20px' : '40px',
                right: isMobile ? '-10px' : '-20px',
                backgroundColor: '#dcfce7',
                borderRadius: '12px',
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>Live Menu</span>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section style={{ backgroundColor: '#111827', padding: '20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '16px' : '40px', flexWrap: 'wrap' }}>
            {[
              'Trusted by 1,000+ restaurants worldwide',
              'Zero transaction fees',
              '6 beautiful themes',
              'Free forever',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaCheck size={12} color="#22c55e" />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Two Big Feature Cards: QR Menu + Online Menu */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: isMobile ? '30px' : '44px', fontWeight: '900', color: '#111827', lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-1px' }}>
                Two Powerful Ways to Share Your Menu
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
                Whether customers are sitting at your table or browsing from home — DineOpen has you covered.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {/* QR Menu Card */}
              <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e5e7eb', transition: 'all 0.3s' }}>
                <div style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)', padding: '40px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaQrcode size={24} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>QR Code Menu</h3>
                      <p style={{ fontSize: '14px', color: '#ef4444', fontWeight: '600', margin: 0 }}>For dine-in customers</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: 1.7, marginBottom: '24px' }}>
                    Place QR codes on every table. Customers scan with their phone and instantly see your full menu — no app download, no waiting for a waiter. Update prices and items in real-time.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                    {['Instant scan-to-browse experience', 'Works on any smartphone camera', 'Never reprint when you update', 'Print on table tents, receipts, cards'].map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', fontSize: '15px', color: '#374151' }}>
                        <FaCheck size={12} color="#22c55e" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/products/menu/qr-menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '700', fontSize: '15px', textDecoration: 'none' }}>
                    Learn about QR Menus <FaArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Online Menu Card */}
              <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #e5e7eb', transition: 'all 0.3s' }}>
                <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #fff 100%)', padding: '40px 32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaGlobe size={24} color="white" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>Online Menu</h3>
                      <p style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '600', margin: 0 }}>For online discovery</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: 1.7, marginBottom: '24px' }}>
                    Get a beautiful menu website with a unique URL. Share on Google My Business, Instagram, WhatsApp, Facebook — anywhere. SEO-optimized so customers find you on Google.
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                    {['Unique shareable menu URL', 'SEO-optimized for Google', 'Works on Google My Business', 'Share on all social platforms'].map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', fontSize: '15px', color: '#374151' }}>
                        <FaCheck size={12} color="#22c55e" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Link href="/products/menu/online-menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: '700', fontSize: '15px', textDecoration: 'none' }}>
                    Learn about Online Menus <FaArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works - Visual Steps */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: isMobile ? '30px' : '42px', fontWeight: '900', color: '#111827', marginBottom: '16px', letterSpacing: '-1px' }}>
                Go Live in 3 Minutes
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280' }}>No tech skills needed. Seriously.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '32px' }}>
              {[
                { step: '01', title: 'Add Your Menu', desc: 'Type in your items with names, prices, and photos. Or bulk upload from a spreadsheet. Organize into categories like Starters, Mains, Desserts.', icon: <FaUtensils size={24} />, color: '#ef4444' },
                { step: '02', title: 'Pick a Theme', desc: 'Choose from 6 stunning themes — Default, Classic, Bistro, Cube, Book, or Carousel. Preview in 3D on phone, tablet, and desktop.', icon: <FaPalette size={24} />, color: '#8b5cf6' },
                { step: '03', title: 'Share Everywhere', desc: 'Get your QR code and menu link instantly. Print QR codes for tables, share the link on social media, add to Google My Business.', icon: <FaShareAlt size={24} />, color: '#3b82f6' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '40px 24px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800' }}>{item.step}</div>
                  <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, margin: '8px auto 20px' }}>
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '12px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Theme Showcase - Visual Grid */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: isMobile ? '30px' : '42px', fontWeight: '900', color: '#111827', marginBottom: '16px', letterSpacing: '-1px' }}>
                6 Themes. Infinite Possibilities.
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
                Every theme is responsive, fast, and designed to make your food look irresistible.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
              {[
                { name: 'Default', vibe: 'Clean & Modern', desc: 'Simple grid layout. Perfect for any restaurant.', gradient: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' },
                { name: 'Classic', vibe: 'Elegant & Refined', desc: 'Sophisticated typography for fine dining.', gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
                { name: 'Bistro', vibe: 'Warm & Cozy', desc: 'Earthy tones that feel like home.', gradient: 'linear-gradient(135deg, #fed7aa, #fdba74)' },
                { name: 'Cube', vibe: 'Visual & Bold', desc: 'Grid cards that highlight food photos.', gradient: 'linear-gradient(135deg, #c7d2fe, #a5b4fc)' },
                { name: 'Book', vibe: 'Interactive Pages', desc: 'Swipe through like a real menu book.', gradient: 'linear-gradient(135deg, #bbf7d0, #86efac)' },
                { name: 'Carousel', vibe: 'Swipe & Discover', desc: 'One item at a time. Mobile-first.', gradient: 'linear-gradient(135deg, #fecdd3, #fda4af)' },
              ].map((theme, i) => (
                <div key={i} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ height: '120px', background: theme.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px', padding: '8px 16px' }}>
                      <FaPalette size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>{theme.vibe}</span>
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{theme.name}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{theme.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <Link href="/products/menu/themes" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: '700', fontSize: '16px', textDecoration: 'none' }}>
                Explore all themes in detail <FaArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights - Alternating Layout */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 style={{ fontSize: isMobile ? '30px' : '42px', fontWeight: '900', color: '#111827', marginBottom: '16px', letterSpacing: '-1px' }}>
                Built for Restaurant Owners
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280' }}>Every feature designed to save you time and delight your customers.</p>
            </div>

            {[
              {
                title: 'Real-Time Sync with Your POS',
                desc: 'Change a price in your POS and it updates on your digital menu instantly. Mark an item unavailable and it disappears from the menu. No double data entry, no outdated information.',
                icon: <FaSync size={28} />,
                color: '#ef4444',
                features: ['Instant price updates', 'Availability toggle', 'One source of truth'],
              },
              {
                title: 'Veg/Non-Veg Indicators & Food Photos',
                desc: 'Built-in vegetarian and non-vegetarian markers with green and red dots. Upload multiple high-quality food photos per item with a built-in carousel. Beautiful food photography increases orders by up to 30%.',
                icon: <FaLeaf size={28} />,
                color: '#22c55e',
                features: ['Green/red dot indicators', 'Multi-image carousel', 'HD food photography'],
              },
              {
                title: 'Mobile-First. Works Everywhere.',
                desc: 'Your menu looks stunning on phones, tablets, and desktops. 85% of your customers will browse on their phone — our responsive design ensures a perfect experience on every screen size.',
                icon: <FaMobileAlt size={28} />,
                color: '#3b82f6',
                features: ['Responsive on all devices', '3D interactive preview', 'Lightning-fast loading'],
              },
              {
                title: 'SEO-Optimized for Google Discovery',
                desc: 'Your online menu is fully indexable by Google. Customers searching for your restaurant find your menu directly in search results. Add your menu URL to Google My Business for maximum visibility.',
                icon: <FaSearch size={28} />,
                color: '#8b5cf6',
                features: ['Google-indexable pages', 'Google My Business ready', 'Social media preview cards'],
              },
            ].map((feature, i) => (
              <div key={i} style={{
                display: isMobile ? 'block' : 'flex',
                flexDirection: i % 2 === 1 ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: '60px',
                marginBottom: '80px',
              }}>
                <div style={{ flex: 1, marginBottom: isMobile ? '24px' : 0 }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: `${feature.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, marginBottom: '20px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', marginBottom: '12px', lineHeight: 1.2 }}>{feature.title}</h3>
                  <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: 1.7, marginBottom: '20px' }}>{feature.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {feature.features.map((f, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaCheck size={12} color={feature.color} />
                        <span style={{ fontSize: '15px', color: '#374151', fontWeight: '500' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: '100%',
                    maxWidth: '400px',
                    height: '280px',
                    borderRadius: '20px',
                    background: `linear-gradient(135deg, ${feature.color}08, ${feature.color}15)`,
                    border: `1px solid ${feature.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ color: feature.color, marginBottom: '12px' }}>{feature.icon}</div>
                      <p style={{ fontSize: '16px', fontWeight: '700', color: feature.color }}>{feature.title.split('.')[0]}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: '900', color: '#111827', marginBottom: '16px', letterSpacing: '-1px' }}>
                DineOpen vs Others
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280' }}>See why restaurant owners choose DineOpen Menu</p>
            </div>

            <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', backgroundColor: '#111827', color: 'white', padding: '16px 24px', fontWeight: '700', fontSize: '14px' }}>
                <div>Feature</div>
                <div style={{ textAlign: 'center' }}>DineOpen</div>
                <div style={{ textAlign: 'center' }}>Menubly / Others</div>
              </div>
              {[
                { feature: 'Menu Themes', dineopen: '6 themes', others: '1-3 themes' },
                { feature: '3D Preview', dineopen: true, others: false },
                { feature: 'Veg/Non-Veg Indicators', dineopen: true, others: false },
                { feature: 'Bulk Upload', dineopen: true, others: 'Limited' },
                { feature: 'Built-in POS', dineopen: true, others: false },
                { feature: 'Online Ordering', dineopen: true, others: 'Paid add-on' },
                { feature: 'Transaction Fees', dineopen: '0%', others: '2-5%' },
                { feature: 'Price', dineopen: 'Free', others: '$29+/mo' },
              ].map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '14px 24px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                  <div style={{ color: '#374151', fontWeight: '500' }}>{row.feature}</div>
                  <div style={{ textAlign: 'center', color: '#10b981', fontWeight: '600' }}>
                    {row.dineopen === true ? <FaCheck /> : row.dineopen}
                  </div>
                  <div style={{ textAlign: 'center', color: row.others === false ? '#ef4444' : '#6b7280' }}>
                    {row.others === false ? '---' : row.others}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '38px', fontWeight: '900', color: '#111827', textAlign: 'center', marginBottom: '48px', letterSpacing: '-1px' }}>
              Frequently Asked Questions
            </h2>

            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '14px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                    {openFaq === idx ? <FaChevronUp style={{ color: '#6b7280', flexShrink: 0 }} /> : <FaChevronDown style={{ color: '#6b7280', flexShrink: 0 }} />}
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: '0 24px 20px' }}>
                      <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Explore More */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Explore DineOpen Menu Features
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', textAlign: 'center', marginBottom: '32px' }}>
              Dive deeper into what makes DineOpen Menu the best choice for your restaurant.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { name: 'QR Menu', href: '/products/menu/qr-menu' },
                { name: 'Online Menu', href: '/products/menu/online-menu' },
                { name: 'Digital Menu Builder', href: '/products/menu/digital-menu' },
                { name: 'Menu Management', href: '/products/menu/management' },
                { name: 'Menu Themes', href: '/products/menu/themes' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
                  {link.name}
                </Link>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '16px' }}>
              {[
                { name: 'DineOpen POS', href: '/products/pos' },
                { name: 'DineOpen Orders', href: '/products/orders' },
                { name: 'DineOpen Loyalty', href: '/products/loyalty' },
                { name: 'DineOpen Kitchen', href: '/products/kitchen' },
              ].map((link, i) => (
                <Link key={i} href={link.href} style={{ padding: '8px 16px', borderRadius: '8px', color: '#6b7280', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: isMobile ? '60px 20px' : '100px 40px', background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', padding: '8px 16px', borderRadius: '24px', fontSize: '14px', fontWeight: '700', marginBottom: '24px' }}>
              Free Forever — No Catch
            </div>
            <h2 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: '900', marginBottom: '16px', lineHeight: 1.1, letterSpacing: '-1px' }}>
              Your Menu Deserves to Be Online
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.8, marginBottom: '36px', lineHeight: 1.6 }}>
              Join 1,000+ restaurants using DineOpen Menu. Create your free digital menu with QR codes, 6 beautiful themes, and real-time sync — in under 3 minutes.
            </p>
            <Link href="/login?ref=menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '18px 40px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)' }}>
              Create Your Free Menu <FaArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
