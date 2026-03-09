import LoyaltyLandingClient from './LoyaltyLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Customer Loyalty Program for Restaurants | CRM & Rewards | DineOpen Loyalty',
  description: 'Complete customer loyalty platform for restaurants. CRM, rewards program, promotional offers, WhatsApp marketing, and branded customer app. Increase repeat visits by 40%. Spark plan from $9.99/month.',
  keywords: 'restaurant loyalty program, restaurant CRM, customer rewards, WhatsApp marketing restaurants, restaurant customer app, loyalty software, customer retention restaurant, repeat customers, promotional offers restaurant, DineOpen Loyalty',
  openGraph: {
    title: 'Customer Loyalty Program for Restaurants | CRM & Rewards | DineOpen Loyalty',
    description: 'CRM, rewards, offers, WhatsApp marketing & branded customer app. Turn first-time visitors into loyal regulars.',
    url: 'https://www.dineopen.com/products/loyalty',
    siteName: 'DineOpen',
    images: [{ url: 'https://www.dineopen.com/og-loyalty.jpg', width: 1200, height: 630, alt: 'DineOpen Loyalty - Customer Loyalty Platform for Restaurants' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Customer Loyalty Program for Restaurants | DineOpen Loyalty',
    description: 'CRM, rewards, WhatsApp marketing & branded customer app. Increase repeat visits by 40%.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/loyalty',
  },
};

export default function LoyaltyPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Loyalty",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Customer Loyalty & CRM Software",
    "description": "Complete customer loyalty platform for restaurants. Includes CRM, rewards program, promotional offers, WhatsApp marketing campaigns, and a branded customer-facing app (Crave).",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/loyalty",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Spark Plan - all loyalty features included" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR", "description": "Spark Plan India - all loyalty features included" },
      { "@type": "Offer", "price": "89", "priceCurrency": "USD", "description": "Blaze Plan - all loyalty features included" },
      { "@type": "Offer", "price": "2500", "priceCurrency": "INR", "description": "Blaze Plan India - all loyalty features included" }
    ],
    "featureList": [
      "Customer CRM with contact database",
      "Points-based loyalty rewards",
      "Promotional offers management",
      "WhatsApp marketing campaigns",
      "Branded customer app (Crave)",
      "Customer order history tracking",
      "Customer segmentation and analytics",
      "Automated engagement campaigns"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "320"
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is DineOpen Loyalty?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen Loyalty is a complete customer engagement platform for restaurants. It includes a CRM for managing customer data, a loyalty rewards program, promotional offers management, WhatsApp marketing campaigns, and a branded customer-facing app called Crave. All features are included in every DineOpen plan with zero transaction fees."
        }
      },
      {
        "@type": "Question",
        "name": "How much does DineOpen Loyalty cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All loyalty features are included in DineOpen plans. The Spark Plan starts at $9.99/month (or Rs 300/month in India) and the Blaze Plan is $89/month (or Rs 2,500/month in India). There are zero transaction fees on any plan. Unlike standalone loyalty apps that charge separately, DineOpen includes CRM, rewards, WhatsApp marketing, and more at no extra cost."
        }
      },
      {
        "@type": "Question",
        "name": "How does the restaurant CRM work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen's CRM automatically captures customer details (phone, email, address) when they place orders. You can search, sort, and filter your customer database, view each customer's complete order history with last order date, and segment customers for targeted marketing. All customer data syncs across POS, online orders, and the Crave app."
        }
      },
      {
        "@type": "Question",
        "name": "What is the Crave customer app?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Crave is a branded customer-facing app that your restaurant gets with DineOpen. Customers can view your menu, place orders, track their loyalty points, redeem rewards, and receive promotional offers directly through the app. It helps you build a direct relationship with customers without relying on third-party delivery platforms."
        }
      },
      {
        "@type": "Question",
        "name": "Can I send WhatsApp marketing campaigns?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen includes WhatsApp marketing built in. You can send promotional offers, new menu announcements, birthday greetings, and re-engagement campaigns directly to customers on WhatsApp. WhatsApp messages have a 95% open rate compared to 20% for email, making it the most effective marketing channel for restaurants."
        }
      },
      {
        "@type": "Question",
        "name": "How is DineOpen Loyalty different from Reelo or FiveStars?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Unlike standalone loyalty apps like Reelo (Rs 2,500+/month) or FiveStars ($299+/month), DineOpen Loyalty is included with your POS subscription. You get CRM, rewards, offers, WhatsApp marketing, and a customer app all in one platform. No separate subscriptions, no transaction fees, and everything is integrated with your POS and ordering system."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need technical knowledge to set up a loyalty program?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No technical knowledge is needed. DineOpen's loyalty program can be set up in minutes. Just define your reward rules (points per rupee spent, reward thresholds), create your offers, and the system handles everything automatically. Customer data is captured during ordering, points are calculated automatically, and WhatsApp notifications are sent without any manual effort."
        }
      },
      {
        "@type": "Question",
        "name": "Can I track which promotions are working?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, DineOpen provides analytics on all your loyalty and marketing activities. Track redemption rates, customer visit frequency, campaign performance, and customer lifetime value. The analytics dashboard helps you understand which promotions drive the most repeat visits and revenue so you can optimize your marketing spend."
        }
      }
    ]
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "DineOpen Loyalty", "item": "https://www.dineopen.com/products/loyalty" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <LoyaltyLandingClient />
    </>
  );
}
