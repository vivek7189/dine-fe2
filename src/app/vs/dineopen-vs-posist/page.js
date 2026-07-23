import CompareClient from './CompareClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'DineOpen vs POSist (Restroworks) 2026 | Honest Comparison',
  description: 'DineOpen vs POSist (Restroworks) honest comparison 2026. Compare features, pricing, AI capabilities, and enterprise readiness side by side. See which restaurant POS fits your business.',
  keywords: 'posist alternative, restroworks review, posist vs dineopen, best pos for restaurant chain india, dineopen vs posist, posist pricing, restroworks alternative',
  openGraph: {
    title: 'DineOpen vs POSist (Restroworks) 2026 | Honest Comparison',
    description: 'Side-by-side comparison of DineOpen and POSist (Restroworks). Features, pricing, enterprise capabilities, AI features — all the facts you need to decide.',
    url: 'https://www.dineopen.com/vs/dineopen-vs-posist',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-dineopen-vs-posist.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen vs POSist (Restroworks) 2026 Comparison',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen vs POSist (Restroworks) 2026 | Honest Comparison',
    description: 'Side-by-side comparison of features, pricing, and capabilities. See which restaurant POS is right for your business.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/vs/dineopen-vs-posist',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the main difference between DineOpen and POSist (Restroworks)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is built for small-to-medium restaurants with AI-powered features (voice ordering, chat assistant, menu extraction) at an affordable price starting at Rs 300/month with zero transaction fees. POSist (now Restroworks) targets enterprise restaurant chains with 10+ outlets, offering custom pricing typically ranging from Rs 2,000-5,000+/month per outlet with dedicated account managers and on-ground support."
      }
    },
    {
      "@type": "Question",
      "name": "Is DineOpen cheaper than POSist?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, significantly. DineOpen Spark plan starts at Rs 300/month (about $9.99) with all features included and zero transaction fees. POSist uses custom enterprise pricing that typically ranges from Rs 2,000-5,000+ per month per outlet, plus setup fees of Rs 15,000-50,000. For a single-outlet restaurant, DineOpen costs Rs 3,600/year vs POSist at Rs 24,000-60,000+/year. However, POSist includes enterprise-grade features like delivery aggregator integration that DineOpen does not have."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have Zomato and Swiggy integration like POSist?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. DineOpen does not currently have direct Zomato or Swiggy integration. This is an area where POSist has a clear advantage with mature, direct integrations with all major delivery aggregators in India. If your restaurant relies heavily on delivery platforms for revenue, this is an important consideration. DineOpen offers alternative direct ordering channels (QR code menus, WhatsApp ordering) that help restaurants take orders without paying 25-30% aggregator commissions."
      }
    },
    {
      "@type": "Question",
      "name": "Is POSist better than DineOpen for large restaurant chains?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For large chains with 10+ outlets that need enterprise-grade features, dedicated account managers, on-ground technician support, and deep delivery aggregator integration, POSist (Restroworks) is likely the better choice. It has been purpose-built for enterprise restaurant management. However, for small-to-medium restaurants or growing chains with 1-5 outlets, DineOpen offers more value with AI features, transparent pricing, and faster setup."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have AI features that POSist does not?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen offers AI voice ordering in multiple Indian languages (Hindi, English, Tamil, Marathi, and more), an AI chat assistant for restaurant operations, and AI-powered menu extraction from photos. POSist focuses on traditional POS and enterprise management features but does not currently offer AI-powered ordering or operational AI tools."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch from POSist to DineOpen easily?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, but with caveats. DineOpen offers a 7-day free trial so you can test everything alongside your existing POSist setup. AI menu extraction can digitize your menu in minutes. However, if you rely on POSist's Zomato/Swiggy integration or have complex multi-outlet configurations, switching requires planning. We recommend running both systems in parallel for a week before fully transitioning."
      }
    }
  ]
};

const softwareSchemas = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Android, iOS",
    "offers": {
      "@type": "Offer",
      "price": "300",
      "priceCurrency": "INR",
      "priceValidUntil": "2026-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "500"
    },
    "description": "AI-powered restaurant POS with voice ordering, zero transaction fees, and cloud-based management across 20+ countries."
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "POSist (Restroworks)",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Android, iOS",
    "offers": {
      "@type": "Offer",
      "price": "2000",
      "priceCurrency": "INR",
      "priceValidUntil": "2026-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.1",
      "ratingCount": "800"
    },
    "description": "Enterprise-focused restaurant management platform with delivery aggregator integrations, multi-outlet management, and dedicated support for restaurant chains."
  }
];

export default function DineOpenVsPosistPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchemas) }} />
      <CompareClient />
    </>
  );
}
