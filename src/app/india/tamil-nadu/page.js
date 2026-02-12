import StatePOSClient from '../StatePOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Tamil Nadu | Chennai, Coimbatore | DineOpen',
  description: 'Best restaurant POS software for Tamil Nadu restaurants. GST billing, Tamil voice ordering, Zomato/Swiggy integration. Trusted by 8,000+ restaurants in Chennai, Coimbatore, Madurai.',
  keywords: 'restaurant POS Tamil Nadu, billing software Chennai, restaurant management Coimbatore, GST billing Tamil Nadu, Tamil POS, restaurant software Madurai',
  openGraph: {
    title: 'Restaurant POS Software Tamil Nadu | DineOpen',
    description: 'Top-rated restaurant POS for Tamil Nadu. GST billing, Tamil support, delivery integration.',
    url: 'https://www.dineopen.com/india/tamil-nadu',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/india/tamil-nadu',
  },
};

export default function TamilNaduPage() {
  const stateData = {
    state: 'Tamil Nadu',
    tagline: 'Trusted by 8,000+ restaurants across Chennai, Coimbatore, Madurai & more',
    description: 'GST-compliant billing, Tamil voice ordering, perfect for Chettinad cuisine and filter coffee shops. From mess to fine dining.',
    highlights: [
      'GST billing with Tamil Nadu GSTIN support',
      'Tamil voice ordering & menu display',
      'Meals/Mess combo management',
      'Zomato & Swiggy direct integration',
      'UPI, GPay, PhonePe payments',
      'Banana leaf meals tracking',
    ],
    cities: [
      { name: 'Chennai', href: '/pos/chennai', restaurants: '5,000+ restaurants' },
      { name: 'Coimbatore', href: '/pos/coimbatore', restaurants: '800+ restaurants' },
      { name: 'Madurai', href: '/pos/madurai', restaurants: '600+ restaurants' },
      { name: 'Trichy', href: '/pos/trichy', restaurants: '400+ restaurants' },
      { name: 'Salem', href: '/pos/salem', restaurants: '300+ restaurants' },
    ],
    localFeatures: [
      { title: 'Tamil Language Support', desc: 'Complete menu and ordering in Tamil. Staff can take voice orders in Tamil.' },
      { title: 'Meals Combo Management', desc: 'Unlimited meals with rice, sambar, rasam tracking. Auto-refill management.' },
      { title: 'Filter Coffee by Tumbler', desc: 'Track filter coffee servings. Decoction inventory management.' },
      { title: 'Chettinad Cuisine Support', desc: 'Spice level variants, special Chettinad combos, portion management.' },
    ],
    industries: [
      { name: 'South Indian', href: '/for/south-indian-restaurants', desc: 'Authentic TN cuisine' },
      { name: 'Mess/Meals', href: '/for/thali-restaurants', desc: 'Unlimited meals' },
      { name: 'Chettinad', href: '/for/indian-restaurants', desc: 'Spicy Chettinad food' },
      { name: 'Filter Coffee Shops', href: '/for/cafes', desc: 'Traditional coffee' },
      { name: 'Biryanis', href: '/for/biryani-restaurants', desc: 'Ambur, Dindigul style' },
      { name: 'Sweet Shops', href: '/for/sweet-shops', desc: 'Mysore pak, halwa' },
    ],
    testimonial: {
      quote: 'Our mess serves 300 meals daily. DineOpen handles unlimited meals perfectly - tracks every refill. Tamil menu makes billing fast.',
      author: 'Murugan Shanmugam',
      business: 'Annapoorna Mess, Chennai',
    },
    compliance: [
      { name: 'Tamil Nadu FSSAI Guide', href: '/resources/fssai-registration' },
      { name: 'GST for Restaurants', href: '/resources/gst-restaurants' },
      { name: 'Shop & Establishment Act', href: '/resources/shop-establishment-act' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Tamil Nadu",
    "description": "Restaurant POS software for Tamil Nadu restaurants with GST billing and Tamil language support.",
    "url": "https://www.dineopen.com/india/tamil-nadu",
    "areaServed": { "@type": "State", "name": "Tamil Nadu", "containedInPlace": { "@type": "Country", "name": "India" } },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <StatePOSClient stateData={stateData} />
    </>
  );
}
