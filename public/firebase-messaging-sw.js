// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the tab is not active/focused.

importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Firebase config — must match the main app config
firebase.initializeApp({
  apiKey: 'AIzaSyExample', // Will be overridden by actual env at build time
  authDomain: 'dineopen.firebaseapp.com',
  projectId: 'dineopen',
  storageBucket: 'dineopen.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123',
});

const messaging = firebase.messaging();

// Handle background messages (when tab is not focused)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw] Background message received:', payload);

  const data = payload.data || {};
  const notification = payload.notification || {};

  // Build notification from data payload
  const title = notification.title || data.title || 'New Order Received';
  const body = notification.body || data.body || `Order #${data.dailyOrderId || '—'} • ${data.orderType || 'Online'}`;

  const options = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: `order-${data.orderId || Date.now()}`, // Prevents duplicate notifications
    renotify: true,
    requireInteraction: true, // Keep notification visible until user interacts
    data: {
      orderId: data.orderId || data.id,
      url: '/orders',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'view', title: 'View Order' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  return self.registration.showNotification(title, options);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  if (action === 'dismiss') return;

  // Navigate to orders page
  const url = event.notification.data?.url || '/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes('/dashboard') || client.url.includes('/orders') || client.url.includes('/billing')) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});
