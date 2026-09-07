'use client';

/**
 * KraHealthBanner — non-blocking KRA/eTIMS health alert (Kenya stores, desktop).
 *
 * Rendered ONLY on the KRA settings page (inline). Distinguishes two situations that
 * used to be lumped together as "offline":
 *   • VSCU UNREACHABLE  — the circuit is open (timeout/refused): the VSCU app isn't answering.
 *   • VSCU UP, KRA REJECTING — sales are pending but the circuit is closed: the VSCU responds
 *     but KRA returns transient errors (899/999). This is NOT "offline".
 * In both cases receipts print and the app auto-retries in the background — the copy says so,
 * and only asks the user to act when it has been stuck long enough to matter.
 *
 * `inline` renders it as a normal block (for the settings page); otherwise it floats.
 */

import { useState } from 'react';

const btnStyle = (fg) => ({
  padding: '5px 10px', borderRadius: 7, border: `1px solid ${fg}`, background: 'transparent',
  color: fg, fontWeight: 700, cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
});

export default function KraHealthBanner({ status, onRetry, onTest, inline = false }) {
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState(null);

  if (!status) return null;
  const pending = status.pending || 0;
  const down = status.circuit === 'open';   // circuit only opens on VSCU-unreachable errors
  // Healthy: nothing pending and the VSCU is reachable → show nothing.
  if (!down && pending === 0) return null;

  const now = Date.now();
  const oldestAgeH = status.oldestPendingAt ? (now - status.oldestPendingAt) / 3600000 : 0;
  const lastOkAgeH = status.lastSuccessAt ? (now - status.lastSuccessAt) / 3600000 : Infinity;
  const critical = oldestAgeH >= 12 || (down && lastOkAgeH >= 12);

  const bg = critical ? '#fef2f2' : '#fffbeb';
  const border = critical ? '#fecaca' : '#fde68a';
  const fg = critical ? '#b91c1c' : '#92400e';

  const nSales = `${pending} sale${pending === 1 ? '' : 's'}`;

  // Two distinct headlines + bodies.
  let title, body;
  if (down) {
    title = critical ? '⚠ eTIMS device not responding (12h+)' : 'eTIMS device not responding';
    const queued = pending > 0 ? `${nSales} are safely queued — receipts still print, and ` : 'Receipts still print and ';
    const tail = critical
      ? 'It has been 12h+ — the VSCU stops signing after 24h offline, so please open the VSCU app and check this PC’s internet now.'
      : 'You don’t need to do anything — reopen the VSCU app / check the internet only if this keeps showing.';
    body = `The VSCU app on this PC isn’t answering. ${queued}the app sends them automatically once the VSCU is back. ${tail}`;
  } else {
    // VSCU reachable, but KRA rejecting (899/999) — the common case.
    title = critical ? '⚠ eTIMS still catching up (12h+)' : 'eTIMS is catching up';
    body = `KRA couldn’t accept ${nSales} yet (temporary VSCU↔KRA errors). `
      + 'The app keeps retrying them automatically in the background — nothing is lost and receipts print normally. '
      + `${critical
        ? 'They’ve been pending 12h+, so please restart the VSCU app on this PC and check its internet so the queue can clear.'
        : 'No action needed. If they don’t clear after a while, restart the VSCU app on this PC.'}`;
  }

  const doTest = async () => {
    setTesting(true); setTestMsg(null);
    try {
      const res = await onTest?.();
      // Definitive 3-state verdict (not just "reachable"): tells them which problem it is.
      if (!res) setTestMsg('Test could not run.');
      else if (res.ok) setTestMsg('✓ VSCU + KRA responding OK (code 000) — filing works right now.');
      else if (res.reachable) setTestMsg(`⚠ VSCU is UP but KRA rejected the test${res.resultCd ? ` (code ${res.resultCd})` : ''} — it's the VSCU↔KRA link/internet on this PC, not the app. Restart the VSCU app + check internet.`);
      else setTestMsg(`✗ VSCU not reachable${res.error ? ': ' + res.error : ''} — open the VSCU app on this PC.`);
    } catch (e) {
      setTestMsg('Test failed: ' + (e?.message || 'error'));
    } finally {
      setTesting(false);
      setTimeout(() => setTestMsg(null), 14000);
    }
  };

  const floatStyle = {
    position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 9998,
    maxWidth: '94vw', boxShadow: '0 6px 20px rgba(0,0,0,0.14)',
  };
  const baseStyle = {
    background: bg, border: `1px solid ${border}`, color: fg, borderRadius: 10,
    padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, flexWrap: 'wrap',
    ...(inline ? { width: '100%', marginBottom: 14 } : floatStyle),
  };

  return (
    <div role="status" style={baseStyle}>
      <span style={{ fontWeight: 800 }}>{title}</span>
      <span style={{ maxWidth: 640, lineHeight: 1.5 }}>{body}</span>
      {testMsg && <span style={{ fontStyle: 'italic' }}>{testMsg}</span>}
      <button onClick={doTest} disabled={testing} style={btnStyle(fg)}>{testing ? 'Testing…' : 'Test connection'}</button>
      <button onClick={() => onRetry?.()} style={btnStyle(fg)}>Retry now</button>
    </div>
  );
}
