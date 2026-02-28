import CompareClient from './CompareClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'DineOpen vs Petpooja 2026: Honest Comparison | Features, Pricing, Reviews',
  description: 'DineOpen vs Petpooja honest comparison 2026. Compare features, pricing, transaction fees, AI capabilities side by side. See which restaurant POS is right for you.',
  keywords: 'dineopen vs petpooja, petpooja vs dineopen, restaurant POS comparison India, best restaurant POS India 2026',
  openGraph: {
    title: 'DineOpen vs Petpooja 2026: Honest Feature & Pricing Comparison',
    description: 'Side-by-side comparison of DineOpen and Petpooja. Features, pricing, transaction fees, AI capabilities — all the facts you need.',
    url: 'https://www.dineopen.com/vs/dineopen-vs-petpooja',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-dineopen-vs-petpooja.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen vs Petpooja 2026 Comparison',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DineOpen vs Petpooja 2026: Honest Comparison',
    description: 'Side-by-side comparison of features, pricing, and AI capabilities. See which restaurant POS wins.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/vs/dineopen-vs-petpooja',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the main difference between DineOpen and Petpooja?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen focuses on AI-powered features (voice ordering, chat assistant, menu extraction) at a lower price point (₹300/month with zero transaction fees). Petpooja is an established India-focused POS brand starting at ₹1,000+/month with 1.5-2% transaction fees but a larger local support team."
      }
    },
    {
      "@type": "Question",
      "name": "Which is cheaper — DineOpen or Petpooja?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is significantly cheaper. At ₹300/month with zero transaction fees, a restaurant processing ₹3,00,000/month saves over ₹74,000 per year compared to Petpooja's ₹1,000+/month subscription plus 1.5-2% transaction fees."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have AI features that Petpooja doesn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen offers AI voice ordering, AI chat assistant, AI menu extraction, and WhatsApp ordering — none of which are available in Petpooja. These AI features help restaurants automate order-taking and reduce staff workload."
      }
    },
    {
      "@type": "Question",
      "name": "Is Petpooja better than DineOpen for any use case?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Petpooja has a longer track record in India, a larger local support team, more third-party integrations, and stronger brand recognition. If you need enterprise-level custom support or are already deeply integrated with Petpooja's ecosystem, it may be worth staying."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch from Petpooja to DineOpen easily?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen offers a guided migration process and a free 30-day trial so you can test everything before committing. AI menu extraction can digitize your existing menu in minutes."
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
    "name": "Petpooja",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Android, iOS",
    "offers": {
      "@type": "Offer",
      "price": "1000",
      "priceCurrency": "INR",
      "priceValidUntil": "2026-12-31"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.3",
      "ratingCount": "1200"
    },
    "description": "Established India-focused restaurant POS with billing, inventory management, and aggregator integrations."
  }
];

export default function DineOpenVsPetpoojaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchemas) }} />
      <CompareClient />
    </>
  );
}
