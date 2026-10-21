import CompareClient from './CompareClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'DineOpen vs Petpooja 2026: Honest Comparison | Features, Pricing, Reviews',
  description: 'DineOpen vs Petpooja honest comparison 2026. Compare published prices, features, Swiggy/Zomato integration and AI tools side by side. See which restaurant POS is right for you.',
  keywords: 'dineopen vs petpooja, petpooja vs dineopen, restaurant POS comparison India, best restaurant POS India 2026',
  openGraph: {
    title: 'DineOpen vs Petpooja 2026: Honest Feature & Pricing Comparison',
    description: 'Side-by-side comparison of DineOpen and Petpooja. Published prices, features, delivery integrations and AI tools, with sources.',
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
        "text": "DineOpen focuses on AI-powered features (voice ordering, chat assistant, menu extraction) from ₹899/month in India, with no per-transaction fee from DineOpen. Petpooja is a large, established Indian POS company. Its pricing page lists the Base plan at ₹12,000 + taxes, with higher Operations Manager and Marketing Manager plans that include Base, and it connects directly to Swiggy and Zomato, which DineOpen does not."
      }
    },
    {
      "@type": "Question",
      "name": "Which is cheaper — DineOpen or Petpooja?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Compare the published prices. DineOpen starts at ₹899/month in India with a 7-day free trial and no card. Petpooja's pricing page (checked 21 October 2026) lists the Base plan at ₹12,000 + taxes and does not state the billing period, so ask their sales team what period that covers. Its Operations Manager and Marketing Manager plans are listed at ₹20,000 to ₹40,000 + taxes, each with Base included. Neither page lists a per-order fee. Online payments carry your payment gateway's own charges whichever POS you use."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have AI features that Petpooja doesn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen offers AI voice ordering, AI chat assistant, AI menu extraction, and WhatsApp ordering in every plan. Petpooja's Base plan lists an AI agent, so ask Petpooja what it covers. These AI features help restaurants automate order-taking and reduce staff workload."
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
        "text": "Yes. DineOpen offers a guided migration process and a free 7-day trial so you can test everything before committing. AI menu extraction can digitize your existing menu in minutes."
      }
    },
    {
      "@type": "Question",
      "name": "Is Petpooja good for small restaurants with a single outlet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, many single outlets use Petpooja, especially ones that rely on Swiggy and Zomato. Its pricing page lists the Base plan at ₹12,000 + taxes, with captain app and KDS in its Operations Manager plan (from ₹20,000 + taxes) and CRM in its Marketing Manager plan (from ₹20,000 + taxes), both including Base. DineOpen starts at ₹899/month with these features included, but has no automatic Swiggy/Zomato sync. DineOpen also needs no special hardware and can be set up in 15 minutes on any existing phone or tablet."
      }
    },
    {
      "@type": "Question",
      "name": "Which restaurant POS has the most features for a single outlet in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For a single outlet, DineOpen includes the most features at the lowest price: AI voice ordering, cloud POS, inventory management, loyalty programs, QR ordering, WhatsApp ordering, kitchen display system, and analytics — all from ₹899/month, with no per-transaction fee from DineOpen. Petpooja lists its Base plan (which includes inventory and food aggregator integrations) at ₹12,000 + taxes; captain app, KDS and QR ordering come in the Operations Manager plan (Growth ₹20,000 / Scale ₹30,000 + taxes, Base included), and CRM and loyalty in the Marketing Manager plan (₹20,000 to ₹40,000 + taxes, Base included). POSist (Restroworks) targets larger chains and shares pricing on request."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen have Zomato and Swiggy integration?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen does not currently have direct Zomato/Swiggy integration. This is an area where Petpooja has a clear advantage with mature delivery aggregator integrations. However, DineOpen offers direct ordering channels (QR code menus, WhatsApp ordering, website ordering) that help restaurants take orders directly without paying 25-30% aggregator commissions."
      }
    },
    {
      "@type": "Question",
      "name": "What is the best Petpooja alternative for restaurants in India in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best Petpooja alternative for small-to-medium restaurants in India in 2026. It offers AI-powered features (voice ordering, menu extraction), no per-transaction fee from DineOpen, all features from ₹899/month, and it runs on Android, iPhone/iPad, Windows and the browser. If Swiggy/Zomato sync matters most to you, Petpooja is the stronger fit there. For large enterprise chains needing on-ground support, POSist (Restroworks) is another alternative. For restaurants outside India, Square and Toast are popular options."
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
      "price": "899",
      "priceCurrency": "INR",
      "priceValidUntil": "2026-12-31"
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
      "price": "12000",
      "priceCurrency": "INR",
      "priceValidUntil": "2026-12-31"
    },
    "description": "Established Indian restaurant POS with billing, inventory and direct Swiggy/Zomato integration. Base plan listed at ₹12,000 + taxes on petpooja.com/pricing (billing period not stated)."
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
