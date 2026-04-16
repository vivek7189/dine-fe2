import RestaurantNameClient from './RestaurantNameClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Name Generator [Free, AI-Powered] | 500+ Ideas Instantly | DineOpen',
  description: 'AI-powered restaurant name generator — get 500+ unique name ideas for cafes, bars, Indian restaurants, Italian bistros, food trucks & more. Filter by cuisine, vibe & style. Free, no signup.',
  keywords: 'restaurant name generator, cafe name ideas, bar name generator, restaurant name ideas, creative restaurant names, unique cafe names, food truck names, bistro names, Indian restaurant names, Italian restaurant names, Chinese restaurant names',
  openGraph: {
    title: 'Restaurant Name Generator [Free, AI-Powered] | 500+ Ideas Instantly | DineOpen',
    description: 'Generate unique restaurant names instantly. Creative ideas for cafes, bars, food trucks & more.',
    url: 'https://www.dineopen.com/tools/restaurant-name-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Restaurant Name Generator | DineOpen',
    description: 'Generate unique restaurant names instantly. Free AI-powered generator.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/restaurant-name-generator',
  },
};

export default function RestaurantNameGeneratorPage() {
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
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <RestaurantNameClient />
    </>
  );
}
