'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

// Initialize PostHog once (client-side only, skip if no key)
if (typeof window !== 'undefined' && !window.__posthogInitialized && POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // We capture manually for SPA navigation
    capture_pageleave: true, // Track when users leave pages (drop-off)
    autocapture: true, // Auto-capture clicks, form submissions, etc.
    session_recording: {
      recordCrossOriginIframes: false,
    },
    persistence: 'localStorage',
    capture_exceptions: true, // JS errors show up in PostHog (and the daily report)
    // Replays start only for logged-in users and the login/onboarding pages (see
    // PostHogPageView) — recording every marketing visit used up the replay quota.
    disable_session_recording: true,
  });
  window.__posthogInitialized = true;
}

// Track page views on route change
function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!ph || typeof window === 'undefined' || window.electronAPI) return;
    let user = null;
    try { user = JSON.parse(localStorage.getItem('user') || 'null'); } catch { /* ignore */ }
    const loggedIn = !!(user && localStorage.getItem('authToken'));
    // Tie the session to the logged-in owner/staff (IDs and role only, no contact details).
    const id = user && (user.id || user.userId || user._id || user.uid);
    if (loggedIn && id && ph.get_distinct_id() !== String(id)) {
      ph.identify(String(id), { role: user.role || null, restaurant_id: user.restaurantId || null });
    }
    const journeyPage = /^\/(login|onboard|onboarding|signup|setup)(\/|$)/.test(pathname || '');
    if ((loggedIn || journeyPage) && !ph.sessionRecordingStarted()) ph.startSessionRecording();
  }, [pathname, ph]);

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      const search = searchParams?.toString();
      if (search) url += '?' + search;
      ph.capture('$pageview', { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

export default function PostHogProviderWrapper({ children }) {
  // Skip PostHog entirely on Electron (local POS doesn't need web analytics)
  if (typeof window !== 'undefined' && window.electronAPI) {
    return children;
  }

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  );
}
