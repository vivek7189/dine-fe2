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
  const timerRef = useRef(null);
  const heartbeatStatusRef = useRef('idle'); // track heartbeat baseline

  const enabled = printSettings?.showPrintNotifications;

  const handlePrintEvent = useCallback((e) => {
    const { status: evtStatus } = e.detail || {};
    setStatus(evtStatus === 'failed' ? 'failed' : 'printed');
    // Reset back to heartbeat baseline after 2s
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus(heartbeatStatusRef.current), 2000);
  }, []);

  const handlePrinterStatus = useCallback((e) => {
    const { status: printerStatus } = e.detail || {};
    const baseline = printerStatus === 'offline' ? 'offline' : 'online';
    heartbeatStatusRef.current = baseline;
    // Only update display if not in the middle of a print event flash
    setStatus(prev => (prev === 'printed' || prev === 'failed') ? prev : baseline);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('dine-print-event', handlePrintEvent);
    window.addEventListener('dine-printer-status', handlePrinterStatus);
    return () => {
      window.removeEventListener('dine-print-event', handlePrintEvent);
      window.removeEventListener('dine-printer-status', handlePrinterStatus);
      clearTimeout(timerRef.current);
    };
  }, [enabled, handlePrintEvent, handlePrinterStatus]);

  if (!enabled) return null;

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

  return (
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
  );
}
