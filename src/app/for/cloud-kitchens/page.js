import CloudKitchensClient from './CloudKitchensClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Cloud Kitchens India | DineOpen',
  description: 'Best POS software for cloud kitchens and ghost kitchens in India. Multi-brand management, delivery integration, order aggregation, real-time analytics.',
  keywords: 'cloud kitchen POS India, ghost kitchen software, delivery kitchen management, multi-brand kitchen POS, dark kitchen software India',
  openGraph: {
    title: 'POS Software for Cloud Kitchens India | DineOpen',
    description: 'Best POS software for cloud kitchens in India with multi-brand management and delivery integration.',
    url: 'https://www.dineopen.com/for/cloud-kitchens',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/cloud-kitchens',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for cloud kitchens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for cloud kitchens and ghost kitchens, offering delivery-focused workflows, multi-brand support, order aggregation, and real-time analytics for delivery operations."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen integrate with Zomato and Swiggy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen integrates directly with major delivery platforms like Zomato and Swiggy, allowing you to manage all delivery orders from a single dashboard."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage multiple brands in one kitchen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports multi-brand management from a single kitchen. You can run separate menus, pricing, and analytics for each brand while sharing the same kitchen infrastructure."
      }
    },
    {
      "@type": "Question",
      "name": "How much does cloud kitchen POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at just $20/month with a 7-day free trial available. Multi-brand and delivery integrations are included in the paid plans with no hidden fees."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for cloud kitchens?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen provides a 7-day free trial to explore core features. You can upgrade to paid plans anytime to access delivery integrations and multi-brand support."
      }
    }
  ]
};

export default function CloudKitchensPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CloudKitchensClient />
    </>
  );
}
