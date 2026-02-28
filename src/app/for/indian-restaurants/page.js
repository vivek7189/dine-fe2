import IndianRestaurantsClient from './IndianRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Indian Restaurants | Thali, Biryani, Tandoor | DineOpen',
  description: 'Best POS software for Indian restaurants. Manage thali combos, tandoor orders, biryani portions, regional cuisines. Multi-language support, GST billing, delivery integration.',
  keywords: 'Indian restaurant POS, thali restaurant software, biryani restaurant POS, tandoor management, North Indian restaurant software, South Indian restaurant POS, regional cuisine POS India',
  openGraph: {
    title: 'POS Software for Indian Restaurants | DineOpen',
    description: 'Specialized POS for Indian restaurants with thali management, regional cuisine support, and multi-language ordering.',
    url: 'https://www.dineopen.com/for/indian-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/indian-restaurants',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for Indian restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for Indian restaurants, offering thali combo management, tandoor order tracking, multi-language support, GST billing, and delivery integration."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support multi-language menus for Indian restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports multi-language menus so your staff and customers can view items in Hindi, English, or regional languages. Kitchen tickets can also be printed in the preferred language."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage thali combos and regional cuisine menus?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen makes it easy to create thali combos, set up regional cuisine categories, and manage diverse Indian menus with customizable portion sizes and pricing."
      }
    },
    {
      "@type": "Question",
      "name": "How much does Indian restaurant POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month (approximately ₹300 in India) with a free Starter plan. GST billing and multi-language support are included in all plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for Indian restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan with core POS features. Upgrade to paid plans for delivery integration, advanced analytics, and multi-location support."
      }
    }
  ]
};

export default function IndianRestaurantsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <IndianRestaurantsClient />
    </>
  );
}
