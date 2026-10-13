// Google tag (GA4 + optional Google Ads). GA4 key events (sign_up, generate_lead, purchase)
// can be imported into Google Ads as conversions; if a Google Ads ID + conversion label are
// set, sign-ups are also sent straight to Ads. Web only — skipped in Electron/Capacitor apps.
export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || 'G-ZW28WXCLTF';
export const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '';                       // e.g. AW-1234567890
export const ADS_SIGNUP_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL || '';   // e.g. AbC-D_efG
export const ADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL || '';

export const isWebBrowser = () => typeof window !== 'undefined'
  && !window.electronAPI && !window.Capacitor?.isNativePlatform?.();

export function gtagEvent(name, params = {}) {
  if (!isWebBrowser() || typeof window.gtag !== 'function') return;
  try { window.gtag('event', name, params); } catch { /* analytics must never break the app */ }
}

export function gtagAdsConversion(label, params = {}) {
  if (!ADS_ID || !label) return;
  gtagEvent('conversion', { send_to: `${ADS_ID}/${label}`, ...params });
}
