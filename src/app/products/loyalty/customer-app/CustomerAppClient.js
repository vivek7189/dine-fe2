'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaMobile, FaUtensils, FaShoppingCart, FaStar, FaBell, FaMapMarkerAlt, FaArrowRight, FaCheck, FaChevronDown, FaChevronUp, FaDatabase, FaGift, FaWhatsapp, FaPercent, FaHeart, FaTimes } from 'react-icons/fa';

export default function CustomerAppClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const appFeatures = [
    { icon: <FaUtensils size={24} />, title: 'Digital Menu', desc: 'Customers browse your full menu with photos, descriptions, prices, and dietary tags. Menu updates sync instantly from your DineOpen dashboard - change a price or add a dish, and it appears in Crave immediately.', color: '#f59e0b' },
    { icon: <FaShoppingCart size={24} />, title: 'Direct Ordering', desc: 'Customers place orders for dine-in, takeaway, or delivery directly through Crave. Orders go straight to your kitchen display or POS with zero commission. No middleman, no 25-35% platform fees.', color: '#10b981' },
    { icon: <FaStar size={24} />, title: 'Loyalty Points Tracking', desc: 'Customers see their points balance, reward progress, and available rewards right in the app. This visibility motivates repeat visits - when customers can see they\'re 20 points away from a free meal, they come back.', color: '#7c3aed' },
    { icon: <FaPercent size={24} />, title: 'Offers & Promotions', desc: 'Push promotional offers directly to your customers through the app. Active offers appear on the home screen, and customers can apply them at checkout with a single tap.', color: '#ef4444' },
    { icon: <FaBell size={24} />, title: 'Push Notifications', desc: 'Send push notifications for new offers, order updates, and personalized messages. Unlike WhatsApp or SMS, push notifications are free and reach customers even when they\'re not actively using the app.', color: '#3b82f6' },
    { icon: <FaHeart size={24} />, title: 'Favorites & Reorder', desc: 'Customers can save their favorite items and reorder past meals with one tap. This reduces friction and makes repeat ordering effortless. The easier you make it to order, the more often customers will.', color: '#ec4899' },
  ];

  const whyCrave = [
    { title: 'Own Your Customer Relationship', desc: 'When customers order through Zomato or Swiggy, those platforms own the customer data and relationship. With Crave, you have direct access to every customer\'s contact info, order history, and preferences. They\'re your customers, not the platform\'s.' },
    { title: 'Zero Commission on Orders', desc: 'Third-party delivery platforms charge 25-35% commission on every order. On a Rs 500 order, you lose Rs 125-175. With Crave, that Rs 500 goes directly to your business. Over a year, this can save tens of thousands of dollars in platform fees.' },
    { title: 'Build Brand Recognition', desc: 'When customers open Crave, they see your brand, your menu, and your offers - not your competitors listed alongside you. This builds brand loyalty and keeps customers focused on your restaurant.' },
    { title: 'Integrated with Everything', desc: 'Crave is not a standalone app - it\'s deeply integrated with DineOpen POS, your loyalty program, offers system, and WhatsApp marketing. Customer data flows seamlessly between all channels, giving you a complete picture of each customer.' },
  ];

  const comparison = [
    { feature: 'Commission per order', crave: 'Zero', platforms: '25-35%' },
    { feature: 'Customer data ownership', crave: 'You own it all', platforms: 'Platform owns it' },
    { feature: 'Loyalty program built in', crave: 'Yes, integrated', platforms: 'No' },
    { feature: 'Push notifications', crave: 'Free, unlimited', platforms: 'Platform controls' },
    { feature: 'Menu control', crave: 'Instant updates', platforms: 'Approval delays' },
    { feature: 'Brand visibility', crave: 'Your brand only', platforms: 'Competitors listed' },
    { feature: 'Monthly cost', crave: 'Included with DineOpen', platforms: 'Commission-based' },
  ];

  const faqs = [
    { q: 'What is Crave?', a: 'Crave is a branded customer-facing app that comes with your DineOpen subscription. It gives your restaurant a direct channel to customers where they can browse your menu, place orders, track loyalty points, and receive offers. Think of it as your own restaurant app without the cost of building one from scratch.' },
    { q: 'Do my customers need to download a separate app?', a: 'Crave works both as a downloadable app and as a web app accessible via QR code. Customers can scan a QR code at your restaurant to access Crave instantly without downloading anything. For a better experience with push notifications, they can also install it from the app store.' },
    { q: 'Does Crave charge any commission on orders?', a: 'No. Zero commission, zero transaction fees. Every rupee or dollar a customer spends goes to your restaurant. This is fundamentally different from platforms like Zomato, Swiggy, or DoorDash which take 25-35% of every order.' },
    { q: 'Can I customize Crave with my restaurant branding?', a: 'Yes. Crave displays your restaurant name, logo, colors, and menu. Customers see your brand identity throughout the app, building recognition and loyalty to your restaurant specifically.' },
    { q: 'How does ordering through Crave work?', a: 'When a customer places an order through Crave, it appears instantly on your DineOpen POS or kitchen display system. Your staff processes it just like any other order. The customer receives real-time status updates in the app.' },
    { q: 'Can customers track their loyalty points in Crave?', a: 'Yes. Customers can see their current points balance, transaction history, available rewards, and how many points they need for the next reward. This visibility is one of the strongest drivers of repeat visits.' },
  ];

  const relatedPages = [
    { title: 'Customer CRM', desc: 'Manage customer data', link: '/products/loyalty/crm', icon: <FaDatabase size={18} /> },
    { title: 'Loyalty Rewards', desc: 'Points & rewards', link: '/products/loyalty/rewards', icon: <FaGift size={18} /> },
    { title: 'WhatsApp Marketing', desc: 'Campaign management', link: '/products/loyalty/whatsapp', icon: <FaWhatsapp size={18} /> },
    { title: 'Offers & Promotions', desc: 'Create deals', link: '/products/loyalty/offers', icon: <FaPercent size={18} /> },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              <FaMobile /> Crave Customer App
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '46px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Your Restaurant&apos;s Own Branded Customer App
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '36px', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto 36px' }}>
              Crave gives your customers a direct way to browse your menu, place orders, track loyalty points, and receive offers. Zero commission. Your brand. Your data.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '16px 36px', backgroundColor: 'white', color: '#d97706', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Get Crave for Your Restaurant <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* App Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              What Your Customers Get with Crave
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
              A complete customer experience that keeps them coming back
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {appFeatures.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', gap: '18px' }}>
                  <div style={{ width: '52px', height: '52px', backgroundColor: `${feature.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.color, flexShrink: 0 }}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Crave */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Why Your Restaurant Needs Its Own App
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Stop paying commissions. Start building direct customer relationships.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {whyCrave.map((item, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: '#fffbeb', borderRadius: '14px', border: '1px solid #fde68a' }}>
                  <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Crave vs Third-Party Platforms
            </h2>

            <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', backgroundColor: '#f9fafb', padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#6b7280' }}>Feature</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#7c3aed', textAlign: 'center' }}>Crave</span>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#6b7280', textAlign: 'center' }}>Zomato/Swiggy</span>
              </div>
              {comparison.map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '14px 24px', borderBottom: idx < comparison.length - 1 ? '1px solid #f3f4f6' : 'none', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>{row.feature}</span>
                  <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '600', textAlign: 'center' }}>{row.crave}</span>
                  <span style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>{row.platforms}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ marginBottom: '12px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
                  {openFaq === idx ? <FaChevronUp style={{ color: '#6b7280', flexShrink: 0 }} /> : <FaChevronDown style={{ color: '#6b7280', flexShrink: 0 }} />}
                </button>
                {openFaq === idx && (
                  <div style={{ padding: '0 24px 20px', fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Related Pages */}
        <section style={{ padding: isMobile ? '40px 20px' : '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              Explore More DineOpen Loyalty Features
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
              {relatedPages.map((page, idx) => (
                <Link href={page.link} key={idx} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: 'white', textAlign: 'center' }}>
                    <div style={{ color: '#7c3aed', marginBottom: '10px' }}>{page.icon}</div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{page.title}</h4>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{page.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', marginBottom: '16px' }}>
              Get Your Own Restaurant App Today
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Crave is included with every DineOpen plan. Zero commission, zero extra fees. Start building direct customer relationships.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '18px 40px', backgroundColor: 'white', color: '#d97706', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Get Started Free <FaArrowRight />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
