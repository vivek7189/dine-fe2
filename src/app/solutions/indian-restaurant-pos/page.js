import IndianRestaurantPOSClient from './IndianRestaurantPOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Best POS for Indian Restaurants 2026 | Curry House, Thali, Tandoor | DineOpen',
  description: 'Best POS system for Indian restaurants worldwide. Spice level customization, thali combos, complex modifiers, Hindi/English menus. Perfect for curry houses in USA, UK, UAE, Canada.',
  keywords: 'best POS Indian restaurant, Indian restaurant POS USA, curry house EPOS UK, Indian restaurant software, thali POS system, tandoor restaurant POS',
  openGraph: {
    title: 'Best POS for Indian Restaurants 2026 | Curry House, Thali, Tandoor | DineOpen',
    description: 'Best POS system for Indian restaurants worldwide. Spice level customization, thali combos, complex modifiers, Hindi/English menus. Perfect for curry houses in USA, UK, UAE, Canada.',
    url: 'https://www.dineopen.com/solutions/indian-restaurant-pos',
    siteName: 'DineOpen',
    images: [
      {
        url: 'https://www.dineopen.com/og-indian-restaurant-pos.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen - Best POS for Indian Restaurants',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Best POS for Indian Restaurants 2026 | DineOpen',
    description: 'Spice level customization, thali combos, complex modifiers, Hindi/English menus. Built for Indian cuisine complexity.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions/indian-restaurant-pos',
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DineOpen POS for Indian Restaurants",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "description": "POS system built for Indian restaurants with spice level customization, thali combos, complex modifiers, and multi-language menus.",
  "offers": {
    "@type": "Offer",
    "price": "10",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "320",
    "bestRating": "5"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS system for Indian restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for Indian restaurants because it handles spice level customization, thali combo builders, gravy/dry selections, naan modifiers, and biryani portion sizes natively. Most generic POS systems cannot handle the complexity of Indian cuisine menus with 200+ items and dozens of modifiers per dish."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle thali combos and meal deals?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen has a built-in thali/combo builder that lets customers choose their dal, sabzi, roti type, rice, and extras. Each component can have its own modifiers like spice level. This is something most generic POS systems struggle with."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support Hindi and regional language menus?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports multi-language menus including Hindi, English, Tamil, Telugu, Gujarati, and more. You can display menu items in multiple languages simultaneously, which is essential for Indian restaurants serving diverse communities worldwide."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen integrate with Zomato and Swiggy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen integrates with Zomato and Swiggy for Indian restaurants, as well as DoorDash, Uber Eats, Deliveroo, Just Eat, Talabat, Skip The Dishes, and Menulog for Indian restaurants operating in USA, UK, UAE, Canada, and Australia."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen work for Indian restaurants in USA, UK, and UAE?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. DineOpen is used by Indian restaurants across the USA, UK, UAE, Canada, Australia, and India. It handles local tax regulations (sales tax, VAT, GST), local delivery platform integrations, and multi-currency support for each country."
      }
    }
  ]
};

export default function IndianRestaurantPOSPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <IndianRestaurantPOSClient />
    </>
  );
}
