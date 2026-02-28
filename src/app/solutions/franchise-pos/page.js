import FranchisePOSClient from './FranchisePOSClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Franchise POS System for Restaurants | DineOpen',
  description: 'POS built for restaurant franchises. Franchisor control, franchisee simplicity, royalty tracking, and brand compliance monitoring. Scale nationwide with DineOpen.',
  keywords: 'franchise POS, franchise restaurant software, franchisor management, royalty tracking, franchise compliance, DineOpen, restaurant franchise system',
  openGraph: {
    title: 'Franchise POS System for Restaurants | DineOpen',
    description: 'POS built for restaurant franchises. Franchisor control, franchisee simplicity, royalty tracking, and brand compliance monitoring. Scale nationwide with DineOpen.',
    url: 'https://www.dineopen.com/solutions/franchise-pos',
    siteName: 'DineOpen',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Franchise POS System for Restaurants | DineOpen',
    description: 'POS built for restaurant franchises. Franchisor control, franchisee simplicity, royalty tracking, and brand compliance monitoring. Scale nationwide with DineOpen.',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/solutions/franchise-pos',
  },
};

export default function FranchisePOSPage() {
  return <FranchisePOSClient />;
}
