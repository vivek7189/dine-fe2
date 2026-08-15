'use client';

// Corporate Meal — self-contained shell. When the flag is on, this takes over the whole screen:
// its own sidebar, header and theme (DineOpen red). Renders NOTHING of the restaurant POS.
// Guards: must be authenticated AND the restaurant must have settings.features.corporateMeal.

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FaTh, FaBuilding, FaMapMarkerAlt, FaUsers, FaClock, FaCalendarCheck,
  FaChartBar, FaQrcode, FaUtensils, FaArrowLeft, FaSpinner, FaBars, FaTimes,
} from 'react-icons/fa';
import apiClient from '../../lib/api';
import corporateApi from '../../lib/corporateApi';
import { C } from '../../corporate/theme';
import { ToastProvider } from '../../components/corporate/ui';

const NAV = [
  { href: '/corporate', label: 'Dashboard', icon: FaTh, exact: true },
  { href: '/corporate/clients', label: 'Clients', icon: FaBuilding },
  { href: '/corporate/sites', label: 'Sites', icon: FaMapMarkerAlt },
  { href: '/corporate/employees', label: 'Employees', icon: FaUsers },
  { href: '/corporate/meal-periods', label: 'Meal Periods', icon: FaClock },
  { href: '/corporate/bookings', label: 'Bookings', icon: FaCalendarCheck },
  { href: '/corporate/counts', label: 'Live Counts', icon: FaChartBar },
  { href: '/corporate/counter', label: 'Counter', icon: FaQrcode },
];

export default function CorporateLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState('checking'); // checking | ok | denied | unauth
  const [rest, setRest] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const role = String(apiClient.getUser?.()?.role || '').toLowerCase();

  const enableModule = async () => {
    setEnabling(true);
    try { await corporateApi.setFlag(true); window.location.reload(); }
    catch { setEnabling(false); }
  };

  useEffect(() => {
    (async () => {
      try {
        if (!apiClient.isAuthenticated()) { setState('unauth'); router.replace('/login'); return; }
        let rid = null;
        try { rid = JSON.parse(localStorage.getItem('selectedRestaurant') || 'null')?.id; } catch {}
        if (!rid) rid = apiClient.getUser()?.restaurantId;
        if (!rid) { setState('denied'); return; }
        const res = await apiClient.getRestaurant(rid);
        const r = res?.restaurant || res;
        const on = r?.settings?.features?.corporateMeal === true;
        setRest(r);
        setState(on ? 'ok' : 'denied');
      } catch { setState('denied'); }
    })();
  }, [router]);

  if (state === 'checking' || state === 'unauth') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.surface2 }}>
        <FaSpinner size={22} color={C.primary} style={{ animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }
  if (state === 'denied') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.surface2, padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: 'center', background: '#fff', border: `1px solid ${C.border}`, borderRadius: C.radius, padding: 32, boxShadow: C.shadow }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <FaUtensils size={22} color={C.primary} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.ink, margin: '0 0 6px' }}>Corporate Meals is not enabled</h2>
          <p style={{ fontSize: 13.5, color: C.muted, margin: '0 0 18px' }}>{['owner', 'admin'].includes(role) ? 'Turn it on to start managing employee meals for your corporate clients.' : 'Ask an owner or admin to enable Corporate Meal Management.'}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            {['owner', 'admin'].includes(role) && (
              <button onClick={enableModule} disabled={enabling} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', cursor: enabling ? 'default' : 'pointer', background: C.grad, color: '#fff', fontWeight: 700, opacity: enabling ? 0.7 : 1 }}>{enabling ? 'Enabling…' : 'Enable Corporate Meals'}</button>
            )}
            <button onClick={() => router.replace('/home')} style={{ padding: '10px 18px', borderRadius: 10, border: `1px solid ${C.border}`, cursor: 'pointer', background: '#fff', color: C.muted, fontWeight: 700 }}>Back to POS</button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (item) => item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const Nav = () => (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px' }}>
      {NAV.map((item) => {
        const Icon = item.icon; const active = isActive(item);
        return (
          <Link key={item.href} href={item.href} onClick={() => setMobileNav(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 12,
              textDecoration: 'none', fontSize: 14, fontWeight: active ? 700 : 600,
              color: active ? '#fff' : C.ink2, background: active ? C.grad : 'transparent',
              boxShadow: active ? '0 4px 14px rgba(220,38,38,0.28)' : 'none', transition: 'all .15s',
            }}>
            <Icon size={15} style={{ opacity: active ? 1 : 0.7 }} /> {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '18px 18px 14px' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}>
        <FaUtensils size={18} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, lineHeight: 1.1 }}>Corporate Meals</div>
        <div style={{ fontSize: 11, color: C.faint, fontWeight: 600 }}>{rest?.name || 'DineOpen'}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.surface2, display: 'flex' }}>
      {/* Sidebar (desktop) */}
      <aside style={{ width: 248, background: '#fff', borderRight: `1px solid ${C.border}`, position: 'sticky', top: 0, height: '100vh', display: 'flex', flexDirection: 'column' }} className="cm-sidebar">
        {brand}
        <div style={{ height: 1, background: C.borderSoft, margin: '0 14px 6px' }} />
        <Nav />
        <div style={{ marginTop: 'auto', padding: 14 }}>
          <button onClick={() => { try { sessionStorage.setItem('cm_pos_mode', '1'); } catch {} router.replace('/home'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', borderRadius: 10, border: `1px solid ${C.border}`, background: C.surface2, color: C.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
            <FaArrowLeft size={11} /> Exit to POS
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {mobileNav && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex' }} className="cm-drawer">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileNav(false)} />
          <aside style={{ position: 'relative', width: 260, background: '#fff', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {brand}<div style={{ height: 1, background: C.borderSoft, margin: '0 14px 6px' }} /><Nav />
          </aside>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <header style={{ height: 60, background: '#fff', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', position: 'sticky', top: 0, zIndex: 40 }}>
          <button onClick={() => setMobileNav(true)} className="cm-burger" style={{ display: 'none', border: 'none', background: 'transparent', cursor: 'pointer', color: C.ink2 }}><FaBars size={18} /></button>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{NAV.find(isActive)?.label || 'Corporate Meals'}</div>
          <div style={{ marginLeft: 'auto', fontSize: 12.5, color: C.muted, fontWeight: 600 }}>{apiClient.getUser()?.name || apiClient.getUser()?.role || ''}</div>
        </header>
        <main style={{ flex: 1 }}><ToastProvider>{children}</ToastProvider></main>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media (max-width: 900px){ .cm-sidebar{display:none} .cm-burger{display:inline-flex !important} }
      `}</style>
    </div>
  );
}
