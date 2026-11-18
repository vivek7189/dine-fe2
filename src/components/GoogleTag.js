'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { GA4_ID, ADS_ID, isWebBrowser } from '../lib/googleTag';
import { siteSection } from '../lib/siteSection';

// Loads the Google tag on every web page (not inside the desktop/mobile apps) and sends one page
// view per route, labelled with content_group / site_section = website / signup / app / customer
// (lib/siteSection.js), so website visitors can be counted apart from restaurant staff and guests.
// GA4's own page views can't carry the label, so they are off: send_page_view:false here, and in
// GA4 Admin → Data stream → Enhanced measurement → Page views → "Page changes based on browser
// history events" must be OFF, or every route change is counted twice.
let lastUrl = '';

function initGtag() {
  if (typeof window.gtag === 'function') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, { send_page_view: false });
  if (ADS_ID) window.gtag('config', ADS_ID);
}

function sendPageView(pathname) {
  const url = window.location.href;
  if (url === lastUrl) return;
  lastUrl = url;
  const section = siteSection(pathname);
  window.gtag('event', 'page_view', {
    page_location: url,
    page_title: document.title,
    content_group: section,
    site_section: section,
  });
}

export default function GoogleTag() {
  const [on, setOn] = useState(false);
  const pathname = usePathname();
  useEffect(() => { if (isWebBrowser()) { initGtag(); setOn(true); } }, []);
  // A short wait so the new page's <title> is in place before the page view goes out.
  useEffect(() => {
    if (!on) return undefined;
    const t = setTimeout(() => sendPageView(pathname), 100);
    return () => clearTimeout(t);
  }, [on, pathname]);
  if (!on) return null;
  // Commands queued above are sent as soon as gtag.js arrives.
  return <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />;
}
