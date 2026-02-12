import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Coimbatore | GST Billing | DineOpen',
  description: 'Best restaurant POS software for Coimbatore restaurants. GST billing, Tamil menus, Zomato/Swiggy integration, UPI payments. Perfect for Kongunadu cuisine & textile city restaurants.',
  keywords: 'restaurant POS Coimbatore, billing software Coimbatore, restaurant management Coimbatore, GST billing software Coimbatore, Tamil POS Coimbatore, Kongunadu food POS, South Indian restaurant Coimbatore',
  openGraph: {
    title: 'Best Restaurant POS Software in Coimbatore | DineOpen',
    description: 'Top-rated restaurant POS for Coimbatore. GST billing, Tamil support, delivery integration. Free trial.',
    url: 'https://www.dineopen.com/pos/coimbatore',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/coimbatore',
  },
};

export default function CoimbatorePOSPage() {
  const cityData = {
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '999',
    highlights: [
      'GST-compliant billing for Tamil Nadu',
      'Tamil voice ordering & menu display',
      'Zomato & Swiggy direct integration',
      'Perfect for Kongunadu cuisine',
      'UPI, GPay, PhonePe payments',
      'Filter coffee shop management',
    ],
    restaurants: '800+',
    testimonial: {
      quote: 'Our Kongunadu restaurant serves authentic Coimbatore cuisine. DineOpen Tamil menu and voice ordering made our operations smoother.',
      author: 'Senthil Kumar',
      business: 'Sree Annapoorna, Coimbatore',
    },
    localKeywords: ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Saibaba Colony', 'Race Course', 'Town Hall', 'Ukkadam', 'Singanallur'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Coimbatore",
    "description": "Restaurant POS and billing software for Coimbatore restaurants with GST billing and Tamil support.",
    "url": "https://www.dineopen.com/pos/coimbatore",
    "areaServed": { "@type": "City", "name": "Coimbatore", "containedInPlace": { "@type": "State", "name": "Tamil Nadu" } },
    "priceRange": "₹₹",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
