import CrmClient from './CrmClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant CRM Software | Customer Database & Management | DineOpen',
  description: 'Free restaurant CRM software with customer database, order history tracking, search and filtering. Manage customer contacts, track visits, and segment your audience. Included with DineOpen POS.',
  keywords: 'restaurant CRM, customer database restaurant, restaurant customer management, customer order history, restaurant CRM software, customer tracking restaurant, customer data management, restaurant customer profiles',
  openGraph: {
    title: 'Restaurant CRM Software | Customer Database & Management | DineOpen',
    description: 'Complete customer database with contact details, order history, and segmentation. Included with DineOpen.',
    url: 'https://www.dineopen.com/products/loyalty/crm',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant CRM Software | DineOpen',
    description: 'Customer database, order history, search & segmentation. Built into DineOpen POS.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/loyalty/crm',
  },
};

export default function CrmPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant CRM",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Customer Relationship Management",
    "description": "Restaurant CRM with customer database, order history tracking, contact management, and customer segmentation. Built into DineOpen POS.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/loyalty/crm",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Included with Spark Plan" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR", "description": "Included with Spark Plan India" }
    ],
    "featureList": [
      "Customer contact database",
      "Order history tracking",
      "Customer search and filtering",
      "Customer profile management",
      "Last order date tracking",
      "Customer segmentation"
    ]
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a restaurant CRM?",
        "acceptedAnswer": { "@type": "Answer", "text": "A restaurant CRM (Customer Relationship Management) is software that stores and organizes customer data including contact details, order history, visit frequency, and preferences. It helps restaurants understand their customers, personalize service, and run targeted marketing campaigns." }
      },
      {
        "@type": "Question",
        "name": "How does DineOpen CRM capture customer data?",
        "acceptedAnswer": { "@type": "Answer", "text": "DineOpen automatically captures customer details when they place orders through the POS, scan QR menus, or use the Crave customer app. Phone number, email, and order details are stored without manual data entry." }
      },
      {
        "@type": "Question",
        "name": "Can I search and filter my customer database?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. DineOpen CRM supports full search across customer names, phone numbers, and emails. You can sort by last order date, total orders, or customer value, and filter by segments like VIP, lapsed, or new customers." }
      },
      {
        "@type": "Question",
        "name": "Is customer data secure in DineOpen?",
        "acceptedAnswer": { "@type": "Answer", "text": "Yes. All customer data is encrypted and stored securely in the cloud. Only authorized staff can access customer information, and DineOpen complies with data protection standards." }
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
      { "@type": "ListItem", "position": 4, "name": "CRM", "item": "https://www.dineopen.com/products/loyalty/crm" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
      <CrmClient />
    </>
  );
}
