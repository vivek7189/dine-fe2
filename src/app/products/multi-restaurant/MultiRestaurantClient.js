'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaBuilding, FaChartBar, FaUsers, FaSync, FaShieldAlt, FaCog, FaGlobe, FaLayerGroup, FaCheck, FaArrowRight, FaStore, FaClipboardList } from 'react-icons/fa';

export default function MultiRestaurantClient() {
  const features = [
    {
      icon: <FaLayerGroup size={28} />,
      title: 'Unlimited Outlets',
      description: 'Add as many restaurant locations as you need. No limits. Scale from 2 to 200+ outlets seamlessly.',
    },
    {
      icon: <FaChartBar size={28} />,
      title: 'Unified Dashboard',
      description: 'See all outlets in one view. Consolidated sales, inventory, and performance across every location.',
    },
    {
      icon: <FaClipboardList size={28} />,
      title: 'Central Menu Management',
      description: 'Update menu once, push to all outlets. Or customize menus per location. Your choice.',
    },
    {
      icon: <FaSync size={28} />,
      title: 'Real-Time Sync',
      description: 'Every transaction syncs instantly. Know what\'s happening at any outlet, any time.',
    },
    {
      icon: <FaUsers size={28} />,
      title: 'Role-Based Access',
      description: 'Outlet managers see their location. Area managers see their region. You see everything.',
    },
    {
      icon: <FaShieldAlt size={28} />,
      title: 'Franchise Controls',
      description: 'Set what franchisees can and cannot change. Maintain brand consistency across outlets.',
    },
  ];

  const useCases = [
    {
      title: 'Restaurant Chains',
      desc: 'Manage 5, 50, or 500 owned outlets from one dashboard',
      example: 'Like: Barbeque Nation, Social, Mainland China',
    },
    {
      title: 'Franchise Networks',
      desc: 'Onboard franchisees, control menus, track royalties',
      example: 'Like: Chai Point, Wow! Momo, Subway',
    },
    {
      title: 'Food Courts',
      desc: 'Multiple brands/stalls under one management',
      example: 'Like: Mall food courts, Food halls',
    },
    {
      title: 'Cloud Kitchen Clusters',
      desc: 'Multiple virtual brands from central kitchens',
      example: 'Like: Rebel Foods, Freshmenu',
    },
    {
      title: 'Hotel F&B',
      desc: 'Multiple restaurants, bars, room service in one hotel',
      example: 'Like: ITC, Marriott, Taj properties',
    },
    {
      title: 'Catering Companies',
      desc: 'Manage multiple event locations and kitchens',
      example: 'Like: Corporate caterers, wedding caterers',
    },
  ];

  const comparisonData = [
    { feature: 'Multi-outlet support', dineopen: 'Unlimited', others: '3-5 outlets then custom pricing' },
    { feature: 'Price per outlet', dineopen: '₹999/month ($10)', others: '₹2,500-5,000/month' },
    { feature: 'Central dashboard', dineopen: '✓ Included', others: '✓ Extra cost' },
    { feature: 'Central menu management', dineopen: '✓ Included', others: '✓ Some providers' },
    { feature: 'AI Voice Ordering', dineopen: '✓ Included', others: '✗ Not available' },
    { feature: 'Franchise controls', dineopen: '✓ Included', others: '✓ Enterprise only' },
    { feature: 'Setup fee', dineopen: '₹0', others: '₹25,000-1,00,000' },
  ];

  const benefits = [
    { metric: '₹999', label: 'Per outlet/month (India)', sub: '$10 for US/UK' },
    { metric: '0', label: 'Setup fee', sub: 'No hidden costs' },
    { metric: '∞', label: 'Unlimited outlets', sub: 'Scale freely' },
    { metric: '1', label: 'Dashboard for all', sub: 'Central control' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaBuilding /> Enterprise & Chain Solution
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              One Dashboard.<br />Unlimited Restaurants.
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '16px', maxWidth: '700px', margin: '0 auto 16px' }}>
              Manage your entire restaurant chain from a single dashboard. Central menu, inventory, and reporting. Perfect for chains, franchises, and multi-brand operators.
            </p>
            <p style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>
              Just ₹999/outlet/month <span style={{ opacity: 0.8, fontSize: '18px' }}>($10 for US/UK)</span>
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://dineopen.com/login" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                Start Free Trial <FaArrowRight style={{ marginLeft: '8px' }} />
              </Link>
              <Link href="/pricing" style={{ padding: '16px 32px', backgroundColor: 'transparent', border: '2px solid white', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section style={{ backgroundColor: 'white', padding: '48px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px', textAlign: 'center' }}>
            {benefits.map((stat, idx) => (
              <div key={idx}>
                <p style={{ fontSize: '42px', fontWeight: '800', color: '#059669', marginBottom: '4px' }}>{stat.metric}</p>
                <p style={{ fontSize: '14px', color: '#111827', fontWeight: '600' }}>{stat.label}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>{stat.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Built for Scale
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Everything you need to manage multiple restaurant locations efficiently
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ padding: '28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '56px', height: '56px', backgroundColor: '#d1fae5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '16px' }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Who It&apos;s For
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {useCases.map((useCase, idx) => (
                <div key={idx} style={{ padding: '24px', border: '2px solid #e5e7eb', borderRadius: '16px', transition: 'border-color 0.2s' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{useCase.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>{useCase.desc}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>{useCase.example}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Why DineOpen for Multi-Location?
            </h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Feature</th>
                    <th style={{ padding: '16px', textAlign: 'center', backgroundColor: '#d1fae5', fontWeight: '600' }}>DineOpen</th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Other POS</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '500' }}>{row.feature}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px', backgroundColor: '#ecfdf5', color: '#059669', fontWeight: '600' }}>
                        {row.dineopen}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                        {row.others}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              What&apos;s Included Per Outlet
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {[
                'Complete POS System',
                'AI Voice Ordering',
                'QR Code Menus',
                'Waiter/Captain App',
                'Kitchen Display (KDS)',
                'Inventory Management',
                'Loyalty & Rewards',
                'Customer CRM',
                'Analytics & Reports',
                'Zomato/Swiggy Integration',
                'WhatsApp Notifications',
                'Unlimited Staff Accounts',
                '24/7 Support',
                'Free Updates',
              ].map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', backgroundColor: '#f9fafb', borderRadius: '10px' }}>
                  <FaCheck style={{ color: '#059669', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>{feature}</span>
                </div>
              ))}
            </div>
            <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '16px', color: '#6b7280' }}>
              All this for just <strong style={{ color: '#059669' }}>₹999/outlet/month</strong> (or $10 for US/UK)
            </p>
          </div>
        </section>

        {/* Testimonial */}
        <section style={{ padding: '60px 20px', backgroundColor: '#d1fae5' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: '22px', color: '#065f46', fontStyle: 'italic', marginBottom: '24px', lineHeight: 1.6 }}>
              &quot;We manage 12 outlets across 4 cities with DineOpen. The central dashboard saves our management team hours every day. And at ₹999/outlet, it costs less than what we paid for just our main branch before.&quot;
            </p>
            <p style={{ fontWeight: '700', color: '#111827' }}>Vikram Mehta</p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>CEO, Urban Dhaba Chain (12 outlets)</p>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Scale Your Restaurant Business?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Start with one outlet, scale to hundreds. Free 30-day trial for all locations.
            </p>
            <Link
              href="https://dineopen.com/login"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#059669', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial →
            </Link>
            <p style={{ marginTop: '16px', opacity: 0.8, fontSize: '14px' }}>No credit card required • Cancel anytime</p>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
