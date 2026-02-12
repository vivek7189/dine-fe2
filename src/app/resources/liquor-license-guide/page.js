import LiquorLicenseClient from './LiquorLicenseClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Liquor License Guide India | Bar License Requirements | DineOpen',
  description: 'Complete guide to getting a liquor license in India. State-wise requirements, costs, documents needed, and step-by-step process for bars and restaurants.',
  keywords: 'liquor license india, bar license india, FL3 license, excise license restaurant, liquor permit india, alcohol license restaurant',
  openGraph: {
    title: 'Liquor License Guide India | DineOpen',
    description: 'Complete guide to liquor licensing for restaurants and bars in India.',
    url: 'https://www.dineopen.com/resources/liquor-license-guide',
    siteName: 'DineOpen',
    type: 'article',
  },
  alternates: { canonical: 'https://www.dineopen.com/resources/liquor-license-guide' },
};

export default function LiquorLicensePage() {
  return <LiquorLicenseClient />;
}
