'use client';

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/api';
import { initEtimsDevice, isEtimsCapable, syncEtimsItems, setEtimsDeviceManual, testEtimsConnection } from '../lib/etims';

// Format a Firestore/ISO timestamp for the activity log (short, local).
function fmtWhen(v) {
  try {
    const ms = v && v._seconds ? v._seconds * 1000 : (typeof v === 'string' ? Date.parse(v) : (v && v.toMillis ? v.toMillis() : 0));
    if (!ms) return '';
    return new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

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
  const [togglingEnabled, setTogglingEnabled] = useState(false);
  const [initing, setIniting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ sdcId: '', mrcNo: '', lastInvcNo: '' });
  const [savingManual, setSavingManual] = useState(false);
  const [diags, setDiags] = useState([]);
  const [loadingDiags, setLoadingDiags] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiClient.request(`/api/etims/${restaurantId}/config`);
      const c = res.config || {};
      setCfg(c);
      setForm((f) => ({ ...f, enabled: c.enabled, tin: c.tin || '', bhfId: c.bhfId || '00', dvcSrlNo: c.dvcSrlNo || '', vscuUrl: c.vscuUrl || 'http://localhost:8088', defaultItemClassCode: c.defaultItemClassCode || '', receiptBottomMsg: c.receiptBottomMsg || '' }));
    } catch (e) { setMsg({ type: 'error', text: e.message || 'Failed to load' }); }
    finally { setLoading(false); }
  }, [restaurantId]);

  // Recent eTIMS diagnostics (device init + sale fiscalisation attempts, newest first).
  // Surfaces the real KRA/VSCU reason for any failure — visible to the owner AND to
  // support, and it's the same data saved in the `etimsDiagnostics` collection.
  const loadDiags = useCallback(async () => {
    setLoadingDiags(true);
    try {
      const res = await apiClient.request(`/api/etims/${restaurantId}/diagnostics`);
      setDiags(Array.isArray(res.items) ? res.items : []);
    } catch { /* advisory only */ }
    finally { setLoadingDiags(false); }
  }, [restaurantId]);

  useEffect(() => { load(); loadDiags(); }, [load, loadDiags]);

  const save = async () => {
    setSaving(true); setMsg(null);
    try {
      const res = await apiClient.request(`/api/etims/${restaurantId}/config`, { method: 'PUT', body: form });
      setCfg(res.config);
      setMsg({ type: 'success', text: 'Saved.' });
    } catch (e) { setMsg({ type: 'error', text: e.message || 'Save failed' }); }
    finally { setSaving(false); }
  };

  // The enable toggle persists to the DB IMMEDIATELY (not only via "Save settings"), so on/off — and
  // especially "off" (whose Save button is hidden) — always survives a reload. Optimistic; reverts if
  // the save fails. The PUT merges server-side, so it never wipes the device/other config.
  const toggleEnabled = async () => {
    if (togglingEnabled) return;
    const next = !form.enabled;
    setForm((f) => ({ ...f, enabled: next }));
    setTogglingEnabled(true); setMsg(null);
    try {
      const res = await apiClient.request(`/api/etims/${restaurantId}/config`, { method: 'PUT', body: { ...form, enabled: next } });
      setCfg(res.config);
    } catch (e) {
      setForm((f) => ({ ...f, enabled: !next })); // revert on failure
      setMsg({ type: 'error', text: e.message || 'Could not update the eTIMS setting' });
    } finally { setTogglingEnabled(false); }
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

  const saveManualDevice = async () => {
    if (!manual.sdcId.trim()) { setMsg({ type: 'error', text: 'Enter the SDC ID from your already-initialised device.' }); return; }
    setSavingManual(true); setMsg(null);
    try {
      await save();
      const device = await setEtimsDeviceManual(restaurantId, {
        sdcId: manual.sdcId.trim(),
        mrcNo: manual.mrcNo.trim(),
        lastInvcNo: manual.lastInvcNo === '' ? undefined : Number(manual.lastInvcNo),
      });
      setMsg({ type: 'success', text: `Device saved manually. SDC ID: ${device.sdcId}` });
      setShowManual(false);
      await load();
    } catch (e) { setMsg({ type: 'error', text: e.message || 'Failed to save device details' }); }
    finally { setSavingManual(false); }
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

  // Safe connectivity test (pure read — never initialises or fiscalises). Shows the
  // result on-screen AND records it to the diagnostics log (visible in the panel below
  // and in the etimsDiagnostics collection).
  const testConn = async () => {
    setTesting(true); setMsg(null);
    try {
      // Save the current URL/PIN first so the test uses what's on screen.
      try { await save(); } catch { /* the test will still use the stored config */ }
      const res = await testEtimsConnection(restaurantId);
      if (res.reachable && res.ok) {
        setMsg({ type: 'success', text: `✅ VSCU reachable at ${form.vscuUrl} and responding OK.` });
      } else if (res.reachable) {
        setMsg({ type: 'error', text: `⚠️ VSCU is reachable but returned an error: ${res.resultMsg || 'no message'} (code ${res.resultCd || '?'}). The VSCU is running, but the device may not be initialised for this PIN/branch.` });
      } else {
        setMsg({ type: 'error', text: `❌ ${res.error || 'Could not reach the VSCU.'} Make sure the VSCU application is running on this machine and the VSCU URL is correct.` });
      }
    } catch (e) {
      setMsg({ type: 'error', text: (e && e.message) || 'Connection test failed.' });
    } finally {
      setTesting(false);
      loadDiags(); // refresh the activity panel so the just-logged test shows
    }
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

      {/* Toggle gates ALL setup below. Because you must turn it ON to reveal the fields, eTIMS can never
          be left "configured but not enabled" — the forgot-to-tick failure mode can't happen. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button type="button" role="switch" aria-checked={!!form.enabled} onClick={toggleEnabled} disabled={togglingEnabled}
          style={{ width: 42, height: 24, borderRadius: 999, border: 'none', cursor: togglingEnabled ? 'default' : 'pointer', padding: 2, background: form.enabled ? '#16a34a' : '#d1d5db', flexShrink: 0, opacity: togglingEnabled ? 0.6 : 1 }}>
          <span style={{ display: 'block', width: 20, height: 20, borderRadius: '50%', background: '#fff', transform: form.enabled ? 'translateX(18px)' : 'translateX(0)', transition: 'transform .15s' }} />
        </button>
        <label onClick={toggleEnabled} style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Enable eTIMS for this store</label>
      </div>

      {!form.enabled && (
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px', lineHeight: 1.5 }}>
          Turn on to set up KRA eTIMS — required for Kenya stores. When on, every sale is reported to KRA and the fiscal receipt (SDC ID, signature &amp; QR) prints on the bill.
        </p>
      )}

      {form.enabled && (<>
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
        <button onClick={testConn} disabled={testing} style={{ padding: '9px 16px', background: '#fff', color: '#1d4ed8', border: '1px solid #93c5fd', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
          {testing ? 'Testing…' : 'Test VSCU connection'}
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

      {/* Manual device entry — for a VSCU already initialised on this PC (KRA won't
          re-issue the SDC ID on a second init). Works from web too. */}
      <div style={{ marginTop: 16, borderTop: '1px dashed #e5e7eb', paddingTop: 12 }}>
        <button onClick={() => setShowManual((s) => !s)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          {showManual ? '▾' : '▸'} Device already initialised on this PC? Enter SDC ID manually
        </button>
        {showManual && (
          <div style={{ marginTop: 10, background: '#f9fafb', border: '1px solid #eef2f6', borderRadius: 8, padding: 12 }}>
            <p style={{ fontSize: 11.5, color: '#6b7280', margin: '0 0 10px' }}>
              KRA returns the SDC ID + keys only on the <b>first</b> initialisation of a device. If this VSCU was
              already initialised (so “Initialise device” fails), enter the existing details here. The VSCU keeps its
              keys locally and still signs every sale.
            </p>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>SDC ID <span style={{ color: '#b91c1c' }}>*</span></label>
              <input value={manual.sdcId} onChange={(e) => setManual({ ...manual, sdcId: e.target.value })} placeholder="e.g. KRACU0100000001"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>MRC No</label>
              <input value={manual.mrcNo} onChange={(e) => setManual({ ...manual, mrcNo: e.target.value })} placeholder="e.g. WIS01006230"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Last invoice number</label>
              <input value={manual.lastInvcNo} onChange={(e) => setManual({ ...manual, lastInvcNo: e.target.value.replace(/[^0-9]/g, '') })} placeholder="0"
                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13 }} />
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>The last KRA invoice number already issued by this device (leave 0 if unsure).</div>
            </div>
            <button onClick={saveManualDevice} disabled={savingManual}
              style={{ padding: '9px 16px', background: '#065f46', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              {savingManual ? 'Saving…' : 'Save device details'}
            </button>
          </div>
        )}
      </div>

      {/* Recent eTIMS activity — every device-init + sale-fiscalisation attempt (success
          and failure), newest first, showing the REAL KRA/VSCU reason. Same data is saved
          in the etimsDiagnostics collection so support can diagnose remotely by restaurant. */}
      <div style={{ marginTop: 16, borderTop: '1px dashed #e5e7eb', paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#374151' }}>Recent eTIMS activity</span>
          <button onClick={loadDiags} disabled={loadingDiags} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 10px', fontSize: 11.5, color: '#6b7280', cursor: 'pointer' }}>
            {loadingDiags ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
        {diags.length === 0 ? (
          <div style={{ fontSize: 11.5, color: '#9ca3af' }}>
            No eTIMS activity logged yet. After a sale or “Initialise device”, each attempt — and the exact KRA/VSCU error reason for any failure — appears here and is saved for support to review.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {diags.map((d) => (
              <div key={d.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 11.5, background: d.ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${d.ok ? '#bbf7d0' : '#fecaca'}`, borderRadius: 6, padding: '6px 8px' }}>
                <span style={{ fontWeight: 700, color: d.ok ? '#166534' : '#b91c1c', whiteSpace: 'nowrap' }}>{d.ok ? '✓' : '✕'} {d.phase}</span>
                <span style={{ flex: 1, color: '#374151', minWidth: 0, wordBreak: 'break-word' }}>
                  {d.ok
                    ? (d.orderId ? `order …${String(d.orderId).slice(-6)}${d.invcNo != null ? ` · inv #${d.invcNo}` : ''}` : 'success')
                    : (d.errorMessage || d.resultMsg || `code ${d.resultCd || '?'}`)}
                  {!d.ok && d.resultCd ? <span style={{ color: '#9ca3af' }}> · code {d.resultCd}</span> : null}
                </span>
                <span style={{ color: '#9ca3af', whiteSpace: 'nowrap' }}>{fmtWhen(d.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      </>)}
    </div>
  );
}
