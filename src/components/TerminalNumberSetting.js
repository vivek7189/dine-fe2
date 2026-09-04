'use client';

/**
 * TerminalNumberSetting (Phase 5) — assign THIS till its terminal number on a multi-terminal
 * local-server setup. Each terminal keeps its own daily order counter; the number becomes the
 * order-number prefix (T2-45) so two tills ringing the same count stay distinct. Leave it blank on a
 * single-till shop — order numbers then stay plain (the prefix is only shown once ≥2 terminals are in
 * use; see utils/orderNumber.js). The value is stored device-locally and applied to the bundled
 * backend as TERMINAL_PREFIX on next launch, so saving prompts a quick restart.
 *
 * Self-hides unless running on the local-server desktop app with the terminal IPC available.
 */
import { useEffect, useState, useCallback } from 'react';
import { isServerModeActive } from '../lib/localServer';

export default function TerminalNumberSetting() {
  const [avail, setAvail] = useState(false);
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState(null);
  const [busy, setBusy] = useState(false);
  const [needsRestart, setNeedsRestart] = useState(false);

  useEffect(() => {
    const api = typeof window !== 'undefined' && window.electronAPI && window.electronAPI.terminal;
    if (!api || !isServerModeActive()) return;
    setAvail(true);
    (async () => {
      try { const n = await api.getNumber(); if (n != null) { setValue(String(n)); setSaved(Number(n)); } }
      catch (_) { /* ignore */ }
    })();
  }, []);

  const save = useCallback(async () => {
    const api = window.electronAPI?.terminal;
    if (!api) return;
    setBusy(true);
    try {
      const n = value === '' ? null : Math.max(0, parseInt(value, 10) || 0);
      const res = await api.setNumber(n && n > 0 ? n : 0);
      const applied = (res && res.terminalNumber) || (n && n > 0 ? n : null);
      setSaved(applied);
      // TERMINAL_PREFIX is read when the backend forks, so a restart is needed to take effect.
      setNeedsRestart(true);
    } finally { setBusy(false); }
  }, [value]);

  if (!avail) return null;

  return (
    <div style={{ marginTop: 24, padding: '18px 20px', borderRadius: 14, border: '1px solid #e5e7eb', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 18 }}>🔢</span>
        <div style={{ fontWeight: 700, fontSize: 15, color: '#374151' }}>Terminal number (multi-terminal only)</div>
      </div>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>
        If this shop runs more than one till, give each one a different number (1, 2, 3…). Order
        numbers then show which till took the order (e.g. <b>T2-45</b>). Leave blank on a single till —
        numbers stay plain.
      </p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="number" min="0" inputMode="numeric" placeholder="—"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ width: 90, padding: '9px 12px', borderRadius: 10, border: '1px solid #d1d5db', fontSize: 14, fontWeight: 600 }}
        />
        <button
          onClick={save} disabled={busy}
          style={{ padding: '9px 18px', background: busy ? '#9ca3af' : '#dc2626', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13.5, cursor: busy ? 'default' : 'pointer' }}
        >
          {busy ? 'Applying…' : 'Save & restart'}
        </button>
        {saved != null && saved > 0 && !busy && (
          <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>This till is <b>T{saved}</b></span>
        )}
        {saved === 0 && !busy && (
          <span style={{ fontSize: 13, color: '#6b7280' }}>Single till — plain numbers</span>
        )}
      </div>
      {needsRestart && (
        <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12.5, color: '#92400e' }}>Restart the app to apply the new terminal number.</span>
          <button
            onClick={() => { try { window.electronAPI?.restartApp?.(); } catch (_) {} }}
            style={{ padding: '7px 14px', background: '#d97706', color: '#fff', border: 'none', borderRadius: 9, fontWeight: 600, fontSize: 12.5, cursor: 'pointer' }}
          >
            Restart now
          </button>
        </div>
      )}
    </div>
  );
}
