'use client';

// Auto-print hook for native platforms (Electron/Capacitor/Tauri).
// Listens to Firebase RTDB AND LAN Hub events for real-time auto-printing.
// Works both online (Firebase RTDB + cloud API) and offline (LAN hub + local API).
//
// Flow: event arrives → fetch render data (cloud or local) → generate HTML locally → print
//
// Deduplication: if an order was already printed locally (via OrderSummary "KOT & Print"
// or "Bill & Print"), the event-triggered print is skipped to avoid double-printing.

import { useEffect, useRef, useCallback } from 'react';
import { supportsNativeAutoPrint, printDocument } from '../utils/printBridge';
import { generateKOTHTML, generateBillHTML } from '../utils/printHtmlGenerator';
import { buildTokenSlipHTML } from '../utils/printFontSizes';
import { isElectron, isReactNativeWebView } from '../utils/platform';
import apiClient from '../lib/api';
import { ref, onChildAdded, off, query, orderByChild, startAt } from 'firebase/database';
import { database } from '../../firebase';

// const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '4e1f74ae05c66bbc4eec';
// const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

// Track recently printed order IDs to prevent duplicates (max 200).
// Uses a Map with timestamps instead of Set + individual setTimeouts,
// so we avoid accumulating hundreds of timers over long sessions.
// TTL is 5 minutes (300s) to prevent double-prints from delayed Firebase events.
const DEDUP_TTL_MS = 300000; // 5 minutes — covers Firebase RTDB replay delays
const DEDUP_MAX_SIZE = 200;
const recentlyPrinted = new Map(); // key -> timestamp
function markPrinted(orderId, type) {
  const key = `${type}:${orderId}`;
  recentlyPrinted.set(key, Date.now());
  // Evict oldest if over limit
  if (recentlyPrinted.size > DEDUP_MAX_SIZE) {
    const firstKey = recentlyPrinted.keys().next().value;
    recentlyPrinted.delete(firstKey);
  }
}
function wasPrinted(orderId, type) {
  const key = `${type}:${orderId}`;
  const ts = recentlyPrinted.get(key);
  if (ts && (Date.now() - ts) < DEDUP_TTL_MS) return true;
  if (ts) recentlyPrinted.delete(key); // expired, clean up
  if (type === 'kot' && typeof window !== 'undefined' && window.__lastLocalPrintedKOT === orderId) {
    return true;
  }
  if (type === 'bill' && typeof window !== 'undefined' && window.__lastLocalPrintedBill === orderId) {
    return true;
  }
  return false;
}

// Periodically clear the dedup window globals and prune expired entries.
// Uses a single interval (started once) instead of per-item timeouts.
// Runs every 60s — window globals are cleared so old prints don't block forever,
// but the recentlyPrinted Map uses a 5-minute TTL for reliable dedup.
let _autoPrintCleanupInterval = null;
if (typeof window !== 'undefined' && !_autoPrintCleanupInterval) {
  _autoPrintCleanupInterval = setInterval(() => {
    window.__lastLocalPrintedBill = null;
    window.__lastLocalPrintedKOT = null;
    window.__lastLocalPrintedTokens = null;
    // Prune expired entries from recentlyPrinted
    const now = Date.now();
    for (const [key, ts] of recentlyPrinted) {
      if (now - ts > DEDUP_TTL_MS) recentlyPrinted.delete(key);
    }
  }, 60000);
}

// ── Notify UI about print events (for debug toast) ──
function emitPrintEvent(type, orderId, status) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dine-print-event', {
      detail: { type, orderId, status, ts: Date.now() },
    }));
  }
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
          orderId: job.orderId,
          restaurantId,
          stationId: job.stationId,
          printSettings: printSettings || {},
        });
        markPrinted(job.orderId, job.type);
        emitPrintEvent(job.type, job.orderId, 'printed');
      } catch (err) {
        console.error('Auto-print failed:', err);
        emitPrintEvent(job.type, job.orderId, 'failed');
      }
      // Brief pause between prints to avoid overwhelming the printer buffer.
      // 300ms is sufficient for thermal printers while keeping multi-receipt
      // scenarios (split bills) fast — 4 splits now take ~1.2s instead of ~2s.
      await new Promise(r => setTimeout(r, 300));
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

  // Cache print stations config (refreshed on mount)
  const printStationsRef = useRef({ stations: [], mode: 'single', loaded: false });
  useEffect(() => {
    if (!restaurantId) return;
    apiClient.getPrintStations(restaurantId).then(res => {
      if (res?.success) {
        printStationsRef.current = {
          stations: (res.printStations || []).filter(s => s.enabled),
          mode: res.kotPrintingMode || 'single',
          loaded: true
        };
      }
    }).catch(() => {});
  }, [restaurantId]);

  // ── Shared handlers used by both Pusher and LAN hub ──
  const handleKotCreated = useCallback(async (data) => {
    if (!printSettings?.autoPrintOnKOT) return;
    const orderId = data.orderId || data.id;
    if (!orderId || wasPrinted(orderId, 'kot')) return;

    const { stations, mode } = printStationsRef.current;

    // If stations configured: print per-station KOTs (single or multi-printer mode)
    if (stations.length > 1) {
      try {
        for (const station of stations) {
          const renderData = await apiClient.getKOTRender(restaurantId, orderId, { stationId: station.id });
          const html = kotRenderToHtml(renderData);
          if (html) {
            printQueueRef.current.push({ html, type: 'kot', orderId: `${orderId}-${station.id}`, stationId: station.id });
          }
        }
        if (printQueueRef.current.length > 0) {
          markPrinted(orderId, 'kot');
          processQueue();
        }
      } catch (err) {
        console.warn('Auto-print station KOTs skipped:', err.message);
      }
      return;
    }

    // Default: single KOT with all items
    try {
      markPrinted(orderId, 'kot'); // Mark early to prevent double-print from /kot path
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
    if (!orderId) return;
    // For incremental/reprint KOTs, use a unique dedup key (timestamp-based)
    // so updates aren't blocked by the initial KOT's dedup entry.
    const isUpdate = data.isIncremental || data.isReprint || data.forcePrint;
    const dedupKey = isUpdate ? `${orderId}-upd-${data.ts || Date.now()}` : orderId;
    if (wasPrinted(dedupKey, 'kot')) return;
    try {
      const stationId = data.printStationId || null;
      const renderData = await apiClient.getKOTRender(
        restaurantId, orderId,
        { newOnly: data.isIncremental || false, stationId }
      );
      const html = kotRenderToHtml(renderData);
      if (html) {
        markPrinted(dedupKey, 'kot');
        printQueueRef.current.push({ html, type: 'kot', orderId: dedupKey, stationId });
        processQueue();
      }
    } catch (err) {
      console.warn('Auto-print KOT (update) skipped:', err.message);
    }
  }, [restaurantId, printSettings, processQueue]);

  const handleBillingPrint = useCallback(async (data) => {
    const isPreBill = data.isPreBill === true;
    console.log(`🖨️ AutoPrint: handleBillingPrint called, isPreBill=${isPreBill}, orderId=${data.orderId || data.id}`);
    // Pre-bill requests always print (user explicitly tapped Pre-Bill on mobile).
    // Regular bill print requires autoPrintOnBilling setting.
    if (!isPreBill && !printSettings?.autoPrintOnBilling) {
      console.log(`🖨️ AutoPrint: Billing print skipped — autoPrintOnBilling is off`);
      return;
    }
    const orderId = data.orderId || data.id;
    if (!orderId) return;
    const dedupKey = isPreBill ? `prebill-${orderId}` : orderId;
    if (wasPrinted(dedupKey, 'bill')) return;
    try {
      console.log(`🖨️ AutoPrint: Fetching bill render for ${restaurantId}/${orderId}`);
      const renderData = await apiClient.getBillRender(restaurantId, orderId);
      console.log(`🖨️ AutoPrint: Bill render response:`, renderData ? 'OK' : 'null', renderData?.success);
      if (renderData && isPreBill) {
        // Mark as pre-bill so the HTML generator can add "PRE-BILL" header
        if (renderData.invoice) renderData.invoice.isPreBill = true;
        if (renderData.bill) renderData.bill.isPreBill = true;
      }
      const html = billRenderToHtml(renderData);
      console.log(`🖨️ AutoPrint: Bill HTML generated:`, html ? `${html.length} chars` : 'null');
      if (html) {
        markPrinted(dedupKey, 'bill');
        printQueueRef.current.push({ html, type: 'bill', orderId: dedupKey });
        processQueue();
      }
      // Skip token printing for pre-bills
      if (!isPreBill && (data.tokenBillingEnabled || printSettings?.tokenBillingEnabled)) {
        setTimeout(() => printTokensForOrder(orderId, printSettings), 900);
      }
    } catch (err) {
      console.warn(`Auto-print ${isPreBill ? 'pre-bill' : 'bill'} skipped:`, err.message);
    }
  }, [restaurantId, printSettings, processQueue, printTokensForOrder]);

  // ──── Firebase RTDB events (online) — replaces Pusher ────
  // Skip in React Native WebView — OrderSummary handles print with embedded data directly.
  // This hook generates HTML which can't be used by thermal printers in WebView mode.
  //
  // Listens on 3 paths:
  //   - /events/{restaurantId}/orders  — order-created events (always published by backend)
  //   - /events/{restaurantId}/kot     — kot-print-request events (published when usePusherForKOT is on)
  //   - /events/{restaurantId}/billing — billing-print-request events
  useEffect(() => {
    if (!supportsNativeAutoPrint() || !restaurantId || !database) return;
    if (isReactNativeWebView()) return; // OrderSummary handles WebView printing
    if (!printSettings?.autoPrintOnKOT && !printSettings?.autoPrintOnBilling) return;

    const now = Date.now();
    const ordersRef = query(ref(database, `events/${restaurantId}/orders`), orderByChild('ts'), startAt(now));
    const kotRef = query(ref(database, `events/${restaurantId}/kot`), orderByChild('ts'), startAt(now));
    const billingRef = query(ref(database, `events/${restaurantId}/billing`), orderByChild('ts'), startAt(now));

    console.log(`🖨️ AutoPrint: Subscribed to Firebase RTDB events/${restaurantId}/orders, kot & billing`);

    // Handle order-created events from the /orders path — auto-print KOT
    const handleOrderEvent = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const eventAge = data.ts ? Date.now() - data.ts : 0;
      if (eventAge > 2 * 60 * 1000) {
        console.log(`🖨️ AutoPrint: Skipping stale order event (${Math.round(eventAge / 1000)}s old)`);
        return;
      }
      if (data.type === 'order-created' && data.status === 'confirmed') {
        handleKotCreated(data);
      }
    };

    // Handle kot-print-request events from the /kot path (for reprints, updates, station prints)
    const handleKotEvent = (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const eventAge = data.ts ? Date.now() - data.ts : 0;
      if (eventAge > 2 * 60 * 1000) {
        console.log(`🖨️ AutoPrint: Skipping stale KOT event (${Math.round(eventAge / 1000)}s old)`);
        return;
      }
      if (data.type === 'order-created') {
        // Skip — already handled by /orders listener to avoid double-print
      } else if (data.type === 'kot-print-request') {
        handleKotPrintRequest(data);
      }
    };

    const handleBillingEvent = (snapshot) => {
      const data = snapshot.val();
      console.log(`🖨️ AutoPrint: Billing event received:`, JSON.stringify(data));
      if (!data) return;
      const eventAge = data.ts ? Date.now() - data.ts : 0;
      if (eventAge > 2 * 60 * 1000) {
        console.log(`🖨️ AutoPrint: Skipping stale billing event (${Math.round(eventAge / 1000)}s old)`);
        return;
      }
      if (data.type === 'billing-print-request') {
        handleBillingPrint(data);
      } else {
        console.log(`🖨️ AutoPrint: Ignoring billing event type: ${data.type}`);
      }
    };

    const handleError = (err) => {
      console.error(`🖨️ AutoPrint: Firebase RTDB error (may be auth issue):`, err?.message || err);
    };

    onChildAdded(ordersRef, handleOrderEvent, handleError);
    onChildAdded(kotRef, handleKotEvent, handleError);
    onChildAdded(billingRef, handleBillingEvent, handleError);

    return () => {
      console.log(`🖨️ AutoPrint: Unsubscribing from Firebase RTDB`);
      off(ordersRef, 'child_added', handleOrderEvent);
      off(kotRef, 'child_added', handleKotEvent);
      off(billingRef, 'child_added', handleBillingEvent);
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
