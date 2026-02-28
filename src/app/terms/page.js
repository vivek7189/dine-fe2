import TermsClient from './TermsClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Terms of Service | DineOpen',
  description: 'DineOpen terms of service. Read our terms and conditions for using the DineOpen restaurant operating system, billing, and subscription policies.',
  openGraph: {
    title: 'Terms of Service | DineOpen',
    description: 'Read the terms and conditions for using DineOpen restaurant software.',
    url: 'https://www.dineopen.com/terms',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | DineOpen',
    description: 'Read the terms and conditions for using DineOpen restaurant software.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/terms',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
