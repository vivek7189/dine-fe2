'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { FaSpinner, FaPlug, FaSyncAlt, FaCheckCircle, FaLock, FaGlobe } from 'react-icons/fa';
import hotelApi from '../api/hotelApi';
import { Btn } from './ui';

const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const addDays = (s, n) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fmtTime = (t) => { if (!t) return 'never'; try { return new Date(t).toLocaleString(); } catch { return String(t); } };

const STATUS_BADGE = {
  connected: 'bg-emerald-50 text-emerald-700',
  pending_credentials: 'bg-amber-50 text-amber-700',
  disconnected: 'bg-slate-100 text-slate-500',
  error: 'bg-rose-50 text-rose-700',
};

export default function ChannelsView({ restaurantId, notify }) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [logs, setLogs] = useState({}); // channelId -> logs

  const load = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try { const r = await hotelApi.getChannels(restaurantId); setChannels(r.channels || []); }
    catch (e) { notify('error', e.message || 'Failed to load channels'); }
    finally { setLoading(false); }
  }, [restaurantId, notify]);

  useEffect(() => { load(); }, [load]);

  const connect = async (c) => {
    setBusy(c.code);
    try { await hotelApi.connectChannel(restaurantId, c.code); notify('success', `${c.label} connected`); await load(); }
    catch (e) { notify('error', e.message || 'Connect failed'); }
    finally { setBusy(null); }
  };
  const disconnect = async (c) => {
    if (!window.confirm(`Disconnect ${c.label}?`)) return;
    setBusy(c.code);
    try { await hotelApi.disconnectChannel(restaurantId, c.id); notify('success', `${c.label} disconnected`); await load(); }
    catch (e) { notify('error', e.message || 'Disconnect failed'); }
    finally { setBusy(null); }
  };
  const push = async (c) => {
    setBusy(c.code);
    try {
      const today = localToday();
      const r = await hotelApi.pushChannel(restaurantId, c.id, today, addDays(today, 30));
      notify('success', `Pushed ${r.result?.pushed ?? 0} rates to ${c.label}`);
      const lg = await hotelApi.channelLogs(restaurantId, c.id);
      setLogs((x) => ({ ...x, [c.id]: lg.logs || [] }));
      await load();
    } catch (e) { notify('error', e.message || 'Push failed'); }
    finally { setBusy(null); }
  };
  const toggleLogs = async (c) => {
    if (logs[c.id]) { setLogs((x) => { const n = { ...x }; delete n[c.id]; return n; }); return; }
    try { const lg = await hotelApi.channelLogs(restaurantId, c.id); setLogs((x) => ({ ...x, [c.id]: lg.logs || [] })); }
    catch (e) { notify('error', e.message); }
  };

  if (loading) return <div className="flex items-center gap-2 py-10 text-slate-400"><FaSpinner className="animate-spin" /> Loading…</div>;

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">Sync your rates &amp; availability to booking channels. The rate calendar is the source of truth — connect a channel and push.</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {channels.map((c) => (
          <div key={c.code} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500"><FaGlobe size={14} /></span>
                <div>
                  <div className="font-semibold text-slate-800">{c.label}</div>
                  {c.connected
                    ? <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_BADGE[c.status] || STATUS_BADGE.disconnected}`}>{c.status.replace('_', ' ')}</span>
                    : <span className="text-[11px] text-slate-400">Not connected</span>}
                </div>
              </div>
              {!c.functional && <span title="Needs OTA partner credentials" className="text-slate-300"><FaLock size={12} /></span>}
            </div>

            {c.connected && c.status === 'pending_credentials' && (
              <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-700">Awaiting OTA partner credentials before it can sync. The wiring is ready.</p>
            )}
            {c.connected && c.lastSyncAt && (
              <p className="mt-2 text-[11px] text-slate-400">Last sync: {fmtTime(c.lastSyncAt)}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {!c.connected && (
                <Btn onClick={() => connect(c)} disabled={busy === c.code}><FaPlug size={12} /> Connect</Btn>
              )}
              {c.connected && c.functional && (
                <Btn onClick={() => push(c)} disabled={busy === c.code}>{busy === c.code ? <FaSpinner className="animate-spin" size={12} /> : <FaSyncAlt size={12} />} Push rates</Btn>
              )}
              {c.connected && (
                <>
                  <button onClick={() => toggleLogs(c)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">{logs[c.id] ? 'Hide log' : 'Sync log'}</button>
                  <button onClick={() => disconnect(c)} disabled={busy === c.code} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50">Disconnect</button>
                </>
              )}
            </div>

            {logs[c.id] && (
              <div className="mt-3 max-h-40 space-y-1 overflow-y-auto rounded-lg bg-slate-50 p-2 text-[11px]">
                {logs[c.id].length === 0 && <p className="text-slate-400">No syncs yet.</p>}
                {logs[c.id].map((l) => (
                  <div key={l.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-600">
                      {l.status === 'success' ? <FaCheckCircle className="text-emerald-500" size={9} /> : <span className="text-rose-500">✕</span>}
                      {l.action} · {l.detail?.pushed != null ? `${l.detail.pushed} rates` : l.status}
                    </span>
                    <span className="text-slate-400">{fmtTime(l.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
