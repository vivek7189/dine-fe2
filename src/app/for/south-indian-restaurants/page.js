import SouthIndianRestaurantsClient from './SouthIndianRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for South Indian Restaurants | Dosa, Idli, Filter Coffee | DineOpen',
  description: 'Best POS software for South Indian restaurants. Manage dosa variants, idli combos, filter coffee tracking. Perfect for Udupi hotels, darshinis, and authentic South Indian cuisine.',
  keywords: 'South Indian restaurant POS, dosa restaurant software, idli billing software, filter coffee shop POS, Udupi hotel POS, darshini software, Tamil restaurant POS',
  openGraph: {
    title: 'POS Software for South Indian Restaurants | DineOpen',
    description: 'Specialized POS for South Indian restaurants with dosa variants and filter coffee management.',
    url: 'https://www.dineopen.com/for/south-indian-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/south-indian-restaurants',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for South Indian restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for South Indian restaurants, offering dosa variant management, idli combo billing, filter coffee tracking, and fast billing for darshini-style service."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage dosa variants and South Indian combos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen handles extensive dosa menus with variants like masala, rava, and set dosa. You can create unlimited combos with idli, vada, and filter coffee pairings."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support fast billing for darshini restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is optimized for darshini-style quick service with one-tap billing, pre-set combos, and counter-based ordering that keeps queues moving fast."
      }
    },
    {
      "@type": "Question",
      "name": "How much does South Indian restaurant POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with a free Starter plan available. All South Indian restaurant features including combo management and fast billing are included."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for South Indian restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan with core POS features. Upgrade to access kitchen display systems, delivery integration, and advanced analytics."
      }
    }
  ]
};

export default function SouthIndianRestaurantsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SouthIndianRestaurantsClient />
    </>
  );
}
