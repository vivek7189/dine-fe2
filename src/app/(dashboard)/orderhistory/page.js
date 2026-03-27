'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Pusher from 'pusher-js';
import apiClient from '../../../lib/api';
import { t, getCurrentLanguage } from '../../../lib/i18n';
import { getCachedOrderHistoryData, setCachedOrderHistoryData } from '../../../utils/dashboardCache';
import { setCachedData, getCachedData } from '../../../lib/offlineDb';
import { getAllOfflineOrders } from '../../../lib/offlineDb';
import { useCurrency } from '../../../contexts/CurrencyContext';
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaUser,
  FaTable,
  FaPhone,
  FaCheckCircle,
  FaUtensils,
  FaBed,
  FaReceipt,
  FaSpinner,
  FaEye,
  FaEdit,
  FaChevronDown,
  FaFilter,
  FaChevronUp,
  FaChevronDown as FaChevronDownIcon,
  FaCopy,
  FaTimesCircle,
  FaList,
  FaTh,
  FaTimes,
  FaChartLine,
  FaShoppingBag,
  FaArrowUp,
  FaArrowDown,
  FaFileInvoice,
  FaDownload,
  FaPrint,
  FaTrash,
  FaCloudUploadAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaMobileAlt,
  FaGlobe,
  FaCalendarAlt,
  FaRedo
} from 'react-icons/fa';

const OrderHistory = () => {
  const router = useRouter();
  const { formatCurrency, getCurrencySymbol, currencySettings } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrderType, setSelectedOrderType] = useState('all');
  const [myOrdersOnly, setMyOrdersOnly] = useState(false);
  const [dateFilterMode, setDateFilterMode] = useState('today');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [markCompleteOrderId, setMarkCompleteOrderId] = useState(null);
  const [markCompleteSubmitting, setMarkCompleteSubmitting] = useState(false);
  const [deleteConfirmOrderId, setDeleteConfirmOrderId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [printSettings, setPrintSettings] = useState(null);
  const [printingOrderId, setPrintingOrderId] = useState(null);
  const [printSuccess, setPrintSuccess] = useState(null);
  const [analyticsStats, setAnalyticsStats] = useState(null);

  useEffect(() => {
    // Initialize language
    setCurrentLanguage(getCurrentLanguage());

    const handleLanguageChange = (e) => {
      setCurrentLanguage(e.detail.language);
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-dropdown')) {
        setStatusDropdownOpen(false);
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [limit] = useState(isCompactView ? 20 : 10);

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) newExpanded.delete(orderId);
    else newExpanded.add(orderId);
    setExpandedOrders(newExpanded);
  };

  const copyToClipboard = async (text) => {
    try { await navigator.clipboard.writeText(text); } catch (err) { console.error('Failed to copy text: ', err); }
  };

  const formatDate = (date, compact = false) => {
    if (!date) return 'N/A';
    try {
      let d;
      if (date.toDate && typeof date.toDate === 'function') d = date.toDate();
      else if (date._seconds) d = new Date(date._seconds * 1000);
      else if (date instanceof Date) d = date;
      else if (typeof date === 'string' || typeof date === 'number') d = new Date(date);
      else return 'N/A';
      
      if (isNaN(d.getTime())) return 'N/A';
      
      const locale = currentLanguage === 'hi' ? 'hi-IN' : 'en-IN';

      if (compact) {
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        return isToday 
          ? d.toLocaleString(locale, { hour: '2-digit', minute: '2-digit', hour12: true })
          : d.toLocaleString(locale, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
      }
      return d.toLocaleString(locale, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  /** Maps status string to display label (for "Deleted (was: X)" and similar). */
  const getStatusDisplayLabel = (s) => {
    if (!s) return 'Unknown';
    const map = { completed: 'Completed', confirmed: 'Confirmed', pending: 'Pending', cancelled: 'Cancelled', deleted: 'Deleted' };
    return map[s] || (s.charAt(0).toUpperCase() + s.slice(1));
  };

  const getStatusStyle = (status, orderFlow, lastStatus, order) => {
    if (order?._isOffline) return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: `Pending Sync (${order.syncStatus || 'queued'})` };
    // syncSource === 'offline' orders now show their real status — separate "Offline" chip is added in the UI
    if (orderFlow?.isDirectBilling) return { bg: '#dcfce7', text: '#166534', border: '#86efac', label: 'Billing Completed' };
    if (orderFlow?.isKitchenOrder) return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', label: 'Kitchen' };
    if (status === 'completed') return { bg: '#dcfce7', text: '#166534', border: '#86efac', label: 'Completed' };
    if (status === 'confirmed') return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', label: 'Confirmed' };
    if (status === 'pending') return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: 'Pending' };
    if (status === 'cancelled') return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', label: 'Cancelled' };
    if (status === 'deleted') {
      const wasLabel = lastStatus ? getStatusDisplayLabel(lastStatus) : null;
      const label = wasLabel ? `Deleted (was: ${wasLabel})` : 'Deleted';
      return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', label };
    }
    const capitalizeStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db', label: capitalizeStatus };
  };

  /** Returns a small chip config for order source: Staff, Online order (public page), or Dine App. Place near status chip. */
  const getOrderSourceChip = (order) => {
    const src = order.orderSource;
    const staff = order.staffInfo;
    const notes = [order.notes, staff?.kitchenNotes].filter(Boolean).join(' ').toLowerCase();
    const looksLikePublicOnline = staff?.waiterName === 'Customer Self-Order' && (notes.includes('public online') || notes.includes('online order'));
    const isStaff = staff && (
      staff.waiterId ||
      staff.id ||
      (staff.waiterName && staff.waiterName !== 'Customer Self-Order') ||
      (staff.name && staff.name !== 'Customer Self-Order')
    );
    if (isStaff) {
      const rawName = staff.waiterName || staff.name || null;
      const genericNames = ['Customer Self-Order', 'Staff Member', 'Staff', 'staff', 'Restaurant Owner'];
      const hasRealName = rawName && !genericNames.includes(rawName);
      const phone = staff.phone || null;
      const loginId = staff.loginId || null;
      const staffId = staff.waiterId || staff.id || staff.userId || null;
      const display = hasRealName ? rawName : (phone || loginId || (staffId ? staffId.slice(-6) : null));
      const roleLabel = staff.role === 'owner' ? 'Owner' : (staff.role === 'admin' ? 'Admin' : 'Staff');
      const parts = [roleLabel, display].filter(Boolean).join(' · ');
      return { label: parts, className: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
    // Explicit source or inferred from notes (legacy orders from public online page)
    if (src === 'online_order' || looksLikePublicOnline) return { label: 'Online order', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (src === 'crave_app' || src === 'customer_app') return { label: 'Dine App', className: 'bg-pink-50 text-pink-700 border-pink-200' };
    return null;
  };

  // Date filter options
  const dateFilterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'custom', label: 'Custom' },
  ];

  // Payment method options
  const paymentMethodOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'upi', label: 'UPI', icon: '📱' },
    { value: 'card', label: 'Card', icon: '💳' },
    { value: 'online', label: 'Online', icon: '🌐' },
    { value: 'other', label: 'Other', icon: '📋' },
  ];

  // Convert dateFilterMode to API params
  const getDateRange = useCallback(() => {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

    switch (dateFilterMode) {
      case 'today':
        return { todayOnly: true };
      case 'yesterday': {
        const ys = new Date(todayStart); ys.setDate(ys.getDate() - 1);
        const ye = new Date(ys); ye.setHours(23, 59, 59, 999);
        return { startDate: ys.toISOString(), endDate: ye.toISOString() };
      }
      case 'last7days': {
        const s = new Date(todayStart); s.setDate(s.getDate() - 6);
        return { startDate: s.toISOString(), endDate: todayEnd.toISOString() };
      }
      case 'last30days': {
        const s = new Date(todayStart); s.setDate(s.getDate() - 29);
        return { startDate: s.toISOString(), endDate: todayEnd.toISOString() };
      }
      case 'custom':
        if (customStartDate && customEndDate) {
          return { startDate: new Date(customStartDate).toISOString(), endDate: new Date(customEndDate + 'T23:59:59.999').toISOString() };
        }
        return { todayOnly: true };
      default:
        return { todayOnly: true };
    }
  }, [dateFilterMode, customStartDate, customEndDate]);

  // Check if any non-default filters are active
  const hasActiveFilters = selectedStatus !== 'all' || selectedOrderType !== 'all' || selectedPaymentMethod !== 'all' || dateFilterMode !== 'today' || myOrdersOnly || searchTerm.trim();

  const activeFilterCount = [
    selectedStatus !== 'all',
    selectedOrderType !== 'all',
    selectedPaymentMethod !== 'all',
    dateFilterMode !== 'today',
    myOrdersOnly,
  ].filter(Boolean).length;

  // Reset all filters to defaults
  const resetAllFilters = useCallback(() => {
    setSelectedStatus('all');
    setSelectedOrderType('all');
    setSelectedPaymentMethod('all');
    setDateFilterMode('today');
    setMyOrdersOnly(false);
    setSearchTerm('');
    setCustomStartDate('');
    setCustomEndDate('');
  }, []);

  const fetchOrders = useCallback(async (useCache = true) => {
    if (!restaurantId) return;

    // Create cache key based on filters
    const cacheKey = `${currentPage}_${selectedStatus}_${selectedOrderType}_${myOrdersOnly}_${dateFilterMode}_${selectedPaymentMethod}_${searchTerm.trim()}_${customStartDate}_${customEndDate}`;
    
    // Check for cached data first
    if (useCache) {
      const cachedData = getCachedOrderHistoryData(restaurantId, cacheKey);
      if (cachedData) {
        console.log('⚡ Loading cached order history instantly...');
        setOrders(cachedData.orders || []);
        setTotalPages(cachedData.totalPages || 1);
        setTotalOrders(cachedData.totalOrders || 0);
        setLoading(false);
        
        // Show background loading
        setBackgroundLoading(true);
        window.dispatchEvent(new CustomEvent('orderhistoryBackgroundLoading', { detail: { loading: true } }));
      } else {
        setLoading(true);
      }
    } else {
      setLoading(true);
    }
    
    try {
      setError(null);
      const dateRange = getDateRange();
      const filters = {
        page: currentPage,
        limit: limit,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        orderType: selectedOrderType !== 'all' ? selectedOrderType : undefined,
        paymentMethod: selectedPaymentMethod !== 'all' ? selectedPaymentMethod : undefined,
        myOrdersOnly: myOrdersOnly ? user?.id : undefined,
        search: searchTerm.trim() || undefined,
        ...dateRange
      };
      const response = await apiClient.getOrders(restaurantId, filters);
      let filteredOrders = response.orders || [];

      filteredOrders.sort((a, b) => {
        let dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.createdAt?._seconds ? new Date(a.createdAt._seconds * 1000) : new Date(a.createdAt));
        let dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.createdAt?._seconds ? new Date(b.createdAt._seconds * 1000) : new Date(b.createdAt));
        return dateB - dateA;
      });

      setOrders(filteredOrders);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalOrders(response.pagination?.totalOrders || filteredOrders.length);

      // Fetch analytics stats for stat cards (server-side, consistent with HQ page)
      try {
        const analyticsOptions = {};
        if (dateRange.startDate) analyticsOptions.startDate = dateRange.startDate;
        if (dateRange.endDate) analyticsOptions.endDate = dateRange.endDate;
        const analyticsPeriod = dateRange.todayOnly ? 'today' : 'custom';
        const analyticsResponse = await apiClient.getAnalytics(restaurantId, analyticsPeriod, analyticsOptions);
        if (analyticsResponse?.success && analyticsResponse?.analytics) {
          setAnalyticsStats(analyticsResponse.analytics);
        }
      } catch (analyticsErr) {
        console.error('Analytics stats fetch error (non-blocking):', analyticsErr);
      }

      // Cache the data
      const dataToCache = {
        orders: filteredOrders,
        totalPages: response.pagination?.totalPages || 1,
        totalOrders: response.pagination?.totalOrders || filteredOrders.length
      };
      setCachedOrderHistoryData(restaurantId, dataToCache, cacheKey);
      // Also persist to IndexedDB for offline access
      setCachedData(`orders_${restaurantId}_${cacheKey}`, dataToCache).catch(() => {});
      console.log('✅ Order history data cached');

    } catch (error) {
      console.error('Error fetching orders:', error);
      // Try IndexedDB fallback when offline
      try {
        const idbCached = await getCachedData(`orders_${restaurantId}_${cacheKey}`);
        if (idbCached) {
          setOrders(idbCached.orders || []);
          setTotalPages(idbCached.totalPages || 1);
          setTotalOrders(idbCached.totalOrders || 0);
          console.log('📦 Loaded order history from IndexedDB cache');
        } else {
          // Also show any pending offline orders
          const offlineOrders = await getAllOfflineOrders();
          const restaurantOffline = offlineOrders.filter(o => o.orderData?.restaurantId === restaurantId);
          if (restaurantOffline.length > 0) {
            const offlineDisplay = restaurantOffline.map(o => ({
              id: o.idempotencyKey,
              ...o.orderData,
              syncStatus: o.syncStatus,
              _isOffline: true,
            }));
            setOrders(offlineDisplay);
          } else {
            setError(t('common.error'));
            setOrders([]);
          }
        }
      } catch (idbErr) {
        setError(t('common.error'));
        setOrders([]);
      }
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
      window.dispatchEvent(new CustomEvent('orderhistoryBackgroundLoading', { detail: { loading: false } }));
    }
  }, [restaurantId, currentPage, limit, selectedStatus, selectedOrderType, myOrdersOnly, searchTerm, dateFilterMode, selectedPaymentMethod, customStartDate, customEndDate, user?.id, getDateRange]);

  useEffect(() => {
    const loadUserAndRestaurant = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token || !userData.id) {
          console.log('❌ OrderHistory: No auth token or user, redirecting to login');
          router.push('/login');
          return;
        }

        console.log('👤 OrderHistory: User loaded:', userData.role);
        setUser(userData);

        // Try multiple sources for restaurant ID (in order of priority)
        let finalRestaurantId = null;
        let finalRestaurant = null;

        // 1. For staff members (not owners) - use assigned restaurant from user data
        if (userData.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(userData.role)) {
          finalRestaurantId = userData.restaurantId;
          finalRestaurant = {
            id: userData.restaurantId,
            name: userData.restaurant?.name || 'Restaurant'
          };
          console.log('👨‍💼 OrderHistory: Using staff assigned restaurant:', finalRestaurantId);
        }
        // 2. For owners - fetch restaurants from API (includes defaultRestaurantId from BE)
        else {
          try {
            const restaurantsResponse = await apiClient.getRestaurants();
            if (restaurantsResponse.restaurants && restaurantsResponse.restaurants.length > 0) {
              const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
              const defaultId = restaurantsResponse.defaultRestaurantId;

              // Priority: localStorage > BE default > first restaurant
              const resolved = restaurantsResponse.restaurants.find(r => r.id === savedRestaurantId) ||
                              (defaultId ? restaurantsResponse.restaurants.find(r => r.id === defaultId) : null) ||
                              restaurantsResponse.restaurants[0];

              finalRestaurantId = resolved.id;
              finalRestaurant = resolved;
              console.log('✅ OrderHistory: Using restaurant:', finalRestaurantId, resolved.name);

              // Sync localStorage
              localStorage.setItem('selectedRestaurantId', finalRestaurantId);
              localStorage.setItem('selectedRestaurant', JSON.stringify(finalRestaurant));
            } else {
              console.warn('⚠️ OrderHistory: No restaurants found in API response');
            }
          } catch (error) {
            // Fallback to localStorage if API fails
            const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
            const savedRestaurant = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
            if (savedRestaurantId && savedRestaurant) {
              finalRestaurantId = savedRestaurantId;
              finalRestaurant = savedRestaurant;
              console.log('💾 OrderHistory: API failed, using localStorage:', finalRestaurantId);
            }
            console.error('❌ OrderHistory: Error fetching restaurants:', error);
          }
        }

        if (finalRestaurantId) {
          console.log('✅ OrderHistory: Restaurant set successfully:', finalRestaurantId);
          setRestaurantId(finalRestaurantId);
          setRestaurant(finalRestaurant);
        } else {
          console.error('❌ OrderHistory: No restaurant ID available');
          setError('No restaurant found. Please contact support.');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ OrderHistory: Error in loadUserAndRestaurant:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    loadUserAndRestaurant();
  }, [router]);

  useEffect(() => { if (restaurantId) fetchOrders(true); }, [fetchOrders, restaurantId]);

  // Fetch print settings when restaurantId is available
  useEffect(() => {
    if (!restaurantId) return;
    const fetchPrintSettings = async () => {
      try {
        const response = await apiClient.getPrintSettings(restaurantId);
        if (response?.printSettings) {
          setPrintSettings(response.printSettings);
          console.log('📨 Print settings loaded:', response.printSettings);
        }
      } catch (error) {
        console.log('Print settings not available, will use browser print:', error.message);
        setPrintSettings(null);
      }
    };
    fetchPrintSettings();
  }, [restaurantId]);

  // Listen for restaurant changes — update state so Pusher reconnects via dependency
  useEffect(() => {
    const handleRestaurantChange = (event) => {
      const newId = event.detail?.restaurantId || localStorage.getItem('selectedRestaurantId');
      const newRestaurant = event.detail?.restaurant || JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
      if (newId && newId !== restaurantId) {
        console.log('📡 OrderHistory: Restaurant changed, switching to', newId);
        setRestaurantId(newId);
        if (newRestaurant) setRestaurant(newRestaurant);
      }
    };
    window.addEventListener('restaurantChanged', handleRestaurantChange);
    return () => window.removeEventListener('restaurantChanged', handleRestaurantChange);
  }, [restaurantId]);

  // Pusher subscription for real-time order updates
  useEffect(() => {
    if (!restaurantId) return;

    // Initialize Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '4e1f74ae05c66bbc4eec', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    });

    // Subscribe to restaurant-specific channel
    const channelName = `restaurant-${restaurantId}`;
    const channel = pusher.subscribe(channelName);

    console.log(`📡 Pusher: Subscribed to channel '${channelName}'`);

    // Handle order events
    const handleOrderEvent = (eventName, data) => {
      console.log(`📡 Pusher: Received '${eventName}' event:`, data);
      // Refresh orders list (without cache to get latest data)
      fetchOrders(false);
    };

    channel.bind('order-created', (data) => handleOrderEvent('order-created', data));
    channel.bind('order-status-updated', (data) => handleOrderEvent('order-status-updated', data));
    channel.bind('order-updated', (data) => handleOrderEvent('order-updated', data));
    channel.bind('order-deleted', (data) => handleOrderEvent('order-deleted', data));

    // Cleanup on unmount
    return () => {
      console.log(`📡 Pusher: Unsubscribing from channel '${channelName}'`);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [restaurantId, fetchOrders]);

  // Reset to page 1 only when filters change (not when currentPage changes – that was breaking Next/Prev)
  useEffect(() => { setCurrentPage(1); }, [selectedStatus, selectedOrderType, myOrdersOnly, searchTerm, dateFilterMode, selectedPaymentMethod, customStartDate, customEndDate]);

  const handleSearch = (e) => { e.preventDefault(); fetchOrders(); };
  const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage); };
  
  const handleViewOrder = (order) => {
    setSelectedOrderForModal(order);
  };

  const handleViewInvoice = (order) => {
    setSelectedOrderForInvoice(order);
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt(t('common.cancel') + ' reason:'); // Ideally translate prompt message too
    if (reason === null) return;
    try {
      await apiClient.cancelOrder(orderId, reason);
      fetchOrders();
      alert(t('orderHistory.status.cancelled'));
    } catch (error) {
      console.error('Error cancelling:', error);
      alert(t('common.error') + ': ' + (error.message || 'Unknown error'));
    }
  };

  const handleMarkCompleted = (orderId) => {
    setMarkCompleteOrderId(orderId);
  };

  const executeMarkComplete = async (orderId) => {
    setMarkCompleteSubmitting(true);
    try {
      await apiClient.updateOrderStatus(orderId, 'completed');
      setOrders(prevOrders => prevOrders.map(o =>
        o.id === orderId ? { ...o, status: 'completed' } : o
      ));
      setMarkCompleteOrderId(null);
      setTimeout(() => fetchOrders(false), 500);
    } catch (error) {
      console.error('Error marking as completed:', error);
      alert(t('common.error') + ': ' + (error.message || 'Failed to complete order'));
    } finally {
      setMarkCompleteSubmitting(false);
    }
  };

  const handleEditOrder = (orderId) => router.push(`/dashboard?orderId=${orderId}&mode=edit&from=orderhistory`);

  const handleDeleteOrder = (orderId) => {
    setDeleteError(null);
    setDeleteConfirmOrderId(orderId);
  };

  const executeDeleteOrder = async () => {
    if (!deleteConfirmOrderId) return;
    setDeleteSubmitting(true);
    setDeleteError(null);
    try {
      await apiClient.deleteOrder(deleteConfirmOrderId);
      setDeleteConfirmOrderId(null);
      setDeleteSuccess(t('orderHistory.deleteSuccess') || 'Order deleted. View it under status "Deleted".');
      setTimeout(() => setDeleteSuccess(null), 5000);
      fetchOrders(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      setDeleteError(error.message || t('common.error') || 'Failed to delete order');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Browser print fallback function - format matches KOT Printer app
  const browserPrint = (order) => {
    const restaurantName = restaurant?.name || 'Restaurant';
    const btype = restaurant?.businessType || 'restaurant';
    const billingLabels = {
      restaurant: { billTitle: 'BILL / INVOICE', itemCol: 'Item', qtyCol: 'Qty', customerLabel: 'Customer', footer: 'Thank you for dining with us!', billLabel: 'Bill' },
      bar: { billTitle: 'BAR TAB', itemCol: 'Drink / Item', qtyCol: 'Qty', customerLabel: 'Guest', footer: 'Thank you for visiting! Cheers!', billLabel: 'Tab' },
      bakery: { billTitle: 'RECEIPT', itemCol: 'Item', qtyCol: 'Qty', customerLabel: 'Customer', footer: 'Thank you! Enjoy your fresh bakes!', billLabel: 'Receipt' },
      ice_cream: { billTitle: 'RECEIPT', itemCol: 'Item / Flavor', qtyCol: 'Qty', customerLabel: 'Customer', footer: 'Thank you! Stay cool, visit again!', billLabel: 'Receipt' },
      cafe: { billTitle: 'RECEIPT', itemCol: 'Item', qtyCol: 'Qty', customerLabel: 'Name', footer: 'Thanks for stopping by! See you soon.', billLabel: 'Receipt' },
      qsr: { billTitle: 'ORDER RECEIPT', itemCol: 'Item', qtyCol: 'Qty', customerLabel: 'Token', footer: 'Thank you! Visit again.', billLabel: 'Receipt' }
    };
    const bLabels = billingLabels[btype] || billingLabels.restaurant;
    const orderNum = order.dailyOrderId ?? order.orderNumber ?? order.id ?? '—';
    const tableNum = order.tableNumber || order.customerDisplay?.tableNumber || order.customerInfo?.tableNumber || null;
    const roomNum = order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber || null;
    const customerName = order.customerDisplay?.name || order.customerInfo?.name || null;
    const orderType = order.orderType || null;
    const items = order.items || [];
    const formattedTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const formattedDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    if (order.status === 'completed') {
      // Bill/Invoice format - matches KOT Printer app's generateBillHtml
      const subtotal = items.reduce((sum, item) => sum + (item.total || (item.price * item.quantity) || 0), 0);
      let totalTax = 0;
      const taxBreakdownArr = [];

      if (order.taxBreakdown && Array.isArray(order.taxBreakdown) && order.taxBreakdown.length > 0) {
        order.taxBreakdown.forEach(t => {
          const amt = t.amount || 0;
          totalTax += amt;
          taxBreakdownArr.push({ name: t.name || 'Tax', rate: t.rate, amount: amt });
        });
      } else if (order.taxAmount && order.taxAmount > 0) {
        totalTax = order.taxAmount;
        taxBreakdownArr.push({ name: 'Tax', rate: null, amount: totalTax });
      }

      const total = order.finalAmount && order.finalAmount > 0 ? order.finalAmount : (subtotal + totalTax);
      const symbol = getCurrencySymbol();
      const itemsHtml = items.map(item => `<tr><td style="text-align:left;padding:2px 4px;">${(item.name || '').replace(/</g,'&lt;')}</td><td style="text-align:center;padding:2px 4px;">${item.quantity || 1}</td><td style="text-align:right;padding:2px 4px;">${symbol}${((item.price || item.total/(item.quantity||1) || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join('');
      const taxHtml = taxBreakdownArr.map(t => `<tr><td colspan="2" style="text-align:left;padding:2px 4px;">${(t.name || 'Tax').replace(/</g,'&lt;')}${t.rate != null ? ` (${t.rate}%)` : ''}</td><td style="text-align:right;padding:2px 4px;">${symbol}${(t.amount || 0).toFixed(2)}</td></tr>`).join('');

      const billContent = `<!DOCTYPE html><html><head><title>${bLabels.billLabel} #${orderNum}</title><style>@page{size:80mm auto;margin:0;}body{font-family:'Courier New',Courier,monospace;margin:16px;font-size:12px;line-height:1.4;max-width:80mm;} .bill-header{text-align:center;margin-bottom:8px;} .restaurant-name{font-size:16px;font-weight:bold;text-transform:uppercase;} .bill-title{font-size:14px;font-weight:bold;margin-top:4px;} .divider{text-align:center;margin:6px 0;} .bill-info{margin:8px 0;font-size:11px;} .info-row{display:flex;justify-content:space-between;margin:2px 0;} table{width:100%;border-collapse:collapse;margin:8px 0;} th{text-align:left;border-bottom:1px dashed #000;padding:4px;font-size:11px;} td{font-size:11px;} .total-section{border-top:1px dashed #000;margin-top:8px;padding-top:4px;} .total-row{display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin-top:4px;} .bill-footer{margin-top:12px;text-align:center;font-size:11px;}</style></head><body><div class="bill-header"><div class="restaurant-name">${restaurantName.replace(/</g,'&lt;')}</div><div class="bill-title">--- ${bLabels.billTitle} ---</div></div><div class="divider">--------------------------------</div><div class="bill-info"><div class="info-row"><span>${bLabels.billLabel}#:</span><span><strong>${orderNum}</strong></span></div><div class="info-row"><span>Date:</span><span>${formattedDate} ${formattedTime}</span></div>${tableNum ? `<div class="info-row"><span>Table:</span><span>${tableNum}</span></div>` : ''}${roomNum ? `<div class="info-row"><span>Room:</span><span>${roomNum}</span></div>` : ''}${customerName ? `<div class="info-row"><span>${bLabels.customerLabel}:</span><span>${String(customerName).replace(/</g,'&lt;')}</span></div>` : ''}<div class="info-row"><span>Payment:</span><span>${(order.paymentMethod || 'CASH').toUpperCase()}</span></div></div><div class="divider">--------------------------------</div><table><thead><tr><th style="text-align:left;">${bLabels.itemCol}</th><th style="text-align:center;">${bLabels.qtyCol}</th><th style="text-align:right;">Amt</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="total-section"><div class="bill-info"><div class="info-row"><span>Subtotal:</span><span>${symbol}${subtotal.toFixed(2)}</span></div></div>${taxHtml ? `<table style="margin:4px 0;"><tbody>${taxHtml}</tbody></table>` : ''}<div class="total-row"><span>TOTAL:</span><span>${symbol}${total.toFixed(2)}</span></div></div><div class="divider">================================</div><div class="bill-footer"><p>${bLabels.footer}</p><p style="font-size:10px;margin-top:4px;">Powered by DineOpen</p></div></body></html>`;

      const win = window.open('', '_blank', 'width=400,height=600');
      if (win) {
        win.document.write(billContent);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 500);
      }
    } else {
      // KOT format - matches KOT Printer app's generateKOTHtml
      const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
      const specialInstructions = order.specialInstructions || '';
      const kotContent = `<!DOCTYPE html><html><head><title>KOT - ${orderNum}</title><style>@page{size:80mm auto;margin:0;}body{font-family:'Courier New',Courier,monospace;margin:16px;font-size:12px;line-height:1.4;max-width:80mm;} .kot-header{text-align:center;margin-bottom:8px;} .restaurant-name{font-size:16px;font-weight:bold;text-transform:uppercase;} .kot-title{font-size:14px;font-weight:bold;margin-top:4px;} .divider{text-align:center;margin:6px 0;} .kot-info{margin:8px 0;} .kot-info div{margin:2px 0;} .item{margin:6px 0;} .item-main{display:flex;} .item-qty{width:30px;font-weight:bold;} .item-name{font-weight:bold;} .item-detail{margin-left:30px;font-size:11px;} .item-note{margin-left:30px;font-size:11px;font-style:italic;} .kot-footer{text-align:center;margin-top:8px;font-weight:bold;} .special-instructions{margin:8px 0;padding:6px;border:1px dashed #000;text-align:center;} .special-instructions strong{display:block;margin-bottom:4px;} .special-instructions div{text-align:left;}</style></head><body><div class="kot-header"><div class="restaurant-name">${restaurantName.replace(/</g,'&lt;')}</div><div class="kot-title">--- KITCHEN ORDER ---</div></div><div class="divider">--------------------------------</div><div class="kot-info"><div><strong>Order#:</strong> ${orderNum}</div>${tableNum ? `<div><strong>Table:</strong> ${tableNum}</div>` : ''}${roomNum ? `<div><strong>Room:</strong> ${roomNum}</div>` : ''}<div><strong>Time:</strong> ${formattedTime}</div><div><strong>Date:</strong> ${formattedDate}</div>${customerName ? `<div><strong>Customer:</strong> ${String(customerName).replace(/</g,'&lt;')}</div>` : ''}${orderType ? `<div><strong>Type:</strong> ${orderType}</div>` : ''}</div><div class="divider">--------------------------------</div><div style="font-weight:bold;margin-bottom:4px;">QTY &nbsp; ITEM</div><div class="divider">--------------------------------</div>${items.map(i => `<div class="item"><div class="item-main"><span class="item-qty">${i.quantity || 1}x</span><span class="item-name">${(i.name || '').replace(/</g,'&lt;')}</span></div>${i.selectedVariant?.name ? `<div class="item-detail">[${i.selectedVariant.name}]</div>` : ''}${(i.selectedCustomizations || []).map(c => `<div class="item-detail">+ ${(c.name || c || '').toString().replace(/</g,'&lt;')}</div>`).join('')}${i.notes ? `<div class="item-note">Note: ${(i.notes || '').replace(/</g,'&lt;')}</div>` : ''}</div>`).join('')}<div class="divider">--------------------------------</div>${specialInstructions ? `<div class="special-instructions"><strong>*** SPECIAL INSTRUCTIONS ***</strong><div>${specialInstructions.replace(/</g,'&lt;')}</div></div><div class="divider">--------------------------------</div>` : ''}<div class="kot-footer">Total Items: ${totalItems}</div><div class="divider">================================</div></body></html>`;

      const pw = window.open('', '_blank', 'width=400,height=600');
      if (pw) {
        pw.document.write(kotContent);
        pw.document.close();
        pw.focus();
        setTimeout(() => { pw.print(); }, 400);
      }
    }
  };

  // Smart print - tries KOT Printer app first, falls back to browser print
  const handleSmartPrint = async (order) => {
    // If KOT Printer is enabled, send to printer app via API
    if (printSettings?.kotPrinterEnabled && printSettings?.usePusherForKOT) {
      try {
        setPrintingOrderId(order.id);
        const response = await apiClient.requestManualPrint(order.id);
        if (response?.success) {
          const printType = order.status === 'completed' ? 'Bill' : 'KOT';
          setPrintSuccess(`${printType} sent to printer (#${order.dailyOrderId || order.id?.slice(-4)})`);
          setTimeout(() => setPrintSuccess(null), 3000);
        }
      } catch (error) {
        console.error('Manual print API error:', error);
        // If API fails or returns fallbackToBrowser, use browser print
        if (error.response?.data?.fallbackToBrowser || error.message?.includes('disabled')) {
          browserPrint(order);
        } else {
          // Still try browser print as fallback
          browserPrint(order);
        }
      } finally {
        setPrintingOrderId(null);
      }
    } else {
      // KOT Printer not enabled, use browser print
      browserPrint(order);
    }
  };

  const getOrderBreakdown = (order) => {
    // Calculate subtotal from items
    let subtotal = 0;
    if (order.items && Array.isArray(order.items)) {
      subtotal = order.items.reduce((sum, item) => sum + (item.total || (item.price * item.quantity) || 0), 0);
    } else if (order.totalAmount && order.totalAmount > 0) subtotal = order.totalAmount;
    subtotal = parseFloat(subtotal.toFixed(2));

    let taxAmount = 0;
    const taxLines = [];

    // PRIORITY: Use saved tax data from order (tax at time of order placement)
    // This ensures historical accuracy - orders show the tax that was applied when placed
    if (order.taxBreakdown && Array.isArray(order.taxBreakdown) && order.taxBreakdown.length > 0) {
      // Use saved tax breakdown (individual tax lines)
      order.taxBreakdown.forEach(tax => {
        const amt = parseFloat((tax.amount || 0).toFixed(2));
        taxAmount += amt;
        taxLines.push({ name: tax.name || 'Tax', rate: tax.rate, amount: amt });
      });
    } else if (order.taxAmount && order.taxAmount > 0) {
      // Use saved total tax amount (for orders without detailed breakdown)
      taxAmount = parseFloat(order.taxAmount.toFixed(2));
      taxLines.push({ name: 'Tax', rate: null, amount: taxAmount });
    }
    // Note: No fallback to current taxSettings - this prevents showing wrong tax on old orders
    // Old orders without saved tax data will show no tax (which is accurate if tax wasn't applied)

    // Calculate discount breakdown from order data
    let discountAmount = 0;
    const discountLines = [];

    if (order.discountAmount && order.discountAmount > 0) {
      const amt = parseFloat(order.discountAmount.toFixed(2));
      discountAmount += amt;
      const offerName = order.appliedOffer?.name || (order.appliedOffers?.length > 0 ? order.appliedOffers[0]?.name : null) || 'Offer Discount';
      discountLines.push({ name: offerName, amount: amt });
    }
    if (order.manualDiscount && order.manualDiscount > 0) {
      const amt = parseFloat(order.manualDiscount.toFixed(2));
      discountAmount += amt;
      discountLines.push({ name: 'Manual Discount', amount: amt });
    }
    if (order.loyaltyDiscount && order.loyaltyDiscount > 0) {
      const amt = parseFloat(order.loyaltyDiscount.toFixed(2));
      discountAmount += amt;
      discountLines.push({ name: 'Loyalty Points', amount: amt });
    }

    // Billing feature amounts
    const serviceCharge = order.serviceChargeAmount ? parseFloat(order.serviceChargeAmount.toFixed(2)) : 0;
    const tip = order.tipAmount ? parseFloat(order.tipAmount.toFixed(2)) : 0;
    const roundOff = order.roundOffAmount ? parseFloat(order.roundOffAmount.toFixed(2)) : 0;

    // Use saved finalAmount if available, otherwise calculate
    const total = order.finalAmount && order.finalAmount > 0
      ? parseFloat(order.finalAmount.toFixed(2))
      : parseFloat((subtotal - discountAmount + serviceCharge + taxAmount + tip + roundOff).toFixed(2));

    return { subtotal, taxAmount, taxLines, discountAmount, discountLines, serviceCharge, tip, roundOff, total };
  };

  const calculateOrderTotal = (order) => {
    const { total } = getOrderBreakdown(order);
    if (total > 0) return total;
    let subtotal = 0;
    if (order.items && Array.isArray(order.items)) {
      subtotal = order.items.reduce((sum, item) => sum + (item.total || (item.price * item.quantity) || 0), 0);
    } else if (order.totalAmount && order.totalAmount > 0) subtotal = order.totalAmount;
    if (order.finalAmount && order.finalAmount > 0) return parseFloat(order.finalAmount.toFixed(2));
    return parseFloat(subtotal.toFixed(2));
  };

  // Calculate summary statistics — use server-side analytics for consistency with HQ page
  const calculateStats = () => {
    if (analyticsStats) {
      // Use server-side analytics (same source as HQ and Analytics pages)
      return {
        totalRevenue: analyticsStats.totalRevenue || 0,
        totalRevenueWithTax: analyticsStats.totalRevenueWithTax || 0,
        orderCount: analyticsStats.totalOrders || 0,
        completedCount: orders.filter(o => o.status === 'completed').length,
        paymentBreakdown: analyticsStats.paymentBreakdown || {}
      };
    }

    // Fallback: client-side calculation from current page (before analytics loads)
    const validOrders = orders.filter(order => {
      return order.status !== 'cancelled' && order.status !== 'deleted' && order.status !== 'saved';
    });

    const totalRevenue = validOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
    const orderCount = validOrders.length;
    const completedCount = validOrders.filter(o => o.status === 'completed').length;

    // Client-side payment breakdown fallback
    const paymentBreakdown = {};
    validOrders.forEach(order => {
      const method = (order.paymentMethod || 'cash').toLowerCase();
      if (!paymentBreakdown[method]) paymentBreakdown[method] = { count: 0, total: 0 };
      paymentBreakdown[method].count += 1;
      paymentBreakdown[method].total += calculateOrderTotal(order);
    });

    return { totalRevenue, orderCount, completedCount, paymentBreakdown };
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    const statusStyle = getStatusStyle(order.status, order.orderFlow, order.lastStatus, order);
    const breakdown = getOrderBreakdown(order);
    const orderTotal = breakdown.total;
    const subtotal = breakdown.subtotal;
    const modalSourceChip = getOrderSourceChip(order);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-2 border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  #{order.dailyOrderId || order.orderNumber || order.id.slice(-4).toUpperCase()}
                </h2>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border-2 shadow-sm"
                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
                >
                  {statusStyle.label}
                </span>
                {modalSourceChip && (
                  <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${modalSourceChip.className}`}>
                    {modalSourceChip.label}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <FaClock className="text-gray-400" /> {formatDate(order.createdAt)}
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <FaTimes className="text-gray-500 text-lg" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="bg-white/60 p-4 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-600 mb-2 flex items-center gap-2 font-medium uppercase tracking-wide">
                  <FaUser className="text-blue-600"/> {t('orderHistory.customer')}
                </div>
                <div className="font-semibold text-base text-gray-900 mb-1">{order.customerDisplay?.name || 'Walk-in'}</div>
                <div className="text-sm text-gray-600">{order.customerDisplay?.phone || 'No phone'}</div>
              </div>
              <div className="bg-white/60 p-4 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-600 mb-2 flex items-center gap-2 font-medium uppercase tracking-wide">
                  {order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber ? (
                    <FaBed className="text-blue-600"/>
                  ) : (
                    <FaTable className="text-blue-600"/>
                  )}
                  {order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber ? 'Room' : t('orderHistory.table')}
                </div>
                <div className="font-semibold text-base text-gray-900 mb-1">
                  {order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber || order.customerDisplay?.tableNumber || order.tableNumber || 'N/A'}
                </div>
                <div className="text-sm text-gray-600 capitalize">
                  {order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber ? 'Hotel Room' : (order.customerDisplay?.floorName || 'No floor')}
                </div>
              </div>
              <div className="bg-white/60 p-4 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-600 mb-2 flex items-center gap-2 font-medium uppercase tracking-wide">
                  <FaUtensils className="text-blue-600"/> {t('common.category')}
                </div>
                <div className="font-semibold text-base text-gray-900 mb-1 capitalize">{order.orderType?.replace('-', ' ') || t('orderHistory.type.dineIn')}</div>
                <div className="text-sm text-gray-600 capitalize">{order.paymentMethod || 'Unpaid'}</div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaReceipt className="text-red-600" /> {t('orderHistory.items')}
              </h3>
              <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b-2 border-gray-200">
                    <tr>
                      <th className="px-5 py-4 text-left">{t('common.items')}</th>
                      <th className="px-5 py-4 text-center">{t('common.quantity')}</th>
                      <th className="px-5 py-4 text-right">{t('common.price')}</th>
                      <th className="px-5 py-4 text-right">{t('common.total')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.items?.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          {item.variant && (
                            <div className="text-xs text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded inline-block">
                              {t('orderHistory.variant')}: {item.variant.name}
                            </div>
                          )}
                          {item.addons?.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              + {item.addons.map(a => a.name).join(', ')}
                            </div>
                          )}
                          {item.notes && (
                            <div className="text-xs text-amber-700 mt-1 italic bg-amber-50 px-2 py-0.5 rounded">
                              {t('common.notes')}: {item.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-gray-700">x{item.quantity}</td>
                        <td className="px-5 py-4 text-right text-gray-600">{formatCurrency(item.price)}</td>
                        <td className="px-5 py-4 text-right font-bold text-gray-900">{formatCurrency(item.total || (item.price * item.quantity))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {order.notes && (
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border-2 border-amber-200 text-sm text-amber-900 shadow-sm">
                <span className="font-bold">{t('orderHistory.orderNote')}:</span> {order.notes}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-t-2 border-gray-200 p-6">
            <div className="flex flex-col gap-3 max-w-sm ml-auto bg-white p-5 rounded-xl border-2 border-gray-200 shadow-sm">
              <div className="flex justify-between text-sm text-gray-600">
                <span className="font-medium">{t('orderHistory.subtotal')}</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span className="font-medium">Discount</span>
                  <span className="font-semibold">-{formatCurrency(order.discountAmount)}</span>
                </div>
              )}
              {order.serviceChargeAmount > 0 && (
                <div className="flex justify-between text-sm text-purple-600">
                  <span className="font-medium">Service Charge {order.serviceChargeRate ? `(${order.serviceChargeRate}%)` : ''}</span>
                  <span className="font-semibold">{formatCurrency(order.serviceChargeAmount)}</span>
                </div>
              )}
              {breakdown.taxAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="font-medium">{t('orderHistory.tax')}</span>
                  <span className="font-semibold">{formatCurrency(breakdown.taxAmount)}</span>
                </div>
              )}
              {order.tipAmount > 0 && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span className="font-medium">Tip {order.tipPercentage ? `(${order.tipPercentage}%)` : ''}</span>
                  <span className="font-semibold">{formatCurrency(order.tipAmount)}</span>
                </div>
              )}
              {order.roundOffAmount != null && order.roundOffAmount !== 0 && (
                <div className="flex justify-between text-sm text-gray-400">
                  <span className="font-medium">Round-off</span>
                  <span className="font-semibold">{order.roundOffAmount > 0 ? '+' : ''}{formatCurrency(order.roundOffAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300 mt-2">
                <span>{t('orderHistory.total')}</span>
                <span className="text-red-600">{formatCurrency(orderTotal)}</span>
              </div>
              {/* Payment details */}
              {order.splitPayments && order.splitPayments.length > 0 && (
                <div className="pt-2 border-t border-gray-200 mt-1">
                  <div className="text-xs font-semibold text-gray-500 mb-1">Split Payment</div>
                  {order.splitPayments.map((sp, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-600">
                      <span className="capitalize">{sp.method}</span>
                      <span>{formatCurrency(sp.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              {order.cashReceived > 0 && (
                <div className="pt-2 border-t border-gray-200 mt-1 text-xs text-gray-500">
                  <div className="flex justify-between"><span>Cash Received</span><span>{formatCurrency(order.cashReceived)}</span></div>
                  {order.changeReturned > 0 && (
                    <div className="flex justify-between text-green-600"><span>Change Returned</span><span>{formatCurrency(order.changeReturned)}</span></div>
                  )}
                </div>
              )}
              {(order.paidAmount > 0 || order.outstandingAmount > 0) && (
                <div className="pt-2 border-t border-gray-200 mt-1 text-xs">
                  <div className="text-xs font-semibold text-gray-500 mb-1">Payment Status</div>
                  {order.paidAmount > 0 && (
                    <div className="flex justify-between text-green-600"><span>Paid</span><span>{formatCurrency(order.paidAmount)}</span></div>
                  )}
                  {order.outstandingAmount > 0 && (
                    <div className="flex justify-between text-red-600 font-semibold"><span>Outstanding</span><span>{formatCurrency(order.outstandingAmount)}</span></div>
                  )}
                </div>
              )}
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3">
               <button 
                onClick={onClose}
                className="px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              >
                {t('orderHistory.close')}
              </button>
              <button 
                onClick={() => {
                    handleEditOrder(order.id);
                    onClose();
                }}
                className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg"
              >
                {t('orderHistory.editOrder')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FilterDropdown = ({ isOpen, onToggle, selectedValue, options, onSelect, placeholder, icon: Icon }) => (
    <div className="relative custom-dropdown">
      <button
        onClick={onToggle}
        className={`w-full px-3 py-1.5 text-left bg-white border rounded-lg flex items-center justify-between text-sm font-medium transition-all whitespace-nowrap ${isOpen ? 'border-red-400 ring-1 ring-red-100 shadow-sm' : selectedValue !== 'all' ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {Icon && <Icon className="text-gray-400 text-[10px]" />}
          <span className={selectedValue !== 'all' ? 'text-red-700' : 'text-gray-700'}>{options.find(opt => opt.value === selectedValue)?.label || placeholder}</span>
        </div>
        <FaChevronDown className={`text-gray-400 text-[10px] ml-1.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-20 min-w-[180px] mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => { onSelect(option.value); onToggle(); }}
              className={`w-full px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${selectedValue === option.value ? 'bg-red-50 text-red-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-[3px] border-gray-200" />
            <div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-transparent border-t-red-500 animate-spin" />
            <FaReceipt className="absolute inset-0 m-auto text-red-400 text-lg" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Loading orders...</p>
            <p className="text-xs text-gray-400 mt-0.5">Fetching your data</p>
          </div>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'all', label: t('orderHistory.status.all') },
    { value: 'pending', label: t('orderHistory.status.pending') },
    { value: 'confirmed', label: t('orderHistory.status.confirmed') },
    { value: 'completed', label: t('orderHistory.status.completed') },
    { value: 'cancelled', label: t('orderHistory.status.cancelled') },
    { value: 'deleted', label: t('orderHistory.status.deleted') }
  ];

  const typeOptions = [
    { value: 'all', label: t('orderHistory.type.all') },
    { value: 'dine-in', label: t('orderHistory.type.dineIn') },
    { value: 'takeaway', label: t('orderHistory.type.takeaway') },
    { value: 'delivery', label: t('orderHistory.type.delivery') }
  ];

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header Section — on mobile: single row with title + list/grid toggle to save space */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="py-3 sm:py-4 flex flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                <FaReceipt className="text-white text-base sm:text-xl" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{t('orderHistory.title')}</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block">{restaurant?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="font-medium">{totalOrders}</span>
                <span className="text-gray-400">orders</span>
              </div>
              <div className="flex bg-white border border-gray-200 p-0.5 sm:p-1 rounded-lg shadow-sm" title={isCompactView ? 'Compact' : 'Detailed'}>
                <button 
                  onClick={() => setIsCompactView(true)} 
                  className={`p-1.5 sm:p-2 rounded-md transition-all ${isCompactView ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} 
                  title="Compact View"
                >
                  <FaList size={14} className="sm:w-4 sm:h-4" />
                </button>
                <button 
                  onClick={() => setIsCompactView(false)} 
                  className={`p-1.5 sm:p-2 rounded-md transition-all ${!isCompactView ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`} 
                  title="Detailed View"
                >
                  <FaTh size={14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Summary Stats Cards — 2x2 on mobile, 4-col on desktop (same as original) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3 pb-2 sm:pb-3">
            {/* Revenue */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                <div className="bg-green-500 w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-bold leading-none">{getCurrencySymbol()}</span>
                </div>
                <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wide">Revenue</span>
              </div>
              <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">{formatCurrency(stats.totalRevenue)}</div>
              {stats.totalRevenueWithTax > stats.totalRevenue && (
                <div className="text-[10px] sm:text-[12px] text-green-700/70 mt-0.5 leading-tight">incl. tax: {formatCurrency(stats.totalRevenueWithTax)}</div>
              )}
            </div>
            {/* Orders */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                <div className="bg-blue-500 w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center">
                  <FaShoppingBag className="text-white text-xs sm:text-sm" />
                </div>
                <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wide">Orders</span>
              </div>
              <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">{stats.orderCount}</div>
            </div>
            {/* Payment Breakdown — replaces Avg Value */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                <div className="bg-purple-500 w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center">
                  <FaCreditCard className="text-white text-xs sm:text-sm" />
                </div>
                <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wide">Payments</span>
              </div>
              {stats.paymentBreakdown && Object.keys(stats.paymentBreakdown).length > 0 ? (
                <div className="space-y-1">
                  {Object.entries(stats.paymentBreakdown)
                    .sort((a, b) => b[1].total - a[1].total)
                    .map(([method, data]) => {
                      const colors = { cash: 'text-emerald-600', upi: 'text-violet-600', card: 'text-sky-600', online: 'text-cyan-600' };
                      const color = colors[method] || 'text-gray-600';
                      return (
                        <div key={method} className="flex items-center justify-between">
                          <span className={`text-[10px] sm:text-xs font-semibold capitalize ${color}`}>{method}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-gray-900">{formatCurrency(data.total)} <span className="font-normal text-gray-400 text-[9px]">({data.count})</span></span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">--</div>
              )}
            </div>
            {/* Completed */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                <div className="bg-amber-500 w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center">
                  <FaCheckCircle className="text-white text-xs sm:text-sm" />
                </div>
                <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wide">Completed</span>
              </div>
              <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">{stats.completedCount}</div>
            </div>
          </div>

          {/* Delete success banner */}
          {deleteSuccess && (
            <div className="mx-3 sm:mx-6 lg:mx-8 mt-2 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
              <span className="text-sm font-medium">{deleteSuccess}</span>
              <button
                type="button"
                onClick={() => setDeleteSuccess(null)}
                className="p-1 rounded hover:bg-green-100 text-green-600"
                aria-label="Dismiss"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          )}

          {/* Print success banner */}
          {printSuccess && (
            <div className="mx-3 sm:mx-6 lg:mx-8 mt-2 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800">
              <span className="text-sm font-medium"><FaPrint className="inline mr-2" />{printSuccess}</span>
              <button
                type="button"
                onClick={() => setPrintSuccess(null)}
                className="p-1 rounded hover:bg-orange-100 text-orange-600"
                aria-label="Dismiss"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          )}

          {/* Filters — All in one line */}
          <div className="py-2 sm:py-2.5 border-t border-gray-200">
            <div className="flex flex-wrap gap-1.5 items-center">
              <div className="relative min-w-0 w-36 sm:w-44 shrink-0">
                <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="w-full pl-8 pr-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-all placeholder:text-gray-400"
                />
              </div>
              <FilterDropdown
                isOpen={statusDropdownOpen}
                onToggle={() => { setStatusDropdownOpen(!statusDropdownOpen); setTypeDropdownOpen(false); }}
                selectedValue={selectedStatus}
                options={statusOptions}
                onSelect={setSelectedStatus}
                placeholder="All Status"
                icon={FaFilter}
              />
              <FilterDropdown
                isOpen={typeDropdownOpen}
                onToggle={() => { setTypeDropdownOpen(!typeDropdownOpen); setStatusDropdownOpen(false); }}
                selectedValue={selectedOrderType}
                options={typeOptions}
                onSelect={setSelectedOrderType}
                placeholder="All Types"
                icon={FaUtensils}
              />
              {/* Separator */}
              <div className="hidden sm:block w-px h-5 bg-gray-200" />
              {/* Date quick-filter chips */}
              {[
                { value: 'today', label: 'Today' },
                { value: 'yesterday', label: 'Yesterday' },
                { value: 'last7days', label: '7D' },
                { value: 'last30days', label: '30D' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setDateFilterMode(option.value)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                    dateFilterMode === option.value
                      ? 'bg-red-500 text-white border-red-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
              {dateFilterMode === 'custom' && customStartDate && customEndDate && (
                <span className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white border border-red-500">
                  {customStartDate} ~ {customEndDate}
                </span>
              )}
              {/* Calendar icon to open date modal */}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFilterModalOpen(true); }}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${dateFilterMode === 'custom' ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-500'}`}
                title="Custom date range"
              >
                <FaCalendarAlt className="text-sm" />
              </button>
              {/* Separator */}
              <div className="hidden sm:block w-px h-5 bg-gray-200" />
              <label className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs font-medium whitespace-nowrap shrink-0 border ${myOrdersOnly ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" checked={myOrdersOnly} onChange={(e) => setMyOrdersOnly(e.target.checked)} className="w-3 h-3 text-red-600 rounded focus:ring-red-500 border-gray-300" />
                Mine
              </label>
              {hasActiveFilters && (
                <button type="button" onClick={resetAllFilters} className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 shrink-0 transition-all" title="Reset all filters">
                  <FaTimes className="text-[10px]" /> <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
        
      {/* Loading indicator bar — shows during filter changes / data fetch */}
      {(loading || backgroundLoading) && orders.length > 0 && (
        <div className="relative w-full h-1 bg-gray-100 overflow-hidden z-10">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 rounded-full" style={{ width: '40%', animation: 'loadingSlide 1.2s ease-in-out infinite' }} />
          <style>{`@keyframes loadingSlide { 0% { left: -40%; } 100% { left: 100%; } }`}</style>
        </div>
      )}

      {/* Orders List */}
      <div className="flex-1 p-3 sm:px-6 sm:py-4 overflow-y-auto relative">
        {/* Fetching overlay — semi-transparent with spinner when loading with existing orders */}
        {(loading || backgroundLoading) && orders.length > 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-start justify-center pt-20" style={{ animation: 'fadeIn 0.15s ease-out' }}>
            <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-lg border border-gray-200" style={{ animation: 'slideDown 0.2s ease-out' }}>
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-700">Updating orders...</span>
            </div>
            <style>{`
              @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
          </div>
        )}
        <div className="w-full px-3 sm:px-6 lg:px-8">
          {!loading && orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaSearch className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orderHistory.noOrders')}</h3>
              <p className="text-sm text-gray-500">{t('orderHistory.adjustFilters')}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
            {orders.map((order) => {
              const statusStyle = getStatusStyle(order.status, order.orderFlow, order.lastStatus, order);
              const orderTotal = calculateOrderTotal(order);
              const breakdown = getOrderBreakdown(order);
              const itemCount = Array.isArray(order.items) ? order.items.length : 0;
              const sourceChip = getOrderSourceChip(order);
              
              if (isCompactView) {
                return (
                  <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 group overflow-hidden">
                    <div className="p-3 flex items-center gap-3">
                      <div className="w-1 h-14 rounded-full flex-shrink-0" style={{ backgroundColor: statusStyle.border }} />
                      <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-12 sm:col-span-3 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleOrderExpansion(order.id)}
                              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                              title={expandedOrders.has(order.id) ? t('common.close') : t('common.view')}
                            >
                              {expandedOrders.has(order.id) ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                            </button>
                            <div
                              onClick={() => copyToClipboard(order.dailyOrderId?.toString() || order.id)}
                              className="font-bold text-base text-gray-900 cursor-pointer hover:text-red-600 flex items-center gap-2 transition-colors"
                            >
                              <span>#{order.dailyOrderId || order.orderNumber || order.id.slice(-4).toUpperCase()}</span>
                              {order.syncSource === 'offline' && <FaCloudUploadAlt className="text-blue-400 text-xs" title="Synced from offline" />}
                              <FaCopy className="text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <FaClock className="text-[10px]" />
                            {formatDate(order.createdAt, true)}
                          </div>
                        </div>
                        <div className="col-span-12 sm:col-span-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                          <div className="flex flex-col gap-0.5" title="Customer">
                            <div className="flex items-center gap-2">
                              <FaUser className="text-gray-400 flex-shrink-0" />
                              <span className="truncate max-w-[120px] font-medium">{order.customerDisplay?.name || 'Walk-in'}</span>
                            </div>
                            {(sourceChip?.label === 'Online order' || sourceChip?.label === 'Dine App') && (order.customerDisplay?.phone || order.customerInfo?.phone) && (
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 pl-5">
                                <FaPhone className="text-[10px]" />
                                <span>{order.customerDisplay?.phone || order.customerInfo?.phone}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2" title={order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber ? "Room" : "Table"}>
                            {order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber ? (
                              <FaBed className="text-gray-400" />
                            ) : (
                              <FaTable className="text-gray-400" />
                            )}
                            <span>{order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber || order.customerDisplay?.tableNumber || order.tableNumber || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2" title="Type">
                            <FaUtensils className="text-gray-400" />
                            <span className="capitalize">{order.orderType?.replace('-', ' ') || t('orderHistory.type.dineIn')}</span>
                          </div>
                        </div>
                        <div className="col-span-6 sm:col-span-3 flex flex-col sm:items-start gap-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className="inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border-2 shadow-sm"
                              style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
                            >
                              {statusStyle.label}
                            </span>
                            {sourceChip && (
                              <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${sourceChip.className}`}>
                                {sourceChip.label}
                              </span>
                            )}
                            {order.syncSource === 'offline' && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
                                <FaCloudUploadAlt className="text-[8px]" /> Offline
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 font-medium">{order.paymentMethod || 'Cash'}</span>
                        </div>
                        <div className="col-span-6 sm:col-span-2 flex flex-col items-end gap-2">
                          <div className="text-right space-y-0.5">
                            {(breakdown.taxLines?.length > 0 || breakdown.discountLines?.length > 0 || breakdown.serviceCharge > 0 || breakdown.tip > 0 || breakdown.roundOff !== 0) && (
                              <>
                                <div className="text-xs text-gray-500">Subtotal {formatCurrency(breakdown.subtotal)}</div>
                                {breakdown.discountLines?.map((line, i) => (
                                  <div key={`d${i}`} className="text-xs text-green-600">-{line.name} {formatCurrency(line.amount)}</div>
                                ))}
                                {breakdown.serviceCharge > 0 && (
                                  <div className="text-xs text-purple-600">Service Charge {formatCurrency(breakdown.serviceCharge)}</div>
                                )}
                                {breakdown.taxLines.map((line, i) => (
                                  <div key={i} className="text-xs text-gray-500">{line.name}{line.rate != null ? ` (${line.rate}%)` : ''} {formatCurrency(line.amount)}</div>
                                ))}
                                {breakdown.tip > 0 && (
                                  <div className="text-xs text-amber-600">Tip {formatCurrency(breakdown.tip)}</div>
                                )}
                                {breakdown.roundOff !== 0 && (
                                  <div className="text-xs text-gray-400">Round-off {breakdown.roundOff > 0 ? '+' : ''}{formatCurrency(breakdown.roundOff)}</div>
                                )}
                              </>
                            )}
                            <span className="font-bold text-lg text-gray-900">{formatCurrency(breakdown.total)}</span>
                            {order.outstandingAmount > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded-full">PARTIAL</span>
                                <span className="text-xs text-red-600 font-semibold">Due: {formatCurrency(order.outstandingAmount)}</span>
                              </div>
                            )}
                            {order.paymentStatus === 'partial' && !order.outstandingAmount && order.paidAmount > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-semibold text-white bg-amber-500 px-2 py-0.5 rounded-full">PARTIAL</span>
                                <span className="text-xs text-amber-600 font-semibold">Paid: {formatCurrency(order.paidAmount)}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'deleted' && (
                                <button 
                                onClick={() => handleMarkCompleted(order.id)} 
                                className="p-2 text-green-600 bg-green-100 hover:bg-green-200 rounded-lg transition-colors" 
                                title="Mark Bill Complete"
                                >
                                <FaCheckCircle size={12} />
                                </button>
                            )}
                            {/* Invoice button hidden - using unified print flow */}
                            <button
                              onClick={() => handleSmartPrint(order)}
                              className={`p-2 rounded-lg transition-colors ${printingOrderId === order.id ? 'bg-orange-200 cursor-wait' : 'text-orange-600 bg-orange-100 hover:bg-orange-200'}`}
                              title={order.status === 'completed' ? 'Print Bill' : 'Print KOT'}
                              disabled={printingOrderId === order.id}
                            >
                              {printingOrderId === order.id ? <FaSpinner size={12} className="animate-spin" /> : <FaPrint size={12} />}
                            </button>
                            <button 
                              onClick={() => handleViewOrder(order)} 
                              className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" 
                              title={t('orderHistory.view')}
                            >
                              <FaEye size={12} />
                            </button>
                            {order.status !== 'deleted' && (
                            <button 
                              onClick={() => handleEditOrder(order.id)} 
                              className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm" 
                              title={t('orderHistory.edit')}
                            >
                              <FaEdit size={12} />
                            </button>
                            )}
                            {order.status !== 'deleted' && (
                              <button 
                                onClick={() => handleDeleteOrder(order.id)} 
                                className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" 
                                title={t('common.delete') || 'Delete order'}
                              >
                                <FaTrash size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div
                              onClick={() => copyToClipboard(String(order.dailyOrderId ?? order.orderNumber ?? order.id))}
                              className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                              title="Click to copy Order Number"
                            >
                              <span className="text-xs text-gray-500">Order#</span>
                              <span className="text-xs font-mono font-semibold text-gray-700">#{order.dailyOrderId ?? order.orderNumber ?? order.id?.slice(-4)?.toUpperCase() ?? '—'}</span>
                              {order.syncSource === 'offline' && <FaCloudUploadAlt className="text-blue-400 text-[10px]" title="Synced from offline" />}
                              <FaCopy className="text-gray-400 text-[10px]" />
                            </div>
                            <div
                              onClick={() => copyToClipboard(order.id)}
                              className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors flex-1 min-w-0"
                              title="Click to copy Order ID"
                            >
                              <span className="text-xs text-gray-500">ID</span>
                              <span className="text-xs font-mono font-semibold text-gray-700 truncate" title={order.id}>{order.id}</span>
                              <FaCopy className="text-gray-400 text-[10px] flex-shrink-0" />
                            </div>
                          </div>
                        </div>
                        {expandedOrders.has(order.id) && (
                          <div className="col-span-12 mt-2 pl-6 pr-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="text-xs font-semibold text-gray-600 mb-2">{itemCount} {t('orderHistory.items')}</div>
                            <div className="space-y-1">
                              {order.items?.slice(0, 6).map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm text-gray-700">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>{formatCurrency(item.total || (item.price * item.quantity))}</span>
                                </div>
                              ))}
                              {order.items?.length > 6 && <div className="text-xs text-gray-500 pt-1">+{order.items.length - 6} more</div>}
                            </div>
                            {order.specialInstructions && (
                              <div className="mt-3 pt-2 border-t border-gray-200">
                                <div className="flex items-start gap-2 text-xs">
                                  <span className="text-amber-600 font-semibold">📝 Instructions:</span>
                                  <span className="text-gray-700">{order.specialInstructions}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 group overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center flex-shrink-0">
                        <FaReceipt className="text-red-600 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                                #{order.dailyOrderId || order.orderNumber || order.id.slice(-4).toUpperCase()}
                                {order.syncSource === 'offline' && <FaCloudUploadAlt className="text-blue-400 text-xs" title="Synced from offline" />}
                              </h3>
                              <span
                                className="inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border-2 shadow-sm"
                                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
                              >
                                {statusStyle.label}
                              </span>
                              {sourceChip && (
                                <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${sourceChip.className}`}>
                                  {sourceChip.label}
                                </span>
                              )}
                              {order.syncSource === 'offline' && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
                                  <FaCloudUploadAlt className="text-[8px]" /> Offline
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FaClock className="text-[10px]" />
                              {formatDate(order.createdAt, true)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-baseline justify-end gap-2">
                              <span className="text-xl font-bold text-gray-900">{formatCurrency(breakdown.total)}</span>
                              <span className="text-[11px] text-gray-400">{order.paymentMethod || 'Cash'}</span>
                            </div>
                            {(breakdown.taxLines?.length > 0 || breakdown.serviceCharge > 0 || breakdown.tip > 0 || breakdown.roundOff !== 0) && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {formatCurrency(breakdown.subtotal)}
                                {breakdown.serviceCharge > 0 && ` + SC ${formatCurrency(breakdown.serviceCharge)}`}
                                {breakdown.taxLines?.length > 0 && ` + ${breakdown.taxLines.map((line) => `${line.name}${line.rate != null ? ` ${line.rate}%` : ''}`).join(', ')}`}
                                {breakdown.tip > 0 && ` + Tip ${formatCurrency(breakdown.tip)}`}
                                {breakdown.roundOff !== 0 && ` ${breakdown.roundOff > 0 ? '+' : '-'} Round ${formatCurrency(Math.abs(breakdown.roundOff))}`}
                              </div>
                            )}
                            {order.outstandingAmount > 0 && (
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded-full">PARTIAL</span>
                                <span className="text-xs text-red-600 font-semibold">Due: {formatCurrency(order.outstandingAmount)}</span>
                              </div>
                            )}
                            {order.paymentStatus === 'partial' && !order.outstandingAmount && order.paidAmount > 0 && (
                              <div className="flex items-center justify-end gap-1 mt-1">
                                <span className="text-xs font-semibold text-white bg-amber-500 px-2 py-0.5 rounded-full">PARTIAL</span>
                                <span className="text-xs text-amber-600 font-semibold">Paid: {formatCurrency(order.paidAmount)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-400 text-sm flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs text-gray-500">Customer</div>
                              <div className="text-sm font-medium text-gray-900">{order.customerDisplay?.name || 'Walk-in'}</div>
                              {(sourceChip?.label === 'Online order' || sourceChip?.label === 'Dine App') && (order.customerDisplay?.phone || order.customerInfo?.phone) && (
                                <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                                  <FaPhone className="text-[10px] flex-shrink-0" />
                                  <span>{order.customerDisplay?.phone || order.customerInfo?.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber ? (
                              <FaBed className="text-gray-400 text-sm" />
                            ) : (
                              <FaTable className="text-gray-400 text-sm" />
                            )}
                            <div>
                              <div className="text-xs text-gray-500">{order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber ? 'Room' : 'Table'}</div>
                              <div className="text-sm font-medium text-gray-900">{order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber || order.customerDisplay?.tableNumber || order.tableNumber || 'N/A'}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaUtensils className="text-gray-400 text-sm" />
                            <div>
                              <div className="text-xs text-gray-500">Type</div>
                              <div className="text-sm font-medium text-gray-900 capitalize">{order.orderType?.replace('-', ' ') || t('orderHistory.type.dineIn')}</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2.5 border border-gray-200 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">{itemCount} {t('orderHistory.items')}</span>
                            <button 
                              onClick={() => toggleOrderExpansion(order.id)} 
                              className="text-red-600 hover:text-red-700 flex items-center gap-1.5 text-sm font-medium transition-colors"
                              title={expandedOrders.has(order.id) ? t('common.close') : t('common.view')}
                            >
                              {expandedOrders.has(order.id) ? <FaChevronUp size={12} className="flex-shrink-0" /> : <FaChevronDown size={12} className="flex-shrink-0" />}
                              {expandedOrders.has(order.id) ? t('common.close') : t('common.view')}
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {(expandedOrders.has(order.id) ? order.items : order.items.slice(0, 2)).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm py-1">
                                <span className="text-gray-700">{item.quantity}x {item.name}</span>
                                <span className="font-medium text-gray-900">{formatCurrency(item.total || (item.price * item.quantity))}</span>
                              </div>
                            ))}
                            {!expandedOrders.has(order.id) && itemCount > 2 && (
                              <div className="text-xs text-gray-500 pt-1">+{itemCount - 2} {t('common.more')}...</div>
                            )}
                          </div>
                          {order.specialInstructions && (
                            <div className="mt-3 pt-2 border-t border-gray-200">
                              <div className="flex items-start gap-2 text-sm">
                                <span className="text-amber-600 font-semibold flex-shrink-0">📝 Instructions:</span>
                                <span className="text-gray-700">{order.specialInstructions}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-1 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              onClick={() => copyToClipboard(String(order.dailyOrderId ?? order.orderNumber ?? order.id))}
                              className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                              title="Click to copy Order Number"
                            >
                              <span className="text-[11px] text-gray-400">Order Number</span>
                              <span className="text-xs font-mono font-semibold text-gray-600">#{order.dailyOrderId ?? order.orderNumber ?? order.id?.slice(-4)?.toUpperCase() ?? '—'}</span>
                              <FaCopy className="text-gray-300 text-[10px]" />
                            </div>
                            <div
                              onClick={() => copyToClipboard(order.id)}
                              className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors min-w-0"
                              title="Click to copy Order ID"
                            >
                              <span className="text-[11px] text-gray-400">Order ID</span>
                              <span className="text-xs font-mono font-semibold text-gray-600 truncate max-w-[140px]" title={order.id}>{order.id}</span>
                              <FaCopy className="text-gray-300 text-[10px] flex-shrink-0" />
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'deleted' && (
                              <button
                                onClick={() => handleMarkCompleted(order.id)}
                                className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-all flex items-center gap-1.5"
                              >
                                <FaCheckCircle /> Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-all flex items-center gap-1.5"
                            >
                              <FaEye /> {t('orderHistory.view')}
                            </button>
                            <button
                              onClick={() => handleSmartPrint(order)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${printingOrderId === order.id ? 'bg-orange-200 border border-orange-300 cursor-wait' : 'text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100'}`}
                              title={order.status === 'completed' ? 'Print Bill' : 'Print KOT'}
                              disabled={printingOrderId === order.id}
                            >
                              {printingOrderId === order.id ? <FaSpinner className="animate-spin" /> : <FaPrint />}
                              {printingOrderId === order.id ? 'Sending...' : (order.status === 'completed' ? 'Print Bill' : 'Print KOT')}
                            </button>
                            {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'deleted' && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-all flex items-center gap-1.5"
                              >
                                <FaTimesCircle /> {t('orderHistory.cancel')}
                              </button>
                            )}
                            {order.status !== 'deleted' && (
                              <button
                                onClick={() => handleEditOrder(order.id)}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-all flex items-center gap-1.5"
                              >
                                <FaEdit /> {t('orderHistory.edit')}
                              </button>
                            )}
                            {order.status !== 'deleted' && (
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-all flex items-center gap-1.5"
                                title={t('common.delete') || 'Delete order'}
                              >
                                <FaTrash /> {t('common.delete') || 'Delete'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}

        </div>

        {/* Pagination — page-wise: click any page number or Prev/Next */}
        {totalPages > 1 && (
          <div className="w-full px-4 sm:px-6 lg:px-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{t('orderHistory.showing')}</span>{' '}
              {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalOrders)} {t('orderHistory.of')} {totalOrders} {t('orderHistory.orders')}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="p-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                aria-label="Previous page"
              >
                <FaChevronLeft />
              </button>
              {/* Page numbers: click any page to go there; show up to 7 numbers or 1 … window … last */}
              {(() => {
                const maxVisible = 7;
                let pages = [];
                if (totalPages <= maxVisible) {
                  pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                } else {
                  const w = 1;
                  const from = Math.max(2, currentPage - w);
                  const to = Math.min(totalPages - 1, currentPage + w);
                  pages.push(1);
                  if (from > 2) pages.push('…');
                  for (let p = from; p <= to; p++) pages.push(p);
                  if (to < totalPages - 1) pages.push('…');
                  if (totalPages > 1) pages.push(totalPages);
                }
                return pages.map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={`min-w-[2.25rem] sm:min-w-[2.5rem] h-9 sm:h-10 px-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                        p === currentPage
                          ? 'bg-red-600 border-red-600 text-white shadow-sm'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                      aria-label={t('orderHistory.page') + ` ${p}`}
                      aria-current={p === currentPage ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  )
                );
              })()}
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="p-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                aria-label="Next page"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrderForModal && (
        <OrderDetailsModal 
          order={selectedOrderForModal} 
          onClose={() => setSelectedOrderForModal(null)} 
        />
      )}

      {selectedOrderForInvoice && (
        <InvoiceModal
          order={selectedOrderForInvoice}
          restaurant={restaurant}
          onClose={() => setSelectedOrderForInvoice(null)}
          onDownloadPDF={handleDownloadPDF}
          calculateOrderTotal={calculateOrderTotal}
          formatDate={formatDate}
        />
      )}

      {/* Mark Bill Complete confirmation modal */}
      {markCompleteOrderId && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes markCompleteBackdropIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes markCompleteDialogIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          ` }} />
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
            style={{ animation: 'markCompleteBackdropIn 0.2s ease-out' }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="mark-complete-title"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !markCompleteSubmitting && setMarkCompleteOrderId(null)}
            />
            <div
              className="relative w-full max-w-[min(90vw,400px)] rounded-2xl shadow-2xl border-2 border-gray-200 bg-white overflow-hidden"
              style={{ animation: 'markCompleteDialogIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6 text-center">
                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <FaCheckCircle className="text-green-600 text-2xl sm:text-3xl" />
                </div>
                <h2 id="mark-complete-title" className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  Mark bill complete?
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  This will mark the order as completed. You can’t undo this.
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => !markCompleteSubmitting && setMarkCompleteOrderId(null)}
                    disabled={markCompleteSubmitting}
                    className="min-h-[48px] sm:min-h-[44px] w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-60 transition-all touch-manipulation"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => executeMarkComplete(markCompleteOrderId)}
                    disabled={markCompleteSubmitting}
                    className="min-h-[48px] sm:min-h-[44px] w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-green-700 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-60 transition-all touch-manipulation"
                  >
                    {markCompleteSubmitting ? (
                      <>
                        <FaSpinner className="text-lg" style={{ animation: 'spin 1s linear infinite' }} />
                        Completing…
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                        Mark Bill Complete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete order confirmation modal */}
      {deleteConfirmOrderId && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes deleteBackdropIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes deleteDialogIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          ` }} />
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
            style={{ animation: 'deleteBackdropIn 0.2s ease-out' }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="delete-order-title"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !deleteSubmitting && (setDeleteConfirmOrderId(null), setDeleteError(null))}
            />
            <div
              className="relative w-full max-w-[min(90vw,400px)] rounded-2xl shadow-2xl border-2 border-gray-200 bg-white overflow-hidden"
              style={{ animation: 'deleteDialogIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6 text-center">
                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FaTrash className="text-gray-600 text-2xl sm:text-3xl" />
                </div>
                <h2 id="delete-order-title" className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                  {t('orderHistory.deleteModalTitle') || 'Delete this order?'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {t('orderHistory.deleteConfirm') || 'Are you sure you want to delete this order? It will move to Deleted and you can view it under status "Deleted".'}
                </p>
                {deleteError && (
                  <p className="text-sm text-red-600 mb-4 px-2">{deleteError}</p>
                )}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => !deleteSubmitting && (setDeleteConfirmOrderId(null), setDeleteError(null))}
                    disabled={deleteSubmitting}
                    className="min-h-[48px] sm:min-h-[44px] w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-60 transition-all touch-manipulation"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={executeDeleteOrder}
                    disabled={deleteSubmitting}
                    className="min-h-[48px] sm:min-h-[44px] w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-white bg-red-600 border-2 border-red-600 rounded-xl hover:bg-red-700 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-60 transition-all touch-manipulation"
                  >
                    {deleteSubmitting ? (
                      <>
                        <FaSpinner className="text-lg" style={{ animation: 'spin 1s linear infinite' }} />
                        {t('common.deleting') || 'Deleting…'}
                      </>
                    ) : (
                      <>
                        <FaTrash />
                        {t('common.delete') || 'Delete'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* KOT Printer Setup Note */}
      {restaurantId && <KOTPrinterNote restaurantId={restaurantId} />}

      {/* Date Filter Modal — rendered via portal to appear above sidebar */}
      {filterModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFilterModalOpen(false)} />
          {/* Modal */}
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mx-4" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-white/90 text-sm" />
                <h3 className="text-base font-bold text-white">Select Date Range</h3>
              </div>
              <button onClick={() => setFilterModalOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"><FaTimes className="text-sm" /></button>
            </div>
            {/* Body */}
            <div className="p-5">
              {/* Quick Presets */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { value: 'today', label: 'Today', icon: '📅' },
                  { value: 'yesterday', label: 'Yesterday', icon: '⏪' },
                  { value: 'last7days', label: 'Last 7 Days', icon: '📆' },
                  { value: 'last30days', label: 'Last 30 Days', icon: '🗓' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => { setDateFilterMode(option.value); setFilterModalOpen(false); }}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                      dateFilterMode === option.value
                        ? 'bg-red-50 text-red-700 border-red-300 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-transparent hover:border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-base">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Range */}
              <div className={`rounded-xl border-2 p-4 transition-all ${dateFilterMode === 'custom' ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-gray-50'}`}>
                <button
                  onClick={() => setDateFilterMode('custom')}
                  className={`flex items-center gap-2 text-sm font-semibold mb-3 ${dateFilterMode === 'custom' ? 'text-red-700' : 'text-gray-600'}`}
                >
                  <FaCalendarAlt className="text-xs" />
                  Custom Range
                </button>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 block">From</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => { setCustomStartDate(e.target.value); setDateFilterMode('custom'); }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 block">To</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => { setCustomEndDate(e.target.value); setDateFilterMode('custom'); }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <button
                onClick={() => { setDateFilterMode('today'); setCustomStartDate(''); setCustomEndDate(''); setFilterModalOpen(false); }}
                className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
              >
                Reset to Today
              </button>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="px-5 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
          <style>{`@keyframes modalSlideIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
        </div>,
        document.body
      )}
    </div>
  );
};

// KOT Printer Setup Note Component
const KOTPrinterNote = ({ restaurantId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const printKotUrl = `https://dineopen.com/print-kot?restaurant=${restaurantId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(printKotUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-4xl mx-auto">
        {/* Collapsed View - Always Visible */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <FaPrint className="text-blue-600 text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-700">
              <span className="font-semibold text-blue-800">KOT Auto-Print Setup:</span> Open the URL below in Chrome kiosk mode on your kitchen PC to auto-print orders to thermal printer.
            </p>

            {/* URL Copy Section */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 text-blue-900 font-mono break-all">
                {printKotUrl}
              </code>
              <button
                onClick={copyToClipboard}
                className="flex-shrink-0 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <FaCopy className="text-xs" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Expand/Collapse Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <FaChevronUp className="text-xs" /> Hide setup instructions
                </>
              ) : (
                <>
                  <FaChevronDown className="text-xs" /> Show detailed setup instructions (Windows & Mac)
                </>
              )}
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="mt-4 space-y-4 text-xs text-gray-700 bg-white rounded-lg border border-blue-200 p-4">
                {/* Windows Instructions */}
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Windows</span>
                    Chrome Kiosk Setup
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-600 ml-2">
                    <li><strong>Set thermal printer as default:</strong> Settings → Printers & Scanners → Select your printer → Set as default</li>
                    <li><strong>Create Chrome shortcut:</strong> Right-click Desktop → New → Shortcut</li>
                    <li><strong>Enter this target:</strong>
                      <code className="block mt-1 bg-gray-100 p-2 rounded text-xs font-mono break-all">
                        &quot;C:\Program Files\Google\Chrome\Application\chrome.exe&quot; --kiosk --kiosk-printing &quot;{printKotUrl}&quot;
                      </code>
                    </li>
                    <li><strong>Name it:</strong> &quot;KOT Printer&quot; and click Finish</li>
                    <li><strong>Auto-start (optional):</strong> Press <kbd className="bg-gray-200 px-1 rounded">Win+R</kbd> → type <code className="bg-gray-100 px-1 rounded">shell:startup</code> → copy shortcut there</li>
                    <li><strong>To exit kiosk:</strong> Press <kbd className="bg-gray-200 px-1 rounded">Alt+F4</kbd> or <kbd className="bg-gray-200 px-1 rounded">Ctrl+W</kbd></li>
                  </ol>
                </div>

                {/* Mac Instructions */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                    <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">macOS</span>
                    Chrome Kiosk Setup
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-600 ml-2">
                    <li><strong>Set thermal printer as default:</strong> System Settings → Printers & Scanners → Right-click printer → Set as default</li>
                    <li><strong>Open Terminal</strong> (Applications → Utilities → Terminal)</li>
                    <li><strong>Run this command:</strong>
                      <code className="block mt-1 bg-gray-100 p-2 rounded text-xs font-mono break-all">
                        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk --kiosk-printing &quot;{printKotUrl}&quot;
                      </code>
                    </li>
                    <li><strong>Create Automator app (optional):</strong> Open Automator → New Application → Add &quot;Run Shell Script&quot; → Paste command above → Save as &quot;KOT Printer.app&quot;</li>
                    <li><strong>Auto-start (optional):</strong> System Settings → General → Login Items → Add &quot;KOT Printer.app&quot;</li>
                    <li><strong>To exit kiosk:</strong> Press <kbd className="bg-gray-200 px-1 rounded">Cmd+Q</kbd> or <kbd className="bg-gray-200 px-1 rounded">Cmd+W</kbd></li>
                  </ol>
                </div>

                {/* Important Notes */}
                <div className="pt-3 border-t border-gray-200 bg-amber-50 -mx-4 -mb-4 p-4 rounded-b-lg">
                  <h4 className="font-bold text-amber-800 mb-2">Important Notes:</h4>
                  <ul className="list-disc list-inside space-y-1 text-amber-700 ml-2">
                    <li>The <code className="bg-amber-100 px-1 rounded">--kiosk-printing</code> flag enables <strong>silent printing</strong> (no print dialog)</li>
                    <li>Thermal printer must be set as the <strong>default system printer</strong></li>
                    <li>Page polls for new orders every <strong>5 seconds</strong> and auto-prints</li>
                    <li>Each order prints <strong>only once</strong> (tracked via database)</li>
                    <li>Use the <strong>Reprint</strong> button on the page if you need to print again</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Invoice Modal Component
const InvoiceModal = ({ order, restaurant, onClose, onDownloadPDF, calculateOrderTotal, formatDate }) => {
  if (!order) return null;

  const btype = restaurant?.businessType || 'restaurant';
  const invoiceLabels = {
    restaurant: { title: 'INVOICE', billTo: 'Bill To', itemCol: 'Item', footer: 'Thank you for your business!' },
    bar: { title: 'BAR TAB', billTo: 'Guest', itemCol: 'Drink / Item', footer: 'Thank you for visiting! Cheers!' },
    bakery: { title: 'RECEIPT', billTo: 'Customer', itemCol: 'Item', footer: 'Thank you! Enjoy your fresh bakes!' },
    ice_cream: { title: 'RECEIPT', billTo: 'Customer', itemCol: 'Item / Flavor', footer: 'Thank you! Stay cool, visit again!' },
    cafe: { title: 'RECEIPT', billTo: 'Customer', itemCol: 'Item', footer: 'Thanks for stopping by! See you soon.' },
    qsr: { title: 'ORDER RECEIPT', billTo: 'Customer', itemCol: 'Item', footer: 'Thank you! Visit again.' }
  };
  const iLabels = invoiceLabels[btype] || invoiceLabels.restaurant;
  const orderTotal = calculateOrderTotal(order);
  const subtotal = order.items?.reduce((sum, item) => sum + (item.total || (item.price * item.quantity) || 0), 0) || 0;
  const taxAmount = order.taxAmount || Math.max(0, orderTotal - subtotal);
  const offerDiscount = order.discountAmount || 0;
  const manualDiscountAmt = order.manualDiscount || 0;
  const loyaltyDiscountAmt = order.loyaltyDiscount || 0;
  const totalDiscount = offerDiscount + manualDiscountAmt + loyaltyDiscountAmt;
  const invoiceNumber = order.dailyOrderId || order.orderNumber || (order.id ? order.id.slice(-4).toUpperCase() : 'N/A');
  
  return (
    <>
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            margin: 1.5cm;
            size: A4;
          }
          body * {
            visibility: hidden;
          }
          .invoice-print-wrapper,
          .invoice-print-wrapper * {
            visibility: visible;
          }
          .invoice-print-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            z-index: 99999;
          }
          .invoice-print {
            position: relative;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      {/* Modal Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border-2 border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white no-print">
            <h2 className="text-2xl font-bold text-gray-900">Invoice #{invoiceNumber}</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={onDownloadPDF}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2"
              >
                <FaDownload /> Download PDF
              </button>
              <button 
                onClick={onClose} 
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <FaTimes className="text-gray-500 text-lg" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Invoice Content - Printable */}
            <div className="invoice-print-wrapper">
              <div className="invoice-print bg-white p-8 max-w-4xl mx-auto">
              {/* Header */}
              <div className="border-b-2 border-gray-300 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant?.name || 'Restaurant'}</h1>
                    {restaurant?.address && <p className="text-gray-600 text-sm">{restaurant.address}</p>}
                    {restaurant?.phone && <p className="text-gray-600 text-sm">Phone: {restaurant.phone}</p>}
                    {restaurant?.email && <p className="text-gray-600 text-sm">Email: {restaurant.email}</p>}
                    {restaurant?.gstin && <p className="text-gray-600 text-sm">GSTIN: {restaurant.gstin}</p>}
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{iLabels.title}</h2>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Invoice #:</strong> {invoiceNumber}</p>
                      <p><strong>Date:</strong> {formatDate(order.createdAt)}</p>
                      {order.status && <p><strong>Status:</strong> <span className="uppercase">{order.status}</span></p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">{iLabels.billTo}:</h3>
                  <div className="text-gray-900">
                    <p className="font-semibold">{order.customerDisplay?.name || 'Walk-in Customer'}</p>
                    {order.customerDisplay?.phone && <p className="text-sm">Phone: {order.customerDisplay.phone}</p>}
                    {order.customerDisplay?.email && <p className="text-sm">Email: {order.customerDisplay.email}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Order Details:</h3>
                  <div className="text-gray-900 text-sm">
                    {(order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber) ? (
                      <p>Room: {order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber}</p>
                    ) : (
                      order.customerDisplay?.tableNumber && <p>Table: {order.customerDisplay.tableNumber}</p>
                    )}
                    {order.customerDisplay?.floorName && !order.roomNumber && !order.customerDisplay?.roomNumber && !order.customerInfo?.roomNumber && <p>Floor: {order.customerDisplay.floorName}</p>}
                    {order.orderType && <p>Type: <span className="capitalize">{order.orderType.replace('-', ' ')}</span></p>}
                    {order.paymentMethod && <p>Payment: <span className="capitalize">{order.paymentMethod}</span></p>}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">{iLabels.itemCol}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {item.variant && (
                            <div className="text-xs text-gray-500 mt-1">Variant: {item.variant.name}</div>
                          )}
                          {item.addons?.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">Addons: {item.addons.map(a => a.name).join(', ')}</div>
                          )}
                          {item.notes && (
                            <div className="text-xs text-amber-700 mt-1 italic">Note: {item.notes}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(item.price)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(item.total || (item.price * item.quantity))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-sm text-amber-900"><strong>Order Notes:</strong> {order.notes}</p>
                </div>
              )}

              {/* Totals */}
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {offerDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{order.appliedOffer?.name || 'Offer Discount'}:</span>
                        <span>-{formatCurrency(offerDiscount)}</span>
                      </div>
                    )}
                    {manualDiscountAmt > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Manual Discount:</span>
                        <span>-{formatCurrency(manualDiscountAmt)}</span>
                      </div>
                    )}
                    {loyaltyDiscountAmt > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Loyalty Points:</span>
                        <span>-{formatCurrency(loyaltyDiscountAmt)}</span>
                      </div>
                    )}
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Tax:</span>
                        <span>{formatCurrency(taxAmount)}</span>
                      </div>
                    )}
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>You saved:</span>
                        <span>{formatCurrency(totalDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                      <span>Total:</span>
                      <span className="text-red-600">{formatCurrency(orderTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                <p className="font-medium">{iLabels.footer}</p>
                <p className="mt-2">For any queries, please contact us.</p>
              </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Non-printable */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-t-2 border-gray-200 p-6 no-print">
            <div className="flex gap-3 justify-end">
              <button 
                onClick={onDownloadPDF}
                className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
              >
                <FaPrint /> Print / Download PDF
              </button>
              <button 
                onClick={onClose}
                className="px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderHistory;