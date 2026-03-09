import KotClient from './KotClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Kitchen Order Ticket KOT System | Digital KOT Software | DineOpen',
  description: 'Digital KOT system for restaurants. Manage kitchen order tickets, print receipts, track order items with special instructions. Real-time KOT status management with sound alerts. Replace handwritten KOTs.',
  keywords: 'KOT system, kitchen order ticket, KOT software, digital KOT, restaurant KOT management, KOT printing, kitchen ticket system, order ticket restaurant, KOT tracking',
  openGraph: {
    title: 'Kitchen Order Ticket KOT System | DineOpen',
    description: 'Digital KOT management with printing, status tracking, and real-time updates. Free with DineOpen POS.',
    url: 'https://www.dineopen.com/products/kitchen/kot',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/kitchen/kot',
  },
};

export default function KotPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen KOT System",
    "description": "Digital kitchen order ticket management system with printing, status tracking, and real-time updates.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://www.dineopen.com/products/kitchen/kot",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Digital KOT management",
      "KOT printing",
      "Order item tracking",
      "Special instructions handling",
      "Status management",
      "Order deletion with reason"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a KOT (Kitchen Order Ticket)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A KOT (Kitchen Order Ticket) is a document sent from the front of house to the kitchen detailing what items need to be prepared, along with table number, special instructions, and order time. DineOpen digitizes this process so KOTs appear instantly on kitchen screens."
        }
      },
      {
        "@type": "Question",
        "name": "Can I print KOT tickets?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. DineOpen supports printing individual KOT tickets to thermal printers. This is useful for expediting stations or kitchens that prefer paper backup alongside the digital display."
        }
      },
      {
        "@type": "Question",
        "name": "How are special instructions handled on KOTs?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Special instructions entered by waiters appear highlighted on the KOT so kitchen staff can immediately see dietary requirements, allergies, or customization requests for each item."
        }
      },
      {
        "@type": "Question",
        "name": "Can I cancel a KOT after it has been sent?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Authorized staff can delete or cancel a KOT, but a reason must be provided. This ensures accountability and helps management track cancellation patterns to reduce waste."
        }
      },
      {
        "@type": "Question",
        "name": "Does the KOT system work with different order types?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. KOTs are generated for dine-in, takeout, delivery, and room service orders. Each KOT clearly shows the order type so kitchen staff can prioritize and package accordingly."
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
      { "@type": "ListItem", "position": 3, "name": "Kitchen", "item": "https://www.dineopen.com/products/kitchen" },
      { "@type": "ListItem", "position": 4, "name": "KOT", "item": "https://www.dineopen.com/products/kitchen/kot" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <KotClient />
    </>
  );
}
