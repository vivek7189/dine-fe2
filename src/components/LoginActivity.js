'use client';

// Sidebar "Last login" lines + Login activity window (the person's OWN logins only, from
// GET /api/me/login-activity). "Before" = the latest login that isn't this one — a login the person
// doesn't recognise there is the thing to notice. "Log out other devices" (POST
// /api/me/logout-other-devices) ends every other login; this device gets a fresh token.
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaDesktop, FaMobileAlt, FaGlobe, FaSignOutAlt } from 'react-icons/fa';
import apiClient from '../lib/api';

const CACHE_KEY = 'dine_login_activity_v1';
const CACHE_MS = 5 * 60 * 1000;

const fmtWhen = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return `Today ${time}`;
  if (sameDay(d, yest)) return `Yesterday ${time}`;
  return `${d.toLocaleDateString([], { day: 'numeric', month: 'short' })} ${time}`;
};
const shortDevice = (l) => (l?.device ? String(l.device).split(' · ').pop() : null);
const DeviceIcon = ({ l }) => {
  const d = String(l?.device || l?.app || '');
  if (/desktop/i.test(d)) return <FaDesktop className="text-gray-400" size={13} />;
  if (/app|iPhone|iPad|Android|mobile/i.test(d)) return <FaMobileAlt className="text-gray-400" size={13} />;
  return <FaGlobe className="text-gray-400" size={13} />;
};

function readCache(uid) {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (c && c.uid === uid && Date.now() - c.t < CACHE_MS) return c.logins;
  } catch { /* storage blocked */ }
  return null;
}
function writeCache(uid, logins) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ uid, t: Date.now(), logins })); } catch { /* ignore */ }
}

export default function LoginActivity({ userId }) {
  const [logins, setLogins] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async (force = false) => {
    if (!userId) return;
    const cached = !force && readCache(userId);
    if (cached) { setLogins(cached); return; }
    try {
      const r = await apiClient.request('/api/me/login-activity?limit=10');
      const list = Array.isArray(r?.logins) ? r.logins : [];
      setLogins(list); writeCache(userId, list);
    } catch { setLogins((p) => p || []); }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (!logins || logins.length === 0) return null;
  const mine = logins.find((l) => l.thisDevice) || logins[0];
  const before = logins.find((l) => l !== mine);

  const logoutOthers = async () => {
    setBusy(true); setNote('');
    try {
      const r = await apiClient.request('/api/me/logout-other-devices', { method: 'POST', body: JSON.stringify({}) });
      if (r?.token) apiClient.setToken(r.token);
      setConfirming(false);
      setNote('Done — all other devices are logged out. This one stays logged in.');
      await load(true);
    } catch (e) {
      setNote(e?.message || 'Could not log out other devices');
    } finally { setBusy(false); }
  };

  return (
    <>
      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); load(true); }}
        className="w-full text-left px-3 -mt-1 pb-1 group" title="Login activity">
        <span className="block text-[10.5px] leading-4 text-gray-400 truncate">Logged in · {fmtWhen(mine.at)}</span>
        {before && (
          <span className="block text-[10.5px] leading-4 text-gray-400 truncate group-hover:text-gray-600">
            Before · {fmtWhen(before.at)}{shortDevice(before) ? `, ${shortDevice(before)}` : ''}
          </span>
        )}
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div onClick={() => !busy && setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div role="dialog" aria-label="Login activity" onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[88vh] overflow-auto">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <div className="flex-1">
                <div className="font-bold text-gray-900">Login activity</div>
                <div className="text-xs text-gray-500">Your last logins. Don&apos;t recognise one? Log out other devices and change your password.</div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><FaTimes size={12} /></button>
            </div>
            <ul className="px-3 py-2">
              {logins.map((l, i) => (
                <li key={`${l.at}-${i}`} className="flex items-center gap-3 px-2 py-2.5 border-b border-gray-50 last:border-0">
                  <DeviceIcon l={l} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate">{l.device || (l.app ? String(l.app).replace(/-/g, ' ') : 'Unknown device')}</div>
                    <div className="text-xs text-gray-500">{fmtWhen(l.at)}{l.method ? ` · ${String(l.method).replace(/-/g, ' ')}` : ''}</div>
                  </div>
                  {l === mine && <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">This device</span>}
                </li>
              ))}
            </ul>
            <div className="px-5 pb-5 pt-2">
              {note && <div className={`text-sm mb-3 ${/Done/.test(note) ? 'text-emerald-700' : 'text-red-600'}`}>{note}</div>}
              {!confirming ? (
                <button type="button" onClick={() => { setConfirming(true); setNote(''); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold text-sm hover:bg-red-100">
                  <FaSignOutAlt size={13} /> Log out other devices
                </button>
              ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                  <div className="text-sm text-red-800 mb-2">Every other phone, tablet and computer using your login will be logged out now. This device stays logged in.</div>
                  <div className="flex gap-2">
                    <button type="button" disabled={busy} onClick={logoutOthers} className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white font-semibold text-sm">{busy ? 'Logging out…' : 'Yes, log them out'}</button>
                    <button type="button" disabled={busy} onClick={() => setConfirming(false)} className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>, document.body)}
    </>
  );
}
