import ChineseRestaurantsClient from './ChineseRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Chinese & Indo-Chinese Restaurants | DineOpen',
  description: 'Best POS for Chinese and Indo-Chinese restaurants. Manage wok stations, combo meals, customizations (spice level, gravy). Fast billing for high-volume takeaway.',
  keywords: 'Chinese restaurant POS, Indo-Chinese restaurant software, wok station management, noodle shop POS, Chinese takeaway software, manchurian restaurant POS, fast food Chinese POS',
  openGraph: {
    title: 'POS Software for Chinese Restaurants | DineOpen',
    description: 'Specialized POS for Chinese restaurants with wok management, combo meals, and high-volume billing.',
    url: 'https://www.dineopen.com/for/chinese-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/chinese-restaurants',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for Chinese and Indo-Chinese restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for Chinese and Indo-Chinese restaurants, offering wok station management, combo meal configuration, spice level customizations, and high-volume takeaway billing."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle customizations like spice level and gravy options?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports unlimited customizations including spice levels, gravy choices, and add-ons. Each customization is clearly printed on kitchen tickets to reduce order errors."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support fast billing for Chinese takeaway orders?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is optimized for high-volume takeaway billing with quick item selection, combo shortcuts, and delivery integration for fast Chinese food operations."
      }
    },
    {
      "@type": "Question",
      "name": "How much does Chinese restaurant POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with a free Starter plan available. Combo management and customization features are included in all paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for Chinese restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan to try core features. Upgrade to access combo management, kitchen display systems, and delivery platform integrations."
      }
    }
  ]
};

export default function ChineseRestaurantsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <ChineseRestaurantsClient />
    </>
  );
}
