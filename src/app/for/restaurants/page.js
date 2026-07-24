import RestaurantsClient from './RestaurantsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Small Restaurants India | DineOpen',
  description: 'Best POS software for small restaurants in India. QR menu, GST billing, UPI payments, inventory management. Built for dhabas, family restaurants & eateries.',
  keywords: 'restaurant POS India, small restaurant billing software, dhaba POS system, family restaurant software, restaurant management India',
  openGraph: {
    title: 'POS Software for Small Restaurants India | DineOpen',
    description: 'Best POS software for small restaurants in India with QR menu, GST billing, and UPI payments.',
    url: 'https://www.dineopen.com/for/restaurants',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/restaurants',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS software for small restaurants in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for small restaurants in India, offering QR menu ordering, GST billing, UPI payments, and inventory management at an affordable price."
      }
    },
    {
      "@type": "Question",
      "name": "How much does restaurant POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at just $20/month (approximately ₹299 in India). A 7-day free trial is also available for restaurants just getting started with digital billing."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support QR menu and UPI payments?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports QR code menus for contactless ordering and integrates with UPI payment methods, making it easy for customers to pay digitally."
      }
    },
    {
      "@type": "Question",
      "name": "Is DineOpen GST compliant for Indian restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen is fully GST compliant with automatic tax calculations, GST invoice generation, and GSTR-ready reports for hassle-free tax filing."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for restaurants?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial with core POS features. You can try it risk-free and upgrade to paid plans as your restaurant business grows."
      }
    }
  ]
};

export default function RestaurantsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <RestaurantsClient />
    </>
  );
}
