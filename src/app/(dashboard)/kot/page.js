'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Pusher from 'pusher-js';
import {
  FaPrint,
  FaClock,
  FaCheck,
  FaFire,
  FaBell,
  FaUtensils,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaPlay,
  FaSync,
  FaHome,
  FaTruck,
  FaShoppingBag,
  FaSpinner,
  FaTrash,
  FaReceipt,
  FaEllipsisV,
  FaVolumeUp,
  FaVolumeMute
} from 'react-icons/fa';
import { GiChefToque } from "react-icons/gi";
import apiClient from '../../../lib/api';
import Notification from '../../../components/Notification';
import { getCachedKotData, setCachedKotData } from '../../../utils/dashboardCache';
import { getCachedData, setCachedData, getPendingOrders } from '../../../lib/offlineDb';
import OfflineBanner from '../../../components/OfflineBanner';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';

// ─── Tab Definitions ───
const TABS = [
  { key: 'new', label: 'New', statuses: ['pending', 'confirmed'], color: '#f59e0b', activeColor: '#f59e0b' },
  { key: 'cooking', label: 'Cooking', statuses: ['preparing'], color: '#3b82f6', activeColor: '#3b82f6' },
  { key: 'ready', label: 'Ready', statuses: ['ready'], color: '#22c55e', activeColor: '#22c55e' },
  { key: 'done', label: 'Done', statuses: ['completed'], color: '#6b7280', activeColor: '#6b7280' },
];

// ─── Timer Aging Colors ───
const getTimerColor = (minutes) => {
  if (minutes >= 15) return { color: '#ef4444', bg: '#fef2f2', pulse: true };
  if (minutes >= 8) return { color: '#f59e0b', bg: '#fffbeb', pulse: false };
  return { color: '#22c55e', bg: '#f0fdf4', pulse: false };
};

// ─── Sound Helper (Web Audio API) ───
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = 0.15;

    if (type === 'newOrder') {
      // Two-tone chime: C5 → E5
      const o1 = ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.value = 523.25; // C5
      o1.connect(gain);
      o1.start(ctx.currentTime);
      o1.stop(ctx.currentTime + 0.15);

      const o2 = ctx.createOscillator();
      o2.type = 'sine';
      o2.frequency.value = 659.25; // E5
      o2.connect(gain);
      o2.start(ctx.currentTime + 0.18);
      o2.stop(ctx.currentTime + 0.35);
    } else if (type === 'overdue') {
      // Single high beep
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = 880; // A5
      o.connect(gain);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.2);
    }

    setTimeout(() => ctx.close(), 1000);
  } catch (e) {
    // Audio not supported
  }
};

// Merge pending offline orders into the KOT list so they show immediately
async function mergeOfflineKotOrders(existingOrders, restaurantId) {
  try {
    // Timeout after 3s so a blocked IndexedDB can't hang the page forever
    const offlineOrders = await Promise.race([
      getPendingOrders(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('IndexedDB timeout')), 3000))
    ]);
    if (offlineOrders.length === 0) return existingOrders;

    const existingIds = new Set(existingOrders.map(o => o.id));
    const offlineFormatted = offlineOrders
      .filter(o => {
        const rid = o.orderData?.restaurantId;
        return rid === restaurantId && !existingIds.has(o.idempotencyKey);
      })
      .map(o => ({
        id: o.idempotencyKey,
        items: o.orderData?.items || [],
        tableNumber: o.orderData?.tableNumber || null,
        orderType: o.orderData?.orderType || 'dine-in',
        status: o.orderData?.status === 'completed' ? 'completed' : (o.orderData?.status || 'confirmed'),
        kotTime: new Date(o.createdAt).toISOString(),
        createdAt: new Date(o.createdAt).toISOString(),
        customerInfo: o.orderData?.customerInfo || {},
        _isOffline: true,
        syncStatus: o.syncStatus,
      }));

    return [...existingOrders, ...offlineFormatted];
  } catch (e) {
    return existingOrders;
  }
}

const KitchenOrderTicket = () => {
  const router = useRouter();
  const [kotOrders, setKotOrders] = useState([]);
  const [selectedTab, setSelectedTab] = useState('new');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedKot, setSelectedKot] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentRestaurant, setCurrentRestaurant] = useState(null);
  const [timers, setTimers] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [notification, setNotification] = useState({ show: false });
  const [isPollingActive, setIsPollingActive] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [deleteModal, setDeleteModal] = useState({ show: false, orderId: null, kotId: null });
  const [deleteReason, setDeleteReason] = useState('');
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [undoToast, setUndoToast] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [transitioning, setTransitioning] = useState({}); // { orderId: { newStatus, label, targetTab } }
  const overdueAlertedRef = useRef(new Set());
  const undoTimeoutRef = useRef(null);
  const { isOnline } = useNetworkStatus();

  // ─── Data Loading ───
  const loadKotData = useCallback(async (showSpinner = true, useCache = true) => {
    try {
      setError('');
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('User not authenticated');
        setCurrentRestaurant(null);
        setKotOrders([]);
        return;
      }

      const user = JSON.parse(userData);
      let restaurantId = null;

      if (user.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(user.role)) {
        restaurantId = user.restaurantId;
      } else if (user.role === 'owner' || user.role === 'admin') {
        try {
          const restaurants = await apiClient.getRestaurants();
          if (!restaurants.restaurants || restaurants.restaurants.length === 0) {
            setError('No restaurants found');
            setCurrentRestaurant(null);
            setKotOrders([]);
            return;
          }
          const savedRestaurantId = localStorage.getItem('selectedRestaurantId');
          const defaultId = restaurants.defaultRestaurantId;
          const selectedRestaurant = restaurants.restaurants.find(r => r.id === savedRestaurantId) ||
                                    (defaultId ? restaurants.restaurants.find(r => r.id === defaultId) : null) ||
                                    restaurants.restaurants[0];
          restaurantId = selectedRestaurant.id;
          localStorage.setItem('selectedRestaurantId', restaurantId);
          localStorage.setItem('selectedRestaurant', JSON.stringify(selectedRestaurant));
          setCurrentRestaurant(selectedRestaurant);
        } catch (error) {
          console.warn('🔌 Restaurants API failed, using cached data:', error.message);
          const savedRestaurant = localStorage.getItem('selectedRestaurant');
          if (savedRestaurant) {
            const parsed = JSON.parse(savedRestaurant);
            restaurantId = parsed.id;
            setCurrentRestaurant(parsed);
          } else {
            console.error('Error fetching restaurants:', error);
            setError('Failed to load restaurants');
            return;
          }
        }
      } else {
        setError('Invalid user role');
        return;
      }

      if (!restaurantId) {
        setError('No restaurant selected');
        setCurrentRestaurant(null);
        setKotOrders([]);
        return;
      }

      if (useCache && showSpinner) {
        const cachedData = getCachedKotData(restaurantId);
        if (cachedData) {
          if (cachedData.orders) setKotOrders(cachedData.orders);
          if (cachedData.currentRestaurant) setCurrentRestaurant(cachedData.currentRestaurant);
          setLoading(false);
          setBackgroundLoading(true);
          window.dispatchEvent(new CustomEvent('kotBackgroundLoading', { detail: { loading: true } }));
        } else {
          setLoading(true);
        }
      } else if (showSpinner) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dine-backend-lake.vercel.app';
      const response = await fetch(`${backendUrl}/api/kot/${restaurantId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch KOT orders: ${response.status} - ${errorText}`);
      }

      const kotData = await response.json();
      const freshOrders = kotData.orders || [];

      // Merge any pending offline orders so they show immediately
      const mergedOrders = await mergeOfflineKotOrders(freshOrders, restaurantId);
      setKotOrders(mergedOrders);

      setCachedKotData(restaurantId, {
        orders: freshOrders,
        currentRestaurant: currentRestaurant || null
      });
      // Persist to IndexedDB for offline use
      setCachedData(`kot_${restaurantId}`, { orders: freshOrders, currentRestaurant: currentRestaurant || null }).catch(() => {});

    } catch (error) {
      console.error('Error loading KOT data:', error);
      // Fall back to IndexedDB cached data
      try {
        const restaurantId = localStorage.getItem('selectedRestaurantId');
        const idbData = await Promise.race([
          getCachedData(`kot_${restaurantId}`),
          new Promise((_, reject) => setTimeout(() => reject(new Error('IDB timeout')), 3000))
        ]);
        const cachedOrders = idbData?.orders || [];
        // Always merge offline orders with whatever cached data we have
        const mergedOrders = await mergeOfflineKotOrders(cachedOrders, restaurantId);
        if (mergedOrders.length > 0) {
          setKotOrders(mergedOrders);
          if (idbData?.currentRestaurant) setCurrentRestaurant(idbData.currentRestaurant);
          setError('');
        } else {
          setError('No cached kitchen orders available');
        }
      } catch (idbErr) {
        setError('Failed to load kitchen orders');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setBackgroundLoading(false);
      window.dispatchEvent(new CustomEvent('kotBackgroundLoading', { detail: { loading: false } }));
    }
  }, []);

  // ─── Mobile Detection ───
  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ─── Refs for stable callbacks ───
  const loadKotDataRef = useRef(loadKotData);
  useEffect(() => { loadKotDataRef.current = loadKotData; }, [loadKotData]);

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  // ─── Initial Data Load ───
  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    loadKotData(true, true);
  }, [loadKotData]);

  // ─── Pusher Subscription (same pattern as orderhistory) ───
  const [pusherRestaurantId, setPusherRestaurantId] = useState(() => {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    const user = JSON.parse(userData);
    if (user.restaurantId && ['waiter', 'manager', 'employee', 'cashier'].includes(user.role)) {
      return user.restaurantId;
    }
    return localStorage.getItem('selectedRestaurantId') || null;
  });

  useEffect(() => {
    if (!pusherRestaurantId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '4e1f74ae05c66bbc4eec', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    });

    const channelName = `restaurant-${pusherRestaurantId}`;
    const channel = pusher.subscribe(channelName);
    setIsPollingActive(true);

    console.log(`📡 KOT Pusher: Subscribed to '${channelName}'`);

    // Debounce — if multiple events arrive within 1s, only fetch once
    let debounceTimer = null;
    const handleOrderEvent = (eventName, data) => {
      console.log(`📡 KOT Pusher: Received '${eventName}'`, data);
      setPollCount(prev => prev + 1);
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadKotDataRef.current(false, false);
      }, 1000);
      // Play sound for new orders (uses ref to avoid stale closure)
      if (eventName === 'order-created' && soundEnabledRef.current) {
        playSound('newOrder');
      }
    };

    channel.bind('order-created', (data) => handleOrderEvent('order-created', data));
    channel.bind('order-status-updated', (data) => handleOrderEvent('order-status-updated', data));
    channel.bind('order-updated', (data) => handleOrderEvent('order-updated', data));
    channel.bind('order-deleted', (data) => handleOrderEvent('order-deleted', data));

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      console.log(`📡 KOT Pusher: Unsubscribing from '${channelName}'`);
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
      setIsPollingActive(false);
    };
  }, [pusherRestaurantId]);

  // ─── Restaurant Change ───
  useEffect(() => {
    const handleRestaurantChange = (event) => {
      initialLoadDone.current = false;
      loadKotData(true, true);
      const newId = event.detail?.restaurantId || localStorage.getItem('selectedRestaurantId');
      if (newId) setPusherRestaurantId(newId);
    };
    window.addEventListener('restaurantChanged', handleRestaurantChange);
    return () => window.removeEventListener('restaurantChanged', handleRestaurantChange);
  }, [loadKotData]);

  // Also set pusherRestaurantId once currentRestaurant loads (for owner/admin first visit)
  useEffect(() => {
    if (currentRestaurant?.id && !pusherRestaurantId) {
      setPusherRestaurantId(currentRestaurant.id);
    }
  }, [currentRestaurant, pusherRestaurantId]);

  // ─── Cleanup on unmount ───
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  // ─── Cooking Timers ───
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        const newTimers = { ...prevTimers };
        kotOrders.forEach(order => {
          if (order.status === 'preparing' && order.cookingStartTime) {
            const startTime = new Date(order.cookingStartTime);
            const now = new Date();
            newTimers[order.id] = Math.floor((now - startTime) / 1000);
          }
        });
        return newTimers;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [kotOrders]);

  // ─── Overdue Sound Alerts ───
  useEffect(() => {
    if (!soundEnabled) return;
    kotOrders.forEach(order => {
      if (order.status !== 'completed' && order.status !== 'cancelled') {
        const elapsed = getTimeElapsed(order.kotTime);
        if (elapsed >= 15 && !overdueAlertedRef.current.has(order.id)) {
          overdueAlertedRef.current.add(order.id);
          playSound('overdue');
        }
      }
    });
  }, [kotOrders, soundEnabled]);

  // ─── Auth Check ───
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) { router.push('/auth'); return; }
    const userData = localStorage.getItem('user');
    if (userData) {
      try { setUserRole(JSON.parse(userData).role); } catch (e) {}
    }
  }, [router]);

  // ─── Close overflow menu on outside click ───
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null);
    if (openMenuId) document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [openMenuId]);

  // ─── Helper Functions ───
  const getOrderTypeInfo = (type) => {
    const typeMap = {
      'dine-in': { icon: FaHome, label: 'Dine In', color: '#6b7280' },
      'delivery': { icon: FaTruck, label: 'Delivery', color: '#6b7280' },
      'pickup': { icon: FaShoppingBag, label: 'Pickup', color: '#6b7280' }
    };
    return typeMap[type] || typeMap['dine-in'];
  };

  const getVariantName = (item) => {
    if (!item) return null;
    if (item.selectedVariant?.name) return item.selectedVariant.name;
    if (typeof item.variantName === 'string' && item.variantName.trim()) return item.variantName;
    if (item.variant?.name) return item.variant.name;
    if (item.size) return item.size;
    if (item.portion) return item.portion;
    return null;
  };

  const getToppings = (item) => {
    if (!item) return [];
    if (Array.isArray(item.selectedCustomizations)) return item.selectedCustomizations;
    if (Array.isArray(item.customizations)) return item.customizations;
    if (Array.isArray(item.addons)) return item.addons;
    if (Array.isArray(item.toppings)) return item.toppings;
    return [];
  };

  const getTimeElapsed = (kotTime) => {
    try {
      const now = new Date();
      const kotDate = new Date(kotTime);
      return Math.max(0, Math.floor((now - kotDate) / (1000 * 60)));
    } catch (e) { return 0; }
  };

  const formatTime = (timeString) => {
    try {
      return new Date(timeString).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) { return '--:--'; }
  };

  const formatCookingTime = (seconds) => {
    if (seconds == null || isNaN(seconds)) return '0:00';
    const s = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOrderDateCategory = (orderDate) => {
    if (!orderDate) return 'unknown';
    const order = new Date(orderDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orderDateOnly = new Date(order);
    orderDateOnly.setHours(0, 0, 0, 0);
    if (orderDateOnly.getTime() === today.getTime()) return 'today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (orderDateOnly.getTime() === yesterday.getTime()) return 'yesterday';
    return 'older';
  };

  // ─── Smooth Transition Helper ───
  // Shows a "Moving to X" overlay on the card, then updates status after a delay
  const smoothTransition = (kotId, orderId, newStatus, targetTab, label) => {
    // 1. Show transition overlay on card immediately
    setTransitioning(prev => ({ ...prev, [orderId]: { newStatus, label, targetTab } }));

    // 2. After 1.5s, update status + switch to target tab
    setTimeout(() => {
      setKotOrders(orders => orders.map(order =>
        order.kotId === kotId ? { ...order, status: newStatus, ...(newStatus === 'preparing' ? { cookingStartTime: new Date().toISOString() } : {}), ...(newStatus === 'ready' ? { cookingEndTime: new Date().toISOString() } : {}) } : order
      ));
      setTransitioning(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
      // Auto-switch to the target tab so user sees the card there
      setSelectedTab(targetTab);
    }, 1500);
  };

  // ─── Actions ───
  const startCooking = async (kotId, orderId) => {
    setUpdatingOrderId(orderId);
    try {
      await apiClient.startCooking(orderId);
      setUpdatingOrderId(null);
      smoothTransition(kotId, orderId, 'preparing', 'cooking', 'Cooking');
      setTimeout(() => loadKotData(false), 2500);
    } catch (error) {
      console.error('Error starting cooking:', error);
      setNotification({ show: true, type: 'error', message: 'Failed to start cooking' });
      setUpdatingOrderId(null);
    }
  };

  const markReady = async (kotId, orderId) => {
    setUpdatingOrderId(orderId);
    try {
      await apiClient.markReady(orderId);
      setUpdatingOrderId(null);
      if (soundEnabled) playSound('newOrder');
      smoothTransition(kotId, orderId, 'ready', 'ready', 'Ready');
      setTimeout(() => loadKotData(false), 2500);
    } catch (error) {
      console.error('Error marking ready:', error);
      setNotification({ show: true, type: 'error', message: 'Failed to mark ready' });
      setUpdatingOrderId(null);
    }
  };

  const markDone = (kotId, orderId) => {
    // Show transition overlay first
    setTransitioning(prev => ({ ...prev, [orderId]: { newStatus: 'completed', label: 'Done', targetTab: 'done' } }));

    // After 1.5s, move card to done
    setTimeout(() => {
      setKotOrders(orders => orders.map(order =>
        order.kotId === kotId ? { ...order, status: 'completed' } : order
      ));
      setTransitioning(prev => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    }, 1500);

    // Clear any existing undo timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Show undo toast
    setUndoToast({ orderId, kotId, previousStatus: 'ready' });

    // After 5 seconds, persist to backend
    undoTimeoutRef.current = setTimeout(async () => {
      try {
        await apiClient.completeOrder(orderId);
        setTimeout(() => loadKotData(false), 1000);
      } catch (error) {
        console.error('Error completing order:', error);
        setKotOrders(orders => orders.map(order =>
          order.kotId === kotId ? { ...order, status: 'ready' } : order
        ));
        setNotification({ show: true, type: 'error', message: 'Failed to complete order' });
      }
      setUndoToast(null);
      undoTimeoutRef.current = null;
    }, 5000);
  };

  const undoMarkDone = () => {
    if (!undoToast) return;
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    // Revert to ready
    setKotOrders(orders => orders.map(order =>
      order.kotId === undoToast.kotId ? { ...order, status: undoToast.previousStatus } : order
    ));
    setUndoToast(null);
    undoTimeoutRef.current = null;
  };

  const cancelOrder = async (kotId, orderId) => {
    const reason = prompt('Reason for cancellation (optional):');
    if (reason === null) return;
    setUpdatingOrderId(orderId);
    try {
      await apiClient.cancelOrder(orderId, reason);
      setKotOrders(orders => orders.filter(order => order.kotId !== kotId));
      if (selectedKot && selectedKot.id === orderId) setSelectedKot(null);
      setNotification({ show: true, type: 'success', message: 'Order cancelled' });
      setTimeout(() => loadKotData(false), 1000);
    } catch (error) {
      console.error('Error cancelling order:', error);
      setNotification({ show: true, type: 'error', message: 'Failed to cancel order' });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openDeleteModal = (orderId, kotId) => {
    setDeleteModal({ show: true, orderId, kotId });
    setDeleteReason('');
    setOpenMenuId(null);
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, orderId: null, kotId: null });
    setDeleteReason('');
  };

  const confirmDeleteOrder = async () => {
    const { orderId } = deleteModal;
    closeDeleteModal();
    setDeletingOrderId(orderId);
    try {
      await apiClient.deleteOrder(orderId, deleteReason.trim() || undefined);
      setKotOrders(prev => prev.filter(order => order.id !== orderId));
      if (selectedKot && selectedKot.id === orderId) setSelectedKot(null);
      setNotification({ show: true, type: 'success', message: 'Order deleted' });
    } catch (error) {
      console.error('Error deleting order:', error);
      setNotification({ show: true, type: 'error', message: error.message || 'Failed to delete order' });
    } finally {
      setDeletingOrderId(null);
    }
  };

  const printKot = (kot) => {
    console.log('Printing KOT:', kot.kotId || kot.id);
    alert(`Printing KOT ${kot.kotId || kot.id} to kitchen printer...`);
  };

  // ─── Filtering & Sorting ───
  const currentTab = TABS.find(t => t.key === selectedTab) || TABS[0];

  const filteredOrders = kotOrders
    .filter(order => {
      const orderDate = order.kotTime || order.createdAt || order.timestamp;
      if (!orderDate) return false;
      const orderTime = new Date(orderDate).getTime();
      const now = new Date().getTime();

      if (dateFilter === 'today') {
        if (getOrderDateCategory(orderDate) !== 'today') return false;
      } else if (dateFilter === 'last24hours') {
        if ((now - orderTime) / (1000 * 60 * 60) > 24) return false;
      }

      return currentTab.statuses.includes(order.status);
    })
    .sort((a, b) => {
      const aTime = new Date(a.kotTime || a.createdAt || a.timestamp).getTime();
      const bTime = new Date(b.kotTime || b.createdAt || b.timestamp).getTime();
      // Newest first across all tabs — new orders appear on top
      return bTime - aTime;
    });

  // Tab counts
  const tabCounts = {};
  TABS.forEach(tab => {
    tabCounts[tab.key] = kotOrders.filter(order => {
      const orderDate = order.kotTime || order.createdAt || order.timestamp;
      if (!orderDate) return false;
      if (dateFilter === 'today') {
        if (getOrderDateCategory(orderDate) !== 'today') return false;
      } else if (dateFilter === 'last24hours') {
        const orderTime = new Date(orderDate).getTime();
        if ((new Date().getTime() - orderTime) / (1000 * 60 * 60) > 24) return false;
      }
      return tab.statuses.includes(order.status);
    }).length;
  });

  // ─── Loading State (Skeleton) ───
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)' }}>
        <div style={{ padding: '24px' }}>
          {/* Skeleton header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#e5e7eb', animation: 'shimmer 1.5s infinite' }} />
              <div>
                <div style={{ width: '180px', height: '24px', borderRadius: '6px', background: '#e5e7eb', animation: 'shimmer 1.5s infinite', marginBottom: '8px' }} />
                <div style={{ width: '120px', height: '14px', borderRadius: '4px', background: '#e5e7eb', animation: 'shimmer 1.5s infinite' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: '90px', height: '36px', borderRadius: '20px', background: '#e5e7eb', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          </div>
          {/* Skeleton cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                background: 'white'
              }}>
                <div style={{ height: '6px', background: '#e5e7eb', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ width: '120px', height: '16px', borderRadius: '4px', background: '#e5e7eb', animation: 'shimmer 1.5s infinite' }} />
                    <div style={{ width: '50px', height: '16px', borderRadius: '4px', background: '#e5e7eb', animation: 'shimmer 1.5s infinite' }} />
                  </div>
                  {[1, 2, 3].map(j => (
                    <div key={j} style={{ width: '100%', height: '36px', borderRadius: '6px', background: '#f3f4f6', marginBottom: '8px', animation: 'shimmer 1.5s infinite' }} />
                  ))}
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
                  <div style={{ width: '100%', height: '40px', borderRadius: '10px', background: '#e5e7eb', animation: 'shimmer 1.5s infinite' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <style jsx>{`
          @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
      </div>
    );
  }

  // ─── Error State ───
  if (error && kotOrders.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          textAlign: 'center', maxWidth: '500px', padding: '40px 20px',
          backgroundColor: 'white', borderRadius: '24px',
          border: '1px solid #e5e7eb', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            width: '80px', height: '80px', backgroundColor: '#fef2f2', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <FaReceipt size={32} style={{ color: '#ef4444' }} />
          </div>
          <h1 style={{
            fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px'
          }}>Kitchen Display</h1>
          <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
            Set up your restaurant first, then start taking orders. Kitchen Order Tickets will appear here.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '12px 28px', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: '600', fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Main Render ───
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)' }}>
      <OfflineBanner />
      <div style={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>

        {/* ─── Background Loading Bar ─── */}
        {(backgroundLoading || refreshing) && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: '#f3f4f6', overflow: 'hidden', zIndex: 50
          }}>
            <div style={{
              position: 'absolute', top: 0, left: '-40%', width: '40%', height: '100%',
              background: 'linear-gradient(90deg, transparent, #ef4444, #f97316, transparent)',
              animation: 'loadingSlide 1.2s ease-in-out infinite'
            }} />
          </div>
        )}

        {/* ─── Header ─── */}
        <div style={{
          backgroundColor: 'white',
          padding: isClient && isMobile ? '12px 16px' : '16px 24px',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          {/* Title Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isClient && isMobile ? '10px' : '14px' }}>
              <div style={{
                width: isClient && isMobile ? '36px' : '44px',
                height: isClient && isMobile ? '36px' : '44px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
              }}>
                <GiChefToque color="white" size={isClient && isMobile ? 18 : 22} />
              </div>
              <div>
                <h1 style={{ fontSize: isClient && isMobile ? '17px' : '22px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                  Kitchen Display
                </h1>
                <p style={{ color: '#6b7280', margin: 0, fontSize: isClient && isMobile ? '11px' : '13px' }}>
                  {currentRestaurant?.name || 'Restaurant'}
                  {' '}&middot;{' '}{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} in queue
                  {isPollingActive && (
                    <span style={{ color: '#22c55e' }}> &middot; Live</span>
                  )}
                </p>
              </div>
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Date dropdown */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{
                  padding: isClient && isMobile ? '6px 8px' : '7px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: isClient && isMobile ? '11px' : '13px',
                  fontWeight: '500',
                  color: '#374151',
                  backgroundColor: '#f9fafb',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="today">Today</option>
                <option value="last24hours">Last 24h</option>
                <option value="all">All Time</option>
              </select>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                style={{
                  padding: isClient && isMobile ? '7px' : '9px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  backgroundColor: soundEnabled ? '#f0fdf4' : '#f9fafb',
                  color: soundEnabled ? '#16a34a' : '#9ca3af',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title={soundEnabled ? 'Sound On' : 'Sound Off'}
              >
                {soundEnabled ? <FaVolumeUp size={isClient && isMobile ? 12 : 14} /> : <FaVolumeMute size={isClient && isMobile ? 12 : 14} />}
              </button>

              <button
                onClick={() => loadKotData(false)}
                disabled={refreshing}
                style={{
                  padding: isClient && isMobile ? '7px 10px' : '8px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  background: refreshing ? '#f87171' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.25)',
                  fontSize: isClient && isMobile ? '11px' : '13px',
                  fontWeight: '600',
                  opacity: refreshing ? 0.8 : 1,
                }}
                title="Refresh orders"
              >
                <FaSync size={isClient && isMobile ? 11 : 12} className={refreshing ? 'animate-spin' : ''} />
                {!isMobile && (refreshing ? 'Refreshing...' : 'Refresh')}
              </button>
            </div>
          </div>

          {/* ─── Tab Pills ─── */}
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '2px'
          }}>
            {TABS.map(tab => {
              const isActive = selectedTab === tab.key;
              const count = tabCounts[tab.key] || 0;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key)}
                  style={{
                    padding: isClient && isMobile ? '6px 14px' : '8px 20px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    fontSize: isClient && isMobile ? '12px' : '13px',
                    border: isActive ? 'none' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: isActive ? '#ef4444' : 'white',
                    color: isActive ? 'white' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 2px 8px rgba(239, 68, 68, 0.3)' : 'none'
                  }}
                >
                  {tab.label}
                  <span style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#f3f4f6',
                    color: isActive ? 'white' : '#6b7280',
                    padding: '1px 7px',
                    borderRadius: '10px',
                    fontSize: isClient && isMobile ? '10px' : '11px',
                    fontWeight: 'bold',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── KOT Grid ─── */}
        <div style={{ flex: 1, padding: isClient && isMobile ? '12px' : '20px', overflowY: 'auto' }}>
          {filteredOrders.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: isClient && isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: isClient && isMobile ? '12px' : '16px'
            }}>
              {filteredOrders.map((kot) => {
                const timeElapsed = getTimeElapsed(kot.kotTime);
                const timerInfo = getTimerColor(timeElapsed);
                const typeInfo = getOrderTypeInfo(kot.orderType);
                const TypeIcon = typeInfo.icon;
                const isUpdating = updatingOrderId === kot.id;
                const isDeleting = deletingOrderId === kot.id;
                const itemCount = Array.isArray(kot.items) ? kot.items.length : 0;

                // Determine primary action
                let actionButton = null;
                if (selectedTab === 'new') {
                  actionButton = {
                    label: 'START COOKING',
                    icon: FaPlay,
                    color: '#ef4444',
                    shadow: 'rgba(239, 68, 68, 0.3)',
                    onClick: () => startCooking(kot.kotId, kot.id)
                  };
                } else if (selectedTab === 'cooking') {
                  actionButton = {
                    label: 'MARK READY',
                    icon: FaCheckCircle,
                    color: '#ef4444',
                    shadow: 'rgba(239, 68, 68, 0.3)',
                    onClick: () => markReady(kot.kotId, kot.id)
                  };
                } else if (selectedTab === 'ready') {
                  actionButton = {
                    label: 'DONE',
                    icon: FaCheck,
                    color: '#ef4444',
                    shadow: 'rgba(239, 68, 68, 0.3)',
                    onClick: () => markDone(kot.kotId, kot.id)
                  };
                }

                const isTransitioning = !!transitioning[kot.id];
                const transitionInfo = transitioning[kot.id];

                return (
                  <div
                    key={kot.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: (isUpdating || isDeleting) ? 0.5 : isTransitioning ? 0.85 : 1,
                      transform: isTransitioning ? 'scale(0.97)' : 'scale(1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isUpdating && !isDeleting && !isTransitioning) {
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.06)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isTransitioning) {
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {/* Updating overlay */}
                    {(isUpdating || isDeleting) && (
                      <div style={{
                        position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
                        borderRadius: '16px'
                      }}>
                        <FaSpinner size={20} className="animate-spin" style={{ color: '#ef4444' }} />
                      </div>
                    )}

                    {/* Transition overlay — "Moving to Cooking/Ready/Done" */}
                    {isTransitioning && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.15))',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 5,
                        borderRadius: '16px', backdropFilter: 'blur(2px)'
                      }}>
                        <FaCheckCircle size={24} style={{ color: '#ef4444', marginBottom: '6px' }} />
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#ef4444' }}>
                          Moved to {transitionInfo.label}
                        </span>
                      </div>
                    )}

                    {/* Card Header */}
                    <div style={{
                      padding: '12px 16px',
                      background: selectedTab === 'done'
                        ? 'linear-gradient(135deg, #f8f9fa, #f1f3f5)'
                        : 'linear-gradient(135deg, #fef2f2, #fff5f5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{
                            fontSize: '15px', fontWeight: '800', color: '#1f2937',
                            cursor: 'pointer', letterSpacing: '-0.3px'
                          }}
                            onClick={() => {
                              navigator.clipboard.writeText(kot.dailyOrderId?.toString() || kot.id);
                              setNotification({ show: true, type: 'success', message: `Order number copied` });
                            }}
                            title="Click to copy order number"
                          >
                            #{kot.dailyOrderId || kot.orderNumber || kot.id.slice(-6).toUpperCase()}
                          </span>
                          <span style={{
                            fontSize: '9px', fontWeight: '500', color: '#9ca3af',
                            cursor: 'pointer', letterSpacing: '0.2px'
                          }}
                            onClick={() => {
                              navigator.clipboard.writeText(kot.id);
                              setNotification({ show: true, type: 'success', message: `Order ID copied` });
                            }}
                            title="Click to copy order ID"
                          >
                            ID: {kot.id.slice(-6).toUpperCase()}
                          </span>
                        </div>

                        {kot.tableNumber && (
                          <span style={{
                            fontSize: '11px', fontWeight: '600', color: '#374151',
                            backgroundColor: 'rgba(0,0,0,0.06)', padding: '2px 8px', borderRadius: '6px'
                          }}>
                            T{kot.tableNumber}
                          </span>
                        )}

                        <span style={{
                          fontSize: '10px', fontWeight: '500', color: '#9ca3af',
                          display: 'flex', alignItems: 'center', gap: '3px'
                        }}>
                          <TypeIcon size={9} />
                          {typeInfo.label}
                        </span>

                        {kot.orderSource === 'customer_app' && (
                          <span style={{
                            fontSize: '9px', fontWeight: '600', color: '#ec4899',
                            backgroundColor: '#fce7f3', padding: '2px 6px', borderRadius: '8px'
                          }}>
                            App
                          </span>
                        )}

                        {kot._isOffline && (
                          <span style={{
                            fontSize: '9px', fontWeight: '600', color: '#d97706',
                            backgroundColor: '#fef3c7', padding: '2px 6px', borderRadius: '8px'
                          }}>
                            Offline - Pending Sync
                          </span>
                        )}
                      </div>

                      {/* Timer + View */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {selectedTab === 'cooking' && timers[kot.id] != null && (
                          <div style={{
                            fontSize: '11px', fontWeight: '700', color: '#3b82f6',
                            backgroundColor: '#eff6ff', padding: '4px 8px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', gap: '3px'
                          }}>
                            <FaFire size={9} />
                            {formatCookingTime(timers[kot.id])}
                          </div>
                        )}

                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '3px',
                          fontSize: '12px', fontWeight: '700', color: timerInfo.color,
                          ...(timerInfo.pulse ? { animation: 'pulse 1.5s infinite' } : {})
                        }}>
                          <FaClock size={10} />
                          {timeElapsed}m
                        </div>

                        <button
                          onClick={() => setSelectedKot(kot)}
                          style={{
                            padding: '5px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'rgba(0,0,0,0.06)',
                            color: '#6b7280',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = '#6b7280'; }}
                          title="View full details"
                        >
                          <FaEye size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ padding: '4px 16px 12px', flex: 1 }}>
                      <div style={{
                        fontSize: '10px', fontWeight: '600', color: '#b0b0b0',
                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px'
                      }}>
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {Array.isArray(kot.items) && kot.items.map((item, index) => {
                          const isNewItem = kot.updateHistory && kot.updateHistory.length > 0 && item.isNew;
                          const isUpdatedItem = kot.updateHistory && kot.updateHistory.length > 0 && item.isUpdated;
                          return (
                            <div key={index} style={{
                              display: 'flex', alignItems: 'flex-start', gap: '10px',
                              padding: '7px 0',
                              borderBottom: index < (Array.isArray(kot.items) ? kot.items.length - 1 : 0) ? '1px solid #f3f4f6' : 'none'
                            }}>
                              <span style={{
                                fontSize: '14px', fontWeight: '700', color: '#374151',
                                minWidth: '26px', textAlign: 'right'
                              }}>
                                {item.quantity}×
                              </span>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>
                                    {item.name}
                                  </span>
                                  {isNewItem && <span style={{ fontSize: '8px', fontWeight: '700', color: 'white', backgroundColor: '#22c55e', padding: '1px 4px', borderRadius: '3px' }}>NEW</span>}
                                  {isUpdatedItem && <span style={{ fontSize: '8px', fontWeight: '700', color: 'white', backgroundColor: '#f59e0b', padding: '1px 4px', borderRadius: '3px' }}>UPD</span>}
                                  {item.spiceLevel && item.spiceLevel !== 'mild' && (
                                    <FaFire size={10} style={{ color: item.spiceLevel === 'hot' ? '#ef4444' : '#f59e0b' }} />
                                  )}
                                </div>
                                {/* Variant + Toppings */}
                                {(getVariantName(item) || getToppings(item).length > 0) && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                                    {getVariantName(item) && (
                                      <span style={{ fontSize: '10px', fontWeight: '600', color: '#c2410c', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '1px 6px', borderRadius: '999px' }}>
                                        {getVariantName(item)}
                                      </span>
                                    )}
                                    {getToppings(item).map((c, idx) => (
                                      <span key={idx} style={{ fontSize: '10px', fontWeight: '600', color: '#065f46', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1px 6px', borderRadius: '999px' }}>
                                        {c.name || c}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {item.notes && (
                                  <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '500', marginTop: '2px' }}>
                                    — {item.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Special Instructions */}
                      {kot.specialInstructions && (
                        <div style={{
                          marginTop: '8px', padding: '8px 10px',
                          backgroundColor: '#fffbeb', border: '1px solid #fde68a',
                          borderRadius: '8px', fontSize: '12px', color: '#92400e', fontWeight: '500'
                        }}>
                          <strong>Note:</strong> {kot.specialInstructions}
                        </div>
                      )}
                    </div>

                    {/* Action Footer */}
                    <div style={{
                      padding: '8px 16px 12px',
                      marginTop: 'auto',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      {actionButton ? (
                          <button
                            onClick={actionButton.onClick}
                            disabled={isUpdating}
                            style={{
                              flex: 1,
                              backgroundColor: actionButton.color,
                              color: 'white',
                              padding: '10px 16px',
                              borderRadius: '10px',
                              fontWeight: '700',
                              fontSize: '13px',
                              border: 'none',
                              cursor: isUpdating ? 'not-allowed' : 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              boxShadow: `0 2px 8px ${actionButton.shadow}`,
                              letterSpacing: '0.5px'
                            }}
                          >
                            <actionButton.icon size={13} />
                            {actionButton.label}
                          </button>
                        ) : (
                          /* Done tab — View Details button instead */
                          <button
                            onClick={() => setSelectedKot(kot)}
                            style={{
                              flex: 1,
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              padding: '10px 16px',
                              borderRadius: '10px',
                              fontWeight: '600',
                              fontSize: '13px',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e7eb'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                          >
                            <FaEye size={12} />
                            View Details
                          </button>
                        )}

                        {/* 3-dot overflow menu */}
                        <div style={{ position: 'relative' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === kot.id ? null : kot.id);
                            }}
                            style={{
                              padding: '10px 8px',
                              borderRadius: '10px',
                              border: '1px solid #e5e7eb',
                              backgroundColor: 'white',
                              color: '#6b7280',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            <FaEllipsisV size={13} />
                          </button>

                          {openMenuId === kot.id && (
                            <div style={{
                              position: 'absolute',
                              bottom: '100%',
                              right: 0,
                              marginBottom: '4px',
                              backgroundColor: 'white',
                              borderRadius: '10px',
                              border: '1px solid #e5e7eb',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                              zIndex: 20,
                              minWidth: '160px',
                              overflow: 'hidden'
                            }}>
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedKot(kot); setOpenMenuId(null); }}
                                style={{
                                  width: '100%', padding: '10px 14px', border: 'none', backgroundColor: 'white',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                  fontSize: '13px', color: '#374151', fontWeight: '500'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                              >
                                <FaEye size={12} /> View Details
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); printKot(kot); setOpenMenuId(null); }}
                                style={{
                                  width: '100%', padding: '10px 14px', border: 'none', backgroundColor: 'white',
                                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                  fontSize: '13px', color: '#374151', fontWeight: '500'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                              >
                                <FaPrint size={12} /> Print KOT
                              </button>
                              {kot.status !== 'completed' && kot.status !== 'cancelled' && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); cancelOrder(kot.kotId, kot.id); setOpenMenuId(null); }}
                                  style={{
                                    width: '100%', padding: '10px 14px', border: 'none', backgroundColor: 'white',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                    fontSize: '13px', color: '#f59e0b', fontWeight: '500',
                                    borderTop: '1px solid #f3f4f6'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fffbeb'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                >
                                  <FaTimesCircle size={12} /> Cancel
                                </button>
                              )}
                              {(userRole === 'admin' || userRole === 'owner') && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); openDeleteModal(kot.id, kot.kotId); }}
                                  style={{
                                    width: '100%', padding: '10px 14px', border: 'none', backgroundColor: 'white',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                    fontSize: '13px', color: '#dc2626', fontWeight: '500',
                                    borderTop: '1px solid #f3f4f6'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                >
                                  <FaTrash size={12} /> Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ─── Empty State ─── */
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: '100%'
            }}>
              <div style={{
                width: '80px', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <GiChefToque size={36} style={{ color: '#9ca3af' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                No {currentTab.label.toLowerCase()} orders
              </h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px', maxWidth: '320px' }}>
                {selectedTab === 'new' && 'New orders will appear here when they come in.'}
                {selectedTab === 'cooking' && 'Start cooking orders from the New tab.'}
                {selectedTab === 'ready' && 'Orders will appear here when cooking is done.'}
                {selectedTab === 'done' && 'Completed orders will show here for reference.'}
              </p>
              {selectedTab !== 'new' && (
                <button
                  onClick={() => setSelectedTab('new')}
                  style={{
                    padding: '10px 24px', backgroundColor: '#ef4444', color: 'white',
                    border: 'none', borderRadius: '10px', fontWeight: '600',
                    fontSize: '13px', cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  View New Orders
                </button>
              )}
            </div>
          )}
        </div>

        {/* ─── Undo Toast ─── */}
        {undoToast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 100,
            animation: 'slideUp 0.3s ease-out',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>Order #{undoToast.orderId.slice(-6).toUpperCase()} marked done</span>
            <button
              onClick={undoMarkDone}
              style={{
                padding: '6px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              UNDO
            </button>
          </div>
        )}
      </div>

      {/* ─── Detail Modal ─── */}
      {selectedKot && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: isClient && isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: isClient && isMobile ? '0' : '16px'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedKot(null); }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: isClient && isMobile ? '20px 20px 0 0' : '20px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%',
            maxWidth: isClient && isMobile ? '100%' : '700px',
            maxHeight: isClient && isMobile ? '85vh' : '90vh',
            overflowY: 'auto',
            border: '1px solid #e5e7eb'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #fef2f2, #fff1f2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <GiChefToque color="white" size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                      Order #{selectedKot.dailyOrderId || selectedKot.orderNumber || selectedKot.id.slice(-6).toUpperCase()}
                    </h2>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      ID: {selectedKot.id.slice(-6).toUpperCase()} · {getOrderTypeInfo(selectedKot.orderType).label}
                      {selectedKot.tableNumber && ` · Table ${selectedKot.tableNumber}`}
                      {selectedKot.waiterName && ` · ${selectedKot.waiterName}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedKot(null)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '1px solid #e5e7eb', backgroundColor: 'white',
                    cursor: 'pointer', fontSize: '18px', color: '#6b7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px' }}>
              {/* Info Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isClient && isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {[
                  { label: 'Order Time', value: formatTime(selectedKot.orderTime) },
                  { label: 'KOT Time', value: formatTime(selectedKot.kotTime) },
                  { label: 'Elapsed', value: `${getTimeElapsed(selectedKot.kotTime)}m` },
                  { label: 'Customer', value: selectedKot.customerName || '—' }
                ].map((info, i) => (
                  <div key={i} style={{
                    padding: '10px 12px', backgroundColor: '#f9fafb',
                    borderRadius: '10px', border: '1px solid #f3f4f6'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      {info.label}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                      {info.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                  Items ({Array.isArray(selectedKot.items) ? selectedKot.items.length : 0})
                </h3>
                {Array.isArray(selectedKot.items) && selectedKot.items.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px', backgroundColor: '#f9fafb', borderRadius: '10px',
                    marginBottom: '8px', border: '1px solid #f3f4f6'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <span style={{
                          fontWeight: '700', fontSize: '14px', color: '#ef4444',
                          backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '6px'
                        }}>
                          {item.quantity}×
                        </span>
                        <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{item.name}</span>
                        {item.category && (
                          <span style={{ fontSize: '10px', color: '#6b7280', backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {item.category}
                          </span>
                        )}
                      </div>
                      {(getVariantName(item) || getToppings(item).length > 0) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                          {getVariantName(item) && (
                            <span style={{ fontSize: '10px', fontWeight: '600', color: '#c2410c', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', padding: '2px 6px', borderRadius: '999px' }}>
                              {getVariantName(item)}
                            </span>
                          )}
                          {getToppings(item).map((c, idx) => (
                            <span key={idx} style={{ fontSize: '10px', fontWeight: '600', color: '#065f46', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 6px', borderRadius: '999px' }}>
                              {c.name || c}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.notes && (
                        <p style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '500', margin: 0 }}>— {item.notes}</p>
                      )}
                    </div>
                    {item.estimatedTime && (
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
                        {item.estimatedTime}m
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedKot.specialInstructions && (
                <div style={{
                  backgroundColor: '#fffbeb', border: '1px solid #fde68a',
                  padding: '14px', borderRadius: '10px', marginBottom: '20px'
                }}>
                  <p style={{ fontSize: '13px', color: '#92400e', margin: 0, fontWeight: '500' }}>
                    <strong>Special Instructions:</strong> {selectedKot.specialInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: '10px'
            }}>
              <button
                onClick={() => setSelectedKot(null)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px',
                  border: '1px solid #e5e7eb', backgroundColor: 'white',
                  color: '#374151', fontWeight: '600', fontSize: '14px', cursor: 'pointer'
                }}
              >
                Close
              </button>
              <button
                onClick={() => printKot(selectedKot)}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px',
                  border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                }}
              >
                <FaPrint size={13} />
                Print KOT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Modal ─── */}
      {deleteModal.show && (
        <div
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: isClient && isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            zIndex: 60,
            padding: isClient && isMobile ? '0' : '16px'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: isClient && isMobile ? '20px 20px 0 0' : '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: '420px', overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid #fee2e2',
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px', height: '40px', backgroundColor: '#dc2626',
                  borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FaTrash color="white" size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#991b1b' }}>Delete Order</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#b91c1c', marginTop: '2px' }}>This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                Delete order <strong style={{ color: '#1f2937' }}>#{deleteModal.orderId?.slice(-6)?.toUpperCase()}</strong>? This cannot be undone.
              </p>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Reason <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optional)</span>
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="e.g. Customer changed mind, duplicate..."
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #d1d5db',
                    borderRadius: '8px', fontSize: '14px', color: '#1f2937',
                    resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#f87171'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; }}
                  autoFocus
                />
              </div>
            </div>

            <div style={{
              padding: '16px 24px', borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: '12px', justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeDeleteModal}
                style={{
                  padding: '10px 20px', borderRadius: '8px',
                  border: '1px solid #d1d5db', backgroundColor: 'white',
                  color: '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteOrder}
                style={{
                  padding: '10px 20px', borderRadius: '8px', border: 'none',
                  backgroundColor: '#dc2626', color: 'white', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <FaTrash size={12} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      <Notification
        show={notification.show}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={() => setNotification({ show: false })}
      />

      {/* ─── CSS Animations ─── */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        @keyframes loadingSlide {
          0% { left: -40%; }
          100% { left: 100%; }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default KitchenOrderTicket;
