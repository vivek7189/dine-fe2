import StockClient from './StockClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Stock Management Software | Real-Time Tracking | DineOpen',
  description: 'Real-time restaurant stock tracking with barcode scanning, low stock alerts, expiry tracking, category filtering, and usage analytics. Card and list views for easy management.',
  keywords: 'restaurant stock management, stock tracking software, inventory tracking restaurant, low stock alerts, barcode stock management',
  openGraph: {
    title: 'Restaurant Stock Management | DineOpen',
    description: 'Real-time stock tracking with barcode scanning, alerts, and analytics.',
    url: 'https://www.dineopen.com/products/inventory/stock',
  },
  alternates: { canonical: 'https://www.dineopen.com/products/inventory/stock' },
};

export default function StockPage() {
  const softwareSchema = {
    "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "DineOpen Stock Management",
    "applicationCategory": "BusinessApplication",
    "description": "Real-time restaurant stock tracking with barcode support, low stock alerts, expiry tracking, and usage analytics.",
    "url": "https://www.dineopen.com/products/inventory/stock",
    "offers": [{ "@type": "Offer", "price": "9.99", "priceCurrency": "USD" }, { "@type": "Offer", "price": "300", "priceCurrency": "INR" }],
  };
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How does real-time stock tracking work?", "acceptedAnswer": { "@type": "Answer", "text": "Stock levels update automatically when orders are placed (deducting ingredients via recipes), when GRNs are recorded (adding received goods), and when waste is logged. The dashboard always shows current quantities." } },
      { "@type": "Question", "name": "Can I set low stock alerts?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Set minimum stock levels per item. When stock falls below the threshold, you get alerts on the dashboard and optional WhatsApp/email notifications. Never run out of critical ingredients." } },
      { "@type": "Question", "name": "Does it track item expiry dates?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Record expiry dates when receiving goods. DineOpen alerts you about items expiring soon (configurable: 3 days, 7 days, etc.) so you can use them first or plan menu specials." } },
      { "@type": "Question", "name": "Can I view stock in different formats?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Switch between card view (visual with images) and list view (compact table format). Filter by category, supplier, stock status (low/normal/overstock), or search by name/barcode." } },
      { "@type": "Question", "name": "How are stock reports generated?", "acceptedAnswer": { "@type": "Answer", "text": "Generate reports for stock value, usage trends, wastage analysis, consumption by category, and stock movement history. Export in Excel, CSV, or PDF. Schedule automated weekly or monthly reports." } },
    ]
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Inventory", "item": "https://www.dineopen.com/products/inventory" },
      { "@type": "ListItem", "position": 3, "name": "Stock", "item": "https://www.dineopen.com/products/inventory/stock" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <StockClient />
    </>
  );
}
