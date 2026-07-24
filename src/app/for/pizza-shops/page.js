import PizzaShopsClient from './PizzaShopsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Pizza Shops | Toppings, Combos, Delivery | DineOpen',
  description: 'Best POS for pizza shops and pizzerias. Manage toppings, half-half pizzas, combo deals, delivery zones. Domino\'s style order tracking. Reduce order errors.',
  keywords: 'pizza shop POS, pizzeria software, pizza delivery POS, pizza topping management, pizza combo software, pizza order tracking, pizza restaurant POS India',
  openGraph: {
    title: 'POS Software for Pizza Shops | DineOpen',
    description: 'Specialized POS for pizza shops with topping management, combo deals, and delivery tracking.',
    url: 'https://www.dineopen.com/for/pizza-shops',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/pizza-shops',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the best POS for pizza shops and pizzerias?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen is the best POS for pizza shops, offering topping management, half-half pizza configuration, combo deals, delivery zone mapping, and real-time order tracking."
      }
    },
    {
      "@type": "Question",
      "name": "Can DineOpen handle pizza toppings and half-half pizzas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen supports unlimited topping selections, half-half pizza configurations, crust choices, and size variants. Each customization is clearly printed on kitchen tickets."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen support pizza delivery tracking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen provides delivery zone management and order tracking so customers can follow their pizza from preparation to delivery, similar to major pizza chains."
      }
    },
    {
      "@type": "Question",
      "name": "How much does pizza shop POS software cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DineOpen starts at $20/month with a 7-day free trial available. Topping management, combo deals, and delivery tracking are all included in paid plans."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen offer a free trial for pizza shops?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DineOpen offers a 7-day free trial to try core POS features for your pizzeria. Upgrade to access delivery tracking, combo management, and analytics."
      }
    }
  ]
};

export default function PizzaShopsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PizzaShopsClient />
    </>
  );
}
