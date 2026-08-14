'use client';

/**
 * Dismissible "update ready" banner for the Home screen.
 *
 * Renders only on desktop when an update has been downloaded and is ready to apply.
 * Non-blocking and dismissible — staff see it at login / between rushes, never a
 * modal mid-service. "Restart now" applies it; "×" dismisses for this session.
 */

import { useState } from 'react';
import { FaSyncAlt, FaSpinner, FaTimes } from 'react-icons/fa';
import useAppUpdate from '../hooks/useAppUpdate';
import { restartForUpdate, dismissUpdate } from '../lib/updateStore';

export default function UpdateBanner() {
  const { status, newVersion, dismissed } = useAppUpdate();
  const [restarting, setRestarting] = useState(false);

  if (status !== 'ready' || dismissed) return null;

  const doRestart = async () => { setRestarting(true); await restartForUpdate(); };

  return (
    <div className="animate-in" style={{
      marginBottom: 20, borderRadius: 14, border: '1px solid #bfdbfe',
      background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', padding: '14px 18px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FaSyncAlt size={16} color="#fff" />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1e3a8a' }}>
            A new version{newVersion ? ` (v${newVersion})` : ''} is ready
          </div>
          <div style={{ fontSize: 12, color: '#1d4ed8' }}>Restart when convenient to apply it — your work is saved.</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={doRestart} disabled={restarting}
          style={{ padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {restarting ? <><FaSpinner size={11} style={{ animation: 'spin 0.9s linear infinite' }} /> Restarting…</> : 'Restart now'}
        </button>
        <button onClick={dismissUpdate} aria-label="Dismiss" style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 6, lineHeight: 1 }}>
          <FaTimes size={15} />
        </button>
      </div>
    </div>
  );
}
