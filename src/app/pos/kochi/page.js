import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Kochi | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Kochi & Kerala. AI-powered billing, GST compliance, QR code ordering. Perfect for Kerala cuisine, seafood restaurants & beach cafes. Start free trial.',
  keywords: 'restaurant POS Kochi, billing software Kochi, restaurant software Kerala, GST billing Kerala, cloud POS Ernakulam, QR menu Kochi, seafood restaurant POS, Kerala restaurant software, Fort Kochi cafe',
  openGraph: {
    title: 'Best Restaurant POS Software in Kochi | DineOpen',
    description: 'AI-powered restaurant POS for Kochi. GST compliant billing, QR menus, seafood restaurant support.',
    url: 'https://www.dineopen.com/pos/kochi',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/kochi',
  },
};

export default function KochiPOSPage() {
  const cityData = {
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '220+',
    highlights: [
      'Malayalam & English voice ordering',
      'GST-compliant billing for Kerala',
      'Seafood restaurant inventory management',
      'Tourist-friendly multi-language menus',
      'Toddy shop & traditional restaurant support',
      'Beach cafe & Fort Kochi heritage area features',
    ],
    testimonial: {
      quote: 'Our seafood restaurant in Fort Kochi serves tourists from around the world. DineOpen QR menus work in multiple languages and the fresh catch inventory tracking is exactly what we needed.',
      author: 'Thomas Varghese',
      business: 'Fusion Bay Seafood Restaurant',
    },
    localKeywords: [
      'Fort Kochi', 'MG Road', 'Marine Drive', 'Edappally', 'Kakkanad',
      'Vytilla', 'Palarivattom', 'Kaloor', 'Ernakulam', 'Mattancherry',
      'Infopark', 'Thripunithura', 'Aluva', 'Cherai Beach', 'Willingdon Island', 'Jew Town',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Kochi",
    "description": "Best restaurant POS software for Kochi restaurants with seafood inventory, Kerala cuisine support, and tourism features.",
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
      "name": "Kochi",
      "containedInPlace": {
        "@type": "State",
        "name": "Kerala"
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
