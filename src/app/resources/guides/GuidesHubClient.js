'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaBook, FaRocket, FaBullhorn, FaUtensils, FaBoxOpen, FaUsers, FaChartLine, FaDownload } from 'react-icons/fa';

export default function GuidesHubClient() {
  const guides = [
    {
      icon: <FaRocket size={32} />,
      title: 'Complete Restaurant Startup Checklist 2024',
      description: 'Everything you need to open a restaurant in India. 50+ point checklist covering licenses, location, equipment, staffing, and launch.',
      pages: '25 pages',
      category: 'Startup',
      color: '#059669',
      link: '/resources/startup-guide',
      featured: true,
    },
    {
      icon: <FaBullhorn size={32} />,
      title: 'Restaurant Marketing Playbook',
      description: 'Proven marketing strategies for restaurants. Social media, Google My Business, Zomato optimization, influencer marketing, and more.',
      pages: '30 pages',
      category: 'Marketing',
      color: '#7c3aed',
      link: '#',
      featured: true,
    },
    {
      icon: <FaUtensils size={32} />,
      title: 'Menu Engineering Guide',
      description: 'Design menus that sell. Learn food costing, pricing psychology, menu layout optimization, and how to identify star items.',
      pages: '20 pages',
      category: 'Operations',
      color: '#dc2626',
      link: '#',
      featured: true,
    },
    {
      icon: <FaBoxOpen size={32} />,
      title: 'Inventory Management Mastery',
      description: 'Reduce food waste and control costs. Par levels, FIFO method, vendor management, and inventory tracking best practices.',
      pages: '18 pages',
      category: 'Operations',
      color: '#0891b2',
      link: '#',
      featured: false,
    },
    {
      icon: <FaUsers size={32} />,
      title: 'Staff Training Handbook',
      description: 'Train your team for success. Service standards, hygiene protocols, POS training, and customer handling scripts.',
      pages: '22 pages',
      category: 'HR',
      color: '#ea580c',
      link: '#',
      featured: false,
    },
    {
      icon: <FaChartLine size={32} />,
      title: 'Restaurant KPIs & Metrics Guide',
      description: 'Track what matters. Food cost percentage, labor cost, table turnover, average check size, and how to improve each.',
      pages: '15 pages',
      category: 'Analytics',
      color: '#2563eb',
      link: '#',
      featured: false,
    },
  ];

  const complianceGuides = [
    { title: 'FSSAI License Guide', description: 'Step-by-step registration process', link: '/resources/fssai-guide' },
    { title: 'GST for Restaurants', description: 'Tax rates, ITC, and filing', link: '/resources/gst-restaurants' },
    { title: 'All Licenses Checklist', description: 'Complete permits list', link: '/resources/restaurant-licenses-india' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <section style={{ background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '24px', marginBottom: '24px' }}>
              <FaBook /> Resource Library
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Free Restaurant Guides & eBooks
            </h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Expert insights from 10,000+ restaurant owners. Download free guides on startup, marketing, operations, and growth.
            </p>
          </div>
        </section>

        {/* Featured Guides */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Featured Guides
            </h2>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '48px' }}>
              Our most popular resources for restaurant success
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {guides.filter(g => g.featured).map((guide, idx) => (
                <div key={idx} style={{ padding: '32px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: guide.color }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: `${guide.color}15`, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: guide.color }}>
                      {guide.icon}
                    </div>
                    <span style={{ padding: '4px 12px', backgroundColor: '#f3f4f6', borderRadius: '12px', fontSize: '12px', color: '#6b7280' }}>{guide.category}</span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>{guide.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.7, marginBottom: '20px' }}>{guide.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>{guide.pages}</span>
                    <Link href={guide.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: guide.color, color: 'white', borderRadius: '8px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
                      <FaDownload /> Download Free
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* All Guides */}
        <section style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              More Guides
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {guides.filter(g => !g.featured).map((guide, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: `${guide.color}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: guide.color, flexShrink: 0 }}>
                    {guide.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{guide.title}</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>{guide.description}</p>
                    <Link href={guide.link} style={{ fontSize: '13px', color: guide.color, fontWeight: '600', textDecoration: 'none' }}>
                      Coming Soon →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance Guides */}
        <section style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>
              Compliance & Legal Guides
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {complianceGuides.map((guide, idx) => (
                <Link key={idx} href={guide.link} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textDecoration: 'none', display: 'block' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>{guide.title}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>{guide.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', color: 'white', textAlign: 'center' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '16px' }}>
              Ready to Apply What You Learn?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Put these strategies into action with DineOpen - the complete restaurant management platform.
            </p>
            <Link
              href="https://app.dineopen.com/register"
              style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: 'white', color: '#1e40af', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
