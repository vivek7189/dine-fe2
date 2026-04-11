'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { DineAIProvider } from '../../contexts/DineAIContext';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import DineAIButton from '../../components/dineai/DineAIButton';
import { useIdlePrefetch } from '../../hooks/useIdlePrefetch';

function DashboardLayoutContent({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Check if current page is dashboard
  const isDashboardPage = pathname === '/dashboard' || pathname === '/dashboard/bar';

  // Prefetch dashboard data when browser is idle (skips if already on /dashboard)
  useIdlePrefetch(pathname);

  // Check if device is mobile and set client-side flag
  useEffect(() => {
    setIsClient(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Listen for sidebar collapse changes
  useEffect(() => {
    const checkSidebarState = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setSidebarCollapsed(collapsed);
    };

    checkSidebarState();

    // Listen for storage changes
    window.addEventListener('storage', checkSidebarState);

    // Custom event for same-window updates
    const handleSidebarToggle = () => checkSidebarState();
    window.addEventListener('sidebarToggle', handleSidebarToggle);

    return () => {
      window.removeEventListener('storage', checkSidebarState);
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);

  // Get selected restaurant ID from localStorage
  useEffect(() => {
    const getSelectedRestaurant = () => {
      const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
      if (savedRestaurantId) {
        setSelectedRestaurantId(savedRestaurantId);
      }
    };

    getSelectedRestaurant();

    // Listen for restaurant changes
    const handleRestaurantChange = (event) => {
      console.log('Restaurant changed in layout:', event.detail);
      setSelectedRestaurantId(event.detail.restaurantId);
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);

    return () => {
      window.removeEventListener('restaurantChanged', handleRestaurantChange);
    };
  }, []);

  return (
    <CurrencyProvider>
      <DineAIProvider>
        <style>{`
          @keyframes pageFadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: none; }
          }
          .dashboard-page-content {
            animation: pageFadeIn 0.25s ease-out forwards;
          }
        `}</style>
        <div style={{
            display: 'flex',
            height: '100vh',
            backgroundColor: '#f9fafb',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Sidebar Navigation */}
            <Sidebar isDashboardPage={isDashboardPage} />

            {/* Main Content with dynamic width based on sidebar */}
            <main
              className="overflow-auto transition-all duration-300"
              style={{
                backgroundColor: '#f9fafb',
                width: (isMobile || isDashboardPage) ? '100%' : `calc(100% - ${sidebarCollapsed ? '70px' : '240px'})`,
                marginLeft: (isMobile || isDashboardPage) ? '0' : (sidebarCollapsed ? '70px' : '240px'),
                height: '100vh'
              }}
            >
              <div key={pathname} className="dashboard-page-content" style={{ width: '100%', minHeight: '100%' }}>
                {children}
              </div>
            </main>

            {/* DineAI Floating Button */}
            <DineAIButton />
          </div>
      </DineAIProvider>
    </CurrencyProvider>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <DashboardLayoutContent>{children}</DashboardLayoutContent>
  );
}