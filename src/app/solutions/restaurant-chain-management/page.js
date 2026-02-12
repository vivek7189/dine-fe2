'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaBuilding, FaChartBar, FaUsers, FaCog, FaCheck, FaMapMarkerAlt } from 'react-icons/fa';


export default function RestaurantChainManagementPage() {
  const features = [
    { icon: FaBuilding, title: 'Multi-Outlet Dashboard', desc: 'See all outlets in one view. Compare sales, costs, performance across locations.' },
    { icon: FaChartBar, title: 'Centralized Reporting', desc: 'Consolidated P&L, inventory reports, staff metrics. One login, complete visibility.' },
    { icon: FaUsers, title: 'Role-Based Access', desc: 'Area managers see their outlets. Staff see their station. You see everything.' },
    { icon: FaCog, title: 'Menu Sync', desc: 'Update menu at HQ, push to all outlets. Or customize per location.' },
  ];

  const painPoints = [
    { problem: 'Each outlet uses different systems', solution: 'Single POS across all locations' },
    { problem: 'No real-time visibility across outlets', solution: 'Live dashboards for all locations' },
    { problem: 'Inconsistent pricing and menus', solution: 'Centralized menu management' },
    { problem: 'Can\'t compare outlet performance', solution: 'Side-by-side analytics' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', marginBottom: '20px', fontSize: '14px' }}>Multi-Location</div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Restaurant Chain Management</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              2 outlets or 200. One system, complete control. Centralized management for growing restaurant chains.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#3b82f6', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/login" style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Chain Management Challenges</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {painPoints.map((item, idx) => (
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

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Chain Management Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', backgroundColor: '#dbeafe', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <feature.icon style={{ fontSize: '32px', color: '#3b82f6' }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>What You Can Control Centrally</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {[
                'Menu items, prices, and categories',
                'Staff roles and permissions',
                'Promotions and discounts',
                'Inventory and purchase orders',
                'Reports and analytics',
                'Customer loyalty programs',
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: '#eff6ff', borderRadius: '12px' }}>
                  <FaCheck style={{ color: '#3b82f6', fontSize: '20px', flexShrink: 0 }} />
                  <span style={{ fontSize: '16px', color: '#111827', fontWeight: '500' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Related Solutions</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/solutions/franchise-pos" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Franchise POS</Link>
              <Link href="/features/staff-management" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Staff Management</Link>
              <Link href="/india" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>India Locations</Link>
              <Link href="/loyalty/restaurant-loyalty-program" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Loyalty Program</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Scale Your Chain With Confidence</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>One system that grows with you.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
