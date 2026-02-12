import StatePOSClient from '../StatePOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Gujarat | Ahmedabad, Surat, Vadodara | DineOpen',
  description: 'Best restaurant POS software for Gujarat restaurants. GST billing, Gujarati voice ordering, Zomato/Swiggy integration. Trusted by 6,000+ restaurants in Ahmedabad, Surat, Vadodara.',
  keywords: 'restaurant POS Gujarat, billing software Ahmedabad, restaurant management Surat, GST billing Gujarat, Gujarati POS, restaurant software Vadodara',
  openGraph: {
    title: 'Restaurant POS Software Gujarat | DineOpen',
    description: 'Top-rated restaurant POS for Gujarat. GST billing, Gujarati support, delivery integration.',
    url: 'https://www.dineopen.com/india/gujarat',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/india/gujarat',
  },
};

export default function GujaratPage() {
  const stateData = {
    state: 'Gujarat',
    tagline: 'Trusted by 6,000+ restaurants across Ahmedabad, Surat, Vadodara & more',
    description: 'GST-compliant billing, Gujarati voice ordering, perfect for thali restaurants and farsan shops. From kathiyawadi to Jain food.',
    highlights: [
      'GST billing with Gujarat GSTIN support',
      'Gujarati voice ordering & menu display',
      'Unlimited thali management',
      'Jain food labeling & filtering',
      'UPI, GPay, PhonePe payments',
      'Farsan shop quick billing',
    ],
    cities: [
      { name: 'Ahmedabad', href: '/pos/ahmedabad', restaurants: '3,000+ restaurants' },
      { name: 'Surat', href: '/pos/surat', restaurants: '1,500+ restaurants' },
      { name: 'Vadodara', href: '/pos/vadodara', restaurants: '800+ restaurants' },
      { name: 'Rajkot', href: '/pos/rajkot', restaurants: '500+ restaurants' },
      { name: 'Gandhinagar', href: '/pos/gandhinagar', restaurants: '300+ restaurants' },
    ],
    localFeatures: [
      { title: 'Gujarati Language Support', desc: 'Complete menu and ordering in Gujarati. Voice orders in Gujarati.' },
      { title: 'Unlimited Thali Mode', desc: 'Perfect for Gujarati thali restaurants. Track every refill, manage serving.' },
      { title: 'Jain Food Management', desc: 'Clear Jain/Non-Jain labeling. Separate kitchen orders. No onion-garlic filter.' },
      { title: 'Farsan Quick Billing', desc: 'Fast weight-based billing for farsan shops. Combo packs, festival specials.' },
    ],
    industries: [
      { name: 'Gujarati Thali', href: '/for/thali-restaurants', desc: 'Unlimited thali restaurants' },
      { name: 'Kathiyawadi', href: '/for/indian-restaurants', desc: 'Spicy Kathiyawadi food' },
      { name: 'Farsan Shops', href: '/for/street-food', desc: 'Snacks and namkeen' },
      { name: 'Mithai Shops', href: '/for/mithai-shops', desc: 'Gujarati sweets' },
      { name: 'Jain Restaurants', href: '/for/indian-restaurants', desc: 'Pure Jain food' },
      { name: 'Cafes', href: '/for/cafes', desc: 'Modern cafes' },
    ],
    testimonial: {
      quote: 'Our unlimited thali restaurant serves 400 customers daily. DineOpen tracks every sabzi refill perfectly. Gujarati menu makes staff training easy.',
      author: 'Bhavesh Patel',
      business: 'Rajwadi Thali House, Ahmedabad',
    },
    compliance: [
      { name: 'Gujarat FSSAI Guide', href: '/resources/fssai-registration' },
      { name: 'GST for Restaurants', href: '/resources/gst-restaurants' },
      { name: 'Shop & Establishment Act', href: '/resources/shop-establishment-act' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Gujarat",
    "description": "Restaurant POS software for Gujarat restaurants with GST billing and Gujarati language support.",
    "url": "https://www.dineopen.com/india/gujarat",
    "areaServed": { "@type": "State", "name": "Gujarat", "containedInPlace": { "@type": "Country", "name": "India" } },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <StatePOSClient stateData={stateData} />
    </>
  );
}
