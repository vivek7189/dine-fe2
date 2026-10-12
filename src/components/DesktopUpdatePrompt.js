'use client';

// Desktop (Electron) app update requested by super-admin (dine-admin → App Control):
//  • recommended → small banner with "Update now" (dismissible for a day)
//  • required    → downloads in the background, shows a countdown, then restarts the app ITSELF at
//                  a quiet moment (no keyboard / mouse / touch for a minute) once the grace time is
//                  over. Staff can "Restart now", or push it back once by 15 minutes.
// It never restarts without a downloaded update, never mid-use, and never on web / mobile.

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaSyncAlt, FaTimes, FaDownload } from 'react-icons/fa';
import { checkForUpdates, restartApp } from '../utils/autoUpdater';
import { isElectron } from '../utils/platform';
import { IDLE_MS, updateDeadline, shouldAutoRestart } from '../utils/updateRestartPolicy';

const SNOOZE_MS = 15 * 60 * 1000;   // one postpone
const RETRY_MS = 10 * 60 * 1000;    // download retry
const LS = (k) => `dineopenUpdate:${k}`;

const lsGet = (k) => { try { return localStorage.getItem(LS(k)); } catch (_) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(LS(k), String(v)); } catch (_) {} };

function fmt(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return m >= 1 ? `${m} min` : `${s}s`;
}

export default function DesktopUpdatePrompt({ update }) {
  const required = update?.level === 'required';
  const minVersion = update?.minVersion || '';
  const [state, setState] = useState('idle');   // idle | downloading | ready | unavailable | failed
  const [now, setNow] = useState(Date.now());
  const [hidden, setHidden] = useState(false);
  const lastInput = useRef(Date.now());
  const busy = useRef(false);

  // First time this till saw the requirement → start of its grace period (kept across restarts).
  const firstSeen = (() => {
    if (!minVersion) return Date.now();
    const k = `firstSeen:${minVersion}`;
    const v = Number(lsGet(k));
    if (v > 0) return v;
    const t = Date.now();
    lsSet(k, t);
    return t;
  })();
  const snoozedUntil = Number(lsGet(`snooze:${minVersion}`)) || 0;
  const deadline = updateDeadline({ firstSeen, graceMinutes: update?.graceMinutes, snoozedUntil });

  // Track user activity so the restart only happens when nobody is using the till.
  useEffect(() => {
    if (!required) return;
    const mark = () => { lastInput.current = Date.now(); };
    const evs = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel'];
    evs.forEach((e) => window.addEventListener(e, mark, { passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, mark));
  }, [required]);

  const download = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setState('downloading');
    try {
      const r = await checkForUpdates({ autoInstall: true });
      if (r?.available && r?.installed) setState('ready');
      else if (r?.error) setState('failed');
      else setState('unavailable'); // nothing newer published yet — never restart
    } catch (_) {
      setState('failed');
    } finally {
      busy.current = false;
    }
  }, []);

  // Required: download right away (and retry). Recommended: wait for the user.
  useEffect(() => {
    if (!isElectron() || !update) return;
    if (required && state === 'idle') download();
    if (required && (state === 'failed' || state === 'unavailable')) {
      const t = setTimeout(download, RETRY_MS);
      return () => clearTimeout(t);
    }
  }, [required, update, state, download]);

  // Tick + safe auto-restart for required updates.
  useEffect(() => {
    if (!required) return;
    const iv = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (shouldAutoRestart({ state, now: t, deadline, lastInput: lastInput.current, idleMs: IDLE_MS })) {
        restartApp();
      }
    }, 5000);
    return () => clearInterval(iv);
  }, [required, state, deadline]);

  if (!isElectron() || !update || !minVersion) return null;
  if (!required) {
    const until = Number(lsGet(`dismissed:${minVersion}`)) || 0;
    if (hidden || until > Date.now()) return null;
  }

  const restartNow = async () => {
    if (state !== 'ready') { await download(); return; }
    restartApp();
  };
  const snooze = () => { lsSet(`snooze:${minVersion}`, Date.now() + SNOOZE_MS); lsSet(`snoozed:${minVersion}`, 1); setNow(Date.now()); };
  const canSnooze = required && lsGet(`snoozed:${minVersion}`) !== '1';
  const dismiss = () => { lsSet(`dismissed:${minVersion}`, Date.now() + 24 * 3600 * 1000); setHidden(true); };

  const left = deadline - now;
  const status =
    state === 'downloading' ? 'Downloading the update in the background…'
      : state === 'ready' ? (required
        ? (left > 0 ? `DineOpen will restart to update in about ${fmt(left)}, when the till is free.` : 'DineOpen will restart to update as soon as the till is free (no one using it for a minute).')
        : 'The update is ready — restart to finish.')
        : state === 'failed' ? 'Could not download the update — retrying automatically.'
          : state === 'unavailable' ? 'The update will install as soon as it is published.'
            : (required ? 'Preparing the update…' : '');

  return createPortal(
    <div style={{
      position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 100001,
      width: 'min(560px, calc(100vw - 24px))', background: '#fff', borderRadius: 14,
      border: `1px solid ${required ? '#fecaca' : '#bfdbfe'}`, borderLeft: `5px solid ${required ? '#dc2626' : '#2563eb'}`,
      boxShadow: '0 12px 36px rgba(15,23,42,0.18)', padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: required ? '#fef2f2' : '#eff6ff' }}>
        {state === 'downloading' ? <FaDownload color={required ? '#dc2626' : '#2563eb'} /> : <FaSyncAlt color={required ? '#dc2626' : '#2563eb'} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
          {required ? 'DineOpen update required' : 'A new DineOpen version is available'}
          <span style={{ fontWeight: 600, color: '#64748b', fontSize: 12, marginLeft: 6 }}>v{update.currentVersion || '?'} → v{minVersion}+</span>
        </div>
        {update.message ? <div style={{ fontSize: 13, color: '#334155', marginTop: 2 }}>{update.message}</div> : null}
        {status ? <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 4 }}>{status}</div> : null}
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button onClick={restartNow} disabled={state === 'downloading'} style={{
            padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
            background: required ? '#dc2626' : '#2563eb', color: '#fff', opacity: state === 'downloading' ? 0.6 : 1,
          }}>{state === 'ready' ? 'Restart & update now' : state === 'downloading' ? 'Downloading…' : 'Update now'}</button>
          {canSnooze && state === 'ready' ? (
            <button onClick={snooze} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#334155' }}>Later (15 min)</button>
          ) : null}
        </div>
      </div>
      {!required ? (
        <button onClick={dismiss} title="Remind me tomorrow" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 4, color: '#64748b' }}><FaTimes /></button>
      ) : null}
    </div>,
    document.body
  );
}
