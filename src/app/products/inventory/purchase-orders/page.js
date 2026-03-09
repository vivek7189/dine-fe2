import PurchaseOrdersClient from './PurchaseOrdersClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Purchase Order System | PO & GRN Tracking | DineOpen',
  description: 'Create purchase orders, send to suppliers, track deliveries, and record Goods Received Notes. Invoice OCR for automatic PO matching. Complete procurement workflow for restaurants.',
  keywords: 'restaurant purchase order, PO system restaurant, GRN tracking, goods received note, procurement software restaurant, invoice OCR',
  openGraph: { title: 'Purchase Order System | DineOpen', description: 'PO creation, supplier delivery tracking, GRN recording, and invoice OCR.', url: 'https://www.dineopen.com/products/inventory/purchase-orders' },
  alternates: { canonical: 'https://www.dineopen.com/products/inventory/purchase-orders' },
};

export default function PurchaseOrdersPage() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "DineOpen Purchase Orders", "applicationCategory": "BusinessApplication", "description": "Restaurant purchase order system with PO creation, delivery tracking, GRN recording, and invoice OCR processing.", "url": "https://www.dineopen.com/products/inventory/purchase-orders", "offers": [{ "@type": "Offer", "price": "89", "priceCurrency": "USD" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
      { "@type": "Question", "name": "How do I create a purchase order?", "acceptedAnswer": { "@type": "Answer", "text": "Select a supplier, add items with quantities, and submit. DineOpen shows suggested quantities based on current stock levels and reorder points. Send the PO to the supplier via WhatsApp, email, or print." } },
      { "@type": "Question", "name": "What is a GRN (Goods Received Note)?", "acceptedAnswer": { "@type": "Answer", "text": "A GRN records what was actually received against a purchase order. Compare ordered vs received quantities, note discrepancies, and confirm receipt. Stock levels update automatically when a GRN is approved." } },
      { "@type": "Question", "name": "How does invoice OCR work with POs?", "acceptedAnswer": { "@type": "Answer", "text": "Upload the supplier invoice PDF or photo. OCR extracts line items, quantities, and prices. DineOpen matches them against the corresponding PO to highlight discrepancies. Approve to auto-generate GRN." } },
      { "@type": "Question", "name": "Can I track PO status?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Track POs through statuses: Draft, Sent, Partially Received, Fully Received, and Closed. Dashboard shows pending deliveries, overdue orders, and recently received shipments." } },
      { "@type": "Question", "name": "Does it support recurring purchase orders?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Set up recurring POs for regular orders (e.g., daily milk delivery, weekly vegetables). DineOpen auto-generates POs on schedule with configurable quantities." } },
    ]},
    { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Inventory", "item": "https://www.dineopen.com/products/inventory" },
      { "@type": "ListItem", "position": 3, "name": "Purchase Orders", "item": "https://www.dineopen.com/products/inventory/purchase-orders" }
    ]}
  ];
  return (
    <>
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <PurchaseOrdersClient />
    </>
  );
}
