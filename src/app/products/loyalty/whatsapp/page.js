import WhatsappClient from './WhatsappClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'WhatsApp Marketing for Restaurants | Campaigns & Automation | DineOpen',
  description: 'Send WhatsApp marketing campaigns to your restaurant customers. 95% open rate. Automated birthday wishes, re-engagement messages, new offer announcements. Included with DineOpen.',
  keywords: 'WhatsApp marketing restaurant, restaurant WhatsApp campaigns, WhatsApp automation restaurant, restaurant marketing WhatsApp, WhatsApp business restaurant, customer engagement WhatsApp, restaurant SMS marketing, WhatsApp promotions restaurant',
  openGraph: {
    title: 'WhatsApp Marketing for Restaurants | Campaigns & Automation | DineOpen',
    description: 'Reach customers where they are. 95% open rate on WhatsApp vs 20% for email.',
    url: 'https://www.dineopen.com/products/loyalty/whatsapp',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Marketing for Restaurants | DineOpen',
    description: 'WhatsApp campaigns with 95% open rate. Automated, targeted, and effective.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/loyalty/whatsapp',
  },
};

export default function WhatsappPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen WhatsApp Marketing",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Marketing Automation Software",
    "description": "WhatsApp marketing campaigns for restaurants with automated messages, customer segmentation, and campaign analytics.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/loyalty/whatsapp",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Included with Spark Plan" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR", "description": "Included with Spark Plan India" }
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Why is WhatsApp better than email for restaurant marketing?",
        "acceptedAnswer": { "@type": "Answer", "text": "WhatsApp messages have a 95% open rate compared to 20% for email and 5% for SMS. Customers read WhatsApp messages within minutes, making it the most effective channel for time-sensitive promotions like daily specials or flash sales. In India and many other markets, WhatsApp is the primary communication channel." }
      },
      {
        "@type": "Question",
        "name": "What types of WhatsApp campaigns can I send?",
        "acceptedAnswer": { "@type": "Answer", "text": "You can send promotional offers, new menu announcements, birthday and anniversary wishes, loyalty points updates, event invitations, feedback requests, re-engagement messages for lapsed customers, and order status updates. Each message type can include images, buttons, and quick reply options." }
      },
      {
        "@type": "Question",
        "name": "Is WhatsApp marketing automated in DineOpen?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can set up automated triggers such as birthday messages, post-visit thank you messages, loyalty points notifications, and win-back campaigns for customers who haven't visited in 30+ days. These run automatically once configured." }
      },
      {
        "@type": "Question",
        "name": "Do I need a WhatsApp Business API account?",
        "acceptedAnswer": { "@type": "Answer", "text": "DineOpen handles the WhatsApp Business API integration for you. You don't need to set up or manage the API yourself. Simply connect your business phone number, and DineOpen takes care of the technical setup." }
      }
    ]
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "DineOpen Loyalty", "item": "https://www.dineopen.com/products/loyalty" },
      { "@type": "ListItem", "position": 4, "name": "WhatsApp Marketing", "item": "https://www.dineopen.com/products/loyalty/whatsapp" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <WhatsappClient />
    </>
  );
}
