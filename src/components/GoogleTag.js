'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { GA4_ID, ADS_ID, isWebBrowser } from '../lib/googleTag';

// Loads the Google tag on every web page (GA4 page views follow client-side navigation via
// GA4's history-change tracking). Not loaded inside the desktop/mobile apps.
export default function GoogleTag() {
  const [on, setOn] = useState(false);
  useEffect(() => { if (isWebBrowser()) setOn(true); }, []);
  if (!on) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" />
      <Script id="google-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA4_ID}');
          ${ADS_ID ? `gtag('config', '${ADS_ID}');` : ''}
        `}
      </Script>
    </>
  );
}
