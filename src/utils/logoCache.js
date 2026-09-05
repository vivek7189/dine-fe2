// Receipt-logo cache → base64 data-URI.
//
// The receipt logo is uploaded to cloud Storage and stored as a remote URL. That
// URL prints fine in a browser (window.print) when online, but:
//   • thermal / native printers (Capacitor, RN, ESC/POS) can't fetch a remote URL
//     at all, so the logo silently drops; and
//   • the local-server app printing OFFLINE can't reach the URL either.
// So for native prints we fetch the logo once (while online), cache the data-URI in
// localStorage, and embed it into the bill HTML — then it prints on thermal printers
// and offline, with no network at print time.

const KEY = (url) => `dineopen_logo_cache:${url}`;
const MAX_BYTES = 1_500_000; // ~1.5MB cap so a big logo can't blow the localStorage quota

/** Sync read of a previously-cached data-URI for this logo URL (or null). */
export function getCachedLogoDataUri(url) {
  if (!url || typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(KEY(url)) || null; } catch (_) { return null; }
}

async function fetchAsDataUri(url) {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`logo fetch ${res.status}`);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onloadend = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error || new Error('logo read failed'));
    fr.readAsDataURL(blob);
  });
}

/**
 * Resolve a logo URL to a base64 data-URI: cached if present, else fetch + cache
 * (needs network). Returns null on failure (offline + not cached) so callers fall
 * back to the original URL. Already-data-URI values pass straight through.
 */
export async function ensureLogoDataUri(url) {
  if (!url || typeof window === 'undefined') return null;
  if (typeof url === 'string' && url.startsWith('data:')) return url;
  const cached = getCachedLogoDataUri(url);
  if (cached) return cached;
  try {
    const dataUri = await fetchAsDataUri(url);
    if (dataUri && dataUri.length <= MAX_BYTES) {
      try { window.localStorage.setItem(KEY(url), dataUri); } catch (_) { /* quota — still return it */ }
    }
    return dataUri || null;
  } catch (_) {
    return null;
  }
}

/** Fire-and-forget prime — call when print settings load (online) so the first
 *  offline/thermal print already has the logo cached. */
export function primeLogoCache(url) {
  if (!url || typeof url !== 'string' || url.startsWith('data:')) return;
  if (getCachedLogoDataUri(url)) return;
  ensureLogoDataUri(url).catch(() => {});
}
