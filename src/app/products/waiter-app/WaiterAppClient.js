'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaMobileAlt, FaUtensils, FaSync, FaWifi, FaClock, FaUsers, FaCheckCircle, FaBell, FaClipboardList, FaArrowRight, FaAndroid, FaApple } from 'react-icons/fa';

export default function WaiterAppClient() {
  const features = [
    {
      icon: <FaMobileAlt size={28} />,
      title: 'Tableside Ordering',
      description: 'Take orders right at the customer\'s table using phone or tablet. No more running back to POS terminal.',
    },
    {
      icon: <FaUtensils size={28} />,
      title: 'Direct to Kitchen',
      description: 'Orders go straight to kitchen display (KDS) or printer. Zero delay, zero errors from miscommunication.',
    },
    {
      icon: <FaSync size={28} />,
      title: 'Real-Time Sync',
      description: 'All devices sync instantly. Captain takes order, cashier sees it, kitchen gets KOT - all in real-time.',
    },
    {
      icon: <FaWifi size={28} />,
      title: 'Works Offline',
      description: 'No internet? No problem. App works offline and syncs when connection returns. Never lose an order.',
    },
    {
      icon: <FaClock size={28} />,
      title: 'Order Status Tracking',
      description: 'See which orders are preparing, ready, or served. Keep customers informed about wait times.',
    },
    {
      icon: <FaUsers size={28} />,
      title: 'Multi-Staff Support',
      description: 'Unlimited waiters can use the app simultaneously. Track who took which order for accountability.',
    },
  ];

  const workflow = [
    { step: '1', title: 'Customer Seated', desc: 'Waiter assigns table in app' },
    { step: '2', title: 'Take Order', desc: 'Select items, add modifiers, special requests' },
    { step: '3', title: 'Send to Kitchen', desc: 'One tap sends KOT to kitchen display/printer' },
    { step: '4', title: 'Track & Serve', desc: 'Get notified when order is ready' },
    { step: '5', title: 'Bill & Pay', desc: 'Generate bill, split if needed, process payment' },
  ];

  const benefits = [
    { metric: '90%', label: 'Fewer order errors' },
    { metric: '40%', label: 'Faster table turnover' },
    { metric: '25%', label: 'Higher average order value' },
    { metric: '2x', label: 'Tables per waiter capacity' },
  ];

  const appFeatures = [
    'Visual menu with images',
    'Item modifiers & variants',
    'Special instructions/notes',
    'Table transfer between waiters',
    'Split bill by item or person',
    'Apply discounts & offers',
    'View order history',
    'Customer preferences saved',
    'Dietary alerts (veg/non-veg)',
    'Multi-language support',
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaAndroid /> <FaApple /> Available on Android & iOS
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Waiter & Captain App<br />for Restaurants
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Take orders tableside, send directly to kitchen, track order status - all from your phone. Sync across unlimited devices. Included FREE with DineOpen POS.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#2563eb', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Start Free Trial <FaArrowRight style={{ marginLeft: '8px' }} />
              </Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                See Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Stats */}
        <section style={{ backgroundColor: 'white', padding: '48px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
            {benefits.map((stat, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '42px', fontWeight: '800', color: '#2563eb', marginBottom: '4px' }}>{stat.metric}</p>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              How It Works
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
              {workflow.map((item, idx) => (
                <div key={idx} style={{ textAlign: 'center', flex: '1 1 160px', maxWidth: '180px' }}>
                  <div style={{ width: '64px', height: '64px', backgroundColor: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: '800', margin: '0 auto 16px' }}>
                    {item.step}
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Powerful Features for Your Staff
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Everything your waiters and captains need to provide excellent service
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: '#f9fafb', borderRadius: '16px' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: '16px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* App Features List */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              App Capabilities
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {appFeatures.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <FaCheckCircle style={{ color: '#10b981', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Perfect For Every Restaurant Type
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {[
                { type: 'Fine Dining', desc: 'Elegant tableside service with detailed modifiers and wine pairings' },
                { type: 'Casual Dining', desc: 'Fast order taking for busy lunch and dinner service' },
                { type: 'Cafes', desc: 'Quick ordering at the table or counter' },
                { type: 'Bars & Pubs', desc: 'Track tabs, split bills easily among friends' },
                { type: 'Food Courts', desc: 'Multiple staff taking orders simultaneously' },
                { type: 'Outdoor Events', desc: 'Works offline - perfect for outdoor catering' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{item.type}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section style={{ padding: '60px 20px', backgroundColor: '#dbeafe' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '22px', color: '#1e40af', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.6 }}>
              &quot;Our waiters love the app. Order errors dropped from 10+ per day to almost zero. Kitchen gets orders instantly and customers are happier with faster service.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Rajesh Kumar</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Owner, Spice Garden Restaurant, Chennai</p>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Empower Your Staff with the Waiter App
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Free with every DineOpen subscription. Unlimited staff, unlimited devices.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#2563eb', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free 30-Day Trial →
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
