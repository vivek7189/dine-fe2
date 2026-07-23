import SaharanpurPOSClient from './SaharanpurPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Saharanpur | Sweet Shop & Canteen Billing | DineOpen',
  description: 'Best restaurant POS for Saharanpur. Perfect for sweet shops, industrial canteens, market restaurants & highway dhabas. Quick billing, inventory management. ₹999/month.',
  keywords: 'restaurant POS Saharanpur, sweet shop billing software, canteen POS Saharanpur, dhaba billing software, Saharanpur restaurant software, namkeen shop POS',
  openGraph: {
    title: 'Restaurant POS Software Saharanpur | Sweet Shop & Canteen | DineOpen',
    description: 'POS for Saharanpur restaurants and sweet shops. Quick billing, canteen management, highway dhaba support.',
    url: 'https://www.dineopen.com/pos/saharanpur',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/saharanpur' },
};

export default function SaharanpurPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Saharanpur",
    "description": "Restaurant POS for Saharanpur's sweet shops, restaurants, and industrial canteens.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Saharanpur" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Saharanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Saharanpur, offering sweet shop billing, industrial canteen management, highway dhaba support, and namkeen shop inventory tracking. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Saharanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Saharanpur restaurants and food shops. Orders flow automatically into your POS, perfect for market restaurants and sweet shops."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Saharanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Saharanpur restaurants, including GST billing, sweet shop inventory, canteen billing, and quick billing features. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Saharanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Saharanpur's sweet shops, canteens, and highway dhabas. Quick billing keeps customer queues moving."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Saharanpur?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Saharanpur restaurants and food businesses. No credit card required. Get full access to sweet shop billing, GST compliance, and inventory management."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SaharanpurPOSClient />
    </>
  );
}
