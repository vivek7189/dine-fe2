import { NextResponse } from 'next/server';
import { HINDI_STATIC_BLOG_SLUGS, CLEAN_CANONICAL_BLOG_SLUGS } from './lib/blogSlugs.mjs';

// English static blog slugs (HTML files in public/blog/)

// Hindi static blog slugs (HTML files in public/hi/blog/)
const hindiStaticBlogSlugs = new Set(HINDI_STATIC_BLOG_SLUGS);

// English static posts whose <link rel="canonical"> is the clean URL (no .html).
// Their .html address 308-redirects to the clean one so Google sees a single URL.
// (All Hindi posts are canonical-clean too.) Posts whose canonical is the .html
// URL are left alone — those .html URLs are what Google has indexed.
const cleanCanonicalBlogSlugs = new Set(CLEAN_CANONICAL_BLOG_SLUGS);

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Single URL per post: /blog/<slug>.html → /blog/<slug> (canonical-clean posts), /hi/blog/<slug>.html → /hi/blog/<slug>
  const htmlPost = pathname.match(/^\/(hi\/)?blog\/([a-z0-9-]+)\.html$/);
  if (htmlPost && (htmlPost[1] ? hindiStaticBlogSlugs.has(htmlPost[2]) : cleanCanonicalBlogSlugs.has(htmlPost[2]))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(0, -'.html'.length);
    return NextResponse.redirect(url, 308);
  }

  // --- Geo detection: the visitor's country header → cookie ---
  // Vercel sends x-vercel-ip-country; on the AWS box behind Cloudflare's proxy it's cf-ipcountry.
  // Without either (local dev, DNS-only Cloudflare) no cookie is set and the client falls back to
  // the browser timezone / language (lib/detectCountry).
  let response = null;
  const rawGeo = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || '';
  const geoCountry = /^[A-Za-z]{2}$/.test(rawGeo) && !/^(XX|T1)$/i.test(rawGeo) ? rawGeo : null;
  if (geoCountry) {
    response = NextResponse.next();
    response.cookies.set('geo_country', geoCountry.toUpperCase(), {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax',
    });
  }

  // /blog/<slug> and /hi/blog/<slug> → the static .html files are rewritten in next.config.mjs
  // (beforeFiles). A middleware rewrite turns into an external proxy behind Caddy on the AWS box → 500.

  return response || NextResponse.next();
}

export const config = {
  // Match app pages + blog rewrites. Blog slugs need rewrites; app pages need geo cookie.
  matcher: [
    '/',
    '/blog/:slug*',
    '/hi/blog/:slug*',
    '/partners',
    '/login',
    '/local-login',
    '/onboard-login',
    '/onboarding',
    '/home',
    '/dashboard/:path*',
    '/menu/:path*',
    '/orders/:path*',
    '/admin/:path*',
    '/customers/:path*',
    '/billing/:path*',
    '/inventory/:path*',
  ],
};
