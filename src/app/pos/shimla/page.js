import ShimlaPOSClient from './ShimlaPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Shimla | Mall Road Cafe & Hotel Restaurant | DineOpen',
  description: 'Best restaurant POS for Shimla. Perfect for Mall Road cafes, heritage restaurants, hotel dining & resort outlets. Tourist rush management, seasonal billing. ₹999/month.',
  keywords: 'restaurant POS Shimla, Mall Road cafe software, hill station restaurant billing, hotel POS Shimla, tourist cafe software, heritage restaurant POS Himachal',
  openGraph: {
    title: 'Restaurant POS Software Shimla | Mall Road Cafe & Hotel | DineOpen',
    description: 'POS for Shimla cafes and hotels. Tourist-friendly, heritage cafe ready, seasonal management.',
    url: 'https://www.dineopen.com/pos/shimla',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/shimla' },
};

export default function ShimlaPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Shimla",
    "description": "Restaurant POS for Shimla's Mall Road cafes, heritage restaurants, and hotel dining.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Shimla" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Shimla?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Shimla, offering Mall Road cafe billing, heritage restaurant support, hotel dining management, and tourist rush seasonal features. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Shimla?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Shimla restaurants and cafes. Orders flow automatically into your POS, perfect for Mall Road cafes and hotel restaurants."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Shimla?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Shimla restaurants, including GST billing, seasonal billing management, tourist-friendly QR menus, and hotel dining support. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Shimla?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Shimla's Mall Road cafes and heritage restaurants. It works offline during connectivity issues in hill areas."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Shimla?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Shimla restaurants and cafes. No credit card required. Get full access to seasonal management, GST billing, and tourist-friendly QR menu features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ShimlaPOSClient />
    </>
  );
}
