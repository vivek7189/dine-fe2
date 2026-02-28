import PrivacyClient from './PrivacyClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Privacy Policy | DineOpen',
  description: 'DineOpen privacy policy. Learn how we collect, use, and protect your data. We are committed to safeguarding restaurant and customer information.',
  openGraph: {
    title: 'Privacy Policy | DineOpen',
    description: 'Learn how DineOpen collects, uses, and protects your data.',
    url: 'https://www.dineopen.com/privacy',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy | DineOpen',
    description: 'Learn how DineOpen collects, uses, and protects your data.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/privacy',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
