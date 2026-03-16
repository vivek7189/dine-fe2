'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUtensils, FaChartBar, FaClipboardList,
  FaChair, FaBoxes, FaBuilding, FaRobot,
  FaFire, FaReceipt, FaPlus, FaShoppingCart,
  FaRupeeSign, FaChartLine
} from 'react-icons/fa';
import { useLoading } from '../../../contexts/LoadingContext';
import apiClient from '../../../lib/api';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatCurrency(amount, symbol = '₹') {
  if (!amount && amount !== 0) return `${symbol}0`;
  return `${symbol}${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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
      try { setRestaurantName(JSON.parse(savedRestaurant).name || ''); } catch {}
    } else if (parsed.restaurant?.name) setRestaurantName(parsed.restaurant.name);
    const savedCurrency = localStorage.getItem('currencySymbol');
    if (savedCurrency) setCurrencySymbol(savedCurrency);
    loadStats(parsed);
  }, []);

  const loadStats = async (userData) => {
    setStatsLoading(true);
    try {
      const restaurantId = localStorage.getItem('selectedRestaurantId') || userData?.restaurantId;
      if (!restaurantId) { setStatsLoading(false); return; }
      const data = await apiClient.getAnalytics(restaurantId, 'today');
      if (data) setStats({ revenue: data.totalRevenue || data.revenue || 0, orders: data.totalOrders || data.orders || 0, avgOrder: data.avgOrderValue || data.averageOrderValue || 0 });
    } catch (err) { console.error('Error loading stats:', err); }
    finally { setStatsLoading(false); }
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

  const quickActions = [
    canAccess('dashboard') && { icon: FaReceipt, label: 'New Order', desc: 'Start billing', color: '#ef4444', bg: '#fef2f2', href: '/dashboard' },
    canAccess('tables') && { icon: FaChair, label: 'Tables', desc: 'Floor plan', color: '#3b82f6', bg: '#eff6ff', href: '/tables' },
    canAccess('kot') && { icon: FaFire, label: 'Kitchen', desc: 'Live KOT', color: '#f97316', bg: '#fff7ed', href: '/kot' },
    canAccess('menu') && { icon: FaUtensils, label: 'Menu', desc: 'Items & pricing', color: '#10b981', bg: '#ecfdf5', href: '/menu' },
    canAccess('history') && { icon: FaClipboardList, label: 'Orders', desc: 'Order history', color: '#f59e0b', bg: '#fffbeb', href: '/orderhistory' },
    canAccess('inventory') && { icon: FaBoxes, label: 'Inventory', desc: 'Stock levels', color: '#059669', bg: '#ecfdf5', href: '/inventory' },
    canAccess('analytics') && { icon: FaChartBar, label: 'Reports', desc: 'Analytics', color: '#8b5cf6', bg: '#f5f3ff', href: '/analytics' },
    user?.role === 'owner' && { icon: FaBuilding, label: 'Headquarters', desc: 'Command center', color: '#dc2626', bg: '#fef2f2', href: '/headquarters' },
    user?.role === 'owner' && { icon: FaRobot, label: 'DineAI', desc: 'AI insights', color: '#6366f1', bg: '#eef2ff', href: '/dineai' },
  ].filter(Boolean);

  if (!user) return null;

  return (
    <div style={{ padding: isMobile ? '24px 20px' : '32px 36px', minHeight: '100vh' }}>
      <style>{`
        .home-action-card { transition: all 0.2s ease; cursor: pointer; }
        .home-action-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); border-color: #d1d5db; }
      `}</style>

      {/* Heading — matches HQ page style */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '24px' : '32px', fontWeight: '800', color: '#111827',
            margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2,
          }}>
            {getGreeting()}, {firstName}
          </h1>
          <p style={{ fontSize: '15px', color: '#9ca3af', margin: '6px 0 0' }}>
            {restaurantName ? `${restaurantName} · ` : ''}Today&apos;s overview
          </p>
        </div>

        {/* Top right actions — matches HQ style */}
        {canAccess('dashboard') && (
          <button
            onClick={() => navigateTo('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 20px', borderRadius: '10px',
              background: '#ef4444', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600', color: 'white',
              boxShadow: '0 2px 8px rgba(239,68,68,0.2)',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
          >
            <FaPlus size={12} /> New Order
          </button>
        )}
      </div>

      {/* Stat cards — HQ style */}
      {showStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <HQStatCard icon={FaRupeeSign} value={statsLoading ? '—' : formatCurrency(stats?.revenue || 0, currencySymbol)} label="Revenue" color="#10b981" bg="#ecfdf5" loading={statsLoading} />
          <HQStatCard icon={FaShoppingCart} value={statsLoading ? '—' : (stats?.orders || 0)} label="Total Orders" color="#3b82f6" bg="#eff6ff" loading={statsLoading} />
          <HQStatCard icon={FaChartLine} value={statsLoading ? '—' : formatCurrency(stats?.avgOrder || 0, currencySymbol)} label="Avg Order Value" color="#f59e0b" bg="#fffbeb" loading={statsLoading} />
        </div>
      )}

      {/* Quick Actions */}
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>
        Quick Actions
      </h2>
      <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 20px 0' }}>
        Jump to any section
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: '16px',
      }}>
        {quickActions.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="home-action-card"
              onClick={() => navigateTo(item.href)}
              style={{
                background: 'white', borderRadius: '14px',
                border: '1px solid #e5e7eb', padding: isMobile ? '20px 16px' : '24px',
                position: 'relative', overflow: 'hidden',
              }}
            >
              <div style={{ position: 'absolute', top: '8px', right: '8px', opacity: 0.06, pointerEvents: 'none' }}>
                <Icon size={64} color={item.color} />
              </div>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', background: item.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
              }}>
                <Icon size={18} color={item.color} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{item.label}</div>
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>{item.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HQStatCard({ icon: Icon, value, label, color, bg, loading }) {
  return (
    <div style={{
      background: 'white', borderRadius: '14px', border: '1px solid #e5e7eb',
      padding: '24px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: '12px', right: '12px', opacity: 0.06, pointerEvents: 'none' }}>
        <Icon size={56} color={color} />
      </div>
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{
        fontSize: '30px', fontWeight: '800', color: '#111827',
        letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '6px',
        opacity: loading ? 0.25 : 1, transition: 'opacity 0.3s',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '500' }}>{label}</div>
    </div>
  );
}
