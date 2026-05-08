'use client';

// Auto-print hook for native platforms (Electron/Capacitor/Tauri).
// Listens to Pusher AND LAN Hub events for real-time auto-printing.
// Works both online (Pusher + cloud API) and offline (LAN hub + local API).
//
// Flow: event arrives → fetch render data (cloud or local) → generate HTML locally → print
//
// Deduplication: if an order was already printed locally (via OrderSummary "KOT & Print"
// or "Bill & Print"), the event-triggered print is skipped to avoid double-printing.

import { useEffect, useRef, useCallback } from 'react';
import { supportsNativeAutoPrint, printDocument } from '../utils/printBridge';
import { generateKOTHTML, generateBillHTML } from '../utils/printHtmlGenerator';
import { buildTokenSlipHTML } from '../utils/printFontSizes';
import { isElectron } from '../utils/platform';
import apiClient from '../lib/api';

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '4e1f74ae05c66bbc4eec';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

// Track recently printed order IDs to prevent duplicates (max 50)
const recentlyPrinted = new Set();
function markPrinted(orderId, type) {
  const key = `${type}:${orderId}`;
  recentlyPrinted.add(key);
  if (recentlyPrinted.size > 50) {
    const first = recentlyPrinted.values().next().value;
    recentlyPrinted.delete(first);
  }
  setTimeout(() => recentlyPrinted.delete(key), 60000);
}
function wasPrinted(orderId, type) {
  if (recentlyPrinted.has(`${type}:${orderId}`)) return true;
  if (type === 'kot' && typeof window !== 'undefined' && window.__lastLocalPrintedKOT === orderId) {
    return true;
  }
  if (type === 'bill' && typeof window !== 'undefined' && window.__lastLocalPrintedBill === orderId) {
    return true;
  }
  return false;
}
if (typeof window !== 'undefined') {
  setInterval(() => {
    window.__lastLocalPrintedBill = null;
    window.__lastLocalPrintedKOT = null;
    window.__lastLocalPrintedTokens = null;
  }, 30000);
}

// ── HTML generation from render data ──
// The render API returns structured data (kot/bill objects), not pre-built HTML.
// We generate HTML locally using the same generators as OrderSummary.
function kotRenderToHtml(renderData) {
  if (renderData?.html) return renderData.html; // if server ever returns pre-built HTML
  const kot = renderData?.kot;
  if (!kot) return null;
  const ps = renderData?.printSettings || {};
  const labels = renderData?.labels || {};
  // Enrich kot with restaurant name for the generator
  const kotData = {
    ...kot,
    restaurantName: renderData?.restaurant?.name || kot.restaurantName || 'Restaurant',
  };
  return generateKOTHTML(kotData, ps, labels);
}

function billRenderToHtml(renderData) {
  if (renderData?.html) return renderData.html;
  const invoice = renderData?.invoice || renderData?.bill;
  if (!invoice) return null;
  const ps = renderData?.printSettings || {};
  const labels = renderData?.labels || {};
  return generateBillHTML(invoice, ps, labels);
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
      await new Promise(r => setTimeout(r, 500));
    }

    isPrintingRef.current = false;
  }, [printSettings]);

  // Print food court token slips after bill
  const printTokensForOrder = useCallback(async (orderId, ps) => {
    if (!ps?.tokenBillingEnabled || !restaurantId || !orderId) return;
    if (typeof window !== 'undefined' && window.__lastLocalPrintedTokens === orderId) {
      window.__lastLocalPrintedTokens = null;
      return;
    }
    try {
      const tokenRes = await apiClient.getTokenRender(restaurantId, orderId);
      const tokens = tokenRes?.tokens || [];
      if (!tokenRes?.success || tokens.length === 0) return;

      for (const token of tokens) {
        const tokenHtml = buildTokenSlipHTML(token, ps || {});
        printQueueRef.current.push({ html: tokenHtml, type: 'bill', orderId: `token-${orderId}` });
      }
      processQueue();
    } catch (err) {
      console.warn('Auto-print tokens skipped (offline or API error):', err.message);
    }
  }, [restaurantId, processQueue]);

  // ── Shared handlers used by both Pusher and LAN hub ──
  const handleKotCreated = useCallback(async (data) => {
    if (!printSettings?.autoPrintOnKOT) return;
    const orderId = data.orderId || data.id;
    if (!orderId || wasPrinted(orderId, 'kot')) return;
    try {
      const renderData = await apiClient.getKOTRender(restaurantId, orderId);
      const html = kotRenderToHtml(renderData);
      if (html) {
        printQueueRef.current.push({ html, type: 'kot', orderId });
        processQueue();
      }
    } catch (err) {
      console.warn('Auto-print KOT skipped:', err.message);
    }
  }, [restaurantId, printSettings, processQueue]);

  const handleKotPrintRequest = useCallback(async (data) => {
    if (!printSettings?.autoPrintOnKOT) return;
    const orderId = data.orderId || data.id;
    if (!orderId || wasPrinted(orderId, 'kot')) return;
    try {
      const renderData = await apiClient.getKOTRender(
        restaurantId, orderId,
        { newOnly: data.isIncremental || false, stationId: data.printStationId || null }
      );
      const html = kotRenderToHtml(renderData);
      if (html) {
        printQueueRef.current.push({ html, type: 'kot', orderId });
        processQueue();
      }
    } catch (err) {
      console.warn('Auto-print KOT (update) skipped:', err.message);
    }
  }, [restaurantId, printSettings, processQueue]);

  const handleBillingPrint = useCallback(async (data) => {
    if (!printSettings?.autoPrintOnBilling) return;
    const orderId = data.orderId || data.id;
    if (!orderId || wasPrinted(orderId, 'bill')) return;
    try {
      const renderData = await apiClient.getBillRender(restaurantId, orderId);
      const html = billRenderToHtml(renderData);
      if (html) {
        printQueueRef.current.push({ html, type: 'bill', orderId });
        processQueue();
      }
      if (data.tokenBillingEnabled || printSettings?.tokenBillingEnabled) {
        setTimeout(() => printTokensForOrder(orderId, printSettings), 900);
      }
    } catch (err) {
      console.warn('Auto-print bill skipped:', err.message);
    }
  }, [restaurantId, printSettings, processQueue, printTokensForOrder]);

  // ──── Pusher events (online) ────
  useEffect(() => {
    if (!supportsNativeAutoPrint() || !restaurantId) return;
    if (!printSettings?.autoPrintOnKOT && !printSettings?.autoPrintOnBilling) return;
    if (!printSettings?.usePusherForKOT) return;

    let channel;

    import('pusher-js').then(({ default: Pusher }) => {
      const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
      pusherRef.current = pusher;

      channel = pusher.subscribe(`restaurant-${restaurantId}`);

      channel.bind('order-created', handleKotCreated);
      channel.bind('kot-print-request', handleKotPrintRequest);
      channel.bind('billing-print-request', handleBillingPrint);
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
  }, [restaurantId, printSettings, handleKotCreated, handleKotPrintRequest, handleBillingPrint]);

  // ──── LAN Hub events (offline) ────
  // When on LAN (Electron paired with hub), events come via IPC instead of Pusher.
  useEffect(() => {
    if (!isElectron() || !window.electronAPI?.onHubEvent) return;
    if (!restaurantId) return;
    if (!printSettings?.autoPrintOnKOT && !printSettings?.autoPrintOnBilling) return;

    const unsubscribe = window.electronAPI.onHubEvent(async (msg) => {
      if (msg.type !== 'event') return;

      if (msg.event === 'order-created') {
        handleKotCreated(msg.data || {});
      } else if (msg.event === 'kot-print-request') {
        handleKotPrintRequest(msg.data || {});
      } else if (msg.event === 'billing-print-request') {
        handleBillingPrint(msg.data || {});
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [restaurantId, printSettings, handleKotCreated, handleKotPrintRequest, handleBillingPrint]);
}
