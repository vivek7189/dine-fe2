'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  FaUtensils, FaChartBar, FaClipboardList,
  FaChair, FaBoxes, FaBuilding, FaRobot,
  FaFire, FaReceipt, FaPlus, FaShoppingCart,
  FaChartLine, FaArrowRight, FaStore,
  FaClock, FaUsers, FaCircle, FaStar,
  FaHashtag, FaTrophy, FaRocket
} from 'react-icons/fa';
import { useLoading } from '../../../contexts/LoadingContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import apiClient from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { setCachedData, getCachedData } from '../../../lib/offlineDb';
import OfflineBanner from '../../../components/OfflineBanner';

// ─── Onboarding Checklist Widget ─────────────────────────────
function OnboardingChecklist({ onDismiss }) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('onboardingChecklist');
      if (!raw) return;
      const data = JSON.parse(raw);
      // Auto-dismiss after 14 days
      if (data.completedAt) {
        const daysSince = (Date.now() - data.completedAt) / (1000 * 60 * 60 * 24);
        if (daysSince > 14) { localStorage.removeItem('onboardingChecklist'); return; }
      }
      setChecklist(data);
    } catch {}
  }, []);

  if (!checklist || dismissed) return null;

  const items = [
    { key: 'account', label: t('home.accountCreated'), done: true },
    { key: 'businessType', label: `${checklist.businessType ? checklist.businessType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Business type'} ${t('home.selected')}`, done: !!checklist.businessType },
    { key: 'restaurant', label: t('home.restaurantDetailsSaved'), done: !!checklist.restaurantName },
    { key: 'features', label: t('home.featuresConfigured'), done: checklist.featuresConfigured },
    { key: 'menu', label: `${t('home.menuLoaded')}${checklist.menuItemCount ? ` (${checklist.menuItemCount} ${t('common.items')})` : ''}`, done: checklist.menuSetup },
    { key: 'firstOrder', label: t('home.takeYourFirstOrder'), done: false, href: '/dashboard' },
    { key: 'printer', label: t('home.setUpPrinter'), done: false, href: '/admin?tab=print' },
    { key: 'staff', label: t('home.inviteStaff'), done: false, href: '/admin?tab=staff' },
  ];

  const completedCount = items.filter(i => i.done).length;
  const progress = Math.round((completedCount / items.length) * 100);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.removeItem('onboardingChecklist');
    if (onDismiss) onDismiss();
  };

  return (
    <div style={{
      background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px 24px',
      marginBottom: '20px', position: 'relative',
    }}>
      <style>{`
        @keyframes checkIn { from { transform: scale(0); } to { transform: scale(1); } }
        .checklist-check { animation: checkIn 0.3s ease forwards; }
      `}</style>

      {/* Dismiss button */}
      <button onClick={handleDismiss} style={{
        position: 'absolute', top: '12px', right: '12px',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '18px', color: '#94a3b8', lineHeight: 1,
      }} title="Dismiss">&times;</button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <FaRocket size={16} color="#ef4444" />
        <span style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{t('home.setupProgress')}</span>
        <span style={{
          fontSize: '12px', fontWeight: '700', padding: '2px 10px', borderRadius: '10px',
          background: progress === 100 ? '#ecfdf5' : '#fef3c7',
          color: progress === 100 ? '#059669' : '#d97706',
          marginLeft: 'auto',
        }}>{progress}%</span>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#f1f5f9', borderRadius: '4px', height: '6px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: 'linear-gradient(90deg, #ef4444, #f97316)',
          borderRadius: '4px', transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Checklist items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => { if (!item.done && item.href) router.push(item.href); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 10px', borderRadius: '8px',
              background: item.done ? '#f0fdf4' : '#f8fafc',
              cursor: !item.done && item.href ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
          >
            <div className={item.done ? 'checklist-check' : ''} style={{
              width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: item.done ? '#10b981' : '#e2e8f0',
              color: 'white', fontSize: '10px',
            }}>
              {item.done ? '✓' : ''}
            </div>
            <span style={{
              fontSize: '13px', fontWeight: item.done ? '500' : '600',
              color: item.done ? '#6b7280' : '#1f2937',
              textDecoration: item.done ? 'line-through' : 'none',
            }}>{item.label}</span>
            {!item.done && item.href && (
              <FaArrowRight size={10} color="#94a3b8" style={{ marginLeft: 'auto' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Dynamically import HQ content (only loaded for owner/admin)
const HeadquartersContent = dynamic(
  () => import('../headquarters/page').then(mod => mod.HeadquartersContent),
  {
    loading: () => (
      <div style={{
        minHeight: '100vh', background: '#f8fafc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid #f3f4f6', borderTop: '3px solid #ef4444',
          borderRadius: '50%', animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    ),
    ssr: false,
  }
);

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return t('home.goodMorning');
  if (hour < 17) return t('home.goodAfternoon');
  return t('home.goodEvening');
}

function getRoleMessage(role) {
  if (role === 'manager') return t('home.managerMessage');
  if (role === 'waiter') return t('home.waiterMessage');
  return t('home.defaultMessage');
}

function formatCurrencyLocal(amount, symbol = '₹') {
  if (!amount && amount !== 0) return `${symbol}0`;
  return `${symbol}${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
  if (mins < 1) return t('home.justNow');
  if (mins < 60) return t('home.minsAgo', { mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('home.hrsAgo', { hrs });
  return t('home.daysAgo', { days: Math.floor(hrs / 24) });
}

function formatTime(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function HomePage() {
  const router = useRouter();
  const { startLoading } = useLoading();
  const { getCurrencySymbol } = useCurrency();
  const [user, setUser] = useState(null);
  const [pageAccess, setPageAccess] = useState(null);
  const [notAllowedPages, setNotAllowedPages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [isBar, setIsBar] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [tables, setTables] = useState(null);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Use apiClient to check auth (checks cookies + localStorage for cross-tab support)
    if (!apiClient.isAuthenticated()) { router.push('/login'); return; }
    const parsed = apiClient.getUser();
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
    setCurrencySymbol(getCurrencySymbol());

    // Only load data for non-owner/admin (HQ handles its own data)
    if (parsed.role !== 'owner' && parsed.role !== 'admin') {
      loadRecentOrders(parsed);
      loadTables(parsed);
    }
  }, []);

  const loadRecentOrders = async (userData) => {
    try {
      const restaurantId = localStorage.getItem('selectedRestaurantId') || userData?.restaurantId;
      if (!restaurantId) return;
      const data = await apiClient.getOrders(restaurantId, { limit: 5, sort: 'newest' });
      if (data?.orders) {
        const orders = data.orders.slice(0, 5);
        setRecentOrders(orders);
        setCachedData('home_orders_' + restaurantId, orders).catch(() => {});
      }
    } catch (err) {
      console.error('Error loading recent orders:', err);
      try {
        const restaurantId = localStorage.getItem('selectedRestaurantId') || userData?.restaurantId;
        if (!restaurantId) return;
        const cached = await Promise.race([
          getCachedData('home_orders_' + restaurantId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ]);
        if (cached) setRecentOrders(cached);
      } catch { /* no cached data */ }
    }
  };

  const loadTables = async (userData) => {
    try {
      const restaurantId = localStorage.getItem('selectedRestaurantId') || userData?.restaurantId;
      if (!restaurantId) return;
      const data = await apiClient.getTables(restaurantId);
      if (data?.tables) {
        const total = data.tables.length;
        const occupied = data.tables.filter(t => t.status === 'occupied' || t.status === 'reserved').length;
        const tableData = { total, occupied, available: total - occupied };
        setTables(tableData);
        setCachedData('home_tables_' + restaurantId, tableData).catch(() => {});
      }
    } catch (err) {
      console.error('Error loading tables:', err);
      try {
        const restaurantId = localStorage.getItem('selectedRestaurantId') || userData?.restaurantId;
        if (!restaurantId) return;
        const cached = await Promise.race([
          getCachedData('home_tables_' + restaurantId),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
        ]);
        if (cached) setTables(cached);
      } catch { /* no cached data */ }
    }
  };

  const navigateTo = (href) => {
    router.push(href);
  };

  const canAccess = (key) => {
    if (!user) return false;
    if (user.role === 'owner' || user.role === 'admin') return true;
    const idMap = { dashboard: 'pos', history: 'orders', tables: 'tables', menu: 'menu', analytics: 'analytics', inventory: 'inventory', kot: 'kot', admin: 'admin', customers: 'customers' };
    if (notAllowedPages?.includes(idMap[key] || key)) return false;
    if (user.role === 'waiter') return ['dashboard', 'tables', 'history', 'kot'].includes(key);
    if (['employee', 'manager', 'cashier', 'sales'].includes(user.role)) {
      if (pageAccess) {
        const accessMap = { dashboard: 'dashboard', history: 'history', tables: 'tables', menu: 'menu', analytics: 'analytics', inventory: 'inventory', kot: 'kot', admin: 'admin', customers: 'customers' };
        return accessMap[key] ? !!pageAccess[accessMap[key]] : false;
      }
      return ['dashboard', 'tables', 'history', 'menu'].includes(key);
    }
    return false;
  };

  // Owner and admin (co-owner) both see the full Headquarters dashboard.
  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';

  if (!user) return null;

  // Owner/Admin: render the full Headquarters dashboard
  if (isOwnerOrAdmin) {
    const hasChecklist = typeof window !== 'undefined' && localStorage.getItem('onboardingChecklist');
    return (
      <>
        {hasChecklist && (
          <div style={{ padding: '20px 20px 0' }}>
            <OnboardingChecklist />
          </div>
        )}
        <HeadquartersContent embedded />
      </>
    );
  }

  // Other roles: simplified home page with quick actions + recent data
  const firstName = user?.name?.split(' ')[0] || 'there';
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const posPath = isBar ? '/dashboard/bar' : '/dashboard';

  const quickActions = [
    canAccess('dashboard') && {
      icon: FaReceipt, label: isBar ? t('home.barPOS') : t('home.startOrder'),
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', href: posPath,
    },
    canAccess('tables') && {
      icon: FaChair, label: t('home.tables'),
      gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)', href: '/tables',
    },
    canAccess('kot') && {
      icon: FaFire, label: t('home.kitchen'),
      gradient: 'linear-gradient(135deg, #f97316, #ea580c)', href: '/kot',
    },
    canAccess('menu') && {
      icon: FaUtensils, label: t('home.menu'),
      gradient: 'linear-gradient(135deg, #10b981, #059669)', href: '/menu',
    },
    canAccess('history') && {
      icon: FaClipboardList, label: t('home.orders'),
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', href: '/orderhistory',
    },
  ].filter(Boolean);

  const statusColors = {
    completed: { bg: '#ecfdf5', color: '#059669', label: t('home.paid') },
    pending: { bg: '#fffbeb', color: '#d97706', label: t('home.pending') },
    preparing: { bg: '#eff6ff', color: '#2563eb', label: t('home.preparing') },
    served: { bg: '#f0fdf4', color: '#16a34a', label: t('home.served') },
    cancelled: { bg: '#fef2f2', color: '#dc2626', label: t('home.cancelled') },
    saved: { bg: '#f1f5f9', color: '#64748b', label: t('home.saved') },
  };

  const typeIcons = {
    'dine in': { icon: FaChair, color: '#3b82f6', bg: '#eff6ff' },
    'dine_in': { icon: FaChair, color: '#3b82f6', bg: '#eff6ff' },
    'takeaway': { icon: FaShoppingCart, color: '#f59e0b', bg: '#fffbeb' },
    'take away': { icon: FaShoppingCart, color: '#f59e0b', bg: '#fffbeb' },
    'delivery': { icon: FaArrowRight, color: '#10b981', bg: '#ecfdf5' },
    'online': { icon: FaStore, color: '#8b5cf6', bg: '#f5f3ff' },
  };

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

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '32px 40px', minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        .home-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .home-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
        .order-row { transition: background 0.15s; }
        .order-row:hover { background: #f8fafc !important; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-in { animation: fadeInUp 0.4s ease forwards; }
      `}</style>

      <OfflineBanner />

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
            {getRoleMessage(user?.role)}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <FaPlus size={11} /> {t('home.startTakingOrders')}
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-in" style={{
        display: 'flex', gap: '10px', flexWrap: 'wrap',
        marginBottom: '24px', animationDelay: '0.1s',
      }}>
        {quickActions.map((item) => {
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

      {/* Content grid — Recent Orders + Table Status */}
      <div className="animate-in" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : (canAccess('tables') ? '1.5fr 1fr' : '1fr'),
        gap: '20px',
        animationDelay: '0.2s',
      }}>
        {/* Recent Orders */}
        {canAccess('history') && (
          <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>
              {sectionHeader(
                <FaClock size={14} color="#6b7280" />,
                t('home.recentOrders'),
                t('home.viewAll'),
                () => navigateTo('/orderhistory')
              )}
            </div>
            {recentOrders.length === 0 ? (
              emptyState(<FaClipboardList size={24} color="#e2e8f0" />, t('home.noOrdersYet'))
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
                          {formatCurrencyLocal(total, currencySymbol)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Table Status */}
        {canAccess('tables') && (
          <div style={{ ...cardStyle, cursor: 'pointer' }} onClick={() => navigateTo('/tables')}>
            {sectionHeader(
              <FaChair size={14} color="#6b7280" />,
              t('home.tableStatus'),
              null, null
            )}
            {!tables || tables.total === 0 ? (
              emptyState(<FaChair size={24} color="#e2e8f0" />, t('home.addTablesToSee'))
            ) : (() => {
              const occupancyPct = Math.round((tables.occupied / tables.total) * 100);
              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '-28px', marginBottom: '12px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '12px',
                      background: occupancyPct >= 80 ? '#fef2f2' : '#ecfdf5',
                      color: occupancyPct >= 80 ? '#dc2626' : '#059669',
                    }}>{t('home.percentFull', { percent: occupancyPct })}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ flex: 1, background: '#ecfdf5', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669' }}>{tables.available}</div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#10b981', marginTop: '2px' }}>{t('home.available')}</div>
                    </div>
                    <div style={{ flex: 1, background: '#fef2f2', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626' }}>{tables.occupied}</div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#ef4444', marginTop: '2px' }}>{t('home.occupied')}</div>
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
                    {t('home.tablesInUse', { occupied: tables.occupied, total: tables.total })}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
