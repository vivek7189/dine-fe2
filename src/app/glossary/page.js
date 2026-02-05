import GlossaryClient from './GlossaryClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Glossary | 200+ Industry Terms & Definitions | DineOpen',
  description: 'Complete restaurant industry glossary with 200+ terms. POS, KOT, FOH, BOH, covers, table turn, food cost, and more. Essential vocabulary for restaurant owners and staff.',
  keywords: 'restaurant glossary, POS terms, restaurant terminology, KOT meaning, FOH BOH meaning, restaurant industry terms, food service vocabulary, hospitality glossary, restaurant abbreviations',
  openGraph: {
    title: 'Restaurant Industry Glossary | DineOpen',
    description: 'Complete glossary of 200+ restaurant industry terms and definitions.',
    url: 'https://www.dineopen.com/glossary',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/glossary',
  },
};

export default function GlossaryPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "name": "Restaurant Industry Glossary",
    "description": "Comprehensive glossary of restaurant and food service industry terminology",
    "url": "https://www.dineopen.com/glossary"
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <GlossaryClient />
    </>
  );
}
