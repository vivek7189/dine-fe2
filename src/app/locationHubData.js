// Shared builder for US-state / UK-city / Canada-province location pages.
// The heavy, country-common parts (payments, delivery, verticals, guides,
// competitors, pricing) live here once; each location page passes only its
// unique bits (hero, stats, local tax/compliance, FAQs). Rendered through the
// shared CountryHubClient so location pages stay consistent and non-duplicative.

const COUNTRY_COMMON = {
  usa: {
    label: 'US',
    flag: '🇺🇸',
    competitors: 'Toast, Square & Clover',
    priceLine: 'from $10/month',
    hub: '/usa',
    posLinkLabel: 'Back to US restaurant POS',
    payments: ['Visa, Mastercard, Amex & Discover', 'Apple Pay & Google Pay (tap-to-pay)', 'Cash App Pay & Venmo', 'Split checks, tips & pre-auth tabs'],
    delivery: ['DoorDash, Uber Eats & Grubhub', 'ChowNow & direct online ordering', 'QR-code dine-in ordering', 'QuickBooks & Xero export'],
    verticals: [
      { name: 'Bars & Pubs', href: '/for/bars-pubs', desc: 'Tabs, pre-auth, tip-out' },
      { name: 'Cafes & Coffee', href: '/for/cafes', desc: 'Fast counter service' },
      { name: 'Food Trucks', href: '/for/food-trucks', desc: 'Mobile, offline-ready' },
      { name: 'QSR & Fast Casual', href: '/for/qsr', desc: 'Speed of service' },
      { name: 'Fine Dining', href: '/for/fine-dining', desc: 'Coursing & seat maps' },
      { name: 'Pizza Shops', href: '/for/pizza-shops', desc: 'Modifiers & delivery' },
      { name: 'Cloud Kitchens', href: '/for/cloud-kitchens', desc: 'Delivery-only ops' },
      { name: 'Bakeries', href: '/for/bakeries', desc: 'Counter + pre-orders' },
    ],
    guides: [
      { name: 'US restaurant POS hub', href: '/usa', desc: 'All US guides & pricing' },
      { name: 'Best Free Restaurant POS USA (2026)', href: '/blog/best-free-restaurant-pos-usa-2026', desc: 'Toast, Square, Clover compared' },
      { name: 'US Sales Tax Guide', href: '/blog/restaurant-sales-tax-guide-usa-2026', desc: 'By state, on the POS' },
      { name: 'DineOpen vs Toast', href: '/vs/dineopen-vs-toast', desc: 'Comparison' },
      { name: 'US Sales Tax Calculator', href: '/tools/sales-tax-calculator', desc: 'Free tool' },
      { name: 'Tip Calculator', href: '/tools/tip-calculator', desc: 'Free tool' },
      { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', desc: 'Free tool' },
    ],
  },
  uk: {
    label: 'UK',
    flag: '🇬🇧',
    competitors: 'EPOS Now, Lightspeed & Square',
    priceLine: 'from £8/month',
    hub: '/uk',
    posLinkLabel: 'Back to UK restaurant EPOS',
    payments: ['Chip & PIN + contactless', 'Apple Pay & Google Pay', 'Visa, Mastercard & Amex', 'Split bills, service charge & tronc'],
    delivery: ['Deliveroo, Just Eat & Uber Eats', 'Direct QR-code & online ordering', 'Kitchen display & KOT printing', 'Xero accounting export'],
    verticals: [
      { name: 'Pubs & Breweries', href: '/for/pubs-breweries', desc: 'Tabs & table service' },
      { name: 'Bars & Pubs', href: '/for/bars-pubs', desc: 'Fast rounds & tronc' },
      { name: 'Cafes & Coffee', href: '/for/cafes', desc: 'Counter service' },
      { name: 'Indian Takeaways', href: '/for/qsr', desc: 'Collection & delivery' },
      { name: 'Fine Dining', href: '/for/fine-dining', desc: 'Coursing & seat maps' },
      { name: 'Food Trucks', href: '/for/food-trucks', desc: 'Mobile & offline' },
      { name: 'Cloud Kitchens', href: '/for/cloud-kitchens', desc: 'Delivery-only' },
      { name: 'Bakeries', href: '/for/bakeries', desc: 'Counter + pre-orders' },
    ],
    guides: [
      { name: 'UK restaurant EPOS hub', href: '/uk', desc: 'All UK guides & pricing' },
      { name: 'Best Restaurant EPOS UK (2026)', href: '/blog/best-restaurant-pos-uk-2026', desc: 'Compared for UK venues' },
      { name: 'Best EPOS for Pubs (2026)', href: '/blog/best-pos-system-pubs-uk-2026', desc: 'Tabs, tronc, service' },
      { name: 'DineOpen vs Square', href: '/vs/dineopen-vs-square', desc: 'Comparison' },
      { name: 'UK VAT Calculator', href: '/tools/vat-calculator', desc: 'Free tool' },
      { name: 'Free QR Menu for UK Restaurants', href: '/blog/free-qr-code-menu-uk-restaurants', desc: 'Free tool + guide' },
      { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', desc: 'Free tool' },
    ],
  },
  canada: {
    label: 'Canada',
    flag: '🇨🇦',
    competitors: 'Lightspeed, TouchBistro & Square',
    priceLine: 'from C$14/month',
    hub: '/canada',
    posLinkLabel: 'Back to Canada restaurant POS',
    payments: ['Interac Debit & tap', 'Visa, Mastercard & Amex', 'Apple Pay & Google Pay', 'Split bills, tips & pre-auth tabs'],
    delivery: ['SkipTheDishes, Uber Eats & DoorDash', 'Direct QR-code & online ordering', 'Kitchen display & KOT printing', 'QuickBooks & Xero export'],
    verticals: [
      { name: 'Bars & Pubs', href: '/for/bars-pubs', desc: 'Tabs & tip-out' },
      { name: 'Pubs & Breweries', href: '/for/pubs-breweries', desc: 'Taproom service' },
      { name: 'Cafes & Coffee', href: '/for/cafes', desc: 'Counter service' },
      { name: 'QSR & Fast Casual', href: '/for/qsr', desc: 'Speed of service' },
      { name: 'Fine Dining', href: '/for/fine-dining', desc: 'Coursing & seat maps' },
      { name: 'Food Trucks', href: '/for/food-trucks', desc: 'Mobile & offline' },
      { name: 'Cloud Kitchens', href: '/for/cloud-kitchens', desc: 'Delivery-only' },
      { name: 'Bakeries', href: '/for/bakeries', desc: 'Counter + pre-orders' },
    ],
    guides: [
      { name: 'Canada restaurant POS hub', href: '/canada', desc: 'All Canada guides & pricing' },
      { name: 'Best Restaurant POS Canada (2026)', href: '/blog/best-restaurant-pos-canada-2026', desc: 'Compared for Canada' },
      { name: 'Delivery Commission Comparison (Canada)', href: '/blog/food-delivery-commission-comparison-canada-2026', desc: 'Skip vs Uber vs DoorDash' },
      { name: 'DineOpen vs Lightspeed', href: '/vs/dineopen-vs-lightspeed', desc: 'Comparison' },
      { name: 'Canada GST/HST Calculator', href: '/tools/gst-hst-calculator', desc: 'Free tool' },
      { name: 'TouchBistro Alternatives', href: '/alternatives/touchbistro', desc: 'Cheaper options' },
      { name: 'Food Cost Calculator', href: '/tools/food-cost-calculator', desc: 'Free tool' },
    ],
  },
};

// Build the full CountryHubClient data object for a location page.
// `loc` = { slug, name, hero, stats, compliance, faqs }
export function buildLocationData(countryKey, loc) {
  const c = COUNTRY_COMMON[countryKey];
  return {
    slug: `${countryKey}/${loc.slug}`,
    countryName: loc.name, // drives "Built for {name} restaurants" headings
    flag: c.flag,
    competitors: c.competitors,
    priceLine: c.priceLine,
    posLink: c.hub,
    posLinkLabel: c.posLinkLabel,
    hero: loc.hero,
    stats: loc.stats,
    compliance: loc.compliance,
    payments: c.payments,
    delivery: c.delivery,
    verticals: c.verticals,
    guides: c.guides,
    faqs: loc.faqs,
    // no `locations` field → the locations grid is omitted on sub-pages
  };
}

export { COUNTRY_COMMON };
