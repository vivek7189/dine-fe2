'use client';

import Link from 'next/link';
import CommonHeader from '../../components/CommonHeader';
import Footer from '../../components/Footer';
import { FaArrowRight, FaShoppingCart, FaCalendarAlt, FaTv, FaUsers, FaTruck, FaWhatsapp, FaChartLine, FaBoxes, FaQrcode, FaCreditCard, FaMobile, FaBell, FaReceipt, FaClipboardList, FaCog } from 'react-icons/fa';

export default function FeaturesClient() {
  const coreFeatures = [
    { name: 'Online Ordering', href: '/features/online-ordering', desc: 'Accept orders directly from your website', icon: FaShoppingCart },
    { name: 'Table Reservation', href: '/features/table-reservation', desc: 'Let customers book tables online', icon: FaCalendarAlt },
    { name: 'Kitchen Display System', href: '/features/kitchen-display-system', desc: 'Digital KDS for kitchen efficiency', icon: FaTv },
    { name: 'Staff Management', href: '/features/staff-management', desc: 'Manage staff, shifts & permissions', icon: FaUsers },
    { name: 'Delivery Management', href: '/features/delivery-management', desc: 'Track deliveries & drivers', icon: FaTruck },
    { name: 'WhatsApp Ordering', href: '/features/whatsapp-ordering', desc: 'Accept orders via WhatsApp', icon: FaWhatsapp },
  ];

  const moreFeatures = [
    { name: 'Analytics & Reports', href: '/analytics', desc: 'Sales reports, insights & trends', icon: FaChartLine },
    { name: 'Inventory Management', href: '/inventory', desc: 'Track stock, recipes & wastage', icon: FaBoxes },
    { name: 'QR Menu & Ordering', href: '/products/qr-ordering', desc: 'Contactless dining experience', icon: FaQrcode },
    { name: 'Payment Integration', href: '/products/payments', desc: 'Accept all payment methods', icon: FaCreditCard },
    { name: 'Mobile POS', href: '/products/mobile-pos', desc: 'Tableside ordering & billing', icon: FaMobile },
    { name: 'Loyalty & Rewards', href: '/loyalty', desc: 'Customer loyalty programs', icon: FaBell },
    { name: 'GST Billing', href: '/restaurant-pos-software-india', desc: 'Compliant GST invoices', icon: FaReceipt },
    { name: 'KOT Management', href: '/products/kot', desc: 'Kitchen order tickets', icon: FaClipboardList },
    { name: 'Multi-location', href: '/products/multi-restaurant', desc: 'Manage multiple outlets', icon: FaCog },
  ];

  return (
    <>
      <CommonHeader />
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', paddingTop: '80px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', lineHeight: 1.2 }}>
              Powerful Features for Modern Restaurants
            </h1>
            <p style={{ fontSize: '22px', opacity: 0.95, marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px' }}>
              Everything you need to run your restaurant efficiently - from online ordering to kitchen management, all in one platform.
            </p>
            <Link
              href="https://app.dineopen.com/register"
              style={{ display: 'inline-block', padding: '18px 36px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}
            >
              Start Free Trial
            </Link>
          </div>
        </div>

        {/* Core Features */}
        <div style={{ padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              Core Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Essential tools to transform your restaurant operations
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {coreFeatures.map((feature, idx) => (
                <Link key={idx} href={feature.href} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '28px', backgroundColor: 'white', borderRadius: '16px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                  <div style={{ width: '60px', height: '60px', backgroundColor: '#fef2f2', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <feature.icon style={{ fontSize: '26px', color: '#ef4444' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '6px' }}>{feature.name}</div>
                    <div style={{ fontSize: '15px', color: '#6b7280' }}>{feature.desc}</div>
                  </div>
                  <FaArrowRight style={{ color: '#ef4444', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* More Features */}
        <div style={{ backgroundColor: 'white', padding: '80px 20px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: '16px' }}>
              More Features
            </h2>
            <p style={{ fontSize: '18px', color: '#6b7280', textAlign: 'center', marginBottom: '48px' }}>
              Additional tools to enhance your restaurant
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {moreFeatures.map((feature, idx) => (
                <Link key={idx} href={feature.href} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px', textDecoration: 'none', border: '1px solid #e5e7eb', transition: 'all 0.2s' }}>
                  <div style={{ width: '44px', height: '44px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #e5e7eb' }}>
                    <feature.icon style={{ fontSize: '18px', color: '#ef4444' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '2px' }}>{feature.name}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{feature.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: '80px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px' }}>
              Ready to Get Started?
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, marginBottom: '32px' }}>
              Try all features free for 30 days. No credit card required.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="https://app.dineopen.com/register"
                style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'white', color: '#ef4444', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '8px', fontWeight: '700', textDecoration: 'none' }}
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
