import OffersClient from './OffersClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Promotional Offers & Discounts Software | DineOpen',
  description: 'Create and manage restaurant promotional offers, discounts, and deals. Schedule campaigns for festivals, slow days, or new menu items. Target specific customer segments. Included with DineOpen.',
  keywords: 'restaurant promotional offers, restaurant discount software, restaurant deals management, promotional campaigns restaurant, restaurant marketing offers, seasonal promotions restaurant, restaurant coupon system, targeted offers restaurant',
  openGraph: {
    title: 'Restaurant Promotional Offers & Discounts Software | DineOpen',
    description: 'Create, schedule, and target promotional offers. Drive traffic on slow days and boost revenue.',
    url: 'https://www.dineopen.com/products/loyalty/offers',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Promotional Offers & Discounts | DineOpen',
    description: 'Create targeted offers, schedule campaigns, and drive revenue.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/loyalty/offers',
  },
};

export default function OffersPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Offers & Promotions",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Marketing Software",
    "description": "Restaurant promotional offers and discount management system with scheduling, targeting, and performance tracking.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/loyalty/offers",
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
        "name": "What types of promotional offers can I create?",
        "acceptedAnswer": { "@type": "Answer", "text": "You can create percentage discounts, flat amount discounts, buy-one-get-one offers, free item offers, combo deals, and minimum order discounts. Each offer can be scheduled for specific dates, days of the week, or time slots." }
      },
      {
        "@type": "Question",
        "name": "Can I target offers to specific customer groups?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. DineOpen lets you target offers to specific customer segments such as new customers, VIP customers, lapsed visitors, or customers in a specific spending range. You can also send exclusive offers to loyalty program members." }
      },
      {
        "@type": "Question",
        "name": "How do I track which promotions are working?",
        "acceptedAnswer": { "@type": "Answer", "text": "DineOpen provides analytics on every promotion including redemption count, revenue generated, customer response rate, and comparison with non-promotional periods. This helps you identify which offers drive the best ROI." }
      },
      {
        "@type": "Question",
        "name": "Can I schedule offers in advance?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. You can schedule offers to start and end on specific dates and times. Set up your entire month of promotions in advance, from weekday lunch specials to weekend happy hours to festival campaigns." }
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
      { "@type": "ListItem", "position": 4, "name": "Offers", "item": "https://www.dineopen.com/products/loyalty/offers" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <OffersClient />
    </>
  );
}
