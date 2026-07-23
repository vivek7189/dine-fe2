import DehradunPOSClient from './DehradunPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Dehradun | Cafe & Restaurant Billing | DineOpen',
  description: 'Best restaurant POS for Dehradun. Perfect for cafes, restaurants, bakeries & cloud kitchens. Student-friendly pricing, delivery integration for ISBT & Rajpur Road area. ₹999/month.',
  keywords: 'restaurant POS Dehradun, cafe billing Dehradun, restaurant software Uttarakhand, Dehradun cafe POS, Rajpur Road restaurant, cloud kitchen Dehradun, bakery billing software',
  openGraph: {
    title: 'Restaurant POS Software Dehradun | Cafe Billing | DineOpen',
    description: 'POS for Dehradun cafes and restaurants. Student-friendly, delivery integration, affordable pricing.',
    url: 'https://www.dineopen.com/pos/dehradun',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/dehradun' },
};

export default function DehradunPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Dehradun",
    "description": "Restaurant POS for Dehradun cafes, restaurants, and food businesses in Uttarakhand capital.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Dehradun" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Dehradun?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Dehradun, offering student-friendly pricing, delivery integration for Rajpur Road and ISBT area, and cafe and bakery billing features. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Dehradun?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Dehradun restaurants and cafes. Orders flow automatically into your POS, perfect for Rajpur Road cafes and cloud kitchens."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Dehradun?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Dehradun restaurants, including GST billing, QR menus, bakery billing, and delivery integration. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Dehradun?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Dehradun's cafes, restaurants, and bakeries. Staff can take orders hands-free during student rush hours."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Dehradun?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Dehradun restaurants and cafes. No credit card required. Get full access to GST billing, delivery integration, and cloud kitchen features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <DehradunPOSClient />
    </>
  );
}
