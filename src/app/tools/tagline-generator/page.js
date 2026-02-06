import TaglineGeneratorClient from './TaglineGeneratorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'AI Restaurant Tagline Generator | Slogan Ideas | DineOpen',
  description: 'Generate catchy restaurant taglines and slogans with AI. Create memorable brand messages for your restaurant, cafe, or food business.',
  keywords: 'restaurant tagline generator, restaurant slogan ideas, cafe tagline, food business slogan, restaurant branding',
  openGraph: {
    title: 'AI Restaurant Tagline Generator | Slogan Ideas | DineOpen',
    description: 'Generate catchy restaurant taglines and slogans with AI.',
    url: 'https://www.dineopen.com/tools/tagline-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/tagline-generator' },
};

export default function TaglineGeneratorPage() {
  return <TaglineGeneratorClient />;
}
