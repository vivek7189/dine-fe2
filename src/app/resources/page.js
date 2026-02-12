import ResourcesClient from './ResourcesClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Restaurant Resources & Guides | Free Templates & Tools | DineOpen',
  description: 'Free restaurant resources: FSSAI registration guide, GST filing, business plan templates, startup guides, licensing checklists, and more for Indian restaurants.',
  keywords: 'restaurant resources, FSSAI guide, GST for restaurants, restaurant business plan, restaurant licenses India, restaurant startup guide, restaurant templates',
  openGraph: {
    title: 'Restaurant Resources & Guides | DineOpen',
    description: 'Free guides, templates, and resources for restaurant owners. FSSAI, GST, licensing, and startup guides.',
    url: 'https://www.dineopen.com/resources',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/resources',
  },
};

export default function ResourcesPage() {
  return <ResourcesClient />;
}
