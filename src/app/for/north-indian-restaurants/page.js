import NorthIndianRestaurantsClient from './NorthIndianRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for North Indian Restaurants | Punjabi, Mughlai | DineOpen',
  description: 'Best POS software for North Indian restaurants. Tandoor management, butter chicken portions, naan queue. Perfect for Punjabi dhaba, Mughlai cuisine, and North Indian fine dining.',
  keywords: 'North Indian restaurant POS, Punjabi restaurant software, Mughlai cuisine billing, tandoor management POS, butter chicken restaurant software, dhaba POS software',
  openGraph: {
    title: 'POS Software for North Indian Restaurants | DineOpen',
    description: 'Specialized POS for North Indian restaurants with tandoor management and portion control.',
    url: 'https://www.dineopen.com/for/north-indian-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/north-indian-restaurants',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for North Indian restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for North Indian restaurants, offering tandoor management, portion control for gravies and breads, kitchen display systems, and GST billing."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support tandoor order management?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports tandoor station management with order queuing, naan and roti tracking, and kitchen display integration to ensure timely preparation of tandoor items."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage Punjabi and Mughlai cuisine menus?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen handles complex North Indian menus with categories for Punjabi, Mughlai, and tandoor items. You can set up portion sizes, gravies, and bread varieties easily."
      }
    },
    {
      "@type": "Question",
      "name": "How much does North Indian restaurant POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with a free Starter plan available. Tandoor management and kitchen display features are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for North Indian restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan to try core POS features. Upgrade to access tandoor management, delivery integration, and multi-location support."
      }
    }
  ]
};

export default function NorthIndianRestaurantsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NorthIndianRestaurantsClient />
    </>
  );
}
