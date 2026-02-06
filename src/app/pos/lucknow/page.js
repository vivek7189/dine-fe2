import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Lucknow | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Lucknow. AI-powered billing, GST compliance, QR code ordering. Perfect for Awadhi cuisine, kebab shops & biryani restaurants. Start free trial.',
  keywords: 'restaurant POS Lucknow, billing software Lucknow, restaurant software UP, GST billing Lucknow, cloud POS Lucknow, QR menu Lucknow, kebab shop POS, Awadhi restaurant software, biryani restaurant POS',
  openGraph: {
    title: 'Best Restaurant POS Software in Lucknow | DineOpen',
    description: 'AI-powered restaurant POS for Lucknow. GST compliant billing, QR menus, Awadhi cuisine support.',
    url: 'https://www.dineopen.com/pos/lucknow',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/lucknow',
  },
};

export default function LucknowPOSPage() {
  const cityData = {
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '200+',
    highlights: [
      'Hindi & Urdu voice ordering support',
      'GST-compliant billing for Uttar Pradesh',
      'Awadhi cuisine & kebab shop features',
      'Biryani portion management (half/full/family)',
      'Sweet shop (mithai) inventory tracking',
      'Swiggy & Zomato integration for Nawabi city',
    ],
    testimonial: {
      quote: 'Lucknow is the food capital of North India. DineOpen understands our kebab and biryani business perfectly. The portion management feature saves us from order confusion every day.',
      author: 'Mohammed Farhan',
      business: 'Tunday Kababi Style Restaurant',
    },
    localKeywords: [
      'Hazratganj', 'Gomti Nagar', 'Aminabad', 'Chowk', 'Alambagh',
      'Aliganj', 'Indira Nagar', 'Mahanagar', 'Kaiserbagh', 'Charbagh',
      'Vikas Nagar', 'Jankipuram', 'Rajajipuram', 'Aashiana', 'Faizabad Road', 'Kanpur Road',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Lucknow",
    "description": "Best restaurant POS software for Lucknow restaurants with Awadhi cuisine support, kebab shop features, and GST billing.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "999",
      "priceCurrency": "INR",
      "priceValidUntil": "2026-12-31"
    },
    "areaServed": {
      "@type": "City",
      "name": "Lucknow",
      "containedInPlace": {
        "@type": "State",
        "name": "Uttar Pradesh"
      }
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
