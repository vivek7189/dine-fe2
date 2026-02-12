'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaClock, FaUsers, FaDesktop, FaChartBar, FaCheck } from 'react-icons/fa';


export default function ManagePeakHoursPage() {
  const features = [
    { icon: FaDesktop, title: 'Kitchen Display', desc: 'Orders auto-prioritized. Kitchen sees what to cook first. No chaos.' },
    { icon: FaClock, title: 'Prep Time Alerts', desc: 'Orders taking too long? Get notified. Fix before customer complains.' },
    { icon: FaUsers, title: 'Staff Allocation', desc: 'Know your busy hours. Schedule more staff when needed.' },
    { icon: FaChartBar, title: 'Rush Analytics', desc: 'See patterns by day, hour, season. Prepare for the rush.' },
  ];

  const tactics = [
    { title: 'Pre-Ordering', desc: 'Accept advance orders. Kitchen starts prep before rush.' },
    { title: 'Express Menu', desc: 'Limited menu during peak. Faster execution.' },
    { title: 'Split Stations', desc: 'Divide kitchen by order type. Dine-in, delivery, takeaway.' },
    { title: 'Ready Batches', desc: 'Pre-prep common items. Assemble on order.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FaClock style={{ fontSize: '64px', marginBottom: '20px' }} />
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Manage Peak Hours</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Lunch rush? Dinner madness? Weekend crowds? Handle peak hours without breaking a sweat.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#0ea5e9', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/login" style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Peak Hour Problems</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                { problem: 'Kitchen overwhelmed with orders', solution: 'Auto-prioritized KDS with timers' },
                { problem: 'Long wait times frustrate customers', solution: 'Real-time ETA updates' },
                { problem: 'Staff confused about priorities', solution: 'Clear order queue management' },
                { problem: 'Orders getting mixed up', solution: 'Color-coded tickets by order type' },
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

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Peak Hour Tools</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', backgroundColor: '#e0f2fe', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <feature.icon style={{ fontSize: '32px', color: '#0ea5e9' }} />
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{feature.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Peak Hour Tactics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {tactics.map((tactic, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#f0f9ff', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{tactic.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280' }}>{tactic.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Results During Rush</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', textAlign: 'center' }}>
              {[
                { stat: '35%', label: 'Faster order completion' },
                { stat: '50%', label: 'Fewer order errors' },
                { stat: '20%', label: 'More orders handled' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: '#0ea5e9' }}>{item.stat}</div>
                  <div style={{ fontSize: '16px', color: '#6b7280' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Related Solutions</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/features/kitchen-display-system" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Kitchen Display</Link>
              <Link href="/features/staff-management" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Staff Scheduling</Link>
              <Link href="/solutions/increase-table-turnover" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Table Turnover</Link>
              <Link href="/features/online-ordering" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Online Ordering</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Own Your Rush Hour</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>Stay calm, serve fast, keep customers happy.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
