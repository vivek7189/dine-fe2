'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import {
  FaCheckCircle, FaArrowRight, FaExclamationTriangle, FaRupeeSign,
  FaUtensils, FaQrcode, FaUsers, FaBoxes, FaChartBar, FaWhatsapp, FaFileInvoice, FaHotel,
  FaMobile, FaClock, FaShieldAlt, FaGlobe, FaHeadset, FaPlug, FaChevronDown, FaChevronUp,
  FaCoffee, FaCloudMeatball, FaBeer, FaBirthdayCake, FaTruck,
  FaPlay, FaReceipt, FaCreditCard, FaLanguage, FaUsersCog
} from 'react-icons/fa';

export default function RestaurantPOSClient() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleGetStarted = () => router.push('/login');
  const handleDemo = () => router.push('/login?demo=true');

  const problems = [
    {
      icon: FaRupeeSign,
      title: 'High Aggregator Commissions',
      description: 'Losing 20-30% of every order to food delivery platforms? Your margins disappear with each delivery.'
    },
    {
      icon: FaExclamationTriangle,
      title: 'Order Errors & Wastage',
      description: 'Manual order taking leads to miscommunication, wrong dishes, and unhappy customers who never return.'
    },
    {
      icon: FaFileInvoice,
      title: 'Manual Billing Chaos',
      description: 'Handwritten bills, GST calculation errors, and end-of-day reconciliation nightmares eating into your time.'
    },
    {
      icon: FaBoxes,
      title: 'Inventory Leakage',
      description: 'Stock going missing, over-ordering ingredients, and no visibility into what is actually consumed.'
    },
    {
      icon: FaUsers,
      title: 'No Customer Data',
      description: 'Regulars visit for years but you do not know their names, preferences, or birthdays to build loyalty.'
    },
    {
      icon: FaShieldAlt,
      title: 'GST & Compliance Headaches',
      description: 'Struggling with GST-compliant invoices, FSSAI requirements, and tax filing every month.'
    },
  ];

  const featureGroups = [
    {
      title: 'POS & Ordering',
      icon: FaUtensils,
      color: '#ef4444',
      features: ['Real-time POS dashboard', 'Table management & assignment', 'Order history & tracking', 'KOT (Kitchen Order Ticket)', 'Multiple payment methods', 'Order customization (variants, addons)']
    },
    {
      title: 'QR Menu & Digital Experience',
      icon: FaQrcode,
      color: '#f97316',
      features: ['5 beautiful menu themes', 'QR code digital menus', 'Customer mobile app (Crave)', 'Restaurant code-based access', 'Bulk menu upload', 'Voice ordering support']
    },
    {
      title: 'Customer Engagement & Loyalty',
      icon: FaUsers,
      color: '#8b5cf6',
      features: ['Customer profiles & database', 'Offers & discounts management', 'Loyalty points & rewards', 'App branding & settings', 'Automated birthday wishes', 'Customer insights']
    },
    {
      title: 'Inventory & Suppliers',
      icon: FaBoxes,
      color: '#10b981',
      features: ['Real-time inventory tracking', 'Stock alerts & notifications', 'Purchase order management', 'Supplier management', 'GRN (Goods Receipt Note)', 'Wastage tracking']
    },
    {
      title: 'Analytics & Reports',
      icon: FaChartBar,
      color: '#3b82f6',
      features: ['Sales & revenue analytics', 'Order analytics dashboard', 'Customer insights & trends', 'Weekly email reports', 'Staff performance reports', 'Peak hours analysis']
    },
    {
      title: 'Automation & WhatsApp',
      icon: FaWhatsapp,
      color: '#22c55e',
      features: ['Automation workflows', 'WhatsApp integration', 'Email/SMS notifications', 'AI chatbot assistant', 'Automated order confirmations', 'Review collection automation']
    },
    {
      title: 'Billing & Finance',
      icon: FaFileInvoice,
      color: '#ec4899',
      features: ['GST-ready invoice generation', 'Billing & payment tracking', 'Financial reports', 'Multiple payment modes', 'Split bill support', 'Day-end settlement']
    },
    {
      title: 'Hotel Support',
      icon: FaHotel,
      color: '#6366f1',
      features: ['Room service integration', 'Hotel operations support', 'Multi-outlet management', 'Room billing transfer', 'Guest profile sync', 'F&B management']
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Setup Your Restaurant',
      description: 'Create your restaurant profile, add staff roles, configure tables and outlet settings in minutes.',
      icon: FaUtensils
    },
    {
      step: 2,
      title: 'Create Menu & QR Codes',
      description: 'Upload your menu items with photos, variants, and prices. Generate QR codes for each table.',
      icon: FaQrcode
    },
    {
      step: 3,
      title: 'Customers Start Ordering',
      description: 'Customers scan QR, browse your beautiful digital menu, and place orders directly from their phones.',
      icon: FaMobile
    },
    {
      step: 4,
      title: 'Kitchen & Staff Flow',
      description: 'Orders appear on KOT screens. Kitchen prepares, staff serves. Real-time status updates throughout.',
      icon: FaClock
    },
    {
      step: 5,
      title: 'Payment, GST & Loyalty',
      description: 'Accept UPI/cards, generate GST invoices, award loyalty points - all in one seamless flow.',
      icon: FaCreditCard
    },
  ];

  const indiaAdvantages = [
    { icon: FaCreditCard, title: 'UPI Payments', description: 'Native support for UPI, PhonePe, GPay, Paytm and all Indian payment methods.' },
    { icon: FaReceipt, title: 'GST-Ready Billing', description: 'Automatic GST calculation, compliant invoices, and easy tax filing support.' },
    { icon: FaWhatsapp, title: 'WhatsApp Integration', description: 'Send order updates, bills, and promotional messages via WhatsApp - the app India uses.' },
    { icon: FaLanguage, title: 'Multi-Language Support', description: 'Full support for English and Hindi, with more regional languages coming soon.' },
    { icon: FaUsersCog, title: 'Works for Small Teams', description: 'Designed for Indian restaurants of all sizes - from 2-person cafes to 50+ staff outlets.' },
    { icon: FaHeadset, title: 'Local Support', description: 'India-based support team that understands your challenges and speaks your language.' },
  ];

  const businessTypes = [
    { name: 'Small Restaurants', icon: FaUtensils, href: '/for/restaurants', description: 'Family restaurants, dhabas, and local eateries' },
    { name: 'Cafes & Coffee Shops', icon: FaCoffee, href: '/for/cafes', description: 'Coffee shops, bakery cafes, and quick service outlets' },
    { name: 'Bars & Pubs', icon: FaBeer, href: '/for/bars-pubs', description: 'Bars, pubs, lounges, and nightclubs' },
    { name: 'Cloud Kitchens', icon: FaCloudMeatball, href: '/for/cloud-kitchens', description: 'Delivery-only kitchens and ghost restaurants' },
    { name: 'Bakeries', icon: FaBirthdayCake, href: '/for/bakeries', description: 'Bakeries, sweet shops, and confectioneries' },
    { name: 'Hotels', icon: FaHotel, href: '/for/hotels', description: 'Hotels with restaurants, room service, and banquets' },
  ];

  const faqs = [
    {
      question: 'Is DineOpen GST compliant?',
      answer: 'Yes, DineOpen generates GST-compliant invoices with proper GSTIN, HSN codes, and tax breakdowns. You can also export reports for easy tax filing.'
    },
    {
      question: 'Does it support UPI and Indian payment methods?',
      answer: 'Absolutely. DineOpen supports all major Indian payment methods including UPI, PhonePe, Google Pay, Paytm, credit/debit cards, and cash.'
    },
    {
      question: 'How long does setup take?',
      answer: 'Most restaurants are up and running within 30 minutes. Our bulk menu upload feature lets you import your entire menu from Excel in seconds.'
    },
    {
      question: 'What if my internet goes down?',
      answer: 'DineOpen has offline mode for critical operations. Orders can be taken offline and sync automatically when connection restores.'
    },
    {
      question: 'Can I manage staff roles and permissions?',
      answer: 'Yes. You can create custom roles (cashier, waiter, kitchen, manager) with specific permissions for each. Track staff performance too.'
    },
    {
      question: 'Is there support for Hindi and regional languages?',
      answer: 'DineOpen supports English and Hindi fully. Regional language support is on our roadmap based on customer demand.'
    },
    {
      question: 'Do I need special hardware?',
      answer: 'No special hardware required. DineOpen works on any device - phones, tablets, laptops. Use your existing thermal printer for KOT and bills.'
    },
    {
      question: 'How is DineOpen different from aggregator apps?',
      answer: 'Unlike Zomato/Swiggy which charge 20-30% commission, DineOpen is your own platform. You own your customer data, brand, and pay a flat fee - not per-order commission.'
    },
  ];

  const FAQItem = ({ faq, index }) => (
    <div
      style={{
        borderBottom: '1px solid #e5e7eb',
        padding: '20px 0'
      }}
    >
      <button
        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          padding: 0
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827', paddingRight: '16px' }}>
          {faq.question}
        </span>
        {expandedFaq === index ? (
          <FaChevronUp size={16} color="#6b7280" />
        ) : (
          <FaChevronDown size={16} color="#6b7280" />
        )}
      </button>
      {expandedFaq === index && (
        <p style={{
          marginTop: '12px',
          fontSize: '15px',
          color: '#6b7280',
          lineHeight: '1.7'
        }}>
          {faq.answer}
        </p>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <CommonHeader />

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "DineOpen Restaurant POS Software",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web, Android, iOS",
            "offers": {
              "@type": "Offer",
              "price": "300",
              "priceCurrency": "INR"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "500"
            }
          })
        }}
      />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #fef2f2 0%, #ffffff 100%)',
        padding: isMobile ? '60px 20px' : '80px 32px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#fef2f2',
            borderRadius: '20px',
            marginBottom: '24px',
            border: '1px solid #fecaca'
          }}>
            <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>
              Trusted by 500+ Indian Restaurants
            </span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '32px' : '52px',
            fontWeight: '800',
            color: '#111827',
            lineHeight: '1.2',
            marginBottom: '24px',
            letterSpacing: '-1px'
          }}>
            Restaurant POS & QR Ordering<br />
            <span style={{ color: '#ef4444' }}>Software for India</span>
          </h1>

          <p style={{
            fontSize: isMobile ? '16px' : '20px',
            color: '#6b7280',
            lineHeight: '1.7',
            maxWidth: '700px',
            margin: '0 auto 40px',
          }}>
            Stop paying lakhs to aggregators. Get your own POS system with QR menus, GST billing,
            UPI payments, inventory management, and WhatsApp automation - built for Indian restaurants.
          </p>

          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '16px 32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              Start Free Trial <FaArrowRight size={16} />
            </button>
            <button
              onClick={handleDemo}
              style={{
                padding: '16px 32px',
                borderRadius: '10px',
                background: 'white',
                color: '#374151',
                fontWeight: '700',
                border: '2px solid #e5e7eb',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <FaPlay size={14} /> View Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Problems Indian Restaurants Face Daily
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Running a restaurant in India is tough. These challenges eat into your profits every single day.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {problems.map((problem, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '28px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <problem.icon size={24} color="#ef4444" />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  {problem.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.6' }}>
                  {problem.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Overview */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '60px',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: isMobile ? '28px' : '40px',
                fontWeight: '800',
                color: '#111827',
                marginBottom: '24px',
                lineHeight: '1.2'
              }}>
                DineOpen: Your Complete<br />
                <span style={{ color: '#ef4444' }}>Restaurant Solution</span>
              </h2>
              <p style={{
                fontSize: '17px',
                color: '#6b7280',
                lineHeight: '1.8',
                marginBottom: '32px'
              }}>
                DineOpen is an all-in-one restaurant management platform built specifically for Indian
                restaurants. From QR ordering to GST billing, inventory to WhatsApp automation - everything
                you need to run your restaurant profitably, without paying per-order commissions.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  'Own your customer data and relationships',
                  'Zero commission on orders - flat monthly fee',
                  'Works on any device, no special hardware needed',
                  'India-first: UPI, GST, WhatsApp built-in',
                  'Setup in 30 minutes, not 30 days'
                ].map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaCheckCircle size={20} color="#22c55e" />
                    <span style={{ fontSize: '16px', color: '#374151', fontWeight: '500' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f9fafb',
              borderRadius: '20px',
              padding: '40px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '24px'
              }}>
                {[
                  { number: '500+', label: 'Restaurants' },
                  { number: '10L+', label: 'Orders Processed' },
                  { number: '99.9%', label: 'Uptime' },
                  { number: '30min', label: 'Setup Time' },
                ].map((stat, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#ef4444' }}>
                      {stat.number}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Complete Feature Set for Indian Restaurants
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Everything you need to run your restaurant efficiently - from front-of-house to back-office.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '24px'
          }}>
            {featureGroups.map((group, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '28px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: `${group.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <group.icon size={22} color={group.color} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                    {group.title}
                  </h3>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px'
                }}>
                  {group.features.map((feature, fIndex) => (
                    <div key={fIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaCheckCircle size={14} color="#22c55e" />
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              How DineOpen Works
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              Get started in 5 simple steps
            </p>
          </div>

          <div style={{ position: 'relative' }}>
            {howItWorks.map((step, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: '24px',
                  marginBottom: index < howItWorks.length - 1 ? '32px' : '0',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '20px',
                  flexShrink: 0,
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                }}>
                  {step.step}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '8px'
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: '1.6' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* India Advantages */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#111827' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: 'white',
              marginBottom: '16px'
            }}>
              Built for India, By Indians
            </h2>
            <p style={{ fontSize: '18px', color: '#9ca3af', maxWidth: '600px', margin: '0 auto' }}>
              DineOpen understands the unique needs of Indian restaurants and is designed from the ground up for the Indian market.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '24px'
          }}>
            {indiaAdvantages.map((advantage, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '28px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <advantage.icon size={24} color="#ef4444" />
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '8px'
                }}>
                  {advantage.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#9ca3af', lineHeight: '1.6' }}>
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Should Use */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Perfect for All Restaurant Types
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
              Whether you run a small dhaba or a multi-outlet chain, DineOpen scales with your business.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '20px'
          }}>
            {businessTypes.map((type, index) => (
              <Link
                key={index}
                href={type.href}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e5e7eb',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#fef2f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <type.icon size={24} color="#ef4444" />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    {type.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    {type.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Positioning */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: '#111827',
            marginBottom: '24px'
          }}>
            Simple, Fair Pricing
          </h2>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: isMobile ? '32px 20px' : '48px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              lineHeight: '1.8',
              marginBottom: '32px'
            }}>
              Unlike aggregators that take <strong style={{ color: '#ef4444' }}>20-30% commission</strong> on
              every order, DineOpen charges a <strong style={{ color: '#22c55e' }}>simple flat fee</strong>.
              That means more money in your pocket from day one.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Aggregator Fees</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444' }}>20-30%</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>per order commission</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Traditional POS</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#f97316' }}>Rs 50k+</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>upfront hardware cost</div>
              </div>
              <div style={{ padding: '20px', backgroundColor: '#dcfce7', borderRadius: '12px', border: '2px solid #22c55e' }}>
                <div style={{ fontSize: '14px', color: '#16a34a', marginBottom: '8px' }}>DineOpen</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a' }}>Flat Fee</div>
                <div style={{ fontSize: '12px', color: '#22c55e' }}>no commission, ever</div>
              </div>
            </div>

            <button
              onClick={handleGetStarted}
              style={{
                padding: '16px 40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
              }}
            >
              See Pricing Plans
            </button>
          </div>
        </div>
      </section>

      {/* Internal Links Section */}
      <section style={{ padding: isMobile ? '40px 20px' : '60px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '24px'
          }}>
            <div style={{
              backgroundColor: '#fef2f2',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #fecaca'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                Explore by Business Type
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {businessTypes.map((type, index) => (
                  <Link
                    key={index}
                    href={type.href}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#374151',
                      textDecoration: 'none',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    {type.name}
                  </Link>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '16px',
              padding: '28px',
              border: '1px solid #bbf7d0'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                Free Tools
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {[
                  { name: 'QR Menu Generator', href: '/tools/qr-menu-generator' },
                  { name: 'Invoice Generator', href: '/tools/restaurant-invoice-generator' },
                  { name: 'KOT System', href: '/tools/kot-system' },
                  { name: 'Table Management', href: '/tools/table-management' },
                  { name: 'Loyalty Program', href: '/tools/loyalty-program' },
                ].map((tool, index) => (
                  <Link
                    key={index}
                    href={tool.href}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#374151',
                      textDecoration: 'none',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ padding: isMobile ? '60px 20px' : '80px 32px', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{
              fontSize: isMobile ? '28px' : '40px',
              fontWeight: '800',
              color: '#111827',
              marginBottom: '16px'
            }}>
              Frequently Asked Questions
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>
              Common questions from Indian restaurant owners
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '32px',
            border: '1px solid #e5e7eb'
          }}>
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{
        padding: isMobile ? '60px 20px' : '80px 32px',
        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: isMobile ? '28px' : '40px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '20px'
          }}>
            Ready to Transform Your Restaurant?
          </h2>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '32px',
            lineHeight: '1.7'
          }}>
            Join 500+ Indian restaurants already using DineOpen. Start your free trial today -
            no credit card required, setup in 30 minutes.
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '18px 40px',
                borderRadius: '10px',
                background: 'white',
                color: '#ef4444',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)'
              }}
            >
              Start Free Trial
            </button>
            <button
              onClick={handleDemo}
              style={{
                padding: '18px 40px',
                borderRadius: '10px',
                background: 'transparent',
                color: 'white',
                fontWeight: '700',
                border: '2px solid white',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
