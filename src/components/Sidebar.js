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
  FaBars
} from 'react-icons/fa';
import { BiRestaurant } from 'react-icons/bi';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import apiClient from '../lib/api';
import { t } from '../lib/i18n';
import { performLogout } from '../lib/logout';
import { useLoading } from '../contexts/LoadingContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { startLoading } = useLoading();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [user, setUser] = useState(null);
  const [pageAccess, setPageAccess] = useState(null);
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load restaurant and user data
  useEffect(() => {
    const loadData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);

          // Fetch page access for staff users
          if (parsedUser.role === 'employee' || parsedUser.role === 'manager') {
            try {
              const accessData = await apiClient.getUserPageAccess();
              setPageAccess(accessData.pageAccess);
            } catch (error) {
              console.error('Error fetching page access:', error);
              setPageAccess({
                dashboard: true,
                history: true,
                tables: true,
                menu: true,
                analytics: false,
                inventory: false,
                kot: false,
                admin: false
              });
            }
            setIsNavigationReady(true);
          } else {
            setIsNavigationReady(true);
          }

          // Load restaurant data
          const isDashboardPage = pathname === '/dashboard';
          if (isDashboardPage) {
            const savedRestaurant = localStorage.getItem('selectedRestaurant');
            if (savedRestaurant) {
              try {
                const restaurant = JSON.parse(savedRestaurant);
                setSelectedRestaurant(restaurant);
              } catch (error) {
                console.error('Error parsing saved restaurant:', error);
              }
            }
            return;
          }

          if (parsedUser.restaurantId) {
            if (parsedUser.restaurant) {
              setSelectedRestaurant(parsedUser.restaurant);
            }
          } else if (parsedUser.role === 'owner' || parsedUser.role === 'customer') {
            try {
              const token = localStorage.getItem('authToken');
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'}/api/restaurants`, {
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
                  const savedRestaurant = data.restaurants.find(r => r.id === savedRestaurantId);
                  setSelectedRestaurant(savedRestaurant || data.restaurants[0]);
                }
              }
            } catch (error) {
              console.error('Error fetching restaurant data:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [pathname]);

  const handleNavigation = (href, e) => {
    e.preventDefault();
    startLoading('Loading...', 'content');
    setTimeout(() => {
      router.push(href);
      setIsMobileMenuOpen(false);
    }, 100);
  };

  const handleLogout = () => {
    apiClient.clearToken();
    setIsMobileMenuOpen(false);
    performLogout();
  };

  const getAllNavItems = () => [
    { id: 'pos', name: t('nav.dashboard'), icon: FaHome, href: '/dashboard', color: '#ef4444', roles: ['owner', 'manager', 'waiter'] },
    { id: 'orders', name: t('nav.history'), icon: FaClipboardList, href: '/orderhistory', color: '#f59e0b', roles: ['owner', 'manager', 'waiter'] },
    { id: 'tables', name: t('nav.tables'), icon: FaChair, href: '/tables', color: '#3b82f6', roles: ['owner', 'manager', 'waiter'] },
    { id: 'customers', name: t('nav.customers'), icon: FaUsers, href: '/customers', color: '#8b5cf6', roles: ['owner', 'manager'] },
    { id: 'menu', name: t('nav.menu'), icon: FaUtensils, href: '/menu', color: '#10b981', roles: ['owner', 'manager'] },
    { id: 'inventory', name: t('nav.inventory'), icon: FaBoxes, href: '/inventory', color: '#059669', roles: ['owner', 'manager'] },
    { id: 'billing', name: t('nav.billing'), icon: FaCreditCard, href: '/billing', color: '#06b6d4', roles: ['owner'] },
    { id: 'admin', name: t('nav.admin'), icon: FaUsers, href: '/admin', color: '#ec4899', roles: ['owner'] },
    { id: 'kot', name: t('nav.kot'), icon: FaPrint, href: '/kot', color: '#f97316', roles: ['owner', 'manager', 'waiter'] },
    { id: 'hotel', name: 'Hotel', icon: FaBuilding, href: '/hotel', color: '#6366f1', roles: ['owner', 'manager'] },
  ];

  const navItems = getAllNavItems().filter(item => {
    if (!user || !user.role) return false;

    if (user.role === 'employee' || user.role === 'manager') {
      if (!pageAccess) return false;
      const accessMap = {
        'pos': 'dashboard',
        'orders': 'history',
        'tables': 'tables',
        'customers': 'customers',
        'menu': 'menu',
        'inventory': 'inventory',
        'kot': 'kot',
        'admin': 'admin',
        'hotel': 'hotel'
      };
      const accessKey = accessMap[item.id];
      return accessKey ? pageAccess[accessKey] : false;
    }

    if (['owner', 'manager', 'waiter'].includes(user.role)) {
      return item.roles.includes(user.role);
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

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
    // Dispatch event for layout to update
    window.dispatchEvent(new Event('sidebarToggle'));
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-[10001] p-3 bg-white rounded-xl shadow-lg"
        style={{ border: '1px solid rgba(0,0,0,0.1)' }}
      >
        <FaBars size={20} color="#374151" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-[9999]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white transition-all duration-300 z-[10000] ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
        style={{
          width: isCollapsed ? '70px' : '240px',
          borderRight: '1px solid #f1f5f9'
        }}
        data-sidebar-collapsed={isCollapsed}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center px-4 py-5 border-b border-gray-100">
            <div
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 cursor-pointer"
              style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', width: '100%' }}
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
                          padding: isCollapsed ? '10px' : '10px 12px',
                          borderRadius: '10px',
                          backgroundColor: isActive 
                            ? `${item.color}15` 
                            : 'transparent',
                          borderLeft: isActive && !isCollapsed 
                            ? `3px solid ${item.color}` 
                            : 'none',
                          marginLeft: isActive && !isCollapsed ? '4px' : '0',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
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
                            width: isCollapsed ? '36px' : 'auto',
                            height: isCollapsed ? '36px' : 'auto',
                            borderRadius: isCollapsed ? '8px' : '0',
                            backgroundColor: isActive && isCollapsed 
                              ? `${item.color}20` 
                              : 'transparent',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <IconComponent
                            size={isCollapsed ? 20 : 18}
                            style={{
                              color: isActive ? item.color : '#6b7280',
                              minWidth: isCollapsed ? '20px' : '18px',
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
                <div className="text-center text-gray-500 text-xs py-4">Loading...</div>
              )}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-100 px-2 py-3">
            {!isCollapsed ? (
              <div className="flex items-center gap-2 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group relative">
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{
                    width: '36px',
                    height: '36px',
                    background: user?.photoURL ? 'transparent' : getRoleColor(user?.role),
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-sm">{getUserInitials()}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaSignOutAlt size={14} color="#ef4444" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-full group cursor-pointer relative"
                  style={{
                    width: '36px',
                    height: '36px',
                    background: user?.photoURL ? 'transparent' : getRoleColor(user?.role),
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
              </div>
            )}
          </div>

          {/* Collapse Toggle Button - At Bottom */}
          <div className="border-t border-gray-100 px-2 py-3">
            <button
              onClick={toggleCollapse}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition-colors group relative"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              style={{
                minHeight: '40px'
              }}
            >
              {isCollapsed ? (
                <FaChevronRight size={16} color="#6b7280" />
              ) : (
                <>
                  <FaChevronLeft size={16} color="#6b7280" style={{ marginRight: '8px' }} />
                  <span className="text-xs text-gray-600 font-medium">Collapse</span>
                </>
              )}
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                  Expand
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
