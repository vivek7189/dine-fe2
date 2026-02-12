import StatePOSClient from '../StatePOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Maharashtra | Mumbai, Pune, Nagpur | DineOpen',
  description: 'Best restaurant POS software for Maharashtra restaurants. GST billing, Marathi voice ordering, Zomato/Swiggy integration. Trusted by 15,000+ restaurants in Mumbai, Pune, Nagpur.',
  keywords: 'restaurant POS Maharashtra, billing software Mumbai, restaurant management Pune, GST billing Maharashtra, Marathi POS, restaurant software Nagpur',
  openGraph: {
    title: 'Restaurant POS Software Maharashtra | DineOpen',
    description: 'Top-rated restaurant POS for Maharashtra. GST billing, Marathi support, delivery integration.',
    url: 'https://www.dineopen.com/india/maharashtra',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/india/maharashtra',
  },
};

export default function MaharashtraPage() {
  const stateData = {
    state: 'Maharashtra',
    tagline: 'Trusted by 15,000+ restaurants across Mumbai, Pune, Nagpur & more',
    description: 'GST-compliant billing with Maharashtra state codes, Marathi voice ordering, works offline during monsoons. Perfect for vada pav stalls to fine dining.',
    highlights: [
      'GST billing with Maharashtra GSTIN support',
      'Marathi voice ordering & menu display',
      'Works offline during monsoon power cuts',
      'Zomato & Swiggy direct integration',
      'UPI, GPay, PhonePe payments',
      'Multi-outlet management for chains',
    ],
    cities: [
      { name: 'Mumbai', href: '/pos/mumbai', restaurants: '10,000+ restaurants' },
      { name: 'Pune', href: '/pos/pune', restaurants: '4,000+ restaurants' },
      { name: 'Nagpur', href: '/pos/nagpur', restaurants: '900+ restaurants' },
      { name: 'Nashik', href: '/pos/nashik', restaurants: '600+ restaurants' },
      { name: 'Thane', href: '/pos/thane', restaurants: '1,200+ restaurants' },
      { name: 'Aurangabad', href: '/pos/aurangabad', restaurants: '400+ restaurants' },
    ],
    localFeatures: [
      { title: 'Marathi Language Support', desc: 'Complete menu and ordering in Marathi. Staff can take voice orders in Marathi.' },
      { title: 'Maharashtra GST Compliance', desc: 'Auto-generate GST invoices with correct state codes. GSTR-1 ready reports.' },
      { title: 'Monsoon-Proof Offline Mode', desc: 'Keep billing during power cuts. Auto-syncs when connection restores.' },
      { title: 'Festival Menu Management', desc: 'Special menus for Ganesh Chaturthi, Diwali. Handle 5x rush smoothly.' },
    ],
    industries: [
      { name: 'Vada Pav Stalls', href: '/for/street-food', desc: 'Quick billing for fast food' },
      { name: 'Maharashtrian Thali', href: '/for/thali-restaurants', desc: 'Unlimited thali management' },
      { name: 'Irani Cafes', href: '/for/cafes', desc: 'Classic Bombay cafes' },
      { name: 'Fine Dining', href: '/for/fine-dining', desc: 'Premium restaurants' },
      { name: 'Cloud Kitchens', href: '/for/cloud-kitchens', desc: 'Delivery-only kitchens' },
      { name: 'Bars & Pubs', href: '/for/bars-pubs', desc: 'Nightlife venues' },
    ],
    testimonial: {
      quote: 'We have 5 outlets across Mumbai suburbs. DineOpen helps us manage all from one dashboard. The Marathi voice ordering feature is loved by our staff. GST filing is now a breeze.',
      author: 'Sachin Patil',
      business: 'Swaad Restaurant Chain, Mumbai',
    },
    compliance: [
      { name: 'Maharashtra FSSAI Guide', href: '/resources/fssai-registration' },
      { name: 'GST for Restaurants', href: '/resources/gst-restaurants' },
      { name: 'Shop & Establishment Act', href: '/resources/shop-establishment-act' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Maharashtra",
    "description": "Restaurant POS software for Maharashtra restaurants with GST billing and Marathi language support.",
    "url": "https://www.dineopen.com/india/maharashtra",
    "areaServed": { "@type": "State", "name": "Maharashtra", "containedInPlace": { "@type": "Country", "name": "India" } },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <StatePOSClient stateData={stateData} />
    </>
  );
}
