import CompareClient from './CompareClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Petpooja vs POSist (Restroworks) 2026: Which Is Better for Your Restaurant?',
  description: 'Petpooja vs POSist (Restroworks) neutral comparison for 2026. Compare pricing, features, delivery integrations, support, and find which Indian restaurant POS is right for your business.',
  keywords: 'petpooja vs posist, petpooja vs restroworks, best restaurant pos india comparison, posist vs petpooja, petpooja or posist, restroworks vs petpooja, restaurant pos comparison india 2026, petpooja pricing, posist pricing',
  openGraph: {
    title: 'Petpooja vs POSist (Restroworks) 2026: Which Is Better for Your Restaurant?',
    description: 'Neutral, in-depth comparison of Petpooja and POSist (Restroworks). Pricing, features, delivery integration, support — everything you need to decide.',
    url: 'https://www.dineopen.com/vs/petpooja-vs-posist',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-petpooja-vs-posist.jpg',
        width: 1200,
        height: 630,
        alt: 'Petpooja vs POSist (Restroworks) 2026 Comparison',
      },
    ],
    locale: 'en_IN',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Petpooja vs POSist (Restroworks) 2026: Which Is Better?',
    description: 'Neutral comparison of India\'s top two restaurant POS platforms. Pricing, features, support, and who each is best for.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/vs/petpooja-vs-posist',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the main difference between Petpooja and POSist (Restroworks)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Petpooja is best suited for small-to-medium restaurants with strong delivery aggregator integration and published prices (Base plan listed at ₹12,000 + taxes on petpooja.com/pricing). POSist (now Restroworks) targets enterprise chains and multi-location businesses with advanced analytics and international presence; its pricing is on request."
      }
    },
    {
      "@type": "Question",
      "name": "Which is cheaper — Petpooja or POSist?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Petpooja publishes its prices: the Base plan is listed at ₹12,000 + taxes (the page does not state the billing period), with Operations Manager (₹20,000 / ₹30,000) and Marketing Manager (₹20,000 to ₹40,000) plans that include Base. POSist (Restroworks) shares pricing on request, based on outlets and modules. Get a written quote from both before comparing."
      }
    },
    {
      "@type": "Question",
      "name": "Is Petpooja or POSist better for delivery integration with Zomato and Swiggy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Petpooja has stronger out-of-the-box delivery aggregator integration with Zomato and Swiggy. It offers direct API connections, auto-accept for orders, and menu syncing across platforms. POSist also integrates with delivery platforms but its strength lies more in enterprise analytics and multi-location management rather than delivery workflows."
      }
    },
    {
      "@type": "Question",
      "name": "Which POS is better for restaurant chains with 10+ outlets?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "POSist (Restroworks) is generally better for large chains with 10+ outlets. It offers centralized multi-location analytics, enterprise-grade reporting, role-based access controls, and dedicated account management. Petpooja can handle multiple outlets but its multi-location features are not as robust for large-scale enterprise operations."
      }
    },
    {
      "@type": "Question",
      "name": "Are there better alternatives to both Petpooja and POSist for restaurants in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen is a modern alternative offering AI-powered features (voice ordering, chat assistant, menu extraction) from ₹899/month in India, with no per-transaction fee from DineOpen and a 7-day free trial. It does not sync Swiggy/Zomato orders automatically, which both Petpooja and POSist do. Other alternatives include Square (better for international businesses) and Toast (popular in the US market)."
      }
    }
  ]
};

const comparisonSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Petpooja vs POSist (Restroworks) Comparison",
  "description": "A neutral comparison of Petpooja and POSist (Restroworks) restaurant POS platforms covering pricing, features, delivery integration, support, and ideal use cases.",
  "numberOfItems": 2,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": "Petpooja",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, Android, iOS",
        "description": "Restaurant POS founded in 2011 in Ahmedabad. Direct Zomato/Swiggy integration. Base plan listed at ₹12,000 + taxes on petpooja.com/pricing (billing period not stated).",
        "offers": {
          "@type": "Offer",
          "price": "12000",
          "priceCurrency": "INR",
          "priceValidUntil": "2026-12-31"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "SoftwareApplication",
        "name": "POSist (Restroworks)",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web, Android, iOS",
        "description": "Enterprise-focused restaurant technology platform founded in 2012, rebranded to Restroworks. Multi-location analytics, international presence. Pricing on request."
      }
    }
  ]
};

export default function PetpoojaVsPosistPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }} />
      <CompareClient />
    </>
  );
}
