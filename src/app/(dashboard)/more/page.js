'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaRobot,
  FaPhoneAlt,
  FaWhatsapp,
  FaBuilding,
  FaHotel,
  FaBook,
  FaGoogle,
  FaDoorOpen,
  FaParking,
  FaCalendarCheck,
  FaCalendarAlt,
  FaCashRegister,
  FaShareAlt,
  FaCommentDots,
  FaClock,
  FaChartPie,
  FaPrint,
  FaUsers,
  FaTag,
  FaCut,
  FaGift,
  FaHistory,
  FaSearch,
  FaTimes,
} from 'react-icons/fa';
import { getCachedCalendarAccess } from '../../../lib/calendar';

const features = [
  {
    id: 'my-pay',
    name: 'My Pay',
    description: 'Your payslips, advances, bonuses and appraisals',
    icon: FaCashRegister,
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    href: '/my-pay',
  },
  {
    id: 'calendar',
    name: 'Event Calendar',
    description: 'Festivals, public holidays and your own events — plan for busy days',
    icon: FaCalendarCheck,
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    href: '/calendar',
  },
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
    id: 'shifts-cash',
    name: 'Shifts & Cash',
    description: 'Per-staff shift tracking, cash drawer management, and reports',
    icon: FaCashRegister,
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    href: '/shifts-cash',
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
    id: 'hotel-pms',
    name: 'Hotel Suite',
    description: 'New front-desk PMS — reservations, folios, rate plans, night audit & more',
    icon: FaHotel,
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    href: '/hotel/pms/home',
  },
  {
    id: 'hotel',
    name: 'Hotel PMS (legacy)',
    description: 'Original hotel property management with rooms, check-in/out, and billing',
    icon: FaBuilding,
    gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    href: '/hotel',
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
  {
    id: 'feedback',
    name: 'Feedback',
    description: 'Collect and manage customer feedback and suggestions',
    icon: FaCommentDots,
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    href: '/feedback',
  },
  {
    id: 'hourly-report',
    name: 'Hourly Sales Report',
    description: 'Analyze sales by hour — breakfast, lunch, dinner patterns across outlets',
    icon: FaClock,
    gradient: 'linear-gradient(135deg, #2563eb, #6366f1)',
    href: '/hourly-report',
  },
  {
    id: 'menu-engineering',
    name: 'Product Cost & Margin',
    description: 'Sales vs recipe cost (COGS), margin & margin% per item — Stars, Plow Horses, Puzzles, Dogs',
    icon: FaChartPie,
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    href: '/menu-engineering',
  },
  {
    id: 'recipe-cost-sheet',
    name: 'Recipe Cost Sheet',
    description: 'Export every recipe with its ingredients and cost (Excel / CSV) — cost per serving',
    icon: FaBook,
    gradient: 'linear-gradient(135deg, #059669, #10b981)',
    href: '/inventory?tab=recipes',
  },
  {
    id: 'reprint-log',
    name: 'Reprint Check Log',
    description: 'Audit trail for bill reprints — track who reprinted and when',
    icon: FaPrint,
    gradient: 'linear-gradient(135deg, #f97316, #ef4444)',
    href: '/reprint-log',
  },
  {
    id: 'staff-sales',
    name: 'Staff Sales Report',
    description: 'Per-staff revenue, order count, average ticket, and tips earned',
    icon: FaUsers,
    gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    href: '/staff-sales',
  },
  {
    id: 'promotion-report',
    name: 'Promotion Report',
    description: 'Track offer usage, discount amounts, and promotion effectiveness',
    icon: FaTag,
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    href: '/promotion-report',
  },
  {
    id: 'split-bills',
    name: 'Split Bills Report',
    description: 'Analyze split payment orders — methods, frequency, and patterns',
    icon: FaCut,
    gradient: 'linear-gradient(135deg, #14b8a6, #10b981)',
    href: '/split-bills',
  },
  {
    id: 'comp-report',
    name: 'Comp Report',
    description: 'Track complimentary orders — value, reasons, and approvals',
    icon: FaGift,
    gradient: 'linear-gradient(135deg, #ef4444, #ec4899)',
    href: '/comp-report',
  },
  {
    id: 'audit-trail',
    name: 'Audit Trail',
    description: 'Chronological log of order edits, cancellations, voids, and reprints',
    icon: FaHistory,
    gradient: 'linear-gradient(135deg, #475569, #1e293b)',
    href: '/audit-trail',
  },
];

export default function MorePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [notAllowedPages, setNotAllowedPages] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
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

  // My Pay: only when the person's role has it (restaurants with roles on)
  let myPayAllowed = false;
  try {
    const rp = JSON.parse(localStorage.getItem('navRolePermissions') || 'null');
    myPayAllowed = !!(rp && rp.rid === localStorage.getItem('selectedRestaurantId') && rp.permissions && rp.permissions['page.myPay'] === 'allow');
  } catch {}
  // Event Calendar: hide when the calendar API refused this person (cached by Sidebar / Home).
  let calendarDenied = false;
  try {
    const role = JSON.parse(localStorage.getItem('user') || '{}').role;
    calendarDenied = !['owner', 'admin', 'manager'].includes(role)
      && getCachedCalendarAccess(localStorage.getItem('selectedRestaurantId'))?.state === 'denied';
  } catch {}
  const allowedFeatures = features.filter(f => !notAllowedPages.includes(f.id) && (f.id !== 'my-pay' || myPayAllowed) && (f.id !== 'calendar' || !calendarDenied));
  // Search: every typed word must appear in the card's name or description ("staff sales", "audit")
  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const visibleFeatures = words.length
    ? allowedFeatures.filter(f => {
        const text = `${f.name} ${f.description} ${f.id}`.toLowerCase();
        return words.every(w => text.includes(w));
      })
    : allowedFeatures;

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
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        <div>
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
        <div style={{ position: 'relative', width: isMobile ? '100%' : '340px' }}>
          <FaSearch size={14} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Escape') setSearch(''); }}
            placeholder="Search features — audit, reprint, staff sales…"
            aria-label="Search features"
            autoFocus={!isMobile}
            style={{
              width: '100%',
              padding: '11px 38px 11px 38px',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              background: 'white',
              fontSize: '14px',
              color: '#0f172a',
              outline: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}
            >
              <FaTimes size={13} color="#94a3b8" />
            </button>
          )}
        </div>
      </div>

      {visibleFeatures.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: '#64748b', fontSize: '14px' }}>
          No features match &ldquo;{search.trim()}&rdquo;.{' '}
          <button type="button" onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
            Show all
          </button>
        </div>
      )}

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
