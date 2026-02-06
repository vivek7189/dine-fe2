import MenuDescriptionGeneratorClient from './MenuDescriptionGeneratorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'AI Menu Description Generator | Write Dish Descriptions | DineOpen',
  description: 'Free AI menu description generator. Create appetizing, professional dish descriptions for your restaurant menu. Multiple tones: casual, fine dining, quirky.',
  keywords: 'menu description generator, AI dish description, restaurant menu writer, food description generator, menu copywriting, dish description AI',
  openGraph: {
    title: 'AI Menu Description Generator | DineOpen',
    description: 'Generate appetizing dish descriptions for your restaurant menu with AI.',
    url: 'https://www.dineopen.com/tools/menu-description-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/menu-description-generator' },
};

export default function MenuDescriptionGeneratorPage() {
  return <MenuDescriptionGeneratorClient />;
}
