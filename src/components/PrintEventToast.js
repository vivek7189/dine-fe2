'use client';

// Small printer bulb indicator — sits at bottom-left near the sidebar.
// Gray by default. Blinks green when a remote print command arrives successfully,
// red on failure. Returns to gray after a short delay.
// Controlled by printSettings.showPrintNotifications.

import { useEffect, useState, useCallback, useRef } from 'react';

export default function PrintEventToast({ printSettings }) {
  // 'idle' | 'printed' | 'failed'
  const [status, setStatus] = useState('idle');
  const timerRef = useRef(null);

  const enabled = printSettings?.showPrintNotifications;

  const handleEvent = useCallback((e) => {
    const { status: evtStatus } = e.detail || {};
    setStatus(evtStatus === 'failed' ? 'failed' : 'printed');
    // Reset back to idle after 2s
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus('idle'), 2000);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('dine-print-event', handleEvent);
    return () => {
      window.removeEventListener('dine-print-event', handleEvent);
      clearTimeout(timerRef.current);
    };
  }, [enabled, handleEvent]);

  if (!enabled) return null;

  const color = status === 'printed' ? '#22c55e'
    : status === 'failed' ? '#ef4444'
    : '#d1d5db';

  const glowing = status !== 'idle';

  return (
    <div
      title={status === 'printed' ? 'Print received' : status === 'failed' ? 'Print failed' : 'Listening for prints'}
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
