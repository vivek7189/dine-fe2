'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaSync, FaClock, FaBell, FaChair, FaCheck, FaChartLine } from 'react-icons/fa';


export default function IncreaseTableTurnoverPage() {
  const features = [
    { icon: FaClock, title: 'Table Time Tracking', desc: 'See how long each table is occupied. Identify bottlenecks in service.' },
    { icon: FaBell, title: 'Bill Alerts', desc: 'Get notified when tables are waiting for bills. Speed up the checkout.' },
    { icon: FaChair, title: 'Real-Time Status', desc: 'Which tables are free, occupied, reserved? See at a glance.' },
    { icon: FaChartLine, title: 'Turnover Analytics', desc: 'Track turns per shift. Compare days, servers, sections.' },
  ];

  const strategies = [
    { title: 'Faster Ordering', desc: 'QR menus, digital ordering. Orders reach kitchen instantly.' },
    { title: 'Quick Bill Settlement', desc: 'Pay at table, split bills easily. No waiting for server.' },
    { title: 'Kitchen Efficiency', desc: 'KDS ensures food reaches tables fast. No delays.' },
    { title: 'Smart Reservations', desc: 'Stagger bookings. Avoid rush-hour pile-ups.' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <FaSync style={{ fontSize: '64px', marginBottom: '20px' }} />
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Increase Table Turnover</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              More turns = more revenue. Same tables, more guests, higher sales. Optimize every seat.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#f97316', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/login" style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>The Math of Turnover</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', textAlign: 'center' }}>
              {[
                { stat: '20%', desc: 'Revenue increase with 1 extra turn' },
                { stat: '15 min', desc: 'Average time saved per table' },
                { stat: '4→5', desc: 'Turns per night possible' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: '#f97316' }}>{item.stat}</div>
                  <div style={{ fontSize: '15px', color: '#6b7280' }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Turnover Optimization Tools</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '32px' }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', backgroundColor: '#ffedd5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <feature.icon style={{ fontSize: '32px', color: '#f97316' }} />
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
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Strategies That Work</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {strategies.map((strategy, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: '#fff7ed', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>{strategy.title}</h3>
                  <p style={{ fontSize: '15px', color: '#6b7280' }}>{strategy.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Where Time Is Lost</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                { problem: 'Waiting for menu/server', solution: 'QR code ordering - instant menu access' },
                { problem: 'Kitchen delays', solution: 'KDS shows real-time cooking status' },
                { problem: 'Slow bill generation', solution: 'One-tap bill, multiple payment options' },
                { problem: 'Table cleaning delays', solution: 'Staff alerts when table vacates' },
              ].map((item, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600', marginBottom: '8px' }}>TIME LOST</div>
                  <p style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>{item.problem}</p>
                  <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600', marginBottom: '8px' }}>FIX</div>
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
              <Link href="/features/table-reservation" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Table Reservations</Link>
              <Link href="/features/kitchen-display-system" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Kitchen Display</Link>
              <Link href="/solutions/manage-peak-hours" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Peak Hours</Link>
              <Link href="/features/online-ordering" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Online Ordering</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Turn Tables Faster</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>More guests, same space, higher revenue.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: '#f97316', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
