'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaPalette, FaCubes, FaMobileAlt, FaImage, FaSmile, FaSync, FaSearch, FaCheck, FaArrowRight, FaChevronDown, FaChevronUp, FaTabletAlt, FaDesktop, FaGlobe, FaStar, FaBookOpen, FaTh } from 'react-icons/fa';

export default function DigitalMenuClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTheme, setActiveTheme] = useState('default');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const themes = [
    { id: 'default', name: 'Default', icon: <FaTh size={20} />, tagline: 'Clean & Modern', desc: 'A clean, modern layout that works for any restaurant type. Features a simple grid layout with clear category headers and easy navigation. Items are displayed in a well-organized list with images, prices, and descriptions. This is the most popular theme and works great for restaurants with medium to large menus.', bestFor: 'All restaurant types, quick-service, casual dining', color: '#ef4444' },
    { id: 'classic', name: 'Classic', icon: <FaStar size={20} />, tagline: 'Elegant & Traditional', desc: 'Elegant, traditional design with refined typography and subtle borders. Inspired by classic restaurant menus with a sophisticated feel. Ideal for fine dining, upscale restaurants, and establishments that want to convey a premium experience. Timeless aesthetics that never go out of style.', bestFor: 'Fine dining, upscale restaurants, wine bars', color: '#8b5cf6' },
    { id: 'bistro', name: 'Bistro', icon: <FaPalette size={20} />, tagline: 'Warm & Inviting', desc: 'Warm, inviting design with earthy tones and friendly typography. Creates a cozy atmosphere that makes customers feel at home. Perfect for cafes, bistros, bakeries, and casual dining spots. The warm color palette evokes comfort food and relaxed dining.', bestFor: 'Cafes, bistros, bakeries, brunch spots', color: '#f59e0b' },
    { id: 'cube', name: 'Cube', icon: <FaCubes size={20} />, tagline: 'Visual & Grid-based', desc: 'A grid-based visual layout that puts food photography front and center. Each item gets its own visual card with a prominent image. Perfect for restaurants with great food photography. The grid layout makes it easy for customers to scan visually and find appealing dishes.', bestFor: 'Instagram-friendly restaurants, dessert shops, food trucks', color: '#3b82f6' },
    { id: 'book', name: 'Book', icon: <FaBookOpen size={20} />, tagline: 'Interactive & Nostalgic', desc: 'A page-turning experience that mimics a physical menu book. Customers swipe through pages for a natural reading experience. Adds a touch of nostalgia while being fully digital. Each page can hold a category, creating a structured browsing experience like a real menu book.', bestFor: 'Family restaurants, traditional eateries, themed restaurants', color: '#10b981' },
    { id: 'carousel', name: 'Carousel', icon: <FaMobileAlt size={20} />, tagline: 'Swipeable & Modern', desc: 'A swipeable card layout that showcases one item at a time with full attention. Customers swipe through items like a deck of cards. Perfect for tasting menus, daily specials, and curated selections. Mobile-first design that feels native and intuitive on smartphones.', bestFor: 'Tasting menus, cocktail bars, small curated menus', color: '#ec4899' },
  ];

  const customizations = [
    { icon: <FaImage size={24} />, title: 'Header Image Customization', desc: 'Upload a custom header image for your menu. Showcase your restaurant interior, signature dish, or brand logo. The header sets the tone for the entire menu experience.', color: '#ef4444' },
    { icon: <FaSmile size={24} />, title: 'Category Emojis', desc: 'Add emojis to your menu categories for visual flair. Use a pizza emoji for Italian, a sushi emoji for Japanese, or a coffee emoji for beverages. Emojis help customers navigate faster and add personality.', color: '#f59e0b' },
    { icon: <FaCubes size={24} />, title: '3D Interactive Preview', desc: 'View your menu in an interactive 3D preview before publishing. Rotate, zoom, and explore how your menu looks from every angle. A unique feature you will not find in other menu builders.', color: '#8b5cf6' },
    { icon: <FaMobileAlt size={24} />, title: 'Device-Specific Previews', desc: 'Preview exactly how your menu appears on mobile phones, tablets, and desktop computers. Ensure a perfect experience across all screen sizes before going live.', color: '#3b82f6' },
    { icon: <FaSync size={24} />, title: 'Real-Time Updates', desc: 'Every change you make is reflected instantly on your live menu. Update prices, add new items, toggle availability - customers always see the latest version with no delay.', color: '#10b981' },
    { icon: <FaSearch size={24} />, title: 'Search & Filtering', desc: 'Built-in search lets customers find specific dishes instantly. Filter by category, veg/non-veg, or browse in grid and list view modes. Large menus become easy to navigate.', color: '#ec4899' },
  ];

  const seoPoints = [
    'Menu items indexed by search engines help customers find you when searching for specific dishes',
    'Structured data markup makes your menu eligible for rich results in Google',
    'Your menu URL can be shared on Google Business Profile, increasing visibility',
    'Category and item names contribute to your restaurant appearing in relevant food searches',
    'Mobile-optimized menus improve your site performance score, a key SEO ranking factor',
  ];

  const faqs = [
    { q: 'What is a digital menu builder?', a: 'A digital menu builder is software that lets you create and manage an online menu for your restaurant without any coding or design skills. Instead of printing paper menus, customers view a beautiful, interactive menu on their devices. DineOpen offers 6 professionally designed themes with 3D previews.' },
    { q: 'How many themes does DineOpen offer?', a: 'DineOpen offers 6 unique themes: Default (clean modern layout), Classic (elegant traditional), Bistro (warm cafe style), Cube (grid-based visual), Book (page-turning experience), and Carousel (swipeable cards). Each theme is fully responsive and looks great on all devices.' },
    { q: 'Can I preview my digital menu on different devices?', a: 'Yes. DineOpen includes device-specific previews for mobile, tablet, and desktop. You can see exactly how your menu appears on each screen size before publishing. The 3D interactive preview also lets you rotate and zoom your menu for a complete view.' },
    { q: 'Can I customize the look of my digital menu?', a: 'Absolutely. Beyond choosing a theme, you can customize header images, add emojis to categories, upload food photos for each item, set veg/non-veg indicators, and control which items are visible. Each theme adapts to your content while maintaining its design language.' },
    { q: 'Do I need design skills to build a digital menu?', a: 'Not at all. DineOpen is designed for restaurant owners, not designers. Just add your items, choose a theme, and your menu is ready. The themes handle all the design work - typography, spacing, colors, and responsive layouts.' },
    { q: 'Does a digital menu help my restaurant get found on Google?', a: 'Yes. Digital menus with proper structure help search engines understand what you serve. When people search for dishes you offer, your menu can appear in results. DineOpen menus include SEO-friendly structured data markup.' },
    { q: 'Can customers search within my digital menu?', a: 'Yes. DineOpen menus include built-in search and category filtering. Customers can search for a specific dish, filter by veg/non-veg, or switch between grid and list views. This is especially helpful for restaurants with large menus.' },
    { q: 'How often can I update my digital menu?', a: 'As often as you want. There are no limits on updates. Change prices, add seasonal items, mark dishes as unavailable, add new categories - all changes reflect instantly on your live menu.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '100px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              <FaPalette /> Digital Menu Builder
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Build Stunning Digital Menus<br />Your Customers Will Love
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '20px', opacity: 0.95, marginBottom: '36px', maxWidth: '700px', margin: '0 auto 36px', lineHeight: 1.6 }}>
              6 professionally designed themes, 3D interactive previews, custom headers, emoji categories, and real-time updates. No design skills required.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=menu" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Build Your Menu <FaArrowRight />
              </Link>
              <Link href="/products/menu/themes" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Preview Themes
              </Link>
            </div>
          </div>
        </section>

        {/* Theme Options */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              6 Beautiful Theme Options
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              Each theme is carefully designed to match a different restaurant style. Click to explore.
            </p>

            {/* Theme tabs */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: activeTheme === theme.id ? `2px solid ${theme.color}` : '2px solid #e5e7eb',
                    backgroundColor: activeTheme === theme.id ? `${theme.color}10` : 'white',
                    color: activeTheme === theme.id ? theme.color : '#6b7280',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {theme.icon} {theme.name}
                </button>
              ))}
            </div>

            {/* Active theme detail */}
            {themes.filter(t => t.id === activeTheme).map((theme) => (
              <div key={theme.id} style={{ backgroundColor: 'white', borderRadius: '16px', padding: isMobile ? '28px' : '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `2px solid ${theme.color}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: `${theme.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.color }}>
                    {theme.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>{theme.name} Theme</h3>
                    <p style={{ fontSize: '14px', color: theme.color, fontWeight: '600', margin: 0 }}>{theme.tagline}</p>
                  </div>
                </div>
                <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.7, marginBottom: '16px' }}>{theme.desc}</p>
                <div style={{ padding: '12px 16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '14px', color: '#6b7280' }}>
                  <strong style={{ color: '#374151' }}>Best for:</strong> {theme.bestFor}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Customization Options */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Powerful Customization Options
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              Make your digital menu uniquely yours with these customization features
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {customizations.map((item, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: '#f9fafb', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: `${item.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{item.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Device Previews */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Preview on Every Device Before Publishing
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
              See exactly how your menu appears on mobile, tablet, and desktop before going live
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {[
                { icon: <FaMobileAlt size={40} />, name: 'Mobile Preview', desc: 'Most customers will view your menu on a phone. See the exact mobile experience with touch-friendly navigation and optimized layouts.' },
                { icon: <FaTabletAlt size={40} />, name: 'Tablet Preview', desc: 'Perfect for table-mounted iPads or kiosk displays. Tablet view uses the extra space for richer layouts and larger images.' },
                { icon: <FaDesktop size={40} />, name: 'Desktop Preview', desc: 'See how your menu looks when embedded on your website or shared via social media. Full-width layouts with detailed views.' },
              ].map((device, idx) => (
                <div key={idx} style={{ padding: '36px 24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ color: '#ef4444', marginBottom: '20px' }}>{device.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{device.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{device.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO Benefits */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              SEO Benefits of a Digital Menu
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              A well-built digital menu helps customers find your restaurant online
            </p>

            <div style={{ padding: '32px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
              {seoPoints.map((point, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 0', borderBottom: idx < seoPoints.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                  <FaCheck style={{ color: '#10b981', marginTop: '3px', flexShrink: 0 }} />
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6, margin: 0 }}>{point}</p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px', padding: '20px', backgroundColor: '#fef2f2', borderRadius: '12px' }}>
              <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                <strong>Pro tip:</strong> Add your DineOpen menu link to your Google Business Profile. This helps your menu appear when customers search for your restaurant or similar cuisines in your area.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Digital Menu Builder FAQs
            </h2>

            <div style={{ display: 'grid', gap: '12px' }}>
              {faqs.map((faq, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>{faq.q}</span>
                    {openFaq === idx ? <FaChevronUp style={{ color: '#6b7280', flexShrink: 0, marginLeft: '16px' }} /> : <FaChevronDown style={{ color: '#6b7280', flexShrink: 0, marginLeft: '16px' }} />}
                  </button>
                  {openFaq === idx && (
                    <div style={{ padding: '0 24px 20px' }}>
                      <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <section style={{ backgroundColor: 'white', padding: '60px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '20px' }}>Explore More Menu Features</h3>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/products/menu" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>DineOpen Menu Overview</Link>
              <Link href="/products/menu/qr-menu" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>QR Menu Guide</Link>
              <Link href="/products/menu/management" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>Menu Management</Link>
              <Link href="/products/menu/themes" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>All 6 Themes</Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '16px' }}>
              Build Your Digital Menu Today
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              6 themes. 3D previews. Real-time updates. Start your free trial now.
            </p>
            <Link
              href="/login?ref=menu"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial <FaArrowRight style={{ marginLeft: '8px' }} />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
