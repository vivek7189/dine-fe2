import GuidesHubClient from './GuidesHubClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free Restaurant Guides & eBooks | DineOpen Resources',
  description: 'Free downloadable guides for restaurant owners. Startup checklist, marketing playbook, menu engineering, inventory management, and more. Expert insights for F&B success.',
  keywords: 'restaurant guides free, restaurant ebook download, F&B business guides, restaurant startup guide, menu engineering guide, restaurant marketing ebook',
  openGraph: {
    title: 'Free Restaurant Guides & eBooks | DineOpen',
    description: 'Free downloadable guides for restaurant success. Startup, marketing, operations, and more.',
    url: 'https://www.dineopen.com/resources/guides',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/resources/guides' },
};

export default function GuidesHubPage() {
  return <GuidesHubClient />;
}
