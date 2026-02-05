import IntegrationClient from '../IntegrationClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Razorpay Integration for Restaurant POS | UPI, Cards, Wallets | DineOpen',
  description: 'Accept payments via Razorpay in your restaurant POS. UPI, credit cards, debit cards, wallets. Auto-reconciliation, instant settlements. Free integration with DineOpen.',
  keywords: 'Razorpay integration POS, Razorpay restaurant, UPI restaurant payments, card payment restaurant, Razorpay billing software, payment gateway restaurant India',
  openGraph: {
    title: 'Razorpay Integration for Restaurant POS | DineOpen',
    description: 'Accept all payments via Razorpay. UPI, cards, wallets with auto-reconciliation.',
    url: 'https://www.dineopen.com/integrations/razorpay',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/integrations/razorpay',
  },
};

export default function RazorpayIntegrationPage() {
  const integrationData = {
    name: 'Razorpay',
    logo: '/integrations/razorpay-logo.svg',
    tagline: 'Accept all payment methods with one integration',
    description: 'Connect DineOpen with Razorpay to accept UPI, credit cards, debit cards, and digital wallets. Auto-reconciliation saves hours of manual work.',
    features: [
      { title: 'UPI Payments', desc: 'Accept GPay, PhonePe, Paytm and all UPI apps' },
      { title: 'Card Payments', desc: 'Credit and debit cards with secure processing' },
      { title: 'QR Code Payments', desc: 'Generate payment QR codes for each table' },
      { title: 'Auto-Reconciliation', desc: 'Payments automatically matched with orders' },
      { title: 'Instant Settlements', desc: 'Get your money faster with T+1 settlements' },
      { title: 'Refund Management', desc: 'Process refunds directly from dashboard' },
    ],
    benefits: [
      'Accept 100+ payment methods',
      'Automatic payment reconciliation',
      'Reduce cash handling',
      'Detailed payment reports',
      'Secure PCI-DSS compliant',
    ],
    cta: 'Get Razorpay Integration Free',
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Razorpay Integration",
    "description": "Connect your restaurant POS with Razorpay for UPI, cards, and wallet payments.",
    "url": "https://www.dineopen.com/integrations/razorpay",
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
