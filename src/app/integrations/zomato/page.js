import IntegrationClient from '../IntegrationClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Zomato + DineOpen: How to Manage Your Zomato Orders | DineOpen POS',
  description: 'How restaurants using DineOpen handle Zomato orders: record them on the POS, track Zomato sales separately in reports, and grow commission-free direct orders. DineOpen does not sync Zomato orders automatically today.',
  keywords: 'Zomato order management, manage Zomato orders, Zomato sales tracking, Zomato restaurant POS, Zomato billing software, Zomato commission, commission-free online ordering',
  openGraph: {
    title: 'Zomato + DineOpen: How to Manage Your Zomato Orders',
    description: 'Record Zomato orders on the DineOpen POS, track Zomato sales separately in reports, and grow commission-free direct orders.',
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
    badge: 'Manual entry + reports',
    tagline: 'How to manage your Zomato orders with DineOpen',
    description: 'DineOpen does not sync Zomato orders automatically today. Instead, staff record Zomato orders on the DineOpen POS and mark the channel as Zomato, so Zomato sales show up separately in your reports. DineOpen also helps you reduce dependence on Zomato with commission-free direct ordering.',
    featuresHeading: 'Managing Zomato Orders with DineOpen',
    features: [
      { title: 'Record Orders on the POS', desc: 'Punch Zomato orders into DineOpen like any other order - KOT goes to the kitchen as usual' },
      { title: 'Mark the Channel as Zomato', desc: 'Tag the order or payment as Zomato so it is never mixed up with dine-in or direct sales' },
      { title: 'Separate Zomato Sales in Reports', desc: 'See Zomato revenue alongside dine-in, takeaway and direct orders in your sales reports' },
      { title: 'Inventory Stays Accurate', desc: 'Orders recorded on the POS deduct stock just like dine-in orders' },
      { title: 'Commission-Free Direct Ordering', desc: 'QR ordering, your own branded online ordering website and WhatsApp ordering - no per-order commission' },
      { title: 'Honest Limitation', desc: 'No automatic order import, menu sync or auto-accept with Zomato today - orders are entered manually' },
    ],
    benefits: [
      'Know exactly how much of your revenue comes from Zomato',
      'One set of sales reports across dine-in, takeaway and Zomato',
      'Kitchen gets a KOT for every Zomato order you record',
      'Shift repeat customers to commission-free direct ordering',
      'Free 7-day trial to try it with your own orders',
    ],
    stepsHeading: 'How It Works',
    steps: [
      { step: '1', title: 'Sign Up', desc: 'Create your free DineOpen account' },
      { step: '2', title: 'Record', desc: 'Enter each Zomato order on the DineOpen POS' },
      { step: '3', title: 'Tag', desc: 'Mark the payment/channel as Zomato' },
      { step: '4', title: 'Track', desc: 'See Zomato sales separately in your reports' },
    ],
    ctaHeading: 'Manage Zomato Orders with DineOpen',
    ctaNote: 'Start your free 7-day trial. Track Zomato sales in your reports and grow commission-free direct orders.',
    cta: 'Start Free Trial',
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Zomato + DineOpen: How to Manage Your Zomato Orders",
    "description": "Restaurants using DineOpen record Zomato orders on the POS and track Zomato sales separately in reports. DineOpen does not sync Zomato orders automatically today; it offers commission-free direct ordering via QR, a branded website and WhatsApp.",
    "url": "https://www.dineopen.com/integrations/zomato"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <IntegrationClient data={integrationData} />
    </>
  );
}
