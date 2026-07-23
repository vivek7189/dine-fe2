import MeerutPOSClient from './MeerutPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Meerut | Industrial Canteen & Street Food | DineOpen',
  description: 'Best restaurant POS for Meerut. Perfect for factory canteens, street food vendors, sweet shops & catering. Industrial workforce billing, sports academy meals. ₹999/month.',
  keywords: 'restaurant POS Meerut, canteen billing software, street food POS Meerut, industrial canteen software, Meerut restaurant billing, sweet shop POS, catering software Meerut',
  openGraph: {
    title: 'Restaurant POS Software Meerut | Industrial Canteen & Street Food | DineOpen',
    description: 'POS for Meerut restaurants and canteens. Industrial billing, street food, catering support.',
    url: 'https://www.dineopen.com/pos/meerut',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/meerut' },
};

export default function MeerutPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Meerut",
    "description": "Restaurant POS for Meerut's industrial canteens, street food vendors, and catering businesses.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Meerut" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Meerut?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Meerut, offering industrial canteen billing, street food vendor support, sweet shop management, and catering features. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Meerut?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Meerut restaurants and food vendors. Orders flow automatically into your POS, perfect for market restaurants and sweet shops."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Meerut?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Meerut restaurants, including GST billing, canteen management, sweet shop inventory, and catering billing. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Meerut?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Meerut's industrial canteens, street food vendors, and sweet shops. Quick billing keeps queues moving."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Meerut?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Meerut restaurants and food businesses. No credit card required. Get full access to canteen billing, GST compliance, and inventory management."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <MeerutPOSClient />
    </>
  );
}
