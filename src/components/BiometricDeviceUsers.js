'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSync, FaLink, FaUnlink, FaCheck, FaMagic } from 'react-icons/fa';
import apiClient from '../lib/api';

// Biometric "Device users" review + "Punches by day" (Attendance page, owner/admin).
// Device users = ID + name as enrolled on the machine (the machine sends its list). Each row shows the
// linked staff member, or a suggested match by name; owner/admin can Link / Change / Unlink.
// Punches by day = every punch the machine sent for a date, in the restaurant's local time.

const C = { brand: '#4f46e5', green: '#059669', red: '#b91c1c', amber: '#b45309', gray: '#6b7280', border: '#eef0f2' };
const btn = (bg, fg = '#fff') => ({ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 11px', borderRadius: '7px', border: 'none', background: bg, color: fg, fontSize: '12px', fontWeight: 700, cursor: 'pointer' });
const pill = (bg, fg) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: '999px', background: bg, color: fg, fontSize: '11px', fontWeight: 700 });
const todayLocal = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const STATUS = {
  'clock-in': ['Clock-in', '#ecfdf5', C.green], 'clock-in-earlier': ['Clock-in (earlier)', '#ecfdf5', C.green], noop: ['Extra punch', '#f3f4f6', C.gray], waiting: ['Waiting', '#fef3c7', C.amber], 'bad-timestamp': ['Bad time', '#fef2f2', C.red], 'clock-out': ['Clock-out', '#eff6ff', '#1d4ed8'], applied: ['Recorded', '#ecfdf5', C.green],
  'no-staff-mapping': ['Not linked', '#fef3c7', C.amber], 'biometric-off': ['Biometric off', '#f3f4f6', C.gray], 'device-unclaimed': ['Device not claimed', '#f3f4f6', C.gray],
};

export default function BiometricDeviceUsers({ restaurantId, isMobile = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState('all'); // all | linked | unlinked
  const [editing, setEditing] = useState(null); // deviceUserId being changed
  const [pick, setPick] = useState('');
  const [day, setDay] = useState(todayLocal());
  const [punches, setPunches] = useState(null);
  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 4000); };

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try { setData(await apiClient.getBiometricDeviceUsers(restaurantId)); }
    catch (e) { flash('err', e?.message || 'Could not load device users'); }
    finally { setLoading(false); }
  }, [restaurantId]);
  const loadDay = useCallback(async () => {
    if (!restaurantId) return;
    setPunches(null);
    try { setPunches(await apiClient.getBiometricPunchesDay(restaurantId, day)); } catch (e) { setPunches({ rows: [], error: e?.message }); }
  }, [restaurantId, day]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadDay(); }, [loadDay]);

  const canEdit = !!data?.canEdit;
  const staff = data?.staff || [];
  const rows = useMemo(() => (data?.rows || []).filter(r => filter === 'all' || (filter === 'linked' ? r.linked : !r.linked)), [data, filter]);
  const counts = useMemo(() => { const r = data?.rows || []; return { all: r.length, linked: r.filter(x => x.linked).length, unlinked: r.filter(x => !x.linked).length }; }, [data]);
  const suggestible = (data?.rows || []).filter(r => !r.linked && r.suggestion);

  const link = async (deviceUserId, staffId) => {
    const s = staff.find(x => x.id === staffId); if (!s) return;
    setBusy(deviceUserId);
    try {
      const r = await apiClient.setBiometricMapping(restaurantId, deviceUserId, s.id, s.name, s.role);
      flash('ok', `Linked ${deviceUserId} → ${s.name}${r?.replayed ? ` · ${r.replayed} punch(es) added to attendance` : ''}`);
      setEditing(null); setPick(''); await load(); await loadDay();
    } catch (e) { flash('err', e?.message || 'Could not link'); }
    finally { setBusy(null); }
  };
  const unlink = async (deviceUserId) => {
    setBusy(deviceUserId);
    try { await apiClient.deleteBiometricMapping(restaurantId, deviceUserId); flash('ok', `Unlinked ${deviceUserId}`); await load(); }
    catch (e) { flash('err', e?.message || 'Could not unlink'); }
    finally { setBusy(null); }
  };
  const linkAllSuggested = async () => {
    setBusy('all'); let n = 0;
    for (const r of suggestible) { try { const s = staff.find(x => x.id === r.suggestion.staffId); if (s) { await apiClient.setBiometricMapping(restaurantId, r.deviceUserId, s.id, s.name, s.role); n++; } } catch (_) { /* keep going */ } }
    flash('ok', `Linked ${n} suggested match(es)`); setBusy(null); await load(); await loadDay();
  };
  const refreshFromMachine = async () => {
    setBusy('refresh');
    try { await apiClient.refreshBiometricDeviceUsers(restaurantId); flash('ok', 'Asked the machine for its user list — refresh in ~30 seconds'); }
    catch (e) { flash('err', e?.message || 'Could not ask the machine'); }
    finally { setBusy(null); }
  };

  const freeStaff = (current) => staff.filter(s => !s.linkedTo || s.linkedTo === current);
  const th = { textAlign: 'left', fontSize: '11px', color: C.gray, fontWeight: 700, padding: '8px 10px', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' };
  const td = { padding: '8px 10px', borderBottom: `1px solid ${C.border}`, fontSize: '13px', verticalAlign: 'middle' };

  return (
    <div style={{ marginTop: '18px' }}>
      {/* ── Device users ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>Device users ↔ Staff</div>
          <div style={{ fontSize: '12px', color: C.gray }}>People enrolled on the machine, and which staff member each is linked to.{!canEdit && ' Only the owner or an admin can change links.'}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {canEdit && suggestible.length > 0 && <button onClick={linkAllSuggested} disabled={!!busy} style={btn(C.green)}><FaMagic size={11} /> Link all {suggestible.length} suggested</button>}
          {canEdit && <button onClick={refreshFromMachine} disabled={!!busy} style={btn('#eef2ff', C.brand)}><FaSync size={11} /> Get list from machine</button>}
          <button onClick={load} disabled={loading} style={btn('#f3f4f6', '#374151')}><FaSync size={11} /> Refresh</button>
        </div>
      </div>
      {msg && <div style={{ margin: '6px 0 10px', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', background: msg.type === 'ok' ? '#ecfdf5' : '#fef2f2', color: msg.type === 'ok' ? C.green : C.red }}>{msg.text}</div>}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        {[['all', 'All'], ['linked', 'Linked'], ['unlinked', 'Not linked']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ ...btn(filter === k ? '#111827' : '#fff', filter === k ? '#fff' : '#374151'), border: '1px solid #e5e7eb' }}>{l} {counts[k]}</button>
        ))}
      </div>

      {loading ? <div style={{ fontSize: '13px', color: C.gray, padding: '10px' }}>Loading…</div> : !rows.length ? (
        <div style={{ fontSize: '13px', color: C.gray, padding: '12px', border: `1px dashed #e5e7eb`, borderRadius: '10px' }}>
          No device users yet. {canEdit ? 'Tap "Get list from machine" — the machine sends its users within a minute.' : ''}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '640px' : 0 }}>
            <thead><tr><th style={th}>ID</th><th style={th}>Name on machine</th><th style={th}>Staff in DineOpen</th><th style={th}>Waiting punches</th>{canEdit && <th style={th}></th>}</tr></thead>
            <tbody>
              {rows.map(r => {
                const isEdit = editing === r.deviceUserId;
                return (
                  <tr key={r.deviceUserId}>
                    <td style={{ ...td, fontWeight: 800 }}>{r.deviceUserId}</td>
                    <td style={td}>{r.deviceName || <span style={{ color: C.gray }}>—</span>}</td>
                    <td style={td}>
                      {isEdit ? (
                        <select value={pick} onChange={e => setPick(e.target.value)} style={{ padding: '6px 8px', borderRadius: '7px', border: '1px solid #e5e7eb', fontSize: '13px', minWidth: '180px' }}>
                          <option value="">Choose staff…</option>
                          {freeStaff(r.deviceUserId).map(s => <option key={s.id} value={s.id}>{s.name}{s.role ? ` (${s.role})` : ''}</option>)}
                        </select>
                      ) : r.linked ? (
                        <span><FaCheck size={10} color={C.green} /> <b>{r.linked.staffName}</b> {r.linked.role && <span style={{ color: C.gray }}>({r.linked.role})</span>}</span>
                      ) : r.suggestion ? (
                        <span style={{ color: C.amber }}>Suggested: <b>{r.suggestion.staffName}</b></span>
                      ) : <span style={pill('#fef3c7', C.amber)}>Not linked</span>}
                    </td>
                    <td style={td}>{r.waitingPunches ? <span style={pill('#fef3c7', C.amber)}>{r.waitingPunches}</span> : <span style={{ color: C.gray }}>0</span>}</td>
                    {canEdit && (
                      <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                        {isEdit ? (
                          <>
                            <button disabled={!pick || busy === r.deviceUserId} onClick={() => link(r.deviceUserId, pick)} style={{ ...btn(C.green), opacity: pick ? 1 : 0.5 }}>Save</button>{' '}
                            <button onClick={() => { setEditing(null); setPick(''); }} style={btn('#f3f4f6', '#374151')}>Cancel</button>
                          </>
                        ) : (
                          <>
                            {!r.linked && r.suggestion && <><button disabled={!!busy} onClick={() => link(r.deviceUserId, r.suggestion.staffId)} style={btn(C.green)}><FaCheck size={10} /> Accept</button>{' '}</>}
                            <button disabled={!!busy} onClick={() => { setEditing(r.deviceUserId); setPick(r.linked?.staffId || r.suggestion?.staffId || ''); }} style={btn('#eef2ff', C.brand)}><FaLink size={10} /> {r.linked ? 'Change' : 'Link'}</button>
                            {r.linked && <>{' '}<button disabled={!!busy} onClick={() => unlink(r.deviceUserId)} style={btn('#fef2f2', C.red)}><FaUnlink size={10} /> Unlink</button></>}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {(data?.staff || []).some(s => !s.linkedTo) && (
        <div style={{ fontSize: '12px', color: C.gray, marginTop: '6px' }}>
          Staff not on the machine yet: {(data.staff || []).filter(s => !s.linkedTo).map(s => s.name).join(', ')}
        </div>
      )}

      {/* ── Punches by day ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', margin: '22px 0 8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>Punches by day</div>
          <div style={{ fontSize: '12px', color: C.gray }}>Every punch from the machine for the day, in your local time{punches?.timezone ? ` (${punches.timezone})` : ''}.</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input type="date" value={day} max={todayLocal()} onChange={e => setDay(e.target.value)} style={{ padding: '7px 9px', borderRadius: '7px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
          <button onClick={loadDay} style={btn('#f3f4f6', '#374151')}><FaSync size={11} /></button>
        </div>
      </div>
      {!punches ? <div style={{ fontSize: '13px', color: C.gray, padding: '10px' }}>Loading…</div> : !punches.rows?.length ? (
        <div style={{ fontSize: '13px', color: C.gray, padding: '12px', border: `1px dashed #e5e7eb`, borderRadius: '10px' }}>{punches.error || 'No punches on this day.'}</div>
      ) : (
        <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: '10px', maxHeight: '420px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '520px' : 0 }}>
            <thead><tr><th style={th}>Time</th><th style={th}>ID</th><th style={th}>Staff / name on machine</th><th style={th}>Result</th></tr></thead>
            <tbody>
              {punches.rows.map((p, i) => {
                const [label, bg, fg] = STATUS[p.status] || [p.status, '#f3f4f6', C.gray];
                return (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 800 }}>{p.time}</td>
                    <td style={td}>{p.deviceUserId}</td>
                    <td style={td}>{p.staffName ? <b>{p.staffName}</b> : <span style={{ color: C.gray }}>{p.deviceName || '—'}</span>}</td>
                    <td style={td}><span style={pill(bg, fg)}>{label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ fontSize: '12px', color: C.gray, marginTop: '6px' }}>Daily in/out times per staff member are in the <b>Today</b> and <b>Calendar</b> tabs (📟 Biometric).</div>
    </div>
  );
}
