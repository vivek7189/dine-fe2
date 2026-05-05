'use client';

// Auto-print hook for native platforms (Capacitor/Tauri).
// Listens to Pusher events and auto-prints KOTs/bills when enabled in /admin settings.
// No-op on web — web uses the dedicated /print-kot page for KOT printing.
//
// Deduplication: if an order was already printed locally (via OrderSummary "KOT & Print"
// or "Bill & Print"), the Pusher-triggered print is skipped to avoid double-printing.
// Offline resilience: if the API fetch fails (offline), the event is skipped gracefully.

import { useEffect, useRef, useCallback } from 'react';
import { supportsNativeAutoPrint, printDocument } from '../utils/printBridge';
import apiClient from '../lib/api';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '4e1f74ae05c66bbc4eec';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

// Track recently printed order IDs to prevent duplicates (max 50)
const recentlyPrinted = new Set();
function markPrinted(orderId, type) {
  const key = `${type}:${orderId}`;
  recentlyPrinted.add(key);
  // Clean up old entries
  if (recentlyPrinted.size > 50) {
    const first = recentlyPrinted.values().next().value;
    recentlyPrinted.delete(first);
  }
  // Auto-expire after 60 seconds
  setTimeout(() => recentlyPrinted.delete(key), 60000);
}
function wasPrinted(orderId, type) {
  // Check both our set and the window flags set by OrderSummary
  if (recentlyPrinted.has(`${type}:${orderId}`)) return true;
  if (type === 'kot' && typeof window !== 'undefined' && window.__lastLocalPrintedKOT === orderId) {
    window.__lastLocalPrintedKOT = null;
    return true;
  }
  if (type === 'bill' && typeof window !== 'undefined' && window.__lastLocalPrintedBill === orderId) {
    window.__lastLocalPrintedBill = null;
    return true;
  }
  return false;
}

export function useAutoPrint(restaurantId, printSettings) {
  const printQueueRef = useRef([]);
  const isPrintingRef = useRef(false);
  const pusherRef = useRef(null);

  const processQueue = useCallback(async () => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;

    while (printQueueRef.current.length > 0) {
      const job = printQueueRef.current.shift();
      try {
        await printDocument({
          html: job.html,
          type: job.type,
          printSettings: printSettings || {},
        });
        markPrinted(job.orderId, job.type);
      } catch (err) {
        console.error('Auto-print failed:', err);
      }
      // Small delay between prints to prevent printer buffer overflow
      await new Promise(r => setTimeout(r, 500));
    }

    isPrintingRef.current = false;
  }, [printSettings]);

  useEffect(() => {
    // Only activate on native platforms with valid config
    if (!supportsNativeAutoPrint() || !restaurantId) return;
    if (!printSettings?.autoPrintOnKOT && !printSettings?.autoPrintOnBilling) return;

    let channel;

    import('pusher-js').then(({ default: Pusher }) => {
      const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
      pusherRef.current = pusher;

      channel = pusher.subscribe(`restaurant-${restaurantId}`);

      // Auto-print KOT when new order created
      channel.bind('order-created', async (data) => {
        if (!printSettings?.autoPrintOnKOT) return;
        if (wasPrinted(data.orderId, 'kot')) return; // Already printed locally
        try {
          const renderData = await apiClient.getKOTRender(restaurantId, data.orderId);
          if (renderData?.html) {
            printQueueRef.current.push({ html: renderData.html, type: 'kot', orderId: data.orderId });
            processQueue();
          }
        } catch (err) {
          // Offline or API failure — skip gracefully (order will print when manually triggered)
          console.warn('Auto-print KOT skipped (offline or API error):', err.message);
        }
      });

      // Auto-print KOT on order update (incremental: only new items)
      channel.bind('kot-print-request', async (data) => {
        if (!printSettings?.autoPrintOnKOT) return;
        if (wasPrinted(data.orderId, 'kot')) return;
        try {
          const renderData = await apiClient.getKOTRender(
            restaurantId, data.orderId,
            { newOnly: data.isIncremental || false, stationId: data.printStationId || null }
          );
          if (renderData?.html) {
            printQueueRef.current.push({ html: renderData.html, type: 'kot', orderId: data.orderId });
            processQueue();
          }
        } catch (err) {
          console.warn('Auto-print KOT (update) skipped (offline or API error):', err.message);
        }
      });

      // Auto-print bill when order is billed
      channel.bind('order-billed', async (data) => {
        if (!printSettings?.autoPrintOnBilling) return;
        if (wasPrinted(data.orderId, 'bill')) return; // Already printed locally
        try {
          const renderData = await apiClient.getBillRender(restaurantId, data.orderId);
          if (renderData?.html) {
            printQueueRef.current.push({ html: renderData.html, type: 'bill', orderId: data.orderId });
            processQueue();
          }
        } catch (err) {
          console.warn('Auto-print bill skipped (offline or API error):', err.message);
        }
      });
    });

    return () => {
      if (channel) {
        channel.unbind_all();
      }
      if (pusherRef.current) {
        pusherRef.current.unsubscribe(`restaurant-${restaurantId}`);
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, [restaurantId, printSettings, processQueue]);
}
