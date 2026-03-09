'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaPercent, FaCalendarAlt, FaBullseye, FaChartBar, FaTag, FaClock, FaArrowRight, FaCheck, FaChevronDown, FaChevronUp, FaDatabase, FaGift, FaWhatsapp, FaMobile } from 'react-icons/fa';

export default function OffersClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const offerTypes = [
    { icon: <FaPercent size={22} />, title: 'Percentage Discounts', desc: 'Offer a percentage off the total bill or specific items. Great for attracting first-time customers and driving trial of new menu items.', example: '20% off on weekday lunches, 15% off for first-time app users', color: '#ef4444' },
    { icon: <FaTag size={22} />, title: 'Flat Amount Off', desc: 'Straightforward discounts that are easy for customers to understand. Works well with minimum order thresholds to protect margins.', example: 'Rs 100 off on orders above Rs 500, $5 off your next order', color: '#3b82f6' },
    { icon: <FaGift size={22} />, title: 'Free Item Offers', desc: 'Give away a specific item as a promotional incentive. Free items have a higher perceived value than equivalent discounts.', example: 'Free dessert with every main course, complimentary drink on your birthday', color: '#10b981' },
    { icon: <FaCalendarAlt size={22} />, title: 'Time-Based Deals', desc: 'Create offers that are valid only during specific hours, days, or seasons. Perfect for driving traffic during slow periods.', example: 'Happy hour 3-6 PM: 30% off appetizers. Tuesday special: buy one pizza, get one free', color: '#f59e0b' },
    { icon: <FaBullseye size={22} />, title: 'Targeted Offers', desc: 'Send exclusive offers to specific customer segments. Personalized promotions have 3x higher redemption rates than generic ones.', example: 'VIP-only preview dinner, win-back offer for customers inactive 30+ days', color: '#7c3aed' },
    { icon: <FaClock size={22} />, title: 'Limited-Time Promotions', desc: 'Create urgency with offers that expire. Countdown timers and scarcity drive faster decisions and higher conversion rates.', example: 'This weekend only: 25% off entire menu. Flash sale: next 50 orders get free delivery', color: '#ec4899' },
  ];

  const benefits = [
    { title: 'Fill Empty Tables on Slow Days', desc: 'Identify your slowest periods and create targeted promotions to drive traffic. A well-timed weekday lunch special can turn your quietest day into a busy one. DineOpen analytics show you exactly when you need the boost.' },
    { title: 'Launch New Menu Items Successfully', desc: 'When you add a new dish, promotional offers help customers try it. A "first order free" or deep discount on new items builds initial trial. Once customers taste it, they come back at full price.' },
    { title: 'Win Back Lapsed Customers', desc: 'DineOpen automatically identifies customers who haven\'t visited in 30, 60, or 90 days. Create win-back offers specifically for these segments and send them via WhatsApp. Recovering just 10% of lapsed customers can significantly impact revenue.' },
    { title: 'Compete Without Racing to the Bottom', desc: 'Smart promotions are targeted and time-limited, not permanent price cuts. You control who sees each offer, when it expires, and what the minimum order is. This protects your margins while still giving customers a reason to choose you.' },
  ];

  const faqs = [
    { q: 'What types of promotional offers can I create?', a: 'DineOpen supports percentage discounts (e.g., 20% off), flat amount off (e.g., Rs 100 off), buy-one-get-one, free item with purchase, combo deals, minimum order discounts, and first-order specials. Each offer can have conditions like minimum order value, valid days/times, and maximum redemptions.' },
    { q: 'Can I target offers to specific customer segments?', a: 'Yes. You can create offers for new customers, VIP members, lapsed visitors (haven\'t ordered in X days), customers who spent above/below a threshold, loyalty tier members, or even specific customer lists. Targeted offers have significantly higher redemption rates than blanket discounts.' },
    { q: 'Can I schedule offers to run automatically?', a: 'Absolutely. Set start and end dates, valid days of the week, and active hours for each offer. For example, you can schedule "Happy Hour: 30% off appetizers" to run Monday-Thursday from 3-6 PM, starting next week and ending next month. It all runs without daily management.' },
    { q: 'How do I know which promotions are working?', a: 'DineOpen tracks every offer\'s redemption count, total revenue generated, new customers acquired, and average order value. Compare promotional periods to normal periods to see the real impact. This data helps you double down on what works and stop what doesn\'t.' },
    { q: 'Can customers stack multiple offers?', a: 'You control this. You can allow or disallow offer stacking per promotion. For example, you might allow a birthday discount to stack with a loyalty reward but prevent two percentage discounts from being combined.' },
    { q: 'How are offers distributed to customers?', a: 'Offers can be distributed via WhatsApp campaigns, the Crave customer app, at the POS during checkout, or through QR menu banners. You can also create offer codes that customers enter manually. All distribution channels are built into DineOpen.' },
  ];

  const relatedPages = [
    { title: 'Customer CRM', desc: 'Segment your audience', link: '/products/loyalty/crm', icon: <FaDatabase size={18} /> },
    { title: 'Loyalty Rewards', desc: 'Points-based rewards', link: '/products/loyalty/rewards', icon: <FaGift size={18} /> },
    { title: 'WhatsApp Marketing', desc: 'Distribute your offers', link: '/products/loyalty/whatsapp', icon: <FaWhatsapp size={18} /> },
    { title: 'Customer App', desc: 'Offers in Crave app', link: '/products/loyalty/customer-app', icon: <FaMobile size={18} /> },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              <FaPercent /> Offers & Promotions
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '46px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Restaurant Promotional Offers That Drive Real Revenue
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '36px', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto 36px' }}>
              Create targeted discounts, schedule time-based deals, and track what works. Fill empty tables and boost orders without slashing prices permanently.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '16px 36px', backgroundColor: 'white', color: '#ef4444', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Start Creating Offers <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* Offer Types */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Types of Promotions You Can Run
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
              From simple discounts to sophisticated targeted campaigns
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '24px' }}>
              {offerTypes.map((type, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: `${type.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: type.color, flexShrink: 0 }}>
                      {type.icon}
                    </div>
                    <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#111827' }}>{type.title}</h3>
                  </div>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '14px' }}>{type.desc}</p>
                  <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '13px', color: '#374151' }}>
                    <strong>Examples:</strong> {type.example}
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
              Smart Promotions, Not Just Discounts
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Use data to make every promotion count
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              {benefits.map((benefit, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: '#f9fafb', borderRadius: '14px', display: 'flex', gap: '20px', alignItems: isMobile ? 'flex-start' : 'center' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#fee2e2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0, fontSize: '20px', fontWeight: '800' }}>
                    {idx + 1}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{benefit.title}</h3>
                    <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{benefit.desc}</p>
                  </div>
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
        <section style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', marginBottom: '16px' }}>
              Start Creating Promotions That Work
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              All offer management features included with DineOpen. Starting at $9.99/month with zero transaction fees.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '18px 40px', backgroundColor: 'white', color: '#ef4444', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Get Started Free <FaArrowRight />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
