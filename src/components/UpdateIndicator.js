'use client';

/**
 * Small, non-blocking app-update indicator for the header.
 *
 *  - Renders NOTHING on web or when there's no update (desktop only).
 *  - While the background check/download runs → a subtle spinner icon (progress lives
 *    ON the icon; the rest of the UI is fully usable — nothing is blocked).
 *  - When an update is downloaded and ready → a small blue "Update" pill. Tapping it
 *    opens a lightweight popover (NOT a modal) showing the current + new version and a
 *    "Restart now / Later" choice. "Later" just closes it — the update stays ready and
 *    applies whenever they restart, so service is never interrupted.
 */

import { useState, useRef, useEffect } from 'react';
import { FaSyncAlt, FaSpinner } from 'react-icons/fa';
import useAppUpdate from '../hooks/useAppUpdate';
import { restartForUpdate } from '../lib/updateStore';

export default function UpdateIndicator() {
  const { status, currentVersion, newVersion } = useAppUpdate();
  const [open, setOpen] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  if (status === 'checking') {
    return (
      <span title="Checking for updates…" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, color: '#94a3b8' }}>
        <FaSpinner size={13} style={{ animation: 'spin 0.9s linear infinite' }} />
      </span>
    );
  }
  if (status !== 'ready') return null;

  const doRestart = async () => { setRestarting(true); await restartForUpdate(); };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Update available"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          padding: '5px 10px', borderRadius: 20, border: '1px solid #bfdbfe',
          background: '#eff6ff', color: '#1d4ed8', fontSize: 12, fontWeight: 700,
        }}
      >
        <FaSyncAlt size={11} /> Update
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 1300,
          width: 250, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb',
          boxShadow: '0 12px 30px rgba(0,0,0,0.14)', padding: 14,
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', marginBottom: 2 }}>Update ready</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
            A new version has been downloaded. Restart to apply — your work is safe.
          </div>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 12, lineHeight: 1.5 }}>
            {currentVersion ? <>Current: <b>v{currentVersion}</b><br /></> : null}
            {newVersion ? <>New: <b style={{ color: '#1d4ed8' }}>v{newVersion}</b></> : 'A newer version is available'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={doRestart} disabled={restarting}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {restarting ? <><FaSpinner size={11} style={{ animation: 'spin 0.9s linear infinite' }} /> Restarting…</> : 'Restart now'}
            </button>
            <button onClick={() => setOpen(false)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', background: '#fff', color: '#6b7280', fontWeight: 600, fontSize: 13 }}>
              Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
