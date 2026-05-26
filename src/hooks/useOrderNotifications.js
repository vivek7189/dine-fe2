'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
// import Pusher from 'pusher-js'; // COMMENTED OUT — replaced by Firebase RTDB
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../firebase';

const STORAGE_KEY = 'orderNotifications';
const SOUND_KEY = 'orderNotifSound';
const MAX_NOTIFICATIONS = 50;

// ─── Sound Helper (Web Audio API) — 3-tone ascending chime ───
const playOrderSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.value = 0.18;

    // Three-tone ascending: C5 → E5 → G5
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.14);
    });

    setTimeout(() => ctx.close(), 1500);
  } catch (e) {
    // Audio not supported
  }
};

// Load notifications from localStorage
const loadNotifications = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save notifications to localStorage
const saveNotifications = (notifications) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch {}
};

export function useOrderNotifications(restaurantId, notificationOrderTypes = null) {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const pathname = usePathname();
  const soundEnabledRef = useRef(true);
  const pathnameRef = useRef(pathname);

  // Keep refs in sync
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  // Load initial state
  useEffect(() => {
    setNotifications(loadNotifications());
    const savedSound = localStorage.getItem(SOUND_KEY);
    if (savedSound !== null) {
      const enabled = savedSound !== 'false';
      setSoundEnabled(enabled);
      soundEnabledRef.current = enabled;
    }
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((orderData) => {
    const orderType = orderData.orderType || 'dine-in';

    // If notificationOrderTypes is set, only notify for matching types
    if (notificationOrderTypes && notificationOrderTypes.length > 0) {
      if (!notificationOrderTypes.includes(orderType)) {
        return; // Skip — this order type has notifications disabled
      }
    }

    const notification = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      orderId: orderData.id || orderData.orderId,
      dailyOrderId: orderData.dailyOrderId || orderData.orderNumber,
      orderType,
      customerName: orderData.customerName || orderData.customer?.name || '',
      customerPhone: orderData.customerPhone || orderData.customer?.phone || '',
      itemsCount: orderData.itemsCount || orderData.items?.length || 0,
      tableNumber: orderData.tableNumber || '',
      totalAmount: orderData.totalAmount || orderData.finalAmount || 0,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
      saveNotifications(updated);
      return updated;
    });

    // Add toast
    setToasts(prev => {
      const newToasts = [notification, ...prev].slice(0, 3);
      return newToasts;
    });

    // Play sound (skip on KOT page — it has its own)
    if (soundEnabledRef.current && pathnameRef.current !== '/kot') {
      playOrderSound();
    }
  }, [notificationOrderTypes]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === notificationId ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem(SOUND_KEY, String(next));
      soundEnabledRef.current = next;
      return next;
    });
  }, []);

  // Auto-dismiss toasts after 8 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(0, -1)); // Remove oldest
    }, 8000);
    return () => clearTimeout(timer);
  }, [toasts]);

  // ─── Firebase RTDB Subscription (replaces Pusher) ───
  useEffect(() => {
    if (!restaurantId || !database) return;

    const now = Date.now();
    const ordersRef = query(ref(database, `events/${restaurantId}/orders`), orderByChild('ts'), startAt(now));

    console.log(`🔔 OrderNotifications: Subscribed to Firebase RTDB events/${restaurantId}/orders`);

    const handleEvent = (snapshot) => {
      const data = snapshot.val();
      if (data && data.type === 'order-created') {
        // Skip stale events (> 2 min old) to prevent notification floods
        // after Firebase reconnects from a network drop.
        const eventAge = data.ts ? Date.now() - data.ts : 0;
        if (eventAge > 2 * 60 * 1000) {
          console.log(`🔔 OrderNotifications: Skipping stale order event (${Math.round(eventAge / 1000)}s old)`);
          return;
        }
        console.log('🔔 OrderNotifications: New order received', data);
        addNotification(data);
      }
    };
    onChildAdded(ordersRef, handleEvent);

    return () => {
      console.log(`🔔 OrderNotifications: Unsubscribing from Firebase RTDB`);
      off(ordersRef, 'child_added', handleEvent);
    };
  }, [restaurantId, addNotification]);

  // ─── FCM Web Push (background notifications) ───
  useEffect(() => {
    if (!restaurantId) return;
    // Delay FCM init to avoid blocking initial render
    const timer = setTimeout(() => {
      import('../lib/fcmWeb').then(({ initFCM, isFCMSupported }) => {
        if (isFCMSupported()) {
          initFCM(restaurantId).then(result => {
            if (result.success) {
              console.log('🔔 FCM Web Push: Registered successfully');
            } else if (result.error !== 'permission-denied') {
              console.warn('🔔 FCM Web Push:', result.error);
            }
          });
        }
      }).catch(() => {});
    }, 5000);
    return () => clearTimeout(timer);
  }, [restaurantId]);

  return {
    notifications,
    unreadCount,
    toasts,
    soundEnabled,
    markAsRead,
    markAllRead,
    clearAll,
    dismissToast,
    toggleSound,
  };
}
