import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Jaipur | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Jaipur. AI-powered billing, GST compliance, QR code ordering, Swiggy & Zomato integration. Perfect for Rajasthani thali restaurants, cafes & hotels. Start free trial.',
  keywords: 'restaurant POS Jaipur, billing software Jaipur, restaurant software Rajasthan, GST billing Jaipur, cloud POS Jaipur, QR menu Jaipur, thali restaurant POS, hotel POS Jaipur, cafe billing Jaipur',
  openGraph: {
    title: 'Best Restaurant POS Software in Jaipur | DineOpen',
    description: 'AI-powered restaurant POS for Jaipur. GST compliant billing, QR menus, delivery integration.',
    url: 'https://www.dineopen.com/pos/jaipur',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/jaipur',
  },
};

export default function JaipurPOSPage() {
  const cityData = {
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '250+',
    highlights: [
      'Hindi & Rajasthani language voice ordering',
      'GST-compliant billing for Rajasthan',
      'Perfect for Rajasthani thali restaurants',
      'Tourist-friendly multi-currency display',
      'Hotel restaurant & rooftop cafe support',
      'Swiggy & Zomato integration for Pink City',
    ],
    testimonial: {
      quote: 'We run a heritage haveli restaurant in Jaipur. DineOpen handles our thali service perfectly and the QR ordering works great for international tourists who visit us.',
      author: 'Vikram Singh Shekhawat',
      business: 'Haveli Restaurant',
    },
    localKeywords: [
      'MI Road', 'C-Scheme', 'Vaishali Nagar', 'Malviya Nagar', 'Mansarovar',
      'Raja Park', 'Tonk Road', 'Ajmer Road', 'Sindhi Camp', 'Hawa Mahal',
      'Amer Road', 'Jhotwara', 'Sitapura', 'Jagatpura', 'Sanganer', 'Bani Park',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Jaipur",
    "description": "Best restaurant POS software for Jaipur restaurants with Rajasthani cuisine support, GST billing, and tourism features.",
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
      "name": "Jaipur",
      "containedInPlace": {
        "@type": "State",
        "name": "Rajasthan"
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
