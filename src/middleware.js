import { NextResponse } from 'next/server';

// English static blog slugs (HTML files in public/blog/)
const staticBlogSlugs = new Set([
  'best-billing-software-small-restaurant',
  'best-catering-management-software-india',
  'best-free-pos-ice-cream-shop',
  'best-pos-system-ice-cream-shop',
  'best-pos-system-pizza-restaurant',
  'best-pos-system-restaurant-india',
  'best-restaurant-billing-app-india-2026',
  'best-restaurant-loyalty-program-software-india',
  'best-restaurant-pos-uae-dubai-2026',
  'best-restaurant-pos-uk-2026',
  'best-restaurant-software-india-2025',
  'best-restaurant-technology-2026',
  'chocolate-shop-pos-software-india',
  'cloud-kitchen-pos-petpooja-vs-urbanpiper-vs-dineopen',
  'cloud-kitchen-vs-restaurant-india',
  'cost-to-open-restaurant-india-2026',
  'dineopen-vs-posist-detailed-comparison',
  'food-cost-calculator-complete-guide',
  'food-waste-cost-management-cafe-restaurant',
  'free-qr-menu-maker-guide',
  'fssai-license-restaurant-complete-guide',
  'gelato-vs-ice-cream-parlour-business-guide',
  'gst-on-restaurant-india-guide',
  'how-to-calculate-food-cost-percentage',
  'how-to-hire-restaurant-staff-india',
  'how-to-register-restaurant-zomato-swiggy',
  'how-to-respond-negative-reviews-restaurant',
  'how-to-start-bakery-india',
  'how-to-start-cafe-coffee-shop-india',
  'how-to-start-catering-business-india',
  'how-to-start-chai-tapri-business',
  'how-to-start-dhaba-business-india',
  'how-to-start-food-truck-india',
  'how-to-start-ice-cream-parlour-india',
  'how-to-start-juice-bar-india',
  'how-to-start-qsr-india',
  'how-to-start-sweet-shop-india',
  'how-to-start-tiffin-service-india',
  'ice-cream-business-online-delivery-guide',
  'ice-cream-shop-inventory-management',
  'ice-cream-shop-menu-pricing-guide',
  'increase-footfall-2026',
  'kot-system-restaurant-complete-guide',
  'lpg-gas-crisis-restaurants-india-2026',
  'menu-engineering-guide-restaurants',
  'menu-pricing-management',
  'mudra-loan-restaurant-business-india',
  'petpooja-alternative-2026',
  'petpooja-alternative-free-2026',
  'petpooja-pricing-plans-2026',
  'petpooja-vs-slickpos-vs-dineopen-small-restaurant',
  'qr-code-menus-future-trend-2026',
  'reduce-zomato-swiggy-commission-restaurants',
  'restaurant-automation-software-guide',
  'restaurant-break-even-analysis-guide',
  'restaurant-cost-management-profit',
  'restaurant-efficiency-digital-tools',
  'restaurant-grand-opening-marketing-plan',
  'restaurant-instagram-marketing-guide',
  'restaurant-inventory-sheet',
  'restaurant-kitchen-hygiene-checklist',
  'restaurant-loyalty-program-guide',
  'restaurant-marketing-ideas-india',
  'restaurant-menu-pricing-formula-guide',
  'restaurant-profit-margins-india-guide',
  'restaurant-technology-trends-2024',
  'restaurant-technology-trends-2026',
  'swiggy-zomato-commission-calculator-guide',
  'what-is-restaurant-operating-system',
]);

// Hindi static blog slugs (HTML files in public/hi/blog/)
const hindiStaticBlogSlugs = new Set([
  'bakery-kaise-khole',
  'best-restaurant-pos-india-hindi',
  'cafe-coffee-shop-kaise-khole',
  'catering-business-kaise-shuru-kare',
  'chai-tapri-business-kaise-shuru-kare',
  'chhote-restaurant-ke-liye-billing-software',
  'chocolate-shop-pos-software-hindi',
  'cloud-kitchen-ya-restaurant-kya-behtar',
  'dhaba-business-kaise-shuru-kare',
  'dineopen-vs-posist-comparison-hindi',
  'food-cost-percentage-kaise-nikale',
  'food-truck-business-kaise-shuru-kare',
  'free-qr-menu-kaise-banaye',
  'fssai-license-kaise-banaye',
  'ice-cream-dukan-inventory-management',
  'ice-cream-parlour-kaise-khole',
  'ice-cream-parlour-ke-liye-best-pos',
  'juice-bar-kaise-khole',
  'lpg-gas-shortage-restaurant-crisis-2026',
  'mithai-dukan-kaise-khole',
  'petpooja-alternative-hindi',
  'qr-menu-future-trend-hindi-2026',
  'qsr-kaise-khole',
  'restaurant-automation-software-hindi',
  'restaurant-break-even-kaise-calculate-kare',
  'restaurant-gst-guide-hindi',
  'restaurant-loyalty-program-hindi',
  'restaurant-marketing-ideas-hindi',
  'restaurant-technology-trends-hindi-2026',
  'swiggy-zomato-commission-kaise-bachaye',
  'tiffin-service-kaise-shuru-kare',
  'zomato-swiggy-par-restaurant-kaise-register-kare',
]);

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Rewrite /blog/slug → /blog/slug.html for static English blog posts
  if (pathname.startsWith('/blog/') && !pathname.endsWith('.html')) {
    const slug = pathname.replace('/blog/', '');
    if (staticBlogSlugs.has(slug)) {
      return NextResponse.rewrite(new URL(`/blog/${slug}.html`, request.url));
    }
  }

  // Rewrite /hi/blog/slug → /hi/blog/slug.html for static Hindi blog posts
  if (pathname.startsWith('/hi/blog/') && !pathname.endsWith('.html')) {
    const slug = pathname.replace('/hi/blog/', '');
    if (hindiStaticBlogSlugs.has(slug)) {
      return NextResponse.rewrite(new URL(`/hi/blog/${slug}.html`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/blog/:slug*', '/hi/blog/:slug*'],
};
