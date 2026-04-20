import FoodicsAlternativeClient from './FoodicsAlternativeClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best Foodics Alternative 2026 | DineOpen - Affordable UAE POS',
  description: 'Looking for a Foodics alternative in UAE? Switch from Foodics (AED 300+/mo) to DineOpen (AED 149/mo). Zero transaction fees, no long contracts, Arabic + English support. Free 30-day trial.',
  keywords: 'Foodics alternative, Foodics alternative UAE, cheaper than Foodics, Foodics competitor, restaurant POS UAE',
  openGraph: {
    title: 'Best Foodics Alternative UAE | DineOpen - Half the Price',
    description: 'Switch from Foodics to DineOpen. AED 149/mo vs AED 300+/mo. Zero transaction fees, no hardware lock-in, Arabic support. Free 30-day trial.',
    url: 'https://www.dineopen.com/alternatives/foodics',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-foodics-alternative.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - Best Foodics Alternative in UAE',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best Foodics Alternative UAE | DineOpen - Save AED 5,400+/Year',
    description: 'Switch from Foodics to DineOpen. AED 149/mo, zero transaction fees, no contracts. Free 30-day trial.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/alternatives/foodics',
    languages: {
      'en': 'https://www.dineopen.com/alternatives/foodics',
      'ar': 'https://www.dineopen.com/alternatives/foodics',
    },
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is DineOpen a good alternative to Foodics in UAE?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is the top Foodics alternative in UAE. It costs AED 149/month compared to Foodics' AED 300+/month, charges zero transaction fees, requires no proprietary hardware, and includes Arabic and English support with full VAT 5% compliance."
      }
    },
    {
      "@type": "Question",
      "name": "How much can I save switching from Foodics to DineOpen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "UAE restaurants save AED 5,400+ per year by switching from Foodics to DineOpen. DineOpen costs AED 149/month with zero transaction fees, compared to Foodics at AED 300+/month plus 1-2% transaction fees."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen integrate with Talabat and Deliveroo?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen integrates with Talabat, Deliveroo, and other UAE delivery platforms. Orders flow directly into your POS, just like Foodics, with no extra integration fees."
      }
    },
    {
      "@type": "Question",
      "name": "Is DineOpen VAT compliant for UAE restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is fully VAT 5% compliant for UAE restaurants. It automatically calculates VAT on all invoices and generates tax-compliant reports required by the Federal Tax Authority (FTA)."
      }
    },
    {
      "@type": "Question",
      "name": "Can I migrate from Foodics to DineOpen easily?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, migrating from Foodics to DineOpen is simple. Sign up for a free 30-day trial, use AI-powered menu extraction to import your menu automatically, and go live within 24 hours. No professional installation required."
      }
    }
  ]
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DineOpen",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "description": "AI-powered restaurant POS and management platform. Affordable Foodics alternative for UAE restaurants.",
  "offers": {
    "@type": "Offer",
    "price": "149",
    "priceCurrency": "AED",
    "priceValidUntil": "2026-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "500"
  }
};

export default function FoodicsAlternativePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <FoodicsAlternativeClient />
    </>
  );
}
