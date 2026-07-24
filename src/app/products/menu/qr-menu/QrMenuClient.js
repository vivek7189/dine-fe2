'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaQrcode, FaMobileAlt, FaSync, FaPrint, FaWifi, FaChartBar, FaCheck, FaArrowRight, FaChevronDown, FaChevronUp, FaCamera, FaUtensils, FaShoppingCart, FaGlobe, FaTabletAlt, FaDesktop, FaMoneyBillWave, FaLeaf, FaExternalLinkAlt } from 'react-icons/fa';

export default function QrMenuClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const howItWorks = [
    { icon: <FaCamera size={28} />, title: 'Customer Scans QR Code', desc: 'Place QR codes on tables, at the entrance, or on receipts. Customers scan with their phone camera - no app needed. The menu opens instantly in their browser.' },
    { icon: <FaUtensils size={28} />, title: 'Browse Full Menu', desc: 'Customers see your complete menu with categories, images, prices, veg/non-veg indicators, and descriptions. They can search, filter by category, and mark favorites.' },
    { icon: <FaShoppingCart size={28} />, title: 'Place Order', desc: 'Customers can place orders directly from the QR menu. Orders flow straight to your kitchen display or POS system. No waiting for the waiter to take the order.' },
  ];

  const benefits = [
    { icon: <FaWifi size={24} />, title: 'Contactless Experience', desc: 'Customers view your menu on their own phone. No shared physical menus. Hygienic, modern, and expected by today\'s diners. Especially important post-pandemic.', color: '#3b82f6' },
    { icon: <FaSync size={24} />, title: 'Always Up-to-Date', desc: 'Change prices, add new items, mark items as unavailable - all changes reflect instantly. No more crossing out items with a pen or reprinting menus every week.', color: '#10b981' },
    { icon: <FaMoneyBillWave size={24} />, title: 'Zero Printing Costs', desc: 'Eliminate recurring menu printing expenses. A single restaurant spends $200-500/year on menu printing. With QR menus, that cost drops to zero permanently.', color: '#f59e0b' },
    { icon: <FaChartBar size={24} />, title: 'Analytics & Insights', desc: 'Track how many customers view your menu, which items get the most views, and peak scanning times. Use data to optimize your menu layout and pricing strategy.', color: '#8b5cf6' },
    { icon: <FaGlobe size={24} />, title: 'Share Anywhere', desc: 'Your QR menu link works everywhere - WhatsApp, Instagram, Facebook, Google Business Profile, your website. One link for dine-in, takeaway, and online presence.', color: '#ec4899' },
    { icon: <FaLeaf size={24} />, title: 'Eco-Friendly', desc: 'Reduce paper waste from printed menus. Going digital is better for the environment and shows customers you care about sustainability. A small step with big impact.', color: '#22c55e' },
  ];

  const deviceSupport = [
    { icon: <FaMobileAlt size={32} />, name: 'Mobile', desc: 'Optimized for smartphones. Touch-friendly navigation, swipeable categories, and fast loading on mobile data.' },
    { icon: <FaTabletAlt size={32} />, name: 'Tablet', desc: 'Beautiful on iPad and Android tablets. Perfect for table-mounted devices or digital kiosks at the entrance.' },
    { icon: <FaDesktop size={32} />, name: 'Desktop', desc: 'Full-screen experience on laptops and desktops. Great for embedding on your website or sharing on social media.' },
  ];

  const generateSteps = [
    { step: '1', title: 'Create Your Account', desc: 'Sign up for DineOpen in 30 seconds. No credit card needed to start your free trial.' },
    { step: '2', title: 'Add Your Menu', desc: 'Add items with names, prices, categories, images, and descriptions. Use bulk upload for large menus.' },
    { step: '3', title: 'Choose Your Theme', desc: 'Pick from 6 beautiful menu themes. Preview how it looks on mobile, tablet, and desktop.' },
    { step: '4', title: 'Generate QR Code', desc: 'Click generate and your QR code is ready. Download it, print it, or share the link digitally.' },
    { step: '5', title: 'Display & Share', desc: 'Print QR codes on table tents, standees, window stickers, receipts, or business cards. Share the link on social media.' },
  ];

  const faqs = [
    { q: 'How do I create a QR code menu for my restaurant?', a: 'Sign up for DineOpen, add your menu items with prices and images, and click Generate QR Code. Your QR menu is ready to print and display within minutes. You can also bulk upload items from a spreadsheet.' },
    { q: 'Do customers need to download an app to view the QR menu?', a: 'No, absolutely not. Customers simply point their phone camera at the QR code, and the menu opens in their default browser. It works on every modern smartphone - iPhone, Android, and others. No app install, no sign-up required.' },
    { q: 'Do I need to reprint QR codes when I update my menu?', a: 'No. Your QR code URL stays the same permanently. When you add, remove, or modify menu items, prices, or availability, the changes appear instantly. The same printed QR code always shows your latest menu.' },
    { q: 'How much does a QR code menu cost?', a: 'QR menu generation is included in all DineOpen plans. The Starter Plan starts at $20/month (₹299/month in India) and includes unlimited QR codes, unlimited menu items, and zero transaction fees. No per-scan charges.' },
    { q: 'Can customers place orders through the QR menu?', a: 'Yes. Customers can browse your menu and place orders directly from their phone. Orders are sent to your POS system or kitchen display. This reduces wait times and order errors since customers enter their own selections.' },
    { q: 'Can I use the QR menu for takeaway and delivery too?', a: 'Absolutely. Share your menu link on WhatsApp, Instagram, Facebook, or your website. Customers can browse and order from anywhere. The same QR code and link work for dine-in, takeaway, and delivery.' },
    { q: 'Is the QR menu accessible on all devices?', a: 'Yes. DineOpen menus are fully responsive and tested on mobile phones, tablets, and desktop computers. You can preview exactly how your menu looks on each device type before publishing.' },
    { q: 'What if my restaurant has no internet?', a: 'The QR menu is hosted on DineOpen servers, so your restaurant does not need internet for customers to view it. Customers use their own mobile data to load the menu. However, you do need internet to manage and update menu items.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>

        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '100px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              <FaQrcode /> QR Code Menu Maker
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              QR Code Menus That<br />Customers Actually Love
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '20px', opacity: 0.95, marginBottom: '36px', maxWidth: '700px', margin: '0 auto 36px', lineHeight: 1.6 }}>
              Generate beautiful QR menus in minutes. Customers scan, browse, and order from their phone. No app needed. Always up-to-date. Zero printing costs.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?ref=menu" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                Create Your QR Menu <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>

        {/* Try It Now - Live QR Demo */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 40px', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '900', color: '#111827', marginBottom: '12px', letterSpacing: '-1px' }}>
                Try It Right Now
              </h2>
              <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
                Scan the QR code with your phone or tap to open — see a real restaurant menu powered by DineOpen.
              </p>
            </div>

            <div style={{ display: isMobile ? 'block' : 'flex', alignItems: 'center', justifyContent: 'center', gap: '60px' }}>
              {/* QR Code */}
              <div style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : 0 }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                  border: '1px solid #e5e7eb',
                  display: 'inline-block',
                }}>
                  <img
                    src="/qr-menu-demo.png"
                    alt="Scan this QR code to preview a live DineOpen restaurant menu"
                    style={{ width: isMobile ? '180px' : '220px', height: isMobile ? '180px' : '220px', borderRadius: '12px', display: 'block' }}
                  />
                </div>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginTop: '16px', marginBottom: '4px' }}>Scan with your phone camera</p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>No app needed — opens in browser</p>
                <a
                  href="https://www.dineopen.com/placeorder?restaurant=LUETVd1eMwu4Bm7PvP9K"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '14px', fontWeight: '600', color: '#ef4444', textDecoration: 'none' }}
                >
                  <FaExternalLinkAlt size={12} /> Or open the menu in a new tab
                </a>
              </div>

              {/* Arrow */}
              {!isMobile && (
                <div style={{ fontSize: '32px', color: '#d1d5db' }}>
                  <FaArrowRight />
                </div>
              )}

              {/* Live Phone Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: isMobile ? '260px' : '280px',
                  height: isMobile ? '500px' : '540px',
                  borderRadius: '36px',
                  border: '8px solid #1f2937',
                  backgroundColor: '#1f2937',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <iframe
                    src="https://www.dineopen.com/placeorder?restaurant=LUETVd1eMwu4Bm7PvP9K"
                    style={{ width: '100%', height: '100%', border: 'none', borderRadius: '28px', backgroundColor: '#fff' }}
                    title="Live QR Menu Preview"
                    loading="lazy"
                  />
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px', fontWeight: '600' }}>Live preview — this is a real menu</p>
              </div>
            </div>
          </div>
        </section>

        {/* How QR Menu Works */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              How a QR Code Menu Works
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              From scan to order in seconds
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '32px' }}>
              {howItWorks.map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: '32px 24px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '72px', height: '72px', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 20px' }}>
                    {item.icon}
                  </div>
                  <div style={{ display: 'inline-block', backgroundColor: '#ef4444', color: 'white', width: '28px', height: '28px', borderRadius: '50%', lineHeight: '28px', fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
                    {idx + 1}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{item.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Why Restaurants Switch to QR Menus
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '700px', margin: '0 auto 48px' }}>
              QR code menus are not just a trend - they are the new standard for modern restaurants
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {benefits.map((benefit, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: '#f9fafb', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: `${benefit.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: benefit.color, flexShrink: 0 }}>
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{benefit.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Multi-device Support */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Perfect on Every Device
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Your QR menu looks stunning on mobile, tablet, and desktop
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
              {deviceSupport.map((device, idx) => (
                <div key={idx} style={{ textAlign: 'center', padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ color: '#ef4444', marginBottom: '16px' }}>{device.icon}</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{device.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{device.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Generate */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How to Generate Your QR Menu
            </h2>

            <div style={{ display: 'grid', gap: '24px' }}>
              {generateSteps.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: '800', flexShrink: 0 }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>{item.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              QR Menu FAQs
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
              <Link href="/products/menu/digital-menu" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>Digital Menu Builder</Link>
              <Link href="/products/menu/management" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>Menu Management</Link>
              <Link href="/products/menu/themes" style={{ color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}>Menu Themes</Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: '700', marginBottom: '16px' }}>
              Create Your QR Menu in 5 Minutes
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Free trial. No printing costs. Always up-to-date. Start now.
            </p>
            <Link
              href="/login?ref=menu"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Get Started Free <FaArrowRight style={{ marginLeft: '8px' }} />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
