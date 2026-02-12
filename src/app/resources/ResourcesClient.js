'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaArrowRight, FaFileAlt, FaClipboardList, FaBook, FaDownload, FaShieldAlt, FaReceipt, FaBuilding, FaFire, FaBalanceScale } from 'react-icons/fa';

export default function ResourcesClient() {
  const complianceGuides = [
    { name: 'FSSAI Registration Guide', href: '/resources/fssai-registration', desc: 'Complete guide to FSSAI food license registration in India', icon: FaShieldAlt },
    { name: 'FSSAI License Guide', href: '/resources/fssai-guide', desc: 'Understanding different types of FSSAI licenses', icon: FaFileAlt },
    { name: 'GST for Restaurants', href: '/resources/gst-restaurants', desc: 'GST rates, rules, and compliance for restaurants', icon: FaReceipt },
    { name: 'GST Filing Guide', href: '/resources/gst-filing-restaurants', desc: 'Monthly and annual GST filing for restaurants', icon: FaClipboardList },
    { name: 'Shop & Establishment Act', href: '/resources/shop-establishment-act', desc: 'State-wise shop and establishment registration', icon: FaBuilding },
    { name: 'Fire Safety NOC', href: '/resources/fire-safety-noc', desc: 'Fire safety compliance and NOC requirements', icon: FaFire },
    { name: 'Liquor License Guide', href: '/resources/liquor-license-guide', desc: 'Complete guide to liquor licensing for bars and restaurants', icon: FaBalanceScale },
    { name: 'All Licenses Checklist', href: '/resources/restaurant-licenses-india', desc: 'Complete list of licenses needed to start a restaurant', icon: FaBalanceScale },
  ];

  const businessGuides = [
    { name: 'Restaurant Startup Guide', href: '/resources/startup-guide', desc: 'Step-by-step guide to starting a restaurant in India' },
    { name: 'Business Plan Template', href: '/resources/business-plan', desc: 'Free restaurant business plan template' },
    { name: 'Free Guides & eBooks', href: '/resources/guides', desc: 'Collection of free restaurant guides and eBooks' },
    { name: 'Free Templates', href: '/resources/templates', desc: 'Menu templates, checklists, and more' },
  ];

  const platformGuides = [
    { name: 'Swiggy Registration', href: '/resources/swiggy-onboarding', desc: 'How to list your restaurant on Swiggy' },
    { name: 'Zomato Registration', href: '/resources/zomato-onboarding', desc: 'How to register on Zomato for business' },
    { name: 'Google Business Guide', href: '/resources/google-business-guide', desc: 'Set up and optimize Google My Business' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', marginBottom: '24px' }}>
              <FaBook />
              <span style={{ fontWeight: '600' }}>Free Resources</span>
            </div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Restaurant Guides & Resources
            </h1>
            <p style={{ fontSize: '22px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Free guides, templates, and resources to help you start, run, and grow your restaurant business in India.
            </p>
            <Link
              href="/resources/startup-guide"
              style={{ display: 'inline-block', padding: '18px 36px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Read Startup Guide
            </Link>
          </div>
        </div>

        {/* Compliance Guides */}
        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <FaShieldAlt style={{ fontSize: '28px', color: '#ef4444' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                Compliance & Licensing Guides
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Everything you need to know about FSSAI, GST, and other restaurant regulations
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {complianceGuides.map((guide, idx) => (
                <Link key={idx} href={guide.href} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', padding: '28px', backgroundColor: 'white', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                  <div style={{ width: '52px', height: '52px', backgroundColor: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <guide.icon style={{ fontSize: '22px', color: '#ef4444' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{guide.name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{guide.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#ef4444', flexShrink: 0, marginTop: '4px' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Business Guides */}
        <div style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '16px' }}>
              <FaDownload style={{ fontSize: '28px', color: '#ef4444' }} />
              <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827' }}>
                Business Guides & Templates
              </h2>
            </div>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Free downloadable guides and templates for your restaurant
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {businessGuides.map((guide, idx) => (
                <Link key={idx} href={guide.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px', textDecoration: 'none', border: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{guide.name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{guide.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#ef4444', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Guides */}
        <div style={{ padding: '60px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Platform Registration Guides
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>
              Step-by-step guides to get your restaurant on major platforms
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {platformGuides.map((guide, idx) => (
                <Link key={idx} href={guide.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', backgroundColor: 'white', borderRadius: '12px', textDecoration: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{guide.name}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>{guide.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#ef4444', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Free Tools CTA */}
        <div style={{ padding: '60px 20px', backgroundColor: '#f0fdf4' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
              Looking for Free Tools?
            </h3>
            <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
              Check out our 35+ free calculators and tools for restaurant owners
            </p>
            <Link
              href="/tools"
              style={{ display: 'inline-block', padding: '14px 28px', backgroundColor: '#22c55e', color: 'white', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}
            >
              Explore Free Tools
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>
              Ready to Start Your Restaurant?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Use DineOpen to manage your restaurant from day one. Free 30-day trial.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="https://app.dineopen.com/register"
                style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/india"
                style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
              >
                Explore India Hub
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
