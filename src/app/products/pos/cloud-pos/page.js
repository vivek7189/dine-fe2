import CloudPosClient from './CloudPosClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Cloud-Based POS System for Restaurants | No Hardware | DineOpen',
  description: 'Cloud-based restaurant POS that runs on any device. Real-time sync across locations, no hardware needed, automatic updates. Access your POS from anywhere. Plans from $9.99/mo.',
  keywords: 'cloud POS system, cloud-based POS, restaurant cloud POS, web-based POS, no hardware POS, SaaS POS restaurant, online POS system',
  openGraph: {
    title: 'Cloud-Based POS System for Restaurants | DineOpen',
    description: 'Run your restaurant POS from any device. Real-time sync, no hardware, automatic updates.',
    url: 'https://www.dineopen.com/products/pos/cloud-pos',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/pos/cloud-pos',
  },
};

export default function CloudPosPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Cloud POS",
    "description": "Cloud-based point of sale system for restaurants. No hardware required, runs on any device with a browser.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web, Android, iOS",
    "url": "https://www.dineopen.com/products/pos/cloud-pos",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is a cloud-based POS system?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "A cloud-based POS runs entirely in the cloud and is accessed through a web browser. Unlike traditional POS systems that require dedicated hardware and local servers, a cloud POS works on any device - your phone, tablet, or laptop. Data syncs in real time across all devices and locations."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need special hardware for DineOpen Cloud POS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. DineOpen Cloud POS runs in any modern web browser. You can use your existing phone, tablet, laptop, or desktop. If you want receipt printing, any standard Bluetooth or USB receipt printer will work."
        }
      },
      {
        "@type": "Question",
        "name": "What happens if my internet goes down?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "DineOpen stores critical data locally so you can continue taking orders during brief outages. When connectivity returns, everything syncs automatically. For areas with unreliable internet, we recommend having a mobile hotspot as backup."
        }
      },
      {
        "@type": "Question",
        "name": "Is my restaurant data secure in the cloud?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. All data is encrypted in transit and at rest. DineOpen uses industry-standard security practices with regular backups. Your data is safer in the cloud than on a local machine that could be stolen or damaged."
        }
      },
      {
        "@type": "Question",
        "name": "Can multiple devices use the cloud POS at the same time?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Unlimited devices can be connected simultaneously. A waiter can take orders on a tablet, the cashier processes payments on a desktop, and the kitchen views orders on another screen - all synced in real time via Pusher websockets."
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
      { "@type": "ListItem", "position": 3, "name": "POS System", "item": "https://www.dineopen.com/products/pos" },
      { "@type": "ListItem", "position": 4, "name": "Cloud POS", "item": "https://www.dineopen.com/products/pos/cloud-pos" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <CloudPosClient />
    </>
  );
}
