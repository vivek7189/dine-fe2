import RefundClient from './RefundClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Refund & Cancellation Policy | DineOpen',
  description: 'DineOpen refund and cancellation policy. Understand our no-refund policy, software liability disclaimer, data responsibility, and special case exceptions.',
  openGraph: {
    title: 'Refund & Cancellation Policy | DineOpen',
    description: 'Read the refund and cancellation policy for using DineOpen restaurant software.',
    url: 'https://www.dineopen.com/refund',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Refund & Cancellation Policy | DineOpen',
    description: 'Read the refund and cancellation policy for using DineOpen restaurant software.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/refund',
  },
};

export default function RefundPage() {
  return <RefundClient />;
}
