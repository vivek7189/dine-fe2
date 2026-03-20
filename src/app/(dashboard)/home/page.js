'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUtensils, FaChartBar, FaClipboardList,
  FaChair, FaBoxes, FaBuilding, FaRobot,
  FaFire, FaReceipt, FaPlus, FaShoppingCart,
  FaChartLine, FaArrowRight, FaStore,
  FaClock, FaUsers, FaCircle, FaStar,
  FaHashtag, FaTrophy
} from 'react-icons/fa';
import { useLoading } from '../../../contexts/LoadingContext';
import apiClient from '../../../lib/api';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getRoleMessage(role, stats) {
  if (role === 'owner') {
    if (stats?.orders > 0) return `${stats.orders} order${stats.orders > 1 ? 's' : ''} today — keep the momentum going!`;
    return 'Your restaurants are ready. Let\'s make today count!';
  }
  if (role === 'manager') {
    if (stats?.orders > 0) return `${stats.orders} order${stats.orders > 1 ? 's' : ''} processed today. Great work!`;
    return 'Ready to manage the floor. Let\'s get started!';
  }
  if (role === 'waiter') {
    return 'Tables are waiting. Time to deliver great service!';
  }
  return 'Welcome back! Here\'s your quick access panel.';
}

function formatCurrency(amount, symbol = '₹') {
  if (!amount && amount !== 0) return `${symbol}0`;
  return `${symbol}${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function parseDate(d) {
  if (!d) return null;
  if (d.toDate) return d.toDate();
  if (d._seconds) return new Date(d._seconds * 1000);
  const parsed = new Date(d);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function getTimeAgo(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '';
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatTime(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function HomePage() {
  const router = useRouter();
  const { startLoading } = useLoading();
  const [user, setUser] = useState(null);
  const [pageAccess, setPageAccess] = useState(null);
  const [notAllowedPages, setNotAllowedPages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [isBar, setIsBar] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [tables, setTables] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersByType, setOrdersByType] = useState([]);
  const [busyHours, setBusyHours] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) { router.push('/login'); return; }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    const cachedAccess = localStorage.getItem('navPageAccess');
    if (cachedAccess) setPageAccess(JSON.parse(cachedAccess));
    const cachedNotAllowed = localStorage.getItem('navNotAllowedPages');
    if (cachedNotAllowed) setNotAllowedPages(JSON.parse(cachedNotAllowed));
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    if (savedRestaurant) {
      try {
        const r = JSON.parse(savedRestaurant);
        setRestaurantName(r.name || '');
        if (r.businessType === 'bar') setIsBar(true);
      } catch {}
    } else if (parsed.restaurant) {
      setRestaurantName(parsed.restaurant.name || '');
      if (parsed.restaurant.businessType === 'bar') setIsBar(true);
    }
    const savedCurrency = localStorage.getItem('currencySymbol');
    if (savedCurrency) setCurrencySymbol(savedCurrency);
    loadStats(parsed);
    loadRecentOrders(parsed);
    loadTables(parsed);
  }, []);

  const loadStats = async (userData) => {
    setStatsLoading(true);
    try {
      const restaurantId = localStorage.getItem('selectedRestaurantId') || userData?.restaurantId;
      if (!restaurantId) { setStatsLoading(false); return; }
      const data = await apiClient.getAnalytics(restaurantId, 'today');
      if (data) {
        setStats({
          revenue: data.totalRevenue || data.revenue || 0,
          orders: data.totalOrders || data.orders || 0,
          avgOrder: data.avgOrderValue || data.averageOrderValue || 0,
          lastOrderTime: data.lastOrderTime || data.lastOrder?.time || null,
          customers: data.totalCustomers || data.customers || 0,
        });
        if (data.popularItems) setPopularItems(data.popularItems.slice(0, 5));
        if (data.revenueData) setRevenueData(data.revenueData);
        if (data.ordersByType) setOrdersByType(data.ordersByType);
        if (data.busyHours) setBusyHours(data.busyHours);
      }
    } catch (err) { console.error('Error loading stats:', err); }
    finally { setStatsLoading(false); }
  };

  const loadRecentOrders = async (userData) => {
    try {
      const restaurantId = localStorage.getItem('selectedRestaurantId') || userData?.restaurantId;
      if (!restaurantId) return;
      const data = await apiClient.getOrders(restaurantId, { limit: 5, sort: 'newest' });
      if (data?.orders) setRecentOrders(data.orders.slice(0, 5));
    } catch (err) { console.error('Error loading recent orders:', err); }
  };

  const loadTables = async (userData) => {
    try {
      const restaurantId = localStorage.getItem('selectedRestaurantId') || userData?.restaurantId;
      if (!restaurantId) return;
      const data = await apiClient.getTables(restaurantId);
      if (data?.tables) {
        const total = data.tables.length;
        const occupied = data.tables.filter(t => t.status === 'occupied' || t.status === 'reserved').length;
        setTables({ total, occupied, available: total - occupied });
      }
    } catch (err) { console.error('Error loading tables:', err); }
  };

  const navigateTo = (href) => {
    startLoading('Loading...', 'content');
    setTimeout(() => router.push(href), 100);
  };

  const canAccess = (key) => {
    if (!user) return false;
    if (user.role === 'owner') return true;
    const idMap = { dashboard: 'pos', history: 'orders', tables: 'tables', menu: 'menu', analytics: 'analytics', inventory: 'inventory', kot: 'kot', admin: 'admin', customers: 'customers' };
    if (notAllowedPages?.includes(idMap[key] || key)) return false;
    if (user.role === 'waiter') return ['dashboard', 'tables', 'history', 'kot'].includes(key);
    if (user.role === 'employee' || user.role === 'manager') {
      if (pageAccess) {
        const accessMap = { dashboard: 'dashboard', history: 'history', tables: 'tables', menu: 'menu', analytics: 'analytics', inventory: 'inventory', kot: 'kot', admin: 'admin', customers: 'customers' };
        return accessMap[key] ? !!pageAccess[accessMap[key]] : false;
      }
      return ['dashboard', 'tables', 'history', 'menu'].includes(key);
    }
    return false;
  };

  const showStats = user?.role === 'owner' || user?.role === 'manager' || user?.role === 'admin';
  const firstName = user?.name?.split(' ')[0] || 'there';
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const posPath = isBar ? '/dashboard/bar' : '/dashboard';

  const quickActions = [
    canAccess('dashboard') && {
      icon: FaReceipt, label: isBar ? 'Bar POS' : 'Start Order',
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', href: posPath,
    },
    canAccess('tables') && {
      icon: FaChair, label: 'Tables',
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', href: '/tables',
    },
    canAccess('kot') && {
      icon: FaFire, label: 'Kitchen',
      gradient: 'linear-gradient(135deg, #f97316, #ea580c)', href: '/kot',
    },
    canAccess('menu') && {
      icon: FaUtensils, label: 'Menu',
      gradient: 'linear-gradient(135deg, #10b981, #059669)', href: '/menu',
    },
    canAccess('history') && {
      icon: FaClipboardList, label: 'Orders',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', href: '/orderhistory',
    },
  ].filter(Boolean);

  const statusColors = {
    completed: { bg: '#ecfdf5', color: '#059669', label: 'Paid' },
    pending: { bg: '#fffbeb', color: '#d97706', label: 'Pending' },
    preparing: { bg: '#eff6ff', color: '#2563eb', label: 'Preparing' },
    served: { bg: '#f0fdf4', color: '#16a34a', label: 'Served' },
    cancelled: { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
    saved: { bg: '#f1f5f9', color: '#64748b', label: 'Saved' },
  };

  if (!user) return null;

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 40px', minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .home-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .home-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
        .home-stat-card { transition: all 0.2s ease; }
        .home-stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,0.06); }
        .hq-banner { transition: all 0.25s ease; }
        .hq-banner:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(239,68,68,0.3); }
        .order-row { transition: background 0.15s; }
        .order-row:hover { background: #f8fafc !important; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeInUp 0.4s ease forwards; }
      `}</style>

      {/* Header */}
      <div className="animate-in" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '26px' : '34px', fontWeight: '800', color: '#0f172a',
            margin: 0, letterSpacing: '-0.03em', lineHeight: 1.15,
          }}>
            {getGreeting()}, {firstName}
          </h1>
          <p style={{ fontSize: '15px', color: '#94a3b8', margin: '8px 0 0', lineHeight: 1.5 }}>
            {todayDate}{restaurantName ? ` · ${restaurantName}` : ''}
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0', fontWeight: '500' }}>
            {getRoleMessage(user?.role, stats)}
          </p>
        </div>

        {canAccess('dashboard') && (
          <button
            onClick={() => navigateTo(posPath)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '700', color: 'white',
              boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <FaPlus size={11} /> Start Taking Orders
          </button>
        )}
      </div>

      {/* Stat Cards */}
      {showStats && (
        <div className="animate-in" style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '24px',
          animationDelay: '0.05s',
        }}>
          <StatCard
            gradient="linear-gradient(135deg, #10b981, #059669)"
            icon={FaChartLine}
            value={statsLoading ? '—' : formatCurrency(stats?.revenue || 0, currencySymbol)}
            label="Today's Revenue"
            sub={stats?.orders > 0 ? `from ${stats.orders} order${stats.orders > 1 ? 's' : ''}` : 'No orders yet'}
            loading={statsLoading}
          />
          <StatCard
            gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
            icon={FaShoppingCart}
            value={statsLoading ? '—' : (stats?.orders || 0)}
            label="Total Orders"
            sub={stats?.lastOrderTime ? `Last: ${getTimeAgo(stats.lastOrderTime)}` : 'Waiting for first order'}
            loading={statsLoading}
          />
          <StatCard
            gradient="linear-gradient(135deg, #f59e0b, #d97706)"
            icon={FaReceipt}
            value={statsLoading ? '—' : formatCurrency(stats?.avgOrder || 0, currencySymbol)}
            label="Avg Order Value"
            sub={stats?.orders > 0 ? 'Per order average' : '—'}
            loading={statsLoading}
          />
        </div>
      )}

      {/* Command Center + Quick Actions row */}
      <div className="animate-in" style={{
        display: 'flex', gap: '16px', marginBottom: '24px',
        flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center',
        animationDelay: '0.1s',
      }}>
        {/* Command Center Banner — Owner only */}
        {user?.role === 'owner' && (
          <div
            className="hq-banner"
            onClick={() => navigateTo('/headquarters')}
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
              borderRadius: '14px', padding: isMobile ? '16px' : '18px 22px',
              position: 'relative', overflow: 'hidden',
              cursor: 'pointer', flex: isMobile ? 'none' : '0 0 auto',
            }}
          >
            <div style={{ position: 'absolute', top: '-30px', right: '-10px', opacity: 0.06, pointerEvents: 'none' }}>
              <FaStore size={110} color="white" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaBuilding size={16} color="white" />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>Command Center</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>All locations</div>
              </div>
              <FaArrowRight size={11} color="rgba(255,255,255,0.5)" style={{ marginLeft: '8px' }} />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {quickActions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="home-card"
                onClick={() => navigateTo(item.href)}
                style={{
                  background: item.gradient, borderRadius: '12px',
                  width: isMobile ? '64px' : '72px',
                  height: isMobile ? '64px' : '72px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', textAlign: 'center',
                }}
              >
                <Icon size={isMobile ? 15 : 17} color="white" style={{ marginBottom: '4px' }} />
                <div style={{ fontSize: '9px', fontWeight: '700', color: 'white', lineHeight: 1.2 }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* === Dashboard Widgets (HQ-style) === */}
      {(() => {
        const cardStyle = {
          background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9',
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)', padding: '20px',
        };
        const sectionHeader = (icon, title, linkText, linkAction) => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{icon}</div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{title}</span>
            </div>
            {linkText && (
              <span onClick={linkAction} style={{
                fontSize: '12px', color: '#ef4444', fontWeight: '600', cursor: 'pointer',
              }}>{linkText}</span>
            )}
          </div>
        );
        const emptyState = (icon, text) => (
          <div style={{ padding: '28px 16px', textAlign: 'center' }}>
            <div style={{ marginBottom: '8px' }}>{icon}</div>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>{text}</p>
          </div>
        );

        const typeIcons = {
          'dine in': { icon: FaChair, color: '#3b82f6', bg: '#eff6ff' },
          'dine_in': { icon: FaChair, color: '#3b82f6', bg: '#eff6ff' },
          'takeaway': { icon: FaShoppingCart, color: '#f59e0b', bg: '#fffbeb' },
          'take away': { icon: FaShoppingCart, color: '#f59e0b', bg: '#fffbeb' },
          'delivery': { icon: FaArrowRight, color: '#10b981', bg: '#ecfdf5' },
          'online': { icon: FaStore, color: '#8b5cf6', bg: '#f5f3ff' },
        };
        const orderTypeConfig = {
          dine_in:   { label: 'Dine In',   color: '#3b82f6', bg: '#eff6ff',  icon: FaChair },
          takeaway:  { label: 'Takeaway',  color: '#f59e0b', bg: '#fffbeb',  icon: FaShoppingCart },
          take_away: { label: 'Takeaway',  color: '#f59e0b', bg: '#fffbeb',  icon: FaShoppingCart },
          delivery:  { label: 'Delivery',  color: '#10b981', bg: '#ecfdf5',  icon: FaArrowRight },
          online:    { label: 'Online',    color: '#8b5cf6', bg: '#f5f3ff',  icon: FaStore },
        };
        const rankGradients = [
          'linear-gradient(135deg, #f59e0b, #d97706)',
          'linear-gradient(135deg, #94a3b8, #64748b)',
          'linear-gradient(135deg, #cd7f32, #a0522d)',
          'linear-gradient(135deg, #cbd5e1, #94a3b8)',
          'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
        ];
        const defaultDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        const days = revenueData.length > 0 ? revenueData : defaultDays.map(d => ({ day: d, revenue: 0 }));

        return (
          <div className="animate-in" style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : (showStats ? '1.5fr 1fr' : '1fr'),
            gap: '20px',
            animationDelay: '0.2s',
          }}>

            {/* === LEFT COLUMN === */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Revenue This Week — always show for owner/manager */}
              {showStats && (
                <div style={cardStyle}>
                  {sectionHeader(
                    <FaChartBar size={14} color="#6b7280" />,
                    'Revenue This Week',
                    canAccess('analytics') ? 'Full analytics' : null,
                    () => navigateTo('/analytics')
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {days.map((d, i) => {
                      const maxRev = Math.max(...days.map(r => r.revenue), 1);
                      const isToday = i === new Date().getDay();
                      const pct = maxRev > 0 ? (d.revenue / maxRev) * 100 : 0;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            width: '32px', fontSize: '12px', fontWeight: isToday ? '700' : '500',
                            color: isToday ? '#ef4444' : '#9ca3af', textAlign: 'right',
                          }}>{d.day}</span>
                          <div style={{ flex: 1, height: '24px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.max(pct, d.revenue > 0 ? 4 : 0)}%`, height: '100%',
                              background: isToday
                                ? 'linear-gradient(90deg, #ef4444, #f97316)'
                                : 'linear-gradient(90deg, #cbd5e1, #94a3b8)',
                              borderRadius: '8px', transition: 'width 0.6s ease',
                            }} />
                          </div>
                          <span style={{
                            fontSize: '12px', fontWeight: isToday ? '700' : '500',
                            color: isToday ? '#1f2937' : '#9ca3af', minWidth: '56px', textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                          }}>{formatCurrency(d.revenue, currencySymbol)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Orders by Type — always show for owner/manager */}
              {showStats && (
                <div style={cardStyle}>
                  {sectionHeader(<FaClipboardList size={14} color="#6b7280" />, 'Orders by Type')}
                  {ordersByType.length === 0 ? (
                    emptyState(<FaClipboardList size={24} color="#e2e8f0" />, 'Order breakdown will appear here')
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {ordersByType.map((type, i) => {
                        const key = type.type?.toLowerCase().replace(/[\s-]/g, '_');
                        const config = orderTypeConfig[key] || { label: type.type || 'Other', color: '#64748b', bg: '#f8fafc', icon: FaCircle };
                        const Icon = config.icon;
                        return (
                          <div key={i}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                  width: '28px', height: '28px', borderRadius: '8px', background: config.bg,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}><Icon size={11} color={config.color} /></div>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{config.label}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>{type.count}</span>
                                <span style={{
                                  fontSize: '11px', fontWeight: '700', color: config.color,
                                  background: config.bg, padding: '3px 10px', borderRadius: '12px',
                                }}>{type.percentage}%</span>
                              </div>
                            </div>
                            <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${type.percentage || 0}%`, height: '100%',
                                background: `linear-gradient(90deg, ${config.color}, ${config.color}dd)`,
                                borderRadius: '4px', transition: 'width 0.5s ease',
                              }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Recent Orders — visible to anyone with history access */}
              {canAccess('history') && (
                <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
                  <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>
                    {sectionHeader(
                      <FaClock size={14} color="#6b7280" />,
                      'Recent Orders',
                      'View all',
                      () => navigateTo('/orderhistory')
                    )}
                  </div>
                  {recentOrders.length === 0 ? (
                    emptyState(<FaClipboardList size={24} color="#e2e8f0" />, 'No orders yet today')
                  ) : (
                    <div style={{ padding: '8px 12px' }}>
                      {recentOrders.map((order, i) => {
                        const orderNum = order.dailyOrderId || order.orderNumber || order.id?.slice(-4).toUpperCase();
                        const status = statusColors[order.status] || statusColors.pending;
                        const total = order.grandTotal || order.totalAmount || order.total || 0;
                        const rawType = (order.orderType?.replace('-', ' ') || 'dine in').toLowerCase();
                        const typeConf = typeIcons[rawType] || typeIcons['dine in'];
                        const TypeIcon = typeConf.icon;
                        return (
                          <div key={order.id || i} className="order-row" style={{
                            padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            borderRadius: '12px', marginBottom: i < recentOrders.length - 1 ? '4px' : 0,
                            cursor: 'pointer',
                          }} onClick={() => navigateTo('/orderhistory')}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                background: typeConf.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}><TypeIcon size={14} color={typeConf.color} /></div>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                  #{orderNum}
                                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#9ca3af', marginLeft: '8px', textTransform: 'capitalize' }}>{rawType}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                  {order.createdAt ? formatTime(order.createdAt) : ''}
                                  {order.createdAt ? ` · ${getTimeAgo(order.createdAt)}` : ''}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{
                                fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '12px',
                                background: status.bg, color: status.color,
                              }}>{status.label}</span>
                              <span style={{ fontSize: '14px', fontWeight: '700', color: '#1f2937', minWidth: '56px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                {formatCurrency(total, currencySymbol)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* === RIGHT COLUMN — always show for owner/manager/admin === */}
            {showStats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Peak Hours */}
                <div style={cardStyle}>
                  {sectionHeader(<FaClock size={14} color="#6b7280" />, 'Peak Hours')}
                  {busyHours.length === 0 ? (
                    emptyState(<FaClock size={24} color="#e2e8f0" />, 'Peak hours will appear after orders')
                  ) : (
                    <>
                      <div style={{
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                        gap: '8px', height: '110px', marginBottom: '10px',
                      }}>
                        {busyHours.slice(0, 6).map((h, i) => {
                          const maxOrders = Math.max(...busyHours.slice(0, 6).map(x => x.orders), 1);
                          const pct = maxOrders > 0 ? (h.orders / maxOrders) * 100 : 0;
                          const isTop = i === 0;
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: isTop ? '#ef4444' : '#6b7280' }}>{h.orders}</span>
                              <div style={{
                                width: '100%', borderRadius: '8px 8px 0 0',
                                height: `${Math.max(pct, 8)}%`,
                                background: isTop
                                  ? 'linear-gradient(180deg, #ef4444, #f97316)'
                                  : 'linear-gradient(180deg, #e2e8f0, #cbd5e1)',
                                transition: 'height 0.5s ease',
                              }} />
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        {busyHours.slice(0, 6).map((h, i) => (
                          <div key={i} style={{
                            flex: 1, textAlign: 'center', fontSize: '11px', fontWeight: '600',
                            color: i === 0 ? '#ef4444' : '#9ca3af',
                          }}>
                            {typeof h.hour === 'number' ? `${h.hour % 12 || 12}${h.hour < 12 ? 'am' : 'pm'}` : h.hour}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Popular Items */}
                <div style={cardStyle}>
                  {sectionHeader(
                    <FaTrophy size={14} color="#f59e0b" />,
                    'Popular Items',
                    'View menu',
                    () => navigateTo('/menu')
                  )}
                  {popularItems.length === 0 ? (
                    emptyState(<FaStar size={24} color="#e2e8f0" />, 'Top dishes will appear after orders')
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {popularItems.map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 12px', borderRadius: '12px',
                          background: i === 0 ? '#fffbeb' : '#f8fafc',
                          border: i === 0 ? '1px solid #fde68a' : '1px solid transparent',
                        }}>
                          <div style={{
                            width: '30px', height: '30px', borderRadius: '10px',
                            background: rankGradients[i] || rankGradients[4],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '800', color: 'white', flexShrink: 0,
                            boxShadow: i < 3 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                          }}>{i + 1}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.name || item.itemName || 'Item'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                              {item.orders || item.count || 0} sold{item.revenue ? ` · ${formatCurrency(item.revenue, currencySymbol)}` : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Table Status */}
                {canAccess('tables') && (
                  <div style={{ ...cardStyle, cursor: 'pointer' }} onClick={() => navigateTo('/tables')}>
                    {sectionHeader(
                      <FaChair size={14} color="#6b7280" />,
                      'Table Status',
                      null, null
                    )}
                    {!tables || tables.total === 0 ? (
                      emptyState(<FaChair size={24} color="#e2e8f0" />, 'Add tables to see status here')
                    ) : (() => {
                      const occupancyPct = Math.round((tables.occupied / tables.total) * 100);
                      return (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '-28px', marginBottom: '12px' }}>
                            <span style={{
                              fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '12px',
                              background: occupancyPct >= 80 ? '#fef2f2' : '#ecfdf5',
                              color: occupancyPct >= 80 ? '#dc2626' : '#059669',
                            }}>{occupancyPct}% full</span>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                            <div style={{ flex: 1, background: '#ecfdf5', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                              <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>{tables.available}</div>
                              <div style={{ fontSize: '11px', fontWeight: '600', color: '#10b981', marginTop: '2px' }}>Available</div>
                            </div>
                            <div style={{ flex: 1, background: '#fef2f2', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                              <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626' }}>{tables.occupied}</div>
                              <div style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444', marginTop: '2px' }}>Occupied</div>
                            </div>
                          </div>
                          <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${occupancyPct}%`, height: '100%',
                              background: occupancyPct >= 80 ? 'linear-gradient(90deg, #ef4444, #dc2626)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                              borderRadius: '4px', transition: 'width 0.5s ease',
                            }} />
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px', textAlign: 'center' }}>
                            {tables.occupied} of {tables.total} tables in use
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function StatCard({ gradient, icon: Icon, value, label, sub, loading }) {
  return (
    <div className="home-stat-card" style={{
      background: gradient, borderRadius: '16px',
      padding: '22px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', bottom: '-8px', right: '-4px', opacity: 0.12, pointerEvents: 'none' }}>
        <Icon size={64} color="white" />
      </div>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'rgba(255,255,255,0.2)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', marginBottom: '12px',
      }}>
        <Icon size={16} color="white" />
      </div>
      <div style={{
        fontSize: '26px', fontWeight: '800', color: 'white',
        letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '4px',
        opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>{sub}</div>
    </div>
  );
}
