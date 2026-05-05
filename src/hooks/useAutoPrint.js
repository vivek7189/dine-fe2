'use client';

// Auto-print hook for native platforms (Capacitor/Tauri).
// Listens to Pusher events and auto-prints KOTs/bills when enabled in /admin settings.
// No-op on web — web uses the dedicated /print-kot page for KOT printing.

import { useEffect, useRef, useCallback } from 'react';
import { supportsNativeAutoPrint, printDocument } from '../utils/printBridge';
import apiClient from '../lib/api';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '4e1f74ae05c66bbc4eec';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

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
        try {
          const renderData = await apiClient.getKOTRender(restaurantId, data.orderId);
          if (renderData?.html) {
            printQueueRef.current.push({ html: renderData.html, type: 'kot' });
            processQueue();
          }
        } catch (err) {
          console.error('Failed to fetch KOT render for auto-print:', err);
        }
      });

      // Auto-print KOT on order update (incremental: only new items)
      channel.bind('kot-print-request', async (data) => {
        if (!printSettings?.autoPrintOnKOT) return;
        try {
          const renderData = await apiClient.getKOTRender(
            restaurantId, data.orderId,
            { newOnly: data.isIncremental || false, stationId: data.printStationId || null }
          );
          if (renderData?.html) {
            printQueueRef.current.push({ html: renderData.html, type: 'kot' });
            processQueue();
          }
        } catch (err) {
          console.error('Failed to fetch KOT render for auto-print (update):', err);
        }
      });

      // Auto-print bill when order is billed
      channel.bind('order-billed', async (data) => {
        if (!printSettings?.autoPrintOnBilling) return;
        try {
          const renderData = await apiClient.getBillRender(restaurantId, data.orderId);
          if (renderData?.html) {
            printQueueRef.current.push({ html: renderData.html, type: 'bill' });
            processQueue();
          }
        } catch (err) {
          console.error('Failed to fetch bill render for auto-print:', err);
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
