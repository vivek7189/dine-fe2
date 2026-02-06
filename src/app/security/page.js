import SecurityClient from './SecurityClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Security & Data Protection | DineOpen Restaurant POS',
  description: 'DineOpen security practices. Data encryption, secure payments, GDPR compliance, regular backups, and enterprise-grade protection for your restaurant data.',
  keywords: 'DineOpen security, restaurant POS security, data protection restaurant, secure payment POS, GDPR restaurant software, encrypted billing',
  openGraph: {
    title: 'Security & Data Protection | DineOpen',
    description: 'Enterprise-grade security for your restaurant. Encryption, secure payments, and data protection.',
    url: 'https://www.dineopen.com/security',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: { canonical: 'https://www.dineopen.com/security' },
};

export default function SecurityPage() {
  return <SecurityClient />;
}
