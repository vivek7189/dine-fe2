import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Ahmedabad | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Ahmedabad. AI-powered billing, GST compliance, QR code ordering, Swiggy & Zomato integration. Trusted by 300+ Ahmedabad restaurants. Start free trial.',
  keywords: 'restaurant POS Ahmedabad, billing software Ahmedabad, restaurant software Gujarat, GST billing Ahmedabad, cloud POS Ahmedabad, QR menu Ahmedabad, thali restaurant POS, restaurant management Ahmedabad',
  openGraph: {
    title: 'Best Restaurant POS Software in Ahmedabad | DineOpen',
    description: 'AI-powered restaurant POS for Ahmedabad. GST compliant billing, QR menus, delivery integration.',
    url: 'https://www.dineopen.com/pos/ahmedabad',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/ahmedabad',
  },
};

export default function AhmedabadPOSPage() {
  const cityData = {
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '300+',
    highlights: [
      'Gujarati language voice ordering support',
      'GST-compliant billing for Gujarat',
      'Swiggy & Zomato integration for SG Highway',
      'Unlimited thali item tracking',
      'Jain food filtering & labeling',
      'Fasting menu management features',
    ],
    testimonial: {
      quote: 'We run a busy Gujarati thali restaurant. DineOpen helps us track unlimited items per thali and manage our Jain/non-Jain menu perfectly. Customers love the QR ordering.',
      author: 'Hiren Patel',
      business: 'Gordhan Thal',
    },
    localKeywords: [
      'SG Highway', 'C.G. Road', 'Navrangpura', 'Prahlad Nagar', 'Satellite',
      'Vastrapur', 'Bodakdev', 'Thaltej', 'Maninagar', 'Ashram Road',
      'Law Garden', 'Ellis Bridge', 'Paldi', 'Gurukul', 'Chandkheda', 'Bopal',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Ahmedabad",
    "description": "Best restaurant POS software for Ahmedabad restaurants with Gujarati language support, GST billing, and delivery integration.",
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
      "name": "Ahmedabad",
      "containedInPlace": {
        "@type": "State",
        "name": "Gujarat"
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
