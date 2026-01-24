import CloudKitchensClient from './CloudKitchensClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'POS Software for Cloud Kitchens India | DineOpen',
  description: 'Best POS software for cloud kitchens and ghost kitchens in India. Multi-brand management, delivery integration, order aggregation, real-time analytics.',
  keywords: 'cloud kitchen POS India, ghost kitchen software, delivery kitchen management, multi-brand kitchen POS, dark kitchen software India',
  openGraph: {
    title: 'POS Software for Cloud Kitchens India | DineOpen',
    description: 'Best POS software for cloud kitchens in India with multi-brand management and delivery integration.',
    url: 'https://www.dineopen.com/for/cloud-kitchens',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/for/cloud-kitchens',
  },
};

export default function CloudKitchensPage() {
  return <CloudKitchensClient />;
}
