import VaranasiPOSClient from './VaranasiPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Varanasi | Ghat Cafe & Pure Veg Billing | DineOpen',
  description: 'Best restaurant POS for Varanasi. Perfect for ghat-view cafes, pure vegetarian restaurants, lassi shops & street food. Pilgrimage crowd management, sattvic menu tagging. ₹999/month.',
  keywords: 'restaurant POS Varanasi, Banaras cafe software, ghat restaurant billing, pure veg POS Varanasi, lassi shop billing, Kashi restaurant software, pilgrimage restaurant POS',
  openGraph: {
    title: 'Restaurant POS Software Varanasi | Ghat Cafe & Pure Veg | DineOpen',
    description: 'POS for Varanasi ghats restaurants. Pure veg tagging, tourist-friendly, pilgrimage rush management.',
    url: 'https://www.dineopen.com/pos/varanasi',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/varanasi' },
};

export default function VaranasiPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Varanasi",
    "description": "Restaurant POS for Varanasi's ghat cafes, pure veg restaurants, and pilgrimage food businesses.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Varanasi" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Varanasi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Varanasi, offering ghat-view cafe billing, pure vegetarian restaurant support, sattvic menu tagging, and pilgrimage crowd management. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Varanasi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Varanasi restaurants. Orders flow automatically into your POS, perfect for ghat cafes, lassi shops, and pure veg eateries."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Varanasi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Varanasi restaurants, including GST billing, pure veg tagging, sattvic menu support, and tourist-friendly QR menus. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Hindi voice ordering in Varanasi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Hindi and English, perfect for Varanasi's ghat cafes and Kashi restaurants. Staff can manage pilgrim group orders and street food billing efficiently."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Varanasi?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 7-day free trial for all Varanasi restaurants and cafes. No credit card required. Get full access to pure veg management, GST billing, and pilgrimage rush handling features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <VaranasiPOSClient />
    </>
  );
}
