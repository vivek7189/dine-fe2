'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductPageNav from '../../../components/ProductPageNav';
import { FaBuilding, FaRocket, FaBed, FaUserCheck, FaBroom, FaWrench, FaCalendarCheck, FaKey } from 'react-icons/fa';

export default function HotelManagementClient() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    { icon: <FaBed size={32} />, title: "Room Management", description: "Manage room inventory, room types, amenities, and availability in real-time.", gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#ef4444' },
    { icon: <FaCalendarCheck size={32} />, title: "Booking Management", description: "Handle reservations, check-ins, check-outs, and booking modifications.", gradient: 'linear-gradient(135deg, #fca5a5, #ef4444)', color: '#ef4444' },
    { icon: <FaUserCheck size={32} />, title: "Guest Management", description: "Maintain guest profiles, preferences, history, and loyalty programs.", gradient: 'linear-gradient(135deg, #fca5a5, #ef4444)', color: '#ef4444' },
    { icon: <FaBroom size={32} />, title: "Housekeeping", description: "Track room cleaning status, assign tasks, and manage housekeeping schedules.", gradient: 'linear-gradient(135deg, #fca5a5, #ef4444)', color: '#ef4444' },
    { icon: <FaWrench size={32} />, title: "Maintenance", description: "Schedule and track maintenance tasks, repairs, and room service requests.", gradient: 'linear-gradient(135deg, #fca5a5, #ef4444)', color: '#ef4444' },
    { icon: <FaKey size={32} />, title: "Check-in/Check-out", description: "Streamlined check-in and check-out process with digital documentation.", gradient: 'linear-gradient(135deg, #fca5a5, #ef4444)', color: '#ef4444' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <ProductPageNav currentProduct="hotel-management" />
      <section style={{ padding: isMobile ? '80px 20px' : '120px 20px', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '50px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <FaBuilding size={18} color="#ef4444" />
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>Property Management</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '42px' : '64px', fontWeight: '900', color: '#1f2937', marginBottom: '24px', lineHeight: '1.1' }}>
              Hotel Management System
              <br />
              <span style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>(PMS)</span>
            </h1>
            <p style={{ fontSize: isMobile ? '18px' : '22px', color: '#6b7280', marginBottom: '40px', lineHeight: '1.6' }}>
              Complete Property Management System for hotels with room booking, guest management, housekeeping, and maintenance.
            </p>
            <button onClick={() => router.push('/login')} style={{ padding: '18px 36px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto', whiteSpace: 'nowrap', margin: '0 auto' }}
              onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)'; }}
              onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)'; }}>
              <FaRocket size={20} />
              <span>Start 7-Day Free Trial</span>
            </button>
          </div>
        </div>
      </section>
      <section style={{ padding: isMobile ? '80px 20px' : '120px 20px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '50px' : '80px' }}>
            <h2 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '900', color: '#1f2937', marginBottom: '20px', lineHeight: '1.2' }}>
              Complete Hotel
              <br />
              <span style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Management Features</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '24px' : '32px' }}>
            {features.map((feature, index) => (
              <div key={index} style={{ padding: isMobile ? '32px 24px' : '40px 32px', backgroundColor: 'white', borderRadius: '20px', textAlign: 'left', transition: 'all 0.4s ease', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'; e.currentTarget.style.borderColor = feature.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                <div style={{ width: isMobile ? '56px' : '64px', height: isMobile ? '56px' : '64px', background: feature.gradient, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'white', boxShadow: `0 8px 24px ${feature.color}40` }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#1f2937', marginBottom: '12px', lineHeight: '1.3' }}>{feature.title}</h3>
                <p style={{ color: '#6b7280', lineHeight: '1.7', fontSize: isMobile ? '15px' : '16px', margin: 0 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding: isMobile ? '80px 20px' : '120px 20px', backgroundColor: '#fafafa', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '40px 20px' : '60px 40px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '900', color: '#1f2937', marginBottom: '24px', lineHeight: '1.2' }}>Ready to Manage Your Hotel?</h2>
          <p style={{ fontSize: isMobile ? '18px' : '20px', color: '#6b7280', marginBottom: '40px', lineHeight: '1.6' }}>Start managing your hotel operations efficiently with DineOpen PMS.</p>
          <button onClick={() => router.push('/login')} style={{ padding: '18px 36px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '8px', width: isMobile ? '100%' : 'auto', whiteSpace: 'nowrap', margin: '0 auto' }}
            onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)'; }}
            onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)'; }}>
            <FaRocket size={20} />
            <span>Start 7-Day Free Trial</span>
          </button>
        </div>
      </section>
    </div>
  );
}

