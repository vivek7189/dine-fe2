'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaStore, FaLock, FaChartPie, FaClipboardList, FaCheck } from 'react-icons/fa';


export default function FranchisePOSPage() {
  const features = [
    { icon: FaStore, title: 'Franchisee Dashboard', desc: 'Each franchisee manages their outlet. Franchisor sees all data.' },
    { icon: FaLock, title: 'Controlled Freedom', desc: 'Lock core menu items and prices. Allow local specials within guidelines.' },
    { icon: FaChartPie, title: 'Royalty Tracking', desc: 'Auto-calculate royalties based on sales. Transparent for both parties.' },
    { icon: FaClipboardList, title: 'Compliance Checks', desc: 'Ensure franchisees follow brand standards. Audit trails built-in.' },
  ];

  const franchiseeBenefits = [
    'Easy-to-use system with minimal training',
    'Real-time sales and inventory data',
    'Support from central team',
    'Proven menu and pricing',
    'Marketing support and materials',
    'Lower costs through group purchasing',
  ];

  const franchisorBenefits = [
    'Complete visibility across all franchisees',
    'Consistent customer experience',
    'Easy royalty collection',
    'Brand compliance monitoring',
    'Scalable expansion',
    'Data-driven decision making',
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', marginBottom: '20px', fontSize: '14px' }}>Franchise Solutions</div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Franchise POS System</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Built for franchise models. Franchisor control, franchisee simplicity. Scale your brand nationwide.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#14b8a6', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/login" style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Franchise Management Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', backgroundColor: '#ccfbf1', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <feature.icon style={{ fontSize: '32px', color: '#14b8a6' }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>For Franchisors</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {franchisorBenefits.map((benefit, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '8px' }}>
                      <FaCheck style={{ color: '#14b8a6', fontSize: '18px', flexShrink: 0 }} />
                      <span style={{ fontSize: '15px', color: '#111827' }}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>For Franchisees</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {franchiseeBenefits.map((benefit, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'white', borderRadius: '8px' }}>
                      <FaCheck style={{ color: '#14b8a6', fontSize: '18px', flexShrink: 0 }} />
                      <span style={{ fontSize: '15px', color: '#111827' }}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Franchise Challenges We Solve</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                { problem: 'Franchisees using different systems', solution: 'Standardized POS across all outlets' },
                { problem: 'Hard to track royalties accurately', solution: 'Auto-calculated from actual sales' },
                { problem: 'Brand inconsistency across locations', solution: 'Centralized menu and pricing control' },
                { problem: 'No visibility into franchisee operations', solution: 'Real-time dashboards for all outlets' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
                  <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>PROBLEM</div>
                  <p style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>{item.problem}</p>
                  <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600', marginBottom: '8px' }}>SOLUTION</div>
                  <p style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{item.solution}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Related Solutions</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/solutions/restaurant-chain-management" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Chain Management</Link>
              <Link href="/features/staff-management" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Staff Management</Link>
              <Link href="/india" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>India Locations</Link>
              <Link href="/resources/gst-filing-restaurants" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>GST Compliance</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Ready to Franchise?</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>The POS that scales with your franchise network.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: '#14b8a6', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
