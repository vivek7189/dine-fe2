'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaFingerprint, FaCircle, FaTrash, FaSync, FaPlus, FaStethoscope, FaTimes, FaCopy, FaCheckCircle } from 'react-icons/fa';
import apiClient from '../lib/api';

// Owner/admin-only panel to connect + monitor biometric attendance terminals
// (ZKTeco / eSSL / Realtime). Talks to /api/biometric/* — see routes/biometric.js.
export default function BiometricSettings({ restaurantId, staffList = [], isMobile = false }) {
  const [setupInfo, setSetupInfo] = useState(null);
  const [devices, setDevices] = useState([]);
  const [unclaimed, setUnclaimed] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'ok'|'err', text }
  const [snForm, setSnForm] = useState({ serialNumber: '', name: '' });
  const [mapForm, setMapForm] = useState({ deviceUserId: '', staffId: '' });
  const [diag, setDiag] = useState(null); // diagnostics modal payload
  const [copied, setCopied] = useState(false);

  const card = { background: '#fff', border: '1px solid #eef0f2', borderRadius: '14px', padding: '18px' };
  const input = { width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', outline: 'none' };
  const label = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '5px' };
  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const [info, dev, maps, unc] = await Promise.all([
        apiClient.getBiometricSetupInfo(restaurantId).catch(() => null),
        apiClient.getBiometricDevices(restaurantId).catch(() => ({ devices: [] })),
        apiClient.getBiometricMappings(restaurantId).catch(() => ({ mappings: [] })),
        apiClient.getBiometricUnclaimed().catch(() => ({ devices: [] })),
      ]);
      setSetupInfo(info);
      setDevices(dev?.devices || []);
      setMappings(maps?.mappings || []);
      setUnclaimed(unc?.devices || []);
    } finally { setLoading(false); }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  const register = async (serialNumber, name) => {
    if (!serialNumber?.trim()) return flash('err', 'Enter the device serial number');
    setBusy(true);
    try {
      await apiClient.registerBiometricDevice(restaurantId, serialNumber.trim(), (name || '').trim());
      setSnForm({ serialNumber: '', name: '' });
      flash('ok', 'Device registered');
      await load();
    } catch (e) { flash('err', e?.message || 'Could not register device'); }
    finally { setBusy(false); }
  };

  const remove = async (sn) => {
    setBusy(true);
    try { await apiClient.removeBiometricDevice(restaurantId, sn); flash('ok', 'Device removed'); await load(); }
    catch (e) { flash('err', e?.message || 'Could not remove'); }
    finally { setBusy(false); }
  };

  const addMapping = async () => {
    const staff = staffList.find(s => (s._id || s.id) === mapForm.staffId);
    if (!mapForm.deviceUserId?.trim() || !staff) return flash('err', 'Enter device user-ID and pick a staff member');
    setBusy(true);
    try {
      await apiClient.setBiometricMapping(restaurantId, mapForm.deviceUserId.trim(), staff._id || staff.id, staff.name || staff.staffName || '', staff.role || '');
      setMapForm({ deviceUserId: '', staffId: '' });
      flash('ok', 'Staff mapped');
      await load();
    } catch (e) { flash('err', e?.message || 'Could not map staff'); }
    finally { setBusy(false); }
  };

  const delMapping = async (deviceUserId) => {
    setBusy(true);
    try { await apiClient.deleteBiometricMapping(restaurantId, deviceUserId); await load(); }
    catch (e) { flash('err', e?.message || 'Could not remove mapping'); }
    finally { setBusy(false); }
  };

  const openDiag = async (sn) => {
    setDiag({ loading: true, sn });
    try { const d = await apiClient.getBiometricDiagnostics(restaurantId, sn); setDiag({ ...d, sn }); }
    catch (e) { setDiag({ error: e?.message || 'Failed to load diagnostics', sn }); }
  };

  const copyUrl = () => {
    if (!setupInfo) return;
    const txt = `${setupInfo.serverAddress}  (port ${setupInfo.serverPort})`;
    try { navigator.clipboard?.writeText(txt); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (e) { /* ignore */ }
  };

  const online = d => d.online || d.healthy;
  const fmt = ts => ts ? new Date(ts).toLocaleString() : '—';

  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '9px' }}>
          <span style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><FaFingerprint size={15} /></span>
          Biometric Attendance
        </h3>
        <button onClick={load} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
          <FaSync size={11} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>
      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px' }}>Connect a ZKTeco / eSSL / Realtime fingerprint or face terminal. Punches flow straight into attendance — no manual entry.</p>

      {msg && (
        <div style={{ marginBottom: '14px', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
          background: msg.type === 'ok' ? '#ecfdf5' : '#fef2f2', color: msg.type === 'ok' ? '#065f46' : '#b91c1c', border: `1px solid ${msg.type === 'ok' ? '#a7f3d0' : '#fecaca'}` }}>
          {msg.text}
        </div>
      )}

      {/* ── Step 1: setup URL ── */}
      {setupInfo && (
        <div style={{ marginBottom: '18px', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#eef2ff,#f5f3ff)', border: '1px solid #e0e7ff' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#4338ca', marginBottom: '8px' }}>① On the device — Menu → Comm → Cloud Server Setting (ADMS)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ background: '#fff', border: '1px solid #c7d2fe', borderRadius: '8px', padding: '8px 12px', fontFamily: 'monospace', fontSize: '13px', color: '#1e293b' }}>
              Server: <b>{setupInfo.serverAddress}</b> &nbsp;·&nbsp; Port: <b>{setupInfo.serverPort}</b> &nbsp;·&nbsp; {setupInfo.useSSL ? 'HTTPS' : 'HTTP'}
            </div>
            <button onClick={copyUrl} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 10px', borderRadius: '7px', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              {copied ? <><FaCheckCircle size={11} /> Copied</> : <><FaCopy size={11} /> Copy</>}
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#6366f1', marginTop: '8px' }}>Then enroll each staff face/finger on the device, register it below, and map their device user-ID to a staff member.</div>
        </div>
      )}

      {/* ── Unclaimed devices trying to connect ── */}
      {unclaimed.length > 0 && (
        <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>Devices trying to connect (claim to add):</div>
          {unclaimed.map(d => (
            <div key={d.serialNumber} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '6px 0' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#78350f' }}>{d.serialNumber} <span style={{ color: '#a16207', fontFamily: 'inherit' }}>· seen {fmt(d.lastSeenAt)}</span></span>
              <button onClick={() => register(d.serialNumber, `Terminal ${d.serialNumber}`)} disabled={busy} style={{ padding: '5px 12px', borderRadius: '7px', border: 'none', background: '#f59e0b', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Claim</button>
            </div>
          ))}
        </div>
      )}

      {/* ── Step 2: register a device ── */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>② Register the device</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
          <div><label style={label}>Serial Number (on the device)</label><input style={input} value={snForm.serialNumber} onChange={e => setSnForm(p => ({ ...p, serialNumber: e.target.value }))} placeholder="e.g. CJXK204860342" /></div>
          <div><label style={label}>Name (optional)</label><input style={input} value={snForm.name} onChange={e => setSnForm(p => ({ ...p, name: e.target.value }))} placeholder="Front entrance" /></div>
          <button onClick={() => register(snForm.serialNumber, snForm.name)} disabled={busy} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', height: '40px' }}><FaPlus size={11} /> Add</button>
        </div>
      </div>

      {/* ── Device list + health ── */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>Connected devices</div>
        {loading ? <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading…</p> :
          devices.length === 0 ? <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>No devices yet. Register one above.</p> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {devices.map(d => (
              <div key={d.serialNumber} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', border: '1px solid #eef0f2', borderRadius: '10px', background: '#fafafa', flexWrap: 'wrap' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {d.name || d.serialNumber}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: online(d) ? '#ecfdf5' : '#f3f4f6', color: online(d) ? '#059669' : '#9ca3af' }}>
                      <FaCircle size={7} /> {online(d) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontFamily: 'monospace' }}>{d.serialNumber}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>Last seen {fmt(d.lastSeenAt)} · {d.punchCount || 0} punches · {d.pushCount || 0} pushes</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openDiag(d.serialNumber)} title="Diagnostics / logs" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 11px', borderRadius: '7px', border: '1px solid #e5e7eb', background: '#fff', color: '#4f46e5', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}><FaStethoscope size={11} /> Check</button>
                  <button onClick={() => remove(d.serialNumber)} title="Remove" style={{ padding: '7px 10px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fff', color: '#ef4444', cursor: 'pointer' }}><FaTrash size={11} /></button>
                </div>
              </div>
            ))}
          </div>}
      </div>

      {/* ── Staff mapping ── */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>③ Map device user-IDs to staff</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto', gap: '10px', alignItems: 'end', marginBottom: '10px' }}>
          <div><label style={label}>Device User-ID (as enrolled on the device)</label><input style={input} value={mapForm.deviceUserId} onChange={e => setMapForm(p => ({ ...p, deviceUserId: e.target.value }))} placeholder="e.g. 1" /></div>
          <div><label style={label}>Staff member</label>
            <select style={input} value={mapForm.staffId} onChange={e => setMapForm(p => ({ ...p, staffId: e.target.value }))}>
              <option value="">Select staff…</option>
              {staffList.map(s => <option key={s._id || s.id} value={s._id || s.id}>{s.name || s.staffName} {s.role ? `(${s.role})` : ''}</option>)}
            </select>
          </div>
          <button onClick={addMapping} disabled={busy} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', height: '40px' }}>Map</button>
        </div>
        {mappings.length > 0 && (
          <div style={{ border: '1px solid #eef0f2', borderRadius: '10px', overflow: 'hidden' }}>
            {mappings.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '9px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '13px' }}>
                <span><b style={{ fontFamily: 'monospace' }}>#{m.deviceUserId}</b> → {m.staffName || m.staffId} {m.role ? <span style={{ color: '#9ca3af' }}>({m.role})</span> : null}</span>
                <button onClick={() => delMapping(m.deviceUserId)} style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: '11px' }}><FaTrash size={10} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Diagnostics modal (debug: is it connected? getting data?) ── */}
      {diag && (
        <div onClick={() => setDiag(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '620px', maxHeight: '85vh', overflow: 'auto', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>Diagnostics · <span style={{ fontFamily: 'monospace' }}>{diag.sn}</span></h3>
              <button onClick={() => setDiag(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><FaTimes size={16} /></button>
            </div>
            {diag.loading ? <p style={{ color: '#9ca3af' }}>Loading…</p> : diag.error ? <p style={{ color: '#ef4444' }}>{diag.error}</p> : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px', marginBottom: '16px' }}>
                  {[
                    ['Connected', diag.connected ? '🟢 Yes' : '🔴 No'],
                    ['Last seen', fmt(diag.summary?.lastSeenAt)],
                    ['Last punch', fmt(diag.summary?.lastPunchAt)],
                    ['Total punches', diag.summary?.punchCount ?? 0],
                    ['Mapped staff', diag.summary?.mappedStaff ?? 0],
                    ['Unmapped punches', diag.summary?.unmappedPunches ?? 0],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '10px', borderRadius: '9px', background: '#f8fafc', border: '1px solid #eef0f2' }}>
                      <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>{k}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginTop: '2px' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>Recent device activity (raw log)</div>
                <div style={{ background: '#0f172a', borderRadius: '10px', padding: '12px', maxHeight: '200px', overflow: 'auto', fontFamily: 'monospace', fontSize: '11.5px', color: '#cbd5e1', lineHeight: 1.6 }}>
                  {(diag.recentLogs || []).length === 0 ? <span style={{ color: '#64748b' }}>No activity yet — the device hasn&apos;t contacted the server.</span> :
                    (diag.recentLogs || []).map((l, i) => (
                      <div key={i}><span style={{ color: '#64748b' }}>{(l.at || '').slice(11, 19)}</span> <span style={{ color: '#38bdf8' }}>{l.kind}</span>{l.records != null ? <span style={{ color: '#a3e635' }}> ×{l.records}</span> : ''} {l.note ? <span style={{ color: '#94a3b8' }}>· {l.note}</span> : ''}</div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <style jsx>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
