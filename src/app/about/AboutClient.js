'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import InternalLinks from '../../components/InternalLinks';

export default function AboutClient() {
  const stats = [
    { value: '1,000+', label: 'Restaurants' },
    { value: '20+', label: 'Countries' },
    { value: '200+', label: 'Cities' },
    { value: '99.9%', label: 'Uptime' },
    { value: '42+', label: 'Free Tools' },
    { value: '$0', label: 'Transaction Fees' },
  ];

  const differentiators = [
    {
      title: 'AI-First Approach',
      description: 'AI voice ordering, smart analytics, and intelligent inventory management built into every plan — not as expensive add-ons.',
    },
    {
      title: 'Global Yet Local',
      description: 'Available in 20+ countries with local tax compliance, multi-currency support, and regional payment integrations.',
    },
    {
      title: 'Zero Transaction Fees',
      description: 'We never take a cut of your sales. You only pay your payment processor directly. Your revenue stays yours.',
    },
    {
      title: 'All-in-One Platform',
      description: 'POS, kitchen display, waiter app, inventory, analytics, loyalty, QR ordering — everything in a single platform starting at $9.99/month.',
    },
  ];

  const values = [
    { title: 'Simplicity', description: 'Technology should make life easier, not harder. Every feature we build must be intuitive enough to use without training.' },
    { title: 'Affordability', description: 'Great restaurant software should not cost a fortune. We keep prices low so every restaurant can access enterprise-grade tools.' },
    { title: 'Innovation', description: 'We embrace AI and emerging technology to give independent restaurants the same advantages as large chains.' },
    { title: 'Customer First', description: 'Every decision we make starts with one question: does this help our restaurant partners serve their customers better?' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingTop: '80px' }}>

        {/* Hero Section */}
        <section style={{ textAlign: 'center', padding: '80px 20px 60px', maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>
            About DineOpen
          </p>
          <h1 style={{ fontSize: '48px', fontWeight: '800', color: '#111827', marginBottom: '24px', lineHeight: '1.1' }}>
            Powering Restaurants Worldwide
          </h1>
          <p style={{ fontSize: '20px', color: '#6b7280', lineHeight: '1.6', maxWidth: '640px', margin: '0 auto' }}>
            DineOpen is a global restaurant operating system — Cloud POS, AI voice ordering, waiter apps, inventory, analytics, and loyalty programs — all in one affordable platform.
          </p>
        </section>

        {/* Mission Section */}
        <section style={{ backgroundColor: '#f9fafb', padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
              Our Mission
            </h2>
            <p style={{ fontSize: '18px', color: '#4b5563', lineHeight: '1.8', maxWidth: '680px', margin: '0 auto' }}>
              Make restaurant technology accessible to every restaurant on the planet — from street food stalls in Mumbai to fine dining chains in New York. We believe every restaurant deserves powerful, AI-driven tools without paying a fortune or sacrificing simplicity.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>
              Our Story
            </h2>
            <div style={{ fontSize: '17px', color: '#4b5563', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '20px' }}>
                DineOpen was founded in 2024 with a simple observation: restaurants everywhere were struggling with expensive, complex POS systems that charged hefty transaction fees and required lengthy contracts.
              </p>
              <p style={{ marginBottom: '20px' }}>
                Small restaurant owners were forced to choose between unaffordable enterprise software and clunky free tools that could not keep up. Meanwhile, AI was transforming every industry except the one that needed it most — hospitality.
              </p>
              <p>
                We built DineOpen to change that. A single platform where any restaurant can get a cloud POS, AI-powered voice ordering, a waiter app, inventory management, analytics, and loyalty programs — all starting at just $9.99 per month with zero transaction fees. Today, over 1,000 restaurants across 20+ countries trust DineOpen to run their operations.
              </p>
            </div>
          </div>
        </section>

        {/* By the Numbers */}
        <section style={{ backgroundColor: '#111827', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#ffffff', marginBottom: '48px', textAlign: 'center' }}>
              By the Numbers
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {stats.map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', fontWeight: '800', color: '#ef4444', marginBottom: '8px' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '16px', color: '#9ca3af', fontWeight: '500' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', marginBottom: '16px', textAlign: 'center' }}>
              What Makes Us Different
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
              We are not just another POS. DineOpen is a complete restaurant operating system built for the modern era.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
              {differentiators.map((item) => (
                <div key={item.title} style={{ backgroundColor: '#f9fafb', borderRadius: '12px', padding: '32px', border: '1px solid #e5e7eb' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section style={{ backgroundColor: '#f9fafb', padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', marginBottom: '48px', textAlign: 'center' }}>
              Our Values
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
              {values.map((item) => (
                <div key={item.title} style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.7' }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Get in Touch
            </h2>
            <p style={{ fontSize: '17px', color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
              Have questions or want to learn more? We would love to hear from you.
            </p>
            <a
              href="mailto:support@dineopen.com"
              style={{ fontSize: '18px', color: '#ef4444', fontWeight: '600', textDecoration: 'none' }}
            >
              support@dineopen.com
            </a>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '32px' }}>
              {[
                { name: 'Twitter', url: 'https://twitter.com/dineopen' },
                { name: 'LinkedIn', url: 'https://www.linkedin.com/company/dineopen' },
                { name: 'Instagram', url: 'https://www.instagram.com/dineopen' },
                { name: 'YouTube', url: 'https://www.youtube.com/@dineopen' },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '15px',
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    transition: 'color 0.2s',
                  }}
                >
                  {social.name}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ backgroundColor: '#ef4444', padding: '60px 20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#ffffff', marginBottom: '16px' }}>
            Ready to Transform Your Restaurant?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', marginBottom: '32px' }}>
            Join 1,000+ restaurants already using DineOpen. Start your free trial today.
          </p>
          <Link
            href="/pricing"
            style={{
              display: 'inline-block',
              backgroundColor: '#ffffff',
              color: '#ef4444',
              padding: '14px 32px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '16px',
              textDecoration: 'none',
            }}
          >
            View Pricing
          </Link>
        </section>

        <InternalLinks currentPath="/about" variant="all" />
      </div>
      <Footer />
    </>
  );
}
