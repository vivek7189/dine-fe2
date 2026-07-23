import CityPOSClient from '../CityPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Restaurant POS Software in Surat | GST Billing | DineOpen',
  description: 'Best restaurant POS software for Surat restaurants. GST billing, Gujarati menus, Zomato/Swiggy integration, UPI payments. Perfect for Surti cuisine & diamond city restaurants.',
  keywords: 'restaurant POS Surat, billing software Surat, restaurant management Surat, GST billing software Surat, Gujarati POS Surat, Surti food POS, farsan shop billing Surat',
  openGraph: {
    title: 'Best Restaurant POS Software in Surat | DineOpen',
    description: 'Top-rated restaurant POS for Surat. GST billing, Gujarati support, delivery integration. Free trial.',
    url: 'https://www.dineopen.com/pos/surat',
    siteName: 'DineOpen',
    locale: 'en_IN',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/surat',
  },
};

export default function SuratPOSPage() {
  const cityData = {
    city: 'Surat',
    state: 'Gujarat',
    country: 'India',
    currency: '₹',
    currencyCode: 'INR',
    price: '999',
    highlights: [
      'GST-compliant billing for Gujarat',
      'Gujarati voice ordering & menu',
      'Zomato & Swiggy direct integration',
      'Perfect for Surti locho, ghari shops',
      'UPI, GPay, PhonePe payments',
      'Farsan shop weight-based billing',
    ],
    restaurants: '1,500+',
    testimonial: {
      quote: 'Our farsan shop handles 200+ customers during evening rush. DineOpen weight-based billing is perfect. Gujarati menu makes it easy for staff.',
      author: 'Nilesh Shah',
      business: 'Famous Farsan Mart, Surat',
    },
    localKeywords: ['Adajan', 'Vesu', 'Piplod', 'Athwa', 'Ring Road', 'Varachha', 'Katargam', 'Udhna'],
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "DineOpen Surat",
    "description": "Restaurant POS and billing software for Surat restaurants with GST billing and Gujarati support.",
    "url": "https://www.dineopen.com/pos/surat",
    "areaServed": { "@type": "City", "name": "Surat", "containedInPlace": { "@type": "State", "name": "Gujarat" } },
    "priceRange": "₹₹",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Surat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Surat, offering GST-compliant billing for Gujarat, Gujarati voice ordering, weight-based billing for farsan shops, and Zomato/Swiggy integration. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Surat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Surat restaurants. Orders from Adajan, Vesu, Piplod, and Athwa flow automatically into your POS."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Surat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Surat restaurants, including GST billing, weight-based billing for farsan and ghari shops, QR menus, and delivery integration. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Gujarati voice ordering in Surat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Gujarati and English, perfect for Surat's locho shops, farsan marts, and diamond city restaurants. Gujarati menus make it easy for staff."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Surat?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Surat restaurants and food shops. No credit card required. Get full access to Gujarati language support, GST billing, and weight-based billing."
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
