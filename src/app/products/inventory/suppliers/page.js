import SuppliersClient from './SuppliersClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Supplier Management Software | Vendor Tracking | DineOpen',
  description: 'Manage restaurant suppliers with performance tracking, price comparison, delivery reliability scores, and payment term management. Build a reliable vendor network.',
  keywords: 'restaurant supplier management, vendor management software, supplier tracking restaurant, supplier performance, vendor database restaurant',
  openGraph: {
    title: 'Restaurant Supplier Management | DineOpen',
    description: 'Supplier database with performance tracking, price comparison, and delivery reliability scores.',
    url: 'https://www.dineopen.com/products/inventory/suppliers',
  },
  alternates: { canonical: 'https://www.dineopen.com/products/inventory/suppliers' },
};

export default function SuppliersPage() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "DineOpen Supplier Management", "applicationCategory": "BusinessApplication", "description": "Restaurant supplier management with performance tracking, price comparison, and delivery reliability scoring.", "url": "https://www.dineopen.com/products/inventory/suppliers", "offers": [{ "@type": "Offer", "price": "9.99", "priceCurrency": "USD" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
      { "@type": "Question", "name": "How does supplier performance tracking work?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen tracks delivery reliability (on-time percentage), price consistency, quality scores (based on returns/rejections), and order fulfillment rate. Suppliers are scored and ranked so you can identify your best and worst performers." } },
      { "@type": "Question", "name": "Can I compare prices across suppliers?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. When creating a purchase order, DineOpen shows the same item's price from all linked suppliers. Compare prices, delivery times, and quality scores to choose the best supplier for each order." } },
      { "@type": "Question", "name": "How do I manage payment terms?", "acceptedAnswer": { "@type": "Answer", "text": "Set payment terms per supplier: COD, 7-day credit, 15-day credit, 30-day credit, or custom. DineOpen tracks outstanding payments and due dates. Get alerts before payment deadlines." } },
      { "@type": "Question", "name": "Can I track supplier returns?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Log returns with reason (quality issue, wrong item, damaged goods). Returns are tracked against the supplier's quality score. Generate return reports for dispute resolution." } },
      { "@type": "Question", "name": "Does it support multiple suppliers per item?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Link multiple suppliers to the same inventory item with different prices and lead times. When creating purchase orders, choose the best supplier based on price, availability, and performance." } },
    ]},
    { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Inventory", "item": "https://www.dineopen.com/products/inventory" },
      { "@type": "ListItem", "position": 3, "name": "Suppliers", "item": "https://www.dineopen.com/products/inventory/suppliers" }
    ]}
  ];

  return (
    <>
      {schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <SuppliersClient />
    </>
  );
}
