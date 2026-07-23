'use client';

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';
import { initEtimsDevice, isEtimsCapable, syncEtimsItems } from '../lib/etims';

/**
 * Kenya KRA eTIMS configuration (admin). Self-contained; render it ONLY for
 * Kenya (KES) stores — the parent gates on countryCode === 'KE'. Lets the owner
 * enter the KRA device details and initialise the device against the local VSCU
 * (which only works from the desktop app).
 */
export default function EtimsSettings({ restaurantId }) {
  const [cfg, setCfg] = useState(null);
  const [form, setForm] = useState({ enabled: false, tin: '', bhfId: '00', dvcSrlNo: '', vscuUrl: 'http://localhost:8088', defaultItemClassCode: '', receiptBottomMsg: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initing, setIniting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.request(`/api/etims/${restaurantId}/config`);
      const c = res.config || {};
      setCfg(c);
      setForm((f) => ({ ...f, enabled: c.enabled, tin: c.tin || '', bhfId: c.bhfId || '00', dvcSrlNo: c.dvcSrlNo || '', vscuUrl: c.vscuUrl || 'http://localhost:8088', defaultItemClassCode: c.defaultItemClassCode || '', receiptBottomMsg: c.receiptBottomMsg || '' }));
    } catch (e) { setMsg({ type: 'error', text: e.message || 'Failed to load' }); }
    finally { setLoading(false); }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await apiClient.request(`/api/etims/${restaurantId}/config`, { method: 'PUT', body: form });
      setCfg(res.config);
      setMsg({ type: 'success', text: 'Saved.' });
    } catch (e) { setMsg({ type: 'error', text: e.message || 'Save failed' }); }
    finally { setSaving(false); }
  };

  const initDevice = async () => {
    if (!isEtimsCapable()) { setMsg({ type: 'error', text: 'Device setup must be done from the DineOpen desktop app (the VSCU runs on this machine).' }); return; }
    setIniting(true); setMsg(null);
    try {
      await save();
      const device = await initEtimsDevice(restaurantId);
      setMsg({ type: 'success', text: `Device initialised. SDC ID: ${device.sdcId}` });
      await load();
    } catch (e) { setMsg({ type: 'error', text: e.message || 'Initialisation failed' }); }
    finally { setIniting(false); }
  };

  const syncItems = async () => {
    if (!isEtimsCapable()) { setMsg({ type: 'error', text: 'Item sync must be done from the DineOpen desktop app.' }); return; }
    setSyncing(true); setMsg(null);
    try {
      const res = await syncEtimsItems(restaurantId, (p) => setMsg({ type: 'success', text: `Registering items… ${p.done}/${p.total}` }));
      setMsg({ type: res.failed ? 'error' : 'success', text: `Menu synced to KRA — ${res.ok} registered${res.failed ? `, ${res.failed} failed` : ''} (of ${res.total}).` });
    } catch (e) { setMsg({ type: 'error', text: e.message || 'Item sync failed' }); }
    finally { setSyncing(false); }
  };

  const field = (label, key, opts = {}) => (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={opts.placeholder || ''}
        style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }}
      />
      {opts.hint && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{opts.hint}</div>}
    </div>
  );

  if (loading) return <div style={{ padding: 16, color: '#6b7280' }}>Loading eTIMS settings…</div>;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, maxWidth: 640 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>🇰🇪</span>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Kenya KRA eTIMS (Tax Invoicing)</h3>
      </div>
      <p style={{ fontSize: 12.5, color: '#6b7280', margin: '0 0 16px' }}>
        Report every sale to KRA in real time via your local VSCU. Setup and fiscalisation run through the
        DineOpen <b>desktop app</b> (the VSCU runs on this machine).
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <input type="checkbox" checked={!!form.enabled} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} id="etims-en" />
        <label htmlFor="etims-en" style={{ fontSize: 13, fontWeight: 600 }}>Enable eTIMS for this store</label>
      </div>

      {field('KRA PIN (TIN)', 'tin', { placeholder: 'P000000000X', hint: '11 characters' })}
      {field('Branch ID (bhfId)', 'bhfId', { placeholder: '00' })}
      {field('Device Serial No. (dvcSrlNo)', 'dvcSrlNo', { placeholder: 'The serial registered on the eTIMS portal' })}
      {field('VSCU URL', 'vscuUrl', { placeholder: 'http://localhost:8088', hint: 'Local VSCU address (this machine or LAN)' })}
      {field('Default item classification code', 'defaultItemClassCode', { placeholder: 'KRA UNSPSC code', hint: 'Fallback KRA item class for items without one' })}
      {field('Receipt footer message', 'receiptBottomMsg', { placeholder: 'Thank you for your business' })}

      {cfg && cfg.initialised && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 10, fontSize: 12, margin: '6px 0 14px' }}>
          ✅ Device initialised · SDC ID <b>{cfg.device?.sdcId}</b> · MRC <b>{cfg.device?.mrcNo}</b> · last invoice #{cfg.device?.lastInvcNo || 0}
        </div>
      )}

      {msg && (
        <div style={{ padding: 10, borderRadius: 8, fontSize: 12.5, marginBottom: 12, background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4', color: msg.type === 'error' ? '#b91c1c' : '#166534', border: `1px solid ${msg.type === 'error' ? '#fecaca' : '#bbf7d0'}` }}>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={save} disabled={saving} style={{ padding: '9px 16px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        <button onClick={initDevice} disabled={initing} style={{ padding: '9px 16px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
          {initing ? 'Initialising…' : (cfg && cfg.initialised ? 'Re-initialise device' : 'Initialise device')}
        </button>
        {cfg && cfg.initialised && (
          <button onClick={syncItems} disabled={syncing} style={{ padding: '9px 16px', background: '#065f46', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {syncing ? 'Syncing menu…' : 'Sync menu to KRA'}
          </button>
        )}
      </div>
      {!isEtimsCapable() && (
        <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 10 }}>
          ℹ️ Open this page in the DineOpen desktop app to initialise the device and fiscalise sales.
        </div>
      )}
    </div>
  );
}
