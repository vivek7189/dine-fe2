import CafesClient from './CafesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Cafes & Coffee Shops India | DineOpen',
  description: 'Best POS software for cafes and coffee shops in India. QR ordering, quick billing, loyalty programs, inventory tracking. Perfect for coffee shops and bakery cafes.',
  keywords: 'cafe POS India, coffee shop billing software, cafe management system, quick service POS, bakery cafe software India',
  openGraph: {
    title: 'POS Software for Cafes & Coffee Shops India | DineOpen',
    description: 'Best POS software for cafes and coffee shops in India with quick billing and loyalty programs.',
    url: 'https://www.dineopen.com/for/cafes',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/cafes',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS software for cafes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS software for cafes and coffee shops. It offers quick billing, QR code ordering, loyalty programs, and inventory tracking designed specifically for cafe operations."
      }
    },
    {
      "@type": "Question",
      "name": "How much does cafe POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at just $9.99/month (approximately ₹300 in India). There is also a free Starter plan available for small cafes to get started without any upfront cost."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support QR code ordering for cafes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen provides contactless QR code menus that let your cafe customers browse the menu and place orders directly from their phones. This speeds up service and reduces wait times."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen manage multiple cafe locations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports multi-location management. The Spark plan supports up to 3 locations, while the Blaze plan offers unlimited locations with centralized reporting and menu management."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for cafes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan that lets you explore core features. You can upgrade to paid plans anytime as your cafe grows, with no long-term commitments required."
      }
    }
  ]
};

export default function CafesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <CafesClient />
    </>
  );
}
