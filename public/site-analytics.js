/* DineOpen visitor counting for the static HTML pages (blog, Hindi blog, product pages).
   Same Google Analytics property and PostHog project as the Next.js pages, tagged
   site_section = "website" so these visitors are counted with the rest of the public site.
   Included with: <script src="/site-analytics.js" defer></script> */
(function () {
  if (window.__dineSiteAnalytics) return;
  window.__dineSiteAnalytics = true;
  var GA4_ID = 'G-ZW28WXCLTF';
  var PH_KEY = 'phc_AdmCxAj5txqYAeyrgxsphiwW5sfyJ6h8tFW2ycZU9vnN';
  var PH_HOST = 'https://us.i.posthog.com';
  var SECTION = 'website';

  // Google Analytics 4 — one page view, content group "website".
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA4_ID, { send_page_view: false });
  window.gtag('event', 'page_view', {
    page_location: location.href, page_title: document.title,
    content_group: SECTION, site_section: SECTION
  });
  var g = document.createElement('script');
  g.async = true;
  g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
  document.head.appendChild(g);

  // PostHog — official loader snippet (queues calls until array.js arrives).
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once unregister identify alias reset get_distinct_id people.set opt_out_capturing opt_in_capturing".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  window.posthog.init(PH_KEY, {
    api_host: PH_HOST,
    persistence: 'localStorage',   // same as the Next.js pages, so a visitor keeps one id across both
    capture_pageview: false,       // sent below, after site_section is set
    capture_pageleave: true,
    autocapture: true,
    disable_session_recording: true
  });
  window.posthog.register({ site_section: SECTION });
  window.posthog.capture('$pageview');
})();
