'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiHome, HiUsers, HiCube, HiDocumentText, HiDocumentDuplicate,
  HiTruck, HiCreditCard, HiReceiptTax, HiChartBar, HiCog,
} from 'react-icons/hi';

const navItems = [
  { label: 'Home', href: '/invoice/dashboard', icon: HiHome },
  { label: 'Customers', href: '/invoice/customers', icon: HiUsers },
  { label: 'Items', href: '/invoice/items', icon: HiCube },
  { label: 'Quotes', href: '/invoice/quotes', icon: HiDocumentText },
  { label: 'Invoices', href: '/invoice/invoices', icon: HiDocumentDuplicate },
  { label: 'Challans', href: '/invoice/challans', icon: HiTruck },
  { label: 'Payments', href: '/invoice/payments', icon: HiCreditCard },
  { label: 'Expenses', href: '/invoice/expenses', icon: HiReceiptTax },
  { label: 'Reports', href: '/invoice/reports', icon: HiChartBar },
  { label: 'Settings', href: '/invoice/settings', icon: HiCog },
];

export default function InvoiceTopNav() {
  const pathname = usePathname();
  const scrollRef = useRef(null);
  const activeRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const isActive = (href) => {
    if (href === '/invoice/dashboard') return pathname === '/invoice/dashboard' || pathname === '/invoice';
    return pathname.startsWith(href);
  };

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }, [pathname]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const checkScroll = () => {
      setShowLeftFade(el.scrollLeft > 4);
      setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    };
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => { el.removeEventListener('scroll', checkScroll); window.removeEventListener('resize', checkScroll); };
  }, []);

  return (
    <div style={{ position: 'relative', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fff' }}>
      {/* Left fade */}
      {showLeftFade && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '32px',
          background: 'linear-gradient(to right, white, transparent)', zIndex: 2, pointerEvents: 'none',
        }} />
      )}
      {/* Right fade */}
      {showRightFade && (
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '32px',
          background: 'linear-gradient(to left, white, transparent)', zIndex: 2, pointerEvents: 'none',
        }} />
      )}

      <nav
        ref={scrollRef}
        style={{
          display: 'flex', alignItems: 'center', gap: '2px', padding: '0 16px',
          overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}
      >
        <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              ref={active ? activeRef : null}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '8px 12px', whiteSpace: 'nowrap',
                fontSize: '13px', fontWeight: active ? 700 : 500,
                color: active ? '#2563eb' : '#6b7280',
                borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
                textDecoration: 'none', flexShrink: 0,
                transition: 'color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = '#111827'; e.currentTarget.style.backgroundColor = '#f9fafb'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              <Icon style={{ width: '15px', height: '15px', flexShrink: 0 }} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
