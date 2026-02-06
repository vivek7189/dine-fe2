import MussooriePOSClient from './MussooriePOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant POS Software Mussoorie | Hill Station Cafe & Hotel | DineOpen',
  description: 'Best restaurant POS for Mussoorie. Perfect for Mall Road cafes, hotel restaurants, bakeries & tourist eateries. Valley view seating, seasonal rush management. ₹999/month.',
  keywords: 'restaurant POS Mussoorie, Mall Road cafe software, hill station restaurant billing, hotel POS Mussoorie, tourist restaurant software, bakery POS Uttarakhand',
  openGraph: {
    title: 'Restaurant POS Software Mussoorie | Hill Station Cafe & Hotel | DineOpen',
    description: 'POS for Mussoorie cafes and hotels. Tourist-friendly, seasonal management, valley view billing.',
    url: 'https://www.dineopen.com/pos/mussoorie',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/pos/mussoorie' },
};

export default function MussooriePOSPage() {
  const structuredData = {
    "@context": "https://schema.org", "@type": "SoftwareApplication",
    "name": "DineOpen Restaurant POS - Mussoorie",
    "description": "Restaurant POS for Mussoorie's hill station cafes, hotel restaurants, and tourist eateries.",
    "offers": { "@type": "Offer", "price": "999", "priceCurrency": "INR" },
    "areaServed": { "@type": "City", "name": "Mussoorie" }
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <MussooriePOSClient />
    </>
  );
}
