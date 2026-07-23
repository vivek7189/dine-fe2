import BillingAppClient from './BillingAppClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Billing App Free Download 2026 — Bill in 3 Sec [Android/iOS] | DineOpen',
  description: 'Free restaurant billing app for Android, iOS & tablet. Bill in 3 seconds, GST invoices, split bills, UPI/card/cash, KOT printing & offline mode. 1000+ restaurants trust DineOpen. Download free — no credit card.',
  keywords: 'restaurant billing app, restaurant bill app, restaurant billing app free, billing app for restaurant, restaurant billing app free download, table billing app, restaurant POS app, mobile billing app restaurant, restaurant billing software, best billing app for restaurant India, restaurant bill app free, free billing app restaurant',
  authors: [{ name: 'DineOpen Team' }],
  creator: 'DineOpen',
  publisher: 'DineOpen',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'Restaurant Billing App | Mobile POS & Billing | DineOpen',
    description: 'Best restaurant billing app for your phone and tablet. Bill in 3 seconds, split bills, UPI/card/cash, KOT printing, offline mode. Works on Android, iOS & Web.',
    url: 'https://www.dineopen.com/restaurant-billing-app',
    siteName: 'DineOpen',
    images: [
      {
        url: '/og-restaurant-billing-app.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen Restaurant Billing App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Billing App | Mobile POS & Billing | DineOpen',
    description: 'Best restaurant billing app for your phone and tablet. Bill in 3 seconds, QR scanning, split bills, UPI/card/cash, offline mode.',
    images: ['/og-restaurant-billing-app.jpg'],
  },
  alternates: {
    canonical: 'https://www.dineopen.com/restaurant-billing-app',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I use a restaurant billing app on my phone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen works as a full restaurant billing app on any smartphone, tablet, or laptop. No special hardware is needed — just open the app in your browser or download it on Android or iOS."
      }
    },
    {
      "@type": "Question",
      "name": "Does the billing app work offline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen has an offline mode that lets you take orders and generate bills even without an internet connection. Data syncs automatically when you are back online."
      }
    },
    {
      "@type": "Question",
      "name": "How fast can I generate a bill?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen generates bills in under 3 seconds. With quick-add buttons, QR code scanning, and saved customer preferences, billing is faster than any traditional POS system."
      }
    },
    {
      "@type": "Question",
      "name": "Does the app support UPI and card payments?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen supports UPI (Google Pay, PhonePe, Paytm), credit and debit cards, and cash payments. You can also split bills across multiple payment methods."
      }
    },
    {
      "@type": "Question",
      "name": "What is the cost of the restaurant billing app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen costs just Rs 300 per month in India or $9.99 per month internationally. There is a free 7-day trial with no credit card required."
      }
    }
  ]
};

export default function RestaurantBillingApp() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <BillingAppClient />
    </>
  );
}
