'use client';

import { useEffect, useState, useCallback } from 'react';
import { FaServer, FaWifi, FaCheckCircle, FaTimesCircle, FaSpinner, FaCloud, FaPlug } from 'react-icons/fa';
import apiClient from '../lib/api';
import { getLocalServerUrl } from '../lib/localServer';

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
    <div style={{ maxWidth: 560, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
  );
}
