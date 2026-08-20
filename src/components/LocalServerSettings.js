'use client';

import { useEffect, useState, useCallback } from 'react';
import { FaServer, FaWifi, FaCheckCircle, FaTimesCircle, FaSpinner, FaCloud, FaPlug } from 'react-icons/fa';
import apiClient from '../lib/api';
import { getLocalServerUrl } from '../lib/localServer';
import SyncStatus from './SyncStatus';

/**
 * Per-terminal setting: point this device at the on-prem "local server" (the machine
 * running dine-backend + local Postgres on the LAN) for complete offline operation.
 * Works on Electron, the Capacitor Android app, and web. Saving reloads so every hook
 * and socket re-initialises against the new backend cleanly.
 */
export default function LocalServerSettings() {
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState('');
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null); // { ok, ms, name, error }
  const [terminalNum, setTerminalNum] = useState('');
  const [termSaved, setTermSaved] = useState(false);
  const [serverMode, setServerMode] = useState(null); // null=unknown/not-electron, else bool
  const [serverModeSaving, setServerModeSaving] = useState(false);

  useEffect(() => {
    try { window.electronAPI?.terminal?.getNumber?.().then((n) => { if (n) setTerminalNum(String(n)); }).catch(() => {}); } catch (_) {}
    // Electron only: is THIS device the restaurant server (host)?
    try { window.electronAPI?.server?.getMode?.().then((v) => setServerMode(!!v)).catch(() => {}); } catch (_) {}
  }, []);

  const toggleServerMode = useCallback(async (on) => {
    if (!window.electronAPI?.server?.setMode) return;
    setServerModeSaving(true);
    try {
      await window.electronAPI.server.setMode(on);
      setServerMode(on);
      if (typeof window !== 'undefined') {
        window.alert(on
          ? 'This device is now the RESTAURANT SERVER.\n\nRestart the app to start it. Make sure NO other device is also set as the server — there should be exactly one.'
          : 'This device will now CONNECT to another server.\n\nRestart the app, then enter the server address below (or leave dineopen-server.local to auto-find it).');
      }
    } catch (_) {} finally { setServerModeSaving(false); }
  }, []);

  const saveTerminalNumber = useCallback(async () => {
    const n = parseInt(terminalNum, 10);
    try {
      await window.electronAPI?.terminal?.setNumber?.(Number.isFinite(n) && n > 0 ? n : null);
      setTermSaved(true); setTimeout(() => setTermSaved(false), 2500);
    } catch (_) {}
  }, [terminalNum]);

  useEffect(() => {
    const cur = getLocalServerUrl() || '';
    setSaved(cur);
    setUrl(cur);
  }, []);

  const normalized = useCallback((u) => {
    let s = String(u || '').trim();
    if (!s) return '';
    if (!/^https?:\/\//i.test(s)) s = `http://${s}`;
    return s.replace(/\/+$/, '');
  }, []);

  const testConnection = useCallback(async (raw) => {
    const target = normalized(raw);
    if (!target) { setResult({ ok: false, error: 'Enter the server address first.' }); return null; }
    setTesting(true); setResult(null);
    const t0 = Date.now();
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch(`${target}/api/health`, { signal: ctrl.signal });
      clearTimeout(timer);
      const ms = Date.now() - t0;
      if (!res.ok) { setResult({ ok: false, ms, error: `Server responded ${res.status}` }); return false; }
      let name = '';
      try { const j = await res.json(); name = j?.service || j?.status || 'reachable'; } catch (_) { name = 'reachable'; }
      setResult({ ok: true, ms, name });
      return true;
    } catch (e) {
      setResult({ ok: false, error: e.name === 'AbortError' ? 'Timed out — is the server running and on this network?' : (e.message || 'Could not reach the server') });
      return false;
    } finally {
      setTesting(false);
    }
  }, [normalized]);

  const save = useCallback(async () => {
    const target = normalized(url);
    if (!target) return;
    const ok = await testConnection(target);
    if (ok === false) {
      const proceed = typeof window !== 'undefined' && window.confirm('The server did not respond. Save this address anyway?');
      if (!proceed) return;
    }
    apiClient.setLocalServer(target);
    if (typeof window !== 'undefined') window.location.reload();
  }, [url, normalized, testConnection]);

  const clearServer = useCallback(() => {
    apiClient.setLocalServer(null);
    if (typeof window !== 'undefined') window.location.reload();
  }, []);

  const isActive = !!saved;

  return (
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Header + mode badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: isActive ? '#eef2ff' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#4f46e5' : '#64748b' }}>
          <FaServer size={17} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Local Server</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Run this terminal against the on-prem server for full offline use</div>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '5px 10px', borderRadius: 999, color: isActive ? '#15803d' : '#64748b', background: isActive ? '#e7f6ec' : '#f1f5f9' }}>
          {isActive ? <><FaPlug size={11} /> Local</> : <><FaCloud size={11} /> Cloud</>}
        </span>
      </div>

      {isActive && (
        <div style={{ margin: '12px 0 4px', fontSize: 13, color: '#334155', background: '#f8fafc', border: '1px solid #eef2f7', borderRadius: 10, padding: '10px 12px' }}>
          Connected to <code style={{ fontWeight: 700 }}>{saved}</code>. This terminal reads &amp; writes to the local server and gets live orders/KOT over the LAN.
        </div>
      )}

      {/* Host designation — Electron only. Exactly ONE device per restaurant should be the server. */}
      {serverMode !== null && (
        <div style={{ margin: '16px 0 4px', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', background: serverMode ? '#eef2ff' : '#fafbfc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>This device is the restaurant server</div>
              <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 3, lineHeight: 1.45 }}>
                Runs the on-prem database + backend that all other terminals and phones connect to. Keep exactly <b>one</b> server per restaurant. Takes effect after restarting the app.
              </div>
            </div>
            <button
              onClick={() => toggleServerMode(!serverMode)}
              disabled={serverModeSaving}
              aria-pressed={serverMode}
              style={{
                flexShrink: 0, width: 52, height: 30, borderRadius: 999, border: 'none', cursor: serverModeSaving ? 'wait' : 'pointer',
                background: serverMode ? '#4f46e5' : '#cbd5e1', position: 'relative', transition: 'background 0.15s', padding: 0,
              }}
            >
              <span style={{ position: 'absolute', top: 3, left: serverMode ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </button>
          </div>
          {serverMode && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#4338ca', background: '#e0e7ff', borderRadius: 8, padding: '8px 10px' }}>
              Other terminals/phones should point at this machine (leave them on <code style={{ fontWeight: 700 }}>dineopen-server.local</code> or enter its IP).
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', margin: '18px 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Server address</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setResult(null); }}
          placeholder="192.168.1.50:3003"
          spellCheck={false} autoCapitalize="off" autoCorrect="off"
          style={{ flex: 1, padding: '11px 13px', border: '1px solid #d3dae6', borderRadius: 10, fontSize: 15, fontFamily: 'ui-monospace, Menlo, monospace', color: '#0f172a', outline: 'none' }}
        />
        <button onClick={() => testConnection(url)} disabled={testing} style={{ padding: '0 16px', borderRadius: 10, border: '1px solid #d3dae6', background: '#fff', color: '#334155', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap' }}>
          {testing ? <FaSpinner className="animate-spin" size={13} /> : <FaWifi size={13} />} Test
        </button>
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>The machine running the server (its LAN IP). Port defaults to 3003.</div>

      {/* Test result */}
      {result && (
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 600, color: result.ok ? '#15803d' : '#b91c1c' }}>
          {result.ok ? <FaCheckCircle size={14} /> : <FaTimesCircle size={14} />}
          {result.ok ? `Reachable · ${result.ms} ms` : result.error}
        </div>
      )}

      {/* Terminal number — multi-terminal order numbering (T1, T2, ...) */}
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#475569', margin: '18px 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Terminal number</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={terminalNum}
          onChange={(e) => setTerminalNum(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="e.g. 1"
          inputMode="numeric"
          style={{ width: 90, padding: '11px 13px', border: '1px solid #d3dae6', borderRadius: 10, fontSize: 15, fontFamily: 'ui-monospace, Menlo, monospace', color: '#0f172a', outline: 'none', textAlign: 'center' }}
        />
        <button onClick={saveTerminalNumber} style={{ padding: '0 16px', height: 42, borderRadius: 10, border: '1px solid #d3dae6', background: '#fff', color: '#334155', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {termSaved ? 'Saved ✓' : 'Save'}
        </button>
        {terminalNum && <span style={{ fontSize: 13, color: '#64748b' }}>Orders here print as <code style={{ fontWeight: 700, color: '#4f46e5' }}>T{terminalNum}-1, T{terminalNum}-2 …</code></span>}
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Give each till a different number so order numbers never clash. Takes effect after restarting the app.</div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
        <button onClick={save} disabled={!url.trim() || testing} style={{ flex: 1, padding: '12px', borderRadius: 11, border: 'none', background: '#4f46e5', color: '#fff', fontSize: 15, fontWeight: 700, cursor: url.trim() ? 'pointer' : 'not-allowed', opacity: url.trim() ? 1 : 0.6 }}>
          {saved && normalized(url) === saved ? 'Re-connect' : 'Use this server'}
        </button>
        {isActive && (
          <button onClick={clearServer} style={{ padding: '12px 18px', borderRadius: 11, border: '1px solid #e5e7eb', background: '#fff', color: '#b91c1c', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Switch to Cloud
          </button>
        )}
      </div>
    </div>

      {/* All sync info in ONE place: the live cloud-sync detail for this hub (local-server app). */}
      <SyncStatus panel />
    </div>
  );
}
