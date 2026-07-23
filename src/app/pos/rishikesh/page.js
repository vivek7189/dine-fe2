import RishikeshPOSClient from './RishikeshPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Rishikesh | Yoga Cafe & Vegan Restaurant Billing | DineOpen',
  description: 'Best restaurant POS for Rishikesh. Perfect for yoga cafes, vegan restaurants, rooftop cafes & ashram kitchens. Multi-currency for international tourists, organic menu tagging. ₹999/month.',
  keywords: 'restaurant POS Rishikesh, yoga cafe software, vegan restaurant POS, organic cafe billing, Rishikesh cafe POS, tourist restaurant software, rooftop cafe billing, ashram kitchen software',
  openGraph: {
    title: 'Restaurant POS Rishikesh | Yoga Cafe & Vegan Billing | DineOpen',
    description: 'POS for Rishikesh yoga capital. Vegan tagging, multi-currency, tourist-friendly QR menus.',
    url: 'https://www.dineopen.com/pos/rishikesh',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/pos/rishikesh',
  },
};

export default function RishikeshPOSPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Rishikesh",
    "description": "Restaurant POS for Rishikesh yoga cafes, vegan restaurants, and tourist-facing food businesses.",
    "applicationCategory": "BusinessApplication",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Rishikesh" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Rishikesh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Rishikesh, offering yoga cafe support, vegan restaurant features, organic menu tagging, and multi-currency display for international tourists. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Rishikesh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Rishikesh restaurants and cafes. Orders flow automatically into your POS, perfect for rooftop cafes and vegan restaurants."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Rishikesh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Rishikesh restaurants, including GST billing, vegan/organic menu tagging, multi-currency for tourists, and QR ordering. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Rishikesh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Rishikesh's yoga cafes and vegan restaurants. Multi-language QR menus serve international yoga tourists."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Rishikesh?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Rishikesh restaurants and cafes. No credit card required. Get full access to vegan tagging, multi-currency display, and organic menu features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <RishikeshPOSClient />
    </>
  );
}
