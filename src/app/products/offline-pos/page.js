import OfflinePosLandingClient from './OfflinePosLandingClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Offline POS for Restaurants | Bill Without Internet | DineOpen',
  description: 'DineOpen is a true offline-first restaurant POS: bill with zero internet on your local Wi-Fi, run every terminal and waiter tablet on the LAN, print KOTs single or multi-station, and sync to the cloud when back online — or stay fully offline. Power-cut and outage proof. GST/VAT ready. Windows & Mac.',
  keywords: 'offline pos, offline pos system, restaurant pos offline, pos without internet, offline billing software restaurant, offline restaurant pos, lan pos restaurant, pos offline mode, offline point of sale, pos works without internet, offline pos india, offline epos uk dubai',
  openGraph: {
    title: 'Offline POS for Restaurants — Bill Without Internet | DineOpen',
    description: 'Bill offline on your local Wi-Fi, keep every terminal and waiter in sync over the LAN, and sync to the cloud when back online. Outage-proof. GST/VAT ready.',
    url: 'https://www.dineopen.com/products/offline-pos',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Offline POS for Restaurants | DineOpen',
    description: 'Bill without internet, LAN terminals + offline waiter ordering, sync to cloud later — or stay fully offline.',
  },
  alternates: { canonical: 'https://www.dineopen.com/products/offline-pos' },
};

export default function OfflinePosPage() {
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DineOpen Offline POS',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Offline Restaurant Point of Sale',
    description:
      'Offline-first restaurant POS that runs on a local server on the restaurant’s own network: billing, GST/VAT invoicing, KOT printing (single and multi-station) and waiter/server ordering all work with zero internet across every LAN terminal, and data syncs to the cloud when the connection returns — or the restaurant can stay fully offline.',
    operatingSystem: 'Windows, macOS, iOS, Android',
    url: 'https://www.dineopen.com/products/offline-pos',
    offers: [
      { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free plan' },
      { '@type': 'Offer', price: '299', priceCurrency: 'INR', description: 'Starter plan (India)' },
      { '@type': 'Offer', price: '20', priceCurrency: 'USD', description: 'Starter plan' },
    ],
    featureList: [
      'Bill with zero internet on the local network',
      'Local on-premise server (bundled database, one-app install)',
      'Real-time LAN sync across all terminals',
      'Offline waiter and server ordering on tablets/phones',
      'KOT printing offline — single and multi-station',
      'GST and VAT compliant offline invoicing',
      'Sync to cloud when online, or stay fully offline',
      'Self-contained installer for Windows and Mac',
    ],
    provider: { '@type': 'Organization', name: 'DineOpen', url: 'https://www.dineopen.com' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Can a restaurant POS work without internet?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. DineOpen is offline-first: one machine runs a local server (with its own database) on your Wi-Fi, so you can bill, print KOTs and take orders with zero internet. When the connection returns, data syncs to the cloud automatically — or you can stay fully offline.' } },
      { '@type': 'Question', name: 'What is a true offline POS vs an offline cache?', acceptedAnswer: { '@type': 'Answer', text: 'A true offline POS runs the real software and database on-site so every terminal keeps working over the local network with no time limit. An "offline cache" only lets one device bill briefly before it expires, while waiter tablets and the kitchen screen go dark.' } },
      { '@type': 'Question', name: 'Can waiters take orders offline?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Waiter phones and tablets connect to the same local Wi-Fi as the billing machine and fire orders to the kitchen instantly over the LAN — no internet required, and every terminal stays in sync in real time.' } },
      { '@type': 'Question', name: 'Does offline billing stay GST and VAT compliant?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. DineOpen calculates GST (India) and VAT (UK, UAE and GCC), generates sequential compliant invoices and stores every bill locally, so records are complete and filing-ready even without internet.' } },
      { '@type': 'Question', name: 'Will I lose data if the internet goes down?', acceptedAnswer: { '@type': 'Answer', text: 'No. Orders and bills are written to a real local database on your server machine, not a temporary browser cache. The cloud is a mirror that updates when you are online.' } },
      { '@type': 'Question', name: 'How do I set up the offline POS?', acceptedAnswer: { '@type': 'Answer', text: 'Install one app on a single computer (Windows or Mac) — it bundles the full backend and local database. Every other terminal connects to it over your Wi-Fi at a fixed address (dineopen-server.local). No IP setup, no separate database, no developers.' } },
    ],
  };

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to set up an offline POS for your restaurant',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Install the server app', text: 'Install DineOpen Server on one computer — it bundles the backend and a local database in a single self-contained installer for Windows or Mac.' },
      { '@type': 'HowToStep', position: 2, name: 'Connect your terminals', text: 'Point every billing PC, waiter tablet and kitchen screen at dineopen-server.local on your Wi-Fi — no IP addresses to configure.' },
      { '@type': 'HowToStep', position: 3, name: 'Start billing offline', text: 'Take orders, print KOTs and bill with zero internet. Turn on cloud sync to mirror data online, or stay a fully offline island.' },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.dineopen.com' },
      { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.dineopen.com/products' },
      { '@type': 'ListItem', position: 3, name: 'Offline POS', item: 'https://www.dineopen.com/products/offline-pos' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <OfflinePosLandingClient />
    </>
  );
}
