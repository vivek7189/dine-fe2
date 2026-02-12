'use client';

import Link from 'next/link';
import CommonHeader from '../../../components/CommonHeader';
import Footer from '../../../components/Footer';
import { FaDesktop, FaClock, FaFireAlt, FaCheck, FaBell, FaChartBar } from 'react-icons/fa';


export default function KitchenDisplaySystemPage() {
  const features = [
    { icon: FaDesktop, title: 'Digital Kitchen Display', desc: 'Replace paper tickets with screens. Orders appear instantly, color-coded by priority.' },
    { icon: FaClock, title: 'Order Timing', desc: 'Track prep time per order. See which orders are delayed. Optimize kitchen flow.' },
    { icon: FaFireAlt, title: 'Station Routing', desc: 'Route items to right stations - tandoor, grill, fry, dessert. Each sees their orders only.' },
    { icon: FaBell, title: 'Ready Alerts', desc: 'Mark items ready, notify servers instantly. No shouting, no confusion.' },
  ];

  const painPoints = [
    { problem: 'Paper tickets get lost or wet', solution: 'Digital orders on screen, always visible' },
    { problem: 'Kitchen can\'t read waiter handwriting', solution: 'Clear printed text, item images' },
    { problem: 'No idea which order is taking too long', solution: 'Color-coded timers show delays' },
    { problem: 'Chef doesn\'t know order priority', solution: 'Auto-sort by wait time & table status' },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', marginBottom: '20px', fontSize: '14px' }}>Kitchen Operations</div>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Kitchen Display System (KDS)</h1>
            <p style={{ fontSize: '20px', opacity: 0.95, marginBottom: '32px' }}>
              Replace paper tickets with digital screens. Real-time orders, timing alerts, station routing. Never lose an order again.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="https://app.dineopen.com/register" style={{ padding: '16px 32px', backgroundColor: 'white', color: '#f97316', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
              <Link href="/login" style={{ padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>See Demo</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Kitchen Chaos? We Fix It.</h2>
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
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Powerful KDS Features</h2>
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
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '48px' }}>Results Restaurants See</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', textAlign: 'center' }}>
              {[
                { stat: '35%', label: 'Faster ticket times' },
                { stat: '90%', label: 'Fewer order errors' },
                { stat: '25%', label: 'More orders per hour' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div style={{ fontSize: '48px', fontWeight: '800', color: '#f97316' }}>{item.stat}</div>
                  <div style={{ fontSize: '16px', color: '#6b7280' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '60px 20px', backgroundColor: '#f3f4f6' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '24px' }}>Works Great With</h3>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/features/online-ordering" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Online Ordering</Link>
              <Link href="/for/biryani-restaurants" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Biryani Restaurants</Link>
              <Link href="/for/indian-restaurants" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Indian Restaurants</Link>
              <Link href="/solutions/manage-peak-hours" style={{ padding: '12px 20px', backgroundColor: 'white', borderRadius: '8px', color: '#374151', textDecoration: 'none' }}>Peak Hour Management</Link>
            </div>
          </div>
        </div>

        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #111827 0%, #374151 100%)', color: 'white' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>Upgrade Your Kitchen</h2>
            <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '32px' }}>Works on any tablet or screen. Setup in minutes.</p>
            <Link href="https://app.dineopen.com/register" style={{ display: 'inline-block', padding: '18px 40px', backgroundColor: '#f97316', color: 'white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
