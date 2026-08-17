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
import { subscribeRestaurantEvents } from '../lib/realtimeSubscribe';
import { isLocalServerMode } from '../lib/localServer';
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

  // ── Multi-terminal print designation ──
  // When several Electron terminals are online for the same restaurant, EVERY terminal receives
  // the same realtime KOT/Bill events. Without a designated printer, each one prints → duplicate
  // tickets. If the owner designates a print terminal (printSettings.printTerminalId), ONLY that
  // terminal auto-prints incoming events. UNSET (the default) → every terminal prints, exactly as
  // before — so single-terminal setups and all existing installs are 100% unchanged.
  // Each handler inlines the guard:
  //   if (printSettings?.printTerminalId && myTerminalIdRef.current && printSettings.printTerminalId !== myTerminalIdRef.current) return;
  // Skips auto-print ONLY when a terminal is designated AND this isn't it. Fail-open: if this
  // terminal's id can't be read, it still prints (better a duplicate than a missing kitchen ticket).
  const myTerminalIdRef = useRef(null);
  const appVersionRef = useRef(null);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI?.getTerminalId) {
      window.electronAPI.getTerminalId().then((id) => { myTerminalIdRef.current = id || null; }).catch(() => {});
    }
    if (typeof window !== 'undefined' && window.electronAPI?.getVersion) {
      window.electronAPI.getVersion().then((v) => { appVersionRef.current = v || null; }).catch(() => {});
    }
  }, []);

  // Report a remote-print diagnostic to the server (fire-and-forget). Only sends when the
  // restaurant has opted in (printSettings.printDiagnostics) OR the event is a failure — so
  // we can debug a specific terminal remotely without write-amplifying every print.
  const logDiag = useCallback((event) => {
    try {
      const verbose = printSettings?.printDiagnostics === true;
      if (!verbose && event?.success !== false) return; // successes only when verbose; always log failures
      apiClient.logPrintDiagnostic(restaurantId, {
        terminalId: myTerminalIdRef.current,
        appVersion: appVersionRef.current,
        ...event,
      });
    } catch (_) { /* diagnostics must never affect printing */ }
  }, [restaurantId, printSettings]);

  // Latest-handler refs so the polling-fallback timer (below) doesn't tear down and restart every
  // time printSettings is live-refreshed — it depends only on the polling config, and calls the
  // freshest handler through these refs.
  const handleKotCreatedRef = useRef(null);
  const logDiagRef = useRef(null);

  const processQueue = useCallback(async () => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;

    while (printQueueRef.current.length > 0) {
      const job = printQueueRef.current.shift();
      try {
        const result = await printDocument({
          html: job.html,
          type: job.type,
          orderId: job.orderId,
          restaurantId,
          stationId: job.stationId,
          printSettings: printSettings || {},
        });
        markPrinted(job.orderId, job.type);
        emitPrintEvent(job.type, job.orderId, 'printed');
        // Report the REAL outcome. The os-driver path returns success:true to the app but may
        // carry realSuccess:false (driver rejected / printer offline / name mismatch) — surface it.
        const realFailed = result && result.realSuccess === false;
        logDiag({
          phase: 'printed', kind: job.type, orderId: job.orderId, stationId: job.stationId || null,
          success: !realFailed,
          method: result?.method || null,
          configuredDeviceName: result?.configuredDeviceName || result?.printer || null,
          resolvedDeviceName: result?.resolvedDeviceName || null,
          deviceMatched: typeof result?.deviceMatched === 'boolean' ? result.deviceMatched : null,
          availablePrinters: result?.printerNames || null,
          reason: result?.hint || null,
          error: realFailed ? (result?.failureReason || 'driver reported failure') : null,
        });
      } catch (err) {
        console.error('Auto-print failed:', err);
        emitPrintEvent(job.type, job.orderId, 'failed');
        const r = (err && err._result) || {};
        logDiag({
          phase: 'printed', kind: job.type, orderId: job.orderId, stationId: job.stationId || null,
          success: false, error: err?.message || 'print failed',
          method: r.method || null,
          configuredDeviceName: r.configuredDeviceName || r.printer || null,
          resolvedDeviceName: r.resolvedDeviceName || null,
          deviceMatched: typeof r.deviceMatched === 'boolean' ? r.deviceMatched : null,
          availablePrinters: r.printerNames || null,
          reason: r.hint || null,
        });
      }
      // Brief pause between prints to avoid overwhelming the printer buffer.
      // 300ms is sufficient for thermal printers while keeping multi-receipt
      // scenarios (split bills) fast — 4 splits now take ~1.2s instead of ~2s.
      await new Promise(r => setTimeout(r, 300));
    }

    isPrintingRef.current = false;
  }, [printSettings, restaurantId, logDiag]);

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
    // Designated-terminal gate: if a print terminal is chosen and this isn't it, skip (log why).
    if (printSettings?.printTerminalId && myTerminalIdRef.current && printSettings.printTerminalId !== myTerminalIdRef.current) {
      logDiag({ phase: 'skipped', kind: 'kot', orderId, reason: 'not-designated-print-terminal' });
      return;
    }
    if (!orderId || wasPrinted(orderId, 'kot')) return;

    // Mark IMMEDIATELY (before any async work) so that concurrent
    // kot-print-request events from the /kot Firebase path are deduped.
    // Without this, the /kot listener fires handleKotPrintRequest for the
    // same order while we're still awaiting the render API, causing
    // duplicate prints — especially for orders placed from the mobile app
    // which don't set window.__lastLocalPrintedKOT.
    markPrinted(orderId, 'kot');
    // Cross-dedup: also set the global flag so OrderSummary's KOT print effect
    // knows this orderId was already handled and skips its own print.
    if (typeof window !== 'undefined') {
      window.__lastLocalPrintedKOT = orderId;
    }

    const { stations, mode, loaded } = printStationsRef.current;
    // The order reached this desktop — record it so we can confirm delivery even if printing fails.
    logDiag({ phase: 'received', kind: 'kot', orderId, multiStation: mode === 'multi', stationCount: stations.length });
    console.log('[AutoPrint] handleKotCreated:', { orderId, stationsCount: stations.length, stationsLoaded: loaded, mode });

    // If any stations configured: print per-station KOTs (routes each station to its assigned printer)
    if (stations.length >= 1) {
      try {
        const queueLenBefore = printQueueRef.current.length;
        const hasDefaultStation = stations.some(s => s.isDefault);

        for (const station of stations) {
          const renderData = await apiClient.getKOTRender(restaurantId, orderId, { stationId: station.id });
          // Skip if backend says no items, or if kot items array is empty
          const kotItems = renderData?.kot?.items || [];
          if (renderData?.empty || kotItems.length === 0) {
            console.log(`[AutoPrint] Station KOT skipped (0 items): ${station.name} (${station.id})`);
            continue;
          }
          const html = kotRenderToHtml(renderData);
          if (html) {
            printQueueRef.current.push({ html, type: 'kot', orderId: `${orderId}-${station.id}`, stationId: station.id });
            const itemNames = kotItems.map(i => `${i.quantity || 1}x ${i.name || i.itemName}`).join(', ');
            console.log(`[AutoPrint] Station KOT queued: ${station.name} (${station.id}) [${kotItems.length} items]${station.isDefault ? ' [default - includes unassigned]' : ''}`);
            console.log(`[AutoPrint]   → Items: ${itemNames}`);
          }
        }

        // Catch-all: if no station is marked as default, unassigned categories won't be
        // in any station KOT. Print a combined KOT (all items) to the default printer
        // so no items are lost. If a default station exists, the backend already includes
        // unassigned items in that station's KOT.
        if (!hasDefaultStation) {
          const allAssignedCatIds = new Set();
          for (const s of stations) {
            for (const cId of (s.categoryIds || [])) allAssignedCatIds.add(cId);
          }
          // Only print catch-all if there could be unassigned items (not all categories are covered)
          if (allAssignedCatIds.size > 0) {
            const renderData = await apiClient.getKOTRender(restaurantId, orderId);
            const html = kotRenderToHtml(renderData);
            if (html) {
              // Print to default printer (no stationId) — catch-all for unassigned items
              printQueueRef.current.push({ html, type: 'kot', orderId: `${orderId}-default` });
              console.log('[AutoPrint] Catch-all KOT queued for unassigned categories → default printer');
            }
          }
        }

        if (printQueueRef.current.length > queueLenBefore) {
          processQueue();
          return;
        }
        // Fallback: all station-filtered KOTs were empty — print combined KOT
        console.warn('Auto-print: all station KOTs empty, falling back to combined KOT');
      } catch (err) {
        console.warn('Auto-print station KOTs failed, falling back to combined KOT:', err.message);
      }
    }

    // Default: single KOT with all items
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
  }, [restaurantId, printSettings, processQueue, logDiag]);

  const handleKotPrintRequest = useCallback(async (data) => {
    if (!printSettings?.autoPrintOnKOT) return;
    if (printSettings?.printTerminalId && myTerminalIdRef.current && printSettings.printTerminalId !== myTerminalIdRef.current) {
      logDiag({ phase: 'skipped', kind: 'kot-request', orderId: data.orderId || data.id, reason: 'not-designated-print-terminal' });
      return;
    }
    const orderId = data.orderId || data.id;
    if (!orderId) return;

    // For the initial KOT (not incremental/reprint/force), check if the base
    // orderId was already printed by handleKotCreated (via the /orders path).
    // This prevents double-printing when both order-created and
    // kot-print-request events fire for the same order (common for orders
    // placed from the mobile app).
    const isUpdate = data.isIncremental || data.isReprint || data.forcePrint;
    if (!isUpdate && wasPrinted(orderId, 'kot')) {
      console.log(`🖨️ AutoPrint: KOT print-request skipped (already printed by order-created): ${orderId}`);
      return;
    }

    // For incremental/reprint KOTs, use a unique dedup key (timestamp-based)
    // so updates aren't blocked by the initial KOT's dedup entry.
    const dedupKey = isUpdate ? `${orderId}-upd-${data.ts || Date.now()}` : orderId;
    if (isUpdate && wasPrinted(dedupKey, 'kot')) return;

    try {
      markPrinted(dedupKey, 'kot');
      const stationId = data.printStationId || null;
      const renderData = await apiClient.getKOTRender(
        restaurantId, orderId,
        { newOnly: data.isIncremental || false, stationId }
      );
      const html = kotRenderToHtml(renderData);
      if (html) {
        printQueueRef.current.push({ html, type: 'kot', orderId: dedupKey, stationId });
        processQueue();
      }
    } catch (err) {
      console.warn('Auto-print KOT (update) skipped:', err.message);
    }
  }, [restaurantId, printSettings, processQueue, logDiag]);

  const handleBillingPrint = useCallback(async (data) => {
    const isPreBill = data.isPreBill === true;
    console.log(`🖨️ AutoPrint: handleBillingPrint called, isPreBill=${isPreBill}, orderId=${data.orderId || data.id}`);
    if (printSettings?.printTerminalId && myTerminalIdRef.current && printSettings.printTerminalId !== myTerminalIdRef.current) {
      logDiag({ phase: 'skipped', kind: 'billing', orderId: data.orderId || data.id, reason: 'not-designated-print-terminal' });
      return;
    }
    // Kenya KRA eTIMS: when live, the eTIMS flow prints the combined fiscal
    // receipt. Skip the normal final-bill print here (a pre-bill still prints).
    if (!isPreBill && typeof window !== 'undefined' && window.__etimsFiscalActive) {
      console.log('🖨️ AutoPrint: Billing print skipped — eTIMS fiscal receipt handles it');
      return;
    }
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
        // Cross-dedup: tell OrderSummary this bill was already printed by AutoPrint
        // so its bill print effect skips the duplicate print.
        if (typeof window !== 'undefined') {
          window.__lastLocalPrintedBill = orderId;
        }
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
  }, [restaurantId, printSettings, processQueue, printTokensForOrder, logDiag]);

  // Keep the polling-fallback timer pointed at the freshest handlers without re-arming on every
  // printSettings refresh.
  handleKotCreatedRef.current = handleKotCreated;
  logDiagRef.current = logDiag;

  // ──── Firebase RTDB events (online) — replaces Pusher ────
  // Skip in React Native WebView — OrderSummary handles print with embedded data directly.
  // This hook generates HTML which can't be used by thermal printers in WebView mode.
  //
  // Listens on 3 paths:
  //   - /events/{restaurantId}/orders  — order-created events (always published by backend)
  //   - /events/{restaurantId}/kot     — kot-print-request events (published when usePusherForKOT is on)
  //   - /events/{restaurantId}/billing — billing-print-request events
  useEffect(() => {
    if (!supportsNativeAutoPrint() || !restaurantId) return;
    if (isReactNativeWebView()) return; // OrderSummary handles WebView printing
    if (!printSettings?.autoPrintOnKOT && !printSettings?.autoPrintOnBilling) return;
    // Cloud mode needs Firebase RTDB; local-server (offline LAN) mode uses the socket.
    if (!isLocalServerMode() && !database) return;

    console.log(`🖨️ AutoPrint: Subscribed to ${restaurantId} orders, kot & billing`);

    // Handle order-created events from the /orders path — auto-print KOT
    const processOrderEvent = (data) => {
      if (!data) return;
      const eventAge = data.ts ? Date.now() - data.ts : 0;
      // Skip the reconnect-flood age guard in local-server mode: the LAN socket has no replay
      // flood, and offline clock skew would otherwise drop live prints. Dedup handles repeats.
      if (!isLocalServerMode() && eventAge > 2 * 60 * 1000) {
        console.log(`🖨️ AutoPrint: Skipping stale order event (${Math.round(eventAge / 1000)}s old)`);
        return;
      }
      if (data.type === 'order-created' && data.status === 'confirmed') {
        handleKotCreated(data);
      }
    };

    // Handle kot-print-request events from the /kot path (for reprints, updates, station prints)
    const processKotEvent = (data) => {
      if (!data) return;
      const eventAge = data.ts ? Date.now() - data.ts : 0;
      // Skip the reconnect-flood age guard in local-server mode: the LAN socket has no replay
      // flood, and offline clock skew would otherwise drop live prints. Dedup handles repeats.
      if (!isLocalServerMode() && eventAge > 2 * 60 * 1000) {
        console.log(`🖨️ AutoPrint: Skipping stale KOT event (${Math.round(eventAge / 1000)}s old)`);
        return;
      }
      if (data.type === 'order-created') {
        // Skip — already handled by /orders listener to avoid double-print
      } else if (data.type === 'kot-print-request') {
        handleKotPrintRequest(data);
      }
    };

    const processBillingEvent = (data) => {
      console.log(`🖨️ AutoPrint: Billing event received:`, JSON.stringify(data));
      if (!data) return;
      const eventAge = data.ts ? Date.now() - data.ts : 0;
      // Skip the reconnect-flood age guard in local-server mode: the LAN socket has no replay
      // flood, and offline clock skew would otherwise drop live prints. Dedup handles repeats.
      if (!isLocalServerMode() && eventAge > 2 * 60 * 1000) {
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
      console.error(`🖨️ AutoPrint: real-time error (may be auth issue):`, err?.message || err);
    };

    const unsubOrders = subscribeRestaurantEvents(restaurantId, 'orders', processOrderEvent, { onError: handleError });
    const unsubKot = subscribeRestaurantEvents(restaurantId, 'kot', processKotEvent, { onError: handleError });
    const unsubBilling = subscribeRestaurantEvents(restaurantId, 'billing', processBillingEvent, { onError: handleError });

    return () => {
      console.log(`🖨️ AutoPrint: Unsubscribing`);
      unsubOrders();
      unsubKot();
      unsubBilling();
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

  // ──── Server-controlled KOT polling fallback (default OFF) ────
  // Safety net for when the realtime (RTDB) socket silently drops on a long-running desktop
  // terminal (esp. Windows Electron) — auto-print "stops working" until a page refresh. This does
  // NOTHING unless the operator turns it ON for THIS restaurant from dine-admin
  // (printSettings.kotPollingEnabled). When on, the desktop periodically asks the backend for
  // recent still-'confirmed' orders and prints any KOT it hasn't already printed — reusing the
  // exact same render + dedup + print path as the realtime handler, so no double prints.
  //
  // Depends only on the polling CONFIG (not the whole printSettings object), so live settings
  // refreshes don't constantly re-arm the timer. Handlers are reached via refs (freshest closure).
  const pollEnabled = printSettings?.kotPollingEnabled === true;
  const pollAutoKot = printSettings?.autoPrintOnKOT === true;
  const pollIntervalSec = printSettings?.kotPollingIntervalSec;
  const pollTerminalId = printSettings?.printTerminalId || null;
  useEffect(() => {
    if (!supportsNativeAutoPrint() || !restaurantId) return;
    if (isReactNativeWebView()) return;         // WebView prints via OrderSummary, not this hook
    if (!pollAutoKot || !pollEnabled) return;   // KOT auto-print must be on AND polling switched on
    // Designated-terminal setups: only the print terminal polls+prints (fail-open if id unknown).
    if (pollTerminalId && myTerminalIdRef.current && pollTerminalId !== myTerminalIdRef.current) return;

    let stopped = false;
    let timer = null;
    // Only print orders that arrive AFTER polling starts here — switching the feature on must never
    // re-print history. Small grace covers an order created moments before this effect mounted.
    const pollStartTs = Date.now() - 15000;
    const intervalMs = Math.max(8, Math.min(parseInt(pollIntervalSec) || 20, 120)) * 1000;
    const lookbackSec = Math.min(900, Math.max(300, Math.round(intervalMs / 1000) * 4));

    // Persist orders THIS fallback already printed so an app restart doesn't re-print them.
    const PERSIST_KEY = 'dineopen_poll_printed_kot';
    const PERSIST_TTL_MS = 60 * 60 * 1000; // 1h
    const loadPersisted = () => {
      try { return JSON.parse(window.localStorage.getItem(PERSIST_KEY) || '{}'); } catch { return {}; }
    };
    const savePersisted = (map) => {
      try {
        const now = Date.now();
        const pruned = {};
        for (const [k, ts] of Object.entries(map)) if (now - ts < PERSIST_TTL_MS) pruned[k] = ts;
        window.localStorage.setItem(PERSIST_KEY, JSON.stringify(pruned));
      } catch { /* best-effort */ }
    };

    const tick = async () => {
      if (stopped) return;
      try {
        const res = await apiClient.getPrintPoll(restaurantId, lookbackSec);
        if (stopped) return;
        // Admin turned it off server-side → stop immediately (single source of truth).
        if (res && res.enabled === false) { stopped = true; if (timer) clearInterval(timer); return; }
        const orders = (res && res.orders) || [];
        if (!orders.length) return;
        const persisted = loadPersisted();
        let printedAny = false;
        for (const o of orders) {
          const orderId = o.id;
          if (!orderId) continue;
          const createdMs = o.createdAt ? new Date(o.createdAt).getTime() : 0;
          if (createdMs && createdMs < pollStartTs) continue;   // don't reach into history
          if (persisted[orderId]) continue;                     // printed by an earlier poll
          if (wasPrinted(orderId, 'kot')) continue;             // printed this session (realtime or poll)
          persisted[orderId] = Date.now();
          printedAny = true;
          logDiagRef.current?.({ phase: 'poll-print', kind: 'kot', orderId, reason: 'missed-by-realtime' });
          // Reuse the realtime KOT path — it re-checks dedup, handles stations, render & printing.
          handleKotCreatedRef.current?.({ orderId, status: 'confirmed', type: 'order-created' });
        }
        if (printedAny) savePersisted(persisted);
      } catch (err) {
        // A network hiccup just means we retry next tick — never throw from a timer.
        console.warn('KOT poll fallback tick failed:', err?.message || err);
      }
    };

    // Delay the first tick so it doesn't race the initial realtime subscribe, then poll on interval.
    const kickoff = setTimeout(() => { tick(); timer = setInterval(tick, intervalMs); }, 3000);
    console.log(`🖨️ AutoPrint: KOT polling fallback ARMED (every ${intervalMs / 1000}s, lookback ${lookbackSec}s)`);

    return () => {
      stopped = true;
      clearTimeout(kickoff);
      if (timer) clearInterval(timer);
    };
  }, [restaurantId, pollEnabled, pollAutoKot, pollIntervalSec, pollTerminalId]);
}
