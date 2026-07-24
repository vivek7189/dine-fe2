'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaWhatsapp, FaBullhorn, FaBirthdayCake, FaRedo, FaClock, FaUsers, FaChartBar, FaArrowRight, FaCheck, FaChevronDown, FaChevronUp, FaDatabase, FaGift, FaMobile, FaPercent, FaEnvelope, FaBell, FaPaperPlane } from 'react-icons/fa';

export default function WhatsappClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const campaignTypes = [
    { icon: <FaBullhorn size={22} />, title: 'Promotional Campaigns', desc: 'Announce new offers, discounts, and special deals to your customer base. Include images of dishes, offer details, and a direct ordering link.', example: 'Weekend special: Flat 20% off on all pizzas! Order now on Crave.', color: '#ef4444' },
    { icon: <FaBirthdayCake size={22} />, title: 'Birthday & Anniversary', desc: 'Automatically send personalized birthday and anniversary wishes with a special discount. These messages have the highest redemption rates of any campaign type.', example: 'Happy Birthday, Priya! Enjoy 25% off your birthday meal this week.', color: '#ec4899' },
    { icon: <FaRedo size={22} />, title: 'Win-Back Campaigns', desc: 'Re-engage customers who haven\'t visited in 30, 60, or 90 days. Automated triggers detect lapsed customers and send a personalized message to bring them back.', example: 'We miss you! It\'s been 45 days. Here\'s Rs 150 off your next order.', color: '#f59e0b' },
    { icon: <FaBell size={22} />, title: 'Loyalty Notifications', desc: 'Notify customers when they earn points, reach a new tier, or have a reward ready to redeem. These reminders keep loyalty top of mind and drive visits.', example: 'You just earned 50 points! Only 30 more for a free dessert.', color: '#7c3aed' },
    { icon: <FaPaperPlane size={22} />, title: 'New Menu Announcements', desc: 'Let customers know about new dishes, seasonal menus, or chef specials. Include mouth-watering photos that make them want to visit right away.', example: 'New on our menu: Truffle Mushroom Risotto. Try it this weekend!', color: '#10b981' },
    { icon: <FaUsers size={22} />, title: 'Segmented Campaigns', desc: 'Send different messages to different customer groups. VIP customers get exclusive previews, new customers get welcome offers, and high-spenders get premium rewards.', example: 'Platinum members: Exclusive tasting event this Friday. RSVP now.', color: '#3b82f6' },
  ];

  const channelComparison = [
    { channel: 'WhatsApp', openRate: '95%', responseTime: 'Minutes', cost: 'Low', engagement: 'Very High', highlight: true },
    { channel: 'Email', openRate: '20%', responseTime: 'Hours/Days', cost: 'Low', engagement: 'Low', highlight: false },
    { channel: 'SMS', openRate: '45%', responseTime: 'Minutes', cost: 'Medium', engagement: 'Medium', highlight: false },
    { channel: 'Push Notification', openRate: '10%', responseTime: 'Varies', cost: 'Free', engagement: 'Low', highlight: false },
  ];

  const benefits = [
    { title: 'Highest Open Rates in Marketing', desc: '95% of WhatsApp messages are opened and read, most within 3 minutes of delivery. Compare that to 20% for email, and the choice is clear. When you send a lunch special at 11 AM, customers see it before they decide where to eat.' },
    { title: 'Rich Media Messages', desc: 'WhatsApp supports images, videos, buttons, and quick replies. Send a mouth-watering photo of your daily special with a "Order Now" button that takes customers straight to your Crave app. Visual messages get 3x more engagement than text-only.' },
    { title: 'Two-Way Communication', desc: 'Unlike email blasts, WhatsApp enables real conversations. Customers can reply to your campaigns with questions, reservation requests, or feedback. This personal touch makes customers feel valued and builds genuine relationships.' },
    { title: 'Automation Saves Hours', desc: 'Set up campaigns once and let them run automatically. Birthday messages, post-visit thank yous, loyalty point updates, and win-back messages all fire without any daily manual effort from you or your staff.' },
  ];

  const faqs = [
    { q: 'Why is WhatsApp better than email for restaurant marketing?', a: 'WhatsApp messages have a 95% open rate compared to 20% for email. Customers read WhatsApp messages within minutes, making it ideal for time-sensitive promotions like daily specials or flash sales. In India and many emerging markets, WhatsApp is the primary communication channel - far more people check WhatsApp than email.' },
    { q: 'What types of campaigns can I send?', a: 'You can send promotional offers (discounts, deals), new menu announcements, birthday and anniversary greetings with special offers, loyalty points updates, win-back messages for lapsed customers, event invitations, feedback requests, and order confirmations. Each message can include images, buttons, and quick reply options.' },
    { q: 'Are WhatsApp campaigns automated?', a: 'Yes. You can set up trigger-based campaigns that run automatically: birthday messages send on the customer\'s birthday, win-back messages send when a customer hasn\'t visited in X days, and loyalty notifications send when points are earned. You can also schedule one-time campaigns for specific dates.' },
    { q: 'Do I need a WhatsApp Business API account?', a: 'DineOpen handles the WhatsApp Business API integration for you. You connect your business phone number, and DineOpen manages the technical setup, message templates, and API communication. No technical knowledge required.' },
    { q: 'How much do WhatsApp campaigns cost?', a: 'WhatsApp campaign functionality is included in your DineOpen subscription. WhatsApp does charge per-message fees through their Business API (typically Rs 0.50-1.00 per message in India), but there are no additional DineOpen fees on top of that. The ROI is substantial - even a 5% redemption rate on a campaign typically pays for itself many times over.' },
    { q: 'Can I target specific customer segments?', a: 'Absolutely. DineOpen CRM lets you segment customers by visit frequency, spending amount, last visit date, loyalty tier, and more. You can send different messages to VIPs vs new customers vs lapsed visitors. Targeted messages have 3x higher redemption rates than generic blasts.' },
    { q: 'Will my customers feel spammed?', a: 'DineOpen includes opt-out management so customers can easily unsubscribe. We recommend sending no more than 2-4 messages per month to maintain high open rates. Quality over quantity - targeted, relevant messages are welcomed, not spammy.' },
  ];

  const relatedPages = [
    { title: 'Customer CRM', desc: 'Segment your audience', link: '/products/loyalty/crm', icon: <FaDatabase size={18} /> },
    { title: 'Loyalty Rewards', desc: 'Send points updates', link: '/products/loyalty/rewards', icon: <FaGift size={18} /> },
    { title: 'Offers & Promotions', desc: 'Create offers to share', link: '/products/loyalty/offers', icon: <FaPercent size={18} /> },
    { title: 'Customer App', desc: 'Drive app installs', link: '/products/loyalty/customer-app', icon: <FaMobile size={18} /> },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              <FaWhatsapp /> WhatsApp Marketing
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '46px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              WhatsApp Marketing for Restaurants That Actually Gets Read
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '36px', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto 36px' }}>
              95% open rate. Automated campaigns. Targeted segments. Reach your customers where they already spend their time - on WhatsApp.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '16px 36px', backgroundColor: 'white', color: '#128c7e', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Start WhatsApp Campaigns <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* Channel Comparison */}
        <section style={{ backgroundColor: 'white', padding: '40px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '28px' }}>
              Why WhatsApp Outperforms Every Other Channel
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <div style={{ minWidth: '500px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '12px 20px', backgroundColor: '#f9fafb', borderRadius: '8px 8px 0 0', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280' }}>Channel</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textAlign: 'center' }}>Open Rate</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textAlign: 'center' }}>Response Time</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textAlign: 'center' }}>Cost</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#6b7280', textAlign: 'center' }}>Engagement</span>
                </div>
                {channelComparison.map((row, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', padding: '14px 20px', backgroundColor: row.highlight ? '#f0fdf4' : 'white', borderBottom: '1px solid #f3f4f6', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: row.highlight ? '700' : '500', color: row.highlight ? '#128c7e' : '#374151', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {row.highlight && <FaWhatsapp />} {row.channel}
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: row.highlight ? '#128c7e' : '#374151', textAlign: 'center' }}>{row.openRate}</span>
                    <span style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>{row.responseTime}</span>
                    <span style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center' }}>{row.cost}</span>
                    <span style={{ fontSize: '13px', color: row.highlight ? '#128c7e' : '#6b7280', fontWeight: row.highlight ? '600' : '400', textAlign: 'center' }}>{row.engagement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Campaign Types */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Campaigns You Can Run on WhatsApp
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
              From one-time blasts to automated triggered messages
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {campaignTypes.map((type, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: `${type.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: type.color, flexShrink: 0 }}>
                      {type.icon}
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{type.title}</h3>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '14px' }}>{type.desc}</p>
                  <div style={{ padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '10px', borderLeft: '3px solid #25d366' }}>
                    <p style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic' }}>&quot;{type.example}&quot;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Why WhatsApp Works for Restaurants
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              The most personal and effective marketing channel available
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {benefits.map((benefit, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: '#f0fdf4', borderRadius: '14px', border: '1px solid #bbf7d0' }}>
                  <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>{benefit.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Frequently Asked Questions
            </h2>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ marginBottom: '12px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
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
        <section style={{ backgroundColor: 'white', padding: isMobile ? '40px 20px' : '60px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '32px' }}>
              Explore More DineOpen Loyalty Features
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '16px' }}>
              {relatedPages.map((page, idx) => (
                <Link href={page.link} key={idx} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
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
        <section style={{ background: 'linear-gradient(135deg, #25d366, #128c7e)', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', marginBottom: '16px' }}>
              Start Marketing on WhatsApp Today
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              WhatsApp campaign management included with every DineOpen plan. Starting at $20/month. Set up your first campaign in minutes.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '18px 40px', backgroundColor: 'white', color: '#128c7e', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Get Started Free <FaArrowRight />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
