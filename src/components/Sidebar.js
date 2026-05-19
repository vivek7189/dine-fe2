'use client';

import { useState, useEffect } from 'react';
import {
  FaHome,
  FaUtensils,
  FaChartBar,
  FaUsers,
  FaCog,
  FaClipboardList,
  FaChair,
  FaSignOutAlt,
  FaPrint,
  FaCreditCard,
  FaBoxes,
  FaBuilding,
  FaRobot,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaUser,
  FaFire,
  FaMobileAlt,
  FaTag,
  FaCashRegister,
  FaCalendarAlt,
  FaFileInvoice,
  FaGoogle,
  FaBook,
  FaUserClock,
  FaDoorOpen,
  FaPhoneAlt,
  FaParking,
  FaCalendarCheck,
  FaWhatsapp,
  FaThLarge,
  FaCommentDots
} from 'react-icons/fa';
import { BiRestaurant } from 'react-icons/bi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import apiClient from '../lib/api';
import { t } from '../lib/i18n';
import { performLogout } from '../lib/logout';
import { useLoading } from '../contexts/LoadingContext';
import { isElectron } from '../utils/platform';

export default function Sidebar({ isDashboardPage = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { startLoading } = useLoading();
  const [electronVersion, setElectronVersion] = useState(null);

  useEffect(() => {
    if (isElectron() && window.electronAPI?.getVersion) {
      window.electronAPI.getVersion().then(v => setElectronVersion(v)).catch(() => {});
    }
  }, []);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize state from localStorage immediately (synchronous) to prevent loading flicker
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  });

  const [pageAccess, setPageAccess] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('navPageAccess');
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  });

  const [notAllowedPages, setNotAllowedPages] = useState(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('navNotAllowedPages');
      return cached ? JSON.parse(cached) : [];
    }
    return [];
  });

  // Navigation is ready immediately if we have cached data
  const [isNavigationReady, setIsNavigationReady] = useState(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // For staff users, check if we have cached pageAccess
        if (!['owner', 'admin', 'waiter'].includes(parsedUser.role)) {
          return localStorage.getItem('navPageAccess') !== null;
        }
        // For owners/waiters, just need user data
        return true;
      }
    }
    return false;
  });

  // Fetch fresh data in background (only once on mount, not on every route change)
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);

          // Fetch page access and notAllowedPages in background
          try {
            const accessData = await apiClient.getUserPageAccess();
            if (parsedUser.role && parsedUser.role !== 'owner' && parsedUser.role !== 'admin') {
              setPageAccess(accessData.pageAccess);
              localStorage.setItem('navPageAccess', JSON.stringify(accessData.pageAccess));
            }
            // Set and cache notAllowedPages for all users
            const notAllowed = accessData.notAllowedPages || [];
            setNotAllowedPages(notAllowed);
            localStorage.setItem('navNotAllowedPages', JSON.stringify(notAllowed));
          } catch (error) {
            console.error('Error fetching page access:', error);
            if (parsedUser.role && parsedUser.role !== 'owner' && parsedUser.role !== 'admin') {
              const defaultAccess = {
                dashboard: true,
                history: true,
                tables: true,
                menu: true,
                analytics: false,
                inventory: false,
                kot: false,
                admin: false
              };
              setPageAccess(defaultAccess);
              localStorage.setItem('navPageAccess', JSON.stringify(defaultAccess));
            }
          }
          setIsNavigationReady(true);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []); // Only run once on mount

  // Load restaurant data once on mount (not on every pathname change)
  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const parsedUser = JSON.parse(userData);

        // Load cached restaurant data first
        const savedRestaurant = localStorage.getItem('selectedRestaurant');
        if (savedRestaurant) {
          try {
            const restaurant = JSON.parse(savedRestaurant);
            setSelectedRestaurant(restaurant);
          } catch (error) {
            console.error('Error parsing saved restaurant:', error);
          }
        }

        if (parsedUser.restaurantId && ['waiter', 'manager', 'employee', 'cashier', 'sales'].includes(parsedUser.role)) {
          // Non-admin staff: use their single assigned restaurant from login data
          if (parsedUser.restaurant) {
            setSelectedRestaurant(parsedUser.restaurant);
          }
        } else if (parsedUser.role === 'owner' || parsedUser.role === 'customer' || parsedUser.role === 'admin') {
          // Owner, customer, and admin staff: fetch from API (admin can have multiple restaurants)
          try {
            const token = localStorage.getItem('authToken');
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
            const response = await fetch(`${backendUrl}/api/restaurants`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.restaurants && data.restaurants.length > 0) {
                setAllRestaurants(data.restaurants);
                const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
                const defaultId = data.defaultRestaurantId;
                const resolved = data.restaurants.find(r => r.id === savedRestaurantId) ||
                                (defaultId ? data.restaurants.find(r => r.id === defaultId) : null) ||
                                data.restaurants[0];
                setSelectedRestaurant(resolved);
                // Sync localStorage
                localStorage.setItem('selectedRestaurantId', resolved.id);
                localStorage.setItem('selectedRestaurant', JSON.stringify(resolved));
              }
            }
          } catch (error) {
            console.error('Error fetching restaurant data:', error);
          }
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
      }
    };
    loadRestaurantData();

    // Listen for restaurant switch events (from Navigation dropdown)
    const handleRestaurantSwitch = () => {
      const saved = localStorage.getItem('selectedRestaurant');
      if (saved) {
        try { setSelectedRestaurant(JSON.parse(saved)); } catch {}
      }
    };
    window.addEventListener('restaurantChanged', handleRestaurantSwitch);

    // Listen for features toggle updates from admin page
    const handleFeaturesUpdated = (e) => {
      const updated = e.detail?.notAllowedPages;
      if (Array.isArray(updated)) {
        setNotAllowedPages(updated);
      } else {
        try {
          const cached = localStorage.getItem('navNotAllowedPages');
          setNotAllowedPages(cached ? JSON.parse(cached) : []);
        } catch {}
      }
    };
    window.addEventListener('featuresUpdated', handleFeaturesUpdated);

    return () => {
      window.removeEventListener('restaurantChanged', handleRestaurantSwitch);
      window.removeEventListener('featuresUpdated', handleFeaturesUpdated);
    };
  }, []);

  const handleNavigation = (href, e) => {
    e.preventDefault();

    // If already on the same page, just close the menu without loading
    if (pathname === href) {
      setIsMobileMenuOpen(false);
      return;
    }

    // Navigate instantly — no loading overlay, no delay
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setIsMobileMenuOpen(false);
    performLogout();
  };

  const getAllNavItems = () => [
    // --- Home (landing page for all roles) ---
    { id: 'home', name: t('nav.home'), icon: FaHome, href: '/home', color: '#6366f1', roles: ['owner', 'admin', 'manager', 'waiter', 'employee', 'cashier', 'sales'] },
    // --- Core POS ---
    { id: 'pos', name: selectedRestaurant?.businessType === 'bar' ? t('nav.barPOS') : t('nav.dashboardBilling'), icon: FaCashRegister, href: selectedRestaurant?.businessType === 'bar' ? '/dashboard/bar' : '/dashboard', color: '#ef4444', roles: ['owner', 'admin', 'manager', 'waiter', 'cashier'] },
    { id: 'orders', name: t('nav.history'), icon: FaClipboardList, href: '/orderhistory', color: '#f59e0b', roles: ['owner', 'admin', 'manager', 'waiter', 'cashier'] },
    { id: 'kot', name: t('nav.kot'), icon: FaFire, href: '/kot', color: '#f97316', roles: ['owner', 'admin', 'manager', 'waiter'] },
    { id: 'tables', name: t('nav.tables'), icon: FaChair, href: '/tables', color: '#3b82f6', roles: ['owner', 'admin', 'manager', 'waiter'] },
    // --- Management ---
    { id: 'menu', name: t('nav.menu'), icon: FaUtensils, href: '/menu', color: '#10b981', roles: ['owner', 'admin', 'manager'] },
    { id: 'inventory', name: t('nav.inventory'), icon: FaBoxes, href: '/inventory', color: '#059669', roles: ['owner', 'admin', 'manager'] },
    { id: 'customers', name: t('nav.customers'), icon: FaUsers, href: '/customers', color: '#8b5cf6', roles: ['owner', 'admin', 'manager'] },
    { id: 'feedback', name: 'Feedback', icon: FaCommentDots, href: '/feedback', color: '#f59e0b', roles: ['owner', 'admin', 'manager'] },
    { id: 'attendance', name: t('nav.attendance'), icon: FaUserClock, href: '/attendance', color: '#ef4444', roles: ['owner', 'admin', 'manager'] },
    { id: 'billing', name: t('nav.billing'), icon: FaCreditCard, href: '/billing', color: '#06b6d4', roles: ['owner', 'admin'] },
    // --- Tools & Extras ---
    { id: 'invoice', name: t('nav.invoice'), icon: FaFileInvoice, href: '/invoice', color: '#0ea5e9', roles: ['owner', 'admin', 'manager'] },
    // --- More (groups advanced features) ---
    { id: 'more', name: 'More', icon: FaThLarge, href: '/more', color: '#6366f1', roles: ['owner', 'admin', 'manager'] },
    // --- Settings (always last) ---
    { id: 'admin', name: t('nav.admin'), icon: FaCog, href: '/admin', color: '#64748b', roles: ['owner', 'admin', 'manager', 'employee', 'cashier', 'sales', 'waiter'] },
    { id: 'profile', name: t('nav.profile'), icon: FaUser, href: '/profile', color: '#ec4899', roles: ['owner', 'admin', 'manager', 'waiter', 'employee', 'cashier', 'sales'] },
  ];

  const navItems = getAllNavItems().filter(item => {
    if (!user || !user.role) return false;

    // These pages are always visible (not hideable via feature selection)
    // but still respect role-based access below
    const alwaysVisibleIds = ['home', 'profile', 'orders', 'admin', 'billing', 'more'];

    // Check if page is in notAllowedPages array (hide for this user)
    // Skip for always-visible pages
    if (notAllowedPages && notAllowedPages.includes(item.id) && !alwaysVisibleIds.includes(item.id)) {
      return false;
    }

    // Home and Profile are always accessible to all users (bypass role check)
    if (item.id === 'home' || item.id === 'profile') {
      return true;
    }

    // Owner and admin (co-owner) bypass pageAccess — full sidebar access
    if (['owner', 'admin', 'waiter'].includes(user.role)) {
      return item.roles.includes(user.role);
    }

    // All other roles (manager, employee, cashier, sales, custom) — pageAccess is the authority
    if (pageAccess) {
      const accessMap = {
        'pos': 'dashboard',
        'orders': 'history',
        'tables': 'tables',
        'customers': 'customers',
        'menu': 'menu',
        'inventory': 'inventory',
        'kot': 'kot',
        'admin': 'admin',
        'hotel': 'hotel',
        'invoice': 'invoice',
        'billing': 'completeBill',
        'books': 'admin',
        'dineai': 'analytics',
        'phone-agent': 'analytics',
        'whatsapp-ordering': 'analytics',
        'social-media': 'analytics',
        'shifts': 'admin',
        'register': 'completeBill',
        'attendance': 'admin',
        'google-reviews': 'admin',
        'feedback': 'admin',
        'spaces': 'admin',
        'parking': 'parking',
        'bookings': 'bookings',
      };
      const accessKey = accessMap[item.id];
      if (!accessKey) return true; // no access mapping = always visible (e.g. home, profile)
      const accessValue = pageAccess[accessKey];
      if (typeof accessValue === 'object' && accessValue !== null) {
        return Object.values(accessValue).some(Boolean);
      }
      return !!accessValue;
    }

    return false;
  });

  const getUserInitials = () => {
    if (user?.name) return user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    if (user?.phone) return user.phone.substring(user.phone.length - 2).toUpperCase();
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.phone) return user.phone;
    if (user?.email) return user.email;
    return 'User';
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return '#ec4899';
      case 'manager': return '#8b5cf6';
      case 'waiter': return '#10b981';
      default: return '#6b7280';
    }
  };

  // Save collapse state to localStorage
  useEffect(() => {
    const savedCollapseState = localStorage.getItem('sidebarCollapsed');
    if (savedCollapseState !== null) {
      setIsCollapsed(savedCollapseState === 'true');
    }
  }, []);

  // Listen for openNavSidebar event from dashboard
  useEffect(() => {
    const handleOpenNavSidebar = () => {
      setIsMobileMenuOpen(true);
      setIsCollapsed(false); // Always open in expanded mode
    };

    window.addEventListener('openNavSidebar', handleOpenNavSidebar);
    return () => {
      window.removeEventListener('openNavSidebar', handleOpenNavSidebar);
    };
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
    // Dispatch event for layout to update
    window.dispatchEvent(new Event('sidebarToggle'));
  };

  return (
    <>
      {/* Mobile Menu Button - Only show on mobile (dashboard has its own hamburger) */}
      <button
        id="sidebar-hamburger"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-[10001] p-3 bg-white rounded-xl shadow-lg"
        style={{ border: '1px solid rgba(0,0,0,0.1)' }}
      >
        <FaBars size={20} color="#374151" />
      </button>

      {/* Overlay - Shows on mobile always, and on desktop only for dashboard */}
      {isMobileMenuOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-[9999] ${isDashboardPage ? '' : 'md:hidden'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on dashboard (has its own category sidebar), visible on other pages */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white transition-all duration-300 z-[10000] ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDashboardPage ? '' : 'md:translate-x-0'}`}
        style={{
          width: isDashboardPage ? '240px' : (isCollapsed ? '70px' : '240px'),
          borderRight: '1px solid #f1f5f9'
        }}
        data-sidebar-collapsed={isCollapsed}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
            <div
              onClick={() => {
                if (isCollapsed) {
                  // First click on collapsed: expand the sidebar
                  setIsCollapsed(false);
                  localStorage.setItem('sidebarCollapsed', 'false');
                  window.dispatchEvent(new Event('sidebarToggle'));
                } else {
                  // Already expanded: navigate to home
                  const homeHref = selectedRestaurant?.businessType === 'bar' ? '/dashboard/bar' : '/dashboard';
                  router.push(homeHref);
                }
              }}
              className="flex items-center gap-2 cursor-pointer"
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', flex: 1 }}
            >
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: isCollapsed ? '44px' : '48px',
                  height: isCollapsed ? '44px' : '48px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                }}
              >
                <FaUtensils color="white" size={isCollapsed ? 20 : 22} />
              </div>
              {!isCollapsed && (
                <h1 className="text-xl font-bold text-gray-900 m-0" style={{ fontSize: '20px', fontWeight: '700' }}>DineOpen</h1>
              )}
            </div>
            {/* Collapse toggle near logo - only in expanded mode */}
            {!isCollapsed && (
              <button
                onClick={toggleCollapse}
                className="flex items-center justify-center rounded-lg hover:bg-gray-100 transition-all duration-200"
                style={{
                  width: '32px',
                  height: '32px',
                  marginLeft: '8px'
                }}
                title={t('nav.collapseSidebar')}
              >
                <FaChevronLeft size={14} color="#9ca3af" />
              </button>
            )}
          </div>

          {/* Restaurant Info (for staff) */}
          {!isCollapsed && selectedRestaurant && (user?.role === 'waiter' || user?.role === 'manager' || user?.role === 'employee') && (
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BiRestaurant size={14} color="#6b7280" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{selectedRestaurant.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '3px' : '8px' }}>
              {isNavigationReady ? (
                navItems.map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link key={item.id} href={item.href} onClick={(e) => handleNavigation(item.href, e)}>
                      <div
                        className={`relative flex items-center transition-all cursor-pointer group ${
                          isCollapsed ? 'justify-center' : 'gap-3'
                        }`}
                        style={{
                          padding: isCollapsed ? '8px' : '10px 12px',
                          borderRadius: isCollapsed ? '12px' : '10px',
                          backgroundColor: isActive
                            ? (isCollapsed ? `${item.color}18` : `${item.color}12`)
                            : 'transparent',
                          borderLeft: isActive && !isCollapsed
                            ? `3px solid ${item.color}`
                            : 'none',
                          marginLeft: isActive && !isCollapsed ? '4px' : '0',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = isCollapsed ? `${item.color}10` : '#f3f4f6';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                        title={isCollapsed ? item.name : ''}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: isCollapsed ? '40px' : 'auto',
                            height: isCollapsed ? '40px' : 'auto',
                            borderRadius: isCollapsed ? '10px' : '0',
                            backgroundColor: isCollapsed
                              ? (isActive ? `${item.color}22` : `${item.color}08`)
                              : 'transparent',
                            boxShadow: isActive && isCollapsed ? `0 2px 8px ${item.color}25` : 'none',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <IconComponent
                            size={isCollapsed ? 18 : 18}
                            style={{
                              color: isCollapsed
                                ? (isActive ? item.color : `${item.color}cc`)
                                : (isActive ? item.color : '#6b7280'),
                              minWidth: '18px',
                              transition: 'color 0.2s ease'
                            }}
                          />
                        </div>
                        {!isCollapsed && (
                          <span
                            className="text-sm font-medium"
                            style={{
                              color: isActive ? '#1f2937' : '#6b7280',
                              fontWeight: isActive ? '600' : '500'
                            }}
                          >
                            {item.name}
                          </span>
                        )}
                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                            {item.name}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="text-center text-gray-500 text-xs py-4">{t('nav.loading')}</div>
              )}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-100 px-2 py-3">
            {!isCollapsed ? (
              <div className="flex flex-col gap-2">
                {/* User Info */}
                <Link href="/profile" onClick={(e) => handleNavigation('/profile', e)}>
                  <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
                    <div
                      className="flex items-center justify-center rounded-full flex-shrink-0"
                      style={{
                        width: '40px',
                        height: '40px',
                        background: user?.photoURL ? 'transparent' : getRoleColor(user?.role),
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                      }}
                    >
                      {user?.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </Link>

                {electronVersion && (
                  <div className="px-3 -mt-1 mb-1">
                    <span style={{ fontSize: '10px', color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: '6px', fontWeight: '500' }}>
                      v{electronVersion}
                    </span>
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.style.borderColor = '#fca5a5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                    e.currentTarget.style.borderColor = '#fecaca';
                  }}
                >
                  <FaSignOutAlt size={14} color="#ef4444" />
                  <span className="text-sm font-medium" style={{ color: '#ef4444' }}>{t('nav.logout')}</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Link href="/profile" onClick={(e) => handleNavigation('/profile', e)}>
                  <div
                    className="flex items-center justify-center rounded-full group cursor-pointer relative"
                    style={{
                      width: '40px',
                      height: '40px',
                      background: user?.photoURL ? 'transparent' : getRoleColor(user?.role),
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                    }}
                  >
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                    )}
                    {/* Tooltip */}
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                      {getUserDisplayName()}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  </div>
                </Link>
                {/* Collapsed Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center rounded-xl transition-all duration-200 group relative"
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.style.borderColor = '#fca5a5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                    e.currentTarget.style.borderColor = '#fecaca';
                  }}
                  title={t('nav.logout')}
                >
                  <FaSignOutAlt size={16} color="#ef4444" />
                  {/* Tooltip */}
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                    {t('nav.logout')}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button - At Bottom (Enhanced) */}
          <div className="px-3 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={toggleCollapse}
              className="w-full flex items-center justify-center rounded-xl transition-all duration-300 group relative overflow-hidden"
              title={isCollapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
              style={{
                minHeight: '44px',
                background: isCollapsed
                  ? 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isCollapsed ? (
                <div className="flex items-center justify-center">
                  <FaChevronRight size={14} color="#64748b" style={{ transition: 'transform 0.2s' }} />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center justify-center rounded-lg"
                    style={{
                      width: '24px',
                      height: '24px',
                      backgroundColor: '#e2e8f0'
                    }}
                  >
                    <FaChevronLeft size={10} color="#64748b" />
                  </div>
                  <span className="text-xs font-medium" style={{ color: '#64748b' }}>{t('nav.collapseMenu')}</span>
                </div>
              )}
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                  {t('nav.expandMenu')}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>

      <style jsx>{`
        @media (max-width: 768px) {
          aside {
            width: 240px !important;
          }
        }
      `}</style>
    </>
  );
}
