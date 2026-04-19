import RestaurantNameClient from './RestaurantNameClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Name Generator [Free, AI-Powered] | 500+ Ideas Instantly | DineOpen',
  description: 'AI-powered restaurant name generator — get 500+ unique name ideas for cafes, bars, Indian restaurants, Italian bistros, food trucks & more. Filter by cuisine, vibe & style. Free, no signup.',
  keywords: 'restaurant name generator, cafe name ideas, bar name generator, restaurant name ideas, creative restaurant names, unique cafe names, food truck names, bistro names, Indian restaurant names, Italian restaurant names, Chinese restaurant names, restaurant naming tips, how to name a restaurant',
  openGraph: {
    title: 'Restaurant Name Generator [Free, AI-Powered] | 500+ Ideas Instantly | DineOpen',
    description: 'Generate unique restaurant names instantly. Creative ideas for cafes, bars, food trucks & more.',
    url: 'https://www.dineopen.com/tools/restaurant-name-generator',
    siteName: 'DineOpen',
    type: 'website',
    images: [
      {
        url: 'https://www.dineopen.com/favicon.png',
        width: 1200,
        height: 630,
        alt: 'DineOpen Restaurant Name Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Restaurant Name Generator | DineOpen',
    description: 'Generate unique restaurant names instantly. Free AI-powered generator.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/restaurant-name-generator',
    languages: {
      'en': 'https://www.dineopen.com/tools/restaurant-name-generator',
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Restaurant Name Generator",
  "description": "Free AI-powered restaurant name generator. Get creative name ideas for any type of restaurant.",
  "url": "https://www.dineopen.com/tools/restaurant-name-generator",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "publisher": {
    "@type": "Organization",
    "name": "DineOpen",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.dineopen.com/favicon.png"
    }
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I choose a good restaurant name?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A good restaurant name should be memorable, easy to pronounce and spell, reflect your cuisine or concept, and be available as a domain name and social media handle. Avoid names that are too long (2-3 words is ideal), too generic, or too similar to existing restaurants in your area. Test your top choices with friends and potential customers before committing."
      }
    },
    {
      "@type": "Question",
      "name": "Should my restaurant name include the type of cuisine?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Including cuisine type (e.g., 'Tokyo Ramen House' or 'Bella Italia Trattoria') helps with SEO and immediately tells customers what to expect. However, it can limit you if you want to expand your menu later. Many successful restaurants use abstract or personal names (e.g., 'Eleven Madison Park', 'Noma') that build brand identity independent of cuisine."
      }
    },
    {
      "@type": "Question",
      "name": "How do I check if a restaurant name is already taken?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Search for the name on Google, check domain availability (GoDaddy, Namecheap), search social media platforms (Instagram, Facebook, TikTok), check your state's business name registry, and search the USPTO trademark database. Also check Google Maps in your city to ensure no nearby restaurant has a similar name that could cause confusion."
      }
    },
    {
      "@type": "Question",
      "name": "What makes a restaurant name memorable?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Memorable restaurant names often use alliteration ('Burger Barn'), wordplay ('Wok This Way'), personal stories ('Mama Rosa's'), location references ('The Brooklyn Diner'), or evocative words that create imagery ('The Golden Spoon', 'Ember & Ash'). Keep it under 3 words, easy to spell, and easy to say out loud — customers need to be able to recommend you by word of mouth."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use an AI restaurant name generator for my business?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, AI name generators are a great starting point for brainstorming. They can suggest hundreds of creative options based on your cuisine type, vibe, and preferences. Use them to generate a long list, then shortlist your favorites and verify availability (domain, social media, trademark). Many successful restaurant owners use AI-generated names as inspiration and then customize them to make them unique."
      }
    }
  ]
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.dineopen.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Free Tools",
      "item": "https://www.dineopen.com/tools"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Restaurant Name Generator",
      "item": "https://www.dineopen.com/tools/restaurant-name-generator"
    }
  ]
};

export default function RestaurantNameGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <RestaurantNameClient />
    </>
  );
}
