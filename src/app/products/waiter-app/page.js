import WaiterAppClient from './WaiterAppClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Waiter & Captain App for Restaurants | Tableside Ordering | DineOpen',
  description: 'Free waiter & captain ordering app for restaurants. Take orders tableside, send directly to kitchen, sync across all devices. Works offline. Android & iOS. Reduce order errors by 90%.',
  keywords: 'waiter app, captain app restaurant, tableside ordering app, restaurant order taking app, waiter ordering system, server app restaurant, mobile POS waiter, restaurant staff app, KOT app, kitchen order app, waitress app, order taking tablet',
  openGraph: {
    title: 'Waiter & Captain App | Tableside Ordering | DineOpen',
    description: 'Take orders tableside, send to kitchen instantly. Sync across all devices. Free with DineOpen POS.',
    url: 'https://www.dineopen.com/products/waiter-app',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-waiter-app.jpg', width: 1200, height: 630, alt: 'DineOpen Waiter & Captain App' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Waiter & Captain App | Tableside Ordering | DineOpen',
    description: 'Take orders tableside, send to kitchen instantly. Free with DineOpen POS.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/waiter-app',
  },
};

export default function WaiterAppPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    "name": "DineOpen Waiter & Captain App",
    "description": "Mobile app for restaurant waiters and captains to take orders tableside and send directly to kitchen. Real-time sync across all devices.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Android, iOS",
    "url": "https://www.dineopen.com/products/waiter-app",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free with DineOpen POS subscription"
    },
    "featureList": [
      "Tableside order taking",
      "Direct kitchen sync",
      "Real-time order status",
      "Offline mode",
      "Table management",
      "Split bill support",
      "Item modifiers",
      "Special instructions",
      "Multi-device sync"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "450"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a waiter app for restaurants?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A waiter app allows restaurant staff to take orders directly at the table using a phone or tablet, eliminating the need to walk back to the POS terminal. Orders sync instantly to the kitchen display or printer."
        }
      },
      {
        "@type": "Question",
        "name": "Does the waiter app work offline?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! DineOpen's waiter app works offline. Orders are stored locally and automatically sync when internet connection returns. Perfect for outdoor events, beach restaurants, and areas with poor connectivity."
        }
      },
      {
        "@type": "Question",
        "name": "How many devices can use the waiter app?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unlimited! DineOpen allows unlimited staff devices at no extra cost. Your entire team - waiters, captains, managers - can use the app simultaneously on their own phones."
        }
      },
      {
        "@type": "Question",
        "name": "Is the waiter app free with DineOpen?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, the Waiter & Captain app is included free with all DineOpen subscriptions. No per-device fees, no extra charges. Download from Play Store or App Store."
        }
      },
      {
        "@type": "Question",
        "name": "Can waiters split bills using the app?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! The app supports split billing by item, by person, or by custom amounts. Waiters can process payments right at the table for faster turnover."
        }
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <WaiterAppClient />
    </>
  );
}
