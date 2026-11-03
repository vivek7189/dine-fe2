import { notFound, redirect } from 'next/navigation';
import SlugClient from './SlugClient';
import { RESERVED_PATHS, RESERVED_REDIRECTS } from './slugReserved';

// dineopen.com/<restaurant-slug> → that restaurant's online ordering page.
// The slug is checked here on the server so unknown URLs get a real 404 status (not a 200 page
// that only says "not found" after loading). If the lookup can't run (API down / slow), we fall
// back to the old client-side lookup so a real restaurant's page never 404s because of a hiccup.
// Only an https API is trusted for this check (a local dev default like http://localhost:3003 could
// answer 404 for a real restaurant).
const ENV_API = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
const API = ENV_API.startsWith('https://') ? ENV_API : 'https://api.dineopen.com';

async function lookup(slug) {
  try {
    const res = await fetch(`${API}/api/public/restaurant-by-slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (res.status === 404) return { missing: true };
    if (!res.ok) return {};
    const data = await res.json();
    return data.restaurantId ? { id: data.restaurantId } : { missing: true };
  } catch {
    return {};
  }
}

export default async function RestaurantSlugPage({ params }) {
  const { slug } = await params;
  const s = String(slug || '').toLowerCase();
  if (RESERVED_REDIRECTS[s]) redirect(RESERVED_REDIRECTS[s]);
  if (!s || RESERVED_PATHS.includes(s) || s.includes('.')) notFound();

  const { id, missing } = await lookup(s);
  if (missing) notFound();
  return <SlugClient slug={slug} initialRestaurantId={id || null} />;
}
