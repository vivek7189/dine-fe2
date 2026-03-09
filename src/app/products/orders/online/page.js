import OnlineClient from './OnlineClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Online Ordering System for Restaurants | Commission-Free | DineOpen',
  description: 'Launch your own online ordering website for your restaurant. Zero commissions, zero transaction fees. Customers order directly from your branded page. Real-time order tracking and invoice generation.',
  keywords: 'online ordering restaurant, restaurant ordering website, commission free ordering, direct online ordering, restaurant online menu, food ordering system, web ordering restaurant',
  openGraph: {
    title: 'Online Ordering System for Restaurants | DineOpen',
    description: 'Your branded ordering website with zero commissions. Customers order directly from you.',
    url: 'https://www.dineopen.com/products/orders/online',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/orders/online',
  },
};

export default function OnlinePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Online Ordering",
    "description": "Commission-free online ordering system for restaurants with branded ordering pages and real-time tracking.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.dineopen.com/products/orders/online",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Branded ordering page",
      "Zero commissions",
      "Real-time order tracking",
      "Invoice generation",
      "Menu customization",
      "Order notifications"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How is DineOpen different from Zomato or Swiggy for online ordering?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen gives you your own branded ordering page with zero commissions. Zomato and Swiggy take 15-30% of every order. With DineOpen, you pay a flat monthly fee and keep 100% of order revenue. You also own the customer data and relationship."
        }
      },
      {
        "@type": "Question",
        "name": "Do customers need to download an app to order online?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. Your online ordering page works in any web browser. Customers simply visit your ordering URL, browse the menu, and place their order. No app download, no sign-up friction."
        }
      },
      {
        "@type": "Question",
        "name": "Can I customize the look of my ordering page?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Your ordering page features your restaurant name, logo, and menu. The page is designed to be clean and fast-loading on mobile devices, which is where most online orders come from."
        }
      },
      {
        "@type": "Question",
        "name": "How do I receive online orders?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Online orders appear instantly on your DineOpen dashboard with sound notifications. They also generate KOTs for the kitchen display. You can manage all orders from your POS, tablet, or phone."
        }
      },
      {
        "@type": "Question",
        "name": "Can I accept online payments?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen integrates with popular payment gateways. Customers can pay online via UPI, cards, or wallets. You can also accept cash on delivery for takeout and delivery orders."
        }
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Orders", "item": "https://www.dineopen.com/products/orders" },
      { "@type": "ListItem", "position": 4, "name": "Online Ordering", "item": "https://www.dineopen.com/products/orders/online" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <OnlineClient />
    </>
  );
}
