'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CommonHeader from '../../../../components/CommonHeader';
import Footer from '../../../../components/Footer';
import { FaDatabase, FaSearch, FaUserPlus, FaHistory, FaSortAmountDown, FaAddressBook, FaCheck, FaArrowRight, FaChevronDown, FaChevronUp, FaGift, FaWhatsapp, FaMobile, FaPercent } from 'react-icons/fa';

export default function CrmClient() {
  const [isMobile, setIsMobile] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: <FaAddressBook size={24} />, title: 'Complete Contact Database', desc: 'Store phone numbers, email addresses, and physical addresses for every customer. All contact details are organized and accessible from a single dashboard.' },
    { icon: <FaUserPlus size={24} />, title: 'Customer CRUD Operations', desc: 'Add new customers manually or let the system capture them automatically. Edit customer details, merge duplicates, and keep your database clean and up to date.' },
    { icon: <FaSearch size={24} />, title: 'Search & Filter', desc: 'Find any customer instantly by name, phone number, or email. Filter your database by visit frequency, order value, last visit date, or custom tags.' },
    { icon: <FaSortAmountDown size={24} />, title: 'Smart Sorting', desc: 'Sort your customer list by most recent order, highest total spend, most frequent visitor, or alphabetically. Quickly identify your best customers or those at risk of churning.' },
    { icon: <FaHistory size={24} />, title: 'Order History Tracking', desc: 'View every customer\'s complete order history including items ordered, amounts spent, and timestamps. Track last order date to identify lapsed customers before they forget about you.' },
    { icon: <FaDatabase size={24} />, title: 'Auto-Capture from All Channels', desc: 'Customer data is captured automatically from POS orders, QR menu scans, Crave app signups, and online orders. No manual entry required - your database grows with every order.' },
  ];

  const benefits = [
    { title: 'Know Your Customers', desc: 'Stop treating every diner like a stranger. When a regular walks in, your staff can see their name, preferences, and order history. Personal service builds loyalty that no discount can match.' },
    { title: 'Identify Lapsed Customers', desc: 'DineOpen tracks last order dates automatically. When a regular customer hasn\'t visited in 30 days, you\'ll know. Send them a personalized offer before they become a former customer.' },
    { title: 'Data-Driven Decisions', desc: 'Understand your customer base with real data. Which customers drive the most revenue? What\'s your average customer lifetime value? How many new vs. returning customers do you get each month?' },
    { title: 'Targeted Marketing', desc: 'Segment your database and send the right message to the right customer. VIP customers get exclusive previews. Lapsed visitors get win-back offers. New customers get welcome discounts.' },
  ];

  const faqs = [
    { q: 'What is a restaurant CRM?', a: 'A restaurant CRM (Customer Relationship Management) system is software that collects, stores, and organizes customer data. It tracks who your customers are, how often they visit, what they order, and how much they spend. This data lets you personalize service, run targeted marketing, and understand your customer base at a deeper level.' },
    { q: 'How does DineOpen capture customer data automatically?', a: 'When a customer places an order through your POS, their phone number is captured at billing. When they scan a QR menu or sign up on the Crave app, their name, phone, and email are stored. Online orders capture delivery addresses too. All of this happens without your staff needing to do any manual data entry.' },
    { q: 'Can I import my existing customer list?', a: 'Yes. You can import customer data from CSV/Excel files or migrate from other CRM systems. DineOpen will match imported records with existing customers to avoid duplicates. Contact support for help with large-scale migrations.' },
    { q: 'How do I find a specific customer?', a: 'Use the search bar to find any customer by name, phone number, or email address. Results appear instantly as you type. You can also use filters to narrow down your list by date range, order count, or customer segment.' },
    { q: 'Is there a limit on how many customers I can store?', a: 'No. DineOpen has no limits on the number of customer records you can store. Whether you have 100 or 100,000 customers, the CRM handles it without any performance issues or extra charges.' },
    { q: 'How does customer order history help my restaurant?', a: 'Order history lets you see patterns. You can identify a customer\'s favorite dishes, know when they typically visit, spot changes in spending behavior, and personalize recommendations. Staff can greet regulars by name and suggest their usual order, creating a memorable dining experience.' },
  ];

  const relatedPages = [
    { title: 'Loyalty Rewards', desc: 'Reward customers for repeat visits', link: '/products/loyalty/rewards', icon: <FaGift size={18} /> },
    { title: 'WhatsApp Marketing', desc: 'Send targeted campaigns', link: '/products/loyalty/whatsapp', icon: <FaWhatsapp size={18} /> },
    { title: 'Offers & Promotions', desc: 'Create and manage deals', link: '/products/loyalty/offers', icon: <FaPercent size={18} /> },
    { title: 'Customer App', desc: 'Branded Crave app', link: '/products/loyalty/customer-app', icon: <FaMobile size={18} /> },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', padding: isMobile ? '60px 20px' : '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 20px', borderRadius: '24px', marginBottom: '24px', fontSize: '14px', fontWeight: '600' }}>
              <FaDatabase /> Restaurant CRM
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '46px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.15 }}>
              Restaurant CRM Software That Knows Your Customers
            </h1>
            <p style={{ fontSize: isMobile ? '17px' : '20px', opacity: 0.95, marginBottom: '36px', lineHeight: 1.6, maxWidth: '650px', margin: '0 auto 36px' }}>
              A complete customer database with contact details, order history, search and sorting. Know who your customers are, what they order, and when they last visited.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '16px 36px', backgroundColor: 'white', color: '#3b82f6', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Get Started Free <FaArrowRight />
            </Link>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Customer Database Built for Restaurants
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
              Every feature you need to manage customer relationships, all integrated with your POS
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '28px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', display: 'flex', gap: '18px' }}>
                  <div style={{ width: '52px', height: '52px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
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

        {/* Benefits */}
        <section style={{ backgroundColor: 'white', padding: isMobile ? '60px 20px' : '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '34px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Why Your Restaurant Needs a CRM
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Restaurants that know their customers keep their customers
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '32px' }}>
              {benefits.map((benefit, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: '#f9fafb', borderRadius: '14px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{benefit.title}</h3>
                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing note */}
        <section style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', padding: '60px 20px', textAlign: 'center', color: 'white' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', marginBottom: '16px' }}>
              CRM Included in Every DineOpen Plan
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '24px', lineHeight: 1.6 }}>
              Starting at $20/month (₹299/month in India). No per-customer fees, no data limits, no transaction charges.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '16px 36px', backgroundColor: 'white', color: '#3b82f6', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '17px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Start Free Trial <FaArrowRight />
            </Link>
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
                  <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center', transition: 'all 0.2s' }}>
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
        <section style={{ padding: isMobile ? '60px 20px' : '80px 20px', backgroundColor: '#f9fafb', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '26px' : '34px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Start Building Your Customer Database
            </h2>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '28px', lineHeight: 1.6 }}>
              Every order is an opportunity to learn about your customers. Start capturing and organizing customer data today.
            </p>
            <Link href="/login?ref=loyalty" style={{ padding: '16px 36px', backgroundColor: '#7c3aed', color: 'white', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '17px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Get Started Free <FaArrowRight />
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
