import StatePOSClient from '../StatePOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Delhi NCR | Delhi, Noida, Gurgaon | DineOpen',
  description: 'Best restaurant POS software for Delhi NCR restaurants. GST billing, Hindi voice ordering, Zomato/Swiggy integration. Trusted by 12,000+ restaurants in Delhi, Noida, Gurgaon.',
  keywords: 'restaurant POS Delhi, billing software Noida, restaurant management Gurgaon, GST billing Delhi NCR, Hindi POS, restaurant software Delhi',
  openGraph: {
    title: 'Restaurant POS Software Delhi NCR | DineOpen',
    description: 'Top-rated restaurant POS for Delhi NCR. GST billing, Hindi support, delivery integration.',
    url: 'https://www.dineopen.com/india/delhi-ncr',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/india/delhi-ncr',
  },
};

export default function DelhiNCRPage() {
  const stateData = {
    state: 'Delhi NCR',
    tagline: 'Trusted by 12,000+ restaurants across Delhi, Noida, Gurgaon & more',
    description: 'GST-compliant billing, Hindi voice ordering, perfect for North Indian cuisine. From street food to Michelin-aspirant restaurants.',
    highlights: [
      'GST billing with Delhi/UP/Haryana GSTIN',
      'Hindi voice ordering & menu display',
      'Multi-state GST handling (Delhi/UP/Haryana)',
      'Zomato & Swiggy direct integration',
      'UPI, GPay, PhonePe payments',
      'Corporate catering support',
    ],
    cities: [
      { name: 'Delhi', href: '/pos/delhi', restaurants: '8,000+ restaurants' },
      { name: 'Noida', href: '/pos/noida', restaurants: '2,000+ restaurants' },
      { name: 'Gurgaon', href: '/pos/gurgaon', restaurants: '2,500+ restaurants' },
      { name: 'Faridabad', href: '/pos/faridabad', restaurants: '500+ restaurants' },
      { name: 'Ghaziabad', href: '/pos/ghaziabad', restaurants: '600+ restaurants' },
    ],
    localFeatures: [
      { title: 'Hindi Language Support', desc: 'Complete menu and ordering in Hindi. Voice orders in Hindi/Hinglish.' },
      { title: 'Multi-State GST', desc: 'Handle Delhi, UP, Haryana GST in one system. Auto-detect state for billing.' },
      { title: 'Chaat Counter Mode', desc: 'Fast token billing for street food. Handle evening rush smoothly.' },
      { title: 'Corporate Catering', desc: 'Bulk orders, employee cards, corporate billing for office parks.' },
    ],
    industries: [
      { name: 'North Indian', href: '/for/north-indian-restaurants', desc: 'Butter chicken, dal makhani' },
      { name: 'Street Food', href: '/for/street-food', desc: 'Chaat, golgappe, tikki' },
      { name: 'Mughlai', href: '/for/indian-restaurants', desc: 'Kebabs, biryani, korma' },
      { name: 'Fine Dining', href: '/for/fine-dining', desc: 'Premium restaurants' },
      { name: 'Cafes', href: '/for/cafes', desc: 'Coffee shops, bakeries' },
      { name: 'Bars & Pubs', href: '/for/bars-pubs', desc: 'Nightlife venues' },
    ],
    testimonial: {
      quote: 'Managing 3 outlets across Delhi, Noida and Gurgaon was a nightmare with different state GST. DineOpen handles it all automatically. Best decision we made.',
      author: 'Vikram Singh',
      business: 'Punjab Grill Express (3 outlets)',
    },
    compliance: [
      { name: 'Delhi FSSAI Guide', href: '/resources/fssai-registration' },
      { name: 'GST for Restaurants', href: '/resources/gst-restaurants' },
      { name: 'Shop & Establishment Act', href: '/resources/shop-establishment-act' },
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Delhi NCR",
    "description": "Restaurant POS software for Delhi NCR restaurants with multi-state GST billing.",
    "url": "https://www.dineopen.com/india/delhi-ncr",
    "areaServed": { "@type": "Place", "name": "Delhi NCR", "containedInPlace": { "@type": "Country", "name": "India" } },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <StatePOSClient stateData={stateData} />
    </>
  );
}
