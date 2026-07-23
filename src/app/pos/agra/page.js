import AgraPOSClient from './AgraPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Agra | Taj Mahal Area & Tourist Restaurant | DineOpen',
  description: 'Best restaurant POS for Agra. Perfect for Taj Mahal area restaurants, rooftop cafes, tourist dining. Multi-currency, multi-language menus, tour group billing. ₹999/month.',
  keywords: 'restaurant POS Agra, Taj Mahal restaurant software, tourist restaurant billing, Agra cafe POS, rooftop restaurant software, petha shop billing, Agra hotel restaurant',
  openGraph: {
    title: 'Restaurant POS Software Agra | Tourist Restaurant Billing | DineOpen',
    description: 'POS for Agra tourist restaurants. Multi-language menus, tour group billing, Taj view cafes.',
    url: 'https://www.dineopen.com/pos/agra',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/agra' },
};

export default function AgraPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Agra",
    "description": "Restaurant POS for Agra's tourist restaurants, Taj Mahal area cafes, and hospitality businesses.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Agra" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Agra?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Agra, offering multi-currency and multi-language menus for tourist restaurants, GST billing, tour group billing, and Taj Mahal area rooftop cafe support. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Agra?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Agra restaurants. Orders flow automatically into your POS, perfect for Taj Mahal area restaurants and petha shops."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Agra?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Agra restaurants, including GST billing, multi-language menus, tour group billing, and QR ordering. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Agra?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Agra's tourist restaurants. Multi-language QR menus also serve international tourists visiting the Taj Mahal."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Agra?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Agra restaurants. No credit card required. Get full access to multi-currency display, tour group billing, and GST-compliant features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AgraPOSClient />
    </>
  );
}
