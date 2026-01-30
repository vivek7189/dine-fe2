'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Pusher from 'pusher-js';
import apiClient from '../../../lib/api';
import { t, getCurrentLanguage } from '../../../lib/i18n';
import { getCachedOrderHistoryData, setCachedOrderHistoryData } from '../../../utils/dashboardCache';
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
  FaRupeeSign,
  FaChartLine,
  FaShoppingBag,
  FaArrowUp,
  FaArrowDown,
  FaFileInvoice,
  FaDownload,
  FaPrint
} from 'react-icons/fa';

const OrderHistory = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrderType, setSelectedOrderType] = useState('all');
  const [myOrdersOnly, setMyOrdersOnly] = useState(false);
  const [todayOrdersOnly, setTodayOrdersOnly] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [taxSettings, setTaxSettings] = useState(null);
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

  const getStatusStyle = (status, orderFlow) => {
    if (orderFlow?.isDirectBilling) return { bg: '#dcfce7', text: '#166534', border: '#86efac', label: 'Billing Completed' };
    if (orderFlow?.isKitchenOrder) return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', label: 'Kitchen' };
    if (status === 'completed') return { bg: '#dcfce7', text: '#166534', border: '#86efac', label: 'Completed' };
    if (status === 'confirmed') return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd', label: 'Confirmed' };
    if (status === 'pending') return { bg: '#fef3c7', text: '#92400e', border: '#fde68a', label: 'Pending' };
    if (status === 'cancelled') return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', label: 'Cancelled' };
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
    if (isStaff) return { label: 'Staff', className: 'bg-slate-100 text-slate-700 border-slate-300' };
    // Explicit source or inferred from notes (legacy orders from public online page)
    if (src === 'online_order' || looksLikePublicOnline) return { label: 'Online order', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (src === 'crave_app' || src === 'customer_app') return { label: 'Dine App', className: 'bg-pink-50 text-pink-700 border-pink-200' };
    return null;
  };

  const fetchOrders = useCallback(async (useCache = true) => {
    if (!restaurantId) return;
    
    // Create cache key based on filters
    const cacheKey = `${currentPage}_${selectedStatus}_${selectedOrderType}_${myOrdersOnly}_${todayOrdersOnly}_${searchTerm.trim()}`;
    
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
      const filters = {
        page: currentPage,
        limit: limit,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        orderType: selectedOrderType !== 'all' ? selectedOrderType : undefined,
        myOrdersOnly: myOrdersOnly ? user?.id : undefined,
        search: searchTerm.trim() || undefined,
        todayOnly: todayOrdersOnly
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
      
      // Cache the data
      const dataToCache = {
        orders: filteredOrders,
        totalPages: response.pagination?.totalPages || 1,
        totalOrders: response.pagination?.totalOrders || filteredOrders.length
      };
      setCachedOrderHistoryData(restaurantId, dataToCache, cacheKey);
      console.log('✅ Order history data cached');
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(t('common.error'));
      setOrders([]);
    } finally {
      setLoading(false);
      setBackgroundLoading(false);
      window.dispatchEvent(new CustomEvent('orderhistoryBackgroundLoading', { detail: { loading: false } }));
    }
  }, [restaurantId, currentPage, limit, selectedStatus, selectedOrderType, myOrdersOnly, searchTerm, todayOrdersOnly, user?.id]);

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

        // 1. For staff members - use assigned restaurant from user data
        if (userData.restaurantId) {
          finalRestaurantId = userData.restaurantId;
          finalRestaurant = {
            id: userData.restaurantId,
            name: userData.restaurant?.name || 'Restaurant'
          };
          console.log('👨‍💼 OrderHistory: Using staff assigned restaurant:', finalRestaurantId);
        }
        // 2. For owners - try saved restaurant first
        else {
          const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
          const savedRestaurant = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');

          if (savedRestaurantId && savedRestaurant) {
            finalRestaurantId = savedRestaurantId;
            finalRestaurant = savedRestaurant;
            console.log('💾 OrderHistory: Using saved restaurant from localStorage:', finalRestaurantId);
          }
          // 3. If no saved restaurant, fetch from API
          else {
            console.log('🔄 OrderHistory: No saved restaurant, fetching from API...');
            try {
              const restaurantsResponse = await apiClient.getRestaurants();
              if (restaurantsResponse.restaurants && restaurantsResponse.restaurants.length > 0) {
                const firstRestaurant = restaurantsResponse.restaurants[0];
                finalRestaurantId = firstRestaurant.id;
                finalRestaurant = firstRestaurant;
                console.log('✅ OrderHistory: Using first restaurant from API:', finalRestaurantId);

                // Save to localStorage for future use
                localStorage.setItem('selectedRestaurantId', finalRestaurantId);
                localStorage.setItem('selectedRestaurant', JSON.stringify(finalRestaurant));
              } else {
                console.warn('⚠️ OrderHistory: No restaurants found in API response');
              }
            } catch (error) {
              console.error('❌ OrderHistory: Error fetching restaurants:', error);
            }
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

  useEffect(() => {
    const loadTaxSettings = async () => {
      if (!restaurantId) return;
      try {
        const taxSettingsResponse = await apiClient.getTaxSettings(restaurantId);
        if (taxSettingsResponse.success) setTaxSettings(taxSettingsResponse.taxSettings);
      } catch (error) { console.error('Error loading tax settings:', error); }
    };
    loadTaxSettings();
  }, [restaurantId]);

  useEffect(() => { if (restaurantId) fetchOrders(true); }, [fetchOrders, restaurantId]);

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

  useEffect(() => { if (currentPage !== 1) setCurrentPage(1); }, [selectedStatus, selectedOrderType, myOrdersOnly, searchTerm, todayOrdersOnly, currentPage]);

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

  const handleEditOrder = (orderId) => router.push(`/dashboard?orderId=${orderId}&mode=edit`);

  const handleSmartPrint = (order) => {
    const restaurantName = restaurant?.name || 'Restaurant';
    const orderNum = order.dailyOrderId ?? order.orderNumber ?? order.id ?? '—';
    const orderIdShort = order.id ? String(order.id).slice(-8).toUpperCase() : '';
    const rawDate = order.createdAt;
    const orderDate = !rawDate ? new Date() : (typeof rawDate?.toDate === 'function' ? rawDate.toDate() : (rawDate?._seconds ? new Date(rawDate._seconds * 1000) : new Date(rawDate)));
    const dateStr = orderDate.toLocaleString();
    const tableNum = order.tableNumber || order.customerDisplay?.tableNumber || order.customerInfo?.tableNumber || null;
    const roomNum = order.roomNumber || order.customerDisplay?.roomNumber || order.customerInfo?.roomNumber || null;
    const customerName = order.customerDisplay?.name || order.customerInfo?.name || null;
    const orderType = order.orderType || null;
    const items = order.items || [];

    if (order.status === 'completed') {
      const subtotal = items.reduce((sum, item) => sum + (item.total || (item.price * item.quantity) || 0), 0);
      let totalTax = 0;
      const taxBreakdown = [];
      if (taxSettings?.enabled && taxSettings?.taxes?.length) {
        taxSettings.taxes.forEach(t => {
          if (t.enabled && t.rate != null) {
            const amt = subtotal * (t.rate / 100);
            totalTax += amt;
            taxBreakdown.push({ name: t.name || 'Tax', rate: t.rate, amount: amt });
          }
        });
      } else if (taxSettings?.defaultTaxRate) {
        const amt = subtotal * (taxSettings.defaultTaxRate / 100);
        totalTax = amt;
        taxBreakdown.push({ name: 'Tax', rate: taxSettings.defaultTaxRate, amount: amt });
      }
      const total = subtotal + totalTax;
      const taxRows = taxBreakdown.map(t => `<tr><td>${(t.name || 'Tax').replace(/</g, '&lt;')} (${t.rate}%)</td><td>₹${(t.amount || 0).toFixed(2)}</td></tr>`).join('');
      const invoiceContent = `<!DOCTYPE html><html><head><title>Invoice - ${orderNum}</title><style>body{font-family:Arial,sans-serif;margin:20px;} .invoice-header{text-align:center;margin-bottom:20px;} .invoice-details{margin-bottom:20px;} table{width:100%;border-collapse:collapse;} th,td{padding:8px;text-align:left;border-bottom:1px solid #ddd;} .total-row{font-weight:bold;border-top:2px solid #000;} .invoice-footer{text-align:center;margin-top:30px;font-size:12px;color:#666;}</style></head><body><div class="invoice-header"><h1>Invoice #${String(orderNum).replace(/</g, '&lt;')}</h1><h2>${restaurantName.replace(/</g, '&lt;')}</h2></div><div class="invoice-details"><p><strong>Order #:</strong> ${String(orderNum).replace(/</g, '&lt;')}</p><p><strong>ID:</strong> ${orderIdShort}</p><p><strong>Date:</strong> ${dateStr}</p>${tableNum ? `<p><strong>Table:</strong> ${String(tableNum).replace(/</g, '&lt;')}</p>` : ''}${roomNum ? `<p><strong>Room:</strong> ${String(roomNum).replace(/</g, '&lt;')}</p>` : ''}${customerName ? `<p><strong>Customer:</strong> ${String(customerName).replace(/</g, '&lt;')}</p>` : ''}</div><table><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody><tr><td>Subtotal</td><td>₹${subtotal.toFixed(2)}</td></tr>${taxRows}<tr class="total-row"><td>Total</td><td>₹${total.toFixed(2)}</td></tr></tbody></table><div class="invoice-footer"><p>Thank you for your business!</p><p>DineOpen</p></div></body></html>`;
      const win = window.open('', '_blank', 'width=800,height=600');
      if (win) {
        win.document.write(invoiceContent);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 500);
      }
    } else {
      const tableOrRoom = roomNum ? `Room: ${roomNum}` : (tableNum ? `Table: ${tableNum}` : '');
      const kotContent = `<!DOCTYPE html><html><head><title>KOT - ${orderNum}</title><style>body{font-family:monospace;margin:16px;font-size:14px;} .kot-header{text-align:center;border-bottom:2px dashed #000;padding-bottom:8px;margin-bottom:12px;} .kot-title{font-size:18px;font-weight:bold;} .kot-info{margin-bottom:12px;} table{width:100%;border-collapse:collapse;} th,td{padding:4px 8px;text-align:left;border-bottom:1px solid #ddd;} th{background:#f3f4f6;} .kot-footer{text-align:center;margin-top:16px;border-top:2px dashed #000;padding-top:8px;font-size:12px;}</style></head><body><div class="kot-header"><div class="kot-title">--- KITCHEN ORDER ---</div><div>${restaurantName.replace(/</g, '&lt;')}</div></div><div class="kot-info"><div><strong>Order #:</strong> ${String(orderNum).replace(/</g, '&lt;')}</div>${orderIdShort ? `<div><strong>ID:</strong> ${orderIdShort}</div>` : ''}<div><strong>Date:</strong> ${dateStr}</div>${tableOrRoom ? `<div><strong>${roomNum ? 'Room' : 'Table'}:</strong> ${roomNum || tableNum}</div>` : ''}${customerName ? `<div><strong>Customer:</strong> ${String(customerName).replace(/</g, '&lt;')}</div>` : ''}${orderType ? `<div><strong>Type:</strong> ${String(orderType).replace(/</g, '&lt;')}</div>` : ''}</div><table><thead><tr><th>Item</th><th>Qty</th><th>Note</th></tr></thead><tbody>${items.map(i => `<tr><td>${(i.name || '').replace(/</g, '&lt;')}</td><td>${i.quantity || 1}</td><td>${(i.notes || '-').replace(/</g, '&lt;')}</td></tr>`).join('')}</tbody></table><div class="kot-footer">Thank you - DineOpen KOT</div></body></html>`;
      const pw = window.open('', '_blank', 'width=400,height=600');
      if (pw) {
        pw.document.write(kotContent);
        pw.document.close();
        pw.focus();
        setTimeout(() => { pw.print(); }, 400);
      }
    }
  };

  const getOrderBreakdown = (order) => {
    let subtotal = 0;
    if (order.items && Array.isArray(order.items)) {
      subtotal = order.items.reduce((sum, item) => sum + (item.total || (item.price * item.quantity) || 0), 0);
    } else if (order.totalAmount && order.totalAmount > 0) subtotal = order.totalAmount;
    subtotal = parseFloat(subtotal.toFixed(2));
    let taxAmount = 0;
    const taxLines = [];
    if (taxSettings?.enabled && subtotal > 0) {
      if (taxSettings.taxes && taxSettings.taxes.length > 0) {
        taxSettings.taxes.forEach(tax => {
          if (tax.enabled && tax.rate != null) {
            const amt = parseFloat((subtotal * (tax.rate / 100)).toFixed(2));
            taxAmount += amt;
            taxLines.push({ name: tax.name || 'Tax', rate: tax.rate, amount: amt });
          }
        });
      } else if (taxSettings.defaultTaxRate) {
        taxAmount = parseFloat((subtotal * (taxSettings.defaultTaxRate / 100)).toFixed(2));
        taxLines.push({ name: 'GST', rate: taxSettings.defaultTaxRate, amount: taxAmount });
      }
    } else if (order.taxAmount && order.taxAmount > 0) {
      taxAmount = parseFloat(order.taxAmount.toFixed(2));
      taxLines.push({ name: 'Tax', rate: null, amount: taxAmount });
    }
    const total = parseFloat((subtotal + taxAmount).toFixed(2));
    return { subtotal, taxAmount, taxLines, total };
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

  // Calculate summary statistics
  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : 
                       (order.createdAt?._seconds ? new Date(order.createdAt._seconds * 1000) : new Date(order.createdAt));
      return orderDate >= today && order.status !== 'cancelled';
    });

    const totalRevenue = todayOrders.reduce((sum, order) => sum + calculateOrderTotal(order), 0);
    const orderCount = todayOrders.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
    const completedCount = todayOrders.filter(o => o.status === 'completed').length;

    return {
      totalRevenue,
      orderCount,
      avgOrderValue,
      completedCount
    };
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    const statusStyle = getStatusStyle(order.status, order.orderFlow);
    const orderTotal = calculateOrderTotal(order);
    const subtotal = order.items?.reduce((sum, item) => sum + (item.total || item.price * item.quantity), 0) || 0;
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
                        <td className="px-5 py-4 text-right text-gray-600">₹{item.price}</td>
                        <td className="px-5 py-4 text-right font-bold text-gray-900">₹{item.total || (item.price * item.quantity)}</td>
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
                <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="font-medium">{t('orderHistory.tax')}</span>
                  <span className="font-semibold">₹{order.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {(!order.taxAmount && taxSettings?.enabled) && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="font-medium">{t('orderHistory.estimatedTax')}</span>
                  <span className="font-semibold">₹{(parseFloat(orderTotal) - subtotal).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300 mt-2">
                <span>{t('orderHistory.total')}</span>
                <span className="text-red-600">₹{orderTotal}</span>
              </div>
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
        className={`w-full px-4 py-2.5 text-left bg-white border-2 rounded-lg flex items-center justify-between text-sm font-medium transition-all shadow-sm ${isOpen ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon className="text-gray-400" />}
          <span className="text-gray-700">{options.find(opt => opt.value === selectedValue)?.label || placeholder}</span>
        </div>
        <FaChevronDown className={`text-gray-400 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-56 overflow-auto">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => { onSelect(option.value); onToggle(); }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${selectedValue === option.value ? 'bg-red-50 text-red-700 font-semibold border-l-4 border-red-500' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-3xl text-red-600 mb-3" />
          <p className="text-sm text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'all', label: t('orderHistory.status.all') },
    { value: 'pending', label: t('orderHistory.status.pending') },
    { value: 'confirmed', label: t('orderHistory.status.confirmed') },
    { value: 'completed', label: t('orderHistory.status.completed') },
    { value: 'cancelled', label: t('orderHistory.status.cancelled') }
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

          {/* Summary Stats Cards — extra compact on mobile, 2x2 grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-4 pb-2 sm:pb-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-md sm:rounded-xl p-2 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-0.5 sm:mb-2">
                <div className="bg-green-500 p-1 sm:p-2 rounded-md sm:rounded-lg">
                  <FaRupeeSign className="text-white text-[10px] sm:text-sm" />
                </div>
                <FaArrowUp className="text-green-600 text-[8px] sm:text-xs hidden sm:block" />
              </div>
              <div className="text-sm sm:text-2xl font-bold text-gray-900 leading-tight">₹{stats.totalRevenue.toFixed(0)}</div>
              <div className="text-[9px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 leading-tight">Today&apos;s Revenue</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-md sm:rounded-xl p-2 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-0.5 sm:mb-2">
                <div className="bg-blue-500 p-1 sm:p-2 rounded-md sm:rounded-lg">
                  <FaShoppingBag className="text-white text-[10px] sm:text-sm" />
                </div>
                <FaArrowUp className="text-blue-600 text-[8px] sm:text-xs hidden sm:block" />
              </div>
              <div className="text-sm sm:text-2xl font-bold text-gray-900 leading-tight">{stats.orderCount}</div>
              <div className="text-[9px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 leading-tight">Total Orders</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-md sm:rounded-xl p-2 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-0.5 sm:mb-2">
                <div className="bg-purple-500 p-1 sm:p-2 rounded-md sm:rounded-lg">
                  <FaChartLine className="text-white text-[10px] sm:text-sm" />
                </div>
                <FaArrowUp className="text-purple-600 text-[8px] sm:text-xs hidden sm:block" />
              </div>
              <div className="text-sm sm:text-2xl font-bold text-gray-900 leading-tight">₹{stats.avgOrderValue.toFixed(0)}</div>
              <div className="text-[9px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 leading-tight">Avg Order Value</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-md sm:rounded-xl p-2 sm:p-4 shadow-sm">
              <div className="flex items-center justify-between mb-0.5 sm:mb-2">
                <div className="bg-amber-500 p-1 sm:p-2 rounded-md sm:rounded-lg">
                  <FaCheckCircle className="text-white text-[10px] sm:text-sm" />
                </div>
                <FaArrowUp className="text-amber-600 text-[8px] sm:text-xs hidden sm:block" />
              </div>
              <div className="text-sm sm:text-2xl font-bold text-gray-900 leading-tight">{stats.completedCount}</div>
              <div className="text-[9px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 leading-tight">Completed</div>
            </div>
          </div>

          {/* Filters Section — on mobile: search + collapse toggle; filters in expandable panel */}
          <div className="py-3 sm:py-4 border-t border-gray-200">
            {isMobile ? (
              <>
                <div className="flex gap-2 items-stretch">
                  <div className="flex-1 relative min-w-0">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                    <input 
                      type="text" 
                      placeholder={t('orderHistory.searchPlaceholder')} 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all" 
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 shrink-0 transition-all ${mobileFiltersOpen ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'}`}
                    aria-expanded={mobileFiltersOpen}
                  >
                    <FaFilter className="text-sm" />
                    <FaChevronDown className={`text-xs transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {mobileFiltersOpen && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <FilterDropdown 
                      isOpen={statusDropdownOpen} 
                      onToggle={() => setStatusDropdownOpen(!statusDropdownOpen)} 
                      selectedValue={selectedStatus} 
                      options={statusOptions} 
                      onSelect={setSelectedStatus} 
                      placeholder={t('common.status')} 
                      icon={FaFilter} 
                    />
                    <FilterDropdown 
                      isOpen={typeDropdownOpen} 
                      onToggle={() => setTypeDropdownOpen(!typeDropdownOpen)} 
                      selectedValue={selectedOrderType} 
                      options={typeOptions} 
                      onSelect={setSelectedOrderType} 
                      placeholder={t('common.category')} 
                      icon={FaUtensils} 
                    />
                    <div className="flex flex-wrap gap-2">
                      <label className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-sm border ${todayOrdersOnly ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                        <input 
                          type="checkbox" 
                          checked={todayOrdersOnly} 
                          onChange={(e) => setTodayOrdersOnly(e.target.checked)} 
                          className="w-3.5 h-3.5 text-red-600 rounded focus:ring-red-500 border-gray-300" 
                        />
                        <span className="font-medium">{t('orderHistory.today')}</span>
                      </label>
                      <label className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-sm border ${myOrdersOnly ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200'}`}>
                        <input 
                          type="checkbox" 
                          checked={myOrdersOnly} 
                          onChange={(e) => setMyOrdersOnly(e.target.checked)} 
                          className="w-3.5 h-3.5 text-red-600 rounded focus:ring-red-500 border-gray-300" 
                        />
                        <span className="font-medium">{t('orderHistory.mine')}</span>
                      </label>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4 lg:col-span-5 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={t('orderHistory.searchPlaceholder')} 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                    className="w-full pl-11 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all shadow-sm" 
                  />
                </div>
                <div className="sm:col-span-3 lg:col-span-2">
                  <FilterDropdown 
                    isOpen={statusDropdownOpen} 
                    onToggle={() => setStatusDropdownOpen(!statusDropdownOpen)} 
                    selectedValue={selectedStatus} 
                    options={statusOptions} 
                    onSelect={setSelectedStatus} 
                    placeholder={t('common.status')} 
                    icon={FaFilter} 
                  />
                </div>
                <div className="sm:col-span-3 lg:col-span-2">
                  <FilterDropdown 
                    isOpen={typeDropdownOpen} 
                    onToggle={() => setTypeDropdownOpen(!typeDropdownOpen)} 
                    selectedValue={selectedOrderType} 
                    options={typeOptions} 
                    onSelect={setSelectedOrderType} 
                    placeholder={t('common.category')} 
                    icon={FaUtensils} 
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2 sm:justify-end">
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all shadow-sm ${todayOrdersOnly ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="checkbox" 
                      checked={todayOrdersOnly} 
                      onChange={(e) => setTodayOrdersOnly(e.target.checked)} 
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300" 
                    />
                    <span className="text-sm font-medium">{t('orderHistory.today')}</span>
                  </label>
                  <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all shadow-sm ${myOrdersOnly ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="checkbox" 
                      checked={myOrdersOnly} 
                      onChange={(e) => setMyOrdersOnly(e.target.checked)} 
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300" 
                    />
                    <span className="text-sm font-medium">{t('orderHistory.mine')}</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
        
      {/* Orders List */}
      <div className="flex-1 p-4 sm:px-6 sm:py-6 overflow-y-auto">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaSearch className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('orderHistory.noOrders')}</h3>
              <p className="text-sm text-gray-500">{t('orderHistory.adjustFilters')}</p>
            </div>
          ) : (
            <div className="space-y-4">
            {orders.map((order) => {
              const statusStyle = getStatusStyle(order.status, order.orderFlow);
              const orderTotal = calculateOrderTotal(order);
              const breakdown = getOrderBreakdown(order);
              const itemCount = Array.isArray(order.items) ? order.items.length : 0;
              const sourceChip = getOrderSourceChip(order);
              
              if (isCompactView) {
                return (
                  <div key={order.id} className="bg-white rounded-xl shadow-md border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200 group overflow-hidden">
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-1.5 h-16 rounded-full flex-shrink-0" style={{ backgroundColor: statusStyle.border }} />
                      <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-12 sm:col-span-3 flex sm:flex-col items-center sm:items-start justify-between sm:justify-center gap-2">
                          <div 
                            onClick={() => copyToClipboard(order.dailyOrderId?.toString() || order.id)} 
                            className="font-bold text-lg text-gray-900 cursor-pointer hover:text-red-600 flex items-center gap-2 transition-colors"
                          >
                            <span>#{order.dailyOrderId || order.orderNumber || order.id.slice(-4).toUpperCase()}</span>
                            <FaCopy className="text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
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
                          </div>
                          <span className="text-xs text-gray-500 font-medium">{order.paymentMethod || 'Cash'}</span>
                        </div>
                        <div className="col-span-6 sm:col-span-2 flex flex-col items-end gap-2">
                          <div className="text-right space-y-0.5">
                            {breakdown.taxLines?.length > 0 && (
                              <>
                                <div className="text-xs text-gray-500">Subtotal ₹{breakdown.subtotal.toFixed(2)}</div>
                                {breakdown.taxLines.map((line, i) => (
                                  <div key={i} className="text-xs text-gray-500">{line.name}{line.rate != null ? ` (${line.rate}%)` : ''} ₹{line.amount.toFixed(2)}</div>
                                ))}
                              </>
                            )}
                            <span className="font-bold text-xl text-gray-900">₹{orderTotal}</span>
                          </div>
                          <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                                <button 
                                onClick={() => handleMarkCompleted(order.id)} 
                                className="p-2 text-green-600 bg-green-100 hover:bg-green-200 rounded-lg transition-colors" 
                                title="Mark Bill Complete"
                                >
                                <FaCheckCircle size={12} />
                                </button>
                            )}
                            <button 
                              onClick={() => handleViewInvoice(order)} 
                              className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors" 
                              title="Invoice"
                            >
                              <FaFileInvoice size={12} />
                            </button>
                            <button 
                              onClick={() => handleSmartPrint(order)} 
                              className="p-2 text-orange-600 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors" 
                              title="Print"
                            >
                              <FaPrint size={12} />
                            </button>
                            <button 
                              onClick={() => handleViewOrder(order)} 
                              className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" 
                              title={t('orderHistory.view')}
                            >
                              <FaEye size={12} />
                            </button>
                            <button 
                              onClick={() => handleEditOrder(order.id)} 
                              className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm" 
                              title={t('orderHistory.edit')}
                            >
                              <FaEdit size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                          <div 
                            onClick={() => copyToClipboard(String(order.dailyOrderId ?? order.orderNumber ?? order.id))}
                            className="flex items-center justify-start gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1.5 -mx-1 transition-colors text-left"
                            title="Click to copy Order Number"
                          >
                            <span className="text-xs font-semibold text-gray-700">Order Number</span>
                            <span className="text-xs font-mono font-semibold text-gray-700">#{order.dailyOrderId ?? order.orderNumber ?? order.id?.slice(-4)?.toUpperCase() ?? '—'}</span>
                            <FaCopy className="text-gray-400 text-xs flex-shrink-0 ml-auto" />
                          </div>
                          <div 
                            onClick={() => copyToClipboard(order.id)}
                            className="flex items-center justify-start gap-2 cursor-pointer hover:bg-gray-50 rounded px-2 py-1.5 -mx-1 transition-colors text-left"
                            title="Click to copy Order ID"
                          >
                            <span className="text-xs font-semibold text-gray-700">Order ID</span>
                            <span className="text-xs font-mono font-semibold text-gray-700 truncate max-w-[140px] sm:max-w-[220px]" title={order.id}>{order.id}</span>
                            <FaCopy className="text-gray-400 text-xs flex-shrink-0 ml-auto" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-md border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200 group overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <FaReceipt className="text-red-600 text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">
                                #{order.dailyOrderId || order.orderNumber || order.id.slice(-4).toUpperCase()}
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
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FaClock className="text-[10px]" />
                              {formatDate(order.createdAt, true)}
                            </div>
                          </div>
                          <div className="text-right">
                            {breakdown.taxLines?.length > 0 ? (
                              <div className="space-y-0.5 mb-1">
                                <div className="text-xs text-gray-500">Subtotal ₹{breakdown.subtotal.toFixed(2)}</div>
                                {breakdown.taxLines.map((line, i) => (
                                  <div key={i} className="text-xs text-gray-500">{line.name}{line.rate != null ? ` (${line.rate}%)` : ''} ₹{line.amount.toFixed(2)}</div>
                                ))}
                              </div>
                            ) : null}
                            <div className="text-2xl font-bold text-gray-900 mb-1">₹{orderTotal}</div>
                            <div className="text-xs text-gray-500">{order.paymentMethod || 'Cash'}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
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
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">{itemCount} {t('orderHistory.items')}</span>
                            <button 
                              onClick={() => toggleOrderExpansion(order.id)} 
                              className="text-red-600 hover:text-red-700 flex items-center gap-1.5 text-sm font-medium transition-colors"
                            >
                              {expandedOrders.has(order.id) ? t('common.close') : t('common.view')} 
                              {expandedOrders.has(order.id) ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {(expandedOrders.has(order.id) ? order.items : order.items.slice(0, 2)).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm py-1">
                                <span className="text-gray-700">{item.quantity}x {item.name}</span>
                                <span className="font-medium text-gray-900">₹{item.total || (item.price * item.quantity)}</span>
                              </div>
                            ))}
                            {!expandedOrders.has(order.id) && itemCount > 2 && (
                              <div className="text-xs text-gray-500 pt-1">+{itemCount - 2} {t('common.more')}...</div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleMarkCompleted(order.id)} 
                              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-all flex items-center gap-2"
                            >
                              <FaCheckCircle /> Mark Bill Complete
                            </button>
                          )}
                          <button 
                            onClick={() => handleViewOrder(order)} 
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center gap-2 shadow-sm"
                          >
                            <FaEye /> {t('orderHistory.view')}
                          </button>
                          <button 
                            onClick={() => handleViewInvoice(order)} 
                            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-2"
                          >
                            <FaFileInvoice /> Invoice
                          </button>
                          <button 
                            onClick={() => handleSmartPrint(order)} 
                            className="px-4 py-2 text-sm font-medium text-orange-700 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-all flex items-center gap-2"
                            title={order.status === 'completed' ? 'Print bill' : 'Print KOT'}
                          >
                            <FaPrint /> Print
                          </button>
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleCancelOrder(order.id)} 
                              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-all flex items-center gap-2"
                            >
                              <FaTimesCircle /> {t('orderHistory.cancel')}
                            </button>
                          )}
                          <button 
                            onClick={() => handleEditOrder(order.id)} 
                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center gap-2 shadow-lg"
                          >
                            <FaEdit /> {t('orderHistory.edit')}
                          </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                          <div 
                            onClick={() => copyToClipboard(String(order.dailyOrderId ?? order.orderNumber ?? order.id))}
                            className="flex items-center justify-start gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 -mx-1 transition-colors text-left"
                            title="Click to copy Order Number"
                          >
                            <span className="text-xs font-semibold text-gray-700">Order Number</span>
                            <span className="text-xs font-mono font-semibold text-gray-700">#{order.dailyOrderId ?? order.orderNumber ?? order.id?.slice(-4)?.toUpperCase() ?? '—'}</span>
                            <FaCopy className="text-gray-400 text-xs flex-shrink-0 ml-auto" />
                          </div>
                          <div 
                            onClick={() => copyToClipboard(order.id)}
                            className="flex items-center justify-start gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 -mx-1 transition-colors text-left"
                            title="Click to copy Order ID"
                          >
                            <span className="text-xs font-semibold text-gray-700">Order ID</span>
                            <span className="text-xs font-mono font-semibold text-gray-700 truncate max-w-[200px] sm:max-w-none hover:text-red-600" title={order.id}>{order.id}</span>
                            <FaCopy className="text-gray-400 text-xs flex-shrink-0 ml-auto" />
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="w-full px-4 sm:px-6 lg:px-8 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-md border border-gray-200 p-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{t('orderHistory.showing')}</span>{' '}
              {((currentPage - 1) * limit) + 1}-{Math.min(currentPage * limit, totalOrders)} {t('orderHistory.of')} {totalOrders} {t('orderHistory.orders')}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1} 
                className="p-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <FaChevronLeft />
              </button>
              <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <span className="font-semibold text-gray-900">{t('orderHistory.page')} {currentPage} / {totalPages}</span>
              </div>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages} 
                className="p-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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

      {/* KOT Printer Setup Note */}
      {restaurantId && <KOTPrinterNote restaurantId={restaurantId} />}
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
  
  const orderTotal = calculateOrderTotal(order);
  const subtotal = order.items?.reduce((sum, item) => sum + (item.total || (item.price * item.quantity) || 0), 0) || 0;
  const taxAmount = order.taxAmount || Math.max(0, orderTotal - subtotal);
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">INVOICE</h2>
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
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Bill To:</h3>
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
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Item</th>
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
                        <td className="py-3 px-4 text-right text-gray-700">₹{item.price?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">₹{(item.total || (item.price * item.quantity))?.toFixed(2) || '0.00'}</td>
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
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    {taxAmount > 0 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Tax:</span>
                        <span>₹{taxAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                      <span>Total:</span>
                      <span className="text-red-600">₹{orderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
                <p className="font-medium">Thank you for your business!</p>
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