import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Kolkata | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Kolkata. AI-powered billing, GST compliance, QR code ordering, Swiggy & Zomato integration. Trusted by 350+ Kolkata restaurants. Start free trial.',
  keywords: 'restaurant POS Kolkata, billing software Kolkata, restaurant software West Bengal, GST billing Kolkata, cloud POS Kolkata, QR menu Kolkata, sweet shop POS, restaurant management Kolkata',
  openGraph: {
    title: 'Best Restaurant POS Software in Kolkata | DineOpen',
    description: 'AI-powered restaurant POS for Kolkata. GST compliant billing, QR menus, delivery integration.',
    url: 'https://www.dineopen.com/pos/kolkata',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/kolkata',
  },
};

export default function KolkataPOSPage() {
  const cityData = {
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '350+',
    highlights: [
      'Bengali language voice ordering support',
      'GST-compliant billing for West Bengal',
      'Swiggy & Zomato integration for Park Street',
      'Sweet shop (Mishti) inventory management',
      'Durga Puja rush hour handling',
      'Roll & street food quick billing',
    ],
    testimonial: {
      quote: 'During Durga Puja, our sweet shop gets 10x orders. DineOpen handled everything smoothly - billing, inventory alerts, and delivery coordination. Essential for Kolkata businesses.',
      author: 'Arindam Chatterjee',
      business: 'Balaram Mullick & Radharaman Mullick',
    },
    localKeywords: [
      'Park Street', 'Salt Lake', 'New Town', 'Ballygunge', 'Gariahat',
      'Howrah', 'Esplanade', 'College Street', 'Behala', 'Jadavpur',
      'Alipore', 'Rashbehari', 'Tollygunge', 'Lake Town', 'Dum Dum', 'Rajarhat',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Kolkata",
    "description": "Best restaurant POS software for Kolkata restaurants with Bengali language support, GST billing, and delivery integration.",
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
      "name": "Kolkata",
      "containedInPlace": {
        "@type": "State",
        "name": "West Bengal"
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
