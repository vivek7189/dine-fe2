import RecipesClient from './RecipesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Recipe Costing Software | Ingredient Mapping | DineOpen',
  description: 'Recipe costing software for restaurants with ingredient mapping, automatic cost calculation, portion control, and food cost percentage tracking. Update prices and all recipe costs recalculate.',
  keywords: 'recipe costing software restaurant, food cost calculator, ingredient mapping, recipe management restaurant, food cost percentage, portion control software',
  openGraph: { title: 'Recipe Costing Software | DineOpen', description: 'Map ingredients, calculate recipe costs, and track food cost percentages automatically.', url: 'https://www.dineopen.com/products/inventory/recipes' },
  alternates: { canonical: 'https://www.dineopen.com/products/inventory/recipes' },
};

export default function RecipesPage() {
  const schemas = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "DineOpen Recipe Costing", "applicationCategory": "BusinessApplication", "description": "Recipe costing with ingredient mapping, automatic cost calculation, and food cost tracking.", "url": "https://www.dineopen.com/products/inventory/recipes", "offers": [{ "@type": "Offer", "price": "9.99", "priceCurrency": "USD" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
      { "@type": "Question", "name": "How does recipe costing work?", "acceptedAnswer": { "@type": "Answer", "text": "Create a recipe by adding ingredients from your inventory with exact quantities. DineOpen multiplies each ingredient's quantity by its current purchase price to calculate total recipe cost. When ingredient prices change, all recipe costs update automatically." } },
      { "@type": "Question", "name": "Can I track food cost percentage?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. DineOpen calculates food cost percentage as (recipe cost / selling price) x 100. Industry standard is 28-35%. Get alerts when items exceed your target food cost percentage." } },
      { "@type": "Question", "name": "Does it support sub-recipes?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Create base preparations (sauces, marinades, dough) as sub-recipes. Use them as ingredients in other recipes. Costs cascade automatically through all levels." } },
      { "@type": "Question", "name": "Can I scale recipes for different portions?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Define standard portion size and scale up or down. Create variations for half portions, family size, or catering quantities. Each scaled version shows accurate ingredient quantities and costs." } },
      { "@type": "Question", "name": "How does recipe costing reduce food waste?", "acceptedAnswer": { "@type": "Answer", "text": "By defining exact ingredient quantities per recipe, kitchen staff follows standardized portions. This prevents overuse, ensures consistency, and makes stock consumption predictable for better ordering." } },
    ]},
    { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Inventory", "item": "https://www.dineopen.com/products/inventory" },
      { "@type": "ListItem", "position": 3, "name": "Recipes", "item": "https://www.dineopen.com/products/inventory/recipes" }
    ]}
  ];
  return (
    <>
      {schemas.map((s, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />)}
      <RecipesClient />
    </>
  );
}
