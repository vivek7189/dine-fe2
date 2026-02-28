import IceCreamParlorsClient from './IceCreamParlorsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Ice Cream Parlors India | Gelato & Frozen Desserts | DineOpen',
  description: 'Best POS for ice cream parlors, gelato shops & frozen dessert stores in India. Scoop billing, combo offers, loyalty programs, seasonal menu management. ₹999/month.',
  keywords: 'ice cream parlor POS India, gelato shop software, frozen dessert billing, scoop billing software, ice cream shop management, dessert parlor POS',
  openGraph: {
    title: 'POS Software for Ice Cream Parlors India | DineOpen',
    description: 'Best POS for ice cream parlors with scoop billing, combo offers, and loyalty programs.',
    url: 'https://www.dineopen.com/for/ice-cream-parlors',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/for/ice-cream-parlors' },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for ice cream parlors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for ice cream parlors and gelato shops, offering scoop-based billing, combo offers, loyalty programs, and seasonal menu management."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle scoop-based billing and toppings?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports scoop-based pricing with topping add-ons, cone/cup options, and sundae customizations. Billing is quick and accurate even during peak summer rush."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support loyalty programs for ice cream parlors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers built-in loyalty programs where customers earn points on every purchase. This helps ice cream parlors build repeat customers and increase sales."
      }
    },
    {
      "@type": "Question",
      "name": "How much does ice cream parlor POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $9.99/month with a free Starter plan available. Scoop billing, combos, and loyalty features are all included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for ice cream parlors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a free Starter plan to try core features. Upgrade anytime to access loyalty programs, seasonal menu management, and multi-location support."
      }
    }
  ]
};

export default function IceCreamParlorsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <IceCreamParlorsClient />
    </>
  );
}
