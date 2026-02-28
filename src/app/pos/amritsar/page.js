import AmritsarPOSClient from './AmritsarPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Amritsar | Dhaba & Punjabi Restaurant Billing | DineOpen',
  description: 'Best restaurant POS for Amritsar. Perfect for famous dhabas, Golden Temple area restaurants, kulcha shops & 24-hour eateries. High-volume Punjabi food billing. ₹999/month.',
  keywords: 'restaurant POS Amritsar, dhaba billing software, Punjabi restaurant POS, Golden Temple restaurant software, Amritsar food billing, kulcha shop POS, 24 hour restaurant software',
  openGraph: {
    title: 'Restaurant POS Software Amritsar | Dhaba & Punjabi Food | DineOpen',
    description: 'POS for Amritsar dhabas and restaurants. High-volume billing, 24/7 operations, pilgrim groups.',
    url: 'https://www.dineopen.com/pos/amritsar',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/amritsar' },
};

export default function AmritsarPOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Amritsar",
    "description": "Restaurant POS for Amritsar's legendary dhabas, Punjabi restaurants, and pilgrim eateries.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Amritsar" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the best restaurant POS software in Amritsar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen is the top-rated restaurant POS software in Amritsar, offering high-volume Punjabi food billing, GST compliance, dhaba management, and Golden Temple area pilgrim group billing. Plans start at ₹999/month."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen work with Zomato and Swiggy in Amritsar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen integrates directly with Zomato and Swiggy for Amritsar restaurants and dhabas. Orders flow automatically into your POS, supporting 24-hour operations and kulcha shop billing."
        }
      },
      {
        "@type": "Question",
        "name": "How much does restaurant POS cost in Amritsar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen restaurant POS starts at ₹999/month for Amritsar restaurants and dhabas, including GST billing, high-volume order management, and pilgrim group billing. All prices are GST-inclusive."
        }
      },
      {
        "@type": "Question",
        "name": "Does DineOpen support Punjabi voice ordering in Amritsar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen supports AI-powered voice ordering in Punjabi, Hindi, and English, perfect for Amritsar's famous dhabas and kulcha shops. Staff can take orders hands-free during busy rush hours."
        }
      },
      {
        "@type": "Question",
        "name": "Can I get a free trial of DineOpen in Amritsar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen offers a 30-day free trial for all Amritsar restaurants and dhabas. No credit card required. Get full access to high-volume billing, GST compliance, and 24/7 operation features."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AmritsarPOSClient />
    </>
  );
}
