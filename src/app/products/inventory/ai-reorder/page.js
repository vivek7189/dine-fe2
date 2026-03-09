import AiReorderClient from './AiReorderClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'AI Reorder Suggestions for Restaurants | Smart Inventory | DineOpen',
  description: 'AI-powered reorder suggestions, waste predictions, and consumption analytics for restaurant inventory. Predict stockouts, optimize order quantities, and reduce waste with machine learning.',
  keywords: 'AI inventory management restaurant, smart reorder suggestions, waste prediction restaurant, AI stock management, predictive inventory, restaurant AI',
  openGraph: { title: 'AI Reorder Suggestions | DineOpen Inventory', description: 'AI-powered reorder suggestions and waste predictions for restaurants.', url: 'https://www.dineopen.com/products/inventory/ai-reorder' },
  alternates: { canonical: 'https://www.dineopen.com/products/inventory/ai-reorder' },
};

export default function AiReorderPage() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "DineOpen AI Reorder", "applicationCategory": "BusinessApplication", "description": "AI-powered inventory reorder suggestions with waste predictions and consumption pattern analysis for restaurants.", "url": "https://www.dineopen.com/products/inventory/ai-reorder", "offers": [{ "@type": "Offer", "price": "89", "priceCurrency": "USD" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
      { "@type": "Question", "name": "How does AI reorder suggestion work?", "acceptedAnswer": { "@type": "Answer", "text": "DineOpen AI analyzes your historical consumption data, current stock levels, supplier lead times, and seasonal patterns. It calculates optimal reorder points and quantities for each item, ensuring you order the right amount at the right time." } },
      { "@type": "Question", "name": "Can AI predict waste?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Based on expiry dates, consumption rates, and historical waste data, AI predicts which items are likely to expire before use. It suggests menu specials or promotions to use up items nearing expiry." } },
      { "@type": "Question", "name": "Does it account for seasonal demand?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. AI learns your seasonal patterns (festivals, weekends, weather impacts) and adjusts reorder suggestions accordingly. Order more before busy periods, less during slow seasons." } },
      { "@type": "Question", "name": "Is voice entry supported?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Use voice recognition to add items during stock counts. Say the item name and quantity, and DineOpen records it hands-free. Useful during physical stock audits when your hands are occupied." } },
      { "@type": "Question", "name": "How accurate are AI predictions?", "acceptedAnswer": { "@type": "Answer", "text": "AI accuracy improves with data. After 2-3 months of usage, predictions typically achieve 85-90% accuracy for reorder timing and 80-85% accuracy for quantity suggestions. The system continuously learns from your patterns." } },
    ]},
    { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Inventory", "item": "https://www.dineopen.com/products/inventory" },
      { "@type": "ListItem", "position": 3, "name": "AI Reorder", "item": "https://www.dineopen.com/products/inventory/ai-reorder" }
    ]}
  ];
  return (
    <>
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <AiReorderClient />
    </>
  );
}
