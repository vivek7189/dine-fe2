'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaGift, FaCoins, FaStar, FaPercent, FaCrown, FaArrowRight, FaCheck, FaChevronDown, FaChevronUp, FaDatabase, FaWhatsapp, FaMobile } from 'react-icons/fa';

export default function RewardsClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const rewardTypes = [
    { icon: <FaCoins size={28} />, title: 'Points Program', desc: 'Customers earn points on every order based on the amount they spend. Points accumulate and can be redeemed for discounts or free items on future visits.', example: 'Earn 1 point per Rs 10 spent. 100 points = Rs 50 off your next order.', color: '#f59e0b' },
    { icon: <FaStar size={28} />, title: 'Visit-Based Rewards', desc: 'Reward customers after a set number of visits. Simple and easy for customers to understand - no math or point tracking required.', example: 'Visit 10 times and get your 11th meal free. Every 5th coffee is on the house.', color: '#8b5cf6' },
    { icon: <FaPercent size={28} />, title: 'Cashback Rewards', desc: 'Give customers a percentage back on every order as store credit. The cashback sits in their account and can be applied on any future purchase.', example: '5% cashback on every order. Spend Rs 2,000, get Rs 100 back automatically.', color: '#10b981' },
    { icon: <FaCrown size={28} />, title: 'Tiered Membership', desc: 'Create VIP tiers with increasing benefits. Customers are motivated to spend more to reach the next tier and unlock better rewards.', example: 'Silver (0-5K): 3% back. Gold (5K-15K): 5% back + birthday gift. Platinum (15K+): 8% back + priority seating.', color: '#ef4444' },
  ];

  const howItDrives = [
    { title: 'Increases Visit Frequency', desc: 'When customers know they are accumulating points toward a reward, they choose your restaurant over competitors. Studies show loyalty members visit 35% more often than non-members.' },
    { title: 'Raises Average Order Value', desc: 'Customers spend more per visit when they know they are earning rewards. "I\'m only 20 points away from a free dessert" naturally encourages adding that extra item to the order.' },
    { title: 'Reduces Customer Churn', desc: 'Unredeemed points create a psychological switching cost. Customers with accumulated rewards are far less likely to try a competitor because they don\'t want to lose their progress.' },
    { title: 'Creates Word-of-Mouth', desc: 'Customers who get rewarded feel valued and tell others. A well-designed loyalty program becomes its own marketing engine, bringing in new customers through genuine recommendations.' },
  ];

  const steps = [
    { num: '1', title: 'Define Your Rules', desc: 'Set your earning rate (points per dollar), reward thresholds, and what customers can redeem. You control everything.' },
    { num: '2', title: 'Customers Earn Automatically', desc: 'Points are calculated and assigned every time a customer orders through POS, QR menu, or Crave app. Zero manual work.' },
    { num: '3', title: 'Instant Notifications', desc: 'Customers receive WhatsApp or SMS messages showing their points earned and how close they are to the next reward.' },
    { num: '4', title: 'Easy Redemption', desc: 'At their next visit, customers redeem points using just their phone number. The discount applies automatically to their bill.' },
  ];

  const faqs = [
    { q: 'How do customers earn loyalty points?', a: 'Points are earned automatically on every order. You set the earning rate (e.g., 1 point per Rs 10 or $1 spent), and the system calculates and assigns points at billing. Works for dine-in, takeaway, and delivery orders through POS, QR menu, or the Crave app. No loyalty cards or manual stamps needed.' },
    { q: 'How do customers redeem their rewards?', a: 'Customers provide their phone number at the POS, and the staff can see their available points and rewards. The customer chooses to redeem, and the discount is applied to their bill automatically. They can also redeem through the Crave app when placing an order.' },
    { q: 'Can I set up different reward tiers?', a: 'Yes. You can create as many tiers as you want (e.g., Silver, Gold, Platinum) with different earning rates and perks for each. Customers automatically move between tiers based on their cumulative spending. Higher tiers can earn points faster and access exclusive rewards.' },
    { q: 'What if a customer loses their phone or changes their number?', a: 'Points are tied to the customer profile, not just a phone number. If a customer updates their number, their loyalty balance transfers. Staff can also look up customers by name or email to access their rewards.' },
    { q: 'Can I set expiration on points?', a: 'Yes. You can configure points to expire after a certain period (e.g., 90 days, 6 months, or 1 year). Expiring points create urgency and encourage customers to visit more frequently. You can also choose to never expire points.' },
    { q: 'Do loyalty rewards work with online orders?', a: 'Absolutely. Points are earned and can be redeemed on orders placed through the Crave customer app, QR menu, or any DineOpen-powered ordering channel. Everything syncs in real time across all channels.' },
  ];

  const relatedPages = [
    { title: 'Customer CRM', desc: 'Manage your customer database', link: '/products/loyalty/crm', icon: <FaDatabase size={18} /> },
    { title: 'WhatsApp Marketing', desc: 'Send reward notifications', link: '/products/loyalty/whatsapp', icon: <FaWhatsapp size={18} /> },
    { title: 'Offers & Promotions', desc: 'Create promotional deals', link: '/products/loyalty/offers', icon: <FaPercent size={18} /> },
    { title: 'Customer App', desc: 'Branded Crave app', link: '/products/loyalty/customer-app', icon: <FaMobile size={18} /> },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              <FaGift /> Loyalty Rewards
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '46px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Restaurant Loyalty Rewards That Actually Drive Repeat Visits
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '36px', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto 36px' }}>
              Points, cashback, visit-based rewards, and tiered memberships. Everything runs automatically with zero manual effort from your staff.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '16px 36px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Start Free Trial <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* Reward Types */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Choose the Right Rewards for Your Restaurant
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
              Different restaurants work best with different reward structures. Mix and match to find what works for you.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {rewardTypes.map((type, idx) => (
                <div key={idx} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                  <div style={{ width: '60px', height: '60px', backgroundColor: `${type.color}15`, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: type.color, marginBottom: '20px' }}>
                    {type.icon}
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>{type.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6, marginBottom: '18px' }}>{type.desc}</p>
                  <div style={{ padding: '14px', backgroundColor: '#f9fafb', borderRadius: '10px', fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                    <strong>Example:</strong> {type.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Loyalty Drives Repeat Visits */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              How Loyalty Rewards Drive Repeat Visits
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              The psychology behind why loyalty programs work
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {howItDrives.map((item, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: '#f9fafb', borderRadius: '14px' }}>
                  <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>{item.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How It Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: '28px' }}>
              {steps.map((step, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 auto 16px' }}>
                    {step.num}
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{step.desc}</p>
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
        <section style={{ background: 'linear-gradient(135deg, #7c3aed, #5b21b6)', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', marginBottom: '16px' }}>
              Start Rewarding Your Customers Today
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px', lineHeight: 1.6 }}>
              Set up your loyalty rewards program in under 10 minutes. Included with every DineOpen plan starting at $20/month.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '18px 40px', backgroundColor: 'white', color: '#7c3aed', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Get Started Free <FaArrowRight />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
