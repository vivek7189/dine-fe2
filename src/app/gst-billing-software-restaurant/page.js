import GSTBillingClient from './GSTBillingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'GST Billing Software for Restaurants | 100% Compliant | DineOpen',
  description: 'GST billing software for restaurants with auto tax calculation (5% & 18%), GSTIN invoices, HSN codes, GSTR-1 & GSTR-3B reports, e-invoicing, and Tally export. Rs 300/month.',
  keywords: 'GST billing software restaurant, restaurant GST billing, GST compliant billing software, GST invoice restaurant, restaurant billing with GST India, GST restaurant software, GSTR-1 restaurant, restaurant tax billing',
  authors: [{ name: 'DineOpen Team' }],
  creator: 'DineOpen',
  publisher: 'DineOpen',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'GST Billing Software for Restaurants | 100% Compliant | DineOpen',
    description: 'GST billing software for restaurants with auto tax calculation, GSTIN invoices, HSN codes, GSTR-1 & GSTR-3B reports, e-invoicing ready. Built for Indian restaurants.',
    url: 'https://www.dineopen.com/gst-billing-software-restaurant',
    siteName: 'DineOpen',
    images: [
      {
        url: '/og-gst-billing-restaurant.jpg',
        width: 1200,
        height: 630,
        alt: 'DineOpen GST Billing Software for Restaurants',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GST Billing Software for Restaurants | 100% Compliant | DineOpen',
    description: 'GST billing software for restaurants with auto tax calculation, GSTIN invoices, HSN codes, GSTR reports. Rs 300/month.',
    images: ['/og-gst-billing-restaurant.jpg'],
  },
  alternates: {
    canonical: 'https://www.dineopen.com/gst-billing-software-restaurant',
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What GST rate applies to restaurants in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most restaurants in India (both AC and non-AC) charge 5% GST without input tax credit (ITC). Outdoor catering services can charge either 5% without ITC or 18% with ITC. Food delivery apps also attract 5% GST."
      }
    },
    {
      "@type": "Question",
      "name": "Does DineOpen generate GST-compliant invoices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen generates 100% GST-compliant invoices with your GSTIN, HSN codes, proper tax breakdowns (CGST + SGST or IGST), and sequential invoice numbering as required by GST law."
      }
    },
    {
      "@type": "Question",
      "name": "Can I export GST reports for filing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen generates GSTR-1 and GSTR-3B ready reports that you can export to Excel or Tally format. Reports are CA-ready and can be shared directly with your accountant for monthly or quarterly filing."
      }
    },
    {
      "@type": "Question",
      "name": "Does the software handle both 5% and 18% GST rates?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen lets you configure different GST rates per item or category. It automatically applies the correct rate (5% or 18%) based on your restaurant type and calculates CGST and SGST splits on every bill."
      }
    },
    {
      "@type": "Question",
      "name": "Is DineOpen e-invoicing ready?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. DineOpen supports e-invoicing as mandated by the GST Council for businesses above the threshold turnover. Invoices are generated in the format required for IRN (Invoice Reference Number) generation."
      }
    }
  ]
};

export default function GSTBillingSoftwareRestaurant() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <GSTBillingClient />
    </>
  );
}
