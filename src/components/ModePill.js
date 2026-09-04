'use client';

/**
 * ModePill — always-visible header indicator for the installed POS app that answers two
 * separate questions at a glance:
 *
 *   1) WHICH SERVER am I on?  🟢 Local server (LAN — this machine or a LAN host, works with
 *      the internet OFF and can serve many terminals)  vs  🔵 Cloud (GCP, needs internet).
 *      "Offline" here means LAN / local-server — NOT "no internet".
 *   2) Is the INTERNET up? — a small secondary dot (for cloud sync), independent of the mode.
 *
 * Clicking it takes an owner/admin to Settings → Local Server to switch modes. Web never
 * renders this (no local server concept). Purely a status read from localStorage + navigator.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLocalServerUrl, isServerModeActive } from '../lib/localServer';

export default function ModePill() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [local, setLocal] = useState('');
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setMounted(true);
    const readLocal = () => { try { setLocal(getLocalServerUrl() || ''); } catch (_) {} };
    const readNet = () => setOnline(typeof navigator === 'undefined' ? true : navigator.onLine !== false);
    readLocal(); readNet();
    window.addEventListener('online', readNet);
    window.addEventListener('offline', readNet);
    const id = setInterval(readLocal, 4000); // the local-server URL can change after connect/switch
    return () => {
      window.removeEventListener('online', readNet);
      window.removeEventListener('offline', readNet);
      clearInterval(id);
    };
  }, []);

  if (!mounted) return null;
  const isInstalledApp = typeof window !== 'undefined' && (!!window.electronAPI || !!window.Capacitor);
  if (!isInstalledApp || !isServerModeActive()) return null; // only the offline/LAN server app
  // Owner/admin (and any admin-allowed roles) get the interactive top-right toggle instead —
  // don't also show this read-only pill for them.
  try {
    const u = JSON.parse(localStorage.getItem('userData') || 'null');
    const rest = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null');
    const allowed = rest?.posSettings?.modeToggleRoles || rest?.settings?.modeToggleRoles || [];
    if (['owner', 'admin'].includes(u?.role) || (Array.isArray(allowed) && allowed.includes(u?.role))) return null;
  } catch (_) {}

  const onLocal = !!local;
  const isLan = onLocal && !/(127\.0\.0\.1|localhost)/.test(local);
  const modeLabel = onLocal ? (isLan ? 'LAN server' : 'Local server') : 'Cloud';
  const modeDot = onLocal ? '#16A34A' : '#2563EB';
  const netDot = online ? '#16A34A' : '#C98A2B';
  const netText = online ? 'online' : 'offline';
  const title = onLocal
    ? `On the local server (${local}) — works over the LAN with or without internet. Internet: ${netText}.`
    : `On the cloud (GCP). Internet: ${netText}.`;

  return (
    <button
      type="button"
      onClick={() => router.push('/settings/local-server')}
      title={title}
      style={{
        position: 'fixed', bottom: 14, right: 14, zIndex: 9996,
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', borderRadius: 999,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', border: '1px solid #E5E7EB',
        fontSize: 11, fontWeight: 700, color: '#374151', cursor: 'pointer',
        boxShadow: '0 1px 4px rgba(0,0,0,0.10)', whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: modeDot, flexShrink: 0 }} />
      {modeLabel}
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: netDot, flexShrink: 0, marginLeft: 1 }} title={`Internet: ${netText}`} />
    </button>
  );
}
