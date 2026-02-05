import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Chennai | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Chennai. AI-powered billing, GST compliance, QR code ordering, Swiggy & Zomato integration. Trusted by 500+ Chennai restaurants. Start free trial.',
  keywords: 'restaurant POS Chennai, billing software Chennai, restaurant software Tamil Nadu, GST billing Chennai, cloud POS Chennai, QR menu Chennai, restaurant management Chennai, cafe POS Chennai',
  openGraph: {
    title: 'Best Restaurant POS Software in Chennai | DineOpen',
    description: 'AI-powered restaurant POS for Chennai. GST compliant billing, QR menus, delivery integration.',
    url: 'https://www.dineopen.com/pos/chennai',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/chennai',
  },
};

export default function ChennaiPOSPage() {
  const cityData = {
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '500+',
    highlights: [
      'Tamil language support for voice ordering',
      'GST-compliant billing for Tamil Nadu',
      'Swiggy & Zomato integration for Marina Beach area',
      'Multi-cuisine support for Chettinad restaurants',
      'Beach-side QR ordering for outdoor venues',
      'South Indian thali management features',
    ],
    testimonial: {
      quote: 'DineOpen understands Chennai restaurants. The Tamil voice ordering feature is amazing - our staff picked it up in one day. GST billing is automatic and accurate.',
      author: 'Karthik Rajan',
      business: 'Namma Saapadu Restaurant',
    },
    localKeywords: [
      'T. Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'OMR', 'ECR',
      'Mylapore', 'Besant Nagar', 'Porur', 'Vadapalani', 'Guindy',
      'Mount Road', 'Egmore', 'Nungambakkam', 'Alwarpet', 'Thiruvanmiyur',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Chennai",
    "description": "Best restaurant POS software for Chennai restaurants with Tamil language support, GST billing, and delivery integration.",
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
      "name": "Chennai",
      "containedInPlace": {
        "@type": "State",
        "name": "Tamil Nadu"
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
