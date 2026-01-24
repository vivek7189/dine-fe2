import GSTCalculatorClient from './GSTCalculatorClient';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata = {
  title: 'Free GST Calculator for Restaurants India | DineOpen',
  description: 'Free GST calculator for restaurants. Calculate CGST, SGST, IGST on food bills. Supports 5% and 18% GST rates. No login required.',
  keywords: 'GST calculator restaurant, restaurant GST calculator India, food GST calculator, CGST SGST calculator, restaurant bill GST, 5% GST food calculator',
  openGraph: {
    title: 'Free GST Calculator for Restaurants India | DineOpen',
    description: 'Calculate GST on restaurant bills instantly. Supports 5% and 18% rates with CGST/SGST breakdown.',
    url: 'https://www.dineopen.com/tools/gst-calculator',
    siteName: 'DineOpen',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.dineopen.com/tools/gst-calculator',
  },
};

export default function GSTCalculatorPage() {
  return <GSTCalculatorClient />;
}
