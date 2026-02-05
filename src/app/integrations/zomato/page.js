import IntegrationClient from '../IntegrationClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Zomato Integration for Restaurant POS | Auto-Accept Orders | DineOpen',
  description: 'Connect your restaurant POS with Zomato. Auto-accept orders, sync menus, manage delivery from one dashboard. Reduce manual work by 80%. Free integration with DineOpen.',
  keywords: 'Zomato integration POS, Zomato restaurant software, Zomato order management, auto accept Zomato orders, Zomato menu sync, Zomato POS integration India, Zomato billing software',
  openGraph: {
    title: 'Zomato Integration for Restaurant POS | DineOpen',
    description: 'Connect with Zomato. Auto-accept orders, sync menus, manage from one dashboard.',
    url: 'https://www.dineopen.com/integrations/zomato',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/integrations/zomato',
  },
};

export default function ZomatoIntegrationPage() {
  const integrationData = {
    name: 'Zomato',
    logo: '/integrations/zomato-logo.svg',
    tagline: 'Auto-accept Zomato orders directly in your POS',
    description: 'Seamlessly connect DineOpen with Zomato to manage all your delivery orders from one dashboard. No more switching between apps.',
    features: [
      { title: 'Auto-Accept Orders', desc: 'Orders flow directly to your kitchen - no manual acceptance needed' },
      { title: 'Menu Sync', desc: 'Update your menu once, sync everywhere automatically' },
      { title: 'Unified Dashboard', desc: 'See dine-in and Zomato orders in one place' },
      { title: 'Inventory Sync', desc: 'Mark items out of stock across all platforms instantly' },
      { title: 'Analytics', desc: 'Track Zomato performance alongside dine-in sales' },
      { title: 'Prep Time Management', desc: 'Set accurate prep times to improve ratings' },
    ],
    benefits: [
      'Reduce order processing time by 80%',
      'Eliminate missed orders',
      'Improve Zomato ratings with faster response',
      'Single dashboard for all orders',
      'Real-time inventory updates',
    ],
    cta: 'Get Zomato Integration Free',
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Zomato Integration",
    "description": "Connect your restaurant POS with Zomato for auto order acceptance and menu sync.",
    "url": "https://www.dineopen.com/integrations/zomato",
    "applicationCategory": "BusinessApplication",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <IntegrationClient data={integrationData} />
    </>
  );
}
