// Print a report slip (shift / register reports) the way this device already prints bills:
//   • Desktop app (Electron / Tauri) and Capacitor → silent print on the bill printer (printDocument)
//   • dine-app (React Native WebView)              → the phone's connected printer, as plain text
//   • Web browser                                  → the browser's print dialog (hidden frame)
// `slip` = { html, text } from buildReportSlip.

import { printDocument, printHtmlInHiddenFrame, supportsNativeAutoPrint } from './printBridge';
import { isReactNativeWebView } from './platform';

const APP_RESULT_TIMEOUT_MS = 8000;

function printViaApp({ text, html, label }) {
  return new Promise((resolve, reject) => {
    let done = false;
    const onResult = (e) => {
      const d = (e && e.detail) || {};
      if (d.label !== label || done) return;
      done = true; window.removeEventListener('nativePrintResult', onResult); clearTimeout(timer);
      if (d.success) resolve({ method: 'app' });
      else reject(new Error(d.error || 'Print failed'));
    };
    // Apps without report printing ignore the message (no result) — say so instead of silence.
    const timer = setTimeout(() => {
      if (done) return;
      done = true; window.removeEventListener('nativePrintResult', onResult);
      reject(new Error('Update the DineOpen app to print reports from here'));
    }, APP_RESULT_TIMEOUT_MS);
    window.addEventListener('nativePrintResult', onResult);
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PRINT_TEXT', label, text, html }));
  });
}

/**
 * @param {{html:string, text:string}} slip
 * @param {{printSettings?:object, label?:string}} opts
 */
export async function printReport(slip, { printSettings = {}, label = 'Report' } = {}) {
  if (!slip || !slip.html) throw new Error('Nothing to print');
  if (isReactNativeWebView()) return printViaApp({ text: slip.text, html: slip.html, label });
  if (supportsNativeAutoPrint()) {
    await printDocument({ html: slip.html, type: 'bill', printSettings });
    return { method: 'native' };
  }
  await printHtmlInHiddenFrame(slip.html);
  return { method: 'dialog' };
}

export default printReport;
