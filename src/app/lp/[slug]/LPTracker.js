'use client';

import { useEffect } from 'react';
import { track } from '../../../lib/analytics';
import { gtagEvent } from '../../../lib/googleTag';

// Records CTA clicks on ad landing pages (trial vs WhatsApp) in PostHog and GA4.
export default function LPTracker({ slug }) {
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target.closest?.('[data-lp-cta]');
      if (!el) return;
      const cta = el.getAttribute('data-lp-cta');
      track('lp_cta_click', { slug, cta });
      gtagEvent(cta === 'whatsapp' ? 'whatsapp_click' : 'trial_click', { lp: slug });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [slug]);
  return null;
}
