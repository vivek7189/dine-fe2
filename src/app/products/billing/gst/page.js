import GstClient from './GstClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'GST Billing Software for Restaurants | HSN Codes & CGST/SGST | DineOpen',
  description: 'GST-compliant billing software for restaurants with automatic HSN code mapping, CGST/SGST/IGST calculation, and tax filing reports. Generate GSTR-1 and GSTR-3B compatible invoices.',
  keywords: 'GST billing software restaurant, HSN codes restaurant, CGST SGST billing, GST invoice generator, restaurant tax software, GSTR-1 restaurant, GST filing restaurant',
  openGraph: {
    title: 'GST Billing Software for Restaurants | DineOpen',
    description: 'Automatic GST calculation with HSN codes, CGST/SGST split, and tax filing reports for restaurants.',
    url: 'https://www.dineopen.com/products/billing/gst',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/billing/gst',
  },
};

export default function GstPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen GST Billing",
    "applicationCategory": "BusinessApplication",
    "description": "GST-compliant billing software for Indian restaurants with automatic HSN code mapping, CGST/SGST/IGST calculation, and tax filing report generation.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/billing/gst",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD", "description": "Spark plan" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR", "description": "Spark plan (India)" }
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What GST rates apply to restaurants in India?", "acceptedAnswer": { "@type": "Answer", "text": "Non-AC restaurants charge 5% GST (no ITC). AC/luxury restaurants charge 5% GST. Restaurants in hotels with room tariff above Rs.7,500 charge 18% GST with ITC. DineOpen supports all these rate configurations." } },
      { "@type": "Question", "name": "What are HSN codes for restaurant items?", "acceptedAnswer": { "@type": "Answer", "text": "HSN (Harmonized System of Nomenclature) codes classify food items for GST. For example, 9963 covers restaurant services, 2106 covers food preparations. DineOpen automatically maps correct HSN codes to menu categories." } },
      { "@type": "Question", "name": "How does DineOpen handle CGST and SGST?", "acceptedAnswer": { "@type": "Answer", "text": "For intra-state transactions, DineOpen splits GST equally into CGST and SGST. For inter-state transactions (e.g., catering across state lines), it applies IGST. This is handled automatically based on your business and customer locations." } },
      { "@type": "Question", "name": "Can DineOpen generate GSTR-1 reports?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. DineOpen generates GSTR-1 compatible reports with B2B and B2C invoice summaries, HSN-wise summaries, and document details. Export in JSON or Excel format for direct upload to the GST portal." } },
      { "@type": "Question", "name": "Is e-invoicing supported?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen supports e-invoicing for restaurants with turnover above the applicable threshold. Generate IRN (Invoice Reference Number) through NIC integration and include QR codes on invoices as required by GST law." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Billing", "item": "https://www.dineopen.com/products/billing" },
      { "@type": "ListItem", "position": 4, "name": "GST Billing", "item": "https://www.dineopen.com/products/billing/gst" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <GstClient />
    </>
  );
}
