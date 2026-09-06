'use client';

/**
 * KraHealthBanner — non-blocking KRA/eTIMS health alert (Kenya stores, desktop).
 *
 * Hidden when healthy. Amber when the VSCU is unreachable (circuit open) or sales are pending;
 * red when it's been down long enough to risk KRA's 24h no-internet cutoff. Reassures that
 * receipts still print and will auto-send. Offers manual "Test connection" + "Retry now".
 *
 * Driven by useKraRetryQueue's status snapshot (passed as props from the dashboard layout).
 */

import { useState } from 'react';

const btnStyle = (fg) => ({
  padding: '5px 10px', borderRadius: 7, border: `1px solid ${fg}`, background: 'transparent',
  color: fg, fontWeight: 700, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
});

export default function KraHealthBanner({ status, onRetry, onTest }) {
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState(null);

  if (!status) return null;
  const pending = status.pending || 0;
  const down = status.circuit === 'open';
  // Healthy: nothing pending and the circuit isn't open → show nothing.
  if (!down && pending === 0) return null;

  const now = Date.now();
  const oldestAgeH = status.oldestPendingAt ? (now - status.oldestPendingAt) / 3600000 : 0;
  const lastOkAgeH = status.lastSuccessAt ? (now - status.lastSuccessAt) / 3600000 : Infinity;
  const critical = oldestAgeH >= 12 || (down && lastOkAgeH >= 12);

  const bg = critical ? '#fef2f2' : '#fffbeb';
  const border = critical ? '#fecaca' : '#fde68a';
  const fg = critical ? '#b91c1c' : '#92400e';

  const doTest = async () => {
    setTesting(true); setTestMsg(null);
    try {
      const res = await onTest?.();
      setTestMsg(res?.reachable ? 'VSCU reachable ✓' : `VSCU not reachable${res?.error ? ': ' + res.error : ''}`);
    } catch (e) {
      setTestMsg('Test failed: ' + (e?.message || 'error'));
    } finally {
      setTesting(false);
      setTimeout(() => setTestMsg(null), 6000);
    }
  };

  return (
    <div
      role="status"
      style={{
        position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 9998,
        maxWidth: '94vw', background: bg, border: `1px solid ${border}`, color: fg, borderRadius: 10,
        padding: '10px 14px', boxShadow: '0 6px 20px rgba(0,0,0,0.14)', display: 'flex',
        alignItems: 'center', gap: 12, fontSize: 13, flexWrap: 'wrap',
      }}
    >
      <span style={{ fontWeight: 800 }}>{critical ? '⚠ KRA offline 12h+' : 'KRA (eTIMS) not responding'}</span>
      <span style={{ maxWidth: 560 }}>
        {pending > 0 ? `${pending} sale${pending > 1 ? 's' : ''} pending. ` : ''}
        Receipts print normally and will auto-send when it recovers.
        {critical ? ' The VSCU stops signing after 24h with no internet — check the VSCU/internet on this PC.' : ''}
      </span>
      {testMsg && <span style={{ fontStyle: 'italic' }}>{testMsg}</span>}
      <button onClick={doTest} disabled={testing} style={btnStyle(fg)}>{testing ? 'Testing…' : 'Test connection'}</button>
      <button onClick={() => onRetry?.()} style={btnStyle(fg)}>Retry now</button>
    </div>
  );
}
