import TiffinServicesClient from './TiffinServicesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Tiffin Services | Subscription Management | DineOpen',
  description: 'Best billing software for tiffin services in India. Manage subscriptions, meal plans, delivery routes, and customer payments. Built for dabba services.',
  keywords: 'tiffin service software, dabba service billing, tiffin subscription management, meal subscription software, tiffin delivery software, lunch box delivery software',
  openGraph: {
    title: 'POS Software for Tiffin Services | DineOpen',
    description: 'Manage tiffin subscriptions, deliveries, and billing with DineOpen.',
    url: 'https://www.dineopen.com/for/tiffin-services',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/tiffin-services' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best software for tiffin services?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best software for tiffin and dabba services, offering subscription management, meal plan scheduling, delivery route planning, and automated customer billing."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage tiffin subscriptions and meal plans?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports daily, weekly, and monthly tiffin subscriptions. You can manage meal plans, pause and resume subscriptions, and track delivery schedules easily."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen handle delivery route planning for tiffin services?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen helps organize delivery routes for efficient tiffin distribution. You can group customers by area and optimize delivery sequences to save time."
      }
    },
    {
      "@type": "Question",
      "name": "How much does tiffin service software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial available. Subscription management and delivery tracking features are included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for tiffin services?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial to try core features. Upgrade to access subscription management, delivery route planning, and automated billing."
      }
    }
  ]
};

export default function TiffinServicesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <TiffinServicesClient />
    </>
  );
}
