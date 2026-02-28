import PrayagrajPOSClient from './PrayagrajPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Prayagraj | Sangam Pilgrim & Pure Veg Billing | DineOpen',
  description: 'Best restaurant POS for Prayagraj (Allahabad). Perfect for Sangam-area restaurants, pure veg eateries, student cafes. Kumbh Mela scale, pilgrim groups. ₹999/month.',
  keywords: 'restaurant POS Prayagraj, Allahabad restaurant software, Sangam area billing, pure veg POS Allahabad, Kumbh Mela restaurant software, pilgrim restaurant POS',
  openGraph: {
    title: 'Restaurant POS Software Prayagraj | Sangam & Pure Veg | DineOpen',
    description: 'POS for Prayagraj pilgrim restaurants. Kumbh scale, pure veg tagging, student-friendly.',
    url: 'https://www.dineopen.com/pos/prayagraj',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/prayagraj' },
};

export default function PrayagrajPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Prayagraj",
    "description": "Restaurant POS for Prayagraj's Sangam-area restaurants, pilgrim eateries, and student cafes.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Prayagraj" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Prayagraj?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Prayagraj (Allahabad), offering Sangam-area restaurant support, pure veg tagging, Kumbh Mela scale billing, and student cafe features. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Prayagraj?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Prayagraj restaurants. Orders flow automatically into your POS, perfect for Sangam-area restaurants and student cafes."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Prayagraj?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Prayagraj restaurants, including GST billing, pure veg tagging, pilgrim group billing, and student-friendly features. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Prayagraj?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Prayagraj's pilgrim restaurants and student cafes. It handles Kumbh Mela scale crowd management efficiently."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Prayagraj?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Prayagraj restaurants. No credit card required. Get full access to pure veg management, GST billing, and pilgrim crowd handling features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PrayagrajPOSClient />
    </>
  );
}
