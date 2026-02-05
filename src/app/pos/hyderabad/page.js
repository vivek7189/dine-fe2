import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Hyderabad | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Hyderabad. AI-powered billing, GST compliance, QR code ordering, Swiggy & Zomato integration. Trusted by 600+ Hyderabad restaurants. Start free trial.',
  keywords: 'restaurant POS Hyderabad, billing software Hyderabad, restaurant software Telangana, GST billing Hyderabad, cloud POS Hyderabad, QR menu Hyderabad, biryani restaurant POS, restaurant management Hyderabad',
  openGraph: {
    title: 'Best Restaurant POS Software in Hyderabad | DineOpen',
    description: 'AI-powered restaurant POS for Hyderabad. GST compliant billing, QR menus, delivery integration.',
    url: 'https://www.dineopen.com/pos/hyderabad',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/hyderabad',
  },
};

export default function HyderabadPOSPage() {
  const cityData = {
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '600+',
    highlights: [
      'Telugu & Urdu language voice ordering',
      'GST-compliant billing for Telangana',
      'Swiggy & Zomato integration for HITEC City',
      'Biryani restaurant specialized features',
      'High-volume order management for Ramadan',
      'Irani cafe billing optimization',
    ],
    testimonial: {
      quote: 'Running a busy biryani restaurant in Hyderabad means handling 500+ orders daily. DineOpen handles the rush effortlessly. The voice ordering in Telugu is a game-changer for us.',
      author: 'Mohammed Ismail',
      business: 'Paradise Biryani Express',
    },
    localKeywords: [
      'Banjara Hills', 'Jubilee Hills', 'HITEC City', 'Madhapur', 'Gachibowli',
      'Kukatpally', 'Secunderabad', 'Ameerpet', 'Kondapur', 'Begumpet',
      'Somajiguda', 'Charminar', 'Tolichowki', 'Miyapur', 'LB Nagar', 'Dilsukhnagar',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Hyderabad",
    "description": "Best restaurant POS software for Hyderabad restaurants with Telugu/Urdu language support, GST billing, and delivery integration.",
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
      "name": "Hyderabad",
      "containedInPlace": {
        "@type": "State",
        "name": "Telangana"
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
