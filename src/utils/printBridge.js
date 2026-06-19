// Unified print abstraction for Web, Capacitor (Android), and Tauri (Desktop).
//
// Web: always window.print() — unchanged, prints current page via @media print CSS.
//
// Native (Capacitor/Tauri): needs HTML as a string to send to thermal printer.
// HTML can come from 3 sources (tried in order):
//   1. Passed directly via `html` param (e.g. print-kot page already builds HTML)
//   2. Captured from the current page DOM via `domSelector` (e.g. invoice modal on screen)
//   3. Fetched from API via `orderId` + `restaurantId` (auto-print, or when bill not on screen)
// Falls back to window.print() if nothing else works.

import { isCapacitor, isTauri, isElectron, isWeb, isReactNativeWebView } from './platform';

/**
 * Print a document across all platforms.
 *
 * @param {object} options
 * @param {string} [options.html] - Full HTML string (highest priority for native)
 * @param {string} [options.domSelector] - CSS selector to capture from current page (e.g. '.invoice-print-wrapper')
 * @param {'bill'|'kot'|'report'} [options.type='bill'] - Print job type
 * @param {string} [options.orderId] - Order ID (used to fetch from API if no html/dom)
 * @param {string} [options.restaurantId] - Restaurant ID (used with orderId)
 * @param {object} [options.printSettings] - Print settings from /admin
 */
export async function printDocument({ html, domSelector, type = 'bill', orderId, restaurantId, stationId, printSettings = {}, orderData } = {}) {
  // Debug: log platform detection
  console.log('[PrintBridge] printDocument called:', { type, hasHtml: !!html, isTauri: isTauri(), isCapacitor: isCapacitor(), isRNWebView: isReactNativeWebView(), isWeb: isWeb(), hasTauriInternals: typeof window !== 'undefined' && !!window.__TAURI_INTERNALS__ });

  // React Native WebView: send print data to native app via postMessage
  // The native app (dine-app) handles printing via its printerService (BLE/WiFi/USB/AirPrint)
  if (isReactNativeWebView()) {
    console.log('[PrintBridge] Detected React Native WebView, sending print to native via postMessage');
    return printViaReactNativeWebView({ html, type, orderId, restaurantId, printSettings, orderData });
  }

  // Web: always use window.print() — prints current page as-is
  if (isWeb()) {
    console.log('[PrintBridge] Detected as web, using window.print()');
    window.print();
    return;
  }

  // Native: resolve HTML content from available sources
  let printHtml = html;

  // Source 2: capture from on-screen DOM element
  if (!printHtml && domSelector) {
    printHtml = captureFromDom(domSelector);
  }

  // Source 3: fetch from backend API
  if (!printHtml && orderId && restaurantId) {
    printHtml = await fetchPrintHtml({ type, orderId, restaurantId });
  }

  // Last resort: fall back to window.print() (opens system dialog)
  if (!printHtml) {
    console.warn('printDocument: no HTML available, falling back to window.print()');
    window.print();
    return;
  }

  // Route to platform-specific printer
  if (isCapacitor()) {
    return printViaCapacitor({ html: printHtml, type, printSettings });
  }
  if (isTauri()) {
    return printViaTauri({ html: printHtml, type, printSettings });
  }
  if (isElectron()) {
    return printViaElectron({ html: printHtml, type, stationId, printSettings });
  }
}

/**
 * Print a complete HTML document in a hidden iframe.
 * This avoids popup blockers for web preview/print flows that are triggered by a user click.
 */
export function printHtmlInHiddenFrame(html) {
  if (!isWeb() || typeof document === 'undefined') {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    frame.style.opacity = '0';
    frame.style.pointerEvents = 'none';

    const cleanup = () => {
      try {
        frame.remove();
      } catch (err) {
        // ignore cleanup failures
      }
    };

    frame.onload = () => {
      try {
        const win = frame.contentWindow;
        if (!win) throw new Error('Print frame window unavailable');
        win.focus();
        win.print();
        setTimeout(() => {
          cleanup();
          resolve();
        }, 1200);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    frame.srcdoc = html;
    document.body.appendChild(frame);
  });
}

/**
 * Capture HTML from an on-screen DOM element.
 * Wraps the element's innerHTML in a full HTML document with print styles.
 */
function captureFromDom(selector) {
  try {
    const el = document.querySelector(selector);
    if (!el) return null;

    // Get computed styles from the page
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(s => s.outerHTML)
      .join('\n');

    return `<!DOCTYPE html><html><head><meta charset="utf-8">${styles}</head><body>${el.innerHTML}</body></html>`;
  } catch (err) {
    console.error('Failed to capture DOM for print:', err);
    return null;
  }
}

/** Fetch receipt HTML from the backend API */
async function fetchPrintHtml({ type, orderId, restaurantId }) {
  try {
    const apiClient = (await import('../lib/api')).default;
    if (type === 'kot') {
      const res = await apiClient.getKOTRender(restaurantId, orderId);
      return res?.html || null;
    } else {
      const res = await apiClient.getBillRender(restaurantId, orderId);
      return res?.html || null;
    }
  } catch (err) {
    console.error('Failed to fetch print HTML from API:', err);
    return null;
  }
}

/** Capacitor: send to Bluetooth/USB thermal printer via custom plugin */
async function printViaCapacitor({ html, type, printSettings }) {
  try {
    const { DinePrinter } = await import('capacitor-dine-printer');
    await DinePrinter.print({
      html,
      type,
      printerWidth: printSettings.printerWidth || 80,
      copies: type === 'kot' ? (printSettings.kotCopies || 1) : 1,
    });
  } catch (err) {
    console.error('Capacitor print failed, falling back to window.print:', err);
    window.print();
  }
}

/** Tauri: send to system printer via Rust IPC command */
async function printViaTauri({ html, type, printSettings }) {
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('print_document', {
      html,
      printType: type,
      printerWidth: printSettings.printerWidth || 80,
      copies: type === 'kot' ? (printSettings.kotCopies || 1) : 1,
    });
  } catch (err) {
    console.error('Tauri print failed, falling back to window.print:', err);
    window.print();
  }
}

/** Electron: send to system printer via IPC — routes to KOT/bill printer based on type */
async function printViaElectron({ html, type, stationId, printSettings }) {
  try {
    const result = await window.electronAPI.print(html, {
      type,
      stationId,
      copies: type === 'kot' ? (printSettings.kotCopies || 1) : 1,
      printerWidth: printSettings.printerWidth || 80,
    });

    // Check if the print actually succeeded (especially for TCP printers which
    // return { success: false, error: '...' } on failure after retries).
    if (result && result.success === false) {
      const errMsg = result.error || 'Print failed';
      console.error('[PrintBridge] Electron print failed:', errMsg, 'method:', result.method);
      // Emit failure event so PrintEventToast shows the red indicator
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dine-print-event', {
          detail: { type, status: 'failed', error: errMsg, method: result.method },
        }));
      }
      // For TCP failures, do NOT fall back to window.print() — it would open a
      // useless system dialog that can't reach the network printer anyway.
      // For OS driver failures, also skip — the spooler already tried.
      return;
    }
  } catch (err) {
    console.error('Electron print IPC error, falling back to window.print:', err);
    // IPC-level failure (Electron crashed, preload bridge broken) — last resort fallback
    window.print();
  }
}

/** React Native WebView: delegate printing to the native dine-app via postMessage */
async function printViaReactNativeWebView({ html, type, orderId, restaurantId, printSettings, orderData }) {
  try {
    const message = {
      type: type === 'kot' ? 'PRINT_KOT' : 'PRINT_BILL',
      orderId: orderId || null,
      restaurantId: restaurantId || null,
      // Skip sending large HTML — native app uses ESC/POS text from orderData or API fetch
      // Sending HTML bloats the postMessage and isn't used by thermal printers
      printSettings: printSettings || {},
    };
    // Include order data directly so native side can generate ESC/POS text
    // without needing an API fetch — makes printing as reliable as test print
    if (orderData) message.orderData = orderData;
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
    console.log(`[PrintBridge] Sent ${message.type} to native app`, orderData ? '(with embedded data)' : '(orderId only)');
  } catch (err) {
    console.error('React Native WebView print failed:', err);
    // Don't fall back to window.print() — it opens a useless system dialog in WebView
  }
}

/** Check if the current platform supports native auto-print (not web) */
export function supportsNativeAutoPrint() {
  return isCapacitor() || isTauri() || isElectron() || isReactNativeWebView();
}
