import ThaliRestaurantsClient from './ThaliRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Thali Restaurants | Gujarati, Rajasthani Thali | DineOpen',
  description: 'Best POS software for unlimited thali restaurants. Track refills, manage unlimited items, handle rush hours. Perfect for Gujarati thali, Rajasthani thali, South Indian meals.',
  keywords: 'thali restaurant POS, unlimited thali software, Gujarati thali billing, Rajasthani thali POS, meals restaurant software, thali refill tracking',
  openGraph: {
    title: 'POS Software for Thali Restaurants | DineOpen',
    description: 'Specialized POS for thali restaurants with unlimited item tracking and refill management.',
    url: 'https://www.dineopen.com/for/thali-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/thali-restaurants',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for thali restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for thali restaurants, offering unlimited item tracking, refill management, fixed-price thali billing, and rush hour handling for Gujarati and Rajasthani thali setups."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen track unlimited thali refills?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen tracks refills and unlimited items served per table. This helps you analyze food consumption patterns and optimize portion planning to reduce waste."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support fixed-price thali billing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports fixed-price thali billing where you can set different prices for lunch, dinner, or special thalis. Add-on items like extra sweets can be billed separately."
      }
    },
    {
      "@type": "Question",
      "name": "How much does thali restaurant POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial available. Thali management and refill tracking features are included in all paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for thali restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial to try core POS features. Upgrade to access unlimited item tracking, consumption analytics, and multi-location support."
      }
    }
  ]
};

export default function ThaliRestaurantsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ThaliRestaurantsClient />
    </>
  );
}
