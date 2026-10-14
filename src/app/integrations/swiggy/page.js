import IntegrationClient from '../IntegrationClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Swiggy + DineOpen: How to Manage Your Swiggy Orders | DineOpen POS',
  description: 'How restaurants using DineOpen handle Swiggy orders: record them on the POS, track Swiggy sales separately in reports, and grow commission-free direct orders. DineOpen does not sync Swiggy orders automatically today.',
  keywords: 'Swiggy order management, manage Swiggy orders, Swiggy sales tracking, Swiggy restaurant POS, Swiggy billing software, Swiggy commission, commission-free online ordering',
  openGraph: {
    title: 'Swiggy + DineOpen: How to Manage Your Swiggy Orders',
    description: 'Record Swiggy orders on the DineOpen POS, track Swiggy sales separately in reports, and grow commission-free direct orders.',
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
    badge: 'Manual entry + reports',
    tagline: 'How to manage your Swiggy orders with DineOpen',
    description: 'DineOpen does not sync Swiggy orders automatically today. Instead, staff record Swiggy orders on the DineOpen POS and mark the channel as Swiggy, so Swiggy sales show up separately in your reports. DineOpen also helps you reduce dependence on Swiggy with commission-free direct ordering.',
    featuresHeading: 'Managing Swiggy Orders with DineOpen',
    features: [
      { title: 'Record Orders on the POS', desc: 'Punch Swiggy orders into DineOpen like any other order - KOT goes to the kitchen as usual' },
      { title: 'Mark the Channel as Swiggy', desc: 'Tag the order or payment as Swiggy so it is never mixed up with dine-in or direct sales' },
      { title: 'Separate Swiggy Sales in Reports', desc: 'See Swiggy revenue alongside dine-in, takeaway and direct orders in your sales reports' },
      { title: 'Inventory Stays Accurate', desc: 'Orders recorded on the POS deduct stock just like dine-in orders' },
      { title: 'Commission-Free Direct Ordering', desc: 'QR ordering, your own branded online ordering website and WhatsApp ordering - no per-order commission' },
      { title: 'Honest Limitation', desc: 'No automatic order import, menu sync or auto-accept with Swiggy today - orders are entered manually' },
    ],
    benefits: [
      'Know exactly how much of your revenue comes from Swiggy',
      'One set of sales reports across dine-in, takeaway and Swiggy',
      'Kitchen gets a KOT for every Swiggy order you record',
      'Shift repeat customers to commission-free direct ordering',
      'Free 7-day trial to try it with your own orders',
    ],
    stepsHeading: 'How It Works',
    steps: [
      { step: '1', title: 'Sign Up', desc: 'Create your free DineOpen account' },
      { step: '2', title: 'Record', desc: 'Enter each Swiggy order on the DineOpen POS' },
      { step: '3', title: 'Tag', desc: 'Mark the payment/channel as Swiggy' },
      { step: '4', title: 'Track', desc: 'See Swiggy sales separately in your reports' },
    ],
    ctaHeading: 'Manage Swiggy Orders with DineOpen',
    ctaNote: 'Start your free 7-day trial. Track Swiggy sales in your reports and grow commission-free direct orders.',
    cta: 'Start Free Trial',
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Swiggy + DineOpen: How to Manage Your Swiggy Orders",
    "description": "Restaurants using DineOpen record Swiggy orders on the POS and track Swiggy sales separately in reports. DineOpen does not sync Swiggy orders automatically today; it offers commission-free direct ordering via QR, a branded website and WhatsApp.",
    "url": "https://www.dineopen.com/integrations/swiggy"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <IntegrationClient data={integrationData} />
    </>
  );
}
