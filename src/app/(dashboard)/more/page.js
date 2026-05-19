'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaRobot,
  FaPhoneAlt,
  FaWhatsapp,
  FaBuilding,
  FaBook,
  FaGoogle,
  FaDoorOpen,
  FaParking,
  FaCalendarCheck,
  FaCalendarAlt,
  FaCashRegister,
  FaShareAlt,
} from 'react-icons/fa';

const features = [
  {
    id: 'shifts',
    name: 'Shifts',
    description: 'Staff shift scheduling and management',
    icon: FaCalendarAlt,
    gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
    href: '/shifts',
  },
  {
    id: 'register',
    name: 'Register',
    description: 'Cash register management and daily summaries',
    icon: FaCashRegister,
    gradient: 'linear-gradient(135deg, #16a34a, #22c55e)',
    href: '/register',
  },
  {
    id: 'dineai',
    name: 'DineAI Studio',
    description: 'AI-powered restaurant insights, menu suggestions, and smart analytics',
    icon: FaRobot,
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    href: '/dineai',
  },
  {
    id: 'phone-agent',
    name: 'Phone Agent',
    description: 'AI phone assistant that takes orders and answers customer calls',
    icon: FaPhoneAlt,
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    href: '/phone-agent',
  },
  {
    id: 'whatsapp-ordering',
    name: 'WhatsApp Ordering',
    description: 'Accept orders directly through WhatsApp with automated responses',
    icon: FaWhatsapp,
    gradient: 'linear-gradient(135deg, #25D366, #128C7E)',
    href: '/whatsapp-ordering',
  },
  {
    id: 'social-media',
    name: 'Social Media',
    description: 'Schedule and publish posts on Instagram, Twitter, LinkedIn, and more',
    icon: FaShareAlt,
    gradient: 'linear-gradient(135deg, #ec4899, #f97316)',
    href: '/social-media',
  },
  {
    id: 'hotel',
    name: 'Hotel PMS',
    description: 'Hotel property management with rooms, check-in/out, and billing',
    icon: FaBuilding,
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    href: '/hotel',
  },
  {
    id: 'books',
    name: 'Books & Accounting',
    description: 'Track expenses, revenue, and generate financial reports',
    icon: FaBook,
    gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    href: '/books',
  },
  {
    id: 'google-reviews',
    name: 'Google Reviews',
    description: 'Monitor, reply to, and collect Google Reviews from customers',
    icon: FaGoogle,
    gradient: 'linear-gradient(135deg, #ea4335, #fbbc05)',
    href: '/admin?tab=google-reviews',
  },
  {
    id: 'spaces',
    name: 'Spaces',
    description: 'Manage private dining rooms, event halls, and reservable areas',
    icon: FaDoorOpen,
    gradient: 'linear-gradient(135deg, #0d9488, #14b8a6)',
    href: '/spaces',
  },
  {
    id: 'parking',
    name: 'Parking',
    description: 'Vehicle parking management with tickets and QR scanning',
    icon: FaParking,
    gradient: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
    href: '/parking',
  },
  {
    id: 'bookings',
    name: 'Bookings & Catering',
    description: 'Advance orders, catering, and venue/hall booking management',
    icon: FaCalendarCheck,
    gradient: 'linear-gradient(135deg, #ef4444, #f97316)',
    href: '/bookings',
  },
];

export default function MorePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [notAllowedPages, setNotAllowedPages] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.notAllowedPages) {
        setNotAllowedPages(user.notAllowedPages);
      }
    } catch {}
  }, []);

  const visibleFeatures = features.filter(f => !notAllowedPages.includes(f.id));

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: isMobile ? '24px 16px' : '32px 40px',
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .more-card {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .more-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important;
        }
      `}</style>

      {/* Header */}
      <div style={{
        marginBottom: '32px',
        animation: 'fadeInUp 0.4s ease',
      }}>
        <h1 style={{
          fontSize: isMobile ? '24px' : '28px',
          fontWeight: '700',
          color: '#0f172a',
          margin: '0 0 8px 0',
        }}>
          Explore Features
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          margin: 0,
        }}>
          Advanced tools and integrations for your restaurant
        </p>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
      }}>
        {visibleFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.id}
              className="more-card"
              onClick={() => router.push(feature.href)}
              style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                padding: '24px',
                animation: 'fadeInUp 0.4s ease',
                animationDelay: `${index * 0.05}s`,
                animationFillMode: 'both',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: feature.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Icon size={22} color="white" />
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 6px 0',
              }}>
                {feature.name}
              </h3>
              <p style={{
                fontSize: '13px',
                color: '#64748b',
                margin: 0,
                lineHeight: '1.5',
              }}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
