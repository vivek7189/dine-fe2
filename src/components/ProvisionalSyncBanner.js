'use client';

/**
 * ProvisionalSyncBanner (Phase 4.2) — on the local-server POS app only, warns when a report/EOD total
 * is being viewed while offline orders have not yet reached the cloud. The number is not final until
 * the outbox drains, so we show "Provisional — N order(s) pending sync". Self-hides on plain web / the
 * cloud app, and when there is nothing pending. Reads the co-located local server's api-sync-status
 * (pendingUp = orders on this hub not yet pushed; deadLetter = quarantined records still retrying).
 */
import { useEffect, useState } from 'react';
import { isServerApp } from '../lib/localServer';

export default function ProvisionalSyncBanner() {
  const [mounted, setMounted] = useState(false);
  const [pending, setPending] = useState(0);
  const [dead, setDead] = useState(0);

  useEffect(() => {
    setMounted(true);
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch('http://127.0.0.1:3003/api/local-server/api-sync-status', { cache: 'no-store' });
        if (r.ok && alive) { const j = await r.json(); setPending(j.pendingUp || 0); setDead(j.deadLetter || 0); }
      } catch (_) { /* local server momentarily busy — keep last */ }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const isInstalledApp = typeof window !== 'undefined' && (!!window.electronAPI || !!window.Capacitor);
  if (!mounted || !isInstalledApp || !isServerApp()) return null;
  const n = (pending || 0) + (dead || 0);
  if (n <= 0) return null;

  return (
    <div role="status" style={S.wrap}>
      <span style={S.dot} />
      <span style={S.text}>
        <b>Provisional</b> — {n} order{n > 1 ? 's' : ''} not yet synced to the cloud. These totals will finalize automatically once sync completes.
      </span>
    </div>
  );
}

const S = {
  wrap: { display: 'flex', alignItems: 'center', gap: 9, background: '#FEF3C7', border: '1px solid #FCD34D',
    color: '#92400E', borderRadius: 10, padding: '9px 13px', margin: '0 0 12px', fontSize: 13, fontWeight: 600,
    fontFamily: 'ui-sans-serif,-apple-system,sans-serif' },
  dot: { width: 9, height: 9, borderRadius: '50%', background: '#D97706', flexShrink: 0,
    boxShadow: '0 0 0 3px rgba(217,119,6,0.18)' },
  text: { lineHeight: 1.35 },
};
