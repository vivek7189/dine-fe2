import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Chandigarh | Billing System | DineOpen',
  description: 'Top-rated restaurant POS software in Chandigarh, Mohali & Panchkula. AI-powered billing, GST compliance, QR code ordering. Perfect for North Indian restaurants, cafes & bars. Start free trial.',
  keywords: 'restaurant POS Chandigarh, billing software Chandigarh, restaurant software Punjab, GST billing Chandigarh, cloud POS Mohali, QR menu Panchkula, cafe POS Chandigarh, bar billing software, Sector 17 restaurants',
  openGraph: {
    title: 'Best Restaurant POS Software in Chandigarh | DineOpen',
    description: 'AI-powered restaurant POS for Chandigarh tricity. GST compliant billing, QR menus, bar management.',
    url: 'https://www.dineopen.com/pos/chandigarh',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/chandigarh',
  },
};

export default function ChandigarhPOSPage() {
  const cityData = {
    city: 'Chandigarh',
    state: 'Punjab/Haryana',
    country: 'India',
    currency: '₹',
    price: '999',
    restaurants: '180+',
    highlights: [
      'Hindi & Punjabi voice ordering support',
      'GST-compliant for Punjab & Haryana',
      'Bar & pub management with tab tracking',
      'Tricity coverage (Chandigarh, Mohali, Panchkula)',
      'High-income market premium features',
      'Cafe culture optimized quick billing',
    ],
    testimonial: {
      quote: 'Chandigarh has a vibrant cafe and bar scene. DineOpen handles our bar tabs perfectly and the quick billing is essential for our busy weekend nights in Sector 26.',
      author: 'Gurpreet Singh',
      business: 'The Brew Estate',
    },
    localKeywords: [
      'Sector 17', 'Sector 26', 'Sector 35', 'Sector 22', 'Sector 7',
      'Elante Mall', 'Industrial Area Phase 1', 'Mohali Phase 5', 'Mohali Phase 7',
      'Panchkula Sector 5', 'IT Park Chandigarh', 'Zirakpur', 'Kharar', 'Sector 43', 'Sector 9',
    ],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Chandigarh",
    "description": "Best restaurant POS software for Chandigarh tricity with bar management, cafe billing, and GST compliance.",
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
      "name": "Chandigarh"
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
