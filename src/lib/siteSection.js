// Which part of dineopen.com a page belongs to, so visitor numbers can be split cleanly in
// Google Analytics (content group) and PostHog (site_section property):
//   website  – marketing pages, blog, pricing, landing pages, tools (people who might become customers)
//   signup   – login / sign-up / onboarding (the step between website and app)
//   app      – the logged-in POS and back office used by restaurant staff
//   customer – pages a restaurant's own guests open (QR menu, online order, bill, booking, review…)
// Anything not listed is treated as website, except a single unknown segment, which is a
// restaurant's ordering page (dineopen.com/<restaurant-slug>, see app/[slug]).

const APP = new Set([
  // src/app/(dashboard)/*
  'admin', 'analytics', 'announcements', 'attendance', 'audit-trail', 'automation', 'billing', 'bookings',
  'books', 'calendar', 'cancelled-orders', 'comp-report', 'customer-app', 'customers', 'dashboard', 'diary',
  'dineai', 'food-court', 'headquarters', 'home', 'hotel', 'hourly-report', 'inventory', 'invoice', 'kot',
  'meetings', 'menu', 'menu-engineering', 'more', 'my-meetings', 'my-pay', 'my-shifts', 'offers',
  'open-orders', 'orderhistory', 'parking', 'phone-agent', 'profile', 'promotion-report', 'register',
  'reprint-log', 'sales-summary', 'settings', 'shifts', 'shifts-cash', 'social-media', 'split-bills',
  'staff-requests', 'staff-sales', 'tables', 'voice', 'whatsapp-ordering',
  // other staff-only screens
  'setup', 'desktop-auth', 'local-login', 'dineopenprintupload', 'print-kot', 'mobile', 'kitchen-display',
  'my-stall', 'whatsapp', 'partner',
]);

const SIGNUP = new Set(['login', 'onboarding', 'onboard-login', 'reset-password', 'signup']);

const CUSTOMER = new Set([
  'placeorder', 'onlineorder', 'order-status', 'bill', 'f', 'track', 'token-display', 'customer-display',
  'book', 'book-space', 'feedback', 'review', 'statement', 'restaurants',
]);

// Top-level marketing folders (src/app/* and public/*). Only needed so a one-segment URL such as
// /pricing is not mistaken for a restaurant slug.
const WEBSITE = new Set([
  'about', 'alternatives', 'api-docs', 'best-restaurant-pos-india', 'best-restaurant-pos-usa-2026', 'blog',
  'canada', 'compare', 'corporate', 'features', 'for', 'free-restaurant-billing-software', 'glossary',
  'gst-billing-software-restaurant', 'hi', 'india', 'integrations', 'loyalty', 'lp', 'partners', 'pos',
  'pricing', 'privacy', 'products', 'qatar', 'refund', 'resources', 'restaurant-billing-app',
  'restaurant-pos-software-india', 'security', 'solutions', 'support', 'terms', 'tools', 'uk', 'usa', 'vs',
  'download', 'docs', 'contact', 'enterprise-pricing.html',
]);

export function siteSection(pathname) {
  const parts = String(pathname || '/').split('?')[0].split('/').filter(Boolean);
  if (!parts.length) return 'website';
  const first = parts[0].toLowerCase();
  // /spaces/availability/... is a wall display for guests; /spaces in the dashboard is the staff screen
  if (first === 'spaces') return parts[1] === 'availability' ? 'customer' : 'app';
  if (APP.has(first)) return 'app';
  if (SIGNUP.has(first)) return 'signup';
  if (CUSTOMER.has(first)) return 'customer';
  if (WEBSITE.has(first)) return 'website';
  if (parts.length === 1) return 'customer'; // dineopen.com/<restaurant-slug>
  return 'website';
}
