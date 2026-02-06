import SocialCaptionClient from './SocialCaptionClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'AI Restaurant Social Media Caption Generator | Instagram | DineOpen',
  description: 'Generate engaging Instagram, Facebook captions for your restaurant posts. AI-powered social media content for food photography and promotions.',
  keywords: 'restaurant instagram captions, food caption generator, social media captions restaurant, food post captions, restaurant marketing',
  openGraph: {
    title: 'AI Social Media Caption Generator for Restaurants | DineOpen',
    description: 'Generate engaging Instagram and Facebook captions for restaurant posts.',
    url: 'https://www.dineopen.com/tools/social-caption-generator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/tools/social-caption-generator' },
};

export default function SocialCaptionGeneratorPage() {
  return <SocialCaptionClient />;
}
