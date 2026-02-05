import IntegrationClient from '../IntegrationClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Swiggy Integration for Restaurant POS | Auto-Accept Orders | DineOpen',
  description: 'Connect your restaurant POS with Swiggy. Auto-accept orders, sync menus, manage delivery from one dashboard. Reduce manual work by 80%. Free integration with DineOpen.',
  keywords: 'Swiggy integration POS, Swiggy restaurant software, Swiggy order management, auto accept Swiggy orders, Swiggy menu sync, Swiggy POS integration India, Swiggy billing software',
  openGraph: {
    title: 'Swiggy Integration for Restaurant POS | DineOpen',
    description: 'Connect with Swiggy. Auto-accept orders, sync menus, manage from one dashboard.',
    url: 'https://www.dineopen.com/integrations/swiggy',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/integrations/swiggy',
  },
};

export default function SwiggyIntegrationPage() {
  const integrationData = {
    name: 'Swiggy',
    logo: '/integrations/swiggy-logo.svg',
    tagline: 'Auto-accept Swiggy orders directly in your POS',
    description: 'Seamlessly connect DineOpen with Swiggy to manage all your delivery orders from one dashboard. No more switching between apps.',
    features: [
      { title: 'Auto-Accept Orders', desc: 'Orders flow directly to your kitchen - no manual acceptance needed' },
      { title: 'Menu Sync', desc: 'Update your menu once, sync everywhere automatically' },
      { title: 'Unified Dashboard', desc: 'See dine-in and Swiggy orders in one place' },
      { title: 'Inventory Sync', desc: 'Mark items out of stock across all platforms instantly' },
      { title: 'Analytics', desc: 'Track Swiggy performance alongside dine-in sales' },
      { title: 'Rider Tracking', desc: 'Know when Swiggy riders arrive for pickup' },
    ],
    benefits: [
      'Reduce order processing time by 80%',
      'Eliminate missed orders',
      'Improve Swiggy ratings with faster response',
      'Single dashboard for all orders',
      'Real-time inventory updates',
    ],
    cta: 'Get Swiggy Integration Free',
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Swiggy Integration",
    "description": "Connect your restaurant POS with Swiggy for auto order acceptance and menu sync.",
    "url": "https://www.dineopen.com/integrations/swiggy",
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
