// FCM Web Push Notification setup
// Handles permission request, token registration, and foreground message handling.

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app as firebaseApp } from '../../firebase';
import apiClient from './api';

const FCM_DEVICE_ID_KEY = 'fcmWebDeviceId';
const FCM_TOKEN_KEY = 'fcmWebToken';

/**
 * Get or create a stable device ID for this browser.
 */
function getDeviceId() {
  let deviceId = localStorage.getItem(FCM_DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `web-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
    localStorage.setItem(FCM_DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Check if the browser supports FCM web push.
 */
export function isFCMSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
}

/**
 * Initialize FCM for web push notifications.
 * - Registers service worker
 * - Requests notification permission
 * - Gets FCM token
 * - Registers token with backend
 *
 * @param {string} restaurantId - The restaurant ID to register for
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export async function initFCM(restaurantId) {
  if (!isFCMSupported()) {
    return { success: false, error: 'FCM not supported in this browser' };
  }

  if (!restaurantId) {
    return { success: false, error: 'No restaurant ID' };
  }

  try {
    // 1. Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM Web] Notification permission denied');
      return { success: false, error: 'permission-denied' };
    }

    // 2. Register service worker
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    console.log('[FCM Web] Service worker registered');

    // 3. Get messaging instance
    const messaging = getMessaging(firebaseApp);

    // 4. Get FCM token
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      return { success: false, error: 'Failed to get FCM token' };
    }

    console.log('[FCM Web] Token obtained:', token.slice(0, 20) + '...');

    // 5. Register token with backend (only if changed)
    const prevToken = localStorage.getItem(FCM_TOKEN_KEY);
    if (token !== prevToken) {
      const deviceId = getDeviceId();
      await registerTokenWithBackend(restaurantId, deviceId, token);
      localStorage.setItem(FCM_TOKEN_KEY, token);
    }

    // 6. Handle foreground messages (we already handle via Pusher, so just log)
    onMessage(messaging, (payload) => {
      console.log('[FCM Web] Foreground message (handled by Pusher):', payload);
      // No-op: Pusher hook already handles in-app notifications when tab is active
    });

    return { success: true, token };
  } catch (err) {
    console.error('[FCM Web] Init failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Register FCM token with the backend.
 */
async function registerTokenWithBackend(restaurantId, deviceId, token) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/web/register-fcm-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurantId,
        deviceId,
        token,
        deviceType: 'web',
        deviceName: `${navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Browser'} - ${navigator.platform}`,
      }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    console.log('[FCM Web] Token registered with backend');
  } catch (err) {
    console.error('[FCM Web] Token registration failed:', err);
  }
}

/**
 * Check current notification permission status.
 */
export function getNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'granted' | 'denied' | 'default'
}
