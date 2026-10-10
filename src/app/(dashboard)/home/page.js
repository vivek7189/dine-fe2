'use client';

import { useState, useEffect } from 'react';
import { orderDisplayNumber } from '../../../utils/orderNumber';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  FaUtensils, FaChartBar, FaClipboardList,
  FaChair, FaBoxes, FaBuilding, FaRobot,
  FaFire, FaReceipt, FaPlus, FaShoppingCart,
  FaChartLine, FaArrowRight, FaStore,
  FaClock, FaUsers, FaCircle, FaStar,
  FaHashtag, FaTrophy, FaCashRegister, FaMoneyBillWave
} from 'react-icons/fa';
import { useLoading } from '../../../contexts/LoadingContext';
import { useCurrency } from '../../../contexts/CurrencyContext';
import apiClient from '../../../lib/api';
import { t } from '../../../lib/i18n';
import { setCachedData, getCachedData } from '../../../lib/offlineDb';
import OfflineBanner from '../../../components/OfflineBanner';
import UpdateBanner from '../../../components/UpdateBanner';
import StaffAlertsCard from '../../../components/StaffAlertsCard';
import MeetingsHomeCard from '../../../components/meetings/MeetingsHomeCard';
import UpcomingEventsCard from '../../../components/calendar/UpcomingEventsCard';
import GetStartedCard from '../../../components/GetStartedCard';
import { useDineBot } from '../../../components/DineBotProvider';

// Safe hooks that return no-ops when providers are missing (e.g. mobile embed)
function useSafeLoading() {
  try { return useLoading(); } catch { return { startLoading: () => {} }; }
}
function useSafeDineBot() {
  try { return useDineBot(); } catch { return { openDineBot: () => {} }; }
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
  // Render in the restaurant's timezone when configured, so order times read the same
  // for every viewer (e.g. an owner abroad sees restaurant-local time, not device time).
  const tz = apiClient.getRestaurantTimezone ? apiClient.getRestaurantTimezone() : null;
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, ...(tz ? { timeZone: tz } : {}) });
}

// Restaurant-wide money (yesterday's sales, unsettled orders) is for the people who run the
// business: owner / admin / co-owner / manager, or a staff member given Analytics access. Waiters,
// cashiers, supervisors… don't see other people's sales on their home screen (web + app WebView).
function canSeeBusinessTotals(user, pageAccess) {
  const role = String(user?.role || '').toLowerCase();
  if (['owner', 'admin', 'co-owner', 'manager', 'super-admin', 'super_admin'].includes(role)) return true;
  const a = pageAccess && pageAccess.analytics;
  return a === true || !!(a && typeof a === 'object' && Object.values(a).some(Boolean));
}

// "Your sales today" — a staff member's OWN billed sales (the server checkout figures), shown to
// staff who don't see the restaurant's totals. Server-side: only orders they took.
function MySalesCard({ currencySymbol = '₹' }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    let cancelled = false;
    const rid = (() => { try { return localStorage.getItem('selectedRestaurantId'); } catch { return null; } })();
    if (!rid) return undefined;
    apiClient.getMySales(rid, 'today').then(r => { if (!cancelled && r && r.success) setD(r); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  if (!d) return null;
  const money = `${currencySymbol}${Math.round(d.sales || 0).toLocaleString()}`;
  return (
    <div className="animate-in" style={{ marginBottom: '20px', borderRadius: '14px', padding: '14px 16px', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', border: '1px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your sales today</div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: '#1e1b4b', marginTop: '2px' }}>{money}</div>
      </div>
      <div style={{ fontSize: '12px', color: '#4c1d95', textAlign: 'right' }}>
        <div><strong>{d.orders || 0}</strong> billed order{d.orders === 1 ? '' : 's'}</div>
        {d.openOrders > 0 && <div><strong>{d.openOrders}</strong> still open · {currencySymbol}{Math.round(d.openAmount || 0).toLocaleString()}</div>}
        {d.tips > 0 && <div>Tips {currencySymbol}{Math.round(d.tips).toLocaleString()}</div>}
      </div>
    </div>
  );
}

// Yesterday's-sales recap — the retention reward. When an owner comes back and
// yesterday had sales, greet them with the RESULT ("Yesterday you made ₹X") — this
// reinforces the habit loop that brings them back on day 2+. Read-only, self-gating
// (only shows if yesterday actually had revenue), dismissible once per day.
function YesterdayRecap({ currencySymbol = '₹' }) {
  const [data, setData] = useState(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rid = localStorage.getItem('selectedRestaurantId');
        if (!rid) return;
        const y = new Date(); y.setDate(y.getDate() - 1);
        const ymd = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
        if (localStorage.getItem('yesterdayRecapDismissed') === ymd) return; // dismissed today already
        const res = await apiClient.getDailySummary(rid, { period: 'yesterday' });
        const s = res && res.summary;
        const rev = s ? (s.totalRevenueWithTax || s.totalRevenue || 0) : 0;
        if (!cancelled && s && rev > 0) {
          const p = Array.isArray(s.popularItems) ? s.popularItems[0] : null;
          setData({ rev, orders: s.totalOrders || 0, top: p ? (p.name || p.itemName || null) : null, ymd });
        }
      } catch { /* advisory only — never block Home */ }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!data || hidden) return null;
  const dismiss = () => { try { localStorage.setItem('yesterdayRecapDismissed', data.ymd); } catch {} setHidden(true); };
  const money = `${currencySymbol}${Math.round(data.rev).toLocaleString()}`;
  return (
    <div className="animate-in" style={{ marginBottom: '20px', borderRadius: '14px', border: '1px solid #bbf7d0', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>🎉</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>Yesterday you made {money} · {data.orders} order{data.orders !== 1 ? 's' : ''}</div>
          <div style={{ fontSize: '12px', color: '#15803d' }}>{data.top ? `Top seller: ${data.top}. ` : ''}Keep it going — ring today’s first sale.</div>
        </div>
      </div>
      <button onClick={dismiss} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '18px', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>×</button>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { startLoading } = useSafeLoading();
  const { getCurrencySymbol } = useCurrency();
  const { openDineBot } = useSafeDineBot();
  const [user, setUser] = useState(null);
  const [pageAccess, setPageAccess] = useState(null);
  const [notAllowedPages, setNotAllowedPages] = useState([]);
  // Cash systems this restaurant uses (posSettings) — for the Shifts & Cash / Register shortcuts.
  const [cashFlags, setCashFlags] = useState({ shifts: false, register: false });
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileEmbed, setIsMobileEmbed] = useState(false); // true inside dine-app WebView
  const [restaurantName, setRestaurantName] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [isBar, setIsBar] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [tables, setTables] = useState(null);
  const [openSummary, setOpenSummary] = useState(null); // unsettled open orders indicator
  useEffect(() => {
    // Electron is always a desktop POS terminal — never use mobile layout
    if (typeof window !== 'undefined' && window.electronAPI) {
      setIsMobile(false);
      return;
    }
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Detect the dine-app WebView (set in useEffect to avoid SSR hydration mismatch)
    if (typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__) setIsMobileEmbed(true);
  }, []);

  useEffect(() => {
    // Use apiClient to check auth (checks cookies + localStorage for cross-tab support)
    // Skip login redirect in mobile embed — auth is injected via WebView
    if (!apiClient.isAuthenticated() && !window.__DINEOPEN_MOBILE_EMBED__) { router.push('/login'); return; }
    const parsed = apiClient.getUser();
    setUser(parsed);
    const cachedAccess = localStorage.getItem('navPageAccess');
    let accessNow = null;
    try { accessNow = cachedAccess ? JSON.parse(cachedAccess) : null; } catch (_) { accessNow = null; }
    if (accessNow) setPageAccess(accessNow);
    const cachedNotAllowed = localStorage.getItem('navNotAllowedPages');
    if (cachedNotAllowed) setNotAllowedPages(JSON.parse(cachedNotAllowed));
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    if (savedRestaurant) {
      try {
        const r = JSON.parse(savedRestaurant);
        setRestaurantName(r.name || '');
        if (r.businessType === 'bar') setIsBar(true);
        setCashFlags({ shifts: !!r.posSettings?.enableShiftsCash, register: !!r.posSettings?.requireRegisterOpen });
      } catch {}
    } else if (parsed.restaurant) {
      setRestaurantName(parsed.restaurant.name || '');
      if (parsed.restaurant.businessType === 'bar') setIsBar(true);
      setCashFlags({ shifts: !!parsed.restaurant.posSettings?.enableShiftsCash, register: !!parsed.restaurant.posSettings?.requireRegisterOpen });
    }
    setCurrencySymbol(getCurrencySymbol());

    // Only load data for non-owner/admin (HQ handles its own data)
    if (parsed.role !== 'owner' && parsed.role !== 'admin') {
      loadRecentOrders(parsed);
      loadTables(parsed);
    }
    if (canSeeBusinessTotals(parsed, accessNow)) loadOpenSummary(parsed);
  }, []);

  const loadOpenSummary = async (userData) => {
    try {
      const rid = localStorage.getItem('selectedRestaurantId') || userData?.restaurantId;
      if (!rid) return;
      // Short 60s client cache just to dedupe rapid re-mounts; the server endpoint is Redis-cached
      // with version-counter invalidation, so it stays fresh & cheap (no per-load Firestore scan).
      const cacheKey = 'openSummary_' + rid;
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (cached && Date.now() - cached.t < 60 * 1000) { setOpenSummary(cached.s); return; }
      } catch (_) {}
      const res = await apiClient.getOpenOrders(rid);
      if (res?.summary) {
        setOpenSummary(res.summary);
        try { localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), s: res.summary })); } catch (_) {}
      }
    } catch (_) { /* non-blocking */ }
  };

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
    // In mobile embed, prefix with /mobile to stay within the mobile layout
    if (typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__ && href && !href.startsWith('/mobile')) {
      router.push('/mobile' + href);
      return;
    }
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
    return (
      <>
        <GetStartedCard />
        <UpcomingEventsCard restaurantId={typeof window !== 'undefined' ? (localStorage.getItem('selectedRestaurantId') || user?.restaurantId) : null}
          style={{ margin: isMobile ? '12px 12px 0' : '20px 24px 0' }} />
        <HeadquartersContent embedded />
      </>
    );
  }

  // Other roles: simplified home page with quick actions + recent data
  const firstName = user?.name?.split(' ')[0] || 'there';
  const _homeTz = apiClient.getRestaurantTimezone ? apiClient.getRestaurantTimezone() : null;
  const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', ...(_homeTz ? { timeZone: _homeTz } : {}) });
  const posPath = isBar ? '/dashboard/bar' : '/dashboard';

  // Same rule as the page guard (layout canAccessPage): owner/admin always; waiters may open these
  // pages (not owner-lockable for waiters); other staff by their page access ('shifts' = Shifts &
  // Cash, 'completeBill' = Register).
  const canOpenPage = (key, pageId) => {
    if (!user) return false;
    if (notAllowedPages?.includes(key) || (pageId && notAllowedPages?.includes(pageId))) return false;
    if (user.role === 'owner' || user.role === 'admin') return true;
    if (user.role === 'waiter') return true;
    const v = pageAccess ? pageAccess[key] : undefined;
    if (v && typeof v === 'object') return Object.values(v).some(Boolean);
    return !!v;
  };

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
    // Open / close your shift and cash drawer — only where the restaurant uses Shifts & Cash.
    cashFlags.shifts && canOpenPage('shifts', 'shifts-cash') && {
      icon: FaMoneyBillWave, label: 'Shifts & Cash',
      gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', href: '/shifts-cash',
    },
    // Open / close the cash register — only where billing needs an open register.
    cashFlags.register && canOpenPage('completeBill', 'register') && {
      icon: FaCashRegister, label: 'Register',
      gradient: 'linear-gradient(135deg, #16a34a, #15803d)', href: '/register',
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

      {/* App-update banner (desktop only, dismissible) */}
      <UpdateBanner />

      {/* Yesterday's-sales recap — retention reward when they come back */}
      {canSeeBusinessTotals(user, pageAccess) && <YesterdayRecap currencySymbol={currencySymbol} />}
      {user && !canSeeBusinessTotals(user, pageAccess) && <MySalesCard currencySymbol={currencySymbol} />}

      {/* Open (unsettled) orders indicator — tap to resolve on the Open Orders page */}
      {openSummary && openSummary.count > 0 && canSeeBusinessTotals(user, pageAccess) && (
        <div onClick={() => navigateTo('/open-orders')} className="animate-in" style={{ cursor: 'pointer', marginBottom: '20px', borderRadius: '14px', border: '1px solid #fde68a', background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px' }}>⚠️</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#92400e' }}>{openSummary.count} open order{openSummary.count !== 1 ? 's' : ''} not settled · {currencySymbol}{Math.round(openSummary.amount || 0).toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#a16207' }}>{openSummary.agedCount > 0 ? `${openSummary.agedCount} carried over from earlier days (oldest ${openSummary.oldestDays}d) — ` : ''}Not counted in sales. Tap to settle or void.</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#b45309', whiteSpace: 'nowrap' }}>Review →</div>
        </div>
      )}

      {/* Staff alerts — birthdays + annual leave (owner / admins / managers; hidden for others) */}
      {['owner', 'admin', 'co-owner', 'manager'].includes(String(user?.role || '').toLowerCase()) && (
        <StaffAlertsCard restaurantId={typeof window !== 'undefined' ? (localStorage.getItem('selectedRestaurantId') || user?.restaurantId) : null} isMobile={isMobile}
          canEditSettings={['owner', 'admin', 'co-owner'].includes(String(user?.role || '').toLowerCase())} />
      )}

      {/* Staff meetings: next meeting / minutes to read (anyone invited; hidden when nothing) */}
      <MeetingsHomeCard restaurantId={typeof window !== 'undefined' ? (localStorage.getItem('selectedRestaurantId') || user?.restaurantId) : null} />

      {/* Upcoming festivals / holidays / own events (hidden when the calendar isn't available) */}
      <UpcomingEventsCard restaurantId={typeof window !== 'undefined' ? (localStorage.getItem('selectedRestaurantId') || user?.restaurantId) : null} />

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
          {canAccess('dashboard') && !isMobileEmbed && (
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
          {/* DineBot AI */}
          <button
            onClick={() => {
              const r = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}');
              if (r?.id) openDineBot(r.id);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', borderRadius: '12px',
              background: 'white', border: '1.5px solid #fecaca',
              cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              color: '#ef4444', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#fecaca'; }}
          >
            <FaRobot size={14} /> DineBot
          </button>
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
                  const orderNum = orderDisplayNumber(order);
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
