import StatePOSClient from '../StatePOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Karnataka | Bangalore, Mysore | DineOpen',
  description: 'Best restaurant POS software for Karnataka restaurants. GST billing, Kannada voice ordering, Zomato/Swiggy integration. Trusted by 10,000+ restaurants in Bangalore, Mysore, Mangalore.',
  keywords: 'restaurant POS Karnataka, billing software Bangalore, restaurant management Mysore, GST billing Karnataka, Kannada POS, restaurant software Mangalore',
  openGraph: {
    title: 'Restaurant POS Software Karnataka | DineOpen',
    description: 'Top-rated restaurant POS for Karnataka. GST billing, Kannada support, delivery integration.',
    url: 'https://www.dineopen.com/india/karnataka',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/india/karnataka',
  },
};

export default function KarnatakaPage() {
  const stateData = {
    state: 'Karnataka',
    tagline: 'Trusted by 10,000+ restaurants across Bangalore, Mysore, Mangalore & more',
    description: 'GST-compliant billing, Kannada voice ordering, perfect for South Indian cuisine. From darshinis to tech park food courts.',
    highlights: [
      'GST billing with Karnataka GSTIN support',
      'Kannada voice ordering & menu display',
      'Darshini quick-service mode',
      'Zomato & Swiggy direct integration',
      'UPI, GPay, PhonePe payments',
      'Tech park food court support',
    ],
    cities: [
      { name: 'Bangalore', href: '/pos/bangalore', restaurants: '7,000+ restaurants' },
      { name: 'Mysore', href: '/pos/mysore', restaurants: '800+ restaurants' },
      { name: 'Mangalore', href: '/pos/mangalore', restaurants: '600+ restaurants' },
      { name: 'Hubli', href: '/pos/hubli', restaurants: '400+ restaurants' },
      { name: 'Belgaum', href: '/pos/belgaum', restaurants: '300+ restaurants' },
    ],
    localFeatures: [
      { title: 'Kannada Language Support', desc: 'Complete menu and ordering in Kannada. Voice orders in Kannada language.' },
      { title: 'Darshini Quick Mode', desc: 'Fast token-based billing for self-service restaurants. Handle breakfast rush.' },
      { title: 'Filter Coffee Tracking', desc: 'Track filter coffee by cup/liter. Auto-refill alerts for decoction.' },
      { title: 'Tech Park Integration', desc: 'Corporate billing, bulk orders, employee meal cards supported.' },
    ],
    industries: [
      { name: 'South Indian', href: '/for/south-indian-restaurants', desc: 'Dosa, idli, filter coffee' },
      { name: 'Darshinis', href: '/for/qsr', desc: 'Self-service restaurants' },
      { name: 'Udupi Hotels', href: '/for/indian-restaurants', desc: 'Traditional Karnataka cuisine' },
      { name: 'Cafes', href: '/for/cafes', desc: 'Bangalore coffee culture' },
      { name: 'Cloud Kitchens', href: '/for/cloud-kitchens', desc: 'Delivery-only kitchens' },
      { name: 'Bars & Breweries', href: '/for/pubs-breweries', desc: 'Craft beer scene' },
    ],
    testimonial: {
      quote: 'Our darshini serves 500+ customers during breakfast rush. DineOpen token system handles the crowd perfectly. Kannada menu makes it easy for our staff.',
      author: 'Rajesh Kumar',
      business: 'Vidyarthi Bhavan Style Darshini, Bangalore',
    },
    compliance: [
      { name: 'Karnataka FSSAI Guide', href: '/resources/fssai-registration' },
      { name: 'GST for Restaurants', href: '/resources/gst-restaurants' },
      { name: 'Shop & Establishment Act', href: '/resources/shop-establishment-act' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Karnataka",
    "description": "Restaurant POS software for Karnataka restaurants with GST billing and Kannada language support.",
    "url": "https://www.dineopen.com/india/karnataka",
    "areaServed": { "@type": "State", "name": "Karnataka", "containedInPlace": { "@type": "Country", "name": "India" } },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <StatePOSClient stateData={stateData} />
    </>
  );
}
