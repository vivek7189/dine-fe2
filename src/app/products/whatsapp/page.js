import WhatsAppLandingClient from './WhatsAppLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'WhatsApp for Restaurants | Ordering, Notifications & Marketing | DineOpen',
  description: 'Turn WhatsApp into your #1 ordering and marketing channel. Take orders, send order updates and digital bills, run broadcast campaigns with 90%+ open rates, collect reviews, and run an AI chatbot — on your own number or a ready-to-use rented number. Official WhatsApp Business API, built into your DineOpen POS.',
  keywords: 'whatsapp ordering for restaurants, whatsapp for restaurants, whatsapp business api restaurants, restaurant whatsapp marketing, whatsapp ordering system india, whatsapp broadcast restaurant, whatsapp chatbot restaurant, whatsapp pos integration, rented whatsapp number restaurant, whatsapp catalog restaurant, restaurant marketing whatsapp india',
  openGraph: {
    title: 'WhatsApp for Restaurants — Ordering, Notifications & Marketing | DineOpen',
    description: 'Orders, order updates, digital bills, broadcast campaigns, reviews and an AI chatbot — all on WhatsApp, built into your POS. Own number or ready-to-use rented number.',
    url: 'https://www.dineopen.com/products/whatsapp',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp for Restaurants | DineOpen',
    description: 'Take orders, send updates & bills, run 90%-open-rate campaigns, and an AI chatbot — on WhatsApp, inside your POS.',
  },
  alternates: { canonical: 'https://www.dineopen.com/products/whatsapp' },
};

export default function WhatsAppPage() {
  // ── Structured data (SEO + AEO) ──────────────────────────────────────────
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DineOpen WhatsApp Suite',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Restaurant WhatsApp Ordering & Marketing',
    description:
      'WhatsApp Business platform for restaurants: WhatsApp ordering, automated order-status notifications, digital bills and receipts, broadcast marketing campaigns, review collection, loyalty messaging, and an AI chatbot — using the official WhatsApp Business (Cloud) API, on the restaurant’s own number or a managed rented number, fully integrated with the DineOpen POS.',
    operatingSystem: 'Web, iOS, Android',
    url: 'https://www.dineopen.com/products/whatsapp',
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'INR', description: 'Included utility messaging on paid POS plans' },
      { '@type': 'Offer', price: '499', priceCurrency: 'INR', description: 'WhatsApp Marketing add-on (India)' },
      { '@type': 'Offer', price: '9', priceCurrency: 'USD', description: 'WhatsApp Marketing add-on' },
    ],
    featureList: [
      'WhatsApp ordering with catalog and cart',
      'Automated order-status notifications',
      'Digital bills and receipts on WhatsApp',
      'Broadcast marketing campaigns with customer segments',
      'AI chatbot for menu, orders and support',
      'Review collection and Google review funnel',
      'Loyalty, cashback and win-back messaging',
      'Ready-to-use rented WhatsApp number or bring your own',
    ],
    provider: { '@type': 'Organization', name: 'DineOpen', url: 'https://www.dineopen.com' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Can restaurants take orders on WhatsApp with DineOpen?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. Customers message your WhatsApp number, browse your menu via a catalog or an AI chatbot, and place an order that lands directly in your DineOpen POS and kitchen (KOT) — no third-party aggregator and no commission per order.' },
      },
      {
        '@type': 'Question',
        name: 'Do I need my own WhatsApp Business API number, or can I rent one?',
        acceptedAnswer: { '@type': 'Answer', text: 'Both work. You can connect your own number on the official WhatsApp Business (Cloud) API, or use a ready-to-use rented number provisioned by DineOpen with pre-approved templates so you go live in minutes with zero setup.' },
      },
      {
        '@type': 'Question',
        name: 'What can I send restaurant customers on WhatsApp?',
        acceptedAnswer: { '@type': 'Answer', text: 'Order confirmations and status updates (preparing, ready, out for delivery, delivered), digital bills and receipts, table-booking confirmations and reminders, marketing broadcasts (offers, new menu, festivals), loyalty and cashback alerts, birthday and win-back messages, and post-order feedback requests that route happy guests to your Google review page.' },
      },
      {
        '@type': 'Question',
        name: 'Why is WhatsApp better than SMS or email for restaurant marketing?',
        acceptedAnswer: { '@type': 'Answer', text: 'WhatsApp messages are typically opened by over 90% of recipients, far above the ~20% of email and SMS, and they support rich menus, images, buttons and instant two-way replies — which is why WhatsApp campaigns drive far more repeat orders for restaurants.' },
      },
      {
        '@type': 'Question',
        name: 'Is WhatsApp marketing compliant? Do customers have to opt in?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes. DineOpen manages opt-in consent and uses only Meta-approved message templates, so your WhatsApp marketing stays compliant with WhatsApp Business policy while you send campaigns to opted-in customers.' },
      },
      {
        '@type': 'Question',
        name: 'How much does WhatsApp for restaurants cost?',
        acceptedAnswer: { '@type': 'Answer', text: 'Order-related utility messaging is included on paid DineOpen POS plans. Marketing broadcasts and the AI chatbot are available as an affordable add-on, plus a small rental if you use a managed number. You pay only WhatsApp’s per-conversation charges with transparent pricing.' },
      },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to set up WhatsApp ordering and marketing for your restaurant',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Connect or rent a number', text: 'Connect your own WhatsApp Business number, or get a ready-to-use rented number from DineOpen — verified and live in minutes.' },
      { '@type': 'HowToStep', position: 2, name: 'Approve your templates', text: 'Pick from a library of pre-built, Meta-approved message templates for orders, bills, reminders and offers.' },
      { '@type': 'HowToStep', position: 3, name: 'Go live', text: 'Start taking orders, sending order updates and digital bills, and running broadcast campaigns — all from your DineOpen dashboard.' },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dineopen.com' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.dineopen.com/products' },
      { '@type': 'ListItem', position: 3, name: 'WhatsApp for Restaurants', item: 'https://www.dineopen.com/products/whatsapp' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <WhatsAppLandingClient />
    </>
  );
}
