'use client';

// Small printer bulb indicator — sits at bottom-left near the sidebar.
// Gray by default. Blinks green when a remote print command arrives successfully,
// red on failure. Returns to gray after a short delay.
// Also reflects printer heartbeat status: steady green when all printers online,
// steady red when any printer offline, overridden briefly by print events.
// Controlled by printSettings.showPrintNotifications.

import { useEffect, useState, useCallback, useRef } from 'react';

export default function PrintEventToast({ printSettings }) {
  // 'idle' | 'printed' | 'failed' | 'online' | 'offline'
  const [status, setStatus] = useState('idle');
  // Full error message shown on a print failure (so staff/clients can read + report it).
  const [errorMsg, setErrorMsg] = useState(null);
  const timerRef = useRef(null);
  const errorTimerRef = useRef(null);
  const heartbeatStatusRef = useRef('idle'); // track heartbeat baseline

  const enabled = printSettings?.showPrintNotifications;
  // The always-on error banner is scoped to the Capacitor (Android) build only, so Electron/web
  // behaviour is unchanged. On Android a client needs to see the exact print error even when the
  // dot indicator is off.
  const onCapacitor = typeof window !== 'undefined'
    && !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

  const handlePrintEvent = useCallback((e) => {
    const { status: evtStatus, error, method } = e.detail || {};
    setStatus(evtStatus === 'failed' ? 'failed' : 'printed');
    // Reset back to heartbeat baseline after 2s
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus(heartbeatStatusRef.current), 2000);
    // On failure, always surface the actual error text (even if the dot indicator is disabled),
    // so a client running the app can see and report exactly why printing failed.
    if (evtStatus === 'failed') {
      setErrorMsg(error ? `Print failed${method ? ` (${method})` : ''}: ${error}` : 'Print failed — check printer connection & settings.');
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => setErrorMsg(null), 9000);
    }
  }, []);

  const handlePrinterStatus = useCallback((e) => {
    const { status: printerStatus } = e.detail || {};
    const baseline = printerStatus === 'offline' ? 'offline' : 'online';
    heartbeatStatusRef.current = baseline;
    // Only update display if not in the middle of a print event flash
    setStatus(prev => (prev === 'printed' || prev === 'failed') ? prev : baseline);
  }, []);

  useEffect(() => {
    // Electron/web: keep old behaviour — only listen when the dot indicator is enabled.
    // Capacitor: always listen so a print FAILURE surfaces even with the indicator off.
    if (!enabled && !onCapacitor) return;
    window.addEventListener('dine-print-event', handlePrintEvent);
    window.addEventListener('dine-printer-status', handlePrinterStatus);
    return () => {
      window.removeEventListener('dine-print-event', handlePrintEvent);
      window.removeEventListener('dine-printer-status', handlePrinterStatus);
      clearTimeout(timerRef.current);
      clearTimeout(errorTimerRef.current);
    };
  }, [enabled, onCapacitor, handlePrintEvent, handlePrinterStatus]);

  const color = status === 'printed' ? '#22c55e'
    : status === 'failed' || status === 'offline' ? '#ef4444'
    : status === 'online' ? '#22c55e'
    : '#d1d5db';

  const glowing = status === 'printed' || status === 'failed';

  const title = status === 'printed' ? 'Print received'
    : status === 'failed' ? 'Print failed'
    : status === 'offline' ? 'Printer offline'
    : status === 'online' ? 'Printer online'
    : 'Listening for prints';

  // Electron/web with the indicator disabled → render nothing (unchanged from before).
  if (!enabled && !onCapacitor) return null;

  return (
    <>
      {/* Print-failure banner — Capacitor (Android) only, so the client sees the exact error */}
      {onCapacitor && errorMsg && (
        <div
          role="alert"
          style={{
            position: 'fixed', bottom: '80px', left: '16px', right: '16px',
            maxWidth: '440px', zIndex: 9997,
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
            padding: '10px 12px', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex', alignItems: 'flex-start', gap: '8px',
          }}
        >
          <span style={{ color: '#dc2626', fontSize: '15px', lineHeight: 1.2 }}>⚠</span>
          <div style={{ flex: 1, fontSize: '12px', color: '#991b1b', fontWeight: 600, wordBreak: 'break-word' }}>{errorMsg}</div>
          <button
            onClick={() => setErrorMsg(null)}
            aria-label="Dismiss"
            style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '15px', lineHeight: 1, padding: 0 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Heartbeat/print dot — only when showPrintNotifications is enabled */}
      {enabled && (
        <div
          title={title}
          style={{
            position: 'fixed',
            bottom: '54px',
            left: '24px',
            zIndex: 9996,
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: color,
            transition: 'background-color 0.3s ease',
            boxShadow: glowing ? `0 0 8px 2px ${color}` : 'none',
            pointerEvents: 'auto',
            cursor: 'default',
          }}
        />
      )}
    </>
  );
}
