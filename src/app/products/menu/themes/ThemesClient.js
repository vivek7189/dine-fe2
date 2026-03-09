'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaPalette, FaCubes, FaMobileAlt, FaTabletAlt, FaDesktop, FaStar, FaBookOpen, FaTh, FaCheck, FaArrowRight, FaChevronDown, FaChevronUp, FaEye, FaAdjust, FaCoffee, FaImages } from 'react-icons/fa';

export default function ThemesClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const themes = [
    {
      name: 'Default',
      icon: <FaTh size={32} />,
      tagline: 'Clean & Modern',
      color: '#ef4444',
      description: 'The Default theme is a clean, modern layout designed to work beautifully for any restaurant type. It features a simple grid with clear category headers, easy-to-read typography, and a logical flow that guides customers through your menu naturally.',
      features: ['Clean grid layout with category sections', 'Clear typography optimized for readability', 'Food images displayed prominently', 'Quick-scan pricing alignment', 'Veg/non-veg indicators clearly visible', 'Search bar at the top for large menus'],
      bestFor: 'All restaurant types - from quick-service to casual dining. This is the most versatile theme and the best choice if you are unsure which theme to pick.',
      layoutStyle: 'Vertical scroll with category sections. Items displayed in a card format with image, name, price, and description. Categories shown as tabs or section headers.',
    },
    {
      name: 'Classic',
      icon: <FaStar size={32} />,
      tagline: 'Elegant & Traditional',
      color: '#8b5cf6',
      description: 'The Classic theme brings the elegance of traditional fine dining menus to digital. Refined typography, subtle borders, and a sophisticated color palette create a premium feel that matches upscale restaurants and wine bars.',
      features: ['Serif typography for an upscale feel', 'Subtle border accents and dividers', 'Elegant color palette (cream and gold tones)', 'Wine list friendly layout', 'Course-based organization', 'Minimalist design with maximum sophistication'],
      bestFor: 'Fine dining restaurants, upscale eateries, wine bars, steakhouses, and any establishment that wants to convey premium quality and tradition.',
      layoutStyle: 'Centered text with elegant dividers between sections. Items listed with name, description, and price in a traditional menu format. Minimal image use for a refined look.',
    },
    {
      name: 'Bistro',
      icon: <FaCoffee size={32} />,
      tagline: 'Warm & Inviting',
      color: '#f59e0b',
      description: 'The Bistro theme creates a warm, inviting atmosphere with earthy tones and friendly typography. Inspired by neighborhood cafes and bistros, it makes customers feel at home and evokes comfort food, lazy brunches, and good conversations.',
      features: ['Warm earthy color palette', 'Friendly rounded typography', 'Cozy visual elements and textures', 'Category icons for quick navigation', 'Image-forward with rounded corners', 'Perfect for specials and seasonal menus'],
      bestFor: 'Cafes, bistros, bakeries, brunch spots, neighborhood restaurants, and any venue where warmth and comfort are part of the dining experience.',
      layoutStyle: 'Card-based layout with warm background tones. Items shown with rounded image thumbnails, friendly category labels, and soft shadow effects. Feels approachable and inviting.',
    },
    {
      name: 'Cube',
      icon: <FaCubes size={32} />,
      tagline: 'Visual & Grid-based',
      color: '#3b82f6',
      description: 'The Cube theme is a grid-based visual layout that puts food photography front and center. Each menu item gets its own visual card with a prominent image, making it perfect for restaurants where visual appeal drives ordering decisions.',
      features: ['Image-first grid layout', 'Large food photography display', 'Visual category filtering', 'Instagram-worthy presentation', 'Quick add-to-order buttons', 'Responsive grid adapts to screen size'],
      bestFor: 'Instagram-friendly restaurants, dessert shops, food trucks, sushi bars, and any restaurant with strong food photography that wants to let images sell the food.',
      layoutStyle: 'Grid of square or rectangular cards, each dominated by a food image. Item name and price overlay the image or appear below. Categories shown as filter pills at the top.',
    },
    {
      name: 'Book',
      icon: <FaBookOpen size={32} />,
      tagline: 'Interactive & Nostalgic',
      color: '#10b981',
      description: 'The Book theme delivers a page-turning experience that mimics a physical menu book. Customers swipe through pages like flipping through a real menu, creating a tactile, nostalgic experience that combines the best of physical and digital menus.',
      features: ['Page-turning animation effect', 'Each category gets its own page', 'Realistic book-like presentation', 'Table of contents navigation', 'Page number indicators', 'Swipe or tap to turn pages'],
      bestFor: 'Family restaurants, traditional eateries, themed restaurants, multi-course establishments, and any venue that values the traditional dining experience.',
      layoutStyle: 'Book-like interface with left and right pages. Swipe to turn pages. Each spread can hold one category or feature a special section. Navigation via table of contents or direct page jump.',
    },
    {
      name: 'Carousel',
      icon: <FaMobileAlt size={32} />,
      tagline: 'Swipeable & Modern',
      color: '#ec4899',
      description: 'The Carousel theme showcases one item at a time in a swipeable card layout. It gives each dish full attention and is perfect for curated selections, tasting menus, and daily specials. The mobile-first design feels native and intuitive on smartphones.',
      features: ['One item per screen for full attention', 'Swipeable card interface', 'Large hero images per item', 'Progress dots for navigation', 'Smooth transition animations', 'Mobile-native feel and gestures'],
      bestFor: 'Tasting menus, cocktail bars, curated selections, daily specials menus, small but premium menus, and any venue where each dish deserves individual spotlight.',
      layoutStyle: 'Full-screen cards that you swipe through horizontally. Each card shows one item with a large image, name, description, price, and add button. Navigation dots at the bottom show progress.',
    },
  ];

  const previewFeatures = [
    {
      icon: <FaCubes size={28} />,
      title: '3D Interactive Preview',
      desc: 'View your menu in a stunning 3D environment before publishing. Rotate the preview to see your menu from different angles. Zoom in on specific sections. This unique feature gives you complete confidence in how your menu looks before customers see it.',
      color: '#8b5cf6',
    },
    {
      icon: <FaMobileAlt size={28} />,
      title: 'Mobile Preview',
      desc: 'Over 80% of QR menu scans happen on mobile phones. The mobile preview shows exactly how your menu appears on an iPhone or Android device, including touch interactions, scroll behavior, and image loading.',
      color: '#ef4444',
    },
    {
      icon: <FaTabletAlt size={28} />,
      title: 'Tablet Preview',
      desc: 'If you use table-mounted iPads or self-service kiosks, the tablet preview shows how your menu takes advantage of the larger screen. Layouts adjust to use the extra space for richer visuals and more content per screen.',
      color: '#3b82f6',
    },
    {
      icon: <FaDesktop size={28} />,
      title: 'Desktop Preview',
      desc: 'When customers view your menu on a laptop or desktop (from your website or a shared link), the desktop preview shows the full-width experience. See how your menu fills a large screen with detailed layouts.',
      color: '#10b981',
    },
  ];

  const customizations = [
    'Upload a custom header image for your menu banner',
    'Choose a theme that matches your restaurant brand',
    'Add emojis to categories for visual flair',
    'Set veg/non-veg indicators for each item',
    'Upload multiple food photos per item',
    'Mark favorite and recommended items with a star',
    'Control which items are visible with availability toggles',
    'Switch themes anytime without losing content',
  ];

  const faqs = [
    { q: 'How many menu themes does DineOpen offer?', a: 'DineOpen offers 6 professionally designed themes: Default (clean modern), Classic (elegant traditional), Bistro (warm cafe), Cube (visual grid), Book (page-turning), and Carousel (swipeable cards). All 6 themes are included in every plan at no extra cost.' },
    { q: 'Can I switch between themes after choosing one?', a: 'Yes, you can switch themes at any time with a single click. Your menu content - items, prices, images, categories - stays exactly the same. Only the visual layout changes. Feel free to try different themes and see which one your customers respond to best.' },
    { q: 'What is the 3D preview feature?', a: 'The 3D preview lets you see your menu in an interactive three-dimensional view. You can rotate the preview to see your menu from different angles, zoom in on specific sections, and interact with the layout. It helps you make the perfect design choice before going live.' },
    { q: 'Are all themes mobile-responsive?', a: 'Yes, all 6 themes are fully responsive. They automatically adapt to look great on mobile phones, tablets, and desktop computers. You can preview each device size before publishing to ensure a perfect experience for all customers.' },
    { q: 'Which theme is best for my restaurant?', a: 'It depends on your style. Default works for all types. Classic suits fine dining. Bistro is great for cafes. Cube is ideal if you have great food photography. Book works for traditional restaurants. Carousel is perfect for small, curated menus. You can always switch and experiment.' },
    { q: 'Do themes cost extra?', a: 'No. All 6 themes are included in every DineOpen plan. The Spark Plan at $9.99/month (Rs 300/month India) and Blaze Plan at $89/month (Rs 2,500/month India) both include all themes, 3D preview, and device-specific previews.' },
    { q: 'Can I customize colors within a theme?', a: 'Each theme comes with a carefully designed color palette that works harmoniously. You can customize header images and add category emojis to personalize the look. The theme handles typography, spacing, and overall visual design automatically.' },
    { q: 'Will switching themes affect my QR code?', a: 'No. Your QR code stays exactly the same when you switch themes. Customers scanning the QR code will see the new theme immediately. No need to reprint or redistribute your QR codes.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '100px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              <FaPalette /> Menu Themes
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              6 Stunning Menu Themes<br />for Every Restaurant Style
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '20px', opacity: 0.95, marginBottom: '36px', maxWidth: '700px', margin: '0 auto 36px', lineHeight: 1.6 }}>
              From elegant fine dining to casual cafes, find the perfect look for your digital menu. All themes included in every plan. Preview in 3D before publishing.
            </p>
            <Link href="/login?ref=menu" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Try All Themes Free <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* All 6 Themes */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Explore All 6 Themes
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
              Each theme is professionally designed, fully responsive, and included at no extra cost
            </p>

            <div style={{ display: 'grid', gap: '32px' }}>
              {themes.map((theme, idx) => (
                <div key={idx} style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${theme.color}20` }}>
                  {/* Theme header */}
                  <div style={{ background: `linear-gradient(135deg, ${theme.color} 0%, ${theme.color}dd 100%)`, color: 'white', padding: isMobile ? '24px' : '32px 40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {theme.icon}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 4px' }}>{theme.name}</h3>
                      <p style={{ fontSize: '16px', opacity: 0.9, margin: 0 }}>{theme.tagline}</p>
                    </div>
                  </div>

                  {/* Theme content */}
                  <div style={{ padding: isMobile ? '24px' : '32px 40px' }}>
                    <p style={{ fontSize: '16px', color: '#374151', lineHeight: 1.7, marginBottom: '24px' }}>{theme.description}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '32px', marginBottom: '24px' }}>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Key Features</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {theme.features.map((feature, fIdx) => (
                            <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '14px', color: '#374151' }}>
                              <FaCheck style={{ color: theme.color, flexShrink: 0, fontSize: '12px' }} /> {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Best For</h4>
                        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: '0 0 20px' }}>{theme.bestFor}</p>

                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>Layout Style</h4>
                        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{theme.layoutStyle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Preview Features */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Preview Before You Publish
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
              See exactly how your menu looks on every device with 3D interactive previews
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {previewFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: '#f9fafb', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: `${feature.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, flexShrink: 0 }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Customization */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Customize Every Theme
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Make any theme uniquely yours with these customization options
            </p>

            <div style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              {customizations.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '14px 0', borderBottom: idx < customizations.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <FaCheck style={{ color: '#10b981', flexShrink: 0 }} />
                  <p style={{ fontSize: '15px', color: '#374151', margin: 0 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Theme comparison quick reference */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Quick Theme Comparison
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#111827', color: 'white' }}>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700' }}>Theme</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700' }}>Style</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700' }}>Layout</th>
                    <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '700' }}>Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { theme: 'Default', style: 'Clean & Modern', layout: 'Card grid', best: 'All restaurants' },
                    { theme: 'Classic', style: 'Elegant', layout: 'Centered text', best: 'Fine dining' },
                    { theme: 'Bistro', style: 'Warm & Cozy', layout: 'Rounded cards', best: 'Cafes & bistros' },
                    { theme: 'Cube', style: 'Visual & Bold', layout: 'Image grid', best: 'Photo-forward menus' },
                    { theme: 'Book', style: 'Interactive', layout: 'Page turning', best: 'Traditional venues' },
                    { theme: 'Carousel', style: 'Modern & Sleek', layout: 'Swipeable cards', best: 'Curated menus' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{row.theme}</td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>{row.style}</td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>{row.layout}</td>
                      <td style={{ padding: '14px 16px', fontSize: '14px', color: '#6b7280' }}>{row.best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Menu Themes FAQs
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
              <Link href="/products/menu/digital-menu" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>Digital Menu Builder</Link>
              <Link href="/products/menu/management" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>Menu Management</Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '16px' }}>
              Try All 6 Themes Free
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Switch themes anytime. 3D previews included. No credit card required.
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
