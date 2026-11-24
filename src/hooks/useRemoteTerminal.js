'use client';
// Desktop check-in for remote support (utils/remoteTerminal). Electron only; every 90 s. Applies a
// change support queued for this terminal ONCE (rev kept in localStorage and reported to the server
// before any restart), and returns a banner for update / restart when it is not forced.
// Any failure is swallowed: this never touches printing, and an old server (404) just means no-op.
import { useEffect, useRef, useState } from 'react';
import apiClient from '../lib/api';
import { isElectron } from '../utils/platform';
import { getStableTerminalId } from '../utils/terminalId';
import { getAppVersion, checkForUpdates, restartApp } from '../utils/autoUpdater';
import { readTerminalState, applyPending } from '../utils/remoteTerminal';

const EVERY_MS = 90 * 1000;
const QUEUE_EVERY = 10; // Windows print queue read every 10th check-in (~15 min) — it starts PowerShell

function userLabel() {
  try {
    const u = JSON.parse(window.localStorage.getItem('user') || 'null');
    return u ? [u.name || u.username || u.phone || '', u.role || ''].filter(Boolean).join(' · ') : null;
  } catch { return null; }
}

export default function useRemoteTerminal(restaurantId) {
  const [notice, setNotice] = useState(null); // { text, action: 'update'|'restart' }
  const busy = useRef(false);

  useEffect(() => {
    if (!restaurantId || !isElectron() || typeof window === 'undefined' || !window.electronAPI) return;
    let stopped = false;
    let count = 0;
    const api = window.electronAPI;
    const revKey = (tid) => `dineopen_remote_rev_${restaurantId}_${tid}`;
    const resultKey = (tid) => `dineopen_remote_result_${restaurantId}_${tid}`;
    const read = (k) => { try { return window.localStorage.getItem(k); } catch { return null; } };
    const write = (k, v) => { try { window.localStorage.setItem(k, v); } catch { /* ignore */ } };

    const send = async (terminalId, extra = {}) => {
      const state = await readTerminalState(api, { withQueue: count % QUEUE_EVERY === 0 });
      const appliedRev = parseInt(read(revKey(terminalId)), 10);
      let applyResult = null;
      try { applyResult = JSON.parse(read(resultKey(terminalId)) || 'null'); } catch { /* none */ }
      return apiClient.request(`/api/terminals/${restaurantId}/checkin`, {
        method: 'POST',
        body: {
          terminalId, appVersion: await getAppVersion(), userLabel: userLabel(), ...state,
          appliedRev: Number.isInteger(appliedRev) ? appliedRev : null, applyResult, ...extra,
        },
      });
    };

    const tick = async () => {
      if (stopped || busy.current) return;
      busy.current = true;
      try {
        const terminalId = await getStableTerminalId();
        if (!terminalId) return;
        const res = await send(terminalId);
        count += 1;
        const lastRev = parseInt(read(revKey(terminalId)), 10) || 0;
        if (stopped || !res?.pending || !Number.isInteger(res.rev) || res.rev <= lastRev) return;

        const result = await applyPending(res.pending, api);
        let follow = null;
        if (result.action === 'update') {
          const u = await checkForUpdates({ autoInstall: true }).catch((e) => ({ error: e?.message }));
          if (u?.installed) { result.done.push(`update ${u.version} downloaded`); follow = { action: 'update', version: u.version }; }
          else if (u?.available === false && !u?.error) result.done.push('already up to date');
          else { result.ok = false; result.errors.push(`update: ${u?.error || 'not downloaded'}`); }
        } else if (result.action === 'restart') {
          follow = { action: 'restart' };
        }
        const report = { ok: result.ok, done: result.done, errors: result.errors, at: new Date().toISOString(), force: result.force };
        // Save + report BEFORE any restart, so the same change is never applied twice.
        write(revKey(terminalId), String(res.rev));
        write(resultKey(terminalId), JSON.stringify(report));
        await send(terminalId).catch(() => {});
        if (!follow) return;
        if (result.force) { await restartApp(); return; }
        const note = res.pending.note ? `${res.pending.note} ` : '';
        setNotice(follow.action === 'update'
          ? { action: 'update', text: `${note}DineOpen support: update v${follow.version} is ready.` }
          : { action: 'restart', text: `${note}DineOpen support asked to restart the app.` });
      } catch { /* old server / offline / no access → try next time */ } finally {
        busy.current = false;
      }
    };

    const first = setTimeout(tick, 20000); // after the start-up rush
    const timer = setInterval(tick, EVERY_MS);
    return () => { stopped = true; clearTimeout(first); clearInterval(timer); };
  }, [restaurantId]);

  return { notice, dismiss: () => setNotice(null), restartNow: () => restartApp() };
}
