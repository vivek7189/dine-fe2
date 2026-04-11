'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaEnvelope, FaPhone, FaComments, FaQuestionCircle, FaBook, FaCog, FaMobileAlt, FaPrint, FaWifi, FaUsersCog, FaCreditCard, FaChartBar, FaUtensils, FaBoxes, FaClock, FaCheckCircle } from 'react-icons/fa';

export default function SupportClient() {
  const contactMethods = [
    {
      icon: <FaEnvelope size={28} />,
      title: 'Email Support',
      description: 'Send us an email and we\'ll get back to you within 24 hours.',
      detail: 'info@dineopen.com',
      link: 'mailto:info@dineopen.com',
      linkText: 'Send Email',
    },
    {
      icon: <FaPhone size={28} />,
      title: 'Phone Support',
      description: 'Speak directly with our support team during business hours.',
      detail: 'Mon–Sat, 9 AM – 8 PM IST',
      link: 'mailto:info@dineopen.com',
      linkText: 'Request Callback',
    },
    {
      icon: <FaComments size={28} />,
      title: 'Live Chat',
      description: 'Chat with our team in real-time from the DineOpen dashboard or app.',
      detail: 'Available in-app',
      link: 'mailto:info@dineopen.com',
      linkText: 'Start Chat',
    },
  ];

  const faqs = [
    {
      question: 'How do I set up my restaurant on DineOpen?',
      answer: 'After signing up, our onboarding wizard guides you through adding your restaurant details, menu items, tables, and staff. You can also import your existing menu. The entire setup takes under 15 minutes.',
    },
    {
      question: 'Can I use DineOpen on multiple devices?',
      answer: 'Yes. DineOpen works on any device with a browser — tablets, phones, laptops, and desktops. You can run the POS on one device, the kitchen display on another, and the waiter app on staff phones, all synced in real-time.',
    },
    {
      question: 'How do I connect a printer for billing?',
      answer: 'DineOpen supports Bluetooth, USB, and Wi-Fi thermal printers. Go to Settings → Printer Setup in your dashboard, select your printer type, and follow the pairing instructions. We support most 80mm and 58mm thermal printers.',
    },
    {
      question: 'What if my internet goes down?',
      answer: 'DineOpen is built to handle intermittent connectivity. Orders and billing continue to work offline and automatically sync when the connection is restored. Your operations are never interrupted.',
    },
    {
      question: 'How do I add or manage staff accounts?',
      answer: 'Navigate to Settings → Staff Management. You can add staff members, assign roles (Owner, Manager, Cashier, Waiter, Kitchen), and set specific permissions for each role to control what they can access.',
    },
    {
      question: 'Can I integrate with Swiggy and Zomato?',
      answer: 'Yes. DineOpen integrates directly with Swiggy and Zomato. Online orders appear automatically on your POS — no manual entry needed. Go to Settings → Integrations to connect your accounts.',
    },
    {
      question: 'How do I generate GST-compliant invoices?',
      answer: 'DineOpen automatically generates GST-compliant invoices with your GSTIN, HSN/SAC codes, and proper tax breakdowns (CGST/SGST/IGST). Configure your tax details in Settings → Tax Configuration.',
    },
    {
      question: 'How do refunds and cancellations work?',
      answer: 'Managers and owners can process refunds directly from the order history. Select the order, choose full or partial refund, and the system handles the rest — including updating your reports and inventory.',
    },
    {
      question: 'Is my data safe and backed up?',
      answer: 'Absolutely. All data is encrypted with 256-bit SSL and stored on secure cloud servers with automatic hourly backups. You can access your data anytime, and we maintain 30-day backup retention.',
    },
    {
      question: 'How do I cancel or change my subscription?',
      answer: 'You can manage your subscription from Settings → Billing. Upgrade, downgrade, or cancel anytime. If you cancel, your data is retained for 90 days in case you want to return.',
    },
  ];

  const supportTopics = [
    { icon: <FaCog size={22} />, title: 'Account & Setup', description: 'Registration, login issues, restaurant profile setup, and onboarding help.' },
    { icon: <FaUtensils size={22} />, title: 'Menu Management', description: 'Adding items, categories, variants, pricing tiers, and menu customization.' },
    { icon: <FaCreditCard size={22} />, title: 'Billing & Payments', description: 'Invoicing, payment methods, split bills, discounts, tax configuration, and refunds.' },
    { icon: <FaPrint size={22} />, title: 'Printers & Hardware', description: 'Thermal printer setup, Bluetooth pairing, KOT printing, and hardware troubleshooting.' },
    { icon: <FaMobileAlt size={22} />, title: 'Waiter & Captain App', description: 'Table ordering, order modifications, waiter app setup, and mobile device issues.' },
    { icon: <FaBoxes size={22} />, title: 'Inventory & Stock', description: 'Stock tracking, recipe management, low-stock alerts, and purchase orders.' },
    { icon: <FaChartBar size={22} />, title: 'Reports & Analytics', description: 'Sales reports, tax reports, staff performance, and data export.' },
    { icon: <FaUsersCog size={22} />, title: 'Staff & Permissions', description: 'Adding staff, assigning roles, managing permissions, and attendance tracking.' },
    { icon: <FaWifi size={22} />, title: 'Connectivity & Sync', description: 'Offline mode, data sync issues, multi-device setup, and network troubleshooting.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#fafbfc' }}>
      <CommonHeader />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '120px 20px 80px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '6px 16px',
            fontSize: 14,
            marginBottom: 24,
          }}>
            <FaQuestionCircle size={14} />
            Help & Support
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, margin: '0 0 16px', lineHeight: 1.2 }}>
            How Can We Help You?
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', opacity: 0.85, maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Our team is here to make sure your restaurant runs smoothly with DineOpen. Get answers, troubleshoot issues, or reach out directly.
          </p>
          <a
            href="mailto:info@dineopen.com"
            style={{
              display: 'inline-block',
              background: '#e8513d',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
            Contact Support — info@dineopen.com
          </a>
        </div>
      </section>

      {/* Contact Methods */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 20px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 12, color: '#1a1a2e' }}>
          Get In Touch
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 40, fontSize: 16 }}>
          Choose how you&apos;d like to reach us. We respond to all queries promptly.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {contactMethods.map((method, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: 12,
              padding: 32,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              textAlign: 'center',
              border: '1px solid #f0f0f0',
            }}>
              <div style={{ color: '#e8513d', marginBottom: 16 }}>{method.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, color: '#1a1a2e' }}>{method.title}</h3>
              <p style={{ color: '#666', fontSize: 14, marginBottom: 12, lineHeight: 1.6 }}>{method.description}</p>
              <p style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 15, marginBottom: 16 }}>{method.detail}</p>
              <a
                href={method.link}
                style={{
                  display: 'inline-block',
                  border: '2px solid #e8513d',
                  color: '#e8513d',
                  padding: '10px 24px',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 14,
                  textDecoration: 'none',
                }}
              >
                {method.linkText}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Support Topics */}
      <section style={{ background: '#f5f7fa', padding: '60px 20px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 12, color: '#1a1a2e' }}>
            Support Topics
          </h2>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: 40, fontSize: 16 }}>
            Browse by category to find help for your specific issue.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {supportTopics.map((topic, i) => (
              <div key={i} style={{
                background: '#fff',
                borderRadius: 10,
                padding: '24px 28px',
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                border: '1px solid #eee',
              }}>
                <div style={{ color: '#e8513d', flexShrink: 0, marginTop: 2 }}>{topic.icon}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#1a1a2e' }}>{topic.title}</h3>
                  <p style={{ fontSize: 14, color: '#666', lineHeight: 1.5, margin: 0 }}>{topic.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 12, color: '#1a1a2e' }}>
          Frequently Asked Questions
        </h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 40, fontSize: 16 }}>
          Quick answers to common questions about DineOpen.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: 10,
              padding: '24px 28px',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              border: '1px solid #f0f0f0',
            }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#1a1a2e', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <FaQuestionCircle size={16} style={{ color: '#e8513d', flexShrink: 0, marginTop: 3 }} />
                {faq.question}
              </h3>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: '0 0 0 26px' }}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Response Time */}
      <section style={{ background: '#f5f7fa', padding: '60px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: 'center', marginBottom: 40, color: '#1a1a2e' }}>
            Our Support Commitment
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {[
              { icon: <FaClock size={24} />, title: 'Under 24-Hour Response', desc: 'All email queries receive a response within 24 hours, most within a few hours.' },
              { icon: <FaCheckCircle size={24} />, title: 'Dedicated Onboarding', desc: 'New customers get a dedicated onboarding specialist to help set up everything.' },
              { icon: <FaBook size={24} />, title: 'Step-by-Step Guides', desc: 'Detailed documentation and video tutorials for every feature in DineOpen.' },
              { icon: <FaUsersCog size={24} />, title: 'Priority Support', desc: 'Premium plan customers get priority support with faster resolution times.' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center', padding: 20 }}>
                <div style={{ color: '#e8513d', marginBottom: 12 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#1a1a2e' }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Still Need Help?</h2>
          <p style={{ opacity: 0.85, fontSize: 16, marginBottom: 28, lineHeight: 1.6 }}>
            Our support team is ready to assist you. Drop us an email and we&apos;ll take care of the rest.
          </p>
          <a
            href="mailto:info@dineopen.com"
            style={{
              display: 'inline-block',
              background: '#e8513d',
              color: '#fff',
              padding: '14px 36px',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
            Email us at info@dineopen.com
          </a>
          <p style={{ marginTop: 20, opacity: 0.6, fontSize: 14 }}>
            DineOpen Technologies | info@dineopen.com
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
