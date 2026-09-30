'use client';

import { useEffect, useState } from 'react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import { useAutoPrint } from '../../hooks/useAutoPrint';
import { isReactNativeWebView } from '../../utils/platform';
import apiClient from '../../lib/api';
import { usePathname } from 'next/navigation';
import { rolesAllowsPath } from '../../lib/rolesRouteMap';
import ManagerPinPrompt from '../../components/ManagerPinPrompt';

// Set mobile embed flag IMMEDIATELY at module level (before any useEffect/render)
// This ensures pages that check this flag during their initial render won't redirect to /login
if (typeof window !== 'undefined') {
  window.__DINEOPEN_MOBILE_EMBED__ = true;
}

/**
 * Mobile Embed Layout
 * Stripped-down layout for WebView embedding in native apps.
 * - No sidebar, no header, no DineAI button
 * - Auto-authenticates via ?token= and ?user= URL params (handled by root TokenExtractor)
 * - Also accepts ?restaurantId= to pre-select restaurant
 * - Sets window.__DINEOPEN_MOBILE_EMBED__ flag so pages skip login redirects
 * - Full-width, mobile-optimized
 */
// Roles on (rolesV2): /mobile pages follow the person's role (owner / co-owner always allowed).
function roleBlockedFromCache(pathname) {
  try {
    const rp = JSON.parse(localStorage.getItem('navRolePermissions') || 'null');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!rp || !user || rp.rid !== localStorage.getItem('selectedRestaurantId')) return false;
    return !rolesAllowsPath(pathname, user.role, rp.permissions, { mobile: true });
  } catch { return false; }
}

export default function MobileLayout({ children }) {
  const pathname = usePathname();
  const [roleBlocked, setRoleBlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [printSettings, setPrintSettings] = useState(null);

  useEffect(() => {
    // Reinforce the flag (in case module-level didn't run)
    window.__DINEOPEN_MOBILE_EMBED__ = true;

    // Extract restaurantId from URL if provided (WebView passes it)
    const params = new URLSearchParams(window.location.search);
    const rid = params.get('restaurantId');
    if (rid) {
      localStorage.setItem('selectedRestaurantId', rid);
      setRestaurantId(rid);
    } else {
      // Fallback: read from localStorage (set by injectedJS)
      const storedRid = localStorage.getItem('selectedRestaurantId');
      if (storedRid) setRestaurantId(storedRid);
    }

    // Also extract token/user directly here as a safety net
    // (the root TokenExtractor also does this, but we need it ASAP)
    const token = params.get('token');
    const user = params.get('user');
    if (token) {
      localStorage.setItem('authToken', token);
    }
    if (user) {
      try {
        const parsed = JSON.parse(decodeURIComponent(user));
        localStorage.setItem('user', JSON.stringify(parsed));
      } catch (e) {
        console.error('Mobile layout: failed to parse user param:', e);
      }
    }

    // Wait for auth to be in localStorage before rendering children
    let attempts = 0;
    const checkReady = () => {
      const hasToken = localStorage.getItem('authToken');
      const hasUser = localStorage.getItem('user');
      if (hasToken && hasUser) {
        setReady(true);
        // Set restaurantId from user data if not already set
        if (!rid) {
          try {
            const userData = JSON.parse(hasUser);
            const userRid = userData.restaurantId || userData.restaurant?.id;
            if (userRid) setRestaurantId(userRid);
          } catch (_) {}
        }
        return;
      }
      attempts++;
      if (attempts < 15) {
        setTimeout(checkReady, 100);
      } else {
        // Render anyway after 1.5s — page will handle missing auth
        setReady(true);
      }
    };
    checkReady();

    return () => {
      window.__DINEOPEN_MOBILE_EMBED__ = false;
    };
  }, []);

  // Fetch print settings for auto-print (only in React Native WebView)
  useEffect(() => {
    if (!isReactNativeWebView() || !restaurantId) return;
    apiClient.getPrintSettings(restaurantId)
      .then(res => setPrintSettings(res?.printSettings || res))
      .catch(() => {});
  }, [restaurantId]);

  useEffect(() => {
    if (!ready) return;
    setRoleBlocked(roleBlockedFromCache(pathname));
    let cancelled = false;
    apiClient.getUserPageAccess?.()
      .then((res) => {
        if (cancelled || !res) return;
        if (res.rolesV2 === true && res.permissions) {
          localStorage.setItem('navRolePermissions', JSON.stringify({ rid: localStorage.getItem('selectedRestaurantId'), permissions: res.permissions }));
        } else {
          localStorage.removeItem('navRolePermissions');
        }
        setRoleBlocked(roleBlockedFromCache(pathname));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [ready, pathname]);

  // Auto-print: listen for Firebase RTDB events and print via postMessage bridge
  // This enables background auto-printing for orders from other devices
  useAutoPrint(restaurantId, printSettings);

  if (!ready) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{
          width: 32,
          height: 32,
          border: '3px solid #e5e7eb',
          borderTopColor: '#ef4444',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <CurrencyProvider>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        overflow: 'auto',
        paddingBottom: '0',
        // Hide scrollbar for cleaner WebView look
        WebkitOverflowScrolling: 'touch',
      }}>
        <style>{`
          /* Hide scrollbar in WebView */
          body { margin: 0; padding: 0; overflow-x: hidden; }
          body::-webkit-scrollbar { display: none; }
          /* Override any sidebar margin that pages might assume */
          .dashboard-page-content { animation: none !important; }
          /* Hide sidebar hamburger menu in mobile WebView */
          #sidebar-hamburger { display: none !important; }
          /* Inputs: base 16px (no !important) so inline styles can override for compact sizing */
          input, select, textarea { font-size: 16px; max-width: 100%; box-sizing: border-box; }
          /* Prevent iOS auto-zoom on focus — 16px !important only when focused */
          @supports (-webkit-touch-callout: none) {
            input:focus, select:focus, textarea:focus { font-size: 16px !important; }
          }
          /* Prevent iOS pinch-to-zoom and double-tap zoom */
          html { touch-action: manipulation; }
          * { -webkit-text-size-adjust: 100%; }
        `}</style>
        <ManagerPinPrompt />
        {roleBlocked ? (
          <div role="alert" style={{ padding: '48px 24px', textAlign: 'center', color: '#374151', fontSize: 15 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>You don’t have access to this page</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Ask the owner to allow it for your role in Admin → Roles.</div>
          </div>
        ) : children}
      </div>
    </CurrencyProvider>
  );
}
