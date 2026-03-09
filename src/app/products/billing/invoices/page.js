import InvoicesClient from './InvoicesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Invoice Generator | Digital Receipts & Thermal Printing | DineOpen',
  description: 'Generate professional restaurant invoices with custom templates, thermal printer support, digital bill sharing via WhatsApp, and multi-format export. GST-compliant invoice generation.',
  keywords: 'restaurant invoice generator, restaurant receipt software, thermal receipt printer, digital invoice restaurant, WhatsApp bill sharing, invoice template restaurant',
  openGraph: {
    title: 'Restaurant Invoice Generator | DineOpen',
    description: 'Professional invoice generation with custom templates, thermal printing, and digital sharing.',
    url: 'https://www.dineopen.com/products/billing/invoices',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/billing/invoices',
  },
};

export default function InvoicesPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Invoice Generator",
    "applicationCategory": "BusinessApplication",
    "description": "Professional restaurant invoice generation with custom templates, thermal printer support, digital sharing via WhatsApp, and GST compliance.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/billing/invoices",
    "offers": [
      { "@type": "Offer", "price": "9.99", "priceCurrency": "USD" },
      { "@type": "Offer", "price": "300", "priceCurrency": "INR" }
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Can I customize invoice templates?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Add your restaurant logo, FSSAI number, custom headers and footers, terms and conditions, and promotional messages. Choose between thermal printer format (58mm/80mm) and A4 format." } },
      { "@type": "Question", "name": "Does DineOpen support thermal printers?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen works with most ESC/POS thermal printers including Epson, Star Micronics, and generic USB/Bluetooth printers. Supports both 58mm and 80mm paper widths." } },
      { "@type": "Question", "name": "Can I send invoices via WhatsApp?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Share digital invoices directly to customer WhatsApp numbers as PDF or image. Customers can also access their bills via a unique link. Great for reducing paper waste." } },
      { "@type": "Question", "name": "Are duplicate and credit note invoices supported?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Generate duplicate invoices anytime from transaction history. Issue GST-compliant credit notes for refunds or cancellations, automatically linked to the original invoice." } },
      { "@type": "Question", "name": "Can I export invoices in bulk?", "acceptedAnswer": { "@type": "Answer", "text": "Export all invoices for a date range in PDF, Excel, or CSV format. Useful for monthly accounting, tax filing, and audit purposes. Filter by payment method, tax rate, or order type." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Billing", "item": "https://www.dineopen.com/products/billing" },
      { "@type": "ListItem", "position": 3, "name": "Invoices", "item": "https://www.dineopen.com/products/billing/invoices" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <InvoicesClient />
    </>
  );
}
