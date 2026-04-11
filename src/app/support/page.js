import SupportClient from './SupportClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Support & Help Center | DineOpen Restaurant POS',
  description: 'Get help with DineOpen restaurant POS software. Contact our support team via email, phone, or live chat. FAQs, troubleshooting guides, and dedicated assistance for all plans.',
  keywords: 'DineOpen support, restaurant POS help, DineOpen contact, POS troubleshooting, restaurant software support, DineOpen help center',
  openGraph: {
    title: 'Support & Help Center | DineOpen',
    description: 'Get help with DineOpen restaurant POS. Contact support, browse FAQs, and find troubleshooting guides.',
    url: 'https://www.dineopen.com/support',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/support' },
};

export default function SupportPage() {
  return <SupportClient />;
}
