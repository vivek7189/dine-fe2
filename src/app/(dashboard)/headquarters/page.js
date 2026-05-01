'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../lib/api';
import { useCurrency } from '../../../contexts/CurrencyContext';
import {
  AreaChart as RechartsAreaChart, Area, BarChart as RechartsBarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  FaStore,
  FaChartLine,
  FaUsers,
  FaUtensils,
  FaBoxes,
  FaSearch,
  FaCalendarAlt,
  FaChevronDown,
  FaSpinner,
  FaExclamationTriangle,
  FaTimesCircle,
  FaRupeeSign,
  FaShoppingCart,
  FaSyncAlt,
  FaTimes,
  FaCheck,
  FaBuilding,
  FaRobot,
  FaLightbulb,
  FaBell,
  FaEnvelope,
  FaCog,
  FaTrophy,
  FaFire,
  FaClock,
  FaChartBar,
  FaChartPie,
  FaExternalLinkAlt,
  FaMagic,
  FaSitemap,
  FaClipboardList,
  FaWarehouse,
  FaIndustry,
  FaFileAlt
} from 'react-icons/fa';
import OrganizationSetupTab from './components/OrganizationSetupTab';
import CentralMenuTab from './components/CentralMenuTab';
import WarehouseTab from './components/WarehouseTab';
import CentralKitchenTab from './components/CentralKitchenTab';
import HQReportsTab from './components/HQReportsTab';

// ============================================
// HEADQUARTERS - Owner Command Center
// Modern dashboard with AI insights
// ============================================

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Animated number component
const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 500;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{typeof display === 'number' ? display.toLocaleString() : display}{suffix}</>;
};

// Mini sparkline chart
const Sparkline = ({ data = [], color = '#ef4444', height = 40 }) => {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,100 ${points} 100,100`}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
    </svg>
  );
};

// Donut chart for order types
const DonutChart = ({ data = [], size = 120 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulative = 0;
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        {data.map((item, i) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          const offset = cumulative;
          cumulative += percentage;
          return (
            <circle
              key={i}
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth="3"
              strokeDasharray={`${percentage} ${100 - percentage}`}
              strokeDashoffset={-offset}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          );
        })}
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937' }}>{total}</div>
        <div style={{ fontSize: '10px', color: '#6b7280' }}>orders</div>
      </div>
    </div>
  );
};

export function HeadquartersContent({ embedded = false }) {
  const router = useRouter();
  const { formatCurrency } = useCurrency();

  // Auth state
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Data state
  const [dashboardData, setDashboardData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [staffData, setStaffData] = useState({ staff: [], pagination: {} });
  const [menuData, setMenuData] = useState({ menuItems: [], categories: [], pagination: {} });
  const [inventoryData, setInventoryData] = useState({ inventory: [], alerts: {}, categories: [], pagination: {} });

  // Organization / enterprise state
  const [orgData, setOrgData] = useState(null);
  const [orgOutlets, setOrgOutlets] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);

  // Filter state - load from localStorage
  const [selectedRestaurants, setSelectedRestaurants] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hq_selected_restaurants');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [dateRange, setDateRange] = useState({ preset: 'today', startDate: '', endDate: '' });
  const [staffFilters, setStaffFilters] = useState({ role: '', status: '', search: '' });
  const [menuFilters, setMenuFilters] = useState({ category: '', search: '' });
  const [inventoryFilters, setInventoryFilters] = useState({ stockStatus: '', category: '', search: '' });

  // Pagination
  const [staffPage, setStaffPage] = useState(1);
  const [menuPage, setMenuPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const STAFF_PAGE_SIZE = 50;
  const MENU_PAGE_SIZE = 100;
  const INVENTORY_PAGE_SIZE = 50;

  // Business type for CTA routing
  const [businessType, setBusinessType] = useState('restaurant');

  // Tab loading states
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);

  // UI state
  const [refreshing, setRefreshing] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [showRestaurantDropdown, setShowRestaurantDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showInsightsPanel, setShowInsightsPanel] = useState(false);
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [emailPreferences, setEmailPreferences] = useState({
    emailEnabled: false,
    reportEmail: '',
    timezone: 'Asia/Kolkata',
    reportTime: '08:00'
  });
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);
  const [aiInsightsRemaining, setAiInsightsRemaining] = useState(10);

  // Debounced search
  const debouncedStaffSearch = useDebounce(staffFilters.search, 300);
  const debouncedMenuSearch = useDebounce(menuFilters.search, 300);
  const debouncedInventorySearch = useDebounce(inventoryFilters.search, 300);

  // Refs
  const restaurantDropdownRef = useRef(null);
  const datePickerRef = useRef(null);

  // Auth check — synchronous, no API calls, renders page shell immediately
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    if (!storedUser || !token) {
      if (!embedded) router.push('/login');
      return;
    }
    try {
      const userData = JSON.parse(storedUser);
      if (userData.role !== 'owner' && userData.role !== 'admin') {
        if (!embedded) router.push('/home');
        return;
      }
      setUser(userData);
      setAuthorized(true);
      setLoading(false); // Show page shell immediately
      setEmailPreferences(prev => ({ ...prev, reportEmail: userData.email || '' }));
      // Read business type for CTA routing
      try {
        const savedR = localStorage.getItem('selectedRestaurant');
        if (savedR) { const r = JSON.parse(savedR); if (r.businessType) setBusinessType(r.businessType); }
      } catch {};
    } catch (error) {
      console.error('Auth check error:', error);
      if (!embedded) router.push('/login');
    }
  }, [router, embedded]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save selected restaurants to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedRestaurants.length > 0) {
        localStorage.setItem('hq_selected_restaurants', JSON.stringify(selectedRestaurants));
      } else {
        localStorage.removeItem('hq_selected_restaurants'); // Clear when all selected
      }
    }
  }, [selectedRestaurants]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (restaurantDropdownRef.current && !restaurantDropdownRef.current.contains(e.target)) {
        setShowRestaurantDropdown(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load dashboard — P0 critical, has restaurant list + totals
  const loadDashboard = async () => {
    try {
      const params = {};
      if (dateRange.preset === 'custom' && dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      } else {
        params.period = dateRange.preset;
      }
      const response = await apiClient.getOwnerDashboard(params);
      if (response.success) {
        setDashboardData(response);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  // Load analytics — P1, has charts/trends
  const loadAnalytics = async () => {
    try {
      const params = { restaurantIds: selectedRestaurants.length > 0 ? selectedRestaurants : undefined };
      if (dateRange.preset === 'custom' && dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      } else {
        params.period = dateRange.preset;
      }
      const response = await apiClient.getOwnerAnalytics(params);
      if (response.success) {
        setAnalyticsData(response.analytics);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  // Wrapper for manual refresh button — shows spinner while both load
  const refreshAll = async () => {
    setRefreshing(true);
    await Promise.all([loadDashboard(), loadAnalytics()]);
    setRefreshing(false);
  };

  // Load AI insights
  const loadAIInsights = async () => {
    if (aiInsightsRemaining <= 0) {
      alert('You have reached the daily limit of 10 AI insights. Please try again tomorrow.');
      return;
    }
    try {
      setLoadingInsights(true);
      const response = await apiClient.getAIInsights({
        period: dateRange.preset,
        restaurantIds: selectedRestaurants.length > 0 ? selectedRestaurants : undefined
      });
      if (response.success) {
        setAiInsights(response.insights);
        setShowInsightsPanel(true);
        if (response.remaining !== undefined) {
          setAiInsightsRemaining(response.remaining);
        }
      } else if (response.error === 'Daily limit exceeded') {
        setAiInsightsRemaining(0);
        alert('You have reached the daily limit of 10 AI insights. Please try again tomorrow.');
      }
    } catch (error) {
      console.error('Error loading AI insights:', error);
      if (error.message?.includes('limit')) {
        setAiInsightsRemaining(0);
      }
    } finally {
      setLoadingInsights(false);
    }
  };

  // Load email preferences
  const loadEmailPreferences = async () => {
    try {
      const response = await apiClient.getEmailPreferences();
      if (response.success && response.preferences) {
        setEmailPreferences(response.preferences);
      }
    } catch (error) {
      console.error('Error loading email preferences:', error);
    }
  };

  // Load AI insights usage
  const loadAIUsage = async () => {
    try {
      const response = await apiClient.getAIUsage();
      if (response.success) {
        setAiInsightsRemaining(response.remaining);
      }
    } catch (error) {
      console.error('Error loading AI usage:', error);
    }
  };

  // Save email preferences
  const saveEmailPreferences = async () => {
    try {
      await apiClient.updateEmailPreferences(emailPreferences);
      setShowEmailModal(false);
    } catch (error) {
      console.error('Error saving email preferences:', error);
    }
  };

  // Load staff
  const loadStaff = async () => {
    try {
      setLoadingStaff(true);
      const response = await apiClient.getOwnerStaff({
        page: staffPage,
        limit: STAFF_PAGE_SIZE,
        restaurantIds: selectedRestaurants.length > 0 ? selectedRestaurants : undefined,
        role: staffFilters.role,
        status: staffFilters.status,
        search: debouncedStaffSearch
      });
      if (response.success) setStaffData(response);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoadingStaff(false);
    }
  };

  // Load menu
  const loadMenuItems = async () => {
    try {
      setLoadingMenu(true);
      const response = await apiClient.getOwnerMenuItems({
        page: menuPage,
        limit: MENU_PAGE_SIZE,
        restaurantIds: selectedRestaurants.length > 0 ? selectedRestaurants : undefined,
        category: menuFilters.category,
        search: debouncedMenuSearch
      });
      if (response.success) setMenuData(response);
    } catch (error) {
      console.error('Error loading menu:', error);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Load inventory
  const loadInventory = async () => {
    try {
      setLoadingInventory(true);
      const response = await apiClient.getOwnerInventory({
        page: inventoryPage,
        limit: INVENTORY_PAGE_SIZE,
        restaurantIds: selectedRestaurants.length > 0 ? selectedRestaurants : undefined,
        stockStatus: inventoryFilters.stockStatus,
        category: inventoryFilters.category,
        search: debouncedInventorySearch
      });
      if (response.success) setInventoryData(response);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Load organization data for enterprise tabs
  const loadOrgData = async () => {
    try {
      setOrgLoading(true);
      const response = await apiClient.getOrganizations();
      if (response.success && response.organizations?.length > 0) {
        const org = response.organizations[0]; // Primary org
        setOrgData(org);
        // Load outlets for this org
        try {
          const outletsRes = await apiClient.getOrgOutlets(org.id);
          if (outletsRes.success) {
            setOrgOutlets(outletsRes.outlets || []);
          }
        } catch (e) {
          console.error('Error loading org outlets:', e);
        }
      } else {
        setOrgData(null);
        setOrgOutlets([]);
      }
    } catch (error) {
      console.error('Error loading org data:', error);
      setOrgData(null);
    } finally {
      setOrgLoading(false);
    }
  };

  // Refs to prevent duplicate fetches on mount
  const filtersInitialized = useRef(false);
  const initialLoadDone = useRef(false);

  // P0: Dashboard + Analytics + Org data — fire in parallel as soon as authorized
  useEffect(() => {
    if (!authorized) return;
    filtersInitialized.current = true;
    loadDashboard();
    loadAnalytics();
    loadOrgData();
  }, [authorized]);

  // P2: Email prefs + AI usage — deferred, not needed for initial render
  useEffect(() => {
    if (!authorized) return;
    const timer = setTimeout(() => {
      loadEmailPreferences();
      loadAIUsage();
    }, 2000); // Load 2s after page renders
    return () => clearTimeout(timer);
  }, [authorized]);

  // Tab change — only loads non-overview tabs (overview already loaded above)
  useEffect(() => {
    if (!authorized) return;
    // Skip on first authorized render (initial load effect handles it)
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      return;
    }
    switch (activeTab) {
      case 'overview': refreshAll(); break;
      case 'staff': loadStaff(); break;
      case 'menu': loadMenuItems(); break;
      case 'inventory': loadInventory(); break;
      case 'org-setup':
      case 'central-menu':
      case 'warehouse':
      case 'central-kitchen':
      case 'hq-reports':
        if (!orgData && !orgLoading) loadOrgData();
        break;
    }
  }, [activeTab]);

  // Reload on filter/date change (only after initial load)
  useEffect(() => {
    if (!authorized) return;
    if (!filtersInitialized.current) { filtersInitialized.current = true; return; }
    if (activeTab === 'overview') refreshAll();
  }, [dateRange, selectedRestaurants]);

  useEffect(() => { setStaffPage(1); }, [staffFilters.role, staffFilters.status, debouncedStaffSearch, selectedRestaurants]);
  useEffect(() => { setMenuPage(1); }, [menuFilters.category, debouncedMenuSearch, selectedRestaurants]);
  useEffect(() => { setInventoryPage(1); }, [inventoryFilters.stockStatus, inventoryFilters.category, debouncedInventorySearch, selectedRestaurants]);

  useEffect(() => { if (activeTab === 'staff' && authorized) loadStaff(); }, [staffFilters.role, staffFilters.status, debouncedStaffSearch, staffPage, selectedRestaurants]);
  useEffect(() => { if (activeTab === 'menu' && authorized) loadMenuItems(); }, [menuFilters.category, debouncedMenuSearch, menuPage, selectedRestaurants]);
  useEffect(() => { if (activeTab === 'inventory' && authorized) loadInventory(); }, [inventoryFilters.stockStatus, inventoryFilters.category, debouncedInventorySearch, inventoryPage, selectedRestaurants]);

  // Toggle restaurant
  const toggleRestaurant = (id) => {
    setSelectedRestaurants(prev => {
      // If no restaurants selected (meaning all are selected), populate with all IDs first
      if (prev.length === 0 && dashboardData?.restaurants) {
        const allIds = dashboardData.restaurants.map(r => r.id);
        return allIds.filter(x => x !== id); // Remove the clicked one
      }
      // Normal toggle
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  const selectAllRestaurants = () => setSelectedRestaurants([]); // Empty means all selected
  const clearRestaurantSelection = () => setSelectedRestaurants([]); // Same as select all

  // Toggle staff status
  const toggleStaffStatus = async (staffId, currentStatus) => {
    try {
      await apiClient.updateOwnerStaffStatus(staffId, currentStatus === 'active' ? 'inactive' : 'active');
      loadStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };

  // Filter restaurants
  const filteredRestaurants = dashboardData?.restaurants?.filter(r =>
    r.name.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
    (r.city && r.city.toLowerCase().includes(restaurantSearch.toLowerCase()))
  ) || [];

  // Labels
  const getSelectedRestaurantLabel = () => {
    const total = dashboardData?.restaurants?.length || 0;
    const selected = selectedRestaurants.length;
    // All selected (empty array or all IDs selected)
    if (selected === 0 || selected >= total) return `All (${total})`;
    if (selected === 1) {
      const name = dashboardData?.restaurants?.find(r => r.id === selectedRestaurants[0])?.name;
      return name && name.length > 12 ? name.substring(0, 12) + '...' : name || '1 selected';
    }
    return `${selected} of ${total}`;
  };

  // Check if filtering (not all selected)
  const isFiltering = selectedRestaurants.length > 0 && selectedRestaurants.length < (dashboardData?.restaurants?.length || 0);

  const getDateRangeLabel = () => {
    if (dateRange.preset === 'custom' && dateRange.startDate && dateRange.endDate) {
      return `${dateRange.startDate} - ${dateRange.endDate}`;
    }
    return { today: 'Today', '7d': '7 Days', '30d': '30 Days', '90d': '90 Days' }[dateRange.preset] || 'Select';
  };

  // Dynamic headline based on date filter
  const getDynamicHeadline = () => {
    const headlines = {
      today: { title: "Today's Overview", subtitle: 'How your business is doing today' },
      '7d': { title: 'This Week', subtitle: 'Your 7-day performance' },
      '30d': { title: 'This Month', subtitle: 'Monthly business trends' },
      '90d': { title: 'This Quarter', subtitle: '90-day business review' },
      custom: { title: 'Custom Period', subtitle: `${dateRange.startDate} to ${dateRange.endDate}` }
    };
    return headlines[dateRange.preset] || headlines['7d'];
  };

  // Not authorized yet — show nothing while redirect happens
  if (!authorized) return null;

  // ============================================
  // SHIMMER HELPERS

  const shimmerStyle = { background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'hqShimmer 1.5s ease-in-out infinite', borderRadius: '8px' };

  const TableShimmer = ({ rows = 6, cols = 4 }) => (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
      {/* Header row */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px', padding: '14px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} style={{ ...shimmerStyle, height: '14px', width: `${60 + (i % 3) * 15}%`, animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
      {/* Data rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px', padding: '14px 20px', borderBottom: r < rows - 1 ? '1px solid #f8fafc' : 'none' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} style={{ ...shimmerStyle, height: '12px', width: `${50 + ((r + c) % 4) * 12}%`, animationDelay: `${(r * cols + c) * 0.03}s` }} />
          ))}
        </div>
      ))}
    </div>
  );

  // ============================================
  // COMPONENTS
  // ============================================

  // Shimmer placeholder for loading states
  const isDataLoading = !dashboardData || refreshing;

  // Metric Card — shows shimmer when data not yet loaded
  const MetricCard = ({ icon: Icon, label, value, subtitle, color = '#ef4444' }) => (
    <div style={{
      backgroundColor: 'white',
      borderRadius: isMobile ? '14px' : '16px',
      padding: isMobile ? '14px' : '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      border: '1px solid #f1f5f9',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {!isMobile && (
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${color}15, ${color}05)`,
          zIndex: 0
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          width: isMobile ? '34px' : '44px',
          height: isMobile ? '34px' : '44px',
          borderRadius: isMobile ? '10px' : '12px',
          background: `linear-gradient(135deg, ${color}, ${color}dd)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${color}30`,
          marginBottom: isMobile ? '10px' : '16px'
        }}>
          <Icon size={isMobile ? 15 : 20} style={{ color: 'white' }} />
        </div>
        {isDataLoading ? (
          <>
            <div style={{ width: '80px', height: isMobile ? '20px' : '26px', borderRadius: '6px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'hqShimmer 1.5s ease-in-out infinite', marginBottom: '8px' }} />
            <div style={{ width: '100px', height: '14px', borderRadius: '4px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'hqShimmer 1.5s ease-in-out infinite' }} />
          </>
        ) : (
          <>
            <div style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: '700', color: '#1f2937', marginBottom: '4px', lineHeight: 1.2 }}>
              {value}
            </div>
            <div style={{ fontSize: isMobile ? '11px' : '13px', color: '#6b7280' }}>{label}</div>
            {subtitle && <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#6b7280', marginTop: '2px' }}>{subtitle}</div>}
          </>
        )}
      </div>
    </div>
  );

  // Restaurant Row
  const RestaurantRow = ({ restaurant, rank, maxRevenue }) => {
    const revenue = restaurant.todayRevenue || restaurant.revenue || 0;
    const progress = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #f1f5f9',
          transition: 'all 0.2s',
          marginBottom: '12px'
        }}
      >
        {/* Rank Badge */}
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: rank <= 3 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#f1f5f9',
          color: rank <= 3 ? 'white' : '#6b7280',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '700',
          boxShadow: rank <= 3 ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
        }}>
          {rank <= 3 ? <FaTrophy size={14} /> : rank}
        </div>

        {/* Restaurant Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{restaurant.name}</span>
            {restaurant.city && (
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{restaurant.city}</span>
            )}
          </div>
          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #ef4444, #f97316)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
            <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '40px' }}>{progress.toFixed(0)}%</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a' }}>
              {formatCurrency ? formatCurrency(revenue) : `₹${revenue.toLocaleString()}`}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Revenue</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#3b82f6' }}>
              {restaurant.todayOrders || restaurant.orders || 0}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Orders</div>
          </div>
          {restaurant.lowStockItems > 0 && (
            <div style={{
              padding: '6px 10px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <FaExclamationTriangle size={12} style={{ color: '#d97706' }} />
              <span style={{ fontSize: '12px', color: '#d97706', fontWeight: '600' }}>{restaurant.lowStockItems}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // AI Insights Panel
  const InsightsPanel = () => {
    if (!aiInsights) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: isMobile ? '100%' : '480px',
        backgroundColor: 'white',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.3s ease'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaRobot size={22} style={{ color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>AI Insights</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '2px 0 0' }}>
                Powered by DineOpen AI
              </p>
            </div>
          </div>
          <button onClick={() => setShowInsightsPanel(false)} style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Summary */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
            borderRadius: '16px',
            marginBottom: '24px',
            borderLeft: '4px solid #ef4444'
          }}>
            <p style={{ fontSize: '15px', color: '#374151', margin: 0, lineHeight: 1.7 }}>
              {aiInsights.summary}
            </p>
          </div>

          {/* Performance */}
          {aiInsights.performance?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Performance
              </h4>
              {aiInsights.performance.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{item.title}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>{item.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {aiInsights.recommendations?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Recommendations
              </h4>
              {aiInsights.recommendations.map((item, i) => (
                <div key={i} style={{
                  padding: '16px',
                  backgroundColor: item.priority === 'high' ? '#fef2f2' : item.priority === 'medium' ? '#fefce8' : '#f0fdf4',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  borderLeft: `4px solid ${item.priority === 'high' ? '#ef4444' : item.priority === 'medium' ? '#f59e0b' : '#22c55e'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{item.title}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, marginBottom: '8px' }}>{item.message}</p>
                  {item.action && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#ef4444',
                      fontWeight: '500'
                    }}>
                      <FaLightbulb size={10} />
                      {item.action}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pricing Insights */}
          {aiInsights.pricingInsights?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pricing Insights
              </h4>
              {aiInsights.pricingInsights.map((item, i) => (
                <div key={i} style={{
                  padding: '14px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '16px' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{item.title}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{item.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Alerts */}
          {aiInsights.alerts?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Alerts
              </h4>
              {aiInsights.alerts.map((item, i) => (
                <div key={i} style={{
                  padding: '14px',
                  backgroundColor: item.severity === 'critical' ? '#fee2e2' : '#fef3c7',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: item.severity === 'critical' ? '#dc2626' : '#d97706' }}>{item.title}</div>
                    <div style={{ fontSize: '13px', color: '#4b5563' }}>{item.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trends */}
          {aiInsights.trends?.length > 0 && (
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Trends
              </h4>
              {aiInsights.trends.map((item, i) => (
                <div key={i} style={{
                  padding: '14px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.message}</div>
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    backgroundColor: item.direction === 'up' ? '#dcfce7' : item.direction === 'down' ? '#fee2e2' : '#f1f5f9',
                    color: item.direction === 'up' ? '#16a34a' : item.direction === 'down' ? '#dc2626' : '#6b7280',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Send test email handler
  const sendTestEmail = async () => {
    if (!emailPreferences.reportEmail) return;
    try {
      setSendingTestEmail(true);
      setTestEmailSent(false);
      await apiClient.sendTestReport(emailPreferences.reportEmail);
      setTestEmailSent(true);
      setTimeout(() => setTestEmailSent(false), 5000);
    } catch (error) {
      console.error('Error sending test email:', error);
    } finally {
      setSendingTestEmail(false);
    }
  };

  // Email Preferences Modal
  const EmailModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1002,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '480px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-30px',
            right: '-30px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)'
          }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaBell size={20} style={{ color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', margin: 0 }}>Daily Reports</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: '2px 0 0' }}>AI insights to your inbox</p>
              </div>
            </div>
            <button onClick={() => setShowEmailModal(false)} style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div style={{
          margin: '20px 24px 0',
          padding: '14px 16px',
          background: '#fef2f2',
          borderRadius: '12px',
          borderLeft: '4px solid #ef4444',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <FaRobot size={18} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#dc2626', marginBottom: '2px' }}>What you&apos;ll receive</div>
            <div style={{ fontSize: '12px', color: '#7f1d1d', lineHeight: 1.5 }}>
              Daily summary with revenue, top sellers, alerts & recommendations.
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 24px' }}>
          {/* Enable toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            backgroundColor: emailPreferences.emailEnabled ? '#f0fdf4' : '#f9fafb',
            borderRadius: '14px',
            marginBottom: '20px',
            border: emailPreferences.emailEnabled ? '2px solid #86efac' : '2px solid transparent',
            transition: 'all 0.2s ease'
          }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {emailPreferences.emailEnabled && <FaCheck size={12} style={{ color: '#22c55e' }} />}
                Enable Daily Reports
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                {emailPreferences.emailEnabled ? 'Reports will be sent daily' : 'Turn on to receive daily insights'}
              </div>
            </div>
            <button
              onClick={() => setEmailPreferences(prev => ({ ...prev, emailEnabled: !prev.emailEnabled }))}
              style={{
                width: '56px',
                height: '30px',
                borderRadius: '15px',
                border: 'none',
                backgroundColor: emailPreferences.emailEnabled ? '#22c55e' : '#d1d5db',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: '3px',
                left: emailPreferences.emailEnabled ? '29px' : '3px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          {/* Email input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={emailPreferences.reportEmail}
              onChange={(e) => setEmailPreferences(prev => ({ ...prev, reportEmail: e.target.value }))}
              placeholder="your@email.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '14px',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          {/* Time and Timezone row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                Delivery Time
              </label>
              <input
                type="time"
                value={emailPreferences.reportTime}
                onChange={(e) => setEmailPreferences(prev => ({ ...prev, reportTime: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                Timezone
              </label>
              <select
                value={emailPreferences.timezone}
                onChange={(e) => setEmailPreferences(prev => ({ ...prev, timezone: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '14px',
                  backgroundColor: 'white'
                }}
              >
                <option value="Asia/Kolkata">IST</option>
                <option value="America/New_York">EST</option>
                <option value="America/Los_Angeles">PST</option>
                <option value="Europe/London">GMT</option>
                <option value="Asia/Dubai">GST</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Send Test Email */}
            <button
              onClick={sendTestEmail}
              disabled={sendingTestEmail || !emailPreferences.reportEmail}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: '2px solid #ef4444',
                background: testEmailSent ? '#f0fdf4' : 'white',
                color: testEmailSent ? '#22c55e' : '#ef4444',
                fontSize: '14px',
                fontWeight: '600',
                cursor: sendingTestEmail || !emailPreferences.reportEmail ? 'not-allowed' : 'pointer',
                opacity: !emailPreferences.reportEmail ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              {sendingTestEmail ? (
                <>
                  <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Sending...
                </>
              ) : testEmailSent ? (
                <>
                  <FaCheck size={14} />
                  Sent!
                </>
              ) : (
                <>
                  <FaEnvelope size={14} />
                  Test Email
                </>
              )}
            </button>

            {/* Save button */}
            <button
              onClick={saveEmailPreferences}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Restaurant Selector
  const RestaurantSelector = () => (
    <div ref={restaurantDropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setShowRestaurantDropdown(!showRestaurantDropdown)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          borderRadius: '12px',
          border: isFiltering ? '2px solid #22c55e' : '1px solid #e5e7eb',
          backgroundColor: isFiltering ? '#f0fdf4' : 'white',
          color: isFiltering ? '#16a34a' : '#374151',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          minWidth: '140px',
          transition: 'all 0.2s'
        }}
      >
        <FaStore size={14} style={{ color: isFiltering ? '#22c55e' : '#6b7280' }} />
        <span style={{ flex: 1, textAlign: 'left' }}>{getSelectedRestaurantLabel()}</span>
        <FaChevronDown size={12} style={{ color: isFiltering ? '#22c55e' : '#6b7280', transform: showRestaurantDropdown ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>

      {showRestaurantDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb',
          zIndex: 1000,
          minWidth: '300px',
          maxHeight: '400px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '12px' }} />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={restaurantSearch}
                onChange={(e) => setRestaurantSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
            <button
              onClick={() => { selectAllRestaurants(); setShowRestaurantDropdown(false); }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: selectedRestaurants.length === 0 ? '#dcfce7' : '#f1f5f9',
                color: selectedRestaurants.length === 0 ? '#16a34a' : '#374151',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              All Restaurants
            </button>
          </div>
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {filteredRestaurants.map(restaurant => {
              const isSelected = selectedRestaurants.length === 0 || selectedRestaurants.includes(restaurant.id);
              return (
                <div key={restaurant.id} onClick={() => toggleRestaurant(restaurant.id)} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#f0fdf4' : 'white',
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.15s'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: isSelected ? '2px solid #22c55e' : '2px solid #d1d5db',
                    backgroundColor: isSelected ? '#22c55e' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isSelected && <FaCheck size={10} style={{ color: 'white' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{restaurant.name}</div>
                    {restaurant.city && <div style={{ fontSize: '12px', color: '#6b7280' }}>{restaurant.city}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>{formatCurrency ? formatCurrency(restaurant.todayRevenue || 0) : `₹${restaurant.todayRevenue || 0}`}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{restaurant.todayOrders || 0} orders</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Date Picker
  const DatePicker = () => (
    <div ref={datePickerRef} style={{ position: 'relative' }}>
      <button onClick={() => setShowDatePicker(!showDatePicker)} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        borderRadius: '12px',
        border: '2px solid #ef4444',
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}>
        <FaCalendarAlt size={14} style={{ color: '#ef4444' }} />
        <span>{getDateRangeLabel()}</span>
        <FaChevronDown size={12} style={{ color: '#ef4444', transform: showDatePicker ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>

      {showDatePicker && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          border: '2px solid #fecaca',
          zIndex: 1000,
          minWidth: '300px',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
            borderBottom: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626' }}>Select Time Period</div>
            <div style={{ fontSize: '12px', color: '#f87171', marginTop: '2px' }}>Choose a date range for your data</div>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {[
                { id: 'today', label: 'Today', icon: '📅' },
                { id: '7d', label: '7 Days', icon: '📆' },
                { id: '30d', label: '30 Days', icon: '🗓️' },
                { id: '90d', label: '90 Days', icon: '📊' }
              ].map(p => (
                <button key={p.id} onClick={() => { setDateRange({ preset: p.id, startDate: '', endDate: '' }); setShowDatePicker(false); }} style={{
                  padding: '12px 8px',
                  borderRadius: '12px',
                  border: dateRange.preset === p.id ? '2px solid #ef4444' : '2px solid #f1f5f9',
                  backgroundColor: dateRange.preset === p.id ? '#fef2f2' : 'white',
                  color: dateRange.preset === p.id ? '#dc2626' : '#374151',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.2s'
                }}>
                  <span style={{ fontSize: '16px' }}>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Custom Range</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange(prev => ({ ...prev, preset: 'custom', startDate: e.target.value }))} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '13px' }} />
                <span style={{ color: '#9ca3af', fontWeight: '500' }}>→</span>
                <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange(prev => ({ ...prev, preset: 'custom', endDate: e.target.value }))} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '13px' }} />
              </div>
              <button onClick={() => setShowDatePicker(false)} disabled={dateRange.preset !== 'custom' || !dateRange.startDate || !dateRange.endDate} style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (dateRange.preset !== 'custom' || !dateRange.startDate || !dateRange.endDate) ? 'not-allowed' : 'pointer',
                opacity: (dateRange.preset !== 'custom' || !dateRange.startDate || !dateRange.endDate) ? 0.5 : 1
              }}>Apply Custom Range</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Tab button
  const TabButton = ({ id, icon: Icon, label, active }) => (
    <button onClick={() => setActiveTab(id)} style={{
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '5px' : '8px',
      padding: isMobile ? '8px 14px' : '12px 20px',
      borderRadius: isMobile ? '10px' : '12px',
      border: 'none',
      backgroundColor: active ? '#ef4444' : 'white',
      color: active ? 'white' : '#6b7280',
      fontSize: isMobile ? '12px' : '14px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: active ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s'
    }}>
      <Icon size={isMobile ? 13 : 16} />
      {label}
    </button>
  );

  // Data Table
  const DataTable = ({ columns, data, emptyMessage }) => (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
      {data.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>{emptyMessage || 'No data found'}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                {columns.map((col, i) => (
                  <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid #f1f5f9' }}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {columns.map((col, ci) => (
                    <td key={ci} style={{ padding: '14px 16px', fontSize: '14px', color: '#1f2937' }}>{col.render ? col.render(row) : row[col.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ============================================
  // TAB CONTENT
  // ============================================

  // Overview Tab (Combined with Analytics)
  const renderOverviewTab = () => {
    // Prepare chart data with proper labels
    const revenueChartData = (analyticsData?.revenueByDay || []).map(d => {
      const date = new Date(d.date);
      const label = dateRange.preset === 'today'
        ? date.toLocaleTimeString('en-US', { hour: '2-digit' })
        : dateRange.preset === '7d'
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { label, value: d.revenue };
    });

    const ordersChartData = (analyticsData?.revenueByDay || []).map(d => {
      const date = new Date(d.date);
      const label = dateRange.preset === 'today'
        ? date.toLocaleTimeString('en-US', { hour: '2-digit' })
        : dateRange.preset === '7d'
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { label, value: d.orders };
    });

    const orderTypeData = analyticsData?.ordersByType?.map(t => ({ label: t.type, value: t.count })) || [];

    // Filter restaurants based on selection
    const allRestaurants = dashboardData?.restaurants || [];
    const filteredRestaurants = isFiltering
      ? allRestaurants.filter(r => selectedRestaurants.includes(r.id))
      : allRestaurants;

    const sortedRestaurants = [...filteredRestaurants].sort((a, b) => (b.todayRevenue || b.revenue || 0) - (a.todayRevenue || a.revenue || 0));
    const maxRevenue = Math.max(...sortedRestaurants.map(r => r.todayRevenue || r.revenue || 0), 1);

    // Calculate filtered totals
    const filteredTotalRestaurants = filteredRestaurants.length;
    const filteredTotalRevenue = analyticsData?.totalRevenue || filteredRestaurants.reduce((sum, r) => sum + (r.todayRevenue || r.revenue || 0), 0);
    const filteredTotalRevenueWithTax = analyticsData?.totalRevenueWithTax || filteredRestaurants.reduce((sum, r) => sum + (r.revenueWithTax || r.todayRevenue || r.revenue || 0), 0);
    const filteredTotalOrders = analyticsData?.totalOrders || filteredRestaurants.reduce((sum, r) => sum + (r.todayOrders || r.orders || 0), 0);
    const filteredAvgOrderValue = analyticsData?.avgOrderValue || (filteredTotalOrders > 0 ? filteredTotalRevenue / filteredTotalOrders : 0);

    return (
      <div>
        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <MetricCard
            icon={FaStore}
            label={isFiltering ? "Selected" : "Total Restaurants"}
            value={filteredTotalRestaurants}
            color="#8b5cf6"
          />
          <MetricCard
            icon={FaRupeeSign}
            label="Revenue"
            value={formatCurrency ? formatCurrency(filteredTotalRevenue) : `₹${filteredTotalRevenue.toLocaleString()}`}
            subtitle={filteredTotalRevenueWithTax > filteredTotalRevenue ? `incl. tax: ${formatCurrency ? formatCurrency(filteredTotalRevenueWithTax) : `₹${filteredTotalRevenueWithTax.toLocaleString()}`}` : null}
            color="#16a34a"
          />
          <MetricCard
            icon={FaShoppingCart}
            label="Total Orders"
            value={filteredTotalOrders}
            color="#3b82f6"
          />
          <MetricCard
            icon={FaChartLine}
            label="Avg Order Value"
            value={formatCurrency ? formatCurrency(filteredAvgOrderValue) : `₹${filteredAvgOrderValue.toFixed(0)}`}
            color="#f59e0b"
          />
        </div>

        {/* Revenue & Orders Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Revenue Chart */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Revenue Trend</h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {dateRange.preset === 'today' ? 'Hourly' : 'Daily'} breakdown
                </span>
              </div>
              {refreshing ? (
                <div style={{ width: '90px', height: '28px', borderRadius: '20px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'hqShimmer 1.5s ease-in-out infinite' }} />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '20px'
                }}>
                  <FaRupeeSign size={12} style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a' }}>
                    {formatCurrency ? formatCurrency(filteredTotalRevenue) : `₹${filteredTotalRevenue.toLocaleString()}`}
                  </span>
                </div>
              )}
            </div>
            <div style={{ height: 180, width: '100%' }}>
              {(!analyticsData || refreshing) ? (
                <div style={{ height: '100%', borderRadius: '12px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'hqShimmer 1.5s ease-in-out infinite' }} />
              ) : revenueChartData.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16a34a" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#16a34a" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                      width={45}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        padding: '12px 16px'
                      }}
                      formatter={(value) => [formatCurrency ? formatCurrency(value) : `₹${value.toLocaleString()}`, 'Revenue']}
                      labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: 4 }}
                      cursor={{ fill: 'rgba(22, 163, 74, 0.1)' }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#revenueGradient)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={50}
                    />
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Orders Chart */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Orders Trend</h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {dateRange.preset === 'today' ? 'Hourly' : 'Daily'} breakdown
                </span>
              </div>
              {refreshing ? (
                <div style={{ width: '80px', height: '28px', borderRadius: '20px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'hqShimmer 1.5s ease-in-out infinite 0.1s' }} />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '20px'
                }}>
                  <FaShoppingCart size={12} style={{ color: '#3b82f6' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#3b82f6' }}>
                    {filteredTotalOrders} orders
                  </span>
                </div>
              )}
            </div>
            <div style={{ height: 180, width: '100%' }}>
              {(!analyticsData || refreshing) ? (
                <div style={{ height: '100%', borderRadius: '12px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'hqShimmer 1.5s ease-in-out infinite 0.2s' }} />
              ) : ordersChartData.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsAreaChart data={ordersChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        padding: '12px 16px'
                      }}
                      formatter={(value) => [`${value} orders`, 'Orders']}
                      labelStyle={{ color: '#374151', fontWeight: 600, marginBottom: 4 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#ordersGradient)"
                      dot={{ r: 4, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: 'white', strokeWidth: 2 }}
                    />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Restaurant Performance */}
          <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>Restaurant Rankings</h3>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {dateRange.preset === 'today' ? "Today's" : dateRange.preset === '7d' ? 'Last 7 days' : dateRange.preset === '30d' ? 'Last 30 days' : 'Period'} performance
                </span>
              </div>
              <span style={{
                fontSize: '12px',
                color: '#6b7280',
                backgroundColor: '#f1f5f9',
                padding: '4px 10px',
                borderRadius: '12px'
              }}>
                {filteredTotalRestaurants} {filteredTotalRestaurants === 1 ? 'location' : 'locations'}
              </span>
            </div>
            {isDataLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ height: '56px', borderRadius: '12px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: `hqShimmer 1.5s ease-in-out infinite ${i * 0.1}s` }} />
                ))}
              </div>
            ) : sortedRestaurants.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                No restaurants selected
              </div>
            ) : (
              <>
                {sortedRestaurants.slice(0, 5).map((restaurant, i) => (
                  <RestaurantRow key={restaurant.id} restaurant={restaurant} rank={i + 1} maxRevenue={maxRevenue} />
                ))}
                {sortedRestaurants.length > 5 && (
                  <button onClick={() => setShowRestaurantDropdown(true)} style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}>
                    View All {sortedRestaurants.length} Restaurants
                  </button>
                )}
              </>
            )}
          </div>

          {/* Quick Stats Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Order Types */}
            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>Order Types</h3>
              {isDataLoading ? (
                <div>
                  <div style={{ width: '140px', height: '140px', borderRadius: '50%', margin: '0 auto 16px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: 'hqShimmer 1.5s ease-in-out infinite' }} />
                  {[0,1,2].map(i => <div key={i} style={{ height: '28px', borderRadius: '6px', marginBottom: '8px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: `hqShimmer 1.5s ease-in-out infinite ${i * 0.1}s` }} />)}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DonutChart data={orderTypeData} size={140} />
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    {analyticsData?.ordersByType?.slice(0, 3).map((type, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280', textTransform: 'capitalize' }}>{type.type.replace('_', ' ')}</span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{type.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Top Items */}
            <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937', marginBottom: '16px' }}>Top Sellers</h3>
              {isDataLoading ? (
                <div>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: `hqShimmer 1.5s ease-in-out infinite ${i * 0.1}s`, flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: '70%', height: '14px', borderRadius: '4px', marginBottom: '6px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: `hqShimmer 1.5s ease-in-out infinite ${i * 0.1}s` }} />
                        <div style={{ width: '40%', height: '10px', borderRadius: '4px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: `hqShimmer 1.5s ease-in-out infinite ${i * 0.15}s` }} />
                      </div>
                      <div style={{ width: '50px', height: '14px', borderRadius: '4px', background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)', backgroundSize: '200% 100%', animation: `hqShimmer 1.5s ease-in-out infinite ${i * 0.1}s` }} />
                    </div>
                  ))}
                </div>
              ) : (
                analyticsData?.popularItems?.slice(0, 4).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: i < 3 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#f1f5f9',
                      color: i < 3 ? 'white' : '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.orders} sold</div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>
                      {formatCurrency ? formatCurrency(item.revenue) : `₹${item.revenue}`}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Alerts */}
            {filteredRestaurants.reduce((sum, r) => sum + (r.lowStockItems || 0), 0) > 0 && (
              <div style={{ backgroundColor: '#fef3c7', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FaExclamationTriangle size={20} style={{ color: '#d97706' }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>Inventory Alert</div>
                  <div style={{ fontSize: '13px', color: '#a16207' }}>
                    {filteredRestaurants.reduce((sum, r) => sum + (r.lowStockItems || 0), 0)} items running low
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Daily Email Reports Card */}
        <div
          onClick={() => setShowEmailModal(true)}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: isMobile ? '16px' : '20px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            border: '1px solid #f1f5f9',
            marginTop: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: isMobile ? '40px' : '44px', height: isMobile ? '40px' : '44px',
              borderRadius: '12px',
              background: emailPreferences.emailEnabled ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #6b7280, #4b5563)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: emailPreferences.emailEnabled ? '0 4px 12px rgba(34,197,94,0.3)' : '0 4px 12px rgba(107,114,128,0.2)',
            }}>
              <FaEnvelope size={isMobile ? 16 : 18} style={{ color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: '700', color: '#1f2937' }}>Daily Email Reports</div>
              <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#6b7280', marginTop: '2px' }}>
                {emailPreferences.emailEnabled
                  ? `Enabled \u2014 sending to ${emailPreferences.reportEmail || 'your email'}`
                  : 'Get daily business summaries delivered to your inbox'}
              </div>
            </div>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
            backgroundColor: emailPreferences.emailEnabled ? '#dcfce7' : '#f1f5f9',
            color: emailPreferences.emailEnabled ? '#16a34a' : '#6b7280',
          }}>
            {emailPreferences.emailEnabled ? 'On' : 'Setup'}
          </div>
        </div>
      </div>
    );
  };

  // Staff Tab
  const renderStaffTab = () => {
    const columns = [
      { header: 'Name', key: 'name' },
      { header: 'Restaurant', key: 'restaurantName' },
      { header: 'Role', render: row => <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', backgroundColor: '#f1f5f9', textTransform: 'capitalize' }}>{row.role}</span> },
      { header: 'Phone', key: 'phone' },
      { header: 'Status', render: row => <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', backgroundColor: row.status === 'active' ? '#dcfce7' : '#fee2e2', color: row.status === 'active' ? '#16a34a' : '#dc2626' }}>{row.status}</span> },
      { header: 'Actions', render: row => <button onClick={() => toggleStaffStatus(row.id, row.status)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: row.status === 'active' ? '#fee2e2' : '#dcfce7', color: row.status === 'active' ? '#dc2626' : '#16a34a', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>{row.status === 'active' ? 'Deactivate' : 'Activate'}</button> }
    ];

    return (
      <div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Search staff..." value={staffFilters.search} onChange={(e) => setStaffFilters(prev => ({ ...prev, search: e.target.value }))} style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
          </div>
          <select value={staffFilters.role} onChange={(e) => setStaffFilters(prev => ({ ...prev, role: e.target.value }))} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', minWidth: '130px' }}>
            <option value="">All Roles</option>
            <option value="manager">Manager</option>
            <option value="waiter">Waiter</option>
            <option value="cashier">Cashier</option>
            <option value="chef">Chef</option>
          </select>
          <select value={staffFilters.status} onChange={(e) => setStaffFilters(prev => ({ ...prev, status: e.target.value }))} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', minWidth: '130px' }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        {loadingStaff ? (
          <TableShimmer rows={6} cols={isMobile ? 3 : 6} />
        ) : (
          <>
            {staffData.pagination?.total > 0 && (
              <div style={{ marginBottom: '12px', fontSize: '13px', color: '#6b7280' }}>
                Showing {((staffPage - 1) * STAFF_PAGE_SIZE) + 1} - {Math.min(staffPage * STAFF_PAGE_SIZE, staffData.pagination.total)} of {staffData.pagination.total}
              </div>
            )}
            <DataTable columns={columns} data={staffData.staff || []} emptyMessage="No staff found" />
            {staffData.pagination?.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                <button onClick={() => setStaffPage(p => Math.max(1, p - 1))} disabled={staffPage === 1} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: staffPage === 1 ? 'not-allowed' : 'pointer', opacity: staffPage === 1 ? 0.5 : 1 }}>Previous</button>
                <span style={{ padding: '8px 14px', color: '#6b7280' }}>Page {staffPage} of {staffData.pagination.totalPages}</span>
                <button onClick={() => setStaffPage(p => Math.min(staffData.pagination.totalPages, p + 1))} disabled={staffPage === staffData.pagination.totalPages} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: staffPage === staffData.pagination.totalPages ? 'not-allowed' : 'pointer', opacity: staffPage === staffData.pagination.totalPages ? 0.5 : 1 }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Menu Tab
  const renderMenuTab = () => {
    const columns = [
      { header: 'Item', render: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {row.image && <img src={row.image} alt={row.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />}
          <div>
            <div style={{ fontWeight: '500' }}>{row.name}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{row.category}</div>
          </div>
        </div>
      )},
      { header: 'Restaurant', key: 'restaurantName' },
      { header: 'Price', render: row => formatCurrency ? formatCurrency(row.price) : `₹${row.price}` },
      { header: 'Status', render: row => <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', backgroundColor: row.isAvailable ? '#dcfce7' : '#fee2e2', color: row.isAvailable ? '#16a34a' : '#dc2626' }}>{row.isAvailable ? 'Available' : 'Unavailable'}</span> }
    ];

    return (
      <div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Search menu..." value={menuFilters.search} onChange={(e) => setMenuFilters(prev => ({ ...prev, search: e.target.value }))} style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
          </div>
          <select value={menuFilters.category} onChange={(e) => setMenuFilters(prev => ({ ...prev, category: e.target.value }))} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', minWidth: '150px' }}>
            <option value="">All Categories</option>
            {menuData.categories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        {loadingMenu ? (
          <TableShimmer rows={8} cols={isMobile ? 2 : 4} />
        ) : (
          <>
            {menuData.pagination?.total > 0 && (
              <div style={{ marginBottom: '12px', fontSize: '13px', color: '#6b7280' }}>
                Showing {((menuPage - 1) * MENU_PAGE_SIZE) + 1} - {Math.min(menuPage * MENU_PAGE_SIZE, menuData.pagination.total)} of {menuData.pagination.total}
              </div>
            )}
            <DataTable columns={columns} data={menuData.menuItems || []} emptyMessage="No menu items found" />
            {menuData.pagination?.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                <button onClick={() => setMenuPage(p => Math.max(1, p - 1))} disabled={menuPage === 1} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: menuPage === 1 ? 'not-allowed' : 'pointer', opacity: menuPage === 1 ? 0.5 : 1 }}>Previous</button>
                <span style={{ padding: '8px 14px', color: '#6b7280' }}>Page {menuPage} of {menuData.pagination.totalPages}</span>
                <button onClick={() => setMenuPage(p => Math.min(menuData.pagination.totalPages, p + 1))} disabled={menuPage === menuData.pagination.totalPages} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: menuPage === menuData.pagination.totalPages ? 'not-allowed' : 'pointer', opacity: menuPage === menuData.pagination.totalPages ? 0.5 : 1 }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // Inventory Tab
  const renderInventoryTab = () => {
    const columns = [
      { header: 'Item', key: 'name' },
      { header: 'Restaurant', key: 'restaurantName' },
      { header: 'Category', key: 'category' },
      { header: 'Stock', render: row => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{row.currentStock} {row.unit}</span>
          {row.stockStatus === 'low' && <FaExclamationTriangle size={14} style={{ color: '#f59e0b' }} />}
          {row.stockStatus === 'out' && <FaTimesCircle size={14} style={{ color: '#dc2626' }} />}
        </div>
      )},
      { header: 'Status', render: row => <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', backgroundColor: row.stockStatus === 'normal' ? '#dcfce7' : row.stockStatus === 'low' ? '#fef3c7' : '#fee2e2', color: row.stockStatus === 'normal' ? '#16a34a' : row.stockStatus === 'low' ? '#d97706' : '#dc2626' }}>{row.stockStatus === 'normal' ? 'Normal' : row.stockStatus === 'low' ? 'Low' : 'Out'}</span> }
    ];

    return (
      <div>
        {(inventoryData.alerts?.lowStock > 0 || inventoryData.alerts?.outOfStock > 0) && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {inventoryData.alerts?.outOfStock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#fee2e2', borderRadius: '12px', color: '#dc2626' }}>
                <FaTimesCircle size={18} />
                <span style={{ fontWeight: '600' }}>{inventoryData.alerts.outOfStock} out of stock</span>
              </div>
            )}
            {inventoryData.alerts?.lowStock > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#fef3c7', borderRadius: '12px', color: '#d97706' }}>
                <FaExclamationTriangle size={18} />
                <span style={{ fontWeight: '600' }}>{inventoryData.alerts.lowStock} low stock</span>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input type="text" placeholder="Search inventory..." value={inventoryFilters.search} onChange={(e) => setInventoryFilters(prev => ({ ...prev, search: e.target.value }))} style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px' }} />
          </div>
          <select value={inventoryFilters.stockStatus} onChange={(e) => setInventoryFilters(prev => ({ ...prev, stockStatus: e.target.value }))} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', minWidth: '140px' }}>
            <option value="">All Status</option>
            <option value="normal">Normal</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <select value={inventoryFilters.category} onChange={(e) => setInventoryFilters(prev => ({ ...prev, category: e.target.value }))} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '14px', minWidth: '150px' }}>
            <option value="">All Categories</option>
            {inventoryData.categories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        {loadingInventory ? (
          <TableShimmer rows={6} cols={isMobile ? 3 : 5} />
        ) : (
          <>
            {inventoryData.pagination?.total > 0 && (
              <div style={{ marginBottom: '12px', fontSize: '13px', color: '#6b7280' }}>
                Showing {((inventoryPage - 1) * INVENTORY_PAGE_SIZE) + 1} - {Math.min(inventoryPage * INVENTORY_PAGE_SIZE, inventoryData.pagination.total)} of {inventoryData.pagination.total}
              </div>
            )}
            <DataTable columns={columns} data={inventoryData.inventory || []} emptyMessage="No inventory found" />
            {inventoryData.pagination?.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                <button onClick={() => setInventoryPage(p => Math.max(1, p - 1))} disabled={inventoryPage === 1} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: inventoryPage === 1 ? 'not-allowed' : 'pointer', opacity: inventoryPage === 1 ? 0.5 : 1 }}>Previous</button>
                <span style={{ padding: '8px 14px', color: '#6b7280' }}>Page {inventoryPage} of {inventoryData.pagination.totalPages}</span>
                <button onClick={() => setInventoryPage(p => Math.min(inventoryData.pagination.totalPages, p + 1))} disabled={inventoryPage === inventoryData.pagination.totalPages} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: inventoryPage === inventoryData.pagination.totalPages ? 'not-allowed' : 'pointer', opacity: inventoryPage === inventoryData.pagination.totalPages ? 0.5 : 1 }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: isMobile ? '16px' : '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: isMobile ? '12px' : '20px', gap: isMobile ? '12px' : '16px' }}>
        <div style={{ paddingLeft: isMobile ? '48px' : undefined }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: '800', color: '#1f2937', margin: 0 }}>
            {getDynamicHeadline().title}
          </h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: isMobile ? '12px' : '14px' }}>{getDynamicHeadline().subtitle}</p>
        </div>

        <div style={{ display: 'flex', gap: isMobile ? '8px' : '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {(dashboardData?.restaurants?.length || 0) > 1 && <RestaurantSelector />}
          <DatePicker />

          {/* Start Taking Orders CTA - Desktop */}
          {!isMobile && (
            <button
              onClick={() => router.push(businessType === 'bar' ? '/dashboard/bar' : '/dashboard')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px', border: 'none',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white', fontWeight: '700', fontSize: '14px', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239,68,68,0.3)', transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.3)'; }}
            >
              <FaShoppingCart size={13} />
              {businessType === 'bar' ? 'Open Bar POS' : 'Start Taking Orders'}
            </button>
          )}

          {/* AI Insights Button - compact */}
          <button
            onClick={loadAIInsights}
            disabled={loadingInsights || aiInsightsRemaining <= 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isMobile ? '36px' : '40px',
              height: isMobile ? '36px' : '40px',
              borderRadius: '10px',
              border: 'none',
              background: aiInsightsRemaining <= 0 ? '#9ca3af' : 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              cursor: loadingInsights || aiInsightsRemaining <= 0 ? 'not-allowed' : 'pointer',
              boxShadow: aiInsightsRemaining > 0 ? '0 2px 8px rgba(239, 68, 68, 0.25)' : 'none',
              opacity: aiInsightsRemaining <= 0 ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
            title="AI Insights"
          >
            {loadingInsights ? (
              <FaSpinner size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <FaRobot size={14} />
            )}
          </button>

          {/* Refresh - compact */}
          <button onClick={refreshAll} disabled={refreshing} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isMobile ? '36px' : '40px',
            height: isMobile ? '36px' : '40px',
            borderRadius: '10px',
            border: '1px solid #e5e7eb',
            background: 'white',
            color: '#6b7280',
            cursor: refreshing ? 'wait' : 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Refresh"
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <FaSyncAlt size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Mobile CTA - Start Taking Orders */}
      {isMobile && (
        <button
          onClick={() => router.push(businessType === 'bar' ? '/dashboard/bar' : '/dashboard')}
          style={{
            width: '100%', padding: '13px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            border: 'none', color: 'white', fontSize: '15px', fontWeight: '700',
            cursor: 'pointer', marginBottom: '14px',
            boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <FaShoppingCart size={15} />
          {businessType === 'bar' ? 'Open Bar POS' : 'Start Taking Orders'}
        </button>
      )}

      {/* Tabs Row with Filter Chips */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? '16px' : '24px',
        gap: isMobile ? '8px' : '16px',
        flexWrap: 'wrap'
      }}>
        {/* Left: Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <TabButton id="overview" icon={FaChartBar} label="Overview" active={activeTab === 'overview'} />
          <TabButton id="staff" icon={FaUsers} label="Staff" active={activeTab === 'staff'} />
          <TabButton id="menu" icon={FaUtensils} label="Menu" active={activeTab === 'menu'} />
          <TabButton id="inventory" icon={FaBoxes} label="Inventory" active={activeTab === 'inventory'} />
          {/* Enterprise / Chain Management Tabs */}
          <TabButton id="org-setup" icon={FaSitemap} label="Setup" active={activeTab === 'org-setup'} />
          {orgData?.settings?.centralizedMenu && (
            <TabButton id="central-menu" icon={FaClipboardList} label="Central Menu" active={activeTab === 'central-menu'} />
          )}
          {orgData?.settings?.centralWarehouse && (
            <TabButton id="warehouse" icon={FaWarehouse} label="Warehouse" active={activeTab === 'warehouse'} />
          )}
          {orgData?.settings?.centralKitchen && (
            <TabButton id="central-kitchen" icon={FaIndustry} label="Kitchen" active={activeTab === 'central-kitchen'} />
          )}
          {orgData && (
            <TabButton id="hq-reports" icon={FaFileAlt} label="Reports" active={activeTab === 'hq-reports'} />
          )}
        </div>

        {/* Right: Filter Chips - Only show when filtering (not all selected) */}
        {isFiltering && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#f0fdf4',
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1px solid #bbf7d0'
          }}>
            <FaStore size={12} style={{ color: '#16a34a' }} />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {selectedRestaurants.slice(0, 3).map(id => {
                const restaurant = dashboardData?.restaurants?.find(r => r.id === id);
                if (!restaurant) return null;
                return (
                  <div
                    key={id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      backgroundColor: '#dcfce7',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: '#166534',
                      fontWeight: '500',
                      border: '1px solid #86efac'
                    }}
                  >
                    <span>{restaurant.name}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleRestaurant(id); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: '#16a34a',
                        color: 'white',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      <FaTimes size={7} />
                    </button>
                  </div>
                );
              })}
              {selectedRestaurants.length > 3 && (
                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                  +{selectedRestaurants.length - 3} more
                </span>
              )}
            </div>
            <button
              onClick={selectAllRestaurants}
              style={{
                padding: '4px 10px',
                borderRadius: '16px',
                border: 'none',
                backgroundColor: '#16a34a',
                color: 'white',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '600',
                marginLeft: '4px'
              }}
            >
              Show All
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'staff' && renderStaffTab()}
        {activeTab === 'menu' && renderMenuTab()}
        {activeTab === 'inventory' && renderInventoryTab()}
        {activeTab === 'org-setup' && (
          <OrganizationSetupTab orgData={orgData} outlets={orgOutlets} onRefresh={loadOrgData} formatCurrency={formatCurrency} />
        )}
        {activeTab === 'central-menu' && orgData && (
          <CentralMenuTab orgData={orgData} outlets={orgOutlets} formatCurrency={formatCurrency} />
        )}
        {activeTab === 'warehouse' && orgData && (
          <WarehouseTab orgData={orgData} outlets={orgOutlets} formatCurrency={formatCurrency} />
        )}
        {activeTab === 'central-kitchen' && orgData && (
          <CentralKitchenTab orgData={orgData} outlets={orgOutlets} formatCurrency={formatCurrency} />
        )}
        {activeTab === 'hq-reports' && orgData && (
          <HQReportsTab orgData={orgData} outlets={orgOutlets} formatCurrency={formatCurrency} />
        )}
      </div>

      {/* Modals */}
      {showInsightsPanel && <InsightsPanel />}
      {showEmailModal && <EmailModal />}

      {/* Overlay for panels */}
      {showInsightsPanel && (
        <div onClick={() => setShowInsightsPanel(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          zIndex: 1000
        }} />
      )}

      {/* CSS */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes hqShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .email-btn-wrapper:hover .tooltip-email {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>
    </div>
  );
}

export default function HeadquartersPage() {
  return <HeadquartersContent />;
}
