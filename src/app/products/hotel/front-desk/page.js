import FrontDeskClient from './FrontDeskClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Hotel Front Desk Software | Check-in Check-out System | DineOpen',
  description: 'Hotel front desk software for check-in, check-out, guest profile management, and invoice generation. Streamline front office operations for small hotels. Cloud-based from $9.99/month.',
  keywords: 'hotel front desk software, hotel check-in system, check-out software, guest profile management, hotel invoice software, front office hotel software, small hotel check-in',
  openGraph: {
    title: 'Hotel Front Desk Software | DineOpen',
    description: 'Streamlined check-in/out, guest profiles, and invoicing for small hotel front desk operations.',
    url: 'https://www.dineopen.com/products/hotel/front-desk',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/products/hotel/front-desk',
  },
};

export default function FrontDeskPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DineOpen Hotel Front Desk Software",
    "description": "Front desk management software for small hotels with check-in/check-out, guest profiles, room service integration, and invoice generation.",
    "applicationCategory": "BusinessApplication",
    "url": "https://www.dineopen.com/products/hotel/front-desk",
    "offers": { "@type": "Offer", "price": "9.99", "priceCurrency": "USD" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How does check-in work in DineOpen Hotel?", "acceptedAnswer": { "@type": "Answer", "text": "The check-in modal captures guest details including name, contact, ID information, and room assignment. You can create a new guest profile or select a returning guest. Once checked in, the room status updates automatically." } },
      { "@type": "Question", "name": "Can I generate invoices at check-out?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. At check-out, DineOpen generates a complete invoice including room charges, room service orders, and applicable taxes. Invoices can be printed or shared digitally with the guest." } },
      { "@type": "Question", "name": "Does the front desk integrate with room service?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. From the check-in screen, staff can place room service orders that go directly to the kitchen via KOT. All room service charges are added to the guest's folio for consolidated billing at check-out." } },
      { "@type": "Question", "name": "Can I filter active check-ins by status?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The check-ins tab supports status filtering so you can quickly see all currently checked-in guests, pending check-outs, or guests with outstanding charges." } },
      { "@type": "Question", "name": "Are guest profiles saved for future visits?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Guest profiles created during check-in are saved in the system. When a returning guest checks in again, you can pull up their profile with previous stay history and preferences." } },
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.dineopen.com" },
      { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.dineopen.com/products" },
      { "@type": "ListItem", "position": 3, "name": "Hotel Management", "item": "https://www.dineopen.com/products/hotel" },
      { "@type": "ListItem", "position": 4, "name": "Front Desk", "item": "https://www.dineopen.com/products/hotel/front-desk" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <FrontDeskClient />
    </>
  );
}
