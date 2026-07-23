import HaridwarPOSClient from './HaridwarPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Haridwar | Pure Veg Billing | Ashram & Dharamshala | DineOpen',
  description: 'Best restaurant POS for Haridwar. Perfect for pure vegetarian restaurants, ashram bhojanalayas, dharamshala canteens & pilgrimage cafes. No onion-garlic tagging, sattvic menu support. ₹999/month.',
  keywords: 'restaurant POS Haridwar, vegetarian restaurant software, ashram billing software, dharamshala POS, Haridwar cafe billing, pure veg POS, sattvic restaurant software, pilgrimage restaurant POS, bhojanshala billing',
  openGraph: {
    title: 'Restaurant POS Software Haridwar | Pure Veg & Ashram Billing | DineOpen',
    description: 'POS for Haridwar holy city restaurants. Pure veg tagging, ashram bhojanshala support, pilgrimage crowd management.',
    url: 'https://www.dineopen.com/pos/haridwar',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/haridwar',
  },
};

export default function HaridwarPOSPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Haridwar",
    "description": "Restaurant POS for Haridwar's pure vegetarian restaurants, ashram bhojanalayas, and pilgrimage cafes with sattvic menu support.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "999",
      "priceCurrency": "INR"
    },
    "areaServed": {
      "@type": "City",
      "name": "Haridwar",
      "containedInPlace": { "@type": "State", "name": "Uttarakhand" }
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Haridwar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Haridwar, offering pure vegetarian restaurant support, sattvic menu tagging, no onion-garlic filtering, and ashram bhojanshala billing. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Haridwar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Haridwar restaurants and bhojanalayas. Orders flow automatically into your POS, handling pilgrimage crowd rushes smoothly."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Haridwar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Haridwar restaurants, including GST billing, pure veg tagging, sattvic menu support, and pilgrim group billing. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Haridwar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Haridwar's pure vegetarian restaurants and ashram kitchens. Staff can manage pilgrim group orders efficiently."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Haridwar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Haridwar restaurants and bhojanalayas. No credit card required. Get full access to sattvic menu management, GST billing, and pilgrim crowd features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HaridwarPOSClient />
    </>
  );
}
