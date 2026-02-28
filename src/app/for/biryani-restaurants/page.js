import BiryaniRestaurantsClient from './BiryaniRestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Biryani Restaurants | Hyderabadi, Lucknowi | DineOpen',
  description: 'Best POS software for biryani restaurants. Manage portion sizes (half/full/family), track dum cooking times, handle high-volume orders. Perfect for Hyderabadi, Lucknowi, Kolkata biryani.',
  keywords: 'biryani restaurant POS, biryani shop billing software, Hyderabadi biryani POS, Lucknowi biryani software, biryani portion management, dum biryani restaurant software',
  openGraph: {
    title: 'POS Software for Biryani Restaurants | DineOpen',
    description: 'Specialized POS for biryani restaurants with portion management and high-volume order handling.',
    url: 'https://www.dineopen.com/for/biryani-restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/biryani-restaurants',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for biryani restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for biryani restaurants, offering portion size management (half/full/family), high-volume order handling, and kitchen display systems for dum cooking workflows."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage biryani portion sizes like half, full, and family pack?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen lets you configure multiple portion sizes for each biryani variant. Customers can easily choose half, full, or family pack options during ordering."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen handle high-volume biryani orders during peak hours?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is built for high-volume operations with fast billing, kitchen display integration, and order queue management to handle lunch and dinner rush efficiently."
      }
    },
    {
      "@type": "Question",
      "name": "How much does biryani restaurant POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with a free Starter plan available. Portion management and high-volume billing features are included in all paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for biryani restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan so you can try the POS for your biryani restaurant. Upgrade to paid plans to access delivery integrations and analytics."
      }
    }
  ]
};

export default function BiryaniRestaurantsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <BiryaniRestaurantsClient />
    </>
  );
}
