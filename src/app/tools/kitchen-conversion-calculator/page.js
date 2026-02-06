import KitchenConversionClient from './KitchenConversionClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Kitchen Conversion Calculator | Cooking Measurements | DineOpen',
  description: 'Free kitchen conversion calculator. Convert cups to grams, ml to oz, Fahrenheit to Celsius. Essential cooking measurement converter for chefs and home cooks.',
  keywords: 'kitchen conversion calculator, cooking measurement converter, cups to grams, ml to oz, cooking conversions, recipe converter, temperature converter cooking',
  openGraph: {
    title: 'Kitchen Conversion Calculator | Cooking Measurements | DineOpen',
    description: 'Convert cooking measurements instantly. Cups, grams, ml, oz, temperature and more.',
    url: 'https://www.dineopen.com/tools/kitchen-conversion-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/kitchen-conversion-calculator' },
};

export default function KitchenConversionPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Kitchen Conversion Calculator",
    "description": "Free cooking measurement converter for kitchen professionals and home cooks.",
    "applicationCategory": "UtilitiesApplication",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <KitchenConversionClient />
    </>
  );
}
