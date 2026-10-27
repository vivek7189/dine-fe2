'use client';

// Kitchen display login (staff role `kitchen_display`, created in Admin → Staff): a full-screen KOT
// screen with nothing else — no sidebar, no other pages. The normal KOT screen (kot/page.js) runs in
// kdsMode with this login's settings: canUpdateStatus (Start / Ready / Done, or view only) and station
// (fixed Bar / Kitchen / All, or picked on each screen). Settings are re-read every minute so an
// owner's change applies without logging in again. The server only lets this login call the KOT
// screen's endpoints (backend utils/kitchenDisplay.js).
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSignOutAlt } from 'react-icons/fa';
import apiClient from '../../lib/api';
import { performLogout } from '../../lib/logout';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import KitchenOrderTicket from '../(dashboard)/kot/page';

const STATION_LABEL = { all: 'All items', bar: 'Bar', kitchen: 'Kitchen' };

export default function KitchenDisplayPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [now, setNow] = useState(null);

  useEffect(() => {
    let user = null;
    try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { user = null; }
    if (!localStorage.getItem('authToken') || !user) { router.replace('/login'); return; }
    if (String(user.role || '').toLowerCase() !== 'kitchen_display') { router.replace('/home'); return; }
    let alive = true;
    const load = () => apiClient.request('/api/kitchen-display/me')
      .then((r) => { if (alive && r && r.success) setMe(r); })
      .catch((e) => { if (alive && e?.status === 403 && !me) setMe({ error: e?.message || 'This login is not active.' }); });
    load();
    const t = setInterval(load, 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, [router]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const t = setInterval(tick, 30 * 1000);
    return () => clearInterval(t);
  }, []);

  const logout = () => { apiClient.clearToken(); performLogout(); };

  if (!me) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: 15 }}>Loading kitchen screen…</div>;
  }
  if (me.error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#b91c1c' }}>{me.error}</div>
        <button onClick={logout} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#111827', color: 'white', fontWeight: 700, cursor: 'pointer' }}>Log out</button>
      </div>
    );
  }

  const s = me.settings || {};
  const stationText = STATION_LABEL[s.station] || null;
  return (
    <CurrencyProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', background: '#111827', color: 'white', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.restaurantName || 'Kitchen'}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              Kitchen screen · {me.name}{stationText ? ` · ${stationText}` : ''}{s.canUpdateStatus === false ? ' · View only' : ''}
            </div>
          </div>
          {now && <div style={{ fontSize: 20, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
          <button onClick={logout} title="Log out"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 9, border: '1px solid #374151', background: 'transparent', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <FaSignOutAlt size={13} /> Log out
          </button>
        </header>
        <main style={{ flex: 1, minHeight: 0 }}>
          <KitchenOrderTicket kdsMode={{ canUpdateStatus: s.canUpdateStatus !== false, station: s.station || 'choose' }} />
        </main>
      </div>
    </CurrencyProvider>
  );
}
