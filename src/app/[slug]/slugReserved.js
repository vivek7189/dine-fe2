// Shared by the server check (page.js) and the client page (SlugClient.js).
// Reserved paths that should NOT be handled by this dynamic route
// These paths have their own dedicated pages/folders s
export const RESERVED_PATHS = [
  'admin', 'api', 'login', 'partner', 'logout', 'signup', 'register', 'dashboard', 'billing',
  'menu', 'orders', 'settings', 'profile', 'help', 'support', 'contact', 'about',
  'privacy', 'terms', 'blog', 'products', 'for', 'tools', 'restaurants', 'onlineorder',
  'placeorder', 'print-kot', 'setup', 'local-login', 'kot', 'orderhistory', 'customers',
  'offers', 'customer-app', 'tables', 'hotel', 'inventory', 'automation', 'analytics',
  'restaurant-pos-software-india', 'dineopenprintupload', 'dineai',
  'india', 'solutions', 'features', 'loyalty', 'pos', 'resources', 'compare', 'alternatives', 'glossary', 'pricing', 'security', 'refund',
  'book-space', 'spaces'
];

// Reserved paths that have a sub-route we should redirect to (e.g. /dineopenprintupload -> /dineopenprintupload/upload)
export const RESERVED_REDIRECTS = {
  dineopenprintupload: '/dineopenprintupload/upload'
};
