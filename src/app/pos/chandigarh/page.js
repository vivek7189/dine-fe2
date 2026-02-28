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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Chandigarh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Chandigarh tricity (Chandigarh, Mohali, Panchkula), offering GST-compliant billing, bar and pub management with tab tracking, and AI voice ordering in Hindi and Punjabi. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Chandigarh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Chandigarh tricity restaurants. Orders from Sector 17, Sector 26, Elante Mall, and Mohali flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Chandigarh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Chandigarh restaurants, including GST billing, bar tab management, QR menus, and delivery integration. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Punjabi voice ordering in Chandigarh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi, Punjabi, and English, perfect for Chandigarh's vibrant cafe and bar scene. Staff can take orders hands-free during busy weekend nights."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Chandigarh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Chandigarh tricity restaurants, cafes, and bars. No credit card required. Get full access to bar management, GST billing, and delivery integrations."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CityPOSClient cityData={cityData} />
    </>
  );
}
