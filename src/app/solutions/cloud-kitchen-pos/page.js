import CloudKitchenPOSClient from './CloudKitchenPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best POS for Cloud Kitchen & Ghost Kitchen 2026 | DineOpen',
  description: 'Best POS system for cloud kitchens and ghost kitchens. Multi-brand management, delivery order tracking by channel, virtual brand support. 10-30% profit margins. Free trial.',
  keywords: 'best POS cloud kitchen, ghost kitchen POS system, cloud kitchen software, virtual restaurant POS, dark kitchen POS, cloud kitchen management, multi-brand kitchen POS, delivery kitchen POS',
  openGraph: {
    title: 'Best POS for Cloud Kitchen & Ghost Kitchen 2026 | DineOpen',
    description: 'Run multiple brands from one kitchen. Track every delivery channel in one POS. DineOpen POS built for cloud kitchens.',
    url: 'https://www.dineopen.com/solutions/cloud-kitchen-pos',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-cloud-kitchen-pos.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - Best POS for Cloud Kitchens & Ghost Kitchens',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best POS for Cloud Kitchen & Ghost Kitchen 2026 | DineOpen',
    description: 'Multi-brand management, delivery integration, virtual brand support. Built for cloud kitchens.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions/cloud-kitchen-pos',
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DineOpen Cloud Kitchen POS",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "10",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-12-31"
  },
  "description": "Best POS system for cloud kitchens and ghost kitchens. Multi-brand management, delivery order tracking by channel, and virtual brand support."
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS system for a cloud kitchen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for cloud kitchens because it supports multi-brand menu management, receives Talabat orders automatically, tracks orders from other delivery apps by channel, and provides per-brand analytics — all from $20/month with no contracts."
      }
    },
    {
      "@type": "Question",
      "name": "Can I run multiple brands from one POS system?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen lets you manage 3-8+ virtual brands from a single kitchen with separate menus, pricing, and branding for each. Switch between brands instantly and track performance independently."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen integrate with delivery apps like Uber Eats and DoorDash?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Talabat orders arrive in DineOpen automatically. For Uber Eats, DoorDash, Deliveroo, Zomato and Swiggy, there is no automatic order sync today: staff record those orders on the POS and tag the channel, so each platform's sales show separately in reports. DineOpen also gives you commission-free direct ordering (QR, your own ordering website and WhatsApp)."
      }
    },
    {
      "@type": "Question",
      "name": "How much does a cloud kitchen POS cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with no long-term contracts, no setup fees, and no transaction fees. Competitors like Toast charge $69+/month with additional per-transaction fees. Start with a free 7-day trial."
      }
    },
    {
      "@type": "Question",
      "name": "Can I track performance for each brand separately?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen provides real-time analytics broken down by brand, including revenue, order volume, popular items, and profit margins. This helps you identify which virtual brands are performing best and optimize your kitchen operations."
      }
    }
  ]
};

export default function CloudKitchenPOSPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CloudKitchenPOSClient />
    </>
  );
}
