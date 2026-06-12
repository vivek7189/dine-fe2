'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
// import Pusher from 'pusher-js'; // COMMENTED OUT — replaced by Firebase RTDB
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../../../firebase';
import apiClient from '../../../lib/api';
import { t, getCurrentLanguage } from '../../../lib/i18n';
import { getCachedOrderHistoryData, setCachedOrderHistoryData } from '../../../utils/dashboardCache';
import { setCachedData, getCachedData } from '../../../lib/offlineDb';
import { getAllOfflineOrders, updateOrderSyncStatus } from '../../../lib/offlineDb';
import { syncPendingOrders, queueOfflineOrder, generateIdempotencyKey } from '../../../lib/syncEngine';
import { getOfflineEngineEnabled } from '../../../hooks/useSyncEngine';
import OfflineBanner from '../../../components/OfflineBanner';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { useCurrency } from '../../../contexts/CurrencyContext';
import { getBillPrintCSS, getKOTPrintCSS, getBillHeaderHTML, buildTokenSlipsDocumentHTML } from '../../../utils/printFontSizes';
import { printDocument, printHtmlInHiddenFrame, supportsNativeAutoPrint } from '../../../utils/printBridge';
import dynamic from 'next/dynamic';
const OrderSummary = dynamic(() => import('../../../components/OrderSummary'), { ssr: false });
const OrderEditModal = dynamic(() => import('../../../components/OrderEditModal'), { ssr: false });
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
  FaWallet,
  FaCreditCard,
  FaMobileAlt,
  FaGlobe,
  FaCalendarAlt,
  FaRedo,
  FaSync,
  FaChartPie,
  FaClipboardList,
  FaSortAmountDown,
  FaSortAmountUp,
  FaUsers,
  FaCalendarCheck,
  FaConciergeBell,
  FaUndoAlt,
  FaStore,
  FaTruck,
  FaFileCsv,
  FaFileExcel,
} from 'react-icons/fa';
const BookingList = dynamic(() => import('../../../components/bookings/BookingList'), { ssr: false });
const BookingDetail = dynamic(() => import('../../../components/bookings/BookingDetail'), { ssr: false });
const BookingForm = dynamic(() => import('../../../components/bookings/BookingForm'), { ssr: false });

// Merge pending offline orders into the order list so they show immediately
async function mergeOfflineOrderHistory(existingOrders, restaurantId) {
  try {
    // Timeout after 3s so a blocked IndexedDB can't hang the page forever
    const offlineOrders = await Promise.race([
      getAllOfflineOrders(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('IndexedDB timeout')), 3000))
    ]);
    if (offlineOrders.length === 0) return existingOrders;

    const existingIds = new Set(existingOrders.map(o => o.id));
    const offlineDisplay = offlineOrders
      .filter(o => {
        const rid = o.orderData?.restaurantId;
        return rid === restaurantId && !existingIds.has(o.idempotencyKey);
      })
      .map(o => ({
        id: o.idempotencyKey,
        idempotencyKey: o.idempotencyKey,
        ...o.orderData,
        createdAt: new Date(o.createdAt).toISOString(),
        syncStatus: o.syncStatus,
        _isOffline: true,
      }));

    if (offlineDisplay.length === 0) return existingOrders;
    // Put offline orders first (most recent)
    return [...offlineDisplay, ...existingOrders];
  } catch (e) {
    return existingOrders;
  }
}

const OrderHistory = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatCurrency, getCurrencySymbol, currencySettings } = useCurrency();
  const { isOnline } = useNetworkStatus();

  // View mode: 'orders' or 'summary' — persisted in URL
  const urlView = searchParams.get('view');
  const [activeView, setActiveView] = useState(urlView === 'summary' ? 'summary' : urlView === 'scheduled' ? 'scheduled' : urlView === 'bookings' ? 'bookings' : 'orders');

  // Sales Summary state
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryPeriod, setSummaryPeriod] = useState('today');
  const [summaryCustomStart, setSummaryCustomStart] = useState('');
  const [summaryCustomEnd, setSummaryCustomEnd] = useState('');
  const [summarySortBy, setSummarySortBy] = useState('quantity');
  const [summarySortDir, setSummarySortDir] = useState('desc');
  const [summarySearch, setSummarySearch] = useState('');
  const [displaySummarySearch, setDisplaySummarySearch] = useState('');
  const summarySearchDebounceRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [displaySearchTerm, setDisplaySearchTerm] = useState('');
  const searchDebounceRef = useRef(null);
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
  const [allowOrderDelete, setAllowOrderDelete] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileEmbed] = useState(() => typeof window !== 'undefined' && !!window.__DINEOPEN_MOBILE_EMBED__);
  const [isCompactView, setIsCompactView] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [paymentStatusDropdownOpen, setPaymentStatusDropdownOpen] = useState(false);
  const [subRestaurants, setSubRestaurants] = useState([]);
  const [filterSubRestaurant, setFilterSubRestaurant] = useState('all');
  const [subRestaurantDropdownOpen, setSubRestaurantDropdownOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [billingModalOrder, setBillingModalOrder] = useState(null);
  const [billingModalCart, setBillingModalCart] = useState([]);
  const [billingModalPaymentMethod, setBillingModalPaymentMethod] = useState('cash');
  const [billingModalProcessing, setBillingModalProcessing] = useState(false);
  const [billingOrderSuccess, setBillingOrderSuccess] = useState(null);
  const [billingCustomerName, setBillingCustomerName] = useState('');
  const [billingCustomerMobile, setBillingCustomerMobile] = useState('');
  const [billingTableNumber, setBillingTableNumber] = useState('');
  const [markPaidOrderId, setMarkPaidOrderId] = useState(null);
  const [markPaidSubmitting, setMarkPaidSubmitting] = useState(false);

  // Bookings tab state
  const [bookingsData, setBookingsData] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsFilters, setBookingsFilters] = useState({ type: '', status: '', startDate: '', endDate: '', search: '' });
  const [bookingsDetailOpen, setBookingsDetailOpen] = useState(false);
  const [bookingsSelectedBooking, setBookingsSelectedBooking] = useState(null);
  const [bookingsFormOpen, setBookingsFormOpen] = useState(false);
  const [bookingsEditingBooking, setBookingsEditingBooking] = useState(null);
  const [bookingSettings, setBookingSettings] = useState({ enableCatering: true, enableAdvanceOrder: true, enableVenueBooking: true });
  const [bookingVenues, setBookingVenues] = useState([]);
  const [deleteConfirmOrderId, setDeleteConfirmOrderId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  // Cancel order modal state
  const [cancelModalOrderId, setCancelModalOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  // Refund modal state
  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundType, setRefundType] = useState('full'); // 'full' or 'partial'
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState(null);
  // Scroll-aware collapsing header
  const [isScrolled, setIsScrolled] = useState(false);
  // Edit Completed Order state
  const [editCompletedOrder, setEditCompletedOrder] = useState(null);
  const [editCompletedForm, setEditCompletedForm] = useState({});
  const [editCompletedSaving, setEditCompletedSaving] = useState(false);
  const [editCompletedHistory, setEditCompletedHistory] = useState([]);
  const [canEditCompletedOrders, setCanEditCompletedOrders] = useState(false);
  // Edit Completed Order Items state (full item editing)
  const [editItemsOrder, setEditItemsOrder] = useState(null);
  const [editReasonModal, setEditReasonModal] = useState(null); // order object when showing reason prompt
  const [editReason, setEditReason] = useState('');
  const [pinModal, setPinModal] = useState(null); // order object when showing PIN prompt
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');
  const [requirePin, setRequirePin] = useState(false);
  const [printSettings, setPrintSettings] = useState(null);
  const [upiSettings, setUpiSettings] = useState({});
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [printingOrderId, setPrintingOrderId] = useState(null);
  const [printDropdownOrderId, setPrintDropdownOrderId] = useState(null);
  const [printSuccess, setPrintSuccess] = useState(null);
  const [analyticsStats, setAnalyticsStats] = useState(null);
  const [taxSettings, setTaxSettings] = useState(null);
  // Menu items & multi-tier pricing for billing modal
  const [menuItems, setMenuItems] = useState([]);
  const [multiPricingEnabled, setMultiPricingEnabled] = useState(false);
  const [pricingRules, setPricingRules] = useState([]);
  const [activePricingRuleId, setActivePricingRuleId] = useState(null);

  // Scheduled orders state
  const [scheduledOrders, setScheduledOrders] = useState([]);
  const [scheduledLoading, setScheduledLoading] = useState(false);
  const [scheduledViewMode, setScheduledViewMode] = useState('list'); // 'list' or 'calendar'
  const [scheduledDateFilter, setScheduledDateFilter] = useState('upcoming'); // 'upcoming', 'today', 'thisWeek', 'thisMonth', 'all', 'past'

  // Staff reassignment state
  const [historyStaffList, setHistoryStaffList] = useState([]);
  const [historyStaffQuery, setHistoryStaffQuery] = useState('');
  const [displayStaffQuery, setDisplayStaffQuery] = useState('');
  const staffQueryDebounceRef = useRef(null);
  const [historyStaffDropdownOpen, setHistoryStaffDropdownOpen] = useState(false);
  const [historyStaffFetched, setHistoryStaffFetched] = useState(false);
  const [editingStaffOrderId, setEditingStaffOrderId] = useState(null);
  const [reassigningStaff, setReassigningStaff] = useState(false);

  const fetchHistoryStaffList = async () => {
    if (historyStaffFetched || !restaurantId) return;
    setHistoryStaffFetched(true);
    try {
      const res = await apiClient.getWaiters(restaurantId);
      setHistoryStaffList(res.waiters || []);
    } catch { setHistoryStaffFetched(false); }
  };

  const filteredHistoryStaff = useMemo(() => historyStaffList.filter(s =>
    !historyStaffQuery || s.name?.toLowerCase().includes(historyStaffQuery.toLowerCase())
  ), [historyStaffList, historyStaffQuery]);

  const handleReassignStaff = async (order, staffData) => {
    setReassigningStaff(true);
    try {
      await apiClient.updateOrder(order.id, { assignedStaff: staffData, restaurantId });
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, assignedStaff: staffData } : o));
      if (selectedOrderForModal?.id === order.id) {
        setSelectedOrderForModal(prev => ({ ...prev, assignedStaff: staffData }));
      }
    } catch (e) {
      console.error('Failed to reassign staff:', e);
    } finally {
      setReassigningStaff(false);
      setEditingStaffOrderId(null);
      setHistoryStaffQuery('');
      setDisplayStaffQuery('');
      setHistoryStaffDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (!printDropdownOrderId) return;
    const handler = () => setPrintDropdownOrderId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [printDropdownOrderId]);

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
    const handleClickOutside = (event) => {
      if (!event.target.closest('.custom-dropdown')) {
        setStatusDropdownOpen(false);
        setTypeDropdownOpen(false);
        setSubRestaurantDropdownOpen(false);
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
    if (!s) return t('orderHistory.unknown') || 'Unknown';
    const map = { completed: t('orderHistory.status.completed'), confirmed: t('orderHistory.status.confirmed'), pending: t('orderHistory.status.pending'), cancelled: t('orderHistory.status.cancelled'), deleted: t('orderHistory.status.deleted'), refunded: 'Refunded' };
    return map[s] || (s.charAt(0).toUpperCase() + s.slice(1));
  };

  const getStatusStyle = (status, orderFlow, lastStatus, order) => {
    if (order?._isOffline) return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: `${t('orderHistory.pendingSync')} (${order.syncStatus || 'queued'})` };
    // syncSource === 'offline' orders now show their real status — separate "Offline" chip is added in the UI
    if (orderFlow?.isDirectBilling && order?.paymentStatus === 'due') {
      return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5', label: 'Due (Udhar)' };
    }
    if (orderFlow?.isDirectBilling && (order?.paymentStatus === 'partial' || order?.outstandingAmount > 0)) {
      return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: t('orderHistory.partialPayment') };
    }
    if (orderFlow?.isDirectBilling) return { bg: '#dcfce7', text: '#166534', border: '#86efac', label: t('orderHistory.billingCompleted') };
    if (orderFlow?.isKitchenOrder) return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', label: t('orderHistory.kitchen') };
    if (status === 'completed') {
      const label = order?.editCount > 0 ? `${t('orderHistory.status.completed')} (Revised #${order.editCount})` : t('orderHistory.status.completed');
      return { bg: '#dcfce7', text: '#166534', border: '#86efac', label };
    }
    if (status === 'confirmed') return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', label: t('orderHistory.status.confirmed') };
    if (status === 'pending') return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: t('orderHistory.status.pending') };
    if (status === 'cancelled') return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', label: t('orderHistory.status.cancelled') };
    if (status === 'refunded') return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: 'Refunded' };
    if (status === 'deleted') {
      const wasLabel = lastStatus ? getStatusDisplayLabel(lastStatus) : null;
      const label = wasLabel ? `${t('orderHistory.status.deleted')} (was: ${wasLabel})` : t('orderHistory.status.deleted');
      return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db', label };
    }
    const capitalizeStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : (t('orderHistory.unknown') || 'Unknown');
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
      return { label: display, className: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
    // Explicit source or inferred from notes (legacy orders from public online page)
    if (src === 'online_order' || looksLikePublicOnline) return { label: 'Online order', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (src === 'crave_app' || src === 'customer_app') return { label: 'Dine App', className: 'bg-pink-50 text-pink-700 border-pink-200' };
    if (src === 'talabat') return { label: 'Talabat', className: 'bg-orange-50 text-orange-700 border-orange-200' };
    if (src === 'deliveroo') return { label: 'Deliveroo', className: 'bg-teal-50 text-teal-700 border-teal-200' };
    if (src === 'noon_food') return { label: 'Noon Food', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
    if (src === 'careem') return { label: 'Careem', className: 'bg-green-50 text-green-700 border-green-200' };
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
  const hasActiveFilters = selectedStatus !== 'all' || selectedOrderType !== 'all' || selectedPaymentMethod !== 'all' || selectedPaymentStatus !== 'all' || filterSubRestaurant !== 'all' || dateFilterMode !== 'today' || myOrdersOnly || searchTerm.trim();

  const activeFilterCount = [
    selectedStatus !== 'all',
    selectedOrderType !== 'all',
    selectedPaymentMethod !== 'all',
    selectedPaymentStatus !== 'all',
    filterSubRestaurant !== 'all',
    dateFilterMode !== 'today',
    myOrdersOnly,
  ].filter(Boolean).length;

  // Reset all filters to defaults
  const resetAllFilters = useCallback(() => {
    setSelectedStatus('all');
    setSelectedOrderType('all');
    setSelectedPaymentMethod('all');
    setSelectedPaymentStatus('all');
    setFilterSubRestaurant('all');
    setDateFilterMode('today');
    setMyOrdersOnly(false);
    setSearchTerm('');
    setDisplaySearchTerm('');
    setCustomStartDate('');
    setCustomEndDate('');
  }, []);

  const fetchOrders = useCallback(async (useCache = true) => {
    if (!restaurantId) return;

    // Create cache key based on filters
    const cacheKey = `${currentPage}_${selectedStatus}_${selectedOrderType}_${myOrdersOnly}_${dateFilterMode}_${selectedPaymentMethod}_${selectedPaymentStatus}_${searchTerm.trim()}_${customStartDate}_${customEndDate}`;
    
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
        orderType: selectedOrderType !== 'all' && selectedOrderType !== 'scheduled' ? selectedOrderType : undefined,
        ...(selectedOrderType === 'scheduled' ? { isScheduled: 'true' } : {}),
        paymentMethod: selectedPaymentMethod !== 'all' ? selectedPaymentMethod : undefined,
        paymentStatus: selectedPaymentStatus !== 'all' ? selectedPaymentStatus : undefined,
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

      // Merge any pending offline orders from IndexedDB so they show immediately
      const mergedOrders = await mergeOfflineOrderHistory(filteredOrders, restaurantId);
      setOrders(mergedOrders);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalOrders((response.pagination?.totalOrders || filteredOrders.length) + (mergedOrders.length - filteredOrders.length));

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
      // Try IndexedDB fallback when offline, always merge offline orders
      try {
        const idbCached = await Promise.race([
          getCachedData(`orders_${restaurantId}_${cacheKey}`),
          new Promise((_, reject) => setTimeout(() => reject(new Error('IDB timeout')), 3000))
        ]);
        const cachedOrders = idbCached?.orders || [];
        const mergedOrders = await mergeOfflineOrderHistory(cachedOrders, restaurantId);
        if (mergedOrders.length > 0) {
          setOrders(mergedOrders);
          setTotalPages(idbCached?.totalPages || 1);
          setTotalOrders(mergedOrders.length);
          console.log('📦 Loaded order history from cache + offline orders');
        } else {
          setError(t('common.error'));
          setOrders([]);
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
  }, [restaurantId, currentPage, limit, selectedStatus, selectedOrderType, myOrdersOnly, searchTerm, dateFilterMode, selectedPaymentMethod, selectedPaymentStatus, customStartDate, customEndDate, user?.id, getDateRange]);

  useEffect(() => {
    const loadUserAndRestaurant = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token || !userData.id) {
          // Skip login redirect in mobile embed — auth is injected via WebView
          if (window.__DINEOPEN_MOBILE_EMBED__) return;
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
          setAllowOrderDelete(finalRestaurant?.orderSettings?.allowOrderDelete === true);
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

  // Check if user has edit-completed-orders permission + PIN requirement
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const role = (user.role || '').toLowerCase();
      if (role === 'owner' || role === 'admin') {
        setCanEditCompletedOrders(true);
      } else if (user.allowEditCompletedOrders) {
        setCanEditCompletedOrders(true);
      } else {
        // Fetch fresh user data to check permission
        apiClient.getUserProfile?.().then(res => {
          if (res?.user?.allowEditCompletedOrders) {
            setCanEditCompletedOrders(true);
          }
        }).catch(() => {});
      }
    } catch {}
    // Check PIN requirement from restaurant posSettings
    try {
      const savedRestaurant = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}');
      if (savedRestaurant?.posSettings?.requirePinForCompletedOrderEdit) {
        setRequirePin(true);
      }
    } catch {}
  }, []);

  // Fetch tax settings for billing modal
  useEffect(() => {
    if (!restaurantId) return;
    const loadTaxSettings = async () => {
      try {
        const response = await apiClient.getTaxSettings(restaurantId);
        if (response?.success) {
          setTaxSettings(response.taxSettings);
        }
      } catch (e) {
        console.log('Tax settings load error:', e.message);
      }
    };
    loadTaxSettings();
  }, [restaurantId]);

  // Fetch UPI settings from customer app settings
  useEffect(() => {
    if (!restaurantId) return;
    const loadUpiSettings = async () => {
      try {
        const csRes = await apiClient.getCustomerAppSettings(restaurantId);
        if (csRes?.paymentSettings) setUpiSettings(csRes.paymentSettings);
        else setUpiSettings({});
      } catch (e) {
        console.log('Customer app settings fetch error:', e);
        setUpiSettings({});
      }
    };
    loadUpiSettings();
  }, [restaurantId]);

  // Load menu items & pricing rules for billing modal (multi-tier pricing support)
  useEffect(() => {
    if (!restaurantId) return;
    const loadMenuAndPricing = async () => {
      try {
        const [menuRes, pricingRes] = await Promise.all([
          apiClient.getMenu(restaurantId),
          apiClient.getPricingSettings(restaurantId).catch(() => null),
        ]);
        setMenuItems(menuRes?.menuItems || []);
        const mp = pricingRes?.settings?.multiPricing;
        if (mp?.enabled) {
          setMultiPricingEnabled(true);
          setPricingRules((mp.rules || []).filter(r => r.isActive));
        } else {
          setMultiPricingEnabled(false);
          setPricingRules([]);
        }
      } catch (e) {
        console.log('Menu/pricing load for billing:', e.message);
      }
    };
    loadMenuAndPricing();
  }, [restaurantId]);

  // Fetch WhatsApp connection status
  useEffect(() => {
    if (!restaurantId) return;
    const loadWa = async () => {
      try {
        const waRes = await apiClient.getWhatsAppSettings(restaurantId);
        setWhatsappConnected(waRes?.connected || false);
      } catch { setWhatsappConnected(false); }
    };
    loadWa();
  }, [restaurantId]);

  // Fetch sub-restaurants when restaurantId changes
  useEffect(() => {
    if (!restaurantId) return;
    const fetchSubRestaurants = async () => {
      try {
        const response = await apiClient.getSubRestaurants(restaurantId);
        setSubRestaurants(response?.subRestaurants || []);
      } catch (err) {
        console.log('Sub-restaurants not available:', err.message);
        setSubRestaurants([]);
      }
    };
    fetchSubRestaurants();
    setFilterSubRestaurant('all');
  }, [restaurantId]);

  // Listen for restaurant changes — update state so Pusher reconnects via dependency
  useEffect(() => {
    const handleRestaurantChange = (event) => {
      const newId = event.detail?.restaurantId || localStorage.getItem('selectedRestaurantId');
      const newRestaurant = event.detail?.restaurant || JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
      if (newId && newId !== restaurantId) {
        console.log('📡 OrderHistory: Restaurant changed, switching to', newId);
        setRestaurantId(newId);
        if (newRestaurant) {
          setRestaurant(newRestaurant);
          setAllowOrderDelete(newRestaurant?.orderSettings?.allowOrderDelete === true);
        }
      }
    };
    window.addEventListener('restaurantChanged', handleRestaurantChange);
    return () => window.removeEventListener('restaurantChanged', handleRestaurantChange);
  }, [restaurantId]);

  // Stable ref for fetchOrders so Firebase handler doesn't re-subscribe on every render
  const fetchOrdersRef = useRef(fetchOrders);
  useEffect(() => { fetchOrdersRef.current = fetchOrders; }, [fetchOrders]);

  // Firebase RTDB subscription for real-time order updates
  useEffect(() => {
    if (!restaurantId || !database) return;

    const now = Date.now();
    const eventsRef = query(
      ref(database, `events/${restaurantId}/orders`),
      orderByChild('ts'),
      startAt(now)
    );

    // Smart incremental sync — batch Firebase events, fetch only changed orders
    // Collects orderIds over 2s window, then fetches them individually and merges
    let pendingIds = new Set();
    let batchTimer = null;

    const flushBatch = async () => {
      const ids = [...pendingIds];
      pendingIds.clear();
      if (ids.length === 0) return;

      // Fetch each changed order individually (O(1) Firestore read each)
      const fetches = ids.map(id =>
        apiClient.getOrderById(id).then(r => r?.orders?.[0]).catch(() => null)
      );
      const results = await Promise.all(fetches);
      const fetchedOrders = results.filter(Boolean);
      if (fetchedOrders.length === 0) return;

      setOrders(prev => {
        const existingIds = new Set(prev.map(o => o.id));
        let updated = [...prev];

        for (const order of fetchedOrders) {
          const idx = updated.findIndex(o => o.id === order.id);
          if (idx >= 0) {
            // Update existing order in-place
            updated[idx] = order;
          } else {
            // New order — prepend (newest first)
            updated.unshift(order);
          }
        }

        // Re-sort by createdAt descending
        updated.sort((a, b) => {
          const da = a.createdAt?._seconds ? a.createdAt._seconds * 1000 : new Date(a.createdAt).getTime();
          const db = b.createdAt?._seconds ? b.createdAt._seconds * 1000 : new Date(b.createdAt).getTime();
          return db - da;
        });

        return updated;
      });
    };

    const queueOrderFetch = (orderId) => {
      if (!orderId) return;
      pendingIds.add(orderId);
      if (batchTimer) clearTimeout(batchTimer);
      batchTimer = setTimeout(flushBatch, 2000);
    };

    const handler = (snapshot) => {
      const event = snapshot.val();
      if (!event) return;

      if (event.type === 'order-created') {
        console.log(`Firebase RTDB: Received 'order-created' event:`, event);
        queueOrderFetch(event.orderId);
      } else if (event.type === 'order-status-updated') {
        console.log(`Firebase RTDB: Received 'order-status-updated' event:`, event);
        queueOrderFetch(event.orderId);
      } else if (event.type === 'order-updated') {
        console.log(`Firebase RTDB: Received 'order-updated' event:`, event);
        queueOrderFetch(event.orderId);
      } else if (event.type === 'order-deleted') {
        console.log(`Firebase RTDB: Received 'order-deleted' event:`, event);
        if (event.orderId) {
          setOrders(prev => prev.filter(o => o.id !== event.orderId));
        }
      }
    };

    onChildAdded(eventsRef, handler);

    console.log(`Firebase RTDB: Subscribed to events/${restaurantId}/orders`);

    // Cleanup on unmount
    return () => {
      if (batchTimer) clearTimeout(batchTimer);
      console.log(`Firebase RTDB: Unsubscribing from events/${restaurantId}/orders`);
      off(eventsRef, 'child_added', handler);
    };
  }, [restaurantId]); // Only re-subscribe when restaurant changes

  // Reset to page 1 only when filters change (not when currentPage changes – that was breaking Next/Prev)
  useEffect(() => { setCurrentPage(1); }, [selectedStatus, selectedOrderType, myOrdersOnly, searchTerm, dateFilterMode, selectedPaymentMethod, selectedPaymentStatus, customStartDate, customEndDate]);

  // Scroll-aware collapsing header — only for orders view (other views have no stat cards)
  // Uses wide hysteresis + cooldown to prevent layout-thrashing flicker
  useEffect(() => {
    if (activeView !== 'orders') {
      setIsScrolled(false);
      return;
    }
    const scrollEl = document.querySelector('main.overflow-auto') || window;
    let rafId = null;
    let cooldown = false;
    const handleScroll = () => {
      if (rafId || cooldown) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const scrollTop = scrollEl === window ? window.scrollY : scrollEl.scrollTop;
        setIsScrolled(prev => {
          const next = prev ? (scrollTop < 20) ? false : prev   // expand only at near-top
                            : (scrollTop > 120) ? true : prev;  // collapse well past stat cards
          if (next !== prev) {
            // Lock out further changes during the CSS transition (300ms)
            cooldown = true;
            setTimeout(() => { cooldown = false; }, 350);
          }
          return next;
        });
      });
    };
    scrollEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollEl.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [activeView]);

  const handleSearch = (e) => { e.preventDefault(); fetchOrders(); };
  const handlePageChange = (newPage) => { if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage); };
  
  const handleViewOrder = (order) => {
    setSelectedOrderForModal(order);
  };

  const handleViewInvoice = (order) => {
    setSelectedOrderForInvoice(order);
  };

  const handleDownloadPDF = () => {
    printDocument({
      type: 'bill',
      domSelector: '.invoice-print-wrapper',
      orderId: selectedOrderForInvoice?.id,
      restaurantId: selectedOrderForInvoice?.restaurantId || restaurantId,
    });
  };

  const handleCancelOrder = (orderId) => {
    setCancelModalOrderId(orderId);
    setCancelReason('');
    setCancelError(null);
  };

  const closeCancelModal = () => {
    if (cancelSubmitting) return;
    setCancelModalOrderId(null);
    setCancelReason('');
    setCancelError(null);
  };

  const submitCancelOrder = async () => {
    if (!cancelModalOrderId) return;
    const reason = cancelReason.trim();
    if (!reason) {
      setCancelError('Please enter a cancellation reason');
      return;
    }
    setCancelSubmitting(true);
    setCancelError(null);
    try {
      // Offline: queue for later sync
      if (!isOnline) {
        if (!getOfflineEngineEnabled()) {
          setCancelError('You are offline. Please go online to cancel orders.');
          return;
        }
        await queueOfflineOrder({
          restaurantId,
          _offlineAction: 'cancel_order',
          _existingOrderId: cancelModalOrderId,
          _cancelReason: reason,
          idempotencyKey: generateIdempotencyKey(),
        });
        // Optimistic local update
        setOrders(prev => prev.map(o =>
          o.id === cancelModalOrderId ? { ...o, status: 'cancelled' } : o
        ));
        setScheduledOrders(prev => prev.map(o =>
          o.id === cancelModalOrderId ? { ...o, status: 'cancelled' } : o
        ));
        setCancelModalOrderId(null);
        setCancelReason('');
        setDeleteSuccess('Order cancelled offline — will sync when online');
        setTimeout(() => setDeleteSuccess(null), 4000);
        return;
      }

      await apiClient.cancelOrder(cancelModalOrderId, reason);
      // Update scheduledOrders locally
      setScheduledOrders(prev => prev.map(o =>
        o.id === cancelModalOrderId ? { ...o, status: 'cancelled' } : o
      ));
      setCancelModalOrderId(null);
      setCancelReason('');
      fetchOrders();
      setDeleteSuccess(t('orderHistory.status.cancelled') || 'Order cancelled — all calculations reversed');
      setTimeout(() => setDeleteSuccess(null), 4000);
    } catch (error) {
      console.error('Error cancelling:', error);
      setCancelError(error.message || 'Failed to cancel order');
    } finally {
      setCancelSubmitting(false);
    }
  };

  // ─── Refund handlers ───
  const handleOpenRefund = (order) => {
    const amount = order.finalAmount || order.totalAmount || 0;
    setRefundModalOrder(order);
    setRefundAmount(String(amount));
    setRefundType('full');
    setRefundReason('');
    setRefundError(null);
  };

  const closeRefundModal = () => {
    if (refundSubmitting) return;
    setRefundModalOrder(null);
    setRefundAmount('');
    setRefundReason('');
    setRefundError(null);
  };

  const submitRefund = async () => {
    if (!refundModalOrder) return;
    const amount = parseFloat(refundAmount);
    const maxAmount = refundModalOrder.finalAmount || refundModalOrder.totalAmount || 0;
    if (!amount || amount <= 0) {
      setRefundError('Please enter a valid refund amount');
      return;
    }
    if (amount > maxAmount) {
      setRefundError(`Refund cannot exceed order total (${formatCurrency(maxAmount)})`);
      return;
    }
    if (!refundReason.trim()) {
      setRefundError('Please provide a reason for the refund');
      return;
    }

    setRefundSubmitting(true);
    setRefundError(null);
    try {
      const result = await apiClient.processRefund(refundModalOrder.id, {
        refundAmount: amount,
        refundReason: refundReason.trim(),
        refundType: amount >= maxAmount ? 'full' : 'partial'
      });
      setRefundModalOrder(null);
      fetchOrders();
      const isFullRefund = amount >= maxAmount;
      setDeleteSuccess(
        isFullRefund
          ? `Full refund of ${formatCurrency(amount)} processed. All calculations reversed.`
          : `Partial refund of ${formatCurrency(amount)} recorded.`
      );
      setTimeout(() => setDeleteSuccess(null), 5000);
    } catch (error) {
      console.error('Error processing refund:', error);
      setRefundError(error.message || 'Failed to process refund');
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handleMarkCompleted = (orderId) => {
    const order = orders.find(o => o.id === orderId) || scheduledOrders.find(o => o.id === orderId);
    if (!order) return;

    const cartItems = (order.items || []).map(item => {
      const menuItem = menuItems?.find(m => m.id === (item.menuItemId || item.id));
      // Use variant price for refreshedPrice when variant is selected
      const refreshedPrice = item.selectedVariant?.price != null
        ? item.selectedVariant.price
        : (menuItem?.price ?? item.price ?? 0);
      // basePrice should use variant price when variant is selected
      const variantPriceVal = item.selectedVariant?.price;
      const itemBasePrice = variantPriceVal != null
        ? variantPriceVal
        : (menuItem?.price ?? item.basePrice ?? item.price ?? 0);
      return {
        id: item.menuItemId || item.id,
        name: menuItem?.name || item.name,
        price: refreshedPrice,
        quantity: item.quantity || 1,
        selectedVariant: item.selectedVariant,
        selectedCustomizations: item.selectedCustomizations,
        basePrice: itemBasePrice,
        isCustomItem: item.isCustomItem || false,
        pricingRules: menuItem?.pricingRules || item.pricingRules || {},
        category: item.category || menuItem?.category || '',
        taxGroupId: item.taxGroupId || menuItem?.taxGroupId || null,
        cartId: `${item.menuItemId || item.id}-${Date.now()}-${Math.random()}`
      };
    });

    setBillingModalCart(cartItems);
    setBillingModalPaymentMethod(order.paymentMethod || 'cash');
    setBillingCustomerName(order.customerInfo?.name || '');
    setBillingCustomerMobile(order.customerInfo?.phone || '');
    setBillingTableNumber(order.tableNumber || '');
    setBillingModalOrder(order);
  };

  const closeBillingModal = () => {
    setBillingModalOrder(null);
    setBillingModalCart([]);
    setBillingModalProcessing(false);
    setBillingOrderSuccess(null);
    setBillingCustomerName('');
    setBillingCustomerMobile('');
    setBillingTableNumber('');
  };

  const getBillingModalTotalAmount = () => {
    return billingModalCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleBillingProcessOrder = async (taxData = {}) => {
    if (!billingModalOrder || !restaurantId || billingModalProcessing) return;

    setBillingModalProcessing(true);
    const order = billingModalOrder;

    const {
      taxBreakdown = [], totalTax = 0, finalAmount = null, subtotal = null,
      serviceChargeAmount, serviceChargeRate, tipAmount, tipPercentage,
      cashReceived, changeReturned, splitPayments, roundOffAmount,
      compItems, voidItems, partialPayAmount, manualDiscount, offerDiscount,
      offerIds, selectedOfferName, totalDiscountAmount, specialInstructions,
      redeemLoyaltyPoints, loyaltyDiscount,
      serviceChargeEnabled, manualDiscountType, manualDiscountValue,
      fullDue,
      couponDiscount, couponCode, couponId,
      walletRedeemAmount, walletCustomerId,
      deliveryInfo: deliveryInfoData, deliveryAddress: deliveryAddrData,
      managerPin, taxInclusiveMode,
    } = taxData;

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const paymentAmount = finalAmount || order.finalAmount || order.totalAmount || getBillingModalTotalAmount();
      const isFullDue = fullDue === true || (partialPayAmount != null && partialPayAmount === 0);
      const isPartialPayment = !isFullDue && partialPayAmount && partialPayAmount > 0 && partialPayAmount < paymentAmount;

      const updateData = {
        status: 'completed',
        paymentStatus: isFullDue ? 'due' : (isPartialPayment ? 'partial' : 'paid'),
        paymentMethod: splitPayments ? 'split' : billingModalPaymentMethod,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(taxBreakdown.length > 0 && {
          totalAmount: subtotal || getBillingModalTotalAmount(),
          taxBreakdown,
          taxAmount: totalTax,
          finalAmount,
        }),
        ...(serviceChargeAmount > 0 && { serviceChargeAmount, serviceChargeRate }),
        ...(serviceChargeEnabled != null && { serviceChargeEnabled }),
        ...(tipAmount > 0 && { tipAmount, tipPercentage }),
        ...(cashReceived > 0 && { cashReceived, changeReturned }),
        ...(splitPayments && { splitPayments }),
        ...(roundOffAmount && roundOffAmount !== 0 && { roundOffAmount }),
        ...(compItems && { compItems }),
        ...(voidItems && { voidItems }),
        // Full Due: send partialPayAmount=0, paidAmount=0, outstandingAmount=full amount
        ...(isFullDue && {
          partialPayAmount: 0,
          paidAmount: 0,
          outstandingAmount: Math.round(paymentAmount * 100) / 100,
        }),
        ...(isPartialPayment && {
          partialPayAmount,
          paidAmount: partialPayAmount,
          outstandingAmount: Math.round((paymentAmount - partialPayAmount) * 100) / 100,
        }),
        // Discount fields — always include so zeros can clear previous values
        manualDiscount: manualDiscount || 0,
        manualDiscountType: manualDiscountType || null,
        manualDiscountValue: manualDiscountValue != null ? manualDiscountValue : null,
        offerDiscount: offerDiscount || 0,
        offerIds: offerIds && offerIds.length > 0 ? offerIds : [],
        selectedOfferName: selectedOfferName || null,
        totalDiscountAmount: totalDiscountAmount || 0,
        specialInstructions: specialInstructions || null,
        redeemLoyaltyPoints: redeemLoyaltyPoints || 0,
        loyaltyDiscount: loyaltyDiscount || 0,
        // Coupon fields
        couponDiscount: couponDiscount || null,
        couponCode: couponCode || null,
        couponId: couponId || null,
        // Wallet fields
        walletRedeemAmount: walletRedeemAmount || null,
        walletCustomerId: walletCustomerId || null,
        // Delivery fields
        deliveryInfo: deliveryInfoData || order.deliveryInfo || null,
        deliveryAddress: deliveryAddrData || order.deliveryAddress || null,
        // Manager pin & tax mode
        managerPin: managerPin || null,
        taxInclusiveMode: taxInclusiveMode || null,
        customerId: order.customerId || null,
        tableNumber: billingTableNumber || order.tableNumber || null,
        customerInfo: {
          name: billingCustomerName || order.customerInfo?.name || '',
          phone: billingCustomerMobile || order.customerInfo?.phone || null,
          tableNumber: billingTableNumber || order.tableNumber || null,
        },
        lastUpdatedBy: {
          name: currentUser.name || 'Staff',
          id: currentUser.id,
          role: currentUser.role || 'waiter',
        },
      };

      // Offline: queue for later sync
      if (!isOnline) {
        if (!getOfflineEngineEnabled()) {
          alert('You are offline. Please go online to complete billing.');
          setBillingModalProcessing(false);
          return;
        }
        const _offBillingMethod = splitPayments ? (splitPayments[0]?.method || 'cash') : billingModalPaymentMethod;
        const _offSafeMethod = ['cash', 'card', 'upi'].includes(_offBillingMethod) ? _offBillingMethod : 'cash';
        const paymentData = {
          orderId: order.id,
          paymentMethod: _offSafeMethod,
          amount: isFullDue ? 0 : (isPartialPayment ? partialPayAmount : paymentAmount),
          userId: currentUser.id,
          restaurantId,
          paymentStatus: isFullDue ? 'due' : (isPartialPayment ? 'partial' : 'paid'),
        };
        await queueOfflineOrder({
          ...updateData,
          restaurantId,
          _offlineAction: 'complete_billing_existing',
          _existingOrderId: order.id,
          _paymentData: paymentData,
          idempotencyKey: generateIdempotencyKey(),
        });
        // Optimistic local update
        const offlinePayStatus = isFullDue ? 'due' : (isPartialPayment ? 'partial' : 'paid');
        setOrders(prevOrders => prevOrders.map(o =>
          o.id === order.id ? { ...o, status: 'completed', paymentStatus: offlinePayStatus } : o
        ));
        setScheduledOrders(prev => prev.map(o =>
          o.id === order.id ? { ...o, status: 'completed', paymentStatus: offlinePayStatus } : o
        ));
        closeBillingModal();
        setDeleteSuccess('Order billed offline — will sync when online');
        setTimeout(() => setDeleteSuccess(null), 4000);
        setBillingModalProcessing(false);
        return { orderId: order.id };
      }

      await apiClient.updateOrder(order.id, updateData);

      // Backend only accepts 'cash', 'card', 'upi' — normalize split/other methods
      const _billingMethod = splitPayments ? (splitPayments[0]?.method || 'cash') : billingModalPaymentMethod;
      const _safeMethod = ['cash', 'card', 'upi'].includes(_billingMethod) ? _billingMethod : 'cash';
      await apiClient.verifyPayment({
        orderId: order.id,
        paymentMethod: _safeMethod,
        amount: isFullDue ? 0 : (isPartialPayment ? partialPayAmount : paymentAmount),
        userId: currentUser.id,
        restaurantId,
        paymentStatus: isFullDue ? 'due' : (isPartialPayment ? 'partial' : 'paid'),
      });

      const resolvedPaymentStatus = isFullDue ? 'due' : (isPartialPayment ? 'partial' : 'paid');
      setOrders(prevOrders => prevOrders.map(o =>
        o.id === order.id ? { ...o, status: 'completed', paymentStatus: resolvedPaymentStatus } : o
      ));
      setScheduledOrders(prev => prev.map(o =>
        o.id === order.id ? { ...o, status: 'completed', paymentStatus: resolvedPaymentStatus } : o
      ));
      // Don't close modal here — let OrderSummary generate invoice + print first
      // Modal will auto-close after invoice is generated and print is triggered
      setTimeout(() => {
        closeBillingModal();
        fetchOrders(false);
      }, 3000);

      return { orderId: order.id };
    } catch (error) {
      console.error('Billing error:', error);
      alert('Billing failed: ' + (error.message || 'Unknown error'));
      setBillingModalProcessing(false); // Only reset on error so user can retry; on success keep disabled until modal closes
    }
  };

  const handleMarkPaid = (orderId) => { setMarkPaidOrderId(orderId); };

  const executeMarkPaid = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    setMarkPaidSubmitting(true);
    try {
      const outstanding = order.outstandingAmount || 0;
      const finalAmt = order.finalAmount || order.totalAmount || 0;
      if (order.customerId && outstanding > 0) {
        // Use settle-credit API which updates order, customer totalSpent, and daily stats
        await apiClient.settleCustomerCredit(order.customerId, {
          amount: outstanding,
          paymentMethod: order.paymentMethod || 'cash',
          orderId: order.id
        });
      } else {
        // No customer linked — just update order directly
        await apiClient.updateOrder(order.id, {
          paidAmount: Math.round(finalAmt * 100) / 100,
          outstandingAmount: 0,
          paymentStatus: 'paid',
        });
      }
      setOrders(prev => prev.map(o =>
        o.id === order.id ? { ...o, paidAmount: finalAmt, outstandingAmount: 0, paymentStatus: 'paid' } : o
      ));
      setMarkPaidOrderId(null);
      setTimeout(() => fetchOrders(false), 500);
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Failed to mark as paid: ' + (error.message || 'Unknown error'));
    } finally {
      setMarkPaidSubmitting(false);
    }
  };

  const handleEditOrder = (orderId) => router.push(`/dashboard?orderId=${orderId}&mode=edit&from=orderhistory`);

  // Edit completed order handlers
  const handleOpenEditCompleted = async (order) => {
    setEditCompletedOrder(order);
    setEditCompletedForm({
      orderType: order.orderType || 'dine-in',
      paymentMethod: order.paymentMethod || 'cash',
      paymentStatus: order.paymentStatus || 'paid',
      splitPayments: order.splitPayments?.length >= 2 ? JSON.parse(JSON.stringify(order.splitPayments))
        : (order.paymentMethod === 'split' ? [{ method: 'cash', amount: 0 }, { method: 'upi', amount: 0 }] : []),
      cashReceived: order.cashReceived || 0,
      changeReturned: order.changeReturned || 0,
      paidAmount: order.paidAmount || 0,
      outstandingAmount: order.outstandingAmount || 0,
      deliveryType: order.deliveryType || '',
      tableNumber: order.tableNumber || '',
      notes: order.notes || order.specialInstructions || '',
      customerName: order.customerInfo?.name || order.customerDisplay?.name || '',
      customerPhone: order.customerInfo?.phone || order.customerDisplay?.phone || '',
    });
    setEditCompletedHistory(order.editHistory || []);
    // Also fetch latest edit history from server
    try {
      const res = await apiClient.getOrderEditHistory(order.id);
      if (res.editHistory) setEditCompletedHistory(res.editHistory);
    } catch {}
  };

  const handleSaveEditCompleted = async () => {
    if (!editCompletedOrder) return;
    setEditCompletedSaving(true);
    try {
      const isSplit = editCompletedForm.paymentMethod === 'split';
      const orderTotal = editCompletedOrder.finalAmount || editCompletedOrder.totalAmount || 0;
      const origMethod = editCompletedOrder.paymentMethod || 'cash';
      const origStatus = editCompletedOrder.paymentStatus || 'paid';
      const statusChanged = editCompletedForm.paymentStatus !== origStatus;

      const payload = {
        orderType: editCompletedForm.orderType,
        paymentMethod: editCompletedForm.paymentMethod,
        paymentStatus: editCompletedForm.paymentStatus,
        deliveryType: editCompletedForm.deliveryType,
        tableNumber: editCompletedForm.tableNumber,
        notes: editCompletedForm.notes,
        customerInfo: {
          name: editCompletedForm.customerName,
          phone: editCompletedForm.customerPhone,
        },
      };

      // Only send split payments if method is/was split
      if (isSplit || origMethod === 'split') {
        payload.splitPayments = isSplit && editCompletedForm.splitPayments?.length >= 2 ? editCompletedForm.splitPayments : null;
      }
      // Only send cash tendering if method is/was cash
      if (editCompletedForm.paymentMethod === 'cash' || origMethod === 'cash') {
        payload.cashReceived = editCompletedForm.paymentMethod === 'cash' ? (editCompletedForm.cashReceived || 0) : 0;
        payload.changeReturned = editCompletedForm.paymentMethod === 'cash' ? (editCompletedForm.changeReturned || 0) : 0;
      }
      // Only send paid/outstanding amounts if status changed or is partial
      if (statusChanged || editCompletedForm.paymentStatus === 'partial') {
        payload.paidAmount = editCompletedForm.paymentStatus === 'partial' ? editCompletedForm.paidAmount : (editCompletedForm.paymentStatus === 'due' ? 0 : orderTotal);
        payload.outstandingAmount = editCompletedForm.paymentStatus === 'partial' ? Math.max(0, orderTotal - (editCompletedForm.paidAmount || 0)) : (editCompletedForm.paymentStatus === 'due' ? orderTotal : 0);
      }
      const res = await apiClient.editCompletedOrder(editCompletedOrder.id, payload);
      if (res.success) {
        // Update order in local state
        setOrders(prev => prev.map(o => o.id === editCompletedOrder.id ? { ...o, ...res.order } : o));
        setEditCompletedHistory(res.order?.editHistory || [...editCompletedHistory, res.editEntry]);
        setEditCompletedOrder(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setEditCompletedSaving(false);
    }
  };

  // --- Edit Completed Order Items handlers ---
  const handleEditItemsClick = (order) => {
    setEditReason('');
    setEditReasonModal(order);
  };

  const handleEditReasonSubmit = () => {
    if (!editReason.trim() || editReason.trim().length < 3) return;
    const order = editReasonModal;
    setEditReasonModal(null);
    if (requirePin) {
      setPinCode('');
      setPinError('');
      setPinModal(order);
    } else {
      setEditItemsOrder(order);
    }
  };

  const handlePinSubmit = () => {
    if (!pinCode || pinCode.length < 4) {
      setPinError('PIN must be at least 4 digits');
      return;
    }
    const order = pinModal;
    setPinModal(null);
    setEditItemsOrder(order);
  };

  const handleEditItemsComplete = (updatedOrder, response) => {
    // Update order in local state
    if (updatedOrder?.id) {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
    }
    setEditItemsOrder(null);
    setEditReason('');
    setPinCode('');
  };

  const [syncingOrderKey, setSyncingOrderKey] = useState(null);
  const handleRetrySync = async (order) => {
    if (!order?.idempotencyKey) return;
    if (!navigator.onLine) {
      setDeleteError('Cannot sync while offline. Please connect to the internet first.');
      return;
    }
    setSyncingOrderKey(order.idempotencyKey);
    try {
      // Reset to pending so sync engine picks it up
      await updateOrderSyncStatus(order.idempotencyKey, 'pending', { retryCount: 0 });
      await syncPendingOrders(apiClient);
      // Remove the offline order from local display immediately
      setOrders(prev => prev.filter(o => o.idempotencyKey !== order.idempotencyKey));
      setDeleteSuccess('Order synced successfully');
      setTimeout(() => setDeleteSuccess(null), 4000);
      // Refresh from server to get the synced version
      await fetchOrders();
    } catch (err) {
      console.error('Retry sync failed:', err);
      setDeleteError('Sync failed — will retry automatically when online');
    } finally {
      setSyncingOrderKey(null);
    }
  };

  const handleDeleteOrder = (orderId) => {
    if (!isOnline) return;
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

  const printFoodCourtTokensForOrder = async (order, delay = 1200) => {
    if (!printSettings?.tokenBillingEnabled || order?.status !== 'completed') return;

    const tokenRestaurantId = order.restaurantId || restaurantId || restaurant?.id;
    const orderId = order.id || order.orderId;
    if (!tokenRestaurantId || !orderId) return;

    try {
      const tokenRes = await apiClient.getTokenRender(tokenRestaurantId, orderId);
      const tokens = tokenRes?.tokens || [];
      if (!tokenRes?.success || tokens.length === 0) return;

      const tokenHtml = buildTokenSlipsDocumentHTML(tokens, printSettings);
      setTimeout(() => {
        printHtmlInHiddenFrame(tokenHtml).catch((err) => {
          console.error('Food court token print failed:', err);
        });
      }, delay);
    } catch (err) {
      console.error('Food court token print error:', err);
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
      const itemsHtml = items.map(item => `<tr><td style="text-align:left;">${(item.name || '').replace(/</g,'&lt;')}</td><td style="text-align:center;">${item.quantity || 1}</td><td style="text-align:right;">${symbol}${((item.price || item.total/(item.quantity||1) || 0) * (item.quantity || 1)).toFixed(2)}</td></tr>`).join('');
      const taxHtml = taxBreakdownArr.map(t => `<tr><td colspan="2" style="text-align:left;">${(t.name || 'Tax').replace(/</g,'&lt;')}${t.rate != null ? ` (${t.rate}%)` : ''}</td><td style="text-align:right;">${symbol}${(t.amount || 0).toFixed(2)}</td></tr>`).join('');

      // Build identity lines for print header
      const _idLines = [];
      if (restaurant?.legalBusinessName && restaurant.legalBusinessName !== restaurantName) _idLines.push(restaurant.legalBusinessName.replace(/</g,'&lt;'));
      const _receiptAddr = printSettings?.receiptAddress || restaurant?.address;
      const _receiptPhone = printSettings?.receiptPhone || restaurant?.phone;
      if (_receiptAddr) _idLines.push(_receiptAddr.replace(/</g,'&lt;'));
      if (_receiptPhone) _idLines.push('Tel: ' + _receiptPhone);
      if (restaurant?.showGstOnInvoice && restaurant?.gstin) _idLines.push('GSTIN: ' + restaurant.gstin);
      if (restaurant?.showFssaiOnInvoice && restaurant?.fssai) _idLines.push('FSSAI: ' + restaurant.fssai);
      if (restaurant?.showTaxIdOnInvoice && restaurant?.vatNumber) _idLines.push('Tax ID: ' + restaurant.vatNumber);
      if (restaurant?.showTaxIdOnInvoice && restaurant?.taxId) _idLines.push('Tax ID: ' + restaurant.taxId);
      if (restaurant?.showTaxIdOnInvoice && restaurant?.businessRegistrationNumber) _idLines.push('Reg#: ' + restaurant.businessRegistrationNumber);
      const _idHtml = _idLines.map(l => `<div style="font-size:11px;">${l}</div>`).join('');
      const _headerHtml = getBillHeaderHTML(restaurantName.replace(/</g,'&lt;'), _idHtml, printSettings?.receiptLogo || null, `--- ${bLabels.billTitle} ---`);

      const billContent = `<!DOCTYPE html><html><head><title>${bLabels.billLabel} #${orderNum}</title><style>${getBillPrintCSS(printSettings?.billFontScale || printSettings?.billFontSize, printSettings?.billFontFamily, printSettings?.printerWidth, printSettings)}</style></head><body>${_headerHtml}<div class="divider">--------------------------------</div><div class="bill-info"><div class="info-row"><span>${bLabels.billLabel}#:</span><span><strong>${orderNum}</strong></span></div><div class="info-row"><span>Date:</span><span>${formattedDate} ${formattedTime}</span></div>${tableNum ? `<div class="info-row"><span>Table:</span><span>${tableNum}</span></div>` : ''}${roomNum ? `<div class="info-row"><span>Room:</span><span>${roomNum}</span></div>` : ''}${customerName ? `<div class="info-row"><span>${bLabels.customerLabel}:</span><span>${String(customerName).replace(/</g,'&lt;')}</span></div>` : ''}<div class="info-row"><span>Payment:</span><span>${(order.paymentMethod || 'CASH').toUpperCase()}</span></div></div><div class="divider">--------------------------------</div><table><thead><tr><th style="text-align:left;width:55%;">${bLabels.itemCol}</th><th style="text-align:center;width:15%;">${bLabels.qtyCol}</th><th style="text-align:right;width:30%;">Amt</th></tr></thead><tbody>${itemsHtml}</tbody></table><div class="total-section"><div class="bill-info"><div class="info-row"><span>Subtotal:</span><span>${symbol}${subtotal.toFixed(2)}</span></div></div>${taxHtml ? `<table style="margin:4px 0;"><tbody>${taxHtml}</tbody></table>` : ''}<div class="total-row"><span>TOTAL:</span><span>${symbol}${total.toFixed(2)}</span></div></div><div class="divider">================================</div><div class="bill-footer"><p>${bLabels.footer}</p><p style="font-size:10px;margin-top:4px;">Powered by DineOpen</p></div></body></html>`;

      if (supportsNativeAutoPrint()) {
        printDocument({ html: billContent, type: 'bill', printSettings: printSettings || {} });
      } else {
        const win = window.open('', '_blank', 'width=400,height=600');
        if (win) {
          win.document.write(billContent);
          win.document.close();
          win.focus();
          setTimeout(() => { win.print(); }, 500);
        }
      }
      printFoodCourtTokensForOrder(order);
    } else {
      // KOT format - matches KOT Printer app's generateKOTHtml
      const totalItems = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
      const specialInstructions = order.specialInstructions || '';
      const kotContent = `<!DOCTYPE html><html><head><title>KOT - ${orderNum}</title><style>${getKOTPrintCSS(printSettings?.billFontScale || printSettings?.billFontSize, printSettings?.billFontFamily, printSettings?.printerWidth, printSettings)}</style></head><body><div class="kot-header"><div class="restaurant-name">${restaurantName.replace(/</g,'&lt;')}</div><div class="kot-title">--- KITCHEN ORDER ---</div></div><div class="divider">--------------------------------</div><div class="kot-info"><div><strong>Order#:</strong> ${orderNum}</div>${tableNum ? `<div><strong>Table:</strong> ${tableNum}</div>` : ''}${roomNum ? `<div><strong>Room:</strong> ${roomNum}</div>` : ''}<div><strong>Time:</strong> ${formattedTime}</div><div><strong><strong>Date:</strong></strong> ${formattedDate}</div>${customerName ? `<div><strong>Customer:</strong> ${String(customerName).replace(/</g,'&lt;')}</div>` : ''}${orderType ? `<div><strong>Type:</strong> ${orderType}</div>` : ''}</div><div class="divider">--------------------------------</div><div style="font-weight:bold;margin-bottom:4px;">QTY &nbsp; ITEM</div><div class="divider">--------------------------------</div>${items.map(i => `<div class="item"><div class="item-main"><span class="item-qty">${i.quantity || 1}x</span><span class="item-name">${(i.name || '').replace(/</g,'&lt;')}</span></div>${i.selectedVariant?.name ? `<div class="item-detail">[${i.selectedVariant.name}]</div>` : ''}${(i.selectedCustomizations || []).map(c => `<div class="item-detail">+ ${(c.name || c || '').toString().replace(/</g,'&lt;')}</div>`).join('')}${i.notes ? `<div class="item-note">Note: ${(i.notes || '').replace(/</g,'&lt;')}</div>` : ''}</div>`).join('')}<div class="divider">--------------------------------</div>${specialInstructions ? `<div class="special-instructions"><strong>*** SPECIAL INSTRUCTIONS ***</strong><div>${specialInstructions.replace(/</g,'&lt;')}</div></div><div class="divider">--------------------------------</div>` : ''}<div class="kot-footer">Total Items: ${totalItems}</div><div class="divider">================================</div></body></html>`;

      if (supportsNativeAutoPrint()) {
        printDocument({ html: kotContent, type: 'kot', printSettings: printSettings || {} });
      } else {
        const pw = window.open('', '_blank', 'width=400,height=600');
        if (pw) {
          pw.document.write(kotContent);
          pw.document.close();
          pw.focus();
          setTimeout(() => { pw.print(); }, 400);
        }
      }
    }
  };

  const handlePrintBill = (order) => {
    setPrintDropdownOrderId(null);
    // Force bill print by temporarily setting status
    const billOrder = { ...order, status: 'completed' };
    if (printSettings?.kotPrinterEnabled && printSettings?.usePusherForKOT) {
      // Try KOT printer app first
      setPrintingOrderId(order.id);
      apiClient.requestManualPrint(order.id, 'bill')
        .then((response) => {
          if (response?.success) {
            setPrintSuccess(`Bill sent to printer (#${order.dailyOrderId || order.id?.slice(-4)})`);
            setTimeout(() => setPrintSuccess(null), 3000);
          }
        })
        .catch(() => browserPrint(billOrder))
        .finally(() => setPrintingOrderId(null));
    } else {
      browserPrint(billOrder);
    }
  };

  const handlePrintKOT = (order) => {
    setPrintDropdownOrderId(null);
    // Force KOT print by temporarily setting status to pending
    const kotOrder = { ...order, status: 'active' };
    if (printSettings?.kotPrinterEnabled && printSettings?.usePusherForKOT) {
      setPrintingOrderId(order.id);
      apiClient.requestManualPrint(order.id, 'kot')
        .then((response) => {
          if (response?.success) {
            setPrintSuccess(`KOT sent to printer (#${order.dailyOrderId || order.id?.slice(-4)})`);
            setTimeout(() => setPrintSuccess(null), 3000);
          }
        })
        .catch(() => browserPrint(kotOrder))
        .finally(() => setPrintingOrderId(null));
    } else {
      browserPrint(kotOrder);
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
    // Calculate subtotal from items (raw total before discounts)
    let subtotal = 0;
    if (order.items && Array.isArray(order.items)) {
      subtotal = order.items.reduce((sum, item) => sum + (item.total || (item.price * item.quantity) || 0), 0);
    } else if (order.subtotal && order.subtotal > 0) subtotal = order.subtotal;
    else if (order.totalAmount && order.totalAmount > 0) subtotal = order.totalAmount;
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
      const offerName = (typeof order.appliedOffer === 'string' ? order.appliedOffer : order.appliedOffer?.name) || order.selectedOfferName || (order.appliedOffers?.length > 0 ? (typeof order.appliedOffers[0] === 'string' ? order.appliedOffers[0] : order.appliedOffers[0]?.name) : null) || 'Offer Discount';
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
    if (order.couponDiscount && order.couponDiscount > 0) {
      const amt = parseFloat(order.couponDiscount.toFixed(2));
      discountAmount += amt;
      discountLines.push({ name: order.couponCode ? `Coupon (${order.couponCode})` : 'Coupon Discount', amount: amt });
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

  // Calculate summary statistics — memoized; use server-side analytics for consistency with HQ page
  const stats = useMemo(() => {
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
      return !['cancelled', 'deleted', 'saved', 'refunded'].includes(order.status);
    });

    const totalRevenue = validOrders.reduce((sum, order) => {
      const refundAdj = order.refundAmount || 0;
      return sum + calculateOrderTotal(order) - refundAdj;
    }, 0);
    const orderCount = validOrders.length;
    const completedCount = validOrders.filter(o => o.status === 'completed').length;

    // Client-side payment breakdown fallback
    const paymentBreakdown = {};
    validOrders.forEach(order => {
      const method = (order.paymentMethod || 'cash').toLowerCase();
      const refundAdj = order.refundAmount || 0;
      if (!paymentBreakdown[method]) paymentBreakdown[method] = { count: 0, total: 0 };
      paymentBreakdown[method].count += 1;
      paymentBreakdown[method].total += calculateOrderTotal(order) - refundAdj;
    });

    return { totalRevenue, orderCount, completedCount, paymentBreakdown };
  }, [orders, analyticsStats]);

  // Client-side sub-restaurant filtering (memoized)
  const displayedOrders = useMemo(() => filterSubRestaurant !== 'all'
    ? orders.filter(order => order.subRestaurantId === filterSubRestaurant)
    : orders, [orders, filterSubRestaurant]);

  // Fetch scheduled orders
  const fetchScheduledOrders = useCallback(async () => {
    if (!restaurantId) return;
    setScheduledLoading(true);
    try {
      const filters = {
        page: 1,
        limit: 200,
        isScheduled: 'true',
      };
      const response = await apiClient.getOrders(restaurantId, filters);
      let schOrders = response.orders || [];
      // Sort by scheduledFor ascending (upcoming first)
      schOrders.sort((a, b) => {
        const dateA = new Date(a.scheduledFor || a.createdAt);
        const dateB = new Date(b.scheduledFor || b.createdAt);
        return dateA - dateB;
      });
      setScheduledOrders(schOrders);
    } catch (err) {
      console.error('Failed to fetch scheduled orders:', err);
    } finally {
      setScheduledLoading(false);
    }
  }, [restaurantId]);

  // View toggle — updates URL so refresh preserves view
  const switchView = useCallback((view) => {
    setActiveView(view);
    const params = new URLSearchParams(window.location.search);
    if (view === 'summary') {
      params.set('view', 'summary');
    } else if (view === 'scheduled') {
      params.set('view', 'scheduled');
    } else if (view === 'bookings') {
      params.set('view', 'bookings');
    } else {
      params.delete('view');
    }
    const qs = params.toString();
    // Preserve current path (important: /mobile/orderhistory vs /orderhistory)
    const basePath = window.location.pathname || '/orderhistory';
    router.replace(`${basePath}${qs ? '?' + qs : ''}`, { scroll: false });

    // Fetch summary data when switching to summary view
    if (view === 'summary' && !summaryData && restaurantId) {
      fetchSummaryData();
    }
    if (view === 'scheduled' && restaurantId) {
      fetchScheduledOrders();
    }
    if (view === 'bookings' && restaurantId) {
      fetchBookingsData();
      loadBookingMeta();
    }
  }, [restaurantId, summaryData, fetchScheduledOrders]);

  // Fetch bookings for the Bookings tab
  const fetchBookingsData = useCallback(async () => {
    if (!restaurantId) return;
    setBookingsLoading(true);
    try {
      const resp = await apiClient.getBookings(restaurantId, bookingsFilters);
      setBookingsData(resp.bookings || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, [restaurantId, bookingsFilters]);

  // Load booking settings + venues when bookings tab first opens
  const loadBookingMeta = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const restData = JSON.parse(localStorage.getItem('selectedRestaurant') || '{}');
      if (restData.bookingSettings) setBookingSettings(restData.bookingSettings);
      const venuesResp = await apiClient.request('/api/bookings/' + restaurantId + '/venues');
      setBookingVenues(venuesResp.venues || []);
    } catch (err) {
      console.error('Failed to load booking meta:', err);
    }
  }, [restaurantId]);

  const handleBookingSave = useCallback(async (formData) => {
    if (!restaurantId) return;
    try {
      const payload = {
        type: formData.type,
        customer: formData.customer,
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        eventEndDate: formData.endDate || null,
        eventTime: formData.startTime || null,
        eventEndTime: formData.endTime || null,
        guestCount: Number(formData.guestCount) || 0,
        specialInstructions: formData.specialInstructions || '',
        venue: formData.type === 'venue' && formData.venueId ? {
          venueId: formData.venueId,
          venueName: (bookingVenues.find(v => v.id === formData.venueId) || {}).name || '',
        } : null,
        items: (formData.items || []).map(item => ({
          id: item.id || String(Date.now()),
          name: item.name,
          price: Number(item.price) || 0,
          quantity: Number(item.qty) || 1,
          isCustom: item.isCustom || false,
          notes: item.notes || null,
          category: item.category || null,
        })),
        subtotal: formData.subtotal || 0,
        discount: formData.discount && formData.discount.value ? {
          type: formData.discount.type || 'percentage',
          value: Number(formData.discount.value) || 0,
          amount: formData.discountAmount || 0,
        } : null,
        taxAmount: Number(formData.taxAmount) || 0,
        serviceCharge: Number(formData.serviceCharge) || 0,
        totalAmount: formData.totalAmount || 0,
        payments: formData.payment && formData.payment.enabled && formData.payment.amount ? [{
          amount: Number(formData.payment.amount),
          method: formData.payment.method || 'cash',
          date: new Date().toISOString(),
          type: 'advance',
        }] : [],
        trackExpense: formData.trackInExpenses || false,
      };
      if (bookingsEditingBooking) {
        await apiClient.updateBooking(restaurantId, bookingsEditingBooking.id, payload);
      } else {
        await apiClient.createBooking(restaurantId, payload);
      }
      setBookingsFormOpen(false);
      setBookingsEditingBooking(null);
      fetchBookingsData();
    } catch (err) {
      alert('Failed to save booking: ' + (err.message || 'Unknown error'));
    }
  }, [restaurantId, bookingsEditingBooking, fetchBookingsData, bookingVenues]);

  const fetchSummaryData = useCallback(async (period) => {
    if (!restaurantId) return;
    const p = period || summaryPeriod;
    setSummaryLoading(true);
    try {
      const options = {};
      if (p === 'custom' && summaryCustomStart && summaryCustomEnd) {
        options.startDate = summaryCustomStart;
        options.endDate = summaryCustomEnd;
      } else if (p !== 'custom') {
        options.period = p;
      }
      const res = await apiClient.getDailySummary(restaurantId, options);
      if (res?.success) setSummaryData(res.summary);
    } catch (err) {
      console.error('Summary fetch error:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [restaurantId, summaryPeriod, summaryCustomStart, summaryCustomEnd]);

  const handleSummaryPeriodChange = useCallback((period) => {
    setSummaryPeriod(period);
    setSummaryData(null);
    if (period !== 'custom') {
      fetchSummaryData(period);
    }
  }, [fetchSummaryData]);

  const handleSummaryCustomApply = useCallback(() => {
    if (summaryCustomStart && summaryCustomEnd) {
      fetchSummaryData('custom');
    }
  }, [summaryCustomStart, summaryCustomEnd, fetchSummaryData]);

  // Auto-fetch summary when view is summary and restaurantId loads
  useEffect(() => {
    if (activeView === 'summary' && restaurantId && !summaryData && !summaryLoading) {
      fetchSummaryData();
    }
  }, [activeView, restaurantId]);

  // Auto-fetch scheduled orders when view is scheduled and restaurantId loads
  useEffect(() => {
    if (activeView === 'scheduled' && restaurantId && scheduledOrders.length === 0 && !scheduledLoading) {
      fetchScheduledOrders();
    }
    if (activeView === 'bookings' && restaurantId && bookingsData.length === 0 && !bookingsLoading) {
      fetchBookingsData();
      loadBookingMeta();
    }
  }, [activeView, restaurantId]);

  // Refetch bookings when filters change
  useEffect(() => {
    if (activeView === 'bookings' && restaurantId) {
      fetchBookingsData();
    }
  }, [bookingsFilters]);

  const toggleSummarySort = (field) => {
    if (summarySortBy === field) {
      setSummarySortDir(d => d === 'desc' ? 'asc' : 'desc');
    } else {
      setSummarySortBy(field);
      setSummarySortDir('desc');
    }
  };

  const filteredSummaryItems = useMemo(() => {
    if (!summaryData?.items) return [];
    let items = [...summaryData.items];
    if (summarySearch) {
      const term = summarySearch.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(term));
    }
    items.sort((a, b) => {
      let cmp = 0;
      if (summarySortBy === 'quantity') cmp = a.quantity - b.quantity;
      else if (summarySortBy === 'revenue') cmp = a.revenue - b.revenue;
      else cmp = a.name.localeCompare(b.name);
      return summarySortDir === 'desc' ? -cmp : cmp;
    });
    return items;
  }, [summaryData?.items, summarySearch, summarySortBy, summarySortDir]);

  const summaryPeriods = [
    { key: 'today', label: t('orderHistory.summaryToday') },
    { key: 'yesterday', label: t('orderHistory.summaryYesterday') },
    { key: '7d', label: t('orderHistory.summary7Days') },
    { key: '30d', label: t('orderHistory.summary30Days') },
    { key: 'custom', label: t('orderHistory.summaryCustom') },
  ];

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    const statusStyle = getStatusStyle(order.status, order.orderFlow, order.lastStatus, order);
    const breakdown = getOrderBreakdown(order);
    const orderTotal = breakdown.total;
    const subtotal = breakdown.subtotal;
    const modalSourceChip = getOrderSourceChip(order);
    const roomVal = order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber;

    return (
      <div
        className={`fixed inset-0 flex items-center justify-center ${isMobileEmbed ? 'pb-16' : ''}`}
        style={{ zIndex: 10100, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: isMobileEmbed ? '8px' : undefined }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className={`bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col overflow-hidden ${isMobileEmbed ? '' : 'max-h-[92vh]'}`} style={isMobileEmbed ? { maxHeight: 'calc(var(--app-height, 85vh) - 60px)' } : {}}>
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
                <span className="text-white font-bold text-sm">#{order.dailyOrderId || order.orderNumber || order.id.slice(-4).toUpperCase()}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide"
                    style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                  >
                    {statusStyle.label}
                  </span>
                  {modalSourceChip && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${modalSourceChip.className}`}>
                      {modalSourceChip.label}
                    </span>
                  )}
                  {order.subRestaurantName && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 6px', backgroundColor: '#fff7ed', color: '#9a3412', borderRadius: '4px', fontSize: '10px', fontWeight: '600', border: '1px solid #fed7aa' }}>
                      <FaStore size={8} /> {order.subRestaurantName}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <FaClock className="text-[10px]" /> {formatDate(order.createdAt)}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <FaTimes className="text-gray-400 text-sm" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Info strip */}
            <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/50">
              <div className="px-4 py-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">{t('orderHistory.customer')}</div>
                <div className="text-sm font-semibold text-gray-900 truncate">{order.customerDisplay?.name || t('orderHistory.walkIn')}</div>
                <div className="text-xs text-gray-400 truncate">{order.customerDisplay?.phone || '—'}</div>
              </div>
              <div className="px-4 py-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">
                  {roomVal ? t('orderHistory.room') : t('orderHistory.table')}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {roomVal || order.customerDisplay?.tableNumber || order.tableNumber || '—'}
                </div>
                <div className="text-xs text-gray-400 capitalize truncate">
                  {roomVal ? t('orderHistory.hotelRoom') : (order.customerDisplay?.floorName || '—')}
                </div>
              </div>
              <div className="px-4 py-3">
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">{t('common.category')}</div>
                <div className="text-sm font-semibold text-gray-900 capitalize">{order.orderType?.replace('-', ' ') || t('orderHistory.type.dineIn')}</div>
                <div className="text-xs text-gray-400 capitalize">{order.paymentMethod || t('orderHistory.unpaid')}</div>
              </div>
              <div className="px-4 py-3" style={{ position: 'relative' }}>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-1">Assigned Staff</div>
                {editingStaffOrderId === order.id ? (
                  <div style={{ position: 'relative' }}>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search or type name..."
                      value={displayStaffQuery}
                      onFocus={() => { fetchHistoryStaffList(); setHistoryStaffDropdownOpen(true); }}
                      onBlur={() => setTimeout(() => {
                        setHistoryStaffDropdownOpen(false);
                        if (displayStaffQuery.trim()) {
                          handleReassignStaff(order, { name: displayStaffQuery.trim(), id: null });
                        } else if (!displayStaffQuery && !reassigningStaff) {
                          setEditingStaffOrderId(null);
                        }
                      }, 200)}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDisplayStaffQuery(val);
                        clearTimeout(staffQueryDebounceRef.current);
                        staffQueryDebounceRef.current = setTimeout(() => setHistoryStaffQuery(val), 300);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && displayStaffQuery.trim()) {
                          clearTimeout(staffQueryDebounceRef.current);
                          setHistoryStaffQuery(displayStaffQuery);
                          e.target.blur();
                        } else if (e.key === 'Escape') {
                          setHistoryStaffQuery('');
                          setDisplayStaffQuery('');
                          setEditingStaffOrderId(null);
                          setHistoryStaffDropdownOpen(false);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        border: '2px solid #3b82f6',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#1f2937',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    {historyStaffDropdownOpen && filteredHistoryStaff.length > 0 && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                        background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', maxHeight: '150px', overflow: 'auto', marginTop: '4px',
                      }}>
                        {filteredHistoryStaff.map(s => (
                          <div key={s.id} onMouseDown={(e) => {
                            e.preventDefault();
                            handleReassignStaff(order, { name: s.name, id: s.id });
                          }} style={{
                            padding: '6px 10px', cursor: 'pointer', fontSize: '11px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderBottom: '1px solid #f8fafc',
                          }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                          >
                            <span style={{ fontWeight: 500, color: '#1f2937' }}>{s.name}</span>
                            <span style={{ fontSize: '9px', color: '#9ca3af' }}>{s.role}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      setEditingStaffOrderId(order.id);
                      setHistoryStaffQuery('');
                      setDisplayStaffQuery('');
                      setHistoryStaffFetched(false);
                    }}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Click to assign or reassign staff"
                  >
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {order.assignedStaff?.name || <span className="text-gray-400 font-normal">Not assigned</span>}
                    </div>
                    <FaEdit size={10} className="text-gray-400 flex-shrink-0" />
                  </div>
                )}
                {reassigningStaff && editingStaffOrderId === order.id && (
                  <div className="text-[10px] text-blue-500 mt-0.5">Saving...</div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="px-5 py-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{t('orderHistory.items')}</div>
              <div className="space-y-0 divide-y divide-gray-50">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-start justify-between py-2.5">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                        {item.isCustomItem && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                            CUSTOM
                          </span>
                        )}
                        {item.priceEdited && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            PRICE EDITED
                          </span>
                        )}
                      </div>
                      {item.priceEdited && item.menuPrice != null && (
                        <div className="text-[11px] text-amber-600 mt-0.5">
                          Menu: <span className="line-through">{formatCurrency(item.menuPrice)}</span> &rarr; {formatCurrency(item.price)}
                        </div>
                      )}
                      {(item.selectedVariant || item.variant) && (
                        <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                          Variant: {(item.selectedVariant || item.variant)?.name || item.selectedVariant || item.variant}
                        </span>
                      )}
                      {(item.selectedCustomizations?.length > 0 || item.addons?.length > 0) && (
                        <div className="text-[11px] text-gray-400 mt-0.5">+ {(item.selectedCustomizations || item.addons).map(a => a.name).join(', ')}</div>
                      )}
                      {item.notes && (
                        <div className="text-[11px] text-amber-600 mt-0.5 italic">{item.notes}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-gray-400 w-14 text-right">{formatCurrency(item.price)}</span>
                      <span className="text-xs text-gray-400 w-8 text-center">x{item.quantity}</span>
                      <span className="text-sm font-semibold text-gray-900 w-20 text-right">{formatCurrency(item.total || (item.price * item.quantity))}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.notes && (
              <div className="mx-5 mb-4 px-3 py-2.5 bg-amber-50 rounded-lg text-xs text-amber-800">
                <span className="font-semibold">{t('orderHistory.orderNote')}:</span> {order.notes}
              </div>
            )}

            {/* Delivery Info */}
            {(order.deliveryInfo?.personName || order.deliveryInfo?.personPhone || order.deliveryAddress) && (
              <div className="mx-5 mb-4 px-3 py-2.5 bg-blue-50 rounded-lg text-xs text-blue-800">
                <div className="font-semibold mb-1.5 flex items-center gap-1.5">
                  <FaTruck className="text-[10px]" /> Delivery Details
                </div>
                {order.deliveryInfo?.personName && (
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-blue-500">Person:</span> <span className="font-medium">{order.deliveryInfo.personName}</span>
                  </div>
                )}
                {order.deliveryInfo?.personPhone && (
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-blue-500">Phone:</span> <span className="font-medium">{order.deliveryInfo.personPhone}</span>
                  </div>
                )}
                {order.deliveryAddress && (
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-blue-500">Address:</span> <span className="font-medium">{order.deliveryAddress}</span>
                  </div>
                )}
                {order.deliveryInfo?.cashHandedOver && (
                  <div className="mt-1 text-[11px] text-green-700 bg-green-50 px-2 py-0.5 rounded inline-block">Cash handed over</div>
                )}
              </div>
            )}

            {/* Billing breakdown */}
            <div className="mx-5 mb-4 bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{t('orderHistory.subtotal')}</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {/* Offer discount with name */}
                {(order.discountAmount > 0 || order.offerDiscount > 0) && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('orderHistory.offerDiscount')}{(() => {
                      const n = typeof order.appliedOffer === 'string' ? order.appliedOffer : (order.appliedOffer?.name || order.selectedOfferName);
                      return n ? ` (${n})` : '';
                    })()}</span>
                    <span className="font-medium">-{formatCurrency(order.discountAmount || order.offerDiscount)}</span>
                  </div>
                )}
                {/* Manual discount */}
                {order.manualDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('orderHistory.manualDiscount')}{order.manualDiscountType === 'percentage' && order.manualDiscountValue ? ` (${order.manualDiscountValue}%)` : ''}</span>
                    <span className="font-medium">-{formatCurrency(order.manualDiscount)}</span>
                  </div>
                )}
                {/* Loyalty discount */}
                {order.loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-sm" style={{ color: '#b45309' }}>
                    <span>{t('orderHistory.loyaltyRedeem')}{order.redeemLoyaltyPoints ? ` (${order.redeemLoyaltyPoints} pts)` : ''}</span>
                    <span className="font-medium">-{formatCurrency(order.loyaltyDiscount)}</span>
                  </div>
                )}
                {/* Coupon discount */}
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between text-sm text-purple-600">
                    <span>Coupon{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                    <span className="font-medium">-{formatCurrency(order.couponDiscount)}</span>
                  </div>
                )}
                {order.serviceChargeAmount > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t('orderHistory.serviceCharge')} {order.serviceChargeRate ? `(${order.serviceChargeRate}%)` : ''}</span>
                    <span className="font-medium">{formatCurrency(order.serviceChargeAmount)}</span>
                  </div>
                )}
                {/* Per-tax breakdown */}
                {order.taxBreakdown && order.taxBreakdown.length > 0 ? (
                  order.taxBreakdown.map((tax, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-gray-500">
                      <span>{tax.name} ({tax.rate}%){tax.inclusive ? ' (Incl.)' : ''}</span>
                      <span className="font-medium">{formatCurrency(tax.amount || 0)}</span>
                    </div>
                  ))
                ) : breakdown.taxAmount > 0 ? (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t('orderHistory.tax')}</span>
                    <span className="font-medium">{formatCurrency(breakdown.taxAmount)}</span>
                  </div>
                ) : null}
                {order.tipAmount > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t('orderHistory.tip')} {order.tipPercentage ? `(${order.tipPercentage}%)` : ''}</span>
                    <span className="font-medium">{formatCurrency(order.tipAmount)}</span>
                  </div>
                )}
                {order.roundOffAmount != null && order.roundOffAmount !== 0 && (
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{t('orderHistory.roundOff')}</span>
                    <span className="font-medium">{order.roundOffAmount > 0 ? '+' : ''}{formatCurrency(order.roundOffAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 mt-1">
                  <span className="text-base font-bold text-gray-900">{t('orderHistory.total')}</span>
                  <span className="text-base font-bold text-red-600">{formatCurrency(orderTotal)}</span>
                </div>
                {order.taxInclusiveMode === 'inclusive' && (
                  <div className="text-[10px] text-gray-400 text-right mt-0.5">(Tax inclusive pricing)</div>
                )}
                {order.taxInclusiveMode === 'mixed' && (
                  <div className="text-[10px] text-gray-400 text-right mt-0.5">(Mixed tax: some items inclusive)</div>
                )}
              </div>

              {/* Wallet Applied */}
              {order.walletRedeemAmount > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                  <div className="flex justify-between" style={{ color: '#2563eb' }}>
                    <span className="font-medium">{t('orderHistory.walletApplied')}</span>
                    <span className="font-medium">-{formatCurrency(order.walletRedeemAmount)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-bold text-gray-900">{t('orderHistory.amountToPay')}</span>
                    <span className="font-bold text-gray-900">{formatCurrency(Math.max(0, orderTotal - order.walletRedeemAmount))}</span>
                  </div>
                </div>
              )}

              {/* Split payments */}
              {order.splitPayments && order.splitPayments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('orderHistory.splitPayment')}</div>
                  {order.splitPaymentsStale && (
                    <div className="text-[10px] text-amber-600 bg-amber-50 rounded px-2 py-1 mb-1.5">Split amounts don&apos;t match updated total. Please re-split.</div>
                  )}
                  {order.splitPayments.map((sp, i) => (
                    <div key={i} className="flex justify-between text-xs text-gray-500">
                      <span className="capitalize">{sp.method}</span>
                      <span>{formatCurrency(sp.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
              {order.cashReceived > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex justify-between"><span>{t('orderHistory.cashReceived')}</span><span>{formatCurrency(order.cashReceived)}</span></div>
                  {order.changeReturned > 0 && (
                    <div className="flex justify-between text-green-600 mt-0.5"><span>{t('orderHistory.changeReturned')}</span><span>{formatCurrency(order.changeReturned)}</span></div>
                  )}
                </div>
              )}
              {(order.paidAmount > 0 || order.outstandingAmount > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{t('orderHistory.paymentStatus')}</div>
                  {order.paidAmount > 0 && (
                    <div className="flex justify-between text-green-600"><span>{t('orderHistory.paid').replace(':','')}</span><span>{formatCurrency(order.paidAmount)}</span></div>
                  )}
                  {order.outstandingAmount > 0 && (
                    <div className="flex justify-between text-red-600 font-semibold mt-0.5"><span>{t('orderHistory.outstanding')}</span><span>{formatCurrency(order.outstandingAmount)}</span></div>
                  )}
                </div>
              )}

              {/* Comp/Void items */}
              {order.compItems && order.compItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Comp Items</div>
                  {order.compItems.map((ci, i) => (
                    <div key={i} className="flex justify-between text-gray-500">
                      <span>{ci.name || ci.itemName} x{ci.quantity || 1}</span>
                      <span className="text-green-600">{ci.reason || 'Complimentary'}</span>
                    </div>
                  ))}
                </div>
              )}
              {order.voidItems && order.voidItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Void Items</div>
                  {order.voidItems.map((vi, i) => (
                    <div key={i} className="flex justify-between text-gray-500">
                      <span>{vi.name || vi.itemName} x{vi.quantity || 1}</span>
                      <span className="text-red-500">{vi.reason || 'Voided'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="px-5 py-3 border-t border-gray-100 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('orderHistory.close')}
            </button>
            {(order.paymentStatus === 'partial' || order.outstandingAmount > 0) && order.status === 'completed' && (
              <button
                onClick={() => { handleMarkPaid(order.id); onClose(); }}
                className="flex-1 px-4 py-2.5 bg-amber-500 text-white font-medium text-sm rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaWallet /> {t('orderHistory.markAsPaid')}
              </button>
            )}
            {order.status !== 'completed' && !order.orderFlow?.isDirectBilling && (
            <button
              onClick={() => { handleEditOrder(order.id); onClose(); }}
              className="flex-1 px-4 py-2.5 bg-gray-900 text-white font-medium text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              {t('orderHistory.editOrder')}
            </button>
            )}
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
            <p className="text-sm font-medium text-gray-700">{t('orderHistory.loadingOrders')}</p>
            <p className="text-xs text-gray-400 mt-0.5">{t('orderHistory.fetchingData')}</p>
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
    { value: 'refunded', label: 'Refunded' },
    { value: 'deleted', label: t('orderHistory.status.deleted') }
  ];

  const typeOptions = [
    { value: 'all', label: t('orderHistory.type.all') },
    { value: 'dine-in', label: t('orderHistory.type.dineIn') },
    { value: 'takeaway', label: t('orderHistory.type.takeaway') },
    { value: 'delivery', label: t('orderHistory.type.delivery') },
    { value: 'scheduled', label: 'Scheduled' }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: t('orderHistory.allPayments') },
    { value: 'paid', label: t('orderHistory.fullyPaid') },
    { value: 'partial', label: t('orderHistory.partialPayment') },
    { value: 'unpaid', label: t('orderHistory.unpaid') }
  ];

  const partialPaymentEnabled = restaurant?.billingSettings?.partialPaymentEnabled;

  // Refund access: check refundsEnabled + role restriction
  const canRefund = (() => {
    if (restaurant?.billingSettings?.refundsEnabled === false) return false;
    const refundsRoles = restaurant?.billingSettings?.refundsRoles;
    if (!refundsRoles || refundsRoles.length === 0) return true;
    try {
      const userRole = (JSON.parse(localStorage.getItem('user') || '{}').role || 'waiter').toLowerCase();
      return refundsRoles.includes(userRole);
    } catch { return true; }
  })();

  const subRestaurantOptions = [
    { value: 'all', label: 'All Outlets' },
    ...subRestaurants.map(sr => ({ value: sr.id, label: sr.name }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <OfflineBanner />
      {/* Header Section — collapses on scroll for more content space */}
      <div className={`bg-white shadow-sm border-b sticky top-0 z-20 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className={`w-full ${isMobileEmbed ? 'px-3' : 'pl-14 pr-3 sm:px-6 lg:px-8'}`}>
          {isMobileEmbed ? (
          <div className="flex items-center justify-between pt-2 pb-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <FaReceipt className="text-white text-[10px]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-900 truncate">{t('orderHistory.title')}</h1>
                {restaurant?.name && <p className="text-[9px] text-gray-400 truncate">{restaurant.name}</p>}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="flex bg-white border border-gray-200 p-0.5 rounded-md shadow-sm">
                <button
                  onClick={() => setIsCompactView(true)}
                  className={`p-1 rounded transition-all ${isCompactView ? 'bg-red-50 text-red-600' : 'text-gray-400'}`}
                >
                  <FaList size={10} />
                </button>
                <button
                  onClick={() => setIsCompactView(false)}
                  className={`p-1 rounded transition-all ${!isCompactView ? 'bg-red-50 text-red-600' : 'text-gray-400'}`}
                >
                  <FaTh size={10} />
                </button>
              </div>
            </div>
          </div>
          ) : (
          <div className={`flex flex-row items-center justify-between gap-2 sm:gap-4 transition-all duration-300 ${isScrolled ? 'py-1.5 sm:py-2' : 'py-2 sm:py-4'}`}>
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <div className={`bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg flex-shrink-0 flex items-center justify-center transition-all duration-300 ${isScrolled || isMobile ? 'w-7 h-7' : 'p-2 sm:p-3 sm:rounded-xl'}`}>
                <FaReceipt className={`text-white transition-all duration-300 ${isScrolled || isMobile ? 'text-xs' : 'text-base sm:text-xl'}`} />
              </div>
              <div className="min-w-0">
                <h1 className={`font-bold text-gray-900 truncate transition-all duration-300 ${isScrolled || isMobile ? 'text-sm sm:text-base' : 'text-lg sm:text-2xl'}`}>{t('orderHistory.title')}</h1>
                <p className={`text-xs sm:text-sm text-gray-500 mt-0.5 hidden sm:block transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0 mt-0' : 'max-h-6 opacity-100'}`}>{restaurant?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {/* Mobile: filter toggle + order count */}
              {isMobile && activeView === 'orders' && (
                <>
                  <span className="text-[10px] text-gray-500 font-medium">{totalOrders}</span>
                  <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className={`relative p-1.5 rounded-lg border transition-all ${mobileFiltersOpen || hasActiveFilters ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-200 text-gray-500'}`}
                  >
                    <FaFilter className="text-xs" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
                    )}
                  </button>
                </>
              )}
              <div className={`hidden sm:flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg transition-all duration-300 ${isScrolled ? 'px-2 py-1 text-xs' : 'px-3 py-1.5'}`}>
                <span className="font-medium">{totalOrders}</span>
                <span className="text-gray-400">{t('orderHistory.orders')}</span>
              </div>
              <div className="flex bg-white border border-gray-200 p-0.5 sm:p-1 rounded-lg shadow-sm" title={isCompactView ? t('orderHistory.compactView') : t('orderHistory.detailedView')}>
                <button
                  onClick={() => setIsCompactView(true)}
                  className={`p-1.5 sm:p-2 rounded-md transition-all ${isCompactView ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title={t('orderHistory.compactView')}
                >
                  <FaList size={isMobile ? 12 : 14} className="sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setIsCompactView(false)}
                  className={`p-1.5 sm:p-2 rounded-md transition-all ${!isCompactView ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  title={t('orderHistory.detailedView')}
                >
                  <FaTh size={isMobile ? 12 : 14} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
          )}

          {/* View Tabs: Orders | Summary — compact on scroll */}
          <div className={`flex items-center gap-1 border-b border-gray-100 transition-all duration-300 ${isMobileEmbed ? 'pt-2 pb-1.5' : ''} ${isScrolled || isMobile ? 'pb-1.5' : 'pb-2 sm:pb-3'}`}>
            <button
              onClick={() => switchView('orders')}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg font-medium transition-all duration-300 ${
                isScrolled || isMobile ? 'px-2 sm:px-3 py-1 text-[11px] sm:text-xs' : 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm'
              } ${
                activeView === 'orders'
                  ? 'bg-red-600 text-white shadow-md shadow-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaClipboardList className="text-xs" />
              {t('orderHistory.orders')}
            </button>
            <button
              onClick={() => switchView('scheduled')}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg font-medium transition-all duration-300 ${
                isScrolled || isMobile ? 'px-2 sm:px-3 py-1 text-[11px] sm:text-xs' : 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm'
              } ${
                activeView === 'scheduled'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaCalendarAlt className="text-xs" />
              Scheduled
            </button>
            <button
              onClick={() => switchView('summary')}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg font-medium transition-all duration-300 ${
                isScrolled || isMobile ? 'px-2 sm:px-3 py-1 text-[11px] sm:text-xs' : 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm'
              } ${
                activeView === 'summary'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaChartPie className="text-xs" />
              {isMobile || isMobileEmbed ? 'Summary' : t('orderHistory.salesSummary')}
            </button>
            <button
              onClick={() => switchView('bookings')}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg font-medium transition-all duration-300 ${
                isScrolled || isMobile ? 'px-2 sm:px-3 py-1 text-[11px] sm:text-xs' : 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm'
              } ${
                activeView === 'bookings'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaCalendarCheck className="text-xs" />
              Bookings
            </button>
            {/* Mobile embed: filter button + order count on the right */}
            {isMobileEmbed && activeView === 'orders' && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-gray-500 font-medium">{totalOrders} orders</span>
                <button
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className={`relative p-1.5 rounded-lg border transition-all ${mobileFiltersOpen || hasActiveFilters ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                >
                  <FaFilter className="text-sm" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Summary Stats — only in orders view; full cards or compact inline strip based on scroll */}
          {activeView === 'orders' && (<>
          {/* Expanded stat cards — hidden when scrolled, on mobile embed, or on mobile screens */}
          <div style={{ willChange: 'max-height, opacity' }} className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 ease-in-out ${isScrolled || isMobileEmbed || isMobile ? 'max-h-0 opacity-0 pb-0' : 'max-h-40 opacity-100 pb-2 sm:pb-3'}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-3">
              {/* Revenue */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                  <div className="bg-green-500 w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-bold leading-none">{getCurrencySymbol()}</span>
                  </div>
                  <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wide">{t('orderHistory.revenue')}</span>
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">{formatCurrency(stats.totalRevenue)}</div>
                {stats.totalRevenueWithTax > stats.totalRevenue && (
                  <div className="text-[10px] sm:text-[12px] text-green-700/70 mt-0.5 leading-tight">{t('orderHistory.inclTax')} {formatCurrency(stats.totalRevenueWithTax)}</div>
                )}
              </div>
              {/* Orders */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                  <div className="bg-blue-500 w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center">
                    <FaShoppingBag className="text-white text-xs sm:text-sm" />
                  </div>
                  <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wide">{t('orderHistory.orders')}</span>
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">{stats.orderCount}</div>
              </div>
              {/* Payment Breakdown */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-1 sm:mb-1.5">
                  <div className="bg-purple-500 w-6 h-6 sm:w-8 sm:h-8 rounded-md flex items-center justify-center">
                    <FaCreditCard className="text-white text-xs sm:text-sm" />
                  </div>
                  <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wide">{t('orderHistory.payments')}</span>
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
                  <span className="text-[9px] sm:text-[11px] text-gray-500 font-medium uppercase tracking-wide">{t('orderHistory.completed')}</span>
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">{stats.completedCount}</div>
              </div>
            </div>
          </div>

          {/* Compact inline stat strip — visible when scrolled, on mobile embed, or mobile screens */}
          <div style={{ willChange: 'max-height, opacity' }} className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isScrolled || isMobileEmbed || isMobile ? 'max-h-12 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className={`flex items-center gap-3 sm:gap-5 text-xs overflow-x-auto scrollbar-hide ${isMobileEmbed ? 'py-1.5 gap-2' : 'py-1.5'}`} style={isMobileEmbed ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}>
              <div className={`flex items-center gap-1.5 ${isMobileEmbed ? 'bg-green-50 rounded-full px-2 py-0.5 flex-shrink-0' : ''}`}>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-gray-500">{t('orderHistory.revenue')}</span>
                <span className="font-bold text-gray-900">{formatCurrency(stats.totalRevenueWithTax || stats.totalRevenue)}</span>
              </div>
              {!isMobileEmbed && <div className="w-px h-3.5 bg-gray-200" />}
              <div className={`flex items-center gap-1.5 ${isMobileEmbed ? 'bg-blue-50 rounded-full px-2 py-0.5 flex-shrink-0' : ''}`}>
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-bold text-gray-900">{stats.orderCount}</span>
                <span className="text-gray-500">{t('orderHistory.orders')}</span>
              </div>
              {!isMobileEmbed && <div className="w-px h-3.5 bg-gray-200" />}
              {stats.paymentBreakdown && Object.keys(stats.paymentBreakdown).length > 0 && (
                <>
                  {Object.entries(stats.paymentBreakdown)
                    .sort((a, b) => b[1].total - a[1].total)
                    .slice(0, isMobileEmbed ? 3 : 2)
                    .map(([method, data]) => (
                      <div key={method} className={`flex items-center gap-1.5 ${isMobileEmbed ? 'bg-gray-50 rounded-full px-2 py-0.5 flex-shrink-0' : ''}`}>
                        <span className="text-gray-500 capitalize">{method}</span>
                        <span className="font-bold text-gray-900">{formatCurrency(data.total)}</span>
                      </div>
                    ))}
                  {!isMobileEmbed && <div className="w-px h-3.5 bg-gray-200" />}
                </>
              )}
              <div className={`flex items-center gap-1.5 ${isMobileEmbed ? 'bg-amber-50 rounded-full px-2 py-0.5 flex-shrink-0' : ''}`}>
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-bold text-gray-900">{stats.completedCount}</span>
                <span className="text-gray-500">{t('orderHistory.completed')}</span>
              </div>
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
                aria-label={t('orderHistory.dismiss')}
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
                aria-label={t('orderHistory.dismiss')}
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          )}

          </>)}

          {/* ========== SUMMARY VIEW — Period Tabs + Filters ========== */}
          {activeView === 'summary' && (
            <div className="py-2 sm:py-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {summaryPeriods.map(p => (
                  <button
                    key={p.key}
                    onClick={() => handleSummaryPeriodChange(p.key)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      summaryPeriod === p.key
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {summaryPeriod === 'custom' && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <input type="date" value={summaryCustomStart} onChange={e => setSummaryCustomStart(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" />
                  <span className="text-gray-400 text-sm">{t('orderHistory.to')}</span>
                  <input type="date" value={summaryCustomEnd} onChange={e => setSummaryCustomEnd(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" />
                  <button onClick={handleSummaryCustomApply} disabled={!summaryCustomStart || !summaryCustomEnd}
                    className="bg-rose-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50">
                    {t('orderHistory.apply')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========== SCHEDULED VIEW — Filter Chips + View Toggle ========== */}
          {activeView === 'scheduled' && (
            <div className="py-2 sm:py-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Date filter chips */}
                {[
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'today', label: 'Today' },
                  { value: 'thisWeek', label: 'This Week' },
                  { value: 'thisMonth', label: 'This Month' },
                  { value: 'all', label: 'All' },
                  { value: 'past', label: 'Past' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setScheduledDateFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      scheduledDateFilter === opt.value
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                {/* Separator */}
                <div className="hidden sm:block w-px h-5 bg-gray-200 mx-1" />
                {/* View mode toggle */}
                <div className="flex bg-white border border-gray-200 p-0.5 rounded-lg shadow-sm ml-auto">
                  <button
                    onClick={() => setScheduledViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${scheduledViewMode === 'list' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="List View"
                  >
                    <FaList size={12} />
                  </button>
                  <button
                    onClick={() => setScheduledViewMode('calendar')}
                    className={`p-1.5 rounded-md transition-all ${scheduledViewMode === 'calendar' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    title="Calendar View"
                  >
                    <FaCalendarAlt size={12} />
                  </button>
                </div>
                {/* Refresh */}
                <button
                  onClick={fetchScheduledOrders}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 transition-all"
                  title="Refresh"
                >
                  <FaSync size={12} />
                </button>
              </div>
            </div>
          )}

          {/* Mobile: slide-down filter panel (for mobile embed and mobile screens) */}
          {(isMobileEmbed || isMobile) && activeView === 'orders' && mobileFiltersOpen && (
          <div className="py-2 border-t border-gray-200 bg-gray-50 animate-in slide-in-from-top duration-200">
            <div className="flex flex-wrap gap-1.5 items-center px-1">
              <div className="relative min-w-0 w-full shrink-0 mb-1">
                <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder={t('orderHistory.search')}
                  value={displaySearchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDisplaySearchTerm(val);
                    clearTimeout(searchDebounceRef.current);
                    searchDebounceRef.current = setTimeout(() => setSearchTerm(val), 300);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      clearTimeout(searchDebounceRef.current);
                      setSearchTerm(displaySearchTerm);
                      handleSearch(e);
                    }
                  }}
                  className="w-full pl-8 pr-2 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-all placeholder:text-gray-400"
                />
              </div>
              <FilterDropdown
                isOpen={statusDropdownOpen}
                onToggle={() => { setStatusDropdownOpen(!statusDropdownOpen); setTypeDropdownOpen(false); setPaymentStatusDropdownOpen(false); setSubRestaurantDropdownOpen(false); }}
                selectedValue={selectedStatus}
                options={statusOptions}
                onSelect={setSelectedStatus}
                placeholder={t('orderHistory.status.all')}
                icon={FaFilter}
              />
              <FilterDropdown
                isOpen={typeDropdownOpen}
                onToggle={() => { setTypeDropdownOpen(!typeDropdownOpen); setStatusDropdownOpen(false); setPaymentStatusDropdownOpen(false); setSubRestaurantDropdownOpen(false); }}
                selectedValue={selectedOrderType}
                options={typeOptions}
                onSelect={setSelectedOrderType}
                placeholder={t('orderHistory.type.all')}
                icon={FaUtensils}
              />
              {subRestaurants.length > 0 && (
                <FilterDropdown
                  isOpen={subRestaurantDropdownOpen}
                  onToggle={() => { setSubRestaurantDropdownOpen(!subRestaurantDropdownOpen); setStatusDropdownOpen(false); setTypeDropdownOpen(false); setPaymentStatusDropdownOpen(false); }}
                  selectedValue={filterSubRestaurant}
                  options={subRestaurantOptions}
                  onSelect={setFilterSubRestaurant}
                  placeholder="All Outlets"
                  icon={FaStore}
                />
              )}
              {partialPaymentEnabled && (
                <button
                  onClick={() => setSelectedPaymentStatus(selectedPaymentStatus === 'partial' ? 'all' : 'partial')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedPaymentStatus === 'partial'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-100'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaWallet className="text-[10px]" />
                  {t('orderHistory.partialPayment')}
                </button>
              )}
              {/* Date quick-filter chips */}
              <div className="flex flex-wrap gap-1 w-full mt-1">
                {[
                  { value: 'today', label: t('orderHistory.today') },
                  { value: 'yesterday', label: t('orderHistory.yesterday') },
                  { value: 'last7days', label: t('orderHistory.sevenDays') },
                  { value: 'last30days', label: t('orderHistory.thirtyDays') },
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
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFilterModalOpen(true); }}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${dateFilterMode === 'custom' ? 'bg-red-50 border-red-300 text-red-600' : 'bg-white border-gray-200 text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-500'}`}
                  title={t('orderHistory.customDateRange')}
                >
                  <FaCalendarAlt className="text-sm" />
                </button>
              </div>
              {hasActiveFilters && (
                <button type="button" onClick={() => { resetAllFilters(); setMobileFiltersOpen(false); }} className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 shrink-0 transition-all mt-1">
                  <FaTimes className="text-[10px]" /> {t('orderHistory.clear')}
                </button>
              )}
            </div>
          </div>
          )}

          {/* Filters — All in one line (orders view only, hidden on mobile embed and mobile screens) */}
          {activeView === 'orders' && !isMobileEmbed && !isMobile && (
          <div className="py-2 sm:py-2.5 border-t border-gray-200">
            <div className="flex flex-wrap gap-1.5 items-center">
              <div className="relative min-w-0 w-36 sm:w-44 shrink-0">
                <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
                <input
                  type="text"
                  placeholder={t('orderHistory.search')}
                  value={displaySearchTerm}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDisplaySearchTerm(val);
                    clearTimeout(searchDebounceRef.current);
                    searchDebounceRef.current = setTimeout(() => setSearchTerm(val), 300);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      clearTimeout(searchDebounceRef.current);
                      setSearchTerm(displaySearchTerm);
                      handleSearch(e);
                    }
                  }}
                  className="w-full pl-8 pr-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400 focus:border-red-400 transition-all placeholder:text-gray-400"
                />
              </div>
              <FilterDropdown
                isOpen={statusDropdownOpen}
                onToggle={() => { setStatusDropdownOpen(!statusDropdownOpen); setTypeDropdownOpen(false); setPaymentStatusDropdownOpen(false); setSubRestaurantDropdownOpen(false); }}
                selectedValue={selectedStatus}
                options={statusOptions}
                onSelect={setSelectedStatus}
                placeholder={t('orderHistory.status.all')}
                icon={FaFilter}
              />
              <FilterDropdown
                isOpen={typeDropdownOpen}
                onToggle={() => { setTypeDropdownOpen(!typeDropdownOpen); setStatusDropdownOpen(false); setPaymentStatusDropdownOpen(false); setSubRestaurantDropdownOpen(false); }}
                selectedValue={selectedOrderType}
                options={typeOptions}
                onSelect={setSelectedOrderType}
                placeholder={t('orderHistory.type.all')}
                icon={FaUtensils}
              />
              {subRestaurants.length > 0 && (
                <FilterDropdown
                  isOpen={subRestaurantDropdownOpen}
                  onToggle={() => { setSubRestaurantDropdownOpen(!subRestaurantDropdownOpen); setStatusDropdownOpen(false); setTypeDropdownOpen(false); setPaymentStatusDropdownOpen(false); }}
                  selectedValue={filterSubRestaurant}
                  options={subRestaurantOptions}
                  onSelect={setFilterSubRestaurant}
                  placeholder="All Outlets"
                  icon={FaStore}
                />
              )}
              {partialPaymentEnabled && (
                <button
                  onClick={() => setSelectedPaymentStatus(selectedPaymentStatus === 'partial' ? 'all' : 'partial')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedPaymentStatus === 'partial'
                      ? 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-100'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FaWallet className="text-[10px]" />
                  {t('orderHistory.partialPayment')}
                </button>
              )}
              {/* Separator */}
              <div className="hidden sm:block w-px h-5 bg-gray-200" />
              {/* Date quick-filter chips */}
              {[
                { value: 'today', label: t('orderHistory.today') },
                { value: 'yesterday', label: t('orderHistory.yesterday') },
                { value: 'last7days', label: t('orderHistory.sevenDays') },
                { value: 'last30days', label: t('orderHistory.thirtyDays') },
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
                title={t('orderHistory.customDateRange')}
              >
                <FaCalendarAlt className="text-sm" />
              </button>
              {/* Separator */}
              <div className="hidden sm:block w-px h-5 bg-gray-200" />
              <label className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs font-medium whitespace-nowrap shrink-0 border ${myOrdersOnly ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
                <input type="checkbox" checked={myOrdersOnly} onChange={(e) => setMyOrdersOnly(e.target.checked)} className="w-3 h-3 text-red-600 rounded focus:ring-red-500 border-gray-300" />
                {t('orderHistory.mine')}
              </label>
              {hasActiveFilters && (
                <button type="button" onClick={resetAllFilters} className="flex items-center gap-1 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 shrink-0 transition-all" title="Reset all filters">
                  <FaTimes className="text-[10px]" /> <span className="hidden sm:inline">{t('orderHistory.clear')}</span>
                </button>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* ========== ORDERS VIEW CONTENT ========== */}
      {activeView === 'orders' && (<>
      {/* Loading indicator bar — shows during filter changes / data fetch */}
      {(loading || backgroundLoading) && orders.length > 0 && (
        <div className="relative w-full h-1 bg-gray-100 overflow-hidden z-10">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 via-orange-400 to-red-500 rounded-full" style={{ width: '40%', animation: 'loadingSlide 1.2s ease-in-out infinite' }} />
          <style>{`@keyframes loadingSlide { 0% { left: -40%; } 100% { left: 100%; } }`}</style>
        </div>
      )}

      {/* Orders List */}
      <div className={`flex-1 ${isMobileEmbed ? 'p-2' : 'p-3 sm:px-6 sm:py-4'} overflow-y-auto relative`}>
        {/* Overlay removed — thin loading bar at top is sufficient */}
        <div className={`w-full ${isMobileEmbed ? 'px-1' : 'px-3 sm:px-6 lg:px-8'}`}>
          {!loading && orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaSearch className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orderHistory.noOrders')}</h3>
              <p className="text-sm text-gray-500">{t('orderHistory.adjustFilters')}</p>
            </div>
          ) : isCompactView ? (
            /* ═══════════════════════════════════════════════════════ */
            /* TABLE VIEW — proper data table with expandable rows    */
            /* ═══════════════════════════════════════════════════════ */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                      <th className="w-8 px-2 py-3"></th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Table</th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="px-3 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedOrders.map((order) => {
                      const statusStyle = getStatusStyle(order.status, order.orderFlow, order.lastStatus, order);
                      const breakdown = getOrderBreakdown(order);
                      const itemCount = Array.isArray(order.items) ? order.items.length : 0;
                      const sourceChip = getOrderSourceChip(order);
                      const isExpanded = expandedOrders.has(order.id);
                      const tableOrRoom = order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber || order.customerDisplay?.tableNumber || order.tableNumber || '—';
                      const isRoom = !!(order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber);

                      return (
                        <React.Fragment key={order.id}>
                          {/* Main row */}
                          <tr
                            className={`border-b border-gray-100 transition-colors cursor-pointer group ${isExpanded ? 'bg-red-50/40' : 'hover:bg-gray-50'}`}
                            onClick={() => toggleOrderExpansion(order.id)}
                          >
                            {/* Expand arrow */}
                            <td className="px-2 py-2.5 text-center">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${isExpanded ? 'bg-red-100 text-red-600 rotate-180' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                <FaChevronDown size={10} />
                              </div>
                            </td>
                            {/* Order # */}
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900 text-sm">#{order.dailyOrderId || order.orderNumber || order.id.slice(-4).toUpperCase()}</span>
                                {order.syncSource === 'offline' && <FaCloudUploadAlt className="text-blue-400 text-[10px]" title={t('orderHistory.syncedFromOffline')} />}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[80px]" title={order.id}>{order.id.slice(0, 8)}...</div>
                            </td>
                            {/* Time */}
                            <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                              {formatDate(order.createdAt, true)}
                            </td>
                            {/* Customer */}
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-500">
                                  {(order.customerDisplay?.name || 'W')[0].toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{order.customerDisplay?.name || t('orderHistory.walkIn')}</div>
                                  {(order.customerDisplay?.phone || order.customerInfo?.phone) && (
                                    <div className="text-[10px] text-gray-400 truncate">{order.customerDisplay?.phone || order.customerInfo?.phone}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            {/* Table/Room */}
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                {isRoom ? <FaBed size={10} className="text-gray-400" /> : <FaTable size={10} className="text-gray-400" />}
                                <span>{tableOrRoom}</span>
                              </div>
                            </td>
                            {/* Type */}
                            <td className="px-3 py-2.5">
                              <span className="text-xs text-gray-600 capitalize">{order.orderType?.replace('-', ' ') || t('orderHistory.type.dineIn')}</span>
                            </td>
                            {/* Status */}
                            <td className="px-3 py-2.5">
                              <div className="flex flex-col gap-1">
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide w-fit"
                                  style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}` }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusStyle.text, opacity: 0.6 }} />
                                  {statusStyle.label}
                                </span>
                                {sourceChip && (
                                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-medium border w-fit ${sourceChip.className}`}>
                                    {sourceChip.label}
                                  </span>
                                )}
                                {order.assignedStaff?.name && (
                                  <span style={{ display: 'inline-flex', padding: '1px 5px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '4px', fontSize: '9px', fontWeight: '600', border: '1px solid #bbf7d0', width: 'fit-content' }}>
                                    Staff: {order.assignedStaff.name}
                                  </span>
                                )}
                                {order.subRestaurantName && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '1px 5px', backgroundColor: '#fff7ed', color: '#9a3412', borderRadius: '4px', fontSize: '9px', fontWeight: '600', border: '1px solid #fed7aa', width: 'fit-content' }}>
                                    <FaStore size={7} /> {order.subRestaurantName}
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Payment */}
                            <td className="px-3 py-2.5">
                              <span className="text-xs text-gray-600 capitalize">{order.paymentMethod || t('orderHistory.cash')}</span>
                              {order.outstandingAmount > 0 && (
                                <div className="mt-0.5">
                                  <span className="text-[9px] font-semibold text-white bg-red-500 px-1.5 py-0.5 rounded-full">{t('orderHistory.partial')}</span>
                                </div>
                              )}
                            </td>
                            {/* Amount */}
                            <td className="px-3 py-2.5 text-right">
                              <div className="font-bold text-gray-900">{formatCurrency(breakdown.total)}</div>
                              {breakdown.discountAmount > 0 && (
                                <div className="text-[10px] text-green-600">-{formatCurrency(breakdown.discountAmount)}</div>
                              )}
                              {breakdown.taxAmount > 0 && (
                                <div className="text-[10px] text-gray-400">+tax {formatCurrency(breakdown.taxAmount)}</div>
                              )}
                            </td>
                            {/* Actions */}
                            <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-1">
                                {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'deleted' && order.status !== 'refunded' && (
                                  <button
                                    onClick={() => handleMarkCompleted(order.id)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors"
                                    title={t('orderHistory.markBillComplete')}
                                  >
                                    <FaCheckCircle size={11} />
                                  </button>
                                )}
                                {(order.paymentStatus === 'partial' || order.outstandingAmount > 0) && order.status === 'completed' && (
                                  <button
                                    onClick={() => handleMarkPaid(order.id)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                                    title={t('orderHistory.markAsFullyPaid')}
                                  >
                                    <FaWallet size={11} />
                                  </button>
                                )}
                                <div style={{ position: 'relative' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPrintDropdownOrderId(prev => prev === order.id ? null : order.id);
                                    }}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-colors ${printingOrderId === order.id ? 'bg-orange-200 border-orange-300 cursor-wait' : 'text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-200'}`}
                                    title="Print"
                                    disabled={printingOrderId === order.id}
                                  >
                                    {printingOrderId === order.id ? <FaSpinner size={11} className="animate-spin" /> : <FaPrint size={11} />}
                                  </button>
                                  {printDropdownOrderId === order.id && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        right: 0,
                                        marginBottom: '4px',
                                        background: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                        zIndex: 50,
                                        minWidth: '130px',
                                        overflow: 'hidden',
                                      }}
                                    >
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handlePrintBill(order); }}
                                        style={{
                                          width: '100%',
                                          padding: '8px 12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          fontSize: '12px',
                                          fontWeight: 500,
                                          color: '#374151',
                                          background: 'transparent',
                                          border: 'none',
                                          borderBottom: '1px solid #f3f4f6',
                                          cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                      >
                                        <FaReceipt size={10} style={{ color: '#10b981' }} /> Print Bill
                                      </button>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handlePrintKOT(order); }}
                                        style={{
                                          width: '100%',
                                          padding: '8px 12px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          fontSize: '12px',
                                          fontWeight: 500,
                                          color: '#374151',
                                          background: 'transparent',
                                          border: 'none',
                                          cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                      >
                                        <FaUtensils size={10} style={{ color: '#f59e0b' }} /> Print KOT
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleViewOrder(order)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                                  title={t('orderHistory.view')}
                                >
                                  <FaEye size={11} />
                                </button>
                                {order.status !== 'deleted' && order.status !== 'completed' && !order.orderFlow?.isDirectBilling && (
                                  <button
                                    onClick={() => handleEditOrder(order.id)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white bg-red-500 hover:bg-red-600 border border-red-500 transition-colors"
                                    title="Update Order"
                                  >
                                    <FaEdit size={10} />
                                  </button>
                                )}
                                {canEditCompletedOrders && order.status === 'completed' && (
                                  <>
                                    <button
                                      onClick={() => handleOpenEditCompleted(order)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white bg-gray-500 hover:bg-gray-600 border border-gray-500 transition-colors"
                                      title="Edit Details"
                                    >
                                      <FaEdit size={10} />
                                    </button>
                                    <button
                                      onClick={() => handleEditItemsClick(order)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white bg-red-600 hover:bg-red-700 border border-red-600 transition-colors"
                                      title="Edit Items"
                                    >
                                      <FaUtensils size={10} />
                                    </button>
                                  </>
                                )}
                                {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'deleted' && order.status !== 'refunded' && (
                                  <button
                                    onClick={() => handleCancelOrder(order.id)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                    title={t('orderHistory.cancel')}
                                  >
                                    <FaTimesCircle size={11} />
                                  </button>
                                )}
                                {order.status === 'completed' && !order.refundedAt && canRefund && (
                                  <button
                                    onClick={() => handleOpenRefund(order)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors"
                                    title="Refund"
                                  >
                                    <FaUndoAlt size={10} />
                                  </button>
                                )}
                                {allowOrderDelete && order.status !== 'deleted' && (
                                  <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                    title="Delete Order"
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded detail row */}
                          {isExpanded && (
                            <tr className="bg-gradient-to-r from-gray-50/80 to-white">
                              <td colSpan={10} className="px-4 py-3 border-b border-gray-200">
                                <div className="flex gap-6 flex-wrap">
                                  {/* Items list */}
                                  <div className="flex-1 min-w-[250px]">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{itemCount} {t('orderHistory.items')}</div>
                                    <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-3 py-1.5 text-left text-[10px] font-semibold text-gray-400 uppercase">Item</th>
                                            <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-gray-400 uppercase w-16">Unit</th>
                                            <th className="px-3 py-1.5 text-center text-[10px] font-semibold text-gray-400 uppercase w-12">Qty</th>
                                            <th className="px-3 py-1.5 text-right text-[10px] font-semibold text-gray-400 uppercase w-20">Total</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {order.items?.map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-50 last:border-0">
                                              <td className="px-3 py-1.5 text-gray-700">
                                                {item.name}
                                                {item.isCustomItem && (
                                                  <span className="ml-1 text-[8px] font-bold text-purple-600">CUSTOM</span>
                                                )}
                                                {item.priceEdited && (
                                                  <span className="ml-1 text-[8px] font-bold text-amber-600">EDITED</span>
                                                )}
                                                {item.notes && <div className="text-[10px] text-amber-600 italic mt-0.5">{item.notes}</div>}
                                                {item.priceEdited && item.menuPrice != null && (
                                                  <div className="text-[9px] text-amber-500">{formatCurrency(item.menuPrice)} &rarr; {formatCurrency(item.price)}</div>
                                                )}
                                              </td>
                                              <td className="px-3 py-1.5 text-right text-gray-500">{formatCurrency(item.price)}</td>
                                              <td className="px-3 py-1.5 text-center text-gray-600">{item.quantity}</td>
                                              <td className="px-3 py-1.5 text-right font-medium text-gray-900">{formatCurrency(item.total || (item.price * item.quantity))}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                    {order.specialInstructions && (
                                      <div className="mt-2 flex items-start gap-1.5 text-xs bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                                        <span className="text-amber-600 font-semibold flex-shrink-0">{t('orderHistory.instructions')}</span>
                                        <span className="text-gray-700">{order.specialInstructions}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Billing breakdown + IDs */}
                                  <div className="w-[220px] flex-shrink-0">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Breakdown</div>
                                    <div className="bg-white rounded-lg border border-gray-100 p-3 space-y-1.5 text-xs">
                                      <div className="flex justify-between text-gray-600">
                                        <span>{t('orderHistory.subtotalLabel')}</span>
                                        <span>{formatCurrency(breakdown.subtotal)}</span>
                                      </div>
                                      {breakdown.discountLines?.map((line, i) => (
                                        <div key={`d${i}`} className="flex justify-between text-green-600">
                                          <span>-{line.name}</span>
                                          <span>{formatCurrency(line.amount)}</span>
                                        </div>
                                      ))}
                                      {breakdown.serviceCharge > 0 && (
                                        <div className="flex justify-between text-purple-600">
                                          <span>{t('orderHistory.serviceCharge')}</span>
                                          <span>{formatCurrency(breakdown.serviceCharge)}</span>
                                        </div>
                                      )}
                                      {breakdown.taxLines?.map((line, i) => (
                                        <div key={i} className="flex justify-between text-gray-500">
                                          <span>{line.name}{line.rate != null ? ` (${line.rate}%)` : ''}</span>
                                          <span>{formatCurrency(line.amount)}</span>
                                        </div>
                                      ))}
                                      {breakdown.tip > 0 && (
                                        <div className="flex justify-between text-amber-600">
                                          <span>{t('orderHistory.tip')}</span>
                                          <span>{formatCurrency(breakdown.tip)}</span>
                                        </div>
                                      )}
                                      {breakdown.roundOff !== 0 && (
                                        <div className="flex justify-between text-gray-400">
                                          <span>{t('orderHistory.roundOff')}</span>
                                          <span>{breakdown.roundOff > 0 ? '+' : ''}{formatCurrency(breakdown.roundOff)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between pt-1.5 mt-1 border-t border-dashed border-gray-200 font-bold text-gray-900 text-sm">
                                        <span>Total</span>
                                        <span>{formatCurrency(breakdown.total)}</span>
                                      </div>
                                      {order.outstandingAmount > 0 && (
                                        <div className="flex justify-between text-red-600 font-semibold">
                                          <span>{t('orderHistory.due')}</span>
                                          <span>{formatCurrency(order.outstandingAmount)}</span>
                                        </div>
                                      )}
                                    </div>
                                    {/* Order IDs */}
                                    <div className="mt-2 space-y-1">
                                      <div
                                        onClick={() => copyToClipboard(String(order.dailyOrderId ?? order.orderNumber ?? order.id))}
                                        className="flex items-center gap-1.5 text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                                        title={t('orderHistory.clickToCopyOrderNumber')}
                                      >
                                        <span>{t('orderHistory.orderNumberShort')}</span>
                                        <span className="font-mono font-semibold text-gray-600">#{order.dailyOrderId ?? order.orderNumber ?? '—'}</span>
                                        <FaCopy size={8} className="text-gray-300" />
                                      </div>
                                      <div
                                        onClick={() => copyToClipboard(order.id)}
                                        className="flex items-center gap-1.5 text-[10px] text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                                        title={t('orderHistory.clickToCopyOrderId')}
                                      >
                                        <span>{t('orderHistory.idLabel')}</span>
                                        <span className="font-mono font-semibold text-gray-600 truncate max-w-[120px]">{order.id}</span>
                                        <FaCopy size={8} className="text-gray-300" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
            {displayedOrders.map((order) => {
              const statusStyle = getStatusStyle(order.status, order.orderFlow, order.lastStatus, order);
              const orderTotal = calculateOrderTotal(order);
              const breakdown = getOrderBreakdown(order);
              const itemCount = Array.isArray(order.items) ? order.items.length : 0;
              const sourceChip = getOrderSourceChip(order);

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-red-300 hover:shadow-md transition-all duration-200 group overflow-hidden">
                  <div className={isMobile ? 'p-2' : 'p-4'}>
                    <div className={`flex items-start ${isMobile ? 'gap-2' : 'gap-3'}`}>
                      {!isMobile && (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center flex-shrink-0">
                        <FaReceipt className="text-red-600 text-sm" />
                      </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {/* Header: Order number + status + amount — single row on mobile */}
                        <div className={`flex items-center justify-between ${isMobile ? 'mb-1' : 'mb-1.5 sm:mb-2'}`}>
                          <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-2'} min-w-0 flex-wrap`}>
                            <h3 className={`${isMobile ? 'text-[13px]' : 'text-base'} font-bold text-gray-900 flex items-center gap-1`}>
                              #{order.dailyOrderId || order.orderNumber || order.id.slice(-4).toUpperCase()}
                              {order.syncSource === 'offline' && <FaCloudUploadAlt className="text-blue-400 text-xs" title={t('orderHistory.syncedFromOffline')} />}
                            </h3>
                            <span
                              className={`inline-flex ${isMobile ? 'px-1.5 py-px text-[9px] border' : 'px-3 py-1 text-xs border-2'} rounded-full font-semibold uppercase tracking-wide`}
                              style={{ backgroundColor: statusStyle.bg, color: statusStyle.text, borderColor: statusStyle.border }}
                            >
                              {statusStyle.label}
                            </span>
                            {isMobile && (
                              <span className={`text-[10px] text-gray-400 flex items-center gap-0.5`}>
                                <FaClock className="text-[8px]" />
                                {formatDate(order.createdAt, true)}
                              </span>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className={`${isMobile ? 'text-[15px]' : 'text-xl'} font-bold text-gray-900`}>{formatCurrency(breakdown.total)}</span>
                            <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} text-gray-400 ml-1`}>{order.paymentMethod || t('orderHistory.cash')}</span>
                          </div>
                        </div>

                        {/* Time — desktop only (mobile shows inline above) */}
                        {!isMobile && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <FaClock className="text-[10px]" />
                            {formatDate(order.createdAt, true)}
                          </div>
                        )}

                        {/* Tags row — source, staff, sub-restaurant, scheduled (compact on mobile) */}
                        {(sourceChip || order.assignedStaff?.name || order.subRestaurantName || (order.isScheduled && order.scheduledFor) || order.syncSource === 'offline' || (order._isOffline && (order.syncStatus === 'failed' || order.syncStatus === 'pending'))) && (
                          <div className={`flex flex-wrap items-center ${isMobile ? 'gap-1 mb-1' : 'gap-1.5 mb-1.5'}`}>
                            {sourceChip && (
                              <span className={`inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${sourceChip.className}`}>
                                {sourceChip.label}
                              </span>
                            )}
                            {order.assignedStaff?.name && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 5px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '5px', fontSize: '10px', fontWeight: '600', border: '1px solid #bbf7d0' }}>
                                Staff: {order.assignedStaff.name}
                              </span>
                            )}
                            {order.subRestaurantName && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 5px', backgroundColor: '#fff7ed', color: '#9a3412', borderRadius: '5px', fontSize: '10px', fontWeight: '600', border: '1px solid #fed7aa' }}>
                                <FaStore size={8} /> {order.subRestaurantName}
                              </span>
                            )}
                            {order.isScheduled && order.scheduledFor && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '1px 5px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '5px', fontSize: '10px', fontWeight: '600' }}>
                                <FaCalendarAlt size={8} /> {new Date(order.scheduledFor).toLocaleDateString()} {new Date(order.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {order.syncSource === 'offline' && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-200">
                                <FaCloudUploadAlt className="text-[8px]" /> {t('orderHistory.offline')}
                              </span>
                            )}
                            {order._isOffline && (order.syncStatus === 'failed' || order.syncStatus === 'pending') && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRetrySync(order); }}
                                disabled={syncingOrderKey === order.idempotencyKey}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border transition-colors ${order.syncStatus === 'failed' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}
                                title={order.syncStatus === 'failed' ? t('orderHistory.retrySync') : 'Sync now'}
                              >
                                <FaSync className={`text-[8px] ${syncingOrderKey === order.idempotencyKey ? 'animate-spin' : ''}`} />
                                {syncingOrderKey === order.idempotencyKey ? t('orderHistory.syncing') : (order.syncStatus === 'failed' ? t('orderHistory.retry') : 'Sync')}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Price breakdown — hidden on mobile (too cluttered), shown on desktop */}
                        {!isMobile && (breakdown.taxLines?.length > 0 || breakdown.discountAmount > 0 || breakdown.serviceCharge > 0 || breakdown.tip > 0 || breakdown.roundOff !== 0) && (
                          <div className="text-xs text-gray-500 mb-1.5">
                            {formatCurrency(breakdown.subtotal)}
                            {breakdown.discountAmount > 0 && <span className="text-green-600">{` - ${t('orderHistory.disc')} ${formatCurrency(breakdown.discountAmount)}`}</span>}
                            {breakdown.serviceCharge > 0 && ` + ${t('orderHistory.sc')} ${formatCurrency(breakdown.serviceCharge)}`}
                            {breakdown.taxLines?.length > 0 && ` + ${breakdown.taxLines.map((line) => `${line.name}${line.rate != null ? ` ${line.rate}%` : ''}`).join(', ')}`}
                            {breakdown.tip > 0 && ` + ${t('orderHistory.tip')} ${formatCurrency(breakdown.tip)}`}
                            {breakdown.roundOff !== 0 && ` ${breakdown.roundOff > 0 ? '+' : '-'} ${t('orderHistory.round')} ${formatCurrency(Math.abs(breakdown.roundOff))}`}
                          </div>
                        )}

                        {/* Outstanding / partial badges */}
                        {order.outstandingAmount > 0 && (
                          <div className={`flex items-center gap-1 ${isMobile ? 'mb-1' : 'mb-1.5'}`}>
                            <span className={`${isMobile ? 'text-[10px] px-1.5' : 'text-xs px-2'} font-semibold text-white bg-red-500 py-0.5 rounded-full`}>{t('orderHistory.partial')}</span>
                            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-red-600 font-semibold`}>{t('orderHistory.due')} {formatCurrency(order.outstandingAmount)}</span>
                          </div>
                        )}
                        {order.paymentStatus === 'partial' && !order.outstandingAmount && order.paidAmount > 0 && (
                          <div className={`flex items-center gap-1 ${isMobile ? 'mb-1' : 'mb-1.5'}`}>
                            <span className={`${isMobile ? 'text-[10px] px-1.5' : 'text-xs px-2'} font-semibold text-white bg-amber-500 py-0.5 rounded-full`}>{t('orderHistory.partial')}</span>
                            <span className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-amber-600 font-semibold`}>{t('orderHistory.paid')} {formatCurrency(order.paidAmount)}</span>
                          </div>
                        )}

                        {/* Customer / Table / Type — compact inline on mobile, grid on desktop */}
                        {isMobile ? (
                          <div className="flex items-center gap-2 text-[11px] text-gray-600 mb-1.5 py-1 px-1.5 bg-gray-50 rounded-md">
                            <span className="flex items-center gap-1 truncate"><FaUser className="text-gray-400 text-[9px] flex-shrink-0" /> {order.customerDisplay?.name || t('orderHistory.walkIn')}</span>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1 flex-shrink-0">
                              {order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber ? <FaBed className="text-gray-400 text-[9px]" /> : <FaTable className="text-gray-400 text-[9px]" />}
                              {order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber || order.customerDisplay?.tableNumber || order.tableNumber || 'N/A'}
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1 capitalize flex-shrink-0"><FaUtensils className="text-gray-400 text-[9px]" /> {order.orderType?.replace('-', ' ') || t('orderHistory.type.dineIn')}</span>
                          </div>
                        ) : (
                        <div className="grid grid-cols-3 gap-2.5 mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2">
                            <FaUser className="text-gray-400 text-sm flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs text-gray-500">{t('orderHistory.customer')}</div>
                              <div className="text-sm font-medium text-gray-900">{order.customerDisplay?.name || t('orderHistory.walkIn')}</div>
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
                              <div className="text-xs text-gray-500">{order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber ? t('orderHistory.room') : t('orderHistory.table')}</div>
                              <div className="text-sm font-medium text-gray-900">{order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber || order.customerDisplay?.tableNumber || order.tableNumber || 'N/A'}{!order.roomNumber && !order.customerDisplay?.roomNumber && !order.customerInfo?.roomNumber && order.customerDisplay?.floorName ? ` · ${order.customerDisplay.floorName}` : ''}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaUtensils className="text-gray-400 text-sm" />
                            <div>
                              <div className="text-xs text-gray-500">{t('orderHistory.typeLabel')}</div>
                              <div className="text-sm font-medium text-gray-900 capitalize">{order.orderType?.replace('-', ' ') || t('orderHistory.type.dineIn')}</div>
                            </div>
                          </div>
                        </div>
                        )}

                        {/* Items section — collapsed by default, compact on mobile */}
                        <div className={`${isMobile ? 'rounded-md p-1.5 mb-1.5 border border-gray-100 bg-gray-50' : 'bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-2.5 border border-gray-200 mb-3'}`}>
                          <div className={`flex items-center justify-between ${isMobile ? 'mb-0.5' : 'mb-2'}`}>
                            <span className={`${isMobile ? 'text-[11px]' : 'text-sm'} font-semibold text-gray-700`}>{itemCount} {t('orderHistory.items')}</span>
                            <button
                              onClick={() => toggleOrderExpansion(order.id)}
                              className={`text-red-600 hover:text-red-700 flex items-center gap-1 ${isMobile ? 'text-[11px]' : 'text-sm'} font-medium transition-colors`}
                              title={expandedOrders.has(order.id) ? t('common.close') : t('common.view')}
                            >
                              {expandedOrders.has(order.id) ? <FaChevronUp size={isMobile ? 9 : 12} className="flex-shrink-0" /> : <FaChevronDown size={isMobile ? 9 : 12} className="flex-shrink-0" />}
                              {expandedOrders.has(order.id) ? t('common.close') : t('common.view')}
                            </button>
                          </div>
                          <div className={isMobile ? 'space-y-0.5' : 'space-y-1.5'}>
                            {(expandedOrders.has(order.id) ? (order.items || []) : (order.items || []).slice(0, 2)).map((item, idx) => (
                              <div key={idx} className={`flex justify-between ${isMobile ? 'text-[11px] py-0.5' : 'text-sm py-1'}`}>
                                <span className="text-gray-700 truncate mr-2">{item.quantity}x {item.name}</span>
                                <span className="font-medium text-gray-900 flex-shrink-0">{formatCurrency(item.total || (item.price * item.quantity))}</span>
                              </div>
                            ))}
                            {!expandedOrders.has(order.id) && itemCount > 2 && (
                              <div className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 pt-0.5`}>+{itemCount - 2} {t('common.more')}...</div>
                            )}
                          </div>
                          {order.specialInstructions && (
                            <div className={`${isMobile ? 'mt-1 pt-1' : 'mt-3 pt-2'} border-t border-gray-200`}>
                              <div className={`flex items-start gap-1.5 ${isMobile ? 'text-[11px]' : 'text-sm'}`}>
                                <span className="text-amber-600 font-semibold flex-shrink-0">{t('orderHistory.instructions')}</span>
                                <span className="text-gray-700">{order.specialInstructions}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons — icon-only on mobile, full labels on desktop */}
                        <div className={`flex items-center ${isMobile ? 'gap-1 pt-1 justify-end' : 'gap-3 mt-1 pt-3 justify-between'} border-t border-gray-100`}>
                          {!isMobile && (
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              onClick={() => copyToClipboard(String(order.dailyOrderId ?? order.orderNumber ?? order.id))}
                              className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                              title={t('orderHistory.clickToCopyOrderNumber')}
                            >
                              <span className="text-[11px] text-gray-400">{t('orderHistory.orderNumber')}</span>
                              <span className="text-xs font-mono font-semibold text-gray-600">#{order.dailyOrderId ?? order.orderNumber ?? order.id?.slice(-4)?.toUpperCase() ?? '—'}</span>
                              <FaCopy className="text-gray-300 text-[10px]" />
                            </div>
                            <div
                              onClick={() => copyToClipboard(order.id)}
                              className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors min-w-0"
                              title={t('orderHistory.clickToCopyOrderId')}
                            >
                              <span className="text-[11px] text-gray-400">{t('orderHistory.orderIdLabel')}</span>
                              <span className="text-xs font-mono font-semibold text-gray-600 truncate max-w-[140px]" title={order.id}>{order.id}</span>
                              <FaCopy className="text-gray-300 text-[10px] flex-shrink-0" />
                            </div>
                          </div>
                          )}
                          <div className={`flex items-center ${isMobile ? 'gap-1 flex-wrap' : 'gap-1.5 flex-shrink-0'}`}>
                            {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'deleted' && order.status !== 'refunded' && (
                              <button
                                onClick={() => handleMarkCompleted(order.id)}
                                className={`${isMobile ? 'p-1.5 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0`}
                                title={t('orderHistory.complete')}
                              >
                                <FaCheckCircle size={isMobile ? 11 : 12} /> {!isMobile && t('orderHistory.complete')}
                              </button>
                            )}
                            {(order.paymentStatus === 'partial' || order.outstandingAmount > 0) && order.status === 'completed' && (
                              <button
                                onClick={() => handleMarkPaid(order.id)}
                                className={`${isMobile ? 'p-1.5 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0`}
                                title={t('orderHistory.markPaid')}
                              >
                                <FaWallet size={isMobile ? 11 : 12} /> {!isMobile && t('orderHistory.markPaid')}
                              </button>
                            )}
                            <button
                              onClick={() => handleViewOrder(order)}
                              className={`${isMobile ? 'p-1.5 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0`}
                              title={t('orderHistory.view')}
                            >
                              <FaEye size={isMobile ? 11 : 12} /> {!isMobile && t('orderHistory.view')}
                            </button>
                            <div style={{ position: 'relative', display: 'inline-block' }} className="flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrintDropdownOrderId(prev => prev === order.id ? null : order.id);
                                }}
                                className={`${isMobile ? 'p-1.5 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium rounded-md transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0 ${printingOrderId === order.id ? 'bg-orange-200 border border-orange-300 cursor-wait' : 'text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100'}`}
                                title="Print"
                                disabled={printingOrderId === order.id}
                              >
                                {printingOrderId === order.id ? <FaSpinner className="animate-spin" size={isMobile ? 11 : 12} /> : <FaPrint size={isMobile ? 11 : 12} />}
                                {!isMobile && (printingOrderId === order.id ? t('orderHistory.sending') : 'Print')}
                              </button>
                              {printDropdownOrderId === order.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    position: 'absolute',
                                    bottom: '100%',
                                    right: 0,
                                    marginBottom: '4px',
                                    background: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    zIndex: 50,
                                    minWidth: '130px',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handlePrintBill(order); }}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      color: '#374151',
                                      background: 'transparent',
                                      border: 'none',
                                      borderBottom: '1px solid #f3f4f6',
                                      cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <FaReceipt size={10} style={{ color: '#10b981' }} /> Print Bill
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handlePrintKOT(order); }}
                                    style={{
                                      width: '100%',
                                      padding: '8px 12px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      fontSize: '12px',
                                      fontWeight: 500,
                                      color: '#374151',
                                      background: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <FaUtensils size={10} style={{ color: '#f59e0b' }} /> Print KOT
                                  </button>
                                </div>
                              )}
                            </div>
                            {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'deleted' && order.status !== 'refunded' && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className={`${isMobile ? 'p-1.5 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0`}
                                title={t('orderHistory.cancel')}
                              >
                                <FaTimesCircle size={isMobile ? 11 : 12} /> {!isMobile && t('orderHistory.cancel')}
                              </button>
                            )}
                            {order.status === 'completed' && !order.refundedAt && canRefund && (
                              <button
                                onClick={() => handleOpenRefund(order)}
                                className={`${isMobile ? 'p-1.5 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0`}
                                title="Refund"
                              >
                                <FaUndoAlt size={isMobile ? 11 : 12} /> {!isMobile && 'Refund'}
                              </button>
                            )}
                            {order.status !== 'deleted' && order.status !== 'completed' && !order.orderFlow?.isDirectBilling && (
                              <button
                                onClick={() => handleEditOrder(order.id)}
                                className={`${isMobile ? 'p-1.5 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0`}
                                title="Update Order"
                              >
                                <FaEdit size={isMobile ? 11 : 12} /> {!isMobile && 'Update Order'}
                              </button>
                            )}
                            {canEditCompletedOrders && order.status === 'completed' && (
                              <>
                                <button
                                  onClick={() => handleOpenEditCompleted(order)}
                                  className={`${isMobile ? 'p-1.5 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0`}
                                  title="Edit Details"
                                >
                                  <FaEdit size={isMobile ? 11 : 12} /> {!isMobile && 'Edit Details'}
                                </button>
                                <button
                                  onClick={() => handleEditItemsClick(order)}
                                  className={`${isMobile ? 'p-1.5 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0`}
                                  title="Edit Items"
                                >
                                  <FaUtensils size={isMobile ? 11 : 12} /> {!isMobile && 'Edit Items'}
                                </button>
                              </>
                            )}
                            {allowOrderDelete && order.status !== 'deleted' && (
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                className={`${isMobile ? 'p-1.5 text-[10px]' : 'px-3 py-1.5 text-xs'} font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0`}
                                title="Delete"
                              >
                                <FaTrash size={isMobile ? 11 : 12} /> {!isMobile && 'Delete'}
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
                aria-label={t('orderHistory.previousPage')}
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
                aria-label={t('orderHistory.nextPage')}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      </>)}

      {selectedOrderForModal && typeof document !== 'undefined' && createPortal(
        <OrderDetailsModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
        />,
        document.body
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

      {/* Billing Completion Modal — rendered via portal to sit above sidebar */}
      {billingModalOrder && typeof document !== 'undefined' && createPortal(
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes billingBackdropIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes billingSlideIn { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
          ` }} />
          <div
            className={`fixed inset-0 z-[10200] flex items-center justify-center ${isMobileEmbed ? 'p-2 pb-16' : 'p-3'}`}
            style={{ animation: 'billingBackdropIn 0.2s ease-out' }}
            onClick={() => !billingModalProcessing && closeBillingModal()}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative w-full rounded-2xl shadow-2xl bg-white overflow-hidden flex flex-col"
              style={{
                maxWidth: '720px',
                maxHeight: isMobileEmbed ? 'calc(var(--app-height, 85vh) - 60px)' : '94vh',
                animation: 'billingSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaReceipt size={16} style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                      {t('orderHistory.completeBilling')}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '1px' }}>
                      {t('orderHistory.orderHash')}{billingModalOrder.dailyOrderId || billingModalOrder.id?.slice(-6) || 'N/A'}
                      {billingTableNumber ? ` \u00B7 ${t('orderHistory.tablePrefix')} ${billingTableNumber}` : ''}
                      {billingCustomerName ? ` \u00B7 ${billingCustomerName}` : ''}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => !billingModalProcessing && closeBillingModal()}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                    background: 'rgba(255,255,255,0.2)', color: '#ffffff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
                >
                  <FaTimes size={14} />
                </button>
              </div>

              {/* OrderSummary in billing mode */}
              {billingModalCart.length > 0 ? (
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <OrderSummary
                    cart={billingModalCart}
                    setCart={setBillingModalCart}
                    orderType={billingModalOrder.orderType || 'dine-in'}
                    setOrderType={() => {}}
                    paymentMethod={billingModalPaymentMethod}
                    setPaymentMethod={setBillingModalPaymentMethod}
                    onClearCart={() => {}}
                    onProcessOrder={handleBillingProcessOrder}
                    onSaveOrder={() => {}}
                    onPlaceOrder={() => {}}
                    onRemoveFromCart={() => {}}
                    onAddToCart={() => {}}
                    onUpdateCartItemQuantity={(cartId, newQty) => {
                      setBillingModalCart(prev => prev.map(item =>
                        item.cartId === cartId ? { ...item, quantity: newQty } : item
                      ).filter(item => item.quantity > 0));
                    }}
                    onTableNumberChange={(val) => setBillingTableNumber(val)}
                    onCustomerNameChange={(val) => setBillingCustomerName(val)}
                    onCustomerMobileChange={(val) => setBillingCustomerMobile(val)}
                    processing={billingModalProcessing}
                    placingOrder={false}
                    orderSuccess={billingOrderSuccess}
                    setOrderSuccess={setBillingOrderSuccess}
                    error={null}
                    getTotalAmount={getBillingModalTotalAmount}
                    tableNumber={billingTableNumber}
                    customerName={billingCustomerName}
                    customerMobile={billingCustomerMobile}
                    orderLookup=""
                    setOrderLookup={() => {}}
                    currentOrder={billingModalOrder}
                    setCurrentOrder={() => {}}
                    onShowQRCode={() => {}}
                    restaurantId={restaurantId}
                    restaurantName={restaurant?.name || ''}
                    taxSettings={taxSettings}
                    printSettings={printSettings}
                    menuItems={menuItems}
                    onClose={closeBillingModal}
                    billingMode={true}
                    billingSettings={restaurant?.billingSettings || {}}
                    businessType={restaurant?.businessType || 'restaurant'}
                    countryCode={restaurant?.countryCode || 'IN'}
                    multiPricingEnabled={multiPricingEnabled}
                    pricingRules={pricingRules}
                    activePricingRuleId={activePricingRuleId}
                    setActivePricingRuleId={setActivePricingRuleId}
                    upiSettings={upiSettings}
                    whatsappConnected={whatsappConnected}
                    posSettings={restaurant?.posSettings || {}}
                    userRole={(() => { try { return JSON.parse(localStorage.getItem('user') || '{}').role || 'waiter'; } catch { return 'waiter'; } })()}
                  />
                </div>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{
                    width: '64px', height: '64px', margin: '0 auto 20px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <FaReceipt size={28} style={{ color: '#9ca3af' }} />
                  </div>
                  <div style={{ fontSize: '16px', color: '#6b7280', fontWeight: 500 }}>{t('orderHistory.noItemsInOrder')}</div>
                </div>
              )}
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Mark as Fully Paid confirmation modal */}
      {markPaidOrderId && typeof document !== 'undefined' && createPortal((() => {
        const paidOrder = orders.find(o => o.id === markPaidOrderId);
        const outstandingAmt = paidOrder?.outstandingAmount || 0;
        return (
          <>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes markPaidBackdropIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes markPaidDialogIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            ` }} />
            <div
              className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
              style={{ zIndex: 10100, animation: 'markPaidBackdropIn 0.2s ease-out' }}
              aria-modal="true"
              role="dialog"
              aria-labelledby="mark-paid-title"
            >
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !markPaidSubmitting && setMarkPaidOrderId(null)}
              />
              <div
                className="relative w-full max-w-[min(90vw,400px)] rounded-2xl shadow-2xl border-2 border-gray-200 bg-white overflow-hidden"
                style={{ animation: 'markPaidDialogIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-5 sm:p-6 text-center">
                  <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <FaWallet className="text-amber-600 text-2xl sm:text-3xl" />
                  </div>
                  <h2 id="mark-paid-title" className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    {t('orderHistory.markAsFullyPaidTitle')}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-2">
                    {t('orderHistory.markAsFullyPaidDesc')}
                  </p>
                  {outstandingAmt > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                      <span className="text-sm text-amber-700">{t('orderHistory.outstandingLabel')} </span>
                      <span className="text-lg font-bold text-amber-800">{formatCurrency(outstandingAmt)}</span>
                    </div>
                  )}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => !markPaidSubmitting && setMarkPaidOrderId(null)}
                      disabled={markPaidSubmitting}
                      className="min-h-[48px] sm:min-h-[44px] w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-60 transition-all touch-manipulation"
                    >
                      {t('orderHistory.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => executeMarkPaid(markPaidOrderId)}
                      disabled={markPaidSubmitting}
                      className="min-h-[48px] sm:min-h-[44px] w-full sm:flex-1 px-4 py-3 sm:py-2 text-sm font-medium text-amber-700 bg-amber-50 border-2 border-amber-200 rounded-xl hover:bg-amber-100 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-60 transition-all touch-manipulation"
                    >
                      {markPaidSubmitting ? (
                        <>
                          <FaSpinner className="text-lg" style={{ animation: 'spin 1s linear infinite' }} />
                          {t('orderHistory.settling')}
                        </>
                      ) : (
                        <>
                          <FaWallet />
                          {t('orderHistory.markAsPaid')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })(), document.body)}

      {/* Cancel order modal — replaces native prompt() */}
      {cancelModalOrderId && typeof document !== 'undefined' && createPortal(
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes cancelBackdropIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes cancelDialogIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          ` }} />
          <div
            className="fixed inset-0 z-[10300] flex items-center justify-center p-4 sm:p-6"
            style={{ animation: 'cancelBackdropIn 0.2s ease-out' }}
            aria-modal="true"
            role="dialog"
            aria-labelledby="cancel-order-title"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeCancelModal}
            />
            <div
              className="relative w-full max-w-[min(92vw,460px)] rounded-2xl shadow-2xl border-2 border-gray-200 bg-white overflow-hidden"
              style={{ animation: 'cancelDialogIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <FaTimesCircle className="text-red-600 text-2xl" />
                  </div>
                  <div>
                    <h2 id="cancel-order-title" className="text-lg sm:text-xl font-bold text-gray-900">
                      {t('orderHistory.cancelThisOrder')}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {t('orderHistory.provideReasonForCancellation')}
                    </p>
                  </div>
                </div>

                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  {t('orderHistory.cancellationReason')} <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => { setCancelReason(e.target.value); if (cancelError) setCancelError(null); }}
                  disabled={cancelSubmitting}
                  rows={3}
                  autoFocus
                  placeholder={t('orderHistory.cancelReasonPlaceholder')}
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 resize-none disabled:bg-gray-50"
                />

                {/* Quick reason chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[t('orderHistory.customerChangedMind'), t('orderHistory.itemUnavailable'), t('orderHistory.wrongOrder'), t('orderHistory.longWaitTime'), t('orderHistory.duplicateOrder')].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setCancelReason(r); if (cancelError) setCancelError(null); }}
                      disabled={cancelSubmitting}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full transition-colors disabled:opacity-60"
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {cancelError && (
                  <p className="text-sm text-red-600 mt-3">{cancelError}</p>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeCancelModal}
                    disabled={cancelSubmitting}
                    className="min-h-[44px] w-full sm:flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 disabled:opacity-60 transition-all"
                  >
                    {t('orderHistory.keepOrder')}
                  </button>
                  <button
                    type="button"
                    onClick={submitCancelOrder}
                    disabled={cancelSubmitting || !cancelReason.trim()}
                    className="min-h-[44px] w-full sm:flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border-2 border-red-600 rounded-xl hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                  >
                    {cancelSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        {t('orderHistory.cancelling')}
                      </>
                    ) : (
                      <>
                        <FaTimesCircle />
                        {t('orderHistory.cancelOrder')}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
      document.body)}

      {/* Refund modal */}
      {refundModalOrder && typeof document !== 'undefined' && createPortal(
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes refundBackdropIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes refundDialogIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          ` }} />
          <div
            className="fixed inset-0 z-[10300] flex items-center justify-center p-4 sm:p-6"
            style={{ animation: 'refundBackdropIn 0.2s ease-out' }}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeRefundModal}
            />
            <div
              className="relative w-full max-w-[min(92vw,480px)] rounded-2xl shadow-2xl border-2 border-gray-200 bg-white overflow-hidden"
              style={{ animation: 'refundDialogIn 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <FaUndoAlt className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Refund Order #{refundModalOrder.dailyOrderId || refundModalOrder.orderNumber || ''}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Order total: {formatCurrency(refundModalOrder.finalAmount || refundModalOrder.totalAmount || 0)}
                    </p>
                  </div>
                </div>

                {/* Full / Partial toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setRefundType('full');
                      setRefundAmount(String(refundModalOrder.finalAmount || refundModalOrder.totalAmount || 0));
                      if (refundError) setRefundError(null);
                    }}
                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                      refundType === 'full'
                        ? 'bg-orange-50 border-orange-300 text-orange-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Full Refund
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRefundType('partial');
                      setRefundAmount('');
                      if (refundError) setRefundError(null);
                    }}
                    className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                      refundType === 'partial'
                        ? 'bg-orange-50 border-orange-300 text-orange-700'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    Partial Refund
                  </button>
                </div>

                {/* Info banner */}
                {refundType === 'full' ? (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      <span className="font-semibold">Full refund</span> will reverse all calculations — inventory, loyalty points, customer stats, and promo usage will be restored.
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">Partial refund</span> records the refund amount. Order stays completed in reports. No inventory/loyalty reversals.
                    </p>
                  </div>
                )}

                {/* Refund amount */}
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Refund Amount <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={refundModalOrder.finalAmount || refundModalOrder.totalAmount || 0}
                  value={refundAmount}
                  onChange={(e) => { setRefundAmount(e.target.value); if (refundError) setRefundError(null); }}
                  disabled={refundSubmitting || refundType === 'full'}
                  placeholder="Enter refund amount"
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 mb-3"
                />

                {/* Reason */}
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => { setRefundReason(e.target.value); if (refundError) setRefundError(null); }}
                  disabled={refundSubmitting}
                  rows={2}
                  placeholder="e.g. Customer complaint, wrong item, quality issue..."
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none disabled:bg-gray-50"
                />

                {/* Quick reason chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Customer Complaint', 'Wrong Item Served', 'Quality Issue', 'Overcharged', 'Item Not Received'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setRefundReason(r); if (refundError) setRefundError(null); }}
                      disabled={refundSubmitting}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-full transition-colors disabled:opacity-60"
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {refundError && (
                  <p className="text-sm text-red-600 mt-3">{refundError}</p>
                )}

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                  <button
                    type="button"
                    onClick={closeRefundModal}
                    disabled={refundSubmitting}
                    className="min-h-[44px] w-full sm:flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 disabled:opacity-60 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={submitRefund}
                    disabled={refundSubmitting || !refundAmount || !refundReason.trim()}
                    className="min-h-[44px] w-full sm:flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 border-2 border-orange-600 rounded-xl hover:bg-orange-700 flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                  >
                    {refundSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaUndoAlt />
                        {refundType === 'full' ? `Refund ${formatCurrency(parseFloat(refundAmount) || 0)}` : `Refund ${formatCurrency(parseFloat(refundAmount) || 0)}`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Delete order confirmation modal */}
      {deleteConfirmOrderId && typeof document !== 'undefined' && createPortal(
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes deleteBackdropIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes deleteDialogIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          ` }} />
          <div
            className="fixed inset-0 z-[10200] flex items-center justify-center p-4 sm:p-6"
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
              className="relative w-full max-w-md rounded-2xl shadow-2xl border-2 border-gray-200 bg-white overflow-hidden"
              style={{ animation: 'deleteDialogIn 0.35s cubic-bezier(0.34,1.56,0.64,1)', minWidth: '340px' }}
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
        </>,
        document.body
      )}

      {/* ========== EDIT COMPLETED ORDER MODAL ========== */}
      {editCompletedOrder && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes editCompBackdropIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes editCompDialogIn { from { opacity: 0; transform: scale(0.92) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          ` }} />
          <div
            className={`fixed inset-0 z-[10400] flex items-center justify-center ${isMobileEmbed ? 'p-3 pb-16' : 'p-4 sm:p-6'}`}
            style={{ animation: 'editCompBackdropIn 0.2s ease-out' }}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !editCompletedSaving && setEditCompletedOrder(null)}
            />
            <div
              className={`relative w-full max-w-[min(95vw,560px)] rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden flex flex-col ${isMobileEmbed ? '' : 'max-h-[90vh]'}`}
              style={{ animation: 'editCompDialogIn 0.35s cubic-bezier(0.34,1.56,0.64,1)', ...(isMobileEmbed ? { maxHeight: 'calc(var(--app-height, 85vh) - 60px)' } : {}) }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <FaEdit className="text-red-600 text-lg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Edit Completed Order</h2>
                    <p className="text-xs text-gray-500">#{editCompletedOrder.dailyOrderId || editCompletedOrder.orderNumber} &bull; {editCompletedOrder.id?.slice(0, 8)}...</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditCompletedOrder(null)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <FaTimes size={16} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                {/* Items (read-only) */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Items (read-only)</label>
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 space-y-1">
                    {(editCompletedOrder.items || []).map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{item.quantity}x {item.name}{(item.selectedVariant?.name || item.variant?.name) ? ` (${item.selectedVariant?.name || item.variant?.name})` : ''}</span>
                        <span className="font-medium">{formatCurrency(item.total || item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(editCompletedOrder.finalAmount || editCompletedOrder.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Type */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Order Type</label>
                  <select
                    value={editCompletedForm.orderType}
                    onChange={(e) => setEditCompletedForm(f => ({ ...f, orderType: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                  >
                    <option value="dine-in">Dine-in</option>
                    <option value="takeaway">Takeaway</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                {/* Payment Details */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Payment Method</label>
                  <div className="flex flex-wrap gap-2">
                    {['cash', 'upi', 'card', 'online', 'other', 'split'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          const updates = { paymentMethod: m };
                          if (m === 'split' && editCompletedForm.splitPayments.length < 2) {
                            updates.splitPayments = [{ method: 'cash', amount: 0 }, { method: 'upi', amount: 0 }];
                          }
                          if (m !== 'cash') { updates.cashReceived = 0; updates.changeReturned = 0; }
                          setEditCompletedForm(f => ({ ...f, ...updates }));
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all capitalize ${
                          editCompletedForm.paymentMethod === m
                            ? 'bg-red-50 border-red-300 text-red-700 ring-1 ring-red-200'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {m === 'split' ? 'Settlement' : m}
                      </button>
                    ))}
                  </div>

                  {/* Split Payment Editor */}
                  {editCompletedForm.paymentMethod === 'split' && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 space-y-2">
                      <div className="text-xs font-semibold text-blue-700">Settlement Breakdown</div>
                      {(editCompletedForm.splitPayments || []).map((sp, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <select
                            value={sp.method}
                            onChange={(e) => {
                              const updated = [...editCompletedForm.splitPayments];
                              updated[i] = { ...updated[i], method: e.target.value };
                              setEditCompletedForm(f => ({ ...f, splitPayments: updated }));
                            }}
                            className="px-2 py-1.5 text-xs rounded-lg border border-blue-200 bg-white focus:ring-1 focus:ring-blue-300 outline-none"
                          >
                            {['cash', 'upi', 'card', 'online', 'other'].map(m => (
                              <option key={m} value={m} className="capitalize">{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0"
                            value={sp.amount || ''}
                            onChange={(e) => {
                              const updated = [...editCompletedForm.splitPayments];
                              updated[i] = { ...updated[i], amount: Number(e.target.value) || 0 };
                              setEditCompletedForm(f => ({ ...f, splitPayments: updated }));
                            }}
                            placeholder="Amount"
                            className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-blue-200 bg-white focus:ring-1 focus:ring-blue-300 outline-none"
                          />
                          {editCompletedForm.splitPayments.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = editCompletedForm.splitPayments.filter((_, j) => j !== i);
                                setEditCompletedForm(f => ({ ...f, splitPayments: updated }));
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 text-xs"
                            >✕</button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEditCompletedForm(f => ({
                            ...f,
                            splitPayments: [...(f.splitPayments || []), { method: 'cash', amount: 0 }]
                          }));
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        + Add Payment Method
                      </button>
                      {(() => {
                        const splitTotal = (editCompletedForm.splitPayments || []).reduce((s, sp) => s + (sp.amount || 0), 0);
                        const orderTotal = editCompletedOrder?.finalAmount || editCompletedOrder?.totalAmount || 0;
                        const balanced = Math.abs(splitTotal - orderTotal) < 0.01;
                        return (
                          <div className={`flex justify-between items-center text-xs pt-2 border-t border-blue-200 font-semibold ${balanced ? 'text-green-600' : 'text-amber-600'}`}>
                            <span>Total: {formatCurrency(splitTotal)} / {formatCurrency(orderTotal)}</span>
                            <span>{balanced ? '✓ Balanced' : `₹${Math.abs(orderTotal - splitTotal).toFixed(2)} ${splitTotal < orderTotal ? 'remaining' : 'over'}`}</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Cash Tendering */}
                  {editCompletedForm.paymentMethod === 'cash' && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] font-semibold text-gray-400 uppercase">Cash Received</label>
                          <input
                            type="number"
                            min="0"
                            value={editCompletedForm.cashReceived || ''}
                            onChange={(e) => {
                              const cr = Number(e.target.value) || 0;
                              const orderTotal = editCompletedOrder?.finalAmount || editCompletedOrder?.totalAmount || 0;
                              setEditCompletedForm(f => ({ ...f, cashReceived: cr, changeReturned: Math.max(0, cr - orderTotal) }));
                            }}
                            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-red-200 outline-none"
                          />
                        </div>
                        {editCompletedForm.changeReturned > 0 && (
                          <div className="flex-1">
                            <label className="text-[10px] font-semibold text-gray-400 uppercase">Change Returned</label>
                            <div className="px-2 py-1.5 text-sm text-green-600 font-medium">{formatCurrency(editCompletedForm.changeReturned)}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Status */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Payment Status</label>
                    <div className="flex gap-2">
                      {[
                        { id: 'paid', label: 'Paid', active: 'bg-green-50 border-green-300 text-green-700 ring-1 ring-green-200' },
                        { id: 'partial', label: 'Partial', active: 'bg-amber-50 border-amber-300 text-amber-700 ring-1 ring-amber-200' },
                        { id: 'due', label: 'Due (Udhar)', active: 'bg-red-50 border-red-300 text-red-700 ring-1 ring-red-200' },
                      ].map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            const orderTotal = editCompletedOrder?.finalAmount || editCompletedOrder?.totalAmount || 0;
                            const updates = { paymentStatus: s.id };
                            if (s.id === 'paid') { updates.paidAmount = orderTotal; updates.outstandingAmount = 0; }
                            else if (s.id === 'due') { updates.paidAmount = 0; updates.outstandingAmount = orderTotal; }
                            else if (s.id === 'partial') { updates.paidAmount = editCompletedForm.paidAmount || 0; updates.outstandingAmount = Math.max(0, orderTotal - (editCompletedForm.paidAmount || 0)); }
                            setEditCompletedForm(f => ({ ...f, ...updates }));
                          }}
                          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                            editCompletedForm.paymentStatus === s.id
                              ? s.active
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Partial / Due Amount Details */}
                  {(editCompletedForm.paymentStatus === 'partial' || editCompletedForm.paymentStatus === 'due') && (
                    <div className={`rounded-xl border p-3 space-y-2 ${editCompletedForm.paymentStatus === 'due' ? 'border-red-200 bg-red-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
                      {editCompletedForm.paymentStatus === 'partial' && (
                        <div>
                          <label className="text-[10px] font-semibold text-gray-400 uppercase">Paid Amount</label>
                          <input
                            type="number"
                            min="0"
                            max={editCompletedOrder?.finalAmount || editCompletedOrder?.totalAmount || 0}
                            value={editCompletedForm.paidAmount || ''}
                            onChange={(e) => {
                              const pa = Number(e.target.value) || 0;
                              const orderTotal = editCompletedOrder?.finalAmount || editCompletedOrder?.totalAmount || 0;
                              setEditCompletedForm(f => ({ ...f, paidAmount: pa, outstandingAmount: Math.max(0, orderTotal - pa) }));
                            }}
                            className="w-full px-2 py-1.5 text-sm rounded-lg border border-gray-200 focus:ring-1 focus:ring-amber-200 outline-none"
                          />
                        </div>
                      )}
                      <div className="flex justify-between text-xs">
                        <span className={`font-semibold ${editCompletedForm.paymentStatus === 'due' ? 'text-red-600' : 'text-amber-600'}`}>Outstanding</span>
                        <span className={`font-bold ${editCompletedForm.paymentStatus === 'due' ? 'text-red-700' : 'text-amber-700'}`}>
                          {formatCurrency(editCompletedForm.outstandingAmount || (editCompletedOrder?.finalAmount || editCompletedOrder?.totalAmount || 0))}
                        </span>
                      </div>
                      {editCompletedForm.paymentStatus === 'partial' && editCompletedForm.paidAmount > 0 && (
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-green-600">Paid</span>
                          <span className="font-bold text-green-700">{formatCurrency(editCompletedForm.paidAmount)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Delivery Type */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Delivery Type</label>
                  <input
                    type="text"
                    value={editCompletedForm.deliveryType}
                    onChange={(e) => setEditCompletedForm(f => ({ ...f, deliveryType: e.target.value }))}
                    placeholder="e.g., self-pickup, delivery partner"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                  />
                </div>

                {/* Table Number */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Table Number</label>
                  <input
                    type="text"
                    value={editCompletedForm.tableNumber}
                    onChange={(e) => setEditCompletedForm(f => ({ ...f, tableNumber: e.target.value }))}
                    placeholder="Table number"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                  />
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Customer Name</label>
                    <input
                      type="text"
                      value={editCompletedForm.customerName}
                      onChange={(e) => setEditCompletedForm(f => ({ ...f, customerName: e.target.value }))}
                      placeholder="Customer name"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Customer Phone</label>
                    <input
                      type="text"
                      value={editCompletedForm.customerPhone}
                      onChange={(e) => setEditCompletedForm(f => ({ ...f, customerPhone: e.target.value }))}
                      placeholder="Phone number"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Notes</label>
                  <textarea
                    value={editCompletedForm.notes}
                    onChange={(e) => setEditCompletedForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none"
                  />
                </div>

                {/* Edit History */}
                {editCompletedHistory.length > 0 && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Edit History</label>
                    <div className="space-y-2">
                      {editCompletedHistory.slice().reverse().map((entry, i) => (
                        <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-amber-800">
                              {entry.editedBy?.name || 'Unknown'} ({entry.editedBy?.role})
                            </span>
                            <span className="text-xs text-amber-600">
                              {entry.editedAt ? new Date(entry.editedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {entry.type === 'items' ? (
                              <>
                                {entry.editReason && <div className="text-xs text-gray-600 italic mb-1">Reason: {entry.editReason}</div>}
                                {(entry.changes?.itemsAdded || []).map((item, j) => (
                                  <div key={`a${j}`} className="text-xs text-green-700">+ Added: {item.name} x{item.quantity}</div>
                                ))}
                                {(entry.changes?.itemsRemoved || []).map((item, j) => (
                                  <div key={`r${j}`} className="text-xs text-red-600">- Removed: {item.name} x{item.quantity}</div>
                                ))}
                                {(entry.changes?.itemsModified || []).map((item, j) => (
                                  <div key={`m${j}`} className="text-xs text-blue-600">~ {item.name}: qty {item.from} → {item.to}</div>
                                ))}
                                {entry.changes?.oldTotal != null && entry.changes?.newTotal != null && (
                                  <div className="text-xs font-medium mt-1">Total: {formatCurrency(entry.changes.oldTotal)} → {formatCurrency(entry.changes.newTotal)}</div>
                                )}
                              </>
                            ) : (
                              (entry.changes || []).map((c, j) => (
                                <div key={j} className="text-xs text-gray-700">
                                  <span className="font-medium">{c.field}</span>: <span className="text-red-600 line-through">{c.from || '(empty)'}</span> → <span className="text-green-700 font-medium">{c.to || '(empty)'}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`px-5 border-t border-gray-100 flex gap-3 flex-shrink-0 ${isMobileEmbed ? 'py-3 pb-16' : 'py-4'}`}>
                <button
                  onClick={() => setEditCompletedOrder(null)}
                  disabled={editCompletedSaving}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditCompleted}
                  disabled={editCompletedSaving}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                >
                  {editCompletedSaving ? (
                    <><FaSpinner className="animate-spin" /> Saving...</>
                  ) : (
                    <><FaEdit /> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== EDIT REASON MODAL ========== */}
      {editReasonModal && (
        <>
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes editReasonIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          ` }} />
          <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4" onClick={() => setEditReasonModal(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden"
              style={{ animation: 'editReasonIn 0.2s ease-out' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Edit Reason Required</h3>
                <p className="text-xs text-gray-500 mt-0.5">Why are you editing this completed order?</p>
              </div>
              <div className="px-5 py-4">
                <textarea
                  value={editReason}
                  onChange={e => setEditReason(e.target.value)}
                  placeholder="e.g., Customer requested item change, wrong item billed..."
                  rows={3}
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none resize-none"
                />
                {editReason.trim().length > 0 && editReason.trim().length < 3 && (
                  <p className="text-xs text-red-500 mt-1">Minimum 3 characters required</p>
                )}
              </div>
              <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                <button onClick={() => setEditReasonModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200">Cancel</button>
                <button
                  onClick={handleEditReasonSubmit}
                  disabled={!editReason.trim() || editReason.trim().length < 3}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== PIN VERIFICATION MODAL ========== */}
      {pinModal && (
        <>
          <div className="fixed inset-0 z-[10500] flex items-center justify-center p-4" onClick={() => setPinModal(null)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-sm rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Enter PIN</h3>
                <p className="text-xs text-gray-500 mt-0.5">PIN required to edit completed orders</p>
              </div>
              <div className="px-5 py-4">
                <input
                  type="password"
                  value={pinCode}
                  onChange={e => { setPinCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setPinError(''); }}
                  placeholder="Enter 4-6 digit PIN"
                  maxLength={6}
                  autoFocus
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 text-center text-2xl tracking-widest font-mono focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
                  onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
                />
                {pinError && <p className="text-xs text-red-500 mt-2 text-center">{pinError}</p>}
              </div>
              <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
                <button onClick={() => setPinModal(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200">Cancel</button>
                <button
                  onClick={handlePinSubmit}
                  disabled={!pinCode || pinCode.length < 4}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========== ORDER EDIT MODAL (COMPLETED ORDER ITEMS) ========== */}
      {editItemsOrder && (
        <OrderEditModal
          isOpen={true}
          onClose={() => { setEditItemsOrder(null); setEditReason(''); setPinCode(''); }}
          orderId={editItemsOrder.id}
          selectedRestaurant={restaurant}
          onOrderUpdated={handleEditItemsComplete}
          mode="completed"
          editReason={editReason}
          pinCode={pinCode}
        />
      )}

      {/* ========== SUMMARY VIEW CONTENT ========== */}
      {activeView === 'summary' && (
        <div className="flex-1 p-4 sm:px-6 sm:py-5 overflow-y-auto">
          {summaryLoading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-rose-500 text-3xl" />
            </div>
          ) : summaryData ? (
            <div className="max-w-7xl mx-auto">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-emerald-600 font-bold text-sm">{getCurrencySymbol()}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium uppercase">{t('orderHistory.revenue')}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(summaryData.totalRevenueWithTax || summaryData.totalRevenue || 0)}</div>
                  {summaryData.totalRevenueWithTax > summaryData.totalRevenue && summaryData.totalRevenue > 0 && (
                    <div className="text-[11px] text-gray-400 mt-0.5">{t('orderHistory.exclTax')} {formatCurrency(summaryData.totalRevenue)}</div>
                  )}
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FaShoppingBag className="text-blue-600 text-sm" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium uppercase">{t('orderHistory.orders')}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{summaryData.totalOrders}</div>
                  {summaryData.avgOrderValue > 0 && (
                    <div className="text-[11px] text-gray-400 mt-0.5">{t('orderHistory.avg')} {formatCurrency(summaryData.avgOrderValue)}</div>
                  )}
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FaChartPie className="text-purple-600 text-sm" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium uppercase">{t('orderHistory.itemsSold')}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{summaryData.items?.reduce((s, i) => s + i.quantity, 0) || 0}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{summaryData.items?.length || 0} {t('orderHistory.uniqueItems')}</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <FaUsers className="text-amber-600 text-sm" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium uppercase">{t('orderHistory.customers')}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{summaryData.uniqueCustomers || 0}</div>
                </div>
              </div>

              {/* Daily Revenue Trend (multi-day) */}
              {summaryData.dailyRevenue && summaryData.dailyRevenue.length > 1 && (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('orderHistory.dailyRevenueTrend')}</h3>
                  <div className="flex items-end gap-1 h-32">
                    {(() => {
                      const maxRev = Math.max(...summaryData.dailyRevenue.map(d => d.revenue), 1);
                      return summaryData.dailyRevenue.map((day, idx) => {
                        const height = Math.max((day.revenue / maxRev) * 100, 4);
                        const dateLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                            <div className="absolute -top-8 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              {formatCurrency(day.revenue)} &middot; {day.orders} {t('orderHistory.orders')}
                            </div>
                            <div className="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-md hover:from-rose-600 hover:to-rose-500 transition-all cursor-pointer min-w-[8px]" style={{ height: `${height}%` }} />
                            <span className="text-[9px] text-gray-400 truncate w-full text-center">{dateLabel}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Order Type & Busiest Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {summaryData.ordersByType && Object.keys(summaryData.ordersByType).length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('orderHistory.orderTypes')}</h3>
                    <div className="space-y-2">
                      {(() => {
                        const typeTotal = Object.values(summaryData.ordersByType).reduce((s, v) => s + v, 0);
                        return Object.entries(summaryData.ordersByType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                          const pct = typeTotal > 0 ? Math.round((count / typeTotal) * 100) : 0;
                          const colors = { dine_in: 'bg-blue-500', delivery: 'bg-green-500', takeaway: 'bg-amber-500', customer_self_order: 'bg-purple-500' };
                          return (
                            <div key={type}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="capitalize text-gray-700 font-medium">{type.replace(/_/g, ' ')}</span>
                                <span className="text-gray-500">{count} ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div className={`h-2 rounded-full ${colors[type] || 'bg-gray-400'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
                {summaryData.hourlyBreakdown && Object.keys(summaryData.hourlyBreakdown).length > 0 && (
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('orderHistory.busiestHours')}</h3>
                    <div className="space-y-1.5">
                      {Object.entries(summaryData.hourlyBreakdown).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([hour, count]) => {
                        const h = parseInt(hour);
                        const label = h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h - 12} PM`;
                        const maxH = Math.max(...Object.values(summaryData.hourlyBreakdown));
                        const pct = maxH > 0 ? Math.round((count / maxH) * 100) : 0;
                        return (
                          <div key={hour} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-12 text-right font-mono">{label}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-3">
                              <div className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-rose-500" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-gray-600 font-semibold w-8">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Item-wise Sales Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-base font-bold text-gray-800">
                    {t('orderHistory.itemWiseSales')}
                    <span className="text-xs text-gray-400 font-normal ml-2">({summaryData.items?.length || 0} {t('orderHistory.items')})</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Download buttons */}
                    <button
                      onClick={() => {
                        const items = filteredSummaryItems;
                        const totalRev = items.reduce((s, i) => s + i.revenue, 0);
                        const rows = [['#', 'Item', 'Qty', 'Revenue', '% of Total']];
                        items.forEach((item, idx) => {
                          const pct = totalRev > 0 ? ((item.revenue / totalRev) * 100).toFixed(1) : '0.0';
                          rows.push([idx + 1, item.name, item.quantity, item.revenue, `${pct}%`]);
                        });
                        rows.push(['', 'Total', items.reduce((s, i) => s + i.quantity, 0), totalRev, '100%']);
                        const csv = rows.map(r => r.map(c => typeof c === 'string' && c.includes(',') ? `"${c}"` : c).join(',')).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = `item-wise-sales-${summaryPeriod}.csv`;
                        document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all"
                      title="Download CSV"
                    >
                      <FaFileCsv className="text-green-600" /> CSV
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const XLSX = await import('xlsx');
                          const items = filteredSummaryItems;
                          const totalRev = items.reduce((s, i) => s + i.revenue, 0);
                          const rows = [['#', 'Item', 'Qty', 'Revenue', '% of Total']];
                          items.forEach((item, idx) => {
                            const pct = totalRev > 0 ? ((item.revenue / totalRev) * 100).toFixed(1) : '0.0';
                            rows.push([idx + 1, item.name, item.quantity, item.revenue, `${pct}%`]);
                          });
                          rows.push(['', 'Total', items.reduce((s, i) => s + i.quantity, 0), totalRev, '100%']);
                          const wb = XLSX.utils.book_new();
                          const ws = XLSX.utils.aoa_to_sheet(rows);
                          XLSX.utils.book_append_sheet(wb, ws, 'Item-wise Sales');
                          XLSX.writeFile(wb, `item-wise-sales-${summaryPeriod}.xlsx`);
                        } catch (err) { console.error('Excel export failed:', err); }
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all"
                      title="Download Excel"
                    >
                      <FaFileExcel className="text-green-600" /> Excel
                    </button>
                    {/* Search */}
                    <div className="relative">
                      <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                      <input type="text" placeholder={t('orderHistory.searchItems')} value={displaySummarySearch} onChange={e => {
                        const val = e.target.value;
                        setDisplaySummarySearch(val);
                        clearTimeout(summarySearchDebounceRef.current);
                        summarySearchDebounceRef.current = setTimeout(() => setSummarySearch(val), 300);
                      }}
                        className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-44 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none" />
                    </div>
                  </div>
                </div>
                {(() => {
                  const items = filteredSummaryItems;
                  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
                  const totalRev = items.reduce((s, i) => s + i.revenue, 0);
                  return items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                            <th className="px-4 py-2.5 font-semibold w-10">#</th>
                            <th className="px-4 py-2.5 font-semibold cursor-pointer hover:text-gray-700" onClick={() => toggleSummarySort('name')}>
                              <span className="flex items-center gap-1">{t('orderHistory.item')} {summarySortBy === 'name' && (summarySortDir === 'desc' ? <FaSortAmountDown className="text-[10px]" /> : <FaSortAmountUp className="text-[10px]" />)}</span>
                            </th>
                            <th className="px-4 py-2.5 font-semibold text-center cursor-pointer hover:text-gray-700" onClick={() => toggleSummarySort('quantity')}>
                              <span className="flex items-center justify-center gap-1">{t('orderHistory.qty')} {summarySortBy === 'quantity' && (summarySortDir === 'desc' ? <FaSortAmountDown className="text-[10px]" /> : <FaSortAmountUp className="text-[10px]" />)}</span>
                            </th>
                            <th className="px-4 py-2.5 font-semibold text-right cursor-pointer hover:text-gray-700" onClick={() => toggleSummarySort('revenue')}>
                              <span className="flex items-center justify-end gap-1">{t('orderHistory.revenue')} {summarySortBy === 'revenue' && (summarySortDir === 'desc' ? <FaSortAmountDown className="text-[10px]" /> : <FaSortAmountUp className="text-[10px]" />)}</span>
                            </th>
                            <th className="px-4 py-2.5 font-semibold text-right">{t('orderHistory.percentOfTotal')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {items.map((item, idx) => {
                            const revPct = totalRev > 0 ? ((item.revenue / totalRev) * 100) : 0;
                            const isTop3 = idx < 3 && summarySortBy === 'quantity' && summarySortDir === 'desc';
                            return (
                              <tr key={item.originalKey || item.name} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    {isTop3 && (
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {idx === 0 ? t('orderHistory.first') : idx === 1 ? t('orderHistory.second') : t('orderHistory.third')}
                                      </span>
                                    )}
                                    <span className="font-medium text-gray-800 text-sm">{item.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold text-sm px-3 py-0.5 rounded-full min-w-[40px]">{item.quantity}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-gray-800 text-sm">{formatCurrency(item.revenue)}</td>
                                <td className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                      <div className="h-1.5 rounded-full bg-rose-400" style={{ width: `${Math.min(revPct, 100)}%` }} />
                                    </div>
                                    <span className="text-xs text-gray-500 w-10 text-right">{revPct.toFixed(1)}%</span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 text-gray-800">{t('orderHistory.total')}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 font-bold text-sm px-3 py-0.5 rounded-full">{totalQty}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-emerald-700 text-sm">{formatCurrency(totalRev)}</td>
                            <td className="px-4 py-3 text-right text-xs text-gray-500">100%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">{summarySearch ? t('orderHistory.noItemsMatchSearch') : t('orderHistory.noSalesDataPeriod')}</div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <FaChartPie className="text-5xl mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">{t('orderHistory.noSalesDataAvailable')}</p>
              <p className="text-sm mt-1">{t('orderHistory.startTakingOrdersSummary')}</p>
            </div>
          )}
        </div>
      )}

      {/* ========== SCHEDULED VIEW CONTENT ========== */}
      {activeView === 'scheduled' && (
        <div className="flex-1 p-3 sm:px-6 sm:py-4 overflow-y-auto">
          {scheduledLoading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin text-blue-500 text-3xl" />
            </div>
          ) : (() => {
            // Filter scheduled orders based on scheduledDateFilter
            const now = new Date();
            const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);
            const weekEnd = new Date(todayStart); weekEnd.setDate(weekEnd.getDate() + 7);
            const monthEnd = new Date(todayStart); monthEnd.setMonth(monthEnd.getMonth() + 1);

            const filtered = scheduledOrders.filter(order => {
              const schDate = new Date(order.scheduledFor || order.createdAt);
              switch (scheduledDateFilter) {
                case 'upcoming': return schDate >= now;
                case 'today': return schDate >= todayStart && schDate <= todayEnd;
                case 'thisWeek': return schDate >= todayStart && schDate <= weekEnd;
                case 'thisMonth': return schDate >= todayStart && schDate <= monthEnd;
                case 'past': return schDate < now;
                case 'all': default: return true;
              }
            });

            // Stats for scheduled orders
            const totalScheduled = filtered.length;
            const totalValue = filtered.reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0);
            const todayCount = filtered.filter(o => {
              const d = new Date(o.scheduledFor);
              return d >= todayStart && d <= todayEnd;
            }).length;

            // Group by date for calendar view
            const groupedByDate = {};
            filtered.forEach(order => {
              const dateKey = new Date(order.scheduledFor || order.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
              if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
              groupedByDate[dateKey].push(order);
            });
            const sortedDates = Object.keys(groupedByDate).sort();

            if (totalScheduled === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <FaCalendarAlt className="text-5xl mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">No scheduled orders</p>
                  <p className="text-sm mt-1">Scheduled orders will appear here when created from the billing page</p>
                </div>
              );
            }

            return (
              <div className="max-w-7xl mx-auto">
                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FaCalendarAlt className="text-blue-600 text-xs" />
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium uppercase">Scheduled</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{totalScheduled}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <span className="text-emerald-600 font-bold text-xs">{getCurrencySymbol()}</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium uppercase">Value</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                        <FaClock className="text-amber-600 text-xs" />
                      </div>
                      <span className="text-[10px] text-gray-500 font-medium uppercase">Today</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{todayCount}</div>
                  </div>
                </div>

                {/* List view */}
                {scheduledViewMode === 'list' && (
                  <div className="space-y-2">
                    {filtered.map((order) => {
                      const schDate = new Date(order.scheduledFor);
                      const isPast = schDate < now;
                      const isToday = schDate >= todayStart && schDate <= todayEnd;
                      const orderNum = order.orderNumber || order.id?.slice(-6);
                      const items = order.items || order.orderItems || [];
                      const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);

                      return (
                        <div
                          key={order.id}
                          className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-4 ${
                            isPast ? 'border-gray-200 opacity-70' : isToday ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isPast ? 'bg-gray-100' : isToday ? 'bg-blue-100' : 'bg-indigo-50'
                              }`}>
                                <FaCalendarAlt className={`text-sm ${isPast ? 'text-gray-400' : isToday ? 'text-blue-600' : 'text-indigo-500'}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-gray-900">#{orderNum}</span>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    isPast ? 'bg-gray-100 text-gray-500' : isToday ? 'bg-blue-100 text-blue-700' : 'bg-indigo-50 text-indigo-600'
                                  }`}>
                                    {isPast ? 'Past' : isToday ? 'Today' : schDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {order.status || 'pending'}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                  <span><FaClock className="inline mr-1 text-[10px]" />{schDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                  <span>{schDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                  {order.customerInfo?.name && <span><FaUser className="inline mr-1 text-[10px]" />{order.customerInfo.name}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-base font-bold text-gray-900">{formatCurrency(order.finalAmount || order.totalAmount || 0)}</div>
                              <div className="text-[10px] text-gray-400">{itemCount} item{itemCount !== 1 ? 's' : ''} · {order.paymentMethod || 'cash'}</div>
                            </div>
                          </div>
                          {/* Items preview + actions */}
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                            <div className="text-xs text-gray-500 min-w-0 truncate">
                              {items.slice(0, 4).map((item, i) => (
                                <span key={i}>{i > 0 ? ', ' : ''}{item.quantity || 1}x {item.name}</span>
                              ))}
                              {items.length > 4 && <span className="text-gray-400"> +{items.length - 4} more</span>}
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'deleted' && order.status !== 'refunded' && (
                                <button
                                  onClick={() => handleMarkCompleted(order.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all"
                                >
                                  <FaCheckCircle className="text-[10px]" /> Complete
                                </button>
                              )}
                              <button
                                onClick={() => setSelectedOrderForModal(order)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all"
                              >
                                <FaEye className="text-[10px]" /> View
                              </button>
                              {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'deleted' && order.status !== 'refunded' && (
                                <button
                                  onClick={() => setCancelModalOrderId(order.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all"
                                >
                                  <FaTimesCircle className="text-[10px]" /> Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Calendar/Date-grouped view */}
                {scheduledViewMode === 'calendar' && (
                  <div className="space-y-4">
                    {sortedDates.map(dateKey => {
                      const dayOrders = groupedByDate[dateKey];
                      const dateObj = new Date(dateKey + 'T00:00:00');
                      const isToday = dateKey === new Date().toLocaleDateString('en-CA');
                      const isPast = dateObj < todayStart;
                      const dayTotal = dayOrders.reduce((s, o) => s + (o.finalAmount || o.totalAmount || 0), 0);

                      return (
                        <div key={dateKey}>
                          {/* Date header */}
                          <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl mb-2 ${
                            isToday ? 'bg-blue-600 text-white' : isPast ? 'bg-gray-200 text-gray-600' : 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-900 border border-indigo-100'
                          }`}>
                            <div className="flex items-center gap-2">
                              <FaCalendarAlt className="text-sm" />
                              <span className="font-bold text-sm">
                                {isToday ? 'Today' : dateObj.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="font-medium">{dayOrders.length} order{dayOrders.length !== 1 ? 's' : ''}</span>
                              <span className="font-bold">{formatCurrency(dayTotal)}</span>
                            </div>
                          </div>
                          {/* Orders for this date in a table-like layout */}
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden divide-y divide-gray-100">
                            {dayOrders
                              .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
                              .map(order => {
                                const schTime = new Date(order.scheduledFor);
                                const items = order.items || order.orderItems || [];
                                const itemCount = items.reduce((s, i) => s + (i.quantity || 1), 0);
                                return (
                                  <div key={order.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="text-sm font-mono font-bold text-gray-700 w-16 flex-shrink-0">
                                        {schTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-semibold text-sm text-gray-900">#{order.orderNumber || order.id?.slice(-6)}</span>
                                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                            'bg-yellow-100 text-yellow-700'
                                          }`}>{order.status || 'pending'}</span>
                                        </div>
                                        <div className="text-[11px] text-gray-400 truncate">
                                          {items.slice(0, 3).map((item, i) => `${i > 0 ? ', ' : ''}${item.quantity || 1}x ${item.name}`).join('')}
                                          {items.length > 3 ? ` +${items.length - 3}` : ''}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {order.customerInfo?.name && (
                                        <span className="text-xs text-gray-500 hidden sm:block"><FaUser className="inline mr-1 text-[10px]" />{order.customerInfo.name}</span>
                                      )}
                                      <span className="text-xs text-gray-400 hidden sm:inline">{itemCount} items</span>
                                      <span className="font-bold text-sm text-gray-900 w-20 text-right">{formatCurrency(order.finalAmount || order.totalAmount || 0)}</span>
                                      {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'deleted' && order.status !== 'refunded' && (
                                        <button
                                          onClick={() => handleMarkCompleted(order.id)}
                                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-all"
                                        >
                                          <FaCheckCircle className="text-[9px]" /> Complete
                                        </button>
                                      )}
                                      <button
                                        onClick={() => setSelectedOrderForModal(order)}
                                        className="p-1.5 text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-all"
                                        title="View"
                                      >
                                        <FaEye className="text-[10px]" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Bookings Tab Content */}
      {activeView === 'bookings' && (
        <div className="flex-1 p-3 sm:px-6 sm:py-4 overflow-y-auto">
          {/* New Booking button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button
              onClick={function() { setBookingsEditingBooking(null); setBookingsFormOpen(true); }}
              style={{
                padding: '9px 18px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 2px 8px rgba(245,158,11,0.25)'
              }}
            >
              <FaCalendarCheck size={12} /> New Booking
            </button>
          </div>
          <BookingList
            bookings={bookingsData.map(b => ({
              ...b,
              booking_number: b.bookingNumber,
              customer_name: b.customer?.name || '',
              customer_phone: b.customer?.phone || '',
              event_name: b.eventName,
              event_date: b.eventDate,
              guests: b.guestCount,
              total_amount: b.totalAmount,
              paid_amount: b.paidAmount,
              balance_amount: b.balanceAmount,
            }))}
            loading={bookingsLoading}
            onView={function(booking) { setBookingsSelectedBooking(booking); setBookingsDetailOpen(true); }}
            onEdit={function(booking) { setBookingsEditingBooking(booking); setBookingsFormOpen(true); }}
            onAddPayment={async function(booking) {
              var amountStr = prompt('Payment amount:');
              if (!amountStr) return;
              var amount = parseFloat(amountStr);
              if (isNaN(amount) || amount <= 0) { alert('Invalid amount'); return; }
              var method = prompt('Payment method (cash/card/upi):', 'cash') || 'cash';
              try {
                await apiClient.addBookingPayment(restaurantId, booking.id, { amount: amount, method: method });
                fetchBookingsData();
              } catch (err) { alert('Failed: ' + (err.message || '')); }
            }}
            onComplete={async function(booking) {
              if (!confirm('Mark this booking as completed?')) return;
              try {
                await apiClient.completeBooking(restaurantId, booking.id);
                fetchBookingsData();
              } catch (err) { alert('Failed: ' + (err.message || '')); }
            }}
            onCancel={async function(booking, reason) {
              try {
                await apiClient.deleteBooking(restaurantId, booking.id, reason || '');
                fetchBookingsData();
              } catch (err) { alert('Failed: ' + (err.message || '')); }
            }}
            onDelete={async function(booking, reason) {
              try {
                await apiClient.deleteBooking(restaurantId, booking.id, reason || '', { permanent: true });
                fetchBookingsData();
              } catch (err) { alert('Failed: ' + (err.message || '')); }
            }}
            onShareInvoice={async function(booking) {
              try {
                var resp = await apiClient.getBookingInvoice(restaurantId, booking.id);
                if (resp.invoice) { setBookingsSelectedBooking(resp.invoice); setBookingsDetailOpen(true); }
              } catch (err) { alert('Failed: ' + (err.message || '')); }
            }}
            isMobile={isMobile}
            formatCurrency={formatCurrency}
            filters={bookingsFilters}
            onFiltersChange={setBookingsFilters}
          />
          {bookingsDetailOpen && bookingsSelectedBooking && (
            <BookingDetail
              booking={bookingsSelectedBooking}
              isOpen={bookingsDetailOpen}
              onClose={function() { setBookingsDetailOpen(false); setBookingsSelectedBooking(null); }}
              onAddPayment={async function(booking) {
                var amountStr = prompt('Payment amount:');
                if (!amountStr) return;
                var amount = parseFloat(amountStr);
                if (isNaN(amount) || amount <= 0) { alert('Invalid amount'); return; }
                var method = prompt('Payment method (cash/card/upi):', 'cash') || 'cash';
                try {
                  await apiClient.addBookingPayment(restaurantId, booking.id, { amount: amount, method: method });
                  fetchBookingsData();
                  // Refresh the detail view
                  var resp = await apiClient.getBooking(restaurantId, booking.id);
                  if (resp.booking) setBookingsSelectedBooking(resp.booking);
                } catch (err) { alert('Failed: ' + (err.message || '')); }
              }}
              onComplete={async function(booking) {
                if (!confirm('Mark this booking as completed?')) return;
                try {
                  await apiClient.completeBooking(restaurantId, booking.id);
                  fetchBookingsData();
                  setBookingsDetailOpen(false);
                } catch (err) { alert('Failed: ' + (err.message || '')); }
              }}
              onShareInvoice={async function(booking) {
                try {
                  var resp = await apiClient.getBookingInvoice(restaurantId, booking.id);
                  if (resp.invoice) { setBookingsSelectedBooking(resp.invoice); }
                } catch (err) { alert('Failed: ' + (err.message || '')); }
              }}
              formatCurrency={formatCurrency}
              isMobile={isMobile}
            />
          )}
          <BookingForm
            isOpen={bookingsFormOpen}
            onClose={function() { setBookingsFormOpen(false); setBookingsEditingBooking(null); }}
            onSave={handleBookingSave}
            editingBooking={bookingsEditingBooking}
            venues={bookingVenues}
            restaurantId={restaurantId}
            isMobile={isMobile}
            bookingSettings={bookingSettings}
            onVenuesChange={setBookingVenues}
          />
        </div>
      )}

      {/* KOT Printer Setup Note */}
      {restaurantId && <KOTPrinterNote restaurantId={restaurantId} />}

      {/* Date Filter Modal — rendered via portal to appear above sidebar */}
      {filterModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFilterModalOpen(false)} />
          {/* Modal */}
          <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mx-4" style={{ animation: 'modalSlideIn 0.2s ease-out' }}>
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-white/90 text-sm" />
                <h3 className="text-base font-bold text-white">{t('orderHistory.selectDateRange')}</h3>
              </div>
              <button onClick={() => setFilterModalOpen(false)} className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"><FaTimes className="text-sm" /></button>
            </div>
            {/* Body */}
            <div className="p-5">
              {/* Quick Presets */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { value: 'today', label: t('orderHistory.summaryToday'), icon: '📅' },
                  { value: 'yesterday', label: t('orderHistory.summaryYesterday'), icon: '⏪' },
                  { value: 'last7days', label: t('orderHistory.last7Days'), icon: '📆' },
                  { value: 'last30days', label: t('orderHistory.last30Days'), icon: '🗓' },
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
                  {t('orderHistory.customRange')}
                </button>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 block">{t('orderHistory.from')}</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => { setCustomStartDate(e.target.value); setDateFilterMode('custom'); }}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1 block">{t('orderHistory.toLabel')}</label>
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
                {t('orderHistory.resetToToday')}
              </button>
              <button
                onClick={() => setFilterModalOpen(false)}
                className="px-5 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors shadow-sm"
              >
                {t('orderHistory.apply')}
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
  // Fetch unified bill render payload so on-screen invoice matches exactly
  // what android/electron thermal printers show — same endpoint, same fields,
  // same labels, same totals. Falls back to local computation on failure.
  const [billRender, setBillRender] = useState(null);
  useEffect(() => {
    if (!order?.id || !order?.restaurantId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.getBillRender(order.restaurantId, order.id);
        if (!cancelled && res?.success && res.bill) setBillRender(res);
      } catch (err) {
        console.warn('Bill render fetch (falling back to local compute):', err);
      }
    })();
    return () => { cancelled = true; };
  }, [order?.id, order?.restaurantId]);

  if (!order) return null;

  // Prefer server-assembled render payload when available, fall back to local.
  const b = billRender?.bill;
  const serverLabels = billRender?.labels;
  const serverRestaurant = billRender?.restaurant;

  const btype = (serverRestaurant || restaurant)?.businessType || 'restaurant';
  const invoiceLabels = {
    restaurant: { title: t('orderHistory.invoiceLabels.restaurant.title'), billTo: t('orderHistory.invoiceLabels.restaurant.billTo'), itemCol: t('orderHistory.invoiceLabels.restaurant.itemCol'), footer: t('orderHistory.invoiceLabels.restaurant.footer') },
    bar: { title: t('orderHistory.invoiceLabels.bar.title'), billTo: t('orderHistory.invoiceLabels.bar.billTo'), itemCol: t('orderHistory.invoiceLabels.bar.itemCol'), footer: t('orderHistory.invoiceLabels.bar.footer') },
    bakery: { title: t('orderHistory.invoiceLabels.bakery.title'), billTo: t('orderHistory.invoiceLabels.bakery.billTo'), itemCol: t('orderHistory.invoiceLabels.bakery.itemCol'), footer: t('orderHistory.invoiceLabels.bakery.footer') },
    ice_cream: { title: t('orderHistory.invoiceLabels.ice_cream.title'), billTo: t('orderHistory.invoiceLabels.ice_cream.billTo'), itemCol: t('orderHistory.invoiceLabels.ice_cream.itemCol'), footer: t('orderHistory.invoiceLabels.ice_cream.footer') },
    cafe: { title: t('orderHistory.invoiceLabels.cafe.title'), billTo: t('orderHistory.invoiceLabels.cafe.billTo'), itemCol: t('orderHistory.invoiceLabels.cafe.itemCol'), footer: t('orderHistory.invoiceLabels.cafe.footer') },
    qsr: { title: t('orderHistory.invoiceLabels.qsr.title'), billTo: t('orderHistory.invoiceLabels.qsr.billTo'), itemCol: t('orderHistory.invoiceLabels.qsr.itemCol'), footer: t('orderHistory.invoiceLabels.qsr.footer') }
  };
  const iLabels = serverLabels || invoiceLabels[btype] || invoiceLabels.restaurant;
  const orderTotal = b?.grandTotal ?? calculateOrderTotal(order);
  const subtotal = b?.subtotal ?? (order.items?.reduce((sum, item) => sum + (item.total || (item.price * item.quantity) || 0), 0) || 0);
  const taxAmount = b?.totalTax ?? b?.taxAmount ?? order.taxAmount ?? Math.max(0, orderTotal - subtotal);
  const offerDiscount = b?.discountAmount ?? order.discountAmount ?? 0;
  const manualDiscountAmt = b?.manualDiscount ?? order.manualDiscount ?? 0;
  const loyaltyDiscountAmt = b?.loyaltyDiscount ?? order.loyaltyDiscount ?? 0;
  const couponDiscountAmt = order.couponDiscount ?? 0;
  const totalDiscount = b?.totalDiscount ?? (offerDiscount + manualDiscountAmt + loyaltyDiscountAmt + couponDiscountAmt);
  const invoiceNumber = b?.dailyOrderId || order.dailyOrderId || order.orderNumber || (order.id ? order.id.slice(-4).toUpperCase() : 'N/A');
  
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10200] flex items-center justify-center p-4 no-print">
        <div className={`bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-gray-200 ${typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__ ? '' : 'max-h-[90vh]'}`} style={typeof window !== 'undefined' && window.__DINEOPEN_MOBILE_EMBED__ ? { maxHeight: 'calc(var(--app-height, 90vh) - 8px)' } : {}}>
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white no-print">
            <h2 className="text-2xl font-bold text-gray-900">{t('orderHistory.invoiceHash')}{invoiceNumber}</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={onDownloadPDF}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2"
              >
                <FaDownload /> {t('orderHistory.downloadPDF')}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant?.name || t('orderHistory.restaurant')}</h1>
                    {restaurant?.address && <p className="text-gray-600 text-sm">{restaurant.address}</p>}
                    {restaurant?.phone && <p className="text-gray-600 text-sm">{t('orderHistory.phone')} {restaurant.phone}</p>}
                    {restaurant?.email && <p className="text-gray-600 text-sm">{t('orderHistory.email')} {restaurant.email}</p>}
                    {restaurant?.gstin && <p className="text-gray-600 text-sm">{t('orderHistory.gstinLabel')} {restaurant.gstin}</p>}
                  </div>
                  <div className="text-right">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{iLabels.title}</h2>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>{t('orderHistory.invoiceNumberLabel')}</strong> {invoiceNumber}</p>
                      <p><strong>{t('orderHistory.date')}</strong> {formatDate(order.createdAt)}</p>
                      {order.status && <p><strong>{t('orderHistory.statusLabel')}</strong> <span className="uppercase">{order.status}</span></p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">{iLabels.billTo}:</h3>
                  <div className="text-gray-900">
                    <p className="font-semibold">{order.customerDisplay?.name || t('orderHistory.walkInCustomer')}</p>
                    {order.customerDisplay?.phone && <p className="text-sm">{t('orderHistory.phone')} {order.customerDisplay.phone}</p>}
                    {order.customerDisplay?.email && <p className="text-sm">{t('orderHistory.email')} {order.customerDisplay.email}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">{t('orderHistory.orderDetails')}</h3>
                  <div className="text-gray-900 text-sm">
                    {(order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber) ? (
                      <p>{t('orderHistory.roomLabel')} {order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber}</p>
                    ) : (
                      order.customerDisplay?.tableNumber && <p>{t('orderHistory.tableLabel')} {order.customerDisplay.tableNumber}</p>
                    )}
                    {order.customerDisplay?.floorName && !order.roomNumber && !order.customerDisplay?.roomNumber && !order.customerInfo?.roomNumber && <p>{t('orderHistory.floorLabel')} {order.customerDisplay.floorName}</p>}
                    {order.orderType && <p>{t('orderHistory.typeLabel')} <span className="capitalize">{order.orderType.replace('-', ' ')}</span></p>}
                    {order.subRestaurantName && <p>Outlet: <span className="font-semibold">{order.subRestaurantName}</span></p>}
                    {order.paymentMethod && <p>{t('orderHistory.paymentLabel')} <span className="capitalize">{order.paymentMethod}</span></p>}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">{iLabels.itemCol}</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">{t('orderHistory.qty')}</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('orderHistory.unitPrice')}</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('orderHistory.total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, i) => (
                      <tr key={i} className="border-b border-gray-200">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {item.name}
                            {item.isCustomItem && (
                              <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                                CUSTOM ITEM
                              </span>
                            )}
                            {item.priceEdited && (
                              <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                PRICE EDITED
                              </span>
                            )}
                          </div>
                          {(item.selectedVariant || item.variant) && (
                            <div className="text-xs text-gray-500 mt-1">{t('orderHistory.variantLabel')} {(item.selectedVariant || item.variant)?.name || item.selectedVariant || item.variant}</div>
                          )}
                          {(item.selectedCustomizations?.length > 0 || item.addons?.length > 0) && (
                            <div className="text-xs text-gray-500 mt-1">{t('orderHistory.addonsLabel')} {(item.selectedCustomizations || item.addons).map(a => a.name).join(', ')}</div>
                          )}
                          {item.notes && (
                            <div className="text-xs text-amber-700 mt-1 italic">{t('orderHistory.noteLabel')} {item.notes}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-700">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {formatCurrency(item.price)}
                          {item.priceEdited && item.menuPrice != null && (
                            <div className="text-[10px] text-amber-600">
                              was <span className="line-through">{formatCurrency(item.menuPrice)}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(item.total || (item.price * item.quantity))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded">
                  <p className="text-sm text-amber-900"><strong>{t('orderHistory.orderNotes')}</strong> {order.notes}</p>
                </div>
              )}

              {/* Totals */}
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-700">
                      <span>{t('orderHistory.subtotalLabel2')}</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {offerDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{(typeof order.appliedOffer === 'string' ? order.appliedOffer : order.appliedOffer?.name) || order.selectedOfferName || t('orderHistory.offerDiscount')}:</span>
                        <span>-{formatCurrency(offerDiscount)}</span>
                      </div>
                    )}
                    {manualDiscountAmt > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{t('orderHistory.manualDiscount')}</span>
                        <span>-{formatCurrency(manualDiscountAmt)}</span>
                      </div>
                    )}
                    {loyaltyDiscountAmt > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{t('orderHistory.loyaltyPoints')}</span>
                        <span>-{formatCurrency(loyaltyDiscountAmt)}</span>
                      </div>
                    )}
                    {order.couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{order.couponCode ? `Coupon (${order.couponCode})` : 'Coupon Discount'}</span>
                        <span>-{formatCurrency(order.couponDiscount)}</span>
                      </div>
                    )}
                    {order.serviceChargeAmount > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Service Charge{order.serviceChargeRate ? ` (${order.serviceChargeRate}%)` : ''}</span>
                        <span>{formatCurrency(order.serviceChargeAmount)}</span>
                      </div>
                    )}
                    {order.taxBreakdown && order.taxBreakdown.length > 0 ? (
                      order.taxBreakdown.map((tax, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700">
                          <span>{tax.name} ({tax.rate}%){tax.inclusive ? ' (Incl.)' : ''}</span>
                          <span>{formatCurrency(tax.amount || 0)}</span>
                        </div>
                      ))
                    ) : taxAmount > 0 ? (
                      <div className="flex justify-between text-gray-700">
                        <span>{t('orderHistory.taxLabel')}</span>
                        <span>{formatCurrency(taxAmount)}</span>
                      </div>
                    ) : null}
                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>{t('orderHistory.youSaved')}</span>
                        <span>{formatCurrency(totalDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                      <span>{t('orderHistory.totalLabel')}</span>
                      <span className="text-red-600">{formatCurrency(orderTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                <p className="font-medium">{iLabels.footer}</p>
                <p className="mt-2">{t('orderHistory.forAnyQueries')}</p>
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
                <FaPrint /> {t('orderHistory.printDownloadPDF')}
              </button>
              <button 
                onClick={onClose}
                className="px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
              >
                {t('orderHistory.close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
