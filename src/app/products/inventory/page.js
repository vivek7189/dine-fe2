import InventoryLandingClient from './InventoryLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Inventory Management Software | Stock Tracking | DineOpen Inventory',
  description: 'Complete restaurant inventory management with stock tracking, supplier management, recipe costing, purchase orders, barcode scanning, invoice OCR, and AI-powered reorder suggestions. Reduce food waste by 30%.',
  keywords: 'restaurant inventory management, stock tracking software, recipe costing, supplier management, purchase order system, restaurant inventory app, food cost control, inventory software restaurant',
  openGraph: {
    title: 'Restaurant Inventory Management Software | DineOpen Inventory',
    description: 'Stock tracking, supplier management, recipe costing, purchase orders, and AI reorder suggestions for restaurants.',
    url: 'https://www.dineopen.com/products/inventory',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurant Inventory Management | DineOpen',
    description: 'Track stock, manage suppliers, cost recipes, and reduce waste with AI insights.',
  },
  alternates: { canonical: 'https://www.dineopen.com/products/inventory' },
};

export default function InventoryPage() {
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Inventory",
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Restaurant Inventory Management Software",
    "description": "Complete restaurant inventory management with stock tracking, supplier management, recipe costing, purchase orders, barcode scanning, invoice OCR processing, and AI-powered reorder suggestions.",
    "operatingSystem": "Web, iOS, Android",
    "url": "https://www.dineopen.com/products/inventory",
    "offers": [
      { "@type": "Offer", "price": "20", "priceCurrency": "USD", "description": "Starter plan" },
      { "@type": "Offer", "price": "299", "priceCurrency": "INR", "description": "Starter plan (India)" },
      { "@type": "Offer", "price": "99", "priceCurrency": "USD", "description": "Pro plan" },
      { "@type": "Offer", "price": "1799", "priceCurrency": "INR", "description": "Pro plan (India)" }
    ],
    "featureList": [
      "Inventory dashboard with statistics",
      "Item management with barcode support",
      "Supplier management with performance tracking",
      "Recipe creation with ingredient mapping and costing",
      "Purchase order creation and tracking",
      "Stock reports and usage analytics",
      "GRN tracking",
      "Invoice OCR processing",
      "AI reorder suggestions",
      "Voice recognition for item entry"
    ],
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "620" }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "What is restaurant inventory management software?", "acceptedAnswer": { "@type": "Answer", "text": "Restaurant inventory management software tracks raw materials, ingredients, and supplies. It monitors stock levels, manages suppliers, calculates recipe costs, generates purchase orders, and provides analytics to reduce waste and control food costs." } },
      { "@type": "Question", "name": "Does DineOpen support barcode scanning?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Scan barcodes using your phone camera or a USB/Bluetooth barcode scanner to quickly add items, check stock levels, or record goods received. Barcode data auto-populates item details." } },
      { "@type": "Question", "name": "How does invoice OCR work?", "acceptedAnswer": { "@type": "Answer", "text": "Upload a supplier invoice PDF or photo. DineOpen's OCR extracts item names, quantities, prices, and tax details. Smart suggestions match extracted data to your existing inventory items. Review and confirm to auto-create a GRN." } },
      { "@type": "Question", "name": "Can DineOpen predict when to reorder?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. AI analyzes your consumption patterns, lead times, and seasonal trends to suggest optimal reorder points and quantities. Get alerts before you run out of critical ingredients." } },
      { "@type": "Question", "name": "Does it track food waste?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Log waste by category (expired, spoiled, overproduction). Analytics show waste patterns, cost impact, and suggestions to reduce waste. Track waste as a percentage of purchases." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Inventory", "item": "https://www.dineopen.com/products/inventory" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <InventoryLandingClient />
    </>
  );
}
