import NoidaPOSClient from './NoidaPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Noida | Cloud Kitchen & Cafe Billing | DineOpen',
  description: 'Best restaurant POS for Noida & Greater Noida. Perfect for cloud kitchens, corporate cafeterias, malls, and IT park restaurants. Delivery-first features, Swiggy/Zomato integration. ₹999/month.',
  keywords: 'restaurant POS Noida, cloud kitchen software Noida, Greater Noida restaurant billing, IT park cafe POS, corporate cafeteria software, mall food court POS, Noida restaurant management',
  openGraph: {
    title: 'Restaurant POS Software Noida | Cloud Kitchen & Cafe | DineOpen',
    description: 'POS for Noida restaurants, cloud kitchens, IT parks. Delivery integration, corporate billing.',
    url: 'https://www.dineopen.com/pos/noida',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/noida' },
};

export default function NoidaPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Noida",
    "description": "Restaurant POS for Noida's cloud kitchens, corporate cafes, and modern restaurants.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Noida" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Noida?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Noida and Greater Noida, offering cloud kitchen support, corporate cafeteria billing, Swiggy/Zomato integration, and IT park delivery features. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Noida?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Noida restaurants and cloud kitchens. Orders flow automatically into your POS with delivery-first features for IT park and mall food courts."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Noida?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Noida restaurants, including GST billing, cloud kitchen management, corporate cafeteria features, and delivery integration. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Noida?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Noida's modern restaurants and cloud kitchens. Staff can manage orders hands-free during corporate lunch rushes."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Noida?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Noida restaurants and cloud kitchens. No credit card required. Get full access to delivery-first features, GST billing, and corporate billing tools."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NoidaPOSClient />
    </>
  );
}
