'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { DineAIProvider } from '../../contexts/DineAIContext';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import DineAIButton from '../../components/dineai/DineAIButton';
import BulkMenuUpload from '../../components/BulkMenuUpload';
import OrderNotificationBell from '../../components/OrderNotificationBell';
import OrderNotificationToast from '../../components/OrderNotificationToast';
import { useIdlePrefetch } from '../../hooks/useIdlePrefetch';
import { useAutoPrint } from '../../hooks/useAutoPrint';
import { useOrderNotifications } from '../../hooks/useOrderNotifications';
import { isWeb, isTauri, isElectron } from '../../utils/platform';
import { isAutoUpdateEnabled, checkForUpdates, restartApp } from '../../utils/autoUpdater';
import apiClient from '../../lib/api';
import { ROUTE_TO_ACCESS_KEY, ALWAYS_ACCESSIBLE } from '../../lib/pageAccessConfig';
import { FaCloudUploadAlt, FaArrowRight, FaUtensils } from 'react-icons/fa';
import { DineBotProvider } from '../../components/DineBotProvider';

function checkRouteAccess(pathname, user, pageAccess) {
  if (!user || !user.role) return false;

  // Owner, admin, and waiter bypass pageAccess (consistent with Sidebar)
  if (['owner', 'admin', 'waiter'].includes(user.role)) return true;

  // Always-accessible pages
  if (ALWAYS_ACCESSIBLE.some(p => pathname === p || pathname.startsWith(p + '/'))) return true;

  // Find the matching route access key
  const routeSegment = '/' + pathname.split('/').filter(Boolean)[0];
  const accessKey = ROUTE_TO_ACCESS_KEY[routeSegment];
  if (!accessKey) return true; // Unknown routes default to accessible (profile, etc.)

  if (!pageAccess) return false;

  const accessValue = pageAccess[accessKey];
  if (typeof accessValue === 'object' && accessValue !== null) {
    return Object.values(accessValue).some(Boolean);
  }
  return !!accessValue;
}

function DashboardLayoutContent({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [notificationOrderTypes, setNotificationOrderTypes] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [nativePrintSettings, setNativePrintSettings] = useState(null);
  const [hasDefaultMenu, setHasDefaultMenu] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  // Check if current page is dashboard (POS) — these pages hide the sidebar for full-width billing panel
  const isDashboardPage = pathname === '/dashboard' || pathname === '/dashboard/bar';

  // ─── Order Notifications (global Pusher listener) ───
  const {
    notifications: orderNotifications,
    unreadCount: orderUnreadCount,
    toasts: orderToasts,
    soundEnabled: orderSoundEnabled,
    markAsRead: markOrderRead,
    markAllRead: markAllOrdersRead,
    clearAll: clearAllOrders,
    dismissToast: dismissOrderToast,
    toggleSound: toggleOrderSound,
  } = useOrderNotifications(selectedRestaurantId, notificationOrderTypes);

  // Broadcast unread count to child pages (dashboard, home) via CustomEvent
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('orderUnreadCountChanged', { detail: { count: orderUnreadCount } }));
  }, [orderUnreadCount]);

  // Listen for mark-all-read from child pages (dashboard/home badge clicks)
  useEffect(() => {
    const handler = () => markAllOrdersRead();
    window.addEventListener('markAllOrderNotificationsRead', handler);
    return () => window.removeEventListener('markAllOrderNotificationsRead', handler);
  }, [markAllOrdersRead]);

  // Prefetch dashboard data when browser is idle (skips if already on /dashboard)
  useIdlePrefetch(pathname);

  // Fetch print settings for native auto-print (no-op on web)
  useEffect(() => {
    if (isWeb() || !selectedRestaurantId) return;
    apiClient.getPrintSettings(selectedRestaurantId)
      .then(res => setNativePrintSettings(res?.printSettings || res))
      .catch(() => {});
  }, [selectedRestaurantId]);

  // Auto-print on native platforms (Capacitor/Tauri) — no-op on web
  useAutoPrint(selectedRestaurantId, nativePrintSettings);

  // Auto-update check on Tauri desktop — runs once on mount after 5s delay
  const [updateReady, setUpdateReady] = useState(null);
  useEffect(() => {
    if ((!isTauri() && !isElectron()) || !isAutoUpdateEnabled()) return;
    const timer = setTimeout(() => {
      checkForUpdates({
        autoInstall: true,
        onUpdateFound: ({ version }) => {
          console.log('[AutoUpdater] Update found:', version);
        },
        onUpToDate: () => {
          console.log('[AutoUpdater] App is up to date');
        },
        onError: (err) => {
          console.warn('[AutoUpdater] Check failed:', err);
        },
      }).then((result) => {
        if (result?.installed) {
          setUpdateReady(result.version);
        }
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Route guard: check if user has permission to access current page
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.replace('/login');
        return;
      }
      const user = JSON.parse(userData);
      if (!user || !user.role) {
        router.replace('/login');
        return;
      }

      // For roles that need pageAccess, check permissions
      if (!['owner', 'admin', 'waiter'].includes(user.role)) {
        const cached = localStorage.getItem('navPageAccess');
        const pageAccess = cached ? JSON.parse(cached) : null;
        if (pageAccess && !checkRouteAccess(pathname, user, pageAccess)) {
          router.replace('/home');
          return;
        }

        // Async: re-check with fresh data from API (covers cache staleness)
        apiClient.getUserPageAccess?.()
          .then(res => {
            if (res?.pageAccess) {
              localStorage.setItem('navPageAccess', JSON.stringify(res.pageAccess));
              if (!checkRouteAccess(pathname, user, res.pageAccess)) {
                router.replace('/home');
              }
            }
          })
          .catch(() => {}); // Don't block on API failure
      }
    } catch {
      // On error, allow access (don't lock users out due to parsing errors)
    }
    setAccessChecked(true);
  }, [pathname, router]);

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

  // Check if restaurant has default/demo menu
  const checkDefaultMenu = (restId) => {
    if (!restId) return;
    if (sessionStorage.getItem(`demoMenuDismissed_${restId}`) === 'true') return;
    apiClient.getRestaurants()
      .then(res => {
        const rest = res?.restaurants?.find(r => r.id === restId);
        // Only set true here; client-side demo mode is handled via demoModeActivated event
        if (rest?.hasDefaultMenu) setHasDefaultMenu(true);
      })
      .catch(() => {});
  };

  useEffect(() => {
    checkDefaultMenu(selectedRestaurantId);
  }, [selectedRestaurantId]);

  // Re-check on pathname change (covers fresh login redirect to dashboard)
  useEffect(() => {
    if (selectedRestaurantId) {
      checkDefaultMenu(selectedRestaurantId);
    } else {
      // If restaurantId not set yet (just logged in), retry after short delay
      const timer = setTimeout(() => {
        const savedId = localStorage.getItem('selectedRestaurantId');
        if (savedId) {
          setSelectedRestaurantId(savedId);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Listen for menu uploaded event to dismiss banner
  useEffect(() => {
    const handleMenuUploaded = () => {
      setHasDefaultMenu(false);
      sessionStorage.setItem(`demoMenuDismissed_${selectedRestaurantId}`, 'true');
    };
    // Listen for demo mode activated (dashboard loaded client-side demo menu)
    const handleDemoMode = () => {
      setHasDefaultMenu(true);
    };
    window.addEventListener('menuUploaded', handleMenuUploaded);
    window.addEventListener('demoModeActivated', handleDemoMode);
    return () => {
      window.removeEventListener('menuUploaded', handleMenuUploaded);
      window.removeEventListener('demoModeActivated', handleDemoMode);
    };
  }, [selectedRestaurantId]);

  // Get selected restaurant ID from localStorage
  useEffect(() => {
    const getSelectedRestaurant = () => {
      const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
      if (savedRestaurantId) {
        setSelectedRestaurantId(savedRestaurantId);
      }
      // Load notification order types from restaurant settings
      try {
        const restaurant = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
        const types = restaurant?.orderSettings?.notificationOrderTypes;
        setNotificationOrderTypes(types && types.length > 0 ? types : ['online']);
      } catch { setNotificationOrderTypes(['online']); }
    };

    getSelectedRestaurant();

    // Listen for restaurant changes
    const handleRestaurantChange = (event) => {
      console.log('Restaurant changed in layout:', event.detail);
      setHasDefaultMenu(false); // Reset on switch; checkDefaultMenu or demoModeActivated will set true if needed
      setSelectedRestaurantId(event.detail.restaurantId);
      // Update notification order types from new restaurant
      try {
        const restaurant = event.detail?.restaurant || JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
        const types = restaurant?.orderSettings?.notificationOrderTypes;
        setNotificationOrderTypes(types && types.length > 0 ? types : ['online']);
      } catch { setNotificationOrderTypes(['online']); }
    };

    window.addEventListener('restaurantChanged', handleRestaurantChange);

    return () => {
      window.removeEventListener('restaurantChanged', handleRestaurantChange);
    };
  }, []);

  return (
    <CurrencyProvider>
    <DineBotProvider>
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
                height: '100vh',
                paddingTop: isMobile ? 'var(--sat, 0px)' : '0',
              }}
            >
              {/* Auto-update ready banner (Tauri only) */}
              {updateReady && (
                <div style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: '1px solid #3b82f6',
                }}>
                  <span style={{ fontSize: '13px', color: '#1e3a5f', fontWeight: '600', flex: 1 }}>
                    Update v{updateReady} is ready. Restart to apply.
                  </span>
                  <button
                    onClick={() => restartApp()}
                    style={{
                      padding: '6px 14px', backgroundColor: '#3b82f6', color: 'white',
                      border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Restart Now
                  </button>
                  <button
                    onClick={() => setUpdateReady(null)}
                    style={{
                      padding: '6px 14px', backgroundColor: 'transparent', color: '#3b82f6',
                      border: '1px solid #3b82f6', borderRadius: '8px', fontWeight: '600', fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Later
                  </button>
                </div>
              )}

              {/* Demo menu banner — show on all pages except /menu */}
              {hasDefaultMenu && pathname !== '/menu' && (
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flexWrap: 'wrap',
                  borderBottom: '1px solid #f59e0b',
                }}>
                  <FaUtensils size={16} color="#92400e" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#78350f', fontWeight: '600', flex: 1, minWidth: '200px' }}>
                    You&apos;re viewing a sample menu. Upload your own to get started
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => setShowBulkUpload(true)}
                      style={{
                        padding: '6px 14px', backgroundColor: '#ef4444', color: 'white',
                        border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                        boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
                      }}
                    >
                      <FaCloudUploadAlt size={13} /> Upload Menu
                    </button>
                    <button
                      onClick={() => router.push('/menu')}
                      style={{
                        padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.7)', color: '#92400e',
                        border: '1px solid #f59e0b', borderRadius: '8px', fontWeight: '600', fontSize: '12px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                      }}
                    >
                      Go to Menu <FaArrowRight size={10} />
                    </button>
                  </div>
                </div>
              )}

              <div key={pathname} className="dashboard-page-content" style={{ width: '100%', minHeight: '100%' }}>
                {accessChecked ? children : null}
              </div>
            </main>

            {/* Order Notification Bell — fixed top-right, only on home & dashboard */}
            {(pathname === '/home' || pathname === '/dashboard') && (
            <div style={{
              position: 'fixed',
              top: '14px',
              right: '20px',
              zIndex: 9998,
            }}>
              <OrderNotificationBell
                notifications={orderNotifications}
                unreadCount={orderUnreadCount}
                soundEnabled={orderSoundEnabled}
                onMarkAsRead={markOrderRead}
                onMarkAllRead={markAllOrdersRead}
                onClearAll={clearAllOrders}
                onToggleSound={toggleOrderSound}
                hideButton={pathname === '/dashboard'}
              />
            </div>
            )}

            {/* Order Notification Toasts */}
            <OrderNotificationToast
              toasts={orderToasts}
              onDismiss={dismissOrderToast}
            />

            {/* DineAI Floating Button */}
            <DineAIButton />

            {/* BulkMenuUpload modal — portal to body */}
            {typeof document !== 'undefined' && createPortal(
              <BulkMenuUpload
                isOpen={showBulkUpload}
                onClose={() => setShowBulkUpload(false)}
                restaurantId={selectedRestaurantId}
                onMenuItemsAdded={() => {
                  setHasDefaultMenu(false);
                  sessionStorage.setItem(`demoMenuDismissed_${selectedRestaurantId}`, 'true');
                  setShowBulkUpload(false);
                  window.dispatchEvent(new CustomEvent('menuUploaded'));
                  // Reload current page to reflect new menu
                  window.location.reload();
                }}
                currentMenuItems={[]}
              />,
              document.body
            )}
          </div>
      </DineAIProvider>
    </DineBotProvider>
    </CurrencyProvider>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <DashboardLayoutContent>{children}</DashboardLayoutContent>
  );
}