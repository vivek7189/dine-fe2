import TipCalculatorClient from './TipCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Tip Calculator | Calculate Tips & Split Bills | DineOpen',
  description: 'Free restaurant tip calculator. Calculate tips from 10% to 25%, split bills between guests, and get per-person amounts instantly. Perfect for diners and restaurant staff.',
  keywords: 'tip calculator, restaurant tip calculator, bill split calculator, gratuity calculator, how much to tip, tip percentage calculator, split bill calculator, dining tip calculator, waiter tip calculator, service charge calculator',
  openGraph: {
    title: 'Free Restaurant Tip Calculator | DineOpen',
    description: 'Calculate restaurant tips instantly. Split bills, adjust tip percentages, and get per-person amounts.',
    url: 'https://www.dineopen.com/tools/tip-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Restaurant Tip Calculator | DineOpen',
    description: 'Calculate restaurant tips instantly. Split bills and get per-person amounts.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/tip-calculator',
  },
};

export default function TipCalculatorPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Restaurant Tip Calculator",
    "description": "Free online tip calculator for restaurants. Calculate tips, split bills, and get per-person amounts.",
    "url": "https://www.dineopen.com/tools/tip-calculator",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "provider": {
      "@type": "Organization",
      "name": "DineOpen"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <TipCalculatorClient />
    </>
  );
}
