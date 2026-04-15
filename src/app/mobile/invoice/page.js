'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { InvoiceToastProvider } from '../../(dashboard)/invoice/contexts/InvoiceToastContext';
import {
  HiHome, HiUsers, HiCube, HiDocumentText, HiDocumentDuplicate,
  HiTruck, HiCreditCard, HiReceiptTax, HiChartBar, HiCog,
  HiArrowLeft,
} from 'react-icons/hi';

if (typeof window !== 'undefined') {
  window.__DINEOPEN_MOBILE_EMBED__ = true;
}

/* ── Lazy-load every invoice sub-page ── */
const pages = {
  dashboard: dynamic(() => import('../../(dashboard)/invoice/dashboard/page'), { ssr: false, loading: () => <Spinner /> }),
  customers: dynamic(() => import('../../(dashboard)/invoice/customers/page'), { ssr: false, loading: () => <Spinner /> }),
  items: dynamic(() => import('../../(dashboard)/invoice/items/page'), { ssr: false, loading: () => <Spinner /> }),
  quotes: dynamic(() => import('../../(dashboard)/invoice/quotes/page'), { ssr: false, loading: () => <Spinner /> }),
  invoices: dynamic(() => import('../../(dashboard)/invoice/invoices/page'), { ssr: false, loading: () => <Spinner /> }),
  challans: dynamic(() => import('../../(dashboard)/invoice/challans/page'), { ssr: false, loading: () => <Spinner /> }),
  payments: dynamic(() => import('../../(dashboard)/invoice/payments/page'), { ssr: false, loading: () => <Spinner /> }),
  expenses: dynamic(() => import('../../(dashboard)/invoice/expenses/page'), { ssr: false, loading: () => <Spinner /> }),
  reports: dynamic(() => import('../../(dashboard)/invoice/reports/page'), { ssr: false, loading: () => <Spinner /> }),
  settings: dynamic(() => import('../../(dashboard)/invoice/settings/page'), { ssr: false, loading: () => <Spinner /> }),
  'invoices-new': dynamic(() => import('../../(dashboard)/invoice/invoices/new/page'), { ssr: false, loading: () => <Spinner /> }),
  'quotes-new': dynamic(() => import('../../(dashboard)/invoice/quotes/new/page'), { ssr: false, loading: () => <Spinner /> }),
  'customers-new': dynamic(() => import('../../(dashboard)/invoice/customers/new/page'), { ssr: false, loading: () => <Spinner /> }),
  'items-new': dynamic(() => import('../../(dashboard)/invoice/items/new/page'), { ssr: false, loading: () => <Spinner /> }),
  'payments-new': dynamic(() => import('../../(dashboard)/invoice/payments/new/page'), { ssr: false, loading: () => <Spinner /> }),
  'expenses-new': dynamic(() => import('../../(dashboard)/invoice/expenses/new/page'), { ssr: false, loading: () => <Spinner /> }),
  'challans-new': dynamic(() => import('../../(dashboard)/invoice/challans/new/page'), { ssr: false, loading: () => <Spinner /> }),
};

const navItems = [
  { key: 'dashboard', label: 'Home', icon: HiHome },
  { key: 'customers', label: 'Customers', icon: HiUsers },
  { key: 'items', label: 'Items', icon: HiCube },
  { key: 'quotes', label: 'Quotes', icon: HiDocumentText },
  { key: 'invoices', label: 'Invoices', icon: HiDocumentDuplicate },
  { key: 'challans', label: 'Challans', icon: HiTruck },
  { key: 'payments', label: 'Payments', icon: HiCreditCard },
  { key: 'expenses', label: 'Expenses', icon: HiReceiptTax },
  { key: 'reports', label: 'Reports', icon: HiChartBar },
  { key: 'settings', label: 'Settings', icon: HiCog },
];

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
      <div style={{
        width: 28, height: 28,
        border: '3px solid #e5e7eb', borderTopColor: '#ef4444',
        borderRadius: '50%', animation: 'spin 0.6s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function MobileInvoiceInner() {
  const searchParams = useSearchParams();
  const [authReady, setAuthReady] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  // Read page from URL query
  useEffect(() => {
    const p = searchParams.get('page');
    if (p && pages[p]) setActivePage(p);
  }, [searchParams]);

  // Auth check
  useEffect(() => {
    let attempts = 0;
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      const user = localStorage.getItem('user');
      if (token && user) { setAuthReady(true); return; }
      attempts++;
      if (attempts < 20) setTimeout(checkAuth, 100);
      else setAuthReady(true);
    };
    checkAuth();
  }, []);

  // Intercept Next.js router.push calls from child invoice pages
  // by patching the router for mobile context
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    const interceptNav = (original) => function(state, title, url) {
      if (typeof url === 'string' && url.includes('/invoice/')) {
        // Map /invoice/X to mobile page key
        const match = url.match(/\/invoice\/([a-z-]+)(?:\/new)?/);
        if (match) {
          const section = match[1];
          const isNew = url.includes('/new');
          const pageKey = isNew ? `${section}-new` : section;
          if (pageKey === 'dashboard' || pages[pageKey]) {
            const finalKey = section === 'dashboard' ? 'dashboard' : pageKey;
            setActivePage(finalKey);
            return original.call(window.history, state, title, `/mobile/invoice?page=${finalKey}`);
          }
        }
      }
      return original.call(window.history, state, title, url);
    };

    window.history.pushState = interceptNav(originalPushState);
    window.history.replaceState = interceptNav(originalReplaceState);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const navigate = useCallback((pageKey) => {
    setActivePage(pageKey);
    window.history.replaceState(null, '', `/mobile/invoice?page=${pageKey}`);
  }, []);

  if (!authReady) return <Spinner />;

  const ActiveComponent = pages[activePage] || pages.dashboard;
  const isSubPage = activePage.includes('-new');
  const parentPage = isSubPage ? activePage.split('-')[0] : null;

  return (
    <InvoiceToastProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        {/* ── Compact header: back + nav chips ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 40,
          backgroundColor: 'white',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          {/* Back / Refresh row - only for sub-pages */}
          {isSubPage && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderBottom: '1px solid #f5f5f5'
            }}>
              <button
                onClick={() => navigate(parentPage + 's')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, color: '#2563eb', padding: '4px 0'
                }}
              >
                <HiArrowLeft size={14} /> Back
              </button>
            </div>
          )}

          {/* Nav chips - scrollable */}
          {!isSubPage && (
            <div style={{
              display: 'flex', gap: '3px', padding: '8px 10px',
              overflowX: 'auto', WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none', msOverflowStyle: 'none',
            }}>
              <style>{`.mobile-inv-nav::-webkit-scrollbar { display: none; }`}</style>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.key)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 12px', borderRadius: '20px', border: 'none',
                      backgroundColor: isActive ? '#2563eb' : '#f3f4f6',
                      color: isActive ? 'white' : '#4b5563',
                      fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Icon style={{ width: 13, height: 13 }} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Page content ── */}
        <div style={{ padding: '12px' }}>
          <ActiveComponent />
        </div>
      </div>
    </InvoiceToastProvider>
  );
}

export default function MobileInvoicePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <MobileInvoiceInner />
    </Suspense>
  );
}
